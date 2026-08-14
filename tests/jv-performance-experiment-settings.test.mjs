import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_JV_PERFORMANCE_EXPERIMENT_SETTINGS,
  parseJvPerformanceExperimentSettings,
} from "../.test-dist/render/jv-performance-experiment-settings.js";

test("performance experiment defaults preserve the candidate behavior", () => {
  assert.deepEqual(
    parseJvPerformanceExperimentSettings(""),
    DEFAULT_JV_PERFORMANCE_EXPERIMENT_SETTINGS,
  );
  assert.equal(
    parseJvPerformanceExperimentSettings("?jvScanCull=1&jvRenderScale=2")
      .scanCulling,
    true,
  );
});

test("one URL can disable culling and lower the backing-scale cap", () => {
  assert.deepEqual(
    parseJvPerformanceExperimentSettings(
      "?jvSpawn=scan&jvScanCull=0&jvRenderScale=1.5",
    ),
    {
      scanCulling: false,
      renderScaleCap: 1.5,
    },
  );
  assert.equal(
    parseJvPerformanceExperimentSettings("?jvRenderScale=1").renderScaleCap,
    1,
  );
});

test("unsupported performance values fail back to safe defaults", () => {
  assert.deepEqual(
    parseJvPerformanceExperimentSettings(
      "?jvScanCull=no&jvRenderScale=0.75",
    ),
    DEFAULT_JV_PERFORMANCE_EXPERIMENT_SETTINGS,
  );
});
