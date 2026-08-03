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

  listenerCount() {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
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

test("host owns listeners and animation frame across start/dispose/rebuild", () => {
  const options = createOptions();
  const first = CleanBrowserHost.start(options);
  assert.equal(options.windowTarget.listenerCount() + options.documentTarget.listenerCount(), 5);
  assert.equal(options.animationFrames.callbacks.size, 1);

  first.dispose();
  assert.equal(options.windowTarget.listenerCount() + options.documentTarget.listenerCount(), 0);
  assert.equal(options.animationFrames.callbacks.size, 0);

  const second = CleanBrowserHost.start(options);
  assert.equal(options.windowTarget.listenerCount() + options.documentTarget.listenerCount(), 5);
  second.dispose();
  assert.equal(options.windowTarget.listenerCount() + options.documentTarget.listenerCount(), 0);
});

test("startup failure rolls back listeners and scheduled resources", () => {
  const options = createOptions({
    animationFrames: {
      request() {
        throw new Error("requestAnimationFrame unavailable");
      },
      cancel() {},
    },
  });

  assert.throws(() => CleanBrowserHost.start(options), /requestAnimationFrame unavailable/);
  assert.equal(options.windowTarget.listenerCount() + options.documentTarget.listenerCount(), 0);
});
