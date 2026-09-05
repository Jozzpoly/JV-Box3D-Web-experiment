import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
for (const binding of [
  'e2aOuterP75CarrierInfo',
  'rq0RunOuterP75SteadyRolling',
  'rq1RunOuterP75RoadNormalTransition',
  'rq2aRunOuterP75Braking',
  'rq2bRunOuterP75Drive',
]) {
  assert.equal(typeof b3[binding], 'function', `RH0 bridge binding missing: ${binding}`);
}

const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire provenance marker contract drifted');

const carrier = b3.e2aOuterP75CarrierInfo();
assert.equal(carrier.valid, true, `outer-P75 carrier unavailable: ${JSON.stringify(carrier)}`);

const rq0Matched = b3.rq0RunOuterP75SteadyRolling(1.0, 0.9, true);
const rq0ZeroSpin = b3.rq0RunOuterP75SteadyRolling(1.0, 0.9, false);
const rq1Flat = b3.rq1RunOuterP75RoadNormalTransition(false);
const rq1Challenge = b3.rq1RunOuterP75RoadNormalTransition(true);
const rq2Control = b3.rq2aRunOuterP75Braking(0);
const rq2Brake = b3.rq2aRunOuterP75Braking(0.20);
const rq2Drive = b3.rq2bRunOuterP75Drive(0.20);

for (const [name, run] of [
  ['RQ0_MATCHED', rq0Matched],
  ['RQ0_ZERO_SPIN_POSITIVE_CONTROL', rq0ZeroSpin],
  ['RQ1C_FLAT_CONTROL', rq1Flat],
  ['RQ1C_30URAD', rq1Challenge],
  ['RQ2_ZERO_TORQUE_CONTROL', rq2Control],
  ['RQ2A_BRAKE20', rq2Brake],
  ['RQ2B_DRIVE20', rq2Drive],
]) {
  assert.equal(run.valid, true, `${name}: invalid raw run ${JSON.stringify(run)}`);
}

const abs = Math.abs;
const finite = (value, context) => {
  assert.ok(Number.isFinite(value), `${context}: non-finite value ${value}`);
  return value;
};
const ratio = (a, b, context) => {
  assert.ok(Number.isFinite(a) && Number.isFinite(b) && abs(b) > 1e-15, `${context}: invalid ratio inputs ${a}/${b}`);
  return a / b;
};

const scenarios = {
  RQ0_MATCHED: {
    settledContactDropouts: rq0Matched.settledContactDropouts,
    settledFeatureSetChanges: rq0Matched.settledFeatureSetChanges,
    settledMinPointCount: rq0Matched.settledMinPointCount,
    settledMaxPointCount: rq0Matched.settledMaxPointCount,
    settledYRangeMm: finite(rq0Matched.settledYRange * 1000, 'RQ0 matched Y range'),
    settledMaxAbsVyMmPerS: finite(rq0Matched.settledMaxAbsVy * 1000, 'RQ0 matched Vy'),
    settledMeanAbsSlipMmPerS: finite(rq0Matched.settledMeanAbsSlip * 1000, 'RQ0 matched mean slip'),
    settledMaxAbsSlipMmPerS: finite(rq0Matched.settledMaxAbsSlip * 1000, 'RQ0 matched max slip'),
    absMeasurementVxDeltaMmPerS: finite(abs(rq0Matched.measurementVxDelta) * 1000, 'RQ0 matched Vx drift'),
    absMeasurementOmegaDeltaMilliRadPerS: finite(abs(rq0Matched.measurementOmegaDelta) * 1000, 'RQ0 matched omega drift'),
    finalAbsSlipMmPerS: finite(abs(rq0Matched.finalSlip) * 1000, 'RQ0 matched final slip'),
  },

  RQ0_ZERO_SPIN_POSITIVE_CONTROL: {
    firstContactPresent: rq0ZeroSpin.firstContactStep >= 0,
    firstNormalImpulsePresent: rq0ZeroSpin.firstImpulseStep >= 0,
    finalNegativeSpinPresent: rq0ZeroSpin.finalOmegaZ < -1e-4,
    finalAbsSlipMmPerS: finite(abs(rq0ZeroSpin.finalSlip) * 1000, 'RQ0 zero-spin final slip'),
    settledContactDropouts: rq0ZeroSpin.settledContactDropouts,
    finalOmegaZ: finite(rq0ZeroSpin.finalOmegaZ, 'RQ0 zero-spin final omega'),
    finalVx: finite(rq0ZeroSpin.finalVx, 'RQ0 zero-spin final Vx'),
  },

  RQ1C_FLAT_CONTROL: {
    roadTopPlaneCount: rq1Flat.roadTopPlaneCount,
    settledContactDropouts: rq1Flat.settledContactDropouts,
    settledFeatureSetChanges: rq1Flat.settledFeatureSetChanges,
    settledMinPointCount: rq1Flat.settledMinPointCount,
    settledMaxPointCount: rq1Flat.settledMaxPointCount,
    settledYRangeMm: finite(rq1Flat.settledYRange * 1000, 'RQ1 flat Y range'),
    settledMaxAbsVyMmPerS: finite(rq1Flat.settledMaxAbsVy * 1000, 'RQ1 flat Vy'),
    settledMaxAbsSlipMmPerS: finite(rq1Flat.settledMaxAbsSlip * 1000, 'RQ1 flat slip'),
    nearYRangeMm: finite(rq1Flat.nearYRange * 1000, 'RQ1 flat near Y range'),
    nearMaxAbsVyMmPerS: finite(rq1Flat.nearMaxAbsVy * 1000, 'RQ1 flat near Vy'),
    preMeanNormalXMicroRad: finite(rq1Flat.preMeanNormalX * 1e6, 'RQ1 flat pre normal'),
    postMeanNormalXMicroRad: finite(rq1Flat.postMeanNormalX * 1e6, 'RQ1 flat post normal'),
    absPostMeanNormalXMicroRad: finite(abs(rq1Flat.postMeanNormalX) * 1e6, 'RQ1 flat abs post normal'),
  },

  RQ1C_30URAD: {
    roadTopPlaneCount: rq1Challenge.roadTopPlaneCount,
    roadTopPlaneNormalXMaxMicroRad: finite(rq1Challenge.roadTopPlaneNormalXMax * 1e6, 'RQ1 challenge hull normal'),
    settledContactDropouts: rq1Challenge.settledContactDropouts,
    settledFeatureSetChanges: rq1Challenge.settledFeatureSetChanges,
    nearTransitionFeatureSetChanges: rq1Challenge.nearTransitionFeatureSetChanges,
    settledMinPointCount: rq1Challenge.settledMinPointCount,
    settledMaxPointCount: rq1Challenge.settledMaxPointCount,
    settledYRangeMm: finite(rq1Challenge.settledYRange * 1000, 'RQ1 challenge Y range'),
    settledMaxAbsVyMmPerS: finite(rq1Challenge.settledMaxAbsVy * 1000, 'RQ1 challenge Vy'),
    settledMaxAbsSlipMmPerS: finite(rq1Challenge.settledMaxAbsSlip * 1000, 'RQ1 challenge slip'),
    nearYRangeMm: finite(rq1Challenge.nearYRange * 1000, 'RQ1 challenge near Y range'),
    nearMaxAbsVyMmPerS: finite(rq1Challenge.nearMaxAbsVy * 1000, 'RQ1 challenge near Vy'),
    preMeanNormalXMicroRad: finite(rq1Challenge.preMeanNormalX * 1e6, 'RQ1 challenge pre normal'),
    postMeanNormalXMicroRad: finite(rq1Challenge.postMeanNormalX * 1e6, 'RQ1 challenge post normal'),
    nearYRangeRatioVsFlat: ratio(rq1Challenge.nearYRange, rq1Flat.nearYRange, 'RQ1 near Y ratio'),
    nearMaxAbsVyRatioVsFlat: ratio(rq1Challenge.nearMaxAbsVy, rq1Flat.nearMaxAbsVy, 'RQ1 near Vy ratio'),
    finalVx: finite(rq1Challenge.finalVx, 'RQ1 challenge final Vx'),
    finalOmegaZ: finite(rq1Challenge.finalOmegaZ, 'RQ1 challenge final omega'),
  },

  RQ2_ZERO_TORQUE_CONTROL: {
    pulseContactDropouts: rq2Control.brakeContactDropouts,
    pulseFeatureSetChanges: rq2Control.brakeFeatureSetChanges,
    pulseMinPointCount: rq2Control.brakeMinPointCount,
    pulseMaxPointCount: rq2Control.brakeMaxPointCount,
    pulseYRangeMm: finite(rq2Control.brakeYRange * 1000, 'RQ2 control Y range'),
    pulseMaxAbsVyMmPerS: finite(rq2Control.brakeMaxAbsVy * 1000, 'RQ2 control Vy'),
    pulseMeanAbsSlipMmPerS: finite(rq2Control.brakeMeanAbsSlip * 1000, 'RQ2 control mean slip'),
    pulseMaxAbsSlipMmPerS: finite(rq2Control.brakeMaxAbsSlip * 1000, 'RQ2 control max slip'),
    vxDelta: finite(rq2Control.brakeVxDelta, 'RQ2 control Vx delta'),
    omegaDelta: finite(rq2Control.brakeOmegaDelta, 'RQ2 control omega delta'),
  },

  RQ2A_BRAKE20: {
    pulseContactDropouts: rq2Brake.brakeContactDropouts,
    pulseFeatureSetChanges: rq2Brake.brakeFeatureSetChanges,
    pulseMinPointCount: rq2Brake.brakeMinPointCount,
    pulseMaxPointCount: rq2Brake.brakeMaxPointCount,
    pulseYRangeMm: finite(rq2Brake.brakeYRange * 1000, 'RQ2A Y range'),
    pulseMaxAbsVyMmPerS: finite(rq2Brake.brakeMaxAbsVy * 1000, 'RQ2A Vy'),
    pulseMeanAbsSlipMmPerS: finite(rq2Brake.brakeMeanAbsSlip * 1000, 'RQ2A mean slip'),
    pulseMaxAbsSlipMmPerS: finite(rq2Brake.brakeMaxAbsSlip * 1000, 'RQ2A max slip'),
    pulseNormalImpulseMean: finite(rq2Brake.brakeNormalImpulseMean, 'RQ2A impulse mean'),
    pulseMaxNormalImpulse: finite(rq2Brake.brakeMaxNormalImpulse, 'RQ2A impulse max'),
    vxDelta: finite(rq2Brake.brakeVxDelta, 'RQ2A Vx delta'),
    omegaDelta: finite(rq2Brake.brakeOmegaDelta, 'RQ2A omega delta'),
    absRollingConstraintDeltaResidualMmPerS: finite(abs(rq2Brake.brakeVxDelta + rq2Brake.supportRadius * rq2Brake.brakeOmegaDelta) * 1000, 'RQ2A rolling residual'),
    pulseMaxAbsSlipForSentinelMmPerS: finite(rq2Brake.brakeMaxAbsSlip * 1000, 'RQ2A sentinel slip'),
    finalAbsSlipMmPerS: finite(abs(rq2Brake.finalSlip) * 1000, 'RQ2A final slip'),
  },

  RQ2B_DRIVE20: {
    pulseContactDropouts: rq2Drive.driveContactDropouts,
    pulseFeatureSetChanges: rq2Drive.driveFeatureSetChanges,
    pulseMinPointCount: rq2Drive.driveMinPointCount,
    pulseMaxPointCount: rq2Drive.driveMaxPointCount,
    pulseYRangeMm: finite(rq2Drive.driveYRange * 1000, 'RQ2B Y range'),
    pulseMaxAbsVyMmPerS: finite(rq2Drive.driveMaxAbsVy * 1000, 'RQ2B Vy'),
    pulseMeanAbsSlipMmPerS: finite(rq2Drive.driveMeanAbsSlip * 1000, 'RQ2B mean slip'),
    pulseMaxAbsSlipMmPerS: finite(rq2Drive.driveMaxAbsSlip * 1000, 'RQ2B max slip'),
    pulseNormalImpulseMean: finite(rq2Drive.driveNormalImpulseMean, 'RQ2B impulse mean'),
    pulseMaxNormalImpulse: finite(rq2Drive.driveMaxNormalImpulse, 'RQ2B impulse max'),
    vxDelta: finite(rq2Drive.driveVxDelta, 'RQ2B Vx delta'),
    omegaDelta: finite(rq2Drive.driveOmegaDelta, 'RQ2B omega delta'),
    absEndPulseRollingMismatchMmPerS: finite(abs(rq2Drive.driveVxDelta + rq2Drive.supportRadius * rq2Drive.driveOmegaDelta) * 1000, 'RQ2B end-pulse mismatch'),
    pulseMaxAbsSlipForSentinelMmPerS: finite(rq2Drive.driveMaxAbsSlip * 1000, 'RQ2B sentinel slip'),
    finalAbsSlipMmPerS: finite(abs(rq2Drive.finalSlip) * 1000, 'RQ2B final slip'),
  },
};

// Contract sentinel paths use the public pulseMaxAbsSlipMmPerS names.
scenarios.RQ2A_BRAKE20.pulseMaxAbsSlipMmPerS = scenarios.RQ2A_BRAKE20.pulseMaxAbsSlipForSentinelMmPerS;
scenarios.RQ2B_DRIVE20.pulseMaxAbsSlipMmPerS = scenarios.RQ2B_DRIVE20.pulseMaxAbsSlipForSentinelMmPerS;
delete scenarios.RQ2A_BRAKE20.pulseMaxAbsSlipForSentinelMmPerS;
delete scenarios.RQ2B_DRIVE20.pulseMaxAbsSlipForSentinelMmPerS;

const result = {
  schemaVersion: 1,
  contractSchemaVersion: 1,
  method: 'RH0_LEGACY_COMPOSITION_BRIDGE_REPLAY',
  role: 'Migration oracle only. Existing canonical RQ helpers are composed into one pinned build and normalized into one replay schema before the new explicit suite module is trusted.',
  executedSource: process.env.GITHUB_SHA ?? null,
  dependencies: {
    box3dJs: '2617a0ff763a60c9f17cee57c6ea72aab75a5077',
    vendorBox3d: '8441b4a06d6d09dcfb0b0f704df4d847d1437b92',
    canonicalProductMain: '5b28cc03d22264010680deb95a04abd04661bc22',
  },
  carrier,
  provenance: tire.provenance,
  scenarios,
};

await writeFile('rh0-canonical-rq-replay-result.json', JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RH0_LEGACY_REPLAY_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RH0_LEGACY_REPLAY_EXECUTED');
