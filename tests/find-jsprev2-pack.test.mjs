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

function writePack(groupCount) {
  const root = mkdtempSync(path.join(os.tmpdir(), "jv-select-pack-"));
  mkdirSync(path.join(root, "tiles"));
  mkdirSync(path.join(root, "textures"));
  const header = Buffer.alloc(20);
  header.write("JSPREV2\0", 0, "ascii");
  header.writeUInt32LE(2, 8);
  header.writeUInt32LE(3, 12);
  header.writeUInt32LE(groupCount, 16);
  writeFileSync(path.join(root, "tiles", "tile.bin"), header);
  const groups = [];
  for (let index = 0; index < groupCount; index += 1) {
    const texturePath = `textures/t-${index}.png`;
    writeFileSync(path.join(root, texturePath), Buffer.from([index]));
    groups.push({ texturePath, triangleCount: 10 + index });
  }
  writeFileSync(
    path.join(root, "COMPLETE.json"),
    JSON.stringify({
      packageId: `selector-fixture-${groupCount}`,
      tiles: [{ path: "tiles/tile.bin", groups }],
    }),
  );
  return root;
}

function runSelector(root) {
  return spawnSync(
    process.execPath,
    [selector, "--root", root],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        JOZZ_SCAN_PREVIEW_PACK: "",
        JOZZ_SCAN_ACTIVE_PREVIEW: "",
      },
    },
  );
}

test("operator selector returns one exact 25/25 JSPREV2 receipt", () => {
  const root = writePack(25);
  try {
    const result = runSelector(root);
    assert.equal(result.status, 0, result.stderr);
    const receipt = JSON.parse(result.stdout);
    assert.equal(receipt.schema, "JV_WEB_JSPREV2_PACK_SELECTION_V1");
    assert.equal(receipt.status, "PASS");
    assert.equal(receipt.packId, "selector-fixture-25");
    assert.equal(receipt.groupCount, 25);
    assert.equal(receipt.textureCount, 25);
    assert.equal(receipt.triangleCount, 550);
    assert.equal(receipt.packDirectory, path.resolve(root));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("operator selector refuses a 24/24 near-match", () => {
  const root = writePack(24);
  try {
    const result = runSelector(root);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /no exact 25\/25 JSPREV2 pack found/);
    assert.equal(result.stdout, "");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
