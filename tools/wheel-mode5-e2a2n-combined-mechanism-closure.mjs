import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const mode = process.argv[2] ?? 'observe';
const b3 = await Box3D();
assert.equal(typeof b3.e2a2RunFlatP75GroundCarrier, 'function', 'E2a2 unlocked runner missing');
assert.equal(typeof b3.e2a2mRunFlatP75GroundCarrierTiltLocked, 'function', 'E2a2m tilt-locked runner missing');

function compact(run) {
  return {
    valid: run.valid,
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
    finalY: run.finalY,
    finalVy: run.finalVy,
    finalAngularX: run.finalAngularX,
    finalAngularY: run.finalAngularY,
    finalAngularZ: run.finalAngularZ,
    finalAxisTiltDeg: run.finalAxisTiltDeg,
    uniqueFeatureIds: run.uniqueFeatureIds,
  };
}

function validate(run, label) {
  assert.equal(run.valid, true, `${label}: invalid`);
  assert.ok(run.firstImpulseStep >= 0, `${label}: no contact impulse`);
  assert.equal(run.contactDropoutsAfterImpulse, 0, `${label}: contact dropout`);
  assert.ok(run.minPointCountAfterImpulse >= 1 && run.minPointCountAfterImpulse <= 2,
    `${label}: min point count outside 1..2`);
  assert.ok(run.maxPointCountAfterImpulse >= 1 && run.maxPointCountAfterImpulse <= 2,
    `${label}: max point count outside 1..2`);
}

function run(fn, spin, label) {
  const value = fn(0, spin, true);
  validate(value, `${label} spin=${spin}`);
  return compact(value);
}

function compare(spin0, spin40) {
  return {
    finalYDeltaMm: (spin40.finalY - spin0.finalY) * 1000,
    finalVyDelta: spin40.finalVy - spin0.finalVy,
    totalImpulseRatio40to0: spin40.settledTotalImpulseMean / spin0.settledTotalImpulseMean,
    settledYRangeDeltaMm: (spin40.settledYRange - spin0.settledYRange) * 1000,
    minPointCount0: spin0.minPointCountAfterImpulse,
    minPointCount40: spin40.minPointCountAfterImpulse,
    maxPointCount0: spin0.maxPointCountAfterImpulse,
    maxPointCount40: spin40.maxPointCountAfterImpulse,
    featureSetChanges40: spin40.featureSetChangesAfterImpulse,
    contactIdChanges40: spin40.contactIdChangesAfterImpulse,
    maxNormalTiltDeg40: spin40.maxNormalTiltDegAfterImpulse,
    finalAxisTiltDeg40: spin40.finalAxisTiltDeg,
    finalAngularX40: spin40.finalAngularX,
    finalAngularY40: spin40.finalAngularY,
    finalAngularZ40: spin40.finalAngularZ,
    featureSignatureEqual: JSON.stringify(spin40.uniqueFeatureIds) === JSON.stringify(spin0.uniqueFeatureIds),
  };
}

const unlocked0 = run(b3.e2a2RunFlatP75GroundCarrier, 0, 'unlocked');
const unlocked40 = run(b3.e2a2RunFlatP75GroundCarrier, 40, 'unlocked');
const locked0 = run(b3.e2a2mRunFlatP75GroundCarrierTiltLocked, 0, 'tilt-locked');
const locked40 = run(b3.e2a2mRunFlatP75GroundCarrierTiltLocked, 40, 'tilt-locked');

const result = {
  mode,
  scope: 'E2a2n combined-mechanism closure. Same real P75 two-point b3Wheel. Compare free vs angular-X/Y locked under pinned solver or broad no-rotational-anchor convex-wide separation counterfactual.',
  unlockedComparison: compare(unlocked0, unlocked40),
  lockedComparison: compare(locked0, locked40),
  unlocked0,
  unlocked40,
  locked0,
  locked40,
};

console.log(`E2A2N_COMBINED_MECHANISM_RESULT ${JSON.stringify(result)}`);
console.log(`E2A2N_COMBINED_MECHANISM_EXECUTED ${mode}`);
