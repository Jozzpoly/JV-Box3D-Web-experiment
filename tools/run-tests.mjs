import { readdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const testDist = fileURLToPath(new URL("../.test-dist", import.meta.url));
const testsDirectory = fileURLToPath(new URL("../tests", import.meta.url));
const tsc = fileURLToPath(new URL("../node_modules/typescript/bin/tsc", import.meta.url));

await rm(testDist, { recursive: true, force: true });

const compile = spawnSync(process.execPath, [tsc, "-p", "tsconfig.test.json"], {
  cwd: root,
  stdio: "inherit",
});
if (compile.status !== 0) {
  process.exit(compile.status ?? 1);
}

const testFiles = (await readdir(testsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".test.mjs"))
  .map((entry) => `tests/${entry.name}`)
  .sort();

if (testFiles.length === 0) {
  throw new Error("No test files found.");
}

const tests = spawnSync(process.execPath, ["--test", ...testFiles], {
  cwd: root,
  stdio: "inherit",
});
process.exit(tests.status ?? 1);
