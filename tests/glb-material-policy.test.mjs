import test from "node:test";
import assert from "node:assert/strict";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import { buildGlb, packageForGlb } from "./helpers/vehicle-visual-fixture.mjs";

async function rejected(material, expected) {
  const bytes = buildGlb({ materials: [material] });
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  await assert.rejects(
    () => validateVehicleVisualAssetV1(visual, bytes, null),
    expected,
  );
}

test("base-colour legacy material subset passes", async () => {
  const bytes = buildGlb({
    materials: [
      {
        name: "JV Blue",
        pbrMetallicRoughness: {
          baseColorFactor: [0.1, 0.2, 0.8, 1],
        },
        doubleSided: false,
      },
    ],
  });
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  await assert.doesNotReject(() =>
    validateVehicleVisualAssetV1(visual, bytes, null),
  );
});

test("MASK alpha is bounded while BLEND and emissive fail closed", async () => {
  const bytes = buildGlb({
    materials: [{
      pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1] },
      alphaMode: "MASK",
      alphaCutoff: 0.05,
      doubleSided: true,
    }],
  });
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  await assert.doesNotReject(() => validateVehicleVisualAssetV1(visual, bytes, null));
  await rejected({ emissiveFactor: [1, 0, 0] }, /unsupported keys: emissiveFactor/);
  await rejected({ alphaMode: "BLEND" }, /alphaMode must be OPAQUE or MASK/);
});

test("R1 PBR factors stay at the rendered fixed subset", async () => {
  await rejected(
    { pbrMetallicRoughness: { metallicFactor: 0.25 } },
    /metallicFactor must equal 0/,
  );
  await rejected(
    { pbrMetallicRoughness: { roughnessFactor: 0.75 } },
    /roughnessFactor must equal 1/,
  );
  await rejected(
    { pbrMetallicRoughness: { baseColorTexture: { index: 0 } } },
    /references missing texture 0/,
  );
});

test("baseColorFactor stays inside the rendered unit range", async () => {
  await rejected(
    {
      pbrMetallicRoughness: {
        baseColorFactor: [1, 0, 2, 1],
      },
    },
    /baseColorFactor\[2\].*\[0,1\]/,
  );
});
