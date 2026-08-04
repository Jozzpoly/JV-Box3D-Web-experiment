import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { basename, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = resolve(root, ".local-audit");
const outputPath = resolve(outputDirectory, "public-readiness.json");
const MAX_TEXT_BLOB_BYTES = 2 * 1024 * 1024;
const CURRENT_LARGE_FILE_BYTES = 10 * 1024 * 1024;
const HISTORY_LARGE_BLOB_BYTES = 25 * 1024 * 1024;

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: options.encoding ?? "utf8",
    maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function toPosix(path) {
  return path.split(sep).join("/");
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

const secretPatterns = [
  {
    id: "private-key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g,
  },
  {
    id: "github-token",
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{20,255})\b/g,
  },
  {
    id: "openai-key",
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,255}\b/g,
  },
  {
    id: "aws-access-key",
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
  },
  {
    id: "google-api-key",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  },
  {
    id: "slack-token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,255}\b/g,
  },
  {
    id: "discord-webhook",
    pattern: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/g,
  },
  {
    id: "npm-auth-token",
    pattern: /\/\/registry\.npmjs\.org\/:_authToken\s*=\s*[^\s]+/g,
  },
];

const reviewPatterns = [
  {
    id: "windows-user-path",
    pattern: /\b[A-Za-z]:\\Users\\[^\\\r\n]+/g,
  },
  {
    id: "unix-home-path",
    pattern: /(?:^|[\s"'`])\/home\/[^/\s"'`]+/gm,
  },
  {
    id: "absolute-windows-path",
    pattern: /\b[A-Za-z]:\\(?:[^\r\n"'`]+\\)+[^\r\n"'`]*/g,
  },
  {
    id: "generic-secret-assignment",
    pattern:
      /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password)\b\s*[:=]\s*["'][^"'\r\n]{12,}["']/gi,
  },
  {
    id: "email-address",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    ignore: (value) =>
      value.endsWith("@users.noreply.github.com") ||
      value.endsWith("@example.com") ||
      value === "actions@users.noreply.github.com",
  },
];

const sensitiveFilePatterns = [
  /^\.env(?:\..+)?$/i,
  /^\.npmrc$/i,
  /^\.netrc$/i,
  /^id_(?:rsa|dsa|ecdsa|ed25519)$/i,
  /(?:^|[-_.])credentials?\.json$/i,
  /(?:^|[-_.])service[-_.]?account.*\.json$/i,
  /\.(?:pem|key|p12|pfx|keystore|jks|mobileprovision)$/i,
];

function isSensitivePath(path) {
  const name = basename(path);
  if (/^\.env\.example$/i.test(name)) {
    return false;
  }
  return sensitiveFilePatterns.some((pattern) => pattern.test(name));
}

function isProbablyText(buffer) {
  if (buffer.length === 0) {
    return true;
  }
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  return !sample.includes(0);
}

function redactedFingerprint(value) {
  return sha256(value).slice(0, 12);
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

function scanText({ text, scope, path, blobSha, blockers, reviews }) {
  for (const signature of secretPatterns) {
    signature.pattern.lastIndex = 0;
    for (const match of text.matchAll(signature.pattern)) {
      blockers.push({
        kind: "secret-pattern",
        signature: signature.id,
        scope,
        path,
        line: lineNumberAt(text, match.index ?? 0),
        blobSha,
        fingerprint: redactedFingerprint(match[0]),
      });
    }
  }

  for (const signature of reviewPatterns) {
    signature.pattern.lastIndex = 0;
    for (const match of text.matchAll(signature.pattern)) {
      if (signature.ignore?.(match[0])) {
        continue;
      }
      reviews.push({
        kind: "privacy-review",
        signature: signature.id,
        scope,
        path,
        line: lineNumberAt(text, match.index ?? 0),
        blobSha,
        fingerprint: redactedFingerprint(match[0]),
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
      finding.blobSha,
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

function trackedIndexEntries() {
  const raw = git(["ls-files", "-s", "-z"]);
  const entries = [];
  for (const record of raw.split("\0")) {
    if (!record) {
      continue;
    }
    const tab = record.indexOf("\t");
    const metadata = record.slice(0, tab).split(" ");
    entries.push({
      mode: metadata[0],
      blobSha: metadata[1],
      stage: metadata[2],
      path: record.slice(tab + 1),
    });
  }
  return entries;
}

function readGitBlob(blobSha, maxBuffer) {
  return git(["cat-file", "blob", blobSha], {
    encoding: "buffer",
    maxBuffer,
  });
}

async function auditCurrentTree(blockers, reviews, metrics) {
  const entries = trackedIndexEntries();
  metrics.currentTrackedFiles = entries.length;
  const currentBlobShas = new Set();

  for (const entry of entries) {
    currentBlobShas.add(entry.blobSha);
    const path = toPosix(entry.path);
    if (isSensitivePath(path)) {
      blockers.push({
        kind: "sensitive-filename",
        signature: "sensitive-current-path",
        scope: "current-tree",
        path,
        blobSha: entry.blobSha,
      });
    }

    if (entry.mode === "120000") {
      const buffer = readGitBlob(entry.blobSha, 1024 * 1024);
      reviews.push({
        kind: "tracked-symlink",
        signature: "manual-symlink-target-review",
        scope: "current-tree",
        path,
        blobSha: entry.blobSha,
        fingerprint: redactedFingerprint(buffer),
      });
      if (isProbablyText(buffer)) {
        scanText({
          text: buffer.toString("utf8"),
          scope: "current-tree-symlink-target",
          path,
          blobSha: entry.blobSha,
          blockers,
          reviews,
        });
      }
      continue;
    }

    if (entry.mode === "160000") {
      blockers.push({
        kind: "unscanned-gitlink",
        signature: "submodule-history-not-audited",
        scope: "current-tree",
        path,
        blobSha: entry.blobSha,
        reason: "Submodule content and history require a separate exact-source audit.",
      });
      continue;
    }

    if (!entry.mode.startsWith("100")) {
      blockers.push({
        kind: "unsupported-git-mode",
        signature: entry.mode,
        scope: "current-tree",
        path,
        blobSha: entry.blobSha,
      });
      continue;
    }

    const absolutePath = resolve(root, entry.path);
    const fileStat = await lstat(absolutePath);
    if (!fileStat.isFile()) {
      blockers.push({
        kind: "working-tree-type-mismatch",
        signature: "tracked-regular-file-is-not-regular",
        scope: "current-tree",
        path,
        blobSha: entry.blobSha,
      });
      continue;
    }
    if (fileStat.size > CURRENT_LARGE_FILE_BYTES) {
      reviews.push({
        kind: "large-current-file",
        signature: "current-file-over-10MiB",
        scope: "current-tree",
        path,
        blobSha: entry.blobSha,
        bytes: fileStat.size,
      });
    }
    if (fileStat.size > MAX_TEXT_BLOB_BYTES) {
      continue;
    }

    const buffer = await readFile(absolutePath);
    if (!isProbablyText(buffer)) {
      continue;
    }
    scanText({
      text: buffer.toString("utf8"),
      scope: "current-tree",
      path,
      blobSha: entry.blobSha,
      blockers,
      reviews,
    });
  }

  return currentBlobShas;
}

function reachableObjects() {
  const raw = git(["rev-list", "--objects", "--all"]);
  const rows = raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(" ");
      return separator === -1
        ? { sha: line, path: null }
        : { sha: line.slice(0, separator), path: line.slice(separator + 1) };
    });

  const unique = new Map();
  for (const row of rows) {
    if (!unique.has(row.sha)) {
      unique.set(row.sha, row.path);
    }
  }

  const input = `${[...unique.keys()].join("\n")}\n`;
  const result = spawnSync(
    "git",
    ["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"],
    {
      cwd: root,
      input,
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
      return {
        sha,
        type,
        size: Number(sizeText),
        path: unique.get(sha) ?? null,
      };
    });
}

function auditReachableHistory({
  blockers,
  reviews,
  metrics,
  currentBlobShas,
}) {
  const objects = reachableObjects();
  const blobs = objects.filter((object) => object.type === "blob");
  metrics.reachableObjects = objects.length;
  metrics.reachableBlobs = blobs.length;

  for (const blob of blobs) {
    const path = toPosix(blob.path ?? `[unmapped blob ${blob.sha.slice(0, 12)}]`);
    const isCurrent = currentBlobShas.has(blob.sha);

    if (!isCurrent && isSensitivePath(path)) {
      blockers.push({
        kind: "sensitive-filename",
        signature: "sensitive-history-path",
        scope: "reachable-history",
        path,
        blobSha: blob.sha,
      });
    }

    if (blob.size > HISTORY_LARGE_BLOB_BYTES) {
      reviews.push({
        kind: "large-history-blob",
        signature: "history-blob-over-25MiB",
        scope: "reachable-history",
        path,
        blobSha: blob.sha,
        bytes: blob.size,
      });
    }
    if (isCurrent || blob.size > MAX_TEXT_BLOB_BYTES) {
      continue;
    }

    const buffer = readGitBlob(
      blob.sha,
      Math.max(4 * 1024 * 1024, blob.size + 1024),
    );
    if (!isProbablyText(buffer)) {
      continue;
    }
    scanText({
      text: buffer.toString("utf8"),
      scope: "reachable-history",
      path,
      blobSha: blob.sha,
      blockers,
      reviews,
    });
  }
}

function auditRequiredFiles(blockers) {
  const trackedPaths = new Set(
    trackedIndexEntries().map((entry) => toPosix(entry.path)),
  );
  for (const requirement of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) {
    if (!trackedPaths.has(requirement)) {
      blockers.push({
        kind: "missing-public-contract",
        signature: requirement,
        scope: "current-tree",
        path: requirement,
        reason: `${requirement} is required before repository visibility changes to public.`,
      });
    }
  }
}

function visibleRefs() {
  const raw = git([
    "for-each-ref",
    "--format=%(refname)",
    "refs/heads",
    "refs/remotes/origin",
    "refs/tags",
  ]);
  return raw.split(/\r?\n/).filter(Boolean);
}

const blockers = [];
const reviews = [];
const metrics = {};
const currentBlobShas = await auditCurrentTree(blockers, reviews, metrics);
auditReachableHistory({ blockers, reviews, metrics, currentBlobShas });
auditRequiredFiles(blockers);
const refs = visibleRefs();
metrics.reachableRefs = refs.length;

const report = {
  schemaVersion: 1,
  repository: "Jozzpoly/JV-Box3D-Web-experiment",
  sourceCommit: git(["rev-parse", "HEAD"]).trim(),
  sourceBranch: git(["branch", "--show-current"]).trim() || "DETACHED",
  generatedAtUtc: new Date().toISOString(),
  status: blockers.length === 0 ? "PUBLIC_READY_AUDIT_PASS" : "PUBLIC_READY_AUDIT_FAIL",
  note:
    "Pattern scanning reduces risk but cannot prove the absence of every secret, private fact, licensing problem or unwanted historical artifact. Every review finding requires human classification.",
  metrics,
  refs,
  blockers: deduplicate(blockers),
  reviewFindings: deduplicate(reviews),
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Public-readiness report: ${relative(root, outputPath)}`);
console.log(`Reachable refs:          ${metrics.reachableRefs}`);
console.log(`Reachable blobs:         ${metrics.reachableBlobs}`);
console.log(`Blockers:                ${report.blockers.length}`);
console.log(`Review findings:         ${report.reviewFindings.length}`);

for (const blocker of report.blockers) {
  console.error(
    `BLOCKER: ${blocker.signature} · ${blocker.scope} · ${blocker.path}${blocker.line ? `:${blocker.line}` : ""}${blocker.blobSha ? ` · ${blocker.blobSha.slice(0, 12)}` : ""}`,
  );
}
for (const finding of report.reviewFindings.slice(0, 20)) {
  console.warn(
    `REVIEW: ${finding.signature} · ${finding.scope} · ${finding.path}${finding.line ? `:${finding.line}` : ""}${finding.blobSha ? ` · ${finding.blobSha.slice(0, 12)}` : ""}`,
  );
}
if (report.reviewFindings.length > 20) {
  console.warn(
    `REVIEW: ${report.reviewFindings.length - 20} additional finding(s) are recorded in the JSON report.`,
  );
}

if (report.blockers.length > 0) {
  console.error("PUBLIC-READY AUDIT: FAIL");
  process.exit(1);
}

console.log("PUBLIC-READY AUDIT: PASS (human review still required)");
