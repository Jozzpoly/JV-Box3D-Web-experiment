import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e1ProbeAnnularP75Box, 'function', 'E1 native probe binding missing');
assert.equal(typeof b3.e1InspectAnnularP75BoxPatch, 'function', 'E1d patch introspection binding missing');

const PHASE_COUNT = Number(process.env.JV_E1D_PHASES ?? 256);
if (!Number.isInteger(PHASE_COUNT) || PHASE_COUNT < 64 || PHASE_COUNT > 512) {
  throw new Error(`invalid JV_E1D_PHASES ${PHASE_COUNT}`);
}

const EXPECTED_HISTORICAL_ONSET = 0.1700947544113708;
const HISTORICAL_DIRECTION = normalize([0.15, -0.25, 1]);
const HISTORICAL_ROCK = Object.freeze({
  halfExtents: Object.freeze([0.059916594306979265, 0.04547782222493919, 0.06463660159566842]),
  rotation: Object.freeze([0.0003777313710980216, 0.24466730447345725, 0.00009531543729218681, -0.9696070123280212]),
});
const IDENTITY = Object.freeze([0, 0, 0, 1]);
const BAND_SPECS = Object.freeze([
  Object.freeze({ name: 'near50um', deltaMeters: 0.00005 }),
  Object.freeze({ name: 'near250um', deltaMeters: 0.00025 }),
  Object.freeze({ name: 'near1mm', deltaMeters: 0.001 }),
  Object.freeze({ name: 'allAccepted', deltaMeters: null }),
]);

const tire = await loadOwnerM6TireGeometryR3();
if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire provenance drifted: ${JSON.stringify(tire.provenance)}`);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
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
function angleDeg(a, b) { return Math.acos(clamp(dot(normalize(a), normalize(b)), -1, 1)) * 180 / Math.PI; }
function vectorMean(values) { return values.reduce((acc, value) => add(acc, value), [0, 0, 0]).map((v) => v / values.length); }

function quantile(values, f) {
  const sorted = [...values].sort((a, b) => a - b);
  const p = (sorted.length - 1) * f, lo = Math.floor(p), hi = Math.ceil(p);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (p - lo);
}
function stats(values) {
  if (values.length === 0) return null;
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
function aabbSpanMm(points) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const p of points) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], p[axis]);
      max[axis] = Math.max(max[axis], p[axis]);
    }
  }
  return max.map((value, axis) => (value - min[axis]) * 1000);
}
function worstStep(values, metric) {
  return values.reduce((best, _value, i) => {
    const j = (i + 1) % values.length;
    const value = metric(values[i], values[j]);
    return value > best.value ? { value, phaseIndex: i, nextPhaseIndex: j } : best;
  }, { value: -1, phaseIndex: -1, nextPhaseIndex: -1 });
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

function probeWorldBox(box, phase, acceptanceSkin = 0) {
  const local = worldBoxToWheelLocal(box, phase);
  const h = local.halfExtents, p = local.center, q = local.rotation;
  const row = b3.e1ProbeAnnularP75Box(
    h[0], h[1], h[2], p[0], p[1], p[2], q[0], q[1], q[2], q[3], acceptanceSkin,
  );
  if (!row.valid) throw new Error(`native probe invalid: ${JSON.stringify({ box, phase })}`);
  return {
    hit: Boolean(row.hit),
    meshTriangleCount: row.meshTriangleCount,
    broadCandidates: row.broadCandidates,
    rawCandidates: row.rawCandidates,
    acceptedCandidates: row.acceptedCandidates,
    separation: row.hit ? row.separation : null,
    surface: row.hit ? row.surface : null,
    station: row.hit ? row.station : null,
    sector: row.hit ? row.sector : null,
    normalWorld: row.hit ? qrot(local.wheelQ, [row.normalX, row.normalY, row.normalZ]) : null,
    pointWorld: row.hit ? qrot(local.wheelQ, [row.pointX, row.pointY, row.pointZ]) : null,
  };
}

function inspectWorldBox(box, phase, acceptanceSkin = 0) {
  const local = worldBoxToWheelLocal(box, phase);
  const h = local.halfExtents, p = local.center, q = local.rotation;
  const row = b3.e1InspectAnnularP75BoxPatch(
    h[0], h[1], h[2], p[0], p[1], p[2], q[0], q[1], q[2], q[3], acceptanceSkin,
  );
  if (!row.valid) throw new Error(`E1d inspect invalid: ${JSON.stringify({ box, phase })}`);
  const candidates = Array.from(row.candidates ?? []).map((candidate) => ({
    acceptedIndex: candidate.acceptedIndex,
    triangleIndex: candidate.triangleIndex,
    surface: candidate.surface,
    station: candidate.station,
    sector: candidate.sector,
    candidateSeparation: candidate.candidateSeparation,
    pointCount: candidate.pointCount,
    chosenPointIndex: candidate.chosenPointIndex,
    normalWorld: qrot(local.wheelQ, [candidate.normalX, candidate.normalY, candidate.normalZ]),
    witnessWorld: qrot(local.wheelQ, [candidate.witnessX, candidate.witnessY, candidate.witnessZ]),
    pointsWorld: Array.from(candidate.points ?? []).map((point) => ({
      index: point.index,
      separation: point.separation,
      pointWorld: qrot(local.wheelQ, [point.x, point.y, point.z]),
    })),
  }));
  return {
    meshTriangleCount: row.meshTriangleCount,
    broadCandidates: row.broadCandidates,
    rawCandidates: row.rawCandidates,
    acceptedCandidates: row.acceptedCandidates,
    bestAcceptedIndex: row.bestAcceptedIndex,
    bestSeparation: row.bestSeparation,
    candidates,
  };
}

// Closed annular geometry can transition separated -> tire -> bore. Always
// bracket the first outside-to-contact transition from the far side.
function findOnset(makeBox, phase, far, near, coarse = 96, refine = 22) {
  let previousDistance = far;
  let previousProbe = probeWorldBox(makeBox(far), phase, 0);
  if (previousProbe.hit) throw new Error(`far endpoint already hits: ${far}`);

  let separated = null;
  let touching = null;
  let touchingProbe = null;
  for (let i = 1; i <= coarse; i += 1) {
    const d = far + (near - far) * (i / coarse);
    const row = probeWorldBox(makeBox(d), phase, 0);
    if (!previousProbe.hit && row.hit) {
      separated = previousDistance;
      touching = d;
      touchingProbe = row;
      break;
    }
    previousDistance = d;
    previousProbe = row;
  }
  if (touching === null) throw new Error(`no first-contact transition in [${near}, ${far}]`);

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

function patchSummary(candidates, bestSeparation, spec) {
  const selected = spec.deltaMeters === null
    ? candidates
    : candidates.filter((candidate) => candidate.candidateSeparation >= bestSeparation - spec.deltaMeters - 1e-12);
  if (selected.length === 0) throw new Error(`empty E1d band ${spec.name}`);

  const witnesses = selected.map((candidate) => candidate.witnessWorld);
  const manifoldPoints = selected.flatMap((candidate) => candidate.pointsWorld.map((point) => point.pointWorld));
  const normals = selected.map((candidate) => normalize(candidate.normalWorld));
  const witnessCentroid = vectorMean(witnesses);
  const pointCentroid = vectorMean(manifoldPoints);
  const normalMean = normalizeOrNull(vectorMean(normals));
  const candidateMomentProxies = selected.map((candidate) => cross(candidate.witnessWorld, normalize(candidate.normalWorld)));
  const pointMomentProxies = selected.flatMap((candidate) => {
    const normal = normalize(candidate.normalWorld);
    return candidate.pointsWorld.map((point) => cross(point.pointWorld, normal));
  });

  const surfaceCounts = {};
  for (const candidate of selected) surfaceCounts[candidate.surface] = (surfaceCounts[candidate.surface] ?? 0) + 1;

  return {
    name: spec.name,
    deltaMm: spec.deltaMeters === null ? null : spec.deltaMeters * 1000,
    candidateCount: selected.length,
    manifoldPointCount: manifoldPoints.length,
    surfaceCounts,
    stationCount: new Set(selected.map((candidate) => candidate.station)).size,
    sectorCount: new Set(selected.map((candidate) => candidate.sector)).size,
    separationDeltaFromBestMm: stats(selected.map((candidate) => (bestSeparation - candidate.candidateSeparation) * 1000)),
    witnessCentroid,
    pointCentroid,
    witnessSpanMm: aabbSpanMm(witnesses),
    pointSpanMm: aabbSpanMm(manifoldPoints),
    normalMean,
    normalDeviationFromMeanDeg: normalMean === null ? null : stats(normals.map((normal) => angleDeg(normal, normalMean))),
    centroidMeanNormalMomentProxy: normalMean === null ? null : cross(pointCentroid, normalMean),
    meanCandidateMomentProxy: vectorMean(candidateMomentProxies),
    meanPointMomentProxy: vectorMean(pointMomentProxies),
  };
}

function attachInspection(makeBox, phase, onsetRow) {
  const inspection = inspectWorldBox(makeBox(onsetRow.onset), phase, 0);
  assert.equal(inspection.meshTriangleCount, onsetRow.meshTriangleCount, 'E1d mesh count drift');
  assert.equal(inspection.rawCandidates, onsetRow.rawCandidates, 'E1d raw-candidate count drift');
  assert.equal(inspection.acceptedCandidates, onsetRow.acceptedCandidates, 'E1d accepted-candidate count drift');
  assert.ok(inspection.bestAcceptedIndex >= 0, 'E1d missing selected candidate');
  const selected = inspection.candidates[inspection.bestAcceptedIndex];
  assert.ok(selected, 'E1d selected candidate index invalid');
  assert.equal(selected.surface, onsetRow.surface, 'E1d selected surface drift');
  assert.equal(selected.station, onsetRow.station, 'E1d selected station drift');
  assert.equal(selected.sector, onsetRow.sector, 'E1d selected sector drift');
  assert.ok(Math.abs(selected.candidateSeparation - onsetRow.separation) < 2e-6, 'E1d selected separation drift');
  assert.ok(distance(selected.witnessWorld, onsetRow.pointWorld) < 2e-6, 'E1d selected witness drift');
  assert.ok(angleDeg(selected.normalWorld, onsetRow.normalWorld) < 0.01, 'E1d selected normal drift');

  const bands = Object.fromEntries(BAND_SPECS.map((spec) => [spec.name, patchSummary(
    inspection.candidates, inspection.bestSeparation, spec,
  )]));
  return { inspection, selected, bands };
}

function snapshotCandidate(candidate) {
  return {
    acceptedIndex: candidate.acceptedIndex,
    triangleIndex: candidate.triangleIndex,
    surface: candidate.surface,
    station: candidate.station,
    sector: candidate.sector,
    separationMm: candidate.candidateSeparation * 1000,
    pointCount: candidate.pointCount,
    chosenPointIndex: candidate.chosenPointIndex,
    witnessWorld: candidate.witnessWorld,
    normalWorld: candidate.normalWorld,
  };
}
function snapshotRow(row) {
  return {
    phaseIndex: row.phaseIndex,
    phaseRad: row.phase,
    onset: row.onset,
    selected: snapshotCandidate(row.selected),
    acceptedCandidates: row.inspection.acceptedCandidates,
    rawCandidates: row.inspection.rawCandidates,
    bestSeparationMm: row.inspection.bestSeparation * 1000,
    bands: row.bands,
    topBoundaryCandidates: [...row.inspection.candidates]
      .sort((a, b) => b.candidateSeparation - a.candidateSeparation)
      .slice(0, 8)
      .map(snapshotCandidate),
  };
}

function bandContinuity(rows, bandName) {
  const summaries = rows.map((row) => row.bands[bandName]);
  const witnessCentroids = summaries.map((summary) => summary.witnessCentroid);
  const pointCentroids = summaries.map((summary) => summary.pointCentroid);
  const candidateMoments = summaries.map((summary) => summary.meanCandidateMomentProxy);
  const pointMoments = summaries.map((summary) => summary.meanPointMomentProxy);
  const centroidNormalMoments = summaries.map((summary) => summary.centroidMeanNormalMomentProxy);
  const normals = summaries.map((summary) => summary.normalMean);
  const allNormalsValid = normals.every(Boolean);
  const spanAxisStats = [0, 1, 2].map((axis) => stats(summaries.map((summary) => summary.pointSpanMm[axis])));

  return {
    candidateCount: stats(summaries.map((summary) => summary.candidateCount)),
    manifoldPointCount: stats(summaries.map((summary) => summary.manifoldPointCount)),
    pointSpanMmByAxis: spanAxisStats,
    witnessCentroidStepMm: stats(witnessCentroids.map((value, i) => distance(value, witnessCentroids[(i + 1) % rows.length]) * 1000)),
    pointCentroidStepMm: stats(pointCentroids.map((value, i) => distance(value, pointCentroids[(i + 1) % rows.length]) * 1000)),
    meanCandidateMomentStepMm: stats(candidateMoments.map((value, i) => distance(value, candidateMoments[(i + 1) % rows.length]) * 1000)),
    meanPointMomentStepMm: stats(pointMoments.map((value, i) => distance(value, pointMoments[(i + 1) % rows.length]) * 1000)),
    centroidMeanNormalMomentStepMm: centroidNormalMoments.every(Boolean)
      ? stats(centroidNormalMoments.map((value, i) => distance(value, centroidNormalMoments[(i + 1) % rows.length]) * 1000))
      : null,
    normalMeanStepDeg: allNormalsValid
      ? stats(normals.map((value, i) => angleDeg(value, normals[(i + 1) % rows.length])))
      : null,
    worstWitnessCentroidStep: worstStep(witnessCentroids, (a, b) => distance(a, b) * 1000),
    worstPointCentroidStep: worstStep(pointCentroids, (a, b) => distance(a, b) * 1000),
  };
}

function continuitySummary(label, rows, expectedSurface, referenceOnset = null) {
  if (rows.some((row) => !row.hit)) throw new Error(`${label}: missing contact`);
  if (!rows.every((row) => row.surface === expectedSurface)) throw new Error(`${label}: selected surface drift`);

  const selectedPoints = rows.map((row) => row.pointWorld);
  const selectedNormals = rows.map((row) => row.normalWorld);
  const selectedPointStepsMm = selectedPoints.map((point, i) => distance(point, selectedPoints[(i + 1) % rows.length]) * 1000);
  const selectedNormalStepsDeg = selectedNormals.map((normal, i) => angleDeg(normal, selectedNormals[(i + 1) % rows.length]));
  const onset = rows.map((row) => row.onset);
  const worstSelectedPoint = worstStep(selectedPoints, (a, b) => distance(a, b) * 1000);
  const worstSelectedNormal = worstStep(selectedNormals, angleDeg);

  return {
    label,
    phaseCount: rows.length,
    expectedSurface,
    meshTriangleCount: rows[0].meshTriangleCount,
    onsetRangeMm: (Math.max(...onset) - Math.min(...onset)) * 1000,
    referenceOnset,
    deltaToReferenceMm: referenceOnset === null ? null : stats(onset.map((value) => (value - referenceOnset) * 1000)),
    selectedPointStepMm: stats(selectedPointStepsMm),
    selectedNormalStepDeg: stats(selectedNormalStepsDeg),
    worstSelectedPointStep: worstSelectedPoint,
    worstSelectedNormalStep: worstSelectedNormal,
    bands: Object.fromEntries(BAND_SPECS.map((spec) => [spec.name, bandContinuity(rows, spec.name)])),
    worstSelectedPointPair: [snapshotRow(rows[worstSelectedPoint.phaseIndex]), snapshotRow(rows[worstSelectedPoint.nextPhaseIndex])],
    worstSelectedNormalPair: [snapshotRow(rows[worstSelectedNormal.phaseIndex]), snapshotRow(rows[worstSelectedNormal.nextPhaseIndex])],
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

const phases = Array.from({ length: PHASE_COUNT }, (_, i) => 2 * Math.PI * i / PHASE_COUNT);

function measureCase(makeBox, far, near) {
  return phases.map((phase, phaseIndex) => {
    const onsetRow = findOnset(makeBox, phase, far, near);
    const attached = attachInspection(makeBox, phase, onsetRow);
    return { phaseIndex, phase, ...onsetRow, ...attached };
  });
}

const groundRows = measureCase(groundBoxAt, 0.58, 0.50);
const historicalRows = measureCase(historicalBoxAt, 0.23, 0.11);

const result = {
  method: 'E1D_ACCEPTED_MANIFOLD_PATCH_SEMANTICS',
  acceptanceSkin: 0,
  phaseCount: PHASE_COUNT,
  boundaryBands: BAND_SPECS,
  provenance: tire.provenance,
  ground: continuitySummary('flat-ground-central-strip', groundRows, 0, null),
  historical: continuitySummary('historical-small-rock-side-low', historicalRows, 1, EXPECTED_HISTORICAL_ONSET),
};

console.log('E1D_MANIFOLD_SEMANTICS_RESULT', JSON.stringify(result));
console.log('E1D_MANIFOLD_SEMANTICS_MEASURED');
