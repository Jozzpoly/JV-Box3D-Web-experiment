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

test("public readiness report redacts privacy identifiers inside blocker paths", async () => {
  const root = await mkdtemp(resolve(tmpdir(), "jv-public-report-sanitize-"));
  const privateIdentifier = "owner-private@example.net";
  try {
    git(root, "init", "--initial-branch=main");
    git(root, "config", "user.name", "JV Audit Fixture");
    git(root, "config", "user.email", "audit@users.noreply.github.com");
    await mkdir(resolve(root, "docs", "operations"), { recursive: true });
    await writeFile(resolve(root, "README.md"), "# Fixture\n", "utf8");
    for (const [path, content] of Object.entries(PUBLIC_CONTRACTS)) {
      await writeFile(resolve(root, path), content, "utf8");
    }
    await mkdir(resolve(root, privateIdentifier), { recursive: true });
    await writeFile(
      resolve(root, privateIdentifier, ".env"),
      "SAFE_FIXTURE_VALUE=true\n",
      "utf8",
    );
    git(root, "add", "--all");
    git(root, "commit", "-m", "add privacy-path fixture");
    git(root, "update-ref", "refs/remotes/origin/main", "HEAD");
    git(root, "switch", "-c", "agent/jv-web-demonstrator-foundation");
    git(root, "update-ref", CANDIDATE_REF, "HEAD");

    const report = await auditPublicReadiness({
      root,
      repository: "fixture/privacy-path",
    });
    assert.deepEqual(report.publicContracts.missing, []);
    assert.equal(report.publicRefPolicy.status, "PUBLIC_REF_POLICY_PASS");
    assert.ok(
      report.blockers.some(
        (finding) => finding.signature === "sensitive-current-path",
      ),
    );
    assert.ok(
      report.reviewFindings.some(
        (finding) => finding.signature === "email-address",
      ),
    );
    assert.equal(JSON.stringify(report).includes(privateIdentifier), false);
    assert.ok(
      [...report.blockers, ...report.reviewFindings].every(
        (finding) => !String(finding.path).includes("@"),
      ),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
