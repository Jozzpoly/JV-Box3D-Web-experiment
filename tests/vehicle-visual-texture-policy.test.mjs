import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";

const MANIFEST = "public/vehicles/m6-owner-r1/m6-owner-rigid-r1.visual.json";
const GLB = "public/vehicles/m6-owner-r1/models/m6-owner-rigid-r1.glb";

function mutateGlbJson(bytes, mutate) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const jsonLength = view.getUint32(12, true);
  const rawJson = bytes.subarray(20, 20 + jsonLength);
  const document = JSON.parse(new TextDecoder().decode(rawJson).trimEnd());
  mutate(document);
  const encoded = new TextEncoder().encode(JSON.stringify(document));
  const paddedLength = Math.ceil(encoded.byteLength / 4) * 4;
  const paddedJson = new Uint8Array(paddedLength);
  paddedJson.fill(0x20);
  paddedJson.set(encoded);
  const oldBinHeader = 20 + jsonLength;
  const binLength = view.getUint32(oldBinHeader, true);
  const binary = bytes.subarray(oldBinHeader + 8, oldBinHeader + 8 + binLength);
  const totalLength = 12 + 8 + paddedJson.byteLength + 8 + binary.byteLength;
  const output = new Uint8Array(totalLength);
  const out = new DataView(output.buffer);
  out.setUint32(0, 0x46546c67, true);
  out.setUint32(4, 2, true);
  out.setUint32(8, totalLength, true);
  out.setUint32(12, paddedJson.byteLength, true);
  out.setUint32(16, 0x4e4f534a, true);
  output.set(paddedJson, 20);
  const binHeader = 20 + paddedJson.byteLength;
  out.setUint32(binHeader, binary.byteLength, true);
  out.setUint32(binHeader + 4, 0x004e4942, true);
  output.set(binary, binHeader + 8);
  return output;
}

async function fixture() {
  return {
    manifest: JSON.parse(await readFile(MANIFEST, "utf8")),
    glb: new Uint8Array(await readFile(GLB)),
  };
}

test("exact owner embedded PNG texture asset passes V1", async () => {
  const { manifest, glb } = await fixture();
  const visual = validateVehicleVisualPackageV1(manifest);
  await assert.doesNotReject(() => validateVehicleVisualAssetV1(visual, glb, null));
});

test("BLEND, linear filtering, non-PNG and TEXCOORD_1 fail closed", async () => {
  const { manifest, glb } = await fixture();
  for (const [mutate, expected] of [
    [(doc) => { doc.materials[0].alphaMode = "BLEND"; }, /alphaMode must be OPAQUE or MASK/],
    [(doc) => { doc.samplers[0].minFilter = 9729; }, /NEAREST filtering/],
    [(doc) => { doc.images[0].mimeType = "image/jpeg"; }, /mimeType must equal image\/png/],
    [(doc) => { doc.materials[0].pbrMetallicRoughness.baseColorTexture.texCoord = 1; }, /texCoord must equal 0/],
  ]) {
    const mutated = mutateGlbJson(glb, mutate);
    const mutatedManifest = {
      ...manifest,
      asset: {
        ...manifest.asset,
        byteLength: mutated.byteLength,
        sha256: "0".repeat(64),
      },
    };
    const visual = validateVehicleVisualPackageV1(mutatedManifest);
    await assert.rejects(
      () => validateVehicleVisualAssetV1(visual, mutated, { digest: async () => new Uint8Array(32).buffer }),
      expected,
    );
  }
});
