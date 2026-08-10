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
