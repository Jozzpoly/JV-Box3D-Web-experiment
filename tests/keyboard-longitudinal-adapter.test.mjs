import test from "node:test";
import assert from "node:assert/strict";
import { KeyboardLongitudinalAdapter } from "../.test-dist/input/keyboard-longitudinal-adapter.js";
import { LongitudinalInputTimeline } from "../.test-dist/input/longitudinal-input-timeline.js";

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

test("longitudinal keyboard releases throttle and brake on blur and disposes listeners", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const timeline = new LongitudinalInputTimeline(0);
  let now = 2;

  const adapter = new KeyboardLongitudinalAdapter({
    windowTarget,
    documentTarget,
    timeline,
    now: () => now,
    isDocumentHidden: () => false,
  });

  assert.equal(
    windowTarget.listenerCount() + documentTarget.listenerCount(),
    5,
  );
  windowTarget.dispatch("keydown", { code: "KeyW" });
  windowTarget.dispatch("keydown", { code: "Space" });
  now = 8;
  windowTarget.dispatch("blur");

  assert.deepEqual(timeline.consumeInterval(0, 10).command, {
    throttle: 0.6,
    brake: 0.6,
  });

  now = 12;
  adapter.dispose();
  assert.equal(
    windowTarget.listenerCount() + documentTarget.listenerCount(),
    0,
  );
});

test("two physical keys mapped to forward do not release each other early", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const timeline = new LongitudinalInputTimeline(0);
  let now = 0;
  const adapter = new KeyboardLongitudinalAdapter({
    windowTarget,
    documentTarget,
    timeline,
    now: () => now,
    isDocumentHidden: () => false,
  });

  windowTarget.dispatch("keydown", { code: "KeyW" });
  now = 2;
  windowTarget.dispatch("keydown", { code: "ArrowUp" });
  now = 4;
  windowTarget.dispatch("keyup", { code: "KeyW" });
  now = 8;
  windowTarget.dispatch("keyup", { code: "ArrowUp" });

  assert.deepEqual(timeline.consumeInterval(0, 10).command, {
    throttle: 0.8,
    brake: 0,
  });
  adapter.dispose();
});

test("visibility loss releases reverse and brake at the captured timestamp", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const timeline = new LongitudinalInputTimeline(0);
  let now = 1;
  let hidden = false;
  const adapter = new KeyboardLongitudinalAdapter({
    windowTarget,
    documentTarget,
    timeline,
    now: () => now,
    isDocumentHidden: () => hidden,
  });

  windowTarget.dispatch("keydown", { code: "KeyS" });
  windowTarget.dispatch("keydown", { code: "Space" });
  now = 6;
  hidden = true;
  documentTarget.dispatch("visibilitychange");

  assert.deepEqual(timeline.consumeInterval(0, 10).command, {
    throttle: -0.5,
    brake: 0.5,
  });
  adapter.dispose();
});

test("dispose clamps drive release to the consumed timeline cursor", () => {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const timeline = new LongitudinalInputTimeline(0);
  const adapter = new KeyboardLongitudinalAdapter({
    windowTarget,
    documentTarget,
    timeline,
    now: () => 0,
    isDocumentHidden: () => false,
  });

  windowTarget.dispatch("keydown", { code: "KeyW" });
  windowTarget.dispatch("keydown", { code: "Space" });
  assert.deepEqual(timeline.consumeInterval(0, 10).command, {
    throttle: 1,
    brake: 1,
  });

  assert.doesNotThrow(() => adapter.dispose());
  assert.deepEqual(timeline.consumeInterval(10, 20).command, {
    throttle: 0,
    brake: 0,
  });
  assert.equal(
    windowTarget.listenerCount() + documentTarget.listenerCount(),
    0,
  );
});