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

const rowFor = (recycleDistance, label, spin) => rows.find(
  (row) => row.recycleDistance === recycleDistance && row.label === label && row.spin === spin,
);

// Causal gate. E2a2t already established the static source threshold. E2a2v asks
// a different question: does contact recycling itself explain the live spin-0
// hysteresis? Do not require dynamic contact refresh to agree with the static
// oracle on the exact frame; kinematic transform/contact update ordering may
// produce a small discrete lag. Instead require the intervention to remove
// recycling and restore the same single-transition topology path seen when the
// default recycler is naturally ineligible at spin 40.
for ( const spec of directions ) {
  const defaultSpin0 = rowFor(0.05, spec.label, 0).raw;
  const defaultSpin40 = rowFor(0.05, spec.label, 40).raw;
  const offSpin0 = rowFor(0.0, spec.label, 0).raw;
  const offSpin40 = rowFor(0.0, spec.label, 40).raw;

  assert.equal(defaultSpin0.recycledStepsMotion, defaultSpin0.motionSteps,
    `${spec.label}: default spin0 was not recycled for every controlled motion step`);
  assert.equal(defaultSpin0.recycledContactCountSumMotion, defaultSpin0.motionSteps,
    `${spec.label}: default spin0 recycled-contact count did not cover every motion step`);
  assert.equal(defaultSpin0.transitionCount, 0,
    `${spec.label}: default spin0 unexpectedly changed topology while fully recycled`);

  for ( const [name, raw] of [['default spin40', defaultSpin40], ['off spin0', offSpin0], ['off spin40', offSpin40]] ) {
    assert.equal(raw.recycledStepsMotion, 0, `${spec.label} ${name}: unexpected recycled steps`);
    assert.equal(raw.recycledContactCountSumMotion, 0, `${spec.label} ${name}: unexpected recycled contacts`);
    assert.equal(raw.contactDropoutsMotion, 0, `${spec.label} ${name}: contact dropout`);
    assert.equal(raw.contactIdChangesMotion, 0, `${spec.label} ${name}: contact id changed`);
    assert.equal(raw.transitionCount, 1, `${spec.label} ${name}: expected exactly one topology transition`);
    assert.equal(raw.transitionFrom, spec.expectedFrom, `${spec.label} ${name}: transition source wrong`);
    assert.equal(raw.transitionTo, spec.expectedTo, `${spec.label} ${name}: transition destination wrong`);
    assert.equal(raw.transitionPersistedCount, 1, `${spec.label} ${name}: surviving feature did not persist`);
    assert.ok(Array.isArray(raw.transitionSamples) && raw.transitionSamples.length >= 2,
      `${spec.label} ${name}: transition samples missing`);
  }

  assert.equal(offSpin0.configuredRecycleDistance, 0, `${spec.label}: spin0 recycling was not disabled`);
  assert.equal(offSpin40.configuredRecycleDistance, 0, `${spec.label}: spin40 recycling was not disabled`);
  assert.equal(offSpin0.transitionStep, offSpin40.transitionStep,
    `${spec.label}: recycle-off spin0 and spin40 transition steps diverged`);
  assert.equal(defaultSpin40.transitionStep, offSpin40.transitionStep,
    `${spec.label}: default non-recycled spin40 and recycle-off transition steps diverged`);
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
