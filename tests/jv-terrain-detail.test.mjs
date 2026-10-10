import test from "node:test";
import assert from "node:assert/strict";
import {
  createTerrainDetailPixels,
  createTerrainDetailUvs,
  TERRAIN_DETAIL_SIZE,
} from "../.test-dist/render/jv-terrain-detail.js";

test("terrain detail tile is deterministic, opaque and varied", () => {
  const a = createTerrainDetailPixels();
  const b = createTerrainDetailPixels();
  assert.equal(a.length, TERRAIN_DETAIL_SIZE * TERRAIN_DETAIL_SIZE * 4);
  assert.deepEqual(a, b);
  const greens = new Set();
  for (let i = 0; i < a.length; i += 4) {
    assert.equal(a[i + 3], 255);
    greens.add(a[i + 1]);
  }
  assert.ok(greens.size > 20, "tile should not be a flat colour");
  assert.throws(() => createTerrainDetailPixels(48), /power of two/);
});

test("terrain detail UVs are planar world x/z over the tile size", () => {
  const uvs = createTerrainDetailUvs(new Float32Array([24, 5, -48, 0, 0, 12]), 24);
  assert.deepEqual([...uvs], [1, -2, 0, 0.5]);
});

test("plate detail tile has darker seams on slab borders", async () => {
  const { createPlateDetailPixels } = await import("../.test-dist/render/jv-terrain-detail.js");
  const size = TERRAIN_DETAIL_SIZE;
  const pixels = createPlateDetailPixels();
  const lum = (x, y) => pixels[(y * size + x) * 4 + 1];
  assert.ok(lum(0, 5) < lum(5, 5) - 20, "seam column is darker than slab");
  assert.ok(lum(5, size / 2) < lum(5, 5) - 20, "seam row is darker than slab");
  assert.throws(() => createPlateDetailPixels(6), /power of two/);
});
