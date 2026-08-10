import test from "node:test";
import assert from "node:assert/strict";
import {
  assertStaticSceneCpuBudgetV1,
  validateStaticSceneVisualPackageV1,
} from "../.test-dist/scene/static-scene-visual-package.js";

function validPackage() {
  return {
    format: "jv-web-static-scene-visual-package",
    schemaVersion: 1,
    id: "future-yard-scan",
    displayName: "Future Yard Scan",
    purpose: "PHOTOGRAMMETRY_SCAN",
    units: "meter",
    axes: { forward: "+X", up: "+Y", right: "+Z" },
    asset: {
      kind: "GLB",
      url: "models/yard-scan.glb",
      sha256: "a".repeat(64),
      byteLength: 1234,
    },
    worldFromAsset: {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
    },
    originPolicy: {
      mode: "SCENE_LOCAL_ORIGIN",
      maxRadiusMeters: 250,
    },
    budgets: {
      maxNodes: 128,
      maxTriangles: 500000,
      maxMaterials: 32,
    },
  };
}

test("photogrammetry package pins units, origin and explicit budgets", () => {
  const visual = validateStaticSceneVisualPackageV1(validPackage());
  assert.equal(visual.purpose, "PHOTOGRAMMETRY_SCAN");
  assert.equal(visual.originPolicy.maxRadiusMeters, 250);
  assert.equal(visual.budgets.maxTriangles, 500000);
});

test("scan asset URLs and coordinate conventions fail closed", () => {
  for (const url of [
    "/scan.glb",
    "../scan.glb",
    "models\\scan.glb",
    "https://example.test/scan.glb",
    "models/scan.gltf",
  ]) {
    const value = validPackage();
    value.asset.url = url;
    assert.throws(
      () => validateStaticSceneVisualPackageV1(value),
      /site-relative URL|inside its asset package|\.glb file/,
      url,
    );
  }

  const wrongAxes = validPackage();
  wrongAxes.axes.up = "+Z";
  assert.throws(
    () => validateStaticSceneVisualPackageV1(wrongAxes),
    /visual\.axes\.up/,
  );
});

test("scan budgets reject CPU assets before GPU allocation", () => {
  const visual = validateStaticSceneVisualPackageV1(validPackage());
  assert.doesNotThrow(() =>
    assertStaticSceneCpuBudgetV1(visual, {
      nodes: new Array(12),
      triangleCount: 100000,
      materials: new Array(4),
    }),
  );
  assert.throws(
    () =>
      assertStaticSceneCpuBudgetV1(visual, {
        nodes: new Array(12),
        triangleCount: 500001,
        materials: new Array(4),
      }),
    /triangle count/,
  );
  assert.throws(
    () =>
      assertStaticSceneCpuBudgetV1(visual, {
        nodes: new Array(129),
        triangleCount: 1,
        materials: new Array(1),
      }),
    /node count/,
  );
});
