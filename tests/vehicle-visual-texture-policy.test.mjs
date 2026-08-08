import test from "node:test";
import assert from "node:assert/strict";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import {
  assertGlbRigidTexturePolicyV1,
  decodeGlbRigidTextureAssetV1,
} from "../.test-dist/visual/glb-rigid-texture-decoder.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import { buildGlb, packageForGlb } from "./helpers/vehicle-visual-fixture.mjs";

function exactTextureFixture() {
  const binary = new Uint8Array(92);
  new Float32Array(binary.buffer, 0, 9).set([
    -0.5, 0, 0,
    0.5, 0, 0,
    0, 1, 0,
  ]);
  new Uint16Array(binary.buffer, 36, 3).set([0, 1, 2]);
  new Float32Array(binary.buffer, 44, 6).set([
    0, 0,
    1, 0,
    0.5, 1,
  ]);
  binary.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 68);
  const png = new DataView(binary.buffer, 68, 24);
  png.setUint32(8, 13, false);
  binary.set([0x49, 0x48, 0x44, 0x52], 80);
  png.setUint32(16, 1, false);
  png.setUint32(20, 1, false);

  return buildGlb({
    meshes: [{
      primitives: [{
        attributes: { POSITION: 0, TEXCOORD_0: 2 },
        indices: 1,
        material: 0,
        mode: 4,
      }],
    }],
    buffers: [{ byteLength: binary.byteLength }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 36, byteLength: 6, target: 34963 },
      { buffer: 0, byteOffset: 44, byteLength: 24, target: 34962 },
      { buffer: 0, byteOffset: 68, byteLength: 24 },
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
      { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
      { bufferView: 2, componentType: 5126, count: 3, type: "VEC2" },
    ],
    images: [{ name: "pixel", bufferView: 3, mimeType: "image/png" }],
    samplers: [{ magFilter: 9728, minFilter: 9728, wrapS: 33071, wrapT: 33071 }],
    textures: [{ name: "pixel", sampler: 0, source: 0 }],
    materials: [{
      name: "pixel-mask",
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        baseColorTexture: { index: 0 },
        metallicFactor: 0,
        roughnessFactor: 1,
      },
      alphaMode: "MASK",
      alphaCutoff: 0.05,
      doubleSided: true,
    }],
  }, binary);
}

function mutateAscii(bytes, from, to) {
  assert.equal(from.length, to.length, "test mutation must preserve GLB byte length");
  const result = bytes.slice();
  const source = Buffer.from(from, "utf8");
  const replacement = Buffer.from(to, "utf8");
  const index = Buffer.from(result.buffer, result.byteOffset, result.byteLength).indexOf(source);
  assert.notEqual(index, -1, `missing GLB JSON test token: ${from}`);
  result.set(replacement, index);
  return result;
}

test("bounded embedded PNG + pixel sampler subset passes the executable asset gate", async () => {
  const bytes = exactTextureFixture();
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  const receipt = await validateVehicleVisualAssetV1(visual, bytes, null);
  assert.deepEqual(receipt.texturePolicy, {
    imageCount: 1,
    textureCount: 1,
    compressedImageBytes: 24,
    decodedTextureBytes: 4,
  });
  const decoded = decodeGlbRigidTextureAssetV1(bytes);
  assert.deepEqual(decoded.images.map((image) => [image.width, image.height]), [[1, 1]]);
  assert.deepEqual(assertGlbRigidTexturePolicyV1(bytes), receipt.texturePolicy);
});

test("sampler drift away from NEAREST is rejected", () => {
  const mutated = mutateAscii(exactTextureFixture(), '"magFilter":9728', '"magFilter":9729');
  assert.throws(
    () => assertGlbRigidTexturePolicyV1(mutated),
    /NEAREST minification and magnification/,
  );
});

test("MASK alpha cutoff drift is rejected", () => {
  const mutated = mutateAscii(exactTextureFixture(), '"alphaCutoff":0.05', '"alphaCutoff":0.06');
  assert.throws(
    () => assertGlbRigidTexturePolicyV1(mutated),
    /alphaCutoff must be exactly 0\.05/,
  );
});
