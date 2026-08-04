const GLB_JSON_CHUNK = 0x4e4f534a;
const GLTF_UNSIGNED_BYTE = 5121;
const GLTF_UNSIGNED_SHORT = 5123;

export interface GlbRuntimePolicyReceiptV1 {
  readonly bufferCount: 1;
  readonly alignedBufferViewCount: number;
  readonly alignedAccessorCount: number;
  readonly boundRootNodeCount: number;
}

type JsonRecord = Record<string, unknown>;

function reject(message: string): never {
  throw new Error(`GLB runtime policy V1 rejected: ${message}`);
}

function object(value: unknown, label: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    reject(`${label} must be an object`);
  }
  return value as JsonRecord;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    reject(`${label} must be an array`);
  }
  return value;
}

function integer(value: unknown, label: string, minimum = 0): number {
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

function decodeRoot(bytes: Uint8Array): JsonRecord {
  if (bytes.byteLength < 20) {
    reject("file is too short for the JSON chunk");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const jsonLength = view.getUint32(12, true);
  const jsonType = view.getUint32(16, true);
  if (jsonType !== GLB_JSON_CHUNK || 20 + jsonLength > bytes.byteLength) {
    reject("first chunk must be one complete JSON chunk");
  }
  const jsonBytes = bytes.subarray(20, 20 + jsonLength);
  let end = jsonBytes.byteLength;
  while (
    end > 0 &&
    (jsonBytes[end - 1] === 0x20 || jsonBytes[end - 1] === 0x00)
  ) {
    end -= 1;
  }
  try {
    return object(
      JSON.parse(new TextDecoder().decode(jsonBytes.subarray(0, end))),
      "glTF root",
    );
  } catch (error: unknown) {
    throw new Error("GLB runtime policy V1 rejected: JSON is invalid.", {
      cause: error,
    });
  }
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

function isIdentityTuple(
  value: unknown,
  expected: readonly number[],
): boolean {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.length === expected.length &&
      value.every(
        (entry, index) =>
          typeof entry === "number" &&
          Number.isFinite(entry) &&
          Math.abs(entry - expected[index]!) <= 1e-8,
      ))
  );
}

export function assertGlbRuntimePolicyV1(
  bytes: Uint8Array,
  boundNodeNames: readonly string[],
): GlbRuntimePolicyReceiptV1 {
  const root = decodeRoot(bytes);

  const buffers = array(root["buffers"], "glTF buffers");
  if (buffers.length !== 1) {
    reject("exactly one embedded buffer is required");
  }
  const buffer = object(buffers[0], "glTF buffers[0]");
  if (buffer["uri"] !== undefined) {
    reject("the single GLB buffer must use the embedded BIN chunk");
  }

  const bufferViews = array(root["bufferViews"], "glTF bufferViews");
  const viewOffsets = bufferViews.map((entry, index) => {
    const label = `glTF bufferViews[${index}]`;
    const view = object(entry, label);
    const byteOffset = optionalInteger(
      view["byteOffset"],
      `${label}.byteOffset`,
      0,
    );
    if (byteOffset % 4 !== 0) {
      reject(`${label}.byteOffset must be 4-byte aligned`);
    }
    if (view["byteStride"] !== undefined) {
      const stride = integer(view["byteStride"], `${label}.byteStride`, 4);
      if (stride % 4 !== 0) {
        reject(`${label}.byteStride must be a multiple of 4`);
      }
    }
    return byteOffset;
  });

  const accessors = array(root["accessors"], "glTF accessors");
  const accessorComponentTypes = accessors.map((entry, index) => {
    const label = `glTF accessors[${index}]`;
    const accessor = object(entry, label);
    const viewIndex = integer(
      accessor["bufferView"],
      `${label}.bufferView`,
    );
    const viewOffset = viewOffsets[viewIndex];
    if (viewOffset === undefined) {
      reject(`${label}.bufferView references missing view ${viewIndex}`);
    }
    const componentType = integer(
      accessor["componentType"],
      `${label}.componentType`,
    );
    const componentSize = componentByteSize(
      componentType,
      `${label}.componentType`,
    );
    const accessorOffset = optionalInteger(
      accessor["byteOffset"],
      `${label}.byteOffset`,
      0,
    );
    if ((viewOffset + accessorOffset) % componentSize !== 0) {
      reject(`${label} is not aligned to its component size`);
    }
    return componentType;
  });

  for (const [meshIndex, meshValue] of array(
    root["meshes"],
    "glTF meshes",
  ).entries()) {
    const mesh = object(meshValue, `glTF meshes[${meshIndex}]`);
    for (const [primitiveIndex, primitiveValue] of array(
      mesh["primitives"],
      `glTF meshes[${meshIndex}].primitives`,
    ).entries()) {
      const primitive = object(
        primitiveValue,
        `glTF meshes[${meshIndex}].primitives[${primitiveIndex}]`,
      );
      if (primitive["indices"] === undefined) {
        continue;
      }
      const accessorIndex = integer(
        primitive["indices"],
        `glTF meshes[${meshIndex}].primitives[${primitiveIndex}].indices`,
      );
      const componentType = accessorComponentTypes[accessorIndex];
      if (
        componentType !== GLTF_UNSIGNED_BYTE &&
        componentType !== GLTF_UNSIGNED_SHORT
      ) {
        reject(
          `glTF meshes[${meshIndex}].primitives[${primitiveIndex}] indices must be 8-bit or 16-bit for WebGL1 portability`,
        );
      }
    }
  }

  const nodes = array(root["nodes"], "glTF nodes");
  const nameToIndex = new Map<string, number>();
  const parentCounts = new Array<number>(nodes.length).fill(0);
  nodes.forEach((nodeValue, index) => {
    const node = object(nodeValue, `glTF nodes[${index}]`);
    const name = node["name"];
    if (typeof name === "string") {
      nameToIndex.set(name, index);
    }
    if (node["children"] !== undefined) {
      for (const [childOffset, childValue] of array(
        node["children"],
        `glTF nodes[${index}].children`,
      ).entries()) {
        const child = integer(
          childValue,
          `glTF nodes[${index}].children[${childOffset}]`,
        );
        const currentParentCount = parentCounts[child];
        if (currentParentCount === undefined) {
          reject(`glTF nodes[${index}] references missing child ${child}`);
        }
        const nextParentCount = currentParentCount + 1;
        parentCounts[child] = nextParentCount;
        if (nextParentCount > 1) {
          reject(`glTF node ${child} has more than one parent`);
        }
      }
    }
  });

  for (const nodeName of boundNodeNames) {
    const index = nameToIndex.get(nodeName);
    if (index === undefined) {
      reject(`bound node is missing: ${nodeName}`);
    }
    const node = object(nodes[index], `glTF nodes[${index}]`);
    if (parentCounts[index] !== 0) {
      reject(`bound node must be a root node: ${nodeName}`);
    }
    if (node["matrix"] !== undefined) {
      reject(`bound node matrix must be applied before export: ${nodeName}`);
    }
    if (!isIdentityTuple(node["translation"], [0, 0, 0])) {
      reject(`bound node translation must be applied before export: ${nodeName}`);
    }
    if (!isIdentityTuple(node["rotation"], [0, 0, 0, 1])) {
      reject(`bound node rotation must be applied before export: ${nodeName}`);
    }
    if (!isIdentityTuple(node["scale"], [1, 1, 1])) {
      reject(`bound node scale must be applied before export: ${nodeName}`);
    }
  }

  return Object.freeze({
    bufferCount: 1,
    alignedBufferViewCount: bufferViews.length,
    alignedAccessorCount: accessors.length,
    boundRootNodeCount: boundNodeNames.length,
  });
}
