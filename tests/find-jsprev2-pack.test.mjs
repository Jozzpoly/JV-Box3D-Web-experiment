import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const selector = path.join(
  repositoryRoot,
  "tools",
  "product",
  "find-jsprev2-pack.mjs",
);

function tileBinary(groupCount, { truncate = false } = {}) {
  const descriptorBytes = groupCount * 8;
  const groupPayloadBytes = 3 * 32 + 3 * 4;
  const fullBytes = 20 + descriptorBytes + groupCount * groupPayloadBytes;
  const buffer = Buffer.alloc(truncate ? fullBytes - 1 : fullBytes);
  buffer.write("JSPREV2\0", 0, "ascii");
  buffer.writeUInt32LE(2, 8);
  buffer.writeUInt32LE(3, 12);
  buffer.writeUInt32LE(groupCount, 16);
  let offset = 20;
  for (let group = 0; group < groupCount; group += 1) {
    buffer.writeUInt32LE(3, offset);
    buffer.writeUInt32LE(3, offset + 4);
    offset += 8;
  }
  for (
    let group = 0;
    group < groupCount && offset + 108 <= buffer.length;
    group += 1
  ) {
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

function writePack(parent, name, groupCount, options = {}) {
  const root = path.join(parent, name);
  mkdirSync(path.join(root, "tiles"), { recursive: true });
  mkdirSync(path.join(root, "textures"));
  writeFileSync(
    path.join(root, "tiles", "tile.bin"),
    tileBinary(groupCount, options),
  );
  const groups = [];
  for (let index = 0; index < groupCount; index += 1) {
    const texturePath = `textures/t-${index}.png`;
    writeFileSync(
      path.join(root, texturePath),
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    groups.push({ texturePath, triangleCount: 1 });
  }
  writeFileSync(
    path.join(root, "COMPLETE.json"),
    JSON.stringify({
      packageId: `${name}-${groupCount}`,
      tiles: [{ path: "tiles/tile.bin", groups }],
    }),
  );
  return root;
}

function runSelector(args) {
  return spawnSync(process.execPath, [selector, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      JOZZ_SCAN_PREVIEW_PACK: "",
      JOZZ_SCAN_ACTIVE_PREVIEW: "",
    },
  });
}

test("operator selector deep-validates one exact 25/25 JSPREV2 receipt", () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), "jv-select-pack-"));
  try {
    const root = writePack(temp, "selected", 25);
    const result = runSelector(["--candidate", root]);
    assert.equal(result.status, 0, result.stderr);
    const receipt = JSON.parse(result.stdout);
    assert.equal(receipt.schema, "JV_WEB_JSPREV2_PACK_SELECTION_V2");
    assert.equal(receipt.status, "PASS");
    assert.equal(receipt.selectionMode, "EXPLICIT_OR_ACTIVE");
    assert.equal(receipt.packId, "selected-25");
    assert.equal(receipt.groupCount, 25);
    assert.equal(receipt.textureCount, 25);
    assert.equal(receipt.vertexCount, 75);
    assert.equal(receipt.indexCount, 75);
    assert.equal(receipt.triangleCount, 25);
    assert.equal(receipt.deepValidated, true);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("operator selector refuses a 24/24 near-match", () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), "jv-select-pack-"));
  try {
    const root = writePack(temp, "near", 24);
    const result = runSelector(["--candidate", root]);
    assert.equal(result.status, 2);
    assert.match(
      result.stderr,
      /explicit\/active JSPREV2 selection is invalid/,
    );
    assert.equal(result.stdout, "");
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("operator selector fails closed when discovery finds multiple exact packs", () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), "jv-select-pack-"));
  const root = path.join(temp, "Box3d_FunProject");
  mkdirSync(root);
  try {
    writePack(root, "first", 25);
    writePack(root, "second", 25);
    const result = runSelector(["--root", root]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /ambiguous exact JSPREV2 selection/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("relative ACTIVE_PREVIEW resolves from its own directory", () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), "jv-select-pack-"));
  const root = path.join(temp, "Box3d_FunProject");
  mkdirSync(root);
  try {
    writePack(root, "first", 25);
    writePack(root, "active", 25);
    writeFileSync(
      path.join(root, "ACTIVE_PREVIEW.json"),
      JSON.stringify({ previewPath: "./active" }),
    );
    const result = runSelector(["--root", root]);
    assert.equal(result.status, 0, result.stderr);
    const receipt = JSON.parse(result.stdout);
    assert.equal(receipt.packId, "active-25");
    assert.equal(receipt.selectionMode, "EXPLICIT_OR_ACTIVE");
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("operator selector rejects a truncated JSPREV2 payload", () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), "jv-select-pack-"));
  try {
    const root = writePack(temp, "truncated", 25, { truncate: true });
    const result = runSelector(["--candidate", root]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /descriptor payload/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("an invalid explicit pack never falls back to a discovered exact pack", () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), "jv-select-pack-"));
  try {
    const root = path.join(temp, "Box3d_FunProject");
    mkdirSync(root);
    const invalid = writePack(root, "invalid", 24);
    writePack(root, "valid", 25);
    const result = runSelector(["--candidate", invalid, "--root", root]);
    assert.equal(result.status, 2);
    assert.match(
      result.stderr,
      /explicit\/active JSPREV2 selection is invalid/,
    );
    assert.equal(result.stdout, "");
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("operator selector rejects a texture with a fake PNG extension", () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), "jv-select-pack-"));
  try {
    const root = writePack(temp, "fake-texture", 25);
    writeFileSync(
      path.join(root, "textures", "t-0.png"),
      Buffer.from([1, 2, 3]),
    );
    const result = runSelector(["--candidate", root]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /PNG texture is truncated|signature is invalid/);
    assert.equal(result.stdout, "");
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
