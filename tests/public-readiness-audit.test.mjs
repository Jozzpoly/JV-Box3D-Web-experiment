import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { auditPublicReadiness } from "../tools/public-readiness-lib.mjs";

function git(root, ...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function createRepository({ publicContracts = true } = {}) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-public-audit-"));
  git(root, "init", "--initial-branch=main");
  git(root, "config", "user.name", "JV Audit Fixture");
  git(root, "config", "user.email", "audit@users.noreply.github.com");
  git(root, "config", "core.symlinks", "false");

  await writeFile(resolve(root, "README.md"), "# Audit fixture\n", "utf8");
  if (publicContracts) {
    await writeFile(resolve(root, "LICENSE"), "fixture license\n", "utf8");
    await writeFile(
      resolve(root, "THIRD_PARTY_NOTICES.md"),
      "fixture notices\n",
      "utf8",
    );
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

test("public readiness audit passes a clean minimal repository", async () => {
  await withRepository({}, async (root) => {
    const report = await auditPublicReadiness({
      root,
      repository: "fixture/clean",
    });
    assert.equal(report.status, "PUBLIC_READY_AUDIT_PASS");
    assert.deepEqual(report.blockers, []);
    assert.equal(report.metrics.currentTrackedFiles, 3);
    assert.ok(report.metrics.reachableBlobs >= 3);
  });
});

test("public readiness audit blocks missing public contracts", async () => {
  await withRepository({ publicContracts: false }, async (root) => {
    const report = await auditPublicReadiness({
      root,
      repository: "fixture/missing-contracts",
    });
    assert.equal(report.status, "PUBLIC_READY_AUDIT_FAIL");
    assert.ok(
      report.blockers.some((finding) => finding.signature === "LICENSE"),
    );
    assert.ok(
      report.blockers.some(
        (finding) => finding.signature === "THIRD_PARTY_NOTICES.md",
      ),
    );
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