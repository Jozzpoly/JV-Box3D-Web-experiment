import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePortableManifestPolicy } from "./portable-manifest-policy-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const errors = await validatePortableManifestPolicy(resolve(root, "dist"));

if (errors.length > 0) {
  console.error(`Portable manifest privacy policy failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Portable manifest privacy policy passed: source branch name is not exposed.");