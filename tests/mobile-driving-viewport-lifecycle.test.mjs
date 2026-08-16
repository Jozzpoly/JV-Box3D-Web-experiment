import test from "node:test";
import assert from "node:assert/strict";
import { LongitudinalInputTimeline } from "../.test-dist/input/longitudinal-input-timeline.js";
import { PointerAnalogDriveAdapter } from "../.test-dist/input/pointer-analog-drive-adapter.js";
import { PointerSteeringJoystickAdapter } from "../.test-dist/input/pointer-steering-joystick-adapter.js";
import { SteeringPositionTimeline } from "../.test-dist/input/steering-position-timeline.js";

class FakePedal extends EventTarget {
  captures = new Set();
  setPointerCapture(id) { this.captures.add(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  getBoundingClientRect() { return { height: 120 }; }
}

class FakeSteering extends EventTarget {
  captures = new Set();
  setPointerCapture(id) { this.captures.add(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  getBoundingClientRect() { return { left: 0, width: 100 }; }
}

function pointer(type, id, x, y) {
  const event = new Event(type, { cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: id },
    button: { value: 0 },
    clientX: { value: x },
    clientY: { value: y },
  });
  return event;
}

test("orientation change releases held analog pedal without resetting D/R", () => {
  let now = 0;
  const windowTarget = new EventTarget();
  const documentTarget = new EventTarget();
  const throttle = new FakePedal();
  const brake = new FakePedal();
  const direction = new EventTarget();
  const timeline = new LongitudinalInputTimeline(0);
  const directions = [];
  const adapter = new PointerAnalogDriveAdapter({
    windowTarget,
    documentTarget,
    isDocumentHidden: () => false,
    timeline,
    controls: { throttle, brake, direction },
    now: () => now,
    onDirectionChange: value => directions.push(value),
  });

  direction.dispatchEvent(new Event("click", { cancelable: true }));
  throttle.dispatchEvent(pointer("pointerdown", 1, 0, 100));
  now = 1;
  throttle.dispatchEvent(pointer("pointermove", 1, 0, 30));
  now = 3;
  windowTarget.dispatchEvent(new Event("orientationchange"));

  const active = timeline.consumeInterval(0, 10);
  assert.ok(active.integratedThrottleMs < 0);
  assert.equal(timeline.consumeInterval(10, 20).command.throttle, 0);
  assert.equal(directions.at(-1), "R");
  assert.equal(throttle.captures.size, 0);
  adapter.dispose();
});

test("fullscreen change self-centers an active steering gesture", () => {
  let now = 0;
  const windowTarget = new EventTarget();
  const documentTarget = new EventTarget();
  const target = new FakeSteering();
  const timeline = new SteeringPositionTimeline(0);
  const adapter = new PointerSteeringJoystickAdapter({
    windowTarget,
    documentTarget,
    target,
    timeline,
    now: () => now,
    isDocumentHidden: () => false,
  });

  target.dispatchEvent(pointer("pointerdown", 7, 0, 0));
  now = 3;
  documentTarget.dispatchEvent(new Event("fullscreenchange"));

  const sample = timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { mode: "POSITION", value: 0 });
  assert.equal(target.captures.size, 0);
  adapter.dispose();
});
