import {
  closeSync,
  createReadStream,
  lstatSync,
  openSync,
  readFileSync,
  readSync,
  realpathSync,
  statSync,
} from "node:fs";
import path from "node:path";

const INDEX_PATH = "/__jv_scan__/index.json";
const ASSET_PREFIX = "/__jv_scan__/asset/";
const MAGIC = Buffer.from("JSPREV2\0", "ascii");
const REQUIRED_GROUPS = 25;
const REQUIRED_TEXTURES = 25;

function isPlainFile(filePath) {
  try {
    const info = lstatSync(filePath);
    return info.isFile() && !info.isSymbolicLink();
  } catch {
    return false;
  }
}

function json(response, status, value) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(value));
}

function safeAsset(packDirectory, relativePath) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("manifest contains an absolute or empty asset path");
  }
  const normalized = path.normalize(relativePath);
  if (
    normalized === ".." ||
    normalized.startsWith(`..${path.sep}`) ||
    normalized.includes(`${path.sep}..${path.sep}`)
  ) {
    throw new Error("manifest contains path traversal");
  }
  const realPack = realpathSync(packDirectory);
  const realAsset = realpathSync(path.resolve(realPack, normalized));
  const relative = path.relative(realPack, realAsset);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative) ||
    !isPlainFile(realAsset)
  ) {
    throw new Error("manifest asset leaves the selected pack");
  }
  return realAsset;
}

function inspectBinaryHeader(filePath, expectedGroups) {
  if (!isPlainFile(filePath) || statSync(filePath).size < 20) {
    throw new Error("JSPREV2 tile binary is missing or truncated");
  }
  const header = Buffer.allocUnsafe(20);
  const descriptor = openSync(filePath, "r");
  try {
    if (readSync(descriptor, header, 0, header.length, 0) !== header.length) {
      throw new Error("JSPREV2 tile header read was incomplete");
    }
  } finally {
    closeSync(descriptor);
  }
  if (!header.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error("tile binary magic is not JSPREV2");
  }
  if (header.readUInt32LE(8) !== 2) {
    throw new Error("tile binary version is not 2");
  }
  const binaryGroupCount = header.readUInt32LE(16);
  if (binaryGroupCount !== expectedGroups) {
    throw new Error(
      `tile binary groups ${binaryGroupCount} != manifest groups ${expectedGroups}`,
    );
  }
}

function loadExactPack(packDirectory) {
  if (
    typeof packDirectory !== "string" ||
    packDirectory.length === 0
  ) {
    return null;
  }
  const realPack = realpathSync(packDirectory);
  const manifestPath = path.join(realPack, "COMPLETE.json");
  if (!isPlainFile(manifestPath)) {
    throw new Error("selected JSPREV2 pack has no COMPLETE.json");
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!Array.isArray(manifest.tiles) || manifest.tiles.length === 0) {
    throw new Error("selected JSPREV2 manifest has no tiles");
  }

  const assets = new Map();
  let nextAssetId = 1;
  let groupCount = 0;
  let textureCount = 0;
  const expose = (filePath) => {
    const id = String(nextAssetId++);
    assets.set(id, filePath);
    return `${ASSET_PREFIX}${id}`;
  };

  const tiles = manifest.tiles.map((tile) => {
    if (
      tile === null ||
      typeof tile !== "object" ||
      typeof tile.path !== "string" ||
      !Array.isArray(tile.groups)
    ) {
      throw new Error("selected JSPREV2 tile record is incomplete");
    }
    const binaryPath = safeAsset(realPack, tile.path);
    inspectBinaryHeader(binaryPath, tile.groups.length);
    const groups = tile.groups.map((group) => {
      if (group === null || typeof group !== "object") {
        throw new Error("selected JSPREV2 group record is invalid");
      }
      const texturePath = safeAsset(realPack, group.texturePath);
      groupCount += 1;
      textureCount += 1;
      return { textureUrl: expose(texturePath) };
    });
    return {
      binaryUrl: expose(binaryPath),
      groups,
    };
  });

  if (
    groupCount !== REQUIRED_GROUPS ||
    textureCount !== REQUIRED_TEXTURES
  ) {
    throw new Error(
      `selected JSPREV2 pack is ${groupCount}/${textureCount}; ` +
        `required ${REQUIRED_GROUPS}/${REQUIRED_TEXTURES}`,
    );
  }

  const packId =
    typeof manifest.packageId === "string"
      ? manifest.packageId
      : typeof manifest.previewContentSha256 === "string"
        ? manifest.previewContentSha256
        : path.basename(realPack);

  return {
    assets,
    document: {
      available: true,
      packId,
      tileCount: tiles.length,
      groupCount,
      textureCount,
      tiles,
    },
  };
}

function contentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}

export function finalJsprev2VitePlugin() {
  let selected = null;
  return {
    name: "jv-final-jsprev2",
    apply: "serve",
    configureServer(server) {
      try {
        selected = loadExactPack(process.env.JOZZ_SCAN_PREVIEW_PACK);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        throw new Error(`JV final JSPREV2 selection failed: ${message}`);
      }

      if (selected === null) {
        server.config.logger.warn(
          "[jv-scan] JOZZ_SCAN_PREVIEW_PACK is not set; car + E2R will run without the scan",
        );
      } else {
        server.config.logger.info(
          `[jv-scan] exact final pack enabled: ${REQUIRED_GROUPS}/${REQUIRED_TEXTURES}`,
        );
      }

      server.middlewares.use((request, response, next) => {
        const requestUrl = request.url?.split("?", 1)[0] ?? "";
        if (requestUrl === INDEX_PATH) {
          if (selected === null) {
            json(response, 404, {
              available: false,
              reason: "EXACT_JSPREV2_PACK_NOT_SELECTED",
            });
          } else {
            json(response, 200, selected.document);
          }
          return;
        }
        if (requestUrl.startsWith(ASSET_PREFIX)) {
          if (selected === null) {
            json(response, 404, { error: "SCAN_PACK_NOT_AVAILABLE" });
            return;
          }
          const id = requestUrl.slice(ASSET_PREFIX.length);
          const filePath = selected.assets.get(id);
          if (filePath === undefined || !isPlainFile(filePath)) {
            json(response, 404, { error: "SCAN_ASSET_NOT_FOUND" });
            return;
          }
          response.statusCode = 200;
          response.setHeader("Content-Type", contentType(filePath));
          response.setHeader(
            "Content-Length",
            String(statSync(filePath).size),
          );
          response.setHeader("Cache-Control", "no-store");
          createReadStream(filePath).pipe(response);
          return;
        }
        next();
      });
    },
  };
}
