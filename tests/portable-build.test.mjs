import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  buildPortableFileRecords,
  PORTABLE_MANIFEST_NAME,
  validatePortableBuild,
} from "../tools/portable-build-lib.mjs";

async function createFixture() {
  const root = await mkdtemp(resolve(tmpdir(), "jv-portable-build-"));
  await mkdir(resolve(root, "assets"), { recursive: true });
  await writeFile(resolve(root, ".nojekyll"), "", "utf8");
  await writeFile(
    resolve(root, "index.html"),
    '<!doctype html><link rel="stylesheet" href="./assets/app.css"><script type="module" src="./assets/app.js"></script>',
    "utf8",
  );
  await writeFile(resolve(root, "assets", "app.js"), "export {};\n", "utf8");
  await writeFile(
    resolve(root, "assets", "app.css"),
    '.demo { background-image: url("./texture.bin"); }\n',
    "utf8",
  );
  await writeFile(resolve(root, "assets", "texture.bin"), "texture", "utf8");
  return root;
}

async function writeManifest(root) {
  const files = await buildPortableFileRecords(root, {
    exclude: [PORTABLE_MANIFEST_NAME],
  });
  const manifest = {
    schemaVersion: 1,
    distribution: "portable_site",
    source: { commit: "test" },
    runtimeBackend: {
      id: "legacy_ts_m6",
      nativeParity: "NOT_PROVEN",
    },
    publication: {
      mode: "DORMANT",
      publicReady: false,
      pagesPublicationApproved: false,
      publishedByBuild: false,
    },
    files,
  };
  await writeFile(
    resolve(root, PORTABLE_MANIFEST_NAME),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

async function withFixture(callback) {
  const root = await createFixture();
  try {
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("portable package accepts relative HTML and CSS references", async () => {
  await withFixture(async (root) => {
    await writeManifest(root);
    const result = await validatePortableBuild(root);
    assert.deepEqual(result.errors, []);
    assert.equal(result.manifest.publication.publicReady, false);
    assert.equal(result.manifest.publication.pagesPublicationApproved, false);
  });
});

test("portable package rejects a root-absolute GitHub Pages path", async () => {
  await withFixture(async (root) => {
    await writeFile(
      resolve(root, "index.html"),
      '<!doctype html><script type="module" src="/assets/app.js"></script>',
      "utf8",
    );
    await writeManifest(root);
    const result = await validatePortableBuild(root);
    assert.ok(
      result.errors.some((error) => error.includes("root-absolute URL")),
    );
  });
});

test("portable package rejects payload drift after manifest creation", async () => {
  await withFixture(async (root) => {
    await writeManifest(root);
    await writeFile(resolve(root, "assets", "app.js"), "export const drift = true;\n", "utf8");
    const result = await validatePortableBuild(root);
    assert.ok(
      result.errors.some((error) =>
        error.includes("does not match its recorded bytes/SHA-256"),
      ),
    );
  });
});

test("portable package rejects a missing nested CSS asset", async () => {
  await withFixture(async (root) => {
    await writeFile(
      resolve(root, "assets", "app.css"),
      '.demo { background-image: url("./missing.bin"); }\n',
      "utf8",
    );
    await writeManifest(root);
    const result = await validatePortableBuild(root);
    assert.ok(
      result.errors.some((error) => error.includes("missing build artifact")),
    );
  });
});
