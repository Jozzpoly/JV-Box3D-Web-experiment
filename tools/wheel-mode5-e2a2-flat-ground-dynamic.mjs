import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2FlatP75CarrierInfo, 'function', 'E2a2 carrier info binding missing');
assert.equal(typeof b3.e2a2RunFlatP75GroundCarrier, 'function', 'E2a2 dynamic binding missing');

const tire = await loadOwnerM6TireGeometryR3();
if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire provenance drifted: ${JSON.stringify(tire.provenance)}`);
}

const stations = Array.from({ length: 129 }, (_, i) => {
  const t = i / 128;
  const axial = tire.bounds.axialMin + tire.bounds.axialWidth * t;
  return { i, axial, radius: tire.outerRadiusP75At(axial) };
});
const sourceOuterMax = Math.max(...stations.map((s) => s.radius));
const plateau = stations.filter((s) => Math.abs(s.radius - sourceOuterMax) <= 1e-12);
assert.ok(plateau.length >= 2, 'source P75 plateau disappeared');
const sourceLeft = plateau[0];
const sourceRight = plateau.at(-1);

const info = b3.e2a2FlatP75CarrierInfo();
assert.equal(info.valid, true, `E2a2 carrier could not be constructed: ${JSON.stringify(info)}`);
assert.equal(info.rawProfileCount, 2, 'E2a2 source carrier is not two-point');
assert.equal(info.effectiveProfileCount, 2, 'donor mutated E2a2 two-point plateau carrier');
assert.ok(Math.abs(info.plateauAxialMin - sourceLeft.axial) < 2e-6,
  `left plateau endpoint drifted: ${info.plateauAxialMin} vs ${sourceLeft.axial}`);
assert.ok(Math.abs(info.plateauAxialMax - sourceRight.axial) < 2e-6,
  `right plateau endpoint drifted: ${info.plateauAxialMax} vs ${sourceRight.axial}`);
assert.ok(Math.abs(info.supportRadiusDown - sourceOuterMax) < 2e-6,
  `flat support radius drifted: ${info.supportRadiusDown} vs ${sourceOuterMax}`);

const cases = [
  { name: 'phase0-spin0-warm', phase: 0, spin: 0, warm: true },
  { name: 'phase0-spin40-warm', phase: 0, spin: 40, warm: true },
  { name: 'phase156-spin40-warm', phase: 156, spin: 40, warm: true },
  { name: 'phase157-spin40-warm', phase: 157, spin: 40, warm: true },
  { name: 'phase158-spin40-warm', phase: 158, spin: 40, warm: true },
  { name: 'phase191-spin40-warm', phase: 191, spin: 40, warm: true },
  { name: 'phase192-spin40-warm', phase: 192, spin: 40, warm: true },
  { name: 'phase157-spin40-cold', phase: 157, spin: 40, warm: false },
];

const runs = cases.map((c) => {
  const run = b3.e2a2RunFlatP75GroundCarrier(c.phase, c.spin, c.warm);
  assert.equal(run.valid, true, `E2a2 dynamic carrier failed for ${c.name}: ${JSON.stringify(run)}`);
  assert.equal(run.effectiveProfileCount, 2, `E2a2 effective profile drifted in ${c.name}`);
  assert.ok(run.firstContactStep >= 0, `no contact created for ${c.name}`);
  assert.ok(run.firstImpulseStep >= 0, `no solver impulse for ${c.name}`);
  assert.ok(run.settledSamples > 0, `no settled observation window for ${c.name}`);
  // This is an apparatus requirement, not a performance threshold: the whole
  // purpose of E2a2 is to exercise the real two-endpoint plane support segment.
  assert.equal(run.minPointCountAfterImpulse, 2, `support segment collapsed below two manifold points in ${c.name}`);
  assert.equal(run.maxPointCountAfterImpulse, 2, `unexpected manifold topology in ${c.name}`);
  return { name: c.name, ...run };
});

const spread = (values) => Math.max(...values) - Math.min(...values);
const signature = (run) => JSON.stringify(run.uniqueFeatureIds);
const compactSamples = (samples) => samples.map((s) => ({
  step: s.step,
  y: s.y,
  vy: s.vy,
  pts: s.pointCount,
  persisted: s.persistedCount,
  impulse: s.totalNormalImpulse,
  finalImpulse: s.finalNormalImpulse,
  normalTiltDeg: s.normalTiltDeg,
  featureIds: s.featureIds,
}));
const compact = (run) => ({
  name: run.name,
  phaseIndex: run.phaseIndex,
  spinRadiansPerSecond: run.spinRadiansPerSecond,
  warmStarting: run.warmStarting,
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
  contactSamples: compactSamples(run.contactSamples),
});

const warmSpin = runs.filter((r) => r.warmStarting && r.spinRadiansPerSecond === 40);
const phaseComparison = {
  firstContactStepSpread: spread(warmSpin.map((r) => r.firstContactStep)),
  firstImpulseStepSpread: spread(warmSpin.map((r) => r.firstImpulseStep)),
  finalYSpreadMm: spread(warmSpin.map((r) => r.finalY)) * 1000,
  settledYRangeSpreadMm: spread(warmSpin.map((r) => r.settledYRange)) * 1000,
  settledYRangeMaxMm: Math.max(...warmSpin.map((r) => r.settledYRange * 1000)),
  settledMaxAbsVySpread: spread(warmSpin.map((r) => r.settledMaxAbsVy)),
  settledMaxAbsVyMax: Math.max(...warmSpin.map((r) => r.settledMaxAbsVy)),
  impulseMeanSpread: spread(warmSpin.map((r) => r.settledTotalImpulseMean)),
  impulseStdSpread: spread(warmSpin.map((r) => r.settledTotalImpulseStd)),
  maxNormalTiltDeg: Math.max(...warmSpin.map((r) => r.maxNormalTiltDegAfterImpulse)),
  totalContactDropouts: warmSpin.reduce((sum, r) => sum + r.contactDropoutsAfterImpulse, 0),
  totalFeatureSetChanges: warmSpin.reduce((sum, r) => sum + r.featureSetChangesAfterImpulse, 0),
  totalContactIdChanges: warmSpin.reduce((sum, r) => sum + r.contactIdChangesAfterImpulse, 0),
  featureSignatures: [...new Set(warmSpin.map(signature))],
  pointCountRanges: [...new Set(warmSpin.map((r) => `${r.minPointCountAfterImpulse}:${r.maxPointCountAfterImpulse}`))],
};

const spin0 = runs.find((r) => r.name === 'phase0-spin0-warm');
const spin40 = runs.find((r) => r.name === 'phase0-spin40-warm');
const cold157 = runs.find((r) => r.name === 'phase157-spin40-cold');
const warm157 = runs.find((r) => r.name === 'phase157-spin40-warm');
const spinControl = {
  firstContactStepDelta: spin40.firstContactStep - spin0.firstContactStep,
  firstImpulseStepDelta: spin40.firstImpulseStep - spin0.firstImpulseStep,
  finalYDeltaMm: (spin40.finalY - spin0.finalY) * 1000,
  settledYRangeDeltaMm: (spin40.settledYRange - spin0.settledYRange) * 1000,
  featureSignatureEqual: signature(spin40) === signature(spin0),
};
const warmStartControl = {
  firstContactStepDelta: cold157.firstContactStep - warm157.firstContactStep,
  firstImpulseStepDelta: cold157.firstImpulseStep - warm157.firstImpulseStep,
  finalYDeltaMm: (cold157.finalY - warm157.finalY) * 1000,
  settledYRangeDeltaMm: (cold157.settledYRange - warm157.settledYRange) * 1000,
  settledMaxAbsVyDelta: cold157.settledMaxAbsVy - warm157.settledMaxAbsVy,
  impulseStdDelta: cold157.settledTotalImpulseStd - warm157.settledTotalImpulseStd,
  featureSignatureEqual: signature(cold157) === signature(warm157),
};

const result = {
  scope: 'E2a2 true P75 broad flat-ground support segment only; not a full tire and no bore/inner/side/shoulder validation',
  sourcePlateau: {
    left: sourceLeft,
    right: sourceRight,
    stationCount: plateau.length,
    maxRadius: sourceOuterMax,
  },
  carrierInfo: info,
  phaseComparison,
  spinControl,
  warmStartControl,
  runs: runs.map(compact),
  provenance: tire.provenance,
};

console.log(`E2A2_FLAT_GROUND_DYNAMIC_RESULT ${JSON.stringify(result)}`);
console.log('E2A2_FLAT_GROUND_DYNAMIC_EXECUTED');
