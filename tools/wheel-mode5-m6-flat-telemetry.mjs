import { readFile } from 'node:fs/promises';
import { validatePinnedNativeFactoryReceiptText } from '../.test-dist/config/native-factory-receipt.js';
import {
  Box3DBoundary,
  configureBox3DRuntimeVariant,
} from '../.test-dist/physics/box3d-boundary.js';
import {
  MODE5_CORE_TORUS_GEOMETRY,
  MODE5_WHEEL_GEOMETRY_VARIANT,
} from '../.test-dist/vehicle/m6/mode5-wheel-backend.js';

const label = process.env.JV_TELEMETRY_LABEL ?? 'unknown';
const expectedGeometry = process.env.JV_EXPECTED_GEOMETRY ?? null;
if (expectedGeometry !== null && MODE5_WHEEL_GEOMETRY_VARIANT !== expectedGeometry) {
  throw new Error(
    `compiled geometry mismatch for ${label}: expected ${expectedGeometry}, got ${MODE5_WHEEL_GEOMETRY_VARIANT}`,
  );
}

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(new URL('../public/receipts/jv_m6_factory_receipt.json', import.meta.url), 'utf8'),
);
configureBox3DRuntimeVariant('mode5-experiment');
const boundary = await Box3DBoundary.load();

function quantile(sorted, fraction) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * fraction;
  const lo = Math.floor(position);
  const hi = Math.ceil(position);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (position - lo);
}

function scalarStats(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const deltas = values.slice(1).map((value, index) => value - values[index]);
  const absDeltas = deltas.map(Math.abs).sort((a, b) => a - b);
  const second = deltas.slice(1).map((value, index) => value - deltas[index]);
  const absSecond = second.map(Math.abs).sort((a, b) => a - b);
  return {
    count: values.length,
    min: sorted[0],
    max: sorted.at(-1),
    range: sorted.at(-1) - sorted[0],
    mean,
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

function integerHistogram(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Object.fromEntries([...counts.entries()].sort((a, b) => Number(a[0]) - Number(b[0])));
}

function summarize(frames) {
  const cornerCount = frames[0]?.corners.length ?? 0;
  return {
    frames: frames.length,
    stepRange: [frames[0]?.stepIndex ?? null, frames.at(-1)?.stepIndex ?? null],
    backendIds: [...new Set(frames.map((frame) => frame.wheelBackendId))],
    chassisY: scalarStats(frames.map((frame) => frame.chassisPosition.y)),
    chassisVy: scalarStats(frames.map((frame) => frame.chassisVelocity.y)),
    chassisAngularSpeed: scalarStats(frames.map((frame) => Math.hypot(
      frame.chassisAngularVelocity.x,
      frame.chassisAngularVelocity.y,
      frame.chassisAngularVelocity.z,
    ))),
    worldContacts: scalarStats(frames.map((frame) => frame.worldContacts)),
    worldContactsHistogram: integerHistogram(frames.map((frame) => frame.worldContacts)),
    worldContactBegins: scalarStats(frames.map((frame) => frame.worldContactBegins)),
    contactBeginFrames: frames.filter((frame) => frame.worldContactBegins > 0).length,
    totalContactBegins: frames.reduce((sum, frame) => sum + frame.worldContactBegins, 0),
    forwardSpeed: scalarStats(frames.map((frame) => frame.drive.forwardSpeedMetersPerSecond)),
    motorTorqueTotal: scalarStats(frames.map((frame) => frame.drive.currentMotorTorqueTotal)),
    corners: Array.from({ length: cornerCount }, (_, index) => ({
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

function collect(world, count) {
  const frames = [];
  for (let i = 0; i < count; i += 1) {
    const frame = world.step(1)[0];
    if (!frame) throw new Error(`missing M6 trace at sample ${i}`);
    frames.push(frame);
  }
  return frames;
}

const world = boundary.createM6TopologyWorld(receipt);
try {
  const before = { ...world.counters };
  const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 31);
  const topologyDelta = {
    bodies: world.counters.bodyCount - before.bodyCount,
    joints: world.counters.jointCount - before.jointCount,
    shapes: world.counters.shapeCount - before.shapeCount,
  };

  // Let the suspension and wheel contacts settle well before measuring quiet-state ripple.
  collect(world, 360);
  const settleFrames = collect(world, 360);

  vehicle.setDrive({ throttle: 0.35, brake: 0 });
  // Exclude launch transient from rolling-quality measurement.
  collect(world, 180);
  const driveFrames = collect(world, 480);

  const start = driveFrames[0].chassisPosition;
  const end = driveFrames.at(-1).chassisPosition;
  const travel = Math.hypot(end.x - start.x, end.z - start.z);
  const result = {
    label,
    compiledGeometry: MODE5_WHEEL_GEOMETRY_VARIANT,
    isTorus: MODE5_WHEEL_GEOMETRY_VARIANT === MODE5_CORE_TORUS_GEOMETRY,
    topologyDelta,
    vehicleTopologyCounts: vehicle.topologyCounts,
    travelMetersDuringMeasuredDrive: travel,
    settle: summarize(settleFrames),
    drive: summarize(driveFrames),
  };

  for (const phase of [result.settle, result.drive]) {
    if (phase.backendIds.length !== 1) {
      throw new Error(`${label} backend changed during telemetry: ${phase.backendIds.join(',')}`);
    }
    for (const metric of [phase.chassisY, phase.chassisVy, phase.worldContacts, phase.forwardSpeed]) {
      if (!metric || !Number.isFinite(metric.mean) || !Number.isFinite(metric.stddev)) {
        throw new Error(`${label} produced non-finite telemetry`);
      }
    }
  }
  if (!(travel > 0.25)) {
    throw new Error(`${label} did not establish a meaningful measured drive: ${travel}`);
  }
  console.log('M6_FLAT_TELEMETRY_RESULT', JSON.stringify(result));
  console.log('M6_FLAT_TELEMETRY_OK');
} finally {
  world.dispose();
}
