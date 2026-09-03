import { readFile } from 'node:fs/promises';
import { validatePinnedNativeFactoryReceiptText } from '../.test-dist/config/native-factory-receipt.js';
import { loadMode5Box3DModule } from '../.test-dist/physics/mode5-box3d-runtime.js';
import { M6TopologyWorld } from '../.test-dist/vehicle/m6/m6-topology-world.js';
import {
  MODE5_CORE_TORUS_CROWN_RATIO,
  MODE5_CORE_TORUS_GEOMETRY,
  MODE5_CORE_TORUS_SEGMENTS,
  MODE5_WHEEL_GEOMETRY_VARIANT,
} from '../.test-dist/vehicle/m6/mode5-wheel-backend.js';

const mode = process.env.JV_PRESOLVE_MODE ?? 'PASSALL';
if (!['PASSALL', 'NEAREST1', 'NEAREST3'].includes(mode)) {
  throw new Error(`unknown pre-solve mode ${mode}`);
}
if (MODE5_WHEEL_GEOMETRY_VARIANT !== MODE5_CORE_TORUS_GEOMETRY) {
  throw new Error(`expected ${MODE5_CORE_TORUS_GEOMETRY}, got ${MODE5_WHEEL_GEOMETRY_VARIANT}`);
}
if (Math.abs(MODE5_CORE_TORUS_CROWN_RATIO - 0.65) > 1e-12) {
  throw new Error(`expected T65 crown ratio, got ${MODE5_CORE_TORUS_CROWN_RATIO}`);
}

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile('public/receipts/jv_m6_factory_receipt.json', 'utf8'),
);
const b3 = await loadMode5Box3DModule();
for (const name of [
  'b3World_SetPreSolveCallback',
  'b3Shape_EnablePreSolveEvents',
  'b3Shape_ArePreSolveEventsEnabled',
  'b3Shape_GetCapsule',
  'b3Shape_GetBody',
  'b3Body_GetLocalVector',
]) {
  if (typeof b3[name] !== 'function') throw new Error(`pinned mode5 runtime missing ${name}`);
}

function idKey(id) {
  if (!id || !Number.isInteger(id.index1)) throw new Error(`invalid Box3D id ${JSON.stringify(id)}`);
  return `${id.index1}/${id.world0}/${id.generation}`;
}
function xyz(value) {
  if (Array.isArray(value)) return { x: value[0], y: value[1], z: value[2] };
  if (value && Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z)) {
    return { x: value.x, y: value.y, z: value.z };
  }
  throw new Error(`expected vec3, got ${JSON.stringify(value)}`);
}
function neg(v) { return { x: -v.x, y: -v.y, z: -v.z }; }
function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
function mean(values) { return values.reduce((sum, value) => sum + value, 0) / values.length; }
function sampleAt(rows, index) {
  const row = rows[Math.min(index, rows.length - 1)];
  return row ? {
    stepOffset: index,
    speed: row.frame.drive.forwardSpeedMetersPerSecond,
    worldContacts: row.frame.worldContacts,
    preSolveCalls: row.preSolve.calls,
    preSolveAccepted: row.preSolve.accepted,
    preSolveRejected: row.preSolve.rejected,
  } : null;
}

let capturedWorldId = null;
const torusShapes = new Map();
const originalCreateWorld = b3.b3CreateWorld;
const originalCreateCapsuleShape = b3.b3CreateCapsuleShape;
try {
  b3.b3CreateWorld = (worldDef) => {
    const worldId = originalCreateWorld(worldDef);
    if (capturedWorldId !== null) throw new Error('diagnostic expected exactly one Box3D world');
    capturedWorldId = worldId;
    return worldId;
  };
  b3.b3CreateCapsuleShape = (bodyId, shapeDef, capsule) => {
    const shapeId = originalCreateCapsuleShape(bodyId, shapeDef, capsule);
    torusShapes.set(idKey(shapeId), { shapeId, bodyId, capsule });
    return shapeId;
  };
} catch (error) {
  throw new Error(`failed to install diagnostic creation interceptors: ${error}`);
}

let world = null;
try {
  world = new M6TopologyWorld(b3, receipt);
  const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 41);
  if (capturedWorldId === null) throw new Error('failed to capture Box3D world id');
  if (torusShapes.size !== 4 * MODE5_CORE_TORUS_SEGMENTS) {
    throw new Error(`expected ${4 * MODE5_CORE_TORUS_SEGMENTS} torus capsules, captured ${torusShapes.size}`);
  }

  // Stop intercepting after construction. The experiment changes no runtime creation semantics.
  b3.b3CreateWorld = originalCreateWorld;
  b3.b3CreateCapsuleShape = originalCreateCapsuleShape;

  for (const { shapeId } of torusShapes.values()) {
    b3.b3Shape_EnablePreSolveEvents(shapeId, true);
    if (!b3.b3Shape_ArePreSolveEventsEnabled(shapeId)) {
      throw new Error(`failed to enable pre-solve on torus shape ${idKey(shapeId)}`);
    }
  }

  const segmentStep = (2 * Math.PI) / MODE5_CORE_TORUS_SEGMENTS;
  const threshold = mode === 'NEAREST1'
    ? 0.5 * segmentStep + 1e-6
    : mode === 'NEAREST3'
      ? 1.5 * segmentStep + 1e-6
      : Infinity;

  let stepStats = { calls: 0, accepted: 0, rejected: 0, angleMin: Infinity, angleMax: -Infinity };
  let firstCallback = null;
  b3.b3World_SetPreSolveCallback(capturedWorldId, (...args) => {
    if (args.length < 4) throw new Error(`unexpected pre-solve arg count ${args.length}`);
    const [shapeIdA, shapeIdB, pointRaw, normalRaw] = args;
    const recordA = torusShapes.get(idKey(shapeIdA));
    const recordB = torusShapes.get(idKey(shapeIdB));
    if (recordA && recordB) throw new Error('unexpected torus self-contact reached pre-solve');
    if (!recordA && !recordB) return true;

    const wheelRecord = recordA ?? recordB;
    const wheelIsA = Boolean(recordA);
    const normal = xyz(normalRaw);
    const towardOtherWorld = wheelIsA ? normal : neg(normal);
    const towardOtherLocal = xyz(b3.b3Body_GetLocalVector(wheelRecord.bodyId, towardOtherWorld));
    const radialLength = Math.hypot(towardOtherLocal.x, towardOtherLocal.z);
    if (!(radialLength > 1e-8)) {
      // Pure axial contact cannot be represented by a circumferential sector choice.
      // Preserve it rather than manufacturing a rejection.
      stepStats.calls += 1;
      stepStats.accepted += 1;
      return true;
    }
    const supportX = towardOtherLocal.x / radialLength;
    const supportZ = towardOtherLocal.z / radialLength;
    const capsule = wheelRecord.capsule;
    const centerX = 0.5 * (capsule.center1.x + capsule.center2.x);
    const centerZ = 0.5 * (capsule.center1.z + capsule.center2.z);
    const centerLength = Math.hypot(centerX, centerZ);
    if (!(centerLength > 1e-8)) throw new Error('torus capsule center collapsed onto wheel axis');
    const sectorX = centerX / centerLength;
    const sectorZ = centerZ / centerLength;
    const angle = Math.acos(clamp(sectorX * supportX + sectorZ * supportZ, -1, 1));
    const allow = angle <= threshold;

    stepStats.calls += 1;
    stepStats.angleMin = Math.min(stepStats.angleMin, angle);
    stepStats.angleMax = Math.max(stepStats.angleMax, angle);
    if (allow) stepStats.accepted += 1;
    else stepStats.rejected += 1;
    if (firstCallback === null) {
      firstCallback = {
        argCount: args.length,
        point: pointRaw,
        normal,
        wheelIsA,
        towardOtherLocal,
        capsuleCenter: { x: centerX, z: centerZ },
        angle,
        threshold,
        allow,
      };
    }
    return allow;
  });

  function oneStep() {
    stepStats = { calls: 0, accepted: 0, rejected: 0, angleMin: Infinity, angleMax: -Infinity };
    const frame = world.step(1)[0];
    return {
      frame,
      preSolve: {
        calls: stepStats.calls,
        accepted: stepStats.accepted,
        rejected: stepStats.rejected,
        angleMin: Number.isFinite(stepStats.angleMin) ? stepStats.angleMin : null,
        angleMax: Number.isFinite(stepStats.angleMax) ? stepStats.angleMax : null,
      },
    };
  }

  const warmup = [];
  for (let i = 0; i < 360; i += 1) warmup.push(oneStep());
  if (firstCallback === null) throw new Error('pre-solve callback was never invoked during settle');

  vehicle.setDrive({ throttle: 0.35, brake: 0 });
  let launchSteps = 0;
  let launch = null;
  while (launchSteps < 2400) {
    launch = oneStep();
    launchSteps += 1;
    if (launch.frame.drive.forwardSpeedMetersPerSecond >= 4.0) break;
  }
  if (!launch || launch.frame.drive.forwardSpeedMetersPerSecond < 4.0) {
    throw new Error(`${mode} failed to reach matched coast speed: ${launch?.frame.drive.forwardSpeedMetersPerSecond}`);
  }

  vehicle.setDrive({ throttle: 0, brake: 0 });
  const coast = [];
  for (let i = 0; i < 600; i += 1) coast.push(oneStep());
  if (coast.some((row) => row.frame.drive.mode !== 'COAST')) throw new Error(`${mode} did not remain in COAST`);

  const start = coast[0].frame;
  const end = coast.at(-1).frame;
  const speeds = coast.map((row) => row.frame.drive.forwardSpeedMetersPerSecond);
  const active = coast.map((row) => row.preSolve.accepted);
  const rejected = coast.map((row) => row.preSolve.rejected);
  const calls = coast.map((row) => row.preSolve.calls);
  const worldContacts = coast.map((row) => row.frame.worldContacts);
  const distanceMeters = Math.hypot(
    end.chassisPosition.x - start.chassisPosition.x,
    end.chassisPosition.z - start.chassisPosition.z,
  );
  const thresholds = {};
  for (const fraction of [0.9, 0.75, 0.5, 0.25]) {
    const target = start.drive.forwardSpeedMetersPerSecond * fraction;
    const index = speeds.findIndex((speed) => speed <= target);
    thresholds[String(fraction)] = {
      targetSpeed: target,
      step: index < 0 ? null : index,
      timeSeconds: index < 0 ? null : (index + 1) / 60,
    };
  }

  const result = {
    mode,
    geometry: MODE5_WHEEL_GEOMETRY_VARIANT,
    crownRatio: MODE5_CORE_TORUS_CROWN_RATIO,
    torusSegments: MODE5_CORE_TORUS_SEGMENTS,
    capturedTorusShapes: torusShapes.size,
    selector: {
      segmentStepRadians: segmentStep,
      thresholdRadians: threshold,
      thresholdDegrees: Number.isFinite(threshold) ? threshold * 180 / Math.PI : null,
    },
    firstCallback,
    launch: {
      steps: launchSteps,
      speed: launch.frame.drive.forwardSpeedMetersPerSecond,
      worldContacts: launch.frame.worldContacts,
      preSolve: launch.preSolve,
    },
    coast: {
      startSpeed: start.drive.forwardSpeedMetersPerSecond,
      endSpeed: end.drive.forwardSpeedMetersPerSecond,
      speedRetention: end.drive.forwardSpeedMetersPerSecond / start.drive.forwardSpeedMetersPerSecond,
      distanceMeters,
      meanPreSolveCalls: mean(calls),
      meanAccepted: mean(active),
      minAccepted: Math.min(...active),
      maxAccepted: Math.max(...active),
      meanRejected: mean(rejected),
      meanWorldContacts: mean(worldContacts),
      minWorldContacts: Math.min(...worldContacts),
      maxWorldContacts: Math.max(...worldContacts),
      thresholds,
      samples: {
        s0: sampleAt(coast, 0),
        s1: sampleAt(coast, 59),
        s2: sampleAt(coast, 119),
        s4: sampleAt(coast, 239),
        s6: sampleAt(coast, 359),
        s8: sampleAt(coast, 479),
        s10: sampleAt(coast, 599),
      },
    },
  };
  console.log('TORUS_PRESOLVE_COASTDOWN', JSON.stringify(result));
  console.log('TORUS_PRESOLVE_COASTDOWN_OK');
} finally {
  try { b3.b3CreateWorld = originalCreateWorld; } catch {}
  try { b3.b3CreateCapsuleShape = originalCreateCapsuleShape; } catch {}
  if (world !== null) world.dispose();
}
