import Box3DFactory from "box3d.js/inline";
import type { Box3DModule } from "box3d.js";
import type { NativeFactorySnapshot } from "../config/native-factory-receipt.js";
import type { JvWorldData } from "../scene/jv-world-contract.js";
import {
  CollisionGroupAllocator,
  INITIAL_RATE_STEERING_PROFILE_ID,
  M6TopologyWorld,
  type RateSteeringProfileId,
} from "../vehicle/m6/m6-topology-world.js";
import { NATIVE_INLINE_SHIMS, multiplyQuat } from "./native-inline-compat.js";
import {
  BOX3D_MODE5_RUNTIME_PATCH,
  loadMode5Box3DModule,
} from "./mode5-box3d-runtime.js";
import { MinimalContactFixture } from "./minimal-contact-fixture.js";
import {
  BOX3D_RUNTIME_IDENTITY,
  almostEqual,
  createLevel,
  type Box3DRuntimeReceipt,
  type F2ValidationLevel,
} from "./box3d-runtime-contract.js";

export { BOX3D_RUNTIME_IDENTITY } from "./box3d-runtime-contract.js";
export type {
  Box3DRuntimeReceipt,
  ContactPointSnapshot,
  F2ValidationId,
  F2ValidationLevel,
  FixtureDisposalReceipt,
  MinimalContactSnapshot,
  ValidationStatus,
} from "./box3d-runtime-contract.js";
export { MinimalContactFixture } from "./minimal-contact-fixture.js";
export { M6TopologyWorld } from "../vehicle/m6/m6-topology-world.js";

const REQUIRED_EXPORTS = [
  "b3GetVersion",
  "b3DefaultWorldDef",
  "b3CreateWorld",
  "b3DestroyWorld",
  "b3World_IsValid",
  "b3World_Step",
  "b3World_GetCounters",
  "b3DefaultBodyDef",
  "b3CreateBody",
  "b3DestroyBody",
  "b3Body_IsValid",
  "b3Body_GetPosition",
  "b3Body_GetRotation",
  "b3Body_GetLinearVelocity",
  "b3Body_GetAngularVelocity",
  "b3Body_GetMassData",
  "b3Body_SetMassData",
  "b3Shape_ComputeMassData",
  "b3DefaultShapeDef",
  "b3CreateBoxShape",
  "b3CreateSphereShape",
  "b3CreateCapsuleShape",
  "b3CreateHullShape",
  "b3CreateHull",
  "b3CreateCylinder",
  "b3CreateMesh",
  "b3CreateMeshShape",
  "b3DestroyMesh",
  "b3Shape_GetFilter",
  "b3Shape_GetSurfaceMaterial",
  "b3ComputeSphereMass",
  "b3DefaultPrismaticJointDef",
  "b3CreatePrismaticJoint",
  "b3PrismaticJoint_EnableSpring",
  "b3PrismaticJoint_SetSpringHertz",
  "b3PrismaticJoint_SetSpringDampingRatio",
  "b3PrismaticJoint_SetTargetTranslation",
  "b3PrismaticJoint_GetTranslation",
  "b3PrismaticJoint_GetSpeed",
  "b3PrismaticJoint_SetMotorSpeed",
  "b3PrismaticJoint_SetMaxMotorForce",
  "b3DefaultDistanceJointDef",
  "b3CreateDistanceJoint",
  "b3DistanceJoint_GetCurrentLength",
  "b3DefaultRevoluteJointDef",
  "b3CreateRevoluteJoint",
  "b3RevoluteJoint_GetAngle",
  "b3DefaultSphericalJointDef",
  "b3CreateSphericalJoint",
  "b3DestroyJoint",
  "b3Joint_IsValid",
  "b3Joint_WakeBodies",
  "b3Joint_GetConstraintForce",
  "b3ComputeQuatBetweenUnitVectors",
  "b3RotateVector",
  "createEventsBuffer",
  "getEvents",
  "getNumContactBeginEvents",
  "destroyEventsBuffer",
  "createContactsBuffer",
  "getBodyContactData",
  "getNumContacts",
  "getContactAt",
  "getManifoldAt",
  "destroyContactsBuffer",
] as const satisfies readonly (keyof Box3DModule)[];

const MODE5_REQUIRED_EXPORTS = [
  "b3CreateWheelShapeFlat",
  "b3CreateWheelShapeProfile",
  "b3DestroyShape",
] as const;

export type Box3DRuntimeVariant = "stock" | "mode5-experiment";

let configuredRuntimeVariant: Box3DRuntimeVariant = "stock";
let sharedBoundaryPromise: Promise<Box3DBoundary> | null = null;

export function configureBox3DRuntimeVariant(
  variant: Box3DRuntimeVariant,
): void {
  if (sharedBoundaryPromise !== null && variant !== configuredRuntimeVariant) {
    throw new Error(
      "Box3D runtime variant cannot change after boundary loading has started.",
    );
  }
  configuredRuntimeVariant = variant;
}

export class Box3DBoundary {
  readonly #b3: Box3DModule;
  readonly #receipt: Box3DRuntimeReceipt;
  readonly #baseLevels: readonly F2ValidationLevel[];

  private constructor(
    b3: Box3DModule,
    receipt: Box3DRuntimeReceipt,
    levels: readonly F2ValidationLevel[],
  ) {
    this.#b3 = b3;
    this.#receipt = receipt;
    this.#baseLevels = levels;
  }

  static load(): Promise<Box3DBoundary> {
    sharedBoundaryPromise ??= Box3DBoundary.#loadFresh().catch((error: unknown) => {
      sharedBoundaryPromise = null;
      throw error;
    });
    return sharedBoundaryPromise;
  }

  static async #loadFresh(): Promise<Box3DBoundary> {
    const runtimeVariant = configuredRuntimeVariant;
    const b3: Box3DModule = runtimeVariant === "mode5-experiment"
      ? await loadMode5Box3DModule()
      : await Box3DFactory();
    const requiredExports: readonly string[] = runtimeVariant === "mode5-experiment"
      ? [...REQUIRED_EXPORTS, ...MODE5_REQUIRED_EXPORTS]
      : REQUIRED_EXPORTS;
    const moduleRecord = b3 as unknown as Record<string, unknown>;
    const missing = requiredExports.filter(
      (name) => typeof moduleRecord[name] !== "function",
    );
    if (missing.length > 0) {
      throw new Error(
        `Box3D binding is missing required exports: ${missing.join(", ")}`,
      );
    }

    const version = b3.b3GetVersion();
    const world = b3.b3DefaultWorldDef();
    const body = b3.b3DefaultBodyDef();
    const shape = b3.b3DefaultShapeDef();
    const receipt: Box3DRuntimeReceipt = {
      identity: BOX3D_RUNTIME_IDENTITY,
      engineVersion: {
        major: version.major,
        minor: version.minor,
        revision: version.revision,
      },
      defaultWorld: {
        gravityY: world.gravity.y,
        contactHertz: world.contactHertz,
        contactDampingRatio: world.contactDampingRatio,
        contactSpeed: world.contactSpeed,
        enableContinuous: world.enableContinuous,
        workerCount: world.workerCount,
        internalValue: world.internalValue,
      },
      requiredExports: [...requiredExports],
      nativeInlineShims: NATIVE_INLINE_SHIMS,
      ...(runtimeVariant === "mode5-experiment"
        ? { runtimePatch: BOX3D_MODE5_RUNTIME_PATCH }
        : {}),
    };

    const identityPass =
      version.major === 0 &&
      version.minor === 1 &&
      version.revision === 0;
    const defaultsPass =
      world.internalValue === 1_152_023 &&
      body.internalValue === 1_152_023 &&
      shape.internalValue === 1_152_023 &&
      world.gravity.y === -10 &&
      world.contactHertz === 30 &&
      world.contactDampingRatio === 10 &&
      world.contactSpeed === 3 &&
      world.enableContinuous &&
      world.workerCount === 0;
    const sample = {
      v: { x: 0.2, y: -0.3, z: 0.4 },
      s: 0.5,
    };
    const product = multiplyQuat(
      { v: { x: 0, y: 0, z: 0 }, s: 1 },
      sample,
    );
    const primitivePass =
      almostEqual(product.v.x, sample.v.x) &&
      almostEqual(product.v.y, sample.v.y) &&
      almostEqual(product.v.z, sample.v.z) &&
      almostEqual(product.s, sample.s);

    const levels = [
      createLevel(
        "B0",
        identityPass ? "PASS" : "FAIL",
        "Pinned package and engine identity.",
        [
          "package=box3d.js@0.0.2",
          `binding=${BOX3D_RUNTIME_IDENTITY.bindingCommit}`,
          `engine=${BOX3D_RUNTIME_IDENTITY.engineCommit}`,
          `runtime=${version.major}.${version.minor}.${version.revision}`,
        ],
      ),
      createLevel(
        "B1",
        "PASS",
        "Required F2/F4/F5 and product-world exports are callable.",
        [
          `exports=${requiredExports.length}`,
          "world=box+capsule+mesh+owned-mesh-teardown",
        ],
      ),
      createLevel(
        "B2",
        defaultsPass ? "PASS" : "FAIL",
        "Default definitions and solver sentinels.",
        [
          `internal=${world.internalValue}/${body.internalValue}/${shape.internalValue}`,
          `solver=${world.contactHertz}/${world.contactDampingRatio}/${world.contactSpeed}`,
          `continuous=${world.enableContinuous}`,
          `workers=${world.workerCount}`,
        ],
      ),
      createLevel(
        "B3",
        "PENDING",
        "Live ownership requires a fixture or vehicle world.",
        [],
      ),
      createLevel(
        "B4",
        primitivePass ? "PASS" : "FAIL",
        "Native-inline quaternion identity invariant.",
        [`shims=${NATIVE_INLINE_SHIMS.length}`],
      ),
      createLevel(
        "B5",
        "PENDING",
        "Real contact fixture not stepped yet.",
        [],
      ),
    ] as const;

    const failed = levels.filter(
      (level) => level.status === "FAIL",
    );
    if (failed.length > 0) {
      throw new Error(
        `Box3D boundary validation failed: ${failed
          .map((level) => level.id)
          .join(", ")}`,
      );
    }
    return new Box3DBoundary(b3, receipt, levels);
  }

  get receipt(): Box3DRuntimeReceipt {
    return this.#receipt;
  }

  get validationLevels(): readonly F2ValidationLevel[] {
    return this.#baseLevels.map((level) => ({
      ...level,
      details: [...level.details],
    }));
  }

  createMinimalContactFixture(): MinimalContactFixture {
    return MinimalContactFixture.create(
      this.#b3,
      this.#baseLevels,
    );
  }

  createM6TopologyWorld(
    receipt: NativeFactorySnapshot,
    rateProfileId?: RateSteeringProfileId,
    worldData: JvWorldData | null = null,
  ): M6TopologyWorld {
    return new M6TopologyWorld(
      this.#b3,
      receipt,
      rateProfileId ?? INITIAL_RATE_STEERING_PROFILE_ID,
      new CollisionGroupAllocator(),
      worldData,
    );
  }
}
