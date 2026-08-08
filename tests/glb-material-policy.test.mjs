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

test("base-colour material subset passes", async () => {
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

test("fixed metallic and roughness values in the rendered subset pass", async () => {
  const bytes = buildGlb({
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorFactor: [1, 1, 1, 1],
          metallicFactor: 0,
          roughnessFactor: 1,
        },
      },
    ],
  });
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  await assert.doesNotReject(() =>
    validateVehicleVisualAssetV1(visual, bytes, null),
  );
});

test("emissive and unsupported alpha modes cannot be silently ignored", async () => {
  await rejected(
    { emissiveFactor: [1, 0, 0] },
    /unsupported keys: emissiveFactor/,
  );
  await rejected({ alphaMode: "BLEND" }, /alphaMode must be OPAQUE or MASK/);
});

test("non-exact PBR values fail closed", async () => {
  await rejected(
    { pbrMetallicRoughness: { metallicFactor: 0.25 } },
    /metallicFactor must be exactly 0/,
  );
  await rejected(
    { pbrMetallicRoughness: { roughnessFactor: 0.75 } },
    /roughnessFactor must be exactly 1/,
  );
});

test("MASK requires an explicit PBR owner-pixel material", async () => {
  await rejected(
    { alphaMode: "MASK", alphaCutoff: 0.05 },
    /MASK requires pbrMetallicRoughness/,
  );
});

test("owner pixel subset requires explicit metallic=0 and roughness=1", async () => {
  await rejected(
    {
      alphaMode: "MASK",
      alphaCutoff: 0.05,
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        roughnessFactor: 1,
      },
    },
    /metallicFactor must be exactly 0/,
  );
  await rejected(
    {
      alphaMode: "MASK",
      alphaCutoff: 0.05,
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        metallicFactor: 0,
      },
    },
    /roughnessFactor must be exactly 1/,
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
