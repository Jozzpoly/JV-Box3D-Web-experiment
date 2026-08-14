import test from "node:test";
import assert from "node:assert/strict";
import {
  summarizeJvJsprev2PerformanceBaseline,
} from "../.test-dist/render/jv-jsprev2-performance-baseline.js";

const CURRENT_SCAN = Object.freeze({
  vertexCount: 1_409_687,
  indexCount: 5_327_325,
  triangleCount: 1_775_775,
  groupCount: 25,
  textureCount: 25,
  totalBytes: 111_288_484,
  textureBytes: 44_858_270,
  estimatedCpuGeometryBytes: 104_644_828,
  estimatedGpuGeometryBytes: 55_764_634,
});

test("current JSPREV2 scan exposes its real geometry duplication baseline", () => {
  const baseline = summarizeJvJsprev2PerformanceBaseline(CURRENT_SCAN);
  assert.equal(baseline.drawGroups, 25);
  assert.equal(baseline.renderTypedArrayBytes, 66_419_284);
  assert.equal(baseline.collisionTypedArrayBytes, 38_225_544);
  assert.equal(baseline.totalTypedArrayGeometryBytes, 104_644_828);
  assert.equal(baseline.estimatedGpuGeometryBytes, 55_764_634);
  assert.equal(baseline.cpuEstimateMatchesContract, true);
  assert.equal(baseline.gpuEstimateMatchesContract, true);
});

test("encoded texture bytes stay distinct from GPU texture residency", () => {
  const baseline = summarizeJvJsprev2PerformanceBaseline(CURRENT_SCAN);
  assert.equal(baseline.encodedTextureBytes, 44_858_270);
  assert.equal(baseline.sourcePayloadBytes, 111_288_484);
  assert.ok(baseline.encodedTextureBytes < baseline.sourcePayloadBytes);
});

test("JSPREV2 performance baseline rejects inconsistent triangle metrics", () => {
  assert.throws(
    () => summarizeJvJsprev2PerformanceBaseline({
      ...CURRENT_SCAN,
      triangleCount: CURRENT_SCAN.triangleCount - 1,
    }),
    /triangle count does not match/,
  );
});
