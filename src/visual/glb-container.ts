const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;
const GLTF_TRIANGLES_MODE = 4;
const GLTF_FLOAT = 5126;
const GLTF_UNSIGNED_BYTE = 5121;
const GLTF_UNSIGNED_SHORT = 5123;
const GLTF_UNSIGNED_INT = 5125;

export interface GlbInspectionV1 {
  readonly version: 2;
  readonly byteLength: number;
  readonly jsonChunkLength: number;
  readonly binaryChunkLength: number;
  readonly declaredBufferByteLength: number;
  readonly bufferViewCount: number;
  readonly accessorCount: number;
  readonly nodeNames: readonly string[];
  readonly duplicateNodeNames: readonly string[];
  readonly unnamedNodeCount: number;
  readonly meshCount: number;
  readonly primitiveCount: number;
  readonly trianglePrimitiveCount: number;
  readonly sparseAccessorCount: number;
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

interface BufferViewInfo {
  readonly buffer: number;
  readonly byteOffset: number;
  readonly byteLength: number;
  readonly byteStride: number | null;
}

interface AccessorInfo {
  readonly bufferView: number;
  readonly byteOffset: number;
  readonly componentType: number;
  readonly count: number;
  readonly type: string;
  readonly sparse: boolean;
}

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

function requiredArray(value: unknown, label: string): unknown[] {
  const entries = optionalArray(value, label);
  if (entries.length === 0) {
    reject(`${label} must be a non-empty array`);
  }
  return entries;
}

function stringArray(value: unknown, label: string): string[] {
  return optionalArray(value, label).map((entry, index) => {
    if (typeof entry !== "string" || entry.length === 0) {
      reject(`${label}[${index}] must be a non-empty string`);
    }
    return entry;
  });
}

function integer(
  value: unknown,
  label: string,
  minimum = 0,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < minimum
  ) {
    reject(`${label} must be an integer >= ${minimum}`);
  }
  return value;
}

function optionalInteger(
  value: unknown,
  label: string,
  fallback: number,
  minimum = 0,
): number {
  return value === undefined ? fallback : integer(value, label, minimum);
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

function componentByteSize(componentType: number, label: string): number {
  switch (componentType) {
    case 5120:
    case 5121:
      return 1;
    case 5122:
    case 5123:
      return 2;
    case 5125:
    case 5126:
      return 4;
    default:
      reject(`${label} uses unsupported componentType ${componentType}`);
  }
}

function typeComponentCount(type: string, label: string): number {
  switch (type) {
    case "SCALAR":
      return 1;
    case "VEC2":
      return 2;
    case "VEC3":
      return 3;
    case "VEC4":
    case "MAT2":
      return 4;
    case "MAT3":
      return 9;
    case "MAT4":
      return 16;
    default:
      reject(`${label} uses unsupported accessor type ${type}`);
  }
}

function inspectBuffers(
  root: JsonRecord,
  binaryLength: number,
): Readonly<{ lengths: readonly number[]; external: readonly boolean[] }> {
  const buffers = requiredArray(root["buffers"], "glTF buffers");
  const lengths: number[] = [];
  const external: boolean[] = [];
  buffers.forEach((entry, index) => {
    const buffer = object(entry, `glTF buffers[${index}]`);
    lengths.push(integer(buffer["byteLength"], `glTF buffers[${index}].byteLength`, 1));
    external.push(buffer["uri"] !== undefined);
  });

  if (!external[0] && binaryLength > 0) {
    const padding = binaryLength - lengths[0]!;
    if (padding < 0 || padding > 3) {
      reject(
        `embedded buffer byteLength ${lengths[0]} is incompatible with BIN chunk ${binaryLength}`,
      );
    }
  }
  return { lengths, external };
}

function inspectBufferViews(
  root: JsonRecord,
  bufferLengths: readonly number[],
): readonly BufferViewInfo[] {
  return requiredArray(root["bufferViews"], "glTF bufferViews").map(
    (entry, index) => {
      const label = `glTF bufferViews[${index}]`;
      const view = object(entry, label);
      const buffer = integer(view["buffer"], `${label}.buffer`);
      const bufferLength = bufferLengths[buffer];
      if (bufferLength === undefined) {
        reject(`${label}.buffer references missing buffer ${buffer}`);
      }
      const byteOffset = optionalInteger(
        view["byteOffset"],
        `${label}.byteOffset`,
        0,
      );
      const byteLength = integer(view["byteLength"], `${label}.byteLength`, 1);
      if (byteOffset + byteLength > bufferLength) {
        reject(`${label} exceeds buffer ${buffer} byteLength`);
      }
      const byteStride =
        view["byteStride"] === undefined
          ? null
          : integer(view["byteStride"], `${label}.byteStride`, 4);
      if (byteStride !== null && byteStride > 252) {
        reject(`${label}.byteStride must not exceed 252`);
      }
      return { buffer, byteOffset, byteLength, byteStride };
    },
  );
}

function inspectAccessors(
  root: JsonRecord,
  bufferViews: readonly BufferViewInfo[],
): readonly AccessorInfo[] {
  return requiredArray(root["accessors"], "glTF accessors").map(
    (entry, index) => {
      const label = `glTF accessors[${index}]`;
      const accessor = object(entry, label);
      if (accessor["bufferView"] === undefined) {
        reject(`${label}.bufferView is required by rigid-mesh V1`);
      }
      const bufferView = integer(
        accessor["bufferView"],
        `${label}.bufferView`,
      );
      const view = bufferViews[bufferView];
      if (view === undefined) {
        reject(`${label}.bufferView references missing view ${bufferView}`);
      }
      const byteOffset = optionalInteger(
        accessor["byteOffset"],
        `${label}.byteOffset`,
        0,
      );
      const componentType = integer(
        accessor["componentType"],
        `${label}.componentType`,
      );
      const count = integer(accessor["count"], `${label}.count`, 1);
      if (typeof accessor["type"] !== "string") {
        reject(`${label}.type must be a string`);
      }
      const type = accessor["type"];
      const elementBytes =
        componentByteSize(componentType, `${label}.componentType`) *
        typeComponentCount(type, `${label}.type`);
      const stride = view.byteStride ?? elementBytes;
      if (stride < elementBytes) {
        reject(`${label} element does not fit bufferView byteStride`);
      }
      const requiredBytes = byteOffset + stride * (count - 1) + elementBytes;
      if (requiredBytes > view.byteLength) {
        reject(`${label} exceeds its bufferView byteLength`);
      }
      return {
        bufferView,
        byteOffset,
        componentType,
        count,
        type,
        sparse: accessor["sparse"] !== undefined,
      };
    },
  );
}

function inspectGeometry(
  root: JsonRecord,
  accessors: readonly AccessorInfo[],
): Readonly<{
  primitiveCount: number;
  trianglePrimitiveCount: number;
  morphTargetPrimitiveCount: number;
}> {
  const materials = optionalArray(root["materials"], "glTF materials");
  let primitiveCount = 0;
  let trianglePrimitiveCount = 0;
  let morphTargetPrimitiveCount = 0;

  requiredArray(root["meshes"], "glTF meshes").forEach((mesh, meshIndex) => {
    const meshLabel = `glTF meshes[${meshIndex}]`;
    const meshRecord = object(mesh, meshLabel);
    requiredArray(meshRecord["primitives"], `${meshLabel}.primitives`).forEach(
      (primitive, primitiveIndex) => {
        const label = `${meshLabel}.primitives[${primitiveIndex}]`;
        const primitiveRecord = object(primitive, label);
        primitiveCount += 1;
        const attributes = object(primitiveRecord["attributes"], `${label}.attributes`);
        const positionIndex = integer(
          attributes["POSITION"],
          `${label}.attributes.POSITION`,
        );
        const position = accessors[positionIndex];
        if (position === undefined) {
          reject(`${label}.POSITION references missing accessor ${positionIndex}`);
        }
        if (
          position.componentType !== GLTF_FLOAT ||
          position.type !== "VEC3" ||
          position.count < 3
        ) {
          reject(`${label}.POSITION must be FLOAT VEC3 with at least 3 vertices`);
        }

        const mode = optionalInteger(
          primitiveRecord["mode"],
          `${label}.mode`,
          GLTF_TRIANGLES_MODE,
        );
        if (mode === GLTF_TRIANGLES_MODE) {
          trianglePrimitiveCount += 1;
          if (primitiveRecord["indices"] === undefined) {
            if (position.count % 3 !== 0) {
              reject(`${label} non-indexed triangle vertex count must be divisible by 3`);
            }
          } else {
            const indexAccessorIndex = integer(
              primitiveRecord["indices"],
              `${label}.indices`,
            );
            const indices = accessors[indexAccessorIndex];
            if (indices === undefined) {
              reject(`${label}.indices references missing accessor ${indexAccessorIndex}`);
            }
            if (
              indices.type !== "SCALAR" ||
              ![
                GLTF_UNSIGNED_BYTE,
                GLTF_UNSIGNED_SHORT,
                GLTF_UNSIGNED_INT,
              ].includes(indices.componentType) ||
              indices.count % 3 !== 0
            ) {
              reject(`${label}.indices must be unsigned SCALAR triangles`);
            }
          }
        }

        if (primitiveRecord["material"] !== undefined) {
          const material = integer(
            primitiveRecord["material"],
            `${label}.material`,
          );
          if (materials[material] === undefined) {
            reject(`${label}.material references missing material ${material}`);
          }
        }
        if (
          Array.isArray(primitiveRecord["targets"]) &&
          primitiveRecord["targets"].length > 0
        ) {
          morphTargetPrimitiveCount += 1;
        }
      },
    );
  });
  return { primitiveCount, trianglePrimitiveCount, morphTargetPrimitiveCount };
}

function inspectNodes(root: JsonRecord, meshCount: number): Readonly<{
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

    if (record["mesh"] !== undefined) {
      const mesh = integer(record["mesh"], `glTF nodes[${index}].mesh`);
      if (mesh >= meshCount) {
        reject(`glTF nodes[${index}].mesh references missing mesh ${mesh}`);
      }
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
  const buffers = inspectBuffers(root, binaryLength);
  const bufferViews = inspectBufferViews(root, buffers.lengths);
  const accessors = inspectAccessors(root, bufferViews);
  const geometry = inspectGeometry(root, accessors);
  const meshCount = requiredArray(root["meshes"], "glTF meshes").length;
  const nodes = inspectNodes(root, meshCount);

  return Object.freeze({
    version: 2,
    byteLength: bytes.byteLength,
    jsonChunkLength: json.byteLength,
    binaryChunkLength: binaryLength,
    declaredBufferByteLength: buffers.lengths[0]!,
    bufferViewCount: bufferViews.length,
    accessorCount: accessors.length,
    nodeNames: nodes.names,
    duplicateNodeNames: nodes.duplicateNames,
    unnamedNodeCount: nodes.unnamedCount,
    meshCount,
    primitiveCount: geometry.primitiveCount,
    trianglePrimitiveCount: geometry.trianglePrimitiveCount,
    sparseAccessorCount: accessors.filter((accessor) => accessor.sparse).length,
    materialCount: optionalArray(root["materials"], "glTF materials").length,
    textureCount: optionalArray(root["textures"], "glTF textures").length,
    imageCount: optionalArray(root["images"], "glTF images").length,
    animationCount: optionalArray(root["animations"], "glTF animations").length,
    skinCount: optionalArray(root["skins"], "glTF skins").length,
    morphTargetPrimitiveCount: geometry.morphTargetPrimitiveCount,
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
