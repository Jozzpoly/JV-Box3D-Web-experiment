import test from "node:test";
import assert from "node:assert/strict";
import { createVehicleVisualGpuTexturesV1 } from "../.test-dist/render/vehicle-visual-texture-gpu.js";

function cpuAsset() {
  return {
    nodes: [], rootNodeIndices: [], nodeIndexByName: new Map(), meshes: [], materials: [],
    images: [
      { name: null, mimeType: "image/png", bytes: new Uint8Array([1]), width: 64, height: 64, decodedRgbaBytes: 16384 },
      { name: null, mimeType: "image/png", bytes: new Uint8Array([2]), width: 256, height: 256, decodedRgbaBytes: 262144 },
    ],
    samplers: [
      { name: null, magFilter: 9728, minFilter: 9728, wrapS: 33071, wrapT: 33071 },
      { name: null, magFilter: 9728, minFilter: 9728, wrapS: 33071, wrapT: 33071 },
    ],
    textures: [
      { name: "small", sourceImageIndex: 0, samplerIndex: 0 },
      { name: "large", sourceImageIndex: 1, samplerIndex: 1 },
    ],
    primitiveCount: 0, triangleCount: 0,
  };
}

function fakeGl({ failCreateAt = 0 } = {}) {
  let created = 0;
  let bound = null;
  const calls = { deleted: [], params: [], flips: [], uploads: [] };
  const gl = {
    TEXTURE_2D: 0x0de1, TEXTURE_MAG_FILTER: 0x2800, TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_WRAP_S: 0x2802, TEXTURE_WRAP_T: 0x2803, NEAREST: 9728,
    CLAMP_TO_EDGE: 33071, UNPACK_FLIP_Y_WEBGL: 0x9240, RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401, NO_ERROR: 0,
    createTexture() { created += 1; return created === failCreateAt ? null : { id: created }; },
    bindTexture(_target, texture) { bound = texture; },
    pixelStorei(_name, value) { calls.flips.push(value); },
    texParameteri(_target, name, value) { calls.params.push([bound?.id ?? null, name, value]); },
    texImage2D() { calls.uploads.push(bound?.id ?? null); },
    getError() { return 0; },
    deleteTexture(texture) { calls.deleted.push(texture.id); },
  };
  return { gl, calls };
}

const decoder = async (image) => ({
  source: {}, width: image.width, height: image.height, close() {},
});

test("pixel textures upload transactionally with exact sampler state", async () => {
  const fixture = fakeGl();
  const resource = await createVehicleVisualGpuTexturesV1(fixture.gl, cpuAsset(), { imageDecoder: decoder });
  assert.equal(resource.textures.length, 2);
  assert.equal(resource.gpuByteLength, 278528);
  assert.deepEqual(fixture.calls.flips, [0, 0]);
  assert.equal(fixture.calls.uploads.length, 2);
  assert.ok(fixture.calls.params.every((entry) => entry[2] === 9728 || entry[2] === 33071));
  resource.dispose();
  assert.deepEqual(fixture.calls.deleted, [2, 1]);
  resource.dispose();
  assert.deepEqual(fixture.calls.deleted, [2, 1]);
});

test("partial texture allocation failure releases prior GPU ownership", async () => {
  const fixture = fakeGl({ failCreateAt: 2 });
  await assert.rejects(
    () => createVehicleVisualGpuTexturesV1(fixture.gl, cpuAsset(), { imageDecoder: decoder }),
    /texture 1 allocation failed/,
  );
  assert.deepEqual(fixture.calls.deleted, [1]);
});
