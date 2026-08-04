import test from "node:test";
import assert from "node:assert/strict";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import {
  buildGlb,
  completeVisualBindings,
} from "./helpers/vehicle-visual-fixture.mjs";

function boundNames() {
  return completeVisualBindings().map((binding) => binding.nodeName);
}

test("rigid CPU decoder copies triangle data and indexes named nodes", () => {
  const asset = decodeGlbRigidCpuAssetV1(buildGlb(), boundNames());
  assert.equal(asset.nodes.length, 26);
  assert.equal(asset.rootNodeIndices.length, 26);
  assert.equal(asset.meshes.length, 1);
  assert.equal(asset.primitiveCount, 1);
  assert.equal(asset.triangleCount, 1);
  assert.equal(asset.materials.length, 0);
  assert.deepEqual(
    [...asset.meshes[0].primitives[0].positions],
    [-0.5, 0, 0, 0.5, 0, 0, 0, 1, 0],
  );
  assert.deepEqual([...asset.meshes[0].primitives[0].indices], [0, 1, 2]);
  assert.equal(
    asset.nodeIndexByName.get(completeVisualBindings()[0].nodeName),
    0,
  );
  assert.equal("set" in asset.nodeIndexByName, false);
});

test("unbound child hierarchy preserves authored local transforms", () => {
  const bindings = completeVisualBindings();
  const nodes = [
    ...bindings.map((binding, index) => ({
      name: binding.nodeName,
      ...(index === 0 ? { children: [bindings.length] } : {}),
    })),
    {
      name: "JV_DecorativeChild",
      mesh: 0,
      translation: [1, 2, 3],
    },
  ];
  const asset = decodeGlbRigidCpuAssetV1(buildGlb({ nodes }), boundNames());
  const child = asset.nodes.at(-1);
  assert.deepEqual([...child.localFromParent.slice(12, 15)], [1, 2, 3]);
  assert.equal(asset.rootNodeIndices.includes(child.index), false);
  assert.deepEqual(asset.nodes[0].children, [bindings.length]);
});

test("decoder rejects index values outside POSITION vertex count", () => {
  const bytes = buildGlb();
  const view = new DataView(bytes.buffer);
  const jsonLength = view.getUint32(12, true);
  const binStart = 20 + jsonLength + 8;
  view.setUint16(binStart + 36, 9, true);
  assert.throws(
    () => decodeGlbRigidCpuAssetV1(bytes, boundNames()),
    /contains vertex 9 >= 3/,
  );
});

test("decoder rejects cycles even outside the bound vehicle roots", () => {
  const bindings = completeVisualBindings();
  const firstExtra = bindings.length;
  const nodes = [
    ...bindings.map((binding, index) => ({
      name: binding.nodeName,
      ...(index === 0 ? { mesh: 0 } : {}),
    })),
    { name: "JV_UnboundCycleA", children: [firstExtra + 1] },
    { name: "JV_UnboundCycleB", children: [firstExtra] },
  ];
  assert.throws(
    () => decodeGlbRigidCpuAssetV1(buildGlb({ nodes }), boundNames()),
    /cycle/,
  );
});
