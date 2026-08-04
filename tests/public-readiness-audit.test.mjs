import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { auditPublicReadiness } from "../tools/public-readiness-report.mjs";

const PUBLIC_CONTRACT_FIXTURES = Object.freeze({
  "LICENSE": "fixture license\n",
  "THIRD_PARTY_NOTICES.md": "fixture notices\n",
  "SECURITY.md": "# Security fixture\n",
  "CONTRIBUTING.md": "# Contributing fixture\n",
  "docs/PROJECT_STATE.md": "# Project-state fixture\n",
  "docs/PUBLIC_COLLABORATION_HISTORY.md": "# Collaboration-history fixture\n",
  "docs/PUBLIC_ASSET_RIGHTS_POLICY.md": "# Asset-rights fixture\n",
  "docs/operations/SOURCE_PUBLIC_RELEASE_RUNBOOK_PL.md":
    "# Source-public release fixture\n",
});

function git(root, ...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function writePublicContracts(root) {
  await mkdir(resolve(root, "docs", "operations"), { recursive: true });
  for (const [path, content] of Object.entries(PUBLIC_CONTRACT_FIXTURES)) {
    await writeFile(resolve(root, path), content, "utf8");
  }
}

async function createRepository({ publicContracts = true } = {}) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-public-audit-"));
  git(root, "init", "--initial-branch=main");
  git(root, "config", "user.name", "JV Audit Fixture");
  git(root, "config", "user.email", "audit@users.noreply.github.com");
  git(root, "config", "core.symlinks", "false");

  await writeFile(resolve(root, "README.md"), "# Audit fixture\n", "utf8");
  if (publicContracts) {
    await writePublicContracts(root);
  }
  git(root, "add", "--all");
  git(root, "commit", "-m", "initial fixture");
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

test("public readiness audit passes a clean minimal public repository", async () => {
  await withRepository({}, async (root) => {
    const report = await auditPublicReadiness({
      root,
      repository: "fixture/clean",
    });
    assert.equal(report.status, "PUBLIC_READY_AUDIT_PASS");
    assert.deepEqual(report.blockers, []);
    assert.equal(report.metrics.currentTrackedFiles, 9);
    assert.equal(report.metrics.requiredPublicContracts, 9);
    assert.equal(report.metrics.presentPublicContracts, 9);
    assert.deepEqual(report.publicContracts.missing, []);
    assert.ok(report.metrics.reachableBlobs >= 9);
  });
});

test("public readiness audit blocks the complete missing public surface", async () => {
  await withRepository({ publicContracts: false }, async (root) => {
    const report = await auditPublicReadiness({
      root,
      repository: "fixture/missing-contracts",
    });
    assert.equal(report.status, "PUBLIC_READY_AUDIT_FAIL");
    for (const requiredPath of [
      "LICENSE",
      "THIRD_PARTY_NOTICES.md",
      "SECURITY.md",
      "CONTRIBUTING.md",
      "docs/PROJECT_STATE.md",
      "docs/PUBLIC_COLLABORATION_HISTORY.md",
      "docs/PUBLIC_ASSET_RIGHTS_POLICY.md",
      "docs/operations/SOURCE_PUBLIC_RELEASE_RUNBOOK_PL.md",
    ]) {
      assert.ok(
        report.blockers.some(
          (finding) => finding.signature === requiredPath,
        ),
        `missing blocker for ${requiredPath}`,
      );
    }
    assert.deepEqual(report.publicContracts.present, ["README.md"]);
    assert.equal(report.publicContracts.missing.length, 8);
  });
});

test("public readiness audit blocks one removed public contract", async () => {
  await withRepository({}, async (root) => {
    await rm(resolve(root, "SECURITY.md"));
    git(root, "add", "--all");
    git(root, "commit", "-m", "remove security fixture");

    const report = await auditPublicReadiness({
      root,
      repository: "fixture/one-missing-contract",
    });
    assert.ok(
      report.blockers.some(
        (finding) => finding.signature === "SECURITY.md",
      ),
    );
    assert.deepEqual(report.publicContracts.missing, ["SECURITY.md"]);
    assert.equal(report.metrics.presentPublicContracts, 8);
  });
});

test("public readiness audit finds a token removed from the current tree", async () => {
  await withRepository({}, async (root) => {
    const fakeToken = `ghp_${"A".repeat(36)}`;
    await writeFile(
      resolve(root, "historical-note.txt"),
      `temporary fixture token: ${fakeToken}\n`,
      "utf8",
    );
    git(root, "add", "historical-note.txt");
    git(root, "commit", "-m", "add historical fixture token");
    await rm(resolve(root, "historical-note.txt"));
    git(root, "add", "--all");
    git(root, "commit", "-m", "remove historical fixture token");

    const report = await auditPublicReadiness({
      root,
      repository: "fixture/history-secret",
    });
    const finding = report.blockers.find(
      (entry) =>
        entry.signature === "github-token" &&
        entry.scope === "reachable-history" &&
        entry.path === "historical-note.txt",
    );
    assert.ok(finding);
    assert.equal(typeof finding.fingerprint, "string");
    assert.equal(finding.fingerprint.length, 12);
    assert.equal(JSON.stringify(report).includes(fakeToken), false);
  });
});

test("public readiness audit blocks a dirty working tree", async () => {
  await withRepository({}, async (root) => {
    await writeFile(resolve(root, "README.md"), "# Changed locally\n", "utf8");
    const report = await auditPublicReadiness({
      root,
      repository: "fixture/dirty",
    });
    assert.ok(
      report.blockers.some(
        (finding) => finding.signature === "working-tree-not-clean",
      ),
    );
  });
});

test("public readiness audit records a tracked symlink without following it", async () => {
  await withRepository({}, async (root) => {
    const target = "../outside-private-file";
    const blobSha = execFileSync("git", ["hash-object", "-w", "--stdin"], {
      cwd: root,
      input: target,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    git(
      root,
      "update-index",
      "--add",
      "--cacheinfo",
      "120000",
      blobSha,
      "external-link",
    );
    git(root, "commit", "-m", "add symlink fixture");
    git(root, "checkout", "--", "external-link");

    const report = await auditPublicReadiness({
      root,
      repository: "fixture/symlink",
    });
    assert.ok(
      report.reviewFindings.some(
        (finding) =>
          finding.kind === "tracked-symlink" &&
          finding.path === "external-link",
      ),
    );
  });
});

test("public readiness report redacts a token-like filename everywhere", async () => {
  await withRepository({}, async (root) => {
    const fakeToken = `ghp_${"D".repeat(36)}`;
    const filename = `${fakeToken}.txt`;
    await writeFile(resolve(root, filename), "safe fixture body\n", "utf8");
    git(root, "add", filename);
    git(root, "commit", "-m", "add token-like filename fixture");

    const report = await auditPublicReadiness({
      root,
      repository: "fixture/filename-secret",
    });
    assert.ok(
      report.blockers.some(
        (finding) =>
          finding.signature === "github-token" &&
          finding.scope === "git-path-name",
      ),
    );
    assert.equal(JSON.stringify(report).includes(fakeToken), false);
  });
});
