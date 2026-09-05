import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [resultPath] = process.argv.slice(2);
if (!resultPath) throw new Error('usage: node wheel-mode5-rq2c4d-slip-audit-validate.mjs <result.json>');
const result = JSON.parse(await readFile(resultPath, 'utf8'));

assert.equal(result.schemaVersion, 1, 'unsupported RQ2C4D result schema');
assert.equal(result.method, 'RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT_AUDIT', 'method drifted');
assert.equal(result.dependencies?.box3dJs, '2617a0ff763a60c9f17cee57c6ea72aab75a5077', 'Box3D.js pin drifted');
assert.equal(result.dependencies?.vendorBox3d, '8441b4a06d6d09dcfb0b0f704df4d847d1437b92', 'vendor Box3D pin drifted');
assert.equal(result.dependencies?.rq2c4ExecutedSource, '13dfe885f8d949a25fa057f0cd47c7d86b95d817', 'RQ2C4 executed source drifted');
assert.equal(result.instrument?.physicsMutation, false, 'RQ2C4D must remain read-only telemetry');

const p = result.primary;
assert.ok(p, 'missing primary metrics');
const d = result.diagnostic;
assert.ok(d, 'missing diagnostic metrics');

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
  assert.equal(p[key], expected[key], `RQ2C4D primary discrete drift: ${key} ${p[key]} vs ${expected[key]}`);
}

const failures = [];
const close = (key, tolerance) => {
  const actual = p[key];
  const reference = expected[key];
  if (!Number.isFinite(actual) || Math.abs(actual - reference) > tolerance) {
    failures.push(`${key}: ${actual} vs ${reference}, tolerance ${tolerance}`);
  }
};

// Tight deterministic non-drift tolerances. These are many orders below the
// 0.03469 mm/s legacy signal under audit and do not relax any RH0.5 gate.
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
]) close(key, 1e-5);
for (const key of ['settledMaxAxisErrorDegrees', 'settledMaxHeadingErrorDegrees', 'finalAxisErrorDegrees', 'finalHeadingErrorDegrees']) close(key, 1e-7);

if (failures.length > 0) {
  console.error('WHEEL_MODE5_RQ2C4D_CLASSIFICATION', 'INSTRUMENT_INVALID_PRIMARY_NON_DRIFT_FAIL');
  console.error('WHEEL_MODE5_RQ2C4D_PRIMARY_DRIFT', JSON.stringify(failures));
  process.exitCode = 1;
} else {
  console.log('WHEEL_MODE5_RQ2C4D_PRIMARY_NON_DRIFT', 'PASS');
  const legacyMax = p.settledMaxAbsSlipMmPerS;
  const witnessMax = d.settledMaxAbsWitnessSlipMmPerS;
  const correctionMax = d.settledMaxAbsLegacyMinusWitnessMmPerS;
  const firstOrderMax = d.settledMaxFirstOrderAxialTiltMagnitudeMmPerS;
  console.log('WHEEL_MODE5_RQ2C4D_DIAGNOSTICS', JSON.stringify({
    legacyMaxMmPerS: legacyMax,
    witnessMaxMmPerS: witnessMax,
    witnessToLegacyRatio: legacyMax > 0 ? witnessMax / legacyMax : null,
    correctionMaxMmPerS: correctionMax,
    correctionToLegacyRatio: legacyMax > 0 ? correctionMax / legacyMax : null,
    firstOrderAxialTiltMaxMmPerS: firstOrderMax,
    firstOrderToCorrectionRatio: correctionMax > 0 ? firstOrderMax / correctionMax : null,
    supportAxialRangeMm: [d.settledSupportAxialMinMm, d.settledSupportAxialMaxMm],
    supportRadialRangeMm: [d.settledSupportRadialMinMm, d.settledSupportRadialMaxMm],
    finalLegacySlipMmPerS: p.finalSlipMmPerS,
    finalWitnessSlipMmPerS: d.finalWitnessSlipMmPerS,
  }));
  console.log('WHEEL_MODE5_RQ2C4D_CLASSIFICATION', 'TRUSTED_DIAGNOSTIC_READY_FOR_INTERPRETATION');
}
