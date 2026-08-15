import test from "node:test";
import assert from "node:assert/strict";
import {
  selectJvScanIndexUploadPlan,
} from "../.test-dist/render/jv-scan-index-upload-plan.js";

test("supported WebGL1 keeps the existing zero-copy Uint32 direct path", () => {
  assert.equal(selectJvScanIndexUploadPlan(3, true), "UINT32_DIRECT");
  assert.equal(selectJvScanIndexUploadPlan(65_536, true), "UINT32_DIRECT");
  assert.equal(selectJvScanIndexUploadPlan(200_000, true), "UINT32_DIRECT");
});

test("without Uint32 support small validated groups narrow directly", () => {
  assert.equal(selectJvScanIndexUploadPlan(1, false), "UINT16_DIRECT");
  assert.equal(selectJvScanIndexUploadPlan(65_536, false), "UINT16_DIRECT");
});

test("without Uint32 support larger groups preserve legacy chunking", () => {
  assert.equal(selectJvScanIndexUploadPlan(65_537, false), "UINT16_CHUNKED");
});

test("scan index plan rejects invalid parser metadata", () => {
  for (const value of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => selectJvScanIndexUploadPlan(value, true),
      /vertexCount/,
    );
  }
});
