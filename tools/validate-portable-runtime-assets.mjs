import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUIRED_RUNTIME_ASSETS,
  validateRuntimeAssetContract,
} from "./runtime-asset-contract.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = resolve(root, "dist", "build-manifest.json");

let manifest;
try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch (error) {
  console.error(
    `Portable runtime asset validation could not read build-manifest.json: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exit(1);
}

const errors = validateRuntimeAssetContract(manifest);
if (errors.length > 0) {
  console.error(
    `Portable runtime asset validation failed with ${errors.length} error(s):`,
  );
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Portable runtime asset contract passed: ${REQUIRED_RUNTIME_ASSETS.length} required asset(s).`,
);
