import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e1ProbeAnnularP75Box, 'function', 'E1 native probe binding missing');
assert.equal(typeof b3.e1InspectAnnularP75BoxPatch, 'function', 'E1d introspection binding missing');

const PHASE_COUNT = Number(process.env.JV_E1E_PHASES ?? 256);
if (PHASE_COUNT !== 256) throw new Error(`E1e is pinned to the 256-phase E1d frontier, got ${PHASE_COUNT}`);
const PENETRATION_MM = Object.freeze([0.1, 0.5, 1, 2]);
const PENETRATION_M = PENETRATION_MM.map((mm) => mm / 1000);
const IDENTITY = Object.freeze([0, 0, 0, 1]);
const EXPECTED_HISTORICAL_ONSET = 0.1700947544113708;
const HISTORICAL_DIRECTION = normalize([0.15, -0.25, 1]);
const HISTORICAL_ROCK = Object.freeze({
  halfExtents: Object.freeze([0.059916594306979265, 0.04547782222493919, 0.06463660159566842]),
  rotation: Object.freeze([0.0003777313710980216, 0.24466730447345725, 0.00009531543729218681, -0.9696070123280212]),
});
const GROUND_KEY_PHASES = new Set([156, 157, 158, 191, 192]);

const tire = await loadOwnerM6TireGeometryR3();
if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire provenance drifted: ${JSON.stringify(tire.provenance)}`);
}

const STATION_COUNT = 129;
const stations = [];
for (let i = 0; i < STATION_COUNT; i += 1) {
  const t = i / (STATION_COUNT - 1);
  const axial = tire.bounds.axialMin + tire.bounds.axialWidth * t;
  const interval = tire.radialIntervalAt(axial);
  const outer = tire.outerRadiusP75At(axial);
  if (!interval || !Number.isFinite(outer) || !(outer > interval.innerRadius)) {
    throw new Error(`invalid E1e station ${JSON.stringify({ i, axial, interval, outer })}`);
  }
  stations.push(Object.freeze({ axial, inner: interval.innerRadius, outer }));
}
const STATION_PITCH = tire.bounds.axialWidth / (STATION_COUNT - 1);

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
function weightedVectorMean(entries) {
  let sum = [0, 0, 0], weight = 0;
  for (const entry of entries) {
    sum = add(sum, mul(entry.value, entry.weight));
    weight += entry.weight;
  }
  if (!(weight > 0)) return null;
  return mul(sum, 1 / weight);
}
function quantile(values, f) {
  const sorted = [...values].sort((a, b) => a - b);
  const p = (sorted.length - 1) * f, lo = Math.floor(p), hi = Math.ceil(p);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (p - lo);
}
function stats(values) {
  if (values.length === 0) return null;
  return {
    min: Math.min(...values),
    median: quantile(values, 0.5),
    p95: quantile(values, 0.95),
    max: Math.max(...values),
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    range: Math.max(...values) - Math.min(...values),
  };
}
function worstStep(vectors, metric) {
  return vectors.reduce((best, _value, i) => {
    const j = (i + 1) % vectors.length;
    const value = metric(vectors[i], vectors[j]);
    return value > best.value ? { value, phaseIndex: i, nextPhaseIndex: j } : best;
  }, { value: -1, phaseIndex: -1, nextPhaseIndex: -1 });
}
function surfaceCounts(candidates) {
  const counts = {};
  for (const candidate of candidates) counts[candidate.surface] = (counts[candidate.surface] ?? 0) + 1;
  return counts;
}

function worldBoxToWheelLocal(box, phase) {
  const wheelQ = qz(phase);
  const invWheelQ = qconj(wheelQ);
  return {
    halfExtents: box.halfExtents,
    center: qrot(invWheelQ, box.center),
    rotation: qnormalize(qmul(invWheelQ, box.rotation)),
    wheelQ,
    invWheelQ,
  };
}
function probeWorldBox(box, phase, acceptanceSkin = 0) {
  const local = worldBoxToWheelLocal(box, phase);
  const h = local.halfExtents, p = local.center, q = local.rotation;
  const row = b3.e1ProbeAnnularP75Box(h[0], h[1], h[2], p[0], p[1], p[2], q[0], q[1], q[2], q[3], acceptanceSkin);
  if (!row.valid) throw new Error(`native probe invalid: ${JSON.stringify({ box, phase })}`);
  return {
    hit: Boolean(row.hit), meshTriangleCount: row.meshTriangleCount,
    rawCandidates: row.rawCandidates, acceptedCandidates: row.acceptedCandidates,
    separation: row.hit ? row.separation : null,
    surface: row.hit ? row.surface : null, station: row.hit ? row.station : null, sector: row.hit ? row.sector : null,
    normalWorld: row.hit ? qrot(local.wheelQ, [row.normalX, row.normalY, row.normalZ]) : null,
    pointWorld: row.hit ? qrot(local.wheelQ, [row.pointX, row.pointY, row.pointZ]) : null,
  };
}
function inspectWorldBox(box, phase, acceptanceSkin = 0) {
  const local = worldBoxToWheelLocal(box, phase);
  const h = local.halfExtents, p = local.center, q = local.rotation;
  const row = b3.e1InspectAnnularP75BoxPatch(h[0], h[1], h[2], p[0], p[1], p[2], q[0], q[1], q[2], q[3], acceptanceSkin);
  if (!row.valid) throw new Error(`E1e inspect invalid: ${JSON.stringify({ box, phase })}`);
  const candidates = Array.from(row.candidates ?? []).map((candidate) => ({
    acceptedIndex: candidate.acceptedIndex,
    triangleIndex: candidate.triangleIndex,
    surface: candidate.surface,
    station: candidate.station,
    sector: candidate.sector,
    candidateSeparation: candidate.candidateSeparation,
    normalWorld: normalize(qrot(local.wheelQ, [candidate.normalX, candidate.normalY, candidate.normalZ])),
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
function findOnset(makeBox, phase, far, near, coarse = 96, refine = 22) {
  let previousDistance = far;
  let previousProbe = probeWorldBox(makeBox(far), phase, 0);
  if (previousProbe.hit) throw new Error(`far endpoint already hits: ${far}`);
  let separated = null, touching = null, touchingProbe = null;
  for (let i = 1; i <= coarse; i += 1) {
    const d = far + (near - far) * (i / coarse);
    const row = probeWorldBox(makeBox(d), phase, 0);
    if (!previousProbe.hit && row.hit) {
      separated = previousDistance; touching = d; touchingProbe = row; break;
    }
    previousDistance = d; previousProbe = row;
  }
  if (touching === null) throw new Error(`no first-contact transition in [${near}, ${far}]`);
  for (let i = 0; i < refine; i += 1) {
    const mid = 0.5 * (separated + touching);
    const row = probeWorldBox(makeBox(mid), phase, 0);
    if (row.hit) { touching = mid; touchingProbe = row; } else separated = mid;
  }
  return { onset: touching, separated, ...touchingProbe };
}

function analyticProfileNormal(pointWorld, phase, surface) {
  if (surface !== 0 && surface !== 1) return null;
  const localPoint = qrot(qconj(qz(phase)), pointWorld);
  const radial = Math.hypot(localPoint[0], localPoint[1]);
  if (!(radial > 1e-9)) return null;
  const er = [localPoint[0] / radial, localPoint[1] / radial, 0];
  let station = Math.floor((localPoint[2] - tire.bounds.axialMin) / STATION_PITCH);
  station = clamp(station, 0, STATION_COUNT - 2);
  const field = surface === 0 ? 'outer' : 'inner';
  const a = stations[station], b = stations[station + 1];
  const slope = (b[field] - a[field]) / (b.axial - a.axial);
  const localNormal = surface === 0
    ? normalize([er[0], er[1], -slope])
    : normalize([-er[0], -er[1], slope]);
  return normalize(qrot(qz(phase), localNormal));
}

function summarizePatch(inspection, phase, expectedSurface) {
  if (!(inspection.acceptedCandidates > 0)) throw new Error('E1e finite-penetration pose lost contact');
  const expected = inspection.candidates.filter((candidate) => candidate.surface === expectedSurface);
  if (expected.length === 0) throw new Error(`E1e expected surface ${expectedSurface} missing`);
  const points = expected.flatMap((candidate) => candidate.pointsWorld);
  const witnesses = expected.map((candidate) => candidate.witnessWorld);
  const rawNormals = expected.map((candidate) => candidate.normalWorld);
  const analyticNormals = expected.map((candidate) => analyticProfileNormal(candidate.witnessWorld, phase, expectedSurface)).filter(Boolean);
  const pointCentroid = vectorMean(points);
  const witnessCentroid = vectorMean(witnesses);
  const rawNormalMean = normalizeOrNull(vectorMean(rawNormals));
  const analyticNormalMean = analyticNormals.length ? normalizeOrNull(vectorMean(analyticNormals)) : null;

  const weightedPointEntries = [];
  const weightedWitnessEntries = [];
  const weightedRawNormalEntries = [];
  const weightedAnalyticNormalEntries = [];
  let penetrationWeightSum = 0;
  for (const candidate of expected) {
    const weight = Math.max(0, -candidate.candidateSeparation);
    penetrationWeightSum += weight;
    weightedWitnessEntries.push({ value: candidate.witnessWorld, weight });
    weightedRawNormalEntries.push({ value: candidate.normalWorld, weight });
    const analytic = analyticProfileNormal(candidate.witnessWorld, phase, expectedSurface);
    if (analytic) weightedAnalyticNormalEntries.push({ value: analytic, weight });
    for (const point of candidate.pointsWorld) weightedPointEntries.push({ value: point, weight });
  }
  // If all finite-penetration separations quantize to zero, preserve the
  // equal-weight aggregate instead of inventing a numerical epsilon policy.
  const weightedPointCentroid = penetrationWeightSum > 0 ? weightedVectorMean(weightedPointEntries) : pointCentroid;
  const weightedWitnessCentroid = penetrationWeightSum > 0 ? weightedVectorMean(weightedWitnessEntries) : witnessCentroid;
  const weightedRawNormal = penetrationWeightSum > 0 ? normalizeOrNull(weightedVectorMean(weightedRawNormalEntries)) : rawNormalMean;
  const weightedAnalyticNormal = penetrationWeightSum > 0 && weightedAnalyticNormalEntries.length
    ? normalizeOrNull(weightedVectorMean(weightedAnalyticNormalEntries))
    : analyticNormalMean;

  return {
    acceptedCandidates: inspection.acceptedCandidates,
    expectedCandidates: expected.length,
    allSurfaceCounts: surfaceCounts(inspection.candidates),
    expectedFraction: expected.length / inspection.candidates.length,
    stationCount: new Set(expected.map((candidate) => candidate.station)).size,
    sectorCount: new Set(expected.map((candidate) => candidate.sector)).size,
    candidateSeparationMm: stats(expected.map((candidate) => candidate.candidateSeparation * 1000)),
    penetrationWeightSum,
    pointCentroid,
    witnessCentroid,
    weightedPointCentroid,
    weightedWitnessCentroid,
    rawNormalMean,
    analyticNormalMean,
    weightedRawNormal,
    weightedAnalyticNormal,
    equalMomentProxy: rawNormalMean ? cross(pointCentroid, rawNormalMean) : null,
    weightedMomentProxy: weightedRawNormal ? cross(weightedPointCentroid, weightedRawNormal) : null,
  };
}

function finiteDepthSummary(rows, expectedSurface, keyPhases = null) {
  const points = rows.map((row) => row.patch.pointCentroid);
  const witnesses = rows.map((row) => row.patch.witnessCentroid);
  const weightedPoints = rows.map((row) => row.patch.weightedPointCentroid);
  const weightedWitnesses = rows.map((row) => row.patch.weightedWitnessCentroid);
  const rawNormals = rows.map((row) => row.patch.rawNormalMean);
  const analyticNormals = rows.map((row) => row.patch.analyticNormalMean);
  const weightedRawNormals = rows.map((row) => row.patch.weightedRawNormal);
  const weightedAnalyticNormals = rows.map((row) => row.patch.weightedAnalyticNormal);
  const equalMoments = rows.map((row) => row.patch.equalMomentProxy);
  const weightedMoments = rows.map((row) => row.patch.weightedMomentProxy);
  const allAnalytic = analyticNormals.every(Boolean);
  const allWeightedAnalytic = weightedAnalyticNormals.every(Boolean);

  const result = {
    expectedSurface,
    allSelectedPatchesContainExpectedSurface: rows.every((row) => row.patch.expectedCandidates > 0),
    allCandidatesExpectedSurface: rows.every((row) => row.patch.expectedFraction === 1),
    acceptedCandidates: stats(rows.map((row) => row.patch.acceptedCandidates)),
    expectedCandidates: stats(rows.map((row) => row.patch.expectedCandidates)),
    stationCount: stats(rows.map((row) => row.patch.stationCount)),
    sectorCount: stats(rows.map((row) => row.patch.sectorCount)),
    penetrationWeightSum: stats(rows.map((row) => row.patch.penetrationWeightSum)),
    pointCentroidStepMm: stats(points.map((value, i) => distance(value, points[(i + 1) % rows.length]) * 1000)),
    witnessCentroidStepMm: stats(witnesses.map((value, i) => distance(value, witnesses[(i + 1) % rows.length]) * 1000)),
    weightedPointCentroidStepMm: stats(weightedPoints.map((value, i) => distance(value, weightedPoints[(i + 1) % rows.length]) * 1000)),
    weightedWitnessCentroidStepMm: stats(weightedWitnesses.map((value, i) => distance(value, weightedWitnesses[(i + 1) % rows.length]) * 1000)),
    equalMomentProxyStepMm: stats(equalMoments.map((value, i) => distance(value, equalMoments[(i + 1) % rows.length]) * 1000)),
    weightedMomentProxyStepMm: stats(weightedMoments.map((value, i) => distance(value, weightedMoments[(i + 1) % rows.length]) * 1000)),
    rawNormalMeanStepDeg: rawNormals.every(Boolean) ? stats(rawNormals.map((value, i) => angleDeg(value, rawNormals[(i + 1) % rows.length]))) : null,
    analyticNormalMeanStepDeg: allAnalytic ? stats(analyticNormals.map((value, i) => angleDeg(value, analyticNormals[(i + 1) % rows.length]))) : null,
    weightedRawNormalStepDeg: weightedRawNormals.every(Boolean) ? stats(weightedRawNormals.map((value, i) => angleDeg(value, weightedRawNormals[(i + 1) % rows.length]))) : null,
    weightedAnalyticNormalStepDeg: allWeightedAnalytic ? stats(weightedAnalyticNormals.map((value, i) => angleDeg(value, weightedAnalyticNormals[(i + 1) % rows.length]))) : null,
    pointCentroidZMm: stats(points.map((value) => value[2] * 1000)),
    weightedPointCentroidZMm: stats(weightedPoints.map((value) => value[2] * 1000)),
    worstPointCentroidStep: worstStep(points, (a, b) => distance(a, b) * 1000),
    worstWeightedPointCentroidStep: worstStep(weightedPoints, (a, b) => distance(a, b) * 1000),
    worstWeightedMomentStep: worstStep(weightedMoments, (a, b) => distance(a, b) * 1000),
  };
  if (keyPhases) {
    result.keyPhases = rows.filter((row) => keyPhases.has(row.phaseIndex)).map((row) => ({
      phaseIndex: row.phaseIndex,
      acceptedCandidates: row.patch.acceptedCandidates,
      expectedCandidates: row.patch.expectedCandidates,
      allSurfaceCounts: row.patch.allSurfaceCounts,
      stationCount: row.patch.stationCount,
      sectorCount: row.patch.sectorCount,
      candidateSeparationMm: row.patch.candidateSeparationMm,
      pointCentroid: row.patch.pointCentroid,
      weightedPointCentroid: row.patch.weightedPointCentroid,
      witnessCentroid: row.patch.witnessCentroid,
      weightedWitnessCentroid: row.patch.weightedWitnessCentroid,
      rawNormalMean: row.patch.rawNormalMean,
      weightedRawNormal: row.patch.weightedRawNormal,
    }));
  }
  return result;
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

function measureCase(label, makeBox, far, near, expectedSurface, keyPhases = null) {
  const onsetRows = phases.map((phase, phaseIndex) => ({ phaseIndex, phase, ...findOnset(makeBox, phase, far, near) }));
  const onsetValues = onsetRows.map((row) => row.onset);
  const depths = {};
  for (let depthIndex = 0; depthIndex < PENETRATION_M.length; depthIndex += 1) {
    const penetrationMeters = PENETRATION_M[depthIndex];
    const penetrationMm = PENETRATION_MM[depthIndex];
    const rows = onsetRows.map((onsetRow) => {
      const distanceMeters = onsetRow.onset - penetrationMeters;
      const box = makeBox(distanceMeters);
      const inspection = inspectWorldBox(box, onsetRow.phase, 0);
      if (!(inspection.acceptedCandidates > 0)) {
        throw new Error(`${label} lost finite contact at phase ${onsetRow.phaseIndex}, depth ${penetrationMm} mm`);
      }
      // Spot-check the copied E1 selection contract at the historically
      // pathological ground phases and one deterministic phase for the side case.
      if ((keyPhases && keyPhases.has(onsetRow.phaseIndex)) || (!keyPhases && onsetRow.phaseIndex === 0)) {
        const probe = probeWorldBox(box, onsetRow.phase, 0);
        assert.equal(probe.hit, true, `${label} finite probe lost hit`);
        assert.equal(probe.acceptedCandidates, inspection.acceptedCandidates, `${label} finite accepted-count drift`);
        const winner = inspection.candidates[inspection.bestAcceptedIndex];
        assert.ok(winner, `${label} finite winner missing`);
        assert.equal(winner.surface, probe.surface, `${label} finite winner surface drift`);
        assert.equal(winner.station, probe.station, `${label} finite winner station drift`);
        assert.equal(winner.sector, probe.sector, `${label} finite winner sector drift`);
        assert.ok(distance(winner.witnessWorld, probe.pointWorld) < 2e-6, `${label} finite winner witness drift`);
      }
      return {
        phaseIndex: onsetRow.phaseIndex,
        phase: onsetRow.phase,
        onset: onsetRow.onset,
        distanceMeters,
        patch: summarizePatch(inspection, onsetRow.phase, expectedSurface),
      };
    });
    depths[String(penetrationMm)] = finiteDepthSummary(rows, expectedSurface, keyPhases);
  }
  return {
    label,
    onsetRangeMm: (Math.max(...onsetValues) - Math.min(...onsetValues)) * 1000,
    referenceOnset: label === 'historical-small-rock-side-low' ? EXPECTED_HISTORICAL_ONSET : null,
    deltaToReferenceMm: label === 'historical-small-rock-side-low'
      ? stats(onsetValues.map((value) => (value - EXPECTED_HISTORICAL_ONSET) * 1000))
      : null,
    depths,
  };
}

const result = {
  method: 'E1E_FINITE_PHYSICAL_PENETRATION_PATCH_SEMANTICS',
  acceptanceSkin: 0,
  phaseCount: PHASE_COUNT,
  penetrationMm: PENETRATION_MM,
  note: 'penetration is geometric motion inward from exact first-contact; acceptanceSkin remains zero',
  provenance: tire.provenance,
  ground: measureCase('flat-ground-central-strip', groundBoxAt, 0.58, 0.50, 0, GROUND_KEY_PHASES),
  historical: measureCase('historical-small-rock-side-low', historicalBoxAt, 0.23, 0.11, 1, null),
};

console.log('E1E_FINITE_PENETRATION_RESULT', JSON.stringify(result));
console.log('E1E_FINITE_PENETRATION_MEASURED');
