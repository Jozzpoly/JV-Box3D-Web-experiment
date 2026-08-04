import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { sealGlbRigidCpuAssetV1 } from "../.test-dist/visual/rigid-cpu-asset-seal.js";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { assertVehicleVisualBudgetV1 } from "../.test-dist/visual/vehicle-visual-budget.js";
import { assertVehicleVisualCpuOwnershipV1 } from "../.test-dist/visual/vehicle-visual-cpu-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
const packagePath = resolve(
  dist,
  "vehicles/tiny/vehicle.visual.json",
);
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const visual = validateVehicleVisualPackageV1(packageJson);
const glbPath = resolve(dist, "vehicles/tiny", visual.asset.url);
const glb = new Uint8Array(await readFile(glbPath));
const receipt = await validateVehicleVisualAssetV1(visual, glb, null);
const cpu = sealGlbRigidCpuAssetV1(
  decodeGlbRigidCpuAssetV1(
    glb,
    visual.bindings.map((binding) => binding.nodeName),
  ),
);
const ownership = assertVehicleVisualCpuOwnershipV1(visual, cpu);
const budget = assertVehicleVisualBudgetV1(cpu);

if (
  visual.id !== "m6-tiny-rig-proof-v1" ||
  receipt.boundNodeCount !== 26 ||
  ownership.boundRootCount !== 26 ||
  ownership.ownedMeshNodeCount !== 26 ||
  budget.nodes !== 26 ||
  budget.primitives !== 2 ||
  budget.triangles !== 24 ||
  budget.materials !== 2 ||
  budget.geometryBytes !== 336 ||
  cpu.meshes.length !== 2
) {
  throw new Error(
    `Portable tiny vehicle fixture contract drifted: id=${visual.id}, bindings=${receipt.boundNodeCount}, ownedRoots=${ownership.boundRootCount}, ownedMeshes=${ownership.ownedMeshNodeCount}, nodes=${budget.nodes}, meshes=${cpu.meshes.length}, primitives=${budget.primitives}, triangles=${budget.triangles}, materials=${budget.materials}, geometryBytes=${budget.geometryBytes}.`,
  );
}

console.log(
  `Portable vehicle visual passed: ${visual.id} · ${glb.byteLength} bytes · ${budget.nodes} nodes · ${budget.triangles} triangles · ${budget.geometryBytes} geometry bytes.`,
);
