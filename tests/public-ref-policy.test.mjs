import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { auditPublicRefPolicy } from "../tools/public-ref-policy-lib.mjs";

const CANDIDATE_REF =
  "refs/remotes/origin/agent/jv-web-demonstrator-foundation";

function git(root, ...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function createRepository() {
  const root = await mkdtemp(resolve(tmpdir(), "jv-public-ref-policy-"));
  git(root, "init", "--initial-branch=main");
  git(root, "config", "user.name", "JV Ref Policy Fixture");
  git(root, "config", "user.email", "audit@users.noreply.github.com");
  await writeFile(resolve(root, "README.md"), "# Ref fixture\n", "utf8");
  git(root, "add", "README.md");
  git(root, "commit", "-m", "initial fixture");
  git(root, "update-ref", "refs/remotes/origin/main", "HEAD");
  git(root, "switch", "-c", "agent/jv-web-demonstrator-foundation");
  git(root, "update-ref", CANDIDATE_REF, "HEAD");
  return root;
}

async function withRepository(callback) {
  const root = await createRepository();
  try {
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("reviewed main and exact candidate refs pass", async () => {
  await withRepository(async (root) => {
    const report = auditPublicRefPolicy({ root });
    assert.equal(report.status, "PUBLIC_REF_POLICY_PASS");
    assert.deepEqual(report.blockers, []);
    assert.equal(report.reviewed.length, 2);
    assert.equal(report.remoteCandidateCommit, report.headCommit);
  });
});

test("both known orphan refs are explicit blockers", async () => {
  await withRepository(async (root) => {
    git(
      root,
      "update-ref",
      "refs/remotes/origin/agent/f3-regression-snapshot-2026-08-03",
      "HEAD",
    );
    git(
      root,
      "update-ref",
      "refs/remotes/origin/agent/terrain-scan-integration",
      "HEAD",
    );

    const report = auditPublicRefPolicy({ root });
    assert.equal(report.blockedOrphans.length, 2);
    assert.equal(
      report.blockers.filter(
        (blocker) => blocker.signature === "orphan-public-branch",
      ).length,
      2,
    );
  });
});

test("unknown token-like remote ref is blocked and redacted", async () => {
  await withRepository(async (root) => {
    const fakeToken = `ghp_${"R".repeat(36)}`;
    git(
      root,
      "update-ref",
      `refs/remotes/origin/agent/${fakeToken}`,
      "HEAD",
    );

    const report = auditPublicRefPolicy({ root });
    assert.equal(report.unknown.length, 1);
    assert.match(
      report.unknown[0].ref,
      /^\[unclassified remote ref [0-9a-f]{12}\]$/,
    );
    assert.ok(
      report.blockers.some(
        (blocker) => blocker.signature === "unknown-remote-branch",
      ),
    );
    assert.equal(JSON.stringify(report).includes(fakeToken), false);
  });
});

test("every tag is blocked until a release/tag policy exists", async () => {
  await withRepository(async (root) => {
    git(root, "tag", "v0.1-private-candidate");
    const report = auditPublicRefPolicy({ root });
    assert.equal(report.tags.length, 1);
    assert.match(report.tags[0].ref, /^\[unclassified tag [0-9a-f]{12}\]$/);
    assert.ok(
      report.blockers.some((blocker) => blocker.signature === "unknown-tag"),
    );
    assert.equal(JSON.stringify(report).includes("v0.1-private-candidate"), false);
  });
});

test("local HEAD differing from origin candidate is blocked", async () => {
  await withRepository(async (root) => {
    await writeFile(resolve(root, "candidate.txt"), "new local commit\n", "utf8");
    git(root, "add", "candidate.txt");
    git(root, "commit", "-m", "unpublished local candidate");

    const report = auditPublicRefPolicy({ root });
    assert.notEqual(report.headCommit, report.remoteCandidateCommit);
    assert.ok(
      report.blockers.some(
        (blocker) => blocker.signature === "head-does-not-match-origin-candidate",
      ),
    );
  });
});
