import test from "node:test";
import assert from "node:assert/strict";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import {
  buildGlb,
  packageForGlb,
} from "./helpers/vehicle-visual-fixture.mjs";

for (const [label, overrides] of [
  ["embedded image", { images: [{ bufferView: 0, mimeType: "image/png" }] }],
  ["texture", { textures: [{ source: 0 }] }],
]) {
  test(`V1 rejects ${label} until texture decode and GPU ownership exist`, async () => {
    const bytes = buildGlb(overrides);
    const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
    await assert.rejects(
      () => validateVehicleVisualAssetV1(visual, bytes, null),
      /images and textures are outside V1/,
    );
  });
}
