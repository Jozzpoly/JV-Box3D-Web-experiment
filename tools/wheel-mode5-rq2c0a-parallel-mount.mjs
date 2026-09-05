import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.rq0RunOuterP75SteadyRolling, 'function', 'RQ0 control binding missing');
assert.equal(typeof b3.rq2c0aRunOuterP75ParallelMount, 'function', 'RQ2c0a mount binding missing');

const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire provenance marker contract drifted');

const speed = 1.0;
const friction = 0.9;
const control = b3.rq0RunOuterP75SteadyRolling(speed, friction, true);
const mounted = b3.rq2c0aRunOuterP75ParallelMount(speed, friction, true);

console.log('WHEEL_MODE5_RQ2C0A_RAW', JSON.stringify({ control, mounted }));

for (const [name, run] of [['rq0-control', control], ['parallel-mount', mounted]]) {
  assert.equal(run.valid, true, `${name} run invalid: ${JSON.stringify(run)}`);
  assert.ok(run.firstContactStep >= 0, `${name}: no contact`);
  assert.ok(run.firstImpulseStep >= 0, `${name}: no normal solver impulse`);
  assert.ok(Number.isFinite(run.finalX) && Number.isFinite(run.finalVx) && Number.isFinite(run.finalOmegaZ),
    `${name}: non-finite final state`);
  assert.ok(Math.abs(run.finalX) < 9.5, `${name}: wheel left bounded road apparatus`);
  assert.ok(run.settledMaxAbsVz < 1e-8, `${name}: inherited linear-Z guide failed, max |Vz|=${run.settledMaxAbsVz}`);
}

// Mount validity, not a desired equivalence result: the local axle-reference
// constraint must actually suppress non-spin orientation drift to a scale well
// below later degree-scale camber/steer probes. Rolling/contact metrics remain
// evidence and are intentionally not hard-coded into a PASS target here.
assert.equal(mounted.mountHertz, 120, `mount hertz drifted: ${mounted.mountHertz}`);
assert.equal(mounted.mountDampingRatio, 1, `mount damping drifted: ${mounted.mountDampingRatio}`);
assert.ok(Number.isFinite(mounted.settledMaxAxisTilt), 'mount axis tilt is non-finite');
assert.ok(mounted.settledMaxAxisTilt < 1e-4,
  `local-axis mount did not hold axle orientation within 0.1 mrad: ${mounted.settledMaxAxisTilt}`);
assert.ok(Number.isFinite(mounted.settledMaxAbsOmegaX) && Number.isFinite(mounted.settledMaxAbsOmegaY),
  'mount non-spin angular velocity metrics are non-finite');

const compact = (run) => ({
  scope: run.scope,
  supportRadius: run.supportRadius,
  initialOmegaZ: run.initialOmegaZ,
  firstContactStep: run.firstContactStep,
  firstImpulseStep: run.firstImpulseStep,
  settledContactDropouts: run.settledContactDropouts,
  settledFeatureSetChanges: run.settledFeatureSetChanges,
  settledPointCountRange: [run.settledMinPointCount, run.settledMaxPointCount],
  settledYRangeMm: run.settledYRange * 1000,
  settledVxRangeMmPerS: (run.settledVxMax - run.settledVxMin) * 1000,
  settledOmegaRangeMilliRadPerS: (run.settledOmegaMax - run.settledOmegaMin) * 1000,
  settledMaxAbsVyMmPerS: run.settledMaxAbsVy * 1000,
  settledMaxAbsVzMmPerS: run.settledMaxAbsVz * 1000,
  settledMeanAbsSlipMmPerS: run.settledMeanAbsSlip * 1000,
  settledMaxAbsSlipMmPerS: run.settledMaxAbsSlip * 1000,
  settledNormalImpulseMean: run.settledNormalImpulseMean,
  settledNormalImpulseStd: run.settledNormalImpulseStd,
  settleVx: run.settleVx,
  finalVx: run.finalVx,
  measurementVxDelta: run.measurementVxDelta,
  settleOmegaZ: run.settleOmegaZ,
  finalOmegaZ: run.finalOmegaZ,
  measurementOmegaDelta: run.measurementOmegaDelta,
  finalSlipMmPerS: run.finalSlip * 1000,
  measurementDisplacementX: run.measurementDisplacementX,
});

const c = compact(control);
const m = {
  ...compact(mounted),
  mountHertz: mounted.mountHertz,
  mountDampingRatio: mounted.mountDampingRatio,
  settledMaxAxisTiltMicroRad: mounted.settledMaxAxisTilt * 1e6,
  settledMaxAbsOmegaXMilliRadPerS: mounted.settledMaxAbsOmegaX * 1000,
  settledMaxAbsOmegaYMilliRadPerS: mounted.settledMaxAbsOmegaY * 1000,
};

const safeRatio = (a, b) => Math.abs(b) > 1e-15 ? a / b : null;
const comparison = {
  yRangeRatio: safeRatio(mounted.settledYRange, control.settledYRange),
  maxAbsVyRatio: safeRatio(mounted.settledMaxAbsVy, control.settledMaxAbsVy),
  meanAbsSlipRatio: safeRatio(mounted.settledMeanAbsSlip, control.settledMeanAbsSlip),
  maxAbsSlipRatio: safeRatio(mounted.settledMaxAbsSlip, control.settledMaxAbsSlip),
  normalImpulseMeanRatio: safeRatio(mounted.settledNormalImpulseMean, control.settledNormalImpulseMean),
  contactDropoutDelta: mounted.settledContactDropouts - control.settledContactDropouts,
  featureChangeDelta: mounted.settledFeatureSetChanges - control.settledFeatureSetChanges,
  vxDeltaDifference: mounted.measurementVxDelta - control.measurementVxDelta,
  omegaDeltaDifference: mounted.measurementOmegaDelta - control.measurementOmegaDelta,
};

const result = {
  method: 'RQ2C0A_PARALLEL_AXIS_MOUNT_EQUIVALENCE',
  rationale: 'Replace only the wheel angular X/Y world-axis locks with a local-axis b3ParallelJoint against a static reference body. Retain the same linear-Z guide, flat road, donor outer-P75 carrier, matched 1 m/s rolling state, friction and solver/contact behavior. Use 120 Hz critical damping as a principled hard-like constraint scale tied to the existing 1/960 s solver substep; do not sweep stiffness to obtain a preferred result.',
  control: c,
  parallelMount: m,
  comparison,
  provenance: tire.provenance,
};

await writeFile('rq2c0a-parallel-mount-result.json', JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ2C0A_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ2C0A_EXECUTED');
