import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const REVIEWED_REMOTE_BRANCHES = Object.freeze([
  "refs/remotes/origin/main",
  "refs/remotes/origin/agent/bootstrap-web-poc",
  "refs/remotes/origin/agent/fundamental-audit-rebuild",
  "refs/remotes/origin/agent/clean-browser-core",
  "refs/remotes/origin/agent/typed-box3d-boundary",
  "refs/remotes/origin/agent/jv-web-runtime",
  "refs/remotes/origin/agent/native-factory-receipt",
  "refs/remotes/origin/agent/current-m6-topology",
  "refs/remotes/origin/agent/physical-rate-steering",
  "refs/remotes/origin/agent/f5-visual-observer",
  "refs/remotes/origin/agent/f5-minimal-drive",
  "refs/remotes/origin/agent/f5-dynamic-steering-validation",
  "refs/remotes/origin/agent/jv-web-refoundation",
  "refs/remotes/origin/agent/jv-web-demonstrator-foundation",
]);

const BLOCKED_ORPHAN_REMOTE_BRANCHES = Object.freeze([
  "refs/remotes/origin/agent/f3-regression-snapshot-2026-08-03",
  "refs/remotes/origin/agent/terrain-scan-integration",
]);

const REQUIRED_REMOTE_CANDIDATE =
  "refs/remotes/origin/agent/jv-web-demonstrator-foundation";

function createGit(root) {
  return (args) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function exactCommit(git, ref) {
  try {
    const commit = git(["rev-parse", "--verify", `${ref}^{commit}`]);
    return /^[0-9a-f]{40}$/.test(commit) ? commit : null;
  } catch {
    return null;
  }
}

function refsUnder(git, root) {
  return git(["for-each-ref", "--format=%(refname)", root])
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((ref) => ref !== "refs/remotes/origin/HEAD")
    .sort();
}

export function auditPublicRefPolicy({ root: requestedRoot }) {
  const root = resolve(requestedRoot);
  const git = createGit(root);
  const repositoryRoot = resolve(git(["rev-parse", "--show-toplevel"]));
  if (repositoryRoot !== root) {
    throw new Error(
      `Public-ref policy root must equal the Git repository root. Expected ${repositoryRoot}, received ${root}.`,
    );
  }

  const remoteBranches = refsUnder(git, "refs/remotes/origin");
  const tags = refsUnder(git, "refs/tags");
  const remoteSet = new Set(remoteBranches);
  const reviewed = [];
  const blockedOrphans = [];
  const unknown = [];
  const blockers = [];

  for (const ref of remoteBranches) {
    if (REVIEWED_REMOTE_BRANCHES.includes(ref)) {
      reviewed.push({ ref, commit: exactCommit(git, ref) });
      continue;
    }
    if (BLOCKED_ORPHAN_REMOTE_BRANCHES.includes(ref)) {
      const record = { ref, commit: exactCommit(git, ref) };
      blockedOrphans.push(record);
      blockers.push({
        kind: "blocked-public-ref",
        signature: "orphan-public-branch",
        scope: "remote-ref-policy",
        path: ref,
        objectSha: record.commit,
        reason:
          "This orphan research/snapshot ref requires verified private recovery and an explicit Jozz disposition before public visibility.",
      });
      continue;
    }

    const record = {
      ref: `[unclassified remote ref ${fingerprint(ref)}]`,
      commit: exactCommit(git, ref),
    };
    unknown.push(record);
    blockers.push({
      kind: "unclassified-public-ref",
      signature: "unknown-remote-branch",
      scope: "remote-ref-policy",
      path: record.ref,
      objectSha: record.commit,
      reason: "Every public remote branch requires an explicit classification.",
    });
  }

  for (const tag of tags) {
    const label = `[unclassified tag ${fingerprint(tag)}]`;
    blockers.push({
      kind: "unclassified-public-ref",
      signature: "unknown-tag",
      scope: "tag-ref-policy",
      path: label,
      objectSha: exactCommit(git, tag),
      reason:
        "No public tag policy or approved release exists yet; every tag requires explicit classification.",
    });
  }

  for (const requiredRef of [
    "refs/remotes/origin/main",
    REQUIRED_REMOTE_CANDIDATE,
  ]) {
    if (!remoteSet.has(requiredRef)) {
      blockers.push({
        kind: "missing-required-ref",
        signature: requiredRef,
        scope: "remote-ref-policy",
        path: requiredRef,
        objectSha: null,
        reason:
          "Run git fetch origin --prune and resolve the missing required remote-tracking ref.",
      });
    }
  }

  const headCommit = exactCommit(git, "HEAD");
  const remoteCandidateCommit = exactCommit(git, REQUIRED_REMOTE_CANDIDATE);
  if (
    headCommit !== null &&
    remoteCandidateCommit !== null &&
    headCommit !== remoteCandidateCommit
  ) {
    blockers.push({
      kind: "remote-candidate-drift",
      signature: "head-does-not-match-origin-candidate",
      scope: "remote-ref-policy",
      path: REQUIRED_REMOTE_CANDIDATE,
      objectSha: remoteCandidateCommit,
      reason: `Local HEAD ${headCommit} differs from remote candidate ${remoteCandidateCommit}.`,
    });
  }

  return {
    reviewed,
    blockedOrphans,
    unknown,
    tags: tags.map((tag) => ({
      ref: `[unclassified tag ${fingerprint(tag)}]`,
      commit: exactCommit(git, tag),
    })),
    requiredRemoteCandidate: REQUIRED_REMOTE_CANDIDATE,
    headCommit,
    remoteCandidateCommit,
    blockers,
    status:
      blockers.length === 0
        ? "PUBLIC_REF_POLICY_PASS"
        : "PUBLIC_REF_POLICY_BLOCKED",
  };
}
