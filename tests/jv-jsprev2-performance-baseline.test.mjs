import test from "node:test";
import assert from "node:assert/strict";
import {
  estimateRgba8TextureBaseLevelBytes,
  minimumJvUint16DrawCalls,
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

const CURRENT_GROUP_VERTICES = Object.freeze([
  85_811, 23_631, 37_680, 3_877, 5_158, 1_051,
  96_163, 93_523,
  80_920, 105_935, 34_217, 16_455, 5_425,
  98_557, 91_682, 30_793, 37_877,
  97_275, 111_517,
  72_781, 86_960, 4_581, 3_671,
  94_821, 89_326,
]);

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

test("current group sizes imply at least 38 WebGL1 scan draw calls", () => {
  assert.equal(CURRENT_GROUP_VERTICES.length, CURRENT_SCAN.groupCount);
  assert.equal(
    CURRENT_GROUP_VERTICES.reduce((sum, value) => sum + value, 0),
    CURRENT_SCAN.vertexCount,
  );
  assert.equal(minimumJvUint16DrawCalls(CURRENT_GROUP_VERTICES), 38);
});

test("current 25 RGBA8 1024 textures imply a 100 MiB base-level texel payload", () => {
  const textureBaseBytes = estimateRgba8TextureBaseLevelBytes(25, 1024, 1024);
  assert.equal(textureBaseBytes, 104_857_600);
  assert.equal(
    textureBaseBytes + CURRENT_SCAN.estimatedGpuGeometryBytes,
    160_622_234,
  );
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
