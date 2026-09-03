import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2vRunDynamicSupportTransitionRecycleControl, 'function', 'E2a2v runner missing');

const recycleDistance = 0.05;
// The broad 0,5,...40 run found full recycling only at spin 0 and zero
// recycling at every sampled nonzero spin. Pinned source shows the E2a2u
// kinematic ground's 5 m maxExtent participates in the recycler arc criterion,
// so refine only the low-spin interval rather than treating 5 rad/s as a wheel
// property or tuning a new policy around it.
const spins = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 4, 5];
const directions = [
  { direction: 1, label: '2to1' },
  { direction: -1, label: '1to2' },
];

const rows = [];
for (const spec of directions) {
  for (const spin of spins) {
    const raw = b3.e2a2vRunDynamicSupportTransitionRecycleControl(spin, spec.direction, recycleDistance);
    assert.equal(raw.valid, true, `${spec.label} spin=${spin}: invalid run`);
    assert.ok(Math.abs(raw.configuredRecycleDistance - recycleDistance) < 1e-6,
      `${spec.label} spin=${spin}: recycle distance drift`);

    rows.push({
      label: spec.label,
      direction: spec.direction,
      spin,
      recycledStepsMotion: raw.recycledStepsMotion,
      motionSteps: raw.motionSteps,
      recycleFraction: raw.motionSteps > 0 ? raw.recycledStepsMotion / raw.motionSteps : null,
      recycledContactCountSumMotion: raw.recycledContactCountSumMotion,
      maxRecycledContactCountMotion: raw.maxRecycledContactCountMotion,
      topologyMismatchCount: raw.topologyMismatchCount,
      transitionCount: raw.transitionCount,
      transitionStep: raw.transitionStep,
      transitionFrom: raw.transitionFrom,
      transitionTo: raw.transitionTo,
      transitionPersistedCount: raw.transitionPersistedCount,
      transitionVyDelta: raw.transitionVyDelta,
      transitionFinalImpulseDelta: raw.transitionFinalImpulseDelta,
      transitionTotalImpulseDelta: raw.transitionTotalImpulseDelta,
      maxAbsVyMotion: raw.maxAbsVyMotion,
      maxAbsFinalImpulseStepDeltaMotion: raw.maxAbsFinalImpulseStepDeltaMotion,
      maxAbsTotalImpulseStepDeltaMotion: raw.maxAbsTotalImpulseStepDeltaMotion,
      contactDropoutsMotion: raw.contactDropoutsMotion,
      contactIdChangesMotion: raw.contactIdChangesMotion,
      predictedTiltThresholdMicroradians: raw.predictedTiltThresholdMicroradians,
      transitionSamples: raw.transitionSamples,
    });
  }
}

const partialRows = rows.filter((row) => row.recycledStepsMotion > 0 && row.recycledStepsMotion < row.motionSteps);
const fullRows = rows.filter((row) => row.recycledStepsMotion === row.motionSteps);
const zeroRows = rows.filter((row) => row.recycledStepsMotion === 0);

const result = {
  scope: 'E2a2w low-spin refinement under default recycle distance 0.05 m after broad 0..40 sweep. Exact E2a2v crossing apparatus and E2a2q solver are reused; only wheel spin changes. The purpose is to locate any intermittent recycling regime, not to define a policy threshold.',
  spins,
  recycleDistance,
  classifications: {
    fullRecycleCaseCount: fullRows.length,
    partialRecycleCaseCount: partialRows.length,
    zeroRecycleCaseCount: zeroRows.length,
    fullCases: fullRows.map(({ label, spin, recycledStepsMotion, motionSteps, transitionCount, transitionStep }) => ({
      label, spin, recycledStepsMotion, motionSteps, transitionCount, transitionStep,
    })),
    partialCases: partialRows.map(({ label, spin, recycledStepsMotion, motionSteps, transitionCount, transitionStep }) => ({
      label, spin, recycledStepsMotion, motionSteps, transitionCount, transitionStep,
    })),
    zeroCases: zeroRows.map(({ label, spin, recycledStepsMotion, motionSteps, transitionCount, transitionStep }) => ({
      label, spin, recycledStepsMotion, motionSteps, transitionCount, transitionStep,
    })),
  },
  rows,
};

console.log(`E2A2W_SPIN_RECYCLING_SWEEP_RESULT ${JSON.stringify(result)}`);
console.log('E2A2W_SPIN_RECYCLING_SWEEP_EXECUTED');
