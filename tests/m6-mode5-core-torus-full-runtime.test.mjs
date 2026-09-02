import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import {
  Box3DBoundary,
  configureBox3DRuntimeVariant,
} from "../.test-dist/physics/box3d-boundary.js";
import {
  BOX3D_MODE5_RUNTIME_PATCH,
} from "../.test-dist/physics/mode5-box3d-runtime.js";
import {
  MODE5_CORE_TORUS_BACKEND_ID,
  MODE5_CORE_TORUS_GEOMETRY,
  MODE5_WHEEL_GEOMETRY_VARIANT,
} from "../.test-dist/vehicle/m6/mode5-wheel-backend.js";
import {
  M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS,
} from "../.test-dist/vehicle/m6/m6-topology-contract.js";

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(
    new URL("../public/receipts/jv_m6_factory_receipt.json", import.meta.url),
    "utf8",
  ),
);

test("full M6 settles and drives with the exact CORE torus selected", async () => {
  assert.equal(
    MODE5_WHEEL_GEOMETRY_VARIANT,
    MODE5_CORE_TORUS_GEOMETRY,
    "this focused test must compile with core-torus64 selected",
  );

  configureBox3DRuntimeVariant("mode5-experiment");
  const boundary = await Box3DBoundary.load();
  assert.equal(boundary.receipt.runtimePatch?.id, BOX3D_MODE5_RUNTIME_PATCH.id);

  const world = boundary.createM6TopologyWorld(receipt);
  try {
    const before = { ...world.counters };
    const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 5);

    assert.deepEqual(
      vehicle.topologyCounts,
      M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS,
    );
    assert.equal(
      world.counters.bodyCount - before.bodyCount,
      M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS.bodies,
    );
    assert.equal(
      world.counters.jointCount - before.jointCount,
      M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS.joints,
    );
    assert.equal(
      world.counters.shapeCount - before.shapeCount,
      M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS.shapes,
    );

    const settled = world.step(240)[0];
    assert.ok(settled);
    assert.equal(settled.wheelBackendId, MODE5_CORE_TORUS_BACKEND_ID);
    assert.ok(settled.worldContacts >= 1, "settled torus M6 must contact the world");
    for (const [index, corner] of settled.corners.entries()) {
      for (const [axis, value] of Object.entries(corner.wheelPosition)) {
        assert.ok(Number.isFinite(value), `corner ${index} wheel ${axis} is finite`);
      }
      assert.ok(Number.isFinite(corner.wheelSpinSpeed));
    }

    const start = { ...settled.chassisPosition };
    vehicle.setDrive({ throttle: 0.35, brake: 0 });
    const driven = world.step(180)[0];
    assert.ok(driven);
    assert.equal(driven.wheelBackendId, MODE5_CORE_TORUS_BACKEND_ID);
    assert.equal(driven.drive.mode, "THROTTLE");
    assert.ok(Number.isFinite(driven.drive.forwardSpeedMetersPerSecond));
    assert.ok(Number.isFinite(driven.drive.currentMotorTorqueTotal));
    const travel = Math.hypot(
      driven.chassisPosition.x - start.x,
      driven.chassisPosition.z - start.z,
    );
    assert.ok(travel > 0.05, `torus M6 did not translate under drive: ${travel}`);
  } finally {
    world.dispose();
  }
});
