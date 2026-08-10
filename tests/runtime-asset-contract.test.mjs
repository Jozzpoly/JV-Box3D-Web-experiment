import test from "node:test";
import assert from "node:assert/strict";
import {
  REQUIRED_RUNTIME_ASSETS,
  validateRuntimeAssetContract,
} from "../tools/runtime-asset-contract.mjs";

function manifest(overrides = {}) {
  return {
    runtimeAssets: [...REQUIRED_RUNTIME_ASSETS],
    files: REQUIRED_RUNTIME_ASSETS.map((path) => ({
      path,
      bytes: 1,
      sha256: "a".repeat(64),
    })),
    ...overrides,
  };
}

test("portable runtime asset contract requires receipt, scene, tiny proof and owner vehicle", () => {
  assert.deepEqual(REQUIRED_RUNTIME_ASSETS, [
    "receipts/jv_m6_factory_receipt.json",
    "scenes/synthetic-flat-lab.scene.json",
    "vehicles/tiny/vehicle.visual.json",
    "vehicles/tiny/models/m6-rig-proof.glb",
    "vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json",
    "vehicles/m6-owner-r3/models/m6-owner-full-rig-r3.glb",
  ]);
  assert.deepEqual(validateRuntimeAssetContract(manifest()), []);
});

test("missing scene declaration fails even when the payload file exists", () => {
  const result = validateRuntimeAssetContract(
    manifest({
      runtimeAssets: REQUIRED_RUNTIME_ASSETS.filter(
        (path) => path !== "scenes/synthetic-flat-lab.scene.json",
      ),
    }),
  );
  assert.ok(
    result.some((error) =>
      error.includes("synthetic-flat-lab.scene.json"),
    ),
  );
});

test("missing generated vehicle GLB declaration fails closed", () => {
  const result = validateRuntimeAssetContract(
    manifest({
      runtimeAssets: REQUIRED_RUNTIME_ASSETS.filter(
        (path) => path !== "vehicles/tiny/models/m6-rig-proof.glb",
      ),
    }),
  );
  assert.ok(result.some((error) => error.includes("m6-rig-proof.glb")));
});

test("missing runtime payload record fails even when it is declared", () => {
  const result = validateRuntimeAssetContract(
    manifest({
      files: REQUIRED_RUNTIME_ASSETS.slice(0, -1).map((path) => ({
        path,
        bytes: 1,
        sha256: "a".repeat(64),
      })),
    }),
  );
  assert.ok(
    result.some((error) =>
      error.includes("absent from the portable payload table"),
    ),
  );
});

test("future additional runtime assets remain allowed", () => {
  const fixture = manifest();
  fixture.runtimeAssets.push("scenes/future-scan/scene.glb");
  fixture.files.push({
    path: "scenes/future-scan/scene.glb",
    bytes: 1,
    sha256: "b".repeat(64),
  });
  assert.deepEqual(validateRuntimeAssetContract(fixture), []);
});
