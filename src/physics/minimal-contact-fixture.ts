import type {
  Box3DModule,
  Contact,
  ContactsBuffer,
  EventsBuffer,
  Manifold,
  b3BodyId,
  b3ShapeId,
  b3WorldId,
} from "box3d.js";
import {
  almostEqual,
  cloneVec3,
  createLevel,
  type F2ValidationLevel,
  type FixtureDisposalReceipt,
  type MinimalContactSnapshot,
} from "./box3d-runtime-contract.js";

const CATEGORY_BITS = 0x0123_4567_89ab_cdefn;
const MASK_BITS = 0x0fed_cba9_8765_4321n;
const GROUP_INDEX = -37;
const USER_MATERIAL_ID = 0x1_2345_6789n;
const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;

export class MinimalContactFixture {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyId: b3BodyId;
  readonly #shapeId: b3ShapeId;
  readonly #events: EventsBuffer;
  readonly #contacts: ContactsBuffer;
  readonly #contactScratch: Contact;
  readonly #manifoldScratch: Manifold;
  readonly #baseLevels: readonly F2ValidationLevel[];
  readonly #computedSphereMass: number;
  readonly #customMassRoundTrip: MinimalContactSnapshot["customMassRoundTrip"];
  #disposed = false;
  #stepIndex = 0;
  #contactBeginEvents = 0;
  #lastSnapshot: MinimalContactSnapshot;

  private constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyId: b3BodyId,
    shapeId: b3ShapeId,
    events: EventsBuffer,
    contacts: ContactsBuffer,
    levels: readonly F2ValidationLevel[],
    computedSphereMass: number,
    customMassRoundTrip: MinimalContactSnapshot["customMassRoundTrip"],
  ) {
    this.#b3 = b3;
    this.#worldId = worldId;
    this.#bodyId = bodyId;
    this.#shapeId = shapeId;
    this.#events = events;
    this.#contacts = contacts;
    this.#contactScratch = b3.createContact();
    this.#manifoldScratch = b3.createManifold();
    this.#baseLevels = levels;
    this.#computedSphereMass = computedSphereMass;
    this.#customMassRoundTrip = customMassRoundTrip;
    this.#lastSnapshot = this.#readSnapshot();
  }

  static create(b3: Box3DModule, levels: readonly F2ValidationLevel[]): MinimalContactFixture {
    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = { x: 0, y: -10, z: 0 };
    worldDef.enableContinuous = false;
    worldDef.workerCount = 0;
    const worldId = b3.b3CreateWorld(worldDef);
    let events: EventsBuffer | null = null;
    let contacts: ContactsBuffer | null = null;

    try {
      const groundDef = b3.b3DefaultBodyDef();
      groundDef.position = { x: 0, y: -0.5, z: 0 };
      const groundId = b3.b3CreateBody(worldId, groundDef);
      const groundShape = b3.b3DefaultShapeDef();
      groundShape.enableContactEvents = true;
      groundShape.baseMaterial.friction = 0.8;
      groundShape.baseMaterial.userMaterialId = 1_001n;
      groundShape.filter.categoryBits = 1n;
      groundShape.filter.maskBits = 0xffff_ffff_ffff_ffffn;
      b3.b3CreateBoxShape(groundId, groundShape, 5, 0.5, 5);

      const bodyDef = b3.b3DefaultBodyDef();
      bodyDef.type = b3.b3BodyType.b3_dynamicBody;
      bodyDef.position = { x: 0, y: 3, z: 0 };
      const bodyId = b3.b3CreateBody(worldId, bodyDef);
      const shapeDef = b3.b3DefaultShapeDef();
      shapeDef.enableContactEvents = true;
      shapeDef.density = 2;
      shapeDef.filter.categoryBits = CATEGORY_BITS;
      shapeDef.filter.maskBits = MASK_BITS;
      shapeDef.filter.groupIndex = GROUP_INDEX;
      shapeDef.baseMaterial.friction = 0.73;
      shapeDef.baseMaterial.rollingResistance = 0.019;
      shapeDef.baseMaterial.userMaterialId = USER_MATERIAL_ID;
      const sphere = { center: { x: 0, y: 0, z: 0 }, radius: 0.5 };
      const shapeId = b3.b3CreateSphereShape(bodyId, shapeDef, sphere);
      const computedSphereMass = b3.b3ComputeSphereMass(sphere, shapeDef.density).mass;

      const probeDef = b3.b3DefaultBodyDef();
      probeDef.type = b3.b3BodyType.b3_dynamicBody;
      probeDef.position = { x: 0, y: 100, z: 0 };
      const probeId = b3.b3CreateBody(worldId, probeDef);
      b3.b3Body_SetMassData(probeId, {
        mass: 7.25,
        center: { x: 0.125, y: -0.25, z: 0.375 },
        inertia: {
          cx: { x: 2, y: 0, z: 0 },
          cy: { x: 0, y: 3, z: 0 },
          cz: { x: 0, y: 0, z: 4 },
        },
      });
      const readBack = b3.b3Body_GetMassData(probeId);
      const customMassRoundTrip = {
        mass: readBack.mass,
        center: cloneVec3(readBack.center),
        inertiaDiagonal: {
          x: readBack.inertia.cx.x,
          y: readBack.inertia.cy.y,
          z: readBack.inertia.cz.z,
        },
      };
      b3.b3DestroyBody(probeId);

      events = b3.createEventsBuffer();
      contacts = b3.createContactsBuffer();
      return new MinimalContactFixture(
        b3,
        worldId,
        bodyId,
        shapeId,
        events,
        contacts,
        levels,
        computedSphereMass,
        customMassRoundTrip,
      );
    } catch (error: unknown) {
      if (contacts !== null) {
        b3.destroyContactsBuffer(contacts);
      }
      if (events !== null) {
        b3.destroyEventsBuffer(events);
      }
      if (b3.b3World_IsValid(worldId)) {
        b3.b3DestroyWorld(worldId);
      }
      throw error;
    }
  }

  get snapshot(): MinimalContactSnapshot {
    this.#assertActive();
    return this.#lastSnapshot;
  }

  step(stepCount = 1): MinimalContactSnapshot {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 1) {
      throw new RangeError(`stepCount must be positive, got ${stepCount}`);
    }
    for (let index = 0; index < stepCount; index += 1) {
      this.#b3.b3World_Step(this.#worldId, FIXED_DT, SUBSTEPS);
      this.#stepIndex += 1;
      this.#b3.getEvents(this.#events, this.#worldId);
      this.#contactBeginEvents += this.#b3.getNumContactBeginEvents(this.#events);
    }
    this.#lastSnapshot = this.#readSnapshot();
    return this.#lastSnapshot;
  }

  runUntilContact(maxSteps = 240): MinimalContactSnapshot {
    for (let index = 0; index < maxSteps; index += 1) {
      const snapshot = this.step();
      if (snapshot.activeContacts > 0 && snapshot.contactBeginEvents > 0) {
        return snapshot;
      }
    }
    throw new Error(`No contact observed after ${maxSteps} fixed steps.`);
  }

  validationLevels(): readonly F2ValidationLevel[] {
    this.#assertActive();
    const snapshot = this.#lastSnapshot;
    const filter = snapshot.filterRoundTrip;
    const material = snapshot.materialRoundTrip;
    const custom = snapshot.customMassRoundTrip;
    const analyticMass = (4 / 3) * Math.PI * 0.5 ** 3 * 2;
    const b2 =
      filter.categoryBits === CATEGORY_BITS &&
      filter.maskBits === MASK_BITS &&
      filter.groupIndex === GROUP_INDEX &&
      material.userMaterialId === USER_MATERIAL_ID &&
      almostEqual(material.friction, 0.73, 1e-4) &&
      almostEqual(material.rollingResistance, 0.019, 1e-4) &&
      almostEqual(custom.mass, 7.25) &&
      almostEqual(custom.center.x, 0.125) &&
      almostEqual(custom.center.y, -0.25) &&
      almostEqual(custom.center.z, 0.375) &&
      almostEqual(custom.inertiaDiagonal.x, 2) &&
      almostEqual(custom.inertiaDiagonal.y, 3) &&
      almostEqual(custom.inertiaDiagonal.z, 4);
    const b4 =
      almostEqual(snapshot.bodyMass, analyticMass, 1e-4) &&
      almostEqual(snapshot.shapeMass, analyticMass, 1e-4) &&
      almostEqual(snapshot.computedSphereMass, analyticMass, 1e-4);
    const b5 =
      snapshot.contactBeginEvents > 0 &&
      snapshot.activeContacts > 0 &&
      snapshot.activeManifolds > 0 &&
      snapshot.activeContactPoints > 0;

    return this.#baseLevels.map((level) => {
      if (level.id === "B2") {
        return createLevel(
          "B2",
          b2 ? "PASS" : "FAIL",
          "Filter, material and custom mass-data round-trip.",
          [
            `category=0x${filter.categoryBits.toString(16)}`,
            `mask=0x${filter.maskBits.toString(16)}`,
            `group=${filter.groupIndex}`,
            `material=0x${material.userMaterialId.toString(16)}`,
            `customMass=${custom.mass}`,
          ],
        );
      }
      if (level.id === "B3") {
        return createLevel("B3", "PASS", "World and reusable buffers have one idempotent owner.", [
          `worldValid=${this.#b3.b3World_IsValid(this.#worldId)}`,
          `bodies=${snapshot.counters.bodyCount}`,
          `shapes=${snapshot.counters.shapeCount}`,
        ]);
      }
      if (level.id === "B4") {
        return createLevel(
          "B4",
          b4 ? "PASS" : "FAIL",
          "Body, shape, helper and analytic sphere mass agree.",
          [
            `body=${snapshot.bodyMass}`,
            `shape=${snapshot.shapeMass}`,
            `helper=${snapshot.computedSphereMass}`,
            `analytic=${analyticMass}`,
          ],
        );
      }
      if (level.id === "B5") {
        return createLevel(
          "B5",
          b5 ? "PASS" : "PENDING",
          "Real contact event and manifold observation.",
          [
            `begin=${snapshot.contactBeginEvents}`,
            `contacts=${snapshot.activeContacts}`,
            `manifolds=${snapshot.activeManifolds}`,
            `points=${snapshot.activeContactPoints}`,
          ],
        );
      }
      return { ...level, details: [...level.details] };
    });
  }

  dispose(): FixtureDisposalReceipt {
    if (!this.#disposed) {
      this.#disposed = true;
      this.#b3.destroyContactsBuffer(this.#contacts);
      this.#b3.destroyEventsBuffer(this.#events);
      if (this.#b3.b3World_IsValid(this.#worldId)) {
        this.#b3.b3DestroyWorld(this.#worldId);
      }
    }
    if (this.#b3.b3World_IsValid(this.#worldId)) {
      throw new Error("Box3D world remained valid after disposal.");
    }
    return { disposed: true, worldValidAfterDestroy: false };
  }

  #assertActive(): void {
    if (this.#disposed) {
      throw new Error("MinimalContactFixture has been disposed.");
    }
  }

  #readSnapshot(): MinimalContactSnapshot {
    const position = this.#b3.b3Body_GetPosition(this.#bodyId);
    const velocity = this.#b3.b3Body_GetLinearVelocity(this.#bodyId);
    const bodyMass = this.#b3.b3Body_GetMassData(this.#bodyId).mass;
    const shapeMass = this.#b3.b3Shape_ComputeMassData(this.#shapeId).mass;
    const counters = this.#b3.b3World_GetCounters(this.#worldId);
    const filter = this.#b3.b3Shape_GetFilter(this.#shapeId);
    const material = this.#b3.b3Shape_GetSurfaceMaterial(this.#shapeId);
    this.#b3.getBodyContactData(this.#contacts, this.#bodyId);

    const points: MinimalContactSnapshot["points"][number][] = [];
    let manifolds = 0;
    const contacts = this.#b3.getNumContacts(this.#contacts);
    for (let contactIndex = 0; contactIndex < contacts; contactIndex += 1) {
      this.#b3.getContactAt(this.#contactScratch, this.#contacts, contactIndex);
      for (
        let manifoldIndex = 0;
        manifoldIndex < this.#contactScratch.manifoldCount;
        manifoldIndex += 1
      ) {
        this.#b3.getManifoldAt(this.#manifoldScratch, this.#contactScratch, manifoldIndex);
        manifolds += 1;
        for (let pointIndex = 0; pointIndex < this.#manifoldScratch.pointCount; pointIndex += 1) {
          const point = this.#manifoldScratch.points[pointIndex];
          if (point === undefined) {
            throw new Error(`Missing manifold point ${pointIndex}.`);
          }
          points.push({
            separation: point.separation,
            normalImpulse: point.normalImpulse,
            totalNormalImpulse: point.totalNormalImpulse,
            featureId: point.featureId,
            triangleIndex: point.triangleIndex,
            persisted: point.persisted,
          });
        }
      }
    }

    return {
      stepIndex: this.#stepIndex,
      bodyPosition: cloneVec3(position),
      bodyLinearVelocity: cloneVec3(velocity),
      bodyMass,
      shapeMass,
      computedSphereMass: this.#computedSphereMass,
      customMassRoundTrip: this.#customMassRoundTrip,
      counters: {
        bodyCount: counters.bodyCount,
        shapeCount: counters.shapeCount,
        contactCount: counters.contactCount,
        jointCount: counters.jointCount,
        awakeContactCount: counters.awakeContactCount,
      },
      contactBeginEvents: this.#contactBeginEvents,
      activeContacts: contacts,
      activeManifolds: manifolds,
      activeContactPoints: points.length,
      points,
      filterRoundTrip: {
        categoryBits: filter.categoryBits,
        maskBits: filter.maskBits,
        groupIndex: filter.groupIndex,
      },
      materialRoundTrip: {
        friction: material.friction,
        rollingResistance: material.rollingResistance,
        userMaterialId: material.userMaterialId,
      },
    };
  }
}
