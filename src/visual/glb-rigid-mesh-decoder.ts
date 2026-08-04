import { inspectGlbV2 } from "./glb-container.js";
import { assertGlbRuntimePolicyV1 } from "./glb-runtime-policy-v1.js";

const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;
const GLTF_FLOAT = 5126;
const GLTF_UNSIGNED_BYTE = 5121;
const GLTF_UNSIGNED_SHORT = 5123;

type JsonRecord = Record<string, unknown>;

export interface GlbRigidMaterialV1 {
  readonly name: string | null;
  readonly baseColorFactor: readonly [number, number, number, number];
  readonly doubleSided: boolean;
}

export interface GlbRigidPrimitiveV1 {
  readonly positions: Float32Array;
  readonly normals: Float32Array | null;
  readonly texcoord0: Float32Array | null;
  readonly indices: Uint16Array;
  readonly materialIndex: number | null;
}

export interface GlbRigidMeshV1 {
  readonly name: string | null;
  readonly primitives: readonly GlbRigidPrimitiveV1[];
}

export interface GlbRigidNodeV1 {
  readonly index: number;
  readonly name: string | null;
  readonly meshIndex: number | null;
  readonly children: readonly number[];
  readonly localFromParent: Float32Array;
}

export interface GlbRigidCpuAssetV1 {
  readonly nodes: readonly GlbRigidNodeV1[];
  readonly rootNodeIndices: readonly number[];
  readonly nodeIndexByName: ReadonlyMap<string, number>;
  readonly meshes: readonly GlbRigidMeshV1[];
  readonly materials: readonly GlbRigidMaterialV1[];
  readonly primitiveCount: number;
  readonly triangleCount: number;
}

interface BufferView {
  readonly byteOffset: number;
  readonly byteLength: number;
  readonly byteStride: number | null;
}

interface Accessor {
  readonly bufferView: number;
  readonly byteOffset: number;
  readonly componentType: number;
  readonly count: number;
  readonly type: string;
}

function reject(message: string): never {
  throw new Error(`Rigid GLB decoder rejected: ${message}`);
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

function optionalArray(value: unknown, label: string): unknown[] {
  return value === undefined ? [] : array(value, label);
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
): number {
  return value === undefined ? fallback : integer(value, label);
}

function finite(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    reject(`${label} must be finite`);
  }
  return value;
}

function decodeDocument(bytes: Uint8Array): Readonly<{
  root: JsonRecord;
  binary: Uint8Array;
}> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const jsonLength = view.getUint32(12, true);
  const jsonType = view.getUint32(16, true);
  if (jsonType !== GLB_JSON_CHUNK) {
    reject("first GLB chunk must be JSON");
  }
  const jsonStart = 20;
  const jsonEnd = jsonStart + jsonLength;
  const binHeader = jsonEnd;
  if (binHeader + 8 > bytes.byteLength) {
    reject("GLB is missing its BIN chunk");
  }
  const binLength = view.getUint32(binHeader, true);
  const binType = view.getUint32(binHeader + 4, true);
  if (binType !== GLB_BIN_CHUNK || binHeader + 8 + binLength !== bytes.byteLength) {
    reject("GLB must contain exactly one complete BIN chunk after JSON");
  }
  const jsonBytes = bytes.subarray(jsonStart, jsonEnd);
  let end = jsonBytes.byteLength;
  while (
    end > 0 &&
    (jsonBytes[end - 1] === 0x20 || jsonBytes[end - 1] === 0x00)
  ) {
    end -= 1;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(jsonBytes.subarray(0, end)));
  } catch (error: unknown) {
    throw new Error("Rigid GLB decoder rejected: JSON is invalid.", {
      cause: error,
    });
  }
  return {
    root: object(parsed, "glTF root"),
    binary: bytes.subarray(binHeader + 8, binHeader + 8 + binLength),
  };
}

function parseBufferViews(root: JsonRecord): readonly BufferView[] {
  return array(root["bufferViews"], "glTF bufferViews").map(
    (value, index) => {
      const label = `glTF bufferViews[${index}]`;
      const record = object(value, label);
      if (integer(record["buffer"], `${label}.buffer`) !== 0) {
        reject(`${label} must use embedded buffer 0`);
      }
      return Object.freeze({
        byteOffset: optionalInteger(
          record["byteOffset"],
          `${label}.byteOffset`,
          0,
        ),
        byteLength: integer(record["byteLength"], `${label}.byteLength`, 1),
        byteStride:
          record["byteStride"] === undefined
            ? null
            : integer(record["byteStride"], `${label}.byteStride`, 1),
      });
    },
  );
}

function parseAccessors(root: JsonRecord): readonly Accessor[] {
  return array(root["accessors"], "glTF accessors").map((value, index) => {
    const label = `glTF accessors[${index}]`;
    const record = object(value, label);
    if (typeof record["type"] !== "string") {
      reject(`${label}.type must be a string`);
    }
    return Object.freeze({
      bufferView: integer(record["bufferView"], `${label}.bufferView`),
      byteOffset: optionalInteger(record["byteOffset"], `${label}.byteOffset`, 0),
      componentType: integer(
        record["componentType"],
        `${label}.componentType`,
      ),
      count: integer(record["count"], `${label}.count`, 1),
      type: record["type"],
    });
  });
}

function componentCount(type: string, label: string): number {
  switch (type) {
    case "SCALAR":
      return 1;
    case "VEC2":
      return 2;
    case "VEC3":
      return 3;
    default:
      reject(`${label} uses unsupported accessor type ${type}`);
  }
}

function componentBytes(componentType: number, label: string): number {
  switch (componentType) {
    case GLTF_UNSIGNED_BYTE:
      return 1;
    case GLTF_UNSIGNED_SHORT:
      return 2;
    case GLTF_FLOAT:
      return 4;
    default:
      reject(`${label} uses unsupported componentType ${componentType}`);
  }
}

function accessorView(
  accessorIndex: number,
  accessors: readonly Accessor[],
  views: readonly BufferView[],
  label: string,
): Readonly<{ accessor: Accessor; view: BufferView }> {
  const accessor = accessors[accessorIndex];
  if (accessor === undefined) {
    reject(`${label} references missing accessor ${accessorIndex}`);
  }
  const view = views[accessor.bufferView];
  if (view === undefined) {
    reject(`${label} accessor references missing bufferView ${accessor.bufferView}`);
  }
  return { accessor, view };
}

function decodeFloatAccessor(
  accessorIndex: number,
  expectedType: "VEC2" | "VEC3",
  accessors: readonly Accessor[],
  views: readonly BufferView[],
  binary: Uint8Array,
  label: string,
): Float32Array {
  const { accessor, view } = accessorView(
    accessorIndex,
    accessors,
    views,
    label,
  );
  if (accessor.componentType !== GLTF_FLOAT || accessor.type !== expectedType) {
    reject(`${label} must be FLOAT ${expectedType}`);
  }
  const valuesPerElement = componentCount(accessor.type, label);
  const elementBytes = valuesPerElement * 4;
  const stride = view.byteStride ?? elementBytes;
  const start = view.byteOffset + accessor.byteOffset;
  const result = new Float32Array(accessor.count * valuesPerElement);
  const data = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  for (let element = 0; element < accessor.count; element += 1) {
    const elementOffset = start + element * stride;
    for (let component = 0; component < valuesPerElement; component += 1) {
      result[element * valuesPerElement + component] = data.getFloat32(
        elementOffset + component * 4,
        true,
      );
    }
  }
  return result;
}

function decodeIndices(
  accessorIndex: number | null,
  vertexCount: number,
  accessors: readonly Accessor[],
  views: readonly BufferView[],
  binary: Uint8Array,
  label: string,
): Uint16Array {
  if (accessorIndex === null) {
    if (vertexCount > 65_535) {
      reject(`${label} non-indexed vertex count exceeds Uint16 capacity`);
    }
    const generated = new Uint16Array(vertexCount);
    for (let index = 0; index < vertexCount; index += 1) {
      generated[index] = index;
    }
    return generated;
  }
  const { accessor, view } = accessorView(
    accessorIndex,
    accessors,
    views,
    `${label}.indices`,
  );
  if (accessor.type !== "SCALAR") {
    reject(`${label}.indices must use SCALAR accessor`);
  }
  const bytesPerIndex = componentBytes(
    accessor.componentType,
    `${label}.indices`,
  );
  if (
    accessor.componentType !== GLTF_UNSIGNED_BYTE &&
    accessor.componentType !== GLTF_UNSIGNED_SHORT
  ) {
    reject(`${label}.indices must be 8-bit or 16-bit`);
  }
  const stride = view.byteStride ?? bytesPerIndex;
  const start = view.byteOffset + accessor.byteOffset;
  const data = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  const result = new Uint16Array(accessor.count);
  for (let index = 0; index < accessor.count; index += 1) {
    const byteOffset = start + index * stride;
    result[index] =
      accessor.componentType === GLTF_UNSIGNED_BYTE
        ? data.getUint8(byteOffset)
        : data.getUint16(byteOffset, true);
    if (result[index]! >= vertexCount) {
      reject(`${label}.indices contains vertex ${result[index]} >= ${vertexCount}`);
    }
  }
  return result;
}

function parseMaterials(root: JsonRecord): readonly GlbRigidMaterialV1[] {
  return Object.freeze(
    optionalArray(root["materials"], "glTF materials").map((value, index) => {
      const label = `glTF materials[${index}]`;
      const record = object(value, label);
      const pbr =
        record["pbrMetallicRoughness"] === undefined
          ? null
          : object(
              record["pbrMetallicRoughness"],
              `${label}.pbrMetallicRoughness`,
            );
      const rawFactor = pbr?.["baseColorFactor"];
      const factor =
        rawFactor === undefined
          ? [1, 1, 1, 1]
          : array(rawFactor, `${label}.baseColorFactor`).map((entry, component) =>
              finite(entry, `${label}.baseColorFactor[${component}]`),
            );
      if (factor.length !== 4 || factor.some((entry) => entry < 0 || entry > 1)) {
        reject(`${label}.baseColorFactor must contain four values in [0,1]`);
      }
      return Object.freeze({
        name: typeof record["name"] === "string" ? record["name"] : null,
        baseColorFactor: Object.freeze(factor) as readonly [
          number,
          number,
          number,
          number,
        ],
        doubleSided: record["doubleSided"] === true,
      });
    }),
  );
}

function parseMeshes(
  root: JsonRecord,
  views: readonly BufferView[],
  accessors: readonly Accessor[],
  binary: Uint8Array,
  materialCount: number,
): readonly GlbRigidMeshV1[] {
  return Object.freeze(
    array(root["meshes"], "glTF meshes").map((value, meshIndex) => {
      const label = `glTF meshes[${meshIndex}]`;
      const record = object(value, label);
      const primitives = array(
        record["primitives"],
        `${label}.primitives`,
      ).map((primitiveValue, primitiveIndex) => {
        const primitiveLabel = `${label}.primitives[${primitiveIndex}]`;
        const primitive = object(primitiveValue, primitiveLabel);
        const attributes = object(
          primitive["attributes"],
          `${primitiveLabel}.attributes`,
        );
        const positions = decodeFloatAccessor(
          integer(
            attributes["POSITION"],
            `${primitiveLabel}.attributes.POSITION`,
          ),
          "VEC3",
          accessors,
          views,
          binary,
          `${primitiveLabel}.POSITION`,
        );
        const vertexCount = positions.length / 3;
        const normals =
          attributes["NORMAL"] === undefined
            ? null
            : decodeFloatAccessor(
                integer(
                  attributes["NORMAL"],
                  `${primitiveLabel}.attributes.NORMAL`,
                ),
                "VEC3",
                accessors,
                views,
                binary,
                `${primitiveLabel}.NORMAL`,
              );
        if (normals !== null && normals.length !== positions.length) {
          reject(`${primitiveLabel}.NORMAL count differs from POSITION`);
        }
        const texcoord0 =
          attributes["TEXCOORD_0"] === undefined
            ? null
            : decodeFloatAccessor(
                integer(
                  attributes["TEXCOORD_0"],
                  `${primitiveLabel}.attributes.TEXCOORD_0`,
                ),
                "VEC2",
                accessors,
                views,
                binary,
                `${primitiveLabel}.TEXCOORD_0`,
              );
        if (texcoord0 !== null && texcoord0.length / 2 !== vertexCount) {
          reject(`${primitiveLabel}.TEXCOORD_0 count differs from POSITION`);
        }
        const indices = decodeIndices(
          primitive["indices"] === undefined
            ? null
            : integer(primitive["indices"], `${primitiveLabel}.indices`),
          vertexCount,
          accessors,
          views,
          binary,
          primitiveLabel,
        );
        const materialIndex =
          primitive["material"] === undefined
            ? null
            : integer(primitive["material"], `${primitiveLabel}.material`);
        if (materialIndex !== null && materialIndex >= materialCount) {
          reject(`${primitiveLabel}.material references missing material ${materialIndex}`);
        }
        return Object.freeze({
          positions,
          normals,
          texcoord0,
          indices,
          materialIndex,
        });
      });
      return Object.freeze({
        name: typeof record["name"] === "string" ? record["name"] : null,
        primitives: Object.freeze(primitives),
      });
    }),
  );
}

function quaternionMatrix(
  translation: readonly number[],
  rotation: readonly number[],
  scale: readonly number[],
): Float32Array {
  const [x, y, z, w] = rotation as [number, number, number, number];
  const [sx, sy, sz] = scale as [number, number, number];
  const [tx, ty, tz] = translation as [number, number, number];
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const xz = x * z;
  const yz = y * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;
  return new Float32Array([
    (1 - 2 * (yy + zz)) * sx,
    2 * (xy + wz) * sx,
    2 * (xz - wy) * sx,
    0,
    2 * (xy - wz) * sy,
    (1 - 2 * (xx + zz)) * sy,
    2 * (yz + wx) * sy,
    0,
    2 * (xz + wy) * sz,
    2 * (yz - wx) * sz,
    (1 - 2 * (xx + yy)) * sz,
    0,
    tx,
    ty,
    tz,
    1,
  ]);
}

function numericTuple(
  value: unknown,
  length: number,
  fallback: readonly number[],
  label: string,
): readonly number[] {
  if (value === undefined) {
    return fallback;
  }
  const entries = array(value, label);
  if (entries.length !== length) {
    reject(`${label} must contain ${length} values`);
  }
  return entries.map((entry, index) => finite(entry, `${label}[${index}]`));
}

function nodeLocalMatrix(record: JsonRecord, label: string): Float32Array {
  if (record["matrix"] !== undefined) {
    if (
      record["translation"] !== undefined ||
      record["rotation"] !== undefined ||
      record["scale"] !== undefined
    ) {
      reject(`${label} cannot combine matrix with TRS`);
    }
    return new Float32Array(
      numericTuple(record["matrix"], 16, [], `${label}.matrix`),
    );
  }
  const translation = numericTuple(
    record["translation"],
    3,
    [0, 0, 0],
    `${label}.translation`,
  );
  const rotation = numericTuple(
    record["rotation"],
    4,
    [0, 0, 0, 1],
    `${label}.rotation`,
  );
  const rotationLength = Math.hypot(...rotation);
  if (Math.abs(rotationLength - 1) > 1e-4) {
    reject(`${label}.rotation must be normalized`);
  }
  const scaleValue = numericTuple(
    record["scale"],
    3,
    [1, 1, 1],
    `${label}.scale`,
  );
  return quaternionMatrix(translation, rotation, scaleValue);
}

function parseNodes(
  root: JsonRecord,
  meshCount: number,
): Readonly<{
  nodes: readonly GlbRigidNodeV1[];
  roots: readonly number[];
  names: ReadonlyMap<string, number>;
}> {
  const rawNodes = array(root["nodes"], "glTF nodes");
  const parentCount = new Array<number>(rawNodes.length).fill(0);
  const names = new Map<string, number>();
  const nodes = rawNodes.map((value, index) => {
    const label = `glTF nodes[${index}]`;
    const record = object(value, label);
    const children = Object.freeze(
      optionalArray(record["children"], `${label}.children`).map(
        (entry, childIndex) => {
          const child = integer(entry, `${label}.children[${childIndex}]`);
          if (child >= rawNodes.length) {
            reject(`${label} references missing child ${child}`);
          }
          parentCount[child] = (parentCount[child] ?? 0) + 1;
          if (parentCount[child]! > 1) {
            reject(`glTF node ${child} has more than one parent`);
          }
          return child;
        },
      ),
    );
    const name = typeof record["name"] === "string" ? record["name"] : null;
    if (name !== null) {
      if (names.has(name)) {
        reject(`duplicate node name: ${name}`);
      }
      names.set(name, index);
    }
    const meshIndex =
      record["mesh"] === undefined
        ? null
        : integer(record["mesh"], `${label}.mesh`);
    if (meshIndex !== null && meshIndex >= meshCount) {
      reject(`${label}.mesh references missing mesh ${meshIndex}`);
    }
    return Object.freeze({
      index,
      name,
      meshIndex,
      children,
      localFromParent: nodeLocalMatrix(record, label),
    });
  });

  const visitState = new Uint8Array(nodes.length);
  const visit = (index: number): void => {
    if (visitState[index] === 1) {
      reject(`node hierarchy contains a cycle at node ${index}`);
    }
    if (visitState[index] === 2) {
      return;
    }
    visitState[index] = 1;
    for (const child of nodes[index]!.children) {
      visit(child);
    }
    visitState[index] = 2;
  };
  for (let index = 0; index < nodes.length; index += 1) {
    visit(index);
  }

  return {
    nodes: Object.freeze(nodes),
    roots: Object.freeze(
      parentCount
        .map((count, index) => (count === 0 ? index : -1))
        .filter((index) => index >= 0),
    ),
    names,
  };
}

function readonlyMap<K, V>(source: Map<K, V>): ReadonlyMap<K, V> {
  return Object.freeze({
    get size(): number {
      return source.size;
    },
    get: (key: K) => source.get(key),
    has: (key: K) => source.has(key),
    entries: () => source.entries(),
    keys: () => source.keys(),
    values: () => source.values(),
    forEach: (
      callback: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
      thisArg?: unknown,
    ) => source.forEach((value, key) => callback.call(thisArg, value, key, source)),
    [Symbol.iterator]: () => source[Symbol.iterator](),
  });
}

export function decodeGlbRigidCpuAssetV1(
  bytes: Uint8Array,
  boundNodeNames: readonly string[],
): GlbRigidCpuAssetV1 {
  inspectGlbV2(bytes);
  assertGlbRuntimePolicyV1(bytes, boundNodeNames);
  const { root, binary } = decodeDocument(bytes);
  const views = parseBufferViews(root);
  const accessors = parseAccessors(root);
  const materials = parseMaterials(root);
  const meshes = parseMeshes(
    root,
    views,
    accessors,
    binary,
    materials.length,
  );
  const nodeResult = parseNodes(root, meshes.length);
  const primitiveCount = meshes.reduce(
    (total, mesh) => total + mesh.primitives.length,
    0,
  );
  const triangleCount = meshes.reduce(
    (total, mesh) =>
      total +
      mesh.primitives.reduce(
        (meshTotal, primitive) => meshTotal + primitive.indices.length / 3,
        0,
      ),
    0,
  );
  return Object.freeze({
    nodes: nodeResult.nodes,
    rootNodeIndices: nodeResult.roots,
    nodeIndexByName: readonlyMap(new Map(nodeResult.names)),
    meshes,
    materials,
    primitiveCount,
    triangleCount,
  });
}
