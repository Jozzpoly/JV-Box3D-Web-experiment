import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { validatePortableManifestPolicy } from "../tools/portable-manifest-policy-lib.mjs";

async function withManifest(source, callback) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-portable-policy-"));
  try {
    await writeFile(
      resolve(root, "build-manifest.json"),
      `${JSON.stringify({ source }, null, 2)}\n`,
      "utf8",
    );
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("portable manifest accepts a fingerprinted source branch", async () => {
  await withManifest(
    {
      ref: { state: "BRANCH", fingerprint: "a1b2c3d4e5f6" },
    },
    async (root) => {
      assert.deepEqual(await validatePortableManifestPolicy(root), []);
    },
  );
});

test("portable manifest accepts detached source without a branch fingerprint", async () => {
  await withManifest(
    {
      ref: { state: "DETACHED", fingerprint: null },
    },
    async (root) => {
      assert.deepEqual(await validatePortableManifestPolicy(root), []);
    },
  );
});

test("portable manifest rejects a raw source branch name", async () => {
  await withManifest(
    {
      branch: "agent/private-working-name",
      ref: { state: "BRANCH", fingerprint: "a1b2c3d4e5f6" },
    },
    async (root) => {
      const errors = await validatePortableManifestPolicy(root);
      assert.ok(errors.some((error) => error.includes("must not expose")));
    },
  );
});

test("portable manifest rejects malformed source-ref fingerprints", async () => {
  await withManifest(
    {
      ref: { state: "BRANCH", fingerprint: "agent/private" },
    },
    async (root) => {
      const errors = await validatePortableManifestPolicy(root);
      assert.ok(
        errors.some((error) => error.includes("12-character fingerprint")),
      );
    },
  );
});