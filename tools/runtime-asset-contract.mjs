export const REQUIRED_RUNTIME_ASSETS = Object.freeze([
  "receipts/jv_m6_factory_receipt.json",
  "scenes/synthetic-flat-lab.scene.json",
  "vehicles/tiny/vehicle.visual.json",
  "vehicles/tiny/models/m6-rig-proof.glb",
]);

export const OWNER_M6_R1_RUNTIME_ASSETS = Object.freeze([
  "vehicles/m6-owner-r1/m6-owner-rigid-r1.visual.json",
  "vehicles/m6-owner-r1/models/m6-owner-rigid-r1.glb",
]);

export function selectRuntimeAssetsForPayload(filePaths) {
  const paths = filePaths instanceof Set ? filePaths : new Set(filePaths ?? []);
  const ownerPresence = OWNER_M6_R1_RUNTIME_ASSETS.filter((path) =>
    paths.has(path),
  );
  if (
    ownerPresence.length !== 0 &&
    ownerPresence.length !== OWNER_M6_R1_RUNTIME_ASSETS.length
  ) {
    throw new Error(
      `Portable build contains a partial Owner M6 R1 runtime package: ${ownerPresence.join(", ")}.`,
    );
  }
  return Object.freeze([
    ...REQUIRED_RUNTIME_ASSETS,
    ...(ownerPresence.length === OWNER_M6_R1_RUNTIME_ASSETS.length
      ? OWNER_M6_R1_RUNTIME_ASSETS
      : []),
  ]);
}

function validateOptionalAssetGroup(label, paths, declaredSet, filePaths) {
  const touched = paths.some(
    (path) => declaredSet.has(path) || filePaths.has(path),
  );
  if (!touched) {
    return [];
  }

  const errors = [];
  for (const path of paths) {
    if (!declaredSet.has(path)) {
      errors.push(
        `build-manifest.json must declare ${label} runtime asset ${path}.`,
      );
    }
    if (!filePaths.has(path)) {
      errors.push(
        `${label} runtime asset is absent from the portable payload table: ${path}.`,
      );
    }
  }
  return errors;
}

export function validateRuntimeAssetContract(manifest) {
  const errors = [];
  const declared = manifest?.runtimeAssets;
  if (!Array.isArray(declared)) {
    return ["build-manifest.json must contain a runtimeAssets array."];
  }

  const declaredSet = new Set(declared);
  for (const requiredPath of REQUIRED_RUNTIME_ASSETS) {
    if (!declaredSet.has(requiredPath)) {
      errors.push(
        `build-manifest.json must declare required runtime asset ${requiredPath}.`,
      );
    }
  }

  const filePaths = new Set(
    Array.isArray(manifest?.files)
      ? manifest.files
          .filter(
            (record) =>
              record !== null &&
              typeof record === "object" &&
              typeof record.path === "string",
          )
          .map((record) => record.path)
      : [],
  );
  for (const requiredPath of REQUIRED_RUNTIME_ASSETS) {
    if (!filePaths.has(requiredPath)) {
      errors.push(
        `Required runtime asset is absent from the portable payload table: ${requiredPath}.`,
      );
    }
  }

  errors.push(
    ...validateOptionalAssetGroup(
      "Owner M6 R1",
      OWNER_M6_R1_RUNTIME_ASSETS,
      declaredSet,
      filePaths,
    ),
  );

  return errors;
}
