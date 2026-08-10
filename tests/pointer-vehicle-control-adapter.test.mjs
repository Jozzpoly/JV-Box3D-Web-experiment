import test from "node:test";
import assert from "node:assert/strict";
import { PointerVehicleControlAdapter } from "../.test-dist/input/pointer-vehicle-control-adapter.js";
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
    onControlStateChange: (control, active) => {
      stateChanges.push({ control, active });
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

test("two pointers steer and drive through the same fixed-step interval", () => {
  const fixture = createFixture();

  fixture.controls.steerLeft.dispatch("pointerdown", { pointerId: 1 });
  fixture.controls.forward.dispatch("pointerdown", { pointerId: 2 });
  fixture.setNow(6);
  fixture.controls.steerLeft.dispatch("pointerup", { pointerId: 1 });
  fixture.setNow(8);
  fixture.controls.forward.dispatch("pointerup", { pointerId: 2 });

  assert.deepEqual(fixture.steeringTimeline.consumeInterval(0, 10).command, {
    mode: "RATE",
    value: 0.6,
  });
  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: 0.8, brake: 0 },
  );
  assert.deepEqual(fixture.stateChanges, [
    { control: "STEER_LEFT", active: true },
    { control: "FORWARD", active: true },
    { control: "STEER_LEFT", active: false },
    { control: "FORWARD", active: false },
  ]);
  fixture.adapter.dispose();
});

test("one pointer cannot own two vehicle controls", () => {
  const fixture = createFixture();

  fixture.controls.steerRight.dispatch("pointerdown", { pointerId: 4 });
  fixture.setNow(2);
  fixture.controls.forward.dispatch("pointerdown", { pointerId: 4 });
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

test("pointercancel and lostpointercapture cannot leave controls active", () => {
  const fixture = createFixture();

  fixture.controls.brake.dispatch("pointerdown", { pointerId: 7 });
  fixture.setNow(3);
  fixture.controls.brake.dispatch("pointercancel", { pointerId: 7 });
  fixture.controls.reverse.dispatch("pointerdown", { pointerId: 8 });
  fixture.setNow(6);
  fixture.controls.reverse.dispatch("lostpointercapture", { pointerId: 8 });

  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: -0.3, brake: 0.3 },
  );
  assert.equal(fixture.controls.brake.capturedPointers.size, 0);
  fixture.adapter.dispose();
});

test("blur releases pointer input without cancelling a held keyboard source", () => {
  const fixture = createFixture();
  fixture.longitudinalTimeline.enqueueButton(
    "FORWARD",
    true,
    0,
    "keyboard",
  );
  fixture.setNow(1);
  fixture.controls.forward.dispatch("pointerdown", { pointerId: 9 });
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

  fixture.controls.steerLeft.dispatch("pointerdown", { pointerId: 10 });
  fixture.controls.forward.dispatch("pointerdown", { pointerId: 11 });
  fixture.setNow(5);
  fixture.setHidden(true);
  fixture.documentTarget.dispatch("visibilitychange");

  assert.deepEqual(fixture.steeringTimeline.consumeInterval(0, 10).command, {
    mode: "RATE",
    value: 0.5,
  });
  assert.deepEqual(
    fixture.longitudinalTimeline.consumeInterval(0, 10).command,
    { throttle: 0.5, brake: 0 },
  );
  assert.doesNotThrow(() => fixture.adapter.dispose());
  assert.equal(totalListenerCount(fixture), 0);
});

test("capture failure is fail-closed and emits no semantic command", () => {
  const fixture = createFixture();
  fixture.controls.forward.failCapture = true;
  fixture.controls.forward.dispatch("pointerdown", { pointerId: 12 });

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
