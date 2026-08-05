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
import {
  finalJsprev2VitePlugin,
} from "../tools/product/final-jsprev2-vite-plugin.mjs";

function tileBinary(groupCount, { truncate = false } = {}) {
  const descriptorBytes = groupCount * 8;
  const groupPayloadBytes = 3 * 32 + 3 * 4;
  const fullBytes = 20 + descriptorBytes + groupCount * groupPayloadBytes;
  const buffer = Buffer.alloc(truncate ? fullBytes - 1 : fullBytes);
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

function writePack(groupCount, options = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "jv-jsprev2-"));
  mkdirSync(path.join(root, "tiles"));
  mkdirSync(path.join(root, "textures"));
  writeFileSync(
    path.join(root, "tiles", "tile.bin"),
    tileBinary(groupCount, options),
  );
  const groups = [];
  for (let index = 0; index < groupCount; index += 1) {
    const texturePath = `textures/texture-${index}.png`;
    writeFileSync(
      path.join(root, texturePath),
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    groups.push({ texturePath, triangleCount: 1 });
  }
  writeFileSync(
    path.join(root, "COMPLETE.json"),
    JSON.stringify({
      packageId: `fixture-${groupCount}`,
      tiles: [{ path: "tiles/tile.bin", groups }],
    }),
  );
  return root;
}

function configure(packDirectory) {
  const previous = process.env.JOZZ_SCAN_PREVIEW_PACK;
  process.env.JOZZ_SCAN_PREVIEW_PACK = packDirectory;
  const middleware = [];
  const messages = [];
  try {
    finalJsprev2VitePlugin().configureServer({
      config: {
        logger: {
          info: (message) => messages.push(message),
          warn: (message) => messages.push(message),
        },
      },
      middlewares: {
        use: (handler) => middleware.push(handler),
      },
    });
  } finally {
    if (previous === undefined) {
      delete process.env.JOZZ_SCAN_PREVIEW_PACK;
    } else {
      process.env.JOZZ_SCAN_PREVIEW_PACK = previous;
    }
  }
  return { middleware, messages };
}

function invoke(handler, url) {
  return new Promise((resolve, reject) => {
    const headers = new Map();
    let body = "";
    const response = {
      statusCode: 0,
      setHeader: (name, value) => headers.set(name, String(value)),
      end: (value = "") => {
        body += String(value);
        resolve({ statusCode: response.statusCode, headers, body });
      },
    };
    try {
      handler({ url }, response, () => reject(new Error("unexpected next()")));
    } catch (error) {
      reject(error);
    }
  });
}

test("Vite serves one structurally validated exact 25/25 JSPREV2 pack", async () => {
  const root = writePack(25);
  try {
    const configured = configure(root);
    assert.equal(configured.middleware.length, 1);
    assert.ok(configured.messages.some((message) => message.includes("25/25")));
    const index = await invoke(
      configured.middleware[0],
      "/__jv_scan__/index.json",
    );
    assert.equal(index.statusCode, 200);
    const document = JSON.parse(index.body);
    assert.equal(document.schema, "JV_WEB_JSPREV2_INDEX_V2");
    assert.equal(document.packId, "fixture-25");
    assert.equal(document.groupCount, 25);
    assert.equal(document.textureCount, 25);
    assert.equal(document.vertexCount, 75);
    assert.equal(document.indexCount, 75);
    assert.equal(document.triangleCount, 25);
    assert.equal(document.tiles[0].groups.length, 25);
    assert.equal(index.body.includes(root), false);
    assert.match(document.tiles[0].binaryUrl, /^\/__jv_scan__\/asset\/\d+$/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Vite rejects an almost-correct 24/24 scan pack", () => {
  const root = writePack(24);
  try {
    assert.throws(() => configure(root), /required 25\/25/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Vite rejects a JSPREV2 binary whose descriptor payload is truncated", () => {
  const root = writePack(25, { truncate: true });
  try {
    assert.throws(() => configure(root), /descriptor payload/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
