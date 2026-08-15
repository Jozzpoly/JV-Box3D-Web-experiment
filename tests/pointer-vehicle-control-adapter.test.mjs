import test from "node:test";
import assert from "node:assert/strict";
import {
  PointerVehicleControlAdapter,
  resolvePointerPedalTravelPx,
  resolvePointerPedalValue,
} from "../.test-dist/input/pointer-vehicle-control-adapter.js";
import { LongitudinalInputTimeline } from "../.test-dist/input/longitudinal-input-timeline.js";
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
      listener({
        pointerId: 0,
        button: 0,
        clientY: 200,
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
  capturedPointers = new Set();
  failCapture = false;
  rectHeight = 100;

  setPointerCapture(pointerId) {
    if (this.failCapture) {
      throw new Error("capture unavailable");
    }
    this.capturedPointers.add(pointerId);
  }

  releasePointerCapture(pointerId) {
    this.capturedPointers.delete(pointerId);
  }

  hasPointerCapture(pointerId) {
    return this.capturedPointers.has(pointerId);
  }

  getBoundingClientRect() {
    return { height: this.rectHeight };
  }
}

function createFixture() {
  const windowTarget = new FakeEventTarget();
  const documentTarget = new FakeEventTarget();
  const controls = {
    steerLeft: new FakePointerTarget(),
    steerRight: new FakePointerTarget(),
    forward: new FakePointerTarget(),
    reverse: new FakePointerTarget(),
    brake: new FakePointerTarget(),
  };
  const steeringTimeline = new SteeringInputTimeline(0);
  const longitudinalTimeline = new LongitudinalInputTimeline(0);
  const stateChanges = [];
  let now = 0;
  let hidden = false;
  const adapter = new PointerVehicleControlAdapter({
    windowTarget,
    documentTarget,
    controls,
    steeringTimeline,
    longitudinalTimeline,
    now: () => now,
    isDocumentHidden: () => hidden,
    onControlStateChange: (control, active, value) => {
      stateChanges.push({ control, active, value });
    },
  });

  return {
    adapter,
    controls,
    windowTarget,
    documentTarget,
    steeringTimeline,
    longitudinalTimeline,
    stateChanges,
    setNow(value) {
      now = value;
    },
    setHidden(value) {
      hidden = value;
    },
  };
}

function totalListenerCount(fixture) {
  return (
    fixture.windowTarget.listenerCount() +
    fixture.documentTarget.listenerCount() +
    Object.values(fixture.controls).reduce(
      (sum, control) => sum + control.listenerCount(),
      0,
    )
  );
}

test("pedal gesture is relative to touch-down, has start slop and clamps", () => {
  assert.equal(resolvePointerPedalTravelPx(100), 86);
  assert.equal(resolvePointerPedalValue(200, 200, 86), 0);
  assert.equal(resolvePointerPedalValue(194, 200, 86), 0);
  assert.equal(resolvePointerPedalValue(154, 200, 86), 0.5);
  assert.equal(resolvePointerPedalValue(100, 200, 86), 1);
  assert.equal(resolvePointerPedalValue(220, 200, 86), 0);
});

test("steering and analog throttle can be owned by separate pointers", () => {
  const fixture = createFixture();

  fixture.controls.steerLeft.dispatch("pointerdown", { pointerId: 1 });
  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 2,
    clientY: 200,
  });
  fixture.setNow(2);
  fixture.controls.forward.dispatch("pointermove", {
    pointerId: 2,
    clientY: 154,
  });
  fixture.setNow(6);
  fixture.controls.steerLeft.dispatch("pointerup", { pointerId: 1 });
  fixture.setNow(8);
  fixture.controls.forward.dispatch("pointerup", {
    pointerId: 2,
    clientY: 154,
  });

  assert.deepEqual(fixture.steeringTimeline.consumeInterval(0, 10).command, {
    mode: "RATE",
    value: 0.6,
  });
  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: 0.3, brake: 0 },
  );
  assert.deepEqual(
    fixture.stateChanges.filter(({ control }) => control === "FORWARD"),
    [
      { control: "FORWARD", active: true, value: 0 },
      { control: "FORWARD", active: true, value: 0.5 },
      { control: "FORWARD", active: false, value: 0 },
    ],
  );
  fixture.adapter.dispose();
});

test("one pointer cannot own steering and a pedal simultaneously", () => {
  const fixture = createFixture();

  fixture.controls.steerRight.dispatch("pointerdown", { pointerId: 4 });
  fixture.setNow(2);
  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 4,
    clientY: 200,
  });
  fixture.controls.forward.dispatch("pointermove", {
    pointerId: 4,
    clientY: 100,
  });
  fixture.setNow(5);
  fixture.controls.steerRight.dispatch("pointerup", { pointerId: 4 });

  assert.deepEqual(fixture.steeringTimeline.consumeInterval(0, 10).command, {
    mode: "RATE",
    value: -0.5,
  });
  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: 0, brake: 0 },
  );
  fixture.adapter.dispose();
});

test("a tap without upward pedal travel remains neutral", () => {
  const fixture = createFixture();
  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 5,
    clientY: 200,
  });
  fixture.setNow(4);
  fixture.controls.forward.dispatch("pointerup", {
    pointerId: 5,
    clientY: 200,
  });

  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: 0, brake: 0 },
  );
  fixture.adapter.dispose();
});

test("D/R selector flips a held throttle immediately without requiring release", () => {
  const fixture = createFixture();
  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 6,
    clientY: 200,
  });
  fixture.controls.forward.dispatch("pointermove", {
    pointerId: 6,
    clientY: 130,
  });
  fixture.setNow(5);
  fixture.controls.reverse.dispatch("click");

  const sample = fixture.longitudinalTimeline.consumeInterval(0, 10);
  assert.ok(Math.abs(sample.command.throttle) < 1e-12);
  assert.deepEqual(
    fixture.stateChanges.filter(({ control }) => control === "REVERSE"),
    [{ control: "REVERSE", active: true, value: 1 }],
  );

  fixture.setNow(10);
  fixture.controls.forward.dispatch("pointerup", {
    pointerId: 6,
    clientY: 130,
  });
  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(10, 20).command,
    { throttle: 0, brake: 0 },
  );
  fixture.adapter.dispose();
});

test("direction selector can return from R to D while throttle stays held", () => {
  const fixture = createFixture();
  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 7,
    clientY: 200,
  });
  fixture.controls.forward.dispatch("pointermove", {
    pointerId: 7,
    clientY: 154,
  });
  fixture.setNow(2);
  fixture.controls.reverse.dispatch("click");
  fixture.setNow(6);
  fixture.controls.reverse.dispatch("click");

  const sample = fixture.longitudinalTimeline.consumeInterval(0, 10);
  assert.ok(Math.abs(sample.command.throttle - 0.1) < 1e-12);
  assert.deepEqual(
    fixture.stateChanges.filter(({ control }) => control === "REVERSE"),
    [
      { control: "REVERSE", active: true, value: 1 },
      { control: "REVERSE", active: false, value: 0 },
    ],
  );
  fixture.adapter.dispose();
});

test("throttle and brake are independent simultaneous analog controls", () => {
  const fixture = createFixture();
  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 8,
    clientY: 200,
  });
  fixture.controls.brake.dispatch("pointerdown", {
    pointerId: 9,
    clientY: 200,
  });
  fixture.controls.forward.dispatch("pointermove", {
    pointerId: 8,
    clientY: 154,
  });
  fixture.controls.brake.dispatch("pointermove", {
    pointerId: 9,
    clientY: 138,
  });

  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: 0.5, brake: 0.7 },
  );
  fixture.adapter.dispose();
});

test("pointercancel and lostpointercapture cannot leave analog pedals active", () => {
  const fixture = createFixture();
  fixture.controls.brake.dispatch("pointerdown", {
    pointerId: 10,
    clientY: 200,
  });
  fixture.controls.brake.dispatch("pointermove", {
    pointerId: 10,
    clientY: 154,
  });
  fixture.setNow(3);
  fixture.controls.brake.dispatch("pointercancel", { pointerId: 10 });

  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 11,
    clientY: 200,
  });
  fixture.controls.forward.dispatch("pointermove", {
    pointerId: 11,
    clientY: 154,
  });
  fixture.setNow(6);
  fixture.controls.forward.dispatch("lostpointercapture", { pointerId: 11 });

  const sample = fixture.longitudinalTimeline.consumeInterval(0, 10);
  assert.ok(Math.abs(sample.command.throttle - 0.15) < 1e-12);
  assert.ok(Math.abs(sample.command.brake - 0.15) < 1e-12);
  assert.equal(fixture.controls.brake.capturedPointers.size, 0);
  fixture.adapter.dispose();
});

test("blur releases pointer pedal input without cancelling a held keyboard source", () => {
  const fixture = createFixture();
  fixture.longitudinalTimeline.enqueueButton(
    "FORWARD",
    true,
    0,
    "keyboard",
  );
  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 12,
    clientY: 200,
  });
  fixture.controls.forward.dispatch("pointermove", {
    pointerId: 12,
    clientY: 154,
  });
  fixture.setNow(4);
  fixture.windowTarget.dispatch("blur");
  fixture.setNow(8);
  fixture.longitudinalTimeline.enqueueButton(
    "FORWARD",
    false,
    8,
    "keyboard",
  );

  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: 0.8, brake: 0 },
  );
  assert.equal(fixture.controls.forward.capturedPointers.size, 0);
  fixture.adapter.dispose();
});

test("visibility and disposal release ownership and remove every listener", () => {
  const fixture = createFixture();
  assert.equal(totalListenerCount(fixture), 23);

  fixture.controls.steerLeft.dispatch("pointerdown", { pointerId: 13 });
  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 14,
    clientY: 200,
  });
  fixture.controls.forward.dispatch("pointermove", {
    pointerId: 14,
    clientY: 154,
  });
  fixture.setNow(5);
  fixture.setHidden(true);
  fixture.documentTarget.dispatch("visibilitychange");

  assert.deepEqual(fixture.steeringTimeline.consumeInterval(0, 10).command, {
    mode: "RATE",
    value: 0.5,
  });
  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: 0.25, brake: 0 },
  );
  assert.doesNotThrow(() => fixture.adapter.dispose());
  assert.equal(totalListenerCount(fixture), 0);
});

test("pedal capture failure is fail-closed and emits no semantic command", () => {
  const fixture = createFixture();
  fixture.controls.forward.failCapture = true;
  fixture.controls.forward.dispatch("pointerdown", {
    pointerId: 15,
    clientY: 200,
  });
  fixture.controls.forward.dispatch("pointermove", {
    pointerId: 15,
    clientY: 100,
  });

  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: 0, brake: 0 },
  );
  assert.deepEqual(fixture.stateChanges, []);
  fixture.adapter.dispose();
});

test("duplicate control targets are rejected before listeners are installed", () => {
  const shared = new FakePointerTarget();
  assert.throws(
    () =>
      new PointerVehicleControlAdapter({
        windowTarget: new FakeEventTarget(),
        documentTarget: new FakeEventTarget(),
        controls: {
          steerLeft: shared,
          steerRight: shared,
          forward: new FakePointerTarget(),
          reverse: new FakePointerTarget(),
          brake: new FakePointerTarget(),
        },
        steeringTimeline: new SteeringInputTimeline(0),
        longitudinalTimeline: new LongitudinalInputTimeline(0),
        now: () => 0,
        isDocumentHidden: () => false,
      }),
    /unique target/,
  );
  assert.equal(shared.listenerCount(), 0);
});
