import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [resultPath, mode] = process.argv.slice(2);
if (!resultPath || !['control', 'yaw'].includes(mode)) throw new Error('usage: node wheel-mode5-rq2c4-hard-relax-validate.mjs <result.json> <control|yaw>');
const result = JSON.parse(await readFile(resultPath, 'utf8'));
assert.equal(result.schemaVersion, 1);
assert.equal(result.method, 'RQ2C4_ENGINE_NATIVE_HARD_RELAX_EQUIVALENCE');
assert.equal(result.dependencies?.box3dJs, '2617a0ff763a60c9f17cee57c6ea72aab75a5077');
assert.equal(result.dependencies?.vendorBox3d, '8441b4a06d6d09dcfb0b0f704df4d847d1437b92');
assert.equal(result.dependencies?.canonicalProductMain, '5b28cc03d22264010680deb95a04abd04661bc22');
assert.equal(result.apparatus?.relaxation, 'USE_BIAS_SOFT_SOLVE_HARD_RELAX');
assert.equal(result.apparatus?.mountHertz, 120);
assert.equal(result.apparatus?.mountDampingRatio, 1);
assert.equal(result.apparatus?.linearGuideHertz, 240);
assert.equal(result.apparatus?.linearGuideDampingRatio, 2);
assert.equal(result.apparatus?.challengeDegrees, 3.5);
assert.equal(result.apparatus?.maxAxisErrorDegrees, 0.035);
assert.equal(result.apparatus?.maxHeadingErrorDegrees, 0.035);

const expected = mode === 'control' ? [0] : [3.5, -3.5];
assert.deepEqual(result.requestedYawDegrees, expected);
const failures = [];
const gate = (x, m) => { if (!x) failures.push(m); };
const between = (v,a,b) => Number.isFinite(v) && v >= a && v <= b;
const atMost = (v,m) => Number.isFinite(v) && v <= m;
for (const yaw of expected) {
  const c = result.cases[String(yaw)];
  assert.ok(c, `missing ${yaw}`);
  gate(c.mountHertz === 120, `${yaw}: mount ${c.mountHertz}`);
  gate(c.mountDampingRatio === 1, `${yaw}: mount damping ${c.mountDampingRatio}`);
  gate(c.linearGuideHertz === 240, `${yaw}: guide ${c.linearGuideHertz}`);
  gate(c.linearGuideDampingRatio === 2, `${yaw}: guide damping ${c.linearGuideDampingRatio}`);
  gate(c.firstContactStep >= 0, `${yaw}: no contact`);
  gate(c.firstImpulseStep >= 0, `${yaw}: no impulse`);
  gate(c.settledContactDropouts === 0, `${yaw}: dropouts ${c.settledContactDropouts}`);
  gate(c.settledFeatureSetChanges === 0, `${yaw}: feature changes ${c.settledFeatureSetChanges}`);
  gate(c.settledMinPointCount === 1 && c.settledMaxPointCount === 1, `${yaw}: point count ${c.settledMinPointCount}..${c.settledMaxPointCount}`);
  gate(between(c.settledYRangeMm, 0.50, 0.90), `${yaw}: Y ${c.settledYRangeMm}`);
  gate(between(c.settledMaxAbsVyMmPerS, 35, 65), `${yaw}: Vy ${c.settledMaxAbsVyMmPerS}`);
  gate(atMost(c.settledMaxAbsSlipMmPerS, 0.002), `${yaw}: slip ${c.settledMaxAbsSlipMmPerS}`);
  gate(atMost(c.settledMaxAxisErrorDegrees, 0.035), `${yaw}: axis ${c.settledMaxAxisErrorDegrees}`);
  gate(atMost(c.settledMaxHeadingErrorDegrees, 0.035), `${yaw}: heading ${c.settledMaxHeadingErrorDegrees}`);
}
console.log('WHEEL_MODE5_RQ2C4_DIAGNOSTICS', JSON.stringify(Object.fromEntries(expected.map(yaw => [String(yaw), {
  maxCrossHeadingSpeedMmPerS: result.cases[String(yaw)].settledMaxAbsCrossHeadingSpeedMmPerS,
  maxCrossTrackMm: result.cases[String(yaw)].settledMaxAbsCrossTrackMm,
  maxPlaneSeparationMm: result.cases[String(yaw)].settledMaxAbsPlaneSeparationMm,
  meanSlipMmPerS: result.cases[String(yaw)].settledMeanAbsSlipMmPerS,
  maxSlipMmPerS: result.cases[String(yaw)].settledMaxAbsSlipMmPerS,
}]))));
if (mode === 'yaw' && failures.length === 0) {
  const p = result.cases['3.5'], n = result.cases['-3.5'];
  console.log('WHEEL_MODE5_RQ2C4_MIRROR_DIAGNOSTICS', JSON.stringify({
    yRangeDeltaMm: Math.abs(p.settledYRangeMm-n.settledYRangeMm),
    maxSlipDeltaMmPerS: Math.abs(p.settledMaxAbsSlipMmPerS-n.settledMaxAbsSlipMmPerS),
    axisErrorDeltaDegrees: Math.abs(p.settledMaxAxisErrorDegrees-n.settledMaxAxisErrorDegrees),
    headingErrorDeltaDegrees: Math.abs(p.settledMaxHeadingErrorDegrees-n.settledMaxHeadingErrorDegrees),
  }));
}
if (failures.length) {
  console.error('WHEEL_MODE5_RQ2C4_CLASSIFICATION', mode === 'control' ? 'RQ2C4_HARD_RELAX_CONTROL_FAIL' : 'RQ2C4_YAW_GATE_FAIL');
  console.error('WHEEL_MODE5_RQ2C4_GATE_FAILURES', JSON.stringify(failures));
  process.exitCode = 1;
} else {
  console.log('WHEEL_MODE5_RQ2C4_CLASSIFICATION', mode === 'control' ? 'HARD_RELAX_CONTROL_PASS' : 'HARD_RELAX_YAW_PAIR_PASS');
  console.log('WHEEL_MODE5_RQ2C4_GATES_OK');
}
