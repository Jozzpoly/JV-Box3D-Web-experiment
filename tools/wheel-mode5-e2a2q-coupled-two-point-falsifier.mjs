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

const hasPairCounter =
  typeof b3.e2a2qResetPairSolveCounter === 'function'
  && typeof b3.e2a2qGetPairSolveCounter === 'function';
const isBlockMode = mode.startsWith('block-');
if (isBlockMode) {
  assert.equal(hasPairCounter, true, `${mode}: E2a2q pair-solve counter missing`);
}

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
  if (hasPairCounter) b3.e2a2qResetPairSolveCounter();
  const run = fn(0, spin, true);
  const pairSolveCalls = hasPairCounter ? b3.e2a2qGetPairSolveCounter() : null;
  validateWheel(run, `${label} spin=${spin}`);
  if (isBlockMode) {
    assert.ok(pairSolveCalls > 0, `${label} spin=${spin}: coupled pair path never executed`);
  }
  return { run: compactWheel(run), pairSolveCalls };
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
  if (hasPairCounter) b3.e2a2qResetPairSolveCounter();
  const run = b3.e2a2iRunMatchedSphereSpinAxisControl(
    0, spin, true, true, dt, stepCount, 4, 0.0, true, 2, axis,
  );
  const pairSolveCalls = hasPairCounter ? b3.e2a2qGetPairSolveCounter() : null;
  assert.equal(run.valid, true);
  assert.equal(run.shapeControl, 'matchedSphere');
  assert.equal(run.contactDropoutsAfterImpulse, 0);
  assert.equal(run.minPointCountAfterImpulse, 1);
  assert.equal(run.maxPointCountAfterImpulse, 1);
  if (isBlockMode) {
    assert.equal(pairSolveCalls, 0, `matched sphere spin=${spin}: coupled pair path should not execute`);
  }
  return {
    compact: {
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
    },
    pairSolveCalls,
  };
}

const free0r = runWheel(b3.e2a2RunFlatP75GroundCarrier, 0, 'free');
const free40r = runWheel(b3.e2a2RunFlatP75GroundCarrier, 40, 'free');
const locked0r = runWheel(b3.e2a2mRunFlatP75GroundCarrierTiltLocked, 0, 'locked');
const locked40r = runWheel(b3.e2a2mRunFlatP75GroundCarrierTiltLocked, 40, 'locked');
const sphere0 = runSphere(0, 2);
const sphere40 = runSphere(40, 2);

const free0 = free0r.run;
const free40 = free40r.run;
const locked0 = locked0r.run;
const locked40 = locked40r.run;
const sphereControl = [sphere0.compact, sphere40.compact];

const result = {
  mode,
  scope: 'E2a2q coupled 2x2 normal mini-LCP falsifier under E2a2k-r2 no-rot separation. Sequential/Jacobi/block/reversed are built from the same pinned source. Friction=0, 2 s, 4 substeps. Includes X/Y-lock and one-point matched-sphere controls.',
  freeComparison: compareWheel(free0, free40),
  lockedComparison: compareWheel(locked0, locked40),
  free0,
  free40,
  locked0,
  locked40,
  sphereControl,
  pairSolveUsage: hasPairCounter ? {
    free0: free0r.pairSolveCalls,
    free40: free40r.pairSolveCalls,
    locked0: locked0r.pairSolveCalls,
    locked40: locked40r.pairSolveCalls,
    sphere0: sphere0.pairSolveCalls,
    sphere40: sphere40.pairSolveCalls,
  } : null,
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

console.log(`E2A2Q_COUPLED_TWO_POINT_RESULT ${JSON.stringify(result)}`);
console.log(`E2A2Q_COUPLED_TWO_POINT_EXECUTED ${mode}`);
