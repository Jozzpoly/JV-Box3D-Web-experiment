import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const mode = process.argv[2] ?? 'observe';
const b3 = await Box3D();

assert.equal(typeof b3.e2a2RunFlatP75GroundCarrier, 'function', 'E2a2 real-wheel runner missing');

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
    settledYRange: run.settledYRange,
    settledMaxAbsVy: run.settledMaxAbsVy,
    settledTotalImpulseMean: run.settledTotalImpulseMean,
    settledTotalImpulseStd: run.settledTotalImpulseStd,
    settledTotalImpulseMin: run.settledTotalImpulseMin,
    settledTotalImpulseMax: run.settledTotalImpulseMax,
    finalY: run.finalY,
    finalVy: run.finalVy,
    finalAngularZ: run.finalAngularZ,
    uniqueFeatureIds: run.uniqueFeatureIds,
  };
}

function run(spin) {
  const row = b3.e2a2RunFlatP75GroundCarrier(0, spin, true);
  assert.equal(row.valid, true, `real wheel invalid at spin=${spin}`);
  assert.ok(row.firstImpulseStep >= 0, `real wheel never generated impulse at spin=${spin}`);
  assert.equal(row.contactDropoutsAfterImpulse, 0, `real wheel contact dropout at spin=${spin}`);
  assert.ok(row.minPointCountAfterImpulse >= 1 && row.minPointCountAfterImpulse <= 2);
  assert.ok(row.maxPointCountAfterImpulse >= 1 && row.maxPointCountAfterImpulse <= 2);
  return compact(row);
}

const spin0 = run(0);
const spin40 = run(40);
const result = {
  mode,
  scope: 'E2a2l-r2 real two-point P75 b3Wheel control. Baseline pinned solver vs broad no-rotational-anchor separation counterfactual; friction=0, 2 s, axial spin 0/40. Diagnostic only.',
  comparison: {
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
    featureSignatureEqual: JSON.stringify(spin40.uniqueFeatureIds) === JSON.stringify(spin0.uniqueFeatureIds),
  },
  spin0,
  spin40,
};

console.log(`E2A2L_R2_GLOBAL_ROTATION_CONTROL_RESULT ${JSON.stringify(result)}`);
console.log(`E2A2L_R2_GLOBAL_ROTATION_CONTROL_EXECUTED ${mode}`);
