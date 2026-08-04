import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";

const MAX_LICENSE_BYTES = 1024 * 1024;
const LICENSE_NAME_PATTERN = /^(?:LICENSE|LICENCE|COPYING|NOTICE)(?:\..+)?$/i;

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

function reachableLicenseObjects(git) {
  const pathsByObject = new Map();
  for (const line of git(["rev-list", "--objects", "--all"])
    .split(/\r?\n/)
    .filter(Boolean)) {
    const separator = line.indexOf(" ");
    if (separator === -1) {
      continue;
    }
    const objectSha = line.slice(0, separator);
    const path = line.slice(separator + 1);
    if (!LICENSE_NAME_PATTERN.test(basename(path))) {
      continue;
    }
    const paths = pathsByObject.get(objectSha) ?? new Set();
    paths.add(path.replaceAll("\\", "/"));
    pathsByObject.set(objectSha, paths);
  }
  return pathsByObject;
}

function currentLicensePaths(git) {
  return git(["ls-tree", "-r", "--name-only", "HEAD"])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((path) => path.replaceAll("\\", "/"))
    .filter((path) => LICENSE_NAME_PATTERN.test(basename(path)))
    .sort();
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

  const currentPaths = new Set(currentLicensePaths(git));
  const records = [];
  for (const [objectSha, pathSet] of reachableLicenseObjects(git)) {
    const size = Number(git(["cat-file", "-s", objectSha]).trim());
    const paths = [...pathSet].sort();
    if (size > MAX_LICENSE_BYTES) {
      records.push({
        objectSha,
        bytes: size,
        textSha256: null,
        detectedLicense: "UNSCANNED_OVERSIZE",
        paths,
        currentPaths: paths.filter((path) => currentPaths.has(path)),
      });
      continue;
    }
    const text = git(["cat-file", "blob", objectSha]);
    records.push({
      objectSha,
      bytes: Buffer.byteLength(text),
      textSha256: sha256(normalizeText(text)),
      detectedLicense: detectLicense(text),
      paths,
      currentPaths: paths.filter((path) => currentPaths.has(path)),
    });
  }

  records.sort((left, right) =>
    `${left.detectedLicense}:${left.objectSha}`.localeCompare(
      `${right.detectedLicense}:${right.objectSha}`,
    ),
  );
  const distinctTexts = new Set(
    records.map((record) => record.textSha256).filter(Boolean),
  );
  const detectedLicenses = [
    ...new Set(records.map((record) => record.detectedLicense)),
  ].sort();

  const findings = [];
  if (currentPaths.size === 0) {
    findings.push({
      severity: "BLOCKER",
      id: "CURRENT_PROJECT_LICENSE_MISSING",
      message: "HEAD has no project LICENSE/COPYING file.",
    });
  }
  if (distinctTexts.size > 1) {
    findings.push({
      severity: "REVIEW",
      id: "MULTIPLE_REACHABLE_LICENSE_TEXTS",
      message: `${distinctTexts.size} distinct reachable license/notice texts require owner classification.`,
    });
  }
  if (detectedLicenses.includes("UNKNOWN")) {
    findings.push({
      severity: "REVIEW",
      id: "UNKNOWN_REACHABLE_LICENSE_TEXT",
      message: "At least one reachable license-like file was not classified.",
    });
  }

  return {
    schemaVersion: 1,
    sourceCommit: git(["rev-parse", "HEAD"]).trim(),
    currentLicensePaths: [...currentPaths].sort(),
    detectedLicenses,
    records,
    findings,
    status: findings.some((finding) => finding.severity === "BLOCKER")
      ? "LICENSE_INVENTORY_BLOCKED"
      : "LICENSE_INVENTORY_REVIEW",
  };
}