import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [resultPath] = process.argv.slice(2);
if (!resultPath) throw new Error('usage: node wheel-mode5-rq2c4f-rolling-pair-closure-validate.mjs <result.json>');
const result = JSON.parse(await readFile(resultPath, 'utf8'));

assert.equal(result.schemaVersion, 1, 'unsupported RQ2C4F schema');
assert.equal(result.method, 'RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION', 'method drifted');
assert.equal(result.dependencies?.box3dJs, '2617a0ff763a60c9f17cee57c6ea72aab75a5077', 'Box3D.js pin drifted');
assert.equal(result.dependencies?.vendorBox3d, '8441b4a06d6d09dcfb0b0f704df4d847d1437b92', 'vendor Box3D pin drifted');
assert.equal(result.dependencies?.rq2c4eExecutedSource, '14b500c7f174c7107316fd9b31ef92b74964f501', 'RQ2C4E source drifted');
assert.equal(result.instrument?.physicsMutation, false, 'RQ2C4F must remain read-only');
assert.equal(result.instrument?.yawDegrees, 0, 'RQ2C4F must remain 0deg-only');
assert.equal(result.instrument?.symmetricProductSplit, true, 'symmetric product split required');

const failures = [];
const finiteTree = (value, path = 'result') => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) failures.push(`${path}: non-finite ${value}`);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) finiteTree(child, `${path}.${key}`);
  }
};
finiteTree(result.baseline, 'baseline');
finiteTree(result.retained, 'retained');
finiteTree(result.settled, 'settled');
finiteTree(result.peakWitness, 'peakWitness');
finiteTree(result.peakRollingPair, 'peakRollingPair');
finiteTree(result.final, 'final');

const limit = 0.001;
for (const [name, value] of [
  ['settled max closure reconstruction', result.settled?.closureReconstruction?.maxAbsErrorMmPerS],
  ['peak-witness closure reconstruction', Math.abs(result.peakWitness?.closureReconstructionErrorMmPerS)],
  ['peak-rolling-pair closure reconstruction', Math.abs(result.peakRollingPair?.closureReconstructionErrorMmPerS)],
  ['final closure reconstruction', Math.abs(result.final?.closureReconstructionErrorMmPerS)],
]) {
  if (!Number.isFinite(value) || value > limit) failures.push(`${name}: ${value}, limit ${limit} mm/s`);
}

const eMax = result.retained?.rq2c4eRollingPairMaxAbsMmPerS;
const fPeak = Math.abs(result.peakRollingPair?.rollingPairMmPerS);
if (!Number.isFinite(eMax) || !Number.isFinite(fPeak) || Math.abs(eMax - fPeak) > 1e-6) {
  failures.push(`F peak rolling pair does not reproduce E max: ${fPeak} vs ${eMax}`);
}
const ePeakWitnessPair = result.retained?.rq2c4ePeakWitnessRollingPairMmPerS;
const fPeakWitnessPair = result.peakWitness?.rollingPairMmPerS;
if (!Number.isFinite(ePeakWitnessPair) || !Number.isFinite(fPeakWitnessPair) || Math.abs(ePeakWitnessPair - fPeakWitnessPair) > 1e-6) {
  failures.push(`F peak-witness rolling pair does not reproduce E: ${fPeakWitnessPair} vs ${ePeakWitnessPair}`);
}

const recomposedPeakWitness = result.baseline.rollingPairMmPerS + result.peakWitness.deltaTranslationMmPerS + result.peakWitness.spinRateContributionMmPerS + result.peakWitness.leverContributionMmPerS;
if (Math.abs(recomposedPeakWitness - result.peakWitness.rollingPairMmPerS) > limit) {
  failures.push(`explicit peak-witness identity mismatch: ${recomposedPeakWitness} vs ${result.peakWitness.rollingPairMmPerS}`);
}
const recomposedPeakPair = result.baseline.rollingPairMmPerS + result.peakRollingPair.deltaTranslationMmPerS + result.peakRollingPair.spinRateContributionMmPerS + result.peakRollingPair.leverContributionMmPerS;
if (Math.abs(recomposedPeakPair - result.peakRollingPair.rollingPairMmPerS) > limit) {
  failures.push(`explicit peak-pair identity mismatch: ${recomposedPeakPair} vs ${result.peakRollingPair.rollingPairMmPerS}`);
}

if (failures.length) {
  console.error('WHEEL_MODE5_RQ2C4F_CLASSIFICATION', 'INSTRUMENT_INVALID');
  console.error('WHEEL_MODE5_RQ2C4F_VALIDATION_FAILURES', JSON.stringify(failures));
  process.exitCode = 1;
} else {
  console.log('WHEEL_MODE5_RQ2C4F_CLOSURE_RECONSTRUCTION', 'PASS');
  console.log('WHEEL_MODE5_RQ2C4F_LOCALIZATION', JSON.stringify({
    baseline: result.baseline,
    witnessMaxAbsMmPerS: result.retained.actualWitnessMaxAbsMmPerS,
    rollingPairMeanAbsMmPerS: result.retained.rq2c4eRollingPairMeanAbsMmPerS,
    translationDrift: result.settled.translationDrift,
    spinRateContribution: result.settled.spinRateContribution,
    leverContribution: result.settled.leverContribution,
    stateDrift: result.settled.stateDrift,
    peakWitness: result.peakWitness,
    peakRollingPair: result.peakRollingPair,
    final: result.final,
  }));
  console.log('WHEEL_MODE5_RQ2C4F_CLASSIFICATION', 'TRUSTED_LOCALIZATION_READY_FOR_INTERPRETATION');
}
