import test from "node:test";
import assert from "node:assert/strict";
import { FixedStepClock } from "../.test-dist/core/fixed-step-clock.js";

test("fixed-step clock executes bounded deterministic intervals", () => {
  const clock = new FixedStepClock(0, {
    fixedStepMs: 10,
    maxCatchUpSteps: 4,
    maxFrameDeltaMs: 100,
  });
  const steps = [];
  clock.advance(35, (step) => steps.push(step));

  assert.deepEqual(
    steps.map((step) => [step.index, step.startTimeMs, step.endTimeMs]),
    [
      [0, 0, 10],
      [1, 10, 20],
      [2, 20, 30],
    ],
  );
});

test("fixed-step clock reports and advances across dropped backlog", () => {
  const clock = new FixedStepClock(0, {
    fixedStepMs: 10,
    maxCatchUpSteps: 2,
    maxFrameDeltaMs: 100,
  });
  const drops = [];
  const report = clock.advance(55, () => {}, (drop) => drops.push(drop));

  assert.equal(report.executedSteps, 2);
  assert.equal(report.droppedTimeMs, 30);
  assert.equal(report.simulationTimeMs, 50);
  assert.deepEqual(drops, [{ startTimeMs: 20, endTimeMs: 50, durationMs: 30 }]);
});

test("clamped long frame gap advances the dropped timeline before simulating the accepted tail", () => {
  const clock = new FixedStepClock(0, {
    fixedStepMs: 10,
    maxCatchUpSteps: 4,
    maxFrameDeltaMs: 20,
  });
  const steps = [];
  const drops = [];
  const report = clock.advance(55, (step) => steps.push(step), (drop) => drops.push(drop));

  assert.equal(report.droppedTimeMs, 35);
  assert.deepEqual(drops, [{ startTimeMs: 0, endTimeMs: 35, durationMs: 35 }]);
  assert.deepEqual(steps.map((step) => [step.startTimeMs, step.endTimeMs]), [[35, 45], [45, 55]]);
  assert.equal(report.simulationTimeMs, 55);
});
