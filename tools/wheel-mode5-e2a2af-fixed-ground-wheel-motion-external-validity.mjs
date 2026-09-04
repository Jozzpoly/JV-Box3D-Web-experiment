import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2afRunFixedGroundWheelMotionTransition, 'function', 'E2a2af runner missing');

const spin = 5;
const crossingAngularSpeed = 2.0e-5;
const recycleDistances = [0.05, 0.0];
const spec = { direction: 1, label: '2to1' };

const rows = [];
for (const recycleDistance of recycleDistances) {
  const raw = b3.e2a2afRunFixedGroundWheelMotionTransition(
    spin,
    spec.direction,
    recycleDistance,
    crossingAngularSpeed,
  );

  assert.equal(raw.valid, true, `${spec.label} recycle=${recycleDistance}: invalid run`);
  assert.equal(raw.groundBodyStatic, true, `${spec.label}: ground not static`);
  assert.equal(raw.groundMotionMode, 'FIXED_IDENTITY_NO_TRANSFORM', `${spec.label}: ground moved`);
  assert.equal(raw.groundTransformSetCount, 0, `${spec.label}: ground transform was set`);
  assert.equal(raw.wheelMotionMode, 'DYNAMIC_BODY_ANGULAR_VELOCITY_COMMAND_BOUNDED_UNLOCK', `${spec.label}: wheel motion mode drift`);
  assert.equal(raw.contactDropoutsMotion, 0, `${spec.label}: contact dropout`);
  assert.equal(raw.contactIdChangesMotion, 0, `${spec.label}: contact id changed`);
  assert.equal(raw.transitionCount, 1, `${spec.label} recycle=${recycleDistance}: expected exactly one topology transition`);
  assert.equal(raw.transitionFrom, 2, `${spec.label}: transitionFrom drift`);
  assert.equal(raw.transitionTo, 1, `${spec.label}: transitionTo drift`);
  assert.equal(raw.transitionPersistedCount, 1, `${spec.label}: expected one persisted feature`);
  assert.ok(raw.topologyMismatchCount <= 2, `${spec.label}: topology predictor mismatch ${raw.topologyMismatchCount}`);

  rows.push({
    recycleDistance,
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

const result = {
  scope: 'E2a2af ONE-DIRECTION EXTERNAL VALIDITY. Fixed static road at identity; reproduce only the apparatus-valid flat-P75 2->1 relative support crossing by bounded wheel-side angular motion. Compare normal recycle 0.05 m against recycle-off 0 m at spin 5 rad/s and crossing rate 20 urad/s. Reverse 1->2 is explicitly not validated because its fixed-road initialization failed the topology-direction gate.',
  rows,
};

console.log(`E2A2AF_FIXED_GROUND_WHEEL_MOTION_RESULT ${JSON.stringify(result)}`);
console.log('E2A2AF_FIXED_GROUND_WHEEL_MOTION_EXECUTED');
