import type { DriveInput } from '../input';
import type { M6WebRig } from './m6-rig';
import type { M6RigConfig, Vec3, WishboneGeometry } from './rig-config';
import { AXIS_X, AXIS_Y, AXIS_Z, DEG, add, clamp, distance, dot, length, normalize, scale, sub } from './math';

const RACK_STICTION_RATIO = 1.4;
const FRONT_LEFT = 0;
const FRONT_RIGHT = 1;
const REAR_LEFT = 2;
const REAR_RIGHT = 3;

export interface M6ParityTelemetry {
  rackFrictionForce: number;
  transverseTieRodLoad: number;
}

/** Current native M6/M7 drive controller and post-build parity corrections. */
export class M6ParityController {
  readonly telemetry: M6ParityTelemetry = {
    rackFrictionForce: 0,
    transverseTieRodLoad: 0,
  };

  constructor(
    private readonly b3: any,
    private readonly rig: M6WebRig,
  ) {
    const cfg = rig.config;
    cfg.rackTravel = computeRackStroke(
      cfg.wishbone,
      2 * cfg.axleHalfSpacing,
      cfg.trackHalfWidth,
      cfg.rackHalfWidth,
      cfg.maxSteeringAngleDegrees * DEG,
    );
    b3.b3PrismaticJoint_SetLimits(rig.rackJointId, -cfg.rackTravel, cfg.rackTravel);
    this.applyStaticToeLinkLengths();
  }

  update(input: DriveInput): void {
    const { b3, rig } = this;
    const cfg = rig.config;
    const corners = rig.corners as any[];
    const chassisRotation = b3.b3Body_GetRotation(rig.chassisId);
    const chassisUp = b3.b3RotateVector(chassisRotation, AXIS_Y);
    const handsOn = Math.abs(input.steer) > cfg.steerInputDeadzone;
    const rackAngle = clamp(input.steer, -1, 1) * cfg.maxSteeringAngleDegrees * DEG;

    if (handsOn) {
      const stroke = computeRackStroke(
        cfg.wishbone,
        2 * cfg.axleHalfSpacing,
        cfg.trackHalfWidth,
        cfg.rackHalfWidth,
        Math.abs(rackAngle),
      );
      const target = clamp((rackAngle >= 0 ? 1 : -1) * stroke, -cfg.rackTravel, cfg.rackTravel);
      b3.b3PrismaticJoint_EnableSpring(rig.rackJointId, true);
      b3.b3PrismaticJoint_SetSpringHertz(rig.rackJointId, cfg.steeringHertz);
      b3.b3PrismaticJoint_SetSpringDampingRatio(rig.rackJointId, cfg.steeringDampingRatio);
      b3.b3PrismaticJoint_SetTargetTranslation(rig.rackJointId, target);

      const error = target - b3.b3PrismaticJoint_GetTranslation(rig.rackJointId);
      const servoSpeed = clamp(
        cfg.rackServoSpeedGain * error,
        -cfg.rackServoMaxSpeed,
        cfg.rackServoMaxSpeed,
      );
      b3.b3PrismaticJoint_SetMotorSpeed(rig.rackJointId, servoSpeed);
      b3.b3PrismaticJoint_SetMaxMotorForce(rig.rackJointId, cfg.rackServoForce);
      this.telemetry.rackFrictionForce = 0;
      this.telemetry.transverseTieRodLoad = 0;
    } else {
      b3.b3PrismaticJoint_EnableSpring(rig.rackJointId, cfg.rackCenteringHertz > 0);
      if (cfg.rackCenteringHertz > 0) {
        b3.b3PrismaticJoint_SetSpringHertz(rig.rackJointId, cfg.rackCenteringHertz);
        b3.b3PrismaticJoint_SetSpringDampingRatio(rig.rackJointId, 1);
        b3.b3PrismaticJoint_SetTargetTranslation(rig.rackJointId, 0);
      }
      b3.b3PrismaticJoint_SetMotorSpeed(rig.rackJointId, 0);

      const slideAxis = b3.b3RotateVector(chassisRotation, AXIS_Z);
      let transverseLoad = 0;
      for (const corner of corners) {
        if (!corner.isFront) continue;
        const tieForce = b3.b3Joint_GetConstraintForce(corner.steerLinkJointId);
        const alongRack = scale(slideAxis, dot(tieForce, slideAxis));
        transverseLoad += length(sub(tieForce, alongRack));
      }

      const rackSpeed = b3.b3PrismaticJoint_GetSpeed(rig.rackJointId);
      const stiction = Math.abs(rackSpeed) < 0.01 ? RACK_STICTION_RATIO : 1;
      const frictionForce = stiction * (
        cfg.rackFrictionBase + cfg.rackFrictionLoadCoeff * transverseLoad
      );
      b3.b3PrismaticJoint_SetMaxMotorForce(rig.rackJointId, frictionForce);
      this.telemetry.rackFrictionForce = frictionForce;
      this.telemetry.transverseTieRodLoad = transverseLoad;
    }
    b3.b3Joint_WakeBodies(rig.rackJointId);

    const commandedSpinSpeed = input.drive >= 0 ? -cfg.maxDriveSpeed : cfg.maxDriveSpeed;
    for (const corner of corners) {
      const driven = cfg.allWheelDrive || !corner.isFront;
      let targetSpeed = 0;
      let torque = cfg.coastTorque;

      if (input.brake) {
        torque = cfg.brakeTorque;
      } else if (input.drive !== 0 && driven) {
        targetSpeed = commandedSpinSpeed;
        const wheelRotation = b3.b3Body_GetRotation(corner.wheelId);
        const axle = b3.b3RotateVector(wheelRotation, AXIS_Y);
        const wheelAngular = b3.b3Body_GetAngularVelocity(corner.wheelId);
        const carrierAngular = b3.b3Body_GetAngularVelocity(corner.knuckleId);
        const spinSpeed = dot(sub(wheelAngular, carrierAngular), axle);
        torque = taperedDriveTorque(cfg, spinSpeed, commandedSpinSpeed, input.drive);
      }

      b3.b3RevoluteJoint_SetMotorSpeed(corner.spinJointId, targetSpeed);
      b3.b3RevoluteJoint_SetMaxMotorTorque(corner.spinJointId, torque);
    }

    applyAntiRollBar(b3, rig, corners, FRONT_LEFT, FRONT_RIGHT, cfg.arbFrontStiffness, chassisUp);
    applyAntiRollBar(b3, rig, corners, REAR_LEFT, REAR_RIGHT, cfg.arbRearStiffness, chassisUp);
    applyAeroDrag(b3, rig, cfg);

    if (input.drive !== 0 || input.steer !== 0 || input.brake) {
      b3.b3Body_SetAwake(rig.chassisId, true);
    }
  }

  private applyStaticToeLinkLengths(): void {
    const { b3, rig } = this;
    const cfg = rig.config;
    for (let index = 0; index < rig.corners.length; index += 1) {
      const corner = rig.corners[index] as any;
      const targetArm = steeringArmWithToe(b3, cfg, index, corner.hardpoints);
      let inner: Vec3;

      if (corner.isFront) {
        const rackRestLocal = {
          x: cfg.axleHalfSpacing - cfg.wishbone.steeringArmBack,
          y: -cfg.restDrop + steeringLinkDroopLift(cfg),
          z: 0,
        };
        const rackEndLocal = {
          x: 0,
          y: 0,
          z: corner.isLeft ? -cfg.rackHalfWidth : cfg.rackHalfWidth,
        };
        inner = add(rackRestLocal, rackEndLocal);
      } else {
        const inward = corner.isLeft ? 1 : -1;
        inner = add(corner.hardpoints.steeringArm, {
          x: 0,
          y: steeringLinkDroopLift(cfg),
          z: inward * cfg.wishbone.lowerArmLength,
        });
      }

      b3.b3DistanceJoint_SetLength(corner.steerLinkJointId, distance(inner, targetArm));
      b3.b3Joint_WakeBodies(corner.steerLinkJointId);
    }
  }
}

export function computeRackStroke(
  geometry: WishboneGeometry,
  wheelbase: number,
  track: number,
  rackHalfWidth: number,
  steerAngle: number,
): number {
  const s = geometry.steeringArmBack;
  const ackermann = geometry.ackermannTrapezoid && wheelbase > 0.01
    ? geometry.ackermannFraction * s * (track / wheelbase)
    : 0;
  const kingpinZ = -track + geometry.kingpinOffset;
  const armX = -s * Math.cos(steerAngle) + ackermann * Math.sin(steerAngle);
  const armZ = s * Math.sin(steerAngle) + ackermann * Math.cos(steerAngle);
  const restArmZ = kingpinZ + ackermann;
  const tieRodLength = Math.abs(-rackHalfWidth - restArmZ);
  const deltaX = armX + s;
  const reach = Math.sqrt(Math.max(tieRodLength * tieRodLength - deltaX * deltaX, 1e-6));
  return kingpinZ + armZ + reach + rackHalfWidth;
}

function steeringArmWithToe(b3: any, config: M6RigConfig, cornerIndex: number, hp: any): Vec3 {
  const isFront = cornerIndex === FRONT_LEFT || cornerIndex === FRONT_RIGHT;
  const isLeft = cornerIndex === FRONT_LEFT || cornerIndex === REAR_LEFT;
  const toeDeg = isFront ? config.frontToeDeg : config.rearToeDeg;
  if (toeDeg === 0) return hp.steeringArm;

  const yaw = (isLeft ? -1 : 1) * toeDeg * DEG;
  const axisPoint = hp.lowerBallJoint as Vec3;
  const axisDirection = normalize(sub(hp.upperBallJoint, hp.lowerBallJoint));
  const rotation = b3.b3MakeQuatFromAxisAngle(axisDirection, yaw);
  return add(axisPoint, b3.b3RotateVector(rotation, sub(hp.steeringArm, axisPoint)));
}

function steeringLinkDroopLift(config: M6RigConfig): number {
  return config.wishbone.lowerArmLength * Math.tan(config.wishbone.restArmDroopDeg * DEG);
}

function taperedDriveTorque(
  config: M6RigConfig,
  spinSpeed: number,
  commandedSpinSpeed: number,
  driveInput: number,
): number {
  const commandSign = commandedSpinSpeed >= 0 ? 1 : -1;
  const forwardSpin = Math.max(spinSpeed * commandSign, 0);
  const taperStart = clamp(config.driveTaperStart, 0, 0.99) * config.maxDriveSpeed;
  const taper = config.maxDriveSpeed > taperStart + 0.001
    ? clamp((config.maxDriveSpeed - forwardSpin) / (config.maxDriveSpeed - taperStart), 0, 1)
    : 1;
  return Math.abs(driveInput) * config.maxDriveTorque * taper;
}

function applyAntiRollBar(
  b3: any,
  rig: M6WebRig,
  corners: any[],
  leftIndex: number,
  rightIndex: number,
  stiffness: number,
  chassisUp: Vec3,
): void {
  if (stiffness <= 0) return;
  const left = corners[leftIndex];
  const right = corners[rightIndex];
  if (!left || !right) return;

  const leftRest = b3.b3Body_GetWorldPoint(rig.chassisId, left.restWheelCenterLocal);
  const rightRest = b3.b3Body_GetWorldPoint(rig.chassisId, right.restWheelCenterLocal);
  const leftTravel = dot(sub(b3.b3Body_GetPosition(left.wheelId), leftRest), chassisUp);
  const rightTravel = dot(sub(b3.b3Body_GetPosition(right.wheelId), rightRest), chassisUp);
  const force = stiffness * (leftTravel - rightTravel);
  if (Math.abs(force) < 1) return;

  const down = scale(chassisUp, -force);
  const up = scale(chassisUp, force);
  b3.b3Body_ApplyForce(left.knuckleId, down, b3.b3Body_GetPosition(left.knuckleId), false);
  b3.b3Body_ApplyForce(right.knuckleId, up, b3.b3Body_GetPosition(right.knuckleId), false);
  b3.b3Body_ApplyForce(rig.chassisId, up, leftRest, false);
  b3.b3Body_ApplyForce(rig.chassisId, down, rightRest, false);
}

function applyAeroDrag(b3: any, rig: M6WebRig, config: M6RigConfig): void {
  if (config.aeroDragArea <= 0) return;
  const velocity = b3.b3Body_GetLinearVelocity(rig.chassisId);
  const speed = length(velocity);
  if (speed < 0.1) return;
  const forceScale = -0.5 * 1.225 * config.aeroDragArea * speed;
  b3.b3Body_ApplyForceToCenter(rig.chassisId, scale(velocity, forceScale), false);
}
