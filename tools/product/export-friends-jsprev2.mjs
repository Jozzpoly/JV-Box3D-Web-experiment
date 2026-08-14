import { createReadStream } from "node:fs";
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectJsprev2Pack } from "./jsprev2-pack-inspector.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

export const FRIENDS_R1_SCAN_CONTRACT = Object.freeze({
  releaseId: "friends-r1",
  packageId: "scan/photogrammetry-primary",
  previewContentSha256:
    "aee5242a208482944666b56bcc7ddfe66cbd4e72dc9da99199fbe667bd578146",
  completeJsonSha256:
    "a0f3bc792f0a273c18fb00117deafdec95959f8f7e9f2a0bb85af34c8c2e29fb",
});

const INDEX_NAME = "index.json";
const SCAN_DIRECTORY = "__jv_scan__";
const RECEIPT_RELATIVE_PATH = "receipts/jv_friends_scan_receipt.json";

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function safeRelativeAsset(packDirectory, absolutePath) {
  const relative = path.relative(packDirectory, absolutePath);
  if (
    relative.length === 0 ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error("JSPREV2 asset leaves the selected pack.");
  }
  return toPosix(relative);
}

function requireSha256(value, label) {
  if (typeof value !== "string" || !/^[0-9a-f]{64}$/.test(value)) {
    throw new Error(`${label} must be a lowercase SHA-256.`);
  }
  return value;
}

async function sha256File(filePath) {
  const hash = createHash("sha256");
  const stream = createReadStream(filePath);
  for await (const chunk of stream) {
    hash.update(chunk);
  }
  return hash.digest("hex");
}

async function fileRecord(filePath, relativePath) {
  const info = await stat(filePath);
  if (!info.isFile()) {
    throw new Error(`${relativePath} is not a regular file.`);
  }
  return {
    path: relativePath,
    bytes: info.size,
    sha256: await sha256File(filePath),
  };
}

function equalInteger(actual, expected, label) {
  if (actual !== undefined && actual !== expected) {
    throw new Error(`${label} ${String(actual)} != inspected ${expected}.`);
  }
}

async function verifyPinnedSource({
  packDirectory,
  inspected,
  manifest,
  contract,
}) {
  if (manifest.schema !== "jozz.scan-source-visual-preview-pack") {
    throw new Error("Friends scan source schema is not the expected preview pack.");
  }
  if (manifest.schemaVersion !== 2 || manifest.status !== "COMPLETE") {
    throw new Error("Friends scan source is not a COMPLETE schemaVersion 2 pack.");
  }
  if (manifest.packageId !== contract.packageId || inspected.packId !== contract.packageId) {
    throw new Error("Friends scan packageId differs from the pinned release contract.");
  }
  if (manifest.previewContentSha256 !== contract.previewContentSha256) {
    throw new Error("Friends scan previewContentSha256 differs from the pinned release contract.");
  }

  const completePath = path.join(packDirectory, "COMPLETE.json");
  const completeSha256 = await sha256File(completePath);
  if (completeSha256 !== contract.completeJsonSha256) {
    throw new Error("Friends scan COMPLETE.json differs from the pinned release contract.");
  }

  equalInteger(manifest.tileCount, inspected.tileCount, "manifest tileCount");
  if (!Array.isArray(manifest.tiles) || manifest.tiles.length !== inspected.tiles.length) {
    throw new Error("Friends scan manifest tile list differs from inspection.");
  }

  for (let tileIndex = 0; tileIndex < inspected.tiles.length; tileIndex += 1) {
    const sourceTile = manifest.tiles[tileIndex];
    const inspectedTile = inspected.tiles[tileIndex];
    if (sourceTile === null || typeof sourceTile !== "object") {
      throw new Error(`Friends scan tile ${tileIndex} manifest entry is invalid.`);
    }
    equalInteger(sourceTile.tileId, inspectedTile.tileId, `tile ${tileIndex} tileId`);
    equalInteger(sourceTile.byteLength, inspectedTile.binaryBytes, `tile ${tileIndex} byteLength`);
    equalInteger(sourceTile.vertexCount, inspectedTile.vertexCount, `tile ${tileIndex} vertexCount`);
    equalInteger(sourceTile.indexCount, inspectedTile.indexCount, `tile ${tileIndex} indexCount`);
    equalInteger(sourceTile.triangleCount, inspectedTile.triangleCount, `tile ${tileIndex} triangleCount`);

    const expectedBinarySha = requireSha256(sourceTile.sha256, `tile ${tileIndex} sha256`);
    const actualBinarySha = await sha256File(inspectedTile.binaryPath);
    if (actualBinarySha !== expectedBinarySha) {
      throw new Error(`Friends scan tile ${tileIndex} SHA-256 differs from COMPLETE.json.`);
    }

    if (!Array.isArray(sourceTile.groups) || sourceTile.groups.length !== inspectedTile.groups.length) {
      throw new Error(`Friends scan tile ${tileIndex} group list differs from inspection.`);
    }
    for (let groupIndex = 0; groupIndex < inspectedTile.groups.length; groupIndex += 1) {
      const sourceGroup = sourceTile.groups[groupIndex];
      const inspectedGroup = inspectedTile.groups[groupIndex];
      if (sourceGroup === null || typeof sourceGroup !== "object") {
        throw new Error(`Friends scan tile ${tileIndex} group ${groupIndex} is invalid.`);
      }
      equalInteger(sourceGroup.groupId, groupIndex, `tile ${tileIndex} group ${groupIndex} groupId`);
      equalInteger(sourceGroup.textureByteLength, inspectedGroup.textureBytes, `tile ${tileIndex} group ${groupIndex} textureByteLength`);
      equalInteger(sourceGroup.vertexCount, inspectedGroup.vertexCount, `tile ${tileIndex} group ${groupIndex} vertexCount`);
      equalInteger(sourceGroup.indexCount, inspectedGroup.indexCount, `tile ${tileIndex} group ${groupIndex} indexCount`);
      equalInteger(sourceGroup.triangleCount, inspectedGroup.triangleCount, `tile ${tileIndex} group ${groupIndex} triangleCount`);
      const expectedTextureSha = requireSha256(
        sourceGroup.textureSha256,
        `tile ${tileIndex} group ${groupIndex} textureSha256`,
      );
      const actualTextureSha = await sha256File(inspectedGroup.texturePath);
      if (actualTextureSha !== expectedTextureSha) {
        throw new Error(
          `Friends scan tile ${tileIndex} group ${groupIndex} texture SHA-256 differs from COMPLETE.json.`,
        );
      }
    }
  }

  return completeSha256;
}

function buildIndex(inspected) {
  return {
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
    tiles: inspected.tiles.map((tile) => ({
      tileId: tile.tileId,
      binaryUrl: safeRelativeAsset(inspected.packDirectory, tile.binaryPath),
      binaryBytes: tile.binaryBytes,
      vertexCount: tile.vertexCount,
      indexCount: tile.indexCount,
      triangleCount: tile.triangleCount,
      groups: tile.groups.map((group) => ({
        textureUrl: safeRelativeAsset(inspected.packDirectory, group.texturePath),
        textureBytes: group.textureBytes,
        vertexCount: group.vertexCount,
        indexCount: group.indexCount,
        triangleCount: group.triangleCount,
      })),
    })),
  };
}

export async function exportFriendsJsprev2({
  packDirectory,
  distDirectory = path.resolve(root, "dist"),
  contract = FRIENDS_R1_SCAN_CONTRACT,
} = {}) {
  if (typeof packDirectory !== "string" || packDirectory.trim().length === 0) {
    throw new Error("JOZZ_SCAN_PREVIEW_PACK must select the exact Friends JSPREV2 pack.");
  }

  const inspected = inspectJsprev2Pack(packDirectory, {
    deep: true,
    requireExact: true,
  });
  const manifest = JSON.parse(await readFile(inspected.manifestPath, "utf8"));
  const completeSha256 = await verifyPinnedSource({
    packDirectory: inspected.packDirectory,
    inspected,
    manifest,
    contract,
  });

  const stageRoot = path.resolve(
    distDirectory,
    `.jv-scan-stage-${process.pid}-${Date.now()}`,
  );
  const stageScanRoot = path.join(stageRoot, SCAN_DIRECTORY);
  const stageReceipt = path.join(stageRoot, "jv_friends_scan_receipt.json");
  const scanRoot = path.resolve(distDirectory, SCAN_DIRECTORY);
  const receiptPath = path.resolve(distDirectory, RECEIPT_RELATIVE_PATH);

  await rm(stageRoot, { recursive: true, force: true });
  await mkdir(stageScanRoot, { recursive: true });

  try {
    const copiedAssets = [];
    const seen = new Set();
    const copyAsset = async (sourcePath) => {
      const relative = safeRelativeAsset(inspected.packDirectory, sourcePath);
      if (seen.has(relative)) {
        return;
      }
      seen.add(relative);
      const destination = path.resolve(stageScanRoot, ...relative.split("/"));
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(sourcePath, destination);
      copiedAssets.push(await fileRecord(destination, `${SCAN_DIRECTORY}/${relative}`));
    };

    for (const tile of inspected.tiles) {
      await copyAsset(tile.binaryPath);
      for (const group of tile.groups) {
        await copyAsset(group.texturePath);
      }
    }

    const index = buildIndex(inspected);
    const indexPath = path.join(stageScanRoot, INDEX_NAME);
    await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
    const indexRecord = await fileRecord(indexPath, `${SCAN_DIRECTORY}/${INDEX_NAME}`);

    copiedAssets.sort((a, b) => a.path.localeCompare(b.path));
    const files = [indexRecord, ...copiedAssets].sort((a, b) => a.path.localeCompare(b.path));
    const receipt = {
      schema: "JV_WEB_FRIENDS_SCAN_RELEASE_V1",
      schemaVersion: 1,
      releaseId: contract.releaseId,
      publicationClass: "FRIENDS_PUBLIC_INPUT",
      sourceMetadataPreserved: true,
      source: {
        schema: manifest.schema,
        schemaVersion: manifest.schemaVersion,
        packageId: manifest.packageId,
        previewContentSha256: manifest.previewContentSha256,
        completeJsonSha256: completeSha256,
        completeJsonBytes: inspected.manifestBytes,
        privacyClass: manifest.privacyClass ?? null,
        purpose: manifest.purpose ?? null,
        sourceBundleContentSha256: manifest.sourceBundleContentSha256 ?? null,
        sourceFrameContractSha256: manifest.sourceFrameContractSha256 ?? null,
        sourceRevisionId: manifest.sourceRevisionId ?? null,
      },
      runtime: {
        root: `${SCAN_DIRECTORY}/`,
        index: indexRecord,
        tileCount: inspected.tileCount,
        groupCount: inspected.groupCount,
        textureCount: inspected.textureCount,
        vertexCount: inspected.vertexCount,
        indexCount: inspected.indexCount,
        triangleCount: inspected.triangleCount,
        binaryBytes: inspected.binaryBytes,
        textureBytes: inspected.textureBytes,
      },
      files,
    };
    await writeFile(stageReceipt, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

    // Fail closed: remove the old receipt before replacing the scan payload, so
    // an interrupted export cannot leave a stale receipt claiming a new scan.
    await rm(receiptPath, { force: true });
    await rm(scanRoot, { recursive: true, force: true });
    await mkdir(path.dirname(receiptPath), { recursive: true });
    await rename(stageScanRoot, scanRoot);
    await rename(stageReceipt, receiptPath);

    return {
      scanRoot,
      receiptPath,
      index,
      receipt,
    };
  } finally {
    await rm(stageRoot, { recursive: true, force: true });
  }
}

const isMain =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const result = await exportFriendsJsprev2({
    packDirectory: process.env.JOZZ_SCAN_PREVIEW_PACK,
  });
  console.log(
    `Friends JSPREV2 exported: ${result.receipt.runtime.tileCount} tile(s), ` +
      `${result.receipt.runtime.groupCount}/${result.receipt.runtime.textureCount} groups/textures, ` +
      `${result.receipt.source.previewContentSha256.slice(0, 12)} source.`,
  );
}
