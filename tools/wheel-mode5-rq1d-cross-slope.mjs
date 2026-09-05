import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.rq1dRunOuterP75CrossSlope, 'function', 'RQ1d diagnostic binding missing');
assert.equal(typeof b3.e2aOuterP75CarrierInfo, 'function', 'E2a carrier info binding missing');

const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire provenance marker contract drifted');

const info = b3.e2aOuterP75CarrierInfo();
assert.equal(info.valid, true, `outer P75 dynamic profile unavailable: ${JSON.stringify(info)}`);
assert.equal(info.effectiveProfileCount, 3,
  `effective donor carrier profile changed; re-ground RQ1d before interpreting: ${JSON.stringify(info)}`);

const flat = b3.rq1dRunOuterP75CrossSlope(0);
const plus = b3.rq1dRunOuterP75CrossSlope(10);
const minus = b3.rq1dRunOuterP75CrossSlope(-10);

// Preserve complete executed values before any semantic assertion so a future
// apparatus mismatch cannot hide already-computed dynamic evidence.
console.log('WHEEL_MODE5_RQ1D_RAW', JSON.stringify({ info, flat, plus10: plus, minus10: minus }));

for (const [name, run] of [['flat', flat], ['plus10', plus], ['minus10', minus]]) {
  assert.equal(run.valid, true, `${name} RQ1d run invalid: ${JSON.stringify(run)}`);
  assert.ok(run.firstContactStep >= 0, `${name}: no contact`);
  assert.ok(run.firstImpulseStep >= 0, `${name}: no normal solver impulse`);
  assert.ok(run.settledSamples > 600, `${name}: insufficient steady observation window`);
  assert.ok(Number.isFinite(run.finalVx) && Number.isFinite(run.finalOmegaZ), `${name}: non-finite final motion`);
  assert.ok(Math.abs(run.finalX) < 9.5, `${name}: wheel left bounded road apparatus`);
  assert.ok(run.settledMaxAbsVz < 1e-8, `${name}: planar axle lock failed, max |Vz|=${run.settledMaxAbsVz}`);
  assert.ok(Number.isFinite(run.settledMeanNormalZ), `${name}: no settled manifold normal samples`);
}

// RQ1d was initially designed under the hypothesis that flat support was a
// profile segment. The executed effective-carrier probe falsified that model:
// b3MakeWheelProfile reduces the recovered outer carrier to a three-point,
// crowned profile whose flat support is the central vertex (index 1). The
// signed ±10 urad banks are therefore deliberately reclassified as a
// SAME-SUPPORT-FEATURE relative-normal perturbation. This gate protects that
// corrected interpretation rather than forcing an artificial topology switch.
for (const [name, run] of [['flat', flat], ['plus10', plus], ['minus10', minus]]) {
  assert.equal(run.predictedSupportPointCount, 1,
    `${name}: effective donor support is not a unique vertex: ${JSON.stringify(run)}`);
  assert.equal(run.predictedSupportFirst, 1,
    `${name}: effective donor support left central vertex unexpectedly: ${JSON.stringify(run)}`);
  assert.equal(run.predictedSupportLast, 1,
    `${name}: effective donor support left central vertex unexpectedly: ${JSON.stringify(run)}`);
}

// The actual manifold normal must resolve the transverse road rotation. We do
// not require any particular disturbance magnitude, only that the geometric
// challenge is genuinely present and signed in the executed contact.
assert.ok(Math.abs(flat.settledMeanNormalZ) < 1e-6,
  `flat control acquired material normal Z: ${flat.settledMeanNormalZ}`);
assert.ok(Math.abs(plus.settledMeanNormalZ) > 5e-6,
  `+10 urad bank did not produce material normal Z: ${plus.settledMeanNormalZ}`);
assert.ok(Math.abs(minus.settledMeanNormalZ) > 5e-6,
  `-10 urad bank did not produce material normal Z: ${minus.settledMeanNormalZ}`);
assert.ok(plus.settledMeanNormalZ * minus.settledMeanNormalZ < 0,
  `signed banks did not produce opposite contact-normal Z signs: +${plus.settledMeanNormalZ}, -${minus.settledMeanNormalZ}`);

const compact = (run) => ({
  bankMicroradians: run.bankMicroradians,
  roadNormal: [run.roadNormalX, run.roadNormalY, run.roadNormalZ],
  predictedSupport: {
    first: run.predictedSupportFirst,
    last: run.predictedSupportLast,
    pointCount: run.predictedSupportPointCount,
    tolerance: run.predictedSupportTolerance,
  },
  rollingRadiusX: run.rollingRadiusX,
  firstContactStep: run.firstContactStep,
  firstImpulseStep: run.firstImpulseStep,
  settledContactDropouts: run.settledContactDropouts,
  settledFeatureSetChanges: run.settledFeatureSetChanges,
  pointCountRange: [run.settledMinPointCount, run.settledMaxPointCount],
  yRangeMm: run.settledYRange * 1000,
  maxAbsVyMmPerS: run.settledMaxAbsVy * 1000,
  maxAbsVzMmPerS: run.settledMaxAbsVz * 1000,
  meanAbsSlipMmPerS: run.settledMeanAbsSlip * 1000,
  maxAbsSlipMmPerS: run.settledMaxAbsSlip * 1000,
  meanManifoldNormal: [run.settledMeanNormalX, run.settledMeanNormalY, run.settledMeanNormalZ],
  normalImpulseMean: run.settledNormalImpulseMean,
  normalImpulseStd: run.settledNormalImpulseStd,
  measurementDisplacementX: run.measurementDisplacementX,
  measurementVxDelta: run.measurementVxDelta,
  measurementOmegaDelta: run.measurementOmegaDelta,
  finalVx: run.finalVx,
  finalOmegaZ: run.finalOmegaZ,
  finalSlipMmPerS: run.finalSlip * 1000,
});

const safeRatio = (a, b) => Math.abs(b) > 1e-15 ? a / b : null;
const comparison = {
  plusVsFlat: {
    yRangeRatio: safeRatio(plus.settledYRange, flat.settledYRange),
    maxAbsVyRatio: safeRatio(plus.settledMaxAbsVy, flat.settledMaxAbsVy),
    maxAbsSlipRatio: safeRatio(plus.settledMaxAbsSlip, flat.settledMaxAbsSlip),
    contactDropoutDelta: plus.settledContactDropouts - flat.settledContactDropouts,
    featureChangeDelta: plus.settledFeatureSetChanges - flat.settledFeatureSetChanges,
    finalVxDelta: plus.finalVx - flat.finalVx,
    finalOmegaDelta: plus.finalOmegaZ - flat.finalOmegaZ,
  },
  minusVsFlat: {
    yRangeRatio: safeRatio(minus.settledYRange, flat.settledYRange),
    maxAbsVyRatio: safeRatio(minus.settledMaxAbsVy, flat.settledMaxAbsVy),
    maxAbsSlipRatio: safeRatio(minus.settledMaxAbsSlip, flat.settledMaxAbsSlip),
    contactDropoutDelta: minus.settledContactDropouts - flat.settledContactDropouts,
    featureChangeDelta: minus.settledFeatureSetChanges - flat.settledFeatureSetChanges,
    finalVxDelta: minus.finalVx - flat.finalVx,
    finalOmegaDelta: minus.finalOmegaZ - flat.finalOmegaZ,
  },
  signedSymmetry: {
    normalZSum: plus.settledMeanNormalZ + minus.settledMeanNormalZ,
    yRangeDifferenceMm: (plus.settledYRange - minus.settledYRange) * 1000,
    maxAbsVyDifferenceMmPerS: (plus.settledMaxAbsVy - minus.settledMaxAbsVy) * 1000,
    maxAbsSlipDifferenceMmPerS: (plus.settledMaxAbsSlip - minus.settledMaxAbsSlip) * 1000,
    finalVxDifference: plus.finalVx - minus.finalVx,
    finalOmegaDifference: plus.finalOmegaZ - minus.finalOmegaZ,
  },
};

const profile = info.profile;
const centerIndex = 1;
const center = profile[centerIndex];
const equalityAngles = profile
  .map((point, index) => {
    if (index === centerIndex) return null;
    const dx = point.axial - center.axial;
    const dr = point.radius - center.radius;
    if (Math.abs(dx) < 1e-15) return null;
    const radians = Math.atan(dr / dx);
    return {
      againstIndex: index,
      radians,
      microradians: radians * 1e6,
      degrees: radians * 180 / Math.PI,
    };
  })
  .filter(Boolean);

const result = {
  method: 'RQ1D_SIGNED_CROSS_SLOPE_SAME_FEATURE_RELATIVE_NORMAL',
  scope: flat.scope,
  rationale: 'Transverse static-road rotation preserves the qualified RQ0 wheel body, world-Z spin, planar axle locks and central effective support vertex while changing only the signed road-normal axial component, without longitudinal grade acceleration.',
  testedBanksMicroradians: [0, 10, -10],
  effectiveCarrierSupportTopology: {
    effectiveProfileCount: info.effectiveProfileCount,
    profile,
    flatSupportIndex: flat.predictedSupportFirst,
    plus10SupportIndex: plus.predictedSupportFirst,
    minus10SupportIndex: minus.predictedSupportFirst,
    equalityAngles,
    geometryProbeRun: 33955759171,
  },
  noDriveTorque: true,
  noRecyclerManipulation: true,
  runs: {
    flat: compact(flat),
    plus10: compact(plus),
    minus10: compact(minus),
  },
  comparison,
  provenance: tire.provenance,
};

await writeFile('rq1d-cross-slope-result.json', JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ1D_CROSS_SLOPE_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ1D_CROSS_SLOPE_EXECUTED');
