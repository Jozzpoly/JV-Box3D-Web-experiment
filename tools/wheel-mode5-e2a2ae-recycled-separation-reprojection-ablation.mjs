import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2aeRunRecycledSeparationReprojectionAblation, 'function', 'E2a2ae runner missing');

const spin = 5;
const crossingAngularSpeed = 2.0e-5;
const cases = [
  { recycleDistance: 0.05, freezeRecycledSeparation: false, label: 'recycle-normal' },
  { recycleDistance: 0.05, freezeRecycledSeparation: true, label: 'recycle-freeze-separation' },
  { recycleDistance: 0.0, freezeRecycledSeparation: false, label: 'recycle-off' },
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
    const raw = b3.e2a2aeRunRecycledSeparationReprojectionAblation(
      spin,
      d.direction,
      c.recycleDistance,
      crossingAngularSpeed,
      c.freezeRecycledSeparation,
    );
    assert.equal(raw.valid, true, `${c.label}/${d.label}: invalid run`);
    assert.equal(raw.groundBodyStatic, true, `${c.label}/${d.label}: ground not static`);
    assert.equal(raw.groundMotionMode, 'SET_TRANSFORM_BEFORE_STEP', `${c.label}/${d.label}: motion mode drift`);
    assert.equal(raw.freezeRecycledSeparation, c.freezeRecycledSeparation, `${c.label}/${d.label}: intervention flag drift`);
    approxEqual(raw.requestedRecycleDistance, c.recycleDistance, 1e-7, `${c.label}/${d.label}: recycle-distance drift`);
    approxEqual(raw.crossingAngularSpeed, crossingAngularSpeed, 1e-10, `${c.label}/${d.label}: crossing-rate drift`);
    assert.equal(raw.contactDropoutsMotion, 0, `${c.label}/${d.label}: contact dropout`);
    assert.equal(raw.contactIdChangesMotion, 0, `${c.label}/${d.label}: contact ID changed`);
    assert.equal(raw.transitionCount, 1, `${c.label}/${d.label}: expected one topology transition`);
    assert.equal(raw.transitionPersistedCount, 1, `${c.label}/${d.label}: transition did not preserve one feature`);
    if (c.freezeRecycledSeparation) {
      assert.ok(raw.frozenRecycledPointCount > 0, `${c.label}/${d.label}: intervention never touched a recycled point`);
      assert.ok(raw.recycledStepsMotion > 0, `${c.label}/${d.label}: recycler did not execute during motion`);
    } else {
      assert.equal(raw.frozenRecycledPointCount, 0, `${c.label}/${d.label}: unexpected frozen points`);
    }

    rows.push({
      case: c.label,
      direction: d.label,
      recycleDistance: c.recycleDistance,
      freezeRecycledSeparation: c.freezeRecycledSeparation,
      frozenRecycledPointCount: raw.frozenRecycledPointCount,
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
  const frozen = rows.find((r) => r.case === 'recycle-freeze-separation' && r.direction === d.label);
  const off = rows.find((r) => r.case === 'recycle-off' && r.direction === d.label);
  assert.ok(normal && frozen && off, `${d.label}: missing comparison row`);
  assert.equal(frozen.recycledStepsMotion, normal.recycledStepsMotion,
    `${d.label}: separation ablation changed recycler cadence`);
  assert.equal(frozen.transitionStep, normal.transitionStep,
    `${d.label}: separation ablation changed transition timing`);
}

const result = {
  scope: 'E2a2ae RECYCLED SEPARATION-REPROJECTION ABLATION ONLY. Fixed static-ground seam, spin=5 rad/s, crossing rate=20 urad/s, flat-P75 two-point carrier, friction=0, coupled E2a2q normal solve, global warm starting ON. On recycled-manifold shortcut steps only, optionally suppress only the b3Dot(dp,normal) relative-motion term and hold separation at cached baseSeparation while preserving eligibility, cached anchors, persisted=true, carried normalImpulse, shortcut continue, contact identity and recycler cadence. Compare normal recycler, freeze-separation recycler, and recycle-off. Primary question: is recycled separation reprojection necessary for the amplified 1<->2 transition transient? No physics acceptance gate.',
  spin,
  crossingAngularSpeed,
  rows,
};

console.log(`E2A2AE_RECYCLED_SEPARATION_REPROJECTION_ABLATION_RESULT ${JSON.stringify(result)}`);
console.log('E2A2AE_RECYCLED_SEPARATION_REPROJECTION_ABLATION_EXECUTED');
