import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2afRunFixedGroundWheelMotionTransition, 'function', 'E2a2af baseline runner missing');
assert.equal(typeof b3.e2a2ahRunFixedGroundShadowFreshDiagnostic, 'function', 'E2a2ah shadow runner missing');

const spin = 5;
const direction = 1;
const recycleDistance = 0.05;
const crossingAngularSpeed = 2.0e-5;

const baseline = b3.e2a2afRunFixedGroundWheelMotionTransition(spin, direction, recycleDistance, crossingAngularSpeed);
const shadow = b3.e2a2ahRunFixedGroundShadowFreshDiagnostic(spin, direction, recycleDistance, crossingAngularSpeed);

for (const [label, raw] of [['baseline', baseline], ['shadow', shadow]]) {
  assert.equal(raw.valid, true, `${label}: invalid run`);
  assert.equal(raw.groundBodyStatic, true, `${label}: ground not static`);
  assert.equal(raw.groundMotionMode, 'FIXED_IDENTITY_NO_TRANSFORM', `${label}: ground moved`);
  assert.equal(raw.groundTransformSetCount, 0, `${label}: ground transform was set`);
  assert.equal(raw.wheelMotionMode, 'DYNAMIC_BODY_ANGULAR_VELOCITY_COMMAND_BOUNDED_UNLOCK', `${label}: wheel motion mode drift`);
  assert.equal(raw.contactDropoutsMotion, 0, `${label}: contact dropout`);
  assert.equal(raw.contactIdChangesMotion, 0, `${label}: contact id changed`);
  assert.equal(raw.transitionCount, 1, `${label}: expected exactly one transition`);
  assert.equal(raw.transitionFrom, 2, `${label}: transitionFrom drift`);
  assert.equal(raw.transitionTo, 1, `${label}: transitionTo drift`);
  assert.equal(raw.transitionPersistedCount, 1, `${label}: expected one persisted feature`);
}

// A valid shadow diagnostic must be observational only. Require exact deterministic
// agreement on the bounded physics outputs and recycler cadence.
for (const key of [
  'recycledStepsMotion',
  'recycledContactCountSumMotion',
  'maxRecycledContactCountMotion',
  'topologyMismatchCount',
  'transitionCount',
  'transitionStep',
  'transitionFrom',
  'transitionTo',
  'transitionPersistedCount',
  'transitionVyDelta',
  'transitionFinalImpulseDelta',
  'transitionTotalImpulseDelta',
  'maxAbsVyMotion',
  'contactDropoutsMotion',
  'contactIdChangesMotion',
  'finalY',
  'finalVy',
  'finalAngularX',
  'finalAngularY',
  'finalAngularZ',
  'finalGroundAngleMicroradians',
]) {
  assert.equal(shadow[key], baseline[key], `shadow perturbed physics output ${key}`);
}

assert.equal(shadow.shadowFreshEnabled, true, 'shadow metadata missing');
assert.ok(shadow.shadowFreshCallCount > 0, 'shadow narrow phase never executed');
assert.ok(Array.isArray(shadow.shadowSamples), 'shadowSamples missing');
assert.ok(shadow.shadowSamples.length > 0, 'no shadow samples captured');

const samples = shadow.shadowSamples;
const transitionStep = shadow.transitionStep;
const near = samples.filter((s) => Math.abs(s.step - transitionStep) <= 8);
assert.ok(near.length > 0, 'no shadow samples near transition');

const normalized = samples.map((s) => {
  const active = [];
  for (let i = 0; i < Math.min(s.recycledPointCount, 4); ++i) {
    const feature = s.activeFeatures[i];
    const matched = s.freshFeatures.slice(0, s.freshPointCount).includes(feature);
    active.push({
      feature,
      baseSeparation: s.baseSeparations[i],
      reprojection: s.reprojections[i],
      recycledSeparation: s.recycledSeparations[i],
      freshMatched: matched,
      matchedFreshSeparation: matched ? s.matchedFreshSeparations[i] : null,
      recycledMinusFresh: matched ? s.recycledSeparations[i] - s.matchedFreshSeparations[i] : null,
    });
  }
  return {
    step: s.step,
    motionStep: s.motionStep,
    sequence: s.sequence,
    sequenceDelta: s.sequenceDelta,
    freshTouching: s.freshTouching,
    recycledPointCount: s.recycledPointCount,
    freshPointCount: s.freshPointCount,
    matchedPointCount: s.matchedPointCount,
    activeFeatures: s.activeFeatures.slice(0, s.recycledPointCount),
    freshFeatures: s.freshFeatures.slice(0, s.freshPointCount),
    active,
  };
});

const nearNormalized = normalized.filter((s) => Math.abs(s.step - transitionStep) <= 8);
const mismatchSamples = normalized.filter((s) =>
  s.recycledPointCount !== s.freshPointCount ||
  s.matchedPointCount !== Math.min(s.recycledPointCount, s.freshPointCount) ||
  s.active.some((p) => p.freshMatched && Math.abs(p.recycledMinusFresh) > 1e-7)
);

const matchedErrors = [];
for (const s of normalized) {
  for (const p of s.active) {
    if (p.freshMatched) matchedErrors.push(Math.abs(p.recycledMinusFresh));
  }
}
matchedErrors.sort((a, b) => b - a);

const result = {
  scope: 'E2a2ah NON-PERTURBING SHADOW-FRESH DIAGNOSTIC. On the validated fixed-road 2->1 apparatus at spin 5 rad/s, crossing 20 urad/s and recycleDistance 0.05 m, execute fresh b3UpdateContact on a stack-local copy only when the live contact takes the recycler shortcut. The live manifold, solver, eligibility cadence and recycler cache remain authoritative and untouched. Compare feature topology and matched-feature separation against the live recycled manifold.',
  apparatusIdentity: {
    transitionStep,
    recycledStepsMotion: shadow.recycledStepsMotion,
    shadowFreshCallCount: shadow.shadowFreshCallCount,
    baselineTransitionVyDelta: baseline.transitionVyDelta,
    shadowTransitionVyDelta: shadow.transitionVyDelta,
    exactPhysicsIdentityAsserted: true,
  },
  nearTransition: nearNormalized,
  mismatchSampleCount: mismatchSamples.length,
  firstMismatchSamples: mismatchSamples.slice(0, 12),
  maxMatchedSeparationError: matchedErrors[0] ?? 0,
  p95MatchedSeparationError: matchedErrors[Math.floor(matchedErrors.length * 0.05)] ?? 0,
};

console.log(`E2A2AH_FIXED_GROUND_SHADOW_FRESH_RESULT ${JSON.stringify(result)}`);
console.log('E2A2AH_FIXED_GROUND_SHADOW_FRESH_EXECUTED');
