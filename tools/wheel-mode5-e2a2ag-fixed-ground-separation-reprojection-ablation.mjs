import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2agRunFixedGroundSeparationReprojectionAblation, 'function', 'E2a2ag runner missing');

const spin = 5;
const crossingAngularSpeed = 2.0e-5;
const spec = { direction: 1, label: '2to1' };
const arms = [
  { label: 'recycle-normal', recycleDistance: 0.05, freezeRecycledSeparation: false },
  { label: 'recycle-freeze-separation', recycleDistance: 0.05, freezeRecycledSeparation: true },
  { label: 'recycle-off', recycleDistance: 0.0, freezeRecycledSeparation: false },
];

const rows = [];
for (const arm of arms) {
  const raw = b3.e2a2agRunFixedGroundSeparationReprojectionAblation(
    spin,
    spec.direction,
    arm.recycleDistance,
    crossingAngularSpeed,
    arm.freezeRecycledSeparation,
  );

  assert.equal(raw.valid, true, `${arm.label}: invalid run`);
  assert.equal(raw.groundBodyStatic, true, `${arm.label}: ground not static`);
  assert.equal(raw.groundMotionMode, 'FIXED_IDENTITY_NO_TRANSFORM', `${arm.label}: ground moved`);
  assert.equal(raw.groundTransformSetCount, 0, `${arm.label}: ground transform was set`);
  assert.equal(raw.wheelMotionMode, 'DYNAMIC_BODY_ANGULAR_VELOCITY_COMMAND_BOUNDED_UNLOCK', `${arm.label}: wheel motion mode drift`);
  assert.equal(raw.freezeRecycledSeparation, arm.freezeRecycledSeparation, `${arm.label}: freeze state drift`);
  assert.equal(raw.contactDropoutsMotion, 0, `${arm.label}: contact dropout`);
  assert.equal(raw.contactIdChangesMotion, 0, `${arm.label}: contact id changed`);
  assert.equal(raw.transitionCount, 1, `${arm.label}: expected exactly one topology transition`);
  assert.equal(raw.transitionFrom, 2, `${arm.label}: transitionFrom drift`);
  assert.equal(raw.transitionTo, 1, `${arm.label}: transitionTo drift`);
  assert.equal(raw.transitionPersistedCount, 1, `${arm.label}: expected one persisted feature`);
  // Predictor mismatch is telemetry here, not an invariant: the intervention directly changes
  // recycled separation geometry and may legitimately move a small number of predictor/observed
  // classifications. Reject only gross apparatus drift; contact continuity and exact 2->1
  // transition semantics remain authoritative.
  assert.ok(raw.topologyMismatchCount <= 4, `${arm.label}: excessive topology predictor mismatch ${raw.topologyMismatchCount}`);

  if (arm.recycleDistance > 0) {
    assert.ok(raw.recycledStepsMotion > 0, `${arm.label}: recycling did not execute`);
  } else {
    assert.equal(raw.recycledStepsMotion, 0, `${arm.label}: recycle-off unexpectedly recycled`);
  }
  if (arm.freezeRecycledSeparation) {
    assert.ok(raw.frozenRecycledPointCount > 0, `${arm.label}: freeze intervention did not touch recycled points`);
  } else {
    assert.equal(raw.frozenRecycledPointCount, 0, `${arm.label}: frozen point count nonzero with freeze disabled`);
  }

  rows.push({
    arm: arm.label,
    recycleDistance: arm.recycleDistance,
    freezeRecycledSeparation: arm.freezeRecycledSeparation,
    frozenRecycledPointCount: raw.frozenRecycledPointCount,
    label: spec.label,
    direction: spec.direction,
    spin,
    crossingAngularSpeed,
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
    finalY: raw.finalY,
    finalVy: raw.finalVy,
    finalAngularX: raw.finalAngularX,
    finalAngularY: raw.finalAngularY,
    finalAngularZ: raw.finalAngularZ,
    finalGroundAngleMicroradians: raw.finalGroundAngleMicroradians,
    transitionSamples: raw.transitionSamples,
  });
}

assert.equal(rows[0].recycledStepsMotion, rows[1].recycledStepsMotion,
  'freeze changed recycler cadence; causal comparison confounded');
assert.equal(rows[0].transitionStep, rows[1].transitionStep,
  'freeze changed transition timing relative to normal recycle');

const result = {
  scope: 'E2a2ag CAUSAL TRANSFER TEST. On the apparatus-valid E2a2af fixed-road 2->1 wheel-side crossing, compare normal recycling, identical recycling cadence with only recycled separation reprojection frozen to baseSeparation, and recycle-off. This tests whether the E2a2ae separation-reprojection mechanism transfers across the fixed-road external-validity boundary.',
  rows,
};

console.log(`E2A2AG_FIXED_GROUND_SEPARATION_REPROJECTION_RESULT ${JSON.stringify(result)}`);
console.log('E2A2AG_FIXED_GROUND_SEPARATION_REPROJECTION_EXECUTED');
