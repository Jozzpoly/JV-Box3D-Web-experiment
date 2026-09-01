import type {
  Box3DModule,
  b3BodyId,
  b3ShapeId,
  b3Vec3,
  b3WorldId,
} from "../../physics/box3d-runtime-contract.js";
import type { M6TopologyConfig } from "./m6-topology-config.js";
import { vec3 } from "./m6-geometry.js";

const FULL_MASK = 0xffff_ffff_ffff_ffffn;
const SIDE_COUNT = 32;

export const LEGACY_SPLIT_WHEEL_BACKEND_ID =
  "legacy_m6_split_sphere_sidewall" as const;

export interface LegacySplitWheelReceipt {
  readonly backendId: typeof LEGACY_SPLIT_WHEEL_BACKEND_ID;
  readonly bodyId: b3BodyId;
  readonly rollingShapeId: b3ShapeId;
  readonly sidewallShapeId: b3ShapeId;
  readonly shapeIds: readonly [b3ShapeId, b3ShapeId];
  readonly shapeCount: 2;
  readonly radius: number;
  readonly width: number;
  readonly terrainCategoryBits: 2n;
  readonly collisionGroupIndex: number;
}

function createDynamicWheelBody(
  b3: Box3DModule,
  worldId: b3WorldId,
  position: b3Vec3,
): b3BodyId {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.type = b3.b3BodyType.b3_dynamicBody;
  bodyDef.position = position;
  bodyDef.rotation = b3.b3ComputeQuatBetweenUnitVectors(
    vec3(0, 1, 0),
    vec3(0, 0, 1),
  );
  bodyDef.allowFastRotation = true;
  return b3.b3CreateBody(worldId, bodyDef);
}

export function createLegacySplitWheel(
  b3: Box3DModule,
  worldId: b3WorldId,
  config: M6TopologyConfig,
  position: b3Vec3,
  collisionGroupIndex: number,
): LegacySplitWheelReceipt {
  if (
    config.wheelEnvelopeMode !== 3 ||
    config.terrainCategoryBits !== 2n
  ) {
    throw new Error(
      "F4 legacy split wheel requires native mode 3 and terrain category 0x2.",
    );
  }

  const bodyId = createDynamicWheelBody(b3, worldId, position);
  try {
    const rollingDef = b3.b3DefaultShapeDef();
    rollingDef.density = config.wheelDensity;
    rollingDef.baseMaterial.friction = config.wheelFriction;
    rollingDef.baseMaterial.restitution = 0.02;
    rollingDef.baseMaterial.rollingResistance =
      config.wheelRollingResistance;
    rollingDef.filter.categoryBits = FULL_MASK;
    rollingDef.filter.maskBits = config.terrainCategoryBits;
    rollingDef.filter.groupIndex = collisionGroupIndex;
    rollingDef.enableContactEvents = true;
    const rollingShapeId = b3.b3CreateSphereShape(bodyId, rollingDef, {
      center: vec3(),
      radius: config.wheelRadius,
    });

    const sidewallDef = b3.b3DefaultShapeDef();
    sidewallDef.density = 0;
    sidewallDef.baseMaterial.friction = config.wheelFriction;
    sidewallDef.baseMaterial.restitution = 0.02;
    sidewallDef.baseMaterial.rollingResistance =
      config.wheelRollingResistance;
    sidewallDef.filter.categoryBits = FULL_MASK;
    sidewallDef.filter.maskBits =
      FULL_MASK ^ config.terrainCategoryBits;
    sidewallDef.filter.groupIndex = collisionGroupIndex;
    sidewallDef.enableContactEvents = true;

    const hull = b3.b3CreateCylinder(
      config.wheelWidth,
      config.wheelRadius,
      -0.5 * config.wheelWidth,
      SIDE_COUNT,
    );
    if (hull === null) {
      throw new Error(
        "Box3D rejected the legacy M6 wheel sidewall hull.",
      );
    }
    let sidewallShapeId: b3ShapeId;
    try {
      sidewallShapeId = b3.b3CreateHullShape(
        bodyId,
        sidewallDef,
        hull,
      );
    } finally {
      hull.delete();
    }

    return {
      backendId: LEGACY_SPLIT_WHEEL_BACKEND_ID,
      bodyId,
      rollingShapeId,
      sidewallShapeId,
      shapeIds: [rollingShapeId, sidewallShapeId],
      shapeCount: 2,
      radius: config.wheelRadius,
      width: config.wheelWidth,
      terrainCategoryBits: 2n,
      collisionGroupIndex,
    };
  } catch (error: unknown) {
    if (b3.b3Body_IsValid(bodyId)) {
      b3.b3DestroyBody(bodyId);
    }
    throw error;
  }
}
