import { createReadStream, lstatSync, statSync } from "node:fs";
import path from "node:path";
import {
  inspectJsprev2Pack,
  JSPREV2_REQUIREMENTS,
} from "./jsprev2-pack-inspector.mjs";

const INDEX_PATH = "/__jv_scan__/index.json";
const ASSET_PREFIX = "/__jv_scan__/asset/";

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

function loadExactPack(packDirectory) {
  if (typeof packDirectory !== "string" || packDirectory.length === 0) {
    return null;
  }
  const inspected = inspectJsprev2Pack(packDirectory, {
    deep: false,
    requireExact: true,
  });
  const assets = new Map();
  let nextAssetId = 1;
  const expose = (filePath) => {
    const id = String(nextAssetId++);
    assets.set(id, filePath);
    return `${ASSET_PREFIX}${id}`;
  };
  const tiles = inspected.tiles.map((tile) => ({
    tileId: tile.tileId,
    binaryUrl: expose(tile.binaryPath),
    binaryBytes: tile.binaryBytes,
    vertexCount: tile.vertexCount,
    indexCount: tile.indexCount,
    triangleCount: tile.triangleCount,
    groups: tile.groups.map((group) => ({
      textureUrl: expose(group.texturePath),
      textureBytes: group.textureBytes,
      vertexCount: group.vertexCount,
      indexCount: group.indexCount,
      triangleCount: group.triangleCount,
    })),
  }));
  return {
    assets,
    document: {
      schema: "JV_WEB_JSPREV2_INDEX_V2",
      available: true,
      packId: inspected.packId,
      tileCount: inspected.tileCount,
      groupCount: inspected.groupCount,
      textureCount: inspected.textureCount,
      vertexCount: inspected.vertexCount,
      indexCount: inspected.indexCount,
      triangleCount: inspected.triangleCount,
      manifestBytes: inspected.manifestBytes,
      binaryBytes: inspected.binaryBytes,
      textureBytes: inspected.textureBytes,
      totalBytes: inspected.totalBytes,
      estimatedCpuGeometryBytes: inspected.estimatedCpuGeometryBytes,
      estimatedGpuGeometryBytes: inspected.estimatedGpuGeometryBytes,
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
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export function finalJsprev2VitePlugin() {
  const configureScanServer = (server) => {
    let selected = null;
    try {
      selected = loadExactPack(process.env.JOZZ_SCAN_PREVIEW_PACK);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`JV final JSPREV2 selection failed: ${message}`);
    }

    if (selected === null) {
      server.config.logger.warn(
        "[jv-scan] JOZZ_SCAN_PREVIEW_PACK is not set; car + E2R will run without the scan",
      );
    } else {
      server.config.logger.info(
        `[jv-scan] exact final pack enabled: ${JSPREV2_REQUIREMENTS.groupCount}/${JSPREV2_REQUIREMENTS.textureCount}`,
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
        response.setHeader("Content-Length", String(statSync(filePath).size));
        response.setHeader("Cache-Control", "no-store");
        const stream = createReadStream(filePath);
        stream.on("error", (error) => {
          if (typeof response.destroy === "function") {
            response.destroy(error);
          }
        });
        stream.pipe(response);
        return;
      }
      next();
    });
  };

  return {
    name: "jv-final-jsprev2",
    configureServer: configureScanServer,
    configurePreviewServer: configureScanServer,
  };
}
