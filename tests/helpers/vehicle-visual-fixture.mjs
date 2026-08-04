import { createHash } from "node:crypto";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../../.test-dist/vehicle/m6/m6-visual-contract.js";

export const IDENTITY_VISUAL_TRANSFORM = Object.freeze({
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
});

export const VALID_TRIANGLE_PRIMITIVE = Object.freeze({
  attributes: Object.freeze({ POSITION: 0 }),
  indices: 1,
  mode: 4,
});

export function visualNodeName(id) {
  return `JV_${id.replaceAll(".", "_").replaceAll("-", "_")}`;
}

export function completeVisualBindings() {
  return [
    ...M6_VISUAL_PART_IDS.map((partId) => ({
      bindingId: `bind.${partId}`,
      nodeName: visualNodeName(partId),
      source: { kind: "PART", partId },
      localFromSource: IDENTITY_VISUAL_TRANSFORM,
    })),
    ...M6_VISUAL_SEGMENT_IDS.map((segmentId) => ({
      bindingId: `bind.${segmentId}`,
      nodeName: visualNodeName(segmentId),
      source: {
        kind: "SEGMENT_STRETCH",
        segmentId,
        axis: "+Y",
        referenceLengthMeters: 1,
      },
      localFromSource: IDENTITY_VISUAL_TRANSFORM,
    })),
  ];
}

function paddedJsonBytes(value) {
  const raw = new TextEncoder().encode(JSON.stringify(value));
  const length = Math.ceil(raw.byteLength / 4) * 4;
  const padded = new Uint8Array(length);
  padded.fill(0x20);
  padded.set(raw);
  return padded;
}

function triangleBinary() {
  const bytes = new Uint8Array(42);
  const positions = new Float32Array(bytes.buffer, 0, 9);
  positions.set([
    -0.5, 0, 0,
    0.5, 0, 0,
    0, 1, 0,
  ]);
  const indices = new Uint16Array(bytes.buffer, 36, 3);
  indices.set([0, 1, 2]);
  return bytes;
}

export function validTriangleGeometryJson(bufferByteLength = 42) {
  return {
    meshes: [{ primitives: [{ ...VALID_TRIANGLE_PRIMITIVE }] }],
    buffers: [{ byteLength: bufferByteLength }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 36, byteLength: 6, target: 34963 },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
        min: [-0.5, 0, 0],
        max: [0.5, 1, 0],
      },
      {
        bufferView: 1,
        componentType: 5123,
        count: 3,
        type: "SCALAR",
      },
    ],
  };
}

export function buildGlb(jsonOverrides = {}, binary = triangleBinary()) {
  const bindings = completeVisualBindings();
  const root = {
    asset: { version: "2.0", generator: "JV visual test fixture" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: bindings.map((binding, index) => ({
      name: binding.nodeName,
      ...(index === 0 ? { mesh: 0 } : {}),
    })),
    ...validTriangleGeometryJson(binary.byteLength),
    ...jsonOverrides,
  };
  const json = paddedJsonBytes(root);
  const binaryLength = Math.ceil(binary.byteLength / 4) * 4;
  const paddedBinary = new Uint8Array(binaryLength);
  paddedBinary.set(binary);
  const totalLength = 12 + 8 + json.byteLength + 8 + paddedBinary.byteLength;
  const bytes = new Uint8Array(totalLength);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, totalLength, true);
  view.setUint32(12, json.byteLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.set(json, 20);
  const binHeader = 20 + json.byteLength;
  view.setUint32(binHeader, paddedBinary.byteLength, true);
  view.setUint32(binHeader + 4, 0x004e4942, true);
  bytes.set(paddedBinary, binHeader + 8);
  return bytes;
}

export function packageForGlb(bytes, overrides = {}) {
  return {
    format: "jv-web-vehicle-visual-package",
    schemaVersion: 1,
    id: "m6-demonstrator-full-rig",
    displayName: "M6 Demonstrator Full Rig",
    vehicleFamily: "M6",
    rigProfile: "M6_FULL_RIG_V1",
    units: "meter",
    axes: { forward: "+X", up: "+Y", right: "+Z" },
    asset: {
      kind: "GLB",
      url: "models/m6-demonstrator.glb",
      sha256: createHash("sha256").update(bytes).digest("hex"),
      byteLength: bytes.byteLength,
    },
    bindings: completeVisualBindings(),
    ...overrides,
  };
}
