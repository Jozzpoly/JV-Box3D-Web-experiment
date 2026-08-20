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
        clientY: 50,
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
  top = 0;
  width = 100;
  height = 100;
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
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
    };
  }
}

class FakeWheelGeometry {
  left = 0;
  top = 0;
  width = 200;
  height = 80;
  geometryReads = 0;

  getBoundingClientRect() {
    this.geometryReads += 1;
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
    };
  }
}

function createFixture(options = {}) {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const target = new FakeJoystickTarget();
  const wheelGeometry = new FakeWheelGeometry();
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
    ...options,
  });

  return {
    adapter,
    target,
    wheelGeometry,
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

function near(actual, expected, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${actual} != ${expected}`,
  );
}

test("X-position reference maps left positive, right negative, and center to zero", () => {
  assert.equal(resolvePointerSteeringPosition(0, 0, 100), 1);
  assert.equal(resolvePointerSteeringPosition(100, 0, 100), -1);
  assert.equal(resolvePointerSteeringPosition(50, 0, 100), 0);
  assert.equal(resolvePointerSteeringPosition(52, 0, 100), 0);
});

test("X-position reference remains available as an explicit adapter mode", () => {
  const fixture = createFixture({ interaction: "X_POSITION" });
  fixture.target.dispatch("pointerdown", { pointerId: 7, clientX: 0 });
  assert.equal(fixture.stateChanges.at(-1).value, 1);

  fixture.setNow(4);
  fixture.target.dispatch("pointermove", { pointerId: 7, clientX: 75 });
  assert.ok(fixture.stateChanges.at(-1).value < 0);
  fixture.adapter.dispose();
});

test("direct rotation is the branch default and pointer-down does not jump", () => {
  const wheelGeometry = new FakeWheelGeometry();
  const fixture = createFixture({ wheelGeometrySource: wheelGeometry });

  fixture.target.dispatch("pointerdown", {
    pointerId: 7,
    clientX: 200,
    clientY: 40,
  });

  assert.deepEqual(fixture.stateChanges.at(-1), {
    value: 0,
    active: true,
  });
  assert.deepEqual(fixture.timeline.consumeInterval(0, 1).command, {
    mode: "POSITION",
    value: 0,
  });
  fixture.adapter.dispose();
});

test("direct rotation follows the ellipse-normalized wheel arc one-to-one", () => {
  const wheelGeometry = new FakeWheelGeometry();
  const fixture = createFixture({ wheelGeometrySource: wheelGeometry });

  fixture.target.dispatch("pointerdown", {
    pointerId: 3,
    clientX: 200,
    clientY: 40,
  });
  fixture.setNow(2);
  fixture.target.dispatch("pointermove", {
    pointerId: 3,
    clientX: 100,
    clientY: 80,
  });

  near(fixture.stateChanges.at(-1).value, -0.75);
  assert.equal(fixture.stateChanges.at(-1).active, true);
  fixture.adapter.dispose();
});

test("direct rotation freezes projected wheel geometry at pointer-down", () => {
  const wheelGeometry = new FakeWheelGeometry();
  const fixture = createFixture({ wheelGeometrySource: wheelGeometry });

  fixture.target.dispatch("pointerdown", {
    pointerId: 4,
    clientX: 200,
    clientY: 40,
  });
  assert.equal(wheelGeometry.geometryReads, 1);

  wheelGeometry.left = 100;
  wheelGeometry.top = 100;
  wheelGeometry.width = 400;
  wheelGeometry.height = 160;
  fixture.setNow(2);
  fixture.target.dispatch("pointermove", {
    pointerId: 4,
    clientX: 100,
    clientY: 80,
  });

  assert.equal(wheelGeometry.geometryReads, 1);
  near(fixture.stateChanges.at(-1).value, -0.75);
  fixture.adapter.dispose();
});

test("direct rotation center guard re-anchors without a steering jump", () => {
  const wheelGeometry = new FakeWheelGeometry();
  const fixture = createFixture({
    wheelGeometrySource: wheelGeometry,
    wheelCenterGuardRatio: 0.2,
  });

  fixture.target.dispatch("pointerdown", {
    pointerId: 5,
    clientX: 100,
    clientY: 40,
  });
  fixture.setNow(1);
  fixture.target.dispatch("pointermove", {
    pointerId: 5,
    clientX: 200,
    clientY: 40,
  });
  near(fixture.stateChanges.at(-1).value, 0);

  fixture.setNow(2);
  fixture.target.dispatch("pointermove", {
    pointerId: 5,
    clientX: 100,
    clientY: 80,
  });
  near(fixture.stateChanges.at(-1).value, -0.75);
  fixture.adapter.dispose();
});

test("direct rotation pointer release self-centers", () => {
  const wheelGeometry = new FakeWheelGeometry();
  const fixture = createFixture({ wheelGeometrySource: wheelGeometry });
  fixture.target.dispatch("pointerdown", {
    pointerId: 8,
    clientX: 200,
    clientY: 40,
  });
  fixture.setNow(2);
  fixture.target.dispatch("pointermove", {
    pointerId: 8,
    clientX: 100,
    clientY: 80,
  });
  fixture.setNow(4);
  fixture.target.dispatch("pointerup", {
    pointerId: 8,
    clientX: 100,
    clientY: 80,
  });

  assert.deepEqual(fixture.stateChanges.at(-1), {
    value: 0,
    active: false,
  });
  assert.equal(fixture.target.captured.size, 0);
  assert.deepEqual(fixture.timeline.consumeInterval(0, 10).command, {
    mode: "POSITION",
    value: 0,
  });
  fixture.adapter.dispose();
});

test("pointer capture failure is fail-closed in direct rotation", () => {
  const wheelGeometry = new FakeWheelGeometry();
  const fixture = createFixture({ wheelGeometrySource: wheelGeometry });
  fixture.target.failCapture = true;
  fixture.target.dispatch("pointerdown", {
    pointerId: 9,
    clientX: 200,
    clientY: 40,
  });

  assert.deepEqual(fixture.timeline.consumeInterval(0, 10).command, {
    mode: "RELEASE",
  });
  assert.deepEqual(fixture.stateChanges, []);
  fixture.adapter.dispose();
});

test("blur neutralizes active direct rotation and dispose releases ownership", () => {
  const wheelGeometry = new FakeWheelGeometry();
  const fixture = createFixture({ wheelGeometrySource: wheelGeometry });
  fixture.target.dispatch("pointerdown", {
    pointerId: 10,
    clientX: 200,
    clientY: 40,
  });
  fixture.setNow(2);
  fixture.target.dispatch("pointermove", {
    pointerId: 10,
    clientX: 100,
    clientY: 80,
  });
  fixture.setNow(3);
  fixture.windowTarget.dispatch("blur");

  let sample = fixture.timeline.consumeInterval(0, 5);
  assert.deepEqual(sample.command, { mode: "POSITION", value: 0 });
  assert.equal(fixture.target.captured.size, 0);
  assert.deepEqual(fixture.stateChanges.at(-1), {
    value: 0,
    active: false,
  });

  fixture.setNow(6);
  fixture.adapter.dispose();
  sample = fixture.timeline.consumeInterval(5, 10);
  assert.deepEqual(sample.command, { mode: "RELEASE" });
  assert.equal(fixture.target.listenerCount(), 0);
});


test("relative-X pointer-down does not jump and horizontal movement is independent of grab height", () => {
  const wheelGeometry = new FakeWheelGeometry();
  const top = createFixture({
    interaction: "RELATIVE_X",
    wheelGeometrySource: wheelGeometry,
  });
  const bottom = createFixture({
    interaction: "RELATIVE_X",
    wheelGeometrySource: wheelGeometry,
  });

  top.target.dispatch("pointerdown", { pointerId: 21, clientX: 100, clientY: 5 });
  bottom.target.dispatch("pointerdown", { pointerId: 22, clientX: 100, clientY: 75 });
  near(top.stateChanges.at(-1).value, 0);
  near(bottom.stateChanges.at(-1).value, 0);

  top.setNow(1);
  bottom.setNow(1);
  top.target.dispatch("pointermove", { pointerId: 21, clientX: 110, clientY: 5 });
  bottom.target.dispatch("pointermove", { pointerId: 22, clientX: 110, clientY: 75 });

  near(top.stateChanges.at(-1).value, bottom.stateChanges.at(-1).value);
  assert.ok(top.stateChanges.at(-1).value < 0);
  top.adapter.dispose();
  bottom.adapter.dispose();
});

test("interaction provider is frozen for one gesture and re-read on the next grab", () => {
  let interaction = "DIRECT_ROTATION";
  const wheelGeometry = new FakeWheelGeometry();
  const fixture = createFixture({
    getInteraction: () => interaction,
    wheelGeometrySource: wheelGeometry,
  });

  fixture.target.dispatch("pointerdown", {
    pointerId: 23,
    clientX: 200,
    clientY: 40,
  });
  interaction = "RELATIVE_X";
  fixture.setNow(1);
  fixture.target.dispatch("pointermove", {
    pointerId: 23,
    clientX: 100,
    clientY: 80,
  });
  near(fixture.stateChanges.at(-1).value, -0.75);

  fixture.setNow(2);
  fixture.target.dispatch("pointerup", { pointerId: 23, clientX: 100, clientY: 80 });
  fixture.setNow(3);
  fixture.target.dispatch("pointerdown", { pointerId: 24, clientX: 100, clientY: 5 });
  fixture.setNow(4);
  fixture.target.dispatch("pointermove", { pointerId: 24, clientX: 110, clientY: 5 });
  assert.ok(fixture.stateChanges.at(-1).value < 0);
  assert.ok(Math.abs(fixture.stateChanges.at(-1).value) < 0.1);
  fixture.adapter.dispose();
});

test("invalid interaction provider fails closed without taking pointer ownership", () => {
  const fixture = createFixture({
    getInteraction: () => "BROKEN_MODE",
  });
  fixture.target.dispatch("pointerdown", { pointerId: 25, clientX: 50, clientY: 50 });

  assert.deepEqual(fixture.stateChanges, []);
  assert.equal(fixture.target.captured.size, 0);
  assert.deepEqual(fixture.timeline.consumeInterval(0, 1).command, { mode: "RELEASE" });
  fixture.adapter.dispose();
});

test("fixed interaction and provider cannot be configured together", () => {
  assert.throws(
    () => createFixture({
      interaction: "DIRECT_ROTATION",
      getInteraction: () => "RELATIVE_X",
    }),
    /either a fixed mode or a provider/,
  );
});
