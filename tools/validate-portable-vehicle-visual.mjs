import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { sealGlbRigidCpuAssetV1 } from "../.test-dist/visual/rigid-cpu-asset-seal.js";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { assertVehicleVisualBudgetV1 } from "../.test-dist/visual/vehicle-visual-budget.js";
import { assertVehicleVisualCpuOwnershipV1 } from "../.test-dist/visual/vehicle-visual-cpu-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";

const EXPECTED_OWNER_ID = "m6-owner-rigid-r1";
const EXPECTED_OWNER_SHA256 =
  "ecf537a5131045972611f6a4e8df63b766c26ed54986709d43984ae52ddefecf";
const EXPECTED_OWNER_BYTES = 605948;

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
const packagePath = resolve(
  dist,
  "vehicles/m6-owner-r1/m6-owner-rigid-r1.visual.json",
);
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const visual = validateVehicleVisualPackageV1(packageJson);
const glbPath = resolve(dist, "vehicles/m6-owner-r1", visual.asset.url);
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
  visual.id !== EXPECTED_OWNER_ID ||
  visual.asset.sha256 !== EXPECTED_OWNER_SHA256 ||
  visual.asset.byteLength !== EXPECTED_OWNER_BYTES ||
  glb.byteLength !== EXPECTED_OWNER_BYTES ||
  receipt.boundNodeCount !== 26 ||
  ownership.boundRootCount !== 26 ||
  budget.nodes !== 26 ||
  cpu.images.length !== 2 ||
  cpu.textures.length !== 2
) {
  throw new Error(
    `Portable owner vehicle contract drifted: id=${visual.id}, bytes=${glb.byteLength}, bindings=${receipt.boundNodeCount}, ownedRoots=${ownership.boundRootCount}, nodes=${budget.nodes}, images=${cpu.images.length}, textures=${cpu.textures.length}.`,
  );
}

console.log(
  `Portable owner vehicle passed: ${visual.id} · ${glb.byteLength} bytes · ${budget.nodes} nodes · ${budget.triangles} triangles · ${cpu.images.length} images / ${cpu.textures.length} textures.`,
);
