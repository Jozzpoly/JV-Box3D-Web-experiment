import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";

const MAX_LICENSE_BYTES = 1024 * 1024;
const PROJECT_LICENSE_PATTERN = /^(?:LICENSE|LICENCE|COPYING)(?:\..+)?$/i;
const NOTICE_PATTERN = /^(?:NOTICE|THIRD[-_.]?PARTY[-_.]?(?:NOTICES?|LICENSES?))(?:\..+)?$/i;
const SENSITIVE_IDENTIFIER_PATTERNS = [
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{20,255})\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,255}\b/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,255}\b/,
  /https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/,
  /\/\/registry\.npmjs\.org\/:_authToken\s*=\s*[^\s]+/,
  /\b[A-Za-z]:\\Users\\[^\\\r\n]+/,
  /(?:^|[\s"'`])\/home\/[^/\s"'`]+/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
];

function createGit(root) {
  return (args, options = {}) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: options.encoding ?? "utf8",
      maxBuffer: options.maxBuffer ?? 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
}

function normalizeText(text) {
  return `${text.replace(/\r\n/g, "\n").trimEnd()}\n`;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function fingerprint(value) {
  return sha256(value).slice(0, 12);
}

function safePath(path) {
  if (!SENSITIVE_IDENTIFIER_PATTERNS.some((pattern) => pattern.test(path))) {
    return path;
  }
  return `[redacted license path ${fingerprint(path)}]`;
}

function classifyPath(path) {
  const normalized = path.replaceAll("\\", "/");
  const name = basename(normalized);
  if (NOTICE_PATTERN.test(name)) {
    return "THIRD_PARTY_NOTICE";
  }
  if (PROJECT_LICENSE_PATTERN.test(name)) {
    return normalized.includes("/")
      ? "THIRD_PARTY_LICENSE"
      : "PROJECT_LICENSE";
  }
  return null;
}

function detectLicense(text) {
  const normalized = normalizeText(text);
  if (
    normalized.startsWith("MIT License\n") &&
    normalized.includes("Permission is hereby granted, free of charge")
  ) {
    return "MIT";
  }
  if (
    normalized.includes("Apache License") &&
    normalized.includes("Version 2.0, January 2004")
  ) {
    return "Apache-2.0";
  }
  if (normalized.includes("GNU GENERAL PUBLIC LICENSE")) {
    return "GPL-family-unclassified";
  }
  return "UNKNOWN";
}

function reachableDocuments(git) {
  const documents = new Map();
  for (const line of git(["rev-list", "--objects", "--all"])
    .split(/\r?\n/)
    .filter(Boolean)) {
    const separator = line.indexOf(" ");
    if (separator === -1) {
      continue;
    }
    const objectSha = line.slice(0, separator);
    const rawPath = line.slice(separator + 1).replaceAll("\\", "/");
    const role = classifyPath(rawPath);
    if (role === null) {
      continue;
    }
    const key = `${role}:${objectSha}`;
    const entry = documents.get(key) ?? {
      role,
      objectSha,
      paths: new Set(),
    };
    entry.paths.add(safePath(rawPath));
    documents.set(key, entry);
  }
  return [...documents.values()];
}

function currentPathsByRole(git) {
  const result = {
    PROJECT_LICENSE: new Set(),
    THIRD_PARTY_NOTICE: new Set(),
    THIRD_PARTY_LICENSE: new Set(),
  };
  for (const rawPath of git(["ls-tree", "-r", "--name-only", "HEAD"])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((path) => path.replaceAll("\\", "/"))) {
    const role = classifyPath(rawPath);
    if (role !== null) {
      result[role].add(safePath(rawPath));
    }
  }
  return result;
}

export function inventoryReachableLicenses({ root: requestedRoot }) {
  const root = resolve(requestedRoot);
  const git = createGit(root);
  const repositoryRoot = resolve(git(["rev-parse", "--show-toplevel"]).trim());
  if (repositoryRoot !== root) {
    throw new Error(
      `License inventory root must equal the Git repository root. Expected ${repositoryRoot}, received ${root}.`,
    );
  }

  const current = currentPathsByRole(git);
  const records = [];
  for (const document of reachableDocuments(git)) {
    const size = Number(git(["cat-file", "-s", document.objectSha]).trim());
    const paths = [...document.paths].sort();
    const currentPaths = paths.filter((path) => current[document.role].has(path));
    if (size > MAX_LICENSE_BYTES) {
      records.push({
        role: document.role,
        objectSha: document.objectSha,
        bytes: size,
        textSha256: null,
        detectedLicense:
          document.role === "THIRD_PARTY_NOTICE"
            ? null
            : "UNSCANNED_OVERSIZE",
        paths,
        currentPaths,
      });
      continue;
    }

    const text = git(["cat-file", "blob", document.objectSha]);
    records.push({
      role: document.role,
      objectSha: document.objectSha,
      bytes: Buffer.byteLength(text),
      textSha256: sha256(normalizeText(text)),
      detectedLicense:
        document.role === "THIRD_PARTY_NOTICE" ? null : detectLicense(text),
      paths,
      currentPaths,
    });
  }

  records.sort((left, right) =>
    `${left.role}:${left.detectedLicense ?? ""}:${left.objectSha}`.localeCompare(
      `${right.role}:${right.detectedLicense ?? ""}:${right.objectSha}`,
    ),
  );

  const projectRecords = records.filter(
    (record) => record.role === "PROJECT_LICENSE",
  );
  const distinctProjectTexts = new Set(
    projectRecords.map((record) => record.textSha256).filter(Boolean),
  );
  const detectedProjectLicenses = [
    ...new Set(projectRecords.map((record) => record.detectedLicense)),
  ].sort();

  const findings = [];
  if (current.PROJECT_LICENSE.size === 0) {
    findings.push({
      severity: "BLOCKER",
      id: "CURRENT_PROJECT_LICENSE_MISSING",
      message: "HEAD has no root project LICENSE/LICENCE/COPYING file.",
    });
  }
  if (current.THIRD_PARTY_NOTICE.size === 0) {
    findings.push({
      severity: "BLOCKER",
      id: "CURRENT_THIRD_PARTY_NOTICE_MISSING",
      message: "HEAD has no THIRD_PARTY_NOTICES/NOTICE file.",
    });
  }
  if (distinctProjectTexts.size > 1) {
    findings.push({
      severity: "REVIEW",
      id: "MULTIPLE_REACHABLE_PROJECT_LICENSE_TEXTS",
      message: `${distinctProjectTexts.size} distinct reachable root project-license texts require owner classification.`,
    });
  }
  if (detectedProjectLicenses.includes("UNKNOWN")) {
    findings.push({
      severity: "REVIEW",
      id: "UNKNOWN_REACHABLE_PROJECT_LICENSE_TEXT",
      message: "At least one reachable root project-license file was not classified.",
    });
  }
  if (
    records.some(
      (record) =>
        record.role === "THIRD_PARTY_LICENSE" &&
        record.detectedLicense === "UNKNOWN",
    )
  ) {
    findings.push({
      severity: "REVIEW",
      id: "UNKNOWN_REACHABLE_THIRD_PARTY_LICENSE_TEXT",
      message: "At least one nested third-party license file was not classified.",
    });
  }

  return {
    schemaVersion: 3,
    sourceCommit: git(["rev-parse", "HEAD"]).trim(),
    currentProjectLicensePaths: [...current.PROJECT_LICENSE].sort(),
    currentThirdPartyNoticePaths: [...current.THIRD_PARTY_NOTICE].sort(),
    currentThirdPartyLicensePaths: [...current.THIRD_PARTY_LICENSE].sort(),
    detectedProjectLicenses,
    records,
    findings,
    status: findings.some((finding) => finding.severity === "BLOCKER")
      ? "LICENSE_INVENTORY_BLOCKED"
      : findings.length > 0
        ? "LICENSE_INVENTORY_REVIEW"
        : "LICENSE_INVENTORY_PASS",
  };
}
