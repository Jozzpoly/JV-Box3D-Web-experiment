import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2hRunMatchedSphereRefreshControl, 'function');

const dt = 1 / 240;
const durationSeconds = 2;
const stepCount = Math.round(durationSeconds / dt);
const phase = 0;
const lockMode = 2;
const names = ['single-world-step-with-substeps', 'separate-world-steps-per-slice'];

function execute(spin, substeps, refreshMode) {
  const run = b3.e2a2hRunMatchedSphereRefreshControl(
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
    refreshMode,
  );
  assert.equal(run.valid, true, `invalid run spin=${spin} substeps=${substeps} refreshMode=${refreshMode}`);
  assert.equal(run.shapeControl, 'matchedSphere');
  assert.equal(run.motionLockMode, lockMode);
  assert.equal(run.refreshMode, refreshMode);
  assert.equal(run.solverSlicesPerOuterStep, substeps);
  assert.equal(run.narrowPhaseRefreshesPerOuterStep, refreshMode === 0 ? 1 : substeps);
  assert.equal(run.contactDropoutsAfterImpulse, 0);
  assert.equal(run.minPointCountAfterImpulse, 1);
  assert.equal(run.maxPointCountAfterImpulse, 1);
  assert.ok(run.firstImpulseStep >= 0);
  assert.ok(run.settledSamples > 0);
  return run;
}

function compact(r) {
  const gravityOuter = r.mass * 9.81 * r.dt;
  const gravitySlice = gravityOuter / r.subStepCount;
  return {
    refreshMode: r.refreshMode,
    refreshName: names[r.refreshMode],
    spin: r.spinRadiansPerSecond,
    substeps: r.subStepCount,
    narrowPhaseRefreshesPerOuterStep: r.narrowPhaseRefreshesPerOuterStep,
    solverSlicesPerOuterStep: r.solverSlicesPerOuterStep,
    outerAngleDeg: r.spinRadiansPerSecond * r.dt * 180 / Math.PI,
    refreshAngleDeg: r.spinRadiansPerSecond * r.dt / r.narrowPhaseRefreshesPerOuterStep * 180 / Math.PI,
    solverSliceAngleDeg: r.spinRadiansPerSecond * r.dt / r.solverSlicesPerOuterStep * 180 / Math.PI,
    firstImpulse: r.firstImpulseStep,
    totalImpulseMean: r.settledTotalImpulseMean,
    finalImpulseMean: r.settledFinalImpulseMean,
    totalImpulseOverGravityOuter: r.settledTotalImpulseMean / gravityOuter,
    finalImpulseOverGravitySlice: r.settledFinalImpulseMean / gravitySlice,
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

function spinComparison(zeroRun, spinRun) {
  const a = compact(zeroRun);
  const b = compact(spinRun);
  return {
    refreshMode: a.refreshMode,
    refreshName: a.refreshName,
    substeps: a.substeps,
    narrowPhaseRefreshesPerOuterStep: a.narrowPhaseRefreshesPerOuterStep,
    spin40RefreshAngleDeg: b.refreshAngleDeg,
    totalImpulseRatio40to0: b.totalImpulseMean / a.totalImpulseMean,
    finalImpulseRatio40to0: b.finalImpulseMean / a.finalImpulseMean,
    finalImpulseOverGravitySlice0: a.finalImpulseOverGravitySlice,
    finalImpulseOverGravitySlice40: b.finalImpulseOverGravitySlice,
    finalYDeltaMm: (b.finalY - a.finalY) * 1000,
    finalVyDelta: b.finalVy - a.finalVy,
    settledYRangeDeltaMm: b.settledYRangeMm - a.settledYRangeMm,
    finalAngularZ0: a.finalAngularZ,
    finalAngularZ40: b.finalAngularZ,
  };
}

function refreshComparison(baselineRun, refreshedRun) {
  const a = compact(baselineRun);
  const b = compact(refreshedRun);
  return {
    spin: a.spin,
    substeps: a.substeps,
    baselineRefreshAngleDeg: a.refreshAngleDeg,
    refreshedRefreshAngleDeg: b.refreshAngleDeg,
    finalYDeltaMmRefreshedMinusBaseline: (b.finalY - a.finalY) * 1000,
    finalVyDeltaRefreshedMinusBaseline: b.finalVy - a.finalVy,
    totalImpulseRatioRefreshedToBaseline: b.totalImpulseMean / a.totalImpulseMean,
    finalImpulseRatioRefreshedToBaseline: a.finalImpulseMean === 0 ? (b.finalImpulseMean === 0 ? 1 : null) : b.finalImpulseMean / a.finalImpulseMean,
  };
}

const runs = [];
const spinComparisons = [];
const refreshComparisons = [];
const raw = new Map();

for (const substeps of [1, 4]) {
  for (const refreshMode of [0, 1]) {
    const spin0 = execute(0, substeps, refreshMode);
    const spin40 = execute(40, substeps, refreshMode);
    raw.set(`${substeps}:${refreshMode}:0`, spin0);
    raw.set(`${substeps}:${refreshMode}:40`, spin40);
    runs.push(compact(spin0), compact(spin40));
    spinComparisons.push(spinComparison(spin0, spin40));
  }
  for (const spin of [0, 40]) {
    refreshComparisons.push(refreshComparison(
      raw.get(`${substeps}:0:${spin}`),
      raw.get(`${substeps}:1:${spin}`),
    ));
  }
}

// Apparatus identity control: with one solver slice both refresh modes execute
// exactly one World_Step(dt, 1), so they must agree to floating-point noise.
for (const spin of [0, 40]) {
  const a = raw.get(`1:0:${spin}`);
  const b = raw.get(`1:1:${spin}`);
  assert.ok(Math.abs(a.finalY - b.finalY) < 1e-7, `substeps=1 identity finalY drift spin=${spin}`);
  assert.ok(Math.abs(a.finalVy - b.finalVy) < 1e-7, `substeps=1 identity finalVy drift spin=${spin}`);
  assert.ok(Math.abs(a.settledTotalImpulseMean - b.settledTotalImpulseMean) < 1e-7, `substeps=1 identity impulse drift spin=${spin}`);
}

const baseline4 = spinComparisons.find((x) => x.substeps === 4 && x.refreshMode === 0);
const refreshed4 = spinComparisons.find((x) => x.substeps === 4 && x.refreshMode === 1);
const result = {
  scope: 'E2a2h matched native sphere at immediate touching, no motion locks, friction=0; compares one World_Step(dt=1/240, substeps=4) against four World_Step(dt=1/960, substeps=1) calls over the same 2 s physical duration',
  dt,
  durationSeconds,
  lockMode,
  refreshModes: names,
  apparatusIdentitySubsteps1: true,
  decisionSummary: {
    baselineSpin40FinalYDeltaMm: baseline4.finalYDeltaMm,
    refreshedSpin40FinalYDeltaMm: refreshed4.finalYDeltaMm,
    baselineSpin40FinalVyDelta: baseline4.finalVyDelta,
    refreshedSpin40FinalVyDelta: refreshed4.finalVyDelta,
    finalYErrorMagnitudeRatioRefreshedToBaseline: Math.abs(baseline4.finalYDeltaMm) > 0 ? Math.abs(refreshed4.finalYDeltaMm) / Math.abs(baseline4.finalYDeltaMm) : null,
    finalVyErrorMagnitudeRatioRefreshedToBaseline: Math.abs(baseline4.finalVyDelta) > 0 ? Math.abs(refreshed4.finalVyDelta) / Math.abs(baseline4.finalVyDelta) : null,
  },
  spinComparisons,
  refreshComparisons,
  runs,
};

console.log(`E2A2H_NARROW_PHASE_REFRESH_RESULT ${JSON.stringify(result)}`);
console.log('E2A2H_NARROW_PHASE_REFRESH_EXECUTED');
