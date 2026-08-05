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

function writePack(groupCount) {
  const root = mkdtempSync(path.join(os.tmpdir(), "jv-jsprev2-"));
  mkdirSync(path.join(root, "tiles"));
  mkdirSync(path.join(root, "textures"));

  const header = Buffer.alloc(20);
  header.write("JSPREV2\0", 0, "ascii");
  header.writeUInt32LE(2, 8);
  header.writeUInt32LE(7, 12);
  header.writeUInt32LE(groupCount, 16);
  writeFileSync(path.join(root, "tiles", "tile.bin"), header);

  const groups = [];
  for (let index = 0; index < groupCount; index += 1) {
    const texturePath = `textures/texture-${index}.png`;
    writeFileSync(path.join(root, texturePath), Buffer.from([index]));
    groups.push({ texturePath });
  }
  writeFileSync(
    path.join(root, "COMPLETE.json"),
    JSON.stringify({
      packageId: `fixture-${groupCount}`,
      tiles: [
        {
          path: "tiles/tile.bin",
          groups,
        },
      ],
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

test("Vite serves only an exact 25/25 operator-selected JSPREV2 pack", async () => {
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
    assert.equal(document.packId, "fixture-25");
    assert.equal(document.groupCount, 25);
    assert.equal(document.textureCount, 25);
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
    assert.throws(
      () => configure(root),
      /required 25\/25/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
