import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2yRunStaticGroundTransformTransition, 'function', 'E2a2y runner missing');

const recycleDistances = [0.05, 0.0];
const spins = [0, 5, 10, 40];
const directions = [
  { direction: 1, label: '2to1' },
  { direction: -1, label: '1to2' },
];

const rows = [];
for (const recycleDistance of recycleDistances) {
  for (const spec of directions) {
    for (const spin of spins) {
      const raw = b3.e2a2yRunStaticGroundTransformTransition(spin, spec.direction, recycleDistance);
      assert.equal(raw.valid, true,
        `${spec.label} recycle=${recycleDistance} spin=${spin}: invalid static-transform run`);
      assert.equal(raw.groundBodyStatic, true,
        `${spec.label} recycle=${recycleDistance} spin=${spin}: ground not static`);
      assert.equal(raw.groundMotionMode, 'SET_TRANSFORM_BEFORE_STEP',
        `${spec.label} recycle=${recycleDistance} spin=${spin}: motion mode drift`);
      assert.equal(raw.groundTransformSetCount, raw.motionSteps,
        `${spec.label} recycle=${recycleDistance} spin=${spin}: transform count drift`);

      rows.push({
        recycleDistance,
        label: spec.label,
        direction: spec.direction,
        spin,
        recycledStepsMotion: raw.recycledStepsMotion,
        recycledContactCountSumMotion: raw.recycledContactCountSumMotion,
        maxRecycledContactCountMotion: raw.maxRecycledContactCountMotion,
        motionSteps: raw.motionSteps,
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
        finalY: raw.finalY,
        finalVy: raw.finalVy,
        finalAngularZ: raw.finalAngularZ,
        finalGroundAngleMicroradians: raw.finalGroundAngleMicroradians,
        transitionSamples: raw.transitionSamples,
      });
    }
  }
}

const result = {
  scope: 'E2a2y FEASIBILITY ONLY. Replace the E2a2v kinematic support body with a static 5m ground box and apply the same 20 urad/s orientation trajectory by b3Body_SetTransform before each of 180 motion World_Steps. Compare recycleDistance 0.05 and 0 at spin 0/5/10/40. No physics acceptability gate is asserted; first authority is contact identity/dropout/recycling semantics.',
  rows,
};

console.log(`E2A2Y_STATIC_GROUND_TRANSFORM_FEASIBILITY_RESULT ${JSON.stringify(result)}`);
console.log('E2A2Y_STATIC_GROUND_TRANSFORM_FEASIBILITY_EXECUTED');
