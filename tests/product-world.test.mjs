import test from "node:test";
import assert from "node:assert/strict";
import {
  createProductWorld,
} from "../.test-dist/scene/product-world.js";
import {
  sampleE2rOffroadHeight,
} from "../.test-dist/scene/e2r-world.js";

test("product world reproduces the active E2R layout without the rejected E3 track", () => {
  const world = createProductWorld();

  assert.equal(world.schema, "JV_WEB_E2R_WORLD_V1");
  assert.equal(
    world.nativeAuthorityCommit,
    "959aefb78587ce60cf2b8eb03ff82797a4165142",
  );
  assert.deepEqual(world.spawn, { x: 0, y: 1.2, z: 0 });
  assert.equal(world.scan, null);
  assert.equal(world.scanStatus, "NOT_AVAILABLE");

  // 9 plate tiles + 401 deterministic rocks from the three accepted islands.
  assert.equal(world.boxes.length, 410);
  // Exact sum of the 13 accepted E2R bumper banks.
  assert.equal(world.capsules.length, 147);

  assert.equal(world.offroad.positions.length, 321 * 321 * 3);
  assert.equal(world.offroad.indices.length, 320 * 320 * 6);
  assert.equal(world.offroad.normals?.length, 321 * 321 * 3);
  assert.ok(
    [...world.offroad.positions].every(Number.isFinite),
    "offroad positions must stay finite",
  );
  assert.ok(
    [...(world.offroad.normals ?? [])].every(Number.isFinite),
    "offroad normals must stay finite",
  );
});

test("authoritative E2R offroad is deterministic and dips under the plate seam", () => {
  const samples = [
    [0, 0],
    [5, 200],
    [60, 100],
    [200, 200],
    [399, 399],
  ];
  const first = samples.map(([x, z]) =>
    sampleE2rOffroadHeight(x, z, 1337),
  );
  const second = samples.map(([x, z]) =>
    sampleE2rOffroadHeight(x, z, 1337),
  );

  assert.deepEqual(first, second);
  assert.equal(first[0], -0.12);
  assert.ok(first.every(Number.isFinite));
  assert.ok(first.every((height) => height >= -11.5 && height <= 27.5));
});

test("authoritative rock seed includes the world seed instead of using offsets alone", () => {
  const first = createProductWorld();
  const second = createProductWorld();
  const rock = first.boxes.find(
    (box) =>
      box.color[0] === 0.35 &&
      box.color[1] === 0.31 &&
      box.color[2] === 0.26,
  );
  const matching = second.boxes.find(
    (box) =>
      box.color[0] === 0.35 &&
      box.color[1] === 0.31 &&
      box.color[2] === 0.26,
  );

  assert.ok(rock !== undefined && matching !== undefined);
  assert.deepEqual(rock, matching);
  assert.notDeepEqual(rock.center, { x: 34, y: 0, z: -14 });
});
