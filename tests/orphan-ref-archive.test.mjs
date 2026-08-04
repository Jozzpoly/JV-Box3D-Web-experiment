import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { createOrphanRefArchive } from "../tools/orphan-ref-archive-lib.mjs";

const ORPHAN_A = "refs/remotes/origin/agent/f3-regression-snapshot-2026-08-03";
const ORPHAN_B = "refs/remotes/origin/agent/terrain-scan-integration";

function git(root, ...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function createRepository({ ignoredOutput = true } = {}) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-orphan-archive-"));
  git(root, "init", "--initial-branch=main");
  git(root, "config", "user.name", "JV Archive Fixture");
  git(root, "config", "user.email", "audit@users.noreply.github.com");
  await writeFile(
    resolve(root, ".gitignore"),
    ignoredOutput ? ".local-audit/\n" : "dist/\n",
    "utf8",
  );
  await writeFile(resolve(root, "README.md"), "# Archive fixture\n", "utf8");
  git(root, "add", ".gitignore", "README.md");
  git(root, "commit", "-m", "initial fixture");
  const mainCommit = git(root, "rev-parse", "HEAD");

  git(root, "switch", "-c", "snapshot");
  await writeFile(resolve(root, "snapshot.txt"), "snapshot\n", "utf8");
  git(root, "add", "snapshot.txt");
  git(root, "commit", "-m", "snapshot fixture");
  git(root, "update-ref", ORPHAN_A, "HEAD");

  git(root, "switch", "--detach", mainCommit);
  git(root, "switch", "-c", "terrain");
  await writeFile(resolve(root, "terrain.txt"), "terrain\n", "utf8");
  git(root, "add", "terrain.txt");
  git(root, "commit", "-m", "terrain fixture");
  git(root, "update-ref", ORPHAN_B, "HEAD");

  git(root, "switch", "main");
  await mkdir(resolve(root, ".local-audit"), { recursive: true });
  return root;
}

async function withRepository(options, callback) {
  const root = await createRepository(options);
  try {
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("orphan refs produce a verified exact private bundle without moving refs", async () => {
  await withRepository({}, async (root) => {
    const bundlePath = resolve(root, ".local-audit", "orphan.bundle");
    const beforeA = git(root, "rev-parse", ORPHAN_A);
    const beforeB = git(root, "rev-parse", ORPHAN_B);

    const receipt = await createOrphanRefArchive({
      root,
      bundlePath,
      refs: [ORPHAN_A, ORPHAN_B],
    });

    assert.equal(receipt.schemaVersion, 1);
    assert.equal(receipt.remoteRefsDeleted, false);
    assert.equal(receipt.sourceRefsUnchanged, true);
    assert.match(receipt.sha256, /^[0-9a-f]{64}$/);
    assert.ok(receipt.bytes > 0);
    assert.equal(receipt.refs.length, 2);
    assert.equal(receipt.bundleHeads.length, 2);
    assert.equal(git(root, "rev-parse", ORPHAN_A), beforeA);
    assert.equal(git(root, "rev-parse", ORPHAN_B), beforeB);
    assert.match(git(root, "bundle", "verify", bundlePath), /is okay/);
    assert.ok((await readFile(bundlePath)).byteLength === receipt.bytes);
  });
});

test("archive refuses to overwrite an existing recovery artifact", async () => {
  await withRepository({}, async (root) => {
    const bundlePath = resolve(root, ".local-audit", "orphan.bundle");
    await writeFile(bundlePath, "existing recovery artifact\n", "utf8");
    await assert.rejects(
      createOrphanRefArchive({
        root,
        bundlePath,
        refs: [ORPHAN_A, ORPHAN_B],
      }),
      /will not be overwritten/,
    );
    assert.equal(
      await readFile(bundlePath, "utf8"),
      "existing recovery artifact\n",
    );
  });
});

test("archive refuses a dirty working tree and removes no source data", async () => {
  await withRepository({}, async (root) => {
    const bundlePath = resolve(root, ".local-audit", "orphan.bundle");
    await writeFile(resolve(root, "README.md"), "# Dirty fixture\n", "utf8");
    const beforeA = git(root, "rev-parse", ORPHAN_A);
    await assert.rejects(
      createOrphanRefArchive({
        root,
        bundlePath,
        refs: [ORPHAN_A, ORPHAN_B],
      }),
      /clean working tree/,
    );
    assert.equal(git(root, "rev-parse", ORPHAN_A), beforeA);
  });
});

test("archive output must already be covered by Git ignore policy", async () => {
  await withRepository({ ignoredOutput: false }, async (root) => {
    const bundlePath = resolve(root, ".local-audit", "orphan.bundle");
    await assert.rejects(
      createOrphanRefArchive({
        root,
        bundlePath,
        refs: [ORPHAN_A, ORPHAN_B],
      }),
      /must be ignored by Git/,
    );
  });
});
