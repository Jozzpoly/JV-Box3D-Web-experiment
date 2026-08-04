import test from "node:test";
import assert from "node:assert/strict";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { assertVehicleVisualCpuOwnershipV1 } from "../.test-dist/visual/vehicle-visual-cpu-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import {
  buildGlb,
  completeVisualBindings,
  packageForGlb,
} from "./helpers/vehicle-visual-fixture.mjs";

function decode(bytes, visual) {
  return decodeGlbRigidCpuAssetV1(
    bytes,
    visual.bindings.map((binding) => binding.nodeName),
  );
}

test("complete renderable full-rig ownership passes", () => {
  const bytes = buildGlb();
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  const receipt = assertVehicleVisualCpuOwnershipV1(
    visual,
    decode(bytes, visual),
  );
  assert.equal(receipt.boundRootCount, 26);
  assert.equal(receipt.ownedNodeCount, 26);
  assert.equal(receipt.ownedMeshNodeCount, 26);
});

test("bound root without a mesh descendant fails closed", () => {
  const bindings = completeVisualBindings();
  const bytes = buildGlb({
    nodes: bindings.map((binding, index) => ({
      name: binding.nodeName,
      ...(index === bindings.length - 1 ? {} : { mesh: 0 }),
    })),
  });
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  assert.throws(
    () => assertVehicleVisualCpuOwnershipV1(visual, decode(bytes, visual)),
    /owns no renderable mesh node/,
  );
});

test("mesh node outside every binding root fails closed", () => {
  const bindings = completeVisualBindings();
  const bytes = buildGlb({
    nodes: [
      ...bindings.map((binding) => ({ name: binding.nodeName, mesh: 0 })),
      { name: "JV_UnownedMesh", mesh: 0 },
    ],
  });
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  assert.throws(
    () => assertVehicleVisualCpuOwnershipV1(visual, decode(bytes, visual)),
    /outside every binding root/,
  );
});
