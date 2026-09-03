import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2aOuterP75CarrierInfo, 'function', 'E2a carrier info binding missing');
assert.equal(typeof b3.e2aRunOuterP75GroundCarrier, 'function', 'E2a dynamic binding missing');

const tire = await loadOwnerM6TireGeometryR3();
if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire provenance drifted: ${JSON.stringify(tire.provenance)}`);
}

const stations = Array.from({ length: 129 }, (_, i) => {
  const t = i / 128;
  const axial = tire.bounds.axialMin + tire.bounds.axialWidth * t;
  return { axial, radius: tire.outerRadiusP75At(axial) };
});
const sourceOuterMax = Math.max(...stations.map((s) => s.radius));

const info = b3.e2aOuterP75CarrierInfo();
assert.equal(info.valid, true, `E2a carrier could not be constructed: ${JSON.stringify(info)}`);
assert.ok(info.rawHullCount > 0 && info.rawHullCount <= 8, `raw native support hull does not fit donor contract: ${info.rawHullCount}`);
assert.ok(info.effectiveProfileCount > 0 && info.effectiveProfileCount <= 8, `invalid effective donor profile count: ${info.effectiveProfileCount}`);
assert.ok(Math.abs(info.sourceOuterMax - sourceOuterMax) < 2e-6, `native/source outer max drifted: ${info.sourceOuterMax} vs ${sourceOuterMax}`);
assert.ok(Math.abs(info.supportRadiusDown - sourceOuterMax) < 2e-6, `carrier flat-ground support drifted: ${info.supportRadiusDown} vs ${sourceOuterMax}`);

const cases = [
  { name: 'phase0-spin0', phase: 0, spin: 0 },
  { name: 'phase0-spin40', phase: 0, spin: 40 },
  { name: 'phase156-spin40', phase: 156, spin: 40 },
  { name: 'phase157-spin40', phase: 157, spin: 40 },
  { name: 'phase158-spin40', phase: 158, spin: 40 },
  { name: 'phase191-spin40', phase: 191, spin: 40 },
  { name: 'phase192-spin40', phase: 192, spin: 40 },
];

const runs = cases.map((c) => {
  const run = b3.e2aRunOuterP75GroundCarrier(c.phase, c.spin, true);
  assert.equal(run.valid, true, `dynamic carrier failed for ${c.name}: ${JSON.stringify(run)}`);
  assert.ok(run.firstContactStep >= 0, `no contact created for ${c.name}`);
  assert.ok(run.firstImpulseStep >= 0, `no solver impulse for ${c.name}`);
  assert.ok(run.settledSamples > 0, `no settled observation window for ${c.name}`);
  return { name: c.name, ...run };
});

function spread(values) {
  return Math.max(...values) - Math.min(...values);
}
function signature(run) {
  return JSON.stringify(run.uniqueFeatureIds);
}
function compact(run) {
  return {
    name: run.name,
    phaseIndex: run.phaseIndex,
    spinRadiansPerSecond: run.spinRadiansPerSecond,
    firstContactStep: run.firstContactStep,
    firstImpulseStep: run.firstImpulseStep,
    contactDropoutsAfterImpulse: run.contactDropoutsAfterImpulse,
    featureSetChangesAfterImpulse: run.featureSetChangesAfterImpulse,
    contactIdChangesAfterImpulse: run.contactIdChangesAfterImpulse,
    uniqueFeatureIds: run.uniqueFeatureIds,
    minPointCountAfterImpulse: run.minPointCountAfterImpulse,
    maxPointCountAfterImpulse: run.maxPointCountAfterImpulse,
    maxNormalTiltDegAfterImpulse: run.maxNormalTiltDegAfterImpulse,
    settledYRangeMm: run.settledYRange * 1000,
    settledMaxAbsVy: run.settledMaxAbsVy,
    settledTotalImpulseMean: run.settledTotalImpulseMean,
    settledTotalImpulseStd: run.settledTotalImpulseStd,
    settledTotalImpulseMin: run.settledTotalImpulseMin,
    settledTotalImpulseMax: run.settledTotalImpulseMax,
    settledAngularZRange: [run.settledMinAngularZ, run.settledMaxAngularZ],
    finalY: run.finalY,
    finalVy: run.finalVy,
    finalAngularZ: run.finalAngularZ,
    contactSamples: run.contactSamples,
  };
}

const spinRuns = runs.filter((r) => r.spinRadiansPerSecond === 40);
const phaseComparison = {
  firstContactStepSpread: spread(spinRuns.map((r) => r.firstContactStep)),
  firstImpulseStepSpread: spread(spinRuns.map((r) => r.firstImpulseStep)),
  finalYSpreadMm: spread(spinRuns.map((r) => r.finalY)) * 1000,
  settledYRangeMaxMm: Math.max(...spinRuns.map((r) => r.settledYRange * 1000)),
  settledMaxAbsVyMax: Math.max(...spinRuns.map((r) => r.settledMaxAbsVy)),
  maxNormalTiltDeg: Math.max(...spinRuns.map((r) => r.maxNormalTiltDegAfterImpulse)),
  totalContactDropouts: spinRuns.reduce((sum, r) => sum + r.contactDropoutsAfterImpulse, 0),
  totalFeatureSetChanges: spinRuns.reduce((sum, r) => sum + r.featureSetChangesAfterImpulse, 0),
  totalContactIdChanges: spinRuns.reduce((sum, r) => sum + r.contactIdChangesAfterImpulse, 0),
  featureSignatures: [...new Set(spinRuns.map(signature))],
  pointCountRanges: [...new Set(spinRuns.map((r) => `${r.minPointCountAfterImpulse}:${r.maxPointCountAfterImpulse}`))],
};

const spin0 = runs.find((r) => r.name === 'phase0-spin0');
const spin40 = runs.find((r) => r.name === 'phase0-spin40');
const spinControl = {
  firstContactStepDelta: spin40.firstContactStep - spin0.firstContactStep,
  firstImpulseStepDelta: spin40.firstImpulseStep - spin0.firstImpulseStep,
  finalYDeltaMm: (spin40.finalY - spin0.finalY) * 1000,
  settledYRangeDeltaMm: (spin40.settledYRange - spin0.settledYRange) * 1000,
  featureSignatureEqual: signature(spin40) === signature(spin0),
};

const facet128TheoreticalDeficitMm = sourceOuterMax * (1 - Math.cos(Math.PI / 128)) * 1000;
const e1cMeasuredOnsetRangeMm = 0.164550542831;

const result = {
  scope: 'E2a broad flat-ground outer-support dynamic carrier only; no bore/inner/side validation',
  carrierInfo: info,
  outerSupportBridge: {
    sourceOuterMax,
    carrierSupportRadius: info.supportRadiusDown,
    supportErrorMm: (info.supportRadiusDown - sourceOuterMax) * 1000,
    facet128TheoreticalDeficitMm,
    e1cMeasuredOnsetRangeMm,
    facetVsMeasuredDifferenceMm: e1cMeasuredOnsetRangeMm - facet128TheoreticalDeficitMm,
  },
  phaseComparison,
  spinControl,
  runs: runs.map(compact),
  provenance: tire.provenance,
};

console.log(`E2A_OUTER_GROUND_DYNAMIC_RESULT ${JSON.stringify(result)}`);
console.log('E2A_OUTER_GROUND_DYNAMIC_EXECUTED');
