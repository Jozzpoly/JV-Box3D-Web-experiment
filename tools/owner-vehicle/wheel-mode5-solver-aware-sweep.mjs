import { readFile } from "node:fs/promises";

import { validatePinnedNativeFactoryReceiptText } from "../../.test-dist/config/native-factory-receipt.js";
import { loadMode5Box3DModule } from "../../.test-dist/physics/mode5-box3d-runtime.js";
import { m6TopologyConfigFromReceipt } from "../../.test-dist/vehicle/m6/m6-topology-config.js";

const EVIDENCE_PATH = "docs/evidence/WHEEL_MODE5_ASSET_PROFILE_CANDIDATES_2026-09-02.json";
const R3_GLB_PATH = "owner-ab/vehicles/m6-owner-r3/models/m6-owner-full-rig-r3.glb";
const CORNER_RADIUS = 0.005;
const SOLVER_INSETS = Object.freeze([0.015, 0.02, 0.025]);
const STRATEGIES = Object.freeze([
  "lower-quartile",
  "median",
  "upper-quartile",
  "outer-envelope",
]);
const EPS = 1e-9;

function normalize(v) {
  const length = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

const DIRECTIONS = Object.freeze([
  ["radial-X", normalize({ x: 1, y: 0, z: 0 })],
  ["radial-Y", normalize({ x: 0, y: 1, z: 0 })],
  ["axial+Z", normalize({ x: 0, y: 0, z: 1 })],
  ["axial-Z", normalize({ x: 0, y: 0, z: -1 })],
  ["shoulder-X+Z-30", normalize({ x: Math.cos(Math.PI / 6), y: 0, z: Math.sin(Math.PI / 6) })],
  ["shoulder-X-Z-30", normalize({ x: Math.cos(Math.PI / 6), y: 0, z: -Math.sin(Math.PI / 6) })],
  ["shoulder-X+Z-45", normalize({ x: 1, y: 0, z: 1 })],
  ["shoulder-X-Z-45", normalize({ x: 1, y: 0, z: -1 })],
  ["shoulder-X+Z-60", normalize({ x: 0.5, y: 0, z: Math.sqrt(3) / 2 })],
  ["shoulder-X-Z-60", normalize({ x: 0.5, y: 0, z: -Math.sqrt(3) / 2 })],
]);

function lineYAtX(a, b, x) {
  const dx = b[0] - a[0];
  if (Math.abs(dx) <= EPS) return Math.max(a[1], b[1]);
  const t = (x - a[0]) / dx;
  return a[1] + (b[1] - a[1]) * t;
}

function lineIntersection(a1, a2, b1, b2) {
  const dax = a2[0] - a1[0];
  const day = a2[1] - a1[1];
  const dbx = b2[0] - b1[0];
  const dby = b2[1] - b1[1];
  const determinant = dax * dby - day * dbx;
  if (Math.abs(determinant) <= EPS) return null;
  const rx = b1[0] - a1[0];
  const ry = b1[1] - a1[1];
  const t = (rx * dby - ry * dbx) / determinant;
  return [a1[0] + t * dax, a1[1] + t * day];
}

function inwardOffsetSegment(a, b, inset) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const segmentLength = Math.hypot(dx, dy);
  if (!(segmentLength > EPS)) throw new Error("degenerate profile segment");
  const outwardNormal = [-dy / segmentLength, dx / segmentLength];
  const inward = [-inset * outwardNormal[0], -inset * outwardNormal[1]];
  return [
    [a[0] + inward[0], a[1] + inward[1]],
    [b[0] + inward[0], b[1] + inward[1]],
  ];
}

function erodeUpperProfile(profile, inset) {
  const segments = [];
  for (let index = 0; index < profile.length - 1; index += 1) {
    segments.push(inwardOffsetSegment(profile[index], profile[index + 1], inset));
  }
  const leftX = profile[0][0] + inset;
  const rightX = profile[profile.length - 1][0] - inset;
  if (!(rightX > leftX)) throw new Error("inset consumed profile width");

  const core = [[leftX, lineYAtX(segments[0][0], segments[0][1], leftX)]];
  for (let index = 1; index < segments.length; index += 1) {
    const intersection = lineIntersection(
      segments[index - 1][0],
      segments[index - 1][1],
      segments[index][0],
      segments[index][1],
    );
    if (intersection === null) throw new Error("parallel eroded profile segments");
    core.push(intersection);
  }
  core.push([
    rightX,
    lineYAtX(segments[segments.length - 1][0], segments[segments.length - 1][1], rightX),
  ]);
  return core;
}

function symmetrizeProfile(profile) {
  const groups = new Map();
  for (const [x, y] of profile) {
    const absX = Math.abs(x);
    const key = absX.toFixed(9);
    const group = groups.get(key) ?? { absX, ys: [] };
    group.ys.push(y);
    groups.set(key, group);
  }

  const positive = [...groups.values()]
    .map((group) => [group.absX, group.ys.reduce((sum, value) => sum + value, 0) / group.ys.length])
    .sort((a, b) => a[0] - b[0]);

  const result = [];
  for (const [x, y] of [...positive].reverse()) {
    if (x > EPS) result.push([-x, y]);
  }
  for (const [x, y] of positive) {
    if (x <= EPS) result.push([0, y]);
    else result.push([x, y]);
  }
  return result;
}

async function readR3WheelVertices() {
  const buffer = await readFile(R3_GLB_PATH);
  const glb = new Uint8Array(buffer);
  const dv = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
  const jsonLength = dv.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(glb.slice(20, 20 + jsonLength)).trim());
  const binaryHeader = 20 + jsonLength;
  const binaryLength = dv.getUint32(binaryHeader, true);
  const binary = glb.slice(binaryHeader + 8, binaryHeader + 8 + binaryLength);
  const node = json.nodes.find((candidate) => candidate.name === "JV_R3_Real_owner_fl_wheel");
  if (!node) throw new Error("R3 FL visual wheel node missing");
  const mesh = json.meshes[node.mesh];
  const vertices = [];
  const bdv = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  for (const primitive of mesh.primitives) {
    const accessor = json.accessors[primitive.attributes.POSITION];
    const view = json.bufferViews[accessor.bufferView];
    const stride = view.byteStride ?? 12;
    const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    for (let index = 0; index < accessor.count; index += 1) {
      const offset = start + index * stride;
      vertices.push({
        x: bdv.getFloat32(offset, true),
        y: bdv.getFloat32(offset + 4, true),
        z: bdv.getFloat32(offset + 8, true),
      });
    }
  }
  return vertices;
}

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile("public/receipts/jv_m6_factory_receipt.json", "utf8"),
);
const config = m6TopologyConfigFromReceipt(receipt);
const evidence = JSON.parse(await readFile(EVIDENCE_PATH, "utf8"));
const visualVertices = await readR3WheelVertices();
const b3 = await loadMode5Box3DModule();

function makeWorld() {
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  worldDef.enableContinuous = false;
  return b3.b3CreateWorld(worldDef);
}

function makeCandidateWheel(worldId, candidate) {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.type = b3.b3BodyType.b3_dynamicBody;
  bodyDef.position = { x: 0, y: 0, z: 0 };
  bodyDef.rotation = b3.b3ComputeQuatBetweenUnitVectors(
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 },
  );
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.density = config.wheelDensity;
  shapeDef.baseMaterial.friction = config.wheelFriction;
  shapeDef.baseMaterial.restitution = 0.02;
  shapeDef.baseMaterial.rollingResistance = config.wheelRollingResistance;
  shapeDef.filter.groupIndex = -6500;
  shapeDef.enableContactEvents = true;
  const shapeId = b3.b3CreateWheelShapeProfile(
    bodyId,
    shapeDef,
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    candidate.profile.map(([x, y]) => ({ x, y })),
    candidate.cornerRadius,
  );
  if (!b3.b3Shape_IsValid(shapeId)) throw new Error(`${candidate.id} produced invalid wheel shape`);
  return { bodyId, shapeId };
}

function wallAt(worldId, normal, nearFace) {
  const thickness = 0.01;
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = {
    x: normal.x * (nearFace + thickness),
    y: normal.y * (nearFace + thickness),
    z: normal.z * (nearFace + thickness),
  };
  bodyDef.rotation = b3.b3ComputeQuatBetweenUnitVectors({ x: 1, y: 0, z: 0 }, normal);
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.enableContactEvents = true;
  return b3.b3CreateBoxShape(bodyId, shapeDef, thickness, 2, 2);
}

function visualSupport(wheelBodyId, normal) {
  const local = b3.b3Body_GetLocalVector(wheelBodyId, normal);
  let support = -Infinity;
  for (const point of visualVertices) {
    support = Math.max(support, point.x * local.x + point.y * local.y + point.z * local.z);
  }
  return support;
}

function contactAt(candidate, normal, nearFace) {
  const worldId = makeWorld();
  const contacts = b3.createContactsBuffer();
  try {
    const wheel = makeCandidateWheel(worldId, candidate);
    wallAt(worldId, normal, nearFace);
    b3.b3World_Step(worldId, 1 / 60, 4);
    b3.getShapeContactData(contacts, wheel.shapeId);
    const count = b3.getNumContacts(contacts);
    let minimumSeparation = null;
    for (let index = 0; index < count; index += 1) {
      const contact = b3.getContactAt(b3.createContact(), contacts, index);
      for (let manifoldIndex = 0; manifoldIndex < contact.manifoldCount; manifoldIndex += 1) {
        const manifold = b3.getManifoldAt(b3.createManifold(), contact, manifoldIndex);
        for (let pointIndex = 0; pointIndex < manifold.pointCount; pointIndex += 1) {
          const point = manifold.points[pointIndex];
          if (!point) continue;
          minimumSeparation = minimumSeparation === null
            ? point.separation
            : Math.min(minimumSeparation, point.separation);
        }
      }
    }
    return { count, minimumSeparation };
  } finally {
    b3.destroyContactsBuffer(contacts);
    b3.b3DestroyWorld(worldId);
  }
}

function supportForCandidate(candidate, normal) {
  const worldId = makeWorld();
  try {
    const wheel = makeCandidateWheel(worldId, candidate);
    return visualSupport(wheel.bodyId, normal);
  } finally {
    b3.b3DestroyWorld(worldId);
  }
}

function findOnset(candidate, normal, visibleSupport) {
  const high = visibleSupport + 0.05;
  const low = Math.max(0, visibleSupport - 0.06);
  for (let distance = high; distance >= low - EPS; distance -= 0.0005) {
    const probe = contactAt(candidate, normal, distance);
    if (probe.count > 0) return { nearFace: distance, ...probe };
  }
  return null;
}

function sourceProfileFor(strategy) {
  const id = `asset-${strategy}-c0mm`;
  const source = evidence.candidates.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`missing evidence candidate ${id}`);
  return source.profile;
}

function makeCandidate(strategy, solverInset) {
  const source = sourceProfileFor(strategy);
  const symmetricOuter = symmetrizeProfile(source);
  const totalErosion = solverInset + CORNER_RADIUS;
  const profile = erodeUpperProfile(symmetricOuter, totalErosion);
  return {
    id: `solver-${strategy}-i${Math.round(solverInset * 1000)}-c${Math.round(CORNER_RADIUS * 1000)}`,
    strategy,
    solverInset,
    cornerRadius: CORNER_RADIUS,
    sourceProfile: source,
    symmetricOuter,
    profile,
  };
}

function validateSymmetry(profile) {
  for (let left = 0, right = profile.length - 1; left <= right; left += 1, right -= 1) {
    const a = profile[left];
    const b = profile[right];
    if (Math.abs(a[0] + b[0]) > 1e-6 || Math.abs(a[1] - b[1]) > 1e-6) return false;
  }
  return true;
}

const results = [];
for (const strategy of STRATEGIES) {
  for (const solverInset of SOLVER_INSETS) {
    const candidate = makeCandidate(strategy, solverInset);
    if (!validateSymmetry(candidate.profile)) throw new Error(`${candidate.id} lost profile symmetry`);
    const rows = [];
    for (const [direction, normal] of DIRECTIONS) {
      const visibleSupport = supportForCandidate(candidate, normal);
      const onset = findOnset(candidate, normal, visibleSupport);
      rows.push({
        direction,
        visibleSupport,
        onset,
        onsetMinusVisible: onset === null ? null : onset.nearFace - visibleSupport,
      });
    }
    const finiteErrors = rows.map((row) => row.onsetMinusVisible).filter((value) => value !== null);
    const maxOutside = Math.max(0, ...finiteErrors);
    const deepestInside = Math.min(...finiteErrors);
    const meanAbs = finiteErrors.reduce((sum, value) => sum + Math.abs(value), 0) / finiteErrors.length;
    const radialErrors = rows.filter((row) => row.direction.startsWith("radial-")).map((row) => row.onsetMinusVisible);
    const radialMean = radialErrors.reduce((sum, value) => sum + value, 0) / radialErrors.length;
    results.push({
      id: candidate.id,
      strategy,
      solverInset,
      cornerRadius: CORNER_RADIUS,
      symmetricOuter: candidate.symmetricOuter,
      profile: candidate.profile,
      metrics: {
        maxOutside,
        deepestInside,
        meanAbs,
        radialMean,
      },
      rows,
    });
  }
}

const eligible = results.filter((result) => result.metrics.maxOutside <= 0.001);
const rankingPool = eligible.length > 0 ? eligible : results;
rankingPool.sort((a, b) => {
  if (a.metrics.maxOutside !== b.metrics.maxOutside) return a.metrics.maxOutside - b.metrics.maxOutside;
  if (a.metrics.meanAbs !== b.metrics.meanAbs) return a.metrics.meanAbs - b.metrics.meanAbs;
  return Math.abs(a.metrics.radialMean) - Math.abs(b.metrics.radialMean);
});

console.log("MODE5_SOLVER_AWARE_SWEEP_SUMMARY", JSON.stringify(results.map((result) => ({
  id: result.id,
  metrics: result.metrics,
  profile: result.profile,
}))));
console.log("MODE5_SOLVER_AWARE_SWEEP_BEST", JSON.stringify(rankingPool[0]));
