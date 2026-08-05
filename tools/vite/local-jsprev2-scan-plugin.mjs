import {
  createReadStream,
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import path from "node:path";

const INDEX_PATH = "/__jv_scan__/index.json";
const ASSET_PREFIX = "/__jv_scan__/asset/";
const MAGIC = Buffer.from("JSPREV2\0", "ascii");
const MAX_DISCOVERY_DIRECTORIES = 12_000;
const MAX_DISCOVERY_DEPTH = 8;

function json(response, status, value) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(value));
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

function safeRelativeFile(packDirectory, relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new Error("scan manifest contains an empty asset path");
  }
  if (path.isAbsolute(relativePath)) {
    throw new Error("scan manifest contains an absolute asset path");
  }
  const normalized = path.normalize(relativePath);
  if (
    normalized === ".." ||
    normalized.startsWith(`..${path.sep}`) ||
    normalized.includes(`${path.sep}..${path.sep}`)
  ) {
    throw new Error("scan manifest contains path traversal");
  }
  const resolved = path.resolve(packDirectory, normalized);
  const realPack = realpathSync(packDirectory);
  const realAsset = realpathSync(resolved);
  const relative = path.relative(realPack, realAsset);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error("scan manifest asset leaves its pack directory");
  }
  if (!isPlainFile(realAsset)) {
    throw new Error("scan manifest asset is not a regular local file");
  }
  return realAsset;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function isJsprev2Tile(filePath) {
  if (!isPlainFile(filePath) || statSync(filePath).size < 20) {
    return false;
  }
  const descriptor = readFileSync(filePath);
  return descriptor.subarray(0, MAGIC.length).equals(MAGIC);
}

function manifestTiles(document) {
  if (
    document === null ||
    typeof document !== "object" ||
    !Array.isArray(document.tiles) ||
    document.tiles.length === 0
  ) {
    throw new Error("scan COMPLETE.json has no tiles");
  }
  return document.tiles;
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
    const document = readJson(manifestPath);
    const tiles = manifestTiles(document);
    const inspectedTiles = [];
    let groupCount = 0;
    let textureCount = 0;
    let totalBytes = statSync(manifestPath).size;

    for (const tile of tiles) {
      if (
        tile === null ||
        typeof tile !== "object" ||
        typeof tile.path !== "string" ||
        !Array.isArray(tile.groups)
      ) {
        throw new Error("scan tile record is incomplete");
      }
      const binaryPath = safeRelativeFile(packDirectory, tile.path);
      if (!isJsprev2Tile(binaryPath)) {
        throw new Error("scan tile is not JSPREV2");
      }
      totalBytes += statSync(binaryPath).size;

      const groups = [];
      for (const group of tile.groups) {
        if (group === null || typeof group !== "object") {
          throw new Error("scan group record is invalid");
        }
        let texturePath = null;
        if (
          typeof group.texturePath === "string" &&
          group.texturePath.length > 0
        ) {
          texturePath = safeRelativeFile(
            packDirectory,
            group.texturePath,
          );
          totalBytes += statSync(texturePath).size;
          textureCount += 1;
        }
        groups.push({ texturePath });
        groupCount += 1;
      }
      inspectedTiles.push({ binaryPath, groups });
    }

    if (groupCount === 0) {
      throw new Error("scan pack contains no render groups");
    }

    const identity =
      typeof document.packageId === "string"
        ? document.packageId
        : typeof document.previewContentSha256 === "string"
          ? document.previewContentSha256
          : path.basename(packDirectory);

    return {
      packDirectory,
      manifestPath,
      identity,
      tiles: inspectedTiles,
      groupCount,
      textureCount,
      totalBytes,
      modifiedTimeMs: statSync(manifestPath).mtimeMs,
    };
  } catch (error) {
    return {
      rejected: true,
      packDirectory,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

function addCandidate(candidates, candidatePath) {
  if (typeof candidatePath !== "string" || candidatePath.length === 0) {
    return;
  }
  const resolved = path.resolve(candidatePath);
  if (path.basename(resolved).toLowerCase() === "complete.json") {
    candidates.add(path.dirname(resolved));
  } else if (path.basename(resolved).toLowerCase() === "active_preview.json") {
    try {
      const active = readJson(resolved);
      if (typeof active.previewPath === "string") {
        candidates.add(path.resolve(active.previewPath));
      }
    } catch {
      // Invalid active selectors are ignored; verified packs are discovered below.
    }
  } else {
    candidates.add(resolved);
  }
}

function walkForComplete(rootDirectory, candidates) {
  if (!isPlainDirectory(rootDirectory)) {
    return;
  }
  const queue = [{ directory: rootDirectory, depth: 0 }];
  let visited = 0;
  while (queue.length > 0 && visited < MAX_DISCOVERY_DIRECTORIES) {
    const entry = queue.shift();
    if (entry === undefined) {
      break;
    }
    visited += 1;
    let names;
    try {
      names = readdirSync(entry.directory, { withFileTypes: true });
    } catch {
      continue;
    }
    if (names.some((item) => item.isFile() && item.name === "COMPLETE.json")) {
      candidates.add(entry.directory);
    }
    if (entry.depth >= MAX_DISCOVERY_DEPTH) {
      continue;
    }
    for (const item of names) {
      if (
        item.isDirectory() &&
        !item.isSymbolicLink() &&
        item.name !== "node_modules" &&
        item.name !== ".git" &&
        item.name !== "dist"
      ) {
        queue.push({
          directory: path.join(entry.directory, item.name),
          depth: entry.depth + 1,
        });
      }
    }
  }
}

function discoveryRoots(projectRoot) {
  const roots = new Set();
  const explicitRoots = [
    process.env.JOZZ_SCAN_PIPELINE_ROOT,
    process.env.JOZZ_BOX3D_REPO,
    process.env.JOZZ_NATIVE_REPO,
  ];
  for (const value of explicitRoots) {
    if (typeof value === "string" && value.length > 0) {
      const resolved = path.resolve(value);
      roots.add(resolved);
      roots.add(path.join(resolved, "build"));
      roots.add(path.join(resolved, "build", "scan_pipeline"));
    }
  }

  let current = path.resolve(projectRoot);
  for (let level = 0; level < 7; level += 1) {
    roots.add(path.join(current, "build"));
    roots.add(path.join(current, "build", "scan_pipeline"));
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return [...roots];
}

function discoverPack(projectRoot, logger) {
  const candidates = new Set();
  addCandidate(candidates, process.env.JOZZ_SCAN_PREVIEW_PACK);
  addCandidate(candidates, process.env.JOZZ_SCAN_ACTIVE_PREVIEW);

  for (const root of discoveryRoots(projectRoot)) {
    addCandidate(
      candidates,
      path.join(root, "ACTIVE_PREVIEW.json"),
    );
    walkForComplete(root, candidates);
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
    if (result.rejected === true) {
      rejected.push(result);
    } else {
      accepted.push(result);
    }
  }

  accepted.sort((left, right) => {
    if (right.textureCount !== left.textureCount) {
      return right.textureCount - left.textureCount;
    }
    if (right.groupCount !== left.groupCount) {
      return right.groupCount - left.groupCount;
    }
    return right.modifiedTimeMs - left.modifiedTimeMs;
  });

  const selected = accepted[0] ?? null;
  if (selected === null) {
    logger.warn(
      `[jv-scan] no verified JSPREV2 pack found (${rejected.length} rejected candidates)`,
    );
    return null;
  }
  logger.info(
    `[jv-scan] selected local JSPREV2 pack: groups=${selected.groupCount}, textures=${selected.textureCount}, bytes=${selected.totalBytes}`,
  );
  return selected;
}

function contentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function buildPublicIndex(pack) {
  const assets = new Map();
  let nextId = 1;
  const expose = (filePath) => {
    const id = String(nextId++);
    assets.set(id, filePath);
    return `${ASSET_PREFIX}${id}`;
  };

  const tiles = pack.tiles.map((tile) => ({
    binaryUrl: expose(tile.binaryPath),
    groups: tile.groups.map((group) => ({
      textureUrl:
        group.texturePath === null
          ? null
          : expose(group.texturePath),
    })),
  }));

  return {
    assets,
    document: {
      available: true,
      packId: pack.identity,
      tileCount: pack.tiles.length,
      groupCount: pack.groupCount,
      textureCount: pack.textureCount,
      tiles,
    },
  };
}

export function localJsprev2ScanPlugin() {
  let exposed = null;
  return {
    name: "jv-local-jsprev2-scan",
    apply: "serve",
    configureServer(server) {
      const projectRoot = server.config.root ?? process.cwd();
      const pack = discoverPack(projectRoot, server.config.logger);
      exposed = pack === null ? null : buildPublicIndex(pack);

      server.middlewares.use((request, response, next) => {
        const requestUrl = request.url?.split("?", 1)[0] ?? "";
        if (requestUrl === INDEX_PATH) {
          if (exposed === null) {
            json(response, 404, {
              available: false,
              reason: "NO_VERIFIED_LOCAL_JSPREV2_PACK",
            });
            return;
          }
          json(response, 200, exposed.document);
          return;
        }
        if (requestUrl.startsWith(ASSET_PREFIX)) {
          if (exposed === null) {
            json(response, 404, { error: "SCAN_PACK_NOT_AVAILABLE" });
            return;
          }
          const id = requestUrl.slice(ASSET_PREFIX.length);
          const filePath = exposed.assets.get(id);
          if (filePath === undefined || !isPlainFile(filePath)) {
            json(response, 404, { error: "SCAN_ASSET_NOT_FOUND" });
            return;
          }
          response.statusCode = 200;
          response.setHeader("Content-Type", contentType(filePath));
          response.setHeader("Content-Length", String(statSync(filePath).size));
          response.setHeader("Cache-Control", "no-store");
          createReadStream(filePath).pipe(response);
          return;
        }
        next();
      });
    },
  };
}
