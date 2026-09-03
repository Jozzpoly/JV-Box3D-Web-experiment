import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2FlatP75CarrierInfo, 'function');
assert.equal(typeof b3.e2a2cRunFlatP75GroundCarrierLockedConfig, 'function');

const carrierInfo = b3.e2a2FlatP75CarrierInfo();
assert.equal(carrierInfo.valid, true);
assert.equal(carrierInfo.effectiveProfileCount, 2);

const durationSeconds = 2;
const phase = 0;

function execute({ spin, warm, recycling, dt }) {
  const stepCount = Math.round(durationSeconds / dt);
  assert.ok(stepCount >= 240 && stepCount <= 2400);
  assert.ok(Math.abs(stepCount * dt - durationSeconds) < 1e-9);

  const run = b3.e2a2cRunFlatP75GroundCarrierLockedConfig(
    phase,
    spin,
    warm,
    recycling,
    dt,
    stepCount,
  );
  assert.equal(run.valid, true, `invalid run spin=${spin} warm=${warm} recycling=${recycling} dt=${dt}`);
  assert.equal(run.attitudeLocked, true);
  assert.equal(run.contactRecycling, recycling);
  assert.equal(run.warmStarting, warm);
  assert.equal(run.stepCount, stepCount);
  assert.ok(run.firstContactStep >= 0 && run.firstImpulseStep >= 0);
  assert.equal(run.contactDropoutsAfterImpulse, 0, `contact dropout spin=${spin} warm=${warm} recycling=${recycling} dt=${dt}`);
  assert.equal(run.minPointCountAfterImpulse, 2, `support lost endpoint spin=${spin} warm=${warm} recycling=${recycling} dt=${dt}`);
  assert.equal(run.maxPointCountAfterImpulse, 2, `support topology changed spin=${spin} warm=${warm} recycling=${recycling} dt=${dt}`);
  assert.ok(run.settledSamples > 0);
  assert.ok(Math.abs(run.settledDelaySeconds - 0.5) <= dt + 1e-7);
  return run;
}

function compact(r) {
  const gravityImpulse = r.mass * 9.81 * r.dt;
  return {
    spin: r.spinRadiansPerSecond,
    warm: r.warmStarting,
    recycling: r.contactRecycling,
    dt: r.dt,
    stepCount: r.stepCount,
    angularStepRad: r.spinRadiansPerSecond * r.dt,
    angularStepDeg: r.spinRadiansPerSecond * r.dt * 180 / Math.PI,
    firstContact: r.firstContactStep,
    firstImpulse: r.firstImpulseStep,
    pointRange: [r.minPointCountAfterImpulse, r.maxPointCountAfterImpulse],
    featureChanges: r.featureSetChangesAfterImpulse,
    contactIdChanges: r.contactIdChangesAfterImpulse,
    persistedFraction: r.postImpulsePointCount > 0 ? r.postImpulsePersistedPointCount / r.postImpulsePointCount : null,
    totalImpulseMean: r.settledTotalImpulseMean,
    totalImpulseStd: r.settledTotalImpulseStd,
    finalImpulseMean: r.settledFinalImpulseMean,
    finalImpulseStd: r.settledFinalImpulseStd,
    gravityImpulsePerOuterStep: gravityImpulse,
    totalImpulseOverGravity: gravityImpulse > 0 ? r.settledTotalImpulseMean / gravityImpulse : null,
    finalY: r.finalY,
    finalVy: r.finalVy,
    settledYRangeMm: r.settledYRange * 1000,
    settledMaxAbsVy: r.settledMaxAbsVy,
    finalAngularZ: r.finalAngularZ,
  };
}

function compare(spin0, spin40) {
  const a = compact(spin0);
  const b = compact(spin40);
  return {
    warm: a.warm,
    recycling: a.recycling,
    dt: a.dt,
    angularStepDeg40: b.angularStepDeg,
    firstImpulseDeltaSteps: b.firstImpulse - a.firstImpulse,
    totalImpulseRatio40to0: b.totalImpulseMean / a.totalImpulseMean,
    totalImpulseDelta: b.totalImpulseMean - a.totalImpulseMean,
    totalImpulseOverGravity0: a.totalImpulseOverGravity,
    totalImpulseOverGravity40: b.totalImpulseOverGravity,
    finalImpulseRatio40to0: b.finalImpulseMean / a.finalImpulseMean,
    finalImpulseDelta: b.finalImpulseMean - a.finalImpulseMean,
    finalYDeltaMm: (b.finalY - a.finalY) * 1000,
    finalVyDelta: b.finalVy - a.finalVy,
    settledYRangeDeltaMm: b.settledYRangeMm - a.settledYRangeMm,
    persistedFraction0: a.persistedFraction,
    persistedFraction40: b.persistedFraction,
    featureChanges0: a.featureChanges,
    featureChanges40: b.featureChanges,
    contactIdChanges0: a.contactIdChanges,
    contactIdChanges40: b.contactIdChanges,
  };
}

const dtBase = 1 / 240;
const persistencePairs = [];
const persistenceRuns = [];
for (const warm of [true, false]) {
  for (const recycling of [true, false]) {
    const spin0 = execute({ spin: 0, warm, recycling, dt: dtBase });
    const spin40 = execute({ spin: 40, warm, recycling, dt: dtBase });
    persistenceRuns.push(compact(spin0), compact(spin40));
    persistencePairs.push(compare(spin0, spin40));
  }
}

const dtPairs = [];
const dtRuns = [];
for (const dt of [1 / 120, 1 / 240, 1 / 480, 1 / 960]) {
  const spin0 = execute({ spin: 0, warm: true, recycling: true, dt });
  const spin40 = execute({ spin: 40, warm: true, recycling: true, dt });
  dtRuns.push(compact(spin0), compact(spin40));
  dtPairs.push(compare(spin0, spin40));
}

const result = {
  scope: 'E2a2c broad flat-ground P75 support only; attitude locked; isolates spin invariance against warm starting, contact recycling, and World_Step angular displacement',
  carrierInfo,
  durationSeconds,
  subStepCount: persistenceRuns[0] ? 4 : null,
  persistenceMatrix: persistencePairs,
  dtSweep: dtPairs,
  runs: {
    persistence: persistenceRuns,
    dt: dtRuns,
  },
};

console.log(`E2A2C_SPIN_PERSISTENCE_RESULT ${JSON.stringify(result)}`);
console.log('E2A2C_SPIN_PERSISTENCE_EXECUTED');
