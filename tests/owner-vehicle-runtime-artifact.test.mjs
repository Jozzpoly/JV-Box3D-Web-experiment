import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { sealGlbRigidCpuAssetV1 } from "../.test-dist/visual/rigid-cpu-asset-seal.js";
import { assertVehicleVisualCpuOwnershipV1 } from "../.test-dist/visual/vehicle-visual-cpu-gate.js";
import { assertVehicleVisualBudgetV1 } from "../.test-dist/visual/vehicle-visual-budget.js";
import { M6_VISUAL_PART_IDS, M6_VISUAL_SEGMENT_IDS } from "../.test-dist/vehicle/m6/m6-visual-contract.js";

const MANIFEST = "public/vehicles/m6-owner-r2/m6-owner-full-rig-r2.visual.json";
const GLB = "public/vehicles/m6-owner-r2/models/m6-owner-full-rig-r2.glb";
const SHA = "5b6421cb9991adff4a467b559ec2b69e25ea1667bd7cfee1e189d3d94cd116b3";

test("committed owner full-rig R2 artifact passes package, asset, ownership and budget gates", async () => {
  const visual = validateVehicleVisualPackageV1(JSON.parse(await readFile(MANIFEST, "utf8")));
  const bytes = new Uint8Array(await readFile(GLB));
  const receipt = await validateVehicleVisualAssetV1(visual, bytes, null);
  const cpu = sealGlbRigidCpuAssetV1(
    decodeGlbRigidCpuAssetV1(bytes, visual.bindings.map((binding) => binding.nodeName)),
  );
  const ownership = assertVehicleVisualCpuOwnershipV1(visual, cpu);
  const budget = assertVehicleVisualBudgetV1(cpu);
  assert.equal(visual.id, "m6-owner-full-rig-r2");
  assert.equal(receipt.sha256, SHA);
  assert.equal(receipt.byteLength, 829076);
  assert.equal(receipt.boundNodeCount, 54);
  assert.equal(ownership.boundRootCount, 54);
  assert.equal(ownership.ownedMeshNodeCount, 54);
  assert.equal(cpu.meshes.length, 51);
  assert.equal(cpu.images.length, 3);
  assert.equal(cpu.textures.length, 3);
  assert.equal(budget.triangles, 4776);
  assert.equal(budget.geometryBytes, 751440);
  assert.equal(budget.decodedTextureBytes, 294912);
  assert.equal(budget.maxTextureDimension, 256);
  for (const partId of M6_VISUAL_PART_IDS) {
    assert.ok(
      visual.bindings.some((binding) => binding.source.kind === "PART" && binding.source.partId === partId),
      `missing part coverage ${partId}`,
    );
  }
  for (const segmentId of M6_VISUAL_SEGMENT_IDS) {
    assert.ok(
      visual.bindings.some((binding) =>
        (binding.source.kind === "SEGMENT_STRETCH" || binding.source.kind === "SEGMENT_ENDPOINT_AIM") &&
        binding.source.segmentId === segmentId
      ),
      `missing segment coverage ${segmentId}`,
    );
  }
  assert.equal(
    visual.bindings.filter((binding) => binding.nodeName.startsWith("JV_R2_Real_")).length,
    53,
  );
  assert.equal(
    visual.bindings.filter((binding) => binding.source.kind.startsWith("PART_PAIR_")).length,
    12,
  );
});
