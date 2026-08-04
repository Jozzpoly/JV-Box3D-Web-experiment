import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { inspectGlbV2 } from "../.test-dist/visual/glb-container.js";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";

function usage() {
  console.error(
    "Usage: npm run inspect:vehicle-glb -- <model.glb> [vehicle.visual.json]",
  );
}

const [, , glbArgument, manifestArgument] = process.argv;
if (glbArgument === undefined || process.argv.length > 4) {
  usage();
  process.exit(2);
}

const glbPath = resolve(glbArgument);
const bytes = new Uint8Array(await readFile(glbPath));
const inspection = inspectGlbV2(bytes);
const sha256 = createHash("sha256").update(bytes).digest("hex");

console.log("JV vehicle GLB inspection");
console.log(`Path:                  ${glbPath}`);
console.log(`Bytes:                 ${bytes.byteLength}`);
console.log(`SHA-256:               ${sha256}`);
console.log(`JSON chunk:            ${inspection.jsonChunkLength}`);
console.log(`BIN chunk:             ${inspection.binaryChunkLength}`);
console.log(`Nodes:                 ${inspection.nodeNames.length}`);
console.log(`Unnamed nodes:         ${inspection.unnamedNodeCount}`);
console.log(`Meshes:                ${inspection.meshCount}`);
console.log(`Materials:             ${inspection.materialCount}`);
console.log(`Textures/images:       ${inspection.textureCount}/${inspection.imageCount}`);
console.log(`Animations/skins:      ${inspection.animationCount}/${inspection.skinCount}`);
console.log(`Morph primitives:      ${inspection.morphTargetPrimitiveCount}`);
console.log(`External URIs:         ${inspection.externalUris.length}`);
console.log(`Extensions used:       ${inspection.extensionsUsed.join(", ") || "NONE"}`);
console.log(`Extensions required:   ${inspection.extensionsRequired.join(", ") || "NONE"}`);
console.log(`Duplicate node names:  ${inspection.duplicateNodeNames.join(", ") || "NONE"}`);
console.log(`Non-positive scales:   ${inspection.nonPositiveScaleNodes.join(", ") || "NONE"}`);

console.log("\nNode names:");
for (const name of inspection.nodeNames.slice().sort()) {
  console.log(`  ${name}`);
}

console.log("\nRequired runtime channels:");
for (const partId of M6_VISUAL_PART_IDS) {
  console.log(`  PART     ${partId}`);
}
for (const segmentId of M6_VISUAL_SEGMENT_IDS) {
  console.log(`  SEGMENT  ${segmentId}`);
}

if (manifestArgument !== undefined) {
  const manifestPath = resolve(manifestArgument);
  const visual = validateVehicleVisualPackageV1(
    JSON.parse(await readFile(manifestPath, "utf8")),
  );
  const receipt = await validateVehicleVisualAssetV1(visual, bytes, null);
  console.log("\nManifest gate:         PASS");
  console.log(`Manifest:              ${manifestPath}`);
  console.log(`Package:               ${receipt.packageId}`);
  console.log(`Bound nodes:           ${receipt.boundNodeCount}`);
} else {
  console.log("\nManifest gate:         NOT RUN (no package JSON supplied)");
}
