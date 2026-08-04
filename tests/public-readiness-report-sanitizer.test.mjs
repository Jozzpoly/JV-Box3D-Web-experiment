import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { auditPublicReadiness } from "../tools/public-readiness-report.mjs";

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
    await writeFile(resolve(root, "README.md"), "# Fixture\n", "utf8");
    await writeFile(resolve(root, "LICENSE"), "fixture license\n", "utf8");
    await writeFile(
      resolve(root, "THIRD_PARTY_NOTICES.md"),
      "fixture notices\n",
      "utf8",
    );
    await mkdir(resolve(root, privateIdentifier), { recursive: true });
    await writeFile(
      resolve(root, privateIdentifier, ".env"),
      "SAFE_FIXTURE_VALUE=true\n",
      "utf8",
    );
    git(root, "add", "--all");
    git(root, "commit", "-m", "add privacy-path fixture");

    const report = await auditPublicReadiness({
      root,
      repository: "fixture/privacy-path",
    });
    assert.ok(
      report.blockers.some(
        (finding) => finding.signature === "sensitive-current-path",
      ),
    );
    assert.equal(JSON.stringify(report).includes(privateIdentifier), false);
    assert.ok(
      report.reviewFindings.some(
        (finding) => finding.signature === "email-address",
      ),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});