import assert from 'node:assert/strict';
import fs from 'node:fs';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const mode = process.argv[2] ?? 'observe';
const outputPath = process.argv[3] ?? null;
const referencePath = process.argv[4] ?? null;
const b3 = await Box3D();

assert.equal(typeof b3.e2a2sRunBiasedFlatP75GroundCarrier, 'function', 'E2a2s biased-separation runner missing');
assert.equal(typeof b3.e2a2iRunMatchedSphereSpinAxisControl, 'function', 'E2a2i matched-sphere control missing');
assert.equal(typeof b3.e2a2qResetPairSolveCounter, 'function', 'E2a2q pair counter reset missing');
assert.equal(typeof b3.e2a2qGetPairSolveCounter, 'function', 'E2a2q pair counter getter missing');

const SUPPORT_BIAS = 0.010;

function compactWheel(run) {
  const sepDelta = Math.abs(run.settledHighFeatureSeparationMean - run.settledLowFeatureSeparationMean);
  return {
    valid: run.valid,
    requestedSupportBias: run.requestedSupportBias,
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
    settledPairGeometrySamples: run.settledPairGeometrySamples,
    settledFeaturePairStable: run.settledFeaturePairStable,
    settledLowFeatureId: run.settledLowFeatureId,
    settledHighFeatureId: run.settledHighFeatureId,
    settledLowFeatureSeparationMean: run.settledLowFeatureSeparationMean,
    settledHighFeatureSeparationMean: run.settledHighFeatureSeparationMean,
    settledSeparationDelta: sepDelta,
    settledLowFeatureNormalImpulseMean: run.settledLowFeatureNormalImpulseMean,
    settledHighFeatureNormalImpulseMean: run.settledHighFeatureNormalImpulseMean,
    finalY: run.finalY,
    finalVy: run.finalVy,
    finalAngularX: run.finalAngularX,
    finalAngularY: run.finalAngularY,
    finalAngularZ: run.finalAngularZ,
    finalAxisTiltDeg: run.finalAxisTiltDeg,
    uniqueFeatureIds: run.uniqueFeatureIds,
  };
}

function runWheel(bias, spin, label) {
  b3.e2a2qResetPairSolveCounter();
  const raw = b3.e2a2sRunBiasedFlatP75GroundCarrier(0, spin, true, bias);
  const pairSolveCalls = b3.e2a2qGetPairSolveCounter();
  assert.equal(raw.valid, true, `${label}: invalid wheel run`);
  assert.ok(Math.abs(raw.requestedSupportBias - bias) < 1e-6, `${label}: support bias not applied`);
  assert.equal(raw.contactDropoutsAfterImpulse, 0, `${label}: contact dropout`);
  assert.equal(raw.minPointCountAfterImpulse, 2, `${label}: left two-point manifold regime`);
  assert.equal(raw.maxPointCountAfterImpulse, 2, `${label}: unexpected point count`);
  assert.equal(raw.settledFeaturePairStable, true, `${label}: settled feature pair changed`);
  assert.ok(raw.settledPairGeometrySamples > 0, `${label}: no settled pair geometry samples`);
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
    separationDelta0Mm: a0.settledSeparationDelta * 1000,
    separationDelta40Mm: a40.settledSeparationDelta * 1000,
    lowImpulse0: a0.settledLowFeatureNormalImpulseMean,
    highImpulse0: a0.settledHighFeatureNormalImpulseMean,
    lowImpulse40: a40.settledLowFeatureNormalImpulseMean,
    highImpulse40: a40.settledHighFeatureNormalImpulseMean,
    finalAxisTiltDeg40: a40.finalAxisTiltDeg,
    finalAngularX40: a40.finalAngularX,
    finalAngularY40: a40.finalAngularY,
    finalAngularZ40: a40.finalAngularZ,
    featureSignatureEqual: JSON.stringify(a0.uniqueFeatureIds) === JSON.stringify(a40.uniqueFeatureIds),
  };
}

const equal0r = runWheel(0.0, 0, 'equal spin0');
const equal40r = runWheel(0.0, 40, 'equal spin40');
const biased0r = runWheel(SUPPORT_BIAS, 0, 'biased spin0');
const biased40r = runWheel(SUPPORT_BIAS, 40, 'biased spin40');
const sphere0 = runSphere(0);
const sphere40 = runSphere(40);

const equal0 = equal0r.run;
const equal40 = equal40r.run;
const biased0 = biased0r.run;
const biased40 = biased40r.run;

assert.ok(equal0.settledSeparationDelta < 0.0001, `equal spin0 separation unexpectedly asymmetric: ${equal0.settledSeparationDelta}`);
assert.ok(equal40.settledSeparationDelta < 0.0001, `equal spin40 separation unexpectedly asymmetric: ${equal40.settledSeparationDelta}`);
assert.ok(biased0.settledSeparationDelta > 0.005, `biased spin0 separation delta too small: ${biased0.settledSeparationDelta}`);
assert.ok(biased40.settledSeparationDelta > 0.005, `biased spin40 separation delta too small: ${biased40.settledSeparationDelta}`);
assert.ok(biased0.settledSeparationDelta < 0.0195, `biased spin0 exceeded intended speculative window: ${biased0.settledSeparationDelta}`);
assert.ok(biased40.settledSeparationDelta < 0.0195, `biased spin40 exceeded intended speculative window: ${biased40.settledSeparationDelta}`);

const result = {
  mode,
  scope: 'E2a2s unequal-separation two-point falsifier: validated E2a2q coupled block solve, horizontal plane, X/Y angular lock, friction=0. Diagnostic carrier retracts only +Z P75 support endpoint by 10 mm while preserving support span and max radius. Canonical vs point-reversed comparison with equal-height and matched-sphere controls.',
  supportBiasMeters: SUPPORT_BIAS,
  equalComparison: spinComparison(equal0, equal40),
  biasedComparison: spinComparison(biased0, biased40),
  equal0,
  equal40,
  biased0,
  biased40,
  pairSolveUsage: {
    equal0: equal0r.pairSolveCalls,
    equal40: equal40r.pairSolveCalls,
    biased0: biased0r.pairSolveCalls,
    biased40: biased40r.pairSolveCalls,
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
    equalFinalY0: result.equal0.finalY - reference.equal0.finalY,
    equalFinalY40: result.equal40.finalY - reference.equal40.finalY,
    biasedFinalY0: result.biased0.finalY - reference.biased0.finalY,
    biasedFinalY40: result.biased40.finalY - reference.biased40.finalY,
    biasedFinalVy0: result.biased0.finalVy - reference.biased0.finalVy,
    biasedFinalVy40: result.biased40.finalVy - reference.biased40.finalVy,
    biasedAngularX0: result.biased0.finalAngularX - reference.biased0.finalAngularX,
    biasedAngularX40: result.biased40.finalAngularX - reference.biased40.finalAngularX,
    biasedAngularY0: result.biased0.finalAngularY - reference.biased0.finalAngularY,
    biasedAngularY40: result.biased40.finalAngularY - reference.biased40.finalAngularY,
    biasedAxisTilt0: result.biased0.finalAxisTiltDeg - reference.biased0.finalAxisTiltDeg,
    biasedAxisTilt40: result.biased40.finalAxisTiltDeg - reference.biased40.finalAxisTiltDeg,
    biasedLowSeparation0: result.biased0.settledLowFeatureSeparationMean - reference.biased0.settledLowFeatureSeparationMean,
    biasedHighSeparation0: result.biased0.settledHighFeatureSeparationMean - reference.biased0.settledHighFeatureSeparationMean,
    biasedLowSeparation40: result.biased40.settledLowFeatureSeparationMean - reference.biased40.settledLowFeatureSeparationMean,
    biasedHighSeparation40: result.biased40.settledHighFeatureSeparationMean - reference.biased40.settledHighFeatureSeparationMean,
    biasedSeparationDelta0: result.biased0.settledSeparationDelta - reference.biased0.settledSeparationDelta,
    biasedSeparationDelta40: result.biased40.settledSeparationDelta - reference.biased40.settledSeparationDelta,
    biasedLowImpulse0: result.biased0.settledLowFeatureNormalImpulseMean - reference.biased0.settledLowFeatureNormalImpulseMean,
    biasedHighImpulse0: result.biased0.settledHighFeatureNormalImpulseMean - reference.biased0.settledHighFeatureNormalImpulseMean,
    biasedLowImpulse40: result.biased40.settledLowFeatureNormalImpulseMean - reference.biased40.settledLowFeatureNormalImpulseMean,
    biasedHighImpulse40: result.biased40.settledHighFeatureNormalImpulseMean - reference.biased40.settledHighFeatureNormalImpulseMean,
    biasedImpulseMean0: result.biased0.settledTotalImpulseMean - reference.biased0.settledTotalImpulseMean,
    biasedImpulseMean40: result.biased40.settledTotalImpulseMean - reference.biased40.settledTotalImpulseMean,
  };
}

if (outputPath) {
  fs.writeFileSync(outputPath, `${JSON.stringify(result)}\n`, 'utf8');
}

console.log(`E2A2S_UNEQUAL_SEPARATION_RESULT ${JSON.stringify(result)}`);
console.log(`E2A2S_UNEQUAL_SEPARATION_EXECUTED ${mode}`);
