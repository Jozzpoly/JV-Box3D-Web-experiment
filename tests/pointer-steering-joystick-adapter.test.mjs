import test from "node:test";
import assert from "node:assert/strict";
import {
  PointerSteeringJoystickAdapter,
  resolvePointerSteeringPosition,
} from "../.test-dist/input/pointer-steering-joystick-adapter.js";
import { SteeringPositionTimeline } from "../.test-dist/input/steering-position-timeline.js";

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
        preventDefault() {},
        stopPropagation() {},
        ...event,
      });
    }
  }

  listenerCount() {
    return [...this.listeners.values()].reduce(
      (sum, set) => sum + set.size,
      0,
    );
  }
}

class FakeJoystickTarget extends FakeEventTarget {
  captured = new Set();
  failCapture = false;
  left = 0;
  width = 100;
  geometryReads = 0;

  setPointerCapture(pointerId) {
    if (this.failCapture) {
      throw new Error("capture unavailable");
    }
    this.captured.add(pointerId);
  }

  releasePointerCapture(pointerId) {
    this.captured.delete(pointerId);
  }

  hasPointerCapture(pointerId) {
    return this.captured.has(pointerId);
  }

  getBoundingClientRect() {
    this.geometryReads += 1;
    return { left: this.left, width: this.width };
  }
}

function createFixture() {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const target = new FakeJoystickTarget();
  const timeline = new SteeringPositionTimeline(0);
  const stateChanges = [];
  let now = 0;
  let hidden = false;
  const adapter = new PointerSteeringJoystickAdapter({
    windowTarget,
    documentTarget,
    target,
    timeline,
    now: () => now,
    isDocumentHidden: () => hidden,
    onStateChange: (value, active) => {
      stateChanges.push({ value, active });
    },
  });

  return {
    adapter,
    target,
    timeline,
    windowTarget,
    documentTarget,
    stateChanges,
    setNow(value) {
      now = value;
    },
    setHidden(value) {
      hidden = value;
    },
  };
}

test("joystick geometry maps left positive, right negative, and center to zero", () => {
  assert.equal(resolvePointerSteeringPosition(0, 0, 100), 1);
  assert.equal(resolvePointerSteeringPosition(100, 0, 100), -1);
  assert.equal(resolvePointerSteeringPosition(50, 0, 100), 0);
  assert.equal(resolvePointerSteeringPosition(52, 0, 100), 0);
});

test("drag emits POSITION and pointer release self-centers", () => {
  const fixture = createFixture();
  fixture.target.dispatch("pointerdown", { pointerId: 7, clientX: 0 });
  fixture.setNow(4);
  fixture.target.dispatch("pointermove", { pointerId: 7, clientX: 75 });
  fixture.setNow(8);
  fixture.target.dispatch("pointerup", { pointerId: 7, clientX: 75 });

  const sample = fixture.timeline.consumeInterval(0, 10);
  assert.deepEqual(sample.command, { mode: "POSITION", value: 0 });
  assert.equal(
    sample.activeSourceIdAtEnd,
    "pointer-steering-joystick",
  );
  assert.equal(fixture.target.captured.size, 0);
  assert.deepEqual(fixture.stateChanges.at(-1), {
    value: 0,
    active: false,
  });
  fixture.adapter.dispose();
});

test("active steering drag keeps pointer-down geometry even if layout changes", () => {
  const fixture = createFixture();
  fixture.target.dispatch("pointerdown", { pointerId: 3, clientX: 0 });
  assert.equal(fixture.target.geometryReads, 1);

  fixture.target.left = 50;
  fixture.target.width = 200;
  fixture.setNow(2);
  fixture.target.dispatch("pointermove", { pointerId: 3, clientX: 25 });

  const expected = resolvePointerSteeringPosition(25, 0, 100);
  assert.equal(fixture.target.geometryReads, 1);
  assert.equal(fixture.stateChanges.at(-1).active, true);
  assert.ok(Math.abs(fixture.stateChanges.at(-1).value - expected) < 1e-12);
  fixture.adapter.dispose();
});

test("pointer capture failure is fail-closed", () => {
  const fixture = createFixture();
  fixture.target.failCapture = true;
  fixture.target.dispatch("pointerdown", { pointerId: 4, clientX: 0 });

  assert.deepEqual(fixture.timeline.consumeInterval(0, 10).command, {
    mode: "RELEASE",
  });
  assert.deepEqual(fixture.stateChanges, []);
  fixture.adapter.dispose();
});

test("blur neutralizes active pointer and dispose releases analog ownership", () => {
  const fixture = createFixture();
  fixture.target.dispatch("pointerdown", { pointerId: 9, clientX: 0 });
  fixture.setNow(3);
  fixture.windowTarget.dispatch("blur");

  let sample = fixture.timeline.consumeInterval(0, 5);
  assert.deepEqual(sample.command, { mode: "POSITION", value: 0 });
  assert.equal(fixture.target.captured.size, 0);

  fixture.setNow(6);
  fixture.adapter.dispose();
  sample = fixture.timeline.consumeInterval(5, 10);
  assert.deepEqual(sample.command, { mode: "RELEASE" });
  assert.equal(fixture.target.listenerCount(), 0);
});
