import test from "node:test";
import assert from "node:assert/strict";
import { buildLitNormalVehicleVisualFixture } from "../tools/lit-normal-vehicle-visual-fixture-lib.mjs";
import { loadVehicleVisualRuntimeV1 } from "../.test-dist/visual/vehicle-visual-runtime-loader.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import { assertRigidLitNormalBaseColorCapabilityV1 } from "../.test-dist/render/rigid-lit-normal-capability.js";
import { assertVehicleVisualUnlitCapabilityV1 } from "../.test-dist/render/vehicle-visual-unlit-capability.js";

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

function fixture() {
  return buildLitNormalVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
}

test("lit-normal fixture bytes and manifest are deterministic", () => {
  const first = fixture();
  const second = fixture();
  assert.deepEqual(first.glb, second.glb);
  assert.equal(first.manifestText, second.manifestText);
  assert.equal(first.visualPackage.asset.sha256, second.visualPackage.asset.sha256);
  assert.equal(first.visualPackage.asset.byteLength, first.glb.byteLength);
  assert.equal(first.visualPackage.id, "m6-lit-normal-rig-proof-v1");
  assert.equal(
    first.visualPackage.asset.url,
    "models/m6-lit-normal-proof.glb",
  );
});

test("full vehicle loader accepts the lit fixture and the lit capability covers both shared meshes", async () => {
  const generated = fixture();
  const requests = [];
  const runtime = await loadVehicleVisualRuntimeV1(
    "https://example.test/demo/",
    "vehicles/lit-normal/vehicle.visual.json",
    {
      fetcher: async (url) => {
        requests.push(url);
        if (url.endsWith("vehicle.visual.json")) {
          return response({
            jsonValue: generated.visualPackage,
            bytes: new Uint8Array(),
          });
        }
        if (url.endsWith("m6-lit-normal-proof.glb")) {
          return response({ jsonValue: null, bytes: generated.glb });
        }
        return { ok: false, status: 404 };
      },
    },
  );

  assert.equal(requests.length, 2);
  assert.equal(runtime.ownershipReceipt.bindingCount, 26);
  const capability = assertRigidLitNormalBaseColorCapabilityV1(
    runtime.cpuAsset,
  );
  assert.equal(capability.meshCount, 2);
  assert.equal(capability.primitiveCount, 2);
  assert.equal(capability.vertexCount, 48);
  assert.equal(capability.materialCount, 2);
  assert.equal(capability.defaultMaterialPrimitiveCount, 0);
  assert.equal(capability.doubleSidedPrimitiveCount, 1);
  assert.equal(capability.floatIntegrity.normalVectorCount, 48);
  assert.equal(capability.floatIntegrity.texcoordPairCount, 0);

  assert.throws(
    () => assertVehicleVisualUnlitCapabilityV1(runtime.cpuAsset),
    /contains NORMAL/,
  );
});

test("tapered segment fixture contains oblique unit normals that expose stretch mistakes", async () => {
  const generated = fixture();
  const runtime = await loadVehicleVisualRuntimeV1(
    "https://example.test/",
    "vehicles/lit-normal/vehicle.visual.json",
    {
      fetcher: async (url) =>
        url.endsWith("vehicle.visual.json")
          ? response({
              jsonValue: generated.visualPackage,
              bytes: new Uint8Array(),
            })
          : response({ jsonValue: null, bytes: generated.glb }),
    },
  );
  const normals = runtime.cpuAsset.meshes[1].primitives[0].normals;
  assert.notEqual(normals, null);

  let foundOblique = false;
  for (let offset = 0; offset < normals.length; offset += 3) {
    const x = normals[offset];
    const y = normals[offset + 1];
    const z = normals[offset + 2];
    const length = Math.hypot(x, y, z);
    assert.ok(Math.abs(length - 1) <= 1e-6);
    if (
      Math.abs(y) > 0.01 &&
      (Math.abs(x) > 0.1 || Math.abs(z) > 0.1)
    ) {
      foundOblique = true;
    }
  }
  assert.equal(foundOblique, true);
});
