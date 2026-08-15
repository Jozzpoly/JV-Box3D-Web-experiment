import type {
  JvBoundedIndexedMesh,
  JvBounds,
  JvScanRenderGroup,
  JvScanWorld,
  JvVec3,
} from "./jv-world-contract.js";
import {
  clearJvJsprev2LoadingStats,
  publishJvJsprev2LoadingStats,
} from "./jsprev2-loading-stats.js";

type JsonRecord = Record<string, unknown>;

interface ScanIndexGroup {
  readonly textureUrl: string;
  readonly textureBytes: number;
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly triangleCount: number;
}

interface ScanIndexTile {
  readonly tileId: number;
  readonly binaryUrl: string;
  readonly binaryBytes: number;
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly triangleCount: number;
  readonly groups: readonly ScanIndexGroup[];
}

interface ScanIndex {
  readonly schema: "JV_WEB_JSPREV2_INDEX_V2";
  readonly available: true;
  readonly packId: string;
  readonly tileCount: number;
  readonly groupCount: number;
  readonly textureCount: number;
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly triangleCount: number;
  readonly manifestBytes: number;
  readonly binaryBytes: number;
  readonly textureBytes: number;
  readonly totalBytes: number;
  readonly estimatedCpuGeometryBytes: number;
  readonly estimatedGpuGeometryBytes: number;
  readonly tiles: readonly ScanIndexTile[];
}

const SCAN_SOUTH_EDGE_Z = 320;
const SCAN_GROUND_Y = 0;
const MAGIC = "JSPREV2\0";
const HEADER_BYTES = 20;
const GROUP_DESCRIPTOR_BYTES = 8;
const VERTEX_BYTES = 32;
const REQUIRED_GROUPS = 25;
const REQUIRED_TEXTURES = 25;
const TILE_LOAD_CONCURRENCY = 2;
const MAX_TILES = 64;
const MAX_VERTICES = 10_000_000;
const MAX_INDICES = 24_000_000;
const MAX_TRIANGLES = 8_000_000;
const MAX_BINARY_BYTES = 1_073_741_824;
const MAX_TEXTURE_BYTES = 1_073_741_824;
const MAX_TOTAL_BYTES = 2_147_483_648;
const MAX_CPU_GEOMETRY_BYTES = 805_306_368;
const MAX_GPU_GEOMETRY_BYTES = 536_870_912;

function readMagic(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes.slice(0, 8));
}

function record(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

function integer(
  value: unknown,
  label: string,
  minimum = 0,
): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) {
    throw new Error(`${label} must be an integer >= ${minimum}.`);
  }
  return value as number;
}

function scanRootUrl(): URL {
  return new URL("__jv_scan__/", document.baseURI);
}

function assetUrl(value: unknown, label: string, root: URL): string {
  const relative = nonEmptyString(value, label);
  const segments = relative.split("/");
  if (
    relative.startsWith("/") ||
    relative.includes("\\") ||
    relative.includes("?") ||
    relative.includes("#") ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(relative) ||
    !/^[a-zA-Z0-9._/-]+$/.test(relative) ||
    segments.some(
      (segment) => segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    throw new Error(`${label} is outside the scan asset boundary.`);
  }
  const resolved = new URL(relative, root);
  if (
    resolved.origin !== root.origin ||
    !resolved.pathname.startsWith(root.pathname)
  ) {
    throw new Error(`${label} is outside the scan asset boundary.`);
  }
  return resolved.href;
}

function canonicalFinite(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be finite.`);
  }
  return value === 0 ? 0 : value;
}


function parseIndex(value: unknown, scanRoot: URL): ScanIndex {
  const source = record(value, "Local scan index");
  if (source["available"] !== true) {
    throw new Error("Local scan index is not marked available.");
  }
  if (source["schema"] !== "JV_WEB_JSPREV2_INDEX_V2") {
    throw new Error("Local scan index schema is not V2.");
  }
  const rawTiles = source["tiles"];
  if (!Array.isArray(rawTiles) || rawTiles.length === 0) {
    throw new Error("Local scan index has no tiles.");
  }
  const tileIds = new Set<number>();
  const binaryUrls = new Set<string>();
  const textureUrls = new Set<string>();
  const tiles: ScanIndexTile[] = rawTiles.map(
    (rawTile: unknown, tileIndex: number) => {
      const tile = record(rawTile, `Local scan tile ${tileIndex}`);
      const rawGroups = tile["groups"];
      if (!Array.isArray(rawGroups) || rawGroups.length === 0) {
        throw new Error(`Local scan tile ${tileIndex} has no groups.`);
      }
      const groups: ScanIndexGroup[] = rawGroups.map(
        (rawGroup: unknown, groupIndex: number) => {
          const group = record(
            rawGroup,
            `Local scan tile ${tileIndex} group ${groupIndex}`,
          );
          const indexCount = integer(
            group["indexCount"],
            `tile ${tileIndex} group ${groupIndex} indexCount`,
            3,
          );
          const triangleCount = integer(
            group["triangleCount"],
            `tile ${tileIndex} group ${groupIndex} triangleCount`,
            1,
          );
          if (indexCount % 3 !== 0 || triangleCount !== indexCount / 3) {
            throw new Error(
              `Local scan tile ${tileIndex} group ${groupIndex} triangle counts disagree.`,
            );
          }
          return {
            textureUrl: assetUrl(
              group["textureUrl"],
              `tile ${tileIndex} group ${groupIndex} textureUrl`,
              scanRoot,
            ),
            textureBytes: integer(
              group["textureBytes"],
              `tile ${tileIndex} group ${groupIndex} textureBytes`,
              1,
            ),
            vertexCount: integer(
              group["vertexCount"],
              `tile ${tileIndex} group ${groupIndex} vertexCount`,
              1,
            ),
            indexCount,
            triangleCount,
          };
        },
      );
      const tileId = integer(tile["tileId"], `tile ${tileIndex} tileId`);
      const binaryUrl = assetUrl(
        tile["binaryUrl"],
        `tile ${tileIndex} binaryUrl`,
        scanRoot,
      );
      if (tileIds.has(tileId) || binaryUrls.has(binaryUrl)) {
        throw new Error(
          `Local scan tile ${tileIndex} reuses an identity or asset URL.`,
        );
      }
      tileIds.add(tileId);
      binaryUrls.add(binaryUrl);
      for (const group of groups) {
        if (textureUrls.has(group.textureUrl)) {
          throw new Error(`Local scan tile ${tileIndex} reuses a texture URL.`);
        }
        textureUrls.add(group.textureUrl);
      }
      const vertexCount = integer(
        tile["vertexCount"],
        `tile ${tileIndex} vertexCount`,
        1,
      );
      const indexCount = integer(
        tile["indexCount"],
        `tile ${tileIndex} indexCount`,
        3,
      );
      const triangleCount = integer(
        tile["triangleCount"],
        `tile ${tileIndex} triangleCount`,
        1,
      );
      const derivedVertices = groups.reduce(
        (sum, group) => sum + group.vertexCount,
        0,
      );
      const derivedIndices = groups.reduce(
        (sum, group) => sum + group.indexCount,
        0,
      );
      if (
        vertexCount !== derivedVertices ||
        indexCount !== derivedIndices ||
        triangleCount !== derivedIndices / 3
      ) {
        throw new Error(
          `Local scan tile ${tileIndex} aggregate metrics disagree.`,
        );
      }
      return {
        tileId,
        binaryUrl,
        binaryBytes: integer(
          tile["binaryBytes"],
          `tile ${tileIndex} binaryBytes`,
          HEADER_BYTES + groups.length * GROUP_DESCRIPTOR_BYTES,
        ),
        vertexCount,
        indexCount,
        triangleCount,
        groups,
      };
    },
  );

  const result: ScanIndex = {
    schema: "JV_WEB_JSPREV2_INDEX_V2",
    available: true,
    packId: nonEmptyString(source["packId"], "Local scan packId"),
    tileCount: integer(source["tileCount"], "Local scan tileCount", 1),
    groupCount: integer(source["groupCount"], "Local scan groupCount", 1),
    textureCount: integer(
      source["textureCount"],
      "Local scan textureCount",
      1,
    ),
    vertexCount: integer(source["vertexCount"], "Local scan vertexCount", 1),
    indexCount: integer(source["indexCount"], "Local scan indexCount", 3),
    triangleCount: integer(
      source["triangleCount"],
      "Local scan triangleCount",
      1,
    ),
    manifestBytes: integer(
      source["manifestBytes"],
      "Local scan manifestBytes",
      1,
    ),
    binaryBytes: integer(
      source["binaryBytes"],
      "Local scan binaryBytes",
      1,
    ),
    textureBytes: integer(
      source["textureBytes"],
      "Local scan textureBytes",
      1,
    ),
    totalBytes: integer(source["totalBytes"], "Local scan totalBytes", 1),
    estimatedCpuGeometryBytes: integer(
      source["estimatedCpuGeometryBytes"],
      "Local scan estimatedCpuGeometryBytes",
      1,
    ),
    estimatedGpuGeometryBytes: integer(
      source["estimatedGpuGeometryBytes"],
      "Local scan estimatedGpuGeometryBytes",
      1,
    ),
    tiles,
  };

  const tileCount = tiles.length;
  const groupCount = tiles.reduce((sum, tile) => sum + tile.groups.length, 0);
  const textureCount = groupCount;
  const vertexCount = tiles.reduce((sum, tile) => sum + tile.vertexCount, 0);
  const indexCount = tiles.reduce((sum, tile) => sum + tile.indexCount, 0);
  const triangleCount = tiles.reduce(
    (sum, tile) => sum + tile.triangleCount,
    0,
  );
  const binaryBytes = tiles.reduce((sum, tile) => sum + tile.binaryBytes, 0);
  const textureBytes = tiles.reduce(
    (sum, tile) =>
      sum +
      tile.groups.reduce(
        (groupSum, group) => groupSum + group.textureBytes,
        0,
      ),
    0,
  );
  const expectedCpuBytes = vertexCount * 44 + indexCount * 8;
  const expectedGpuBytes = vertexCount * 32 + indexCount * 2;
  const expectedTotalBytes = result.manifestBytes + binaryBytes + textureBytes;
  const comparisons: readonly [string, number, number][] = [
    ["tileCount", result.tileCount, tileCount],
    ["groupCount", result.groupCount, groupCount],
    ["textureCount", result.textureCount, textureCount],
    ["vertexCount", result.vertexCount, vertexCount],
    ["indexCount", result.indexCount, indexCount],
    ["triangleCount", result.triangleCount, triangleCount],
    ["binaryBytes", result.binaryBytes, binaryBytes],
    ["textureBytes", result.textureBytes, textureBytes],
    ["totalBytes", result.totalBytes, expectedTotalBytes],
    [
      "estimatedCpuGeometryBytes",
      result.estimatedCpuGeometryBytes,
      expectedCpuBytes,
    ],
    [
      "estimatedGpuGeometryBytes",
      result.estimatedGpuGeometryBytes,
      expectedGpuBytes,
    ],
  ];
  for (const [label, actual, expected] of comparisons) {
    if (actual !== expected) {
      throw new Error(`Local scan ${label} ${actual} != derived ${expected}.`);
    }
  }
  if (
    result.tileCount > MAX_TILES ||
    result.groupCount !== REQUIRED_GROUPS ||
    result.textureCount !== REQUIRED_TEXTURES ||
    result.vertexCount > MAX_VERTICES ||
    result.indexCount > MAX_INDICES ||
    result.triangleCount > MAX_TRIANGLES ||
    result.binaryBytes > MAX_BINARY_BYTES ||
    result.textureBytes > MAX_TEXTURE_BYTES ||
    result.totalBytes > MAX_TOTAL_BYTES ||
    result.estimatedCpuGeometryBytes > MAX_CPU_GEOMETRY_BYTES ||
    result.estimatedGpuGeometryBytes > MAX_GPU_GEOMETRY_BYTES
  ) {
    throw new Error("Local scan index exceeds the product JSPREV2 budget.");
  }
  if (
    result.indexCount % 3 !== 0 ||
    result.triangleCount !== result.indexCount / 3
  ) {
    throw new Error("Local scan aggregate triangle counts disagree.");
  }
  return result;
}

function bounded(
  minimumX: number,
  minimumY: number,
  minimumZ: number,
  maximumX: number,
  maximumY: number,
  maximumZ: number,
  label: string,
): JvBounds {
  return {
    minimum: {
      x: canonicalFinite(minimumX, `${label} minimum x`),
      y: canonicalFinite(minimumY, `${label} minimum y`),
      z: canonicalFinite(minimumZ, `${label} minimum z`),
    },
    maximum: {
      x: canonicalFinite(maximumX, `${label} maximum x`),
      y: canonicalFinite(maximumY, `${label} maximum y`),
      z: canonicalFinite(maximumZ, `${label} maximum z`),
    },
  };
}

function parseTile(
  buffer: ArrayBuffer,
  tile: ScanIndexTile,
): readonly JvScanRenderGroup[] {
  if (buffer.byteLength !== tile.binaryBytes) {
    throw new Error(
      `Scan tile ${tile.tileId} bytes ${buffer.byteLength} != index ${tile.binaryBytes}.`,
    );
  }
  const bytes = new Uint8Array(buffer);
  if (bytes.byteLength < HEADER_BYTES || readMagic(bytes) !== MAGIC) {
    throw new Error("Scan tile is not JSPREV2.");
  }
  const view = new DataView(buffer);
  const version = view.getUint32(8, true);
  const tileId = view.getUint32(12, true);
  const groupCount = view.getUint32(16, true);
  if (
    version !== 2 ||
    tileId !== tile.tileId ||
    groupCount !== tile.groups.length
  ) {
    throw new Error("Scan tile header does not match its local index.");
  }

  let offset = HEADER_BYTES;
  const descriptors: Array<
    Readonly<{ vertexCount: number; indexCount: number }>
  > = [];
  let expectedBytes = HEADER_BYTES + groupCount * GROUP_DESCRIPTOR_BYTES;
  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    const vertexCount = view.getUint32(offset, true);
    const indexCount = view.getUint32(offset + 4, true);
    offset += GROUP_DESCRIPTOR_BYTES;
    const indexed = tile.groups[groupIndex]!;
    if (
      vertexCount !== indexed.vertexCount ||
      indexCount !== indexed.indexCount ||
      indexCount % 3 !== 0 ||
      indexed.triangleCount !== indexCount / 3
    ) {
      throw new Error(`Scan tile group ${groupIndex} descriptor drifted.`);
    }
    descriptors.push({ vertexCount, indexCount });
    expectedBytes += vertexCount * VERTEX_BYTES + indexCount * 4;
  }
  if (expectedBytes !== buffer.byteLength) {
    throw new Error(
      "Scan tile payload size does not match its descriptor table.",
    );
  }

  const result: JvScanRenderGroup[] = [];
  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    const descriptor = descriptors[groupIndex]!;
    const indexed = tile.groups[groupIndex]!;
    const positions = new Float32Array(descriptor.vertexCount * 3);
    const normals = new Float32Array(descriptor.vertexCount * 3);
    const uvs = new Float32Array(descriptor.vertexCount * 2);
    let minimumX = Infinity;
    let minimumY = Infinity;
    let minimumZ = Infinity;
    let maximumX = -Infinity;
    let maximumY = -Infinity;
    let maximumZ = -Infinity;

    for (let vertex = 0; vertex < descriptor.vertexCount; vertex += 1) {
      const positionOffset = vertex * 3;
      const uvOffset = vertex * 2;
      const x = view.getFloat32(offset, true);
      const y = view.getFloat32(offset + 4, true);
      const z = view.getFloat32(offset + 8, true);
      const normalX = view.getFloat32(offset + 12, true);
      const normalY = view.getFloat32(offset + 16, true);
      const normalZ = view.getFloat32(offset + 20, true);
      const u = view.getFloat32(offset + 24, true);
      const v = view.getFloat32(offset + 28, true);
      offset += VERTEX_BYTES;

      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
        throw new Error("Scan positions contain a non-finite value.");
      }
      if (
        !Number.isFinite(normalX) ||
        !Number.isFinite(normalY) ||
        !Number.isFinite(normalZ)
      ) {
        throw new Error("Scan normals contain a non-finite value.");
      }
      if (!Number.isFinite(u) || !Number.isFinite(v)) {
        throw new Error("Scan UVs contain a non-finite value.");
      }

      positions[positionOffset] = x;
      positions[positionOffset + 1] = y;
      positions[positionOffset + 2] = z;
      normals[positionOffset] = normalX;
      normals[positionOffset + 1] = normalY;
      normals[positionOffset + 2] = normalZ;
      uvs[uvOffset] = u;
      uvs[uvOffset + 1] = v;

      if (x < minimumX) minimumX = x;
      if (y < minimumY) minimumY = y;
      if (z < minimumZ) minimumZ = z;
      if (x > maximumX) maximumX = x;
      if (y > maximumY) maximumY = y;
      if (z > maximumZ) maximumZ = z;
    }

    const indices = new Uint32Array(descriptor.indexCount);
    for (let index = 0; index < descriptor.indexCount; index += 1) {
      const value = view.getUint32(offset, true);
      offset += 4;
      if (value >= descriptor.vertexCount) {
        throw new Error("Scan group index is outside its vertex stream.");
      }
      indices[index] = value;
    }

    result.push({
      positions,
      normals,
      uvs,
      indices,
      bounds: bounded(
        minimumX,
        minimumY,
        minimumZ,
        maximumX,
        maximumY,
        maximumZ,
        `Scan tile ${tile.tileId} group ${groupIndex}`,
      ),
      textureUrl: indexed.textureUrl,
      color: [0.68, 0.68, 0.64, 1],
      doubleSided: true,
    });
  }
  return result;
}

function mergeGroupBounds(groups: readonly JvScanRenderGroup[]): JvBounds {
  if (groups.length === 0) {
    throw new Error("Scan collision requires at least one render group.");
  }

  let minimumX = Infinity;
  let minimumY = Infinity;
  let minimumZ = Infinity;
  let maximumX = -Infinity;
  let maximumY = -Infinity;
  let maximumZ = -Infinity;
  for (const group of groups) {
    minimumX = Math.min(minimumX, group.bounds.minimum.x);
    minimumY = Math.min(minimumY, group.bounds.minimum.y);
    minimumZ = Math.min(minimumZ, group.bounds.minimum.z);
    maximumX = Math.max(maximumX, group.bounds.maximum.x);
    maximumY = Math.max(maximumY, group.bounds.maximum.y);
    maximumZ = Math.max(maximumZ, group.bounds.maximum.z);
  }

  return bounded(
    minimumX,
    minimumY,
    minimumZ,
    maximumX,
    maximumY,
    maximumZ,
    "Scan collision",
  );
}

function mergeCollision(
  groups: readonly JvScanRenderGroup[],
): JvBoundedIndexedMesh {
  let vertexCount = 0;
  let indexCount = 0;
  for (const group of groups) {
    vertexCount += group.positions.length / 3;
    indexCount += group.indices.length;
  }
  const positions = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(indexCount);
  let positionOffset = 0;
  let indexOffset = 0;
  let vertexOffset = 0;
  for (const group of groups) {
    positions.set(group.positions, positionOffset);
    for (const index of group.indices) {
      indices[indexOffset] = index + vertexOffset;
      indexOffset += 1;
    }
    positionOffset += group.positions.length;
    vertexOffset += group.positions.length / 3;
  }
  return {
    positions,
    indices,
    bounds: mergeGroupBounds(groups),
    color: [0.6, 0.6, 0.6, 1],
    doubleSided: true,
  };
}

function translateBounds(bounds: JvBounds, origin: JvVec3): JvBounds {
  return {
    minimum: {
      x: canonicalFinite(bounds.minimum.x + origin.x, "World scan minimum x"),
      y: canonicalFinite(bounds.minimum.y + origin.y, "World scan minimum y"),
      z: canonicalFinite(bounds.minimum.z + origin.z, "World scan minimum z"),
    },
    maximum: {
      x: canonicalFinite(bounds.maximum.x + origin.x, "World scan maximum x"),
      y: canonicalFinite(bounds.maximum.y + origin.y, "World scan maximum y"),
      z: canonicalFinite(bounds.maximum.z + origin.z, "World scan maximum z"),
    },
  };
}

async function loadTileGroups(
  index: ScanIndex,
  signal?: AbortSignal,
): Promise<readonly JvScanRenderGroup[]> {
  const pipelineStartedAt = performance.now();
  let parseCpuMs = 0;
  const tileGroups: Array<readonly JvScanRenderGroup[] | undefined> =
    new Array(index.tiles.length);
  const fetchInit = signal === undefined ? undefined : { signal };
  let nextTileIndex = 0;

  const worker = async (): Promise<void> => {
    while (true) {
      const tileIndex = nextTileIndex;
      nextTileIndex += 1;
      if (tileIndex >= index.tiles.length) {
        return;
      }
      const tile = index.tiles[tileIndex]!;
      const tileResponse = await fetch(tile.binaryUrl, fetchInit);
      if (!tileResponse.ok) {
        throw new Error(`Scan tile failed with HTTP ${tileResponse.status}.`);
      }
      const tileBytes = await tileResponse.arrayBuffer();
      const parseStartedAt = performance.now();
      tileGroups[tileIndex] = parseTile(tileBytes, tile);
      parseCpuMs += Math.max(0, performance.now() - parseStartedAt);
    }
  };

  const workerCount = Math.min(TILE_LOAD_CONCURRENCY, index.tiles.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => worker()),
  );
  publishJvJsprev2LoadingStats({
    tilePipelineMs: Math.max(0, performance.now() - pipelineStartedAt),
    tileParseCpuMs: parseCpuMs,
  });

  const groups: JvScanRenderGroup[] = [];
  for (let tileIndex = 0; tileIndex < tileGroups.length; tileIndex += 1) {
    const parsed = tileGroups[tileIndex];
    if (parsed === undefined) {
      throw new Error(`Scan tile ${tileIndex} did not finish loading.`);
    }
    groups.push(...parsed);
  }
  return groups;
}

export async function loadLocalJsprev2Scan(
  signal?: AbortSignal,
): Promise<JvScanWorld | null> {
  clearJvJsprev2LoadingStats();
  const scanRoot = scanRootUrl();
  const fetchInit = signal === undefined ? undefined : { signal };
  const indexStartedAt = performance.now();
  const response = await fetch(new URL("index.json", scanRoot), fetchInit);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Local scan index failed with HTTP ${response.status}.`);
  }
  const index = parseIndex(await response.json(), scanRoot);
  publishJvJsprev2LoadingStats({
    indexLoadMs: Math.max(0, performance.now() - indexStartedAt),
  });
  const groups = await loadTileGroups(index, signal);

  const actualVertices = groups.reduce(
    (sum, group) => sum + group.positions.length / 3,
    0,
  );
  const actualIndices = groups.reduce(
    (sum, group) => sum + group.indices.length,
    0,
  );
  if (
    groups.length !== index.groupCount ||
    actualVertices !== index.vertexCount ||
    actualIndices !== index.indexCount
  ) {
    throw new Error(
      "Parsed JSPREV2 geometry does not match its validated index.",
    );
  }

  const collisionStartedAt = performance.now();
  const collision = mergeCollision(groups);
  publishJvJsprev2LoadingStats({
    collisionMergeMs: Math.max(0, performance.now() - collisionStartedAt),
  });
  const localBounds = collision.bounds;
  const origin = {
    x: canonicalFinite(
      -(localBounds.minimum.x + localBounds.maximum.x) * 0.5,
      "Scan origin x",
    ),
    y: canonicalFinite(
      SCAN_GROUND_Y - localBounds.minimum.y,
      "Scan origin y",
    ),
    z: canonicalFinite(
      SCAN_SOUTH_EDGE_Z - localBounds.minimum.z,
      "Scan origin z",
    ),
  };
  return {
    source: "JSPREV2",
    packId: index.packId,
    origin,
    worldBounds: translateBounds(localBounds, origin),
    collision,
    groups,
    tileCount: index.tileCount,
    groupCount: index.groupCount,
    textureCount: index.textureCount,
    vertexCount: index.vertexCount,
    indexCount: index.indexCount,
    triangleCount: index.triangleCount,
    manifestBytes: index.manifestBytes,
    binaryBytes: index.binaryBytes,
    textureBytes: index.textureBytes,
    totalBytes: index.totalBytes,
    estimatedCpuGeometryBytes: index.estimatedCpuGeometryBytes,
    estimatedGpuGeometryBytes: index.estimatedGpuGeometryBytes,
  };
}
