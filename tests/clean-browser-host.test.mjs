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
      listener({ preventDefault() {}, ...event });
    }
  }

  listenerCount() {
    return [...this.listeners.values()].reduce(
      (sum, set) => sum + set.size,
      0,
    );
  }
}

class FakeAnimationFrames {
  nextHandle = 1;
  callbacks = new Map();
  cancelled = [];

  request(callback) {
    const handle = this.nextHandle++;
    this.callbacks.set(handle, callback);
    return handle;
  }

  cancel(handle) {
    this.cancelled.push(handle);
    this.callbacks.delete(handle);
  }

  run(handle, timeMs) {
    const callback = this.callbacks.get(handle);
    if (callback === undefined) {
      throw new Error(`Missing frame callback ${handle}`);
    }
    this.callbacks.delete(handle);
    callback(timeMs);
  }
}

function createOptions(overrides = {}) {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const animationFrames = new FakeAnimationFrames();
  return {
    windowTarget,
    documentTarget,
    animationFrames,
    now: () => 0,
    isDocumentHidden: () => false,
    onStep: () => {},
    ...overrides,
  };
}

function runOneFixedStep(options) {
  const firstHandle = [...options.animationFrames.callbacks.keys()][0];
  options.animationFrames.run(firstHandle, 0);
  const secondHandle = [...options.animationFrames.callbacks.keys()][0];
  options.animationFrames.run(secondHandle, 1000 / 60);
}

test("host owns both keyboard adapters and animation frame across start/dispose/rebuild", () => {
  const options = createOptions();
  const first = CleanBrowserHost.start(options);
  assert.equal(
    options.windowTarget.listenerCount() +
      options.documentTarget.listenerCount(),
    10,
  );
  assert.equal(options.animationFrames.callbacks.size, 1);

  first.dispose();
  assert.equal(
    options.windowTarget.listenerCount() +
      options.documentTarget.listenerCount(),
    0,
  );
  assert.equal(options.animationFrames.callbacks.size, 0);

  const second = CleanBrowserHost.start(options);
  assert.equal(
    options.windowTarget.listenerCount() +
      options.documentTarget.listenerCount(),
    10,
  );
  second.dispose();
  assert.equal(
    options.windowTarget.listenerCount() +
      options.documentTarget.listenerCount(),
    0,
  );
});

test("one fixed step samples steering and longitudinal controls from the same timeline interval", () => {
  let observed = null;
  const options = createOptions({
    onStep(step, steering, longitudinal) {
      observed = { step, steering, longitudinal };
    },
  });
  const host = CleanBrowserHost.start(options);

  options.windowTarget.dispatch("keydown", { code: "KeyA" });
  options.windowTarget.dispatch("keydown", { code: "KeyW" });
  runOneFixedStep(options);

  assert.equal(observed.step.index, 1);
  assert.deepEqual(observed.steering.command, {
    mode: "RATE",
    value: 1,
  });
  assert.deepEqual(observed.longitudinal.command, {
    throttle: 1,
    brake: 0,
  });
  host.dispose();
});

test("startup failure rolls back both keyboard adapters and scheduled resources", () => {
  const options = createOptions({
    animationFrames: {
      request() {
        throw new Error("requestAnimationFrame unavailable");
      },
      cancel() {},
    },
  });

  assert.throws(
    () => CleanBrowserHost.start(options),
    /requestAnimationFrame unavailable/,
  );
  assert.equal(
    options.windowTarget.listenerCount() +
      options.documentTarget.listenerCount(),
    0,
  );
});

test("runtime step failure disposes both keyboard adapters and does not schedule another frame", () => {
  const fatal = new Error("physics step failed");
  let observedFatal = null;
  const options = createOptions({
    onStep() {
      throw fatal;
    },
    onFatalError(error) {
      observedFatal = error;
    },
  });
  const host = CleanBrowserHost.start(options);

  runOneFixedStep(options);

  assert.equal(observedFatal, fatal);
  assert.equal(host.fatalError, fatal);
  assert.equal(options.animationFrames.callbacks.size, 0);
  assert.equal(
    options.windowTarget.listenerCount() +
      options.documentTarget.listenerCount(),
    0,
  );
  host.dispose();
});

test("dispose called during a step prevents rescheduling", () => {
  const options = createOptions();
  let host;
  options.onStep = () => host.dispose();
  host = CleanBrowserHost.start(options);

  runOneFixedStep(options);

  assert.equal(options.animationFrames.callbacks.size, 0);
  assert.equal(
    options.windowTarget.listenerCount() +
      options.documentTarget.listenerCount(),
    0,
  );
});
