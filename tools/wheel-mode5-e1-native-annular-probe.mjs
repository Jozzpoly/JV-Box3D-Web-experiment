import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e1ProbeAnnularP75Box, 'function', 'E1 native probe binding missing');

const HISTORICAL_ROCK = Object.freeze({
  halfExtents: Object.freeze({
    x: 0.059916594306979265,
    y: 0.04547782222493919,
    z: 0.06463660159566842,
  }),
  rotation: Object.freeze({
    x: 0.0003777313710980216,
    y: 0.24466730447345725,
    z: 0.00009531543729218681,
    w: -0.9696070123280212,
  }),
});
const IDENTITY = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });
const BORE_BOX = Object.freeze({
  halfExtents: Object.freeze({ x: 0.03, y: 0.03, z: 0.03 }),
  rotation: IDENTITY,
});
const HISTORICAL_DIRECTION = norm([0.15, -0.25, 1]);
const BORE_DIRECTION = Object.freeze([0, 0, 1]);
const EXPECTED = Object.freeze({
  historicalP75_64: 0.1700947544113708,
  historicalExactMin: 0.16262010092024126,
  historicalExactMedian: 0.167256184632239,
  historicalExactMax: 0.17354202140043584,
  bore100P75_128: 0.16005504074219642,
  bore120P75_128: 0.16158003458687192,
});
const ONSET_TOLERANCE = 0.005;

function norm(v) {
  const n = Math.hypot(...v);
  if (!(n > 0)) throw new Error('degenerate direction');
  return v.map((x) => x / n);
}
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function centerAt(direction, distance, offset = [0, 0, 0]) { return add(offset, mul(direction, distance)); }
function finiteOrNull(v) { return Number.isFinite(v) ? v : null; }

function probe(box, direction, distance, offset = [0, 0, 0], acceptanceSkin = 0) {
  const center = centerAt(direction, distance, offset);
  const h = box.halfExtents;
  const q = box.rotation;
  const row = b3.e1ProbeAnnularP75Box(
    h.x, h.y, h.z,
    center[0], center[1], center[2],
    q.x, q.y, q.z, q.w,
    acceptanceSkin,
  );
  assert.equal(row.valid, true, `native E1 probe invalid at d=${distance}`);
  assert.equal(row.meshTriangleCount, 33024, `unexpected E1 mesh triangle count ${row.meshTriangleCount}`);
  return {
    hit: Boolean(row.hit),
    distance,
    broadCandidates: row.broadCandidates,
    rawCandidates: row.rawCandidates,
    acceptedCandidates: row.acceptedCandidates,
    rawClosestSeparation: finiteOrNull(row.rawClosestSeparation),
    separation: row.hit ? row.separation : null,
    normal: row.hit ? [row.normalX, row.normalY, row.normalZ] : null,
    point: row.hit ? [row.pointX, row.pointY, row.pointZ] : null,
    surface: row.hit ? row.surface : null,
    station: row.hit ? row.station : null,
    sector: row.hit ? row.sector : null,
  };
}

function firstOnset({ box, direction, offset = [0, 0, 0], acceptanceSkin = 0, far, near, steps = 48, refine = 18 }) {
  let previousDistance = far;
  let previous = probe(box, direction, far, offset, acceptanceSkin);
  if (previous.hit) throw new Error(`far endpoint already hits: d=${far}, skin=${acceptanceSkin}`);

  for (let i = 1; i <= steps; i += 1) {
    const d = far + (near - far) * (i / steps);
    const current = probe(box, direction, d, offset, acceptanceSkin);
    if (!previous.hit && current.hit) {
      let separated = previousDistance;
      let touching = d;
      let touchingProbe = current;
      for (let j = 0; j < refine; j += 1) {
        const mid = 0.5 * (separated + touching);
        const midProbe = probe(box, direction, mid, offset, acceptanceSkin);
        if (midProbe.hit) {
          touching = mid;
          touchingProbe = midProbe;
        } else {
          separated = mid;
        }
      }
      return { onset: touching, separated, probe: touchingProbe };
    }
    previousDistance = d;
    previous = current;
  }
  return null;
}

function assertNoHitSweep(label, offset, acceptanceSkin = 0) {
  const far = 0.30;
  const near = 0.0;
  const steps = 120;
  let maxBroad = 0;
  let maxRaw = 0;
  for (let i = 0; i <= steps; i += 1) {
    const d = far + (near - far) * (i / steps);
    const row = probe(BORE_BOX, BORE_DIRECTION, d, offset, acceptanceSkin);
    maxBroad = Math.max(maxBroad, row.broadCandidates);
    maxRaw = Math.max(maxRaw, row.rawCandidates);
    if (row.hit) throw new Error(`${label} false-positive at d=${d}: ${JSON.stringify(row)}`);
  }
  return { label, acceptanceSkin, samples: steps + 1, maxBroad, maxRaw };
}

function requireNear(label, actual, expected, tolerance = ONSET_TOLERANCE) {
  const delta = actual - expected;
  if (Math.abs(delta) > tolerance) {
    throw new Error(`${label} onset drift ${delta} m exceeds ${tolerance} m: actual=${actual} expected=${expected}`);
  }
  return delta;
}

const safeBore = [
  assertNoHitSweep('bore-center-safe', [0, 0, 0], 0),
  assertNoHitSweep('bore-offset-50mm-safe', [0.05, 0, 0], 0),
  assertNoHitSweep('bore-offset-80mm-safe', [0.08, 0, 0], 0),
];

const historical0 = firstOnset({
  box: HISTORICAL_ROCK,
  direction: HISTORICAL_DIRECTION,
  acceptanceSkin: 0,
  far: 0.23,
  near: 0.11,
});
assert.ok(historical0, 'historical literal case produced no native zero-skin onset');
const historicalDeltaToP75 = requireNear('historical literal', historical0.onset, EXPECTED.historicalP75_64);
if (historical0.onset < EXPECTED.historicalExactMin - ONSET_TOLERANCE || historical0.onset > EXPECTED.historicalExactMax + ONSET_TOLERANCE) {
  throw new Error(`historical native onset outside exact Tire phase envelope tolerance: ${historical0.onset}`);
}
if (!(historical0.probe.separation <= 1e-4)) {
  throw new Error(`zero-skin onset accepted positive separation: ${historical0.probe.separation}`);
}

const bore100 = firstOnset({
  box: BORE_BOX,
  direction: BORE_DIRECTION,
  offset: [0.10, 0, 0],
  acceptanceSkin: 0,
  far: 0.23,
  near: 0.10,
});
assert.ok(bore100, '100 mm grazing control produced no native onset');
const bore100Delta = requireNear('bore 100 mm', bore100.onset, EXPECTED.bore100P75_128);

const bore120 = firstOnset({
  box: BORE_BOX,
  direction: BORE_DIRECTION,
  offset: [0.12, 0, 0],
  acceptanceSkin: 0,
  far: 0.23,
  near: 0.10,
});
assert.ok(bore120, '120 mm contact control produced no native onset');
const bore120Delta = requireNear('bore 120 mm', bore120.onset, EXPECTED.bore120P75_128);

const historical20 = firstOnset({
  box: HISTORICAL_ROCK,
  direction: HISTORICAL_DIRECTION,
  acceptanceSkin: 0.02,
  far: 0.25,
  near: 0.11,
});
assert.ok(historical20, '20 mm skin causal control produced no onset');
if (historical20.onset + 1e-5 < historical0.onset) {
  throw new Error(`20 mm skin delayed contact unexpectedly: zero=${historical0.onset} skin20=${historical20.onset}`);
}

const summary = {
  method: 'E1_NATIVE_B3_COLLIDE_HULL_TRIANGLE_STATIC_ORACLE',
  meshTriangleCount: 33024,
  acceptancePolicy: {
    candidate: 0,
    causalControl: 0.02,
  },
  expected: EXPECTED,
  safeBore,
  historicalZeroSkin: {
    ...historical0,
    deltaToP75_64: historicalDeltaToP75,
    deltaToExactMedian: historical0.onset - EXPECTED.historicalExactMedian,
  },
  bore100ZeroSkin: { ...bore100, deltaToE0b: bore100Delta },
  bore120ZeroSkin: { ...bore120, deltaToE0b: bore120Delta },
  historical20mmSkin: {
    ...historical20,
    leadVsZeroSkin: historical20.onset - historical0.onset,
  },
};
console.log('E1_NATIVE_ANNULAR_PROBE_SUMMARY', JSON.stringify(summary));
console.log('E1_NATIVE_ANNULAR_PROBE_OK');
