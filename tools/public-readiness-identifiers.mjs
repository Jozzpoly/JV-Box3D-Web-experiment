import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const SECRET_PATTERNS = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ["github-token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{20,255})\b/],
  ["openai-key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,255}\b/],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["google-api-key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["slack-token", /\bxox[baprs]-[A-Za-z0-9-]{20,255}\b/],
];

const REVIEW_PATTERNS = [
  ["windows-user-path", /\b[A-Za-z]:\\Users\\[^\\\r\n]+/],
  ["unix-home-path", /(?:^|[\s"'`])\/home\/[^/\s"'`]+/],
  ["email-address", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
];

function git(root, args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function redactedLabel(kind, value) {
  return `[redacted ${kind} ${fingerprint(value)}]`;
}

function scanIdentifier(value, scope, kind, findings) {
  const label = redactedLabel(kind, value);
  for (const [signature, pattern] of SECRET_PATTERNS) {
    const match = value.match(pattern);
    if (!match) {
      continue;
    }
    findings.blockers.push({
      kind: "secret-pattern",
      signature,
      scope,
      path: label,
      objectSha: null,
      fingerprint: fingerprint(match[0]),
    });
  }
  for (const [signature, pattern] of REVIEW_PATTERNS) {
    const match = value.match(pattern);
    if (!match) {
      continue;
    }
    if (
      signature === "email-address" &&
      (match[0].endsWith("@users.noreply.github.com") ||
        match[0].endsWith("@example.com"))
    ) {
      continue;
    }
    findings.reviews.push({
      kind: "privacy-review",
      signature,
      scope,
      path: label,
      objectSha: null,
      fingerprint: fingerprint(match[0]),
    });
  }
}

function currentPaths(root) {
  return git(root, ["ls-files", "-z"])
    .split("\0")
    .filter(Boolean);
}

function reachablePaths(root) {
  const paths = new Set();
  for (const line of git(root, ["rev-list", "--objects", "--all"])
    .split(/\r?\n/)
    .filter(Boolean)) {
    const separator = line.indexOf(" ");
    if (separator !== -1) {
      paths.add(line.slice(separator + 1));
    }
  }
  return [...paths];
}

function deduplicate(findings) {
  const seen = new Set();
  return findings.filter((finding) => {
    const key = JSON.stringify([
      finding.kind,
      finding.signature,
      finding.scope,
      finding.path,
      finding.fingerprint,
    ]);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function auditGitIdentifiers({ root: requestedRoot }) {
  const root = resolve(requestedRoot);
  const findings = { blockers: [], reviews: [] };

  for (const path of currentPaths(root)) {
    scanIdentifier(path, "git-path-name", "git path", findings);
  }
  for (const path of reachablePaths(root)) {
    scanIdentifier(path, "reachable-git-path-name", "historical git path", findings);
  }

  const sourceBranch = git(root, ["branch", "--show-current"]).trim();
  if (sourceBranch.length > 0) {
    scanIdentifier(sourceBranch, "source-branch-name", "source branch", findings);
  }

  return {
    sourceRef:
      sourceBranch.length === 0
        ? { state: "DETACHED", fingerprint: null }
        : { state: "BRANCH", fingerprint: fingerprint(sourceBranch) },
    blockers: deduplicate(findings.blockers),
    reviewFindings: deduplicate(findings.reviews),
  };
}
