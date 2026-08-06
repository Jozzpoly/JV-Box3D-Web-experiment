import assert from "node:assert/strict";
import test from "node:test";
import {
  assertExternalAbsolutePath,
  compareToolchainReceipts,
  createSameOsReceipt,
  normalizeArtifactFileTable,
  normalizeCommandPlan,
  parseSameOsArguments,
} from "../tools/repair/r0b-same-os-candidate-lib.mjs";

function baseReceipt({ preflight = false, fileSha = "a".repeat(64) } = {}) {
  return {
    schema: "JV_WEB_R0B_TOOLCHAIN_RECEIPT_V1",
    result: preflight ? "PREFLIGHT_ONLY_PASS" : "PASS",
    canonical: !preflight,
    expectations: {
      repository: "Jozzpoly/JV-Box3D-Web-experiment",
      node: "24.16.0",
      npm: "11.13.0",
      typescript: "7.0.2",
      vite: "8.1.5",
    },
    identity: {
      commit: "1".repeat(40),
      tree: "2".repeat(40),
    },
    environment: {
      platform: "linux",
      arch: "x64",
      osRelease: "test-release",
      osVersion: "test-version",
      endianness: "LE",
      node: "24.16.0",
      npm: "11.13.0",
      typescript: preflight ? undefined : "7.0.2",
      vite: preflight ? undefined : "8.1.5",
      nodeExecutableSha256: "6".repeat(64),
      npmCliSha256: "7".repeat(64),
    },
    lock: {
      beforeSha256: "3".repeat(64),
      afterSha256: preflight ? null : "3".repeat(64),
    },
    packageJsonSha256: "4".repeat(64),
    dependencies: preflight
      ? null
      : { logicalTreeSha256: "8".repeat(64), nativePackages: [] },
    commands: [
      { command: "/node", args: ["npm-cli.js", "--version"], status: 0 },
    ],
    artifact: preflight
      ? null
      : {
          manifestSha256: "5".repeat(64),
          files: [{ path: "index.html", bytes: 10, sha256: fileSha }],
        },
  };
}

test("same-OS full receipts compare byte-identically", () => {
  const result = compareToolchainReceipts(baseReceipt(), baseReceipt());
  assert.equal(result.identical, true);
  assert.equal(result.mode, "FULL_GATE");
  assert.equal(result.artifact.fileCountA, 1);
});

test("same-OS comparison reports artifact mismatch", () => {
  const result = compareToolchainReceipts(
    baseReceipt(),
    baseReceipt({ fileSha: "b".repeat(64) }),
  );
  assert.equal(result.identical, false);
  assert.ok(result.differences.includes("artifact file table"));
});

test("preflight receipts remain non-canonical", () => {
  const result = compareToolchainReceipts(
    baseReceipt({ preflight: true }),
    baseReceipt({ preflight: true }),
    { preflightOnly: true },
  );
  assert.equal(result.identical, true);
  assert.equal(result.mode, "PREFLIGHT_ONLY");
  assert.equal(result.artifact, null);
});

test("artifact table rejects duplicate paths", () => {
  assert.throws(
    () => normalizeArtifactFileTable([
      { path: "x", bytes: 1, sha256: "a".repeat(64) },
      { path: "x", bytes: 1, sha256: "a".repeat(64) },
    ]),
    /duplicate path/,
  );
});

test("receipt root must remain outside repository", () => {
  assert.throws(
    () => assertExternalAbsolutePath("/repo", "/repo/evidence", "Receipt root"),
    /outside/,
  );
});

test("same-OS CLI parser requires exact candidate fields", () => {
  const parsed = parseSameOsArguments([
    "--repo", "/repo",
    "--expected-repository", "Jozzpoly/JV-Box3D-Web-experiment",
    "--expected-commit", "1".repeat(40),
    "--expected-tree", "2".repeat(40),
    "--expected-node", "24.16.0",
    "--expected-npm", "11.13.0",
    "--expected-typescript", "7.0.2",
    "--expected-vite", "8.1.5",
    "--receipt-root", "/evidence",
    "--preflight-only",
  ]);
  assert.equal(parsed.preflightOnly, true);
  assert.equal(parsed.expectedNpm, "11.13.0");
});

test("same-OS receipt is never canonical while running", () => {
  const receipt = createSameOsReceipt({
    preflightOnly: false,
    expectedRepository: "repo",
    expectedCommit: "1".repeat(40),
    expectedTree: "2".repeat(40),
    expectedNode: "24.16.0",
    expectedNpm: "11.13.0",
    expectedTypeScript: "7.0.2",
    expectedVite: "8.1.5",
    repositoryRoot: "/repo",
    receiptRoot: "/evidence",
  });
  assert.equal(receipt.result, "RUNNING");
  assert.equal(receipt.canonical, false);
});


test("same-OS comparison reports command-plan mismatch", () => {
  const a = baseReceipt();
  const b = baseReceipt();
  b.commands[0].args = ["npm-cli.js", "ci"];
  const result = compareToolchainReceipts(a, b);
  assert.equal(result.identical, false);
  assert.ok(result.differences.includes("shared identity/toolchain/dependencies/commands"));
});

test("command plan rejects non-integer status", () => {
  assert.throws(
    () => normalizeCommandPlan([{ command: "node", args: [], status: "0" }]),
    /status must be an integer/,
  );
});

test("receipt root must remain outside the common Git directory", () => {
  assert.throws(
    () => assertExternalAbsolutePath("/repo/.git", "/repo/.git/r0b", "Receipt root"),
    /outside/,
  );
});
