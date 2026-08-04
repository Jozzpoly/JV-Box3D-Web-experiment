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

test("portable runtime asset contract requires receipt and scene", () => {
  assert.deepEqual(REQUIRED_RUNTIME_ASSETS, [
    "receipts/jv_m6_factory_receipt.json",
    "scenes/synthetic-flat-lab.scene.json",
  ]);
  assert.deepEqual(validateRuntimeAssetContract(manifest()), []);
});

test("missing scene declaration fails even when the payload file exists", () => {
  const result = validateRuntimeAssetContract(
    manifest({
      runtimeAssets: ["receipts/jv_m6_factory_receipt.json"],
    }),
  );
  assert.ok(
    result.some((error) =>
      error.includes("synthetic-flat-lab.scene.json"),
    ),
  );
});

test("missing scene payload record fails even when it is declared", () => {
  const result = validateRuntimeAssetContract(
    manifest({
      files: [
        {
          path: "receipts/jv_m6_factory_receipt.json",
          bytes: 1,
          sha256: "a".repeat(64),
        },
      ],
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
