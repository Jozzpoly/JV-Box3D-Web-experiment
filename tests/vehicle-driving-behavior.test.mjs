// Behavior tests: measured driving consequences of the exact product vehicle.
// Thresholds are deliberately player-level (km/h, metres, degrees), not
// solver-level, so they protect feel without freezing internal tuning.
import test from "node:test";
import assert from "node:assert/strict";
import {
  createSettledVehicle,
  kmh,
  yawDegrees,
} from "./helpers/headless-vehicle.mjs";

test("full throttle from rest accelerates the vehicle forward", async () => {
  const run = await createSettledVehicle();
  try {
    run.vehicle.setDrive({ throttle: 1, brake: 0 });
    const trace = run.seconds(3);
    assert.ok(kmh(trace) > 20, `expected > 20 km/h after 3 s, got ${kmh(trace).toFixed(1)}`);
  } finally {
    run.dispose();
  }
});

test("a lightly resting brake does not cancel full throttle", async () => {
  const free = await createSettledVehicle();
  const resting = await createSettledVehicle();
  try {
    free.vehicle.setDrive({ throttle: 1, brake: 0 });
    resting.vehicle.setDrive({ throttle: 1, brake: 0.05 });
    const freeSpeed = kmh(free.seconds(3));
    const restingSpeed = kmh(resting.seconds(3));
    assert.ok(
      restingSpeed > freeSpeed * 0.6,
      `throttle 1 + brake 0.05 reached ${restingSpeed.toFixed(1)} km/h vs ${freeSpeed.toFixed(1)} km/h without brake`,
    );
  } finally {
    free.dispose();
    resting.dispose();
  }
});

test("full brake beats full throttle and stops the vehicle", async () => {
  const run = await createSettledVehicle();
  try {
    run.vehicle.setDrive({ throttle: 1, brake: 0 });
    run.seconds(4);
    run.vehicle.setDrive({ throttle: 1, brake: 1 });
    const trace = run.seconds(4);
    assert.ok(Math.abs(kmh(trace)) < 2, `expected stop, got ${kmh(trace).toFixed(1)} km/h`);
  } finally {
    run.dispose();
  }
});

test("full brake from speed stops within a short distance", async () => {
  const run = await createSettledVehicle();
  try {
    run.vehicle.setDrive({ throttle: 1, brake: 0 });
    let trace = run.seconds(6);
    const startSpeed = kmh(trace);
    const startX = trace.chassisPosition.x;
    run.vehicle.setDrive({ throttle: 0, brake: 1 });
    trace = run.seconds(5);
    const distance = Math.abs(trace.chassisPosition.x - startX);
    assert.ok(startSpeed > 40, `precondition speed ${startSpeed.toFixed(1)} km/h`);
    assert.ok(Math.abs(kmh(trace)) < 1, `expected stop, got ${kmh(trace).toFixed(1)} km/h`);
    assert.ok(distance < 45, `stopping distance ${distance.toFixed(1)} m from ${startSpeed.toFixed(1)} km/h`);
  } finally {
    run.dispose();
  }
});

test("hands-off straight-line driving tracks straight", async () => {
  const run = await createSettledVehicle();
  try {
    run.vehicle.setDrive({ throttle: 1, brake: 0 });
    const start = run.seconds(0.1);
    const startZ = start.chassisPosition.z;
    const startYaw = yawDegrees(start);
    const trace = run.seconds(8);
    const lateral = Math.abs(trace.chassisPosition.z - startZ);
    const yaw = Math.abs(yawDegrees(trace) - startYaw);
    assert.ok(lateral < 4, `lateral drift ${lateral.toFixed(2)} m`);
    assert.ok(yaw < 3, `yaw drift ${yaw.toFixed(2)} deg`);
  } finally {
    run.dispose();
  }
});

test("steering input turns the vehicle in the commanded direction", async () => {
  const run = await createSettledVehicle();
  try {
    run.vehicle.setDrive({ throttle: 0.5, brake: 0 });
    run.seconds(3);
    const before = yawDegrees(run.trace);
    run.vehicle.setSteering({ mode: "POSITION", value: 0.5 });
    const trace = run.seconds(2);
    assert.ok(Math.abs(yawDegrees(trace) - before) > 15, "vehicle should yaw under steering");
  } finally {
    run.dispose();
  }
});

test("released steering does not wind itself to full lock in a corner", async () => {
  const run = await createSettledVehicle();
  try {
    run.vehicle.setDrive({ throttle: 0.5, brake: 0 });
    run.seconds(4);
    run.vehicle.setSteering({ mode: "POSITION", value: 0.6 });
    const atRelease = run.seconds(1.5).rackTranslation;
    run.vehicle.setSteering({ mode: "RELEASE" });
    const later = run.seconds(3).rackTranslation;
    const travel = run.world.config.rackTravel;
    assert.ok(
      Math.abs(later) < atRelease + 0.25 * (travel - atRelease),
      `rack drifted from ${atRelease.toFixed(4)} to ${later.toFixed(4)} m (full lock ${travel.toFixed(4)})`,
    );
  } finally {
    run.dispose();
  }
});
