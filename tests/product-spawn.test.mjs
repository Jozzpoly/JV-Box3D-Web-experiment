import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseProductSpawnTarget,
  resolveProductSpawn,
  scanCalibrationSpawn,
  scanCenterSpawn,
  scanSurfaceHeightAt,
} from "../.test-dist/scene/product-spawn.js";

const root = fileURLToPath(new URL("../", import.meta.url));

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

function calibrationScanFixture() {
  return {
    source: "JSPREV2",
    packId: "scan/photogrammetry-primary",
    origin: { x: 10, y: 2, z: 20 },
    worldBounds: {
      minimum: { x: -10, y: 3, z: -80 },
      maximum: { x: 160, y: 3, z: 70 },
    },
    collision: {
      positions: new Float32Array([
        -20, 1, -100,
        150, 1, -100,
        150, 1, 50,
        -20, 1, 50,
      ]),
      indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
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

test("map remains the default and calibration targets are opt-in only", () => {
  const world = worldFixture();
  assert.equal(parseProductSpawnTarget(""), "map");
  assert.equal(parseProductSpawnTarget("?jvSpawn=unknown"), "map");
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan"), "scan");
  assert.equal(parseProductSpawnTarget("?jvSpawn=offroad"), "offroad");
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan-cal-a"), "scan-cal-a");
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan-cal-b"), "scan-cal-b");
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan-cal-c"), "scan-cal-c");
  assert.equal(resolveProductSpawn(world, "map"), world.spawn);
  const offroad = resolveProductSpawn(world, "offroad");
  assert.ok(offroad.x > 198 && offroad.x < 220);
  assert.ok(Number.isFinite(offroad.y));
  assert.equal(offroad.z, 0);
});

test("scan calibration targets use the full scan world loader at startup", async () => {
  const entry = await readFile(resolve(root, "src/product-main.ts"), "utf8");
  assert.match(
    entry,
    /const scanBackedSpawnTarget =\s*spawnTarget === "scan" \|\|\s*spawnTarget === "scan-cal-a" \|\|\s*spawnTarget === "scan-cal-b" \|\|\s*spawnTarget === "scan-cal-c";/s,
  );
  assert.match(
    entry,
    /timedProductWorldLoader\(\s*scanBackedSpawnTarget\s*\? loadLocalFullProductWorld\s*:\s*loadMapOnlyProductWorld,?\s*\)/s,
  );
  assert.doesNotMatch(
    entry,
    /timedProductWorldLoader\(\s*spawnTarget === "scan"/s,
  );
});

test("spawn calibration preview exposes first-class A B C location choices", async () => {
  const entry = await readFile(resolve(root, "src/product-main.ts"), "utf8");
  for (const [label, target] of [
    ["Spawn A", "scan-cal-a"],
    ["Spawn B", "scan-cal-b"],
    ["Spawn C", "scan-cal-c"],
  ]) {
    const escapedTarget = target.replaceAll("-", "\\-");
    assert.match(entry, new RegExp(`label: "${label}"[\\s\\S]*?href: targetUrl\\("${escapedTarget}"\\)[\\s\\S]*?active: spawnTarget === "${escapedTarget}"`));
  }
  assert.match(entry, /label: "Skan JSPREV2 \(środek\)"/);
  assert.match(
    entry,
    /const scanAvailabilityProbeUrl = new URL\(\s*"__jv_scan__\/index\.json",\s*document\.baseURI,?\s*\)\.href;/s,
  );
  assert.equal(
    (entry.match(/availabilityProbeUrl: scanAvailabilityProbeUrl/g) ?? []).length,
    4,
  );
});

test("calibration candidates are pack-pinned, surface-resolved and spatially distinct", () => {
  const scan = calibrationScanFixture();
  const a = scanCalibrationSpawn(scan, "scan-cal-a", 1.2);
  const b = scanCalibrationSpawn(scan, "scan-cal-b", 1.2);
  const c = scanCalibrationSpawn(scan, "scan-cal-c", 1.2);

  assert.deepEqual(a, { x: 45.25, y: 4.2, z: -39.25 });
  assert.deepEqual(b, { x: 64.75, y: 4.2, z: -16.75 });
  assert.deepEqual(c, { x: 120.25, y: 4.2, z: 8.75 });
  assert.ok(Math.hypot(a.x - b.x, a.z - b.z) > 25);
  assert.ok(Math.hypot(b.x - c.x, b.z - c.z) > 55);

  const world = worldFixture(scan);
  assert.deepEqual(resolveProductSpawn(world, "scan-cal-a"), a);
  assert.deepEqual(resolveProductSpawn(world, "scan-cal-b"), b);
  assert.deepEqual(resolveProductSpawn(world, "scan-cal-c"), c);

  assert.throws(
    () => scanCalibrationSpawn(scanFixture(), "scan-cal-a", 1.2),
    /pinned to scan\/photogrammetry-primary/,
  );
});

test("scan selection fails closed when the pack or center surface is absent", () => {
  assert.throws(
    () => resolveProductSpawn(worldFixture(null), "scan"),
    /exact JSPREV2 pack is unavailable/,
  );
  assert.throws(
    () => resolveProductSpawn(worldFixture(null), "scan-cal-a"),
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
