import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const STATION_COUNT = 129;
const tire = await loadOwnerM6TireGeometryR3();
if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire provenance drifted: ${JSON.stringify(tire.provenance)}`);
}

const points = [];
for (let i = 0; i < STATION_COUNT; i += 1) {
  const t = i / (STATION_COUNT - 1);
  const axial = tire.bounds.axialMin + tire.bounds.axialWidth * t;
  const radius = tire.outerRadiusP75At(axial);
  if (!Number.isFinite(radius)) throw new Error(`invalid P75 at station ${i}`);
  points.push({ i, axial, radius });
}

const maxRadius = Math.max(...points.map((p) => p.radius));
const maxPoints = points.filter((p) => Math.abs(p.radius - maxRadius) <= 1e-12);

// Upper convex hull of y(radius) as a function of x(axial). This is the only
// part of the outer profile a convex support shape can physically honour.
// Maintain clockwise/non-left turns so points below chords are removed.
const upper = [];
for (const p of points) {
  while (upper.length >= 2) {
    const a = upper[upper.length - 2];
    const b = upper[upper.length - 1];
    const cross = (b.axial - a.axial) * (p.radius - b.radius) -
      (b.radius - a.radius) * (p.axial - b.axial);
    if (cross >= -1e-14) upper.pop();
    else break;
  }
  upper.push(p);
}

const near = (um) => points.filter((p) => (maxRadius - p.radius) * 1e6 <= um);
const angularSegments = 128;
const facetDeficitMm = maxRadius * (1 - Math.cos(Math.PI / angularSegments)) * 1000;
const e1cMeasuredRangeMm = 0.164550542831;

const result = {
  stationCount: points.length,
  axialMin: points[0].axial,
  axialMax: points.at(-1).axial,
  maxRadius,
  maxPoints,
  upperHullCount: upper.length,
  upperHull: upper,
  nearMax: {
    within1um: near(1).map((p) => p.i),
    within10um: near(10).map((p) => p.i),
    within100um: near(100).map((p) => p.i),
    within1000um: near(1000).map((p) => p.i),
  },
  facet128: {
    theoreticalDeficitMm: facetDeficitMm,
    e1cMeasuredOnsetRangeMm: e1cMeasuredRangeMm,
    differenceMm: e1cMeasuredRangeMm - facetDeficitMm,
  },
  provenance: tire.provenance,
};

console.log(`E2A_PROFILE_SUPPORT_RESULT ${JSON.stringify(result)}`);
console.log('E2A_PROFILE_SUPPORT_OK');
