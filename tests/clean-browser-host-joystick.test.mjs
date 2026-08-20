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
        clientY: 50,
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
    return { left: 0, top: 0, width: 100, height: 100 };
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

test("direct wheel rotation drives POSITION while digital RATE input keeps explicit priority", () => {
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

  // Grabbing the right edge owns steering without jumping from center.
  steeringJoystick.dispatch("pointerdown", {
    pointerId: 41,
    clientX: 100,
    clientY: 50,
  });
  animationFrames.runNext(0);
  now = 1000 / 60;
  animationFrames.runNext(1000 / 60);
  assert.deepEqual(observed.at(-1), { mode: "POSITION", value: 0 });

  // A quarter-turn clockwise maps one-to-one to 90 / 120 = 0.75 of lock.
  steeringJoystick.dispatch("pointermove", {
    pointerId: 41,
    clientX: 50,
    clientY: 100,
  });
  now = 1000 / 30;
  animationFrames.runNext(1000 / 30);
  assert.deepEqual(observed.at(-1), { mode: "POSITION", value: -0.75 });

  steeringJoystick.dispatch("pointerup", {
    pointerId: 41,
    clientX: 50,
    clientY: 100,
  });
  now = 50;
  animationFrames.runNext(50);
  assert.deepEqual(observed.at(-1), { mode: "POSITION", value: 0 });

  pointerControls.steerRight.dispatch("pointerdown", { pointerId: 42 });
  now = 200 / 3;
  animationFrames.runNext(200 / 3);
  assert.deepEqual(observed.at(-1), { mode: "RATE", value: -1 });

  assert.deepEqual(joystickStates.at(-1), { value: 0, active: false });
  host.dispose();
  assert.equal(steeringJoystick.captured.size, 0);
  assert.equal(pointerControls.steerRight.captured.size, 0);
});


test("steering interaction provider switches on the next grab without restarting the browser host", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const animationFrames = new FakeAnimationFrames();
  const steeringJoystick = new FakeJoystickTarget();
  const observed = [];
  let interaction = "DIRECT_ROTATION";
  let now = 0;

  const host = CleanBrowserHost.start({
    windowTarget,
    documentTarget,
    animationFrames,
    steeringJoystick,
    getSteeringInteraction: () => interaction,
    now: () => now,
    isDocumentHidden: () => false,
    onStep(_step, steering) {
      observed.push(steering.command);
    },
  });

  steeringJoystick.dispatch("pointerdown", {
    pointerId: 51,
    clientX: 100,
    clientY: 50,
  });
  animationFrames.runNext(0);
  now = 1000 / 60;
  animationFrames.runNext(1000 / 60);
  steeringJoystick.dispatch("pointermove", {
    pointerId: 51,
    clientX: 50,
    clientY: 100,
  });
  now = 1000 / 30;
  animationFrames.runNext(1000 / 30);
  assert.deepEqual(observed.at(-1), { mode: "POSITION", value: -0.75 });
  steeringJoystick.dispatch("pointerup", { pointerId: 51, clientX: 50, clientY: 100 });

  interaction = "RELATIVE_X";
  now = 55;
  steeringJoystick.dispatch("pointerdown", {
    pointerId: 52,
    clientX: 50,
    clientY: 10,
  });
  steeringJoystick.dispatch("pointermove", {
    pointerId: 52,
    clientX: 60,
    clientY: 10,
  });
  now = 200 / 3;
  animationFrames.runNext(200 / 3);
  assert.equal(observed.at(-1).mode, "POSITION");
  assert.ok(observed.at(-1).value < 0);
  assert.ok(Math.abs(observed.at(-1).value) < 0.2);

  steeringJoystick.dispatch("pointerup", { pointerId: 52, clientX: 60, clientY: 10 });
  host.dispose();
});
