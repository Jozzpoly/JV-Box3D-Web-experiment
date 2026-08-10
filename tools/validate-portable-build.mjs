import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { validatePortableBuild } from "./portable-build-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
const result = await validatePortableBuild(dist);

for (const warning of result.warnings) {
  console.warn(`WARNING: ${warning}`);
}

if (result.errors.length > 0) {
  console.error(
    `Portable build validation failed with ${result.errors.length} error(s):`,
  );
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const { stats } = result;
console.log("Portable build validation passed.");
console.log(`Files:        ${stats.fileCount}`);
console.log(`Total bytes:  ${stats.totalBytes}`);
if (stats.largestFile) {
  console.log(
    `Largest file: ${stats.largestFile.path} (${stats.largestFile.bytes} bytes)`,
  );
}
console.log(`Source:       ${result.manifest.source.commit}`);
console.log(`Backend:      ${result.manifest.runtimeBackend.id}`);
console.log(`Parity:       ${result.manifest.runtimeBackend.nativeParity}`);
console.log(
  `Publication:  ${result.manifest.publication.publishedByBuild ? "performed" : "not performed"}`,
);
