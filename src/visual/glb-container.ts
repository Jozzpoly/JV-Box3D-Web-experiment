const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;

export interface GlbInspectionV1 {
  readonly version: 2;
  readonly byteLength: number;
  readonly jsonChunkLength: number;
  readonly binaryChunkLength: number;
  readonly nodeNames: readonly string[];
  readonly duplicateNodeNames: readonly string[];
  readonly unnamedNodeCount: number;
  readonly meshCount: number;
  readonly materialCount: number;
  readonly textureCount: number;
  readonly imageCount: number;
  readonly animationCount: number;
  readonly skinCount: number;
  readonly morphTargetPrimitiveCount: number;
  readonly externalUris: readonly string[];
  readonly extensionsUsed: readonly string[];
  readonly extensionsRequired: readonly string[];
  readonly nonPositiveScaleNodes: readonly string[];
}

type JsonRecord = Record<string, unknown>;

function reject(message: string): never {
  throw new Error(`GLB rejected: ${message}`);
}

function object(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    reject(`${label} must be an object`);
  }
  return value as JsonRecord;
}

function optionalArray(value: unknown, label: string): unknown[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    reject(`${label} must be an array`);
  }
  return value;
}

function stringArray(value: unknown, label: string): string[] {
  return optionalArray(value, label).map((entry, index) => {
    if (typeof entry !== "string" || entry.length === 0) {
      reject(`${label}[${index}] must be a non-empty string`);
    }
    return entry;
  });
}

function trimJsonPadding(bytes: Uint8Array): Uint8Array {
  let end = bytes.byteLength;
  while (end > 0 && (bytes[end - 1] === 0x20 || bytes[end - 1] === 0x00)) {
    end -= 1;
  }
  return bytes.subarray(0, end);
}

function decodeJsonChunk(bytes: Uint8Array): JsonRecord {
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(trimJsonPadding(bytes)));
  } catch (error: unknown) {
    throw new Error("GLB rejected: JSON chunk is invalid.", { cause: error });
  }
  return object(parsed, "glTF root");
}

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return [...duplicates].sort();
}

function collectExternalUris(root: JsonRecord): string[] {
  const uris: string[] = [];
  for (const [label, entries] of [
    ["buffers", optionalArray(root["buffers"], "glTF buffers")],
    ["images", optionalArray(root["images"], "glTF images")],
  ] as const) {
    entries.forEach((entry, index) => {
      const item = object(entry, `glTF ${label}[${index}]`);
      if (item["uri"] !== undefined) {
        if (typeof item["uri"] !== "string" || item["uri"].length === 0) {
          reject(`glTF ${label}[${index}].uri must be a non-empty string`);
        }
        uris.push(item["uri"]);
      }
    });
  }
  return uris;
}

function countMorphTargetPrimitives(root: JsonRecord): number {
  let count = 0;
  optionalArray(root["meshes"], "glTF meshes").forEach((mesh, meshIndex) => {
    const meshRecord = object(mesh, `glTF meshes[${meshIndex}]`);
    optionalArray(
      meshRecord["primitives"],
      `glTF meshes[${meshIndex}].primitives`,
    ).forEach((primitive, primitiveIndex) => {
      const primitiveRecord = object(
        primitive,
        `glTF meshes[${meshIndex}].primitives[${primitiveIndex}]`,
      );
      if (
        Array.isArray(primitiveRecord["targets"]) &&
        primitiveRecord["targets"].length > 0
      ) {
        count += 1;
      }
    });
  });
  return count;
}

function inspectNodes(root: JsonRecord): Readonly<{
  names: readonly string[];
  duplicateNames: readonly string[];
  unnamedCount: number;
  nonPositiveScaleNodes: readonly string[];
}> {
  const names: string[] = [];
  const nonPositiveScaleNodes: string[] = [];
  let unnamedCount = 0;
  optionalArray(root["nodes"], "glTF nodes").forEach((node, index) => {
    const record = object(node, `glTF nodes[${index}]`);
    const name = record["name"];
    let label = `#${index}`;
    if (name === undefined) {
      unnamedCount += 1;
    } else if (typeof name !== "string" || name.trim().length === 0) {
      reject(`glTF nodes[${index}].name must be a non-empty string`);
    } else {
      label = name;
      names.push(name);
    }

    const scale = record["scale"];
    if (scale !== undefined) {
      if (
        !Array.isArray(scale) ||
        scale.length !== 3 ||
        scale.some((entry) => typeof entry !== "number" || !Number.isFinite(entry))
      ) {
        reject(`glTF nodes[${index}].scale must contain three finite numbers`);
      }
      if (scale.some((entry) => entry <= 0)) {
        nonPositiveScaleNodes.push(label);
      }
    }
  });
  return {
    names: Object.freeze(names),
    duplicateNames: Object.freeze(duplicateValues(names)),
    unnamedCount,
    nonPositiveScaleNodes: Object.freeze(nonPositiveScaleNodes),
  };
}

export function inspectGlbV2(bytes: Uint8Array): GlbInspectionV1 {
  if (bytes.byteLength < 20) {
    reject("file is too short for a GLB header and JSON chunk");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== GLB_MAGIC) {
    reject("magic does not equal glTF");
  }
  if (view.getUint32(4, true) !== GLB_VERSION) {
    reject(`version must equal ${GLB_VERSION}`);
  }
  const declaredLength = view.getUint32(8, true);
  if (declaredLength !== bytes.byteLength) {
    reject(
      `declared byte length ${declaredLength} does not match ${bytes.byteLength}`,
    );
  }

  let offset = 12;
  let json: Uint8Array | null = null;
  let binaryLength = 0;
  let chunkIndex = 0;
  while (offset < bytes.byteLength) {
    if (offset + 8 > bytes.byteLength) {
      reject("truncated chunk header");
    }
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    offset += 8;
    if (chunkLength % 4 !== 0) {
      reject(`chunk ${chunkIndex} length is not 4-byte aligned`);
    }
    if (offset + chunkLength > bytes.byteLength) {
      reject(`chunk ${chunkIndex} exceeds declared file length`);
    }
    const chunk = bytes.subarray(offset, offset + chunkLength);
    offset += chunkLength;

    if (chunkType === GLB_JSON_CHUNK) {
      if (chunkIndex !== 0 || json !== null) {
        reject("JSON must be the first and only JSON chunk");
      }
      json = chunk;
    } else if (chunkType === GLB_BIN_CHUNK) {
      if (json === null || binaryLength !== 0) {
        reject("BIN must follow JSON and appear at most once");
      }
      binaryLength = chunkLength;
    } else {
      reject(`unsupported chunk type 0x${chunkType.toString(16)}`);
    }
    chunkIndex += 1;
  }

  if (offset !== bytes.byteLength || json === null) {
    reject("file does not contain one complete JSON chunk");
  }

  const root = decodeJsonChunk(json);
  const asset = object(root["asset"], "glTF asset");
  if (asset["version"] !== "2.0") {
    reject("glTF asset.version must equal 2.0");
  }
  const nodes = inspectNodes(root);

  return Object.freeze({
    version: 2,
    byteLength: bytes.byteLength,
    jsonChunkLength: json.byteLength,
    binaryChunkLength: binaryLength,
    nodeNames: nodes.names,
    duplicateNodeNames: nodes.duplicateNames,
    unnamedNodeCount: nodes.unnamedCount,
    meshCount: optionalArray(root["meshes"], "glTF meshes").length,
    materialCount: optionalArray(root["materials"], "glTF materials").length,
    textureCount: optionalArray(root["textures"], "glTF textures").length,
    imageCount: optionalArray(root["images"], "glTF images").length,
    animationCount: optionalArray(root["animations"], "glTF animations").length,
    skinCount: optionalArray(root["skins"], "glTF skins").length,
    morphTargetPrimitiveCount: countMorphTargetPrimitives(root),
    externalUris: Object.freeze(collectExternalUris(root)),
    extensionsUsed: Object.freeze(
      stringArray(root["extensionsUsed"], "glTF extensionsUsed"),
    ),
    extensionsRequired: Object.freeze(
      stringArray(root["extensionsRequired"], "glTF extensionsRequired"),
    ),
    nonPositiveScaleNodes: nodes.nonPositiveScaleNodes,
  });
}
