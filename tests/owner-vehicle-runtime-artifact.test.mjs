import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { sealGlbRigidCpuAssetV1 } from "../.test-dist/visual/rigid-cpu-asset-seal.js";
import { assertVehicleVisualCpuOwnershipV1 } from "../.test-dist/visual/vehicle-visual-cpu-gate.js";
import { assertVehicleVisualBudgetV1 } from "../.test-dist/visual/vehicle-visual-budget.js";

const MANIFEST = "public/vehicles/m6-owner-r1/m6-owner-rigid-r1.visual.json";
const GLB = "public/vehicles/m6-owner-r1/models/m6-owner-rigid-r1.glb";

const REAL_PARTS = ["m6.chassis", "m6.fl.wheel", "m6.fr.wheel", "m6.rl.wheel", "m6.rr.wheel"];

test("committed owner vehicle artifact passes current package, asset, ownership and budget gates", async () => {
  const visual = validateVehicleVisualPackageV1(JSON.parse(await readFile(MANIFEST, "utf8")));
  const bytes = new Uint8Array(await readFile(GLB));
  const receipt = await validateVehicleVisualAssetV1(visual, bytes, null);
  const cpu = sealGlbRigidCpuAssetV1(
    decodeGlbRigidCpuAssetV1(bytes, visual.bindings.map((binding) => binding.nodeName)),
  );
  const ownership = assertVehicleVisualCpuOwnershipV1(visual, cpu);
  const budget = assertVehicleVisualBudgetV1(cpu);
  assert.equal(receipt.sha256, "ecf537a5131045972611f6a4e8df63b766c26ed54986709d43984ae52ddefecf");
  assert.equal(receipt.byteLength, 605948);
  assert.equal(receipt.boundNodeCount, 26);
  assert.equal(ownership.boundRootCount, 26);
  assert.equal(ownership.ownedMeshNodeCount, 26);
  assert.equal(cpu.meshes.length, 4);
  assert.equal(cpu.images.length, 2);
  assert.equal(cpu.textures.length, 2);
  assert.equal(budget.geometryBytes, 575208);
  assert.equal(budget.decodedTextureBytes, 278528);
  assert.equal(budget.maxTextureDimension, 256);
  for (const partId of REAL_PARTS) {
    assert.equal(
      visual.bindings.filter((binding) => binding.source.kind === "PART" && binding.source.partId === partId).length,
      1,
    );
  }
});
