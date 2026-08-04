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
        preventDefault() {},
        stopPropagation() {},
        ...event,
      });
    }
  }

  listenerCount() {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
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

function totalListeners(windowTarget, documentTarget, pointerControls) {
  return (
    windowTarget.listenerCount() +
    documentTarget.listenerCount() +
    Object.values(pointerControls).reduce(
      (sum, target) => sum + target.listenerCount(),
      0,
    )
  );
}

test("browser host owns pointer controls and samples them with keyboard timelines", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const animationFrames = new FakeAnimationFrames();
  const pointerControls = controls();
  const stateChanges = [];
  let observed = null;
  let now = 0;

  const host = CleanBrowserHost.start({
    windowTarget,
    documentTarget,
    animationFrames,
    pointerControls,
    now: () => now,
    isDocumentHidden: () => false,
    onPointerControlStateChange(control, active) {
      stateChanges.push({ control, active });
    },
    onStep(step, steering, longitudinal) {
      observed = { step, steering, longitudinal };
    },
  });

  assert.equal(totalListeners(windowTarget, documentTarget, pointerControls), 33);
  pointerControls.steerRight.dispatch("pointerdown", { pointerId: 21 });
  pointerControls.forward.dispatch("pointerdown", { pointerId: 22 });
  animationFrames.runNext(0);
  now = 1000 / 60;
  animationFrames.runNext(1000 / 60);

  assert.notEqual(observed, null);
  assert.deepEqual(observed.steering.command, { mode: "RATE", value: -1 });
  assert.deepEqual(observed.longitudinal.command, { throttle: 1, brake: 0 });
  assert.deepEqual(stateChanges.slice(0, 2), [
    { control: "STEER_RIGHT", active: true },
    { control: "FORWARD", active: true },
  ]);

  host.dispose();
  assert.equal(totalListeners(windowTarget, documentTarget, pointerControls), 0);
  assert.equal(pointerControls.steerRight.captured.size, 0);
  assert.equal(pointerControls.forward.captured.size, 0);
  assert.deepEqual(stateChanges.slice(-2), [
    { control: "STEER_RIGHT", active: false },
    { control: "FORWARD", active: false },
  ]);
});

test("runtime failure disposes pointer ownership before reporting fatal state", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const animationFrames = new FakeAnimationFrames();
  const pointerControls = controls();
  const fault = new Error("pointer-host physics fault");
  let reported = null;

  const host = CleanBrowserHost.start({
    windowTarget,
    documentTarget,
    animationFrames,
    pointerControls,
    now: () => 0,
    isDocumentHidden: () => false,
    onStep() {
      throw fault;
    },
    onFatalError(error) {
      reported = error;
    },
  });

  pointerControls.brake.dispatch("pointerdown", { pointerId: 31 });
  animationFrames.runNext(0);
  animationFrames.runNext(1000 / 60);

  assert.equal(reported, fault);
  assert.equal(host.fatalError, fault);
  assert.equal(totalListeners(windowTarget, documentTarget, pointerControls), 0);
  assert.equal(pointerControls.brake.captured.size, 0);
  assert.equal(animationFrames.callbacks.size, 0);
});

test("startup rollback removes pointer listeners when frame scheduling fails", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const pointerControls = controls();

  assert.throws(
    () =>
      CleanBrowserHost.start({
        windowTarget,
        documentTarget,
        pointerControls,
        animationFrames: {
          request() {
            throw new Error("no animation frame");
          },
          cancel() {},
        },
        now: () => 0,
        isDocumentHidden: () => false,
        onStep() {},
      }),
    /no animation frame/,
  );
  assert.equal(totalListeners(windowTarget, documentTarget, pointerControls), 0);
});
