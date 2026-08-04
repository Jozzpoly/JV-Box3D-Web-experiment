import { execFileSync } from "node:child_process";
import { resolve, sep } from "node:path";

export const REQUIRED_PUBLIC_CONTRACT_PATHS = Object.freeze([
  "README.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "docs/PROJECT_STATE.md",
  "docs/PUBLIC_COLLABORATION_HISTORY.md",
  "docs/PUBLIC_ASSET_RIGHTS_POLICY.md",
  "docs/operations/SOURCE_PUBLIC_RELEASE_RUNBOOK_PL.md",
]);

function git(root, args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function toPosix(path) {
  return path.split(sep).join("/");
}

export function auditRequiredPublicContracts({ root: requestedRoot }) {
  const root = resolve(requestedRoot);
  const repositoryRoot = resolve(
    git(root, ["rev-parse", "--show-toplevel"]).trim(),
  );
  if (repositoryRoot !== root) {
    throw new Error(
      `Public-contract audit root must equal the Git repository root. Expected ${repositoryRoot}, received ${root}.`,
    );
  }

  const trackedPaths = new Set(
    git(root, ["ls-files", "-z"])
      .split("\0")
      .filter(Boolean)
      .map(toPosix),
  );
  const present = REQUIRED_PUBLIC_CONTRACT_PATHS.filter((path) =>
    trackedPaths.has(path),
  );
  const missing = REQUIRED_PUBLIC_CONTRACT_PATHS.filter(
    (path) => !trackedPaths.has(path),
  );

  return {
    requiredCount: REQUIRED_PUBLIC_CONTRACT_PATHS.length,
    presentCount: present.length,
    present,
    missing,
    blockers: missing.map((path) => ({
      kind: "missing-public-contract",
      signature: path,
      scope: "current-tree",
      path,
      reason: `${path} is required before public visibility.`,
    })),
  };
}
