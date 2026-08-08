import test from "node:test";
import assert from "node:assert/strict";
import {
  createRigidMeshGpuTextureAssetV1,
} from "../.test-dist/render/rigid-mesh-gpu-textures.js";

function textureAsset() {
  return {
    images: [
      { name: "pixel-64", mimeType: "image/png", width: 64, height: 64, bytes: new Uint8Array([1]) },
      { name: "pixel-256", mimeType: "image/png", width: 256, height: 256, bytes: new Uint8Array([2]) },
    ],
    samplers: [
      { minFilter: 9728, magFilter: 9728, wrapS: 33071, wrapT: 33071 },
      { minFilter: 9728, magFilter: 9728, wrapS: 33071, wrapT: 33071 },
    ],
    textures: [
      { name: "small", source: 0, sampler: 0 },
      { name: "large", source: 1, sampler: 1 },
    ],
    materials: [],
    compressedImageBytes: 2,
    decodedTextureBytes: 278_528,
  };
}

function fakeGl({ failUpload = -1 } = {}) {
  let nextId = 1;
  let upload = 0;
  let pendingError = 0;
  const deleted = [];
  const parameterCalls = [];
  const pixelStoreCalls = [];
  const gl = {
    NO_ERROR: 0,
    INVALID_OPERATION: 0x0502,
    TEXTURE_2D: 0x0de1,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_MAG_FILTER: 0x2800,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    UNPACK_FLIP_Y_WEBGL: 0x9240,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
    RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401,
    createTexture() {
      return { id: nextId++ };
    },
    bindTexture() {},
    pixelStorei(pname, value) {
      pixelStoreCalls.push([pname, value]);
    },
    texParameteri(target, pname, value) {
      parameterCalls.push([target, pname, value]);
    },
    texImage2D() {
      upload += 1;
      if (upload === failUpload) {
        pendingError = 0x0502;
      }
    },
    getError() {
      const value = pendingError;
      pendingError = 0;
      return value;
    },
    deleteTexture(texture) {
      deleted.push(texture.id);
    },
  };
  return { gl, deleted, parameterCalls, pixelStoreCalls };
}

function fakeDecoder(image) {
  let released = false;
  return Promise.resolve({
    source: { image: image.name },
    width: image.width,
    height: image.height,
    release() {
      assert.equal(released, false, "decoded image released exactly once");
      released = true;
    },
  });
}

test("bounded vehicle textures upload with exact WebGL1 state and dispose once", async () => {
  const fixture = fakeGl();
  const gpu = await createRigidMeshGpuTextureAssetV1(
    fixture.gl,
    textureAsset(),
    { decoder: fakeDecoder },
  );
  assert.equal(gpu.textures.length, 2);
  assert.equal(gpu.gpuByteLength, 278_528);
  assert.ok(fixture.pixelStoreCalls.every(([, value]) => value === 0));
  assert.ok(fixture.parameterCalls.every(([, , value]) =>
    value === 9728 || value === 33071
  ));
  gpu.dispose();
  assert.equal(gpu.disposed, true);
  assert.deepEqual(fixture.deleted, [2, 1]);
  gpu.dispose();
  assert.deepEqual(fixture.deleted, [2, 1]);
});

test("texture upload rollback deletes every allocation after a WebGL error", async () => {
  const fixture = fakeGl({ failUpload: 2 });
  await assert.rejects(
    () => createRigidMeshGpuTextureAssetV1(
      fixture.gl,
      textureAsset(),
      { decoder: fakeDecoder },
    ),
    /WebGL error 0x502/,
  );
  assert.deepEqual(fixture.deleted, [2, 1]);
});

test("untextured vehicle resources retain the old zero-GL texture path", async () => {
  const gpu = await createRigidMeshGpuTextureAssetV1(
    {},
    {
      images: [],
      samplers: [],
      textures: [],
      materials: [],
      compressedImageBytes: 0,
      decodedTextureBytes: 0,
    },
  );
  assert.equal(gpu.gpuByteLength, 0);
  assert.deepEqual(gpu.textures, []);
  gpu.dispose();
  gpu.dispose();
  assert.equal(gpu.disposed, true);
});
