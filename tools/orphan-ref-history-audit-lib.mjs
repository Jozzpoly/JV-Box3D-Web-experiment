import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { extname, resolve, sep } from "node:path";

const MAX_TEXT_BLOB_BYTES = 2 * 1024 * 1024;
const LARGE_BLOB_BYTES = 10 * 1024 * 1024;

const SECRET_PATTERNS = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g],
  ["github-token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{20,255})\b/g],
  ["openai-key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,255}\b/g],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ["google-api-key", /\bAIza[0-9A-Za-z_-]{35}\b/g],
  ["slack-token", /\bxox[baprs]-[A-Za-z0-9-]{20,255}\b/g],
  ["npm-auth-token", /\/\/registry\.npmjs\.org\/:_authToken\s*=\s*[^\s]+/g],
];

const PRIVACY_PATTERNS = [
  ["windows-user-path", /\b[A-Za-z]:\\Users\\[^\\\r\n]+/g],
  ["absolute-windows-path", /\b[A-Za-z]:\\(?:[^\r\n"'`]+\\)+[^\r\n"'`]*/g],
  ["unix-home-path", /(?:^|[\s"'`])\/home\/[^/\s"'`]+/gm],
  ["email-address", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
];

const LOCAL_BRIDGE_PATTERNS = [
  ["native-root-env", /\bJV_NATIVE_ROOT\b/g],
  ["source-ref-env", /\bJV_SOURCE_REF\b/g],
  ["local-working-tree", /\blocal-working-tree\b/g],
  ["m6-session-json", /\bjozz_vehicle_m6_session\.json\b/gi],
  ["asset-sync-script", /\bsync-jv-assets\b/gi],
  ["local-file-url", /\bfile:\/\//gi],
];

const ASSET_EXTENSIONS = new Map([
  [".blend", "DCC_SOURCE"],
  [".blend1", "DCC_SOURCE"],
  [".bbmodel", "DCC_SOURCE"],
  [".fbx", "MODEL"],
  [".glb", "MODEL"],
  [".gltf", "MODEL"],
  [".obj", "MODEL"],
  [".mtl", "MODEL_MATERIAL"],
  [".stl", "MODEL"],
  [".ply", "SCAN_OR_MODEL"],
  [".las", "POINT_CLOUD"],
  [".laz", "POINT_CLOUD"],
  [".e57", "POINT_CLOUD"],
  [".splat", "SCAN_OR_SPLAT"],
  [".ksplat", "SCAN_OR_SPLAT"],
  [".png", "IMAGE"],
  [".jpg", "IMAGE"],
  [".jpeg", "IMAGE"],
  [".webp", "IMAGE"],
  [".tif", "IMAGE"],
  [".tiff", "IMAGE"],
  [".exr", "IMAGE"],
  [".mp4", "VIDEO"],
  [".mov", "VIDEO"],
  [".mkv", "VIDEO"],
  [".wav", "AUDIO"],
  [".mp3", "AUDIO"],
  [".ogg", "AUDIO"],
  [".flac", "AUDIO"],
  [".ttf", "FONT"],
  [".otf", "FONT"],
  [".woff", "FONT"],
  [".woff2", "FONT"],
  [".zip", "ARCHIVE"],
  [".7z", "ARCHIVE"],
  [".rar", "ARCHIVE"],
  [".tar", "ARCHIVE"],
  [".gz", "ARCHIVE"],
]);

function createGit(root) {
  return (args, options = {}) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: options.encoding ?? "utf8",
      maxBuffer: options.maxBuffer ?? 128 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
}

function toPosix(path) {
  return path.split(sep).join("/");
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function sensitiveIdentifier(value) {
  return [...SECRET_PATTERNS, ...PRIVACY_PATTERNS].some(([, pattern]) => {
    pattern.lastIndex = 0;
    return pattern.test(value);
  });
}

function safePath(path) {
  return sensitiveIdentifier(path)
    ? `[redacted historical path ${fingerprint(path)}]`
    : toPosix(path);
}

function exactCommit(git, ref) {
  const commit = git(["rev-parse", "--verify", `${ref}^{commit}`]).trim();
  if (!/^[0-9a-f]{40}$/.test(commit)) {
    throw new Error(`Unable to resolve exact commit for ${ref}: ${commit}`);
  }
  return commit;
}

function uniqueCommits(git, orphanRef, baselineRef) {
  return git(["rev-list", "--reverse", orphanRef, "--not", baselineRef])
    .toString("utf8")
    .split(/\r?\n/)
    .filter(Boolean);
}

function uniqueObjects(git, orphanRef, baselineRef) {
  const pathBySha = new Map();
  const output = git(["rev-list", "--objects", orphanRef, "--not", baselineRef]).toString(
    "utf8",
  );
  for (const line of output.split(/\r?\n/).filter(Boolean)) {
    const separator = line.indexOf(" ");
    const sha = separator === -1 ? line : line.slice(0, separator);
    const path = separator === -1 ? null : line.slice(separator + 1);
    if (!pathBySha.has(sha)) {
      pathBySha.set(sha, path);
    }
  }
  if (pathBySha.size === 0) {
    return [];
  }

  const batch = spawnSync(
    "git",
    ["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"],
    {
      cwd: process.cwd(),
      input: `${[...pathBySha.keys()].join("\n")}\n`,
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
    },
  );
  if (batch.status !== 0) {
    throw new Error(batch.stderr || "git cat-file --batch-check failed");
  }
  return batch.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [sha, type, sizeText] = line.split(" ");
      return {
        sha,
        type,
        size: Number(sizeText),
        path: pathBySha.get(sha) ?? null,
      };
    });
}

function changedPaths(git, commits) {
  const records = [];
  for (const commit of commits) {
    const output = git([
      "diff-tree",
      "--root",
      "--no-commit-id",
      "--name-status",
      "-r",
      "--find-renames",
      commit,
    ]).toString("utf8");
    for (const line of output.split(/\r?\n/).filter(Boolean)) {
      const fields = line.split("\t");
      const status = fields[0];
      const paths = fields.slice(1);
      for (const path of paths) {
        records.push({ commit, status, path: safePath(path), rawPath: path });
      }
    }
  }
  return records;
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

function scanText({ text, scope, path, objectSha, blockers, reviews, bridgeFindings }) {
  for (const [signature, pattern] of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      blockers.push({
        kind: "secret-pattern",
        signature,
        scope,
        path,
        objectSha,
        line: lineNumberAt(text, match.index ?? 0),
        fingerprint: fingerprint(match[0]),
      });
    }
  }
  for (const [signature, pattern] of PRIVACY_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      if (
        signature === "email-address" &&
        (match[0].endsWith("@users.noreply.github.com") ||
          match[0].endsWith("@example.com"))
      ) {
        continue;
      }
      reviews.push({
        kind: "privacy-review",
        signature,
        scope,
        path,
        objectSha,
        line: lineNumberAt(text, match.index ?? 0),
        fingerprint: fingerprint(match[0]),
      });
    }
  }
  for (const [signature, pattern] of LOCAL_BRIDGE_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      bridgeFindings.push({
        kind: "local-bridge-marker",
        signature,
        scope,
        path,
        objectSha,
        line: lineNumberAt(text, match.index ?? 0),
        fingerprint: fingerprint(match[0]),
      });
    }
  }
}

function isProbablyText(buffer) {
  return !buffer.subarray(0, Math.min(buffer.length, 8192)).includes(0);
}

function classifyPathRecord(record) {
  const extension = extname(record.rawPath).toLowerCase();
  const assetRole = ASSET_EXTENSIONS.get(extension) ?? null;
  const lower = record.rawPath.toLowerCase();
  const workflow = lower.startsWith(".github/workflows/");
  const sessionOrReceipt =
    /(?:session|capture|scan|receipt|manifest|provenance)/i.test(record.rawPath) &&
    [".json", ".txt", ".md", ".yml", ".yaml"].includes(extension);
  return { assetRole, workflow, sessionOrReceipt };
}

function deduplicate(findings) {
  const seen = new Set();
  return findings.filter((finding) => {
    const key = JSON.stringify(finding);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function auditOneRef({ root, git, orphanRef, baselineRef }) {
  const exactTip = exactCommit(git, orphanRef);
  const baselineCommit = exactCommit(git, baselineRef);
  const commits = uniqueCommits(git, orphanRef, baselineRef);
  const objects = uniqueObjects(git, orphanRef, baselineRef);
  const paths = changedPaths(git, commits);
  const blockers = [];
  const reviews = [];
  const bridgeFindings = [];
  const assetCandidates = [];
  const workflowCandidates = [];
  const sessionCandidates = [];

  for (const record of paths) {
    const classification = classifyPathRecord(record);
    const safeRecord = {
      commit: record.commit,
      status: record.status,
      path: record.path,
    };
    if (classification.assetRole !== null) {
      assetCandidates.push({ ...safeRecord, role: classification.assetRole });
    }
    if (classification.workflow) {
      workflowCandidates.push(safeRecord);
    }
    if (classification.sessionOrReceipt) {
      sessionCandidates.push(safeRecord);
    }
    if (sensitiveIdentifier(record.rawPath)) {
      reviews.push({
        kind: "sensitive-historical-path-name",
        signature: "path-identifier-review",
        scope: "orphan-unique-history-path",
        path: record.path,
        objectSha: record.commit,
        fingerprint: fingerprint(record.rawPath),
      });
    }
  }

  const blobRecords = objects.filter((object) => object.type === "blob");
  for (const object of objects) {
    if (object.type !== "blob" && object.type !== "commit" && object.type !== "tag") {
      continue;
    }
    const path =
      object.type === "blob"
        ? safePath(object.path ?? `[unmapped blob ${object.sha.slice(0, 12)}]`)
        : `[${object.type} ${object.sha.slice(0, 12)}]`;
    if (object.type === "blob" && object.size > LARGE_BLOB_BYTES) {
      reviews.push({
        kind: "large-unique-blob",
        signature: "unique-blob-over-10MiB",
        scope: "orphan-unique-history",
        path,
        objectSha: object.sha,
        bytes: object.size,
      });
    }
    if (object.size > MAX_TEXT_BLOB_BYTES) {
      reviews.push({
        kind: "unscanned-large-object",
        signature: "unique-object-over-2MiB",
        scope: "orphan-unique-history",
        path,
        objectSha: object.sha,
        bytes: object.size,
      });
      continue;
    }
    const buffer = git(["cat-file", object.type, object.sha], {
      encoding: "buffer",
      maxBuffer: Math.max(4 * 1024 * 1024, object.size + 1024),
    });
    if (isProbablyText(buffer)) {
      scanText({
        text: buffer.toString("utf8"),
        scope:
          object.type === "blob"
            ? "orphan-unique-history-blob"
            : "orphan-unique-history-metadata",
        path,
        objectSha: object.sha,
        blockers,
        reviews,
        bridgeFindings,
      });
    } else if (object.type === "blob") {
      const extension = extname(object.path ?? "").toLowerCase();
      if (!ASSET_EXTENSIONS.has(extension)) {
        reviews.push({
          kind: "unclassified-binary-blob",
          signature: extension || "no-extension",
          scope: "orphan-unique-history",
          path,
          objectSha: object.sha,
          bytes: object.size,
        });
      }
    }
  }

  const largestBlobs = blobRecords
    .slice()
    .sort((left, right) => right.size - left.size)
    .slice(0, 20)
    .map((object) => ({
      path: safePath(object.path ?? `[unmapped blob ${object.sha.slice(0, 12)}]`),
      objectSha: object.sha,
      bytes: object.size,
      extension: extname(object.path ?? "").toLowerCase() || null,
    }));

  const finalBlockers = deduplicate(blockers);
  const finalReviews = deduplicate(reviews);
  const finalBridges = deduplicate(bridgeFindings);
  const finalAssets = deduplicate(assetCandidates);
  const finalWorkflows = deduplicate(workflowCandidates);
  const finalSessions = deduplicate(sessionCandidates);

  return {
    orphanRef,
    exactTip,
    baselineRef,
    baselineCommit,
    uniqueCommitCount: commits.length,
    uniqueObjectCount: objects.length,
    uniqueBlobCount: blobRecords.length,
    changedPathRecordCount: paths.length,
    blockers: finalBlockers,
    reviewFindings: finalReviews,
    localBridgeFindings: finalBridges,
    assetCandidates: finalAssets,
    workflowCandidates: finalWorkflows,
    sessionAndReceiptCandidates: finalSessions,
    largestBlobs,
    status:
      finalBlockers.length > 0
        ? "ORPHAN_HISTORY_BLOCKED"
        : finalReviews.length > 0 ||
            finalBridges.length > 0 ||
            finalAssets.length > 0 ||
            finalWorkflows.length > 0 ||
            finalSessions.length > 0
          ? "ORPHAN_HISTORY_REVIEW_REQUIRED"
          : "ORPHAN_HISTORY_NO_FINDINGS",
  };
}

export function auditOrphanRefHistories({
  root: requestedRoot,
  orphanRefs,
  baselineRef = "refs/remotes/origin/agent/jv-web-demonstrator-foundation",
}) {
  const root = resolve(requestedRoot);
  const git = createGit(root);
  const repositoryRoot = resolve(git(["rev-parse", "--show-toplevel"]).trim());
  if (repositoryRoot !== root) {
    throw new Error(
      `Orphan-history audit root must equal the Git repository root. Expected ${repositoryRoot}, received ${root}.`,
    );
  }
  if (!Array.isArray(orphanRefs) || orphanRefs.length === 0) {
    throw new Error("At least one orphan ref is required.");
  }
  if (new Set(orphanRefs).size !== orphanRefs.length) {
    throw new Error("Orphan-history audit received duplicate refs.");
  }

  const sourceCommit = exactCommit(git, "HEAD");
  const results = orphanRefs.map((orphanRef) =>
    auditOneRef({ root, git, orphanRef, baselineRef }),
  );
  const blockerCount = results.reduce(
    (sum, result) => sum + result.blockers.length,
    0,
  );
  const reviewCount = results.reduce(
    (sum, result) =>
      sum +
      result.reviewFindings.length +
      result.localBridgeFindings.length +
      result.assetCandidates.length +
      result.workflowCandidates.length +
      result.sessionAndReceiptCandidates.length,
    0,
  );

  return {
    schemaVersion: 1,
    sourceCommit,
    baselineRef,
    generatedAtUtc: new Date().toISOString(),
    results,
    blockerCount,
    reviewCount,
    status:
      blockerCount > 0
        ? "ORPHAN_HISTORY_AUDIT_BLOCKED"
        : reviewCount > 0
          ? "ORPHAN_HISTORY_AUDIT_REVIEW_REQUIRED"
          : "ORPHAN_HISTORY_AUDIT_NO_FINDINGS",
    note:
      "Ignored private evidence. Exact orphan commits and asset paths must not be copied into future-public documents before classification. Ref deletion alone is not a purge if a real secret or private asset is found.",
  };
}
