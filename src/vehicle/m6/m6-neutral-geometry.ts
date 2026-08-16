import type { b3Vec3 } from "../../physics/box3d-runtime-contract.js";
import {
  m6CornerOffset,
  m6WishboneHardpoints,
} from "./m6-geometry.js";
import type { M6TopologyConfig } from "./m6-topology-config.js";
import {
  JV_RIG_SPACE_V1,
  type JvNeutralBodyV1,
  type JvNeutralFrameV1,
  type JvNeutralGeometryReceiptV1,
  type JvNeutralMechanismV1,
  type JvVec3,
} from "../neutral-mechanism.js";

const FRONT_LEFT_CORNER = 0;
const IDENTITY_ROTATION = Object.freeze({ x: 0, y: 0, z: 0, w: 1 } as const);
const ORIGIN = Object.freeze({ x: 0, y: 0, z: 0 } as const);
const REVOLUTE_AXIS_LOCAL = Object.freeze({ x: 1, y: 0, z: 0 } as const);

function point(value: b3Vec3 | JvVec3): JvVec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function midpoint(a: b3Vec3, b: b3Vec3): JvVec3 {
  return {
    x: 0.5 * (a.x + b.x),
    y: 0.5 * (a.y + b.y),
    z: 0.5 * (a.z + b.z),
  };
}

function subtract(a: b3Vec3 | JvVec3, b: b3Vec3 | JvVec3): JvVec3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

function body(id: string, position: JvVec3): JvNeutralBodyV1 {
  return {
    id,
    neutralPose: {
      position: point(position),
      rotation: { ...IDENTITY_ROTATION },
    },
  };
}

function frame(
  id: string,
  ownerBody: string,
  localPosition: JvVec3,
  primaryAxisLocal?: JvVec3,
): JvNeutralFrameV1 {
  return {
    id,
    ownerBody,
    localPosition: point(localPosition),
    ...(primaryAxisLocal === undefined
      ? {}
      : { primaryAxisLocal: point(primaryAxisLocal) }),
  };
}

/**
 * Projects the current procedural front-left M6 double-wishbone geometry into
 * a small engine-neutral consumer representation.
 *
 * This is deliberately read-only: it does not feed the Box3D runtime and it
 * does not claim authored authority. Its purpose is to expose exactly what the
 * current legacy consumer believes the coherent neutral wishbone shape is so
 * JURE can compare authored truth against it without reverse engineering the
 * runtime builder.
 */
export function projectLegacyM6FrontLeftWishboneNeutral(
  config: M6TopologyConfig,
): JvNeutralMechanismV1 {
  const carrierOrigin = m6CornerOffset(
    config,
    FRONT_LEFT_CORNER,
  );
  const hardpoints = m6WishboneHardpoints(
    config,
    FRONT_LEFT_CORNER,
    carrierOrigin,
  );
  const upperHinge = midpoint(
    hardpoints.upperFrontChassis,
    hardpoints.upperRearChassis,
  );
  const lowerHinge = midpoint(
    hardpoints.lowerFrontChassis,
    hardpoints.lowerRearChassis,
  );

  const chassisId = "m6.chassis-reference";
  const upperArmId = "m6.fl.upper-arm";
  const lowerArmId = "m6.fl.lower-arm";
  const carrierId = "m6.fl.carrier-reference";

  const bodies = [
    body(chassisId, ORIGIN),
    body(upperArmId, upperHinge),
    body(lowerArmId, lowerHinge),
    body(carrierId, carrierOrigin),
  ] as const;

  const frames = [
    frame(
      "m6.fl.upper-inboard.chassis",
      chassisId,
      upperHinge,
      REVOLUTE_AXIS_LOCAL,
    ),
    frame(
      "m6.fl.upper-inboard.arm",
      upperArmId,
      ORIGIN,
      REVOLUTE_AXIS_LOCAL,
    ),
    frame(
      "m6.fl.lower-inboard.chassis",
      chassisId,
      lowerHinge,
      REVOLUTE_AXIS_LOCAL,
    ),
    frame(
      "m6.fl.lower-inboard.arm",
      lowerArmId,
      ORIGIN,
      REVOLUTE_AXIS_LOCAL,
    ),
    frame(
      "m6.fl.upper-outboard.arm",
      upperArmId,
      subtract(hardpoints.upperBallJoint, upperHinge),
    ),
    frame(
      "m6.fl.upper-outboard.carrier",
      carrierId,
      subtract(hardpoints.upperBallJoint, carrierOrigin),
    ),
    frame(
      "m6.fl.lower-outboard.arm",
      lowerArmId,
      subtract(hardpoints.lowerBallJoint, lowerHinge),
    ),
    frame(
      "m6.fl.lower-outboard.carrier",
      carrierId,
      subtract(hardpoints.lowerBallJoint, carrierOrigin),
    ),
  ] as const;

  return {
    schema: "jv-neutral-mechanism/v1",
    mechanismId: "m6.front-left.double-wishbone.legacy-procedural",
    coordinateSpace: JV_RIG_SPACE_V1,
    bodies,
    frames,
    relations: [
      {
        id: "m6.fl.upper-inboard",
        type: "revolute",
        frameA: "m6.fl.upper-inboard.chassis",
        frameB: "m6.fl.upper-inboard.arm",
      },
      {
        id: "m6.fl.lower-inboard",
        type: "revolute",
        frameA: "m6.fl.lower-inboard.chassis",
        frameB: "m6.fl.lower-inboard.arm",
      },
      {
        id: "m6.fl.upper-outboard",
        type: "spherical",
        frameA: "m6.fl.upper-outboard.arm",
        frameB: "m6.fl.upper-outboard.carrier",
      },
      {
        id: "m6.fl.lower-outboard",
        type: "spherical",
        frameA: "m6.fl.lower-outboard.arm",
        frameB: "m6.fl.lower-outboard.carrier",
      },
    ],
  };
}

export function buildLegacyM6FrontLeftNeutralGeometryReceipt(
  config: M6TopologyConfig,
): JvNeutralGeometryReceiptV1 {
  return {
    format: "jv-neutral-geometry-receipt/v1",
    source: {
      kind: "legacy-procedural-m6",
      configReceiptPath: "public/receipts/jv_m6_factory_receipt.json",
    },
    mechanism: projectLegacyM6FrontLeftWishboneNeutral(config),
  };
}
