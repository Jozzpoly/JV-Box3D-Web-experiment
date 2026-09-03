import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2vRunDynamicSupportTransitionRecycleControl, 'function', 'E2a2v runner missing');

const directions = [
  { direction: 1, label: '2to1', expectedFrom: 2, expectedTo: 1 },
  { direction: -1, label: '1to2', expectedFrom: 1, expectedTo: 2 },
];
const spins = [0, 40];
const recycleDistances = [0.05, 0.0];

const rows = [];
for ( const recycleDistance of recycleDistances ) {
  for ( const spec of directions ) {
    for ( const spin of spins ) {
      const raw = b3.e2a2vRunDynamicSupportTransitionRecycleControl(spin, spec.direction, recycleDistance);
      assert.equal(raw.valid, true, `${spec.label} spin=${spin} recycle=${recycleDistance}: invalid run`);
      rows.push({
        recycleDistance,
        direction: spec.direction,
        label: spec.label,
        spin,
        expectedFrom: spec.expectedFrom,
        expectedTo: spec.expectedTo,
        raw,
      });
    }
  }
}

const observation = {
  scope: 'E2a2v direct recycling causality A/B. Exact E2a2u crossing repeated with recycle distance explicitly 0.05 m or 0.0 m. Geometry, motion, friction, warm start and E2a2q solver unchanged. b3Counters.recycledContactCount is recorded during motion.',
  rows,
};
console.log(`E2A2V_RECYCLING_CAUSALITY_OBSERVATION ${JSON.stringify(observation)}`);

// Hard falsifier applies to recycling disabled. Fresh narrow phase should then
// be regenerated every step and match the already-validated E2a2t source oracle.
for ( const row of rows.filter((row) => row.recycleDistance === 0.0) ) {
  const { raw, label, spin, expectedFrom, expectedTo } = row;
  assert.equal(raw.configuredRecycleDistance, 0, `${label} spin=${spin}: recycling was not disabled`);
  assert.equal(raw.recycledStepsMotion, 0, `${label} spin=${spin}: recycled steps with distance zero`);
  assert.equal(raw.recycledContactCountSumMotion, 0, `${label} spin=${spin}: recycled contacts with distance zero`);
  assert.equal(raw.topologyMismatchCount, 0, `${label} spin=${spin}: recycle-off topology disagreed with source oracle`);
  assert.equal(raw.contactDropoutsMotion, 0, `${label} spin=${spin}: recycle-off contact dropout`);
  assert.equal(raw.contactIdChangesMotion, 0, `${label} spin=${spin}: recycle-off contact id changed`);
  assert.equal(raw.transitionCount, 1, `${label} spin=${spin}: recycle-off expected exactly one transition`);
  assert.equal(raw.transitionFrom, expectedFrom, `${label} spin=${spin}: recycle-off transition source wrong`);
  assert.equal(raw.transitionTo, expectedTo, `${label} spin=${spin}: recycle-off transition destination wrong`);
  assert.equal(raw.transitionPersistedCount, 1, `${label} spin=${spin}: recycle-off surviving feature did not persist`);
  assert.ok(Array.isArray(raw.transitionSamples) && raw.transitionSamples.length >= 2,
    `${label} spin=${spin}: recycle-off transition samples missing`);
}

const compact = rows.map(({ recycleDistance, label, spin, raw }) => ({
  recycleDistance,
  label,
  spin,
  recycledStepsMotion: raw.recycledStepsMotion,
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
  contactDropoutsMotion: raw.contactDropoutsMotion,
  contactIdChangesMotion: raw.contactIdChangesMotion,
  predictedTiltThresholdMicroradians: raw.predictedTiltThresholdMicroradians,
  transitionSamples: raw.transitionSamples,
}));

console.log(`E2A2V_RECYCLING_CAUSALITY_RESULT ${JSON.stringify({ compact })}`);
console.log('E2A2V_RECYCLING_CAUSALITY_EXECUTED');
