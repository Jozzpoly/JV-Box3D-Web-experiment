import test from "node:test";
import assert from "node:assert/strict";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import { buildTinyVehicleVisualFixture } from "../tools/tiny-vehicle-visual-fixture-lib.mjs";

function fixture() {
  return buildTinyVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
}

test("tiny rig fixture is byte-for-byte deterministic", () => {
  const first = fixture();
  const second = fixture();
  assert.deepEqual(first.glb, second.glb);
  assert.equal(first.manifestText, second.manifestText);
  assert.equal(
    first.visualPackage.asset.sha256,
    second.visualPackage.asset.sha256,
  );
  assert.equal(first.visualPackage.bindings.length, 26);
});

test("generated package passes strict byte, runtime and CPU gates", async () => {
  const generated = fixture();
  const visual = validateVehicleVisualPackageV1(
    JSON.parse(generated.manifestText),
  );
  const receipt = await validateVehicleVisualAssetV1(
    visual,
    generated.glb,
    null,
  );
  const cpu = decodeGlbRigidCpuAssetV1(
    generated.glb,
    visual.bindings.map((binding) => binding.nodeName),
  );

  assert.equal(receipt.boundNodeCount, 26);
  assert.equal(cpu.nodes.length, 26);
  assert.equal(cpu.meshes.length, 2);
  assert.equal(cpu.primitiveCount, 2);
  assert.equal(cpu.triangleCount, 24);
  assert.equal(cpu.materials.length, 2);
  assert.equal(
    cpu.nodes.filter((node) => node.meshIndex === 0).length,
    M6_VISUAL_PART_IDS.length,
  );
  assert.equal(
    cpu.nodes.filter((node) => node.meshIndex === 1).length,
    M6_VISUAL_SEGMENT_IDS.length,
  );
});
