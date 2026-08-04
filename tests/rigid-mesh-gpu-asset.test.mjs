import test from "node:test";
import assert from "node:assert/strict";
import { createRigidMeshGpuAssetV1 } from "../.test-dist/render/rigid-mesh-gpu-asset.js";

function cpuAsset({ normals = false, texcoord0 = false } = {}) {
  return {
    nodes: [],
    rootNodeIndices: [],
    nodeIndexByName: new Map(),
    materials: [],
    primitiveCount: 1,
    triangleCount: 1,
    meshes: [
      {
        name: "fixture",
        primitives: [
          {
            positions: new Float32Array([
              0, 0, 0,
              1, 0, 0,
              0, 1, 0,
            ]),
            normals: normals
              ? new Float32Array([
                  0, 0, 1,
                  0, 0, 1,
                  0, 0, 1,
                ])
              : null,
            texcoord0: texcoord0
              ? new Float32Array([0, 0, 1, 0, 0, 1])
              : null,
            indices: new Uint16Array([0, 1, 2]),
            materialIndex: null,
          },
        ],
      },
    ],
  };
}

function fakeGl({ failAllocationAt = -1, errorAtUpload = -1 } = {}) {
  let allocation = 0;
  let upload = 0;
  let nextId = 1;
  const deleted = [];
  const uploads = [];
  const gl = {
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88e4,
    NO_ERROR: 0,
    createBuffer() {
      allocation += 1;
      if (allocation === failAllocationAt) {
        return null;
      }
      return { id: nextId++ };
    },
    bindBuffer() {},
    bufferData(target, data, usage) {
      upload += 1;
      uploads.push({ target, bytes: data.byteLength, usage });
    },
    getError() {
      return upload === errorAtUpload ? 0x0505 : 0;
    },
    deleteBuffer(buffer) {
      deleted.push(buffer.id);
    },
  };
  return {
    gl,
    deleted,
    uploads,
    get allocations() {
      return allocation;
    },
  };
}

test("GPU asset owns optional vertex streams and disposes in reverse once", () => {
  const fixture = fakeGl();
  const asset = createRigidMeshGpuAssetV1(
    fixture.gl,
    cpuAsset({ normals: true, texcoord0: true }),
  );

  assert.equal(asset.meshes.length, 1);
  assert.equal(asset.meshes[0].primitives[0].indexCount, 3);
  assert.equal(fixture.uploads.length, 4);
  assert.equal(asset.gpuByteLength, 36 + 36 + 24 + 6);
  assert.equal(asset.disposed, false);

  asset.dispose();
  assert.equal(asset.disposed, true);
  assert.deepEqual(fixture.deleted, [4, 3, 2, 1]);
  asset.dispose();
  assert.deepEqual(fixture.deleted, [4, 3, 2, 1]);
});

test("SharedArrayBuffer data is rejected before any GPU allocation", () => {
  const fixture = fakeGl();
  const input = cpuAsset();
  input.meshes[0].primitives[0].positions = new Float32Array(
    new SharedArrayBuffer(9 * Float32Array.BYTES_PER_ELEMENT),
  );

  assert.throws(
    () => createRigidMeshGpuAssetV1(fixture.gl, input),
    /POSITION must be backed by ArrayBuffer before WebGL upload/,
  );
  assert.equal(fixture.allocations, 0);
  assert.equal(fixture.uploads.length, 0);
  assert.deepEqual(fixture.deleted, []);
});

test("buffer allocation failure rolls back every earlier allocation", () => {
  const fixture = fakeGl({ failAllocationAt: 2 });
  assert.throws(
    () => createRigidMeshGpuAssetV1(fixture.gl, cpuAsset()),
    /allocation failed/,
  );
  assert.deepEqual(fixture.deleted, [1]);
});

test("WebGL upload error rolls back the just-created and earlier buffers", () => {
  const fixture = fakeGl({ errorAtUpload: 2 });
  assert.throws(
    () => createRigidMeshGpuAssetV1(fixture.gl, cpuAsset()),
    /WebGL error 0x505/,
  );
  assert.deepEqual(fixture.deleted, [2, 1]);
});
