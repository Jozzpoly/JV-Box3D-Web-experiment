import assert from 'node:assert/strict';
import fs from 'node:fs';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const mode = process.argv[2] ?? 'observe';
const receiptPath = process.argv[3] ?? null;
const b3 = await Box3D();

assert.equal(typeof b3.e2a2RunFlatP75GroundCarrier, 'function', 'E2a2 real-wheel runner missing');
assert.equal(typeof b3.e2a2iRunMatchedSphereSpinAxisControl, 'function', 'E2a2i sphere control missing');

const dt = 1 / 240;
const stepCount = 480;

function compactWheel(run) {
  return {
    valid: run.valid,
    firstContactStep: run.firstContactStep,
    firstImpulseStep: run.firstImpulseStep,
    contactDropoutsAfterImpulse: run.contactDropoutsAfterImpulse,
    featureSetChangesAfterImpulse: run.featureSetChangesAfterImpulse,
    contactIdChangesAfterImpulse: run.contactIdChangesAfterImpulse,
    minPointCountAfterImpulse: run.minPointCountAfterImpulse,
    maxPointCountAfterImpulse: run.maxPointCountAfterImpulse,
    settledYRange: run.settledYRange,
    settledMaxAbsVy: run.settledMaxAbsVy,
    settledTotalImpulseMean: run.settledTotalImpulseMean,
    settledTotalImpulseStd: run.settledTotalImpulseStd,
    settledTotalImpulseMin: run.settledTotalImpulseMin,
    settledTotalImpulseMax: run.settledTotalImpulseMax,
    settledMinAngularZ: run.settledMinAngularZ,
    settledMaxAngularZ: run.settledMaxAngularZ,
    finalY: run.finalY,
    finalVy: run.finalVy,
    finalAngularZ: run.finalAngularZ,
    uniqueFeatureIds: run.uniqueFeatureIds,
  };
}

function runWheel(spin) {
  const run = b3.e2a2RunFlatP75GroundCarrier(0, spin, true);
  assert.equal(run.valid, true, `real wheel invalid at spin=${spin}`);
  assert.ok(run.firstImpulseStep >= 0, `real wheel never generated an impulse at spin=${spin}`);
  assert.equal(run.contactDropoutsAfterImpulse, 0, `real wheel contact dropout at spin=${spin}`);
  assert.equal(run.minPointCountAfterImpulse, 2, `real wheel support segment collapsed at spin=${spin}`);
  assert.equal(run.maxPointCountAfterImpulse, 2, `real wheel manifold topology changed at spin=${spin}`);
  return compactWheel(run);
}

function compactSphere(run) {
  return {
    valid: run.valid,
    spinAxis: run.spinAxis,
    spinRadiansPerSecond: run.spinRadiansPerSecond,
    subStepCount: run.subStepCount,
    firstContactStep: run.firstContactStep,
    firstImpulseStep: run.firstImpulseStep,
    contactDropoutsAfterImpulse: run.contactDropoutsAfterImpulse,
    featureSetChangesAfterImpulse: run.featureSetChangesAfterImpulse,
    contactIdChangesAfterImpulse: run.contactIdChangesAfterImpulse,
    minPointCountAfterImpulse: run.minPointCountAfterImpulse,
    maxPointCountAfterImpulse: run.maxPointCountAfterImpulse,
    settledTotalImpulseMean: run.settledTotalImpulseMean,
    settledFinalImpulseMean: run.settledFinalImpulseMean,
    settledYRange: run.settledYRange,
    settledMaxAbsVy: run.settledMaxAbsVy,
    finalY: run.finalY,
    finalVy: run.finalVy,
    finalAngularX: run.finalAngularX,
    finalAngularY: run.finalAngularY,
    finalAngularZ: run.finalAngularZ,
  };
}

function runSphere(spin, substeps, axis) {
  const run = b3.e2a2iRunMatchedSphereSpinAxisControl(
    0,
    spin,
    true,
    true,
    dt,
    stepCount,
    substeps,
    0.0,
    true,
    2,
    axis,
  );
  assert.equal(run.valid, true, `sphere invalid spin=${spin} substeps=${substeps} axis=${axis}`);
  assert.equal(run.shapeControl, 'matchedSphere');
  assert.equal(run.contactDropoutsAfterImpulse, 0);
  assert.equal(run.minPointCountAfterImpulse, 1);
  assert.equal(run.maxPointCountAfterImpulse, 1);
  assert.ok(run.firstImpulseStep >= 0);
  return compactSphere(run);
}

const wheelSpin0 = runWheel(0);
const wheelSpin40 = runWheel(40);

const sphereMatrix = [];
for (const substeps of [1, 4]) {
  sphereMatrix.push(runSphere(0, substeps, 2));
  for (const axis of [0, 1, 2]) {
    sphereMatrix.push(runSphere(40, substeps, axis));
  }
}

const wheelComparison = {
  finalYDeltaMm: (wheelSpin40.finalY - wheelSpin0.finalY) * 1000,
  finalVyDelta: wheelSpin40.finalVy - wheelSpin0.finalVy,
  totalImpulseRatio40to0: wheelSpin40.settledTotalImpulseMean / wheelSpin0.settledTotalImpulseMean,
  settledYRangeDeltaMm: (wheelSpin40.settledYRange - wheelSpin0.settledYRange) * 1000,
  finalAngularZ40: wheelSpin40.finalAngularZ,
  featureSetChanges40: wheelSpin40.featureSetChangesAfterImpulse,
  contactIdChanges40: wheelSpin40.contactIdChangesAfterImpulse,
  featureSignatureEqual: JSON.stringify(wheelSpin40.uniqueFeatureIds) === JSON.stringify(wheelSpin0.uniqueFeatureIds),
};

const result = {
  mode,
  scope: 'E2a2l real two-point P75 b3Wheel pure axial Z spin plus ordinary matched-sphere identity matrix; friction=0, 2 s rollout. Wheel-symmetry intervention changes separation geometry only for b3_wheelShape lanes.',
  dt,
  stepCount,
  wheelComparison,
  wheelSpin0,
  wheelSpin40,
  sphereMatrix,
};

if (mode === 'baseline-pinned') {
  if (!receiptPath) throw new Error('baseline-pinned requires receipt path');
  fs.writeFileSync(receiptPath, `${JSON.stringify(result)}\n`, 'utf8');
} else if (mode === 'wheel-symmetry-axis') {
  if (!receiptPath) throw new Error('wheel-symmetry-axis requires baseline receipt path');
  const baseline = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));

  // Identity controls only. These assertions do not require the spin40 wheel to
  // improve; they prove that zero-roll wheel state and all ordinary sphere lanes
  // are unchanged by the wheel-scoped separation experiment.
  assert.deepEqual(result.wheelSpin0, baseline.wheelSpin0,
    'E2a2l changed the zero-spin real-wheel control');
  assert.deepEqual(result.sphereMatrix, baseline.sphereMatrix,
    'E2a2l changed ordinary matched-sphere solver behavior');
}

console.log(`E2A2L_WHEEL_SYMMETRY_RESULT ${JSON.stringify(result)}`);
console.log(`E2A2L_WHEEL_SYMMETRY_EXECUTED ${mode}`);
