import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { basename, resolve, sep } from "node:path";

const MAX_TEXT_OBJECT_BYTES = 2 * 1024 * 1024;
const CURRENT_LARGE_FILE_BYTES = 10 * 1024 * 1024;
const HISTORY_LARGE_BLOB_BYTES = 25 * 1024 * 1024;

const SECRET_PATTERNS = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g],
  ["github-token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{20,255})\b/g],
  ["openai-key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,255}\b/g],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ["google-api-key", /\bAIza[0-9A-Za-z_-]{35}\b/g],
  ["slack-token", /\bxox[baprs]-[A-Za-z0-9-]{20,255}\b/g],
  ["discord-webhook", /https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/g],
  ["npm-auth-token", /\/\/registry\.npmjs\.org\/:_authToken\s*=\s*[^\s]+/g],
];

const REVIEW_PATTERNS = [
  ["windows-user-path", /\b[A-Za-z]:\\Users\\[^\\\r\n]+/g],
  ["unix-home-path", /(?:^|[\s"'`])\/home\/[^/\s"'`]+/gm],
  ["absolute-windows-path", /\b[A-Za-z]:\\(?:[^\r\n"'`]+\\)+[^\r\n"'`]*/g],
  [
    "generic-secret-assignment",
    /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password)\b\s*[:=]\s*["'][^"'\r\n]{12,}["']/gi,
  ],
  ["email-address", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
];

const SENSITIVE_FILE_PATTERNS = [
  /^\.env(?:\..+)?$/i,
  /^\.npmrc$/i,
  /^\.netrc$/i,
  /^id_(?:rsa|dsa|ecdsa|ed25519)$/i,
  /(?:^|[-_.])credentials?\.json$/i,
  /(?:^|[-_.])service[-_.]?account.*\.json$/i,
  /\.(?:pem|key|p12|pfx|keystore|jks|mobileprovision)$/i,
];

function createGit(root) {
  return (args, options = {}) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: options.encoding ?? "utf8",
      maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
}

function toPosix(path) {
  return path.split(sep).join("/");
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function isSensitivePath(path) {
  const name = basename(path);
  if (/^\.env\.example$/i.test(name)) {
    return false;
  }
  return SENSITIVE_FILE_PATTERNS.some((pattern) => pattern.test(name));
}

function isProbablyText(buffer) {
  if (buffer.length === 0) {
    return true;
  }
  return !buffer.subarray(0, Math.min(buffer.length, 8192)).includes(0);
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (text.charCodeAt(cursor) === 10) {
      line += 1;
    }
  }
  return line;
}

function ignoreReviewMatch(signature, value) {
  if (signature !== "email-address") {
    return false;
  }
  return (
    value.endsWith("@users.noreply.github.com") ||
    value.endsWith("@example.com") ||
    value === "actions@users.noreply.github.com"
  );
}

function scanText({ text, scope, path, objectSha, blockers, reviews }) {
  for (const [signature, pattern] of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      blockers.push({
        kind: "secret-pattern",
        signature,
        scope,
        path,
        line: lineNumberAt(text, match.index ?? 0),
        objectSha,
        fingerprint: fingerprint(match[0]),
      });
    }
  }

  for (const [signature, pattern] of REVIEW_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      if (ignoreReviewMatch(signature, match[0])) {
        continue;
      }
      reviews.push({
        kind: "privacy-review",
        signature,
        scope,
        path,
        line: lineNumberAt(text, match.index ?? 0),
        objectSha,
        fingerprint: fingerprint(match[0]),
      });
    }
  }
}

function deduplicate(findings) {
  const seen = new Set();
  return findings.filter((finding) => {
    const key = JSON.stringify([
      finding.kind,
      finding.signature,
      finding.scope,
      finding.path,
      finding.line,
      finding.objectSha,
      finding.fingerprint,
      finding.reason,
    ]);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function trackedIndexEntries(git) {
  const entries = [];
  for (const record of git(["ls-files", "-s", "-z"]).split("\0")) {
    if (!record) {
      continue;
    }
    const tab = record.indexOf("\t");
    const [mode, objectSha, stage] = record.slice(0, tab).split(" ");
    entries.push({ mode, objectSha, stage, path: record.slice(tab + 1) });
  }
  return entries;
}

function readGitObject(git, type, objectSha, size) {
  return git(["cat-file", type, objectSha], {
    encoding: "buffer",
    maxBuffer: Math.max(4 * 1024 * 1024, size + 1024),
  });
}

function objectSize(git, objectSha) {
  return Number(git(["cat-file", "-s", objectSha]).trim());
}

function auditWorkingTree(git, blockers) {
  const dirty = git(["status", "--porcelain", "--untracked-files=all"])
    .split(/\r?\n/)
    .filter(Boolean);
  if (dirty.length > 0) {
    blockers.push({
      kind: "dirty-source-tree",
      signature: "working-tree-not-clean",
      scope: "working-tree",
      path: ".",
      reason: `${dirty.length} changed or untracked path(s) require classification.`,
    });
  }
}

function auditCurrentTree(git, blockers, reviews, metrics) {
  const entries = trackedIndexEntries(git);
  const currentBlobShas = new Set();
  metrics.currentTrackedFiles = entries.length;

  for (const entry of entries) {
    const path = toPosix(entry.path);
    if (isSensitivePath(path)) {
      blockers.push({
        kind: "sensitive-filename",
        signature: "sensitive-current-path",
        scope: "current-tree",
        path,
        objectSha: entry.objectSha,
      });
    }

    if (entry.mode === "160000") {
      blockers.push({
        kind: "unscanned-gitlink",
        signature: "submodule-history-not-audited",
        scope: "current-tree",
        path,
        objectSha: entry.objectSha,
        reason: "Submodule content and history need a separate exact-source audit.",
      });
      continue;
    }

    if (entry.mode === "120000") {
      currentBlobShas.add(entry.objectSha);
      const buffer = readGitObject(git, "blob", entry.objectSha, 1024);
      reviews.push({
        kind: "tracked-symlink",
        signature: "manual-symlink-target-review",
        scope: "current-tree",
        path,
        objectSha: entry.objectSha,
        fingerprint: fingerprint(buffer),
      });
      if (isProbablyText(buffer)) {
        scanText({
          text: buffer.toString("utf8"),
          scope: "current-tree-symlink-target",
          path,
          objectSha: entry.objectSha,
          blockers,
          reviews,
        });
      }
      continue;
    }

    if (!entry.mode.startsWith("100")) {
      blockers.push({
        kind: "unsupported-git-mode",
        signature: entry.mode,
        scope: "current-tree",
        path,
        objectSha: entry.objectSha,
      });
      continue;
    }

    currentBlobShas.add(entry.objectSha);
    const size = objectSize(git, entry.objectSha);
    if (size > CURRENT_LARGE_FILE_BYTES) {
      reviews.push({
        kind: "large-current-file",
        signature: "current-file-over-10MiB",
        scope: "current-tree",
        path,
        objectSha: entry.objectSha,
        bytes: size,
      });
    }
    if (size > MAX_TEXT_OBJECT_BYTES) {
      continue;
    }
    const buffer = readGitObject(git, "blob", entry.objectSha, size);
    if (isProbablyText(buffer)) {
      scanText({
        text: buffer.toString("utf8"),
        scope: "current-tree",
        path,
        objectSha: entry.objectSha,
        blockers,
        reviews,
      });
    }
  }
  return currentBlobShas;
}

function reachableObjects(root, git) {
  const paths = new Map();
  for (const line of git(["rev-list", "--objects", "--all"])
    .split(/\r?\n/)
    .filter(Boolean)) {
    const separator = line.indexOf(" ");
    const sha = separator === -1 ? line : line.slice(0, separator);
    if (!paths.has(sha)) {
      paths.set(sha, separator === -1 ? null : line.slice(separator + 1));
    }
  }
  if (paths.size === 0) {
    return [];
  }

  const result = spawnSync(
    "git",
    ["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"],
    {
      cwd: root,
      input: `${[...paths.keys()].join("\n")}\n`,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || "git cat-file --batch-check failed");
  }
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [sha, type, sizeText] = line.split(" ");
      return { sha, type, size: Number(sizeText), path: paths.get(sha) ?? null };
    });
}

function auditReachableHistory({
  root,
  git,
  blockers,
  reviews,
  metrics,
  currentBlobShas,
}) {
  const objects = reachableObjects(root, git);
  const blobs = objects.filter((object) => object.type === "blob");
  const metadata = objects.filter(
    (object) => object.type === "commit" || object.type === "tag",
  );
  metrics.reachableObjects = objects.length;
  metrics.reachableBlobs = blobs.length;
  metrics.reachableMetadataObjects = metadata.length;

  for (const blob of blobs) {
    const path = toPosix(blob.path ?? `[unmapped blob ${blob.sha.slice(0, 12)}]`);
    const isCurrent = currentBlobShas.has(blob.sha);
    if (!isCurrent && isSensitivePath(path)) {
      blockers.push({
        kind: "sensitive-filename",
        signature: "sensitive-history-path",
        scope: "reachable-history",
        path,
        objectSha: blob.sha,
      });
    }
    if (blob.size > HISTORY_LARGE_BLOB_BYTES) {
      reviews.push({
        kind: "large-history-blob",
        signature: "history-blob-over-25MiB",
        scope: "reachable-history",
        path,
        objectSha: blob.sha,
        bytes: blob.size,
      });
    }
    if (isCurrent || blob.size > MAX_TEXT_OBJECT_BYTES) {
      continue;
    }
    const buffer = readGitObject(git, "blob", blob.sha, blob.size);
    if (isProbablyText(buffer)) {
      scanText({
        text: buffer.toString("utf8"),
        scope: "reachable-history",
        path,
        objectSha: blob.sha,
        blockers,
        reviews,
      });
    }
  }

  for (const object of metadata) {
    const path = `[${object.type} ${object.sha.slice(0, 12)}]`;
    if (object.size > MAX_TEXT_OBJECT_BYTES) {
      reviews.push({
        kind: "large-history-metadata",
        signature: "metadata-object-over-2MiB",
        scope: "reachable-history-metadata",
        path,
        objectSha: object.sha,
        bytes: object.size,
      });
      continue;
    }
    const buffer = readGitObject(git, object.type, object.sha, object.size);
    if (isProbablyText(buffer)) {
      scanText({
        text: buffer.toString("utf8"),
        scope: "reachable-history-metadata",
        path,
        objectSha: object.sha,
        blockers,
        reviews,
      });
    }
  }
}

function auditRequiredFiles(git, blockers) {
  const trackedPaths = new Set(
    trackedIndexEntries(git).map((entry) => toPosix(entry.path)),
  );
  for (const path of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) {
    if (!trackedPaths.has(path)) {
      blockers.push({
        kind: "missing-public-contract",
        signature: path,
        scope: "current-tree",
        path,
        reason: `${path} is required before public visibility.`,
      });
    }
  }
}

function visibleRefs(git) {
  return git([
    "for-each-ref",
    "--format=%(refname)",
    "refs/heads",
    "refs/remotes/origin",
    "refs/tags",
  ])
    .split(/\r?\n/)
    .filter(Boolean);
}

function redactedRef(ref) {
  const parts = ref.split("/");
  return {
    namespace: parts.slice(0, 2).join("/"),
    fingerprint: fingerprint(ref),
  };
}

function auditRefNames(refs, blockers, reviews) {
  for (const ref of refs) {
    scanText({
      text: ref,
      scope: "git-ref-name",
      path: `[redacted ref ${fingerprint(ref)}]`,
      objectSha: null,
      blockers,
      reviews,
    });
  }
}

export async function auditPublicReadiness({
  root: requestedRoot,
  repository = "UNKNOWN",
}) {
  const root = resolve(requestedRoot);
  const git = createGit(root);
  const blockers = [];
  const reviews = [];
  const metrics = {};
  const repositoryRoot = resolve(git(["rev-parse", "--show-toplevel"]).trim());
  if (repositoryRoot !== root) {
    throw new Error(
      `Audit root must equal the Git repository root. Expected ${repositoryRoot}, received ${root}.`,
    );
  }

  auditWorkingTree(git, blockers);
  const currentBlobShas = auditCurrentTree(git, blockers, reviews, metrics);
  auditReachableHistory({
    root,
    git,
    blockers,
    reviews,
    metrics,
    currentBlobShas,
  });
  auditRequiredFiles(git, blockers);
  const refs = visibleRefs(git);
  metrics.reachableRefs = refs.length;
  auditRefNames(refs, blockers, reviews);

  const finalBlockers = deduplicate(blockers);
  const finalReviews = deduplicate(reviews);
  return {
    schemaVersion: 1,
    repository,
    sourceCommit: git(["rev-parse", "HEAD"]).trim(),
    sourceBranch: git(["branch", "--show-current"]).trim() || "DETACHED",
    generatedAtUtc: new Date().toISOString(),
    status:
      finalBlockers.length === 0
        ? "PUBLIC_READY_AUDIT_PASS"
        : "PUBLIC_READY_AUDIT_FAIL",
    note:
      "Pattern scanning reduces risk but cannot prove the absence of every secret, private fact, licensing problem or unwanted historical artifact. Every review finding requires human classification.",
    metrics,
    refs: refs.map(redactedRef),
    blockers: finalBlockers,
    reviewFindings: finalReviews,
  };
}