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

export const MODE5_FLAT_CONTROL_ID = "flat-control-c200mm" as const;
export const MODE5_FLAT_CONTROL_CORNER_RADIUS = 0.2;

// Owner-falsified B. Preserved as an explicit comparison variant so the
// regression can keep proving why the replacement is materially different.
export const MODE5_ASSET_PROFILE_ID =
  "asset-lower-quartile-c20mm" as const;
export const MODE5_ASSET_PROFILE_CORNER_RADIUS = 0.02;
export const MODE5_ASSET_PROFILE = Object.freeze([
  Object.freeze({ x: -0.19875, y: 0.44594027652730533 }),
  Object.freeze({ x: -0.12959156281600986, y: 0.5068779425365814 }),
  Object.freeze({ x: 0.19875, y: 0.4459531255119426 }),
] as const);

// C is derived from the real R3 tire upper-quartile axial envelope, made
// explicitly symmetric, eroded by 25 mm for the measured Box3D speculative
// contact envelope, then rounded by a 5 mm b3Wheel corner sweep. Unlike B,
// no profile-normalization heuristic is allowed to collapse the two shoulders
// into a single off-centre peak.
export const MODE5_SOLVER_AWARE_PROFILE_ID =
  "asset-symmetric-upper-quartile-i25-c5" as const;
export const MODE5_SOLVER_AWARE_PROFILE_CORNER_RADIUS = 0.005;
export const MODE5_SOLVER_AWARE_PROFILE = Object.freeze([
  Object.freeze({ x: -0.18875, y: 0.48717479384014406 }),
  Object.freeze({ x: -0.134336574002291, y: 0.5144822116561482 }),
  Object.freeze({ x: -0.12760435269157255, y: 0.5155107508534433 }),
  Object.freeze({ x: 0.12760435269157255, y: 0.5155107508534433 }),
  Object.freeze({ x: 0.134336574002291, y: 0.5144822116561482 }),
  Object.freeze({ x: 0.18875, y: 0.48717479384014406 }),
] as const);

export const MODE5_FLAT_CONTROL_GEOMETRY = "flat-control" as const;
export const MODE5_ASSET_PROFILE_GEOMETRY = "asset-profile" as const;
export const MODE5_SOLVER_AWARE_PROFILE_GEOMETRY =
  "solver-aware-profile" as const;
export type Mode5WheelGeometryVariant =
  | typeof MODE5_FLAT_CONTROL_GEOMETRY
  | typeof MODE5_ASSET_PROFILE_GEOMETRY
  | typeof MODE5_SOLVER_AWARE_PROFILE_GEOMETRY;

const requestedGeometry = import.meta.env?.["VITE_JV_MODE5_WHEEL_GEOMETRY"];

// The diagnostic branch defaults to C so full M6 settle/drive exercises the
// new candidate. A and falsified B remain explicitly selectable for causal
// comparison builds and regression tests.
export const MODE5_WHEEL_GEOMETRY_VARIANT: Mode5WheelGeometryVariant =
  requestedGeometry === MODE5_FLAT_CONTROL_GEOMETRY
    ? MODE5_FLAT_CONTROL_GEOMETRY
    : requestedGeometry === MODE5_ASSET_PROFILE_GEOMETRY
      ? MODE5_ASSET_PROFILE_GEOMETRY
      : MODE5_SOLVER_AWARE_PROFILE_GEOMETRY;

export const MODE5_WHEEL_BACKEND_ID =
  "native_m6_mode5_analytic_wheel" as const;

export interface Mode5WheelReceipt {
  readonly backendId: typeof MODE5_WHEEL_BACKEND_ID;
  readonly geometryVariant: Mode5WheelGeometryVariant;
  readonly profileId:
    | typeof MODE5_FLAT_CONTROL_ID
    | typeof MODE5_ASSET_PROFILE_ID
    | typeof MODE5_SOLVER_AWARE_PROFILE_ID;
  readonly bodyId: b3BodyId;
  readonly rollingShapeId: b3ShapeId;
  readonly shapeIds: readonly [b3ShapeId];
  readonly shapeCount: 1;
  readonly profileCount: number;
  readonly radius: number;
  readonly width: number;
  readonly cornerRadius: number;
  readonly flatControlCornerRadius: number;
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

export function createMode5WheelForGeometry(
  geometryVariant: Mode5WheelGeometryVariant,
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
    const referenceMass = freezeReferenceSphereMass(
      b3,
      bodyId,
      config,
      collisionGroupIndex,
    );
    const shapeDef = wheelShapeDef(b3, config, collisionGroupIndex);

    let rollingShapeId: b3ShapeId;
    let profileId: Mode5WheelReceipt["profileId"];
    let profileCount: number;
    let cornerRadius: number;

    if (geometryVariant === MODE5_FLAT_CONTROL_GEOMETRY) {
      cornerRadius = Math.min(
        MODE5_FLAT_CONTROL_CORNER_RADIUS,
        0.5 * config.wheelWidth,
        config.wheelRadius,
      );
      rollingShapeId = b3.b3CreateWheelShapeFlat(
        bodyId,
        shapeDef,
        vec3(),
        vec3(0, 1, 0),
        config.wheelRadius,
        0.5 * config.wheelWidth,
        cornerRadius,
      );
      profileId = MODE5_FLAT_CONTROL_ID;
      profileCount = 2;
    } else if (geometryVariant === MODE5_ASSET_PROFILE_GEOMETRY) {
      cornerRadius = Math.min(
        MODE5_ASSET_PROFILE_CORNER_RADIUS,
        0.5 * config.wheelWidth,
        config.wheelRadius,
      );
      rollingShapeId = b3.b3CreateWheelShapeProfile(
        bodyId,
        shapeDef,
        vec3(),
        vec3(0, 1, 0),
        MODE5_ASSET_PROFILE,
        cornerRadius,
      );
      profileId = MODE5_ASSET_PROFILE_ID;
      profileCount = MODE5_ASSET_PROFILE.length;
    } else {
      cornerRadius = Math.min(
        MODE5_SOLVER_AWARE_PROFILE_CORNER_RADIUS,
        0.5 * config.wheelWidth,
        config.wheelRadius,
      );
      rollingShapeId = b3.b3CreateWheelShapeProfile(
        bodyId,
        shapeDef,
        vec3(),
        vec3(0, 1, 0),
        MODE5_SOLVER_AWARE_PROFILE,
        cornerRadius,
      );
      profileId = MODE5_SOLVER_AWARE_PROFILE_ID;
      profileCount = MODE5_SOLVER_AWARE_PROFILE.length;
    }

    if (!b3.b3Shape_IsValid(rollingShapeId)) {
      throw new Error(
        `Mode5 geometry ${geometryVariant} produced an invalid wheel shape.`,
      );
    }
    b3.b3Body_SetMassData(bodyId, referenceMass);

    return {
      backendId: MODE5_WHEEL_BACKEND_ID,
      geometryVariant,
      profileId,
      bodyId,
      rollingShapeId,
      shapeIds: [rollingShapeId],
      shapeCount: 1,
      profileCount,
      radius: config.wheelRadius,
      width: config.wheelWidth,
      cornerRadius,
      flatControlCornerRadius: MODE5_FLAT_CONTROL_CORNER_RADIUS,
      collisionGroupIndex,
    };
  } catch (error: unknown) {
    if (b3.b3Body_IsValid(bodyId)) {
      b3.b3DestroyBody(bodyId);
    }
    throw error;
  }
}

export function createMode5Wheel(
  b3: Box3DModule,
  worldId: b3WorldId,
  config: M6TopologyConfig,
  position: b3Vec3,
  collisionGroupIndex: number,
): Mode5WheelReceipt {
  return createMode5WheelForGeometry(
    MODE5_WHEEL_GEOMETRY_VARIANT,
    b3,
    worldId,
    config,
    position,
    collisionGroupIndex,
  );
}
