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
  const bytes = new Uint8Array(values.length * Float32Array.BYTES_PER_ELEMENT);
  const view = new DataView(bytes.buffer);
  values.forEach((value, index) =>
    view.setFloat32(index * Float32Array.BYTES_PER_ELEMENT, value, true),
  );
  return bytes;
}

function uint16LittleEndian(values) {
  const bytes = new Uint8Array(values.length * Uint16Array.BYTES_PER_ELEMENT);
  const view = new DataView(bytes.buffer);
  values.forEach((value, index) =>
    view.setUint16(index * Uint16Array.BYTES_PER_ELEMENT, value, true),
  );
  return bytes;
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalized(value) {
  const length = Math.hypot(...value);
  if (!(length > 1e-12)) {
    throw new Error("Lit-normal fixture face is degenerate.");
  }
  return value.map((component) => component / length);
}

function appendFlatQuad(geometry, inputCorners) {
  let corners = inputCorners;
  let normal = normalized(
    cross(subtract(corners[1], corners[0]), subtract(corners[2], corners[0])),
  );
  const centroid = [0, 1, 2].map(
    (axis) => corners.reduce((sum, point) => sum + point[axis], 0) / 4,
  );
  if (dot(normal, centroid) < 0) {
    corners = [corners[0], corners[3], corners[2], corners[1]];
    normal = normalized(
      cross(
        subtract(corners[1], corners[0]),
        subtract(corners[2], corners[0]),
      ),
    );
  }

  const base = geometry.positions.length / 3;
  for (const corner of corners) {
    geometry.positions.push(...corner);
    geometry.normals.push(...normal);
  }
  geometry.indices.push(
    base,
    base + 1,
    base + 2,
    base,
    base + 2,
    base + 3,
  );
}

function bounds(positions) {
  const minimum = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const maximum = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  for (let offset = 0; offset < positions.length; offset += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      minimum[axis] = Math.min(minimum[axis], positions[offset + axis]);
      maximum[axis] = Math.max(maximum[axis], positions[offset + axis]);
    }
  }
  return { minimum, maximum };
}

function boxGeometry(halfX, halfY, halfZ) {
  const geometry = { positions: [], normals: [], indices: [] };
  const x0 = -halfX;
  const x1 = halfX;
  const y0 = -halfY;
  const y1 = halfY;
  const z0 = -halfZ;
  const z1 = halfZ;
  appendFlatQuad(geometry, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]);
  appendFlatQuad(geometry, [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]]);
  appendFlatQuad(geometry, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]]);
  appendFlatQuad(geometry, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]);
  appendFlatQuad(geometry, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]]);
  appendFlatQuad(geometry, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]);
  return { ...geometry, ...bounds(geometry.positions) };
}

function taperedSegmentGeometry() {
  const geometry = { positions: [], normals: [], indices: [] };
  const halfY = 0.5;
  const bottomX = 0.065;
  const bottomZ = 0.045;
  const topX = 0.028;
  const topZ = 0.022;
  const b0 = [-bottomX, -halfY, -bottomZ];
  const b1 = [bottomX, -halfY, -bottomZ];
  const b2 = [bottomX, -halfY, bottomZ];
  const b3 = [-bottomX, -halfY, bottomZ];
  const t0 = [-topX, halfY, -topZ];
  const t1 = [topX, halfY, -topZ];
  const t2 = [topX, halfY, topZ];
  const t3 = [-topX, halfY, topZ];

  appendFlatQuad(geometry, [b0, b1, b2, b3]);
  appendFlatQuad(geometry, [t0, t1, t2, t3]);
  appendFlatQuad(geometry, [b0, b1, t1, t0]);
  appendFlatQuad(geometry, [b1, b2, t2, t1]);
  appendFlatQuad(geometry, [b2, b3, t3, t2]);
  appendFlatQuad(geometry, [b3, b0, t0, t3]);
  return { ...geometry, ...bounds(geometry.positions) };
}

function appendAligned(binaryParts, bytes) {
  const alignedOffset = align4(binaryParts.byteLength);
  if (alignedOffset > binaryParts.byteLength) {
    const padding = new Uint8Array(alignedOffset - binaryParts.byteLength);
    binaryParts.chunks.push(padding);
    binaryParts.byteLength = alignedOffset;
  }
  const offset = binaryParts.byteLength;
  binaryParts.chunks.push(bytes);
  binaryParts.byteLength += bytes.byteLength;
  return offset;
}

function appendGeometry(binaryParts, geometry) {
  const positionBytes = float32LittleEndian(geometry.positions);
  const positionOffset = appendAligned(binaryParts, positionBytes);
  const normalBytes = float32LittleEndian(geometry.normals);
  const normalOffset = appendAligned(binaryParts, normalBytes);
  const indexBytes = uint16LittleEndian(geometry.indices);
  const indexOffset = appendAligned(binaryParts, indexBytes);
  return {
    positionOffset,
    positionByteLength: positionBytes.byteLength,
    positionMin: geometry.minimum,
    positionMax: geometry.maximum,
    normalOffset,
    normalByteLength: normalBytes.byteLength,
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

export function buildLitNormalVehicleVisualFixture({ partIds, segmentIds }) {
  const binaryParts = { chunks: [], byteLength: 0 };
  const partGeometry = appendGeometry(
    binaryParts,
    boxGeometry(0.11, 0.075, 0.085),
  );
  const segmentGeometry = appendGeometry(
    binaryParts,
    taperedSegmentGeometry(),
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
    const normalView = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: geometry.normalOffset,
      byteLength: geometry.normalByteLength,
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
    const normalAccessor = accessors.length;
    accessors.push({
      bufferView: normalView,
      componentType: 5126,
      count: geometry.vertexCount,
      type: "VEC3",
    });
    const indexAccessor = accessors.length;
    accessors.push({
      bufferView: indexView,
      componentType: 5123,
      count: geometry.indexCount,
      type: "SCALAR",
    });
    return { positionAccessor, normalAccessor, indexAccessor };
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
      generator: "JV Web deterministic lit-normal vehicle fixture v1",
    },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, index) => index) }],
    nodes,
    buffers: [{ byteLength: binaryParts.byteLength }],
    bufferViews,
    accessors,
    materials: [
      {
        name: "JV Lit Parts",
        pbrMetallicRoughness: {
          baseColorFactor: [0.14, 0.42, 0.92, 1],
        },
      },
      {
        name: "JV Lit Tapered Segments",
        pbrMetallicRoughness: {
          baseColorFactor: [0.96, 0.44, 0.08, 1],
        },
        doubleSided: true,
      },
    ],
    meshes: geometryRecords.map((geometry, index) => ({
      name: index === 0 ? "JV_LitPartMesh" : "JV_LitTaperedSegmentMesh",
      primitives: [
        {
          attributes: {
            POSITION: geometry.positionAccessor,
            NORMAL: geometry.normalAccessor,
          },
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
    id: "m6-lit-normal-rig-proof-v1",
    displayName: "M6 Lit Normal Rig Proof V1",
    vehicleFamily: "M6",
    rigProfile: "M6_FULL_RIG_V1",
    units: "meter",
    axes: { forward: "+X", up: "+Y", right: "+Z" },
    asset: {
      kind: "GLB",
      url: "models/m6-lit-normal-proof.glb",
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
