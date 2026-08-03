import type { SteeringCommand } from "../../input/steering-command.js";
import type {
  Box3DModule,
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
  type M6SteeringActuatorState,
  type M6TraceFrame,
  type M6VehicleRuntime,
} from "./m6-topology-contract.js";

const RACK_STICTION_RATIO = 1.4;

export class M6VehicleController {
  readonly #b3: Box3DModule;
  readonly #runtime: M6VehicleRuntime;
  readonly #config: M6TopologyConfig;
  readonly #generation: number;
  readonly #collisionGroupIndex: number;
  #command: SteeringCommand = { mode: "RELEASE" };
  #actuator: M6SteeringActuatorState = "OFF";
  #disposed = false;
  #lastTrace: M6TraceFrame | null = null;
  #worldContactBegins = 0;

  constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    config: M6TopologyConfig,
    spawn: b3Vec3,
    generation: number,
    collisionGroupIndex: number,
  ) {
    this.#b3 = b3;
    this.#config = config;
    this.#generation = generation;
    this.#collisionGroupIndex = collisionGroupIndex;
    this.#runtime = createM6VehicleRuntime(
      b3,
      worldId,
      config,
      spawn,
      collisionGroupIndex,
    );
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
      (!Number.isFinite(command.value) ||
        Math.abs(command.value) > 1)
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

  beforeStep(): void {
    this.#assertActive();
    const rackJointId = this.#runtime.rackJointId;

    if (this.#command.mode === "POSITION") {
      const target =
        this.#command.value * this.#config.rackTravel;
      this.#b3.b3PrismaticJoint_EnableSpring(
        rackJointId,
        true,
      );
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
      const error =
        target -
        this.#b3.b3PrismaticJoint_GetTranslation(rackJointId);
      this.#b3.b3PrismaticJoint_SetMotorSpeed(
        rackJointId,
        clampNumber(
          this.#config.rackServoSpeedGain * error,
          -this.#config.rackServoMaxSpeed,
          this.#config.rackServoMaxSpeed,
        ),
      );
      this.#b3.b3PrismaticJoint_SetMaxMotorForce(
        rackJointId,
        this.#config.rackServoForce,
      );
      this.#actuator = "POSITION";
    } else {
      this.#b3.b3PrismaticJoint_EnableSpring(
        rackJointId,
        false,
      );
      this.#b3.b3PrismaticJoint_SetMotorSpeed(
        rackJointId,
        0,
      );

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
        const axial = scale3(
          dot3(tieForce, rackAxis),
          rackAxis,
        );
        transverseLoad += distance3(tieForce, axial);
      }
      const rackSpeed =
        this.#b3.b3PrismaticJoint_GetSpeed(rackJointId);
      const stiction =
        Math.abs(rackSpeed) < 0.01
          ? RACK_STICTION_RATIO
          : 1;
      const frictionCap =
        stiction *
        (this.#config.rackFrictionBase +
          this.#config.rackFrictionLoadCoeff * transverseLoad);
      this.#b3.b3PrismaticJoint_SetMaxMotorForce(
        rackJointId,
        frictionCap,
      );
      this.#actuator =
        this.#command.mode === "RATE"
          ? "RATE_RESERVED"
          : "OFF";
    }

    this.#b3.b3Joint_WakeBodies(rackJointId);
  }

  captureTrace(
    stepIndex: number,
    worldContacts: number,
    contactBegins: number,
  ): M6TraceFrame {
    this.#assertActive();
    this.#worldContactBegins += contactBegins;

    const corners = this.#runtime.corners.map(
      (corner): M6CornerTrace => {
        const rotation = this.#b3.b3Body_GetRotation(
          corner.wheel.bodyId,
        );
        const axle = this.#b3.b3RotateVector(
          rotation,
          vec3(0, 1, 0),
        );
        const angularVelocity =
          this.#b3.b3Body_GetAngularVelocity(
            corner.wheel.bodyId,
          );
        return {
          wheelPosition: clone3(
            this.#b3.b3Body_GetPosition(
              corner.wheel.bodyId,
            ),
          ),
          wheelVelocity: clone3(
            this.#b3.b3Body_GetLinearVelocity(
              corner.wheel.bodyId,
            ),
          ),
          wheelSpinSpeed: dot3(angularVelocity, axle),
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

    this.#lastTrace = {
      generation: this.#generation,
      stepIndex,
      command: this.#command,
      steeringActuator: this.#actuator,
      collisionGroupIndex: this.#collisionGroupIndex,
      wheelBackendId: LEGACY_SPLIT_WHEEL_BACKEND_ID,
      chassisPosition: clone3(
        this.#b3.b3Body_GetPosition(this.#runtime.chassisId),
      ),
      chassisVelocity: clone3(
        this.#b3.b3Body_GetLinearVelocity(
          this.#runtime.chassisId,
        ),
      ),
      chassisAngularVelocity: clone3(
        this.#b3.b3Body_GetAngularVelocity(
          this.#runtime.chassisId,
        ),
      ),
      rackTranslation:
        this.#b3.b3PrismaticJoint_GetTranslation(
          this.#runtime.rackJointId,
        ),
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

  #assertActive(): void {
    if (this.#disposed) {
      throw new Error(
        "M6VehicleController has been disposed.",
      );
    }
  }
}
