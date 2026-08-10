#!/usr/bin/env node
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  inspectJsprev2Pack,
  JSPREV2_REQUIREMENTS,
} from "./jsprev2-pack-inspector.mjs";

const MAX_DIRECTORIES = 30_000;
const MAX_DEPTH = 12;
const SCOPED_ROOT_NAMES = new Set([
  "box3d_funproject",
  "build",
  "scan_pipeline",
  "js_photogrametry",
  "_private_scan_local",
]);

function fail(message) {
  process.stderr.write(`find-jsprev2-pack: ERROR: ${message}\n`);
  process.exit(2);
}

function isPlainFile(filePath) {
  try {
    const info = lstatSync(filePath);
    return info.isFile() && !info.isSymbolicLink();
  } catch {
    return false;
  }
}

function isPlainDirectory(directoryPath) {
  try {
    const info = lstatSync(directoryPath);
    return info.isDirectory() && !info.isSymbolicLink();
  } catch {
    return false;
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function addPackCandidate(target, candidatePath) {
  if (typeof candidatePath !== "string" || candidatePath.length === 0) {
    return;
  }
  const resolved = path.resolve(candidatePath);
  const basename = path.basename(resolved).toLowerCase();
  if (basename === "complete.json") {
    target.add(path.dirname(resolved));
  } else {
    target.add(resolved);
  }
}

function addActiveSelector(target, selectorPath) {
  if (typeof selectorPath !== "string" || selectorPath.length === 0) {
    return;
  }
  const resolved = path.resolve(selectorPath);
  if (path.basename(resolved).toLowerCase() !== "active_preview.json") {
    addPackCandidate(target, resolved);
    return;
  }
  if (!isPlainFile(resolved)) {
    return;
  }
  const selector = readJson(resolved);
  if (
    typeof selector.previewPath !== "string" ||
    selector.previewPath.length === 0
  ) {
    throw new Error(`${resolved} has no previewPath`);
  }
  addPackCandidate(
    target,
    path.isAbsolute(selector.previewPath)
      ? selector.previewPath
      : path.resolve(path.dirname(resolved), selector.previewPath),
  );
}

function isScopedSearchRoot(rootDirectory) {
  if (!isPlainDirectory(rootDirectory)) {
    return false;
  }
  if (isPlainFile(path.join(rootDirectory, "COMPLETE.json"))) {
    return true;
  }
  const basename = path.basename(path.resolve(rootDirectory)).toLowerCase();
  return SCOPED_ROOT_NAMES.has(basename);
}

function walk(rootDirectory, candidates) {
  if (!isScopedSearchRoot(rootDirectory)) {
    return;
  }
  const queue = [{ directory: rootDirectory, depth: 0 }];
  let cursor = 0;
  let visited = 0;
  while (cursor < queue.length && visited < MAX_DIRECTORIES) {
    const current = queue[cursor++];
    visited += 1;
    let entries;
    try {
      entries = readdirSync(current.directory, { withFileTypes: true });
    } catch {
      continue;
    }
    if (
      entries.some(
        (entry) => entry.isFile() && entry.name === "COMPLETE.json",
      )
    ) {
      candidates.add(current.directory);
    }
    if (current.depth >= MAX_DEPTH) {
      continue;
    }
    for (const entry of entries) {
      if (
        entry.isDirectory() &&
        !entry.isSymbolicLink() &&
        entry.name !== ".git" &&
        entry.name !== "node_modules" &&
        entry.name !== "dist"
      ) {
        queue.push({
          directory: path.join(current.directory, entry.name),
          depth: current.depth + 1,
        });
      }
    }
  }
  if (cursor < queue.length) {
    throw new Error(
      `JSPREV2 discovery exceeded ${MAX_DIRECTORIES} directories; use an explicit pack selector`,
    );
  }
}

function parseArguments(argv) {
  const roots = [];
  const candidates = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument !== "--root" && argument !== "--candidate") {
      fail(`unknown argument: ${argument}`);
    }
    const value = argv[index + 1];
    if (value === undefined) {
      fail(`${argument} requires a path`);
    }
    (argument === "--root" ? roots : candidates).push(path.resolve(value));
    index += 1;
  }
  return { roots, candidates };
}

function inspectCandidates(candidatePaths) {
  const accepted = [];
  const rejected = [];
  for (const candidate of candidatePaths) {
    if (!existsSync(candidate)) {
      continue;
    }
    try {
      accepted.push(
        inspectJsprev2Pack(candidate, {
          deep: false,
          requireExact: true,
        }),
      );
    } catch (error) {
      rejected.push({
        candidate: path.resolve(candidate),
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }
  const unique = new Map();
  for (const pack of accepted) {
    unique.set(pack.packDirectory, pack);
  }
  return { accepted: [...unique.values()], rejected };
}

const argumentsResult = parseArguments(process.argv.slice(2));
const preferredCandidates = new Set();
const discoveredCandidates = new Set();

try {
  addPackCandidate(preferredCandidates, process.env.JOZZ_SCAN_PREVIEW_PACK);
  addActiveSelector(preferredCandidates, process.env.JOZZ_SCAN_ACTIVE_PREVIEW);
  for (const candidate of argumentsResult.candidates) {
    addPackCandidate(preferredCandidates, candidate);
  }
  for (const root of argumentsResult.roots) {
    if (isPlainFile(path.join(root, "COMPLETE.json"))) {
      addPackCandidate(discoveredCandidates, root);
    }
    addActiveSelector(
      preferredCandidates,
      path.join(root, "ACTIVE_PREVIEW.json"),
    );
    walk(root, discoveredCandidates);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

const preferred = inspectCandidates(preferredCandidates);
let selectedSummary;
let selectionMode;
let candidateStats;
if (preferred.accepted.length > 1) {
  fail(
    `multiple explicit/active exact JSPREV2 packs found: ${preferred.accepted
      .map((pack) => pack.packDirectory)
      .join(" | ")}`,
  );
}
if (preferredCandidates.size > 0 && preferred.accepted.length === 0) {
  const reasons = preferred.rejected
    .slice(0, 3)
    .map((entry) => `${entry.candidate}: ${entry.reason}`)
    .join(" | ");
  fail(
    `explicit/active JSPREV2 selection is invalid` +
      (reasons.length === 0 ? "" : `; reasons=${reasons}`),
  );
}
if (preferred.accepted.length === 1) {
  selectedSummary = preferred.accepted[0];
  selectionMode = "EXPLICIT_OR_ACTIVE";
  candidateStats = preferred;
} else {
  const discovered = inspectCandidates(discoveredCandidates);
  if (discovered.accepted.length === 0) {
    const rejectionReasons = [...preferred.rejected, ...discovered.rejected]
      .slice(0, 3)
      .map((entry) => `${entry.candidate}: ${entry.reason}`)
      .join(" | ");
    fail(
      `no exact ${JSPREV2_REQUIREMENTS.groupCount}/${JSPREV2_REQUIREMENTS.textureCount} ` +
        `JSPREV2 pack found; preferredRejected=${preferred.rejected.length}, ` +
        `discoveredRejected=${discovered.rejected.length}` +
        (rejectionReasons.length === 0 ? "" : `; reasons=${rejectionReasons}`),
    );
  }
  if (discovered.accepted.length > 1) {
    fail(
      `ambiguous exact JSPREV2 selection (${discovered.accepted.length} packs); ` +
        `set JOZZ_SCAN_PREVIEW_PACK or ACTIVE_PREVIEW.json explicitly`,
    );
  }
  selectedSummary = discovered.accepted[0];
  selectionMode = "UNIQUE_DISCOVERY";
  candidateStats = discovered;
}

let selected;
try {
  selected = inspectJsprev2Pack(selectedSummary.packDirectory, {
    deep: true,
    requireExact: true,
  });
} catch (error) {
  fail(
    `selected pack failed deep validation: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
}

process.stdout.write(
  JSON.stringify({
    schema: "JV_WEB_JSPREV2_PACK_SELECTION_V2",
    status: "PASS",
    selectionMode,
    packDirectory: selected.packDirectory,
    manifestPath: selected.manifestPath,
    packId: selected.packId,
    tileCount: selected.tileCount,
    groupCount: selected.groupCount,
    textureCount: selected.textureCount,
    vertexCount: selected.vertexCount,
    indexCount: selected.indexCount,
    triangleCount: selected.triangleCount,
    manifestBytes: selected.manifestBytes,
    binaryBytes: selected.binaryBytes,
    textureBytes: selected.textureBytes,
    totalBytes: selected.totalBytes,
    estimatedCpuGeometryBytes: selected.estimatedCpuGeometryBytes,
    estimatedGpuGeometryBytes: selected.estimatedGpuGeometryBytes,
    deepValidated: selected.deepValidated,
    acceptedCandidateCount: candidateStats.accepted.length,
    rejectedCandidateCount: candidateStats.rejected.length,
  }),
);
