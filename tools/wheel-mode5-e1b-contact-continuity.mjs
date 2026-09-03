import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e1ProbeAnnularP75Box, 'function', 'E1 native probe binding missing');

const PHASE_COUNT = Number(process.env.JV_E1B_PHASES ?? 256);
if (!Number.isInteger(PHASE_COUNT) || PHASE_COUNT < 64 || PHASE_COUNT > 1024) {
  throw new Error(`invalid JV_E1B_PHASES ${PHASE_COUNT}`);
}
const EXPECTED_HISTORICAL_ONSET = 0.1700947544113708;
const HISTORICAL_DIRECTION = normalize([0.15, -0.25, 1]);
const HISTORICAL_ROCK = Object.freeze({
  halfExtents: Object.freeze([0.059916594306979265, 0.04547782222493919, 0.06463660159566842]),
  rotation: Object.freeze([0.0003777313710980216, 0.24466730447345725, 0.00009531543729218681, -0.9696070123280212]),
});
const IDENTITY = Object.freeze([0, 0, 0, 1]);

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function length(a) { return Math.hypot(...a); }
function normalize(a) { const n = length(a); if (!(n > 0)) throw new Error('degenerate vector'); return mul(a, 1 / n); }
function distance(a, b) { return length(sub(a, b)); }
function qnormalize(q) { const n = Math.hypot(...q); return q.map((v) => v / n); }
function qconj(q) { return [-q[0], -q[1], -q[2], q[3]]; }
function qmul(a, b) {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}
function qrot(q, v) {
  q = qnormalize(q);
  const u = [q[0], q[1], q[2]], s = q[3];
  const uv = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const uuv = [u[1] * uv[2] - u[2] * uv[1], u[2] * uv[0] - u[0] * uv[2], u[0] * uv[1] - u[1] * uv[0]];
  return [v[0] + 2 * (s * uv[0] + uuv[0]), v[1] + 2 * (s * uv[1] + uuv[1]), v[2] + 2 * (s * uv[2] + uuv[2])];
}
function qz(angle) { return [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)]; }
function angleDeg(a, b) { return Math.acos(clamp(dot(normalize(a), normalize(b)), -1, 1)) * 180 / Math.PI; }

function worldBoxToWheelLocal(box, phase) {
  const wheelQ = qz(phase);
  const invWheelQ = qconj(wheelQ);
  return {
    halfExtents: box.halfExtents,
    center: qrot(invWheelQ, box.center),
    rotation: qnormalize(qmul(invWheelQ, box.rotation)),
    wheelQ,
  };
}

function probeWorldBox(box, phase, acceptanceSkin = 0) {
  const local = worldBoxToWheelLocal(box, phase);
  const h = local.halfExtents, p = local.center, q = local.rotation;
  const row = b3.e1ProbeAnnularP75Box(
    h[0], h[1], h[2],
    p[0], p[1], p[2],
    q[0], q[1], q[2], q[3],
    acceptanceSkin,
  );
  if (!row.valid) throw new Error(`native probe invalid: ${JSON.stringify({ box, phase })}`);
  const result = {
    hit: Boolean(row.hit),
    meshTriangleCount: row.meshTriangleCount,
    broadCandidates: row.broadCandidates,
    rawCandidates: row.rawCandidates,
    acceptedCandidates: row.acceptedCandidates,
    rawClosestSeparation: Number.isFinite(row.rawClosestSeparation) ? row.rawClosestSeparation : null,
    separation: row.hit ? row.separation : null,
    surface: row.hit ? row.surface : null,
    station: row.hit ? row.station : null,
    sector: row.hit ? row.sector : null,
    normalWorld: row.hit ? qrot(local.wheelQ, [row.normalX, row.normalY, row.normalZ]) : null,
    pointWorld: row.hit ? qrot(local.wheelQ, [row.pointX, row.pointY, row.pointZ]) : null,
  };
  return result;
}

function findOnset(makeBox, phase, far, near, refine = 22) {
  let separated = far;
  let touching = near;
  const farProbe = probeWorldBox(makeBox(far), phase, 0);
  const nearProbe = probeWorldBox(makeBox(near), phase, 0);
  if (farProbe.hit) throw new Error(`far endpoint already hits: ${far}`);
  if (!nearProbe.hit) throw new Error(`near endpoint does not hit: ${near}`);
  let touchingProbe = nearProbe;
  for (let i = 0; i < refine; i += 1) {
    const mid = 0.5 * (separated + touching);
    const row = probeWorldBox(makeBox(mid), phase, 0);
    if (row.hit) {
      touching = mid;
      touchingProbe = row;
    } else {
      separated = mid;
    }
  }
  return { onset: touching, separated, ...touchingProbe };
}

function quantile(values, f) {
  const sorted = [...values].sort((a, b) => a - b);
  const p = (sorted.length - 1) * f, lo = Math.floor(p), hi = Math.ceil(p);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (p - lo);
}
function stats(values) {
  return {
    min: Math.min(...values),
    p05: quantile(values, 0.05),
    median: quantile(values, 0.5),
    p95: quantile(values, 0.95),
    max: Math.max(...values),
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    range: Math.max(...values) - Math.min(...values),
  };
}
function vectorMean(values) { return values.reduce((a, b) => add(a, b), [0, 0, 0]).map((v) => v / values.length); }
function continuitySummary(label, rows, expectedSurface, referenceOnset = null) {
  if (rows.some((row) => !row.hit)) throw new Error(`${label}: missing contact in phase sweep`);
  const meshCounts = new Set(rows.map((row) => row.meshTriangleCount));
  if (meshCounts.size !== 1) throw new Error(`${label}: mesh triangle count drifted`);
  const meshTriangleCount = rows[0].meshTriangleCount;
  const angularSegments = meshTriangleCount / 516;
  if (!Number.isInteger(angularSegments)) throw new Error(`${label}: cannot infer angular segments from ${meshTriangleCount}`);

  const normals = rows.map((row) => row.normalWorld);
  const points = rows.map((row) => row.pointWorld);
  const normalMean = normalize(vectorMean(normals));
  const pointMean = vectorMean(points);
  const normalSteps = [];
  const pointSteps = [];
  for (let i = 0; i < rows.length; i += 1) {
    const j = (i + 1) % rows.length;
    normalSteps.push(angleDeg(normals[i], normals[j]));
    pointSteps.push(distance(points[i], points[j]));
  }
  const onset = rows.map((row) => row.onset);
  const separation = rows.map((row) => row.separation);
  const surfaceCounts = {};
  for (const row of rows) surfaceCounts[row.surface] = (surfaceCounts[row.surface] ?? 0) + 1;
  const stationChanges = rows.reduce((n, row, i) => n + (row.station !== rows[(i + 1) % rows.length].station ? 1 : 0), 0);
  const sectorChanges = rows.reduce((n, row, i) => n + (row.sector !== rows[(i + 1) % rows.length].sector ? 1 : 0), 0);

  return {
    label,
    phaseCount: rows.length,
    angularSegments,
    meshTriangleCount,
    expectedSurface,
    surfaceCounts,
    allExpectedSurface: rows.every((row) => row.surface === expectedSurface),
    onsetMeters: stats(onset),
    onsetRangeMm: (Math.max(...onset) - Math.min(...onset)) * 1000,
    referenceOnset,
    deltaToReferenceMm: referenceOnset === null ? null : stats(onset.map((value) => (value - referenceOnset) * 1000)),
    separationMeters: stats(separation),
    normalStepDeg: stats(normalSteps),
    normalDeviationFromMeanDeg: stats(normals.map((normal) => angleDeg(normal, normalMean))),
    pointStepMm: stats(pointSteps.map((value) => value * 1000)),
    pointDeviationFromMeanMm: stats(points.map((point) => distance(point, pointMean) * 1000)),
    stationChanges,
    sectorChanges,
    acceptedCandidates: stats(rows.map((row) => row.acceptedCandidates)),
    rawCandidates: stats(rows.map((row) => row.rawCandidates)),
    normalMean,
    pointMean,
    worstNormalStep: normalSteps.reduce((best, value, i) => value > best.value ? { value, phaseIndex: i, nextPhaseIndex: (i + 1) % rows.length } : best, { value: -1, phaseIndex: -1, nextPhaseIndex: -1 }),
    worstPointStep: pointSteps.reduce((best, value, i) => value > best.value ? { valueMm: value * 1000, phaseIndex: i, nextPhaseIndex: (i + 1) % rows.length } : best, { value: -1, valueMm: -1, phaseIndex: -1, nextPhaseIndex: -1 }),
  };
}

const phases = Array.from({ length: PHASE_COUNT }, (_, i) => 2 * Math.PI * i / PHASE_COUNT);

const groundBoxAt = (supportDistance) => ({
  halfExtents: [1.5, 0.5, 0.06],
  center: [0, -(supportDistance + 0.5), 0],
  rotation: IDENTITY,
});
const historicalBoxAt = (distanceMeters) => ({
  halfExtents: HISTORICAL_ROCK.halfExtents,
  center: mul(HISTORICAL_DIRECTION, distanceMeters),
  rotation: HISTORICAL_ROCK.rotation,
});

const groundRows = phases.map((phase, phaseIndex) => ({
  phaseIndex,
  phase,
  ...findOnset(groundBoxAt, phase, 0.58, 0.50),
}));
const historicalRows = phases.map((phase, phaseIndex) => ({
  phaseIndex,
  phase,
  ...findOnset(historicalBoxAt, phase, 0.23, 0.11),
}));

const ground = continuitySummary('flat-ground-central-strip', groundRows, 0, null);
const historical = continuitySummary('historical-small-rock-side-low', historicalRows, 1, EXPECTED_HISTORICAL_ONSET);

const result = {
  method: 'E1B_RELATIVE_SPIN_NATIVE_MANIFOLD_CONTINUITY',
  acceptanceSkin: 0,
  phaseCount: PHASE_COUNT,
  ground,
  historical,
};
console.log('E1B_CONTACT_CONTINUITY_RESULT', JSON.stringify(result));
console.log('E1B_CONTACT_CONTINUITY_MEASURED');