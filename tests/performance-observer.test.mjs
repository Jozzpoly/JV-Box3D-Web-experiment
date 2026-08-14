import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { summarizeJvFrameWindow } from "../.test-dist/runtime/performance-observer.js";

const root = fileURLToPath(new URL("../", import.meta.url));

test("frame window summary reports stable average frame time and FPS", () => {
  const summary = summarizeJvFrameWindow(500, 30);
  assert.ok(summary);
  assert.ok(Math.abs(summary.frameMs - 16.6666666667) < 1e-6);
  assert.ok(Math.abs(summary.fps - 60) < 1e-9);
  assert.equal(summarizeJvFrameWindow(0, 30), null);
  assert.equal(summarizeJvFrameWindow(500, 0), null);
});

test("performance sampling is Debug-only and exposes real canvas resolution", async () => {
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
  assert.match(observer, /devicePixelRatio/);
});
