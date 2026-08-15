import test from "node:test";
import assert from "node:assert/strict";
import {
  clearJvRuntimePerformanceFrame,
  publishJvRuntimePerformanceFrame,
  readJvRuntimePerformanceFrame,
} from "../.test-dist/runtime/runtime-performance-frame.js";

test("runtime performance keeps an immutable last presented-frame snapshot", () => {
  clearJvRuntimePerformanceFrame();
  assert.equal(readJvRuntimePerformanceFrame(), null);

  const frame = {
    browserFrameDeltaMs: 33.3,
    presentationIntervalMs: 16.7,
    executedSteps: 2,
    droppedTimeMs: 0,
    physicsStepMs: 4.5,
    traceCaptureMs: 1.2,
    renderUiMs: 7.8,
  };
  publishJvRuntimePerformanceFrame(frame);
  const stored = readJvRuntimePerformanceFrame();
  assert.deepEqual(stored, frame);
  assert.equal(Object.isFrozen(stored), true);

  clearJvRuntimePerformanceFrame();
  assert.equal(readJvRuntimePerformanceFrame(), null);
});
