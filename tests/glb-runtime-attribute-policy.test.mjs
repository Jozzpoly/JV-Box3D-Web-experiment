import test from "node:test";
import assert from "node:assert/strict";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import {
  VALID_TRIANGLE_PRIMITIVE,
  buildGlb,
  packageForGlb,
  validTriangleGeometryJson,
} from "./helpers/vehicle-visual-fixture.mjs";

async function rejected(overrides, expected) {
  const bytes = buildGlb(overrides);
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  await assert.rejects(
    () => validateVehicleVisualAssetV1(visual, bytes, null),
    expected,
  );
}

test("unsupported vertex attributes cannot be silently discarded", async () => {
  await rejected(
    {
      meshes: [
        {
          primitives: [
            {
              ...VALID_TRIANGLE_PRIMITIVE,
              attributes: { POSITION: 0, COLOR_0: 0 },
            },
          ],
        },
      ],
    },
    /unsupported vertex attributes: COLOR_0/,
  );
});

test("POSITION accessors require finite min and max bounds", async () => {
  const missingMin = validTriangleGeometryJson();
  delete missingMin.accessors[0].min;
  await rejected({ accessors: missingMin.accessors }, /accessors\[0\]\.min/);

  const missingMax = validTriangleGeometryJson();
  delete missingMax.accessors[0].max;
  await rejected({ accessors: missingMax.accessors }, /accessors\[0\]\.max/);
});
