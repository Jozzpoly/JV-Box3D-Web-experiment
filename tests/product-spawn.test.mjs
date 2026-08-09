import test from "node:test";
import assert from "node:assert/strict";
import {
  parseProductSpawnTarget,
  resolveProductSpawn,
  scanCenterSpawn,
  scanSurfaceHeightAt,
} from "../.test-dist/scene/product-spawn.js";

function scanFixture() {
  return {
    source: "JSPREV2",
    packId: "fixture-scan",
    origin: { x: 10, y: 2, z: 20 },
    worldBounds: {
      minimum: { x: 9, y: 3, z: 19 },
      maximum: { x: 11, y: 6, z: 21 },
    },
    collision: {
      positions: new Float32Array([
        -1, 1, -1,
        1, 1, -1,
        0, 1, 1,
        -1, 4, -1,
        1, 4, -1,
        0, 4, 1,
      ]),
      indices: new Uint32Array([0, 1, 2, 3, 4, 5]),
      color: [0.6, 0.6, 0.6, 1],
    },
    groups: [],
    textureCount: 0,
    triangleCount: 2,
  };
}

function worldFixture(scan = scanFixture()) {
  return {
    schema: "JV_WEB_E2R_WORLD_V1",
    nativeAuthorityCommit: "fixture",
    spawn: { x: 0, y: 1.2, z: 0 },
    boxes: [],
    capsules: [],
    offroad: {
      positions: new Float32Array([
        198, 0, -200,
        598, 0, -200,
        598, 0, 200,
        198, 0, 200,
      ]),
      indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
      color: [1, 1, 1, 1],
    },
    scan,
    scanStatus: scan === null ? "NOT_AVAILABLE" : "LOADED",
  };
}

test("scan spawn uses the current world AABB center and highest surface", () => {
  const scan = scanFixture();
  assert.equal(scanSurfaceHeightAt(scan, 10, 20), 6);
  assert.deepEqual(scanCenterSpawn(scan, 1.2), {
    x: 10,
    y: 7.2,
    z: 20,
  });
  assert.deepEqual(resolveProductSpawn(worldFixture(), "scan"), {
    x: 10,
    y: 7.2,
    z: 20,
  });
});

test("map remains the default and preserves the accepted baseline spawn", () => {
  const world = worldFixture();
  assert.equal(parseProductSpawnTarget(""), "map");
  assert.equal(parseProductSpawnTarget("?jvSpawn=unknown"), "map");
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan"), "scan");
  assert.equal(parseProductSpawnTarget("?jvSpawn=offroad"), "offroad");
  assert.equal(resolveProductSpawn(world, "map"), world.spawn);
  const offroad = resolveProductSpawn(world, "offroad");
  assert.ok(offroad.x > 198 && offroad.x < 220);
  assert.ok(Number.isFinite(offroad.y));
  assert.equal(offroad.z, 0);
});

test("scan selection fails closed when the pack or center surface is absent", () => {
  assert.throws(
    () => resolveProductSpawn(worldFixture(null), "scan"),
    /exact JSPREV2 pack is unavailable/,
  );

  const scan = scanFixture();
  const shifted = {
    ...scan,
    worldBounds: {
      minimum: { x: 100, y: 3, z: 100 },
      maximum: { x: 102, y: 6, z: 102 },
    },
  };
  assert.throws(
    () => scanCenterSpawn(shifted, 1.2),
    /no drivable surface at its AABB center/,
  );
});
