import test from "node:test";
import assert from "node:assert/strict";
import Box3D from "box3d.js/inline";
import {
  CollisionGroupAllocator,
  M6TopologyWorld,
  M6_TOPOLOGY_COUNTS,
} from "../.test-dist/vehicle/m6/m6-topology-world.js";
import { m6TopologyConfigFromReceipt } from "../.test-dist/vehicle/m6/m6-topology-config.js";

function receiptFixture() {
  const config = {
    chassisHalfExtents: [1.55, 0.35, 0.55],
    chassisDensity: 200,
    cgVerticalOffset: 0.15,
    axleHalfSpacing: 1.25,
    trackHalfWidth: 1.05,
    restDrop: 0.55,
    knuckleMass: 28,
    armMass: 5,
    rackMass: 5,
    rackHalfWidth: 0.45,
    rackServoForce: 12000,
    rackServoSpeedGain: 12,
    rackServoMaxSpeed: 1.2,
    rackFrictionBase: 40,
    rackFrictionLoadCoeff: 0.1,
    steeringHertz: 14,
    steeringDampingRatio: 1,
    wheelDensity: 80,
    wheelFriction: 1.25,
    wheelRollingResistance: 0.02,
    wheelEnvelope: { mode: 3 },
    suspensionHertz: 6,
    suspensionDampingRatio: 0.7,
    frontSuspensionScale: 1,
    rearSuspensionScale: 1,
    reboundTravel: 0.28,
    compressionTravel: 0.42,
    suspensionPreloadFront: 0.07,
    suspensionPreloadRear: 0.07,
    maxSteeringAngleDegrees: 32,
    rackCenteringHertz: 0,
    uprightAssist: false,
    wishbone: {
      uprightHalfHeight: 0.18,
      kingpinOffset: 0.14,
      casterDeg: 5,
      kingpinInclinationDeg: 7,
      upperArmLength: 0.34,
      lowerArmLength: 0.46,
      armHalfSpread: 0.24,
      steeringArmBack: 0.17,
      ackermannTrapezoid: true,
      ackermannFraction: 0.6,
      coiloverTopHeight: 0.42,
      coiloverTopInboard: 0.12,
      restArmDroopDeg: 15,
    },
  };
  return {
    config,
    derived: {
      rackTravel: 0.0752846599,
      wheelRadius: 0.514062464,
      wheelWidth: 0.4375,
      terrainCategoryBitsHex: "0x2",
    },
    solver: {
      gravity: [0, -10, 0],
      fixedDt: 1 / 60,
      substeps: 4,
      contactHertz: 30,
      contactDampingRatio: 10,
      contactSpeed: 3,
      enableContinuous: false,
      workerCount: 0,
    },
    activeFeatures: {
      frontRigType: 1,
      rearRigType: 1,
      wheelEnvelopeMode: 3,
      rackCenteringAssistEnabled: false,
      uprightAssistEnabled: false,
    },
  };
}

const b3 = await Box3D();

function close(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual} vs ${expected}`,
  );
}

test("F4 config is derived from the F3 receipt and rejects artificial assists", () => {
  const receipt = receiptFixture();
  const config = m6TopologyConfigFromReceipt(receipt);
  assert.equal(config.rackTravel, receipt.derived.rackTravel);
  assert.equal(config.wheelRadius, receipt.derived.wheelRadius);
  assert.equal(config.wheelWidth, receipt.derived.wheelWidth);
  assert.equal(config.rackCenteringHertz, 0);
  assert.equal(config.uprightAssist, false);

  const rejected = structuredClone(receipt);
  rejected.activeFeatures.rackCenteringAssistEnabled = true;
  assert.throws(
    () => m6TopologyConfigFromReceipt(rejected),
    /optional assists/,
  );
});

test("one current M6 vehicle owns exactly 18 bodies, 29 joints and 9 shapes", () => {
  const world = new M6TopologyWorld(b3, receiptFixture());
  try {
    const vehicle = world.createVehicle(
      { x: 0, y: 1.2, z: 0 },
      1,
    );
    assert.deepEqual(vehicle.topologyCounts, M6_TOPOLOGY_COUNTS);
    assert.equal(vehicle.collisionGroupIndex, -1000);
    assert.equal(world.counters.bodyCount, 19);
    assert.equal(world.counters.shapeCount, 10);
    assert.equal(world.counters.jointCount, 29);
  } finally {
    world.dispose();
  }
});

test("two M6 instances use unique negative groups, settle, and contact tagged terrain", () => {
  const world = new M6TopologyWorld(
    b3,
    receiptFixture(),
    new CollisionGroupAllocator(-2000),
  );
  try {
    const left = world.createVehicle(
      { x: 0, y: 1.2, z: -3 },
      3,
    );
    const right = world.createVehicle(
      { x: 0, y: 1.2, z: 3 },
      3,
    );
    assert.equal(left.collisionGroupIndex, -2000);
    assert.equal(right.collisionGroupIndex, -2001);
    assert.notEqual(
      left.collisionGroupIndex,
      right.collisionGroupIndex,
    );
    assert.equal(world.counters.bodyCount, 37);
    assert.equal(world.counters.shapeCount, 19);
    assert.equal(world.counters.jointCount, 58);

    world.step(600);
    const leftTrace = left.lastTrace;
    const rightTrace = right.lastTrace;
    assert.ok(leftTrace !== null && rightTrace !== null);
    assert.equal(leftTrace.generation, 3);
    assert.equal(
      leftTrace.wheelBackendId,
      "legacy_m6_split_sphere_sidewall",
    );
    assert.equal(leftTrace.corners.length, 4);
    assert.ok(leftTrace.worldContacts >= 8);
    assert.ok(
      leftTrace.chassisPosition.y > 0.8 &&
        leftTrace.chassisPosition.y < 1.4,
    );
    assert.ok(
      rightTrace.chassisPosition.y > 0.8 &&
        rightTrace.chassisPosition.y < 1.4,
    );
  } finally {
    world.dispose();
  }
});

test("POSITION moves the physical rack; RELEASE and RATE leave centering actuation off", () => {
  const world = new M6TopologyWorld(b3, receiptFixture());
  try {
    const vehicle = world.createVehicle(
      { x: 0, y: 1.2, z: 0 },
      1,
    );
    world.step(300);

    vehicle.setSteering({ mode: "POSITION", value: 0.5 });
    world.step(120);
    const positioned = vehicle.lastTrace;
    assert.ok(positioned !== null);
    assert.equal(positioned.steeringActuator, "POSITION");
    assert.ok(positioned.rackTranslation > 0.02);

    vehicle.setSteering({ mode: "RELEASE" });
    world.step(1);
    const released = vehicle.lastTrace;
    assert.ok(released !== null);
    assert.equal(released.command.mode, "RELEASE");
    assert.equal(released.steeringActuator, "OFF");
    assert.ok(Math.abs(released.rackTranslation) > 0.005);

    vehicle.setSteering({ mode: "RATE", value: -0.4 });
    world.step(1);
    const reserved = vehicle.lastTrace;
    assert.ok(reserved !== null);
    assert.equal(reserved.command.mode, "RATE");
    assert.equal(reserved.steeringActuator, "RATE_RESERVED");
    assert.ok(Math.abs(reserved.rackTranslation) > 0.005);
  } finally {
    world.dispose();
  }
});

test("same receipt and commands produce deterministic F4 trace values", () => {
  function run() {
    const world = new M6TopologyWorld(b3, receiptFixture());
    try {
      const vehicle = world.createVehicle(
        { x: 0, y: 1.2, z: 0 },
        7,
      );
      world.step(240);
      vehicle.setSteering({ mode: "POSITION", value: -0.25 });
      world.step(90);
      vehicle.setSteering({ mode: "RELEASE" });
      world.step(30);
      return vehicle.lastTrace;
    } finally {
      world.dispose();
    }
  }

  const first = run();
  const second = run();
  assert.ok(first !== null && second !== null);
  assert.equal(first.stepIndex, second.stepIndex);
  assert.equal(first.command.mode, second.command.mode);
  close(
    first.rackTranslation,
    second.rackTranslation,
    1e-10,
    "rack translation",
  );
  close(
    first.chassisPosition.x,
    second.chassisPosition.x,
    1e-10,
    "chassis x",
  );
  close(
    first.chassisPosition.y,
    second.chassisPosition.y,
    1e-10,
    "chassis y",
  );
  close(
    first.chassisPosition.z,
    second.chassisPosition.z,
    1e-10,
    "chassis z",
  );
});

test("destroy and rebuild releases the complete F4 world without leaked ownership", () => {
  const first = new M6TopologyWorld(b3, receiptFixture());
  first.createVehicle({ x: 0, y: 1.2, z: 0 }, 1);
  first.step(120);
  assert.deepEqual(first.dispose(), {
    disposed: true,
    worldValidAfterDestroy: false,
  });
  assert.deepEqual(first.dispose(), {
    disposed: true,
    worldValidAfterDestroy: false,
  });

  const second = new M6TopologyWorld(b3, receiptFixture());
  try {
    const rebuilt = second.createVehicle(
      { x: 0, y: 1.2, z: 0 },
      2,
    );
    second.step(120);
    assert.equal(rebuilt.lastTrace?.generation, 2);
    assert.equal(second.counters.bodyCount, 19);
    assert.equal(second.counters.jointCount, 29);
  } finally {
    second.dispose();
  }
});
