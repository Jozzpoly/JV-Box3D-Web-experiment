import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  summarizeJvCanvasResolution,
  summarizeJvFrameWindow,
} from "../.test-dist/runtime/performance-observer.js";

const root = fileURLToPath(new URL("../", import.meta.url));

test("frame window summary reports stable average frame time and FPS", () => {
  const summary = summarizeJvFrameWindow(500, 30);
  assert.ok(summary);
  assert.ok(Math.abs(summary.frameMs - 16.6666666667) < 1e-6);
  assert.ok(Math.abs(summary.fps - 60) < 1e-9);
  assert.equal(summarizeJvFrameWindow(0, 30), null);
  assert.equal(summarizeJvFrameWindow(500, 0), null);
});

test("canvas summary distinguishes effective render scale from device DPR", () => {
  const summary = summarizeJvCanvasResolution(
    2160,
    3840,
    1080,
    1920,
    3,
  );
  assert.ok(summary);
  assert.equal(summary.renderScaleX, 2);
  assert.equal(summary.renderScaleY, 2);
  assert.equal(summary.devicePixelRatio, 3);
  assert.equal(
    summarizeJvCanvasResolution(0, 3840, 1080, 1920, 3),
    null,
  );
});

test("performance sampling is Debug-only and exposes viewport plus scan visibility", async () => {
  const [entry, observer] = await Promise.all([
    readFile(path.resolve(root, "src/product-main.ts"), "utf8"),
    readFile(path.resolve(root, "src/runtime/performance-observer.ts"), "utf8"),
  ]);

  assert.match(entry, /installJvPerformanceObserver\(\)/);
  assert.match(observer, /panel\.hasAttribute\("data-open"\)/);
  assert.match(observer, /MutationObserver/);
  assert.match(observer, /requestAnimationFrame/);
  assert.match(observer, /cancelAnimationFrame/);
  assert.match(observer, /canvas\.width/);
  assert.match(observer, /canvas\.height/);
  assert.match(observer, /canvas\.clientWidth/);
  assert.match(observer, /canvas\.clientHeight/);
  assert.match(observer, /render \$\{renderScale\}×/);
  assert.match(observer, /device DPR/);
  assert.match(observer, /readJvScanRenderStats\(canvas\)/);
  assert.match(observer, /scan \$\{scan\.visibleGroups\}\/\$\{scan\.totalGroups\} groups/);
  assert.match(observer, /\$\{scan\.visibleDrawCalls\}\/\$\{scan\.totalDrawCalls\} draws/);
});
