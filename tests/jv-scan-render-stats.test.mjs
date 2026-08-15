import test from "node:test";
import assert from "node:assert/strict";
import {
  clearJvScanRenderStats,
  publishJvScanRenderStats,
  readJvScanRenderStats,
} from "../.test-dist/render/jv-scan-render-stats.js";

test("scan render stats are isolated by render target and can be cleared", () => {
  const first = {};
  const second = {};

  assert.equal(readJvScanRenderStats(first), null);
  publishJvScanRenderStats(first, 7, 25, 12, 38, 20, 1, 7.5);
  publishJvScanRenderStats(second, 2, 25, 4, 38, 9, 0, 2.5);

  assert.deepEqual(readJvScanRenderStats(first), {
    visibleGroups: 7,
    totalGroups: 25,
    visibleDrawCalls: 12,
    totalDrawCalls: 38,
    readyTextures: 20,
    failedTextures: 1,
    textureUploadMs: 7.5,
  });
  assert.equal(readJvScanRenderStats(second)?.visibleGroups, 2);

  clearJvScanRenderStats(first);
  assert.equal(readJvScanRenderStats(first), null);
  assert.equal(readJvScanRenderStats(second)?.visibleDrawCalls, 4);
});

test("publishing unchanged stats preserves the existing snapshot", () => {
  const target = {};
  publishJvScanRenderStats(target, 5, 25, 8, 38, 10, 0, 3.25);
  const before = readJvScanRenderStats(target);
  publishJvScanRenderStats(target, 5, 25, 8, 38, 10, 0, 3.25);
  assert.equal(readJvScanRenderStats(target), before);
});
