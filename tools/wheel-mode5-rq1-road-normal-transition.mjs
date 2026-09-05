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

for (const [name, run] of [['flat-control', control], ['road-normal-transition', challenge]]) {
  assert.equal(run.valid, true, `${name}: invalid run ${JSON.stringify(run)}`);
  assert.ok(run.settledSamples > 600, `${name}: insufficient observation window`);
  assert.ok(run.crossingStep >= 0, `${name}: wheel never crossed x=0`);
  assert.ok(run.nearSamples > 80, `${name}: insufficient crossing-window samples`);
  assert.equal(run.settledMaxAbsVz < 1e-8, true, `${name}: planar axle Z lock failed: ${run.settledMaxAbsVz}`);
  assert.ok(Number.isFinite(run.preMeanNormalX) && Number.isFinite(run.postMeanNormalX), `${name}: missing manifold-normal telemetry`);
}

// Flat control is an in-run provenance guard for the RQ0 rolling regime.
assert.equal(control.settledContactDropouts, 0, `flat control contact dropout: ${control.settledContactDropouts}`);
assert.equal(control.settledFeatureSetChanges, 0, `flat control feature drift: ${control.settledFeatureSetChanges}`);
assert.ok(control.settledMaxAbsSlip < 1e-5, `flat control rolling slip drifted: ${control.settledMaxAbsSlip}`);
assert.ok(Math.abs(control.postMeanNormalX - control.preMeanNormalX) < 1e-6,
  `flat control normal changed across x=0: pre=${control.preMeanNormalX} post=${control.postMeanNormalX}`);

// Apparatus-validity guard only: the challenge must actually alter the road/contact normal.
// No outcome assertion says the disturbance must be good or bad.
assert.ok(Math.abs(challenge.roadAngleRadians - 20e-6) < 1e-8,
  `challenge angle drifted: ${challenge.roadAngleRadians}`);
assert.ok(Math.abs(challenge.postMeanNormalX - challenge.preMeanNormalX) > 5e-6,
  `challenge did not produce a measurable normal change: pre=${challenge.preMeanNormalX} post=${challenge.postMeanNormalX}`);

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
  method: 'RQ1_SINGLE_HULL_20URAD_ROAD_NORMAL_TRANSITION',
  scope: 'First representative topology/contact-geometry challenge after qualified RQ0. Same donor outer-P75 wheel, true static single-hull road, mu=0.9, 1 m/s matched rolling and planar axle locks. The only intended change from the matched control is a 20 urad downhill road-normal change after x=0. No recycler manipulation or shadow diagnostic.',
  control,
  challenge,
  comparison,
  provenance: tire.provenance,
};

await writeFile('rq1-road-normal-transition-result.json', JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ1_ROAD_NORMAL_TRANSITION_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ1_ROAD_NORMAL_TRANSITION_EXECUTED');
