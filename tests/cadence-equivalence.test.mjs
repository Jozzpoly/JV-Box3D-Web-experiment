import test from "node:test";
import assert from "node:assert/strict";
import { FixedStepClock } from "../.test-dist/core/fixed-step-clock.js";
import { SteeringInputTimeline } from "../.test-dist/input/steering-input-timeline.js";

const FIXED_STEP_MS = 1000 / 60;

function buildFrameTimes(frameStepMs, endMs) {
  const times = [0];
  for (let time = frameStepMs; time < endMs; time += frameStepMs) {
    times.push(time);
  }
  times.push(endMs);
  return times;
}

function simulate(frameTimes) {
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
  const commands = [];

  for (const frameTime of frameTimes) {
    clock.advance(
      frameTime,
      (step) => commands.push(timeline.consumeInterval(step.startTimeMs, step.endTimeMs).command),
      (drop) => timeline.skipInterval(drop.startTimeMs, drop.endTimeMs),
    );
  }
  return commands;
}

test("same event timeline produces the same fixed-step commands at 15/30/60/120 FPS", () => {
  const baseline = simulate(buildFrameTimes(1000 / 60, 200));
  for (const fps of [15, 30, 120]) {
    assert.deepEqual(simulate(buildFrameTimes(1000 / fps, 200)), baseline);
  }
});

test("irregular render cadence stays equivalent while catch-up remains within budget", () => {
  const baseline = simulate(buildFrameTimes(1000 / 60, 200));
  const irregular = [0, 8, 24, 72, 81, 123, 167, 200];
  assert.deepEqual(simulate(irregular), baseline);
});
