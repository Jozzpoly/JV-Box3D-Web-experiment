import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../../../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from '../../owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const [outputPath, ...angleArgs] = process.argv.slice(2);
if (!outputPath || angleArgs.length === 0) throw new Error('usage: node wheel-mode5-rq2c4-hard-relax-run.mjs <output.json> <yaw-deg> [yaw-deg ...]');
const requestedYawDegrees = angleArgs.map(Number);
for (const yaw of requestedYawDegrees) {
  assert.ok(Number.isFinite(yaw));
  assert.ok([0, 3.5, -3.5].some((allowed) => Math.abs(yaw - allowed) <= 1e-9), `unsupported RQ2C4 yaw ${yaw}`);
}
assert.equal(new Set(requestedYawDegrees).size, requestedYawDegrees.length, 'duplicate yaw');

const b3 = await Box3D();
assert.equal(typeof b3.rq2c4RunOuterP75HardRelaxGuide, 'function', 'RQ2C4 binding missing');
const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396);
assert.equal(tire.provenance.markerContract, 'VERIFIED');
const carrier = b3.e2aOuterP75CarrierInfo();
assert.equal(carrier.valid, true);
const finite = (v, n) => { assert.ok(Number.isFinite(v), `${n}: ${v}`); return v; };
const radToDeg = 180 / Math.PI;
const cases = {};

for (const yaw of requestedYawDegrees) {
  const raw = b3.rq2c4RunOuterP75HardRelaxGuide(yaw);
  assert.equal(raw.valid, true, JSON.stringify(raw));
  assert.equal(raw.apparatus, 'RQ2C4_DIRECT_PARALLEL_LOCAL_Z_ENGINE_NATIVE_HARD_RELAX');
  assert.equal(raw.linearGuideRelaxation, 'USE_BIAS_SOFT_SOLVE_HARD_RELAX');
  cases[String(yaw)] = {
    yawDegrees: finite(raw.yawDegrees, 'yaw'),
    mountHertz: finite(raw.mountHertz, 'mountHertz'),
    mountDampingRatio: finite(raw.mountDampingRatio, 'mountDampingRatio'),
    linearGuideHertz: finite(raw.linearGuideHertz, 'linearGuideHertz'),
    linearGuideDampingRatio: finite(raw.linearGuideDampingRatio, 'linearGuideDampingRatio'),
    firstContactStep: raw.firstContactStep,
    firstImpulseStep: raw.firstImpulseStep,
    settledContactDropouts: raw.settledContactDropouts,
    settledFeatureSetChanges: raw.settledFeatureSetChanges,
    settledMinPointCount: raw.settledMinPointCount,
    settledMaxPointCount: raw.settledMaxPointCount,
    settledYRangeMm: finite(raw.settledYRange * 1000, 'Y range'),
    settledMaxAbsVyMmPerS: finite(raw.settledMaxAbsVy * 1000, 'Vy'),
    settledMeanAbsSlipMmPerS: finite(raw.settledMeanAbsSlip * 1000, 'mean slip'),
    settledMaxAbsSlipMmPerS: finite(raw.settledMaxAbsSlip * 1000, 'max slip'),
    settledMaxAxisErrorDegrees: finite(raw.settledMaxAxisError * radToDeg, 'axis'),
    settledMaxHeadingErrorDegrees: finite(raw.settledMaxHeadingError * radToDeg, 'heading'),
    settledMaxAbsCrossHeadingSpeedMmPerS: finite(raw.settledMaxAbsCrossHeadingSpeed * 1000, 'cross speed'),
    settledMaxAbsCrossTrackMm: finite(raw.settledMaxAbsCrossTrack * 1000, 'cross track'),
    settledMaxAbsPlaneSeparationMm: finite(raw.settledMaxAbsPlaneSeparation * 1000, 'plane separation'),
    finalSlipMmPerS: finite(raw.finalSlip * 1000, 'final slip'),
    finalAxisErrorDegrees: finite(raw.finalAxisError * radToDeg, 'final axis'),
    finalHeadingErrorDegrees: finite(raw.finalHeadingError * radToDeg, 'final heading'),
    finalPlaneSeparationMm: finite(raw.finalPlaneSeparation * 1000, 'final plane separation'),
  };
}

const result = {
  schemaVersion: 1,
  method: 'RQ2C4_ENGINE_NATIVE_HARD_RELAX_EQUIVALENCE',
  executedSource: process.env.GITHUB_SHA ?? null,
  dependencies: { box3dJs: '2617a0ff763a60c9f17cee57c6ea72aab75a5077', vendorBox3d: '8441b4a06d6d09dcfb0b0f704df4d847d1437b92', canonicalProductMain: '5b28cc03d22264010680deb95a04abd04661bc22' },
  apparatus: { topology: 'exact RQ2C3 scenario; scalar guide now participates in engine useBias solve/relax lifecycle', relaxation: 'USE_BIAS_SOFT_SOLVE_HARD_RELAX', mountHertz: 120, mountDampingRatio: 1, linearGuideHertz: 240, linearGuideDampingRatio: 2, challengeDegrees: 3.5, maxAxisErrorDegrees: 0.035, maxHeadingErrorDegrees: 0.035 },
  carrier,
  provenance: tire.provenance,
  requestedYawDegrees,
  cases,
};
await writeFile(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ2C4_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ2C4_EXECUTED');
