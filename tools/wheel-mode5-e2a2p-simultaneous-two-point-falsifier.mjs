import assert from 'node:assert/strict';
import fs from 'node:fs';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const mode = process.argv[2] ?? 'observe';
const outputPath = process.argv[3] ?? null;
const referencePath = process.argv[4] ?? null;
const b3 = await Box3D();

assert.equal(typeof b3.e2a2RunFlatP75GroundCarrier, 'function', 'E2a2 real-wheel runner missing');
assert.equal(typeof b3.e2a2mRunFlatP75GroundCarrierTiltLocked, 'function', 'E2a2m tilt-locked runner missing');
assert.equal(typeof b3.e2a2iRunMatchedSphereSpinAxisControl, 'function', 'E2a2i matched-sphere control missing');

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
    maxNormalTiltDegAfterImpulse: run.maxNormalTiltDegAfterImpulse,
    settledYRange: run.settledYRange,
    settledMaxAbsVy: run.settledMaxAbsVy,
    settledTotalImpulseMean: run.settledTotalImpulseMean,
    settledTotalImpulseStd: run.settledTotalImpulseStd,
    finalY: run.finalY,
    finalVy: run.finalVy,
    finalAngularX: run.finalAngularX,
    finalAngularY: run.finalAngularY,
    finalAngularZ: run.finalAngularZ,
    finalAxisTiltDeg: run.finalAxisTiltDeg,
    uniqueFeatureIds: run.uniqueFeatureIds,
  };
}

function validateWheel(run, label) {
  assert.equal(run.valid, true, `${label}: invalid`);
  assert.ok(run.firstImpulseStep >= 0, `${label}: no impulse`);
  assert.equal(run.contactDropoutsAfterImpulse, 0, `${label}: contact dropout`);
  assert.ok(run.minPointCountAfterImpulse >= 1 && run.minPointCountAfterImpulse <= 2,
    `${label}: min point count outside 1..2`);
  assert.ok(run.maxPointCountAfterImpulse >= 1 && run.maxPointCountAfterImpulse <= 2,
    `${label}: max point count outside 1..2`);
}

function runWheel(fn, spin, label) {
  const run = fn(0, spin, true);
  validateWheel(run, `${label} spin=${spin}`);
  return compactWheel(run);
}

function compareWheel(spin0, spin40) {
  return {
    finalYDeltaMm: (spin40.finalY - spin0.finalY) * 1000,
    finalVyDelta: spin40.finalVy - spin0.finalVy,
    totalImpulseRatio40to0: spin40.settledTotalImpulseMean / spin0.settledTotalImpulseMean,
    settledYRangeDeltaMm: (spin40.settledYRange - spin0.settledYRange) * 1000,
    minPointCount0: spin0.minPointCountAfterImpulse,
    minPointCount40: spin40.minPointCountAfterImpulse,
    maxPointCount0: spin0.maxPointCountAfterImpulse,
    maxPointCount40: spin40.maxPointCountAfterImpulse,
    featureSetChanges40: spin40.featureSetChangesAfterImpulse,
    contactIdChanges40: spin40.contactIdChangesAfterImpulse,
    finalAxisTiltDeg40: spin40.finalAxisTiltDeg,
    finalAngularX40: spin40.finalAngularX,
    finalAngularY40: spin40.finalAngularY,
    finalAngularZ40: spin40.finalAngularZ,
    featureSignatureEqual: JSON.stringify(spin40.uniqueFeatureIds) === JSON.stringify(spin0.uniqueFeatureIds),
  };
}

const dt = 1 / 240;
const stepCount = 480;
function runSphere(spin, axis) {
  const run = b3.e2a2iRunMatchedSphereSpinAxisControl(
    0,
    spin,
    true,
    true,
    dt,
    stepCount,
    4,
    0.0,
    true,
    2,
    axis,
  );
  assert.equal(run.valid, true);
  assert.equal(run.shapeControl, 'matchedSphere');
  assert.equal(run.contactDropoutsAfterImpulse, 0);
  assert.equal(run.minPointCountAfterImpulse, 1);
  assert.equal(run.maxPointCountAfterImpulse, 1);
  return {
    spinAxis: run.spinAxis,
    spinRadiansPerSecond: run.spinRadiansPerSecond,
    firstImpulseStep: run.firstImpulseStep,
    settledTotalImpulseMean: run.settledTotalImpulseMean,
    settledFinalImpulseMean: run.settledFinalImpulseMean,
    settledYRange: run.settledYRange,
    settledMaxAbsVy: run.settledMaxAbsVy,
    finalY: run.finalY,
    finalVy: run.finalVy,
    finalAngularZ: run.finalAngularZ,
  };
}

const free0 = runWheel(b3.e2a2RunFlatP75GroundCarrier, 0, 'free');
const free40 = runWheel(b3.e2a2RunFlatP75GroundCarrier, 40, 'free');
const locked0 = runWheel(b3.e2a2mRunFlatP75GroundCarrierTiltLocked, 0, 'locked');
const locked40 = runWheel(b3.e2a2mRunFlatP75GroundCarrierTiltLocked, 40, 'locked');
const sphereControl = [runSphere(0, 2), runSphere(40, 2)];

const result = {
  mode,
  scope: 'E2a2p order-invariant simultaneous/Jacobi two-point normal-solve falsifier under E2a2k-r2 no-rot separation. Same P75 real wheel, friction=0, 2 s, 4 substeps. Includes X/Y-lock and one-point matched-sphere controls.',
  freeComparison: compareWheel(free0, free40),
  lockedComparison: compareWheel(locked0, locked40),
  free0,
  free40,
  locked0,
  locked40,
  sphereControl,
};

if (referencePath) {
  const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
  assert.deepEqual(result.sphereControl, reference.sphereControl,
    `${mode}: one-point matched-sphere behavior changed`);

  result.referenceMode = reference.mode;
  result.deltaFromReference = {
    freeFinalY: result.free40.finalY - reference.free40.finalY,
    freeFinalVy: result.free40.finalVy - reference.free40.finalVy,
    freeFinalAngularX: result.free40.finalAngularX - reference.free40.finalAngularX,
    freeFinalAngularY: result.free40.finalAngularY - reference.free40.finalAngularY,
    freeAxisTiltDeg: result.free40.finalAxisTiltDeg - reference.free40.finalAxisTiltDeg,
    freeImpulseMean: result.free40.settledTotalImpulseMean - reference.free40.settledTotalImpulseMean,
    lockedFinalY: result.locked40.finalY - reference.locked40.finalY,
    lockedImpulseMean: result.locked40.settledTotalImpulseMean - reference.locked40.settledTotalImpulseMean,
  };
}

if (outputPath) {
  fs.writeFileSync(outputPath, `${JSON.stringify(result)}\n`, 'utf8');
}

console.log(`E2A2P_SIMULTANEOUS_TWO_POINT_RESULT ${JSON.stringify(result)}`);
console.log(`E2A2P_SIMULTANEOUS_TWO_POINT_EXECUTED ${mode}`);
