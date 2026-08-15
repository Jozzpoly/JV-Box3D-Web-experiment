import test from "node:test";
import assert from "node:assert/strict";
import { SteeringPositionTimeline } from "../.test-dist/input/steering-position-timeline.js";

test("latest position before step end becomes deterministic POSITION command", () => {
  const timeline = new SteeringPositionTimeline(0);
  timeline.enqueuePosition(0.2, 2, "touch-a");
  timeline.enqueuePosition(0.65, 8, "touch-a");

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { mode: "POSITION", value: 0.65 });
  assert.equal(sample.activeSourceIdAtEnd, "touch-a");
});

test("position event at a fixed-step boundary applies to the following interval", () => {
  const timeline = new SteeringPositionTimeline(0);
  timeline.enqueuePosition(-0.4, 10, "touch");

  assert.deepEqual(timeline.consumeInterval(0, 10).command, {
    mode: "RELEASE",
  });
  assert.deepEqual(timeline.consumeInterval(10, 20).command, {
    mode: "POSITION",
    value: -0.4,
  });
});

test("most recently updated active source owns position and release falls back", () => {
  const timeline = new SteeringPositionTimeline(0);
  timeline.enqueuePosition(0.25, 0, "touch-a");
  timeline.enqueuePosition(-0.75, 2, "touch-b");
  timeline.enqueueRelease(6, "DISPOSE", "touch-b");

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { mode: "POSITION", value: 0.25 });
  assert.equal(sample.activeSourceIdAtEnd, "touch-a");
});

test("release clears only its source and empty state releases steering", () => {
  const timeline = new SteeringPositionTimeline(0);
  timeline.enqueuePosition(0.5, 0, "touch");
  timeline.enqueueRelease(5, "BLUR", "touch");

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { mode: "RELEASE" });
  assert.equal(sample.activeSourceIdAtEnd, null);
  assert.equal(sample.positionAtEnd, 0);
});

test("same-timestamp position updates use insertion order", () => {
  const timeline = new SteeringPositionTimeline(0);
  timeline.enqueuePosition(0.1, 0, "touch");
  timeline.enqueuePosition(0.9, 0, "touch");

  assert.deepEqual(timeline.consumeInterval(0, 10).command, {
    mode: "POSITION",
    value: 0.9,
  });
});

test("position values clamp and past events fail closed", () => {
  const timeline = new SteeringPositionTimeline(0);
  timeline.enqueuePosition(5, 0, "touch");

  assert.deepEqual(timeline.consumeInterval(0, 10).command, {
    mode: "POSITION",
    value: 1,
  });
  assert.throws(
    () => timeline.enqueuePosition(0, 4, "touch"),
    /consumed past/,
  );
});
