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
      source: { kind: "SEGMENT_STRETCH", segmentId, axis: "+Y" },
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

export function buildGlb(jsonOverrides = {}, binary = new Uint8Array([1, 2, 3, 4])) {
  const root = {
    asset: { version: "2.0", generator: "JV visual test fixture" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: completeVisualBindings().map((binding) => ({
      name: binding.nodeName,
    })),
    meshes: [{ primitives: [] }],
    buffers: [{ byteLength: binary.byteLength }],
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
