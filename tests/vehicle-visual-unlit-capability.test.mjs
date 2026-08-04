import test from "node:test";
import assert from "node:assert/strict";
import { assertVehicleVisualUnlitCapabilityV1 } from "../.test-dist/render/vehicle-visual-unlit-capability.js";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import { buildTinyVehicleVisualFixture } from "../tools/tiny-vehicle-visual-fixture-lib.mjs";

function primitive({ normals = null, texcoord0 = null, materialIndex = 0 } = {}) {
  return {
    positions: new Float32Array(9),
    normals,
    texcoord0,
    indices: new Uint16Array([0, 1, 2]),
    materialIndex,
  };
}

function assetWith(onePrimitive, materials = [{ doubleSided: false }]) {
  return {
    nodes: [],
    rootNodeIndices: [],
    nodeIndexByName: new Map(),
    meshes: [{ name: "fixture", primitives: [onePrimitive] }],
    materials,
    primitiveCount: 1,
    triangleCount: 1,
  };
}

test("deterministic tiny rig fits the first unlit renderer exactly", () => {
  const generated = buildTinyVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
  const asset = decodeGlbRigidCpuAssetV1(
    generated.glb,
    generated.visualPackage.bindings.map((binding) => binding.nodeName),
  );

  assert.deepEqual(assertVehicleVisualUnlitCapabilityV1(asset), {
    capabilityId: "UNLIT_POSITION_BASE_COLOR_V1",
    meshCount: 2,
    primitiveCount: 2,
    doubleSidedPrimitiveCount: 0,
  });
});

test("NORMAL cannot be silently accepted by an unlit position-only shader", () => {
  assert.throws(
    () =>
      assertVehicleVisualUnlitCapabilityV1(
        assetWith(primitive({ normals: new Float32Array(9) })),
      ),
    /contains NORMAL, but the first renderer does not consume normals/,
  );
});

test("TEXCOORD_0 cannot be silently accepted before texture ownership exists", () => {
  assert.throws(
    () =>
      assertVehicleVisualUnlitCapabilityV1(
        assetWith(primitive({ texcoord0: new Float32Array(6) })),
      ),
    /contains TEXCOORD_0, but the first renderer has no texture path/,
  );
});

test("double-sided material use is measured for the future draw-state contract", () => {
  assert.equal(
    assertVehicleVisualUnlitCapabilityV1(
      assetWith(primitive(), [{ doubleSided: true }]),
    ).doubleSidedPrimitiveCount,
    1,
  );
});

test("missing material references fail closed even at the draw capability boundary", () => {
  assert.throws(
    () =>
      assertVehicleVisualUnlitCapabilityV1(
        assetWith(primitive({ materialIndex: 1 })),
      ),
    /references missing material 1/,
  );
});
