import test from "node:test";
import assert from "node:assert/strict";
import {
  VEHICLE_VISUAL_PLATFORM_LIMITS_V1,
  assertVehicleVisualBudgetV1,
  measureVehicleVisualGeometryBytesV1,
} from "../.test-dist/visual/vehicle-visual-budget.js";

function asset(overrides = {}) {
  const primitive = {
    positions: new Float32Array(9),
    normals: null,
    texcoord0: null,
    indices: new Uint16Array(3),
    materialIndex: null,
  };
  return {
    nodes: [{}],
    rootNodeIndices: [0],
    nodeIndexByName: new Map(),
    meshes: [{ name: null, primitives: [primitive] }],
    materials: [],
    images: [],
    samplers: [],
    textures: [],
    primitiveCount: 1,
    triangleCount: 1,
    ...overrides,
  };
}

test("vehicle budget measures geometry and empty texture budget exactly", () => {
  const fixture = asset();
  assert.equal(measureVehicleVisualGeometryBytesV1(fixture), 42);
  assert.deepEqual(assertVehicleVisualBudgetV1(fixture), {
    nodes: 1,
    primitives: 1,
    triangles: 1,
    materials: 0,
    geometryBytes: 42,
    images: 0,
    textures: 0,
    encodedTextureBytes: 0,
    decodedTextureBytes: 0,
    maxTextureDimension: 0,
  });
});

test("texture budget counts encoded images and actual GPU texture instances", () => {
  const image = {
    name: null,
    mimeType: "image/png",
    bytes: new Uint8Array(128),
    width: 64,
    height: 32,
    decodedRgbaBytes: 64 * 32 * 4,
  };
  const fixture = asset({
    images: [image],
    samplers: [{ name: null, magFilter: 9728, minFilter: 9728, wrapS: 33071, wrapT: 33071 }],
    textures: [
      { name: null, sourceImageIndex: 0, samplerIndex: 0 },
      { name: null, sourceImageIndex: 0, samplerIndex: 0 },
    ],
  });
  const receipt = assertVehicleVisualBudgetV1(fixture);
  assert.equal(receipt.encodedTextureBytes, 128);
  assert.equal(receipt.decodedTextureBytes, 2 * 64 * 32 * 4);
  assert.equal(receipt.maxTextureDimension, 64);
});

test("geometry and texture platform budgets fail closed independently", () => {
  const limits = VEHICLE_VISUAL_PLATFORM_LIMITS_V1;
  assert.throws(
    () => assertVehicleVisualBudgetV1(asset({ nodes: new Array(limits.maxNodes + 1) })),
    /node count/,
  );
  assert.throws(
    () => assertVehicleVisualBudgetV1(asset({ primitiveCount: limits.maxPrimitives + 1 })),
    /primitive count/,
  );
  assert.throws(
    () => assertVehicleVisualBudgetV1(asset({ triangleCount: limits.maxTriangles + 1 })),
    /triangle count/,
  );
  assert.throws(
    () => assertVehicleVisualBudgetV1(asset({ materials: new Array(limits.maxMaterials + 1) })),
    /material count/,
  );
  assert.throws(
    () =>
      assertVehicleVisualBudgetV1(
        asset({
          meshes: [{
            name: null,
            primitives: [{
              positions: { byteLength: limits.maxGeometryBytes + 1 },
              normals: null,
              texcoord0: null,
              indices: { byteLength: 0 },
              materialIndex: null,
            }],
          }],
        }),
      ),
    /geometry bytes/,
  );
  const tooLargeImage = {
    name: null,
    mimeType: "image/png",
    bytes: new Uint8Array(1),
    width: limits.maxTextureDimension + 1,
    height: 1,
    decodedRgbaBytes: (limits.maxTextureDimension + 1) * 4,
  };
  assert.throws(
    () => assertVehicleVisualBudgetV1(asset({ images: [tooLargeImage] })),
    /texture dimension/,
  );
});
