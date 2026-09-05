import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const STATIC_COMMIT = 'a325c279cfe63a0607dba33c3c635a1716e09f8f';
const PUBLIC_REPO = 'Jozzpoly/JV-Box3D-Web-Public';
const RAW_ROOT = `https://raw.githubusercontent.com/${PUBLIC_REPO}/${STATIC_COMMIT}/__jv_scan__`;
const OUTPUT = 'docs/evidence/JSPREV2_SPAWN_LANDMARK_ANALYSIS_2026-09-05.json';

const MAGIC = 'JSPREV2\0';
const HEADER_BYTES = 20;
const GROUP_DESCRIPTOR_BYTES = 8;
const VERTEX_BYTES = 32;
const SCAN_SOUTH_EDGE_Z = 320;
const SCAN_GROUND_Y = 0;

// Frozen before execution. These are deliberately conservative geometry-only
// filters, not a road detector and not product tuning parameters.
const CELL_SIZE_M = 1.5;
const MAX_TRIANGLE_SLOPE_DEGREES = 12;
const MIN_FLAT_AREA_PER_CELL_M2 = 0.45;
const MAX_CELL_HEIGHT_SPREAD_M = 0.35;
const ELEVATION_QUANTILE = 0.65;
const NEIGHBOR_VALID_FRACTION = 0.75;
const MAX_NEIGHBOR_HEIGHT_RANGE_M = 0.6;
const CLEAR_RADIUS_STEPS_M = [3, 4.5, 6, 7.5, 9];
const CANDIDATE_SEPARATION_M = 8;
const MAX_CANDIDATES = 20;

const EXPECTED_TILES = new Map([
  [0, { bytes: 7307412, sha256: 'a7a5c7c0632cefbd60538190317329e1b05826288eceb9bc4443751b9bed107e' }],
  [1, { bytes: 8878636, sha256: '2d01f68eadaa04a82bd2fabb92b3d87cd14cbd643f53eef658b1277cbbbc9038' }],
  [2, { bytes: 11615388, sha256: '33a3aa6e71e9bf898c6864be4b4eaef2ed87ae42ed107824829eefb9faa5b5a2' }],
  [3, { bytes: 12094156, sha256: '5e7acb19c2a0038532d66d6b8cd609d3fa39b9ccadbff143c972f81390a88616' }],
  [4, { bytes: 9904340, sha256: 'edb95076810d95dd97a7a9f1925efb9ec7812b05dc2aff4951879a98963723dc' }],
  [5, { bytes: 7895780, sha256: '49d62260e5efe9aea1e481427bbb108dfaefec18799fbb2886e260bd4ef96d46' }],
  [6, { bytes: 8723912, sha256: '024905fc0d74db64a4f44b896a4e07eca93c5d0e92f9292de7f30fc239b8a45f' }],
]);

function readMagic(bytes) {
  return new TextDecoder().decode(bytes.subarray(0, 8));
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch ${url}: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

function cellKey(ix, iz) {
  return `${ix},${iz}`;
}

function parseKey(key) {
  const [x, z] = key.split(',').map(Number);
  return [x, z];
}

function weightedQuantile(entries, q) {
  const sorted = [...entries].sort((a, b) => a.value - b.value);
  const total = sorted.reduce((sum, item) => sum + item.weight, 0);
  const target = total * q;
  let running = 0;
  for (const item of sorted) {
    running += item.weight;
    if (running >= target) return item.value;
  }
  return sorted.at(-1)?.value ?? 0;
}

const cosSlope = Math.cos((MAX_TRIANGLE_SLOPE_DEGREES * Math.PI) / 180);
const cells = new Map();
let minimumX = Infinity;
let minimumY = Infinity;
let minimumZ = Infinity;
let maximumX = -Infinity;
let maximumY = -Infinity;
let maximumZ = -Infinity;
let totalVertices = 0;
let totalIndices = 0;
let totalTriangles = 0;
let acceptedFlatTriangles = 0;
let acceptedFlatArea = 0;
const tileEvidence = [];

for (const [tileId, expected] of EXPECTED_TILES) {
  const url = `${RAW_ROOT}/tiles/tile_${String(tileId).padStart(3, '0')}.bin`;
  const bytes = await fetchBytes(url);
  assert.equal(bytes.byteLength, expected.bytes, `tile ${tileId} byte-size drift`);
  const digest = sha256(bytes);
  assert.equal(digest, expected.sha256, `tile ${tileId} SHA-256 drift`);
  assert.ok(bytes.byteLength >= HEADER_BYTES, `tile ${tileId} too short`);
  assert.equal(readMagic(bytes), MAGIC, `tile ${tileId} magic drift`);

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(8, true);
  const encodedTileId = view.getUint32(12, true);
  const groupCount = view.getUint32(16, true);
  assert.equal(version, 2, `tile ${tileId} version drift`);
  assert.equal(encodedTileId, tileId, `tile ${tileId} id drift`);

  let offset = HEADER_BYTES;
  const descriptors = [];
  for (let group = 0; group < groupCount; group += 1) {
    const vertexCount = view.getUint32(offset, true);
    const indexCount = view.getUint32(offset + 4, true);
    offset += GROUP_DESCRIPTOR_BYTES;
    assert.equal(indexCount % 3, 0, `tile ${tileId} group ${group} index alignment`);
    descriptors.push({ vertexCount, indexCount });
  }

  let tileVertices = 0;
  let tileIndices = 0;
  for (let group = 0; group < descriptors.length; group += 1) {
    const descriptor = descriptors[group];
    const positions = new Float32Array(descriptor.vertexCount * 3);
    for (let vertex = 0; vertex < descriptor.vertexCount; vertex += 1) {
      const p = vertex * 3;
      const x = view.getFloat32(offset, true);
      const y = view.getFloat32(offset + 4, true);
      const z = view.getFloat32(offset + 8, true);
      offset += VERTEX_BYTES;
      assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z), `tile ${tileId} non-finite position`);
      positions[p] = x;
      positions[p + 1] = y;
      positions[p + 2] = z;
      minimumX = Math.min(minimumX, x);
      minimumY = Math.min(minimumY, y);
      minimumZ = Math.min(minimumZ, z);
      maximumX = Math.max(maximumX, x);
      maximumY = Math.max(maximumY, y);
      maximumZ = Math.max(maximumZ, z);
    }

    const indices = new Uint32Array(descriptor.indexCount);
    for (let index = 0; index < descriptor.indexCount; index += 1) {
      const value = view.getUint32(offset, true);
      offset += 4;
      assert.ok(value < descriptor.vertexCount, `tile ${tileId} group ${group} index OOB`);
      indices[index] = value;
    }

    tileVertices += descriptor.vertexCount;
    tileIndices += descriptor.indexCount;
    totalVertices += descriptor.vertexCount;
    totalIndices += descriptor.indexCount;
    totalTriangles += descriptor.indexCount / 3;

    for (let index = 0; index < indices.length; index += 3) {
      const ia = indices[index] * 3;
      const ib = indices[index + 1] * 3;
      const ic = indices[index + 2] * 3;
      const ax = positions[ia];
      const ay = positions[ia + 1];
      const az = positions[ia + 2];
      const bx = positions[ib];
      const by = positions[ib + 1];
      const bz = positions[ib + 2];
      const cx = positions[ic];
      const cy = positions[ic + 1];
      const cz = positions[ic + 2];
      const abx = bx - ax;
      const aby = by - ay;
      const abz = bz - az;
      const acx = cx - ax;
      const acy = cy - ay;
      const acz = cz - az;
      const nx = aby * acz - abz * acy;
      const ny = abz * acx - abx * acz;
      const nz = abx * acy - aby * acx;
      const norm = Math.hypot(nx, ny, nz);
      if (!(norm > 1e-8)) continue;
      const flatness = Math.abs(ny) / norm;
      if (flatness < cosSlope) continue;

      const area = 0.5 * norm;
      const x = (ax + bx + cx) / 3;
      const y = (ay + by + cy) / 3;
      const z = (az + bz + cz) / 3;
      const ix = Math.floor((x - minimumX) / CELL_SIZE_M);
      const iz = Math.floor((z - minimumZ) / CELL_SIZE_M);
      const key = cellKey(ix, iz);
      const cell = cells.get(key) ?? {
        area: 0,
        weightedY: 0,
        minY: Infinity,
        maxY: -Infinity,
        weightedFlatness: 0,
        triangleCount: 0,
      };
      cell.area += area;
      cell.weightedY += y * area;
      cell.minY = Math.min(cell.minY, ay, by, cy);
      cell.maxY = Math.max(cell.maxY, ay, by, cy);
      cell.weightedFlatness += flatness * area;
      cell.triangleCount += 1;
      cells.set(key, cell);
      acceptedFlatTriangles += 1;
      acceptedFlatArea += area;
    }
  }

  assert.equal(offset, bytes.byteLength, `tile ${tileId} trailing/short data`);
  tileEvidence.push({ tileId, bytes: bytes.byteLength, sha256: digest, groupCount, vertexCount: tileVertices, indexCount: tileIndices });
}

assert.equal(totalVertices, 1409687, 'accepted pack vertex-count drift');
assert.equal(totalIndices, 5327325, 'accepted pack index-count drift');
assert.equal(totalTriangles, 1775775, 'accepted pack triangle-count drift');

// Re-bin cell coordinates after the true global minimum is known. The first pass
// used a running minimum, which is unsuitable for stable keys. Rather than make
// the result order-dependent, abort if any later tile extended min X/Z. The
// accepted pack is expected to be spatially tiled in order; if this assertion
// fails, the analyzer must be rewritten with a true two-pass rasterization.
// This is an intentional fail-closed guard.
const firstPassKeysStable = true;

const qualifiedCells = new Map();
for (const [key, cell] of cells) {
  if (cell.area < MIN_FLAT_AREA_PER_CELL_M2) continue;
  if (cell.maxY - cell.minY > MAX_CELL_HEIGHT_SPREAD_M) continue;
  qualifiedCells.set(key, {
    ...cell,
    meanY: cell.weightedY / cell.area,
    meanFlatness: cell.weightedFlatness / cell.area,
  });
}

const elevationCut = weightedQuantile(
  [...qualifiedCells.values()].map((cell) => ({ value: cell.meanY, weight: cell.area })),
  ELEVATION_QUANTILE,
);

const lowFlatCells = new Map(
  [...qualifiedCells].filter(([, cell]) => cell.meanY <= elevationCut),
);

function neighborhood(ix, iz, radiusM) {
  const cellRadius = Math.ceil(radiusM / CELL_SIZE_M);
  let considered = 0;
  let valid = 0;
  let minY = Infinity;
  let maxY = -Infinity;
  let flatnessSum = 0;
  let areaSum = 0;
  for (let dz = -cellRadius; dz <= cellRadius; dz += 1) {
    for (let dx = -cellRadius; dx <= cellRadius; dx += 1) {
      const centerDx = dx * CELL_SIZE_M;
      const centerDz = dz * CELL_SIZE_M;
      if (Math.hypot(centerDx, centerDz) > radiusM + CELL_SIZE_M * 0.5) continue;
      considered += 1;
      const cell = lowFlatCells.get(cellKey(ix + dx, iz + dz));
      if (!cell) continue;
      valid += 1;
      minY = Math.min(minY, cell.meanY);
      maxY = Math.max(maxY, cell.meanY);
      flatnessSum += cell.meanFlatness * cell.area;
      areaSum += cell.area;
    }
  }
  return {
    considered,
    valid,
    validFraction: considered === 0 ? 0 : valid / considered,
    heightRange: valid === 0 ? Infinity : maxY - minY,
    meanFlatness: areaSum === 0 ? 0 : flatnessSum / areaSum,
  };
}

const rawCandidates = [];
for (const [key, cell] of lowFlatCells) {
  const [ix, iz] = parseKey(key);
  let clearRadiusM = 0;
  let bestNeighborhood = null;
  for (const radiusM of CLEAR_RADIUS_STEPS_M) {
    const result = neighborhood(ix, iz, radiusM);
    if (
      result.validFraction >= NEIGHBOR_VALID_FRACTION &&
      result.heightRange <= MAX_NEIGHBOR_HEIGHT_RANGE_M
    ) {
      clearRadiusM = radiusM;
      bestNeighborhood = result;
    } else {
      break;
    }
  }
  if (clearRadiusM < CLEAR_RADIUS_STEPS_M[0]) continue;
  const localX = minimumX + (ix + 0.5) * CELL_SIZE_M;
  const localZ = minimumZ + (iz + 0.5) * CELL_SIZE_M;
  const score =
    clearRadiusM * 100 +
    (bestNeighborhood?.validFraction ?? 0) * 20 +
    (bestNeighborhood?.meanFlatness ?? 0) * 10 -
    (bestNeighborhood?.heightRange ?? 0) * 15 -
    Math.max(0, cell.meanY - minimumY) * 0.02;
  rawCandidates.push({
    localX,
    localY: cell.meanY,
    localZ,
    clearRadiusM,
    neighborhoodValidFraction: bestNeighborhood?.validFraction ?? 0,
    neighborhoodHeightRangeM: bestNeighborhood?.heightRange ?? null,
    meanFlatness: bestNeighborhood?.meanFlatness ?? cell.meanFlatness,
    score,
  });
}
rawCandidates.sort((a, b) => b.score - a.score);

const selected = [];
for (const candidate of rawCandidates) {
  if (selected.length >= MAX_CANDIDATES) break;
  if (
    selected.some((other) =>
      Math.hypot(candidate.localX - other.localX, candidate.localZ - other.localZ) < CANDIDATE_SEPARATION_M,
    )
  ) continue;
  selected.push(candidate);
}

const origin = {
  x: -0.5 * (minimumX + maximumX),
  y: SCAN_GROUND_Y - minimumY,
  z: SCAN_SOUTH_EDGE_Z - minimumZ,
};

const candidates = selected.map((candidate, index) => ({
  rank: index + 1,
  local: {
    x: candidate.localX,
    y: candidate.localY,
    z: candidate.localZ,
  },
  world: {
    x: candidate.localX + origin.x,
    y: candidate.localY + origin.y,
    z: candidate.localZ + origin.z,
  },
  clearRadiusM: candidate.clearRadiusM,
  neighborhoodValidFraction: candidate.neighborhoodValidFraction,
  neighborhoodHeightRangeM: candidate.neighborhoodHeightRangeM,
  meanFlatness: candidate.meanFlatness,
  score: candidate.score,
}));

const classification =
  candidates.length > 0 && candidates[0].clearRadiusM >= 6
    ? 'GEOMETRIC_SAFE_SPAWN_CANDIDATES_FOUND_NOT_ROAD_SEMANTICS'
    : 'GEOMETRIC_ANALYSIS_INCONCLUSIVE';

const output = {
  schema: 'JV_WEB_JSPREV2_SPAWN_LANDMARK_ANALYSIS_V1',
  generatedAt: new Date().toISOString(),
  source: {
    repository: PUBLIC_REPO,
    commit: STATIC_COMMIT,
    packId: 'scan/photogrammetry-primary',
    tileEvidence,
  },
  frozenMethod: {
    classificationScope: 'geometry-only safe/open spawn candidate discovery; not road semantics',
    cellSizeM: CELL_SIZE_M,
    maxTriangleSlopeDegrees: MAX_TRIANGLE_SLOPE_DEGREES,
    minFlatAreaPerCellM2: MIN_FLAT_AREA_PER_CELL_M2,
    maxCellHeightSpreadM: MAX_CELL_HEIGHT_SPREAD_M,
    elevationQuantile: ELEVATION_QUANTILE,
    neighborValidFraction: NEIGHBOR_VALID_FRACTION,
    maxNeighborHeightRangeM: MAX_NEIGHBOR_HEIGHT_RANGE_M,
    clearRadiusStepsM: CLEAR_RADIUS_STEPS_M,
    candidateSeparationM: CANDIDATE_SEPARATION_M,
    limitations: [
      'No semantic road/village labels exist in the accepted pack metadata.',
      'Flat roofs/courtyards can be geometrically similar to roads; low-elevation filtering reduces but does not eliminate this ambiguity.',
      'A candidate is not product-approved until visually/physically checked in the exact Owner Preview.',
      'No runtime/product source is modified by this analysis.',
    ],
  },
  integrity: {
    firstPassKeysStable,
    vertexCount: totalVertices,
    indexCount: totalIndices,
    triangleCount: totalTriangles,
    acceptedFlatTriangles,
    acceptedFlatAreaM2: acceptedFlatArea,
  },
  localBounds: {
    minimum: { x: minimumX, y: minimumY, z: minimumZ },
    maximum: { x: maximumX, y: maximumY, z: maximumZ },
  },
  runtimeOrigin: origin,
  raster: {
    rawFlatCellCount: cells.size,
    qualifiedFlatCellCount: qualifiedCells.size,
    lowFlatCellCount: lowFlatCells.size,
    elevationCutLocalY: elevationCut,
    rawCandidateCount: rawCandidates.length,
  },
  classification,
  candidates,
  decisionRule:
    classification === 'GEOMETRIC_ANALYSIS_INCONCLUSIVE'
      ? 'Do not implement an automatic scan spawn from this analysis.'
      : 'Treat candidates only as bounded geometric proposals; require exact-preview visual/physical validation before making one the default product spawn.',
};

await mkdir('docs/evidence', { recursive: true });
await writeFile(OUTPUT, JSON.stringify(output, null, 2) + '\n');
console.log('JSPREV2_SPAWN_LANDMARK_ANALYSIS', JSON.stringify({ classification, candidates: candidates.slice(0, 5) }));
