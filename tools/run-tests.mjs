import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
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

const testVendorDirectory = fileURLToPath(
  new URL("../.test-dist/physics/vendor/", import.meta.url),
);
await mkdir(testVendorDirectory, { recursive: true });
await copyFile(
  fileURLToPath(
    new URL("../src/physics/vendor/box3d-mode5.inline.mjs", import.meta.url),
  ),
  fileURLToPath(
    new URL("../.test-dist/physics/vendor/box3d-mode5.inline.mjs", import.meta.url),
  ),
);

const requestedTestFiles = process.argv.slice(2);
for (const testFile of requestedTestFiles) {
  if (!testFile.startsWith("tests/") || !testFile.endsWith(".test.mjs")) {
    throw new Error(
      `Focused test path must be tests/<name>.test.mjs; received ${testFile}.`,
    );
  }
}

const testFiles = requestedTestFiles.length > 0
  ? requestedTestFiles
  : (await readdir(testsDirectory, { withFileTypes: true }))
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
