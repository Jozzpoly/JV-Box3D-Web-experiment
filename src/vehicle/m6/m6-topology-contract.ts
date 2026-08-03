import type { SteeringCommand } from "../../input/steering-command.js";
import type {
  b3BodyId,
  b3JointId,
  b3ShapeId,
  b3Vec3,
} from "../../physics/box3d-runtime-contract.js";
import type { LegacySplitWheelReceipt } from "./legacy-split-wheel-backend.js";
import type { LEGACY_SPLIT_WHEEL_BACKEND_ID } from "./legacy-split-wheel-backend.js";
import type {
  RateSteeringProfileId,
} from "./rate-steering-profile.js";

export const M6_TOPOLOGY_COUNTS = Object.freeze({
  bodies: 18,
  joints: 29,
  shapes: 9,
  corners: 4,
} as const);

export type M6SteeringActuatorState =
  | "OFF"
  | "POSITION"
  | "RATE";

export type M6HandsOnEdge =
  | "NONE"
  | "ENGAGE"
  | "REVERSE";

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

export interface M6CornerTrace {
  readonly wheelPosition: b3Vec3;
  readonly wheelVelocity: b3Vec3;
  readonly wheelSpinSpeed: number;
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
  readonly collisionGroupIndex: number;
  readonly wheelBackendId: typeof LEGACY_SPLIT_WHEEL_BACKEND_ID;
  readonly chassisPosition: b3Vec3;
  readonly chassisVelocity: b3Vec3;
  readonly chassisAngularVelocity: b3Vec3;
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

export interface M6CornerRuntime {
  readonly wheel: LegacySplitWheelReceipt;
  readonly knuckleId: b3BodyId;
  readonly upperArmId: b3BodyId;
  readonly lowerArmId: b3BodyId;
  readonly spinJointId: b3JointId;
  readonly upperHingeId: b3JointId;
  readonly lowerHingeId: b3JointId;
  readonly upperBallId: b3JointId;
  readonly lowerBallId: b3JointId;
  readonly coiloverJointId: b3JointId;
  readonly steeringLinkJointId: b3JointId;
}

export interface M6VehicleRuntime {
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
