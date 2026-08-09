import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Box3D from "box3d.js/inline";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { sealGlbRigidCpuAssetV1 } from "../.test-dist/visual/rigid-cpu-asset-seal.js";
import { assertVehicleVisualCpuOwnershipV1 } from "../.test-dist/visual/vehicle-visual-cpu-gate.js";
import { assertVehicleVisualBudgetV1 } from "../.test-dist/visual/vehicle-visual-budget.js";
import { transformVehicleVisualPointV1 } from "../.test-dist/visual/vehicle-visual-transform.js";
import { buildM6OwnerRealDrawPlanV1 } from "../.test-dist/render/m6-owner-vehicle-layer.js";
import { buildOwnerM6FullRigPackageR3 } from "../tools/owner-vehicle/owner-m6-full-rig-package-r3.mjs";
import { M6TopologyWorld } from "../.test-dist/vehicle/m6/m6-topology-world.js";

const receiptPath = new URL("../public/receipts/jv_m6_factory_receipt.json", import.meta.url);
const sourceRoot = "assets/owner-vehicle/source";
const contractRoot = "assets/owner-vehicle/contracts";
const CORNERS = ["fl", "fr", "rl", "rr"];

async function ownerR3Inputs() {
  const read = (name) => readFile(`${sourceRoot}/${name}`, "utf8");
  const contract = (name) => readFile(`${contractRoot}/${name}`, "utf8");
  return {
    chassisText: await read("Nadwozie.gltf"),
    wheelText: await read("Offroad_Big_Wheels.gltf"),
    frontSuspensionText: await read("OneSided_Steering_Suspension_Rig.gltf"),
    rearSuspensionText: await read("One_Sided_wheel_mount.gltf"),
    damperText: await read("Asset_Dumper.gltf"),
    cardanText: await read("Cardan_shaft.gltf"),
    factoryReceiptText: await readFile(receiptPath, "utf8"),
    contractTexts: {
      wheel: await contract("offroad_big_wheel.asset.json"),
      frontSuspension: await contract("one_sided_steering_suspension.asset.json"),
      rearSuspension: await contract("one_sided_wheel_mount.asset.json"),
      damper: await contract("asset_dumper.asset.json"),
      cardan: await contract("cardan_shaft.asset.json"),
    },
  };
}

const b3 = await Box3D();
const receipt = await validatePinnedNativeFactoryReceiptText(await readFile(receiptPath, "utf8"));
const generatedOwnerR3 = buildOwnerM6FullRigPackageR3(await ownerR3Inputs());
const visual = validateVehicleVisualPackageV1(JSON.parse(generatedOwnerR3.manifestText));
const bytes = generatedOwnerR3.glb;
assert.equal(visual.id, "m6-owner-full-rig-r3");
assert.equal(visual.asset.sha256, "38db97d09d9c315c979d167e84bffa6bf0cda0e17068534887ef008f26a400e8");
const assetReceipt = await validateVehicleVisualAssetV1(visual, bytes, null);
const cpuAsset = sealGlbRigidCpuAssetV1(
  decodeGlbRigidCpuAssetV1(bytes, visual.bindings.map((binding) => binding.nodeName)),
);
const runtime = {
  packageUrl: "https://example.test/vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json",
  assetUrl: "https://example.test/vehicles/m6-owner-r3/models/m6-owner-full-rig-r3.glb",
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

function commandBounds(command) {
  const mesh = cpuAsset.meshes[command.meshIndex];
  assert.ok(mesh, `mesh ${command.meshIndex} must exist`);
  const lo = { x: Infinity, y: Infinity, z: Infinity };
  const hi = { x: -Infinity, y: -Infinity, z: -Infinity };
  let vertices = 0;
  for (const primitive of mesh.primitives) {
    for (let offset = 0; offset < primitive.positions.length; offset += 3) {
      const world = transformVehicleVisualPointV1(command.worldFromNode, {
        x: primitive.positions[offset],
        y: primitive.positions[offset + 1],
        z: primitive.positions[offset + 2],
      });
      for (const axis of ["x", "y", "z"]) {
        assert.equal(Number.isFinite(world[axis]), true, `${command.nodeName}.${axis} must be finite`);
        lo[axis] = Math.min(lo[axis], world[axis]);
        hi[axis] = Math.max(hi[axis], world[axis]);
      }
      vertices += 1;
    }
  }
  assert.ok(vertices > 0, `${command.nodeName} must own geometry`);
  return {
    lo,
    hi,
    center: {
      x: (lo.x + hi.x) * 0.5,
      y: (lo.y + hi.y) * 0.5,
      z: (lo.z + hi.z) * 0.5,
    },
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function assertLivePlan(trace, label) {
  const plan = buildM6OwnerRealDrawPlanV1(resource, trace.visualFrame);
  assert.equal(plan.length, 53, `${label}: all 53 real owner roots must resolve`);
  const partMap = new Map(trace.visualFrame.parts.map((part) => [part.partId, part]));
  const chassis = partMap.get("m6.chassis");
  assert.ok(chassis);
  const chassisPosition = chassis.transform.position;

  for (const command of plan) {
    const bounds = commandBounds(command);
    assert.ok(
      distance(bounds.center, chassisPosition) < 5,
      `${label}: ${command.nodeName} escaped the physical vehicle envelope`,
    );
  }

  for (const corner of CORNERS) {
    const wheel = partMap.get(`m6.${corner}.wheel`);
    assert.ok(wheel);
    const nearWheelPrefixes = [
      `JV_R3_Real_owner_${corner}_wheel`,
      `JV_R3_Real_owner_${corner}_upper_arm`,
      `JV_R3_Real_owner_${corner}_lower_arm`,
      `JV_R3_Real_owner_${corner}_knuckle_`,
      `JV_R3_Real_owner_${corner}_coilover_`,
      `JV_R3_Real_owner_${corner}_steering_link`,
      `JV_R3_Real_owner_${corner}_cardan_`,
    ];
    const cornerCommands = plan.filter((command) =>
      nearWheelPrefixes.some((prefix) => command.nodeName?.startsWith(prefix)),
    );
    assert.ok(cornerCommands.length >= 10, `${label}: ${corner} must expose its full moving rig`);
    for (const command of cornerCommands) {
      const bounds = commandBounds(command);
      assert.ok(
        distance(bounds.center, wheel.transform.position) < 1.75,
        `${label}: ${command.nodeName} is not spatially attached to ${corner}`,
      );
    }
  }
  return plan;
}

function matrixDelta(a, b) {
  let sum = 0;
  for (let i = 0; i < 16; i += 1) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

test("owner full-rig R3 stays attached to a real live M6 before and after steering/drive", () => {
  const world = new M6TopologyWorld(b3, receipt);
  try {
    const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 41);
    world.step(180);
    const before = vehicle.lastTrace;
    assert.ok(before);
    const beforePlan = assertLivePlan(before, "settled");

    vehicle.setSteering({ mode: "RATE", value: 1 });
    vehicle.setDrive({ throttle: 0.25, brake: 0 });
    world.step(90);
    const after = vehicle.lastTrace;
    assert.ok(after);
    const afterPlan = assertLivePlan(after, "driving");

    const beforeByName = new Map(beforePlan.map((command) => [command.nodeName, command]));
    const afterByName = new Map(afterPlan.map((command) => [command.nodeName, command]));
    for (const nodeName of [
      "JV_R3_Real_owner_fl_knuckle_socket_chassismount_b",
      "JV_R3_Real_owner_fl_upper_arm",
      "JV_R3_Real_owner_fl_lower_arm",
      "JV_R3_Real_owner_fl_coilover_stretch",
      "JV_R3_Real_owner_fl_steering_link",
      "JV_R3_Real_owner_fl_cardan_mid",
      "JV_R3_Real_owner_rl_cardan_mid",
    ]) {
      const beforeCommand = beforeByName.get(nodeName);
      const afterCommand = afterByName.get(nodeName);
      assert.ok(beforeCommand && afterCommand, `${nodeName} must exist in both live frames`);
      assert.ok(
        matrixDelta(beforeCommand.worldFromNode, afterCommand.worldFromNode) > 1e-4,
        `${nodeName} must follow live M6 motion`,
      );
    }
  } finally {
    world.dispose();
  }
});
