import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  buildPortableFileRecords,
  PORTABLE_MANIFEST_NAME,
} from "../tools/portable-build-lib.mjs";
import { smokePortableBuildOverHttp } from "../tools/portable-http-smoke-lib.mjs";

async function createFixture() {
  const root = await mkdtemp(resolve(tmpdir(), "jv-portable-http-"));
  await mkdir(resolve(root, "assets"), { recursive: true });
  await mkdir(resolve(root, "receipts"), { recursive: true });
  await writeFile(resolve(root, ".nojekyll"), "", "utf8");
  await writeFile(
    resolve(root, "index.html"),
    '<!doctype html><script type="module" src="./assets/app.js"></script>',
    "utf8",
  );
  await writeFile(resolve(root, "assets", "app.js"), "export {};\n", "utf8");
  await writeFile(
    resolve(root, "receipts", "jv_m6_factory_receipt.json"),
    "{}\n",
    "utf8",
  );
  await writeFile(
    resolve(root, "THIRD_PARTY_NOTICES.md"),
    "fixture notice\n",
    "utf8",
  );

  const files = await buildPortableFileRecords(root, {
    exclude: [PORTABLE_MANIFEST_NAME],
  });
  const manifest = {
    schemaVersion: 1,
    distribution: "portable_site",
    runtimeAssets: ["receipts/jv_m6_factory_receipt.json"],
    complianceFiles: ["THIRD_PARTY_NOTICES.md"],
    files,
  };
  await writeFile(
    resolve(root, PORTABLE_MANIFEST_NAME),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  return root;
}

async function withFixture(callback) {
  const root = await createFixture();
  try {
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("portable HTTP smoke serves identical bytes at root and project path", async () => {
  await withFixture(async (root) => {
    const results = await smokePortableBuildOverHttp(root, [
      "/",
      "/JV-Box3D-Web-experiment/",
    ]);
    assert.deepEqual(
      results.map((result) => result.prefix),
      ["/", "/JV-Box3D-Web-experiment/"],
    );
    assert.ok(results.every((result) => result.fileCount === 5));
    assert.ok(results.every((result) => result.runtimeAssets.length === 1));
    assert.ok(results.every((result) => result.complianceFiles.length === 1));
  });
});

test("portable HTTP smoke rejects bytes that drift from the manifest", async () => {
  await withFixture(async (root) => {
    await writeFile(resolve(root, "assets", "app.js"), "export const drift = true;\n", "utf8");
    await assert.rejects(
      smokePortableBuildOverHttp(root, ["/nested/"]),
      /byte count differs|SHA-256 differs/,
    );
  });
});