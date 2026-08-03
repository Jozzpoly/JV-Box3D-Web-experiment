import type { NativeFactorySnapshot } from "../../config/native-factory-receipt.js";
import type {
  Box3DModule,
  EventsBuffer,
  b3Vec3,
  b3WorldId,
} from "../../physics/box3d-runtime-contract.js";
import { vec3 } from "./m6-geometry.js";
import {
  m6TopologyConfigFromReceipt,
  type M6TopologyConfig,
} from "./m6-topology-config.js";
import {
  CollisionGroupAllocator,
  type M6TopologyDisposalReceipt,
  type M6TraceFrame,
} from "./m6-topology-contract.js";
import { M6VehicleController } from "./m6-vehicle-controller.js";
import {
  INITIAL_RATE_STEERING_PROFILE_ID,
  rateSteeringProfile,
  type RateSteeringProfile,
  type RateSteeringProfileId,
} from "./rate-steering-profile.js";

const FULL_MASK = 0xffff_ffff_ffff_ffffn;

export {
  CollisionGroupAllocator,
  M6_TOPOLOGY_COUNTS,
} from "./m6-topology-contract.js";
export type {
  M6CornerTrace,
  M6HandsOnEdge,
  M6SteeringActuatorState,
  M6SteeringMechanismTrace,
  M6TopologyDisposalReceipt,
  M6TraceFrame,
} from "./m6-topology-contract.js";
export {
  INITIAL_RATE_STEERING_PROFILE_ID,
  RATE_STEERING_PROFILES,
  rateSteeringProfile,
} from "./rate-steering-profile.js";
export type {
  RateSteeringProfile,
  RateSteeringProfileId,
} from "./rate-steering-profile.js";
export { M6VehicleController } from "./m6-vehicle-controller.js";

export class M6TopologyWorld {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #events: EventsBuffer;
  readonly #allocator: CollisionGroupAllocator;
  readonly #config: M6TopologyConfig;
  readonly #rateProfile: RateSteeringProfile;
  readonly #vehicles: M6VehicleController[] = [];
  #stepIndex = 0;
  #disposed = false;

  constructor(
    b3: Box3DModule,
    receipt: NativeFactorySnapshot,
    profileOrAllocator:
      | RateSteeringProfileId
      | CollisionGroupAllocator =
      INITIAL_RATE_STEERING_PROFILE_ID,
    allocator = new CollisionGroupAllocator(),
  ) {
    this.#b3 = b3;
    this.#config = m6TopologyConfigFromReceipt(receipt);
    if (profileOrAllocator instanceof CollisionGroupAllocator) {
      this.#rateProfile = rateSteeringProfile(
        INITIAL_RATE_STEERING_PROFILE_ID,
      );
      this.#allocator = profileOrAllocator;
    } else {
      this.#rateProfile = rateSteeringProfile(profileOrAllocator);
      this.#allocator = allocator;
    }

    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = vec3(
      this.#config.solver.gravity[0],
      this.#config.solver.gravity[1],
      this.#config.solver.gravity[2],
    );
    worldDef.contactHertz =
      this.#config.solver.contactHertz;
    worldDef.contactDampingRatio =
      this.#config.solver.contactDampingRatio;
    worldDef.contactSpeed = this.#config.solver.contactSpeed;
    worldDef.enableContinuous =
      this.#config.solver.enableContinuous;
    worldDef.workerCount = this.#config.solver.workerCount;
    this.#worldId = b3.b3CreateWorld(worldDef);

    let events: EventsBuffer | null = null;
    try {
      events = b3.createEventsBuffer();

      const groundDef = b3.b3DefaultBodyDef();
      groundDef.position = vec3(0, -0.5, 0);
      const groundId = b3.b3CreateBody(
        this.#worldId,
        groundDef,
      );
      const terrainDef = b3.b3DefaultShapeDef();
      terrainDef.baseMaterial.friction = 0.9;
      terrainDef.filter.categoryBits =
        this.#config.terrainCategoryBits;
      terrainDef.filter.maskBits = FULL_MASK;
      terrainDef.enableContactEvents = true;
      b3.b3CreateBoxShape(
        groundId,
        terrainDef,
        30,
        0.5,
        30,
      );

      this.#events = events;
    } catch (error: unknown) {
      if (events !== null) {
        b3.destroyEventsBuffer(events);
      }
      if (b3.b3World_IsValid(this.#worldId)) {
        b3.b3DestroyWorld(this.#worldId);
      }
      throw error;
    }
  }

  get config(): M6TopologyConfig {
    this.#assertActive();
    return this.#config;
  }

  get rateProfile(): RateSteeringProfile {
    this.#assertActive();
    return this.#rateProfile;
  }

  get counters() {
    this.#assertActive();
    return this.#b3.b3World_GetCounters(this.#worldId);
  }

  createVehicle(
    spawn: b3Vec3,
    generation = 1,
  ): M6VehicleController {
    this.#assertActive();
    if (!Number.isInteger(generation) || generation < 1) {
      throw new RangeError(
        "M6 lifecycle generation must be a positive integer.",
      );
    }
    const vehicle = new M6VehicleController(
      this.#b3,
      this.#worldId,
      this.#config,
      this.#rateProfile,
      spawn,
      generation,
      this.#allocator.allocate(),
    );
    this.#vehicles.push(vehicle);
    return vehicle;
  }

  step(stepCount = 1): readonly M6TraceFrame[] {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 1) {
      throw new RangeError(
        "M6 stepCount must be a positive integer.",
      );
    }

    let traces: readonly M6TraceFrame[] = [];
    for (let index = 0; index < stepCount; index += 1) {
      const activeVehicles = this.#vehicles.filter(
        (vehicle) => !vehicle.disposed,
      );
      activeVehicles.forEach((vehicle) =>
        vehicle.beforeStep(),
      );
      this.#b3.b3World_Step(
        this.#worldId,
        this.#config.solver.fixedDt,
        this.#config.solver.substeps,
      );
      this.#stepIndex += 1;
      this.#b3.getEvents(this.#events, this.#worldId);
      const contactBegins =
        this.#b3.getNumContactBeginEvents(this.#events);
      const worldContacts =
        this.#b3.b3World_GetCounters(
          this.#worldId,
        ).contactCount;
      traces = activeVehicles.map((vehicle) =>
        vehicle.captureTrace(
          this.#stepIndex,
          worldContacts,
          contactBegins,
        ),
      );
    }
    return traces;
  }

  dispose(): M6TopologyDisposalReceipt {
    if (!this.#disposed) {
      this.#disposed = true;
      [...this.#vehicles]
        .reverse()
        .forEach((vehicle) => vehicle.dispose());
      this.#b3.destroyEventsBuffer(this.#events);
      if (this.#b3.b3World_IsValid(this.#worldId)) {
        this.#b3.b3DestroyWorld(this.#worldId);
      }
    }
    if (this.#b3.b3World_IsValid(this.#worldId)) {
      throw new Error(
        "The F5 Box3D world remained valid after disposal.",
      );
    }
    return {
      disposed: true,
      worldValidAfterDestroy: false,
    };
  }

  #assertActive(): void {
    if (this.#disposed) {
      throw new Error("M6TopologyWorld has been disposed.");
    }
  }
}
