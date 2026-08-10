import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function json(path) {
  return JSON.parse(await readFile(new URL(path, root), "utf8"));
}

function canonicalText(value) {
  return value.replace(/\r\n?/g, "\n");
}

test("canonical package metadata pins the current repository toolchain", async () => {
  const packageJson = await json("package.json");
  assert.deepEqual(packageJson.engines, {
    node: "24.16.0",
    npm: "11.13.0",
  });
  assert.equal(packageJson.packageManager, "npm@11.13.0");
  assert.equal(Object.hasOwn(packageJson, "os"), false);
});

test("devEngines fails closed on runtime or package-manager drift", async () => {
  const packageJson = await json("package.json");
  assert.deepEqual(packageJson.devEngines, {
    runtime: {
      name: "node",
      version: "24.16.0",
      onFail: "error",
    },
    packageManager: {
      name: "npm",
      version: "11.13.0",
      onFail: "error",
    },
  });
});

test("canonical pin preserves the accepted dependency lock", async () => {
  const text = canonicalText(
    await readFile(new URL("package-lock.json", root), "utf8"),
  );
  const lock = JSON.parse(text);
  const rootPackage = lock.packages?.[""];
  assert.ok(rootPackage, "package-lock root package is missing");
  assert.equal(lock.lockfileVersion, 3);
  assert.equal(rootPackage.dependencies?.["box3d.js"], "0.0.2");
  assert.equal(rootPackage.devDependencies?.typescript, "7.0.2");
  assert.equal(rootPackage.devDependencies?.vite, "8.1.5");
  assert.equal(
    createHash("sha256").update(text).digest("hex"),
    "8d84e565e0322326824ca93c5f4ca1f8df618b9e8e2026451ac08f9cc211e446",
  );
});

test("repository launch metadata points at the exact Node line", async () => {
  const nodeVersion = await readFile(new URL(".node-version", root), "utf8");
  const npmrc = await readFile(new URL(".npmrc", root), "utf8");
  assert.equal(canonicalText(nodeVersion), "24.16.0\n");
  assert.match(npmrc, /^engine-strict=true$/m);
  assert.match(npmrc, /^save-exact=true$/m);
});
