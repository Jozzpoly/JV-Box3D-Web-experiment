import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e1ProbeAnnularP75Box, 'function', 'E1 native probe binding missing');
assert.equal(typeof b3.e1InspectAnnularP75BoxPatch, 'function', 'E1d patch introspection binding missing');

const PHASE_COUNT = 256;
const GROUND_PHASE_INDICES = Object.freeze([155, 156, 157, 158, 159, 191, 192]);
const SIDE_LOW_PHASE_INDICES = Object.freeze([0, 1]);
const APPROACH_INSETS_UM = Object.freeze([0, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000]);
const IDENTITY = Object.freeze([0, 0, 0, 1]);
const HISTORICAL_DIRECTION = normalize([0.15, -0.25, 1]);
const HISTORICAL_ROCK = Object.freeze({
  halfExtents: Object.freeze([0.059916594306979265, 0.04547782222493919, 0.06463660159566842]),
  rotation: Object.freeze([0.0003777313710980216, 0.24466730447345725, 0.00009531543729218681, -0.9696070123280212]),
});

const tire = await loadOwnerM6TireGeometryR3();
if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire provenance drifted: ${JSON.stringify(tire.provenance)}`);
}

function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function length(a) { return Math.hypot(...a); }
function normalize(a) { const n = length(a); if (!(n > 0)) throw new Error('degenerate vector'); return mul(a, 1 / n); }
function normalizeOrNull(a) { const n = length(a); return n > 1e-12 ? mul(a, 1 / n) : null; }
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
function angleDeg(a, b) {
  const c = Math.max(-1, Math.min(1, dot(normalize(a), normalize(b))));
  return Math.acos(c) * 180 / Math.PI;
}
function vectorMean(values) {
  return values.reduce((acc, value) => add(acc, value), [0, 0, 0]).map((value) => value / values.length);
}
function minMax(values) {
  return { min: Math.min(...values), max: Math.max(...values), range: Math.max(...values) - Math.min(...values) };
}
function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  let intersection = 0;
  for (const value of A) if (B.has(value)) intersection += 1;
  const union = A.size + B.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

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

function probeWorldBox(box, phase) {
  const local = worldBoxToWheelLocal(box, phase);
  const h = local.halfExtents, p = local.center, q = local.rotation;
  const row = b3.e1ProbeAnnularP75Box(
    h[0], h[1], h[2], p[0], p[1], p[2], q[0], q[1], q[2], q[3], 0,
  );
  if (!row.valid) throw new Error('native E1 probe invalid');
  return {
    hit: Boolean(row.hit),
    meshTriangleCount: row.meshTriangleCount,
    rawCandidates: row.rawCandidates,
    acceptedCandidates: row.acceptedCandidates,
    separation: row.hit ? row.separation : null,
    surface: row.hit ? row.surface : null,
    station: row.hit ? row.station : null,
    sector: row.hit ? row.sector : null,
    pointWorld: row.hit ? qrot(local.wheelQ, [row.pointX, row.pointY, row.pointZ]) : null,
    normalWorld: row.hit ? qrot(local.wheelQ, [row.normalX, row.normalY, row.normalZ]) : null,
  };
}

function inspectWorldBox(box, phase) {
  const local = worldBoxToWheelLocal(box, phase);
  const h = local.halfExtents, p = local.center, q = local.rotation;
  const row = b3.e1InspectAnnularP75BoxPatch(
    h[0], h[1], h[2], p[0], p[1], p[2], q[0], q[1], q[2], q[3], 0,
  );
  if (!row.valid) throw new Error('native E1d inspection invalid');
  const candidates = Array.from(row.candidates ?? []).map((candidate) => ({
    triangleIndex: candidate.triangleIndex,
    surface: candidate.surface,
    station: candidate.station,
    sector: candidate.sector,
    separation: candidate.candidateSeparation,
    normalWorld: qrot(local.wheelQ, [candidate.normalX, candidate.normalY, candidate.normalZ]),
    witnessWorld: qrot(local.wheelQ, [candidate.witnessX, candidate.witnessY, candidate.witnessZ]),
    pointsWorld: Array.from(candidate.points ?? []).map((point) => qrot(local.wheelQ, [point.x, point.y, point.z])),
  }));
  return {
    meshTriangleCount: row.meshTriangleCount,
    rawCandidates: row.rawCandidates,
    acceptedCandidates: row.acceptedCandidates,
    bestAcceptedIndex: row.bestAcceptedIndex,
    bestSeparation: row.bestSeparation,
    candidates,
  };
}

// The annular shell can transition separated -> tire -> bore. Bracket the first
// outside-to-contact transition from the far side, then refine the onset.
function findOnset(makeBox, phase, far, near) {
  let previousDistance = far;
  let previousProbe = probeWorldBox(makeBox(far), phase);
  assert.equal(previousProbe.hit, false, 'far endpoint must be separated');

  let separated = null;
  let touching = null;
  let touchingProbe = null;
  for (let i = 1; i <= 96; i += 1) {
    const d = far + (near - far) * (i / 96);
    const row = probeWorldBox(makeBox(d), phase);
    if (!previousProbe.hit && row.hit) {
      separated = previousDistance;
      touching = d;
      touchingProbe = row;
      break;
    }
    previousDistance = d;
    previousProbe = row;
  }
  if (touching === null) throw new Error(`first-contact transition missing in [${near}, ${far}]`);

  for (let i = 0; i < 22; i += 1) {
    const mid = 0.5 * (separated + touching);
    const row = probeWorldBox(makeBox(mid), phase);
    if (row.hit) {
      touching = mid;
      touchingProbe = row;
    } else {
      separated = mid;
    }
  }
  return { onset: touching, separated, bracketWidthMeters: separated - touching, ...touchingProbe };
}

function summarizePose(makeBox, phase, distanceMeters, expectedSurface) {
  const probe = probeWorldBox(makeBox(distanceMeters), phase);
  assert.equal(probe.hit, true, 'inset pose unexpectedly lost contact');
  assert.equal(probe.surface, expectedSurface, 'selected surface changed in bounded epsilon sweep');

  const inspection = inspectWorldBox(makeBox(distanceMeters), phase);
  assert.equal(inspection.meshTriangleCount, probe.meshTriangleCount, 'mesh count drift');
  assert.equal(inspection.rawCandidates, probe.rawCandidates, 'raw candidate count drift');
  assert.equal(inspection.acceptedCandidates, probe.acceptedCandidates, 'accepted candidate count drift');
  assert.ok(inspection.bestAcceptedIndex >= 0, 'missing best accepted candidate');

  const winner = inspection.candidates[inspection.bestAcceptedIndex];
  assert.ok(winner, 'invalid best accepted index');
  assert.equal(winner.surface, probe.surface, 'winner surface drift');
  assert.equal(winner.station, probe.station, 'winner station drift');
  assert.equal(winner.sector, probe.sector, 'winner sector drift');
  assert.ok(Math.abs(winner.separation - probe.separation) < 2e-6, 'winner separation drift');
  assert.ok(distance(winner.witnessWorld, probe.pointWorld) < 2e-6, 'winner witness drift');

  const candidates = inspection.candidates;
  const points = candidates.flatMap((candidate) => candidate.pointsWorld);
  const witnesses = candidates.map((candidate) => candidate.witnessWorld);
  const normals = candidates.map((candidate) => normalize(candidate.normalWorld));
  const pointCentroid = vectorMean(points);
  const witnessCentroid = vectorMean(witnesses);
  const normalMean = normalizeOrNull(vectorMean(normals));
  const momentProxy = normalMean ? cross(pointCentroid, normalMean) : null;
  const surfaceCounts = {};
  for (const candidate of candidates) surfaceCounts[candidate.surface] = (surfaceCounts[candidate.surface] ?? 0) + 1;

  return {
    rawCandidates: inspection.rawCandidates,
    acceptedCandidates: inspection.acceptedCandidates,
    manifoldPointCount: points.length,
    stationCount: new Set(candidates.map((candidate) => candidate.station)).size,
    sectorCount: new Set(candidates.map((candidate) => candidate.sector)).size,
    surfaceCounts,
    candidateSeparationMm: minMax(candidates.map((candidate) => candidate.separation * 1000)),
    pointZMm: minMax(points.map((point) => point[2] * 1000)),
    witnessZMm: minMax(witnesses.map((point) => point[2] * 1000)),
    pointCentroid,
    witnessCentroid,
    normalMean,
    momentProxy,
    winner: {
      surface: winner.surface,
      station: winner.station,
      sector: winner.sector,
      separationMm: winner.separation * 1000,
      witnessWorld: winner.witnessWorld,
      normalWorld: winner.normalWorld,
    },
    triangleIds: candidates.map((candidate) => candidate.triangleIndex),
  };
}

function transition(a, b) {
  return {
    fromInsetUm: a.approachInsetUm,
    toInsetUm: b.approachInsetUm,
    candidateCount: [a.acceptedCandidates, b.acceptedCandidates],
    candidateJaccard: jaccard(a.triangleIds, b.triangleIds),
    pointCentroidStepMm: distance(a.pointCentroid, b.pointCentroid) * 1000,
    witnessCentroidStepMm: distance(a.witnessCentroid, b.witnessCentroid) * 1000,
    normalMeanStepDeg: a.normalMean && b.normalMean ? angleDeg(a.normalMean, b.normalMean) : null,
    momentProxyStepMm: a.momentProxy && b.momentProxy ? distance(a.momentProxy, b.momentProxy) * 1000 : null,
  };
}

function stripInternal(row) {
  const { triangleIds: _triangleIds, ...visible } = row;
  return visible;
}

function measurePhase(label, phaseIndex, makeBox, far, near, expectedSurface) {
  const phase = 2 * Math.PI * phaseIndex / PHASE_COUNT;
  const onset = findOnset(makeBox, phase, far, near);
  assert.equal(onset.surface, expectedSurface, `${label} onset surface drift`);

  const rows = APPROACH_INSETS_UM.map((approachInsetUm) => {
    const approachInsetMeters = approachInsetUm * 1e-6;
    const summary = summarizePose(makeBox, phase, onset.onset - approachInsetMeters, expectedSurface);
    return { approachInsetUm, approachInsetMeters, ...summary };
  });
  const transitions = rows.slice(0, -1).map((row, index) => transition(row, rows[index + 1]));
  const reference = rows.at(-1);
  const relativeTo1mm = rows.map((row) => ({
    approachInsetUm: row.approachInsetUm,
    candidateJaccard: jaccard(row.triangleIds, reference.triangleIds),
    pointCentroidDistanceMm: distance(row.pointCentroid, reference.pointCentroid) * 1000,
    witnessCentroidDistanceMm: distance(row.witnessCentroid, reference.witnessCentroid) * 1000,
    momentProxyDistanceMm: row.momentProxy && reference.momentProxy ? distance(row.momentProxy, reference.momentProxy) * 1000 : null,
    normalMeanAngleDeg: row.normalMean && reference.normalMean ? angleDeg(row.normalMean, reference.normalMean) : null,
  }));

  return {
    label,
    phaseIndex,
    phaseRad: phase,
    onsetDistanceMeters: onset.onset,
    onsetBracketWidthNm: onset.bracketWidthMeters * 1e9,
    onsetAcceptedCandidates: onset.acceptedCandidates,
    rows: rows.map(stripInternal),
    transitions,
    relativeTo1mm,
  };
}

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

const ground = GROUND_PHASE_INDICES.map((phaseIndex) => measurePhase(
  'flat-ground-central-strip', phaseIndex, groundBoxAt, 0.58, 0.50, 0,
));
const sideLow = SIDE_LOW_PHASE_INDICES.map((phaseIndex) => measurePhase(
  'historical-small-rock-side-low', phaseIndex, historicalBoxAt, 0.23, 0.11, 1,
));

const result = {
  method: 'E1D2_FIRST_CONTACT_EPSILON_SWEEP',
  acceptanceSkin: 0,
  phaseCount: PHASE_COUNT,
  approachInsetDefinition: 'distance moved inward from each phase first-contact onset; ground equals support-normal penetration, side-low follows the historical approach ray',
  approachInsetsUm: APPROACH_INSETS_UM,
  groundPhaseIndices: GROUND_PHASE_INDICES,
  sideLowPhaseIndices: SIDE_LOW_PHASE_INDICES,
  provenance: tire.provenance,
  ground,
  sideLow,
};

console.log('E1D2_EPSILON_SWEEP_RESULT', JSON.stringify(result));
console.log('E1D2_EPSILON_SWEEP_MEASURED');
