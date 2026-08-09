import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { sealGlbRigidCpuAssetV1 } from "../.test-dist/visual/rigid-cpu-asset-seal.js";
import { assertVehicleVisualCpuOwnershipV1 } from "../.test-dist/visual/vehicle-visual-cpu-gate.js";
import { assertVehicleVisualBudgetV1 } from "../.test-dist/visual/vehicle-visual-budget.js";
import {
  M6_OWNER_REAL_PART_IDS,
  buildM6OwnerRealDrawPlanV1,
} from "../.test-dist/render/m6-owner-vehicle-layer.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";

const MANIFEST = "public/vehicles/m6-owner-r1/m6-owner-rigid-r1.visual.json";
const GLB = "public/vehicles/m6-owner-r1/models/m6-owner-rigid-r1.glb";

function identityFrame() {
  return {
    contractVersion: 1,
    generation: 1,
    stepIndex: 1,
    parts: M6_VISUAL_PART_IDS.map((partId) => ({
      partId,
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
    })),
    segments: M6_VISUAL_SEGMENT_IDS.map((segmentId) => ({
      segmentId,
      start: { x: 0, y: 0, z: 0 },
      end: { x: 0, y: 1, z: 0 },
      lengthMeters: 1,
    })),
  };
}

test("owner draw plan selects exactly chassis plus four wheel roots", async () => {
  const visual = validateVehicleVisualPackageV1(JSON.parse(await readFile(MANIFEST, "utf8")));
  const bytes = new Uint8Array(await readFile(GLB));
  const assetReceipt = await validateVehicleVisualAssetV1(visual, bytes, null);
  const cpuAsset = sealGlbRigidCpuAssetV1(
    decodeGlbRigidCpuAssetV1(bytes, visual.bindings.map((binding) => binding.nodeName)),
  );
  const runtime = {
    packageUrl: "https://example.test/vehicles/m6-owner-r1/m6-owner-rigid-r1.visual.json",
    assetUrl: "https://example.test/vehicles/m6-owner-r1/models/m6-owner-rigid-r1.glb",
    visualPackage: visual,
    assetReceipt,
    ownershipReceipt: assertVehicleVisualCpuOwnershipV1(visual, cpuAsset),
    budgetReceipt: assertVehicleVisualBudgetV1(cpuAsset),
    cpuAsset,
  };
  const resource = {
    runtime,
    gpuAsset: { meshes: [], gpuByteLength: 0, disposed: false, dispose() {} },
    gpuTextures: { textures: [], gpuByteLength: 0, disposed: false, dispose() {} },
    disposed: false,
    dispose() {},
  };
  const commands = buildM6OwnerRealDrawPlanV1(resource, identityFrame());
  assert.equal(commands.length, 5);
  const expectedNames = new Set(
    visual.bindings
      .filter((binding) => binding.source.kind === "PART" && M6_OWNER_REAL_PART_IDS.includes(binding.source.partId))
      .map((binding) => binding.nodeName),
  );
  assert.deepEqual(new Set(commands.map((command) => command.nodeName)), expectedNames);
  assert.deepEqual(commands.map((command) => command.meshIndex), [0, 1, 1, 1, 1]);
});
