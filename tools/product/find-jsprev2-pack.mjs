#!/usr/bin/env node
import {
  closeSync,
  existsSync,
  lstatSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

const MAGIC = Buffer.from("JSPREV2\0", "ascii");
const REQUIRED_GROUPS = 25;
const REQUIRED_TEXTURES = 25;
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

function inspectBinaryHeader(filePath, expectedGroups) {
  if (!isPlainFile(filePath) || statSync(filePath).size < 20) {
    throw new Error("tile binary is missing or truncated");
  }
  const header = Buffer.allocUnsafe(20);
  const descriptor = openSync(filePath, "r");
  try {
    if (readSync(descriptor, header, 0, header.length, 0) !== header.length) {
      throw new Error("tile header read was incomplete");
    }
  } finally {
    closeSync(descriptor);
  }
  if (!header.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error("tile binary is not JSPREV2");
  }
  if (header.readUInt32LE(8) !== 2) {
    throw new Error("tile binary version is not 2");
  }
  const groupCount = header.readUInt32LE(16);
  if (groupCount !== expectedGroups) {
    throw new Error(
      `tile binary groups ${groupCount} != manifest groups ${expectedGroups}`,
    );
  }
}

function safeAsset(packDirectory, relativePath) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("absolute or empty asset path");
  }
  const normalized = path.normalize(relativePath);
  if (
    normalized === ".." ||
    normalized.startsWith(`..${path.sep}`) ||
    normalized.includes(`${path.sep}..${path.sep}`)
  ) {
    throw new Error("asset path traversal");
  }
  const resolved = realpathSync(path.resolve(packDirectory, normalized));
  const relative = path.relative(realpathSync(packDirectory), resolved);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative) ||
    !isPlainFile(resolved)
  ) {
    throw new Error("asset leaves pack or is not a regular file");
  }
  return resolved;
}

function inspectPack(directoryPath) {
  if (!isPlainDirectory(directoryPath)) {
    return null;
  }
  const packDirectory = realpathSync(directoryPath);
  const manifestPath = path.join(packDirectory, "COMPLETE.json");
  if (!isPlainFile(manifestPath)) {
    return null;
  }

  try {
    const manifest = readJson(manifestPath);
    if (!Array.isArray(manifest.tiles) || manifest.tiles.length === 0) {
      throw new Error("manifest has no tiles");
    }
    let groupCount = 0;
    let textureCount = 0;
    let triangleCount = 0;
    let totalBytes = statSync(manifestPath).size;

    for (const tile of manifest.tiles) {
      if (
        tile === null ||
        typeof tile !== "object" ||
        typeof tile.path !== "string" ||
        !Array.isArray(tile.groups)
      ) {
        throw new Error("tile record is incomplete");
      }
      const binaryPath = safeAsset(packDirectory, tile.path);
      inspectBinaryHeader(binaryPath, tile.groups.length);
      totalBytes += statSync(binaryPath).size;
      for (const group of tile.groups) {
        if (group === null || typeof group !== "object") {
          throw new Error("group record is invalid");
        }
        const texturePath = safeAsset(
          packDirectory,
          group.texturePath,
        );
        totalBytes += statSync(texturePath).size;
        groupCount += 1;
        textureCount += 1;
        if (
          Number.isInteger(group.triangleCount) &&
          group.triangleCount >= 0
        ) {
          triangleCount += group.triangleCount;
        }
      }
    }

    const packId =
      typeof manifest.packageId === "string"
        ? manifest.packageId
        : typeof manifest.previewContentSha256 === "string"
          ? manifest.previewContentSha256
          : path.basename(packDirectory);

    return {
      status: "ACCEPTED",
      packDirectory,
      manifestPath,
      packId,
      tileCount: manifest.tiles.length,
      groupCount,
      textureCount,
      triangleCount,
      totalBytes,
      modifiedTimeMs: statSync(manifestPath).mtimeMs,
    };
  } catch (error) {
    return {
      status: "REJECTED",
      packDirectory,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

function addSelector(candidates, selectorPath) {
  if (
    typeof selectorPath !== "string" ||
    selectorPath.length === 0
  ) {
    return;
  }
  const resolved = path.resolve(selectorPath);
  const basename = path.basename(resolved).toLowerCase();
  if (basename === "complete.json") {
    candidates.add(path.dirname(resolved));
    return;
  }
  if (basename === "active_preview.json") {
    if (!isPlainFile(resolved)) {
      return;
    }
    try {
      const selector = readJson(resolved);
      if (typeof selector.previewPath === "string") {
        candidates.add(path.resolve(selector.previewPath));
      }
    } catch {
      return;
    }
    return;
  }
  candidates.add(resolved);
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
  let visited = 0;
  while (queue.length > 0 && visited < MAX_DIRECTORIES) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }
    visited += 1;
    let entries;
    try {
      entries = readdirSync(current.directory, {
        withFileTypes: true,
      });
    } catch {
      continue;
    }
    if (
      entries.some(
        (entry) =>
          entry.isFile() && entry.name === "COMPLETE.json",
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
}

function parseArguments(argv) {
  const roots = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--root" || argument === "--candidate") {
      const value = argv[index + 1];
      if (value === undefined) {
        fail(`${argument} requires a path`);
      }
      roots.push(path.resolve(value));
      index += 1;
    } else {
      fail(`unknown argument: ${argument}`);
    }
  }
  return roots;
}

const suppliedRoots = parseArguments(process.argv.slice(2));
const candidates = new Set();
addSelector(candidates, process.env.JOZZ_SCAN_PREVIEW_PACK);
addSelector(candidates, process.env.JOZZ_SCAN_ACTIVE_PREVIEW);

for (const root of suppliedRoots) {
  if (isPlainFile(path.join(root, "COMPLETE.json"))) {
    addSelector(candidates, root);
  }
  addSelector(candidates, path.join(root, "ACTIVE_PREVIEW.json"));
  walk(root, candidates);
}

const accepted = [];
const rejected = [];
for (const candidate of candidates) {
  if (!existsSync(candidate)) {
    continue;
  }
  const result = inspectPack(candidate);
  if (result === null) {
    continue;
  }
  if (result.status === "ACCEPTED") {
    accepted.push(result);
  } else {
    rejected.push(result);
  }
}

const exact = accepted.filter(
  (pack) =>
    pack.groupCount === REQUIRED_GROUPS &&
    pack.textureCount === REQUIRED_TEXTURES,
);
exact.sort((left, right) => {
  if (right.triangleCount !== left.triangleCount) {
    return right.triangleCount - left.triangleCount;
  }
  if (right.totalBytes !== left.totalBytes) {
    return right.totalBytes - left.totalBytes;
  }
  return right.modifiedTimeMs - left.modifiedTimeMs;
});

if (exact.length === 0) {
  fail(
    `no exact ${REQUIRED_GROUPS}/${REQUIRED_TEXTURES} JSPREV2 pack found; ` +
      `accepted=${accepted.length}, rejected=${rejected.length}`,
  );
}

const selected = exact[0];
process.stdout.write(
  JSON.stringify({
    schema: "JV_WEB_JSPREV2_PACK_SELECTION_V1",
    status: "PASS",
    packDirectory: selected.packDirectory,
    manifestPath: selected.manifestPath,
    packId: selected.packId,
    tileCount: selected.tileCount,
    groupCount: selected.groupCount,
    textureCount: selected.textureCount,
    triangleCount: selected.triangleCount,
    totalBytes: selected.totalBytes,
    exactCandidateCount: exact.length,
    acceptedCandidateCount: accepted.length,
    rejectedCandidateCount: rejected.length,
  }),
);
