import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.rq1bInspectRoadHullResolution, 'function', 'RQ1b binding missing');

// Predeclared geometry-only sweep. These are representational probes, not physics tuning.
const anglesMicroradians = [0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 300, 500];
const rows = [];
for (const angle of anglesMicroradians) {
  const row = b3.rq1bInspectRoadHullResolution(angle);
  assert.equal(row.valid, true, `angle=${angle}: hull build failed`);
  assert.ok(row.faceCount >= 6, `angle=${angle}: implausible faceCount=${row.faceCount}`);
  assert.ok(row.topPlaneCount >= 1, `angle=${angle}: no top-facing planes`);
  rows.push(row);
}

assert.equal(rows[0].topPlaneCount, 1, 'flat control should have one top plane');
assert.ok(Math.abs(rows[0].topPlaneNormalXMin) < 1e-7, `flat control normal drifted: ${rows[0].topPlaneNormalXMin}`);

const firstTwoPlane = rows.find((row) => row.topPlaneCount >= 2) ?? null;
const lastSinglePlane = [...rows].reverse().find((row) => row.topPlaneCount === 1) ?? null;

const result = {
  method: 'RQ1B_GENERIC_HULL_REPRESENTATIONAL_RESOLUTION_SWEEP',
  scope: 'Geometry-only probe. Same 10m half-length road point set as failed RQ1, no world/shape/solver. Find where pinned b3CreateHull preserves the intended flat-to-slope ridge as two top-facing planes.',
  anglesMicroradians,
  rows,
  lastSinglePlane,
  firstTwoPlane,
};

console.log('WHEEL_MODE5_RQ1B_ROAD_HULL_RESOLUTION_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ1B_ROAD_HULL_RESOLUTION_EXECUTED');
