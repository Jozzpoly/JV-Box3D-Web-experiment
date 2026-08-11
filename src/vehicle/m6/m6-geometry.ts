import type { b3Vec3 } from "../../physics/box3d-runtime-contract.js";
import type { M6TopologyConfig } from "./m6-topology-config.js";

export const M6_DEGREES_TO_RADIANS = Math.PI / 180;

export interface M6WishboneHardpoints {
  readonly upperBallJoint: b3Vec3;
  readonly lowerBallJoint: b3Vec3;
  readonly steeringArm: b3Vec3;
  readonly upperFrontChassis: b3Vec3;
  readonly upperRearChassis: b3Vec3;
  readonly lowerFrontChassis: b3Vec3;
  readonly lowerRearChassis: b3Vec3;
  readonly coiloverChassis: b3Vec3;
  readonly coiloverKnuckle: b3Vec3;
}

export interface M6FrontLeftGoldenHardpoints extends M6WishboneHardpoints {
  readonly steeringCenter: b3Vec3;
  readonly steeringAxisDirection: b3Vec3;
  readonly suspensionAxisDirection: b3Vec3;
}

// Exact authored values from
// assets/owner-vehicle/source/OneSided_Steering_Suspension_Rig.gltf.
// Source axes are converted with the established JV vehicle placement:
// yaw -90 degrees about Y and 0.35 meters per Blockbench unit.
export const M6_FRONT_LEFT_GOLDEN_SOURCE = Object.freeze({
  metersPerBlockbenchUnit: 0.35,
  // Exact native ArmEnds() outboard endpoint for source node 7.
  // It is derived from the rigid-part geometry bounds, not from the
  // Socket_SteeringRod semantic node position.
  steeringRodOutboardFromWheelCenterBU: Object.freeze({
    x: 0,
    y: 0.21875,
    z: 0.875,
  }),
  steeringAxisDirectionBU: Object.freeze({ x: 0, y: 1, z: 0 }),
} as const);

export function vec3(x = 0, y = 0, z = 0): b3Vec3 {
  return { x, y, z };
}

export function add3(a: b3Vec3, b: b3Vec3): b3Vec3 {
  return vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}

export function sub3(a: b3Vec3, b: b3Vec3): b3Vec3 {
  return vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function scale3(scale: number, value: b3Vec3): b3Vec3 {
  return vec3(scale * value.x, scale * value.y, scale * value.z);
}

export function dot3(a: b3Vec3, b: b3Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function length3(value: b3Vec3): number {
  return Math.sqrt(dot3(value, value));
}

export function distance3(a: b3Vec3, b: b3Vec3): number {
  return length3(sub3(a, b));
}

export function normalize3(value: b3Vec3): b3Vec3 {
  const magnitude = length3(value);
  if (!(magnitude > 1e-8)) {
    throw new Error("Cannot normalize a zero-length M6 vector.");
  }
  return scale3(1 / magnitude, value);
}

export function clone3(value: b3Vec3): b3Vec3 {
  return vec3(value.x, value.y, value.z);
}

export function clampNumber(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

export function isFrontCorner(corner: number): boolean {
  return corner === 0 || corner === 1;
}

export function isLeftCorner(corner: number): boolean {
  return corner === 0 || corner === 2;
}

export function m6CornerOffset(config: M6TopologyConfig, corner: number): b3Vec3 {
  return vec3(
    isFrontCorner(corner) ? config.axleHalfSpacing : -config.axleHalfSpacing,
    -config.restDrop,
    isLeftCorner(corner) ? -config.trackHalfWidth : config.trackHalfWidth,
  );
}

export function m6WishboneHardpoints(
  config: M6TopologyConfig,
  corner: number,
  restWheelCenter: b3Vec3,
): M6WishboneHardpoints {
  const geometry = config.wishbone;
  const inward = isLeftCorner(corner) ? 1 : -1;
  const h = geometry.uprightHalfHeight;
  const casterTangent = Math.tan(
    geometry.casterDeg * M6_DEGREES_TO_RADIANS,
  );
  const kpiTangent = Math.tan(
    geometry.kingpinInclinationDeg * M6_DEGREES_TO_RADIANS,
  );

  const upperBallJoint = add3(
    restWheelCenter,
    vec3(
      -casterTangent * h,
      h,
      inward * (geometry.kingpinOffset + kpiTangent * h),
    ),
  );
  const lowerBallJoint = add3(
    restWheelCenter,
    vec3(
      casterTangent * h,
      -h,
      inward * (geometry.kingpinOffset - kpiTangent * h),
    ),
  );

  const droopTangent = Math.tan(
    geometry.restArmDroopDeg * M6_DEGREES_TO_RADIANS,
  );
  const upperInboard = add3(
    upperBallJoint,
    vec3(
      0,
      geometry.upperArmLength * droopTangent,
      inward * geometry.upperArmLength,
    ),
  );
  const lowerInboard = add3(
    lowerBallJoint,
    vec3(
      0,
      geometry.lowerArmLength * droopTangent,
      inward * geometry.lowerArmLength,
    ),
  );

  let armInboard = geometry.kingpinOffset;
  if (geometry.ackermannTrapezoid) {
    armInboard +=
      geometry.ackermannFraction *
      geometry.steeringArmBack *
      (config.trackHalfWidth / (2 * config.axleHalfSpacing));
  }

  return {
    upperBallJoint,
    lowerBallJoint,
    steeringArm: add3(
      restWheelCenter,
      vec3(-geometry.steeringArmBack, 0, inward * armInboard),
    ),
    upperFrontChassis: add3(
      upperInboard,
      vec3(geometry.armHalfSpread, 0, 0),
    ),
    upperRearChassis: add3(
      upperInboard,
      vec3(-geometry.armHalfSpread, 0, 0),
    ),
    lowerFrontChassis: add3(
      lowerInboard,
      vec3(geometry.armHalfSpread, 0, 0),
    ),
    lowerRearChassis: add3(
      lowerInboard,
      vec3(-geometry.armHalfSpread, 0, 0),
    ),
    coiloverChassis: add3(
      restWheelCenter,
      vec3(
        0,
        geometry.coiloverTopHeight,
        inward * geometry.coiloverTopInboard,
      ),
    ),
    coiloverKnuckle: lowerBallJoint,
  };
}

function frontLeftSourceDeltaMeters(sourceDeltaBU: b3Vec3): b3Vec3 {
  const scale = M6_FRONT_LEFT_GOLDEN_SOURCE.metersPerBlockbenchUnit;
  return vec3(
    -sourceDeltaBU.z * scale,
    sourceDeltaBU.y * scale,
    sourceDeltaBU.x * scale,
  );
}

/**
 * S2-PORT front-left authority repair.
 *
 * S2 deliberately preserves the already integrated suspension hardpoints.
 * Their old upper/lower line may remain a suspension-carrier constraint, but
 * it is no longer allowed to act as the steering/kingpin axis. The new
 * carrier->knuckle revolute is centered independently on authored
 * Socket_WheelCenter. Only the steering-link outboard is source-rederived in
 * this bounded transaction.
 */
export function m6FrontLeftGoldenHardpoints(
  config: M6TopologyConfig,
  restWheelCenter: b3Vec3,
): M6FrontLeftGoldenHardpoints {
  const current = m6WishboneHardpoints(config, 0, restWheelCenter);
  const steeringArm = add3(
    restWheelCenter,
    frontLeftSourceDeltaMeters(
      M6_FRONT_LEFT_GOLDEN_SOURCE.steeringRodOutboardFromWheelCenterBU,
    ),
  );
  const steeringAxisDirection = normalize3(
    frontLeftSourceDeltaMeters(
      M6_FRONT_LEFT_GOLDEN_SOURCE.steeringAxisDirectionBU,
    ),
  );
  const suspensionAxisDirection = normalize3(
    sub3(current.upperBallJoint, current.lowerBallJoint),
  );

  return {
    ...current,
    steeringArm,
    steeringCenter: clone3(restWheelCenter),
    steeringAxisDirection,
    suspensionAxisDirection,
  };
}

export function m6FrontLeftSteeringAngleFromRack(
  config: M6TopologyConfig,
  rackTranslation: number,
): number {
  const clampedRack = clampNumber(
    rackTranslation,
    -config.rackTravel,
    config.rackTravel,
  );
  if (Math.abs(clampedRack) <= 1e-12) {
    return 0;
  }

  // Source/golden steering law for the rebuilt FL corner. The real rack body
  // remains the steering reference, but suspension travel is not allowed to
  // back-drive the centered carrier->knuckle steering DOF. Instead, derive
  // the angle that the authored #7 outboard would have at the REST carrier
  // pose for the live rack translation. This is the same geometric relation
  // as a rigid tie rod at rest, without reintroducing bump-steer as a hidden
  // steering command during suspension articulation.
  const outboard = frontLeftSourceDeltaMeters(
    M6_FRONT_LEFT_GOLDEN_SOURCE.steeringRodOutboardFromWheelCenterBU,
  );
  const rackRestFromWheelCenter = vec3(
    -config.wishbone.steeringArmBack,
    m6SteeringLinkDroopLift(config),
    config.trackHalfWidth,
  );
  const restLengthSquared = dot3(
    sub3(outboard, rackRestFromWheelCenter),
    sub3(outboard, rackRestFromWheelCenter),
  );

  const rack = clone3(rackRestFromWheelCenter);
  rack.z += clampedRack;
  const maxAngle =
    (config.maxSteeringAngleDegrees + 10) * M6_DEGREES_TO_RADIANS;
  let low = clampedRack > 0 ? 0 : -maxAngle;
  let high = clampedRack > 0 ? maxAngle : 0;

  const residual = (angle: number): number => {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const rotated = vec3(
      cosine * outboard.x + sine * outboard.z,
      outboard.y,
      -sine * outboard.x + cosine * outboard.z,
    );
    const delta = sub3(rotated, rack);
    return dot3(delta, delta) - restLengthSquared;
  };

  let lowResidual = residual(low);
  let highResidual = residual(high);
  if (lowResidual === 0) {
    return low;
  }
  if (highResidual === 0) {
    return high;
  }
  if (Math.sign(lowResidual) === Math.sign(highResidual)) {
    throw new Error(
      `FL golden rack geometry has no steering root inside the accepted fence for rack=${clampedRack}.`,
    );
  }

  for (let iteration = 0; iteration < 48; iteration += 1) {
    const mid = 0.5 * (low + high);
    const midResidual = residual(mid);
    if (Math.abs(midResidual) <= 1e-12) {
      return mid;
    }
    if (Math.sign(midResidual) === Math.sign(lowResidual)) {
      low = mid;
      lowResidual = midResidual;
    } else {
      high = mid;
      highResidual = midResidual;
    }
  }
  return 0.5 * (low + high);
}

export function m6SteeringLinkDroopLift(config: M6TopologyConfig): number {
  return (
    config.wishbone.lowerArmLength *
    Math.tan(
      config.wishbone.restArmDroopDeg * M6_DEGREES_TO_RADIANS,
    )
  );
}

export function m6HingeSwingLimit(
  config: M6TopologyConfig,
  armLength: number,
): number {
  const travel = Math.max(config.compressionTravel, config.reboundTravel);
  const sine = clampNumber(
    (1.25 * travel) / Math.max(armLength, 0.05),
    0.05,
    0.95,
  );
  return Math.min(
    Math.asin(sine),
    55 * M6_DEGREES_TO_RADIANS,
  );
}

export function m6OffsetBoxPoints(
  halfExtents: b3Vec3,
  yOffset: number,
): number[] {
  const points: number[] = [];
  for (const x of [-halfExtents.x, halfExtents.x]) {
    for (const y of [
      -halfExtents.y + yOffset,
      halfExtents.y + yOffset,
    ]) {
      for (const z of [-halfExtents.z, halfExtents.z]) {
        points.push(x, y, z);
      }
    }
  }
  return points;
}
