import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2vRunDynamicSupportTransitionRecycleControl, 'function', 'E2a2v runner missing');

const recycleDistance = 0.05;
const spins = [0, 5, 10, 15, 20, 25, 30, 35, 40];
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
  scope: 'E2a2w broad wheel-spin sweep under default recycle distance 0.05 m. Exact E2a2v crossing apparatus and E2a2q solver are reused; only wheel spin changes. No dynamic outcome threshold is pre-registered.',
  spins,
  recycleDistance,
  classifications: {
    fullRecycleCaseCount: fullRows.length,
    partialRecycleCaseCount: partialRows.length,
    zeroRecycleCaseCount: zeroRows.length,
    partialCases: partialRows.map(({ label, spin, recycledStepsMotion, motionSteps, transitionCount, transitionStep }) => ({
      label, spin, recycledStepsMotion, motionSteps, transitionCount, transitionStep,
    })),
  },
  rows,
};

console.log(`E2A2W_SPIN_RECYCLING_SWEEP_RESULT ${JSON.stringify(result)}`);
console.log('E2A2W_SPIN_RECYCLING_SWEEP_EXECUTED');
