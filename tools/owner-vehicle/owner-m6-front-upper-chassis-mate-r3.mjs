import { requirePiece } from './owner-m6-full-rig-calibration-r2.mjs';
import { M6_R1_CHASSIS_LOCAL_FROM_SOURCE } from './owner-m6-visual-calibration-r1.mjs';

const EPS = 1e-9;
const MAIN_CHASSIS_PIECE = 'group5';

function fail(message) {
  throw new Error(`Owner M6 R3 front upper chassis mate rejected: ${message}`);
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function mul(a, scalar) {
  return [a[0] * scalar, a[1] * scalar, a[2] * scalar];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function length(value) {
  return Math.hypot(value[0], value[1], value[2]);
}

function distance(a, b) {
  return length(sub(a, b));
}

function normalize(value, label) {
  const magnitude = length(value);
  if (!(magnitude > EPS)) fail(`${label} is degenerate`);
  return mul(value, 1 / magnitude);
}

function rotateQuaternion(rotation, value) {
  const q = [rotation[0], rotation[1], rotation[2]];
  const t = mul(cross(q, value), 2);
  return add(value, add(mul(t, rotation[3]), cross(q, t)));
}

function chassisSourceToLocal(point) {
  const scaled = [
    point[0] * M6_R1_CHASSIS_LOCAL_FROM_SOURCE.scale[0],
    point[1] * M6_R1_CHASSIS_LOCAL_FROM_SOURCE.scale[1],
    point[2] * M6_R1_CHASSIS_LOCAL_FROM_SOURCE.scale[2],
  ];
  return add(
    M6_R1_CHASSIS_LOCAL_FROM_SOURCE.position,
    rotateQuaternion(M6_R1_CHASSIS_LOCAL_FROM_SOURCE.rotation, scaled),
  );
}

function closestPointTriangle(point, a, b, c) {
  const ab = sub(b, a);
  const ac = sub(c, a);
  const ap = sub(point, a);
  const d1 = dot(ab, ap);
  const d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) {
    return { point: a, region: 'A', barycentric: [1, 0, 0] };
  }

  const bp = sub(point, b);
  const d3 = dot(ab, bp);
  const d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) {
    return { point: b, region: 'B', barycentric: [0, 1, 0] };
  }

  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    return { point: add(a, mul(ab, v)), region: 'AB', barycentric: [1 - v, v, 0] };
  }

  const cp = sub(point, c);
  const d5 = dot(ab, cp);
  const d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) {
    return { point: c, region: 'C', barycentric: [0, 0, 1] };
  }

  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    return { point: add(a, mul(ac, w)), region: 'AC', barycentric: [1 - w, 0, w] };
  }

  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / (d4 - d3 + d5 - d6);
    return { point: add(b, mul(sub(c, b), w)), region: 'BC', barycentric: [0, 1 - w, w] };
  }

  const inverse = 1 / (va + vb + vc);
  const v = vb * inverse;
  const w = vc * inverse;
  return {
    point: add(a, add(mul(ab, v), mul(ac, w))),
    region: 'FACE',
    barycentric: [1 - v - w, v, w],
  };
}

function triangleNormal(points) {
  return normalize(
    cross(sub(points[1], points[0]), sub(points[2], points[0])),
    'chassis triangle normal',
  );
}

function nearestOnPiece(piece, queryLocal) {
  let best = null;
  for (let primitiveIndex = 0; primitiveIndex < piece.primitives.length; primitiveIndex += 1) {
    const primitive = piece.primitives[primitiveIndex];
    for (let offset = 0; offset < primitive.indices.length; offset += 3) {
      const triangleVertexIndices = primitive.indices.slice(offset, offset + 3);
      const trianglePointsChassisLocal = triangleVertexIndices.map((index) =>
        chassisSourceToLocal(primitive.positions.slice(index * 3, index * 3 + 3)),
      );
      const nearest = closestPointTriangle(queryLocal, ...trianglePointsChassisLocal);
      const distanceMeters = distance(queryLocal, nearest.point);
      if (best === null || distanceMeters < best.distanceMeters) {
        best = {
          point: nearest.point,
          distanceMeters,
          provenance: {
            sourceAsset: 'Nadwozie.gltf',
            pieceName: piece.jointName,
            jointSlot: piece.jointSlot,
            jointNodeIndex: piece.jointNodeIndex,
            pieceTriangleCount: piece.triangleCount,
            primitiveIndex,
            triangleIndex: offset / 3,
            triangleVertexIndices,
            trianglePointsChassisLocal,
            closestRegion: nearest.region,
            barycentric: nearest.barycentric,
            triangleNormalChassisLocal: triangleNormal(trianglePointsChassisLocal),
          },
        };
      }
    }
  }
  if (best === null) fail(`piece ${piece.jointName} has no triangles`);
  return Object.freeze({
    point: Object.freeze([...best.point]),
    distanceMeters: best.distanceMeters,
    provenance: Object.freeze({
      ...best.provenance,
      triangleVertexIndices: Object.freeze([...best.provenance.triangleVertexIndices]),
      trianglePointsChassisLocal: Object.freeze(
        best.provenance.trianglePointsChassisLocal.map((point) => Object.freeze([...point])),
      ),
      barycentric: Object.freeze([...best.provenance.barycentric]),
      triangleNormalChassisLocal: Object.freeze([...best.provenance.triangleNormalChassisLocal]),
    }),
  });
}

function nearestOnAnyPiece(chassis, queryLocal) {
  let best = null;
  for (const piece of chassis.rigidPieces) {
    const candidate = nearestOnPiece(piece, queryLocal);
    if (best === null || candidate.distanceMeters < best.distanceMeters) best = candidate;
  }
  if (best === null) fail('chassis has no rigid pieces');
  return best;
}

export function deriveFrontUpperChassisMateR3({
  chassis,
  authoredIntentLocal,
  physicalUpperHingeLocal,
}) {
  const semanticPiece = requirePiece(
    chassis,
    MAIN_CHASSIS_PIECE,
    'front-left upper semantic main chassis',
  );
  const selected = nearestOnPiece(semanticPiece, authoredIntentLocal);
  const physicalComparison = nearestOnPiece(semanticPiece, physicalUpperHingeLocal);
  const unrestrictedDiagnostic = nearestOnAnyPiece(chassis, authoredIntentLocal);

  return Object.freeze({
    chassisLocal: selected.point,
    selectionRule: 'AUTHORED_SUSPENSION_ATTACHMENT_INTENT_NEAREST_ON_SEMANTIC_MAIN_CHASSIS_PIECE',
    semanticPiece: MAIN_CHASSIS_PIECE,
    authoredIntentLocal: Object.freeze([...authoredIntentLocal]),
    selected,
    physicalHingeComparison: Object.freeze({
      queryLocal: Object.freeze([...physicalUpperHingeLocal]),
      result: physicalComparison,
      authority: 'DIAGNOSTIC_ONLY_NOT_SELECTION_INPUT',
    }),
    unrestrictedDiagnostic: Object.freeze({
      queryLocal: Object.freeze([...authoredIntentLocal]),
      result: unrestrictedDiagnostic,
      authority: 'DIAGNOSTIC_ONLY_NOT_SELECTION_AUTHORITY',
    }),
  });
}
