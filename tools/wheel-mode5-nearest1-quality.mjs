import { readFile } from 'node:fs/promises';
import { validatePinnedNativeFactoryReceiptText } from '../.test-dist/config/native-factory-receipt.js';
import { loadMode5Box3DModule } from '../.test-dist/physics/mode5-box3d-runtime.js';
import { M6TopologyWorld } from '../.test-dist/vehicle/m6/m6-topology-world.js';
import {
  MODE5_CORE_TORUS_CROWN_RATIO,
  MODE5_CORE_TORUS_GEOMETRY,
  MODE5_CORE_TORUS_SEGMENTS,
  MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
  MODE5_WHEEL_GEOMETRY_VARIANT,
} from '../.test-dist/vehicle/m6/mode5-wheel-backend.js';

const mode = process.env.JV_QUALITY_MODE ?? 'C';
if (!['C', 'NEAREST1'].includes(mode)) throw new Error(`unknown quality mode ${mode}`);
const expectedGeometry = mode === 'C' ? MODE5_SOLVER_AWARE_PROFILE_GEOMETRY : MODE5_CORE_TORUS_GEOMETRY;
if (MODE5_WHEEL_GEOMETRY_VARIANT !== expectedGeometry) {
  throw new Error(`${mode} compiled geometry mismatch: expected ${expectedGeometry}, got ${MODE5_WHEEL_GEOMETRY_VARIANT}`);
}
if (mode === 'NEAREST1' && Math.abs(MODE5_CORE_TORUS_CROWN_RATIO - 0.65) > 1e-12) {
  throw new Error(`NEAREST1 expected T65 crown ratio, got ${MODE5_CORE_TORUS_CROWN_RATIO}`);
}

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile('public/receipts/jv_m6_factory_receipt.json', 'utf8'),
);
const b3 = await loadMode5Box3DModule();

function idKey(id) { return `${id.index1}/${id.world0}/${id.generation}`; }
function xyz(value) {
  if (Array.isArray(value)) return { x: value[0], y: value[1], z: value[2] };
  return { x: value.x, y: value.y, z: value.z };
}
function neg(v) { return { x: -v.x, y: -v.y, z: -v.z }; }
function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
function mean(values) { return values.reduce((sum, value) => sum + value, 0) / values.length; }
function quantile(sorted, fraction) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * fraction;
  const lo = Math.floor(position), hi = Math.ceil(position);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (position - lo);
}
function scalarStats(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const average = mean(values);
  const variance = mean(values.map((value) => (value - average) ** 2));
  const deltas = values.slice(1).map((value, index) => value - values[index]);
  const absDeltas = deltas.map(Math.abs).sort((a, b) => a - b);
  const second = deltas.slice(1).map((value, index) => value - deltas[index]);
  const absSecond = second.map(Math.abs).sort((a, b) => a - b);
  return {
    count: values.length,
    min: sorted[0],
    max: sorted.at(-1),
    range: sorted.at(-1) - sorted[0],
    mean: average,
    stddev: Math.sqrt(variance),
    p05: quantile(sorted, 0.05),
    p50: quantile(sorted, 0.5),
    p95: quantile(sorted, 0.95),
    deltaAbsP50: quantile(absDeltas, 0.5),
    deltaAbsP95: quantile(absDeltas, 0.95),
    deltaAbsMax: absDeltas.at(-1) ?? 0,
    secondDeltaAbsP95: quantile(absSecond, 0.95),
    secondDeltaAbsMax: absSecond.at(-1) ?? 0,
  };
}
function summarizeFrames(rows) {
  const frames = rows.map((row) => row.frame);
  return {
    frames: frames.length,
    chassisY: scalarStats(frames.map((frame) => frame.chassisPosition.y)),
    chassisVy: scalarStats(frames.map((frame) => frame.chassisVelocity.y)),
    chassisAngularSpeed: scalarStats(frames.map((frame) => Math.hypot(
      frame.chassisAngularVelocity.x,
      frame.chassisAngularVelocity.y,
      frame.chassisAngularVelocity.z,
    ))),
    forwardSpeed: scalarStats(frames.map((frame) => frame.drive.forwardSpeedMetersPerSecond)),
    motorTorqueTotal: scalarStats(frames.map((frame) => frame.drive.currentMotorTorqueTotal)),
    worldContacts: scalarStats(frames.map((frame) => frame.worldContacts)),
    preSolveAccepted: scalarStats(rows.map((row) => row.preSolve.accepted)),
    preSolveRejected: scalarStats(rows.map((row) => row.preSolve.rejected)),
    corners: Array.from({ length: frames[0].corners.length }, (_, index) => ({
      index,
      wheelY: scalarStats(frames.map((frame) => frame.corners[index].wheelPosition.y)),
      wheelVy: scalarStats(frames.map((frame) => frame.corners[index].wheelVelocity.y)),
      wheelSpeed: scalarStats(frames.map((frame) => Math.hypot(
        frame.corners[index].wheelVelocity.x,
        frame.corners[index].wheelVelocity.y,
        frame.corners[index].wheelVelocity.z,
      ))),
      wheelSpinSpeed: scalarStats(frames.map((frame) => frame.corners[index].wheelSpinSpeed)),
      coiloverLength: scalarStats(frames.map((frame) => frame.corners[index].coiloverLength)),
      driveMotorTorque: scalarStats(frames.map((frame) => frame.corners[index].driveMotorTorque)),
    })),
  };
}

let capturedWorldId = null;
const torusShapes = new Map();
const originalCreateWorld = b3.b3CreateWorld;
const originalCreateCapsuleShape = b3.b3CreateCapsuleShape;
if (mode === 'NEAREST1') {
  b3.b3CreateWorld = (worldDef) => {
    const worldId = originalCreateWorld(worldDef);
    if (capturedWorldId !== null) throw new Error('expected one diagnostic world');
    capturedWorldId = worldId;
    return worldId;
  };
  b3.b3CreateCapsuleShape = (bodyId, shapeDef, capsule) => {
    const shapeId = originalCreateCapsuleShape(bodyId, shapeDef, capsule);
    const cx = 0.5 * (capsule.center1.x + capsule.center2.x);
    const cz = 0.5 * (capsule.center1.z + capsule.center2.z);
    let angle = Math.atan2(cz, cx);
    if (angle < 0) angle += 2 * Math.PI;
    const sector = Math.round(angle / (2 * Math.PI / MODE5_CORE_TORUS_SEGMENTS)) % MODE5_CORE_TORUS_SEGMENTS;
    torusShapes.set(idKey(shapeId), { shapeId, bodyId, capsule, sector });
    return shapeId;
  };
}

let world = null;
try {
  world = new M6TopologyWorld(b3, receipt);
  const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 51);
  b3.b3CreateWorld = originalCreateWorld;
  b3.b3CreateCapsuleShape = originalCreateCapsuleShape;

  let currentStep = { calls: 0, accepted: 0, rejected: 0, acceptedByBody: new Map() };
  if (mode === 'NEAREST1') {
    if (capturedWorldId === null) throw new Error('failed to capture T65 world id');
    if (torusShapes.size !== 4 * MODE5_CORE_TORUS_SEGMENTS) {
      throw new Error(`expected 256 T65 capsules, captured ${torusShapes.size}`);
    }
    for (const { shapeId } of torusShapes.values()) b3.b3Shape_EnablePreSolveEvents(shapeId, true);
    const segmentStep = 2 * Math.PI / MODE5_CORE_TORUS_SEGMENTS;
    const threshold = 0.5 * segmentStep + 1e-6;
    b3.b3World_SetPreSolveCallback(capturedWorldId, (shapeIdA, shapeIdB, _point, normalRaw) => {
      const recordA = torusShapes.get(idKey(shapeIdA));
      const recordB = torusShapes.get(idKey(shapeIdB));
      if (!recordA && !recordB) return true;
      if (recordA && recordB) throw new Error('unexpected torus self-contact');
      const record = recordA ?? recordB;
      const wheelIsA = Boolean(recordA);
      const normal = xyz(normalRaw);
      const towardOtherWorld = wheelIsA ? normal : neg(normal);
      const local = xyz(b3.b3Body_GetLocalVector(record.bodyId, towardOtherWorld));
      const radialLength = Math.hypot(local.x, local.z);
      currentStep.calls += 1;
      if (!(radialLength > 1e-8)) {
        currentStep.accepted += 1;
        currentStep.acceptedByBody.set(idKey(record.bodyId), record.sector);
        return true;
      }
      const supportX = local.x / radialLength, supportZ = local.z / radialLength;
      const centerX = 0.5 * (record.capsule.center1.x + record.capsule.center2.x);
      const centerZ = 0.5 * (record.capsule.center1.z + record.capsule.center2.z);
      const centerLength = Math.hypot(centerX, centerZ);
      const angle = Math.acos(clamp(
        supportX * centerX / centerLength + supportZ * centerZ / centerLength,
        -1,
        1,
      ));
      const allow = angle <= threshold;
      if (allow) {
        currentStep.accepted += 1;
        const key = idKey(record.bodyId);
        if (currentStep.acceptedByBody.has(key) && currentStep.acceptedByBody.get(key) !== record.sector) {
          throw new Error(`NEAREST1 accepted multiple sectors for body ${key}`);
        }
        currentStep.acceptedByBody.set(key, record.sector);
      } else {
        currentStep.rejected += 1;
      }
      return allow;
    });
  }

  function oneStep() {
    currentStep = { calls: 0, accepted: 0, rejected: 0, acceptedByBody: new Map() };
    const frame = world.step(1)[0];
    if (!frame) throw new Error('missing M6 trace');
    return {
      frame,
      preSolve: {
        calls: currentStep.calls,
        accepted: currentStep.accepted,
        rejected: currentStep.rejected,
        sectors: Object.fromEntries([...currentStep.acceptedByBody.entries()].sort()),
      },
    };
  }
  function collect(count) {
    const rows = [];
    for (let i = 0; i < count; i += 1) rows.push(oneStep());
    return rows;
  }

  collect(360);
  const settleRows = collect(360);

  vehicle.setDrive({ throttle: 0.35, brake: 0 });
  let launchSteps = 0;
  let launch = null;
  while (launchSteps < 1800) {
    launch = oneStep();
    launchSteps += 1;
    if (launch.frame.drive.forwardSpeedMetersPerSecond >= 4.0) break;
  }
  if (!launch || launch.frame.drive.forwardSpeedMetersPerSecond < 4.0) {
    throw new Error(`${mode} failed to reach 4 m/s: ${launch?.frame.drive.forwardSpeedMetersPerSecond}`);
  }

  const holdThrottle = clamp(4.0 / world.config.maxDriveSpeed, 0, 1);
  vehicle.setDrive({ throttle: holdThrottle, brake: 0 });
  collect(180);
  const holdRows = collect(480);

  vehicle.setDrive({ throttle: 0, brake: 0 });
  const coastRows = collect(180);

  const sectorTelemetry = {};
  if (mode === 'NEAREST1') {
    const bodyKeys = [...new Set(holdRows.flatMap((row) => Object.keys(row.preSolve.sectors)))].sort();
    for (const key of bodyKeys) {
      const sequence = holdRows.map((row) => row.preSolve.sectors[key]).filter(Number.isInteger);
      let switches = 0;
      const jumpSizes = [];
      for (let i = 1; i < sequence.length; i += 1) {
        if (sequence[i] === sequence[i - 1]) continue;
        switches += 1;
        const raw = Math.abs(sequence[i] - sequence[i - 1]);
        jumpSizes.push(Math.min(raw, MODE5_CORE_TORUS_SEGMENTS - raw));
      }
      sectorTelemetry[key] = {
        samples: sequence.length,
        switches,
        switchesPerSecond: switches / (holdRows.length / 60),
        uniqueSectors: new Set(sequence).size,
        jumpSize: scalarStats(jumpSizes),
      };
    }
    if (holdRows.some((row) => row.preSolve.accepted !== 4)) {
      throw new Error('NEAREST1 did not keep exactly four active solver responses during hold telemetry');
    }
  }

  const start = holdRows[0].frame.chassisPosition;
  const end = holdRows.at(-1).frame.chassisPosition;
  const result = {
    mode,
    geometry: MODE5_WHEEL_GEOMETRY_VARIANT,
    crownRatio: mode === 'NEAREST1' ? MODE5_CORE_TORUS_CROWN_RATIO : null,
    launchSteps,
    launchSpeed: launch.frame.drive.forwardSpeedMetersPerSecond,
    holdThrottle,
    holdTravelMeters: Math.hypot(end.x - start.x, end.z - start.z),
    settle: summarizeFrames(settleRows),
    hold: summarizeFrames(holdRows),
    coast: summarizeFrames(coastRows),
    sectorTelemetry,
  };

  for (const phase of [result.settle, result.hold, result.coast]) {
    if (!phase.forwardSpeed || !Number.isFinite(phase.forwardSpeed.mean)) throw new Error(`${mode} non-finite phase telemetry`);
    for (const corner of phase.corners) {
      if (!Number.isFinite(corner.wheelY.mean) || !Number.isFinite(corner.wheelSpinSpeed.mean)) {
        throw new Error(`${mode} non-finite corner telemetry`);
      }
    }
  }
  console.log('NEAREST1_QUALITY_RESULT', JSON.stringify(result));
  console.log('NEAREST1_QUALITY_OK');
} finally {
  try { b3.b3CreateWorld = originalCreateWorld; } catch {}
  try { b3.b3CreateCapsuleShape = originalCreateCapsuleShape; } catch {}
  if (world !== null) world.dispose();
}
