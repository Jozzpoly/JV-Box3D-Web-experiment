import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2zRunStaticGroundRateSweep, 'function', 'E2a2z runner missing');

const spin = 5;
const rates = [1.0e-5, 1.5e-5, 2.0e-5, 3.0e-5, 4.0e-5, 8.0e-5];
const recycleDistances = [0.05, 0.0];
const directions = [
  { direction: 1, label: '2to1' },
  { direction: -1, label: '1to2' },
];

const rows = [];
for (const recycleDistance of recycleDistances) {
  for (const rate of rates) {
    for (const spec of directions) {
      const raw = b3.e2a2zRunStaticGroundRateSweep(spin, spec.direction, recycleDistance, rate);
      assert.equal(raw.valid, true, `${spec.label} recycle=${recycleDistance} rate=${rate}: invalid run`);
      assert.equal(raw.groundBodyStatic, true, `${spec.label} rate=${rate}: ground not static`);
      assert.equal(raw.groundMotionMode, 'SET_TRANSFORM_BEFORE_STEP', `${spec.label} rate=${rate}: motion mode drift`);
      assert.equal(raw.contactDropoutsMotion, 0, `${spec.label} rate=${rate}: contact dropout`);
      assert.equal(raw.contactIdChangesMotion, 0, `${spec.label} rate=${rate}: contact identity changed`);
      assert.equal(raw.transitionCount, 1, `${spec.label} rate=${rate}: expected exactly one topology transition`);
      assert.equal(raw.transitionPersistedCount, 1, `${spec.label} rate=${rate}: expected one persisted feature`);

      rows.push({
        recycleDistance,
        spin,
        rate,
        rateMicroradiansPerSecond: rate * 1e6,
        label: spec.label,
        recycledStepsMotion: raw.recycledStepsMotion,
        motionSteps: raw.motionSteps,
        transitionStep: raw.transitionStep,
        transitionVyDelta: raw.transitionVyDelta,
        transitionFinalImpulseDelta: raw.transitionFinalImpulseDelta,
        transitionTotalImpulseDelta: raw.transitionTotalImpulseDelta,
        maxAbsVyMotion: raw.maxAbsVyMotion,
        topologyMismatchCount: raw.topologyMismatchCount,
        finalY: raw.finalY,
        finalVy: raw.finalVy,
      });
    }
  }
}

const result = {
  scope: 'E2a2z bounded rate/cadence sweep. Static SetTransform ground seam from E2a2y; flat-P75 two-point wheel, coupled normal solve, friction=0, X/Y tilt locked. Hold wheel spin=5 rad/s. Vary only crossingAngularSpeed at 10/15/20/30/40/80 urad/s. Compare default recycleDistance=0.05 against recycle-off=0. Primary question: whether the intermittent-recycling transition transient converges, stays bounded, or grows with crossing rate/cadence.',
  rows,
};

console.log(`E2A2Z_STATIC_GROUND_RATE_SWEEP_RESULT ${JSON.stringify(result)}`);
console.log('E2A2Z_STATIC_GROUND_RATE_SWEEP_EXECUTED');
