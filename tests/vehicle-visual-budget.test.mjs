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
    primitiveCount: 1,
    triangleCount: 1,
    ...overrides,
  };
}

test("vehicle budget measures decoded geometry bytes exactly", () => {
  const fixture = asset();
  assert.equal(measureVehicleVisualGeometryBytesV1(fixture), 42);
  assert.deepEqual(assertVehicleVisualBudgetV1(fixture), {
    nodes: 1,
    primitives: 1,
    triangles: 1,
    materials: 0,
    geometryBytes: 42,
  });
});

test("every platform budget fails closed independently", () => {
  const limits = VEHICLE_VISUAL_PLATFORM_LIMITS_V1;
  assert.throws(
    () => assertVehicleVisualBudgetV1(asset({ nodes: new Array(limits.maxNodes + 1) })),
    /node count/,
  );
  assert.throws(
    () =>
      assertVehicleVisualBudgetV1(
        asset({ primitiveCount: limits.maxPrimitives + 1 }),
      ),
    /primitive count/,
  );
  assert.throws(
    () =>
      assertVehicleVisualBudgetV1(
        asset({ triangleCount: limits.maxTriangles + 1 }),
      ),
    /triangle count/,
  );
  assert.throws(
    () =>
      assertVehicleVisualBudgetV1(
        asset({ materials: new Array(limits.maxMaterials + 1) }),
      ),
    /material count/,
  );
  const oversizedPositions = new Float32Array(
    Math.floor(limits.maxGeometryBytes / 4) + 1,
  );
  assert.throws(
    () =>
      assertVehicleVisualBudgetV1(
        asset({
          meshes: [
            {
              name: null,
              primitives: [
                {
                  positions: oversizedPositions,
                  normals: null,
                  texcoord0: null,
                  indices: new Uint16Array(3),
                  materialIndex: null,
                },
              ],
            },
          ],
        }),
      ),
    /geometry bytes/,
  );
});
