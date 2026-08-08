import test from "node:test";
import assert from "node:assert/strict";
import {
  OWNER_M6_R1_RUNTIME_ASSETS,
  REQUIRED_RUNTIME_ASSETS,
  selectRuntimeAssetsForPayload,
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

function ownerManifest(overrides = {}) {
  const runtimeAssets = [
    ...REQUIRED_RUNTIME_ASSETS,
    ...OWNER_M6_R1_RUNTIME_ASSETS,
  ];
  return {
    runtimeAssets,
    files: runtimeAssets.map((path) => ({
      path,
      bytes: 1,
      sha256: "a".repeat(64),
    })),
    ...overrides,
  };
}

test("portable runtime asset contract requires receipt, scene and tiny vehicle package", () => {
  assert.deepEqual(REQUIRED_RUNTIME_ASSETS, [
    "receipts/jv_m6_factory_receipt.json",
    "scenes/synthetic-flat-lab.scene.json",
    "vehicles/tiny/vehicle.visual.json",
    "vehicles/tiny/models/m6-rig-proof.glb",
  ]);
  assert.deepEqual(validateRuntimeAssetContract(manifest()), []);
});

test("R1 owner vehicle is an optional complete runtime pair", () => {
  assert.deepEqual(OWNER_M6_R1_RUNTIME_ASSETS, [
    "vehicles/m6-owner-r1/m6-owner-rigid-r1.visual.json",
    "vehicles/m6-owner-r1/models/m6-owner-rigid-r1.glb",
  ]);
  assert.deepEqual(validateRuntimeAssetContract(ownerManifest()), []);
  assert.deepEqual(
    [...selectRuntimeAssetsForPayload(new Set(REQUIRED_RUNTIME_ASSETS))],
    REQUIRED_RUNTIME_ASSETS,
  );
  assert.deepEqual(
    [
      ...selectRuntimeAssetsForPayload(
        new Set([...REQUIRED_RUNTIME_ASSETS, ...OWNER_M6_R1_RUNTIME_ASSETS]),
      ),
    ],
    [...REQUIRED_RUNTIME_ASSETS, ...OWNER_M6_R1_RUNTIME_ASSETS],
  );
});

test("partial R1 owner vehicle package fails closed", () => {
  assert.throws(
    () =>
      selectRuntimeAssetsForPayload(
        new Set([
          ...REQUIRED_RUNTIME_ASSETS,
          OWNER_M6_R1_RUNTIME_ASSETS[0],
        ]),
      ),
    /partial Owner M6 R1 runtime package/,
  );

  const fixture = ownerManifest({
    files: ownerManifest().files.filter(
      (record) => record.path !== OWNER_M6_R1_RUNTIME_ASSETS[1],
    ),
  });
  assert.ok(
    validateRuntimeAssetContract(fixture).some((error) =>
      error.includes("Owner M6 R1 runtime asset is absent"),
    ),
  );
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
