import {
  closeSync,
  lstatSync,
  openSync,
  readFileSync,
  readSync,
  realpathSync,
  statSync,
} from "node:fs";
import path from "node:path";

const MAGIC = Buffer.from("JSPREV2\0", "ascii");
const HEADER_BYTES = 20;
const GROUP_DESCRIPTOR_BYTES = 8;
const VERTEX_BYTES = 32;
const INDEX_BYTES = 4;

export const JSPREV2_REQUIREMENTS = Object.freeze({
  schema: "JV_WEB_JSPREV2_PACK_V1",
  binaryVersion: 2,
  groupCount: 25,
  textureCount: 25,
  maxTiles: 64,
  maxVertices: 10_000_000,
  maxIndices: 24_000_000,
  maxTriangles: 8_000_000,
  maxBinaryBytes: 1_073_741_824,
  maxTextureBytes: 1_073_741_824,
  maxTotalBytes: 2_147_483_648,
  maxSingleTextureBytes: 134_217_728,
  maxEstimatedCpuGeometryBytes: 805_306_368,
  maxEstimatedGpuGeometryBytes: 536_870_912,
});

function isPlainFile(filePath) {
  try {
    const info = lstatSync(filePath);
    return info.isFile() && !info.isSymbolicLink();
  } catch {
    return false;
  }
}

function nonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function optionalCount(value, label, expected) {
  if (value === undefined) {
    return;
  }
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  if (value !== expected) {
    throw new Error(`${label} ${value} != binary ${expected}`);
  }
}

function readExactly(descriptor, length, position, label) {
  const buffer = Buffer.allocUnsafe(length);
  let offset = 0;
  while (offset < length) {
    const read = readSync(
      descriptor,
      buffer,
      offset,
      length - offset,
      position + offset,
    );
    if (read === 0) {
      throw new Error(`${label} read was incomplete`);
    }
    offset += read;
  }
  return buffer;
}

export function resolveJsprev2Asset(packDirectory, relativePath) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("manifest contains an absolute or empty asset path");
  }
  const normalized = path.normalize(relativePath);
  if (
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith(`..${path.sep}`) ||
    normalized.includes(`${path.sep}..${path.sep}`)
  ) {
    throw new Error("manifest contains path traversal");
  }
  const realPack = realpathSync(packDirectory);
  const realAsset = realpathSync(path.resolve(realPack, normalized));
  const relative = path.relative(realPack, realAsset);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative) ||
    !isPlainFile(realAsset)
  ) {
    throw new Error("manifest asset leaves the selected pack");
  }
  return realAsset;
}

function inspectTexture(filePath) {
  if (!isPlainFile(filePath)) {
    throw new Error("texture is missing, linked or not a regular file");
  }
  const bytes = statSync(filePath).size;
  if (bytes <= 0 || bytes > JSPREV2_REQUIREMENTS.maxSingleTextureBytes) {
    throw new Error(
      `texture bytes ${bytes} exceed 1..${JSPREV2_REQUIREMENTS.maxSingleTextureBytes}`,
    );
  }

  const extension = path.extname(filePath).toLowerCase();
  const descriptor = openSync(filePath, "r");
  try {
    if (extension === ".png") {
      if (bytes < 8) {
        throw new Error("PNG texture is truncated");
      }
      const signature = readExactly(descriptor, 8, 0, "PNG signature");
      if (
        !signature.equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        )
      ) {
        throw new Error("PNG texture signature is invalid");
      }
    } else if (extension === ".jpg" || extension === ".jpeg") {
      if (bytes < 3) {
        throw new Error("JPEG texture is truncated");
      }
      const signature = readExactly(descriptor, 3, 0, "JPEG signature");
      if (
        signature[0] !== 0xff ||
        signature[1] !== 0xd8 ||
        signature[2] !== 0xff
      ) {
        throw new Error("JPEG texture signature is invalid");
      }
    } else if (extension === ".webp") {
      if (bytes < 12) {
        throw new Error("WebP texture is truncated");
      }
      const signature = readExactly(descriptor, 12, 0, "WebP signature");
      if (
        signature.toString("ascii", 0, 4) !== "RIFF" ||
        signature.toString("ascii", 8, 12) !== "WEBP"
      ) {
        throw new Error("WebP texture signature is invalid");
      }
    } else {
      throw new Error(
        `unsupported scan texture extension: ${extension || "<none>"}`,
      );
    }
  } finally {
    closeSync(descriptor);
  }
  return bytes;
}

function inspectBinary(filePath, manifestGroups, deep) {
  if (!isPlainFile(filePath)) {
    throw new Error("tile binary is missing, linked or not a regular file");
  }
  const fileBytes = statSync(filePath).size;
  const expectedGroupCount = manifestGroups.length;
  const descriptor = openSync(filePath, "r");
  try {
    if (
      fileBytes <
      HEADER_BYTES + expectedGroupCount * GROUP_DESCRIPTOR_BYTES
    ) {
      throw new Error("tile binary is truncated before its descriptor table");
    }
    const header = readExactly(descriptor, HEADER_BYTES, 0, "JSPREV2 header");
    if (!header.subarray(0, MAGIC.length).equals(MAGIC)) {
      throw new Error("tile binary magic is not JSPREV2");
    }
    const version = header.readUInt32LE(8);
    const tileId = header.readUInt32LE(12);
    const groupCount = header.readUInt32LE(16);
    if (version !== JSPREV2_REQUIREMENTS.binaryVersion) {
      throw new Error(`tile binary version ${version} is not 2`);
    }
    if (groupCount !== expectedGroupCount) {
      throw new Error(
        `tile binary groups ${groupCount} != manifest groups ${expectedGroupCount}`,
      );
    }
    const descriptorBytes = groupCount * GROUP_DESCRIPTOR_BYTES;
    const table = readExactly(
      descriptor,
      descriptorBytes,
      HEADER_BYTES,
      "JSPREV2 descriptor table",
    );
    const groups = [];
    let vertexCount = 0;
    let indexCount = 0;
    let expectedBytes = HEADER_BYTES + descriptorBytes;
    for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
      const tableOffset = groupIndex * GROUP_DESCRIPTOR_BYTES;
      const groupVertices = table.readUInt32LE(tableOffset);
      const groupIndices = table.readUInt32LE(tableOffset + 4);
      if (
        groupVertices < 1 ||
        groupIndices < 3 ||
        groupIndices % 3 !== 0
      ) {
        throw new Error(`tile group ${groupIndex} has invalid counts`);
      }
      const triangles = groupIndices / 3;
      const manifestGroup = manifestGroups[groupIndex];
      optionalCount(
        manifestGroup.vertexCount,
        `tile group ${groupIndex} manifest vertexCount`,
        groupVertices,
      );
      optionalCount(
        manifestGroup.indexCount,
        `tile group ${groupIndex} manifest indexCount`,
        groupIndices,
      );
      optionalCount(
        manifestGroup.triangleCount,
        `tile group ${groupIndex} manifest triangleCount`,
        triangles,
      );
      groups.push({
        vertexCount: groupVertices,
        indexCount: groupIndices,
        triangleCount: triangles,
      });
      vertexCount += groupVertices;
      indexCount += groupIndices;
      expectedBytes +=
        groupVertices * VERTEX_BYTES + groupIndices * INDEX_BYTES;
    }
    if (expectedBytes !== fileBytes) {
      throw new Error(
        `tile binary bytes ${fileBytes} != descriptor payload ${expectedBytes}`,
      );
    }

    if (deep) {
      let payloadOffset = HEADER_BYTES + descriptorBytes;
      for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        const group = groups[groupIndex];
        const vertexPayloadBytes = group.vertexCount * VERTEX_BYTES;
        const vertices = readExactly(
          descriptor,
          vertexPayloadBytes,
          payloadOffset,
          `JSPREV2 group ${groupIndex} vertices`,
        );
        for (let offset = 0; offset < vertices.length; offset += 4) {
          if (!Number.isFinite(vertices.readFloatLE(offset))) {
            throw new Error(
              `tile group ${groupIndex} contains a non-finite vertex field`,
            );
          }
        }
        payloadOffset += vertexPayloadBytes;

        const indexPayloadBytes = group.indexCount * INDEX_BYTES;
        const indices = readExactly(
          descriptor,
          indexPayloadBytes,
          payloadOffset,
          `JSPREV2 group ${groupIndex} indices`,
        );
        for (let offset = 0; offset < indices.length; offset += 4) {
          const index = indices.readUInt32LE(offset);
          if (index >= group.vertexCount) {
            throw new Error(
              `tile group ${groupIndex} index ${index} exceeds ${group.vertexCount} vertices`,
            );
          }
        }
        payloadOffset += indexPayloadBytes;
      }
      if (payloadOffset !== fileBytes) {
        throw new Error(
          "deep JSPREV2 validation did not consume the full tile",
        );
      }
    }

    return {
      tileId,
      fileBytes,
      vertexCount,
      indexCount,
      triangleCount: indexCount / 3,
      groups,
    };
  } finally {
    closeSync(descriptor);
  }
}

function enforceBudgets(metrics) {
  const checks = [
    ["tiles", metrics.tileCount, JSPREV2_REQUIREMENTS.maxTiles],
    ["vertices", metrics.vertexCount, JSPREV2_REQUIREMENTS.maxVertices],
    ["indices", metrics.indexCount, JSPREV2_REQUIREMENTS.maxIndices],
    ["triangles", metrics.triangleCount, JSPREV2_REQUIREMENTS.maxTriangles],
    ["binary bytes", metrics.binaryBytes, JSPREV2_REQUIREMENTS.maxBinaryBytes],
    [
      "texture bytes",
      metrics.textureBytes,
      JSPREV2_REQUIREMENTS.maxTextureBytes,
    ],
    ["total bytes", metrics.totalBytes, JSPREV2_REQUIREMENTS.maxTotalBytes],
    [
      "estimated CPU geometry bytes",
      metrics.estimatedCpuGeometryBytes,
      JSPREV2_REQUIREMENTS.maxEstimatedCpuGeometryBytes,
    ],
    [
      "estimated GPU geometry bytes",
      metrics.estimatedGpuGeometryBytes,
      JSPREV2_REQUIREMENTS.maxEstimatedGpuGeometryBytes,
    ],
  ];
  for (const [label, value, maximum] of checks) {
    if (!Number.isSafeInteger(value) || value < 0 || value > maximum) {
      throw new Error(`${label} ${value} exceed budget ${maximum}`);
    }
  }
}

export function inspectJsprev2Pack(
  directoryPath,
  { deep = false, requireExact = true } = {},
) {
  const packDirectory = realpathSync(directoryPath);
  const manifestPath = path.join(packDirectory, "COMPLETE.json");
  if (!isPlainFile(manifestPath)) {
    throw new Error("selected JSPREV2 pack has no COMPLETE.json");
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!Array.isArray(manifest.tiles) || manifest.tiles.length === 0) {
    throw new Error("selected JSPREV2 manifest has no tiles");
  }
  if (manifest.tiles.length > JSPREV2_REQUIREMENTS.maxTiles) {
    throw new Error(
      `selected JSPREV2 manifest has ${manifest.tiles.length} tiles; ` +
        `maximum ${JSPREV2_REQUIREMENTS.maxTiles}`,
    );
  }

  const packId =
    typeof manifest.packageId === "string" &&
    manifest.packageId.trim().length > 0
      ? manifest.packageId
      : typeof manifest.previewContentSha256 === "string" &&
          manifest.previewContentSha256.trim().length > 0
        ? manifest.previewContentSha256
        : null;
  if (packId === null) {
    throw new Error(
      "selected JSPREV2 manifest has no stable package identifier",
    );
  }

  const binaryPaths = new Set();
  const texturePaths = new Set();
  const tileIds = new Set();
  const tiles = [];
  let groupCount = 0;
  let vertexCount = 0;
  let indexCount = 0;
  let triangleCount = 0;
  let binaryBytes = 0;
  let textureBytes = 0;

  for (let tileIndex = 0; tileIndex < manifest.tiles.length; tileIndex += 1) {
    const tile = manifest.tiles[tileIndex];
    if (
      tile === null ||
      typeof tile !== "object" ||
      typeof tile.path !== "string" ||
      !Array.isArray(tile.groups) ||
      tile.groups.length === 0
    ) {
      throw new Error(`selected JSPREV2 tile ${tileIndex} is incomplete`);
    }
    const binaryPath = resolveJsprev2Asset(packDirectory, tile.path);
    if (binaryPaths.has(binaryPath)) {
      throw new Error(`selected JSPREV2 reuses tile binary ${tile.path}`);
    }
    binaryPaths.add(binaryPath);

    const manifestGroups = tile.groups.map((group, groupIndex) => {
      if (group === null || typeof group !== "object") {
        throw new Error(
          `selected JSPREV2 tile ${tileIndex} group ${groupIndex} is invalid`,
        );
      }
      const texturePath = resolveJsprev2Asset(
        packDirectory,
        nonEmptyString(
          group.texturePath,
          `tile ${tileIndex} group ${groupIndex} texturePath`,
        ),
      );
      return {
        texturePath,
        vertexCount: group.vertexCount,
        indexCount: group.indexCount,
        triangleCount: group.triangleCount,
      };
    });

    const binary = inspectBinary(binaryPath, manifestGroups, deep);
    if (tileIds.has(binary.tileId)) {
      throw new Error(`selected JSPREV2 reuses tile id ${binary.tileId}`);
    }
    tileIds.add(binary.tileId);

    const groups = manifestGroups.map((group, groupIndex) => {
      const texturePath = group.texturePath;
      if (texturePaths.has(texturePath)) {
        throw new Error(
          `selected JSPREV2 reuses texture ${path.basename(texturePath)}`,
        );
      }
      texturePaths.add(texturePath);
      const bytes = inspectTexture(texturePath);
      textureBytes += bytes;
      return {
        texturePath,
        textureBytes: bytes,
        ...binary.groups[groupIndex],
      };
    });

    groupCount += groups.length;
    vertexCount += binary.vertexCount;
    indexCount += binary.indexCount;
    triangleCount += binary.triangleCount;
    binaryBytes += binary.fileBytes;
    tiles.push({
      tileId: binary.tileId,
      binaryPath,
      binaryBytes: binary.fileBytes,
      vertexCount: binary.vertexCount,
      indexCount: binary.indexCount,
      triangleCount: binary.triangleCount,
      groups,
    });
  }

  const textureCount = texturePaths.size;
  if (
    requireExact &&
    (groupCount !== JSPREV2_REQUIREMENTS.groupCount ||
      textureCount !== JSPREV2_REQUIREMENTS.textureCount)
  ) {
    throw new Error(
      `selected JSPREV2 pack is ${groupCount}/${textureCount}; required ` +
        `${JSPREV2_REQUIREMENTS.groupCount}/${JSPREV2_REQUIREMENTS.textureCount}`,
    );
  }
  const manifestBytes = statSync(manifestPath).size;
  const totalBytes = manifestBytes + binaryBytes + textureBytes;
  const estimatedCpuGeometryBytes = vertexCount * 44 + indexCount * 8;
  const estimatedGpuGeometryBytes = vertexCount * 32 + indexCount * 2;
  const metrics = {
    tileCount: tiles.length,
    groupCount,
    textureCount,
    vertexCount,
    indexCount,
    triangleCount,
    manifestBytes,
    binaryBytes,
    textureBytes,
    totalBytes,
    estimatedCpuGeometryBytes,
    estimatedGpuGeometryBytes,
  };
  enforceBudgets(metrics);

  return {
    schema: JSPREV2_REQUIREMENTS.schema,
    packDirectory,
    manifestPath,
    packId,
    modifiedTimeMs: statSync(manifestPath).mtimeMs,
    deepValidated: deep,
    ...metrics,
    tiles,
  };
}
