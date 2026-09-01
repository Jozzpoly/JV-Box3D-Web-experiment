import {
  assertMode5Box3DModule,
  type Mode5Box3DModule,
} from "../../physics/mode5-box3d-runtime.js";
import type {
  Box3DModule,
  b3BodyId,
  b3ShapeId,
  b3Vec3,
  b3WorldId,
} from "../../physics/box3d-runtime-contract.js";
import type { M6TopologyConfig } from "./m6-topology-config.js";
import { vec3 } from "./m6-geometry.js";

const OWNER_SELECTED_CORNER_RADIUS = 0.2;

export const MODE5_WHEEL_BACKEND_ID =
  "native_m6_mode5_analytic_wheel" as const;

export interface Mode5WheelReceipt {
  readonly backendId: typeof MODE5_WHEEL_BACKEND_ID;
  readonly bodyId: b3BodyId;
  readonly rollingShapeId: b3ShapeId;
  readonly shapeIds: readonly [b3ShapeId];
  readonly shapeCount: 1;
  readonly radius: number;
  readonly width: number;
  readonly cornerRadius: number;
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

function wheelShapeDef(
  b3: Box3DModule,
  config: M6TopologyConfig,
  collisionGroupIndex: number,
) {
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.density = config.wheelDensity;
  shapeDef.baseMaterial.friction = config.wheelFriction;
  shapeDef.baseMaterial.restitution = 0.02;
  shapeDef.baseMaterial.rollingResistance =
    config.wheelRollingResistance;
  // Native mode5 is one physical tire surface. Do not reproduce mode3's
  // terrain/non-terrain split masks on the analytic shape.
  shapeDef.filter.groupIndex = collisionGroupIndex;
  shapeDef.enableContactEvents = true;
  return shapeDef;
}

function freezeReferenceSphereMass(
  b3: Mode5Box3DModule,
  bodyId: b3BodyId,
  config: M6TopologyConfig,
  collisionGroupIndex: number,
) {
  const referenceDef = wheelShapeDef(
    b3,
    config,
    collisionGroupIndex,
  );
  const referenceId = b3.b3CreateSphereShape(bodyId, referenceDef, {
    center: vec3(),
    radius: config.wheelRadius,
  });
  const massData = b3.b3Body_GetMassData(bodyId);
  b3.b3DestroyShape(referenceId, false);
  return massData;
}

export function createMode5Wheel(
  b3: Box3DModule,
  worldId: b3WorldId,
  config: M6TopologyConfig,
  position: b3Vec3,
  collisionGroupIndex: number,
): Mode5WheelReceipt {
  assertMode5Box3DModule(b3);
  if (config.terrainCategoryBits !== 2n) {
    throw new Error(
      "Mode5 wheel experiment requires the recovered M6 terrain category 0x2.",
    );
  }

  const bodyId = createDynamicWheelBody(b3, worldId, position);
  try {
    // Native hard rule: compare contact geometry with wheel mass/inertia frozen
    // to an engine-created reference sphere, never to a hand-derived formula.
    const referenceMass = freezeReferenceSphereMass(
      b3,
      bodyId,
      config,
      collisionGroupIndex,
    );

    const shapeDef = wheelShapeDef(
      b3,
      config,
      collisionGroupIndex,
    );
    const cornerRadius = Math.min(
      OWNER_SELECTED_CORNER_RADIUS,
      0.5 * config.wheelWidth,
      config.wheelRadius,
    );
    const rollingShapeId = b3.b3CreateWheelShapeFlat(
      bodyId,
      shapeDef,
      vec3(),
      vec3(0, 1, 0),
      config.wheelRadius,
      0.5 * config.wheelWidth,
      cornerRadius,
    );
    b3.b3Body_SetMassData(bodyId, referenceMass);

    return {
      backendId: MODE5_WHEEL_BACKEND_ID,
      bodyId,
      rollingShapeId,
      shapeIds: [rollingShapeId],
      shapeCount: 1,
      radius: config.wheelRadius,
      width: config.wheelWidth,
      cornerRadius,
      collisionGroupIndex,
    };
  } catch (error: unknown) {
    if (b3.b3Body_IsValid(bodyId)) {
      b3.b3DestroyBody(bodyId);
    }
    throw error;
  }
}
