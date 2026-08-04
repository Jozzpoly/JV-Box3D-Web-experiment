import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  buildPortableFileRecords,
  PORTABLE_MANIFEST_NAME,
  validatePortableBuild,
} from "../tools/portable-build-lib.mjs";

const RECEIPT_PATH = "receipts/jv_m6_factory_receipt.json";

async function createFixture() {
  const root = await mkdtemp(resolve(tmpdir(), "jv-portable-build-"));
  await mkdir(resolve(root, "assets"), { recursive: true });
  await mkdir(resolve(root, "receipts"), { recursive: true });
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
  await writeFile(resolve(root, RECEIPT_PATH), "{}\n", "utf8");
  return root;
}

async function writeManifest(root, mutate = () => {}) {
  const files = await buildPortableFileRecords(root, {
    exclude: [PORTABLE_MANIFEST_NAME],
  });
  const manifest = {
    schemaVersion: 1,
    distribution: "portable_site",
    project: {
      id: "jv_web_demonstrator",
      version: "0.1.0",
    },
    source: {
      repository: "Jozzpoly/JV-Box3D-Web-experiment",
      branch: "test",
      commit: "a".repeat(40),
      commitDate: "2026-08-04T00:00:00Z",
      workingTreeClean: true,
    },
    runtimeBackend: {
      id: "legacy_ts_m6",
      role: "REFERENCE_BROWSER_FIXTURE",
      productPhysicsAuthority: false,
      nativeParity: "NOT_PROVEN",
    },
    runtimeAssets: [RECEIPT_PATH],
    publication: {
      mode: "DORMANT",
      pathPortableCandidate: true,
      publicReady: false,
      pagesPublicationApproved: false,
      publishedByBuild: false,
    },
    files,
  };
  mutate(manifest);
  await writeFile(
    resolve(root, PORTABLE_MANIFEST_NAME),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

async function rewriteManifest(root, mutate) {
  const manifestPath = resolve(root, PORTABLE_MANIFEST_NAME);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  mutate(manifest);
  await writeFile(
    manifestPath,
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

test("portable package accepts relative HTML, CSS and runtime assets", async () => {
  await withFixture(async (root) => {
    await writeManifest(root);
    const result = await validatePortableBuild(root);
    assert.deepEqual(result.errors, []);
    assert.equal(result.manifest.publication.publicReady, false);
    assert.equal(result.manifest.publication.pagesPublicationApproved, false);
    assert.deepEqual(result.manifest.runtimeAssets, [RECEIPT_PATH]);
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

test("portable package cannot grant itself public readiness", async () => {
  await withFixture(async (root) => {
    await writeManifest(root, (manifest) => {
      manifest.publication.publicReady = true;
      manifest.publication.pagesPublicationApproved = true;
    });
    const result = await validatePortableBuild(root);
    assert.ok(result.errors.some((error) => error.includes("publicReady=false")));
    assert.ok(
      result.errors.some((error) =>
        error.includes("pagesPublicationApproved=false"),
      ),
    );
  });
});

test("portable package cannot elevate the legacy backend to product authority", async () => {
  await withFixture(async (root) => {
    await writeManifest(root, (manifest) => {
      manifest.runtimeBackend.productPhysicsAuthority = true;
      manifest.runtimeBackend.nativeParity = "PROVEN";
    });
    const result = await validatePortableBuild(root);
    assert.ok(
      result.errors.some((error) =>
        error.includes("non-authoritative legacy_ts_m6 backend identity"),
      ),
    );
  });
});

test("portable package rejects an undeclared or escaping runtime asset", async () => {
  await withFixture(async (root) => {
    await writeManifest(root);
    await rewriteManifest(root, (manifest) => {
      manifest.runtimeAssets = ["../private/scan.glb"];
    });
    const result = await validatePortableBuild(root);
    assert.ok(
      result.errors.some((error) => error.includes("unsafe runtime asset path")),
    );
    assert.ok(
      result.errors.some((error) =>
        error.includes("must declare the pinned native receipt"),
      ),
    );
  });
});