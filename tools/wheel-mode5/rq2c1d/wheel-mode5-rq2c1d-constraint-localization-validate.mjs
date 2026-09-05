import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [resultPath] = process.argv.slice(2);
if (!resultPath) {
  throw new Error('usage: node wheel-mode5-rq2c1d-constraint-localization-validate.mjs <result.json>');
}

const result = JSON.parse(await readFile(resultPath, 'utf8'));
assert.equal(result.schemaVersion, 1, 'unsupported RQ2C1D result schema');
assert.equal(result.method, 'RQ2C1D_CONSTRAINT_LOCALIZATION_0DEG', 'RQ2C1D method drifted');
assert.equal(result.dependencies?.box3dJs, '2617a0ff763a60c9f17cee57c6ea72aab75a5077', 'Box3D.js pin drifted');
assert.equal(result.dependencies?.vendorBox3d, '8441b4a06d6d09dcfb0b0f704df4d847d1437b92', 'vendor Box3D pin drifted');
assert.equal(result.dependencies?.canonicalProductMain, '5b28cc03d22264010680deb95a04abd04661bc22', 'product main provenance drifted');
assert.equal(result.dependencies?.rq2c1ReferenceSource, 'f7ef795bedd4a5821556fc32bf953505d681c8d5', 'RQ2C1 reference source drifted');
assert.equal(result.dependencies?.rq2c1ReferenceRun, 33966506853, 'RQ2C1 reference run drifted');

assert.equal(result.apparatus?.yawDegrees, 0, 'RQ2C1D must remain 0 degrees');
assert.ok(Number.isFinite(result.apparatus?.wheelMassKg) && result.apparatus.wheelMassKg > 0, 'invalid wheel mass');
assert.ok(Math.abs(result.apparatus?.totalGuideMassRatio - 0.01) <= 1e-9, 'total guide-mass ratio drifted');
assert.ok(Math.abs(result.apparatus?.perGuideBodyMassRatio - 0.005) <= 1e-9, 'per-guide mass ratio drifted');
assert.equal(result.apparatus?.mountHertz, 120, 'mount hertz drifted');
assert.equal(result.apparatus?.mountDampingRatio, 1, 'mount damping drifted');

const reference = {
  settledContactDropouts: 0,
  settledFeatureSetChanges: 0,
  settledMinPointCount: 1,
  settledMaxPointCount: 1,
  settledYRangeMm: 0.6733536720275879,
  settledMaxAbsVyMmPerS: 52.1145723760128,
  settledMaxAbsSlipMmPerS: 0.03933906555175781,
  settledMaxAxisErrorDegrees: 0.009149092587848297,
  settledMaxHeadingErrorDegrees: 1.3173643051514525,
  settledMaxAbsCrossHeadingSpeedMmPerS: 22.996623069047928,
  settledMaxAbsCrossTrackMm: 6.138138938695192,
};

const exactKeys = [
  'settledContactDropouts',
  'settledFeatureSetChanges',
  'settledMinPointCount',
  'settledMaxPointCount',
];
for (const key of exactKeys) {
  assert.equal(result.primary?.[key], reference[key], `RQ2C1D non-drift exact metric changed: ${key}`);
}

const close = (actual, expected, tolerance, label) => {
  assert.ok(Number.isFinite(actual), `${label}: non-finite ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} drifted from RQ2C1 ${expected}`);
};
close(result.primary?.settledYRangeMm, reference.settledYRangeMm, 1e-5, 'settledYRangeMm');
close(result.primary?.settledMaxAbsVyMmPerS, reference.settledMaxAbsVyMmPerS, 1e-5, 'settledMaxAbsVyMmPerS');
close(result.primary?.settledMaxAbsSlipMmPerS, reference.settledMaxAbsSlipMmPerS, 1e-6, 'settledMaxAbsSlipMmPerS');
close(result.primary?.settledMaxAxisErrorDegrees, reference.settledMaxAxisErrorDegrees, 1e-7, 'settledMaxAxisErrorDegrees');
close(result.primary?.settledMaxHeadingErrorDegrees, reference.settledMaxHeadingErrorDegrees, 1e-7, 'settledMaxHeadingErrorDegrees');
close(result.primary?.settledMaxAbsCrossHeadingSpeedMmPerS, reference.settledMaxAbsCrossHeadingSpeedMmPerS, 1e-5, 'settledMaxAbsCrossHeadingSpeedMmPerS');
close(result.primary?.settledMaxAbsCrossTrackMm, reference.settledMaxAbsCrossTrackMm, 1e-5, 'settledMaxAbsCrossTrackMm');

const finiteTree = (value, path = 'localization') => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path}: non-finite diagnostic ${value}`);
    return;
  }
  assert.ok(value && typeof value === 'object', `${path}: missing diagnostic object`);
  for (const [key, child] of Object.entries(value)) finiteTree(child, `${path}.${key}`);
};
finiteTree(result.localization);

console.log('WHEEL_MODE5_RQ2C1D_NON_DRIFT_REFERENCE_OK');
console.log('WHEEL_MODE5_RQ2C1D_DIAGNOSTIC_TELEMETRY_OK');
console.log('WHEEL_MODE5_RQ2C1D_LOCALIZATION', JSON.stringify(result.localization));
