import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2iRunMatchedSphereSpinAxisControl, 'function');

const dt = 1 / 240;
const durationSeconds = 2;
const stepCount = Math.round(durationSeconds / dt);
const phase = 0;
const lockMode = 2;
const axisNames = ['X-tangent', 'Y-contact-normal', 'Z-tangent'];

function execute(spin, substeps, spinAxis) {
  const run = b3.e2a2iRunMatchedSphereSpinAxisControl(
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
    spinAxis,
  );
  assert.equal(run.valid, true, `invalid run spin=${spin} substeps=${substeps} axis=${spinAxis}`);
  assert.equal(run.shapeControl, 'matchedSphere');
  assert.equal(run.motionLockMode, lockMode);
  assert.equal(run.spinAxis, spinAxis);
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
    axis: r.spinAxis,
    axisName: axisNames[r.spinAxis],
    spin: r.spinRadiansPerSecond,
    substeps: r.subStepCount,
    worldStepAngleDeg: r.spinRadiansPerSecond * r.dt * 180 / Math.PI,
    solverSliceAngleDeg: r.spinRadiansPerSecond * r.dt / r.subStepCount * 180 / Math.PI,
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

function compare(baselineRun, spinRun) {
  const a = compact(baselineRun);
  const b = compact(spinRun);
  return {
    axis: b.axis,
    axisName: b.axisName,
    substeps: b.substeps,
    worldStepAngleDeg: b.worldStepAngleDeg,
    totalImpulseRatio40to0: b.totalImpulseMean / a.totalImpulseMean,
    finalImpulseRatio40to0: b.finalImpulseMean / a.finalImpulseMean,
    finalImpulseOverGravitySlice0: a.finalImpulseOverGravitySlice,
    finalImpulseOverGravitySlice40: b.finalImpulseOverGravitySlice,
    finalYDeltaMm: (b.finalY - a.finalY) * 1000,
    finalVyDelta: b.finalVy - a.finalVy,
    settledYRangeDeltaMm: b.settledYRangeMm - a.settledYRangeMm,
    finalAngularZ: b.finalAngularZ,
  };
}

const runs = [];
const comparisons = [];
for (const substeps of [1, 4]) {
  // A zero-spin sphere has no meaningful spin axis; use Z only as the shared baseline.
  const baseline = execute(0, substeps, 2);
  runs.push(compact(baseline));
  for (const axis of [0, 1, 2]) {
    const spin40 = execute(40, substeps, axis);
    runs.push(compact(spin40));
    comparisons.push(compare(baseline, spin40));
  }
}

const result = {
  scope: 'E2a2i matched native sphere, immediate touching, no motion locks, friction=0; same |omega|=40 rad/s about tangent X, contact-normal Y, or tangent Z axes at dt=1/240 with substeps 1/4',
  dt,
  durationSeconds,
  lockMode,
  axisNames,
  mechanismPrediction: 'If rotating fixed material anchors cause the support error, contact-normal Y spin should remain near spin0 while tangent X/Z spins should reproduce the pathology.',
  comparisons,
  runs,
};

console.log(`E2A2I_SPIN_AXIS_RESULT ${JSON.stringify(result)}`);
console.log('E2A2I_SPIN_AXIS_EXECUTED');
