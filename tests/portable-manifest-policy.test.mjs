import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { validatePortableManifestPolicy } from "../tools/portable-manifest-policy-lib.mjs";

function manifestWithSource(source) {
  return {
    schemaVersion: 1,
    distribution: "portable_site",
    project: { id: "jv_web_demonstrator", version: "0.1.0" },
    source: {
      repository: "Jozzpoly/JV-Box3D-Web-experiment",
      commit: "a".repeat(40),
      commitDate: "2026-08-04T00:00:00Z",
      workingTreeClean: true,
      ...source,
    },
    runtimeBackend: {
      id: "legacy_ts_m6",
      role: "REFERENCE_BROWSER_FIXTURE",
      productPhysicsAuthority: false,
      nativeParity: "NOT_PROVEN",
    },
    runtimeAssets: ["receipts/jv_m6_factory_receipt.json"],
    complianceFiles: ["THIRD_PARTY_NOTICES.md"],
    publication: {
      mode: "DORMANT",
      pathPortableCandidate: true,
      publicReady: false,
      pagesPublicationApproved: false,
      publishedByBuild: false,
    },
    files: [
      {
        path: "index.html",
        bytes: 1,
        sha256: "b".repeat(64),
      },
    ],
  };
}

async function withManifest(manifest, callback) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-portable-policy-"));
  try {
    await writeFile(
      resolve(root, "build-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("portable manifest accepts a fingerprinted source branch", async () => {
  await withManifest(
    manifestWithSource({
      ref: { state: "BRANCH", fingerprint: "a1b2c3d4e5f6" },
    }),
    async (root) => {
      assert.deepEqual(await validatePortableManifestPolicy(root), []);
    },
  );
});

test("portable manifest accepts detached source without a branch fingerprint", async () => {
  await withManifest(
    manifestWithSource({
      ref: { state: "DETACHED", fingerprint: null },
    }),
    async (root) => {
      assert.deepEqual(await validatePortableManifestPolicy(root), []);
    },
  );
});

test("portable manifest rejects a raw source branch name", async () => {
  await withManifest(
    manifestWithSource({
      branch: "agent/private-working-name",
      ref: { state: "BRANCH", fingerprint: "a1b2c3d4e5f6" },
    }),
    async (root) => {
      const errors = await validatePortableManifestPolicy(root);
      assert.ok(errors.some((error) => error.includes("must not expose")));
      assert.ok(errors.some((error) => error.includes("unknown: branch")));
    },
  );
});

test("portable manifest rejects malformed source-ref fingerprints", async () => {
  await withManifest(
    manifestWithSource({
      ref: { state: "BRANCH", fingerprint: "agent/private" },
    }),
    async (root) => {
      const errors = await validatePortableManifestPolicy(root);
      assert.ok(
        errors.some((error) => error.includes("12-character fingerprint")),
      );
    },
  );
});

test("portable manifest rejects unknown metadata at every protected boundary", async () => {
  const manifest = manifestWithSource({
    ref: { state: "BRANCH", fingerprint: "a1b2c3d4e5f6" },
  });
  manifest.privateNote = "must not travel with the artifact";
  manifest.source.localPath = "private/source/path";
  manifest.runtimeBackend.experimentalAuthority = true;
  manifest.publication.unreviewedFlag = true;
  manifest.files[0].localSourcePath = "private/index-template.html";

  await withManifest(manifest, async (root) => {
    const errors = await validatePortableManifestPolicy(root);
    assert.ok(errors.some((error) => error.includes("unknown: privateNote")));
    assert.ok(errors.some((error) => error.includes("unknown: localPath")));
    assert.ok(
      errors.some((error) => error.includes("unknown: experimentalAuthority")),
    );
    assert.ok(errors.some((error) => error.includes("unknown: unreviewedFlag")));
    assert.ok(
      errors.some((error) => error.includes("unknown: localSourcePath")),
    );
  });
});