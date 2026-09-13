import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseCustomScanSpawn,
  parseProductSpawnTarget,
  resolveProductSpawn,
  scanCalibrationSpawn,
  scanCenterSpawn,
  scanCustomSpawn,
  scanSurfaceHeightAt,
} from "../.test-dist/scene/product-spawn.js";
import {
  formatCustomSpawnUrl,
  formatSpawnLandmarkToken,
  parseSpawnLandmarkPosition,
} from "../.test-dist/spawn-landmark-capture.js";

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

test("map stays default while accepted and custom scan targets are explicit", () => {
  const world = worldFixture();
  assert.equal(parseProductSpawnTarget(""), "map");
  assert.equal(parseProductSpawnTarget("?jvSpawn=unknown"), "map");
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan"), "scan");
  assert.equal(parseProductSpawnTarget("?jvSpawn=offroad"), "offroad");
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan-cal-a"), "scan-cal-a");
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan-cal-b"), "scan-cal-b");
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan-cal-c"), "scan-cal-c");
  assert.equal(
    parseProductSpawnTarget("?jvSpawn=scan-custom&jvSpawnX=12.5&jvSpawnZ=-8.25"),
    "scan-custom",
  );
  assert.equal(parseProductSpawnTarget("?jvSpawn=scan-custom&jvSpawnX=nope&jvSpawnZ=1"), "map");
  assert.equal(resolveProductSpawn(world, "map"), world.spawn);
  const offroad = resolveProductSpawn(world, "offroad");
  assert.ok(offroad.x > 198 && offroad.x < 220);
  assert.ok(Number.isFinite(offroad.y));
  assert.equal(offroad.z, 0);
});

test("custom scan links parse finite x z only", () => {
  assert.deepEqual(
    parseCustomScanSpawn("?jvSpawn=scan-custom&jvSpawnX=12.5&jvSpawnZ=-8.25"),
    { x: 12.5, z: -8.25 },
  );
  assert.equal(parseCustomScanSpawn("?jvSpawn=scan-cal-b&jvSpawnX=12&jvSpawnZ=8"), null);
  assert.equal(parseCustomScanSpawn("?jvSpawn=scan-custom&jvSpawnX=&jvSpawnZ=8"), null);
  assert.equal(parseCustomScanSpawn("?jvSpawn=scan-custom&jvSpawnX=Infinity&jvSpawnZ=8"), null);
});

test("scan-backed targets use the full world loader at startup", async () => {
  const entry = await readFile(resolve(root, "src/product-main.ts"), "utf8");
  assert.match(
    entry,
    /const scanBackedSpawnTarget =\s*spawnTarget === "scan" \|\|\s*spawnTarget === "scan-custom" \|\|\s*scanCalibrationTarget;/s,
  );
  assert.match(
    entry,
    /timedProductWorldLoader\(\s*scanBackedSpawnTarget\s*\? loadLocalFullProductWorld\s*:\s*loadMapOnlyProductWorld,?\s*\)/s,
  );
});

test("product UI collapses accepted scan choices to one Skan entry", async () => {
  const [entry, css] = await Promise.all([
    readFile(resolve(root, "src/product-main.ts"), "utf8"),
    readFile(resolve(root, "src/spawn-calibration-ui.css"), "utf8"),
  ]);
  assert.match(entry, /import "\.\/spawn-calibration-ui\.css";/);
  assert.match(
    entry,
    /label: "Skan"[\s\S]*?href: targetUrl\("scan-cal-b"\)[\s\S]*?active: spawnTarget === "scan-cal-b" \|\| spawnTarget === "scan-custom"/s,
  );
  assert.doesNotMatch(entry, /label: "A"/);
  assert.doesNotMatch(entry, /label: "B"/);
  assert.doesNotMatch(entry, /label: "C"/);
  assert.match(
    entry,
    /const scanAvailabilityProbeUrl = new URL\(\s*"__jv_scan__\/index\.json",\s*document\.baseURI,?\s*\)\.href;/s,
  );
  assert.equal(
    (entry.match(/availabilityProbeUrl: scanAvailabilityProbeUrl/g) ?? []).length,
    1,
  );
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\), \(max-width: 620px\)/);
  assert.match(css, /\.spawn-landmark-capture-button\s*\{/);
});

test("landmark capture creates a reusable custom-start URL from x z", () => {
  const point = parseSpawnLandmarkPosition("-11.8215, 4.2000, 870.2519 m");
  assert.deepEqual(point, { x: -11.8215, y: 4.2, z: 870.2519 });
  assert.equal(parseSpawnLandmarkPosition("PENDING"), null);
  assert.equal(
    formatSpawnLandmarkToken(point),
    "JV_SCAN_LANDMARK x=-11.8215 z=870.2519 chassisY=4.2000",
  );
  const url = new URL(formatCustomSpawnUrl(
    point,
    "https://example.test/jv/?jvSpawn=scan-cal-b&jvTextureFilter=linear",
  ));
  assert.equal(url.searchParams.get("jvSpawn"), "scan-custom");
  assert.equal(url.searchParams.get("jvSpawnX"), "-11.8215");
  assert.equal(url.searchParams.get("jvSpawnZ"), "870.2519");
  assert.equal(url.searchParams.get("jvTextureFilter"), "linear");
});

test("landmark capture is available on every scan-backed start", async () => {
  const capture = await readFile(resolve(root, "src/spawn-landmark-capture.ts"), "utf8");
  const entry = await readFile(resolve(root, "src/product-main.ts"), "utf8");
  assert.match(entry, /installSpawnLandmarkCapture\(scanBackedSpawnTarget\);/);
  assert.match(capture, /button\.textContent = "Zapisz start";/);
  assert.match(capture, /formatCustomSpawnUrl\(point, window\.location\.href\)/);
  assert.match(capture, /url\.searchParams\.set\("jvSpawn", "scan-custom"\)/);
  assert.match(capture, /\[data-step\]/);
  assert.match(capture, /\[data-chassis-position\]/);
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

test("custom scan spawn re-resolves surface height and fails outside collision", () => {
  const scan = calibrationScanFixture();
  const point = { x: 50, z: -20 };
  assert.deepEqual(scanCustomSpawn(scan, point, 1.2), {
    x: 50,
    y: 4.2,
    z: -20,
  });
  assert.deepEqual(
    resolveProductSpawn(worldFixture(scan), "scan-custom", 1.2, point),
    { x: 50, y: 4.2, z: -20 },
  );
  assert.throws(
    () => resolveProductSpawn(worldFixture(scan), "scan-custom"),
    /coordinates are missing/,
  );
  assert.throws(
    () => scanCustomSpawn(scan, { x: 999, z: 999 }, 1.2),
    /no drivable collision surface/,
  );
});

test("scan selection fails closed when the pack or surface is absent", () => {
  assert.throws(
    () => resolveProductSpawn(worldFixture(null), "scan"),
    /exact JSPREV2 pack is unavailable/,
  );
  assert.throws(
    () => resolveProductSpawn(worldFixture(null), "scan-cal-a"),
    /exact JSPREV2 pack is unavailable/,
  );
  assert.throws(
    () => resolveProductSpawn(worldFixture(null), "scan-custom", 1.2, { x: 0, z: 0 }),
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
