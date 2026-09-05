import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.rq2bRunOuterP75Drive, 'function', 'RQ2b drive binding missing');
assert.equal(typeof b3.e2aOuterP75CarrierInfo, 'function', 'E2a carrier info binding missing');

const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire provenance marker contract drifted');

const carrier = b3.e2aOuterP75CarrierInfo();
assert.equal(carrier.valid, true, `outer P75 carrier unavailable: ${JSON.stringify(carrier)}`);

const control = b3.rq2bRunOuterP75Drive(0);
const drive = b3.rq2bRunOuterP75Drive(0.20);

console.log('WHEEL_MODE5_RQ2B_RAW', JSON.stringify({ carrier, control, drive }));

for (const [name, run] of [['control', control], ['drive20', drive]]) {
  assert.equal(run.valid, true, `${name} run invalid: ${JSON.stringify(run)}`);
  assert.ok(run.firstContactStep >= 0, `${name}: no contact`);
  assert.ok(run.firstImpulseStep >= 0, `${name}: no normal solver impulse`);
  assert.equal(run.driveSamples, 120, `${name}: drive observation duration drifted`);
  assert.ok(Number.isFinite(run.preDriveVx) && Number.isFinite(run.postDriveVx), `${name}: non-finite Vx`);
  assert.ok(Number.isFinite(run.preDriveOmegaZ) && Number.isFinite(run.postDriveOmegaZ), `${name}: non-finite omega`);
  assert.ok(Math.abs(run.finalX) < 9.5, `${name}: wheel left bounded road apparatus`);
  assert.ok(run.settledMaxAbsVz < 1e-8, `${name}: planar axle lock failed, max |Vz|=${run.settledMaxAbsVz}`);
}

// Control must preserve the inherited matched-rolling behavior over the same
// nominal demand window. This is apparatus provenance, not a desired drive result.
assert.equal(control.driveTorque, 0, 'control received nonzero drive torque');
assert.ok(Math.abs(control.driveVxDelta) < 1e-5,
  `control Vx drifted materially during demand window: ${control.driveVxDelta}`);
assert.ok(Math.abs(control.driveOmegaDelta) < 1e-4,
  `control omega drifted materially during demand window: ${control.driveOmegaDelta}`);

// The drive challenge must actually exercise the opposite tangential demand:
// negative-Z torque increases the magnitude of negative spin and friction should
// accelerate the wheel in +X.
assert.ok(drive.driveTorque > 0, `drive torque magnitude not positive: ${drive.driveTorque}`);
assert.ok(drive.driveVxDelta > 1e-4,
  `drive demand did not increase forward speed: ${drive.driveVxDelta}`);
assert.ok(drive.driveOmegaDelta < -1e-4,
  `drive demand did not increase magnitude of negative wheel spin: ${drive.driveOmegaDelta}`);

const compact = (run) => {
  const rollingResidual = run.driveVxDelta + run.supportRadius * run.driveOmegaDelta;
  return {
    driveFraction: run.driveFraction,
    mass: run.mass,
    supportRadius: run.supportRadius,
    coulombTorqueScale: run.coulombTorqueScale,
    driveTorqueMagnitude: run.driveTorque,
    appliedTorqueZ: -run.driveTorque,
    driveDurationSeconds: run.driveDurationSeconds,
    firstContactStep: run.firstContactStep,
    firstImpulseStep: run.firstImpulseStep,
    settledContactDropouts: run.settledContactDropouts,
    settledFeatureSetChanges: run.settledFeatureSetChanges,
    settledPointCountRange: [run.settledMinPointCount, run.settledMaxPointCount],
    settledYRangeMm: run.settledYRange * 1000,
    settledMaxAbsVyMmPerS: run.settledMaxAbsVy * 1000,
    settledMaxAbsSlipMmPerS: run.settledMaxAbsSlip * 1000,
    driveContactDropouts: run.driveContactDropouts,
    driveFeatureSetChanges: run.driveFeatureSetChanges,
    drivePointCountRange: [run.driveMinPointCount, run.driveMaxPointCount],
    driveYRangeMm: run.driveYRange * 1000,
    driveMaxAbsVyMmPerS: run.driveMaxAbsVy * 1000,
    driveMeanAbsSlipMmPerS: run.driveMeanAbsSlip * 1000,
    driveMaxAbsSlipMmPerS: run.driveMaxAbsSlip * 1000,
    driveNormalImpulseMean: run.driveNormalImpulseMean,
    driveNormalImpulseStd: run.driveNormalImpulseStd,
    driveMaxNormalImpulse: run.driveMaxNormalImpulse,
    preDriveVx: run.preDriveVx,
    postDriveVx: run.postDriveVx,
    driveVxDelta: run.driveVxDelta,
    preDriveOmegaZ: run.preDriveOmegaZ,
    postDriveOmegaZ: run.postDriveOmegaZ,
    driveOmegaDelta: run.driveOmegaDelta,
    rollingConstraintDeltaResidual: rollingResidual,
    rollingConstraintDeltaResidualMmPerS: rollingResidual * 1000,
    finalVx: run.finalVx,
    finalOmegaZ: run.finalOmegaZ,
    finalSlipMmPerS: run.finalSlip * 1000,
    postPulseVxDrift: run.finalVx - run.postDriveVx,
    postPulseOmegaDrift: run.finalOmegaZ - run.postDriveOmegaZ,
  };
};

const c = compact(control);
const d = compact(drive);
const safeRatio = (a, denominator) => Math.abs(denominator) > 1e-15 ? a / denominator : null;

const comparison = {
  driveVsControl: {
    settledYRangeRatio: safeRatio(drive.settledYRange, control.settledYRange),
    settledMaxAbsVyRatio: safeRatio(drive.settledMaxAbsVy, control.settledMaxAbsVy),
    driveYRangeRatio: safeRatio(drive.driveYRange, control.driveYRange),
    driveMaxAbsVyRatio: safeRatio(drive.driveMaxAbsVy, control.driveMaxAbsVy),
    driveMaxAbsSlipRatio: safeRatio(drive.driveMaxAbsSlip, control.driveMaxAbsSlip),
    driveNormalImpulseMeanRatio: safeRatio(drive.driveNormalImpulseMean, control.driveNormalImpulseMean),
    contactDropoutDeltaDuringPulse: drive.driveContactDropouts - control.driveContactDropouts,
    featureChangeDeltaDuringPulse: drive.driveFeatureSetChanges - control.driveFeatureSetChanges,
    vxDeltaDifference: drive.driveVxDelta - control.driveVxDelta,
    omegaDeltaDifference: drive.driveOmegaDelta - control.driveOmegaDelta,
  },
};

const result = {
  method: 'RQ2B_SUBLIMIT_DRIVE_TORQUE_PULSE',
  scope: drive.scope,
  rationale: 'Second bounded RQ2 envelope expansion. Clone the qualified RQ2a/RQ0 wheel-road apparatus and reverse only torque direction: apply a finite -Z drive torque with the initial negative spin. Torque magnitude is 0.20 of the transparent mu*m*g*R scale for 0.5 s. No recycler manipulation and no suspension/camber/road change.',
  testedDriveFractions: [0, 0.20],
  demandScaleNote: 'mu*m*g*R is used only as a transparent sub-limit scaling reference, not asserted as the exact wheel torque limit.',
  control: c,
  drive20: d,
  comparison,
  provenance: tire.provenance,
};

await writeFile('rq2b-drive-result.json', JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ2B_DRIVE_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ2B_DRIVE_EXECUTED');
