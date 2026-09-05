import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.rq1RunOuterP75RoadNormalTransition, 'function', 'RQ1 binding missing');

const control = b3.rq1RunOuterP75RoadNormalTransition(false);
const challenge = b3.rq1RunOuterP75RoadNormalTransition(true);

const compact = (run) => ({
  valid: run.valid,
  challengeRoad: run.challengeRoad,
  roadAngleRadians: run.roadAngleRadians,
  roadHullFaceCount: run.roadHullFaceCount,
  roadTopPlaneCount: run.roadTopPlaneCount,
  roadTopPlaneNormalXMin: run.roadTopPlaneNormalXMin,
  roadTopPlaneNormalXMax: run.roadTopPlaneNormalXMax,
  roadTopPlaneNormalYMin: run.roadTopPlaneNormalYMin,
  roadTopPlaneNormalYMax: run.roadTopPlaneNormalYMax,
  preMeanNormalX: run.preMeanNormalX,
  postMeanNormalX: run.postMeanNormalX,
  crossingStep: run.crossingStep,
  settledContactDropouts: run.settledContactDropouts,
  settledFeatureSetChanges: run.settledFeatureSetChanges,
  nearTransitionFeatureSetChanges: run.nearTransitionFeatureSetChanges,
  settledMinPointCount: run.settledMinPointCount,
  settledMaxPointCount: run.settledMaxPointCount,
});

const result = { control: compact(control), challenge: compact(challenge) };
console.log('WHEEL_MODE5_RQ1A_ROAD_HULL_INTROSPECTION_RESULT', JSON.stringify(result));

for (const [name, run] of [['control', control], ['challenge', challenge]]) {
  assert.equal(run.valid, true, `${name}: invalid run`);
  assert.ok(run.roadHullFaceCount >= 6, `${name}: implausible hull face count ${run.roadHullFaceCount}`);
  assert.ok(run.roadTopPlaneCount >= 1, `${name}: no top-facing hull planes`);
  assert.equal(run.settledContactDropouts, 0, `${name}: contact dropout`);
}
assert.equal(control.roadTopPlaneCount, 1, `control expected one top plane, got ${control.roadTopPlaneCount}`);
assert.ok(Math.abs(control.roadTopPlaneNormalXMin) < 1e-7,
  `control top plane not flat: ${control.roadTopPlaneNormalXMin}`);

console.log('WHEEL_MODE5_RQ1A_ROAD_HULL_INTROSPECTION_EXECUTED');
