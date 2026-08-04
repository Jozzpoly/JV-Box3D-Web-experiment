import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { classifyKnownSafePublicFiles } from "../tools/public-known-safe-files.mjs";

function git(root, ...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function withRepository(npmrc, callback) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-safe-public-file-"));
  try {
    git(root, "init", "--initial-branch=main");
    git(root, "config", "user.name", "JV Safe File Fixture");
    git(root, "config", "user.email", "audit@users.noreply.github.com");
    await writeFile(resolve(root, ".npmrc"), npmrc, "utf8");
    git(root, "add", ".npmrc");
    git(root, "commit", "-m", "add npm policy fixture");
    await callback(root, git(root, "rev-parse", "HEAD:.npmrc"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function sensitiveCurrentNpmrc(objectSha) {
  return {
    kind: "sensitive-filename",
    signature: "sensitive-current-path",
    scope: "current-tree",
    path: ".npmrc",
    objectSha,
  };
}

test("exact credential-free npm policy is accepted explicitly", async () => {
  await withRepository(
    "engine-strict=true\nsave-exact=true\n",
    async (root, objectSha) => {
      const result = classifyKnownSafePublicFiles({
        root,
        blockers: [sensitiveCurrentNpmrc(objectSha)],
      });
      assert.deepEqual(result.blockers, []);
      assert.equal(result.accepted.length, 1);
      assert.equal(result.accepted[0].path, ".npmrc");
      assert.equal(result.accepted[0].objectSha, objectSha);
      assert.match(result.accepted[0].reason, /contains no registry, credential/);
    },
  );
});

test("any npm policy content drift remains blocked", async () => {
  await withRepository(
    "engine-strict=true\nsave-exact=true\nregistry=https://registry.example.test/\n",
    async (root, objectSha) => {
      const blocker = sensitiveCurrentNpmrc(objectSha);
      const result = classifyKnownSafePublicFiles({
        root,
        blockers: [blocker],
      });
      assert.deepEqual(result.blockers, [blocker]);
      assert.deepEqual(result.accepted, []);
    },
  );
});

test("safe current npm policy never waives a historical npmrc finding", async () => {
  await withRepository(
    "engine-strict=true\nsave-exact=true\n",
    async (root, objectSha) => {
      const historical = {
        kind: "sensitive-filename",
        signature: "sensitive-history-path",
        scope: "reachable-history",
        path: ".npmrc",
        objectSha: "f".repeat(40),
      };
      const result = classifyKnownSafePublicFiles({
        root,
        blockers: [sensitiveCurrentNpmrc(objectSha), historical],
      });
      assert.deepEqual(result.blockers, [historical]);
      assert.equal(result.accepted.length, 1);
    },
  );
});
