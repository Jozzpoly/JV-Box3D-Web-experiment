import test from "node:test";
import assert from "node:assert/strict";
import {
  clearJvStartupPerformance,
  publishJvStartupPerformance,
  readJvStartupPerformance,
} from "../.test-dist/runtime/startup-performance.js";

test("startup performance merges independent phase measurements without inventing a total", () => {
  clearJvStartupPerformance();
  publishJvStartupPerformance({ productWorldLoadMs: 120 });
  publishJvStartupPerformance({ worldGpuSetupMs: 35 });
  publishJvStartupPerformance({ box3dWorldCreateMs: 28 });

  assert.deepEqual(readJvStartupPerformance(), {
    productWorldLoadMs: 120,
    worldGpuSetupMs: 35,
    box3dWorldCreateMs: 28,
  });
  assert.equal(Object.isFrozen(readJvStartupPerformance()), true);

  clearJvStartupPerformance();
  assert.equal(readJvStartupPerformance(), null);
});
