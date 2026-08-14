import type {
  JvBounds,
  JvIndexedMesh,
  JvScanWorld,
  JvVec3,
} from "./jv-world-contract.js";

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

function assertFiniteStream(stream: Float32Array, label: string): void {
  for (const value of stream) {
    if (!Number.isFinite(value)) {
      throw new Error(`${label} contains a non-finite value.`);
    }
  }
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

function parseTile(
  buffer: ArrayBuffer,
  tile: ScanIndexTile,
): readonly JvIndexedMesh[] {
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

  const result: JvIndexedMesh[] = [];
  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    const descriptor = descriptors[groupIndex]!;
    const indexed = tile.groups[groupIndex]!;
    const positions = new Float32Array(descriptor.vertexCount * 3);
    const normals = new Float32Array(descriptor.vertexCount * 3);
    const uvs = new Float32Array(descriptor.vertexCount * 2);
    for (let vertex = 0; vertex < descriptor.vertexCount; vertex += 1) {
      const positionOffset = vertex * 3;
      const uvOffset = vertex * 2;
      positions[positionOffset] = view.getFloat32(offset, true);
      positions[positionOffset + 1] = view.getFloat32(offset + 4, true);
      positions[positionOffset + 2] = view.getFloat32(offset + 8, true);
      normals[positionOffset] = view.getFloat32(offset + 12, true);
      normals[positionOffset + 1] = view.getFloat32(offset + 16, true);
      normals[positionOffset + 2] = view.getFloat32(offset + 20, true);
      uvs[uvOffset] = view.getFloat32(offset + 24, true);
      uvs[uvOffset + 1] = view.getFloat32(offset + 28, true);
      offset += VERTEX_BYTES;
    }
    assertFiniteStream(positions, "Scan positions");
    assertFiniteStream(normals, "Scan normals");
    assertFiniteStream(uvs, "Scan UVs");

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
      textureUrl: indexed.textureUrl,
      color: [0.68, 0.68, 0.64, 1],
      doubleSided: true,
    });
  }
  return result;
}

function mergeCollision(groups: readonly JvIndexedMesh[]): JvIndexedMesh {
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
    color: [0.6, 0.6, 0.6, 1],
    doubleSided: true,
  };
}

function calculateBounds(positions: Float32Array): JvBounds {
  const minimum = { x: Infinity, y: Infinity, z: Infinity };
  const maximum = { x: -Infinity, y: -Infinity, z: -Infinity };
  for (let offset = 0; offset < positions.length; offset += 3) {
    minimum.x = Math.min(minimum.x, positions[offset]!);
    minimum.y = Math.min(minimum.y, positions[offset + 1]!);
    minimum.z = Math.min(minimum.z, positions[offset + 2]!);
    maximum.x = Math.max(maximum.x, positions[offset]!);
    maximum.y = Math.max(maximum.y, positions[offset + 1]!);
    maximum.z = Math.max(maximum.z, positions[offset + 2]!);
  }
  return {
    minimum: {
      x: canonicalFinite(minimum.x, "Scan minimum x"),
      y: canonicalFinite(minimum.y, "Scan minimum y"),
      z: canonicalFinite(minimum.z, "Scan minimum z"),
    },
    maximum: {
      x: canonicalFinite(maximum.x, "Scan maximum x"),
      y: canonicalFinite(maximum.y, "Scan maximum y"),
      z: canonicalFinite(maximum.z, "Scan maximum z"),
    },
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

export async function loadLocalJsprev2Scan(
  signal?: AbortSignal,
): Promise<JvScanWorld | null> {
  const scanRoot = scanRootUrl();
  const response = await fetch(new URL("index.json", scanRoot), {
    cache: "no-store",
    ...(signal === undefined ? {} : { signal }),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Local scan index failed with HTTP ${response.status}.`);
  }
  const index = parseIndex(await response.json(), scanRoot);
  const groups: JvIndexedMesh[] = [];
  for (const tile of index.tiles) {
    const tileResponse = await fetch(tile.binaryUrl, {
      cache: "no-store",
      ...(signal === undefined ? {} : { signal }),
    });
    if (!tileResponse.ok) {
      throw new Error(`Scan tile failed with HTTP ${tileResponse.status}.`);
    }
    groups.push(...parseTile(await tileResponse.arrayBuffer(), tile));
  }

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

  const collision = mergeCollision(groups);
  const localBounds = calculateBounds(collision.positions);
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
