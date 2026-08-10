import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Box3D from "box3d.js/inline";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import { createProductWorld } from "../.test-dist/scene/product-world.js";
import { sampleE2rOffroadHeight } from "../.test-dist/scene/e2r-world.js";
import {
  CollisionGroupAllocator,
  INITIAL_RATE_STEERING_PROFILE_ID,
  M6TopologyWorld,
} from "../.test-dist/vehicle/m6/m6-topology-world.js";

const receiptPath = new URL(
  "../public/receipts/jv_m6_factory_receipt.json",
  import.meta.url,
);
const b3 = await Box3D();
const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(receiptPath, "utf8"),
);

function createProductRuntime(generation) {
  const worldData = createProductWorld();
  const world = new M6TopologyWorld(
    b3,
    receipt,
    INITIAL_RATE_STEERING_PROFILE_ID,
    new CollisionGroupAllocator(-3000),
    worldData,
  );
  const vehicle = world.createVehicle(worldData.spawn, generation);
  return { worldData, world, vehicle };
}

test("accepted M6 settles, contacts and drives on the full E2R product world", () => {
  const { worldData, world, vehicle } = createProductRuntime(11);
  try {
    const offroadX = 260;
    const offroadZ = 0;
    const offroadLocalX = offroadX - 198;
    const offroadLocalZ = offroadZ + 200;
    const offroadY =
      sampleE2rOffroadHeight(offroadLocalX, offroadLocalZ, 1337) + 1.2;
    const offroadVehicle = world.createVehicle(
      { x: offroadX, y: offroadY, z: offroadZ },
      12,
    );
    offroadVehicle.setDrive({ throttle: 0, brake: 1 });
    assert.deepEqual(world.worldPhysics, {
      staticBodies: 558,
      staticShapes: 558,
      meshShapes: 1,
      scanInstalled: false,
    });
    assert.equal(worldData.boxes.length, 410);
    assert.equal(worldData.capsules.length, 147);
    assert.equal(world.counters.bodyCount, 594);
    assert.equal(world.counters.shapeCount, 576);
    assert.equal(world.counters.jointCount, 58);

    world.step(360);
    const settled = vehicle.lastTrace;
    const offroadSettled = offroadVehicle.lastTrace;
    assert.ok(settled !== null && offroadSettled !== null);
    assert.equal(settled.generation, 11);
    assert.ok(
      settled.worldContacts >= 4,
      `M6 should contact the E2R plate with all corners; contacts=${settled.worldContacts}`,
    );
    assert.ok(
      settled.chassisPosition.y > 0.8 && settled.chassisPosition.y < 1.5,
      `M6 should settle above the E2R plate; y=${settled.chassisPosition.y}`,
    );
    assert.equal(offroadSettled.generation, 12);
    assert.ok(
      Math.abs(offroadSettled.chassisPosition.x - offroadX) < 8 &&
        Math.abs(offroadSettled.chassisPosition.z - offroadZ) < 8,
      `M6 should remain on the E2R offroad chunk; position=${offroadSettled.chassisPosition.x},${offroadSettled.chassisPosition.z}`,
    );
    assert.ok(
      offroadSettled.chassisPosition.y > -10 &&
        offroadSettled.chassisPosition.y < 35,
      `M6 should settle within the E2R terrain height domain; y=${offroadSettled.chassisPosition.y}`,
    );

    vehicle.setSteering({ mode: "RELEASE" });
    vehicle.setDrive({ throttle: 0.25, brake: 0 });
    world.step(180);
    const powered = vehicle.lastTrace;
    assert.ok(powered !== null);
    assert.equal(powered.drive.mode, "THROTTLE");
    assert.ok(
      powered.drive.forwardSpeedMetersPerSecond > 0.05,
      `M6 should drive forward on E2R; speed=${powered.drive.forwardSpeedMetersPerSecond}`,
    );
    assert.ok(
      powered.chassisPosition.x > settled.chassisPosition.x + 0.05,
      `M6 should advance along local +X on E2R; dx=${powered.chassisPosition.x - settled.chassisPosition.x}`,
    );
    assert.ok(
      powered.worldContacts >= 4,
      `M6 should retain terrain contacts while driving; contacts=${powered.worldContacts}`,
    );
  } finally {
    assert.deepEqual(world.dispose(), {
      disposed: true,
      worldValidAfterDestroy: false,
    });
  }
});
