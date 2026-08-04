import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const KNOWN_SAFE_FILES = Object.freeze([
  {
    path: ".npmrc",
    exactText: "engine-strict=true\nsave-exact=true\n",
    reason:
      "Repository-only npm policy: strict Node engine enforcement and exact dependency saves; contains no registry, credential or auth configuration.",
  },
]);

function git(root, args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function exactCurrentBlob(root, path) {
  try {
    const objectSha = git(root, ["rev-parse", `HEAD:${path}`]).trim();
    const text = git(root, ["cat-file", "blob", objectSha]);
    return { objectSha, text };
  } catch {
    return null;
  }
}

export function classifyKnownSafePublicFiles({
  root: requestedRoot,
  blockers: requestedBlockers,
}) {
  const root = resolve(requestedRoot);
  const accepted = [];
  let blockers = [...requestedBlockers];

  for (const policy of KNOWN_SAFE_FILES) {
    const blob = exactCurrentBlob(root, policy.path);
    if (blob === null || blob.text !== policy.exactText) {
      continue;
    }

    const before = blockers.length;
    blockers = blockers.filter(
      (finding) =>
        !(
          finding.kind === "sensitive-filename" &&
          finding.signature === "sensitive-current-path" &&
          finding.scope === "current-tree" &&
          finding.path === policy.path &&
          finding.objectSha === blob.objectSha
        ),
    );
    if (blockers.length !== before) {
      accepted.push({
        path: policy.path,
        objectSha: blob.objectSha,
        reason: policy.reason,
      });
    }
  }

  return { blockers, accepted };
}
