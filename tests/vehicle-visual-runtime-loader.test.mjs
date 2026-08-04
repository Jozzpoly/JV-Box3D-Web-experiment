import test from "node:test";
import assert from "node:assert/strict";
import { loadVehicleVisualRuntimeV1 } from "../.test-dist/visual/vehicle-visual-runtime-loader.js";
import {
  buildGlb,
  packageForGlb,
} from "./helpers/vehicle-visual-fixture.mjs";

function response({ ok = true, status = 200, jsonValue, bytes }) {
  return {
    ok,
    status,
    async json() {
      return jsonValue;
    },
    async arrayBuffer() {
      const value = bytes ?? new Uint8Array();
      return value.buffer.slice(
        value.byteOffset,
        value.byteOffset + value.byteLength,
      );
    },
  };
}

test("runtime loader resolves package-relative GLB and returns one complete CPU asset", async () => {
  const bytes = buildGlb();
  const visualPackage = packageForGlb(bytes);
  const calls = [];
  const runtime = await loadVehicleVisualRuntimeV1(
    "https://example.test/JV-Box3D-Web-experiment/",
    "vehicles/tiny/vehicle.visual.json",
    {
      fetcher: async (url) => {
        calls.push(url);
        if (
          url ===
          "https://example.test/JV-Box3D-Web-experiment/vehicles/tiny/vehicle.visual.json"
        ) {
          return response({ jsonValue: visualPackage });
        }
        if (
          url ===
          "https://example.test/JV-Box3D-Web-experiment/vehicles/tiny/models/m6-demonstrator.glb"
        ) {
          return response({ bytes });
        }
        return response({ ok: false, status: 404 });
      },
    },
  );

  assert.deepEqual(calls, [
    "https://example.test/JV-Box3D-Web-experiment/vehicles/tiny/vehicle.visual.json",
    "https://example.test/JV-Box3D-Web-experiment/vehicles/tiny/models/m6-demonstrator.glb",
  ]);
  assert.equal(runtime.visualPackage.id, "m6-demonstrator-full-rig");
  assert.equal(runtime.assetReceipt.sha256, visualPackage.asset.sha256);
  assert.equal(runtime.cpuAsset.nodes.length, 26);
  assert.equal(runtime.cpuAsset.triangleCount, 1);
});

test("invalid manifest stops before the GLB request", async () => {
  const calls = [];
  await assert.rejects(
    () =>
      loadVehicleVisualRuntimeV1(
        "https://example.test/",
        "vehicles/tiny/vehicle.visual.json",
        {
          fetcher: async (url) => {
            calls.push(url);
            return response({
              jsonValue: {
                format: "wrong-format",
              },
            });
          },
        },
      ),
    /Vehicle visual package rejected/,
  );
  assert.equal(calls.length, 1);
});

test("HTTP failure and aborted fetch do not create a partial runtime", async () => {
  await assert.rejects(
    () =>
      loadVehicleVisualRuntimeV1(
        "https://example.test/",
        "vehicles/missing.visual.json",
        {
          fetcher: async () => response({ ok: false, status: 404 }),
        },
      ),
    /HTTP 404/,
  );

  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    () =>
      loadVehicleVisualRuntimeV1(
        "https://example.test/",
        "vehicles/tiny/vehicle.visual.json",
        {
          signal: controller.signal,
          fetcher: async (_url, init) => {
            if (init.signal?.aborted) {
              throw new DOMException("aborted", "AbortError");
            }
            return response({ ok: false, status: 500 });
          },
        },
      ),
    /aborted/,
  );
});
