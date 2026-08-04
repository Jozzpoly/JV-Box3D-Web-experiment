import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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

async function withRepository(callback) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-public-ref-audit-"));
  try {
    git(root, "init", "--initial-branch=main");
    git(root, "config", "user.name", "JV Audit Fixture");
    git(root, "config", "user.email", "audit@users.noreply.github.com");
    await writeFile(resolve(root, "README.md"), "# Ref audit fixture\n", "utf8");
    await writeFile(resolve(root, "LICENSE"), "fixture license\n", "utf8");
    await writeFile(
      resolve(root, "THIRD_PARTY_NOTICES.md"),
      "fixture notices\n",
      "utf8",
    );
    git(root, "add", "--all");
    git(root, "commit", "-m", "initial fixture");
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("public readiness audit blocks a token-like branch name", async () => {
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
    assert.equal(JSON.stringify(report).includes(fakeToken), true);
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
    assert.equal(JSON.stringify(report).includes(fakeToken), false);
  });
});