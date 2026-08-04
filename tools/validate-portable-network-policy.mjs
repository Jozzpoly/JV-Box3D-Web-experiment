import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePortableNetworkPolicy } from "./portable-network-policy-lib.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const errors = await validatePortableNetworkPolicy(resolve(root, "dist"));

if (errors.length > 0) {
  console.error(`Portable network policy failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Portable network policy passed: HTML/CSS have no hidden remote dependencies.");