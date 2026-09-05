import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [resultPath] = process.argv.slice(2);
if (!resultPath) throw new Error('usage: node wheel-mode5-rq2c4e-angular-localization-validate.mjs <result.json>');
const result = JSON.parse(await readFile(resultPath, 'utf8'));

assert.equal(result.schemaVersion, 1, 'unsupported RQ2C4E result schema');
assert.equal(result.method, 'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION', 'method drifted');
assert.equal(result.dependencies?.box3dJs, '2617a0ff763a60c9f17cee57c6ea72aab75a5077', 'Box3D.js pin drifted');
assert.equal(result.dependencies?.vendorBox3d, '8441b4a06d6d09dcfb0b0f704df4d847d1437b92', 'vendor Box3D pin drifted');
assert.equal(result.dependencies?.rq2c4ExecutedSource, '13dfe885f8d949a25fa057f0cd47c7d86b95d817', 'RQ2C4 source drifted');
assert.equal(result.dependencies?.rq2c4dExecutedSource, '8a65846ff4e2a41a096221e5908f3899f694461b', 'RQ2C4D source drifted');
assert.equal(result.instrument?.physicsMutation, false, 'RQ2C4E must remain read-only telemetry');
assert.equal(result.instrument?.yawDegrees, 0, 'RQ2C4E must remain 0deg-only');

const p = result.primary;
const d = result.rq2c4d;
const l = result.localization;
assert.ok(p, 'missing primary metrics');
assert.ok(d, 'missing RQ2C4D witness metrics');
assert.ok(l, 'missing localization metrics');
assert.ok(l.peakWitness, 'missing peak-witness decomposition');
assert.ok(l.final, 'missing final decomposition');

const expected = {
  yawDegrees: 0,
  mountHertz: 120,
  mountDampingRatio: 1,
  linearGuideHertz: 240,
  linearGuideDampingRatio: 2,
  firstContactStep: 0,
  firstImpulseStep: 3,
  settledContactDropouts: 0,
  settledFeatureSetChanges: 0,
  settledMinPointCount: 1,
  settledMaxPointCount: 1,
  settledYRangeMm: 0.6880760192871094,
  settledMaxAbsVyMmPerS: 47.77277633547783,
  settledMeanAbsSlipMmPerS: 0.008565518591139052,
  settledMaxAbsSlipMmPerS: 0.034689903259277344,
  settledMaxAxisErrorDegrees: 0.008527510355317427,
  settledMaxHeadingErrorDegrees: 1.3340299097657554e-08,
  settledMaxAbsCrossHeadingSpeedMmPerS: 2.3283064365386963e-07,
  settledMaxAbsCrossTrackMm: 0.00683569123793859,
  settledMaxAbsPlaneSeparationMm: 0.003802233550231904,
  finalSlipMmPerS: 0.0057220458984375,
  finalAxisErrorDegrees: 0.007189303541150696,
  finalHeadingErrorDegrees: 0,
  finalPlaneSeparationMm: -0.0026700986381911207,
};

for (const key of ['yawDegrees', 'mountHertz', 'mountDampingRatio', 'linearGuideHertz', 'linearGuideDampingRatio', 'firstContactStep', 'firstImpulseStep', 'settledContactDropouts', 'settledFeatureSetChanges', 'settledMinPointCount', 'settledMaxPointCount']) {
  assert.equal(p[key], expected[key], `RQ2C4E primary discrete drift: ${key} ${p[key]} vs ${expected[key]}`);
}

const failures = [];
const closePrimary = (key, tolerance) => {
  const actual = p[key];
  const reference = expected[key];
  if (!Number.isFinite(actual) || Math.abs(actual - reference) > tolerance) {
    failures.push(`primary ${key}: ${actual} vs ${reference}, tolerance ${tolerance}`);
  }
};
for (const key of [
  'settledYRangeMm',
  'settledMaxAbsVyMmPerS',
  'settledMeanAbsSlipMmPerS',
  'settledMaxAbsSlipMmPerS',
  'settledMaxAbsCrossHeadingSpeedMmPerS',
  'settledMaxAbsCrossTrackMm',
  'settledMaxAbsPlaneSeparationMm',
  'finalSlipMmPerS',
  'finalPlaneSeparationMm',
]) closePrimary(key, 1e-5);
for (const key of ['settledMaxAxisErrorDegrees', 'settledMaxHeadingErrorDegrees', 'finalAxisErrorDegrees', 'finalHeadingErrorDegrees']) closePrimary(key, 1e-7);

const rq2c4dExpected = {
  settledMeanAbsWitnessSlipMmPerS: 0.0080130,
  settledMaxAbsWitnessSlipMmPerS: 0.0340939,
};
for (const [key, reference] of Object.entries(rq2c4dExpected)) {
  const actual = d[key];
  if (!Number.isFinite(actual) || Math.abs(actual - reference) > 1e-5) {
    failures.push(`RQ2C4D witness drift ${key}: ${actual} vs rounded reference ${reference}, tolerance 1e-5`);
  }
}

const reconstructionLimitMmPerS = 0.001;
for (const [key, value] of [
  ['settledMaxAbsScalarReconstructionErrorMmPerS', l.settledMaxAbsScalarReconstructionErrorMmPerS],
  ['settledMaxVectorReconstructionErrorMmPerS', l.settledMaxVectorReconstructionErrorMmPerS],
  ['peakWitness.scalarReconstructionErrorMmPerS', Math.abs(l.peakWitness.scalarReconstructionErrorMmPerS)],
  ['final.scalarReconstructionErrorMmPerS', Math.abs(l.final.scalarReconstructionErrorMmPerS)],
  ['final.vectorReconstructionErrorMmPerS', l.final.vectorReconstructionErrorMmPerS],
]) {
  if (!Number.isFinite(value) || value > reconstructionLimitMmPerS) {
    failures.push(`reconstruction ${key}: ${value}, limit ${reconstructionLimitMmPerS}`);
  }
}

const peakAlgebraError = Math.abs(
  (l.peakWitness.rollingPairTangentMmPerS + l.peakWitness.nonSpinTangentMmPerS) - l.peakWitness.witnessSlipMmPerS
);
if (!Number.isFinite(peakAlgebraError) || peakAlgebraError > reconstructionLimitMmPerS) {
  failures.push(`peak algebra reconstruction: ${peakAlgebraError}, limit ${reconstructionLimitMmPerS}`);
}

if (failures.length > 0) {
  console.error('WHEEL_MODE5_RQ2C4E_CLASSIFICATION', 'INSTRUMENT_INVALID');
  console.error('WHEEL_MODE5_RQ2C4E_VALIDATION_FAILURES', JSON.stringify(failures));
  process.exitCode = 1;
} else {
  console.log('WHEEL_MODE5_RQ2C4E_PRIMARY_NON_DRIFT', 'PASS');
  console.log('WHEEL_MODE5_RQ2C4E_RQ2C4D_WITNESS_NON_DRIFT', 'PASS');
  console.log('WHEEL_MODE5_RQ2C4E_RECONSTRUCTION_INTEGRITY', 'PASS');
  console.log('WHEEL_MODE5_RQ2C4E_LOCALIZATION', JSON.stringify({
    witnessMeanAbsMmPerS: d.settledMeanAbsWitnessSlipMmPerS,
    witnessMaxAbsMmPerS: d.settledMaxAbsWitnessSlipMmPerS,
    rollingPairMeanAbsMmPerS: l.settledMeanAbsRollingPairTangentMmPerS,
    rollingPairMaxAbsMmPerS: l.settledMaxAbsRollingPairTangentMmPerS,
    nonSpinMeanAbsMmPerS: l.settledMeanAbsNonSpinTangentMmPerS,
    nonSpinMaxAbsMmPerS: l.settledMaxAbsNonSpinTangentMmPerS,
    maxNonSpinOmegaRadPerS: l.settledMaxNonSpinOmegaRadPerS,
    peakWitness: l.peakWitness,
    final: l.final,
    scalarReconstructionMeanAbsMmPerS: l.settledMeanAbsScalarReconstructionErrorMmPerS,
    scalarReconstructionMaxAbsMmPerS: l.settledMaxAbsScalarReconstructionErrorMmPerS,
    vectorReconstructionMaxMmPerS: l.settledMaxVectorReconstructionErrorMmPerS,
  }));
  console.log('WHEEL_MODE5_RQ2C4E_CLASSIFICATION', 'TRUSTED_LOCALIZATION_READY_FOR_INTERPRETATION');
}
