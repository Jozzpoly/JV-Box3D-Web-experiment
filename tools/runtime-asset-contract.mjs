export const REQUIRED_RUNTIME_ASSETS = Object.freeze([
  "receipts/jv_m6_factory_receipt.json",
  "scenes/synthetic-flat-lab.scene.json",
  "vehicles/tiny/vehicle.visual.json",
  "vehicles/tiny/models/m6-rig-proof.glb",
  "vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json",
  "vehicles/m6-owner-r3/models/m6-owner-full-rig-r3.glb",
]);

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

  return errors;
}
