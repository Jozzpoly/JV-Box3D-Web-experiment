import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2gRunMatchedSphereLockControl, 'function');

const dt = 1 / 240;
const durationSeconds = 2;
const stepCount = Math.round(durationSeconds / dt);
const phase = 0;
const names = ['original-linear-and-angular', 'translation-only', 'none'];

function execute(spin, substeps, lockMode) {
  const run = b3.e2a2gRunMatchedSphereLockControl(
    phase,
    spin,
    true,
    true,
    dt,
    stepCount,
    substeps,
    0.0,
    true,
    lockMode,
  );
  assert.equal(run.valid, true, `invalid run spin=${spin} substeps=${substeps} lockMode=${lockMode}`);
  assert.equal(run.shapeControl, 'matchedSphere');
  assert.equal(run.motionLockMode, lockMode);
  assert.equal(run.contactDropoutsAfterImpulse, 0);
  assert.equal(run.minPointCountAfterImpulse, 1);
  assert.equal(run.maxPointCountAfterImpulse, 1);
  assert.ok(run.firstImpulseStep >= 0);
  assert.ok(run.settledSamples > 0);
  return run;
}

function compact(r) {
  const gravityOuter = r.mass * 9.81 * r.dt;
  const gravitySub = gravityOuter / r.subStepCount;
  return {
    lockMode: r.motionLockMode,
    lockName: names[r.motionLockMode],
    spin: r.spinRadiansPerSecond,
    substeps: r.subStepCount,
    firstImpulse: r.firstImpulseStep,
    totalImpulseMean: r.settledTotalImpulseMean,
    finalImpulseMean: r.settledFinalImpulseMean,
    totalImpulseOverGravityOuter: r.settledTotalImpulseMean / gravityOuter,
    finalImpulseOverGravitySubstep: r.settledFinalImpulseMean / gravitySub,
    finalY: r.finalY,
    finalVy: r.finalVy,
    settledYRangeMm: r.settledYRange * 1000,
    settledMaxAbsVy: r.settledMaxAbsVy,
    finalAngularZ: r.finalAngularZ,
    featureChanges: r.featureSetChangesAfterImpulse,
    contactIdChanges: r.contactIdChangesAfterImpulse,
    persistedFraction: r.postImpulsePointCount > 0 ? r.postImpulsePersistedPointCount / r.postImpulsePointCount : null,
  };
}

function compare(aRun, bRun) {
  const a = compact(aRun);
  const b = compact(bRun);
  return {
    lockMode: a.lockMode,
    lockName: a.lockName,
    substeps: a.substeps,
    firstImpulseDeltaSteps: b.firstImpulse - a.firstImpulse,
    totalImpulseRatio40to0: b.totalImpulseMean / a.totalImpulseMean,
    finalImpulseRatio40to0: b.finalImpulseMean / a.finalImpulseMean,
    finalImpulseOverGravitySubstep0: a.finalImpulseOverGravitySubstep,
    finalImpulseOverGravitySubstep40: b.finalImpulseOverGravitySubstep,
    finalYDeltaMm: (b.finalY - a.finalY) * 1000,
    finalVyDelta: b.finalVy - a.finalVy,
    settledYRangeDeltaMm: b.settledYRangeMm - a.settledYRangeMm,
    finalAngularZ0: a.finalAngularZ,
    finalAngularZ40: b.finalAngularZ,
  };
}

const runs = [];
const comparisons = [];
for (const substeps of [1, 4]) {
  for (const lockMode of [0, 1, 2]) {
    const spin0 = execute(0, substeps, lockMode);
    const spin40 = execute(40, substeps, lockMode);
    runs.push(compact(spin0), compact(spin40));
    comparisons.push(compare(spin0, spin40));
  }
}

const result = {
  scope: 'E2a2g matched sphere at immediate touching; isolates original motion locks vs translation-only vs no locks, dt=1/240, substeps 1/4',
  dt,
  durationSeconds,
  lockModes: names,
  comparisons,
  runs,
};

console.log(`E2A2G_MOTION_LOCK_RESULT ${JSON.stringify(result)}`);
console.log('E2A2G_MOTION_LOCK_EXECUTED');
