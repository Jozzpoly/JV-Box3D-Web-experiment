import { readFile } from 'node:fs/promises';
import { inspectBlockbenchRigidPartsV1 } from './blockbench-gltf-rigid-parts.mjs';
import { auditOwnerWheelProfileR3 } from './owner-m6-wheel-profile-audit.mjs';
import { calibrateOwnerWheelR1 } from './owner-m6-visual-calibration-r1.mjs';

export const OWNER_M6_TIRE_REQUESTED_RADIUS = 0.514062464;
export const OWNER_M6_TIRE_REQUESTED_WIDTH = 0.4375;
const EPS = 1e-12;
const WHEEL_PATH = new URL('../../assets/owner-vehicle/source/Offroad_Big_Wheels.gltf', import.meta.url);

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
function length(v) { return Math.hypot(v[0], v[1], v[2]); }
function normalize(v, label) {
  const n = length(v);
  if (!(n > EPS)) throw new Error(`${label} is degenerate`);
  return mul(v, 1 / n);
}
function midpoint(a, b) { return mul(add(a, b), 0.5); }
function lerp(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}
function samePoint(a, b, tolerance = 1e-10) { return length(sub(a, b)) <= tolerance; }
function uniquePoints(points) {
  const out = [];
  for (const point of points) if (!out.some((candidate) => samePoint(point, candidate))) out.push(point);
  return out;
}
function farthestPair(points) {
  let best = null;
  let bestDistance = -1;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const distance = length(sub(points[i], points[j]));
      if (distance > bestDistance) {
        bestDistance = distance;
        best = [points[i], points[j]];
      }
    }
  }
  return best;
}
function triangleAxialSegment(triangle, axial) {
  const intersections = [];
  for (let i = 0; i < 3; i += 1) {
    const a = triangle[i];
    const b = triangle[(i + 1) % 3];
    const da = a[1] - axial;
    const db = b[1] - axial;
    const aOn = Math.abs(da) <= EPS;
    const bOn = Math.abs(db) <= EPS;
    if (aOn) intersections.push(a);
    if (bOn) intersections.push(b);
    if (!aOn && !bOn && da * db < 0) intersections.push(lerp(a, b, da / (da - db)));
  }
  const unique = uniquePoints(intersections);
  return unique.length >= 2 ? farthestPair(unique) : null;
}
function radialMinOnSegment(a, b) {
  const ax = a[0], az = a[2];
  const dx = b[0] - ax, dz = b[2] - az;
  const denom = dx * dx + dz * dz;
  const t = denom > 1e-20 ? Math.max(0, Math.min(1, -(ax * dx + az * dz) / denom)) : 0;
  return Math.hypot(ax + dx * t, az + dz * t);
}
function requireMarker(source, name) {
  const point = source.uniqueNodeWorldPositions[name];
  if (!Array.isArray(point) || point.length !== 3) throw new Error(`missing verified marker ${name}`);
  return [...point];
}

export async function loadOwnerM6TireGeometryR3(
  requestedRadius = OWNER_M6_TIRE_REQUESTED_RADIUS,
  requestedWidth = OWNER_M6_TIRE_REQUESTED_WIDTH,
) {
  const text = await readFile(WHEEL_PATH, 'utf8');
  const rigidParts = inspectBlockbenchRigidPartsV1(text, 'Offroad_Big_Wheels.gltf');
  const validated = auditOwnerWheelProfileR3(rigidParts, requestedRadius, requestedWidth, {
    angularBins: 72,
    axialBins: 64,
  });
  if (validated.piece.triangleCount !== 396 || validated.piece.nonDegenerateTriangleCount !== 396) {
    throw new Error(`validated Tire recovery drifted: ${JSON.stringify(validated.piece)}`);
  }
  if (validated.frame.markerContract !== 'VERIFIED') {
    throw new Error(`marker contract is not VERIFIED: ${validated.frame.markerContract}`);
  }

  const source = rigidParts.source;
  const calibration = calibrateOwnerWheelR1(source, requestedRadius, requestedWidth);
  if (calibration.report.markerContract !== 'VERIFIED') throw new Error('calibration marker contract lost');

  const widthLeft = requireMarker(source, 'Marker_TireWidthLeft');
  const widthRight = requireMarker(source, 'Marker_TireWidthRight');
  const radiusMarker = requireMarker(source, 'Marker_TireRadiusOuter');
  const authoredCenter = midpoint(widthLeft, widthRight);
  const axleVector = sub(widthRight, widthLeft);
  const authoredWidth = length(axleVector);
  const authoredAxle = normalize(axleVector, 'authored axle');
  const centerToRadius = sub(radiusMarker, authoredCenter);
  const radialWithoutAxial = sub(centerToRadius, mul(authoredAxle, dot(centerToRadius, authoredAxle)));
  const authoredRadius = length(radialWithoutAxial);
  let authoredRadial = normalize(radialWithoutAxial, 'authored radial');
  const authoredTangent = normalize(cross(authoredAxle, authoredRadial), 'authored tangent');
  authoredRadial = normalize(cross(authoredTangent, authoredAxle), 'corrected authored radial');
  const axialScale = requestedWidth / authoredWidth;
  const radialScale = requestedRadius / authoredRadius;
  const toWheelPoint = (point) => {
    const delta = sub(point, authoredCenter);
    return [
      dot(delta, authoredRadial) * radialScale,
      dot(delta, authoredAxle) * axialScale,
      dot(delta, authoredTangent) * radialScale,
    ];
  };

  const tireMatches = rigidParts.rigidPieces.filter((piece) => piece.jointName === 'Tire');
  if (tireMatches.length !== 1) throw new Error(`expected exactly one rigid Tire piece, got ${tireMatches.length}`);
  const tire = tireMatches[0];
  const triangles = [];
  for (const primitive of tire.primitives) {
    for (let offset = 0; offset < primitive.indices.length; offset += 3) {
      const triangle = primitive.indices.slice(offset, offset + 3).map((vertexIndex) => toWheelPoint([
        primitive.positions[vertexIndex * 3],
        primitive.positions[vertexIndex * 3 + 1],
        primitive.positions[vertexIndex * 3 + 2],
      ]));
      const area = 0.5 * length(cross(sub(triangle[1], triangle[0]), sub(triangle[2], triangle[0])));
      if (area > EPS) triangles.push(triangle);
    }
  }
  if (triangles.length !== 396) throw new Error(`physical Tire triangle count drifted: ${triangles.length}`);

  const vertices = triangles.flat();
  const axialMin = Math.min(...vertices.map((point) => point[1]));
  const axialMax = Math.max(...vertices.map((point) => point[1]));
  const outerRadius = Math.max(...vertices.map((point) => Math.hypot(point[0], point[2])));
  const radialMin = Math.min(...vertices.map((point) => Math.hypot(point[0], point[2])));
  if (Math.abs(axialMin - validated.physical.axialMin) > 1e-10 || Math.abs(axialMax - validated.physical.axialMax) > 1e-10) {
    throw new Error('Tire geometry axial bounds disagree with validated audit');
  }
  if (Math.abs(outerRadius - validated.physical.outerRadius) > 1e-10 || Math.abs(radialMin - validated.physical.radialMin) > 1e-10) {
    throw new Error('Tire geometry radial bounds disagree with validated audit');
  }

  function innerRadiusAt(axial) {
    if (axial < axialMin - 1e-9 || axial > axialMax + 1e-9) return null;
    let minimum = Infinity;
    let segments = 0;
    for (const triangle of triangles) {
      const segment = triangleAxialSegment(triangle, axial);
      if (segment === null) continue;
      segments += 1;
      minimum = Math.min(minimum, radialMinOnSegment(segment[0], segment[1]));
    }
    return segments > 0 && Number.isFinite(minimum) ? minimum : null;
  }

  return Object.freeze({
    triangles: Object.freeze(triangles.map((triangle) => Object.freeze(triangle.map((point) => Object.freeze([...point]))))),
    innerRadiusAt,
    bounds: Object.freeze({ axialMin, axialMax, axialWidth: axialMax - axialMin, radialMin, outerRadius }),
    provenance: Object.freeze({
      triangleCount: triangles.length,
      markerContract: validated.frame.markerContract,
      sourceAuthority: validated.provenance.sourceAuthority,
      extraction: 'inspectBlockbenchRigidPartsV1:Tire',
      coordinateFrame: 'R1_VERIFIED_WHEEL_MARKERS',
      requestedRadius,
      requestedWidth,
    }),
  });
}
