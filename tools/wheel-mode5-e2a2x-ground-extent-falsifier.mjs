import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2xRunDynamicSupportTransitionGroundExtentControl, 'function', 'E2a2x runner missing');

const recycleDistance = 0.05;
const groundHalfXs = [5.0, 1.0];
const spins = [0, 1, 2, 2.25, 3, 5, 7.5, 10, 12.5, 15];
const directions = [
  { direction: 1, label: '2to1' },
  { direction: -1, label: '1to2' },
];

const rows = [];
for (const groundHalfX of groundHalfXs) {
  for (const spec of directions) {
    for (const spin of spins) {
      const raw = b3.e2a2xRunDynamicSupportTransitionGroundExtentControl(
        spin,
        spec.direction,
        recycleDistance,
        groundHalfX,
      );
      assert.equal(raw.valid, true, `${spec.label} halfX=${groundHalfX} spin=${spin}: invalid run`);
      assert.ok(Math.abs(raw.configuredRecycleDistance - recycleDistance) < 1e-6,
        `${spec.label} halfX=${groundHalfX} spin=${spin}: recycle distance drift`);
      assert.ok(Math.abs(raw.groundHalfX - groundHalfX) < 1e-6,
        `${spec.label} halfX=${groundHalfX} spin=${spin}: ground extent drift`);

      rows.push({
        groundHalfX,
        label: spec.label,
        direction: spec.direction,
        spin,
        recycledStepsMotion: raw.recycledStepsMotion,
        motionSteps: raw.motionSteps,
        recycleFraction: raw.motionSteps > 0 ? raw.recycledStepsMotion / raw.motionSteps : null,
        topologyMismatchCount: raw.topologyMismatchCount,
        transitionCount: raw.transitionCount,
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
      });
    }
  }
}

const summarizeExtent = (groundHalfX) => {
  const extentRows = rows.filter((row) => row.groundHalfX === groundHalfX);
  const bySpin = spins.map((spin) => {
    const spinRows = extentRows.filter((row) => row.spin === spin);
    assert.equal(spinRows.length, 2, `halfX=${groundHalfX} spin=${spin}: missing direction pair`);
    assert.equal(spinRows[0].recycledStepsMotion, spinRows[1].recycledStepsMotion,
      `halfX=${groundHalfX} spin=${spin}: recycling cadence differed by crossing direction`);
    return {
      spin,
      recycledStepsMotion: spinRows[0].recycledStepsMotion,
      motionSteps: spinRows[0].motionSteps,
      recycleFraction: spinRows[0].recycleFraction,
      transitions: Object.fromEntries(spinRows.map((row) => [row.label, row.transitionStep])),
    };
  });
  return { groundHalfX, bySpin };
};

const result = {
  scope: 'E2a2x native ground-extent causality falsifier. Exact E2a2v crossing and recycleDistance=0.05 m are retained. Only kinematic ground half-extent X changes from 5 m to 1 m; Y=0.10 m and Z=5 m stay fixed. The 1 m face remains well outside the ~0.55 m wheel radial projection. Spin grid is preselected to test the source prediction that reducing the X extent shifts recycling eligibility upward.',
  groundHalfXs,
  spins,
  summaries: groundHalfXs.map(summarizeExtent),
  rows,
};

console.log(`E2A2X_GROUND_EXTENT_RESULT ${JSON.stringify(result)}`);
console.log('E2A2X_GROUND_EXTENT_EXECUTED');
