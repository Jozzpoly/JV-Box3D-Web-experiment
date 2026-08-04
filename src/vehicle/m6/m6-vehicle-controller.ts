import {
  RELEASE_LONGITUDINAL,
  longitudinalCommand,
  type LongitudinalCommand,
} from "../../input/longitudinal-command.js";
import type { SteeringCommand } from "../../input/steering-command.js";
import type {
  Box3DModule,
  b3BodyId,
  b3Vec3,
  b3WorldId,
} from "../../physics/box3d-runtime-contract.js";
import { LEGACY_SPLIT_WHEEL_BACKEND_ID } from "./legacy-split-wheel-backend.js";
import {
  clampNumber,
  clone3,
  distance3,
  dot3,
  scale3,
  vec3,
} from "./m6-geometry.js";
import type { M6TopologyConfig } from "./m6-topology-config.js";
import {
  createM6VehicleRuntime,
  destroyM6VehicleRuntime,
} from "./m6-runtime-builder.js";
import {
  M6_TOPOLOGY_COUNTS,
  type M6CornerTrace,
  type M6DriveMode,
  type M6DriveTrace,
  type M6HandsOnEdge,
  type M6Rotation,
  type M6SteeringActuatorState,
  type M6SteeringMechanismTrace,
  type M6TraceFrame,
  type M6VehicleRuntime,
} from "./m6-topology-contract.js";
import type { RateSteeringProfile } from "./rate-steering-profile.js";

const RACK_STICTION_RATIO = 1.4;
const INPUT_EPSILON = 1e-12;

interface RackLoadTelemetry {
  readonly frictionBase: number;
  readonly frictionLoadTerm: number;
  readonly frictionForceCap: number;
}

export class M6VehicleController {
  readonly #b3: Box3DModule;
  readonly #runtime: M6VehicleRuntime;
  readonly #config: M6TopologyConfig;
  readonly #rateProfile: RateSteeringProfile;
  readonly #generation: number;
  readonly #collisionGroupIndex: number;
  #command: SteeringCommand = { mode: "RELEASE" };
  #driveCommand: LongitudinalCommand = RELEASE_LONGITUDINAL;
  #actuator: M6SteeringActuatorState = "OFF";
  #rateCommandedRack: number | null = null;
  #rateDirection = 0;
  #steeringTrace: M6SteeringMechanismTrace;
  #driveTrace: M6DriveTrace;
  #disposed = false;
  #lastTrace: M6TraceFrame | null = null;
  #worldContactBegins = 0;

  constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    config: M6TopologyConfig,
    rateProfile: RateSteeringProfile,
    spawn: b3Vec3,
    generation: number,
    collisionGroupIndex: number,
  ) {
    this.#b3 = b3;
    this.#config = config;
    this.#rateProfile = rateProfile;
    this.#generation = generation;
    this.#collisionGroupIndex = collisionGroupIndex;
    this.#runtime = createM6VehicleRuntime(
      b3,
      worldId,
      config,
      spawn,
      collisionGroupIndex,
    );
    this.#steeringTrace = {
      profileId: rateProfile.id,
      rackRateMetersPerSecond:
        rateProfile.rackRateMetersPerSecond,
      maxTargetLeadMeters: rateProfile.maxTargetLeadMeters,
      handsOn: false,
      handsOnEdge: "NONE",
      commandedRack: null,
      liveRackTranslation: 0,
      targetError: 0,
      springEnabled: false,
      targetTranslation: null,
      requestedMotorSpeed: 0,
      motorForceCap: config.rackFrictionBase,
      rackFrictionBase: config.rackFrictionBase,
      rackFrictionLoadTerm: 0,
    };
    this.#driveTrace = {
      command: RELEASE_LONGITUDINAL,
      mode: "COAST",
      allWheelDrive: config.allWheelDrive,
      drivenCornerCount: config.allWheelDrive ? 4 : 2,
      forwardSpeedMetersPerSecond: 0,
      targetLinearSpeedMetersPerSecond: 0,
      targetWheelAngularSpeed: 0,
      driveTaper: 1,
      motorTorqueCapPerWheel: config.coastTorque,
      currentMotorTorqueTotal: 0,
    };
  }

  get collisionGroupIndex(): number {
    return this.#collisionGroupIndex;
  }

  get topologyCounts(): typeof M6_TOPOLOGY_COUNTS {
    return M6_TOPOLOGY_COUNTS;
  }

  get lastTrace(): M6TraceFrame | null {
    return this.#lastTrace;
  }

  get disposed(): boolean {
    return this.#disposed;
  }

  setSteering(command: SteeringCommand): void {
    this.#assertActive();
    if (
      command.mode !== "RELEASE" &&
      (!Number.isFinite(command.value) || Math.abs(command.value) > 1)
    ) {
      throw new RangeError(
        "M6 steering values must be finite and normalized.",
      );
    }
    this.#command =
      command.mode === "RELEASE"
        ? { mode: "RELEASE" }
        : {
            mode: command.mode,
            value: clampNumber(command.value, -1, 1),
          };
  }

  setDrive(command: LongitudinalCommand): void {
    this.#assertActive();
    this.#driveCommand = longitudinalCommand(
      command.throttle,
      command.brake,
    );
  }

  beforeStep(): void {
    this.#assertActive();
    const rackJointId = this.#runtime.rackJointId;
    const liveRack =
      this.#b3.b3PrismaticJoint_GetTranslation(rackJointId);
    const rackLoad = this.#rackLoadTelemetry();

    if (this.#command.mode === "POSITION") {
      this.#clearRateState();
      const target = this.#command.value * this.#config.rackTravel;
      const motorSpeed = this.#enableHandsOnTarget(target, liveRack);
      this.#actuator = "POSITION";
      this.#steeringTrace = this.#traceState({
        handsOn: true,
        handsOnEdge: "NONE",
        commandedRack: null,
        liveRack,
        target,
        motorSpeed,
        motorForceCap: this.#config.rackServoForce,
        rackLoad,
      });
    } else if (
      this.#command.mode === "RATE" &&
      Math.abs(this.#command.value) > 0
    ) {
      const direction = Math.sign(this.#command.value);
      let edge: M6HandsOnEdge = "NONE";
      if (this.#rateCommandedRack === null) {
        this.#rateCommandedRack = liveRack;
        edge = "ENGAGE";
      } else if (
        this.#rateDirection !== 0 &&
        direction !== this.#rateDirection
      ) {
        this.#rateCommandedRack = liveRack;
        edge = "REVERSE";
      }
      this.#rateDirection = direction;

      const requested =
        this.#rateCommandedRack +
        this.#command.value *
          this.#rateProfile.rackRateMetersPerSecond *
          this.#config.solver.fixedDt;
      const low = Math.max(
        -this.#config.rackTravel,
        liveRack - this.#rateProfile.maxTargetLeadMeters,
      );
      const high = Math.min(
        this.#config.rackTravel,
        liveRack + this.#rateProfile.maxTargetLeadMeters,
      );
      this.#rateCommandedRack = clampNumber(requested, low, high);

      const motorSpeed = this.#enableHandsOnTarget(
        this.#rateCommandedRack,
        liveRack,
      );
      this.#actuator = "RATE";
      this.#steeringTrace = this.#traceState({
        handsOn: true,
        handsOnEdge: edge,
        commandedRack: this.#rateCommandedRack,
        liveRack,
        target: this.#rateCommandedRack,
        motorSpeed,
        motorForceCap: this.#config.rackServoForce,
        rackLoad,
      });
    } else {
      this.#clearRateState();
      this.#b3.b3PrismaticJoint_EnableSpring(rackJointId, false);
      this.#b3.b3PrismaticJoint_SetMotorSpeed(rackJointId, 0);
      this.#b3.b3PrismaticJoint_SetMaxMotorForce(
        rackJointId,
        rackLoad.frictionForceCap,
      );
      this.#actuator = "OFF";
      this.#steeringTrace = this.#traceState({
        handsOn: false,
        handsOnEdge: "NONE",
        commandedRack: null,
        liveRack,
        target: null,
        motorSpeed: 0,
        motorForceCap: rackLoad.frictionForceCap,
        rackLoad,
      });
    }

    this.#b3.b3Joint_WakeBodies(rackJointId);
    this.#applyDrive();
  }

  captureTrace(
    stepIndex: number,
    worldContacts: number,
    contactBegins: number,
  ): M6TraceFrame {
    this.#assertActive();
    this.#worldContactBegins += contactBegins;

    const liveRack = this.#b3.b3PrismaticJoint_GetTranslation(
      this.#runtime.rackJointId,
    );
    const target = this.#steeringTrace.targetTranslation;
    const steering: M6SteeringMechanismTrace = {
      ...this.#steeringTrace,
      liveRackTranslation: liveRack,
      targetError: target === null ? 0 : target - liveRack,
    };

    let currentMotorTorqueTotal = 0;
    const corners = this.#runtime.corners.map(
      (corner): M6CornerTrace => {
        const rotation = this.#b3.b3Body_GetRotation(
          corner.wheel.bodyId,
        );
        const axle = this.#b3.b3RotateVector(
          rotation,
          vec3(0, 1, 0),
        );
        const angularVelocity = this.#b3.b3Body_GetAngularVelocity(
          corner.wheel.bodyId,
        );
        const driveMotorTorque =
          this.#b3.b3RevoluteJoint_GetMotorTorque(
            corner.spinJointId,
          );
        currentMotorTorqueTotal += Math.abs(driveMotorTorque);
        return {
          wheelPosition: clone3(
            this.#b3.b3Body_GetPosition(corner.wheel.bodyId),
          ),
          wheelRotation: this.#cloneRotation(corner.wheel.bodyId),
          wheelVelocity: clone3(
            this.#b3.b3Body_GetLinearVelocity(corner.wheel.bodyId),
          ),
          wheelSpinSpeed: dot3(angularVelocity, axle),
          driveMotorTorque,
          coiloverLength:
            this.#b3.b3DistanceJoint_GetCurrentLength(
              corner.coiloverJointId,
            ),
          upperHingeAngle:
            this.#b3.b3RevoluteJoint_GetAngle(
              corner.upperHingeId,
            ),
          lowerHingeAngle:
            this.#b3.b3RevoluteJoint_GetAngle(
              corner.lowerHingeId,
            ),
        };
      },
    );

    const chassisPosition = clone3(
      this.#b3.b3Body_GetPosition(this.#runtime.chassisId),
    );
    const chassisRotation = this.#cloneRotation(
      this.#runtime.chassisId,
    );
    const chassisVelocity = clone3(
      this.#b3.b3Body_GetLinearVelocity(this.#runtime.chassisId),
    );
    const drive: M6DriveTrace = {
      ...this.#driveTrace,
      forwardSpeedMetersPerSecond: this.#forwardSpeed(
        chassisVelocity,
      ),
      currentMotorTorqueTotal,
    };

    this.#lastTrace = {
      generation: this.#generation,
      stepIndex,
      command: this.#command,
      steeringActuator: this.#actuator,
      steering,
      drive,
      collisionGroupIndex: this.#collisionGroupIndex,
      wheelBackendId: LEGACY_SPLIT_WHEEL_BACKEND_ID,
      visualGeometry: {
        chassisHalfExtents: clone3(this.#config.chassisHalfExtents),
        wheelRadius: this.#config.wheelRadius,
        wheelWidth: this.#config.wheelWidth,
        rackHalfWidth: this.#config.rackHalfWidth,
      },
      chassisPosition,
      chassisRotation,
      chassisVelocity,
      chassisAngularVelocity: clone3(
        this.#b3.b3Body_GetAngularVelocity(this.#runtime.chassisId),
      ),
      rackPosition: clone3(
        this.#b3.b3Body_GetPosition(this.#runtime.rackId),
      ),
      rackRotation: this.#cloneRotation(this.#runtime.rackId),
      rackTranslation: liveRack,
      rackSpeed: this.#b3.b3PrismaticJoint_GetSpeed(
        this.#runtime.rackJointId,
      ),
      worldContacts,
      worldContactBegins: this.#worldContactBegins,
      corners,
    };
    return this.#lastTrace;
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    destroyM6VehicleRuntime(
      this.#b3,
      this.#runtime.jointIds,
      this.#runtime.bodyIds,
    );
  }

  #applyDrive(): void {
    const forwardSpeed = this.#forwardSpeed();
    const throttle = this.#driveCommand.throttle;
    const brake = this.#driveCommand.brake;
    let mode: M6DriveMode;
    let targetLinearSpeed = 0;
    let targetWheelAngularSpeed = 0;
    let driveTaper = 1;
    let motorTorqueCapPerWheel: number;

    if (brake > INPUT_EPSILON) {
      mode = "BRAKE";
      motorTorqueCapPerWheel = this.#config.brakeTorque * brake;
    } else if (Math.abs(throttle) > INPUT_EPSILON) {
      mode = "THROTTLE";
      targetLinearSpeed = throttle * this.#config.maxDriveSpeed;
      targetWheelAngularSpeed =
        -targetLinearSpeed / this.#config.wheelRadius;
      driveTaper = this.#driveTaper(throttle, forwardSpeed);
      motorTorqueCapPerWheel =
        this.#config.maxDriveTorque *
        Math.abs(throttle) *
        driveTaper;
    } else {
      mode = "COAST";
      motorTorqueCapPerWheel = this.#config.coastTorque;
    }

    for (
      let index = 0;
      index < this.#runtime.corners.length;
      index += 1
    ) {
      const corner = this.#runtime.corners[index]!;
      const driven = this.#config.allWheelDrive || index >= 2;
      const active = mode === "BRAKE" || driven;
      this.#b3.b3RevoluteJoint_EnableMotor(
        corner.spinJointId,
        active,
      );
      this.#b3.b3RevoluteJoint_SetMotorSpeed(
        corner.spinJointId,
        active ? targetWheelAngularSpeed : 0,
      );
      this.#b3.b3RevoluteJoint_SetMaxMotorTorque(
        corner.spinJointId,
        active ? motorTorqueCapPerWheel : 0,
      );
      if (
        active &&
        (brake > INPUT_EPSILON || Math.abs(throttle) > INPUT_EPSILON)
      ) {
        this.#b3.b3Joint_WakeBodies(corner.spinJointId);
      }
    }

    this.#driveTrace = {
      command: this.#driveCommand,
      mode,
      allWheelDrive: this.#config.allWheelDrive,
      drivenCornerCount: this.#config.allWheelDrive ? 4 : 2,
      forwardSpeedMetersPerSecond: forwardSpeed,
      targetLinearSpeedMetersPerSecond: targetLinearSpeed,
      targetWheelAngularSpeed,
      driveTaper,
      motorTorqueCapPerWheel,
      currentMotorTorqueTotal: 0,
    };
  }

  #driveTaper(throttle: number, forwardSpeed: number): number {
    const alignedSpeed = Math.sign(throttle) * forwardSpeed;
    if (alignedSpeed <= 0) {
      return 1;
    }
    const speedFraction = clampNumber(
      alignedSpeed / this.#config.maxDriveSpeed,
      0,
      1,
    );
    if (speedFraction <= this.#config.driveTaperStart) {
      return 1;
    }
    return clampNumber(
      (1 - speedFraction) /
        (1 - this.#config.driveTaperStart),
      0,
      1,
    );
  }

  #forwardSpeed(
    chassisVelocity = this.#b3.b3Body_GetLinearVelocity(
      this.#runtime.chassisId,
    ),
  ): number {
    const chassisRotation = this.#b3.b3Body_GetRotation(
      this.#runtime.chassisId,
    );
    const forwardAxis = this.#b3.b3RotateVector(
      chassisRotation,
      vec3(1, 0, 0),
    );
    return dot3(chassisVelocity, forwardAxis);
  }

  #enableHandsOnTarget(
    target: number,
    liveRack: number,
  ): number {
    const rackJointId = this.#runtime.rackJointId;
    this.#b3.b3PrismaticJoint_EnableSpring(rackJointId, true);
    this.#b3.b3PrismaticJoint_SetSpringHertz(
      rackJointId,
      this.#config.steeringHertz,
    );
    this.#b3.b3PrismaticJoint_SetSpringDampingRatio(
      rackJointId,
      this.#config.steeringDampingRatio,
    );
    this.#b3.b3PrismaticJoint_SetTargetTranslation(
      rackJointId,
      target,
    );
    const motorSpeed = clampNumber(
      this.#config.rackServoSpeedGain * (target - liveRack),
      -this.#config.rackServoMaxSpeed,
      this.#config.rackServoMaxSpeed,
    );
    this.#b3.b3PrismaticJoint_SetMotorSpeed(
      rackJointId,
      motorSpeed,
    );
    this.#b3.b3PrismaticJoint_SetMaxMotorForce(
      rackJointId,
      this.#config.rackServoForce,
    );
    return motorSpeed;
  }

  #rackLoadTelemetry(): RackLoadTelemetry {
    const chassisRotation = this.#b3.b3Body_GetRotation(
      this.#runtime.chassisId,
    );
    const rackAxis = this.#b3.b3RotateVector(
      chassisRotation,
      vec3(0, 0, 1),
    );
    let transverseLoad = 0;
    for (let corner = 0; corner < 2; corner += 1) {
      const tieForce = this.#b3.b3Joint_GetConstraintForce(
        this.#runtime.corners[corner]!.steeringLinkJointId,
      );
      const axial = scale3(dot3(tieForce, rackAxis), rackAxis);
      transverseLoad += distance3(tieForce, axial);
    }
    const rackSpeed = this.#b3.b3PrismaticJoint_GetSpeed(
      this.#runtime.rackJointId,
    );
    const stiction =
      Math.abs(rackSpeed) < 0.01 ? RACK_STICTION_RATIO : 1;
    const frictionLoadTerm =
      this.#config.rackFrictionLoadCoeff * transverseLoad;
    return {
      frictionBase: this.#config.rackFrictionBase,
      frictionLoadTerm,
      frictionForceCap:
        stiction *
        (this.#config.rackFrictionBase + frictionLoadTerm),
    };
  }

  #traceState(input: Readonly<{
    handsOn: boolean;
    handsOnEdge: M6HandsOnEdge;
    commandedRack: number | null;
    liveRack: number;
    target: number | null;
    motorSpeed: number;
    motorForceCap: number;
    rackLoad: RackLoadTelemetry;
  }>): M6SteeringMechanismTrace {
    return {
      profileId: this.#rateProfile.id,
      rackRateMetersPerSecond:
        this.#rateProfile.rackRateMetersPerSecond,
      maxTargetLeadMeters: this.#rateProfile.maxTargetLeadMeters,
      handsOn: input.handsOn,
      handsOnEdge: input.handsOnEdge,
      commandedRack: input.commandedRack,
      liveRackTranslation: input.liveRack,
      targetError:
        input.target === null ? 0 : input.target - input.liveRack,
      springEnabled: input.handsOn,
      targetTranslation: input.target,
      requestedMotorSpeed: input.motorSpeed,
      motorForceCap: input.motorForceCap,
      rackFrictionBase: input.rackLoad.frictionBase,
      rackFrictionLoadTerm: input.rackLoad.frictionLoadTerm,
    };
  }

  #cloneRotation(bodyId: b3BodyId): M6Rotation {
    const rotation = this.#b3.b3Body_GetRotation(bodyId);
    return {
      x: rotation.v.x,
      y: rotation.v.y,
      z: rotation.v.z,
      w: rotation.s,
    };
  }

  #clearRateState(): void {
    this.#rateCommandedRack = null;
    this.#rateDirection = 0;
  }

  #assertActive(): void {
    if (this.#disposed) {
      throw new Error("M6VehicleController has been disposed.");
    }
  }
}
