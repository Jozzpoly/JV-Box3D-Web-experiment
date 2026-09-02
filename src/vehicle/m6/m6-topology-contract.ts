import type { LongitudinalCommand } from "../../input/longitudinal-command.js";
import type { SteeringCommand } from "../../input/steering-command.js";
import type {
  b3BodyId,
  b3JointId,
  b3ShapeId,
  b3Vec3,
} from "../../physics/box3d-runtime-contract.js";
import type { VehicleVisualFrameV1 } from "../../runtime/vehicle-visual-frame.js";
import type {
  M6WheelBackendId,
  M6WheelReceipt,
} from "./m6-wheel-backend.js";
import {
  MODE5_CORE_TORUS_BACKEND_ID,
  MODE5_WHEEL_BACKEND_ID,
} from "./mode5-wheel-backend.js";
import type { RateSteeringProfileId } from "./rate-steering-profile.js";

export interface M6TopologyCounts {
  readonly bodies: number;
  readonly joints: number;
  readonly shapes: number;
  readonly corners: number;
}

// Accepted mode3 baseline. Keep this constant stable for existing callers/tests.
export const M6_TOPOLOGY_COUNTS = Object.freeze({
  bodies: 19,
  joints: 28,
  shapes: 9,
  corners: 4,
} as const);

export const M6_MODE5_TOPOLOGY_COUNTS = Object.freeze({
  bodies: 19,
  joints: 28,
  shapes: 5,
  corners: 4,
} as const);

// Exact recovered CORE torus: one chassis shape plus 64 capsule shapes on each
// of four wheel bodies. Bodies/joints are intentionally unchanged so the
// falsifier isolates contact-surface topology from the rest of M6.
export const M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS = Object.freeze({
  bodies: 19,
  joints: 28,
  shapes: 257,
  corners: 4,
} as const);

export function m6TopologyCountsForWheelBackend(
  wheelBackendId: M6WheelBackendId,
): M6TopologyCounts {
  if (wheelBackendId === MODE5_CORE_TORUS_BACKEND_ID) {
    return M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS;
  }
  if (wheelBackendId === MODE5_WHEEL_BACKEND_ID) {
    return M6_MODE5_TOPOLOGY_COUNTS;
  }
  return M6_TOPOLOGY_COUNTS;
}

export type M6SteeringActuatorState = "OFF" | "POSITION" | "RATE";
export type M6HandsOnEdge = "NONE" | "ENGAGE" | "REVERSE";
export type M6DriveMode = "COAST" | "THROTTLE" | "BRAKE";

export interface M6Rotation {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export interface M6VisualGeometry {
  readonly chassisHalfExtents: b3Vec3;
  readonly wheelRadius: number;
  readonly wheelWidth: number;
  readonly rackHalfWidth: number;
}

export interface M6SteeringMechanismTrace {
  readonly profileId: RateSteeringProfileId;
  readonly rackRateMetersPerSecond: number;
  readonly maxTargetLeadMeters: number;
  readonly handsOn: boolean;
  readonly handsOnEdge: M6HandsOnEdge;
  readonly commandedRack: number | null;
  readonly liveRackTranslation: number;
  readonly targetError: number;
  readonly springEnabled: boolean;
  readonly targetTranslation: number | null;
  readonly requestedMotorSpeed: number;
  readonly motorForceCap: number;
  readonly rackFrictionBase: number;
  readonly rackFrictionLoadTerm: number;
}

export interface M6DriveTrace {
  readonly command: LongitudinalCommand;
  readonly mode: M6DriveMode;
  readonly allWheelDrive: boolean;
  readonly drivenCornerCount: number;
  readonly forwardSpeedMetersPerSecond: number;
  readonly targetLinearSpeedMetersPerSecond: number;
  readonly targetWheelAngularSpeed: number;
  readonly driveTaper: number;
  readonly motorTorqueCapPerWheel: number;
  readonly currentMotorTorqueTotal: number;
}

export interface M6CornerTrace {
  readonly knucklePosition: b3Vec3;
  readonly knuckleRotation: M6Rotation;
  readonly suspensionCarrierPosition: b3Vec3;
  readonly suspensionCarrierRotation: M6Rotation;
  readonly steeringJointAngle: number | null;
  readonly steeringCenterCarrierWorld: b3Vec3 | null;
  readonly steeringCenterKnuckleWorld: b3Vec3 | null;
  readonly steeringAxisWorld: b3Vec3 | null;
  readonly wheelPosition: b3Vec3;
  readonly wheelRotation: M6Rotation;
  readonly wheelVelocity: b3Vec3;
  readonly wheelSpinSpeed: number;
  readonly driveMotorTorque: number;
  readonly coiloverLength: number;
  readonly upperHingeAngle: number;
  readonly lowerHingeAngle: number;
}

export interface M6TraceFrame {
  readonly generation: number;
  readonly stepIndex: number;
  readonly command: SteeringCommand;
  readonly steeringActuator: M6SteeringActuatorState;
  readonly steering: M6SteeringMechanismTrace;
  readonly drive: M6DriveTrace;
  readonly collisionGroupIndex: number;
  readonly wheelBackendId: M6WheelBackendId;
  readonly visualGeometry: M6VisualGeometry;
  readonly visualFrame: VehicleVisualFrameV1;
  readonly chassisPosition: b3Vec3;
  readonly chassisRotation: M6Rotation;
  readonly chassisVelocity: b3Vec3;
  readonly chassisAngularVelocity: b3Vec3;
  readonly rackPosition: b3Vec3;
  readonly rackRotation: M6Rotation;
  readonly rackTranslation: number;
  readonly rackSpeed: number;
  readonly worldContacts: number;
  readonly worldContactBegins: number;
  readonly corners: readonly M6CornerTrace[];
}

export interface M6TopologyDisposalReceipt {
  readonly disposed: true;
  readonly worldValidAfterDestroy: false;
}

export interface M6VisualSegmentRuntime {
  readonly bodyIdA: b3BodyId;
  readonly localAnchorA: b3Vec3;
  readonly bodyIdB: b3BodyId;
  readonly localAnchorB: b3Vec3;
}

export interface M6CornerRuntime {
  readonly wheel: M6WheelReceipt;
  readonly knuckleId: b3BodyId;
  readonly suspensionCarrierId: b3BodyId;
  readonly steeringJointId: b3JointId | null;
  readonly steeringCenterCarrierLocal: b3Vec3 | null;
  readonly steeringCenterKnuckleLocal: b3Vec3 | null;
  readonly steeringAxisCarrierLocal: b3Vec3 | null;
  readonly upperArmId: b3BodyId;
  readonly lowerArmId: b3BodyId;
  readonly spinJointId: b3JointId;
  readonly upperHingeId: b3JointId;
  readonly lowerHingeId: b3JointId;
  readonly upperBallId: b3JointId;
  readonly lowerBallId: b3JointId;
  readonly coiloverJointId: b3JointId;
  readonly steeringLinkJointId: b3JointId | null;
  readonly coiloverVisual: M6VisualSegmentRuntime;
  readonly steeringLinkVisual: M6VisualSegmentRuntime;
}

export interface M6VehicleRuntime {
  readonly wheelBackendId: M6WheelBackendId;
  readonly topologyCounts: M6TopologyCounts;
  readonly chassisId: b3BodyId;
  readonly chassisShapeId: b3ShapeId;
  readonly rackId: b3BodyId;
  readonly rackJointId: b3JointId;
  readonly corners: readonly M6CornerRuntime[];
  readonly bodyIds: readonly b3BodyId[];
  readonly jointIds: readonly b3JointId[];
  readonly shapeIds: readonly b3ShapeId[];
}

export class CollisionGroupAllocator {
  #next: number;

  constructor(first = -1_000) {
    if (!Number.isInteger(first) || first >= 0) {
      throw new RangeError(
        "The first M6 collision group must be a negative integer.",
      );
    }
    this.#next = first;
  }

  allocate(): number {
    const result = this.#next;
    this.#next -= 1;
    return result;
  }
}
