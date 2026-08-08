import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { decodeGlbRigidTextureAssetV1 } from "../.test-dist/visual/glb-rigid-texture-decoder.js";
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

const ownerPackagePath = resolve(
  dist,
  "vehicles/m6-owner-r1/m6-owner-rigid-r1.visual.json",
);
const ownerGlbPath = resolve(
  dist,
  "vehicles/m6-owner-r1/models/m6-owner-rigid-r1.glb",
);

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const [ownerPackageExists, ownerGlbExists] = await Promise.all([
  exists(ownerPackagePath),
  exists(ownerGlbPath),
]);
if (ownerPackageExists !== ownerGlbExists) {
  throw new Error("Portable Owner M6 R1 runtime package is partial.");
}

if (ownerPackageExists) {
  const ownerVisual = validateVehicleVisualPackageV1(
    JSON.parse(await readFile(ownerPackagePath, "utf8")),
  );
  const ownerGlb = new Uint8Array(await readFile(ownerGlbPath));
  const ownerReceipt = await validateVehicleVisualAssetV1(
    ownerVisual,
    ownerGlb,
    null,
  );
  const ownerCpu = sealGlbRigidCpuAssetV1(
    decodeGlbRigidCpuAssetV1(
      ownerGlb,
      ownerVisual.bindings.map((binding) => binding.nodeName),
    ),
  );
  const ownerOwnership = assertVehicleVisualCpuOwnershipV1(
    ownerVisual,
    ownerCpu,
  );
  const ownerBudget = assertVehicleVisualBudgetV1(ownerCpu);
  const ownerTextures = decodeGlbRigidTextureAssetV1(ownerGlb);

  if (
    ownerVisual.id !== "m6-owner-rigid-r1" ||
    ownerGlb.byteLength !== 605_948 ||
    ownerReceipt.sha256 !==
      "ecf537a5131045972611f6a4e8df63b766c26ed54986709d43984ae52ddefecf" ||
    ownerReceipt.boundNodeCount !== 26 ||
    ownerOwnership.boundRootCount !== 26 ||
    ownerBudget.nodes !== 26 ||
    ownerBudget.primitives !== 8 ||
    ownerBudget.triangles !== 2_268 ||
    ownerBudget.materials !== 4 ||
    ownerBudget.geometryBytes !== 575_208 ||
    ownerTextures.images.length !== 2 ||
    ownerTextures.textures.length !== 2 ||
    ownerTextures.compressedImageBytes !== 22_942 ||
    ownerTextures.decodedTextureBytes !== 278_528
  ) {
    throw new Error(
      `Portable owner M6 visual contract drifted: id=${ownerVisual.id}, bytes=${ownerGlb.byteLength}, sha=${ownerReceipt.sha256}.`,
    );
  }

  console.log(
    `Portable owner M6 visual passed: ${ownerVisual.id} · ${ownerGlb.byteLength} bytes · ${ownerBudget.triangles} unique triangles · ${ownerTextures.decodedTextureBytes} texture bytes.`,
  );
}
