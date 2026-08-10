import test from "node:test";
import assert from "node:assert/strict";
import Box3D from "box3d.js/inline";
import { FixedStepClock } from "../.test-dist/core/fixed-step-clock.js";
import { SteeringInputTimeline } from "../.test-dist/input/steering-input-timeline.js";
import {
  INITIAL_RATE_STEERING_PROFILE_ID,
  M6TopologyWorld,
  RATE_STEERING_PROFILES,
} from "../.test-dist/vehicle/m6/m6-topology-world.js";

const FIXED_STEP_MS = 1000 / 60;
const FIXED_DT = 1 / 60;
const LEAD_CAP = 0.008;
const TAP_LENGTHS = [0.5, 1, 2, 3, 6];

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
    maxDriveSpeed: 40,
    maxDriveTorque: 320,
    driveTaperStart: 0.6,
    brakeTorque: 650,
    coastTorque: 8,
    allWheelDrive: true,
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
      fixedDt: FIXED_DT,
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

function createSettled(profileId = INITIAL_RATE_STEERING_PROFILE_ID) {
  const world = new M6TopologyWorld(b3, receiptFixture(), profileId);
  const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 1);
  world.step(300);
  vehicle.setSteering({ mode: "RELEASE" });
  world.step(1);
  return { world, vehicle };
}

function captureWithoutPhysics(vehicle, command, stepIndex) {
  vehicle.setSteering(command);
  vehicle.beforeStep();
  return vehicle.captureTrace(stepIndex, 0, 0);
}

function buildFrameTimes(frameStepMs, endMs) {
  const times = [0];
  for (let time = frameStepMs; time < endMs; time += frameStepMs) {
    times.push(time);
  }
  times.push(endMs);
  return times;
}

function stableNumber(value) {
  return value === null ? null : Number(value.toFixed(12));
}

function traceReceipt(trace) {
  return {
    command: trace.command,
    actuator: trace.steeringActuator,
    edge: trace.steering.handsOnEdge,
    commandedRack: stableNumber(trace.steering.commandedRack),
    targetTranslation: stableNumber(trace.steering.targetTranslation),
    springEnabled: trace.steering.springEnabled,
    requestedMotorSpeed: stableNumber(trace.steering.requestedMotorSpeed),
  };
}

test("F5 exposes four explicit unapproved RATE profiles", () => {
  assert.deepEqual(
    RATE_STEERING_PROFILES.map((profile) => ({
      id: profile.id,
      rate: profile.rackRateMetersPerSecond,
      lead: profile.maxTargetLeadMeters,
      approved: profile.productDefaultApproved,
    })),
    [
      { id: "precision_0_06", rate: 0.06, lead: LEAD_CAP, approved: false },
      { id: "low_0_12", rate: 0.12, lead: LEAD_CAP, approved: false },
      { id: "reference_0_21", rate: 0.21, lead: LEAD_CAP, approved: false },
      { id: "high_0_36", rate: 0.36, lead: LEAD_CAP, approved: false },
    ],
  );
  assert.equal(INITIAL_RATE_STEERING_PROFILE_ID, "reference_0_21");
});

test("F5 blocked-rack matrix integrates 0.5/1/2/3/6-step taps across all profiles", () => {
  const byDuration = new Map(TAP_LENGTHS.map((duration) => [duration, []]));

  for (const profile of RATE_STEERING_PROFILES) {
    const { world, vehicle } = createSettled(profile.id);
    try {
      const deltas = [];
      for (const duration of TAP_LENGTHS) {
        captureWithoutPhysics(vehicle, { mode: "RELEASE" }, 10_000);
        let trace = null;
        const fullSteps = Math.floor(duration);
        const fractional = duration - fullSteps;
        for (let index = 0; index < fullSteps; index += 1) {
          trace = captureWithoutPhysics(
            vehicle,
            { mode: "RATE", value: 1 },
            10_001 + index,
          );
          assert.equal(
            trace.steering.handsOnEdge,
            index === 0 ? "ENGAGE" : "NONE",
          );
        }
        if (fractional > 0) {
          trace = captureWithoutPhysics(
            vehicle,
            { mode: "RATE", value: fractional },
            10_100,
          );
          assert.equal(trace.steering.handsOnEdge, "ENGAGE");
        }
        assert.ok(trace !== null);
        assert.notEqual(trace.steering.commandedRack, null);
        const delta =
          trace.steering.commandedRack - trace.steering.liveRackTranslation;
        const expected = Math.min(
          duration * profile.rackRateMetersPerSecond * FIXED_DT,
          profile.maxTargetLeadMeters,
        );
        close(delta, expected, 1e-10, `${profile.id} ${duration}-step delta`);
        assert.equal(trace.steering.targetTranslation, trace.steering.commandedRack);
        assert.equal(trace.steering.springEnabled, true);
        assert.equal(trace.steeringActuator, "RATE");
        assert.ok(Math.abs(delta) <= profile.maxTargetLeadMeters + 1e-12);
        deltas.push(delta);
        byDuration.get(duration).push(delta);
      }

      for (let index = 1; index < deltas.length; index += 1) {
        assert.ok(deltas[index] + 1e-12 >= deltas[index - 1]);
      }
    } finally {
      world.dispose();
    }
  }

  for (const duration of TAP_LENGTHS) {
    const deltas = byDuration.get(duration);
    for (let index = 1; index < deltas.length; index += 1) {
      assert.ok(deltas[index] + 1e-12 >= deltas[index - 1]);
    }
  }
});

test("F1 signed-time sub-frame tap maps exactly into physical rack-space", () => {
  const timeline = new SteeringInputTimeline(0);
  const pressAt = 2;
  timeline.enqueueButton("LEFT", true, pressAt, "f5-test");
  timeline.enqueueButton(
    "LEFT",
    false,
    pressAt + FIXED_STEP_MS / 2,
    "f5-test",
  );
  const sample = timeline.consumeInterval(0, FIXED_STEP_MS);
  assert.equal(sample.command.mode, "RATE");
  close(sample.command.value, 0.5, 1e-12, "signed-time RATE value");

  const { world, vehicle } = createSettled("reference_0_21");
  try {
    const trace = captureWithoutPhysics(vehicle, sample.command, 20_000);
    assert.notEqual(trace.steering.commandedRack, null);
    close(
      trace.steering.commandedRack - trace.steering.liveRackTranslation,
      0.5 * 0.21 * FIXED_DT,
      1e-10,
      "sub-frame rack delta",
    );
  } finally {
    world.dispose();
  }
});

test("RATE engage, reversal and RELEASE rebase without hidden centering", () => {
  const { world, vehicle } = createSettled("reference_0_21");
  try {
    const live = vehicle.lastTrace.rackTranslation;
    const first = captureWithoutPhysics(
      vehicle,
      { mode: "RATE", value: 1 },
      30_000,
    );
    assert.equal(first.steering.handsOnEdge, "ENGAGE");
    close(
      first.steering.commandedRack - live,
      0.21 * FIXED_DT,
      1e-10,
      "engage delta",
    );

    const second = captureWithoutPhysics(
      vehicle,
      { mode: "RATE", value: 1 },
      30_001,
    );
    assert.equal(second.steering.handsOnEdge, "NONE");
    close(
      second.steering.commandedRack - live,
      2 * 0.21 * FIXED_DT,
      1e-10,
      "continued delta",
    );

    const reversed = captureWithoutPhysics(
      vehicle,
      { mode: "RATE", value: -1 },
      30_002,
    );
    assert.equal(reversed.steering.handsOnEdge, "REVERSE");
    close(
      reversed.steering.commandedRack - live,
      -0.21 * FIXED_DT,
      1e-10,
      "reversal rebased delta",
    );

    vehicle.setSteering({ mode: "RELEASE" });
    world.step(30);
    const released = vehicle.lastTrace;
    assert.equal(released.command.mode, "RELEASE");
    assert.equal(released.steeringActuator, "OFF");
    assert.equal(released.steering.handsOn, false);
    assert.equal(released.steering.handsOnEdge, "NONE");
    assert.equal(released.steering.commandedRack, null);
    assert.equal(released.steering.targetTranslation, null);
    assert.equal(released.steering.springEnabled, false);
    assert.equal(released.steering.requestedMotorSpeed, 0);

    const reengagedLive = released.rackTranslation;
    const reengaged = captureWithoutPhysics(
      vehicle,
      { mode: "RATE", value: 1 },
      30_100,
    );
    assert.equal(reengaged.steering.handsOnEdge, "ENGAGE");
    close(
      reengaged.steering.commandedRack - reengagedLive,
      0.21 * FIXED_DT,
      1e-10,
      "re-engage rebased delta",
    );
  } finally {
    world.dispose();
  }
});

test("RATE is left/right symmetric and clamps at physical rack travel", () => {
  function firstDelta(value) {
    const { world, vehicle } = createSettled("high_0_36");
    try {
      const trace = captureWithoutPhysics(
        vehicle,
        { mode: "RATE", value },
        40_000,
      );
      return {
        delta:
          trace.steering.commandedRack - trace.steering.liveRackTranslation,
        motor: trace.steering.requestedMotorSpeed,
      };
    } finally {
      world.dispose();
    }
  }

  const left = firstDelta(1);
  const right = firstDelta(-1);
  close(left.delta, -right.delta, 1e-10, "left/right target symmetry");
  close(left.motor, -right.motor, 1e-9, "left/right motor symmetry");

  const { world, vehicle } = createSettled("high_0_36");
  try {
    vehicle.setSteering({ mode: "POSITION", value: 1 });
    world.step(240);
    const positioned = vehicle.lastTrace;
    assert.ok(
      positioned.rackTranslation > world.config.rackTravel - LEAD_CAP,
      `rack did not approach positive travel: ${positioned.rackTranslation}`,
    );

    const outward = captureWithoutPhysics(
      vehicle,
      { mode: "RATE", value: 1 },
      40_100,
    );
    assert.notEqual(outward.steering.commandedRack, null);
    close(
      outward.steering.commandedRack,
      world.config.rackTravel,
      1e-10,
      "positive rack travel clamp",
    );
    assert.ok(
      outward.steering.commandedRack - outward.steering.liveRackTranslation <=
        LEAD_CAP + 1e-12,
    );
  } finally {
    world.dispose();
  }
});

test("identical timestamped input produces identical F5 traces across render cadences", () => {
  function simulate(frameTimes) {
    const { world, vehicle } = createSettled("reference_0_21");
    try {
      const timeline = new SteeringInputTimeline(0);
      timeline.enqueueButton("LEFT", true, 7, "recording");
      timeline.enqueueButton("LEFT", false, 26, "recording");
      timeline.enqueueButton("RIGHT", true, 44, "recording");
      timeline.enqueueButton("RIGHT", false, 83, "recording");
      timeline.enqueueButton("LEFT", true, 101, "recording");
      timeline.enqueueReleaseAll(119, "VISIBILITY_HIDDEN", "recording");

      const clock = new FixedStepClock(0, {
        fixedStepMs: FIXED_STEP_MS,
        maxCatchUpSteps: 12,
        maxFrameDeltaMs: 250,
      });
      const traces = [];
      let stepIndex = 50_000;

      for (const frameTime of frameTimes) {
        clock.advance(
          frameTime,
          (step) => {
            const sample = timeline.consumeInterval(
              step.startTimeMs,
              step.endTimeMs,
            );
            traces.push(
              traceReceipt(
                captureWithoutPhysics(vehicle, sample.command, stepIndex++),
              ),
            );
          },
          (drop) => timeline.skipInterval(drop.startTimeMs, drop.endTimeMs),
        );
      }
      return traces;
    } finally {
      world.dispose();
    }
  }

  const baseline = simulate(buildFrameTimes(1000 / 60, 200));
  for (const fps of [15, 30, 120]) {
    assert.deepEqual(simulate(buildFrameTimes(1000 / fps, 200)), baseline);
  }
  assert.deepEqual(
    simulate([0, 8, 24, 72, 81, 123, 167, 200]),
    baseline,
  );
});

test("events inside a dropped gap cannot leave a stored RATE target", () => {
  const { world, vehicle } = createSettled("reference_0_21");
  try {
    const timeline = new SteeringInputTimeline(0);
    timeline.enqueueButton("LEFT", true, 10, "recording");
    timeline.enqueueButton("LEFT", false, 30, "recording");
    const clock = new FixedStepClock(0, {
      fixedStepMs: 10,
      maxCatchUpSteps: 4,
      maxFrameDeltaMs: 20,
    });
    const traces = [];
    let stepIndex = 60_000;

    const report = clock.advance(
      100,
      (step) => {
        const sample = timeline.consumeInterval(
          step.startTimeMs,
          step.endTimeMs,
        );
        traces.push(
          captureWithoutPhysics(vehicle, sample.command, stepIndex++),
        );
      },
      (drop) => timeline.skipInterval(drop.startTimeMs, drop.endTimeMs),
    );

    assert.equal(report.droppedTimeMs, 80);
    assert.equal(traces.length, 2);
    for (const trace of traces) {
      assert.equal(trace.command.mode, "RELEASE");
      assert.equal(trace.steeringActuator, "OFF");
      assert.equal(trace.steering.commandedRack, null);
      assert.equal(trace.steering.targetTranslation, null);
      assert.equal(trace.steering.springEnabled, false);
      assert.equal(trace.steering.requestedMotorSpeed, 0);
    }
  } finally {
    world.dispose();
  }
});

test("profile switch and destroy/rebuild preserve explicit F5 identity", () => {
  let generation = 1;
  for (const profile of RATE_STEERING_PROFILES) {
    const world = new M6TopologyWorld(b3, receiptFixture(), profile.id);
    try {
      const vehicle = world.createVehicle(
        { x: 0, y: 1.2, z: 0 },
        generation,
      );
      world.step(60);
      const trace = captureWithoutPhysics(
        vehicle,
        { mode: "RATE", value: 1 },
        70_000 + generation,
      );
      assert.equal(world.rateProfile.id, profile.id);
      assert.equal(trace.generation, generation);
      assert.equal(trace.steering.profileId, profile.id);
      assert.equal(
        trace.steering.rackRateMetersPerSecond,
        profile.rackRateMetersPerSecond,
      );
      assert.equal(
        trace.steering.maxTargetLeadMeters,
        profile.maxTargetLeadMeters,
      );
    } finally {
      assert.deepEqual(world.dispose(), {
        disposed: true,
        worldValidAfterDestroy: false,
      });
    }
    generation += 1;
  }
});
