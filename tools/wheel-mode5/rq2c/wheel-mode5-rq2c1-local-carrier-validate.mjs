import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [resultPath, mode] = process.argv.slice(2);
if (!resultPath || !['control', 'yaw'].includes(mode)) {
  throw new Error('usage: node wheel-mode5-rq2c1-local-carrier-validate.mjs <result.json> <control|yaw>');
}

const result = JSON.parse(await readFile(resultPath, 'utf8'));
assert.equal(result.schemaVersion, 1, 'unsupported RQ2C1 result schema');
assert.equal(result.method, 'RQ2C1_LOCAL_TRANSLATIONAL_CARRIER_EQUIVALENCE', 'RQ2C1 method drifted');
assert.equal(result.dependencies?.box3dJs, '2617a0ff763a60c9f17cee57c6ea72aab75a5077', 'Box3D.js pin drifted');
assert.equal(result.dependencies?.vendorBox3d, '8441b4a06d6d09dcfb0b0f704df4d847d1437b92', 'vendor Box3D pin drifted');
assert.equal(result.dependencies?.canonicalProductMain, '5b28cc03d22264010680deb95a04abd04661bc22', 'product main provenance drifted');
assert.equal(result.apparatus?.totalGuideMassRatio, 0.01, 'total guide-mass ratio drifted');
assert.equal(result.apparatus?.perGuideBodyMassRatio, 0.005, 'per-guide mass ratio drifted');
assert.equal(result.apparatus?.guideGravityScale, 0, 'guide gravity policy drifted');
assert.equal(result.apparatus?.guideRotationalInertia, 0, 'guide inertia policy drifted');
assert.equal(result.apparatus?.mountHertz, 120, 'RQ2C1 mount stiffness drifted');
assert.equal(result.apparatus?.mountDampingRatio, 1, 'RQ2C1 mount damping drifted');
assert.equal(result.apparatus?.challengeDegrees, 3.5, 'RQ2C1 challenge angle drifted');
assert.equal(result.apparatus?.maxAxisErrorDegrees, 0.035, 'RQ2C1 axis budget drifted');
assert.equal(result.apparatus?.maxHeadingErrorDegrees, 0.035, 'RQ2C1 heading budget drifted');

const expectedYaws = mode === 'control' ? [0] : [3.5, -3.5];
assert.deepEqual(result.requestedYawDegrees, expectedYaws, `${mode}: requested yaw set drifted`);

const failures = [];
const gate = (condition, message) => {
  if (!condition) failures.push(message);
};
const between = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
const atMost = (value, max) => Number.isFinite(value) && value <= max;

for (const yaw of expectedYaws) {
  const c = result.cases?.[String(yaw)];
  assert.ok(c, `${mode}: missing yaw case ${yaw}`);

  gate(Math.abs(c.yawDegrees - yaw) <= 1e-5, `${yaw}: yaw echo ${c.yawDegrees}`);
  gate(Number.isFinite(c.wheelMassKg) && c.wheelMassKg > 0, `${yaw}: invalid donor wheel mass ${c.wheelMassKg}`);
  gate(Math.abs(c.totalGuideMassRatio - 0.01) <= 1e-9, `${yaw}: total guide ratio ${c.totalGuideMassRatio}`);
  gate(Math.abs(c.perGuideBodyMassRatio - 0.005) <= 1e-9, `${yaw}: per-guide ratio ${c.perGuideBodyMassRatio}`);
  gate(Math.abs(c.guideBodyMassKg / c.wheelMassKg - 0.005) <= 1e-7, `${yaw}: guide/wheel measured mass ratio ${c.guideBodyMassKg / c.wheelMassKg}`);
  gate(c.mountHertz === 120, `${yaw}: mountHertz ${c.mountHertz}`);
  gate(c.mountDampingRatio === 1, `${yaw}: mountDampingRatio ${c.mountDampingRatio}`);

  gate(c.firstContactStep >= 0, `${yaw}: no contact`);
  gate(c.firstImpulseStep >= 0, `${yaw}: no normal impulse`);
  gate(c.settledContactDropouts === 0, `${yaw}: contact dropouts ${c.settledContactDropouts}`);
  gate(c.settledFeatureSetChanges === 0, `${yaw}: feature changes ${c.settledFeatureSetChanges}`);
  gate(c.settledMinPointCount === 1, `${yaw}: min point count ${c.settledMinPointCount}`);
  gate(c.settledMaxPointCount === 1, `${yaw}: max point count ${c.settledMaxPointCount}`);
  gate(between(c.settledYRangeMm, 0.50, 0.90), `${yaw}: Y range ${c.settledYRangeMm} mm outside 0.50..0.90`);
  gate(between(c.settledMaxAbsVyMmPerS, 35, 65), `${yaw}: max |Vy| ${c.settledMaxAbsVyMmPerS} mm/s outside 35..65`);
  gate(atMost(c.settledMaxAbsSlipMmPerS, 0.002), `${yaw}: max rotated slip ${c.settledMaxAbsSlipMmPerS} mm/s > 0.002`);
  gate(atMost(c.settledMaxAxisErrorDegrees, 0.035), `${yaw}: axis error ${c.settledMaxAxisErrorDegrees} deg > 0.035`);
  gate(atMost(c.settledMaxHeadingErrorDegrees, 0.035), `${yaw}: heading error ${c.settledMaxHeadingErrorDegrees} deg > 0.035`);
}

const diagnostics = Object.fromEntries(expectedYaws.map((yaw) => {
  const c = result.cases[String(yaw)];
  return [String(yaw), {
    wheelMassKg: c.wheelMassKg,
    guideBodyMassKg: c.guideBodyMassKg,
    maxCrossHeadingSpeedMmPerS: c.settledMaxAbsCrossHeadingSpeedMmPerS,
    maxCrossTrackMm: c.settledMaxAbsCrossTrackMm,
    maxCenterErrorMm: c.settledMaxCenterErrorMm,
    headingTranslationRangeM: c.settledHeadingTranslationRangeM,
    verticalTranslationRangeMm: c.settledVerticalTranslationRangeMm,
  }];
}));
console.log('WHEEL_MODE5_RQ2C1_CARRIER_DIAGNOSTICS', JSON.stringify(diagnostics));

if (mode === 'yaw' && failures.length === 0) {
  const plus = result.cases['3.5'];
  const minus = result.cases['-3.5'];
  console.log('WHEEL_MODE5_RQ2C1_MIRROR_DIAGNOSTICS', JSON.stringify({
    yRangeDeltaMm: Math.abs(plus.settledYRangeMm - minus.settledYRangeMm),
    maxAbsVyDeltaMmPerS: Math.abs(plus.settledMaxAbsVyMmPerS - minus.settledMaxAbsVyMmPerS),
    maxSlipDeltaMmPerS: Math.abs(plus.settledMaxAbsSlipMmPerS - minus.settledMaxAbsSlipMmPerS),
    axisErrorDeltaDegrees: Math.abs(plus.settledMaxAxisErrorDegrees - minus.settledMaxAxisErrorDegrees),
    headingErrorDeltaDegrees: Math.abs(plus.settledMaxHeadingErrorDegrees - minus.settledMaxHeadingErrorDegrees),
  }));
}

if (failures.length > 0) {
  console.error('WHEEL_MODE5_RQ2C1_CLASSIFICATION', mode === 'control' ? 'RQ2C1_LOCAL_CARRIER_CONTROL_FAIL' : 'RQ2C1_YAW_GATE_FAIL');
  console.error('WHEEL_MODE5_RQ2C1_GATE_FAILURES', JSON.stringify(failures));
  process.exitCode = 1;
} else {
  console.log('WHEEL_MODE5_RQ2C1_CLASSIFICATION', mode === 'control' ? 'LOCAL_CARRIER_CONTROL_PASS' : 'LOCAL_CARRIER_YAW_PAIR_PASS');
  console.log('WHEEL_MODE5_RQ2C1_GATES_OK');
}
