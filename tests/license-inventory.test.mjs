import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { inventoryReachableLicenses } from "../tools/license-inventory-lib.mjs";

const MIT_FIXTURE = `MIT License

Copyright (c) 2026 Fixture

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
`;

const APACHE_FIXTURE = `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/
`;

function git(root, ...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function withRepository(callback) {
  const root = await mkdtemp(resolve(tmpdir(), "jv-license-audit-"));
  try {
    git(root, "init", "--initial-branch=main");
    git(root, "config", "user.name", "JV License Fixture");
    git(root, "config", "user.email", "audit@users.noreply.github.com");
    await writeFile(resolve(root, "README.md"), "# Fixture\n", "utf8");
    await writeFile(
      resolve(root, "THIRD_PARTY_NOTICES.md"),
      "fixture third-party notices\n",
      "utf8",
    );
    git(root, "add", "README.md", "THIRD_PARTY_NOTICES.md");
    git(root, "commit", "-m", "initial fixture");
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("license inventory finds MIT that exists only in reachable history", async () => {
  await withRepository(async (root) => {
    await writeFile(resolve(root, "LICENSE"), MIT_FIXTURE, "utf8");
    git(root, "add", "LICENSE");
    git(root, "commit", "-m", "add MIT fixture");
    await rm(resolve(root, "LICENSE"));
    git(root, "add", "--all");
    git(root, "commit", "-m", "remove current license");

    const report = inventoryReachableLicenses({ root });
    assert.deepEqual(report.currentProjectLicensePaths, []);
    assert.deepEqual(report.currentThirdPartyNoticePaths, [
      "THIRD_PARTY_NOTICES.md",
    ]);
    assert.ok(report.detectedProjectLicenses.includes("MIT"));
    assert.ok(
      report.records.some(
        (record) =>
          record.role === "PROJECT_LICENSE" &&
          record.detectedLicense === "MIT" &&
          record.paths.includes("LICENSE") &&
          record.currentPaths.length === 0,
      ),
    );
    assert.ok(
      report.records.some(
        (record) => record.role === "THIRD_PARTY_NOTICE",
      ),
    );
    assert.ok(
      report.findings.some(
        (finding) => finding.id === "CURRENT_PROJECT_LICENSE_MISSING",
      ),
    );
    assert.equal(
      report.findings.some(
        (finding) => finding.id === "CURRENT_THIRD_PARTY_NOTICE_MISSING",
      ),
      false,
    );
  });
});

test("license inventory exposes distinct historical and current project licenses", async () => {
  await withRepository(async (root) => {
    await writeFile(resolve(root, "LICENSE"), MIT_FIXTURE, "utf8");
    git(root, "add", "LICENSE");
    git(root, "commit", "-m", "add MIT fixture");
    await writeFile(resolve(root, "LICENSE"), APACHE_FIXTURE, "utf8");
    git(root, "add", "LICENSE");
    git(root, "commit", "-m", "replace with Apache fixture");

    const report = inventoryReachableLicenses({ root });
    assert.deepEqual(report.currentProjectLicensePaths, ["LICENSE"]);
    assert.ok(report.detectedProjectLicenses.includes("MIT"));
    assert.ok(report.detectedProjectLicenses.includes("Apache-2.0"));
    assert.ok(
      report.findings.some(
        (finding) =>
          finding.id === "MULTIPLE_REACHABLE_PROJECT_LICENSE_TEXTS",
      ),
    );
  });
});

test("third-party notices never satisfy the project-license requirement", async () => {
  await withRepository(async (root) => {
    const report = inventoryReachableLicenses({ root });
    assert.deepEqual(report.currentProjectLicensePaths, []);
    assert.deepEqual(report.currentThirdPartyNoticePaths, [
      "THIRD_PARTY_NOTICES.md",
    ]);
    assert.ok(
      report.findings.some(
        (finding) => finding.id === "CURRENT_PROJECT_LICENSE_MISSING",
      ),
    );
  });
});