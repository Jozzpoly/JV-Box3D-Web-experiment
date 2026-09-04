import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2abRunWarmStartAblation, 'function', 'E2a2ab runner missing');

const spin = 5;
const crossingAngularSpeed = 2.0e-5;
const cases = [
  { recycleDistance: 0.05, warmStarting: true, label: 'recycle-on/ws-on' },
  { recycleDistance: 0.05, warmStarting: false, label: 'recycle-on/ws-off' },
  { recycleDistance: 0.0, warmStarting: true, label: 'recycle-off/ws-on' },
  { recycleDistance: 0.0, warmStarting: false, label: 'recycle-off/ws-off' },
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
    const raw = b3.e2a2abRunWarmStartAblation(
      spin,
      d.direction,
      c.recycleDistance,
      crossingAngularSpeed,
      c.warmStarting,
    );
    assert.equal(raw.valid, true, `${c.label}/${d.label}: invalid run`);
    assert.equal(raw.groundBodyStatic, true, `${c.label}/${d.label}: ground not static`);
    assert.equal(raw.groundMotionMode, 'SET_TRANSFORM_BEFORE_STEP', `${c.label}/${d.label}: motion mode drift`);
    assert.equal(raw.warmStarting, c.warmStarting, `${c.label}/${d.label}: warm-start flag drift`);
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
      warmStarting: c.warmStarting,
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

const result = {
  scope: 'E2a2ab WARM-START ABLATION ONLY. Fixed static-ground seam, spin=5 rad/s, crossing rate=20 urad/s, flat-P75 two-point carrier, friction=0, coupled E2a2q normal solve. 2x2 compare recycleDistance 0.05 vs 0 and global constraint warm starting enabled vs disabled. Primary question: does recycler-associated transition amplification survive removal of solver warm-start impulse carry? No physics acceptance gate.',
  spin,
  crossingAngularSpeed,
  rows,
};

console.log(`E2A2AB_WARM_START_ABLATION_RESULT ${JSON.stringify(result)}`);
console.log('E2A2AB_WARM_START_ABLATION_EXECUTED');
