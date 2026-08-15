import test from "node:test";
import assert from "node:assert/strict";
import { LongitudinalInputTimeline } from "../.test-dist/input/longitudinal-input-timeline.js";

test("sub-frame forward tap becomes proportional throttle instead of disappearing", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueButton("FORWARD", true, 4, "test");
  timeline.enqueueButton("FORWARD", false, 10, "test");

  const sample = timeline.consumeInterval(0, 20);
  assert.deepEqual(sample.command, { throttle: 0.3, brake: 0 });
  assert.equal(sample.integratedThrottleMs, 6);
  assert.equal(sample.forwardPressedAtEnd, false);
  assert.deepEqual(timeline.consumeInterval(20, 40).command, {
    throttle: 0,
    brake: 0,
  });
});

test("events at a fixed-step boundary apply to the following interval", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueButton("FORWARD", true, 20, "test");

  assert.deepEqual(timeline.consumeInterval(0, 20).command, {
    throttle: 0,
    brake: 0,
  });
  assert.deepEqual(timeline.consumeInterval(20, 40).command, {
    throttle: 1,
    brake: 0,
  });
});

test("overlapping forward and reverse integrate deterministically", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueButton("FORWARD", true, 0, "test");
  timeline.enqueueButton("REVERSE", true, 5, "test");
  timeline.enqueueButton("FORWARD", false, 10, "test");
  timeline.enqueueButton("REVERSE", false, 20, "test");

  const sample = timeline.consumeInterval(0, 20);
  assert.deepEqual(sample.command, { throttle: -0.25, brake: 0 });
  assert.equal(sample.integratedThrottleMs, -5);
});

test("brake is integrated independently from throttle", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueButton("FORWARD", true, 0, "test");
  timeline.enqueueButton("BRAKE", true, 5, "test");
  timeline.enqueueButton("BRAKE", false, 15, "test");
  timeline.enqueueButton("FORWARD", false, 20, "test");

  const sample = timeline.consumeInterval(0, 20);
  assert.deepEqual(sample.command, { throttle: 1, brake: 0.5 });
  assert.equal(sample.integratedThrottleMs, 20);
  assert.equal(sample.integratedBrakeMs, 10);
});

test("release-all clears throttle and brake from its timestamp onward", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueButton("REVERSE", true, 0, "test");
  timeline.enqueueButton("BRAKE", true, 2, "test");
  timeline.enqueueReleaseAll(7, "BLUR", "test");

  const sample = timeline.consumeInterval(0, 14);
  assert.deepEqual(sample.command, {
    throttle: -0.5,
    brake: 5 / 14,
  });
  assert.equal(sample.reversePressedAtEnd, false);
  assert.equal(sample.brakePressedAtEnd, false);
});

test("same-timestamp longitudinal events preserve insertion order", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueButton("FORWARD", true, 0, "test");
  timeline.enqueueButton("REVERSE", true, 0, "test");
  timeline.enqueueButton("FORWARD", false, 0, "test");

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { throttle: -1, brake: 0 });
  assert.equal(sample.forwardPressedAtEnd, false);
  assert.equal(sample.reversePressedAtEnd, true);
});

test("releasing one source does not cancel another source on the same control", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueButton("FORWARD", true, 0, "keyboard");
  timeline.enqueueButton("FORWARD", true, 2, "touch");
  timeline.enqueueButton("FORWARD", false, 4, "touch");
  timeline.enqueueButton("FORWARD", false, 8, "keyboard");

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { throttle: 0.8, brake: 0 });
  assert.equal(sample.forwardPressedAtEnd, false);
});

test("release-all only clears longitudinal controls owned by its source", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueButton("FORWARD", true, 0, "keyboard");
  timeline.enqueueButton("FORWARD", true, 2, "touch");
  timeline.enqueueButton("BRAKE", true, 2, "touch");
  timeline.enqueueReleaseAll(4, "DISPOSE", "keyboard");
  timeline.enqueueButton("FORWARD", false, 8, "touch");
  timeline.enqueueButton("BRAKE", false, 8, "touch");

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { throttle: 0.8, brake: 0.6 });
  assert.equal(sample.forwardPressedAtEnd, false);
  assert.equal(sample.brakePressedAtEnd, false);
});

test("analog throttle integrates piecewise on the existing fixed-step timeline", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueAnalogThrottle(0.5, 2, "touch");
  timeline.enqueueAnalogThrottle(0, 8, "touch");

  assert.deepEqual(timeline.consumeInterval(0, 10).command, {
    throttle: 0.3,
    brake: 0,
  });
});

test("digital throttle remains authoritative while an analog source is active", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueAnalogThrottle(0.7, 0, "touch");
  timeline.enqueueButton("FORWARD", true, 2, "keyboard:w");
  timeline.enqueueButton("REVERSE", true, 4, "keyboard:s");
  timeline.enqueueButton("FORWARD", false, 6, "keyboard:w");
  timeline.enqueueButton("REVERSE", false, 8, "keyboard:s");

  const command = timeline.consumeInterval(0, 10).command;
  assert.ok(Math.abs(command.throttle - 0.28) < 1e-12);
  assert.equal(command.brake, 0);
});

test("latest active analog throttle source owns direction and previous source resumes after release", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueAnalogThrottle(0.4, 0, "touch");
  timeline.enqueueAnalogThrottle(-0.6, 2, "gamepad");
  timeline.enqueueAnalogThrottle(0, 6, "gamepad");

  const command = timeline.consumeInterval(0, 10).command;
  assert.ok(Math.abs(command.throttle) < 1e-12);
  assert.equal(command.brake, 0);
});

test("analog brake uses the strongest active source and digital brake stays authoritative", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueAnalogBrake(0.3, 0, "touch");
  timeline.enqueueAnalogBrake(0.7, 2, "gamepad");
  timeline.enqueueButton("BRAKE", true, 4, "keyboard");
  timeline.enqueueButton("BRAKE", false, 8, "keyboard");

  assert.deepEqual(timeline.consumeInterval(0, 10).command, {
    throttle: 0,
    brake: 0.74,
  });
});

test("release-all removes only the matching analog source", () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueAnalogThrottle(0.4, 0, "touch-a");
  timeline.enqueueAnalogThrottle(0.8, 2, "touch-b");
  timeline.enqueueReleaseAll(5, "BLUR", "touch-b");

  const command = timeline.consumeInterval(0, 10).command;
  assert.ok(Math.abs(command.throttle - 0.6) < 1e-12);
  assert.equal(command.brake, 0);
});
