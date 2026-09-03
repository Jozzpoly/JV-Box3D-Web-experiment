import { createE2rWorld } from '../.test-dist/scene/e2r-world.js';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const FAR = 1.25;
const NEAR = 0.0;
const TIRE_PHASE_COUNT = 31;
const AXIAL_STATION_COUNT = 129;
const ANGULAR_RESOLUTIONS = Object.freeze([64, 128]);
const EPS = 1e-11;
const tire = await loadOwnerM6TireGeometryR3();
const rocks = createE2rWorld().boxes.slice(9);

if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire provenance drifted: ${JSON.stringify(tire.provenance)}`);
}
if (Math.abs(tire.bounds.axialWidth - 0.4375) > 1e-9) throw new Error(`Tire width drifted: ${tire.bounds.axialWidth}`);
if (tire.axialOuterP75Bins.length !== 64) throw new Error(`P75 envelope drifted: ${tire.axialOuterP75Bins.length}`);

function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function len2(v) { return dot(v, v); }
function norm(v) {
  const n = Math.hypot(v[0], v[1], v[2]);
  if (!(n > EPS)) throw new Error(`degenerate direction ${JSON.stringify(v)}`);
  return mul(v, 1 / n);
}
function qnorm(q) {
  const n = Math.hypot(q.x, q.y, q.z, q.w);
  return { x: q.x / n, y: q.y / n, z: q.z / n, w: q.w / n };
}
function qrot(q, p) {
  q = qnorm(q);
  const uv = [q.y * p[2] - q.z * p[1], q.z * p[0] - q.x * p[2], q.x * p[1] - q.y * p[0]];
  const uuv = [q.y * uv[2] - q.z * uv[1], q.z * uv[0] - q.x * uv[2], q.x * uv[1] - q.y * uv[0]];
  return [
    p[0] + 2 * (q.w * uv[0] + uuv[0]),
    p[1] + 2 * (q.w * uv[1] + uuv[1]),
    p[2] + 2 * (q.w * uv[2] + uuv[2]),
  ];
}
function rotateLocalAboutAxle(p, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c * p[0] + s * p[2], p[1], -s * p[0] + c * p[2]];
}
function quantile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * fraction;
  const lo = Math.floor(position), hi = Math.ceil(position);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (position - lo);
}
function stats(values) {
  if (values.length === 0) return null;
  return {
    min: Math.min(...values),
    p05: quantile(values, 0.05),
    median: quantile(values, 0.5),
    p95: quantile(values, 0.95),
    max: Math.max(...values),
    mean: values.reduce((sum, value) => sum + value, 0) / values.length,
  };
}

// M6 wheel bodies rotate local +Y (axle) onto world +Z. This is exactly +90 deg
// about world/local X, matching createDynamicWheelBody in mode5-wheel-backend.ts.
const SQRT_HALF = Math.SQRT1_2;
const WHEEL_Q = Object.freeze({ x: SQRT_HALF, y: 0, z: 0, w: SQRT_HALF });

function worldTireTrianglesAtPhase(phaseRadians) {
  return tire.triangles.map((triangle) => triangle.map((point) =>
    qrot(WHEEL_Q, rotateLocalAboutAxle(point, phaseRadians))));
}

function boxAxes(rotation) {
  return [
    qrot(rotation, [1, 0, 0]),
    qrot(rotation, [0, 1, 0]),
    qrot(rotation, [0, 0, 1]),
  ];
}

// Continuous SAT for one stationary triangle against a fixed-orientation OBB
// translated as center(d) = d * direction. Each SAT axis yields a scalar
// interval in d; their intersection is the exact collision interval for this
// triangle under the linear sweep. No temporal stepping or Box3D solver is used.
function sweptTriangleBoxInterval(triangle, rock, direction) {
  const axesBox = boxAxes(rock.rotation);
  const edges = [
    sub(triangle[1], triangle[0]),
    sub(triangle[2], triangle[1]),
    sub(triangle[0], triangle[2]),
  ];
  const axes = [axesBox[0], axesBox[1], axesBox[2], cross(edges[0], edges[1])];
  for (const edge of edges) {
    for (const axisBox of axesBox) axes.push(cross(edge, axisBox));
  }

  const half = [rock.halfExtents.x, rock.halfExtents.y, rock.halfExtents.z];
  let lo = -Infinity;
  let hi = Infinity;
  for (const axis of axes) {
    if (len2(axis) < 1e-20) continue;
    const projections = triangle.map((point) => dot(point, axis));
    const triMin = Math.min(...projections), triMax = Math.max(...projections);
    const radius =
      half[0] * Math.abs(dot(axesBox[0], axis)) +
      half[1] * Math.abs(dot(axesBox[1], axis)) +
      half[2] * Math.abs(dot(axesBox[2], axis));
    const speed = dot(direction, axis);
    if (Math.abs(speed) < 1e-14) {
      if (triMin > radius + EPS || triMax < -radius - EPS) return null;
      continue;
    }
    let a = (triMin - radius) / speed;
    let b = (triMax + radius) / speed;
    if (a > b) [a, b] = [b, a];
    lo = Math.max(lo, a);
    hi = Math.min(hi, b);
    if (lo > hi + EPS) return null;
  }
  return [lo, hi];
}

function firstOnset(triangles, rock, direction) {
  let best = null;
  for (const triangle of triangles) {
    const interval = sweptTriangleBoxInterval(triangle, rock, direction);
    if (interval === null) continue;
    const lo = Math.max(interval[0], NEAR);
    const hi = Math.min(interval[1], FAR);
    if (lo > hi + EPS) continue;
    if (hi >= FAR - 1e-9) {
      throw new Error(`FAR endpoint intersects geometry: ${JSON.stringify({ hi, rock: rock.halfExtents, direction })}`);
    }
    if (best === null || hi > best) best = hi;
  }
  return best;
}

function buildAxialStations(outerPolicy) {
  const stations = [];
  for (let i = 0; i < AXIAL_STATION_COUNT; i += 1) {
    const t = i / (AXIAL_STATION_COUNT - 1);
    const axial = tire.bounds.axialMin + (tire.bounds.axialMax - tire.bounds.axialMin) * t;
    const interval = tire.radialIntervalAt(axial);
    if (interval === null) throw new Error(`missing Tire interval at axial=${axial}`);
    const outerRadius = outerPolicy === 'MAX'
      ? interval.outerRadius
      : tire.outerRadiusP75At(axial);
    if (!Number.isFinite(outerRadius) || !(outerRadius > interval.innerRadius)) {
      throw new Error(`invalid annular station ${outerPolicy}: ${JSON.stringify({ axial, interval, outerRadius })}`);
    }
    stations.push({ axial, innerRadius: interval.innerRadius, outerRadius });
  }
  return stations;
}

function localRingPoint(axial, radius, angle) {
  return [radius * Math.cos(angle), axial, radius * Math.sin(angle)];
}
function pushQuad(triangles, a0, a1, b0, b1) {
  triangles.push([a0, b0, b1], [a0, b1, a1]);
}
function buildAnnularWorldTriangles(outerPolicy, angularSegments) {
  const stations = buildAxialStations(outerPolicy);
  const local = [];
  for (let i = 0; i < stations.length - 1; i += 1) {
    const a = stations[i], b = stations[i + 1];
    for (let sector = 0; sector < angularSegments; sector += 1) {
      const angle0 = 2 * Math.PI * sector / angularSegments;
      const angle1 = 2 * Math.PI * (sector + 1) / angularSegments;
      pushQuad(
        local,
        localRingPoint(a.axial, a.outerRadius, angle0),
        localRingPoint(a.axial, a.outerRadius, angle1),
        localRingPoint(b.axial, b.outerRadius, angle0),
        localRingPoint(b.axial, b.outerRadius, angle1),
      );
      pushQuad(
        local,
        localRingPoint(a.axial, a.innerRadius, angle1),
        localRingPoint(a.axial, a.innerRadius, angle0),
        localRingPoint(b.axial, b.innerRadius, angle1),
        localRingPoint(b.axial, b.innerRadius, angle0),
      );
    }
  }
  for (const station of [stations[0], stations.at(-1)]) {
    for (let sector = 0; sector < angularSegments; sector += 1) {
      const angle0 = 2 * Math.PI * sector / angularSegments;
      const angle1 = 2 * Math.PI * (sector + 1) / angularSegments;
      pushQuad(
        local,
        localRingPoint(station.axial, station.innerRadius, angle0),
        localRingPoint(station.axial, station.innerRadius, angle1),
        localRingPoint(station.axial, station.outerRadius, angle0),
        localRingPoint(station.axial, station.outerRadius, angle1),
      );
    }
  }
  return Object.freeze({
    outerPolicy,
    angularSegments,
    stationCount: stations.length,
    triangleCount: local.length,
    triangles: Object.freeze(local.map((triangle) => Object.freeze(triangle.map((point) => Object.freeze(qrot(WHEEL_Q, point)))))),
  });
}

const directions = Object.freeze([
  ['front', norm([1, 0, 0])],
  ['front-low', norm([1, -0.35, 0])],
  ['front-low-left-shoulder', norm([1, -0.30, 0.45])],
  ['front-low-right-shoulder', norm([1, -0.30, -0.45])],
  ['front-left-shoulder', norm([1, 0, 0.65])],
  ['side-low', norm([0.15, -0.25, 1])],
]);
const ranked = rocks.map((rock, index) => ({
  index,
  rock,
  volume: 8 * rock.halfExtents.x * rock.halfExtents.y * rock.halfExtents.z,
})).sort((a, b) => b.volume - a.volume);
const selectedIndices = new Set([
  ...ranked.slice(0, 4).map((entry) => entry.index),
  ranked[Math.floor(ranked.length * 0.25)].index,
  ranked[Math.floor(ranked.length * 0.50)].index,
  ranked[Math.floor(ranked.length * 0.75)].index,
  ranked.at(-1).index,
  357,
]);
const samples = [...selectedIndices].sort((a, b) => a - b).map((index) => ({ index, rock: rocks[index] }));
if (samples.some((sample) => !sample.rock)) throw new Error('selected E0 rock index is unavailable');

const tirePhaseTriangles = Array.from({ length: TIRE_PHASE_COUNT }, (_, phaseIndex) => {
  const phaseRadians = 2 * Math.PI * phaseIndex / TIRE_PHASE_COUNT;
  return { phaseIndex, phaseRadians, triangles: worldTireTrianglesAtPhase(phaseRadians) };
});
const annularMeshes = new Map();
for (const outerPolicy of ['MAX', 'P75']) {
  for (const angularSegments of ANGULAR_RESOLUTIONS) {
    const mesh = buildAnnularWorldTriangles(outerPolicy, angularSegments);
    annularMeshes.set(`${outerPolicy}-${angularSegments}`, mesh);
  }
}

function phaseEnvelope(onsets) {
  const hits = onsets.filter(Number.isFinite);
  return {
    phaseCount: onsets.length,
    hitCount: hits.length,
    hitFraction: hits.length / onsets.length,
    reference: onsets[0] ?? null,
    min: hits.length ? Math.min(...hits) : null,
    median: hits.length ? quantile(hits, 0.5) : null,
    max: hits.length ? Math.max(...hits) : null,
    spread: hits.length ? Math.max(...hits) - Math.min(...hits) : null,
  };
}
function compareCandidate(onset, exact) {
  if (onset === null) {
    return {
      onset: null,
      deltaToMedian: null,
      outsidePhaseEnvelope: exact.hitCount > 0,
      outsideBy: exact.hitCount > 0 ? null : 0,
      falsePositiveVsAllPhases: false,
      falseNegativeVsAnyPhase: exact.hitCount > 0,
    };
  }
  if (exact.hitCount === 0) {
    return {
      onset,
      deltaToMedian: null,
      outsidePhaseEnvelope: true,
      outsideBy: null,
      falsePositiveVsAllPhases: true,
      falseNegativeVsAnyPhase: false,
    };
  }
  const early = Math.max(0, onset - exact.max);
  const late = Math.max(0, exact.min - onset);
  return {
    onset,
    deltaToMedian: onset - exact.median,
    outsidePhaseEnvelope: early > 1e-9 || late > 1e-9,
    outsideBy: Math.max(early, late),
    falsePositiveVsAllPhases: false,
    falseNegativeVsAnyPhase: false,
  };
}

const results = [];
for (const sample of samples) {
  for (const [directionName, direction] of directions) {
    const phaseOnsets = tirePhaseTriangles.map(({ triangles }) => firstOnset(triangles, sample.rock, direction));
    const exact = phaseEnvelope(phaseOnsets);
    const candidates = {};
    for (const [key, mesh] of annularMeshes) {
      candidates[key] = compareCandidate(firstOnset(mesh.triangles, sample.rock, direction), exact);
    }
    const result = {
      rockIndex: sample.index,
      directionName,
      halfExtents: sample.rock.halfExtents,
      volume: 8 * sample.rock.halfExtents.x * sample.rock.halfExtents.y * sample.rock.halfExtents.z,
      exactTire: exact,
      phaseOnsets,
      candidates,
    };
    results.push(result);
    console.log('E0_ANNULAR_ORACLE_CASE', JSON.stringify(result));
  }
}

function summarizeCandidate(key) {
  const rows = results.map((result) => ({ result, candidate: result.candidates[key] }));
  const deltaMedian = rows.map((row) => row.candidate.deltaToMedian).filter(Number.isFinite);
  const outsideBy = rows.map((row) => row.candidate.outsideBy).filter(Number.isFinite);
  return {
    key,
    hitCount: rows.filter((row) => row.candidate.onset !== null).length,
    exactAnyHitCount: rows.filter((row) => row.result.exactTire.hitCount > 0).length,
    falsePositiveVsAllPhases: rows.filter((row) => row.candidate.falsePositiveVsAllPhases).length,
    falseNegativeVsAnyPhase: rows.filter((row) => row.candidate.falseNegativeVsAnyPhase).length,
    outsidePhaseEnvelope: rows.filter((row) => row.candidate.outsidePhaseEnvelope).length,
    outsideOver5mm: rows.filter((row) => Number.isFinite(row.candidate.outsideBy) && row.candidate.outsideBy > 0.005).length,
    outsideOver10mm: rows.filter((row) => Number.isFinite(row.candidate.outsideBy) && row.candidate.outsideBy > 0.010).length,
    outsideOver20mm: rows.filter((row) => Number.isFinite(row.candidate.outsideBy) && row.candidate.outsideBy > 0.020).length,
    deltaToPhaseMedian: stats(deltaMedian),
    outsideBy: stats(outsideBy),
    worstOutside: [...rows]
      .filter((row) => Number.isFinite(row.candidate.outsideBy))
      .sort((a, b) => b.candidate.outsideBy - a.candidate.outsideBy)
      .slice(0, 8)
      .map((row) => ({
        rockIndex: row.result.rockIndex,
        directionName: row.result.directionName,
        exactTire: row.result.exactTire,
        candidate: row.candidate,
      })),
  };
}
function convergence(policy) {
  const aKey = `${policy}-64`, bKey = `${policy}-128`;
  const deltas = [];
  let hitMismatch = 0;
  for (const result of results) {
    const a = result.candidates[aKey].onset, b = result.candidates[bKey].onset;
    if ((a === null) !== (b === null)) hitMismatch += 1;
    else if (a !== null && b !== null) deltas.push(Math.abs(a - b));
  }
  return { policy, hitMismatch, absoluteOnsetDelta: stats(deltas) };
}

const summaries = Object.fromEntries([...annularMeshes.keys()].map((key) => [key, summarizeCandidate(key)]));
const convergences = [convergence('MAX'), convergence('P75')];
const knownRock357SideLow = results.find((result) => result.rockIndex === 357 && result.directionName === 'side-low');
if (!knownRock357SideLow || knownRock357SideLow.exactTire.hitCount === 0) {
  throw new Error(`known rock357/side-low lost exact Tire onset: ${JSON.stringify(knownRock357SideLow)}`);
}
for (const item of convergences) {
  if (item.hitMismatch !== 0) throw new Error(`annular angular convergence changed hit topology: ${JSON.stringify(item)}`);
  if ((item.absoluteOnsetDelta?.max ?? Infinity) > 0.003) {
    throw new Error(`annular angular convergence exceeds 3 mm: ${JSON.stringify(item)}`);
  }
}

const summary = {
  method: 'CONTINUOUS_TRANSLATION_SAT_TRIANGLE_VS_FIXED_ORIENTATION_OBB',
  searchRange: { near: NEAR, far: FAR },
  tire: { bounds: tire.bounds, provenance: tire.provenance, phaseCount: TIRE_PHASE_COUNT },
  scope: { rockCount: samples.length, caseCount: results.length, selectedIndices: [...selectedIndices].sort((a, b) => a - b) },
  annularMeshes: Object.fromEntries([...annularMeshes].map(([key, mesh]) => [key, {
    outerPolicy: mesh.outerPolicy,
    angularSegments: mesh.angularSegments,
    stationCount: mesh.stationCount,
    triangleCount: mesh.triangleCount,
  }])),
  convergences,
  summaries,
  knownRock357SideLow,
};
console.log('E0_ANNULAR_ORACLE_SUMMARY', JSON.stringify(summary));
console.log('E0_ANNULAR_PROFILE_ORACLE_OK');
