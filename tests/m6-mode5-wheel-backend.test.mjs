import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  validatePinnedNativeFactoryReceiptText,
} from "../.test-dist/config/native-factory-receipt.js";
import {
  Box3DBoundary,
  configureBox3DRuntimeVariant,
} from "../.test-dist/physics/box3d-boundary.js";
import {
  BOX3D_MODE5_RUNTIME_PATCH,
  loadMode5Box3DModule,
} from "../.test-dist/physics/mode5-box3d-runtime.js";
import {
  createLegacySplitWheel,
} from "../.test-dist/vehicle/m6/legacy-split-wheel-backend.js";
import {
  createMode5Wheel,
  MODE5_ASSET_PROFILE,
  MODE5_ASSET_PROFILE_CORNER_RADIUS,
  MODE5_ASSET_PROFILE_ID,
  MODE5_WHEEL_BACKEND_ID,
} from "../.test-dist/vehicle/m6/mode5-wheel-backend.js";
import {
  m6TopologyConfigFromReceipt,
} from "../.test-dist/vehicle/m6/m6-topology-config.js";
import {
  M6_MODE5_TOPOLOGY_COUNTS,
} from "../.test-dist/vehicle/m6/m6-topology-contract.js";

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(
    new URL("../public/receipts/jv_m6_factory_receipt.json", import.meta.url),
    "utf8",
  ),
);

function close(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual} vs ${expected}`,
  );
}

function closeMassData(actual, expected, label) {
  close(actual.mass, expected.mass, 1e-6, `${label} mass`);
  for (const axis of ["x", "y", "z"]) {
    close(actual.center[axis], expected.center[axis], 1e-7, `${label} center.${axis}`);
  }
  for (const column of ["cx", "cy", "cz"]) {
    for (const axis of ["x", "y", "z"]) {
      close(
        actual.inertia[column][axis],
        expected.inertia[column][axis],
        1e-5,
        `${label} inertia.${column}.${axis}`,
      );
    }
  }
}

test("mode5 asset profile preserves reference-sphere mass while replacing split contact geometry", async () => {
  const b3 = await loadMode5Box3DModule();
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  const worldId = b3.b3CreateWorld(worldDef);
  const config = m6TopologyConfigFromReceipt(receipt);
  try {
    const legacy = createLegacySplitWheel(
      b3,
      worldId,
      config,
      { x: -2, y: 2, z: 0 },
      -4001,
    );
    const mode5 = createMode5Wheel(
      b3,
      worldId,
      config,
      { x: 2, y: 2, z: 0 },
      -4002,
    );

    assert.equal(legacy.shapeCount, 2);
    assert.equal(mode5.shapeCount, 1);
    assert.equal(mode5.backendId, MODE5_WHEEL_BACKEND_ID);
    assert.equal(mode5.profileId, MODE5_ASSET_PROFILE_ID);
    assert.equal(mode5.profileCount, MODE5_ASSET_PROFILE.length);
    assert.equal(mode5.cornerRadius, MODE5_ASSET_PROFILE_CORNER_RADIUS);
    assert.equal(mode5.flatControlCornerRadius, 0.2);
    closeMassData(
      b3.b3Body_GetMassData(mode5.bodyId),
      b3.b3Body_GetMassData(legacy.bodyId),
      "mode5 vs mode3 reference sphere",
    );

    const fullMask = 0xffff_ffff_ffff_ffffn;
    assert.equal(
      b3.b3Shape_GetFilter(legacy.rollingShapeId).maskBits,
      config.terrainCategoryBits,
    );
    assert.equal(
      b3.b3Shape_GetFilter(mode5.rollingShapeId).maskBits,
      fullMask,
    );
  } finally {
    b3.b3DestroyWorld(worldId);
  }
});

test("patched boundary builds and drives a full M6 on the asset-profile mode5 backend", async () => {
  configureBox3DRuntimeVariant("mode5-experiment");
  const boundary = await Box3DBoundary.load();
  assert.equal(
    boundary.receipt.runtimePatch?.id,
    BOX3D_MODE5_RUNTIME_PATCH.id,
  );
  assert.equal(
    boundary.receipt.runtimePatch?.inlineArtifactSha256,
    BOX3D_MODE5_RUNTIME_PATCH.inlineArtifactSha256,
  );

  const world = boundary.createM6TopologyWorld(receipt);
  try {
    const before = { ...world.counters };
    const vehicle = world.createVehicle(
      { x: 0, y: 1.2, z: 0 },
      5,
    );
    assert.deepEqual(
      vehicle.topologyCounts,
      M6_MODE5_TOPOLOGY_COUNTS,
    );
    assert.equal(
      world.counters.bodyCount - before.bodyCount,
      M6_MODE5_TOPOLOGY_COUNTS.bodies,
    );
    assert.equal(
      world.counters.shapeCount - before.shapeCount,
      M6_MODE5_TOPOLOGY_COUNTS.shapes,
    );
    assert.equal(
      world.counters.jointCount - before.jointCount,
      M6_MODE5_TOPOLOGY_COUNTS.joints,
    );

    const settled = world.step(240)[0];
    assert.ok(settled);
    assert.equal(settled.wheelBackendId, MODE5_WHEEL_BACKEND_ID);
    assert.ok(settled.worldContacts >= 1);
    for (const [index, corner] of settled.corners.entries()) {
      assert.ok(
        Number.isFinite(corner.wheelPosition.x) &&
          Number.isFinite(corner.wheelPosition.y) &&
          Number.isFinite(corner.wheelPosition.z),
        `corner ${index} wheel position is finite`,
      );
    }

    const start = settled.chassisPosition;
    vehicle.setDrive({ throttle: 0.35, brake: 0 });
    const driven = world.step(180)[0];
    assert.ok(driven);
    assert.equal(driven.drive.mode, "THROTTLE");
    assert.ok(Number.isFinite(driven.drive.forwardSpeedMetersPerSecond));
    assert.ok(Number.isFinite(driven.drive.currentMotorTorqueTotal));
    const travel = Math.hypot(
      driven.chassisPosition.x - start.x,
      driven.chassisPosition.z - start.z,
    );
    assert.ok(travel > 0.05, `mode5 M6 did not translate under drive: ${travel}`);
  } finally {
    world.dispose();
  }
});
