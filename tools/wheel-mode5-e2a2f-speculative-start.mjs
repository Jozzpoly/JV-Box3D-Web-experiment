import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2FlatP75CarrierInfo, 'function');
assert.equal(typeof b3.e2a2fRunMatchedSphereStartControl, 'function');

const carrierInfo = b3.e2a2FlatP75CarrierInfo();
assert.equal(carrierInfo.valid, true);
assert.equal(carrierInfo.effectiveProfileCount, 2);

const dt = 1 / 240;
const durationSeconds = 2;
const stepCount = Math.round(durationSeconds / dt);
const phase = 0;

function execute({ spin, substeps, startGap, allowFastRotation }) {
  const run = b3.e2a2fRunMatchedSphereStartControl(
    phase,
    spin,
    true,
    true,
    dt,
    stepCount,
    substeps,
    startGap,
    allowFastRotation,
  );
  assert.equal(run.valid, true, `invalid sphere run spin=${spin} substeps=${substeps} gap=${startGap} fast=${allowFastRotation}`);
  assert.equal(run.shapeControl, 'matchedSphere');
  assert.equal(run.attitudeLocked, true);
  assert.ok(Math.abs(run.startGap - startGap) < 1e-7);
  assert.equal(run.allowFastRotation, allowFastRotation);
  assert.equal(run.contactDropoutsAfterImpulse, 0);
  assert.equal(run.minPointCountAfterImpulse, 1);
  assert.equal(run.maxPointCountAfterImpulse, 1);
  assert.ok(run.firstContactStep >= 0);
  assert.ok(run.firstImpulseStep >= 0);
  assert.ok(run.settledSamples > 0);
  return run;
}

function compact(r) {
  const gravityOuter = r.mass * 9.81 * r.dt;
  const gravitySub = gravityOuter / r.subStepCount;
  return {
    spin: r.spinRadiansPerSecond,
    substeps: r.subStepCount,
    startGapMm: r.startGap * 1000,
    allowFastRotation: r.allowFastRotation,
    firstContact: r.firstContactStep,
    firstImpulse: r.firstImpulseStep,
    speculativeLeadSteps: r.firstImpulseStep - r.firstContactStep,
    speculativeLeadSeconds: (r.firstImpulseStep - r.firstContactStep) * r.dt,
    speculativeLeadSpinDeg: (r.firstImpulseStep - r.firstContactStep) * r.dt * r.spinRadiansPerSecond * 180 / Math.PI,
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
    substeps: a.substeps,
    startGapMm: a.startGapMm,
    allowFastRotation: a.allowFastRotation,
    firstImpulseDeltaSteps: b.firstImpulse - a.firstImpulse,
    speculativeLeadSpinDeg40: b.speculativeLeadSpinDeg,
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
  for (const startGap of [0.010, 0.0]) {
    for (const allowFastRotation of [true, false]) {
      const spin0 = execute({ spin: 0, substeps, startGap, allowFastRotation });
      const spin40 = execute({ spin: 40, substeps, startGap, allowFastRotation });
      runs.push(compact(spin0), compact(spin40));
      comparisons.push(compare(spin0, spin40));
    }
  }
}

const result = {
  scope: 'E2a2f matched sphere; isolates speculative 10 mm pre-contact start versus immediate touching and allowFastRotation at dt=1/240, substeps 1/4',
  carrierInfo,
  speculativeDistanceMm: 20,
  dt,
  durationSeconds,
  comparisons,
  runs,
};

console.log(`E2A2F_SPECULATIVE_START_RESULT ${JSON.stringify(result)}`);
console.log('E2A2F_SPECULATIVE_START_EXECUTED');
