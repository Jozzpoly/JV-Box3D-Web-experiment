import assert from 'node:assert/strict';
import fs from 'node:fs';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const mode = process.argv[2] ?? 'observe';
const outputPath = process.argv[3] ?? null;
const referencePath = process.argv[4] ?? null;
const b3 = await Box3D();

assert.equal(typeof b3.e2a2rRunFlatP75GroundCarrierComShifted, 'function', 'E2a2r COM-shift runner missing');
assert.equal(typeof b3.e2a2iRunMatchedSphereSpinAxisControl, 'function', 'E2a2i matched-sphere control missing');
assert.equal(typeof b3.e2a2qResetPairSolveCounter, 'function', 'E2a2q pair counter reset missing');
assert.equal(typeof b3.e2a2qGetPairSolveCounter, 'function', 'E2a2q pair counter getter missing');

const COM_SHIFT = 0.050;

function compactWheel(run) {
  const low = run.settledLowFeatureNormalImpulseMean;
  const high = run.settledHighFeatureNormalImpulseMean;
  const minLoad = Math.min(low, high);
  const maxLoad = Math.max(low, high);
  return {
    valid: run.valid,
    requestedComShiftZ: run.requestedComShiftZ,
    originalLocalCenterZ: run.originalLocalCenterZ,
    appliedLocalCenterZ: run.appliedLocalCenterZ,
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
    settledPairLoadSamples: run.settledPairLoadSamples,
    settledFeaturePairStable: run.settledFeaturePairStable,
    settledLowFeatureId: run.settledLowFeatureId,
    settledHighFeatureId: run.settledHighFeatureId,
    settledLowFeatureNormalImpulseMean: low,
    settledHighFeatureNormalImpulseMean: high,
    settledLoadSplitRatio: minLoad > 0 ? maxLoad / minLoad : Number.POSITIVE_INFINITY,
    finalY: run.finalY,
    finalVy: run.finalVy,
    finalAngularX: run.finalAngularX,
    finalAngularY: run.finalAngularY,
    finalAngularZ: run.finalAngularZ,
    finalAxisTiltDeg: run.finalAxisTiltDeg,
    uniqueFeatureIds: run.uniqueFeatureIds,
  };
}

function runWheel(shift, spin, label) {
  b3.e2a2qResetPairSolveCounter();
  const raw = b3.e2a2rRunFlatP75GroundCarrierComShifted(0, spin, true, shift);
  const pairSolveCalls = b3.e2a2qGetPairSolveCounter();
  assert.equal(raw.valid, true, `${label}: invalid wheel run`);
  assert.ok(Math.abs((raw.appliedLocalCenterZ - raw.originalLocalCenterZ) - shift) < 1e-6,
    `${label}: COM shift was not applied exactly`);
  assert.equal(raw.contactDropoutsAfterImpulse, 0, `${label}: contact dropout`);
  assert.equal(raw.minPointCountAfterImpulse, 2, `${label}: left two-point regime`);
  assert.equal(raw.maxPointCountAfterImpulse, 2, `${label}: unexpected point count`);
  assert.equal(raw.settledFeaturePairStable, true, `${label}: feature pair changed during settled load measurement`);
  assert.ok(raw.settledPairLoadSamples > 0, `${label}: no settled pair-load samples`);
  assert.ok(pairSolveCalls > 0, `${label}: coupled block path never executed`);
  return { run: compactWheel(raw), pairSolveCalls };
}

const dt = 1 / 240;
const stepCount = 480;
function runSphere(spin) {
  b3.e2a2qResetPairSolveCounter();
  const raw = b3.e2a2iRunMatchedSphereSpinAxisControl(
    0, spin, true, true, dt, stepCount, 4, 0.0, true, 2, 2,
  );
  const pairSolveCalls = b3.e2a2qGetPairSolveCounter();
  assert.equal(raw.valid, true);
  assert.equal(raw.shapeControl, 'matchedSphere');
  assert.equal(raw.contactDropoutsAfterImpulse, 0);
  assert.equal(raw.minPointCountAfterImpulse, 1);
  assert.equal(raw.maxPointCountAfterImpulse, 1);
  assert.equal(pairSolveCalls, 0, `sphere spin=${spin}: coupled pair path should not execute`);
  return {
    run: {
      spinRadiansPerSecond: raw.spinRadiansPerSecond,
      firstImpulseStep: raw.firstImpulseStep,
      settledTotalImpulseMean: raw.settledTotalImpulseMean,
      settledFinalImpulseMean: raw.settledFinalImpulseMean,
      settledYRange: raw.settledYRange,
      finalY: raw.finalY,
      finalVy: raw.finalVy,
      finalAngularZ: raw.finalAngularZ,
    },
    pairSolveCalls,
  };
}

function spinComparison(a0, a40) {
  return {
    finalYDeltaMm: (a40.finalY - a0.finalY) * 1000,
    finalVyDelta: a40.finalVy - a0.finalVy,
    totalImpulseRatio40to0: a40.settledTotalImpulseMean / a0.settledTotalImpulseMean,
    loadSplitRatio0: a0.settledLoadSplitRatio,
    loadSplitRatio40: a40.settledLoadSplitRatio,
    finalAxisTiltDeg40: a40.finalAxisTiltDeg,
    finalAngularX40: a40.finalAngularX,
    finalAngularY40: a40.finalAngularY,
    finalAngularZ40: a40.finalAngularZ,
    featureSignatureEqual: JSON.stringify(a0.uniqueFeatureIds) === JSON.stringify(a40.uniqueFeatureIds),
  };
}

const centered0r = runWheel(0.0, 0, 'centered spin0');
const centered40r = runWheel(0.0, 40, 'centered spin40');
const shifted0r = runWheel(COM_SHIFT, 0, 'shifted spin0');
const shifted40r = runWheel(COM_SHIFT, 40, 'shifted spin40');
const sphere0 = runSphere(0);
const sphere40 = runSphere(40);

const centered0 = centered0r.run;
const centered40 = centered40r.run;
const shifted0 = shifted0r.run;
const shifted40 = shifted40r.run;

assert.ok(centered0.settledLoadSplitRatio < 1.05, `centered spin0 unexpectedly asymmetric: ${centered0.settledLoadSplitRatio}`);
assert.ok(centered40.settledLoadSplitRatio < 1.05, `centered spin40 unexpectedly asymmetric: ${centered40.settledLoadSplitRatio}`);
assert.ok(shifted0.settledLoadSplitRatio > 1.25, `shifted spin0 did not create a meaningful load split: ${shifted0.settledLoadSplitRatio}`);
assert.ok(shifted40.settledLoadSplitRatio > 1.25, `shifted spin40 did not create a meaningful load split: ${shifted40.settledLoadSplitRatio}`);

const result = {
  mode,
  scope: 'E2a2r asymmetric two-point support falsifier: exact E2a2q coupled block solve, unchanged flat P75 carrier/ground/friction, body COM shifted +50 mm along wheel axis while preserving mass and inertia. Canonical vs point-reversed comparison with centered and matched-sphere controls.',
  comShiftMeters: COM_SHIFT,
  centeredComparison: spinComparison(centered0, centered40),
  shiftedComparison: spinComparison(shifted0, shifted40),
  centered0,
  centered40,
  shifted0,
  shifted40,
  loadSplitAmplification: {
    spin0: shifted0.settledLoadSplitRatio / centered0.settledLoadSplitRatio,
    spin40: shifted40.settledLoadSplitRatio / centered40.settledLoadSplitRatio,
  },
  pairSolveUsage: {
    centered0: centered0r.pairSolveCalls,
    centered40: centered40r.pairSolveCalls,
    shifted0: shifted0r.pairSolveCalls,
    shifted40: shifted40r.pairSolveCalls,
    sphere0: sphere0.pairSolveCalls,
    sphere40: sphere40.pairSolveCalls,
  },
  sphereControl: [sphere0.run, sphere40.run],
};

if (referencePath) {
  const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
  assert.deepEqual(result.sphereControl, reference.sphereControl,
    `${mode}: one-point matched-sphere behavior changed`);
  result.referenceMode = reference.mode;
  result.deltaFromReference = {
    centeredFinalY0: result.centered0.finalY - reference.centered0.finalY,
    centeredFinalY40: result.centered40.finalY - reference.centered40.finalY,
    shiftedFinalY0: result.shifted0.finalY - reference.shifted0.finalY,
    shiftedFinalY40: result.shifted40.finalY - reference.shifted40.finalY,
    shiftedFinalVy0: result.shifted0.finalVy - reference.shifted0.finalVy,
    shiftedFinalVy40: result.shifted40.finalVy - reference.shifted40.finalVy,
    shiftedAngularX0: result.shifted0.finalAngularX - reference.shifted0.finalAngularX,
    shiftedAngularX40: result.shifted40.finalAngularX - reference.shifted40.finalAngularX,
    shiftedAngularY0: result.shifted0.finalAngularY - reference.shifted0.finalAngularY,
    shiftedAngularY40: result.shifted40.finalAngularY - reference.shifted40.finalAngularY,
    shiftedAxisTilt0: result.shifted0.finalAxisTiltDeg - reference.shifted0.finalAxisTiltDeg,
    shiftedAxisTilt40: result.shifted40.finalAxisTiltDeg - reference.shifted40.finalAxisTiltDeg,
    shiftedLowImpulse0: result.shifted0.settledLowFeatureNormalImpulseMean - reference.shifted0.settledLowFeatureNormalImpulseMean,
    shiftedHighImpulse0: result.shifted0.settledHighFeatureNormalImpulseMean - reference.shifted0.settledHighFeatureNormalImpulseMean,
    shiftedLowImpulse40: result.shifted40.settledLowFeatureNormalImpulseMean - reference.shifted40.settledLowFeatureNormalImpulseMean,
    shiftedHighImpulse40: result.shifted40.settledHighFeatureNormalImpulseMean - reference.shifted40.settledHighFeatureNormalImpulseMean,
    shiftedLoadSplitRatio0: result.shifted0.settledLoadSplitRatio - reference.shifted0.settledLoadSplitRatio,
    shiftedLoadSplitRatio40: result.shifted40.settledLoadSplitRatio - reference.shifted40.settledLoadSplitRatio,
    shiftedImpulseMean0: result.shifted0.settledTotalImpulseMean - reference.shifted0.settledTotalImpulseMean,
    shiftedImpulseMean40: result.shifted40.settledTotalImpulseMean - reference.shifted40.settledTotalImpulseMean,
  };
}

if (outputPath) {
  fs.writeFileSync(outputPath, `${JSON.stringify(result)}\n`, 'utf8');
}

console.log(`E2A2R_ASYMMETRIC_COM_RESULT ${JSON.stringify(result)}`);
console.log(`E2A2R_ASYMMETRIC_COM_EXECUTED ${mode}`);
