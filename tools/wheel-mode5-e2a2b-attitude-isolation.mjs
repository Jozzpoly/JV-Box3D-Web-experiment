import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2FlatP75CarrierInfo, 'function');
assert.equal(typeof b3.e2a2RunFlatP75GroundCarrier, 'function');
assert.equal(typeof b3.e2a2bRunFlatP75GroundCarrierLocked, 'function');

const info = b3.e2a2FlatP75CarrierInfo();
assert.equal(info.valid, true);
assert.equal(info.effectiveProfileCount, 2);

const freeControl = b3.e2a2RunFlatP75GroundCarrier(0, 40, true);
assert.equal(freeControl.valid, true);
assert.ok(freeControl.firstImpulseStep >= 0);

const phases = [0, 156, 157, 158, 191, 192];
const locked = phases.map((phase) => {
  const run = b3.e2a2bRunFlatP75GroundCarrierLocked(phase, 40, true);
  assert.equal(run.valid, true, `locked carrier failed at phase ${phase}`);
  assert.equal(run.attitudeLocked, true);
  assert.ok(run.firstContactStep >= 0 && run.firstImpulseStep >= 0, `missing contact/impulse at phase ${phase}`);
  assert.equal(run.minPointCountAfterImpulse, 2, `locked support lost an endpoint at phase ${phase}`);
  assert.equal(run.maxPointCountAfterImpulse, 2, `locked support changed topology at phase ${phase}`);
  return run;
});
const lockedSpin0 = b3.e2a2bRunFlatP75GroundCarrierLocked(0, 0, true);
assert.equal(lockedSpin0.valid, true);
assert.equal(lockedSpin0.minPointCountAfterImpulse, 2);
assert.equal(lockedSpin0.maxPointCountAfterImpulse, 2);

const spread = (xs) => Math.max(...xs) - Math.min(...xs);
const compact = (r) => ({
  phase: r.phaseIndex,
  spin: r.spinRadiansPerSecond,
  firstContact: r.firstContactStep,
  firstImpulse: r.firstImpulseStep,
  dropouts: r.contactDropoutsAfterImpulse,
  featureChanges: r.featureSetChangesAfterImpulse,
  contactIdChanges: r.contactIdChangesAfterImpulse,
  features: r.uniqueFeatureIds,
  pointRange: [r.minPointCountAfterImpulse, r.maxPointCountAfterImpulse],
  normalTiltDeg: r.maxNormalTiltDegAfterImpulse,
  settledYRangeMm: r.settledYRange * 1000,
  settledMaxAbsVy: r.settledMaxAbsVy,
  impulseMean: r.settledTotalImpulseMean,
  impulseStd: r.settledTotalImpulseStd,
  finalY: r.finalY,
  finalVy: r.finalVy,
  finalAngularZ: r.finalAngularZ,
});

const result = {
  scope: 'E2a2b isolates spin phase from attitude/camber for the true P75 flat support segment; still not a full tire',
  carrierInfo: info,
  freeControl: compact(freeControl),
  lockedSpin0: compact(lockedSpin0),
  lockedSpin40: locked.map(compact),
  phaseComparison: {
    firstContactSpread: spread(locked.map((r) => r.firstContactStep)),
    firstImpulseSpread: spread(locked.map((r) => r.firstImpulseStep)),
    finalYSpreadMm: spread(locked.map((r) => r.finalY)) * 1000,
    settledYRangeSpreadMm: spread(locked.map((r) => r.settledYRange)) * 1000,
    maxVySpread: spread(locked.map((r) => r.settledMaxAbsVy)),
    impulseMeanSpread: spread(locked.map((r) => r.settledTotalImpulseMean)),
    impulseStdSpread: spread(locked.map((r) => r.settledTotalImpulseStd)),
    totalDropouts: locked.reduce((a, r) => a + r.contactDropoutsAfterImpulse, 0),
    totalFeatureChanges: locked.reduce((a, r) => a + r.featureSetChangesAfterImpulse, 0),
    totalContactIdChanges: locked.reduce((a, r) => a + r.contactIdChangesAfterImpulse, 0),
    featureSignatures: [...new Set(locked.map((r) => JSON.stringify(r.uniqueFeatureIds)))],
    pointRanges: [...new Set(locked.map((r) => `${r.minPointCountAfterImpulse}:${r.maxPointCountAfterImpulse}`))],
  },
  spinControl: {
    firstImpulseDelta: locked[0].firstImpulseStep - lockedSpin0.firstImpulseStep,
    finalYDeltaMm: (locked[0].finalY - lockedSpin0.finalY) * 1000,
    settledYRangeDeltaMm: (locked[0].settledYRange - lockedSpin0.settledYRange) * 1000,
    featureSignatureEqual: JSON.stringify(locked[0].uniqueFeatureIds) === JSON.stringify(lockedSpin0.uniqueFeatureIds),
  },
};

console.log(`E2A2B_ATTITUDE_ISOLATION_RESULT ${JSON.stringify(result)}`);
console.log('E2A2B_ATTITUDE_ISOLATION_EXECUTED');
