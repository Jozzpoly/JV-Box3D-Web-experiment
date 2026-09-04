import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.rq0RunOuterP75SteadyRolling, 'function', 'RQ0 diagnostic binding missing');
assert.equal(typeof b3.e2aOuterP75CarrierInfo, 'function', 'E2a carrier info binding missing');

const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire provenance marker contract drifted');

const info = b3.e2aOuterP75CarrierInfo();
assert.equal(info.valid, true, `outer P75 dynamic profile unavailable: ${JSON.stringify(info)}`);
assert.ok(info.supportRadiusDown > 0, `invalid support radius: ${info.supportRadiusDown}`);

const primary = b3.rq0RunOuterP75SteadyRolling(1.0, 0.9, true);
const positiveControl = b3.rq0RunOuterP75SteadyRolling(1.0, 0.9, false);
for (const [name, run] of [['matched', primary], ['zero-spin-control', positiveControl]]) {
  assert.equal(run.valid, true, `${name} RQ0 run invalid: ${JSON.stringify(run)}`);
  assert.ok(run.firstContactStep >= 0, `${name}: no contact`);
  assert.ok(run.firstImpulseStep >= 0, `${name}: no normal solver impulse`);
  assert.ok(run.settledSamples > 600, `${name}: insufficient steady observation window`);
  assert.ok(Number.isFinite(run.finalVx) && Number.isFinite(run.finalOmegaZ), `${name}: non-finite final motion`);
  assert.ok(Math.abs(run.finalX) < 9.5, `${name}: wheel left bounded road apparatus`);
}

// Apparatus-validity requirement: the frictional zero-spin arm must visibly
// couple translation into wheel rotation. This is not a product acceptance gate;
// it only demonstrates that RQ0 is exercising tangential contact dynamics.
assert.ok(Math.abs(positiveControl.finalOmegaZ) > 0.25,
  `zero-spin control did not spin up under friction: ${positiveControl.finalOmegaZ}`);

const matched = {
  supportRadius: primary.supportRadius,
  nominalOmega: -1 / primary.supportRadius,
  firstContactStep: primary.firstContactStep,
  firstImpulseStep: primary.firstImpulseStep,
  settledContactDropouts: primary.settledContactDropouts,
  settledFeatureSetChanges: primary.settledFeatureSetChanges,
  pointCountRange: [primary.settledMinPointCount, primary.settledMaxPointCount],
  yRangeMm: primary.settledYRange * 1000,
  maxAbsVyMmPerS: primary.settledMaxAbsVy * 1000,
  maxAbsVzMmPerS: primary.settledMaxAbsVz * 1000,
  meanAbsSlipMmPerS: primary.settledMeanAbsSlip * 1000,
  maxAbsSlipMmPerS: primary.settledMaxAbsSlip * 1000,
  vxRange: [primary.settledVxMin, primary.settledVxMax],
  omegaRange: [primary.settledOmegaMin, primary.settledOmegaMax],
  normalImpulseMean: primary.settledNormalImpulseMean,
  normalImpulseStd: primary.settledNormalImpulseStd,
  measurementDisplacementX: primary.measurementDisplacementX,
  measurementVxDelta: primary.measurementVxDelta,
  measurementOmegaDelta: primary.measurementOmegaDelta,
  finalVx: primary.finalVx,
  finalOmegaZ: primary.finalOmegaZ,
  finalSlipMmPerS: primary.finalSlip * 1000,
};

const control = {
  initialOmegaZ: positiveControl.initialOmegaZ,
  finalVx: positiveControl.finalVx,
  finalOmegaZ: positiveControl.finalOmegaZ,
  finalSlipMmPerS: positiveControl.finalSlip * 1000,
  measurementVxDelta: positiveControl.measurementVxDelta,
  measurementOmegaDelta: positiveControl.measurementOmegaDelta,
  settledContactDropouts: positiveControl.settledContactDropouts,
};

const result = {
  method: 'RQ0_FIXED_ROAD_PASSIVE_STEADY_ROLLING',
  scope: primary.scope,
  friction: 0.9,
  speedMetersPerSecond: 1.0,
  noDriveTorque: true,
  noForcedTopologyChallenge: true,
  groundTransformWrites: 0,
  matched,
  positiveControl: control,
  provenance: tire.provenance,
};

console.log('WHEEL_MODE5_RQ0_STEADY_ROLLING_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ0_STEADY_ROLLING_EXECUTED');
