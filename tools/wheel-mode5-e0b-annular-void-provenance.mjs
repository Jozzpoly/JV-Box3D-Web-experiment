import { createE2rWorld } from '../.test-dist/scene/e2r-world.js';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const FAR = 1.25;
const NEAR = 0;
const PHASE_COUNT = 31;
const AXIAL_STATIONS = 129;
const ANGULAR_SEGMENTS = 128;
const EPS = 1e-11;
const tire = await loadOwnerM6TireGeometryR3();
const rocks = createE2rWorld().boxes.slice(9);

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
const HISTORICAL_DIRECTION = norm([0.15, -0.25, 1]);
const IDENTITY = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });
const ZERO = Object.freeze([0, 0, 0]);

if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire provenance drifted: ${JSON.stringify(tire.provenance)}`);
}

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
  if (!(n > EPS)) throw new Error(`degenerate vector ${JSON.stringify(v)}`);
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
function nearly(a, b, tolerance = 1e-12) { return Math.abs(a - b) <= tolerance; }
function sameRockGeometry(a, b) {
  return ['x', 'y', 'z'].every((k) => nearly(a.halfExtents[k], b.halfExtents[k])) &&
    ['x', 'y', 'z', 'w'].every((k) => nearly(a.rotation[k], b.rotation[k]));
}
function quantile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const p = (sorted.length - 1) * fraction;
  const lo = Math.floor(p), hi = Math.ceil(p);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (p - lo);
}

const SQRT_HALF = Math.SQRT1_2;
const WHEEL_Q = Object.freeze({ x: SQRT_HALF, y: 0, z: 0, w: SQRT_HALF });
function worldTireTrianglesAtPhase(phase) {
  return tire.triangles.map((triangle) => triangle.map((p) => qrot(WHEEL_Q, rotateLocalAboutAxle(p, phase))));
}
function boxAxes(rotation) {
  return [qrot(rotation, [1, 0, 0]), qrot(rotation, [0, 1, 0]), qrot(rotation, [0, 0, 1])];
}

// Exact continuous translation SAT for triangle vs fixed-orientation OBB with
// center(d) = offset + d * direction.
function sweptTriangleBoxInterval(triangle, box, direction, offset = ZERO) {
  const axesBox = boxAxes(box.rotation);
  const edges = [sub(triangle[1], triangle[0]), sub(triangle[2], triangle[1]), sub(triangle[0], triangle[2])];
  const axes = [axesBox[0], axesBox[1], axesBox[2], cross(edges[0], edges[1])];
  for (const edge of edges) for (const axisBox of axesBox) axes.push(cross(edge, axisBox));
  const half = [box.halfExtents.x, box.halfExtents.y, box.halfExtents.z];
  let lo = -Infinity, hi = Infinity;
  for (const axis of axes) {
    if (len2(axis) < 1e-20) continue;
    const projections = triangle.map((p) => dot(p, axis));
    const triMin = Math.min(...projections), triMax = Math.max(...projections);
    const radius =
      half[0] * Math.abs(dot(axesBox[0], axis)) +
      half[1] * Math.abs(dot(axesBox[1], axis)) +
      half[2] * Math.abs(dot(axesBox[2], axis));
    const offsetProjection = dot(offset, axis);
    const speed = dot(direction, axis);
    if (Math.abs(speed) < 1e-14) {
      if (triMin > offsetProjection + radius + EPS || triMax < offsetProjection - radius - EPS) return null;
      continue;
    }
    let a = (triMin - offsetProjection - radius) / speed;
    let b = (triMax - offsetProjection + radius) / speed;
    if (a > b) [a, b] = [b, a];
    lo = Math.max(lo, a);
    hi = Math.min(hi, b);
    if (lo > hi + EPS) return null;
  }
  return [lo, hi];
}
function firstOnset(triangles, box, direction, offset = ZERO) {
  let best = null;
  for (const triangle of triangles) {
    const interval = sweptTriangleBoxInterval(triangle, box, direction, offset);
    if (interval === null) continue;
    const lo = Math.max(interval[0], NEAR), hi = Math.min(interval[1], FAR);
    if (lo > hi + EPS) continue;
    if (hi >= FAR - 1e-9) throw new Error(`FAR endpoint intersects: ${JSON.stringify({ box, direction, offset, hi })}`);
    if (best === null || hi > best) best = hi;
  }
  return best;
}

function localRingPoint(axial, radius, angle) { return [radius * Math.cos(angle), axial, radius * Math.sin(angle)]; }
function pushQuad(out, a0, a1, b0, b1) { out.push([a0, b0, b1], [a0, b1, a1]); }
function buildP75Annular() {
  const stations = [];
  for (let i = 0; i < AXIAL_STATIONS; i += 1) {
    const t = i / (AXIAL_STATIONS - 1);
    const axial = tire.bounds.axialMin + tire.bounds.axialWidth * t;
    const interval = tire.radialIntervalAt(axial);
    const outer = tire.outerRadiusP75At(axial);
    if (!interval || !Number.isFinite(outer) || !(outer > interval.innerRadius)) throw new Error(`invalid station ${axial}`);
    stations.push({ axial, inner: interval.innerRadius, outer });
  }
  const local = [];
  for (let i = 0; i < stations.length - 1; i += 1) {
    const a = stations[i], b = stations[i + 1];
    for (let sector = 0; sector < ANGULAR_SEGMENTS; sector += 1) {
      const a0 = 2 * Math.PI * sector / ANGULAR_SEGMENTS;
      const a1 = 2 * Math.PI * (sector + 1) / ANGULAR_SEGMENTS;
      pushQuad(local,
        localRingPoint(a.axial, a.outer, a0), localRingPoint(a.axial, a.outer, a1),
        localRingPoint(b.axial, b.outer, a0), localRingPoint(b.axial, b.outer, a1));
      pushQuad(local,
        localRingPoint(a.axial, a.inner, a1), localRingPoint(a.axial, a.inner, a0),
        localRingPoint(b.axial, b.inner, a1), localRingPoint(b.axial, b.inner, a0));
    }
  }
  for (const station of [stations[0], stations.at(-1)]) {
    for (let sector = 0; sector < ANGULAR_SEGMENTS; sector += 1) {
      const a0 = 2 * Math.PI * sector / ANGULAR_SEGMENTS;
      const a1 = 2 * Math.PI * (sector + 1) / ANGULAR_SEGMENTS;
      pushQuad(local,
        localRingPoint(station.axial, station.inner, a0), localRingPoint(station.axial, station.inner, a1),
        localRingPoint(station.axial, station.outer, a0), localRingPoint(station.axial, station.outer, a1));
    }
  }
  return local.map((tri) => tri.map((p) => qrot(WHEEL_Q, p)));
}

const phaseTriangles = Array.from({ length: PHASE_COUNT }, (_, i) => worldTireTrianglesAtPhase(2 * Math.PI * i / PHASE_COUNT));
const annularTriangles = buildP75Annular();
function evaluate(label, box, direction, offset = ZERO) {
  const phases = phaseTriangles.map((triangles) => firstOnset(triangles, box, direction, offset));
  const hits = phases.filter(Number.isFinite);
  const annular = firstOnset(annularTriangles, box, direction, offset);
  const exact = {
    hitCount: hits.length,
    hitFraction: hits.length / PHASE_COUNT,
    min: hits.length ? Math.min(...hits) : null,
    median: hits.length ? quantile(hits, 0.5) : null,
    max: hits.length ? Math.max(...hits) : null,
  };
  const comparison = exact.hitCount === 0
    ? { falsePositive: annular !== null, deltaToMedian: null, outsideBy: annular === null ? 0 : null }
    : annular === null
      ? { falseNegative: true, deltaToMedian: null, outsideBy: null }
      : {
          falsePositive: false,
          falseNegative: false,
          deltaToMedian: annular - exact.median,
          outsideBy: Math.max(0, annular - exact.max, exact.min - annular),
        };
  return { label, box, direction, offset, exact, phaseOnsets: phases, annular, comparison };
}

const proceduralMatches = rocks
  .map((rock, index) => ({ rock, index }))
  .filter(({ rock }) => sameRockGeometry(rock, HISTORICAL_ROCK))
  .map(({ index }) => index);
const historical = evaluate('historical-literal-phantom-side-low', HISTORICAL_ROCK, HISTORICAL_DIRECTION);

const boreBox = Object.freeze({ halfExtents: Object.freeze({ x: 0.03, y: 0.03, z: 0.03 }), rotation: IDENTITY });
const boreDirection = Object.freeze([0, 0, 1]);
const controls = [
  evaluate('bore-center-safe', boreBox, boreDirection, [0, 0, 0]),
  evaluate('bore-offset-50mm-safe', boreBox, boreDirection, [0.05, 0, 0]),
  evaluate('bore-offset-80mm-safe', boreBox, boreDirection, [0.08, 0, 0]),
  evaluate('bore-offset-100mm-grazing', boreBox, boreDirection, [0.10, 0, 0]),
  evaluate('bore-offset-120mm-contact', boreBox, boreDirection, [0.12, 0, 0]),
];

if (proceduralMatches.length !== 1 || proceduralMatches[0] !== 45) {
  throw new Error(`historical rock procedural provenance changed: ${JSON.stringify(proceduralMatches)}`);
}
if (historical.exact.hitCount === 0 || historical.annular === null || historical.comparison.outsideBy > 0.005) {
  throw new Error(`historical literal case not represented within 5mm: ${JSON.stringify(historical)}`);
}
for (const label of ['bore-center-safe', 'bore-offset-50mm-safe', 'bore-offset-80mm-safe']) {
  const row = controls.find((item) => item.label === label);
  if (row.exact.hitCount !== 0 || row.annular !== null) {
    throw new Error(`safe bore control collided: ${JSON.stringify(row)}`);
  }
}
const contactControl = controls.find((item) => item.label === 'bore-offset-120mm-contact');
if (contactControl.exact.hitCount === 0 || contactControl.annular === null) {
  throw new Error(`contact bore control failed to contact: ${JSON.stringify(contactControl)}`);
}

const summary = {
  method: 'E0B_CONTINUOUS_TRANSLATION_SAT_P75_ANNULAR_128',
  provenance: {
    historicalLiteral: HISTORICAL_ROCK,
    proceduralMatches,
    correctedProceduralIndex: proceduralMatches[0],
    oldMisleadingIndexLabel: 357,
    tire: tire.provenance,
  },
  historical,
  controls,
  verdictSignals: {
    safeBoreFalsePositives: controls.filter((r) => r.label.includes('safe') && r.comparison.falsePositive).length,
    historicalOutsideBy: historical.comparison.outsideBy,
    grazing100mm: controls.find((r) => r.label === 'bore-offset-100mm-grazing'),
    contact120mm: contactControl,
  },
};
console.log('E0B_ANNULAR_VOID_PROVENANCE_SUMMARY', JSON.stringify(summary));
console.log('E0B_ANNULAR_VOID_PROVENANCE_OK');
