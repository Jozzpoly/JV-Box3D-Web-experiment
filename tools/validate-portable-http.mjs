import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { smokePortableBuildOverHttp } from "./portable-http-smoke-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
const results = await smokePortableBuildOverHttp(dist);

for (const result of results) {
  console.log(
    `Portable HTTP smoke passed at ${result.prefix}: ${result.fileCount} file(s), ${result.runtimeAssets.length} runtime asset(s), ${result.complianceFiles.length} compliance file(s).`,
  );
}
console.log("Portable HTTP smoke used loopback only and published nothing.");