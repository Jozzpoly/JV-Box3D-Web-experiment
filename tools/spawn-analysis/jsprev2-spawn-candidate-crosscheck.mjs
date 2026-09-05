import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const EVIDENCE = 'docs/evidence/JSPREV2_SPAWN_LANDMARK_ANALYSIS_2026-09-05.json';
const OUTPUT = 'docs/evidence/JSPREV2_SPAWN_LANDMARK_CROSSCHECK_2026-09-05.json';
const PUBLIC_REPO = 'Jozzpoly/JV-Box3D-Web-Public';
const STATIC_COMMIT = 'a325c279cfe63a0607dba33c3c635a1716e09f8f';
const RAW_ROOT = `https://raw.githubusercontent.com/${PUBLIC_REPO}/${STATIC_COMMIT}/__jv_scan__`;
const MAGIC = 'JSPREV2\0';
const HEADER_BYTES = 20;
const GROUP_DESCRIPTOR_BYTES = 8;
const VERTEX_BYTES = 32;

// Frozen before execution. This method intentionally differs from the first
// triangle-centroid raster: it uses encoded vertex normals and candidate-local
// 1 m occupancy bins, so a half-cell/global-grid phase cannot create a pass.
const CHECK_RADIUS_M = 9;
const BIN_SIZE_M = 1;
const MAX_VERTEX_SLOPE_DEGREES = 12;
const MAX_VERTEX_HEIGHT_OFFSET_M = 0.75;
const MIN_OCCUPANCY_FRACTION = 0.65;
const MAX_OCCUPIED_HEIGHT_RANGE_M = 1.0;
const TOP_CANDIDATES = 20;

function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch ${url}: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

function binKey(ix, iz) {
  return `${ix},${iz}`;
}

const primary = JSON.parse(await readFile(EVIDENCE, 'utf8'));
assert.equal(primary.source?.repository, PUBLIC_REPO, 'primary repo drift');
assert.equal(primary.source?.commit, STATIC_COMMIT, 'primary commit drift');
assert.equal(primary.classification, 'GEOMETRIC_SAFE_SPAWN_CANDIDATES_FOUND_NOT_ROAD_SEMANTICS', 'primary result not eligible for crosscheck');
assert.ok(Array.isArray(primary.candidates) && primary.candidates.length > 0, 'primary candidates missing');

const candidates = primary.candidates.slice(0, TOP_CANDIDATES).map((candidate) => ({
  rank: candidate.rank,
  local: candidate.local,
  primaryClearRadiusM: candidate.clearRadiusM,
  bins: new Map(),
  acceptedVertices: 0,
}));

const expectedBins = [];
const binRadius = Math.ceil(CHECK_RADIUS_M / BIN_SIZE_M);
for (let iz = -binRadius; iz <= binRadius; iz += 1) {
  for (let ix = -binRadius; ix <= binRadius; ix += 1) {
    const x = ix * BIN_SIZE_M;
    const z = iz * BIN_SIZE_M;
    if (Math.hypot(x, z) <= CHECK_RADIUS_M + 0.5 * BIN_SIZE_M) {
      expectedBins.push([ix, iz]);
    }
  }
}
assert.ok(expectedBins.length > 100, 'candidate-local occupancy disk unexpectedly small');

const minNormalY = Math.cos((MAX_VERTEX_SLOPE_DEGREES * Math.PI) / 180);
let verifiedTiles = 0;
let parsedVertices = 0;
let parsedIndices = 0;

for (const tile of primary.source.tileEvidence) {
  const tileId = tile.tileId;
  const url = `${RAW_ROOT}/tiles/tile_${String(tileId).padStart(3, '0')}.bin`;
  const bytes = await fetchBytes(url);
  assert.equal(bytes.byteLength, tile.bytes, `tile ${tileId} bytes drift`);
  assert.equal(digest(bytes), tile.sha256, `tile ${tileId} hash drift`);
  assert.equal(new TextDecoder().decode(bytes.subarray(0, 8)), MAGIC, `tile ${tileId} magic drift`);

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(view.getUint32(8, true), 2, `tile ${tileId} version drift`);
  assert.equal(view.getUint32(12, true), tileId, `tile ${tileId} id drift`);
  const groupCount = view.getUint32(16, true);
  assert.equal(groupCount, tile.groupCount, `tile ${tileId} group count drift`);

  let offset = HEADER_BYTES;
  const descriptors = [];
  for (let group = 0; group < groupCount; group += 1) {
    const vertexCount = view.getUint32(offset, true);
    const indexCount = view.getUint32(offset + 4, true);
    offset += GROUP_DESCRIPTOR_BYTES;
    descriptors.push({ vertexCount, indexCount });
  }

  let tileVertices = 0;
  let tileIndices = 0;
  for (const descriptor of descriptors) {
    for (let vertex = 0; vertex < descriptor.vertexCount; vertex += 1) {
      const x = view.getFloat32(offset, true);
      const y = view.getFloat32(offset + 4, true);
      const z = view.getFloat32(offset + 8, true);
      const nx = view.getFloat32(offset + 12, true);
      const ny = view.getFloat32(offset + 16, true);
      const nz = view.getFloat32(offset + 20, true);
      offset += VERTEX_BYTES;
      assert.ok([x, y, z, nx, ny, nz].every(Number.isFinite), `tile ${tileId} non-finite vertex`);
      tileVertices += 1;
      parsedVertices += 1;

      if (Math.abs(ny) < minNormalY) continue;
      for (const candidate of candidates) {
        const dx = x - candidate.local.x;
        const dz = z - candidate.local.z;
        if (Math.abs(dx) > CHECK_RADIUS_M + BIN_SIZE_M || Math.abs(dz) > CHECK_RADIUS_M + BIN_SIZE_M) continue;
        if (Math.hypot(dx, dz) > CHECK_RADIUS_M + 0.5 * BIN_SIZE_M) continue;
        if (Math.abs(y - candidate.local.y) > MAX_VERTEX_HEIGHT_OFFSET_M) continue;
        const ix = Math.round(dx / BIN_SIZE_M);
        const iz = Math.round(dz / BIN_SIZE_M);
        const key = binKey(ix, iz);
        const bin = candidate.bins.get(key) ?? { count: 0, minY: Infinity, maxY: -Infinity };
        bin.count += 1;
        bin.minY = Math.min(bin.minY, y);
        bin.maxY = Math.max(bin.maxY, y);
        candidate.bins.set(key, bin);
        candidate.acceptedVertices += 1;
      }
    }

    for (let index = 0; index < descriptor.indexCount; index += 1) {
      const value = view.getUint32(offset, true);
      offset += 4;
      assert.ok(value < descriptor.vertexCount, `tile ${tileId} index OOB`);
      tileIndices += 1;
      parsedIndices += 1;
    }
  }
  assert.equal(offset, bytes.byteLength, `tile ${tileId} byte parse mismatch`);
  assert.equal(tileVertices, tile.vertexCount, `tile ${tileId} vertex count drift`);
  assert.equal(tileIndices, tile.indexCount, `tile ${tileId} index count drift`);
  verifiedTiles += 1;
}

assert.equal(verifiedTiles, primary.source.tileEvidence.length, 'tile verification incomplete');
assert.equal(parsedVertices, primary.integrity.vertexCount, 'parsed vertex count drift');
assert.equal(parsedIndices, primary.integrity.indexCount, 'parsed index count drift');

const results = candidates.map((candidate) => {
  let occupied = 0;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [ix, iz] of expectedBins) {
    const bin = candidate.bins.get(binKey(ix, iz));
    if (!bin) continue;
    occupied += 1;
    minY = Math.min(minY, bin.minY);
    maxY = Math.max(maxY, bin.maxY);
  }
  const occupancyFraction = occupied / expectedBins.length;
  const heightRangeM = occupied === 0 ? null : maxY - minY;
  const pass =
    occupancyFraction >= MIN_OCCUPANCY_FRACTION &&
    heightRangeM !== null &&
    heightRangeM <= MAX_OCCUPIED_HEIGHT_RANGE_M;
  return {
    rank: candidate.rank,
    local: candidate.local,
    primaryClearRadiusM: candidate.primaryClearRadiusM,
    acceptedVertices: candidate.acceptedVertices,
    expectedBins: expectedBins.length,
    occupiedBins: occupied,
    occupancyFraction,
    occupiedHeightRangeM: heightRangeM,
    pass,
  };
});

const passed = results.filter((result) => result.pass);
const classification =
  passed.length >= 3
    ? 'GEOMETRIC_CANDIDATE_REGIONS_CROSSCHECK_STABLE_NOT_SEMANTIC'
    : 'PRIMARY_GEOMETRIC_CANDIDATES_NOT_ROBUST_ENOUGH';

const output = {
  schema: 'JV_WEB_JSPREV2_SPAWN_LANDMARK_CROSSCHECK_V1',
  generatedAt: new Date().toISOString(),
  source: {
    primaryEvidence: EVIDENCE,
    repository: PUBLIC_REPO,
    commit: STATIC_COMMIT,
  },
  method: {
    independentSignal: 'encoded vertex normals + candidate-local occupancy; no primary global raster phase',
    checkRadiusM: CHECK_RADIUS_M,
    binSizeM: BIN_SIZE_M,
    maxVertexSlopeDegrees: MAX_VERTEX_SLOPE_DEGREES,
    maxVertexHeightOffsetM: MAX_VERTEX_HEIGHT_OFFSET_M,
    minOccupancyFraction: MIN_OCCUPANCY_FRACTION,
    maxOccupiedHeightRangeM: MAX_OCCUPIED_HEIGHT_RANGE_M,
    topCandidatesChecked: TOP_CANDIDATES,
    limitations: [
      'This validates geometric extent/stability only, not road semantics.',
      'Encoded vertex normals are a different signal from primary triangle-normal rasterization but still derive from the same accepted scan geometry.',
      'A robust flat region may still be a roof, courtyard, parking area or other non-road surface.',
    ],
  },
  integrity: {
    verifiedTiles,
    parsedVertices,
    parsedIndices,
  },
  classification,
  passedRanks: passed.map((result) => result.rank),
  results,
  decisionRule:
    classification === 'PRIMARY_GEOMETRIC_CANDIDATES_NOT_ROBUST_ENOUGH'
      ? 'Reject automatic spawn selection from the primary analysis.'
      : 'Retain only crosscheck-passing regions as preview candidates; do not call them roads or promote them without exact-preview visual/physical validation.',
};

await mkdir('docs/evidence', { recursive: true });
await writeFile(OUTPUT, JSON.stringify(output, null, 2) + '\n');
console.log('JSPREV2_SPAWN_CANDIDATE_CROSSCHECK', JSON.stringify({ classification, passedRanks: output.passedRanks, preview: results.slice(0, 5) }));
