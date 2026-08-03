import type { DriveInput } from '../input';
import { M6ParityController } from './m6-parity-controller';
import { M6WebRig } from './m6-rig';
import { AXIS_Y, clamp, dot } from './math';
import { TERRAIN_CATEGORY, type M6RigConfig, type Vec3 } from './rig-config';

const FIXED_DT = 1 / 60;
const SUB_STEPS = 4;
const NEUTRAL: DriveInput = { drive: 0, steer: 0, brake: false };

export interface StraightProbeResult {
  passed: boolean;
  forwardMeters: number;
  lateralMeters: number;
  lateralRatio: number;
  finalSpeedMs: number;
  chassisTiltDeg: number;
  finite: boolean;
}

export interface SteeringReleaseProbeResult {
  passed: boolean;
  peakRackFraction: number;
  finalRackFraction: number;
  finalYawRate: number;
  finalSpeedMs: number;
  finite: boolean;
}

export interface M6ProbeReport {
  passed: boolean;
  passedCount: number;
  totalCount: number;
  straight: StraightProbeResult;
  steeringRelease: SteeringReleaseProbeResult;
}

export function runM6ParityProbes(b3: any, config: M6RigConfig): M6ProbeReport {
  const straight = runStraightProbe(b3, config);
  const steeringRelease = runSteeringReleaseProbe(b3, config);
  const results = [straight.passed, steeringRelease.passed];
  return {
    passed: results.every(Boolean),
    passedCount: results.filter(Boolean).length,
    totalCount: results.length,
    straight,
    steeringRelease,
  };
}

function runStraightProbe(b3: any, config: M6RigConfig): StraightProbeResult {
  return withProbeRig(b3, config, ({ worldId, rig, controller }) => {
    stepMany(b3, worldId, controller, NEUTRAL, 120);
    const before = toVec3(b3.b3Body_GetPosition(rig.chassisId));
    stepMany(b3, worldId, controller, { drive: 1, steer: 0, brake: false }, 300);
    const after = toVec3(b3.b3Body_GetPosition(rig.chassisId));
    const forwardMeters = after.x - before.x;
    const lateralMeters = after.z - before.z;
    const lateralRatio = Math.abs(lateralMeters) / Math.max(Math.abs(forwardMeters), 0.001);
    const rotation = b3.b3Body_GetRotation(rig.chassisId);
    const chassisUp = b3.b3RotateVector(rotation, AXIS_Y);
    const chassisTiltDeg = Math.acos(clamp(dot(chassisUp, AXIS_Y), -1, 1)) * 180 / Math.PI;
    const finalSpeedMs = rig.getForwardSpeed();
    const finite = vehicleStateIsFinite(b3, rig);
    const passed = finite
      && forwardMeters > 4
      && lateralRatio < 0.6
      && chassisTiltDeg < 40
      && finalSpeedMs > 1;

    return {
      passed,
      forwardMeters,
      lateralMeters,
      lateralRatio,
      finalSpeedMs,
      chassisTiltDeg,
      finite,
    };
  });
}

function runSteeringReleaseProbe(b3: any, config: M6RigConfig): SteeringReleaseProbeResult {
  return withProbeRig(b3, config, ({ worldId, rig, controller }) => {
    stepMany(b3, worldId, controller, NEUTRAL, 120);
    stepMany(b3, worldId, controller, { drive: 1, steer: 0, brake: false }, 150);

    let peakRack = 0;
    const steerInput: DriveInput = { drive: 0.75, steer: 0.65, brake: false };
    for (let i = 0; i < 75; i += 1) {
      stepOne(b3, worldId, controller, steerInput);
      peakRack = Math.max(peakRack, Math.abs(b3.b3PrismaticJoint_GetTranslation(rig.rackJointId)));
    }

    const releaseInput: DriveInput = { drive: 0.55, steer: 0, brake: false };
    stepMany(b3, worldId, controller, releaseInput, 240);
    const finalRack = Math.abs(b3.b3PrismaticJoint_GetTranslation(rig.rackJointId));
    const travel = Math.max(rig.config.rackTravel, 1e-5);
    const peakRackFraction = peakRack / travel;
    const finalRackFraction = finalRack / travel;
    const angularVelocity = b3.b3Body_GetAngularVelocity(rig.chassisId);
    const finalYawRate = angularVelocity.y;
    const finalSpeedMs = rig.getForwardSpeed();
    const finite = vehicleStateIsFinite(b3, rig);
    const passed = finite
      && peakRackFraction > 0.15
      && peakRackFraction <= 1.05
      && finalRackFraction < 0.45
      && Math.abs(finalYawRate) < 2.5
      && finalSpeedMs > 1;

    return {
      passed,
      peakRackFraction,
      finalRackFraction,
      finalYawRate,
      finalSpeedMs,
      finite,
    };
  });
}

function withProbeRig<T>(
  b3: any,
  config: M6RigConfig,
  run: (context: { worldId: any; rig: M6WebRig; controller: M6ParityController }) => T,
): T {
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: -9.81, z: 0 };
  worldDef.enableContinuous = false;
  const worldId = b3.b3CreateWorld(worldDef);
  b3.b3World_SetContactTuning(worldId, 30, 10, 3);
  createProbeGround(b3, worldId);

  const spawnHeight = config.restDrop + config.wheelRadius + 0.08;
  const rig = new M6WebRig(b3, worldId, config, { x: 0, y: spawnHeight, z: 0 });
  const controller = new M6ParityController(b3, rig);
  try {
    return run({ worldId, rig, controller });
  } finally {
    rig.destroy();
    b3.b3DestroyWorld(worldId);
  }
}

function createProbeGround(b3: any, worldId: any): void {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = { x: 0, y: -1, z: 0 };
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.baseMaterial.friction = 1.05;
  shapeDef.filter.categoryBits = TERRAIN_CATEGORY;
  b3.b3CreateBoxShape(bodyId, shapeDef, 200, 1, 200);
}

function stepMany(
  b3: any,
  worldId: any,
  controller: M6ParityController,
  input: DriveInput,
  count: number,
): void {
  for (let i = 0; i < count; i += 1) stepOne(b3, worldId, controller, input);
}

function stepOne(b3: any, worldId: any, controller: M6ParityController, input: DriveInput): void {
  controller.update(input);
  b3.b3World_Step(worldId, FIXED_DT, SUB_STEPS);
}

function vehicleStateIsFinite(b3: any, rig: M6WebRig): boolean {
  const bodyIds = [
    rig.chassisId,
    rig.rackId,
    ...rig.corners.flatMap((corner: any) => [
      corner.knuckleId,
      corner.upperArmId,
      corner.lowerArmId,
      corner.wheelId,
    ]),
  ];
  return bodyIds.every((bodyId) => {
    const position = b3.b3Body_GetPosition(bodyId);
    const velocity = b3.b3Body_GetLinearVelocity(bodyId);
    const angular = b3.b3Body_GetAngularVelocity(bodyId);
    return [
      position.x, position.y, position.z,
      velocity.x, velocity.y, velocity.z,
      angular.x, angular.y, angular.z,
    ].every(Number.isFinite);
  });
}

function toVec3(value: { x: number; y: number; z: number }): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}
