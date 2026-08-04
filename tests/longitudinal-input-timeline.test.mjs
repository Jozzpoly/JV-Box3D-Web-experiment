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
