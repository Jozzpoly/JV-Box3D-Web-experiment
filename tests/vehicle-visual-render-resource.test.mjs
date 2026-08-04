import test from "node:test";
import assert from "node:assert/strict";
import { createVehicleVisualRenderResourceV1 } from "../.test-dist/render/vehicle-visual-render-resource.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import { buildTinyVehicleVisualFixture } from "../tools/tiny-vehicle-visual-fixture-lib.mjs";

function response({ jsonValue, bytes }) {
  return {
    ok: true,
    status: 200,
    async json() {
      return jsonValue;
    },
    async arrayBuffer() {
      return bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      );
    },
  };
}

function fakeGl({ failAt = -1 } = {}) {
  let allocation = 0;
  let nextId = 1;
  const deleted = [];
  const gl = {
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88e4,
    NO_ERROR: 0,
    createBuffer() {
      allocation += 1;
      return allocation === failAt ? null : { id: nextId++ };
    },
    bindBuffer() {},
    bufferData() {},
    getError() {
      return 0;
    },
    deleteBuffer(buffer) {
      deleted.push(buffer.id);
    },
  };
  return {
    gl,
    deleted,
    get allocations() {
      return allocation;
    },
  };
}

function fixtureFetcher(generated) {
  return async (url) => {
    if (url.endsWith("vehicle.visual.json")) {
      return response({
        jsonValue: generated.visualPackage,
        bytes: new Uint8Array(),
      });
    }
    if (url.endsWith("m6-rig-proof.glb")) {
      return response({ jsonValue: null, bytes: generated.glb });
    }
    return { ok: false, status: 404 };
  };
}

test("complete load publishes one disposable CPU+GPU resource", async () => {
  const generated = buildTinyVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
  const fixture = fakeGl();
  const resource = await createVehicleVisualRenderResourceV1(
    fixture.gl,
    "https://example.test/",
    "vehicles/tiny/vehicle.visual.json",
    { fetcher: fixtureFetcher(generated) },
  );

  assert.equal(resource.runtime.ownershipReceipt.boundRootCount, 26);
  assert.equal(resource.runtime.budgetReceipt.geometryBytes, 336);
  assert.equal(resource.gpuAsset.gpuByteLength, 336);
  assert.equal(resource.disposed, false);
  resource.dispose();
  assert.equal(resource.disposed, true);
  assert.deepEqual(fixture.deleted, [4, 3, 2, 1]);
  resource.dispose();
  assert.deepEqual(fixture.deleted, [4, 3, 2, 1]);
});

test("runtime capability rejection happens before every GPU allocation", async () => {
  const generated = buildTinyVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
  const fixture = fakeGl();
  let validatedRuntime = null;

  await assert.rejects(
    () =>
      createVehicleVisualRenderResourceV1(
        fixture.gl,
        "https://example.test/",
        "vehicles/tiny/vehicle.visual.json",
        {
          fetcher: fixtureFetcher(generated),
          validateRuntime(runtime) {
            validatedRuntime = runtime;
            throw new Error("draw capability rejected");
          },
        },
      ),
    /draw capability rejected/,
  );

  assert.equal(validatedRuntime.ownershipReceipt.boundRootCount, 26);
  assert.equal(fixture.allocations, 0);
  assert.deepEqual(fixture.deleted, []);
});

test("GPU allocation failure never publishes a partial render resource", async () => {
  const generated = buildTinyVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
  const fixture = fakeGl({ failAt: 3 });
  await assert.rejects(
    () =>
      createVehicleVisualRenderResourceV1(
        fixture.gl,
        "https://example.test/",
        "vehicles/tiny/vehicle.visual.json",
        { fetcher: fixtureFetcher(generated) },
      ),
    /allocation failed/,
  );
  assert.deepEqual(fixture.deleted, [2, 1]);
});

test("already-aborted resource performs no fetch or GPU allocation", async () => {
  const controller = new AbortController();
  controller.abort();
  let fetched = false;
  let allocated = false;
  await assert.rejects(
    () =>
      createVehicleVisualRenderResourceV1(
        {
          createBuffer() {
            allocated = true;
            return null;
          },
        },
        "https://example.test/",
        "vehicles/tiny/vehicle.visual.json",
        {
          signal: controller.signal,
          fetcher: async () => {
            fetched = true;
            throw new Error("should not fetch");
          },
        },
      ),
    /AbortError|aborted/,
  );
  assert.equal(fetched, false);
  assert.equal(allocated, false);
});
