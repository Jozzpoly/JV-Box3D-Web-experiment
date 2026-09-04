import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2acRunForceFreshRecyclerAblation, 'function', 'E2a2ac runner missing');

const spin = 5;
const crossingAngularSpeed = 2.0e-5;
const cases = [
  { recycleDistance: 0.05, forceFresh: false, label: 'recycle-normal' },
  { recycleDistance: 0.05, forceFresh: true, label: 'eligible-force-fresh' },
  { recycleDistance: 0.0, forceFresh: false, label: 'recycle-off' },
];
const directions = [
  { direction: 1, label: '2to1' },
  { direction: -1, label: '1to2' },
];

const approxEqual = (actual, expected, tolerance, message) => {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `${message}: actual=${actual} expected=${expected} tolerance=${tolerance}`);
};

const rows = [];
for (const c of cases) {
  for (const d of directions) {
    const raw = b3.e2a2acRunForceFreshRecyclerAblation(
      spin,
      d.direction,
      c.recycleDistance,
      crossingAngularSpeed,
      c.forceFresh,
    );
    assert.equal(raw.valid, true, `${c.label}/${d.label}: invalid run`);
    assert.equal(raw.groundBodyStatic, true, `${c.label}/${d.label}: ground not static`);
    assert.equal(raw.groundMotionMode, 'SET_TRANSFORM_BEFORE_STEP', `${c.label}/${d.label}: motion mode drift`);
    assert.equal(raw.forceFreshOnRecycleEligible, c.forceFresh, `${c.label}/${d.label}: force-fresh flag drift`);
    approxEqual(raw.requestedRecycleDistance, c.recycleDistance, 1e-7, `${c.label}/${d.label}: recycle-distance drift`);
    approxEqual(raw.crossingAngularSpeed, crossingAngularSpeed, 1e-10, `${c.label}/${d.label}: crossing-rate drift`);
    assert.equal(raw.contactDropoutsMotion, 0, `${c.label}/${d.label}: contact dropout`);
    assert.equal(raw.contactIdChangesMotion, 0, `${c.label}/${d.label}: contact ID changed`);
    assert.equal(raw.transitionCount, 1, `${c.label}/${d.label}: expected one topology transition`);
    assert.equal(raw.transitionPersistedCount, 1, `${c.label}/${d.label}: transition did not preserve one feature`);

    rows.push({
      case: c.label,
      direction: d.label,
      recycleDistance: c.recycleDistance,
      forceFreshOnRecycleEligible: c.forceFresh,
      recycleEligibleCount: raw.recycleEligibleCount,
      recycledStepsMotion: raw.recycledStepsMotion,
      motionSteps: raw.motionSteps,
      transitionStep: raw.transitionStep,
      transitionFrom: raw.transitionFrom,
      transitionTo: raw.transitionTo,
      transitionPersistedCount: raw.transitionPersistedCount,
      transitionVyDelta: raw.transitionVyDelta,
      transitionFinalImpulseDelta: raw.transitionFinalImpulseDelta,
      transitionTotalImpulseDelta: raw.transitionTotalImpulseDelta,
      maxAbsVyMotion: raw.maxAbsVyMotion,
      contactDropoutsMotion: raw.contactDropoutsMotion,
      contactIdChangesMotion: raw.contactIdChangesMotion,
      finalY: raw.finalY,
      finalVy: raw.finalVy,
      transitionSamples: raw.transitionSamples,
    });
  }
}

for (const d of directions) {
  const normal = rows.find((r) => r.case === 'recycle-normal' && r.direction === d.label);
  const forced = rows.find((r) => r.case === 'eligible-force-fresh' && r.direction === d.label);
  const off = rows.find((r) => r.case === 'recycle-off' && r.direction === d.label);
  assert.ok(normal && forced && off, `${d.label}: missing comparison row`);
  assert.ok(normal.recycleEligibleCount > 0, `${d.label}: normal recycler never eligible`);
  assert.equal(forced.recycleEligibleCount, normal.recycleEligibleCount,
    `${d.label}: force-fresh changed recycler eligibility cadence`);
  assert.equal(off.recycleEligibleCount, 0, `${d.label}: recycle-off unexpectedly eligible`);
  assert.ok(normal.recycledStepsMotion > 0, `${d.label}: normal recycler did not recycle during motion`);
  assert.equal(forced.recycledStepsMotion, 0,
    `${d.label}: force-fresh path still reported actual recycled motion steps`);
}

const result = {
  scope: 'E2a2ac FORCE-FRESH RECYCLER ABLATION ONLY. Fixed static-ground seam, spin=5 rad/s, crossing rate=20 urad/s, flat-P75 two-point carrier, friction=0, coupled E2a2q normal solve, global warm starting ON. Compare normal recycleDistance=0.05, identical recycler eligibility with recycled-manifold reuse bypassed into fresh b3UpdateContact, and recycleDistance=0 control. Eligibility cadence must remain identical normal vs force-fresh. Primary question: is cached/recycled manifold reuse necessary for the amplified 1<->2 transition transient? No physics acceptance gate.',
  spin,
  crossingAngularSpeed,
  rows,
};

console.log(`E2A2AC_FORCE_FRESH_RECYCLER_ABLATION_RESULT ${JSON.stringify(result)}`);
console.log('E2A2AC_FORCE_FRESH_RECYCLER_ABLATION_EXECUTED');
