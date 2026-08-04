import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

function createGit(root) {
  return (args) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
}

function exactCommit(git, ref, label, blockers) {
  try {
    const value = git(["rev-parse", "--verify", `${ref}^{commit}`]);
    if (!/^[0-9a-f]{40}$/.test(value)) {
      throw new Error(`unexpected commit identity ${value}`);
    }
    return value;
  } catch (error) {
    blockers.push({
      id: "MISSING_GIT_REF",
      ref,
      message: `Unable to resolve ${label} ref ${ref}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
    return null;
  }
}

export function evaluateSourcePublicIntegration({
  root: requestedRoot,
  baseRef = "origin/main",
  candidateRef = "HEAD",
  expectedCandidateBranch = null,
}) {
  const root = resolve(requestedRoot);
  const git = createGit(root);
  const blockers = [];
  const repositoryRoot = resolve(git(["rev-parse", "--show-toplevel"]));
  if (repositoryRoot !== root) {
    throw new Error(
      `Integration proof root must equal the Git repository root. Expected ${repositoryRoot}, received ${root}.`,
    );
  }

  const workingTreeEntries = git([
    "status",
    "--porcelain",
    "--untracked-files=all",
  ])
    .split(/\r?\n/)
    .filter(Boolean);
  if (workingTreeEntries.length > 0) {
    blockers.push({
      id: "DIRTY_WORKING_TREE",
      message: `${workingTreeEntries.length} changed or untracked path(s) prevent an exact integration proof.`,
    });
  }

  const currentBranch = git(["branch", "--show-current"]) || "DETACHED";
  if (
    expectedCandidateBranch !== null &&
    currentBranch !== expectedCandidateBranch
  ) {
    blockers.push({
      id: "UNEXPECTED_CANDIDATE_BRANCH",
      message: `Expected candidate branch ${expectedCandidateBranch}, received ${currentBranch}.`,
    });
  }

  const baseCommit = exactCommit(git, baseRef, "base", blockers);
  const candidateCommit = exactCommit(git, candidateRef, "candidate", blockers);
  let mergeBase = null;
  let candidateBehind = null;
  let candidateAhead = null;
  let baseIsAncestor = false;

  if (baseCommit !== null && candidateCommit !== null) {
    try {
      mergeBase = git(["merge-base", baseCommit, candidateCommit]);
      const [baseOnlyText, candidateOnlyText] = git([
        "rev-list",
        "--left-right",
        "--count",
        `${baseCommit}...${candidateCommit}`,
      ]).split(/\s+/);
      candidateBehind = Number(baseOnlyText);
      candidateAhead = Number(candidateOnlyText);
      if (
        !Number.isSafeInteger(candidateBehind) ||
        !Number.isSafeInteger(candidateAhead)
      ) {
        throw new Error("git rev-list returned invalid ahead/behind counts");
      }
      baseIsAncestor = mergeBase === baseCommit && candidateBehind === 0;
      if (!baseIsAncestor) {
        blockers.push({
          id: "BASE_NOT_ANCESTOR",
          message:
            `${baseRef} is not an exact ancestor of ${candidateRef}; ` +
            `candidate is behind by ${candidateBehind} and ahead by ${candidateAhead}.`,
        });
      }
    } catch (error) {
      blockers.push({
        id: "INTEGRATION_RELATION_UNRESOLVED",
        message: `Unable to evaluate the Git relation: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }

  return {
    schemaVersion: 1,
    repositoryRoot,
    baseRef,
    baseCommit,
    candidateRef,
    candidateCommit,
    candidateBranch: currentBranch,
    mergeBase,
    candidateBehind,
    candidateAhead,
    baseIsAncestor,
    workingTreeClean: workingTreeEntries.length === 0,
    fastForwardPossible:
      blockers.length === 0 &&
      baseCommit !== null &&
      candidateCommit !== null &&
      baseIsAncestor,
    blockers,
    status:
      blockers.length === 0
        ? "FAST_FORWARD_CANDIDATE"
        : "INTEGRATION_PROOF_BLOCKED",
    note:
      "This proof reads local Git refs only. Run git fetch origin --prune immediately before generating the final owner-approval receipt. It never moves a ref.",
  };
}
