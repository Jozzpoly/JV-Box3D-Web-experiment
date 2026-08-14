import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { exportFriendsJsprev2 } from "../tools/product/export-friends-jsprev2.mjs";

const GROUP_COUNT = 25;
const TEST_PREVIEW_SHA = "1".repeat(64);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function tileBinary(groupCount) {
  const descriptorBytes = groupCount * 8;
  const groupPayloadBytes = 3 * 32 + 3 * 4;
  const buffer = Buffer.alloc(20 + descriptorBytes + groupCount * groupPayloadBytes);
  buffer.write("JSPREV2\0", 0, "ascii");
  buffer.writeUInt32LE(2, 8);
  buffer.writeUInt32LE(7, 12);
  buffer.writeUInt32LE(groupCount, 16);
  let offset = 20;
  for (let group = 0; group < groupCount; group += 1) {
    buffer.writeUInt32LE(3, offset);
    buffer.writeUInt32LE(3, offset + 4);
    offset += 8;
  }
  for (let group = 0; group < groupCount; group += 1) {
    for (const vertex of [
      [-1, 0, -1, 0, 1, 0, 0, 0],
      [1, 0, -1, 0, 1, 0, 1, 0],
      [0, 0, 1, 0, 1, 0, 0.5, 1],
    ]) {
      for (const value of vertex) {
        buffer.writeFloatLE(value, offset);
        offset += 4;
      }
    }
    for (const index of [0, 1, 2]) {
      buffer.writeUInt32LE(index, offset);
      offset += 4;
    }
  }
  return buffer;
}

function makePack() {
  const root = mkdtempSync(path.join(os.tmpdir(), "jv-friends-export-"));
  mkdirSync(path.join(root, "tiles"));
  mkdirSync(path.join(root, "textures"));

  const binary = tileBinary(GROUP_COUNT);
  const binaryRelative = "tiles/tile_007.bin";
  writeFileSync(path.join(root, binaryRelative), binary);

  const groups = [];
  for (let index = 0; index < GROUP_COUNT; index += 1) {
    const relative = `textures/tile_007_group_${String(index).padStart(3, "0")}.png`;
    const texture = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      index,
    ]);
    writeFileSync(path.join(root, relative), texture);
    groups.push({
      groupId: index,
      vertexCount: 3,
      indexCount: 3,
      triangleCount: 1,
      texturePath: relative,
      textureByteLength: texture.length,
      textureSha256: sha256(texture),
    });
  }

  const complete = {
    schema: "jozz.scan-source-visual-preview-pack",
    schemaVersion: 2,
    status: "COMPLETE",
    packageId: "fixture/friends-scan",
    previewContentSha256: TEST_PREVIEW_SHA,
    privacyClass: "PRIVATE_LOCAL_ONLY",
    purpose: "SOURCE_VISUAL_PREVIEW_ONLY",
    sourceBundleContentSha256: "2".repeat(64),
    sourceFrameContractSha256: "3".repeat(64),
    sourceRevisionId: `sha256:${"4".repeat(64)}`,
    tileCount: 1,
    tiles: [
      {
        tileId: 7,
        path: binaryRelative,
        byteLength: binary.length,
        sha256: sha256(binary),
        vertexCount: GROUP_COUNT * 3,
        indexCount: GROUP_COUNT * 3,
        triangleCount: GROUP_COUNT,
        groups,
      },
    ],
  };
  const completeBytes = Buffer.from(JSON.stringify(complete));
  writeFileSync(path.join(root, "COMPLETE.json"), completeBytes);
  return {
    root,
    contract: {
      releaseId: "fixture-r1",
      packageId: complete.packageId,
      previewContentSha256: TEST_PREVIEW_SHA,
      completeJsonSha256: sha256(completeBytes),
    },
  };
}

test("Friends static exporter emits a project-relative exact JSPREV2 payload and release receipt", async () => {
  const fixture = makePack();
  const dist = mkdtempSync(path.join(os.tmpdir(), "jv-friends-dist-"));
  try {
    const result = await exportFriendsJsprev2({
      packDirectory: fixture.root,
      distDirectory: dist,
      contract: fixture.contract,
    });
    const index = JSON.parse(readFileSync(path.join(dist, "__jv_scan__", "index.json"), "utf8"));
    assert.equal(index.schema, "JV_WEB_JSPREV2_INDEX_V2");
    assert.equal(index.packId, fixture.contract.packageId);
    assert.equal(index.groupCount, GROUP_COUNT);
    assert.equal(index.textureCount, GROUP_COUNT);
    assert.equal(index.tiles[0].binaryUrl, "tiles/tile_007.bin");
    assert.equal(index.tiles[0].binaryUrl.startsWith("/"), false);
    assert.equal(index.tiles[0].groups[0].textureUrl, "textures/tile_007_group_000.png");

    const receipt = JSON.parse(
      readFileSync(path.join(dist, "receipts", "jv_friends_scan_receipt.json"), "utf8"),
    );
    assert.equal(receipt.schema, "JV_WEB_FRIENDS_SCAN_RELEASE_V1");
    assert.equal(receipt.releaseId, fixture.contract.releaseId);
    assert.equal(receipt.publicationClass, "FRIENDS_PUBLIC_INPUT");
    assert.equal(receipt.source.previewContentSha256, TEST_PREVIEW_SHA);
    assert.equal(receipt.source.privacyClass, "PRIVATE_LOCAL_ONLY");
    assert.equal(receipt.sourceMetadataPreserved, true);
    assert.equal(receipt.runtime.groupCount, GROUP_COUNT);
    assert.equal(receipt.files.length, GROUP_COUNT + 2);
    assert.ok(receipt.files.every((entry) => !path.isAbsolute(entry.path)));

    const copiedBinary = readFileSync(path.join(dist, "__jv_scan__", "tiles", "tile_007.bin"));
    assert.equal(sha256(copiedBinary), receipt.files.find((entry) => entry.path.endsWith("tile_007.bin")).sha256);
    assert.equal(result.receipt.source.completeJsonSha256, fixture.contract.completeJsonSha256);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
    rmSync(dist, { recursive: true, force: true });
  }
});

test("Friends static exporter fails closed when pinned source identity drifts", async () => {
  const fixture = makePack();
  const dist = mkdtempSync(path.join(os.tmpdir(), "jv-friends-dist-"));
  try {
    await assert.rejects(
      exportFriendsJsprev2({
        packDirectory: fixture.root,
        distDirectory: dist,
        contract: {
          ...fixture.contract,
          previewContentSha256: "f".repeat(64),
        },
      }),
      /previewContentSha256 differs/,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
    rmSync(dist, { recursive: true, force: true });
  }
});

test("Friends static exporter rejects source bytes that no longer match COMPLETE.json hashes", async () => {
  const fixture = makePack();
  const dist = mkdtempSync(path.join(os.tmpdir(), "jv-friends-dist-"));
  try {
    const texturePath = path.join(fixture.root, "textures", "tile_007_group_000.png");
    const bytes = readFileSync(texturePath);
    bytes[bytes.length - 1] ^= 0xff;
    writeFileSync(texturePath, bytes);
    await assert.rejects(
      exportFriendsJsprev2({
        packDirectory: fixture.root,
        distDirectory: dist,
        contract: fixture.contract,
      }),
      /texture SHA-256 differs/,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
    rmSync(dist, { recursive: true, force: true });
  }
});
