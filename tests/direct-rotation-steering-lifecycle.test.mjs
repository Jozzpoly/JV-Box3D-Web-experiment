import test from "node:test";
import assert from "node:assert/strict";
import { PointerSteeringJoystickAdapter } from "../.test-dist/input/pointer-steering-joystick-adapter.js";
import { SteeringPositionTimeline } from "../.test-dist/input/steering-position-timeline.js";

class FakeTarget extends EventTarget {
  captures = new Set();

  setPointerCapture(id) {
    this.captures.add(id);
  }

  releasePointerCapture(id) {
    this.captures.delete(id);
  }

  hasPointerCapture(id) {
    return this.captures.has(id);
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 200, height: 80 };
  }
}

function pointer(type, { id, x = 200, y = 40 }) {
  const event = new Event(type, { cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: id },
    button: { value: 0 },
    clientX: { value: x },
    clientY: { value: y },
  });
  return event;
}

function createFixture() {
  let now = 0;
  const target = new FakeTarget();
  const timeline = new SteeringPositionTimeline(0);
  const states = [];
  const adapter = new PointerSteeringJoystickAdapter({
    windowTarget: new EventTarget(),
    documentTarget: new EventTarget(),
    target,
    wheelGeometrySource: target,
    timeline,
    now: () => now,
    isDocumentHidden: () => false,
    onStateChange: (value, active) => states.push({ value, active }),
  });
  return {
    adapter,
    target,
    timeline,
    states,
    setNow(value) { now = value; },
  };
}

test("second pointer cannot steal an owned direct steering gesture", () => {
  const fixture = createFixture();
  fixture.target.dispatchEvent(pointer("pointerdown", { id: 1 }));
  fixture.target.dispatchEvent(pointer("pointerdown", {
    id: 2,
    x: 100,
    y: 80,
  }));

  assert.deepEqual([...fixture.target.captures], [1]);
  assert.equal(fixture.states.length, 1);

  fixture.setNow(1);
  fixture.target.dispatchEvent(pointer("pointermove", {
    id: 2,
    x: 100,
    y: 80,
  }));
  assert.equal(fixture.states.length, 1);

  fixture.target.dispatchEvent(pointer("pointermove", {
    id: 1,
    x: 100,
    y: 80,
  }));
  assert.ok(fixture.states.at(-1).value < 0);
  fixture.adapter.dispose();
});

test("pointercancel self-centers direct steering and releases capture", () => {
  const fixture = createFixture();
  fixture.target.dispatchEvent(pointer("pointerdown", { id: 3 }));
  fixture.setNow(1);
  fixture.target.dispatchEvent(pointer("pointermove", {
    id: 3,
    x: 100,
    y: 80,
  }));
  fixture.setNow(2);
  fixture.target.dispatchEvent(pointer("pointercancel", {
    id: 3,
    x: 100,
    y: 80,
  }));

  assert.deepEqual(fixture.states.at(-1), { value: 0, active: false });
  assert.equal(fixture.target.captures.size, 0);
  assert.deepEqual(fixture.timeline.consumeInterval(0, 10).command, {
    mode: "POSITION",
    value: 0,
  });
  fixture.adapter.dispose();
});

test("lostpointercapture self-centers even after browser capture is already gone", () => {
  const fixture = createFixture();
  fixture.target.dispatchEvent(pointer("pointerdown", { id: 4 }));
  fixture.setNow(1);
  fixture.target.dispatchEvent(pointer("pointermove", {
    id: 4,
    x: 100,
    y: 80,
  }));
  fixture.target.captures.delete(4);
  fixture.setNow(2);
  fixture.target.dispatchEvent(pointer("lostpointercapture", {
    id: 4,
    x: 100,
    y: 80,
  }));

  assert.deepEqual(fixture.states.at(-1), { value: 0, active: false });
  assert.equal(fixture.target.captures.size, 0);
  assert.deepEqual(fixture.timeline.consumeInterval(0, 10).command, {
    mode: "POSITION",
    value: 0,
  });
  fixture.adapter.dispose();
});
