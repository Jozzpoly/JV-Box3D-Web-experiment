import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { auditPublicReadiness } from "../tools/public-readiness-report.mjs";

const CANDIDATE_REF =
  "refs/remotes/origin/agent/jv-web-demonstrator-foundation";

const PUBLIC_CONTRACTS = Object.freeze({
  "LICENSE": "fixture license\n",
  "THIRD_PARTY_NOTICES.md": "fixture notices\n",
  "SECURITY.md": "# Security fixture\n",
  "CONTRIBUTING.md": "# Contributing fixture\n",
  "docs/PROJECT_STATE.md": "# State fixture\n",
  "docs/PUBLIC_COLLABORATION_HISTORY.md": "# History fixture\n",
  "docs/PUBLIC_ASSET_RIGHTS_POLICY.md": "# Asset fixture\n",
  "docs/operations/SOURCE_PUBLIC_RELEASE_RUNBOOK_PL.md":
    "# Release fixture\n",
});

function git(root, ...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function syncCandidateRef(root) {
  git(root, "update-ref", CANDIDATE_REF, "HEAD");
}

async function withRepository(callback) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-public-ref-audit-"));
  try {
    git(root, "init", "--initial-branch=main");
    git(root, "config", "user.name", "JV Audit Fixture");
    git(root, "config", "user.email", "audit@users.noreply.github.com");
    await mkdir(resolve(root, "docs", "operations"), { recursive: true });
    await writeFile(resolve(root, "README.md"), "# Ref audit fixture\n", "utf8");
    for (const [path, content] of Object.entries(PUBLIC_CONTRACTS)) {
      await writeFile(resolve(root, path), content, "utf8");
    }
    git(root, "add", "--all");
    git(root, "commit", "-m", "initial fixture");
    git(root, "update-ref", "refs/remotes/origin/main", "HEAD");
    git(root, "switch", "-c", "agent/jv-web-demonstrator-foundation");
    syncCandidateRef(root);
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("public readiness audit blocks and redacts a token-like branch name", async () => {
  await withRepository(async (root) => {
    const fakeToken = `ghp_${"B".repeat(36)}`;
    git(root, "branch", `historical/${fakeToken}`);

    const report = await auditPublicReadiness({
      root,
      repository: "fixture/ref-name-secret",
    });
    const finding = report.blockers.find(
      (entry) =>
        entry.signature === "github-token" &&
        entry.scope === "git-ref-name",
    );
    assert.ok(finding);
    assert.match(finding.path, /^\[redacted ref [0-9a-f]{12}\]$/);
    assert.equal(JSON.stringify(report).includes(fakeToken), false);
    assert.equal(report.publicRefPolicy.status, "PUBLIC_REF_POLICY_PASS");
    assert.ok(
      report.refs.every(
        (entry) =>
          typeof entry.namespace === "string" &&
          /^[0-9a-f]{12}$/.test(entry.fingerprint),
      ),
    );
  });
});

test("public readiness report never stores a token-like current branch name", async () => {
  await withRepository(async (root) => {
    const fakeToken = `ghp_${"E".repeat(36)}`;
    git(root, "switch", "-c", `current/${fakeToken}`);
    syncCandidateRef(root);

    const report = await auditPublicReadiness({
      root,
      repository: "fixture/current-branch-secret",
    });
    assert.ok(
      report.blockers.some(
        (entry) =>
          entry.signature === "github-token" &&
          entry.scope === "source-branch-name",
      ),
    );
    assert.deepEqual(Object.keys(report.sourceRef).sort(), [
      "fingerprint",
      "state",
    ]);
    assert.equal(report.sourceRef.state, "BRANCH");
    assert.match(report.sourceRef.fingerprint, /^[0-9a-f]{12}$/);
    assert.equal("sourceBranch" in report, false);
    assert.equal(JSON.stringify(report).includes(fakeToken), false);
    assert.equal(report.publicRefPolicy.status, "PUBLIC_REF_POLICY_PASS");
  });
});

test("public readiness audit scans annotated tag metadata", async () => {
  await withRepository(async (root) => {
    const fakeToken = `ghp_${"C".repeat(36)}`;
    git(root, "tag", "-a", "fixture-tag", "-m", `historical ${fakeToken}`);

    const report = await auditPublicReadiness({
      root,
      repository: "fixture/tag-metadata-secret",
    });
    const finding = report.blockers.find(
      (entry) =>
        entry.signature === "github-token" &&
        entry.scope === "reachable-history-metadata",
    );
    assert.ok(finding);
    assert.ok(
      report.blockers.some((entry) => entry.signature === "unknown-tag"),
    );
    assert.equal(JSON.stringify(report).includes(fakeToken), false);
  });
});
