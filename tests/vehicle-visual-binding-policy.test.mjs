import test from "node:test";
import assert from "node:assert/strict";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import {
  buildGlb,
  packageForGlb,
} from "./helpers/vehicle-visual-fixture.mjs";

async function visualWithStretchMutation(mutate) {
  const bytes = buildGlb();
  const packageValue = packageForGlb(bytes);
  const binding = packageValue.bindings.find(
    (entry) => entry.source.kind === "SEGMENT_STRETCH",
  );
  mutate(binding);
  return {
    bytes,
    visual: validateVehicleVisualPackageV1(packageValue),
  };
}

test("stretch reference length stays inside the M6 authoring domain", async () => {
  for (const value of [0.0009, 10.001]) {
    const { bytes, visual } = await visualWithStretchMutation((binding) => {
      binding.source.referenceLengthMeters = value;
    });
    await assert.rejects(
      () => validateVehicleVisualAssetV1(visual, bytes, null),
      /within \[0\.001, 10\]/,
    );
  }
});

test("stretch local corrections cannot introduce shear or endpoint ambiguity", async () => {
  for (const localFromSource of [
    {
      position: [0.1, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    },
    {
      position: [0, 0, 0],
      rotation: [0, 0, Math.sin(Math.PI / 8), Math.cos(Math.PI / 8)],
      scale: [1, 1, 1],
    },
    {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 2, 1],
    },
  ]) {
    const { bytes, visual } = await visualWithStretchMutation((binding) => {
      binding.localFromSource = localFromSource;
    });
    await assert.rejects(
      () => validateVehicleVisualAssetV1(visual, bytes, null),
      /identity localFromSource/,
    );
  }
});
