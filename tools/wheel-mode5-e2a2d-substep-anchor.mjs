import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2FlatP75CarrierInfo, 'function');
assert.equal(typeof b3.e2a2dRunFlatP75GroundCarrierLockedSubsteps, 'function');

const carrierInfo = b3.e2a2FlatP75CarrierInfo();
assert.equal(carrierInfo.valid, true);
assert.equal(carrierInfo.effectiveProfileCount, 2);

const dt = 1 / 240;
const durationSeconds = 2;
const stepCount = Math.round(durationSeconds / dt);
const phase = 0;

function execute(spin, substeps) {
  const run = b3.e2a2dRunFlatP75GroundCarrierLockedSubsteps(
    phase,
    spin,
    true,
    true,
    dt,
    stepCount,
    substeps,
  );
  assert.equal(run.valid, true, `invalid run spin=${spin} substeps=${substeps}`);
  assert.equal(run.attitudeLocked, true);
  assert.equal(run.contactRecycling, true);
  assert.equal(run.warmStarting, true);
  assert.equal(run.subStepCount, substeps);
  assert.equal(run.contactDropoutsAfterImpulse, 0);
  assert.equal(run.minPointCountAfterImpulse, 2, `lost endpoint spin=${spin} substeps=${substeps}`);
  assert.equal(run.maxPointCountAfterImpulse, 2, `topology changed spin=${spin} substeps=${substeps}`);
  assert.ok(run.settledSamples > 0);
  return run;
}

function compact(r) {
  const gravityOuter = r.mass * 9.81 * r.dt;
  const gravitySubstep = gravityOuter / r.subStepCount;
  return {
    spin: r.spinRadiansPerSecond,
    substeps: r.subStepCount,
    h: r.dt / r.subStepCount,
    outerAngularStepDeg: r.spinRadiansPerSecond * r.dt * 180 / Math.PI,
    substepAngularStepDeg: r.spinRadiansPerSecond * r.dt / r.subStepCount * 180 / Math.PI,
    firstImpulse: r.firstImpulseStep,
    totalImpulseMean: r.settledTotalImpulseMean,
    finalImpulseMean: r.settledFinalImpulseMean,
    gravityOuter,
    gravitySubstep,
    totalImpulseOverGravityOuter: r.settledTotalImpulseMean / gravityOuter,
    finalImpulseOverGravitySubstep: gravitySubstep > 0 ? r.settledFinalImpulseMean / gravitySubstep : null,
    finalY: r.finalY,
    finalVy: r.finalVy,
    settledYRangeMm: r.settledYRange * 1000,
    settledMaxAbsVy: r.settledMaxAbsVy,
    featureChanges: r.featureSetChangesAfterImpulse,
    contactIdChanges: r.contactIdChangesAfterImpulse,
    persistedFraction: r.postImpulsePointCount > 0 ? r.postImpulsePersistedPointCount / r.postImpulsePointCount : null,
  };
}

function compare(spin0, spin40) {
  const a = compact(spin0);
  const b = compact(spin40);
  return {
    substeps: a.substeps,
    substepAngularStepDeg40: b.substepAngularStepDeg,
    firstImpulseDeltaSteps: b.firstImpulse - a.firstImpulse,
    totalImpulseRatio40to0: b.totalImpulseMean / a.totalImpulseMean,
    finalImpulseRatio40to0: b.finalImpulseMean / a.finalImpulseMean,
    finalImpulseOverGravitySubstep0: a.finalImpulseOverGravitySubstep,
    finalImpulseOverGravitySubstep40: b.finalImpulseOverGravitySubstep,
    finalYDeltaMm: (b.finalY - a.finalY) * 1000,
    finalVyDelta: b.finalVy - a.finalVy,
    settledYRangeDeltaMm: b.settledYRangeMm - a.settledYRangeMm,
    featureChanges0: a.featureChanges,
    featureChanges40: b.featureChanges,
    contactIdChanges0: a.contactIdChanges,
    contactIdChanges40: b.contactIdChanges,
  };
}

const runs = [];
const comparisons = [];
for (const substeps of [1, 2, 4, 8, 16]) {
  const spin0 = execute(0, substeps);
  const spin40 = execute(40, substeps);
  runs.push(compact(spin0), compact(spin40));
  comparisons.push(compare(spin0, spin40));
}

const result = {
  scope: 'E2a2d broad flat-ground P75 support only; attitude locked; fixed dt=1/240; isolates intra-World_Step fixed-anchor behavior by varying solver substeps',
  carrierInfo,
  dt,
  durationSeconds,
  comparisons,
  runs,
};

console.log(`E2A2D_SUBSTEP_ANCHOR_RESULT ${JSON.stringify(result)}`);
console.log('E2A2D_SUBSTEP_ANCHOR_EXECUTED');
