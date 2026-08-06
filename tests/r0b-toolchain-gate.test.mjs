import test from "node:test";
import assert from "node:assert/strict";
import {
  assertCleanStatus,
  assertDetachedBranch,
  assertDisposableOutputsAbsent,
  assertExactHexSha,
  assertExactVersion,
  assertReceiptDirectoryOutsideRepository,
  assertRepositoryOrigin,
  createInitialReceipt,
  isPathInside,
  markGatePass,
  markPreflightPass,
  markReceiptFailure,
  normalizeGitHubRepositoryUrl,
  parseCliArguments,
} from "../tools/repair/r0b-toolchain-gate-lib.mjs";

const SHA_A = "a".repeat(40);
const SHA_B = "b".repeat(40);

test("GitHub repository origins normalize without broad hostname matching", () => {
  for (const value of [
    "https://github.com/Jozzpoly/JV-Box3D-Web-experiment.git",
    "git@github.com:Jozzpoly/JV-Box3D-Web-experiment.git",
    "ssh://git@github.com/Jozzpoly/JV-Box3D-Web-experiment.git",
    "git://github.com/Jozzpoly/JV-Box3D-Web-experiment.git",
  ]) {
    assert.equal(
      normalizeGitHubRepositoryUrl(value),
      "jozzpoly/jv-box3d-web-experiment",
    );
  }
  assert.equal(normalizeGitHubRepositoryUrl("https://evil.example/repo.git"), null);
  assert.throws(
    () => assertRepositoryOrigin("https://github.com/other/repo.git", "Jozzpoly/JV-Box3D-Web-experiment"),
    /origin mismatch/,
  );
});

test("exact identity and version checks fail closed", () => {
  assert.doesNotThrow(() => assertExactHexSha("commit", SHA_A, SHA_A));
  assert.throws(() => assertExactHexSha("commit", SHA_A, SHA_B), /mismatch/);
  assert.throws(() => assertExactHexSha("commit", SHA_A, "abc"), /full 40-character/);
  assert.equal(assertExactVersion("Node", "v24.16.0", "24.16.0"), "24.16.0");
  assert.throws(() => assertExactVersion("Node", "24.15.0", "24.16.0"), /mismatch/);
  assert.doesNotThrow(() => assertCleanStatus(""));
  assert.throws(() => assertCleanStatus(" M README.md"), /not clean/);
  assert.doesNotThrow(() => assertDetachedBranch(""));
  assert.throws(() => assertDetachedBranch("repair/jv-web-release-r0"), /detached HEAD/);
});

test("disposable checkout refuses prior generated state", () => {
  assert.doesNotThrow(() => assertDisposableOutputsAbsent([]));
  assert.throws(
    () => assertDisposableOutputsAbsent(["node_modules", "dist"]),
    /generated\/install state/,
  );
});

test("receipt directory must be absolute and outside checkout", () => {
  assert.equal(isPathInside("/repo", "/repo/evidence"), true);
  assert.equal(isPathInside("/repo", "/receipts/run"), false);
  assert.throws(
    () => assertReceiptDirectoryOutsideRepository("/repo", "/repo/evidence"),
    /outside/,
  );
  assert.doesNotThrow(
    () => assertReceiptDirectoryOutsideRepository("/repo", "/receipts/run"),
  );
});

test("CLI parsing requires exact identities and supports preflight-only", () => {
  const options = parseCliArguments([
    "--repo", "/repo",
    "--expected-repository", "Jozzpoly/JV-Box3D-Web-experiment",
    "--expected-commit", SHA_A,
    "--expected-tree", SHA_B,
    "--expected-node", "24.16.0",
    "--expected-npm", "11.13.0",
    "--expected-typescript", "7.0.2",
    "--expected-vite", "8.1.5",
    "--receipt-root", "/receipts",
    "--preflight-only",
  ]);
  assert.equal(options.expectedNode, "24.16.0");
  assert.equal(options.preflightOnly, true);
  assert.throws(() => parseCliArguments(["--repo", "/repo"]), /Missing required/);
  assert.throws(
    () => parseCliArguments([
      "--repo", "/repo", "--repo", "/other",
      "--expected-repository", "x/y",
      "--expected-commit", SHA_A,
      "--expected-tree", SHA_B,
      "--expected-node", "24.16.0",
      "--expected-npm", "11.13.0",
      "--expected-typescript", "7.0.2",
      "--expected-vite", "8.1.5",
      "--receipt-root", "/receipts",
    ]),
    /Duplicate/,
  );
});

test("receipt states never imply canonical evidence before full pass", () => {
  const options = {
    expectedRepository: "Jozzpoly/JV-Box3D-Web-experiment",
    expectedCommit: SHA_A,
    expectedTree: SHA_B,
    expectedNode: "24.16.0",
    expectedNpm: "11.13.0",
    expectedTypeScript: "7.0.2",
    expectedVite: "8.1.5",
  };
  const blocked = createInitialReceipt(options, new Date("2026-08-06T00:00:00Z"));
  markReceiptFailure(blocked, "TOOLCHAIN_PREFLIGHT", new Error("wrong Node"));
  assert.equal(blocked.result, "BLOCKED");
  assert.equal(blocked.canonical, false);

  const preflight = createInitialReceipt(options, new Date("2026-08-06T00:00:00Z"));
  markPreflightPass(preflight);
  assert.equal(preflight.result, "PREFLIGHT_ONLY_PASS");
  assert.equal(preflight.canonical, false);

  const passed = createInitialReceipt(options, new Date("2026-08-06T00:00:00Z"));
  markGatePass(passed);
  assert.equal(passed.result, "PASS");
  assert.equal(passed.canonical, true);
});
