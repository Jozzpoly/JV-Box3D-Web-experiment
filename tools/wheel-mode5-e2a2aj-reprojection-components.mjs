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
const diagnostic = b3.e2a2ahRunFixedGroundShadowFreshDiagnostic(spin, direction, recycleDistance, crossingAngularSpeed);

for (const [label, raw] of [['baseline', baseline], ['diagnostic', diagnostic]]) {
  assert.equal(raw.valid, true, `${label}: invalid run`);
  assert.equal(raw.groundBodyStatic, true, `${label}: ground not static`);
  assert.equal(raw.groundMotionMode, 'FIXED_IDENTITY_NO_TRANSFORM', `${label}: ground moved`);
  assert.equal(raw.groundTransformSetCount, 0, `${label}: ground transform was set`);
  assert.equal(raw.contactDropoutsMotion, 0, `${label}: contact dropout`);
  assert.equal(raw.contactIdChangesMotion, 0, `${label}: contact id changed`);
  assert.equal(raw.transitionCount, 1, `${label}: expected exactly one transition`);
  assert.equal(raw.transitionFrom, 2, `${label}: transitionFrom drift`);
  assert.equal(raw.transitionTo, 1, `${label}: transitionTo drift`);
  assert.equal(raw.transitionPersistedCount, 1, `${label}: expected one persisted feature`);
}

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
  assert.equal(diagnostic[key], baseline[key], `E2a2aj telemetry perturbed physics output ${key}`);
}

assert.ok(Array.isArray(diagnostic.shadowSamples) && diagnostic.shadowSamples.length > 0, 'shadow samples missing');
const transitionStep = diagnostic.transitionStep;
const near = diagnostic.shadowSamples.filter((s) => Math.abs(s.step - transitionStep) <= 8);
assert.ok(near.length > 0, 'no decomposition samples near transition');

const rows = [];
let maxClosureError = 0;
for (const s of diagnostic.shadowSamples) {
  for (let i = 0; i < Math.min(s.recycledPointCount, 4); ++i) {
    const center = s.centerDots[i];
    const anchorA = s.anchorADots[i];
    const anchorB = s.anchorBDots[i];
    const recomposed = s.recomposedDots[i];
    const reprojection = s.reprojections[i];
    for (const [name, value] of [['center', center], ['anchorA', anchorA], ['anchorB', anchorB], ['recomposed', recomposed], ['reprojection', reprojection]]) {
      assert.equal(Number.isFinite(value), true, `${name} not finite`);
    }
    const closureError = Math.abs(recomposed - reprojection);
    maxClosureError = Math.max(maxClosureError, closureError);
    rows.push({
      step: s.step,
      feature: s.activeFeatures[i],
      center,
      anchorA,
      anchorB,
      recomposed,
      reprojection,
      closureError,
      freshMatched: s.freshFeatures.slice(0, s.freshPointCount).includes(s.activeFeatures[i]),
      matchedFreshSeparation: s.matchedFreshSeparations[i],
      recycledSeparation: s.recycledSeparations[i],
    });
  }
}
assert.ok(rows.length > 0, 'no decomposed points');
assert.ok(maxClosureError < 2e-7, `reprojection decomposition did not close: ${maxClosureError}`);

const nearRows = rows.filter((r) => Math.abs(r.step - transitionStep) <= 8);
const representative = nearRows.filter((r) => r.freshMatched);
assert.ok(representative.length > 0, 'no matched near-transition decomposition points');

const meanAbs = (key) => representative.reduce((sum, r) => sum + Math.abs(r[key]), 0) / representative.length;
const componentMeans = {
  center: meanAbs('center'),
  anchorA: meanAbs('anchorA'),
  anchorB: meanAbs('anchorB'),
  reprojection: meanAbs('reprojection'),
};
const ordered = Object.entries({center: componentMeans.center, anchorA: componentMeans.anchorA, anchorB: componentMeans.anchorB})
  .sort((a, b) => b[1] - a[1]);

const result = {
  scope: 'E2a2aj NON-PERTURBING REPROJECTION COMPONENT DECOMPOSITION. Same trusted fixed-road 2->1 case as E2a2ah/E2a2ai. Decompose dot(dp,normal) exactly into dot(dc,normal) - dot(rA,normal) + dot(rB,normal), with no change to live manifold, solver, recycler eligibility or cache semantics.',
  apparatusIdentity: {
    spin,
    direction,
    recycleDistance,
    crossingAngularSpeed,
    transitionStep,
    transitionVyDelta: diagnostic.transitionVyDelta,
    recycledStepsMotion: diagnostic.recycledStepsMotion,
    exactPhysicsIdentityAsserted: true,
  },
  closure: {maxAbsError: maxClosureError, pointCount: rows.length},
  nearTransitionComponentMeanAbs: componentMeans,
  dominantComponentByMeanAbs: {name: ordered[0][0], value: ordered[0][1]},
  nearTransitionRows: nearRows,
};

console.log(`E2A2AJ_REPROJECTION_COMPONENT_RESULT ${JSON.stringify(result)}`);
console.log('E2A2AJ_REPROJECTION_COMPONENT_EXECUTED');
