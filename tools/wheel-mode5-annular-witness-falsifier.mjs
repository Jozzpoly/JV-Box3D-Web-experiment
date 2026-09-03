import { readFile } from 'node:fs/promises';
import { createE2rWorld } from '../.test-dist/scene/e2r-world.js';
import { validatePinnedNativeFactoryReceiptText } from '../.test-dist/config/native-factory-receipt.js';
import { loadMode5Box3DModule } from '../.test-dist/physics/mode5-box3d-runtime.js';
import { m6TopologyConfigFromReceipt } from '../.test-dist/vehicle/m6/m6-topology-config.js';
import {
  createMode5WheelForGeometry,
  MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
} from '../.test-dist/vehicle/m6/mode5-wheel-backend.js';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const FULL_MASK = 0xffff_ffff_ffff_ffffn;
const FAR = 1.25;
const NEAR = 0.0;
const COARSE_STEPS = Number(process.env.JV_WITNESS_COARSE_STEPS ?? 96);
const REFINE_STEPS = Number(process.env.JV_WITNESS_REFINE_STEPS ?? 13);
const VISUAL_ZERO = 1e-9;
const VOID_TOLERANCE = 1e-5;
const MOTION_LOCKS = Object.freeze({
  linearX: true,
  linearY: true,
  linearZ: true,
  angularX: true,
  angularY: true,
  angularZ: true,
});

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile('public/receipts/jv_m6_factory_receipt.json', 'utf8'),
);
const config = m6TopologyConfigFromReceipt(receipt);
const b3 = await loadMode5Box3DModule();
const tire = await loadOwnerM6TireGeometryR3();
const rocks = createE2rWorld().boxes.slice(9);

if (!Number.isInteger(COARSE_STEPS) || COARSE_STEPS < 16) throw new Error(`invalid coarse steps ${COARSE_STEPS}`);
if (!Number.isInteger(REFINE_STEPS) || REFINE_STEPS < 6) throw new Error(`invalid refine steps ${REFINE_STEPS}`);
if (tire.provenance.triangleCount !== 396 || tire.provenance.markerContract !== 'VERIFIED') {
  throw new Error(`Tire oracle provenance drifted: ${JSON.stringify(tire.provenance)}`);
}

function vec(x, y, z) { return { x, y, z }; }
function add(a, b) { return vec(a.x + b.x, a.y + b.y, a.z + b.z); }
function sub(a, b) { return vec(a.x - b.x, a.y - b.y, a.z - b.z); }
function scale(s, v) { return vec(s * v.x, s * v.y, s * v.z); }
function norm(v) {
  const n = Math.hypot(v.x, v.y, v.z);
  return scale(1 / n, v);
}
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); }
function sameId(a, b) {
  return a?.index1 === b?.index1 && a?.world0 === b?.world0 && a?.generation === b?.generation;
}
function qxyzw(q) {
  if (q?.v) return { x: q.v.x, y: q.v.y, z: q.v.z, w: q.s };
  return { x: q.x, y: q.y, z: q.z, w: q.w };
}
function qnorm(q) {
  q = qxyzw(q);
  const n = Math.hypot(q.x, q.y, q.z, q.w);
  return { x: q.x / n, y: q.y / n, z: q.z / n, w: q.w / n };
}
function qinv(q) {
  q = qnorm(q);
  return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
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

function createStaticBox(worldId, box) {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = { ...box.center };
  bodyDef.rotation = {
    v: { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z },
    s: box.rotation.w,
  };
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.baseMaterial.friction = box.friction ?? 0.8;
  shapeDef.filter.categoryBits = config.terrainCategoryBits;
  shapeDef.filter.maskBits = FULL_MASK;
  shapeDef.enableContactEvents = true;
  const shapeId = b3.b3CreateBoxShape(
    bodyId,
    shapeDef,
    box.halfExtents.x,
    box.halfExtents.y,
    box.halfExtents.z,
  );
  return { bodyId, shapeId };
}

function classifyContact(wheelShapeId, wheelBodyId) {
  const contacts = b3.createContactsBuffer();
  try {
    b3.getShapeContactData(contacts, wheelShapeId);
    const contactCount = b3.getNumContacts(contacts);
    const points = [];
    for (let i = 0; i < contactCount; i += 1) {
      const contact = b3.getContactAt(b3.createContact(), contacts, i);
      const wheelIsA = sameId(contact.shapeIdA, wheelShapeId);
      const wheelIsB = sameId(contact.shapeIdB, wheelShapeId);
      if (wheelIsA === wheelIsB) throw new Error('wheel contact ordering is ambiguous');
      const bodyA = b3.b3Shape_GetBody(contact.shapeIdA);
      const bodyB = b3.b3Shape_GetBody(contact.shapeIdB);
      const comA = b3.b3Body_GetWorldCenterOfMass(bodyA);
      const comB = b3.b3Body_GetWorldCenterOfMass(bodyB);
      for (let m = 0; m < contact.manifoldCount; m += 1) {
        const manifold = b3.getManifoldAt(b3.createManifold(), contact, m);
        for (let p = 0; p < manifold.pointCount; p += 1) {
          const point = manifold.points[p];
          const worldA = add(comA, point.anchorA);
          const worldB = add(comB, point.anchorB);
          const obstacleWorld = wheelIsA ? worldB : worldA;
          const obstacleLocal = b3.b3Body_GetLocalPoint(wheelBodyId, obstacleWorld);
          const axial = obstacleLocal.y;
          const radial = Math.hypot(obstacleLocal.x, obstacleLocal.z);
          const innerRadius = tire.innerRadiusAt(axial);
          const insideVoid = innerRadius !== null && radial < innerRadius - VOID_TOLERANCE;
          points.push({
            axial,
            radial,
            innerRadius,
            voidClearance: innerRadius === null ? null : innerRadius - radial,
            insideVoid,
            separation: point.separation,
            baseSeparation: point.baseSeparation,
            totalNormalImpulse: point.totalNormalImpulse,
            normal: manifold.normal,
            obstacleLocal,
          });
        }
      }
    }
    return {
      rawContact: contactCount > 0,
      acceptedContact: points.some((point) => !point.insideVoid),
      contactCount,
      pointCount: points.length,
      allPointsInsideVoid: points.length > 0 && points.every((point) => point.insideVoid),
      points,
    };
  } finally {
    b3.destroyContactsBuffer(contacts);
  }
}

function createLockedWheel(worldId) {
  const wheel = createMode5WheelForGeometry(
    MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
    b3,
    worldId,
    config,
    { x: 0, y: 0, z: 0 },
    -8201,
  );
  b3.b3Body_SetMotionLocks(wheel.bodyId, MOTION_LOCKS);
  return wheel;
}

function probeBox(box) {
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  worldDef.enableContinuous = false;
  const worldId = b3.b3CreateWorld(worldDef);
  try {
    const wheel = createLockedWheel(worldId);
    const positionBefore = b3.b3Body_GetPosition(wheel.bodyId);
    const rotationBefore = b3.b3Body_GetRotation(wheel.bodyId);
    createStaticBox(worldId, box);
    b3.b3World_Step(worldId, 1 / 60, 4);
    const positionAfter = b3.b3Body_GetPosition(wheel.bodyId);
    const rotationAfter = b3.b3Body_GetRotation(wheel.bodyId);
    if (distance(positionBefore, positionAfter) > 1e-8) {
      throw new Error(`locked wheel translated: ${JSON.stringify({ positionBefore, positionAfter })}`);
    }
    const qa = qnorm(rotationBefore), qb = qnorm(rotationAfter);
    const qDelta = Math.min(
      Math.hypot(qa.x - qb.x, qa.y - qb.y, qa.z - qb.z, qa.w - qb.w),
      Math.hypot(qa.x + qb.x, qa.y + qb.y, qa.z + qb.z, qa.w + qb.w),
    );
    if (qDelta > 1e-8) throw new Error(`locked wheel rotated: qDelta=${qDelta}`);
    return {
      wheelPose: { position: positionAfter, rotation: rotationAfter },
      ...classifyContact(wheel.rollingShapeId, wheel.bodyId),
    };
  } finally {
    b3.b3DestroyWorld(worldId);
  }
}

const referenceWorldDef = b3.b3DefaultWorldDef();
referenceWorldDef.gravity = { x: 0, y: 0, z: 0 };
const referenceWorld = b3.b3CreateWorld(referenceWorldDef);
const referenceWheel = createLockedWheel(referenceWorld);
const REFERENCE_WHEEL_POSE = Object.freeze({
  position: b3.b3Body_GetPosition(referenceWheel.bodyId),
  rotation: b3.b3Body_GetRotation(referenceWheel.bodyId),
});
b3.b3DestroyWorld(referenceWorld);

function a3(v) { return [v.x, v.y, v.z]; }
function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function add3(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function mul3(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function len2(a) { return dot3(a, a); }

function exactTireBoxGap(box) {
  const half = [box.halfExtents.x, box.halfExtents.y, box.halfExtents.z];
  const invBox = qinv(box.rotation);
  const wheelQ = REFERENCE_WHEEL_POSE.rotation;
  const wheelP = a3(REFERENCE_WHEEL_POSE.position);
  const boxP = a3(box.center);
  function toBoxLocal(local) {
    const worldRot = qrot(wheelQ, local);
    const world = add3(wheelP, worldRot);
    return qrot(invBox, sub3(world, boxP));
  }
  const triangles = tire.triangles.map((triangle) => triangle.map(toBoxLocal));

  function pointAabbDist2(p) {
    let d2 = 0;
    for (let k = 0; k < 3; k += 1) {
      const d = Math.max(Math.abs(p[k]) - half[k], 0);
      d2 += d * d;
    }
    return d2;
  }
  function axisSeparates(axis, tri) {
    if (len2(axis) < 1e-18) return false;
    const projection = tri.map((v) => dot3(v, axis));
    const min = Math.min(...projection), max = Math.max(...projection);
    const r = half[0] * Math.abs(axis[0]) + half[1] * Math.abs(axis[1]) + half[2] * Math.abs(axis[2]);
    return min > r || max < -r;
  }
  function triIntersectsBox(tri) {
    const edges = [sub3(tri[1], tri[0]), sub3(tri[2], tri[1]), sub3(tri[0], tri[2])];
    const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1], cross3(edges[0], edges[1])];
    for (const edge of edges) {
      axes.push(cross3(edge, [1, 0, 0]), cross3(edge, [0, 1, 0]), cross3(edge, [0, 0, 1]));
    }
    return !axes.some((axis) => axisSeparates(axis, tri));
  }
  function pointTriDist2(p, a, b, c) {
    const ab = sub3(b, a), ac = sub3(c, a), ap = sub3(p, a);
    const d1 = dot3(ab, ap), d2 = dot3(ac, ap); if (d1 <= 0 && d2 <= 0) return len2(ap);
    const bp = sub3(p, b), d3 = dot3(ab, bp), d4 = dot3(ac, bp); if (d3 >= 0 && d4 <= d3) return len2(bp);
    const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); return len2(sub3(p, add3(a, mul3(ab, v)))); }
    const cp = sub3(p, c), d5 = dot3(ab, cp), d6 = dot3(ac, cp); if (d6 >= 0 && d5 <= d6) return len2(cp);
    const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); return len2(sub3(p, add3(a, mul3(ac, w)))); }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
      const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
      return len2(sub3(p, add3(b, mul3(sub3(c, b), w))));
    }
    const denom = 1 / (va + vb + vc), v = vb * denom, w = vc * denom;
    return len2(sub3(p, add3(a, add3(mul3(ab, v), mul3(ac, w)))));
  }
  function segSegDist2(p1, q1, p2, q2) {
    const d1 = sub3(q1, p1), d2 = sub3(q2, p2), r = sub3(p1, p2);
    const a = dot3(d1, d1), e = dot3(d2, d2), f = dot3(d2, r); let s, t;
    const EPS = 1e-14;
    if (a <= EPS && e <= EPS) return len2(sub3(p1, p2));
    if (a <= EPS) { s = 0; t = Math.max(0, Math.min(1, f / e)); }
    else {
      const c = dot3(d1, r);
      if (e <= EPS) { t = 0; s = Math.max(0, Math.min(1, -c / a)); }
      else {
        const b = dot3(d1, d2), den = a * e - b * b;
        s = den !== 0 ? Math.max(0, Math.min(1, (b * f - c * e) / den)) : 0;
        t = (b * s + f) / e;
        if (t < 0) { t = 0; s = Math.max(0, Math.min(1, -c / a)); }
        else if (t > 1) { t = 1; s = Math.max(0, Math.min(1, (b - c) / a)); }
      }
    }
    return len2(sub3(add3(p1, mul3(d1, s)), add3(p2, mul3(d2, t))));
  }

  const corners = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) corners.push([sx * half[0], sy * half[1], sz * half[2]]);
  const boxEdges = [];
  for (let i = 0; i < corners.length; i += 1) {
    for (let j = i + 1; j < corners.length; j += 1) {
      let diffs = 0;
      for (let k = 0; k < 3; k += 1) if (corners[i][k] !== corners[j][k]) diffs += 1;
      if (diffs === 1) boxEdges.push([corners[i], corners[j]]);
    }
  }

  let best2 = Infinity;
  for (const tri of triangles) {
    if (triIntersectsBox(tri)) return 0;
    for (const vertex of tri) best2 = Math.min(best2, pointAabbDist2(vertex));
    for (const corner of corners) best2 = Math.min(best2, pointTriDist2(corner, tri[0], tri[1], tri[2]));
    const triEdges = [[tri[0], tri[1]], [tri[1], tri[2]], [tri[2], tri[0]]];
    for (const edgeA of triEdges) for (const edgeB of boxEdges) best2 = Math.min(best2, segSegDist2(edgeA[0], edgeA[1], edgeB[0], edgeB[1]));
  }
  return Math.sqrt(best2);
}

function boxAt(rock, direction, distanceMeters) {
  return { ...rock, center: scale(distanceMeters, direction) };
}

function refineBoolean(rock, direction, farFalse, nearTrue, selector) {
  let far = farFalse;
  let near = nearTrue;
  let nearProbe = probeBox(boxAt(rock, direction, near));
  if (!selector(nearProbe)) throw new Error('boolean refinement near endpoint is not true');
  for (let i = 0; i < REFINE_STEPS; i += 1) {
    const mid = 0.5 * (far + near);
    const result = probeBox(boxAt(rock, direction, mid));
    if (selector(result)) {
      near = mid;
      nearProbe = result;
    } else {
      far = mid;
    }
  }
  return { distance: near, probe: nearProbe, visualGap: exactTireBoxGap(boxAt(rock, direction, near)) };
}

function refineVisual(rock, direction, farSeparated, nearTouching) {
  let far = farSeparated;
  let near = nearTouching;
  for (let i = 0; i < REFINE_STEPS + 3; i += 1) {
    const mid = 0.5 * (far + near);
    if (exactTireBoxGap(boxAt(rock, direction, mid)) <= VISUAL_ZERO) near = mid;
    else far = mid;
  }
  return { distance: near, visualGap: exactTireBoxGap(boxAt(rock, direction, near)) };
}

function summarizePoints(points) {
  if (points.length === 0) return null;
  const clearances = points.map((point) => point.voidClearance).filter((value) => value !== null);
  return {
    pointCount: points.length,
    insideVoidCount: points.filter((point) => point.insideVoid).length,
    maxVoidClearance: clearances.length ? Math.max(...clearances) : null,
    minVoidClearance: clearances.length ? Math.min(...clearances) : null,
    points,
  };
}

function evaluateCase(rockIndex, rock, directionName, direction) {
  let previousDistance = FAR;
  let previousProbe = probeBox(boxAt(rock, direction, FAR));
  let previousVisual = exactTireBoxGap(boxAt(rock, direction, FAR));
  if (previousProbe.rawContact || previousProbe.acceptedContact || previousVisual <= VISUAL_ZERO) {
    throw new Error(`far endpoint is not separated for rock ${rockIndex}/${directionName}`);
  }

  let rawBracket = null;
  let acceptedBracket = null;
  let visualBracket = null;
  for (let step = 1; step <= COARSE_STEPS; step += 1) {
    const t = step / COARSE_STEPS;
    const d = FAR + (NEAR - FAR) * t;
    const probe = probeBox(boxAt(rock, direction, d));
    const visual = exactTireBoxGap(boxAt(rock, direction, d));
    if (rawBracket === null && !previousProbe.rawContact && probe.rawContact) rawBracket = [previousDistance, d];
    if (acceptedBracket === null && !previousProbe.acceptedContact && probe.acceptedContact) acceptedBracket = [previousDistance, d];
    if (visualBracket === null && previousVisual > VISUAL_ZERO && visual <= VISUAL_ZERO) visualBracket = [previousDistance, d];
    previousDistance = d;
    previousProbe = probe;
    previousVisual = visual;
  }

  const raw = rawBracket === null ? null : refineBoolean(rock, direction, rawBracket[0], rawBracket[1], (probe) => probe.rawContact);
  const accepted = acceptedBracket === null ? null : refineBoolean(rock, direction, acceptedBracket[0], acceptedBracket[1], (probe) => probe.acceptedContact);
  const visual = visualBracket === null ? null : refineVisual(rock, direction, visualBracket[0], visualBracket[1]);

  return {
    rockIndex,
    directionName,
    direction,
    halfExtents: rock.halfExtents,
    rotation: rock.rotation,
    volume: 8 * rock.halfExtents.x * rock.halfExtents.y * rock.halfExtents.z,
    raw: raw === null ? null : {
      distance: raw.distance,
      visualGap: raw.visualGap,
      contactCount: raw.probe.contactCount,
      allPointsInsideVoid: raw.probe.allPointsInsideVoid,
      pointSummary: summarizePoints(raw.probe.points),
    },
    accepted: accepted === null ? null : {
      distance: accepted.distance,
      visualGap: accepted.visualGap,
      contactCount: accepted.probe.contactCount,
      pointSummary: summarizePoints(accepted.probe.points),
    },
    visual,
    rawLeadDistance: raw && visual ? raw.distance - visual.distance : null,
    acceptedLeadDistance: accepted && visual ? accepted.distance - visual.distance : null,
    noVisualHitInRange: visual === null,
    predicateNeverAcceptsInRange: accepted === null,
  };
}

function quantile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * fraction;
  const lo = Math.floor(position), hi = Math.ceil(position);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (position - lo);
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

function control(label, box) {
  const result = probeBox(box);
  if (!result.rawContact) throw new Error(`${label} control has no raw C contact`);
  if (!result.acceptedContact) throw new Error(`${label} control was incorrectly rejected by annular witness predicate`);
  return { label, pointSummary: summarizePoints(result.points) };
}

const controls = [
  control('flat-ground', {
    center: { x: 0, y: -1, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    halfExtents: { x: 4, y: 0.5, z: 4 },
    friction: 0.8,
  }),
  control('front-wall', {
    center: { x: 1, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    halfExtents: { x: 0.5, y: 2, z: 2 },
    friction: 0.8,
  }),
];

const directions = [
  ['front', norm({ x: 1, y: 0, z: 0 })],
  ['front-low', norm({ x: 1, y: -0.35, z: 0 })],
  ['front-low-left-shoulder', norm({ x: 1, y: -0.30, z: 0.45 })],
  ['front-low-right-shoulder', norm({ x: 1, y: -0.30, z: -0.45 })],
  ['front-left-shoulder', norm({ x: 1, y: 0, z: 0.65 })],
  ['side-low', norm({ x: 0.15, y: -0.25, z: 1 })],
];

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
  ranked[ranked.length - 1].index,
  357,
]);
const scope = process.env.JV_WITNESS_SCOPE ?? 'selected';
const samples = scope === 'full'
  ? rocks.map((rock, index) => ({ index, rock }))
  : [...selectedIndices].sort((a, b) => a - b).map((index) => ({ index, rock: rocks[index] }));
if (samples.some((sample) => !sample.rock)) throw new Error('selected rock index is unavailable');

const results = [];
for (const sample of samples) {
  for (const [directionName, direction] of directions) {
    const result = evaluateCase(sample.index, sample.rock, directionName, direction);
    results.push(result);
    console.log('ANNULAR_WITNESS_CASE', JSON.stringify(result));
  }
}

const known = results.find((result) => result.rockIndex === 357 && result.directionName === 'side-low');
if (!known?.raw) throw new Error('known rock357/side-low raw C onset was not recovered');
if (!known.raw.allPointsInsideVoid) {
  throw new Error(`known phantom onset is not inside recovered Tire void: ${JSON.stringify(known.raw)}`);
}

const withVisual = results.filter((result) => result.visual !== null);
const noVisual = results.filter((result) => result.visual === null);
const acceptedWithVisual = withVisual.filter((result) => result.accepted !== null);
const rawLeads = withVisual.map((result) => result.rawLeadDistance).filter(Number.isFinite);
const acceptedLeads = acceptedWithVisual.map((result) => result.acceptedLeadDistance).filter(Number.isFinite);
const rawGaps = results.map((result) => result.raw?.visualGap).filter(Number.isFinite);
const acceptedGaps = results.map((result) => result.accepted?.visualGap).filter(Number.isFinite);
const summary = {
  scope,
  rockCount: samples.length,
  caseCount: results.length,
  controls,
  tire: { bounds: tire.bounds, provenance: tire.provenance },
  recovered: {
    rawOnsets: results.filter((result) => result.raw !== null).length,
    visualOnsets: withVisual.length,
    acceptedOnsets: results.filter((result) => result.accepted !== null).length,
  },
  predicate: {
    rawOnsetsRejected: results.filter((result) => result.raw?.allPointsInsideVoid).length,
    visualCasesNeverAccepted: withVisual.filter((result) => result.accepted === null).length,
    noVisualCases: noVisual.length,
    noVisualCasesIncorrectlyAccepted: noVisual.filter((result) => result.accepted !== null).length,
    acceptedEarlyOver5mm: acceptedWithVisual.filter((result) => result.acceptedLeadDistance > 0.005).length,
    acceptedLateOver5mm: acceptedWithVisual.filter((result) => result.acceptedLeadDistance < -0.005).length,
  },
  rawLeadDistance: stats(rawLeads),
  acceptedLeadDistance: stats(acceptedLeads),
  rawVisualGap: stats(rawGaps),
  acceptedVisualGap: stats(acceptedGaps),
  knownRock357SideLow: known,
  worstAcceptedEarly: [...acceptedWithVisual].sort((a, b) => b.acceptedLeadDistance - a.acceptedLeadDistance).slice(0, 8),
  worstAcceptedLate: [...acceptedWithVisual].sort((a, b) => a.acceptedLeadDistance - b.acceptedLeadDistance).slice(0, 8),
  noVisualAccepted: noVisual.filter((result) => result.accepted !== null).slice(0, 12),
};
console.log('ANNULAR_WITNESS_SUMMARY', JSON.stringify(summary));
console.log('ANNULAR_WITNESS_FALSIFIER_OK');
