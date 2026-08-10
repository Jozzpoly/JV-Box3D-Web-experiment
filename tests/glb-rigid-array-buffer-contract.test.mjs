import test from "node:test";
import assert from "node:assert/strict";
import { assertGlbRigidCpuAssetArrayBufferBackedV1 } from "../.test-dist/visual/glb-rigid-array-buffer-contract.js";

function arrayBufferAsset() {
  return {
    nodes: [
      {
        index: 0,
        name: "JV_TestRoot",
        meshIndex: 0,
        children: [],
        localFromParent: new Float32Array(16),
      },
    ],
    rootNodeIndices: [0],
    nodeIndexByName: new Map([["JV_TestRoot", 0]]),
    meshes: [
      {
        name: "fixture",
        primitives: [
          {
            positions: new Float32Array(9),
            normals: new Float32Array(9),
            texcoord0: new Float32Array(6),
            indices: new Uint16Array(3),
            materialIndex: null,
          },
        ],
      },
    ],
    materials: [],
    primitiveCount: 1,
    triangleCount: 1,
  };
}

function sharedFloat32(length) {
  return new Float32Array(
    new SharedArrayBuffer(length * Float32Array.BYTES_PER_ELEMENT),
  );
}

function sharedUint16(length) {
  return new Uint16Array(
    new SharedArrayBuffer(length * Uint16Array.BYTES_PER_ELEMENT),
  );
}

test("ordinary decoder-style ArrayBuffer views satisfy the GPU boundary", () => {
  assert.doesNotThrow(() =>
    assertGlbRigidCpuAssetArrayBufferBackedV1(arrayBufferAsset()),
  );
});

for (const [label, mutate] of [
  ["localFromParent", (asset) => {
    asset.nodes[0].localFromParent = sharedFloat32(16);
  }],
  ["POSITION", (asset) => {
    asset.meshes[0].primitives[0].positions = sharedFloat32(9);
  }],
  ["NORMAL", (asset) => {
    asset.meshes[0].primitives[0].normals = sharedFloat32(9);
  }],
  ["TEXCOORD_0", (asset) => {
    asset.meshes[0].primitives[0].texcoord0 = sharedFloat32(6);
  }],
  ["indices", (asset) => {
    asset.meshes[0].primitives[0].indices = sharedUint16(3);
  }],
]) {
  test(`SharedArrayBuffer-backed ${label} fails closed`, () => {
    const asset = arrayBufferAsset();
    mutate(asset);
    assert.throws(
      () => assertGlbRigidCpuAssetArrayBufferBackedV1(asset),
      new RegExp(`${label} must be backed by ArrayBuffer`),
    );
  });
}
