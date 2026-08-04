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

test("emissive and alpha features cannot be silently ignored", async () => {
  await rejected(
    { emissiveFactor: [1, 0, 0] },
    /unsupported keys: emissiveFactor/,
  );
  await rejected({ alphaMode: "BLEND" }, /unsupported keys: alphaMode/);
});

test("unrendered PBR and texture fields fail closed", async () => {
  for (const [key, value] of [
    ["baseColorTexture", { index: 0 }],
    ["metallicFactor", 0.25],
    ["roughnessFactor", 0.75],
  ]) {
    await rejected(
      {
        pbrMetallicRoughness: {
          [key]: value,
        },
      },
      new RegExp(`unsupported keys: ${key}`),
    );
  }
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
