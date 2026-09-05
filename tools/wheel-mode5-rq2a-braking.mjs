import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.rq2aRunOuterP75Braking, 'function', 'RQ2a braking binding missing');
assert.equal(typeof b3.e2aOuterP75CarrierInfo, 'function', 'E2a carrier info binding missing');

const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire provenance marker contract drifted');

const carrier = b3.e2aOuterP75CarrierInfo();
assert.equal(carrier.valid, true, `outer P75 carrier unavailable: ${JSON.stringify(carrier)}`);

const control = b3.rq2aRunOuterP75Braking(0);
const brake = b3.rq2aRunOuterP75Braking(0.20);

console.log('WHEEL_MODE5_RQ2A_RAW', JSON.stringify({ carrier, control, brake }));

for (const [name, run] of [['control', control], ['brake20', brake]]) {
  assert.equal(run.valid, true, `${name} run invalid: ${JSON.stringify(run)}`);
  assert.ok(run.firstContactStep >= 0, `${name}: no contact`);
  assert.ok(run.firstImpulseStep >= 0, `${name}: no normal solver impulse`);
  assert.equal(run.brakeSamples, 120, `${name}: brake observation duration drifted`);
  assert.ok(Number.isFinite(run.preBrakeVx) && Number.isFinite(run.postBrakeVx), `${name}: non-finite Vx`);
  assert.ok(Number.isFinite(run.preBrakeOmegaZ) && Number.isFinite(run.postBrakeOmegaZ), `${name}: non-finite omega`);
  assert.ok(Math.abs(run.finalX) < 9.5, `${name}: wheel left bounded road apparatus`);
  assert.ok(run.settledMaxAbsVz < 1e-8, `${name}: planar axle lock failed, max |Vz|=${run.settledMaxAbsVz}`);
}

// Control must reproduce the inherited matched-rolling behavior across the same
// nominal brake window. This is an apparatus-provenance gate, not a desired
// result for the braking challenge.
assert.equal(control.brakeTorque, 0, 'control received nonzero brake torque');
assert.ok(Math.abs(control.brakeVxDelta) < 1e-5,
  `control Vx drifted materially during demand window: ${control.brakeVxDelta}`);
assert.ok(Math.abs(control.brakeOmegaDelta) < 1e-4,
  `control omega drifted materially during demand window: ${control.brakeOmegaDelta}`);

// Brake challenge must actually exercise the intended mechanical demand.
assert.ok(brake.brakeTorque > 0, `brake torque not positive: ${brake.brakeTorque}`);
assert.ok(brake.brakeVxDelta < -1e-4,
  `braking did not reduce forward speed: ${brake.brakeVxDelta}`);
assert.ok(brake.brakeOmegaDelta > 1e-4,
  `braking did not reduce magnitude of negative wheel spin: ${brake.brakeOmegaDelta}`);

const compact = (run) => {
  const rollingResidual = run.brakeVxDelta + run.supportRadius * run.brakeOmegaDelta;
  return {
    brakeFraction: run.brakeFraction,
    mass: run.mass,
    supportRadius: run.supportRadius,
    coulombTorqueScale: run.coulombTorqueScale,
    brakeTorque: run.brakeTorque,
    brakeDurationSeconds: run.brakeDurationSeconds,
    firstContactStep: run.firstContactStep,
    firstImpulseStep: run.firstImpulseStep,
    settledContactDropouts: run.settledContactDropouts,
    settledFeatureSetChanges: run.settledFeatureSetChanges,
    settledPointCountRange: [run.settledMinPointCount, run.settledMaxPointCount],
    settledYRangeMm: run.settledYRange * 1000,
    settledMaxAbsVyMmPerS: run.settledMaxAbsVy * 1000,
    settledMaxAbsSlipMmPerS: run.settledMaxAbsSlip * 1000,
    brakeContactDropouts: run.brakeContactDropouts,
    brakeFeatureSetChanges: run.brakeFeatureSetChanges,
    brakePointCountRange: [run.brakeMinPointCount, run.brakeMaxPointCount],
    brakeYRangeMm: run.brakeYRange * 1000,
    brakeMaxAbsVyMmPerS: run.brakeMaxAbsVy * 1000,
    brakeMeanAbsSlipMmPerS: run.brakeMeanAbsSlip * 1000,
    brakeMaxAbsSlipMmPerS: run.brakeMaxAbsSlip * 1000,
    brakeNormalImpulseMean: run.brakeNormalImpulseMean,
    brakeNormalImpulseStd: run.brakeNormalImpulseStd,
    brakeMaxNormalImpulse: run.brakeMaxNormalImpulse,
    preBrakeVx: run.preBrakeVx,
    postBrakeVx: run.postBrakeVx,
    brakeVxDelta: run.brakeVxDelta,
    preBrakeOmegaZ: run.preBrakeOmegaZ,
    postBrakeOmegaZ: run.postBrakeOmegaZ,
    brakeOmegaDelta: run.brakeOmegaDelta,
    rollingConstraintDeltaResidual: rollingResidual,
    rollingConstraintDeltaResidualMmPerS: rollingResidual * 1000,
    finalVx: run.finalVx,
    finalOmegaZ: run.finalOmegaZ,
    finalSlipMmPerS: run.finalSlip * 1000,
    postPulseVxDrift: run.finalVx - run.postBrakeVx,
    postPulseOmegaDrift: run.finalOmegaZ - run.postBrakeOmegaZ,
  };
};

const c = compact(control);
const b = compact(brake);
const safeRatio = (a, denominator) => Math.abs(denominator) > 1e-15 ? a / denominator : null;

const comparison = {
  brakeVsControl: {
    settledYRangeRatio: safeRatio(brake.settledYRange, control.settledYRange),
    settledMaxAbsVyRatio: safeRatio(brake.settledMaxAbsVy, control.settledMaxAbsVy),
    brakeYRangeRatio: safeRatio(brake.brakeYRange, control.brakeYRange),
    brakeMaxAbsVyRatio: safeRatio(brake.brakeMaxAbsVy, control.brakeMaxAbsVy),
    brakeMaxAbsSlipRatio: safeRatio(brake.brakeMaxAbsSlip, control.brakeMaxAbsSlip),
    brakeNormalImpulseMeanRatio: safeRatio(brake.brakeNormalImpulseMean, control.brakeNormalImpulseMean),
    contactDropoutDeltaDuringPulse: brake.brakeContactDropouts - control.brakeContactDropouts,
    featureChangeDeltaDuringPulse: brake.brakeFeatureSetChanges - control.brakeFeatureSetChanges,
    vxDeltaDifference: brake.brakeVxDelta - control.brakeVxDelta,
    omegaDeltaDifference: brake.brakeOmegaDelta - control.brakeOmegaDelta,
  },
};

const result = {
  method: 'RQ2A_SUBLIMIT_BRAKING_TORQUE_PULSE',
  scope: brake.scope,
  rationale: 'First RQ2 envelope expansion. Preserve qualified RQ0 wheel/road geometry and axle provenance; apply one finite brake torque demand opposite the negative spin. Torque is 0.20 of the transparent mu*m*g*R scale for 0.5 s. No recycler manipulation and no drive/suspension/camber changes.',
  testedBrakeFractions: [0, 0.20],
  demandScaleNote: 'mu*m*g*R is used only as a transparent sub-limit scaling reference, not asserted as the exact wheel torque limit.',
  control: c,
  brake20: b,
  comparison,
  provenance: tire.provenance,
};

await writeFile('rq2a-braking-result.json', JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ2A_BRAKING_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ2A_BRAKING_EXECUTED');
