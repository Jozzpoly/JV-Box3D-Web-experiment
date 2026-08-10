import { createHash } from "node:crypto";

const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;

function align4(value) {
  return Math.ceil(value / 4) * 4;
}

function paddedJson(value) {
  const raw = new TextEncoder().encode(JSON.stringify(value));
  const bytes = new Uint8Array(align4(raw.byteLength));
  bytes.fill(0x20);
  bytes.set(raw);
  return bytes;
}

function float32LittleEndian(values) {
  const bytes = new Uint8Array(values.length * 4);
  const view = new DataView(bytes.buffer);
  values.forEach((value, index) => view.setFloat32(index * 4, value, true));
  return bytes;
}

function uint16LittleEndian(values) {
  const bytes = new Uint8Array(values.length * 2);
  const view = new DataView(bytes.buffer);
  values.forEach((value, index) => view.setUint16(index * 2, value, true));
  return bytes;
}

function boxGeometry(halfX, halfY, halfZ) {
  return {
    positions: [
      -halfX, -halfY, -halfZ,
      halfX, -halfY, -halfZ,
      halfX, halfY, -halfZ,
      -halfX, halfY, -halfZ,
      -halfX, -halfY, halfZ,
      halfX, -halfY, halfZ,
      halfX, halfY, halfZ,
      -halfX, halfY, halfZ,
    ],
    positionMin: [-halfX, -halfY, -halfZ],
    positionMax: [halfX, halfY, halfZ],
    indices: [
      0, 1, 2, 0, 2, 3,
      4, 6, 5, 4, 7, 6,
      0, 4, 5, 0, 5, 1,
      3, 2, 6, 3, 6, 7,
      1, 5, 6, 1, 6, 2,
      0, 3, 7, 0, 7, 4,
    ],
  };
}

function appendGeometry(binaryParts, geometry) {
  const positionBytes = float32LittleEndian(geometry.positions);
  const positionOffset = binaryParts.byteLength;
  binaryParts.chunks.push(positionBytes);
  binaryParts.byteLength += positionBytes.byteLength;
  const indexOffset = binaryParts.byteLength;
  const indexBytes = uint16LittleEndian(geometry.indices);
  binaryParts.chunks.push(indexBytes);
  binaryParts.byteLength += indexBytes.byteLength;
  return {
    positionOffset,
    positionByteLength: positionBytes.byteLength,
    positionMin: geometry.positionMin,
    positionMax: geometry.positionMax,
    vertexCount: geometry.positions.length / 3,
    indexOffset,
    indexByteLength: indexBytes.byteLength,
    indexCount: geometry.indices.length,
  };
}

function combineBinary(parts) {
  const bytes = new Uint8Array(align4(parts.byteLength));
  let offset = 0;
  for (const chunk of parts.chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function nodeName(id) {
  return `JV_${id.replaceAll(".", "_").replaceAll("-", "_")}`;
}

function identityTransform() {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scale: [1, 1, 1],
  };
}

export function buildTinyVehicleVisualFixture({ partIds, segmentIds }) {
  const binaryParts = { chunks: [], byteLength: 0 };
  const partGeometry = appendGeometry(
    binaryParts,
    boxGeometry(0.09, 0.09, 0.09),
  );
  const segmentGeometry = appendGeometry(
    binaryParts,
    boxGeometry(0.035, 0.5, 0.035),
  );
  const binary = combineBinary(binaryParts);

  const bufferViews = [];
  const accessors = [];
  const geometryRecords = [partGeometry, segmentGeometry].map((geometry) => {
    const positionView = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: geometry.positionOffset,
      byteLength: geometry.positionByteLength,
      target: 34962,
    });
    const indexView = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: geometry.indexOffset,
      byteLength: geometry.indexByteLength,
      target: 34963,
    });
    const positionAccessor = accessors.length;
    accessors.push({
      bufferView: positionView,
      componentType: 5126,
      count: geometry.vertexCount,
      type: "VEC3",
      min: geometry.positionMin,
      max: geometry.positionMax,
    });
    const indexAccessor = accessors.length;
    accessors.push({
      bufferView: indexView,
      componentType: 5123,
      count: geometry.indexCount,
      type: "SCALAR",
    });
    return { positionAccessor, indexAccessor };
  });

  const bindings = [
    ...partIds.map((partId) => ({
      bindingId: `bind.${partId}`,
      nodeName: nodeName(partId),
      source: { kind: "PART", partId },
      localFromSource: identityTransform(),
    })),
    ...segmentIds.map((segmentId) => ({
      bindingId: `bind.${segmentId}`,
      nodeName: nodeName(segmentId),
      source: {
        kind: "SEGMENT_STRETCH",
        segmentId,
        axis: "+Y",
        referenceLengthMeters: 1,
      },
      localFromSource: identityTransform(),
    })),
  ];

  const nodes = [
    ...partIds.map((partId) => ({ name: nodeName(partId), mesh: 0 })),
    ...segmentIds.map((segmentId) => ({ name: nodeName(segmentId), mesh: 1 })),
  ];
  const root = {
    asset: {
      version: "2.0",
      generator: "JV Web deterministic tiny vehicle rig fixture v1",
    },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, index) => index) }],
    nodes,
    buffers: [{ byteLength: binaryParts.byteLength }],
    bufferViews,
    accessors,
    materials: [
      {
        name: "JV Tiny Parts",
        pbrMetallicRoughness: {
          baseColorFactor: [0.18, 0.52, 0.95, 1],
        },
      },
      {
        name: "JV Tiny Segments",
        pbrMetallicRoughness: {
          baseColorFactor: [0.98, 0.58, 0.12, 1],
        },
      },
    ],
    meshes: geometryRecords.map((geometry, index) => ({
      name: index === 0 ? "JV_TinyPartMesh" : "JV_TinySegmentMesh",
      primitives: [
        {
          attributes: { POSITION: geometry.positionAccessor },
          indices: geometry.indexAccessor,
          material: index,
          mode: 4,
        },
      ],
    })),
  };

  const json = paddedJson(root);
  const totalLength = 12 + 8 + json.byteLength + 8 + binary.byteLength;
  const glb = new Uint8Array(totalLength);
  const view = new DataView(glb.buffer);
  view.setUint32(0, GLB_MAGIC, true);
  view.setUint32(4, GLB_VERSION, true);
  view.setUint32(8, totalLength, true);
  view.setUint32(12, json.byteLength, true);
  view.setUint32(16, GLB_JSON_CHUNK, true);
  glb.set(json, 20);
  const binHeader = 20 + json.byteLength;
  view.setUint32(binHeader, binary.byteLength, true);
  view.setUint32(binHeader + 4, GLB_BIN_CHUNK, true);
  glb.set(binary, binHeader + 8);

  const sha256 = createHash("sha256").update(glb).digest("hex");
  const visualPackage = {
    format: "jv-web-vehicle-visual-package",
    schemaVersion: 1,
    id: "m6-tiny-rig-proof-v1",
    displayName: "M6 Tiny Rig Proof V1",
    vehicleFamily: "M6",
    rigProfile: "M6_FULL_RIG_V1",
    units: "meter",
    axes: { forward: "+X", up: "+Y", right: "+Z" },
    asset: {
      kind: "GLB",
      url: "models/m6-rig-proof.glb",
      sha256,
      byteLength: glb.byteLength,
    },
    bindings,
  };

  return Object.freeze({
    glb,
    visualPackage: Object.freeze(visualPackage),
    manifestText: `${JSON.stringify(visualPackage, null, 2)}\n`,
  });
}
