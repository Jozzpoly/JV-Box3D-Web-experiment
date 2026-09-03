import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2uRunDynamicSupportTransition, 'function', 'E2a2u runner missing');

const cases = [
  { direction: 1, spin: 0, expectedFrom: 2, expectedTo: 1, label: '2to1' },
  { direction: 1, spin: 40, expectedFrom: 2, expectedTo: 1, label: '2to1' },
  { direction: -1, spin: 0, expectedFrom: 1, expectedTo: 2, label: '1to2' },
  { direction: -1, spin: 40, expectedFrom: 1, expectedTo: 2, label: '1to2' },
];

const rows = [];
for ( const spec of cases ) {
  const raw = b3.e2a2uRunDynamicSupportTransition(spec.spin, spec.direction);
  assert.equal(raw.valid, true, `${spec.label} spin=${spec.spin}: invalid run`);
  assert.equal(raw.transitionLabel, spec.label, `${spec.label}: label drift`);
  assert.equal(raw.warmStarting, true, `${spec.label}: warm start disabled`);
  assert.equal(raw.topologyMismatchCount, 0,
    `${spec.label} spin=${spec.spin}: observed topology disagreed with source prediction`);
  assert.equal(raw.contactDropoutsMotion, 0,
    `${spec.label} spin=${spec.spin}: contact dropout during controlled crossing`);
  assert.equal(raw.contactIdChangesMotion, 0,
    `${spec.label} spin=${spec.spin}: contact identity changed during crossing`);
  assert.equal(raw.transitionCount, 1,
    `${spec.label} spin=${spec.spin}: expected exactly one topology transition`);
  assert.equal(raw.transitionFrom, spec.expectedFrom,
    `${spec.label} spin=${spec.spin}: unexpected source topology`);
  assert.equal(raw.transitionTo, spec.expectedTo,
    `${spec.label} spin=${spec.spin}: unexpected destination topology`);
  assert.equal(raw.transitionPersistedCount, 1,
    `${spec.label} spin=${spec.spin}: surviving feature warm-start persistence contract failed`);
  assert.ok(Math.abs(raw.finalAngularX) <= 1e-8,
    `${spec.label} spin=${spec.spin}: angular X lock leaked`);
  assert.ok(Math.abs(raw.finalAngularY) <= 1e-8,
    `${spec.label} spin=${spec.spin}: angular Y lock leaked`);
  assert.ok(Array.isArray(raw.transitionSamples) && raw.transitionSamples.length >= 2,
    `${spec.label} spin=${spec.spin}: transition samples missing`);

  const before = raw.transitionSamples.find((sample) => sample.relativeStep === -1);
  const at = raw.transitionSamples.find((sample) => sample.relativeStep === 0);
  assert.ok(before && at, `${spec.label} spin=${spec.spin}: transition boundary samples missing`);
  assert.equal(before.pointCount, spec.expectedFrom,
    `${spec.label} spin=${spec.spin}: pre-transition sample topology wrong`);
  assert.equal(at.pointCount, spec.expectedTo,
    `${spec.label} spin=${spec.spin}: transition sample topology wrong`);
  assert.equal(at.persistedCount, 1,
    `${spec.label} spin=${spec.spin}: transition sample should retain exactly one old feature`);

  rows.push({
    direction: spec.direction,
    label: spec.label,
    spin: spec.spin,
    sourceToleranceMicrometers: raw.sourceToleranceMicrometers,
    predictedTiltThresholdMicroradians: raw.predictedTiltThresholdMicroradians,
    initialAngleMicroradians: raw.initialAngleMicroradians,
    finalGroundAngleMicroradians: raw.finalGroundAngleMicroradians,
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
    topologyMismatchCount: raw.topologyMismatchCount,
    contactDropoutsMotion: raw.contactDropoutsMotion,
    contactIdChangesMotion: raw.contactIdChangesMotion,
    finalY: raw.finalY,
    finalVy: raw.finalVy,
    finalAngularZ: raw.finalAngularZ,
    transitionSamples: raw.transitionSamples,
  });
}

const result = {
  scope: 'E2a2u continuous physical wheel-plane support-feature crossing. Flat P75 wheel is unchanged and X/Y tilt-locked. Kinematic ground rotates at 20 urad/s after settle. Friction=0, warm starting on, validated E2a2q coupled normal path. Separate 2->1 and 1->2 runs at spin 0/40.',
  rows,
};

console.log(`E2A2U_DYNAMIC_TRANSITION_RESULT ${JSON.stringify(result)}`);
console.log('E2A2U_DYNAMIC_TRANSITION_EXECUTED');
