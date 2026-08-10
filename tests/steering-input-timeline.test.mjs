import test from "node:test";
import assert from "node:assert/strict";
import { SteeringInputTimeline } from "../.test-dist/input/steering-input-timeline.js";

test("sub-frame tap becomes a proportional RATE command instead of disappearing", () => {
  const timeline = new SteeringInputTimeline(0);
  timeline.enqueueButton("LEFT", true, 4, "test");
  timeline.enqueueButton("LEFT", false, 10, "test");

  const sample = timeline.consumeInterval(0, 20);
  assert.deepEqual(sample.command, { mode: "RATE", value: 0.3 });
  assert.equal(sample.leftPressedAtEnd, false);
  assert.deepEqual(timeline.consumeInterval(20, 40).command, { mode: "RELEASE" });
});

test("events at a fixed-step boundary apply to the following interval", () => {
  const timeline = new SteeringInputTimeline(0);
  timeline.enqueueButton("LEFT", true, 20, "test");

  assert.deepEqual(timeline.consumeInterval(0, 20).command, { mode: "RELEASE" });
  assert.deepEqual(timeline.consumeInterval(20, 40).command, { mode: "RATE", value: 1 });
});

test("overlapping reversal has deterministic signed-time integration", () => {
  const timeline = new SteeringInputTimeline(0);
  timeline.enqueueButton("LEFT", true, 0, "test");
  timeline.enqueueButton("RIGHT", true, 5, "test");
  timeline.enqueueButton("LEFT", false, 10, "test");
  timeline.enqueueButton("RIGHT", false, 20, "test");

  const sample = timeline.consumeInterval(0, 20);
  assert.deepEqual(sample.command, { mode: "RATE", value: -0.25 });
  assert.equal(sample.integratedDirectionMs, -5);
});

test("release-all clears active state from its timestamp onward", () => {
  const timeline = new SteeringInputTimeline(0);
  timeline.enqueueButton("RIGHT", true, 0, "test");
  timeline.enqueueReleaseAll(7, "BLUR", "test");

  const sample = timeline.consumeInterval(0, 14);
  assert.deepEqual(sample.command, { mode: "RATE", value: -0.5 });
  assert.equal(sample.rightPressedAtEnd, false);
});

test("same-timestamp events are ordered by insertion sequence", () => {
  const timeline = new SteeringInputTimeline(0);
  timeline.enqueueButton("LEFT", true, 0, "test");
  timeline.enqueueButton("RIGHT", true, 0, "test");
  timeline.enqueueButton("LEFT", false, 0, "test");

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { mode: "RATE", value: -1 });
  assert.equal(sample.leftPressedAtEnd, false);
  assert.equal(sample.rightPressedAtEnd, true);
});

test("releasing one source does not cancel another source on the same side", () => {
  const timeline = new SteeringInputTimeline(0);
  timeline.enqueueButton("LEFT", true, 0, "keyboard");
  timeline.enqueueButton("LEFT", true, 2, "touch");
  timeline.enqueueButton("LEFT", false, 4, "touch");
  timeline.enqueueButton("LEFT", false, 8, "keyboard");

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { mode: "RATE", value: 0.8 });
  assert.equal(sample.leftPressedAtEnd, false);
});

test("release-all only clears controls owned by its source", () => {
  const timeline = new SteeringInputTimeline(0);
  timeline.enqueueButton("RIGHT", true, 0, "keyboard");
  timeline.enqueueButton("RIGHT", true, 2, "touch");
  timeline.enqueueReleaseAll(4, "DISPOSE", "keyboard");
  timeline.enqueueButton("RIGHT", false, 8, "touch");

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { mode: "RATE", value: -0.8 });
  assert.equal(sample.rightPressedAtEnd, false);
});
