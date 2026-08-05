import type {
  JvBounds,
  JvIndexedMesh,
  JvScanWorld,
  JvVec3,
} from "./jv-world-contract.js";

interface ScanIndexGroup {
  readonly textureUrl: string | null;
}

interface ScanIndexTile {
  readonly binaryUrl: string;
  readonly groups: readonly ScanIndexGroup[];
}

interface ScanIndex {
  readonly available: boolean;
  readonly packId?: string;
  readonly tiles?: readonly ScanIndexTile[];
}

const SCAN_SOUTH_EDGE_Z = 320;
const SCAN_GROUND_Y = 0;
const MAGIC = "JSPREV2\0";
const HEADER_BYTES = 20;
const GROUP_DESCRIPTOR_BYTES = 8;
const VERTEX_BYTES = 32;

function readMagic(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes.slice(0, 8));
}

function assertFiniteStream(
  stream: Float32Array,
  label: string,
): void {
  for (const value of stream) {
    if (!Number.isFinite(value)) {
      throw new Error(`${label} contains a non-finite value.`);
    }
  }
}

function parseTile(
  buffer: ArrayBuffer,
  textureUrls: readonly (string | null)[],
): readonly JvIndexedMesh[] {
  const bytes = new Uint8Array(buffer);
  if (
    bytes.byteLength < HEADER_BYTES ||
    readMagic(bytes) !== MAGIC
  ) {
    throw new Error("Scan tile is not JSPREV2.");
  }
  const view = new DataView(buffer);
  const version = view.getUint32(8, true);
  const groupCount = view.getUint32(16, true);
  if (
    version !== 2 ||
    groupCount < 1 ||
    groupCount > 4096 ||
    textureUrls.length !== groupCount
  ) {
    throw new Error("Scan tile header/group manifest mismatch.");
  }

  let offset = HEADER_BYTES;
  const descriptors: Array<
    Readonly<{ vertexCount: number; indexCount: number }>
  > = [];
  let expectedBytes =
    HEADER_BYTES + groupCount * GROUP_DESCRIPTOR_BYTES;
  for (let group = 0; group < groupCount; group += 1) {
    const vertexCount = view.getUint32(offset, true);
    const indexCount = view.getUint32(offset + 4, true);
    offset += GROUP_DESCRIPTOR_BYTES;
    if (
      vertexCount < 1 ||
      indexCount < 3 ||
      indexCount % 3 !== 0
    ) {
      throw new Error("Scan group contains invalid counts.");
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
  for (let group = 0; group < groupCount; group += 1) {
    const descriptor = descriptors[group]!;
    const positions = new Float32Array(descriptor.vertexCount * 3);
    const normals = new Float32Array(descriptor.vertexCount * 3);
    const uvs = new Float32Array(descriptor.vertexCount * 2);
    for (
      let vertex = 0;
      vertex < descriptor.vertexCount;
      vertex += 1
    ) {
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
    for (
      let index = 0;
      index < descriptor.indexCount;
      index += 1
    ) {
      const value = view.getUint32(offset, true);
      offset += 4;
      if (value >= descriptor.vertexCount) {
        throw new Error(
          "Scan group index is outside its vertex stream.",
        );
      }
      indices[index] = value;
    }
    result.push({
      positions,
      normals,
      uvs,
      indices,
      ...(textureUrls[group] === null
        ? {}
        : { textureUrl: textureUrls[group]! }),
      color: [0.68, 0.68, 0.64, 1],
      doubleSided: true,
    });
  }
  return result;
}

function mergeCollision(
  groups: readonly JvIndexedMesh[],
): JvIndexedMesh {
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
  if (
    !Number.isFinite(minimum.x) ||
    !Number.isFinite(maximum.x)
  ) {
    throw new Error("Scan pack has no finite positions.");
  }
  return { minimum, maximum };
}

function translateBounds(bounds: JvBounds, origin: JvVec3): JvBounds {
  return {
    minimum: {
      x: bounds.minimum.x + origin.x,
      y: bounds.minimum.y + origin.y,
      z: bounds.minimum.z + origin.z,
    },
    maximum: {
      x: bounds.maximum.x + origin.x,
      y: bounds.maximum.y + origin.y,
      z: bounds.maximum.z + origin.z,
    },
  };
}

export async function loadLocalJsprev2Scan(
  signal?: AbortSignal,
): Promise<JvScanWorld | null> {
  const response = await fetch("/__jv_scan__/index.json", {
    cache: "no-store",
    ...(signal === undefined ? {} : { signal }),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `Local scan index failed with HTTP ${response.status}.`,
    );
  }

  const index = (await response.json()) as ScanIndex;
  if (!index.available) {
    return null;
  }
  if (
    typeof index.packId !== "string" ||
    !Array.isArray(index.tiles) ||
    index.tiles.length < 1
  ) {
    throw new Error("Local scan index is incomplete.");
  }

  const groups: JvIndexedMesh[] = [];
  for (const tile of index.tiles) {
    if (
      typeof tile.binaryUrl !== "string" ||
      !Array.isArray(tile.groups)
    ) {
      throw new Error("Local scan tile index is invalid.");
    }
    const tileResponse = await fetch(tile.binaryUrl, {
      cache: "no-store",
      ...(signal === undefined ? {} : { signal }),
    });
    if (!tileResponse.ok) {
      throw new Error(
        `Scan tile failed with HTTP ${tileResponse.status}.`,
      );
    }
    groups.push(
      ...parseTile(
        await tileResponse.arrayBuffer(),
        tile.groups.map(
          (group: ScanIndexGroup) => group.textureUrl,
        ),
      ),
    );
  }

  const collision = mergeCollision(groups);
  const localBounds = calculateBounds(collision.positions);
  const origin = {
    x: -(localBounds.minimum.x + localBounds.maximum.x) * 0.5,
    y: SCAN_GROUND_Y - localBounds.minimum.y,
    z: SCAN_SOUTH_EDGE_Z - localBounds.minimum.z,
  };
  return {
    source: "JSPREV2",
    packId: index.packId,
    origin,
    worldBounds: translateBounds(localBounds, origin),
    collision,
    groups,
    textureCount: groups.filter(
      (group) => group.textureUrl !== undefined,
    ).length,
    triangleCount: collision.indices.length / 3,
  };
}