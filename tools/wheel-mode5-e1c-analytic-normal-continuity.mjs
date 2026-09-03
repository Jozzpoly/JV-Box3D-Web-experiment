import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e1ProbeAnnularP75Box, 'function', 'E1 native probe binding missing');

const PHASE_COUNT = Number(process.env.JV_E1C_PHASES ?? 256);
if (!Number.isInteger(PHASE_COUNT) || PHASE_COUNT < 64 || PHASE_COUNT > 1024) {
  throw new Error(`invalid JV_E1C_PHASES ${PHASE_COUNT}`);
}

const STATION_COUNT = 129;
const EXPECTED_HISTORICAL_ONSET = 0.1700947544113708;
const HISTORICAL_DIRECTION = normalize([0.15, -0.25, 1]);
const HISTORICAL_ROCK = Object.freeze({
  halfExtents: Object.freeze([0.059916594306979265, 0.04547782222493919, 0.06463660159566842]),
  rotation: Object.freeze([0.0003777313710980216, 0.24466730447345725, 0.00009531543729218681, -0.9696070123280212]),
});
const IDENTITY = Object.freeze([0, 0, 0, 1]);

const tire = await loadOwnerM6TireGeometryR3();
if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire provenance drifted: ${JSON.stringify(tire.provenance)}`);
}

const stations = [];
for (let i = 0; i < STATION_COUNT; i += 1) {
  const t = i / (STATION_COUNT - 1);
  const axial = tire.bounds.axialMin + tire.bounds.axialWidth * t;
  const interval = tire.radialIntervalAt(axial);
  const outer = tire.outerRadiusP75At(axial);
  if (!interval || !Number.isFinite(outer) || !(outer > interval.innerRadius)) {
    throw new Error(`invalid E1c station ${JSON.stringify({ i, axial, interval, outer })}`);
  }
  stations.push(Object.freeze({ axial, inner: interval.innerRadius, outer }));
}

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
    invWheelQ,
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
  return {
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
    rawNormalWorld: row.hit ? qrot(local.wheelQ, [row.normalX, row.normalY, row.normalZ]) : null,
    pointWorld: row.hit ? qrot(local.wheelQ, [row.pointX, row.pointY, row.pointZ]) : null,
  };
}

// The closed annular solid can produce separated -> tire -> bore as an object
// travels inward. Bracket the first outside-to-contact transition only.
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

function profileSlope(stationIndex, field) {
  if (!Number.isInteger(stationIndex) || stationIndex < 0 || stationIndex + 1 >= stations.length) {
    throw new Error(`invalid profile station ${stationIndex}`);
  }
  const a = stations[stationIndex], b = stations[stationIndex + 1];
  return (b[field] - a[field]) / (b.axial - a.axial);
}

function analyticNormalAt(row, phase) {
  if (!row.hit) throw new Error('analytic normal requires a hit');
  const wheelQ = qz(phase);
  const pointLocal = qrot(qconj(wheelQ), row.pointWorld);
  const radialLength = Math.hypot(pointLocal[0], pointLocal[1]);
  if (!(radialLength > 1e-9)) throw new Error(`degenerate radial contact ${JSON.stringify({ row, pointLocal })}`);
  const er = [pointLocal[0] / radialLength, pointLocal[1] / radialLength, 0];

  let localNormal;
  let slope = null;
  let profileRadius = null;
  if (row.surface === 0 || row.surface === 1) {
    const field = row.surface === 0 ? 'outer' : 'inner';
    slope = profileSlope(row.station, field);
    profileRadius = stations[row.station][field]
      + slope * (pointLocal[2] - stations[row.station].axial);
    localNormal = row.surface === 0
      ? normalize([er[0], er[1], -slope])
      : normalize([-er[0], -er[1], slope]);
  } else if (row.surface === 2) {
    localNormal = [0, 0, -1];
  } else if (row.surface === 3) {
    localNormal = [0, 0, 1];
  } else {
    throw new Error(`unknown E1 surface ${row.surface}`);
  }

  const normalWorld = normalize(qrot(wheelQ, localNormal));
  return {
    normalWorld,
    pointLocal,
    radialLength,
    profileRadius,
    profileResidualMm: profileRadius === null ? null : (radialLength - profileRadius) * 1000,
    slope,
    rawVsAnalyticAngleDeg: angleDeg(row.rawNormalWorld, normalWorld),
  };
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
function worstStep(vectors, metric) {
  return vectors.reduce((best, _value, i) => {
    const j = (i + 1) % vectors.length;
    const value = metric(vectors[i], vectors[j]);
    return value > best.value ? { value, phaseIndex: i, nextPhaseIndex: j } : best;
  }, { value: -1, phaseIndex: -1, nextPhaseIndex: -1 });
}
function rowSnapshot(row) {
  return {
    phaseIndex: row.phaseIndex,
    phaseRad: row.phase,
    onset: row.onset,
    surface: row.surface,
    station: row.station,
    sector: row.sector,
    acceptedCandidates: row.acceptedCandidates,
    rawCandidates: row.rawCandidates,
    separation: row.separation,
    pointWorld: row.pointWorld,
    pointLocal: row.pointLocal,
    profileResidualMm: row.profileResidualMm,
    slope: row.slope,
    rawNormalWorld: row.rawNormalWorld,
    analyticNormalWorld: row.analyticNormalWorld,
    rawVsAnalyticAngleDeg: row.rawVsAnalyticAngleDeg,
  };
}

function continuitySummary(label, rows, expectedSurface, referenceOnset = null) {
  if (rows.some((row) => !row.hit)) throw new Error(`${label}: missing contact in phase sweep`);
  const rawNormals = rows.map((row) => row.rawNormalWorld);
  const analyticNormals = rows.map((row) => row.analyticNormalWorld);
  const points = rows.map((row) => row.pointWorld);
  const rawMean = normalize(vectorMean(rawNormals));
  const analyticMean = normalize(vectorMean(analyticNormals));
  const rawSteps = rows.map((_row, i) => angleDeg(rawNormals[i], rawNormals[(i + 1) % rows.length]));
  const analyticSteps = rows.map((_row, i) => angleDeg(analyticNormals[i], analyticNormals[(i + 1) % rows.length]));
  const pointStepsMm = rows.map((_row, i) => distance(points[i], points[(i + 1) % rows.length]) * 1000);
  const onset = rows.map((row) => row.onset);
  const surfaceCounts = {};
  for (const row of rows) surfaceCounts[row.surface] = (surfaceCounts[row.surface] ?? 0) + 1;
  const stationChanges = rows.reduce((n, row, i) => n + (row.station !== rows[(i + 1) % rows.length].station ? 1 : 0), 0);
  const sectorChanges = rows.reduce((n, row, i) => n + (row.sector !== rows[(i + 1) % rows.length].sector ? 1 : 0), 0);
  const worstPoint = worstStep(points, (a, b) => distance(a, b) * 1000);
  const worstRawNormal = worstStep(rawNormals, angleDeg);
  const worstAnalyticNormal = worstStep(analyticNormals, angleDeg);

  const result = {
    label,
    phaseCount: rows.length,
    expectedSurface,
    surfaceCounts,
    allExpectedSurface: rows.every((row) => row.surface === expectedSurface),
    onsetMeters: stats(onset),
    onsetRangeMm: (Math.max(...onset) - Math.min(...onset)) * 1000,
    referenceOnset,
    deltaToReferenceMm: referenceOnset === null ? null : stats(onset.map((value) => (value - referenceOnset) * 1000)),
    rawNormalStepDeg: stats(rawSteps),
    analyticNormalStepDeg: stats(analyticSteps),
    rawNormalDeviationFromMeanDeg: stats(rawNormals.map((normal) => angleDeg(normal, rawMean))),
    analyticNormalDeviationFromMeanDeg: stats(analyticNormals.map((normal) => angleDeg(normal, analyticMean))),
    rawVsAnalyticAngleDeg: stats(rows.map((row) => row.rawVsAnalyticAngleDeg)),
    pointStepMm: stats(pointStepsMm),
    profileResidualMm: stats(rows.filter((row) => row.profileResidualMm !== null).map((row) => row.profileResidualMm)),
    stationChanges,
    sectorChanges,
    acceptedCandidates: stats(rows.map((row) => row.acceptedCandidates)),
    rawCandidates: stats(rows.map((row) => row.rawCandidates)),
    rawNormalMean: rawMean,
    analyticNormalMean: analyticMean,
    worstRawNormalStep: worstRawNormal,
    worstAnalyticNormalStep: worstAnalyticNormal,
    worstPointStep: worstPoint,
    worstPointPair: [rowSnapshot(rows[worstPoint.phaseIndex]), rowSnapshot(rows[worstPoint.nextPhaseIndex])],
  };

  if (label === 'flat-ground-central-strip') {
    result.analyticVsExpectedGroundDeg = stats(analyticNormals.map((normal) => angleDeg(normal, [0, -1, 0])));
  }
  return result;
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

function measure(makeBox, far, near) {
  return phases.map((phase, phaseIndex) => {
    const native = findOnset(makeBox, phase, far, near);
    const analytic = analyticNormalAt(native, phase);
    return {
      phaseIndex,
      phase,
      ...native,
      pointLocal: analytic.pointLocal,
      radialLength: analytic.radialLength,
      profileRadius: analytic.profileRadius,
      profileResidualMm: analytic.profileResidualMm,
      slope: analytic.slope,
      analyticNormalWorld: analytic.normalWorld,
      rawVsAnalyticAngleDeg: analytic.rawVsAnalyticAngleDeg,
    };
  });
}

const groundRows = measure(groundBoxAt, 0.58, 0.50);
const historicalRows = measure(historicalBoxAt, 0.23, 0.11);

const ground = continuitySummary('flat-ground-central-strip', groundRows, 0, null);
const historical = continuitySummary('historical-small-rock-side-low', historicalRows, 1, EXPECTED_HISTORICAL_ONSET);

const result = {
  method: 'E1C_PROFILE_OF_REVOLUTION_ANALYTIC_NORMAL_FALSIFIER',
  acceptanceSkin: 0,
  phaseCount: PHASE_COUNT,
  profileStationCount: stations.length,
  provenance: tire.provenance,
  ground,
  historical,
};

console.log('E1C_ANALYTIC_NORMAL_RESULT', JSON.stringify(result));
console.log('E1C_ANALYTIC_NORMAL_MEASURED');
