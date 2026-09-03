import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const mode = process.argv[2] ?? 'unknown';
const b3 = await Box3D();
assert.equal(typeof b3.e2a2iRunMatchedSphereSpinAxisControl, 'function');

const dt = 1 / 240;
const durationSeconds = 2;
const stepCount = Math.round(durationSeconds / dt);
const axisNames = ['X-tangent', 'Y-contact-normal', 'Z-tangent'];

function execute(spin, substeps, axis) {
  const r = b3.e2a2iRunMatchedSphereSpinAxisControl(
    0,
    spin,
    true,
    true,
    dt,
    stepCount,
    substeps,
    0.0,
    true,
    2,
    axis,
  );
  assert.equal(r.valid, true);
  assert.equal(r.shapeControl, 'matchedSphere');
  assert.equal(r.motionLockMode, 2);
  assert.equal(r.contactDropoutsAfterImpulse, 0);
  assert.equal(r.minPointCountAfterImpulse, 1);
  assert.equal(r.maxPointCountAfterImpulse, 1);
  return r;
}

const comparisons = [];
const runs = [];
for (const substeps of [1, 4]) {
  const zero = execute(0, substeps, 2);
  for (const axis of [0, 1, 2]) {
    const spin = execute(40, substeps, axis);
    comparisons.push({
      substeps,
      axis,
      axisName: axisNames[axis],
      totalImpulseRatio40to0: spin.settledTotalImpulseMean / zero.settledTotalImpulseMean,
      finalImpulseRatio40to0: spin.settledFinalImpulseMean / zero.settledFinalImpulseMean,
      finalYDeltaMm: (spin.finalY - zero.finalY) * 1000,
      finalVyDelta: spin.finalVy - zero.finalVy,
      finalImpulse0: zero.settledFinalImpulseMean,
      finalImpulse40: spin.settledFinalImpulseMean,
      featureChanges40: spin.featureSetChangesAfterImpulse,
      contactIdChanges40: spin.contactIdChangesAfterImpulse,
    });
    runs.push({
      substeps,
      axis,
      axisName: axisNames[axis],
      spin: 40,
      finalY: spin.finalY,
      finalVy: spin.finalVy,
      totalImpulseMean: spin.settledTotalImpulseMean,
      finalImpulseMean: spin.settledFinalImpulseMean,
      finalAngularZ: spin.finalAngularZ,
    });
  }
}

console.log(`E2A2K_COUNTERFACTUAL_SOLVER_RESULT ${JSON.stringify({
  mode,
  scope: 'Same E2a2i matched-sphere 2 s rollout. baseline = pinned solver; counterfactual = only rotational-anchor contribution removed from separation prediction. Not a proposed production fix.',
  comparisons,
  runs,
})}`);
console.log(`E2A2K_COUNTERFACTUAL_SOLVER_EXECUTED ${mode}`);
