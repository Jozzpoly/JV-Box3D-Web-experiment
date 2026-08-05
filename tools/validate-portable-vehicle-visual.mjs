import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertRigidLitNormalBaseColorCapabilityV1 } from "../.test-dist/render/rigid-lit-normal-capability.js";
import { assertVehicleVisualUnlitCapabilityV1 } from "../.test-dist/render/vehicle-visual-unlit-capability.js";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { sealGlbRigidCpuAssetV1 } from "../.test-dist/visual/rigid-cpu-asset-seal.js";
import { assertRigidFloatStreamIntegrityV1 } from "../.test-dist/visual/rigid-float-stream-integrity.js";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { assertVehicleVisualBudgetV1 } from "../.test-dist/visual/vehicle-visual-budget.js";
import { assertVehicleVisualCpuOwnershipV1 } from "../.test-dist/visual/vehicle-visual-cpu-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import {
  LIT_NORMAL_VEHICLE_VISUAL_FIXTURE,
  TINY_VEHICLE_VISUAL_FIXTURE,
} from "./generated-vehicle-visual-fixture-catalog.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");

const fixtureExpectations = Object.freeze([
  Object.freeze({
    record: TINY_VEHICLE_VISUAL_FIXTURE,
    exactByteLength: 2628,
    exactSha256:
      "b243bf5ae6ed0b185885b6d341ab0a12fd377743408040e14226c1fecbb31281",
    positionVertexCount: 16,
    normalVectorCount: 0,
    geometryBytes: 336,
    doubleSidedPrimitiveCount: 0,
    assertCapability: assertVehicleVisualUnlitCapabilityV1,
  }),
  Object.freeze({
    record: LIT_NORMAL_VEHICLE_VISUAL_FIXTURE,
    exactByteLength: null,
    exactSha256: null,
    positionVertexCount: 48,
    normalVectorCount: 48,
    geometryBytes: 1296,
    doubleSidedPrimitiveCount: 1,
    assertCapability: assertRigidLitNormalBaseColorCapabilityV1,
  }),
]);

function requireEqual(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label} expected ${String(expected)}, received ${String(actual)}.`);
  }
}

async function validateFixture(expectation) {
  const { record } = expectation;
  const packageJson = JSON.parse(
    await readFile(resolve(dist, record.packagePath), "utf8"),
  );
  const visual = validateVehicleVisualPackageV1(packageJson);
  requireEqual(`${record.id} package id`, visual.id, record.id);
  requireEqual(
    `${record.id} asset URL`,
    visual.asset.url,
    `models/${record.modelFileName}`,
  );

  const glb = new Uint8Array(await readFile(resolve(dist, record.assetPath)));
  const assetReceipt = await validateVehicleVisualAssetV1(visual, glb, null);
  const cpu = sealGlbRigidCpuAssetV1(
    decodeGlbRigidCpuAssetV1(
      glb,
      visual.bindings.map((binding) => binding.nodeName),
    ),
  );
  const floatIntegrity = assertRigidFloatStreamIntegrityV1(cpu);
  const ownership = assertVehicleVisualCpuOwnershipV1(visual, cpu);
  const budget = assertVehicleVisualBudgetV1(cpu);
  const capability = expectation.assertCapability(cpu);

  requireEqual(`${record.id} bound node count`, assetReceipt.boundNodeCount, 26);
  requireEqual(`${record.id} bound root count`, ownership.boundRootCount, 26);
  requireEqual(`${record.id} owned node count`, ownership.ownedNodeCount, 26);
  requireEqual(
    `${record.id} owned mesh node count`,
    ownership.ownedMeshNodeCount,
    26,
  );
  requireEqual(`${record.id} node count`, budget.nodes, 26);
  requireEqual(`${record.id} mesh count`, cpu.meshes.length, 2);
  requireEqual(`${record.id} primitive count`, budget.primitives, 2);
  requireEqual(`${record.id} triangle count`, budget.triangles, 24);
  requireEqual(`${record.id} material count`, budget.materials, 2);
  requireEqual(
    `${record.id} geometry bytes`,
    budget.geometryBytes,
    expectation.geometryBytes,
  );
  requireEqual(
    `${record.id} node matrix values`,
    floatIntegrity.nodeMatrixValueCount,
    26 * 16,
  );
  requireEqual(
    `${record.id} POSITION vertices`,
    floatIntegrity.positionVertexCount,
    expectation.positionVertexCount,
  );
  requireEqual(
    `${record.id} NORMAL vectors`,
    floatIntegrity.normalVectorCount,
    expectation.normalVectorCount,
  );
  requireEqual(`${record.id} TEXCOORD_0 pairs`, floatIntegrity.texcoordPairCount, 0);
  requireEqual(
    `${record.id} capability`,
    capability.capabilityId,
    record.capabilityId,
  );
  requireEqual(`${record.id} capability meshes`, capability.meshCount, 2);
  requireEqual(`${record.id} capability primitives`, capability.primitiveCount, 2);
  requireEqual(
    `${record.id} double-sided primitives`,
    capability.doubleSidedPrimitiveCount,
    expectation.doubleSidedPrimitiveCount,
  );

  if (record === LIT_NORMAL_VEHICLE_VISUAL_FIXTURE) {
    requireEqual(`${record.id} capability vertices`, capability.vertexCount, 48);
    requireEqual(`${record.id} capability materials`, capability.materialCount, 2);
    requireEqual(
      `${record.id} default-material primitives`,
      capability.defaultMaterialPrimitiveCount,
      0,
    );
    requireEqual(
      `${record.id} capability NORMAL vectors`,
      capability.floatIntegrity.normalVectorCount,
      48,
    );
    requireEqual(
      `${record.id} capability TEXCOORD_0 pairs`,
      capability.floatIntegrity.texcoordPairCount,
      0,
    );
  }

  if (expectation.exactByteLength !== null) {
    requireEqual(
      `${record.id} exact GLB byte length`,
      glb.byteLength,
      expectation.exactByteLength,
    );
  }
  if (expectation.exactSha256 !== null) {
    requireEqual(
      `${record.id} exact GLB SHA-256`,
      visual.asset.sha256,
      expectation.exactSha256,
    );
  }

  return Object.freeze({
    id: record.id,
    byteLength: glb.byteLength,
    sha256: visual.asset.sha256,
    geometryBytes: budget.geometryBytes,
    normalVectorCount: floatIntegrity.normalVectorCount,
  });
}

const receipts = [];
for (const expectation of fixtureExpectations) {
  receipts.push(await validateFixture(expectation));
}

for (const receipt of receipts) {
  console.log(
    `Portable vehicle visual passed: ${receipt.id} · ${receipt.byteLength} bytes · ${receipt.geometryBytes} geometry bytes · ${receipt.normalVectorCount} normals · ${receipt.sha256}.`,
  );
}
