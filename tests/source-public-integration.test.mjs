import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { evaluateSourcePublicIntegration } from "../tools/source-public-integration-lib.mjs";

function git(root, ...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function createRepository() {
  const root = await mkdtemp(resolve(tmpdir(), "jv-integration-proof-"));
  git(root, "init", "--initial-branch=main");
  git(root, "config", "user.name", "JV Integration Fixture");
  git(root, "config", "user.email", "audit@users.noreply.github.com");
  await writeFile(resolve(root, "README.md"), "# Initial\n", "utf8");
  git(root, "add", "README.md");
  git(root, "commit", "-m", "initial fixture");
  git(root, "update-ref", "refs/remotes/origin/main", "HEAD");
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

test("pure descendant is an exact fast-forward candidate", async () => {
  await withRepository(async (root) => {
    git(root, "switch", "-c", "agent/jv-web-demonstrator-foundation");
    await writeFile(resolve(root, "README.md"), "# Candidate\n", "utf8");
    git(root, "add", "README.md");
    git(root, "commit", "-m", "candidate fixture");

    const report = evaluateSourcePublicIntegration({
      root,
      baseRef: "origin/main",
      candidateRef: "HEAD",
      expectedCandidateBranch: "agent/jv-web-demonstrator-foundation",
    });
    assert.equal(report.status, "FAST_FORWARD_CANDIDATE");
    assert.equal(report.fastForwardPossible, true);
    assert.equal(report.baseIsAncestor, true);
    assert.equal(report.candidateBehind, 0);
    assert.equal(report.candidateAhead, 1);
    assert.equal(report.mergeBase, report.baseCommit);
    assert.deepEqual(report.blockers, []);
  });
});

test("divergent main and candidate are blocked", async () => {
  await withRepository(async (root) => {
    const initial = git(root, "rev-parse", "HEAD");
    git(root, "switch", "-c", "agent/jv-web-demonstrator-foundation");
    await writeFile(resolve(root, "candidate.txt"), "candidate\n", "utf8");
    git(root, "add", "candidate.txt");
    git(root, "commit", "-m", "candidate fixture");

    git(root, "switch", "--detach", initial);
    await writeFile(resolve(root, "main-only.txt"), "main only\n", "utf8");
    git(root, "add", "main-only.txt");
    git(root, "commit", "-m", "divergent main fixture");
    git(root, "update-ref", "refs/remotes/origin/main", "HEAD");
    git(root, "switch", "agent/jv-web-demonstrator-foundation");

    const report = evaluateSourcePublicIntegration({
      root,
      baseRef: "origin/main",
      candidateRef: "HEAD",
      expectedCandidateBranch: "agent/jv-web-demonstrator-foundation",
    });
    assert.equal(report.fastForwardPossible, false);
    assert.equal(report.candidateBehind, 1);
    assert.equal(report.candidateAhead, 1);
    assert.ok(
      report.blockers.some((blocker) => blocker.id === "BASE_NOT_ANCESTOR"),
    );
  });
});

test("dirty candidate cannot receive an exact integration proof", async () => {
  await withRepository(async (root) => {
    git(root, "switch", "-c", "agent/jv-web-demonstrator-foundation");
    await writeFile(resolve(root, "README.md"), "# Dirty candidate\n", "utf8");

    const report = evaluateSourcePublicIntegration({
      root,
      baseRef: "origin/main",
      candidateRef: "HEAD",
      expectedCandidateBranch: "agent/jv-web-demonstrator-foundation",
    });
    assert.equal(report.fastForwardPossible, false);
    assert.ok(
      report.blockers.some((blocker) => blocker.id === "DIRTY_WORKING_TREE"),
    );
  });
});

test("unexpected candidate branch is blocked without moving refs", async () => {
  await withRepository(async (root) => {
    const beforeMain = git(root, "rev-parse", "origin/main");
    const beforeHead = git(root, "rev-parse", "HEAD");
    const report = evaluateSourcePublicIntegration({
      root,
      baseRef: "origin/main",
      candidateRef: "HEAD",
      expectedCandidateBranch: "agent/jv-web-demonstrator-foundation",
    });
    assert.ok(
      report.blockers.some(
        (blocker) => blocker.id === "UNEXPECTED_CANDIDATE_BRANCH",
      ),
    );
    assert.equal(git(root, "rev-parse", "origin/main"), beforeMain);
    assert.equal(git(root, "rev-parse", "HEAD"), beforeHead);
  });
});
