import test from "node:test";
import assert from "node:assert/strict";
import { KeyboardSteeringAdapter } from "../.test-dist/input/keyboard-steering-adapter.js";
import { SteeringInputTimeline } from "../.test-dist/input/steering-input-timeline.js";

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
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }
}

test("keyboard adapter releases active steering on blur and disposes listeners", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const timeline = new SteeringInputTimeline(0);
  let now = 2;

  const adapter = new KeyboardSteeringAdapter({
    windowTarget,
    documentTarget,
    timeline,
    now: () => now,
    isDocumentHidden: () => false,
  });

  assert.equal(windowTarget.listenerCount() + documentTarget.listenerCount(), 5);
  windowTarget.dispatch("keydown", { code: "KeyA" });
  now = 8;
  windowTarget.dispatch("blur");

  assert.deepEqual(timeline.consumeInterval(0, 10).command, { mode: "RATE", value: 0.6 });

  now = 12;
  adapter.dispose();
  assert.equal(windowTarget.listenerCount() + documentTarget.listenerCount(), 0);
});

test("two physical keys mapped to the same side do not release each other early", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const timeline = new SteeringInputTimeline(0);
  let now = 0;
  const adapter = new KeyboardSteeringAdapter({
    windowTarget,
    documentTarget,
    timeline,
    now: () => now,
    isDocumentHidden: () => false,
  });

  windowTarget.dispatch("keydown", { code: "KeyA" });
  now = 2;
  windowTarget.dispatch("keydown", { code: "ArrowLeft" });
  now = 4;
  windowTarget.dispatch("keyup", { code: "KeyA" });
  now = 8;
  windowTarget.dispatch("keyup", { code: "ArrowLeft" });

  assert.deepEqual(timeline.consumeInterval(0, 10).command, { mode: "RATE", value: 0.8 });
  adapter.dispose();
});
