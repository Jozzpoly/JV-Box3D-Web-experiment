import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Box3D from "box3d.js/inline";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import { M6TopologyWorld } from "../.test-dist/vehicle/m6/m6-topology-world.js";

const receiptPath = new URL(
  "../public/receipts/jv_m6_factory_receipt.json",
  import.meta.url,
);
const b3 = await Box3D();
const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(receiptPath, "utf8"),
);

function close(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual} vs ${expected}`,
  );
}

function createSettled(generation = 1) {
  const world = new M6TopologyWorld(b3, receipt);
  const vehicle = world.createVehicle(
    { x: 0, y: 1.2, z: 0 },
    generation,
  );
  world.step(300);
  vehicle.setSteering({ mode: "RELEASE" });
  vehicle.setDrive({ throttle: 0, brake: 0 });
  world.step(1);
  return { world, vehicle };
}

function captureWithoutPhysics(vehicle, drive, stepIndex) {
  vehicle.setDrive(drive);
  vehicle.beforeStep();
  return vehicle.captureTrace(stepIndex, 0, 0);
}

test("pinned native drive fields map into explicit wheel motor modes", () => {
  const { world, vehicle } = createSettled();
  try {
    assert.equal(world.config.maxDriveSpeed, 40);
    assert.equal(world.config.maxDriveTorque, 320);
    assert.equal(world.config.driveTaperStart, 0.6);
    assert.equal(world.config.brakeTorque, 650);
    assert.equal(world.config.coastTorque, 8);
    assert.equal(world.config.allWheelDrive, true);

    const throttle = captureWithoutPhysics(
      vehicle,
      { throttle: 0.5, brake: 0 },
      90_001,
    );
    assert.equal(throttle.drive.mode, "THROTTLE");
    assert.equal(throttle.drive.allWheelDrive, true);
    assert.equal(throttle.drive.drivenCornerCount, 4);
    close(
      throttle.drive.targetLinearSpeedMetersPerSecond,
      20,
      1e-12,
      "half-throttle target speed",
    );
    close(
      throttle.drive.targetWheelAngularSpeed,
      -20 / world.config.wheelRadius,
      1e-12,
      "half-throttle wheel target",
    );
    close(
      throttle.drive.motorTorqueCapPerWheel,
      160,
      1e-12,
      "half-throttle torque cap",
    );

    const brake = captureWithoutPhysics(
      vehicle,
      { throttle: 0.5, brake: 1 },
      90_002,
    );
    assert.equal(brake.drive.mode, "BRAKE");
    assert.equal(brake.drive.targetLinearSpeedMetersPerSecond, 0);
    assert.equal(brake.drive.targetWheelAngularSpeed, 0);
    assert.equal(brake.drive.motorTorqueCapPerWheel, 650);

    const coast = captureWithoutPhysics(
      vehicle,
      { throttle: 0, brake: 0 },
      90_003,
    );
    assert.equal(coast.drive.mode, "COAST");
    assert.equal(coast.drive.targetWheelAngularSpeed, 0);
    assert.equal(coast.drive.motorTorqueCapPerWheel, 8);
  } finally {
    world.dispose();
  }
});

test("positive throttle drives the settled M6 toward its local +X front marker", () => {
  const { world, vehicle } = createSettled(2);
  try {
    const initial = vehicle.lastTrace;
    assert.ok(initial !== null);

    vehicle.setDrive({ throttle: 0.35, brake: 0 });
    world.step(180);
    const powered = vehicle.lastTrace;
    assert.ok(powered !== null);
    assert.equal(powered.drive.mode, "THROTTLE");
    assert.ok(
      powered.drive.forwardSpeedMetersPerSecond > 0.05,
      `expected positive forward speed, got ${powered.drive.forwardSpeedMetersPerSecond}`,
    );
    assert.ok(
      powered.chassisPosition.x > initial.chassisPosition.x + 0.05,
      `expected +X displacement, got ${powered.chassisPosition.x - initial.chassisPosition.x}`,
    );
    assert.ok(powered.worldContacts >= 4);

    vehicle.setDrive({ throttle: 0, brake: 0 });
    world.step(60);
    const coast = vehicle.lastTrace;
    assert.ok(coast !== null);
    assert.equal(coast.drive.mode, "COAST");
    assert.ok(
      Math.abs(coast.drive.forwardSpeedMetersPerSecond) <=
        Math.abs(powered.drive.forwardSpeedMetersPerSecond) + 0.2,
      "coast torque must not create a new acceleration spike",
    );

    const speedBeforeBrake = Math.abs(
      coast.drive.forwardSpeedMetersPerSecond,
    );
    vehicle.setDrive({ throttle: 0, brake: 1 });
    world.step(120);
    const braked = vehicle.lastTrace;
    assert.ok(braked !== null);
    assert.equal(braked.drive.mode, "BRAKE");
    assert.equal(braked.drive.motorTorqueCapPerWheel, 650);
    assert.ok(
      Math.abs(braked.drive.forwardSpeedMetersPerSecond) <
        Math.max(0.05, speedBeforeBrake * 0.5),
      `brake did not sufficiently reduce speed: ${speedBeforeBrake} -> ${braked.drive.forwardSpeedMetersPerSecond}`,
    );
  } finally {
    world.dispose();
  }
});

test("negative throttle drives the settled M6 in reverse", () => {
  const { world, vehicle } = createSettled(3);
  try {
    const initial = vehicle.lastTrace;
    assert.ok(initial !== null);

    vehicle.setDrive({ throttle: -0.35, brake: 0 });
    world.step(180);
    const reversed = vehicle.lastTrace;
    assert.ok(reversed !== null);
    assert.equal(reversed.drive.mode, "THROTTLE");
    assert.ok(
      reversed.drive.forwardSpeedMetersPerSecond < -0.05,
      `expected negative forward speed, got ${reversed.drive.forwardSpeedMetersPerSecond}`,
    );
    assert.ok(
      reversed.chassisPosition.x < initial.chassisPosition.x - 0.05,
      `expected -X displacement, got ${reversed.chassisPosition.x - initial.chassisPosition.x}`,
    );
  } finally {
    world.dispose();
  }
});

test("same drive command sequence remains deterministic", () => {
  function run() {
    const { world, vehicle } = createSettled(7);
    try {
      vehicle.setDrive({ throttle: 0.25, brake: 0 });
      world.step(120);
      vehicle.setDrive({ throttle: 0, brake: 0 });
      world.step(30);
      vehicle.setDrive({ throttle: 0, brake: 0.6 });
      world.step(60);
      return vehicle.lastTrace;
    } finally {
      world.dispose();
    }
  }

  const first = run();
  const second = run();
  assert.ok(first !== null && second !== null);
  close(
    first.chassisPosition.x,
    second.chassisPosition.x,
    1e-10,
    "deterministic drive chassis x",
  );
  close(
    first.drive.forwardSpeedMetersPerSecond,
    second.drive.forwardSpeedMetersPerSecond,
    1e-10,
    "deterministic drive speed",
  );
  assert.deepEqual(first.drive.command, second.drive.command);
  assert.equal(first.drive.mode, second.drive.mode);
});
