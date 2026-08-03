import type { DriveInput } from '../input';
import { KeyboardDriverInputModel } from '../input-model';
import { M6ParityController } from './m6-parity-controller';
import { M6WebRig } from './m6-rig';
import { AXIS_Y, clamp, dot } from './math';
import { TERRAIN_CATEGORY, type M6RigConfig, type Vec3 } from './rig-config';

const FIXED_DT = 1 / 60;
const SUB_STEPS = 4;
const NEUTRAL: DriveInput = { drive: 0, steer: 0, brake: false };
const FRONT_LEFT = 0;

export interface StraightProbeResult {
  passed: boolean;
  forwardMeters: number;
  lateralMeters: number;
  lateralRatio: number;
  finalSpeedMs: number;
  chassisTiltDeg: number;
  finite: boolean;
}

export interface SteeringImpactProbeResult {
  passed: boolean;
  worstRackFraction: number;
  atRestRackFraction: number;
  finalRackFraction: number;
  finalYawRate: number;
  finalSpeedMs: number;
  finite: boolean;
}

export interface HandlingPulseProbeResult {
  stable: boolean;
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
  steeringImpact: SteeringImpactProbeResult;
  handlingPulse: HandlingPulseProbeResult;
}

export function runM6ParityProbes(b3: any, config: M6RigConfig): M6ProbeReport {
  const straight = runStraightProbe(b3, config);
  const steeringImpact = runSteeringImpactProbe(b3, config);
  const handlingPulse = runHandlingPulseProbe(b3, config);
  const gatedResults = [straight.passed, steeringImpact.passed];
  return {
    passed: gatedResults.every(Boolean),
    passedCount: gatedResults.filter(Boolean).length,
    totalCount: gatedResults.length,
    straight,
    steeringImpact,
    handlingPulse,
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

// Browser equivalent of the native P1 steering-fence/self-centering probe:
// knock the front-left wheel sideways while stationary, leave the rack hands-off,
// then drive straight. The rack may remain displaced at rest (honest caster has
// no centering force without rolling) but must stay inside its fence and return
// once the tyre rolls forward.
function runSteeringImpactProbe(b3: any, config: M6RigConfig): SteeringImpactProbeResult {
  return withProbeRig(b3, config, ({ worldId, rig, controller }) => {
    stepMany(b3, worldId, controller, NEUTRAL, 120);

    const flWheel = (rig.corners[FRONT_LEFT] as any).wheelId;
    const beforeVelocity = b3.b3Body_GetLinearVelocity(flWheel);
    b3.b3Body_SetLinearVelocity(flWheel, {
      x: beforeVelocity.x,
      y: beforeVelocity.y,
      z: beforeVelocity.z + 14,
    });

    let worstRackFraction = 0;
    for (let i = 0; i < 120; i += 1) {
      stepOne(b3, worldId, controller, NEUTRAL);
      worstRackFraction = Math.max(worstRackFraction, rackFraction(b3, rig));
    }
    const atRestRackFraction = rackFraction(b3, rig);

    stepMany(b3, worldId, controller, { drive: 1, steer: 0, brake: false }, 300);
    const finalRackFraction = rackFraction(b3, rig);
    const angularVelocity = b3.b3Body_GetAngularVelocity(rig.chassisId);
    const finalYawRate = angularVelocity.y;
    const finalSpeedMs = rig.getForwardSpeed();
    const finite = vehicleStateIsFinite(b3, rig);
    const passed = finite
      && worstRackFraction <= 1.05
      && finalRackFraction < 0.25
      && Math.abs(finalYawRate) < 1.5
      && finalSpeedMs > 5;

    return {
      passed,
      worstRackFraction,
      atRestRackFraction,
      finalRackFraction,
      finalYawRate,
      finalSpeedMs,
      finite,
    };
  });
}

// Product/feel diagnostic, deliberately not a physics-parity gate. It models a
// short A-key tap through the same finite-rate keyboard driver used by the live
// app. This asks whether an ordinary digital correction settles; it no longer
// confuses "hold a large steering command for 1.25 s under power" with a normal
// keyboard tap.
function runHandlingPulseProbe(b3: any, config: M6RigConfig): HandlingPulseProbeResult {
  return withProbeRig(b3, config, ({ worldId, rig, controller }) => {
    const driver = new KeyboardDriverInputModel();
    stepManyModeled(b3, worldId, controller, driver, NEUTRAL, 120);
    stepManyModeled(b3, worldId, controller, driver, { drive: 1, steer: 0, brake: false }, 150);

    let peakRack = 0;
    const tapInput: DriveInput = { drive: 0.65, steer: 1, brake: false };
    for (let i = 0; i < 18; i += 1) {
      stepOneModeled(b3, worldId, controller, driver, tapInput);
      peakRack = Math.max(peakRack, Math.abs(b3.b3PrismaticJoint_GetTranslation(rig.rackJointId)));
    }

    const releaseInput: DriveInput = { drive: 0.4, steer: 0, brake: false };
    stepManyModeled(b3, worldId, controller, driver, releaseInput, 210);
    const finalRackFraction = rackFraction(b3, rig);
    const travel = Math.max(rig.config.rackTravel, 1e-5);
    const peakRackFraction = peakRack / travel;
    const angularVelocity = b3.b3Body_GetAngularVelocity(rig.chassisId);
    const finalYawRate = angularVelocity.y;
    const finalSpeedMs = rig.getForwardSpeed();
    const finite = vehicleStateIsFinite(b3, rig);
    const stable = finite
      && peakRackFraction > 0.08
      && peakRackFraction <= 1.05
      && finalRackFraction < 0.35
      && Math.abs(finalYawRate) < 1.5
      && finalSpeedMs > 1;

    return {
      stable,
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

function stepManyModeled(
  b3: any,
  worldId: any,
  controller: M6ParityController,
  driver: KeyboardDriverInputModel,
  rawInput: DriveInput,
  count: number,
): void {
  for (let i = 0; i < count; i += 1) {
    stepOneModeled(b3, worldId, controller, driver, rawInput);
  }
}

function stepOneModeled(
  b3: any,
  worldId: any,
  controller: M6ParityController,
  driver: KeyboardDriverInputModel,
  rawInput: DriveInput,
): void {
  controller.update(driver.update(rawInput, FIXED_DT));
  b3.b3World_Step(worldId, FIXED_DT, SUB_STEPS);
}

function rackFraction(b3: any, rig: M6WebRig): number {
  return Math.abs(b3.b3PrismaticJoint_GetTranslation(rig.rackJointId))
    / Math.max(rig.config.rackTravel, 1e-5);
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
