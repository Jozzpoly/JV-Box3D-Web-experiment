import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [resultPath, mode] = process.argv.slice(2);
if (!resultPath || !['control', 'yaw'].includes(mode)) {
  throw new Error('usage: node wheel-mode5-rq2c3-direct-guide-validate.mjs <result.json> <control|yaw>');
}

const result = JSON.parse(await readFile(resultPath, 'utf8'));
assert.equal(result.schemaVersion, 1, 'unsupported RQ2C3 result schema');
assert.equal(result.method, 'RQ2C3_DIRECT_LOCAL_AXIS_GUIDE_EQUIVALENCE', 'RQ2C3 method drifted');
assert.equal(result.dependencies?.box3dJs, '2617a0ff763a60c9f17cee57c6ea72aab75a5077', 'Box3D.js pin drifted');
assert.equal(result.dependencies?.vendorBox3d, '8441b4a06d6d09dcfb0b0f704df4d847d1437b92', 'vendor Box3D pin drifted');
assert.equal(result.dependencies?.canonicalProductMain, '5b28cc03d22264010680deb95a04abd04661bc22', 'product main provenance drifted');
assert.equal(result.apparatus?.translation, 'LOCAL_AXLE_AXIS_ONLY_CONSTRAINED_HEADING_AND_VERTICAL_FREE', 'RQ2C3 translation semantics drifted');
assert.equal(result.apparatus?.mountHertz, 120, 'RQ2C3 angular mount stiffness drifted');
assert.equal(result.apparatus?.mountDampingRatio, 1, 'RQ2C3 angular mount damping drifted');
assert.equal(result.apparatus?.linearGuideHertz, 240, 'RQ2C3 linear guide stiffness drifted');
assert.equal(result.apparatus?.linearGuideDampingRatio, 2, 'RQ2C3 linear guide damping drifted');
assert.equal(result.apparatus?.challengeDegrees, 3.5, 'RQ2C3 challenge angle drifted');
assert.equal(result.apparatus?.maxAxisErrorDegrees, 0.035, 'RQ2C3 axis budget drifted');
assert.equal(result.apparatus?.maxHeadingErrorDegrees, 0.035, 'RQ2C3 heading budget drifted');

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
  gate(c.mountHertz === 120, `${yaw}: mountHertz ${c.mountHertz}`);
  gate(c.mountDampingRatio === 1, `${yaw}: mountDampingRatio ${c.mountDampingRatio}`);
  gate(c.linearGuideHertz === 240, `${yaw}: linearGuideHertz ${c.linearGuideHertz}`);
  gate(c.linearGuideDampingRatio === 2, `${yaw}: linearGuideDampingRatio ${c.linearGuideDampingRatio}`);
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
    maxCrossHeadingSpeedMmPerS: c.settledMaxAbsCrossHeadingSpeedMmPerS,
    maxCrossTrackMm: c.settledMaxAbsCrossTrackMm,
    maxPlaneSeparationMm: c.settledMaxAbsPlaneSeparationMm,
    finalPlaneSeparationMm: c.finalPlaneSeparationMm,
  }];
}));
console.log('WHEEL_MODE5_RQ2C3_DIRECT_GUIDE_DIAGNOSTICS', JSON.stringify(diagnostics));

if (mode === 'yaw' && failures.length === 0) {
  const plus = result.cases['3.5'];
  const minus = result.cases['-3.5'];
  console.log('WHEEL_MODE5_RQ2C3_MIRROR_DIAGNOSTICS', JSON.stringify({
    yRangeDeltaMm: Math.abs(plus.settledYRangeMm - minus.settledYRangeMm),
    maxAbsVyDeltaMmPerS: Math.abs(plus.settledMaxAbsVyMmPerS - minus.settledMaxAbsVyMmPerS),
    maxSlipDeltaMmPerS: Math.abs(plus.settledMaxAbsSlipMmPerS - minus.settledMaxAbsSlipMmPerS),
    axisErrorDeltaDegrees: Math.abs(plus.settledMaxAxisErrorDegrees - minus.settledMaxAxisErrorDegrees),
    headingErrorDeltaDegrees: Math.abs(plus.settledMaxHeadingErrorDegrees - minus.settledMaxHeadingErrorDegrees),
    planeSeparationDeltaMm: Math.abs(plus.settledMaxAbsPlaneSeparationMm - minus.settledMaxAbsPlaneSeparationMm),
  }));
}

if (failures.length > 0) {
  console.error('WHEEL_MODE5_RQ2C3_CLASSIFICATION', mode === 'control' ? 'RQ2C3_DIRECT_GUIDE_CONTROL_FAIL' : 'RQ2C3_YAW_GATE_FAIL');
  console.error('WHEEL_MODE5_RQ2C3_GATE_FAILURES', JSON.stringify(failures));
  process.exitCode = 1;
} else {
  console.log('WHEEL_MODE5_RQ2C3_CLASSIFICATION', mode === 'control' ? 'DIRECT_GUIDE_CONTROL_PASS' : 'DIRECT_GUIDE_YAW_PAIR_PASS');
  console.log('WHEEL_MODE5_RQ2C3_GATES_OK');
}
