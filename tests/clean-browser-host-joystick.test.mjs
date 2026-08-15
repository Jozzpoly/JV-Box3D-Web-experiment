import test from "node:test";
import assert from "node:assert/strict";
import { CleanBrowserHost } from "../.test-dist/app/clean-browser-host.js";

class FakeEventTarget {
  listeners = new Map();

  addEventListener(type, listener) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({
        pointerId: 0,
        button: 0,
        clientX: 50,
        code: "",
        repeat: false,
        preventDefault() {},
        stopPropagation() {},
        ...event,
      });
    }
  }
}

class FakePointerTarget extends FakeEventTarget {
  captured = new Set();

  setPointerCapture(pointerId) {
    this.captured.add(pointerId);
  }

  releasePointerCapture(pointerId) {
    this.captured.delete(pointerId);
  }

  hasPointerCapture(pointerId) {
    return this.captured.has(pointerId);
  }
}

class FakeJoystickTarget extends FakePointerTarget {
  getBoundingClientRect() {
    return { left: 0, width: 100 };
  }
}

class FakeAnimationFrames {
  nextHandle = 1;
  callbacks = new Map();

  request(callback) {
    const handle = this.nextHandle++;
    this.callbacks.set(handle, callback);
    return handle;
  }

  cancel(handle) {
    this.callbacks.delete(handle);
  }

  runNext(timeMs) {
    const entry = this.callbacks.entries().next().value;
    if (entry === undefined) {
      throw new Error("Missing frame callback");
    }
    const [handle, callback] = entry;
    this.callbacks.delete(handle);
    callback(timeMs);
  }
}

function controls() {
  return {
    steerLeft: new FakePointerTarget(),
    steerRight: new FakePointerTarget(),
    forward: new FakePointerTarget(),
    reverse: new FakePointerTarget(),
    brake: new FakePointerTarget(),
  };
}

test("position joystick drives steering while digital RATE input keeps explicit priority", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const animationFrames = new FakeAnimationFrames();
  const pointerControls = controls();
  const steeringJoystick = new FakeJoystickTarget();
  const observed = [];
  const joystickStates = [];
  let now = 0;

  const host = CleanBrowserHost.start({
    windowTarget,
    documentTarget,
    animationFrames,
    pointerControls,
    steeringJoystick,
    now: () => now,
    isDocumentHidden: () => false,
    onSteeringJoystickStateChange(value, active) {
      joystickStates.push({ value, active });
    },
    onStep(_step, steering) {
      observed.push(steering.command);
    },
  });

  steeringJoystick.dispatch("pointerdown", {
    pointerId: 41,
    clientX: 0,
  });
  animationFrames.runNext(0);
  now = 1000 / 60;
  animationFrames.runNext(1000 / 60);
  assert.deepEqual(observed.at(-1), { mode: "POSITION", value: 1 });

  steeringJoystick.dispatch("pointerup", {
    pointerId: 41,
    clientX: 0,
  });
  now = 1000 / 30;
  animationFrames.runNext(1000 / 30);
  assert.deepEqual(observed.at(-1), { mode: "POSITION", value: 0 });

  pointerControls.steerRight.dispatch("pointerdown", { pointerId: 42 });
  now = 50;
  animationFrames.runNext(50);
  assert.deepEqual(observed.at(-1), { mode: "RATE", value: -1 });

  assert.deepEqual(joystickStates.at(-1), { value: 0, active: false });
  host.dispose();
  assert.equal(steeringJoystick.captured.size, 0);
  assert.equal(pointerControls.steerRight.captured.size, 0);
});
