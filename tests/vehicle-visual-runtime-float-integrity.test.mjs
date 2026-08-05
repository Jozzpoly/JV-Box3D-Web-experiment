import test from "node:test";
import assert from "node:assert/strict";
import { loadVehicleVisualRuntimeV1 } from "../.test-dist/visual/vehicle-visual-runtime-loader.js";
import {
  buildGlb,
  packageForGlb,
} from "./helpers/vehicle-visual-fixture.mjs";

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

function corruptFirstPositionWithNaN(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const jsonLength = view.getUint32(12, true);
  const binaryStart = 20 + jsonLength + 8;
  view.setFloat32(binaryStart, Number.NaN, true);
}

test("vehicle runtime rejects non-finite decoded POSITION before publishing CPU state", async () => {
  const glb = buildGlb();
  corruptFirstPositionWithNaN(glb);
  const visualPackage = packageForGlb(glb);
  const requests = [];

  await assert.rejects(
    () =>
      loadVehicleVisualRuntimeV1(
        "https://example.test/demo/",
        "vehicles/test/vehicle.visual.json",
        {
          fetcher: async (url) => {
            requests.push(url);
            return url.endsWith("vehicle.visual.json")
              ? response({ jsonValue: visualPackage, bytes: new Uint8Array() })
              : response({ jsonValue: null, bytes: glb });
          },
        },
      ),
    /POSITION\[0\] must be finite/,
  );
  assert.equal(requests.length, 2);
});
