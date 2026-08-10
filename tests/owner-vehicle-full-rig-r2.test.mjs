import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildOwnerM6FullRigPackageR2 } from "../tools/owner-vehicle/owner-m6-full-rig-package-r2.mjs";
import { inspectBlockbenchRigidPartsV1 } from "../tools/owner-vehicle/blockbench-gltf-rigid-parts.mjs";

const sourceRoot = "assets/owner-vehicle/source";
const contractRoot = "assets/owner-vehicle/contracts";

async function inputs() {
  const read = (name) => readFile(`${sourceRoot}/${name}`, "utf8");
  const contract = (name) => readFile(`${contractRoot}/${name}`, "utf8");
  return {
    chassisText: await read("Nadwozie.gltf"),
    wheelText: await read("Offroad_Big_Wheels.gltf"),
    frontSuspensionText: await read("OneSided_Steering_Suspension_Rig.gltf"),
    rearSuspensionText: await read("One_Sided_wheel_mount.gltf"),
    damperText: await read("Asset_Dumper.gltf"),
    cardanText: await read("Cardan_shaft.gltf"),
    factoryReceiptText: await readFile("public/receipts/jv_m6_factory_receipt.json", "utf8"),
    contractTexts: {
      wheel: await contract("offroad_big_wheel.asset.json"),
      frontSuspension: await contract("one_sided_steering_suspension.asset.json"),
      rearSuspension: await contract("one_sided_wheel_mount.asset.json"),
      damper: await contract("asset_dumper.asset.json"),
      cardan: await contract("cardan_shaft.asset.json"),
    },
  };
}

test("all recovered suspension/damper/cardan meshes decompose into rigid one-joint triangles", async () => {
  const expected = new Map([
    ["OneSided_Steering_Suspension_Rig.gltf", 7],
    ["One_Sided_wheel_mount.gltf", 4],
    ["Asset_Dumper.gltf", 3],
    ["Cardan_shaft.gltf", 3],
  ]);
  for (const [name, count] of expected) {
    const result = inspectBlockbenchRigidPartsV1(await readFile(`${sourceRoot}/${name}`, "utf8"), name);
    assert.equal(result.rigidPieces.length, count, name);
    assert.ok(result.rigidPieces.every((piece) => piece.triangleCount > 0), name);
  }
});

test("full owner R2 generation is byte deterministic and uses every available owner asset", async () => {
  const input = await inputs();
  const a = buildOwnerM6FullRigPackageR2(input);
  const b = buildOwnerM6FullRigPackageR2(input);
  assert.deepEqual(a.glb, b.glb);
  assert.equal(a.manifestText, b.manifestText);
  assert.deepEqual(a.report, b.report);
  assert.equal(a.report.output.sha256, "5b6421cb9991adff4a467b559ec2b69e25ea1667bd7cfee1e189d3d94cd116b3");
  assert.equal(a.glb.byteLength, 829076);
  assert.equal(a.report.output.realBindingCount, 53);
  assert.deepEqual(a.report.output.diagnosticBindingIds, ["diagnostic.rack.coverage"]);
  assert.equal(a.report.output.cardanTreatment, "VISUAL_ONLY_PART_PAIR_NO_TORQUE_TRANSFER");
  assert.equal(a.report.sourceAuthority.contractSha256.wheel, "24cf7d68bff367a6fcf267dd5efd841e13658736693881099fd52b2e7c613bfb");
  assert.equal(a.report.sources.frontSuspension.triangleCount, 312);
  assert.equal(a.report.sources.rearSuspension.triangleCount, 228);
  assert.equal(a.report.sources.damper.triangleCount, 120);
  assert.equal(a.report.sources.cardan.triangleCount, 228);
});

test("full owner R2 preserves front/rear and left/right geometry instead of cloning one corner transform", async () => {
  const result = buildOwnerM6FullRigPackageR2(await inputs());
  const c = result.report.calibration.corners;
  assert.deepEqual(c.fl.placement.attach, [1.25, -0.55, -0.9187500000000001]);
  assert.deepEqual(c.fr.placement.attach, [1.25, -0.55, 0.9187500000000001]);
  assert.deepEqual(c.rl.placement.attach, [-1.25, -0.55, -0.9187500000000001]);
  assert.deepEqual(c.rr.placement.attach, [-1.25, -0.55, 0.9187500000000001]);
  assert.equal(c.fl.cardan.length, c.fr.cardan.length);
  assert.equal(c.rl.cardan.length, c.rr.cardan.length);
  assert.notEqual(c.fl.cardan.length, c.rl.cardan.length);
  for (const corner of ["fl", "fr", "rl", "rr"]) {
    assert.equal(c[corner].arms.upper.restEndpointErrorMeters, 0);
    assert.equal(c[corner].arms.lower.restEndpointErrorMeters, 0);
    assert.ok(c[corner].arms.upper.targetAxialLength > 0.3);
    assert.ok(c[corner].arms.lower.targetAxialLength > 0.4);
  }
});
