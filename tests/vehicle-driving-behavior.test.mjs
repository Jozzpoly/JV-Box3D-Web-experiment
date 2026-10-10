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
    const v = startSpeed / 3.6;
    const deceleration = (v * v) / (2 * distance);
    assert.ok(
      deceleration > 5,
      `average braking ${deceleration.toFixed(1)} m/s^2 (${distance.toFixed(1)} m from ${startSpeed.toFixed(1)} km/h)`,
    );
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
    // ~6 s of full throttle covers ~0 -> 85 km/h and roughly 70 m.
    const trace = run.seconds(6);
    const lateral = Math.abs(trace.chassisPosition.z - startZ);
    const yaw = Math.abs(yawDegrees(trace) - startYaw);
    assert.ok(lateral < 2, `lateral drift ${lateral.toFixed(2)} m at ${kmh(trace).toFixed(0)} km/h`);
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

test("the product vehicle reaches 50 km/h briskly from rest", async () => {
  const run = await createSettledVehicle();
  try {
    run.vehicle.setDrive({ throttle: 1, brake: 0 });
    let reached = null;
    for (let step = 1; step <= 60 * 8 && reached === null; step += 1) {
      if (kmh(run.seconds(1 / 60)) >= 50) {
        reached = step / 60;
      }
    }
    assert.ok(reached !== null && reached < 4.5, `0-50 km/h took ${reached} s`);
  } finally {
    run.dispose();
  }
});

test("live drive tuning changes acceleration and braking", async () => {
  const { setM6DriveTuning, resetM6DriveTuning } = await import("../.test-dist/vehicle/m6/m6-drive-tuning.js");
  const speedAfter = async (torqueScale, seconds = 2) => {
    setM6DriveTuning({ torqueScale, brakeScale: 1 });
    const run = await createSettledVehicle();
    try {
      run.vehicle.setDrive({ throttle: 1, brake: 0 });
      return kmh(run.seconds(seconds));
    } finally {
      run.dispose();
    }
  };
  const stopDistance = async (brakeScale) => {
    setM6DriveTuning({ torqueScale: 1.5, brakeScale });
    const run = await createSettledVehicle();
    try {
      run.vehicle.setDrive({ throttle: 1, brake: 0 });
      let trace = run.seconds(3);
      const x0 = trace.chassisPosition.x;
      run.vehicle.setDrive({ throttle: 0, brake: 1 });
      trace = run.seconds(4);
      return Math.abs(trace.chassisPosition.x - x0);
    } finally {
      run.dispose();
    }
  };
  try {
    const gentle = await speedAfter(1);
    const strong = await speedAfter(2);
    assert.ok(strong > gentle * 1.6, `2x power ${strong.toFixed(1)} vs 1x ${gentle.toFixed(1)} km/h after 2 s`);
    const soft = await stopDistance(0.7);
    const firm = await stopDistance(1.3);
    assert.ok(firm < soft * 0.85, `brake 1.3x stops in ${firm.toFixed(1)} m vs 0.7x ${soft.toFixed(1)} m`);
  } finally {
    resetM6DriveTuning();
  }
});
