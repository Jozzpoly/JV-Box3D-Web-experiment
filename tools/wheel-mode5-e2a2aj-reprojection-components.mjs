import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2afRunFixedGroundWheelMotionTransition, 'function', 'E2a2af baseline runner missing');
assert.equal(typeof b3.e2a2ajRunFixedGroundReprojectionComponents, 'function', 'E2a2aj component runner missing');

const spin = 5;
const direction = 1;
const recycleDistance = 0.05;
const crossingAngularSpeed = 2.0e-5;

const baseline = b3.e2a2afRunFixedGroundWheelMotionTransition(spin, direction, recycleDistance, crossingAngularSpeed);
const diagnostic = b3.e2a2ajRunFixedGroundReprojectionComponents(spin, direction, recycleDistance, crossingAngularSpeed);

for (const [label, raw] of [['baseline', baseline], ['diagnostic', diagnostic]]) {
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

assert.equal(diagnostic.componentTelemetryEnabled, true, 'component telemetry metadata missing');
assert.ok(diagnostic.componentTelemetryCallCount > 0, 'component telemetry never observed recycler');
assert.ok(Array.isArray(diagnostic.componentSamples) && diagnostic.componentSamples.length > 0, 'component samples missing');

const transitionStep = diagnostic.transitionStep;
const nearSamples = diagnostic.componentSamples.filter((s) => Math.abs(s.step - transitionStep) <= 8);
assert.ok(nearSamples.length > 0, 'no decomposition samples near transition');

const rows = [];
let maxClosureError = 0;
let maxSeparationClosureError = 0;
for (const s of diagnostic.componentSamples) {
  for (let i = 0; i < Math.min(s.pointCount, 4); ++i) {
    const base = s.baseSeparations[i];
    const center = s.centerDots[i];
    const anchorA = s.anchorADots[i];
    const anchorB = s.anchorBDots[i];
    const recomposed = s.recomposedDots[i];
    const reprojection = s.reprojections[i];
    const recycledSeparation = s.recycledSeparations[i];
    for (const [name, value] of [['base', base], ['center', center], ['anchorA', anchorA], ['anchorB', anchorB], ['recomposed', recomposed], ['reprojection', reprojection], ['recycledSeparation', recycledSeparation]]) {
      assert.equal(Number.isFinite(value), true, `${name} not finite`);
    }
    const closureError = Math.abs(recomposed - reprojection);
    const separationClosureError = Math.abs((base + reprojection) - recycledSeparation);
    maxClosureError = Math.max(maxClosureError, closureError);
    maxSeparationClosureError = Math.max(maxSeparationClosureError, separationClosureError);
    rows.push({step: s.step, pointIndex: i, base, center, anchorA, anchorB, recomposed, reprojection, recycledSeparation, closureError, separationClosureError});
  }
}
assert.ok(rows.length > 0, 'no decomposed points');
assert.ok(maxClosureError < 2e-7, `reprojection decomposition did not close: ${maxClosureError}`);
assert.ok(maxSeparationClosureError < 2e-7, `separation decomposition did not close: ${maxSeparationClosureError}`);

const nearRows = rows.filter((r) => Math.abs(r.step - transitionStep) <= 8);
assert.ok(nearRows.length > 0, 'no near-transition decomposed rows');
const meanAbs = (key) => nearRows.reduce((sum, r) => sum + Math.abs(r[key]), 0) / nearRows.length;
const componentMeans = {center: meanAbs('center'), anchorA: meanAbs('anchorA'), anchorB: meanAbs('anchorB'), reprojection: meanAbs('reprojection')};
const ordered = Object.entries({center: componentMeans.center, anchorA: componentMeans.anchorA, anchorB: componentMeans.anchorB}).sort((a, b) => b[1] - a[1]);

const result = {
  scope: 'E2a2aj NON-PERTURBING LIVE REPROJECTION COMPONENT DECOMPOSITION. Same trusted fixed-road 2->1 regime as E2a2af/ag/ah/ai. Decompose the authoritative recycler dot(dp,normal) exactly into dot(dc,normal) - dot(rA,normal) + dot(rB,normal), without shadow narrow phase or any change to live manifold, solver, recycler eligibility or cache semantics.',
  apparatusIdentity: {spin, direction, recycleDistance, crossingAngularSpeed, transitionStep, transitionVyDelta: diagnostic.transitionVyDelta, recycledStepsMotion: diagnostic.recycledStepsMotion, exactPhysicsIdentityAsserted: true},
  closure: {maxReprojectionClosureError: maxClosureError, maxSeparationClosureError, pointCount: rows.length},
  nearTransitionComponentMeanAbs: componentMeans,
  dominantComponentByMeanAbs: {name: ordered[0][0], value: ordered[0][1]},
  nearTransitionRows: nearRows,
};

console.log(`E2A2AJ_REPROJECTION_COMPONENT_RESULT ${JSON.stringify(result)}`);
console.log('E2A2AJ_REPROJECTION_COMPONENT_EXECUTED');
