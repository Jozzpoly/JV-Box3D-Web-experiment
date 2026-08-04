import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { auditOrphanRefHistories } from "../tools/orphan-ref-history-audit-lib.mjs";

const BASELINE_REF =
  "refs/remotes/origin/agent/jv-web-demonstrator-foundation";
const TERRAIN_REF =
  "refs/remotes/origin/agent/terrain-scan-integration";
const SNAPSHOT_REF =
  "refs/remotes/origin/agent/f3-regression-snapshot-2026-08-03";

function git(root, ...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function createRepository() {
  const root = await mkdtemp(resolve(tmpdir(), "jv-orphan-history-"));
  git(root, "init", "--initial-branch=main");
  git(root, "config", "user.name", "JV Orphan Audit Fixture");
  git(root, "config", "user.email", "audit@users.noreply.github.com");
  await writeFile(resolve(root, "README.md"), "# Orphan history fixture\n", "utf8");
  git(root, "add", "README.md");
  git(root, "commit", "-m", "initial fixture");
  const mainCommit = git(root, "rev-parse", "HEAD");

  git(root, "switch", "-c", "agent/jv-web-demonstrator-foundation");
  await writeFile(resolve(root, "candidate.ts"), "export const candidate = true;\n", "utf8");
  git(root, "add", "candidate.ts");
  git(root, "commit", "-m", "candidate fixture");
  git(root, "update-ref", BASELINE_REF, "HEAD");

  return { root, mainCommit };
}

async function withRepository(callback) {
  const fixture = await createRepository();
  try {
    await callback(fixture);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
}

test("deleted secret, model, workflow and local bridge remain visible in unique history", async () => {
  await withRepository(async ({ root, mainCommit }) => {
    const fakeToken = `ghp_${"H".repeat(36)}`;
    const privatePath = "C:\\Users\\Owner\\JV\\build\\jozz_vehicle_m6_session.json";

    git(root, "switch", "--detach", mainCommit);
    git(root, "switch", "-c", "terrain");
    await mkdir(resolve(root, "assets"), { recursive: true });
    await mkdir(resolve(root, ".github", "workflows"), { recursive: true });
    await writeFile(
      resolve(root, "assets", "private-scan.glb"),
      Buffer.from([0x67, 0x6c, 0x54, 0x46, 0x00, 0x01, 0x02, 0x03]),
    );
    await writeFile(
      resolve(root, ".github", "workflows", "build.yml"),
      "name: historical build\non: workflow_dispatch\n",
      "utf8",
    );
    await writeFile(
      resolve(root, "asset-bridge.mjs"),
      `const nativeRoot = process.env.JV_NATIVE_ROOT;\n` +
        `const sourceRef = process.env.JV_SOURCE_REF;\n` +
        `const session = ${JSON.stringify(privatePath)};\n` +
        `const provenance = "local-working-tree";\n` +
        `const token = "${fakeToken}";\n` +
        `console.log("sync-jv-assets", nativeRoot, sourceRef, session, provenance, token);\n`,
      "utf8",
    );
    git(root, "add", "--all");
    git(root, "commit", "-m", "add private historical bridge fixture");

    await rm(resolve(root, "assets"), { recursive: true, force: true });
    await rm(resolve(root, ".github"), { recursive: true, force: true });
    await rm(resolve(root, "asset-bridge.mjs"));
    git(root, "add", "--all");
    git(root, "commit", "-m", "remove private historical bridge fixture");
    git(root, "update-ref", TERRAIN_REF, "HEAD");
    git(root, "switch", "agent/jv-web-demonstrator-foundation");

    const report = auditOrphanRefHistories({
      root,
      orphanRefs: [TERRAIN_REF],
      baselineRef: BASELINE_REF,
    });
    const result = report.results[0];

    assert.equal(result.uniqueCommitCount, 2);
    assert.ok(
      result.assetCandidates.some(
        (entry) =>
          entry.path === "assets/private-scan.glb" && entry.role === "MODEL",
      ),
    );
    assert.ok(
      result.workflowCandidates.some(
        (entry) => entry.path === ".github/workflows/build.yml",
      ),
    );
    assert.ok(
      result.localBridgeFindings.some(
        (entry) => entry.signature === "native-root-env",
      ),
    );
    assert.ok(
      result.localBridgeFindings.some(
        (entry) => entry.signature === "local-working-tree",
      ),
    );
    assert.ok(
      result.localBridgeFindings.some(
        (entry) => entry.signature === "m6-session-json",
      ),
    );
    assert.ok(
      result.blockers.some((entry) => entry.signature === "github-token"),
    );
    assert.ok(
      result.reviewFindings.some(
        (entry) => entry.signature === "windows-user-path",
      ),
    );
    assert.equal(report.status, "ORPHAN_HISTORY_AUDIT_BLOCKED");
    const serialized = JSON.stringify(report);
    assert.equal(serialized.includes(fakeToken), false);
    assert.equal(serialized.includes(privatePath), false);
  });
});

test("ordinary unique source history can produce no findings", async () => {
  await withRepository(async ({ root, mainCommit }) => {
    git(root, "switch", "--detach", mainCommit);
    git(root, "switch", "-c", "snapshot");
    await writeFile(resolve(root, "experiment.ts"), "export const experiment = 1;\n", "utf8");
    git(root, "add", "experiment.ts");
    git(root, "commit", "-m", "ordinary source fixture");
    git(root, "update-ref", SNAPSHOT_REF, "HEAD");
    git(root, "switch", "agent/jv-web-demonstrator-foundation");

    const report = auditOrphanRefHistories({
      root,
      orphanRefs: [SNAPSHOT_REF],
      baselineRef: BASELINE_REF,
    });
    const result = report.results[0];
    assert.equal(result.status, "ORPHAN_HISTORY_NO_FINDINGS");
    assert.deepEqual(result.blockers, []);
    assert.deepEqual(result.reviewFindings, []);
    assert.deepEqual(result.assetCandidates, []);
    assert.deepEqual(result.workflowCandidates, []);
    assert.deepEqual(result.localBridgeFindings, []);
  });
});

test("baseline objects are excluded from orphan-only evidence", async () => {
  await withRepository(async ({ root }) => {
    const baselineCommit = git(root, "rev-parse", BASELINE_REF);
    git(root, "switch", "--detach", baselineCommit);
    git(root, "switch", "-c", "snapshot-from-candidate");
    await writeFile(resolve(root, "only-orphan.ts"), "export const orphan = true;\n", "utf8");
    git(root, "add", "only-orphan.ts");
    git(root, "commit", "-m", "orphan-only fixture");
    git(root, "update-ref", SNAPSHOT_REF, "HEAD");
    git(root, "switch", "agent/jv-web-demonstrator-foundation");

    const report = auditOrphanRefHistories({
      root,
      orphanRefs: [SNAPSHOT_REF],
      baselineRef: BASELINE_REF,
    });
    const result = report.results[0];
    assert.equal(result.uniqueCommitCount, 1);
    assert.ok(result.largestBlobs.every((entry) => entry.path !== "candidate.ts"));
    assert.ok(result.largestBlobs.some((entry) => entry.path === "only-orphan.ts"));
  });
});

test("duplicate orphan refs are rejected before inspection", async () => {
  await withRepository(async ({ root }) => {
    assert.throws(
      () =>
        auditOrphanRefHistories({
          root,
          orphanRefs: [TERRAIN_REF, TERRAIN_REF],
          baselineRef: BASELINE_REF,
        }),
      /duplicate refs/,
    );
  });
});
