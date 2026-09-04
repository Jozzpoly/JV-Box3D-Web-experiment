import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2zRunStaticGroundRateSweep, 'function', 'E2a2z parameterized runner missing');

const spin = 5;
const rate = 2.0e-5;
const recycleDistances = [0.0, 0.0025, 0.005, 0.01, 0.02, 0.03, 0.04, 0.05];
const directions = [
  { direction: 1, label: '2to1' },
  { direction: -1, label: '1to2' },
];

const rows = [];
for (const recycleDistance of recycleDistances) {
  for (const spec of directions) {
    const raw = b3.e2a2zRunStaticGroundRateSweep(spin, spec.direction, recycleDistance, rate);
    assert.equal(raw.valid, true, `${spec.label} recycle=${recycleDistance}: invalid run`);
    assert.equal(raw.groundBodyStatic, true, `${spec.label} recycle=${recycleDistance}: ground not static`);
    assert.equal(raw.groundMotionMode, 'SET_TRANSFORM_BEFORE_STEP', `${spec.label} recycle=${recycleDistance}: motion mode drift`);
    assert.equal(raw.contactDropoutsMotion, 0, `${spec.label} recycle=${recycleDistance}: contact dropout`);
    assert.equal(raw.contactIdChangesMotion, 0, `${spec.label} recycle=${recycleDistance}: contact identity changed`);
    assert.equal(raw.transitionCount, 1, `${spec.label} recycle=${recycleDistance}: expected exactly one topology transition`);
    assert.equal(raw.transitionPersistedCount, 1, `${spec.label} recycle=${recycleDistance}: expected one persisted feature`);

    rows.push({
      recycleDistance,
      spin,
      rate,
      label: spec.label,
      recycledStepsMotion: raw.recycledStepsMotion,
      motionSteps: raw.motionSteps,
      transitionStep: raw.transitionStep,
      transitionVyDelta: raw.transitionVyDelta,
      transitionFinalImpulseDelta: raw.transitionFinalImpulseDelta,
      transitionTotalImpulseDelta: raw.transitionTotalImpulseDelta,
      maxAbsVyMotion: raw.maxAbsVyMotion,
      topologyMismatchCount: raw.topologyMismatchCount,
      finalY: raw.finalY,
      finalVy: raw.finalVy,
    });
  }
}

const result = {
  scope: 'E2a2aa bounded recycle-distance sweep. Reuse the validated E2a2z static-ground parameterized runner. Hold spin=5 rad/s and crossing rate=20 urad/s fixed; vary only recycleDistance across 0/0.0025/0.005/0.01/0.02/0.03/0.04/0.05 m. Both 2->1 and 1->2 crossings. Primary question: whether transition severity tracks recycler activation/cadence as policy threshold increases.',
  rows,
};

console.log(`E2A2AA_STATIC_GROUND_RECYCLE_DISTANCE_SWEEP_RESULT ${JSON.stringify(result)}`);
console.log('E2A2AA_STATIC_GROUND_RECYCLE_DISTANCE_SWEEP_EXECUTED');
