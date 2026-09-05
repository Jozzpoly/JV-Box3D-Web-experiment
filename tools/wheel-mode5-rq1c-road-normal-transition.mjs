import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.rq1RunOuterP75RoadNormalTransition, 'function', 'RQ1 binding missing');

const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire provenance marker contract drifted');

const control = b3.rq1RunOuterP75RoadNormalTransition(false);
const challenge = b3.rq1RunOuterP75RoadNormalTransition(true);

const compact = (run) => ({
  valid: run.valid,
  challengeRoad: run.challengeRoad,
  roadAngleRadians: run.roadAngleRadians,
  roadDropAt10m: run.roadDropAt10m,
  roadHullFaceCount: run.roadHullFaceCount,
  roadTopPlaneCount: run.roadTopPlaneCount,
  roadTopPlaneNormalXMin: run.roadTopPlaneNormalXMin,
  roadTopPlaneNormalXMax: run.roadTopPlaneNormalXMax,
  settledSamples: run.settledSamples,
  settledContactDropouts: run.settledContactDropouts,
  settledFeatureSetChanges: run.settledFeatureSetChanges,
  nearTransitionFeatureSetChanges: run.nearTransitionFeatureSetChanges,
  settledMinPointCount: run.settledMinPointCount,
  settledMaxPointCount: run.settledMaxPointCount,
  settledYRange: run.settledYRange,
  settledMaxAbsVy: run.settledMaxAbsVy,
  settledMaxAbsVz: run.settledMaxAbsVz,
  settledMaxAbsSlip: run.settledMaxAbsSlip,
  crossingStep: run.crossingStep,
  nearSamples: run.nearSamples,
  nearYRange: run.nearYRange,
  nearMaxAbsVy: run.nearMaxAbsVy,
  nearMaxAbsSlip: run.nearMaxAbsSlip,
  nearMaxNormalImpulse: run.nearMaxNormalImpulse,
  preMeanNormalX: run.preMeanNormalX,
  postMeanNormalX: run.postMeanNormalX,
  finalX: run.finalX,
  finalY: run.finalY,
  finalVx: run.finalVx,
  finalVy: run.finalVy,
  finalVz: run.finalVz,
  finalOmegaZ: run.finalOmegaZ,
  finalSlip: run.finalSlip,
  measurementVxDelta: run.measurementVxDelta,
  measurementOmegaDelta: run.measurementOmegaDelta,
});

// Always print the raw bounded result before validity gates so an apparatus failure
// cannot erase the evidence needed to diagnose it.
console.log('WHEEL_MODE5_RQ1C_RAW', JSON.stringify({ control: compact(control), challenge: compact(challenge) }));

for (const [name, run] of [['flat-control', control], ['road-normal-transition', challenge]]) {
  assert.equal(run.valid, true, `${name}: invalid run ${JSON.stringify(run)}`);
  assert.ok(run.settledSamples > 600, `${name}: insufficient observation window`);
  assert.ok(run.crossingStep >= 0, `${name}: wheel never crossed x=0`);
  assert.ok(run.nearSamples > 80, `${name}: insufficient crossing-window samples`);
  assert.equal(run.settledMaxAbsVz < 1e-8, true, `${name}: planar axle Z lock failed: ${run.settledMaxAbsVz}`);
  assert.equal(run.settledContactDropouts, 0, `${name}: contact dropout: ${run.settledContactDropouts}`);
}

// In-run RQ0-like provenance guard.
assert.equal(control.roadTopPlaneCount, 1, `flat control top plane count drifted: ${control.roadTopPlaneCount}`);
assert.ok(Math.abs(control.roadTopPlaneNormalXMin) < 1e-7, `flat control hull not flat: ${control.roadTopPlaneNormalXMin}`);
assert.equal(control.settledFeatureSetChanges, 0, `flat control feature drift: ${control.settledFeatureSetChanges}`);
assert.ok(control.settledMaxAbsSlip < 1e-5, `flat control rolling slip drifted: ${control.settledMaxAbsSlip}`);
assert.ok(Math.abs(control.postMeanNormalX - control.preMeanNormalX) < 1e-6,
  `flat control normal changed across x=0: pre=${control.preMeanNormalX} post=${control.postMeanNormalX}`);

// RQ1c geometry validity, pre-registered by RQ1b.
assert.ok(Math.abs(challenge.roadAngleRadians - 30e-6) < 1e-8, `challenge angle drifted: ${challenge.roadAngleRadians}`);
assert.equal(challenge.roadTopPlaneCount, 2, `challenge ridge was not preserved: topPlaneCount=${challenge.roadTopPlaneCount}`);
assert.ok(Math.abs(challenge.roadTopPlaneNormalXMin) < 1e-7,
  `challenge flat face missing: nxMin=${challenge.roadTopPlaneNormalXMin}`);
assert.ok(Math.abs(challenge.roadTopPlaneNormalXMax - 30e-6) < 1e-7,
  `challenge slope face drifted: nxMax=${challenge.roadTopPlaneNormalXMax}`);
assert.ok(Math.abs(challenge.postMeanNormalX - challenge.preMeanNormalX) > 20e-6,
  `challenge did not produce the expected contact-normal change: pre=${challenge.preMeanNormalX} post=${challenge.postMeanNormalX}`);

const ratio = (a, b) => b !== 0 ? a / b : null;
const comparison = {
  yRangeRatio: ratio(challenge.settledYRange, control.settledYRange),
  maxAbsVyRatio: ratio(challenge.settledMaxAbsVy, control.settledMaxAbsVy),
  nearYRangeRatio: ratio(challenge.nearYRange, control.nearYRange),
  nearMaxAbsVyRatio: ratio(challenge.nearMaxAbsVy, control.nearMaxAbsVy),
  maxAbsSlipRatio: ratio(challenge.settledMaxAbsSlip, control.settledMaxAbsSlip),
  nearMaxAbsSlipRatio: ratio(challenge.nearMaxAbsSlip, control.nearMaxAbsSlip),
  finalVxDelta: challenge.finalVx - control.finalVx,
  finalOmegaDelta: challenge.finalOmegaZ - control.finalOmegaZ,
  measurementVxDeltaDifference: challenge.measurementVxDelta - control.measurementVxDelta,
  measurementOmegaDeltaDifference: challenge.measurementOmegaDelta - control.measurementOmegaDelta,
  contactDropoutDelta: challenge.settledContactDropouts - control.settledContactDropouts,
  featureChangeDelta: challenge.settledFeatureSetChanges - control.settledFeatureSetChanges,
  nearFeatureChangeDelta: challenge.nearTransitionFeatureSetChanges - control.nearTransitionFeatureSetChanges,
  pointCountControl: [control.settledMinPointCount, control.settledMaxPointCount],
  pointCountChallenge: [challenge.settledMinPointCount, challenge.settledMaxPointCount],
  normalShiftControl: control.postMeanNormalX - control.preMeanNormalX,
  normalShiftChallenge: challenge.postMeanNormalX - challenge.preMeanNormalX,
};

const result = {
  method: 'RQ1C_FIRST_REPRESENTABLE_SINGLE_HULL_ROAD_NORMAL_TRANSITION',
  scope: 'First dynamic RQ1 challenge after RQ1b representation gate. Same qualified RQ0 donor outer-P75 wheel, static single road hull, mu=0.9, matched 1 m/s rolling and planar axle guide. Challenge is the first predeclared angle preserved by pinned b3CreateHull as two top faces: 30 urad. No recycler manipulation or E2a2 diagnostic solver patches.',
  control: compact(control),
  challenge: compact(challenge),
  comparison,
  provenance: tire.provenance,
};

await writeFile('rq1c-road-normal-transition-result.json', JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ1C_ROAD_NORMAL_TRANSITION_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ1C_ROAD_NORMAL_TRANSITION_EXECUTED');
