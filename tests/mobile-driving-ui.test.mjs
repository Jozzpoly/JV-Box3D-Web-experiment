import test from "node:test";
import assert from "node:assert/strict";
import { MobileDrivingUi } from "../.test-dist/mobile-driving-ui.js";

class FakeStyle {
  values = new Map();
  writes = 0;

  setProperty(name, value) {
    this.values.set(name, value);
    this.writes += 1;
  }
}

class FakeTarget {
  style = new FakeStyle();
  attributes = new Map();

  toggleAttribute(name, force) {
    const next = force ?? !this.attributes.has(name);
    if (next) {
      this.attributes.set(name, "");
    } else {
      this.attributes.delete(name);
    }
    return next;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  attr(name) {
    return this.attributes.get(name);
  }

  has(name) {
    return this.attributes.has(name);
  }
}

class FakeFrames {
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

  get pending() {
    return this.callbacks.size;
  }

  flush(time = 0) {
    const callbacks = [...this.callbacks.values()];
    this.callbacks.clear();
    for (const callback of callbacks) {
      callback(time);
    }
  }
}

function createUi() {
  const steering = new FakeTarget();
  const throttle = new FakeTarget();
  const brake = new FakeTarget();
  const direction = new FakeTarget();
  const frames = new FakeFrames();
  const ui = new MobileDrivingUi(
    { steering, throttle, brake, direction },
    frames,
  );
  return { ui, steering, throttle, brake, direction, frames };
}

test("constructor presents neutral D state without scheduling a frame", () => {
  const rig = createUi();
  assert.equal(rig.frames.pending, 0);
  assert.equal(rig.steering.attr("aria-valuenow"), "0");
  assert.equal(rig.throttle.attr("aria-valuenow"), "0");
  assert.equal(rig.brake.attr("aria-valuenow"), "0");
  assert.equal(rig.direction.attr("data-direction"), "D");
  assert.equal(rig.direction.attr("aria-pressed"), "false");
});

test("continuous updates coalesce to one frame and commit only the latest state", () => {
  const rig = createUi();
  rig.ui.beginGeneration(1);
  const steeringWrites = rig.steering.style.writes;
  const throttleWrites = rig.throttle.style.writes;

  rig.ui.setSteering(1, 0.2, true);
  rig.ui.setSteering(1, 0.6, true);
  rig.ui.setSteering(1, -0.4, true);
  rig.ui.setPedal(1, "THROTTLE", 0.2, true);
  rig.ui.setPedal(1, "THROTTLE", 0.8, true);

  assert.equal(rig.frames.pending, 1);
  assert.equal(rig.steering.style.writes, steeringWrites);
  assert.equal(rig.throttle.style.writes, throttleWrites);

  rig.frames.flush();

  assert.equal(rig.frames.pending, 0);
  assert.equal(rig.steering.attr("aria-valuenow"), "-40");
  assert.equal(rig.steering.style.values.get("--steering-angle"), "48.00deg");
  assert.equal(rig.throttle.attr("aria-valuenow"), "80");
  assert.equal(rig.throttle.style.values.get("--pedal-value"), "0.8000");
});

test("new generation synchronously neutralizes HUD and rejects stale callbacks", () => {
  const rig = createUi();
  rig.ui.beginGeneration(1);
  rig.ui.setPedal(1, "THROTTLE", 0.75, true);
  rig.ui.setDirection(1, "R");
  rig.frames.flush();
  assert.equal(rig.throttle.attr("aria-valuenow"), "75");
  assert.equal(rig.direction.attr("data-direction"), "R");

  rig.ui.beginGeneration(2);
  assert.equal(rig.frames.pending, 0);
  assert.equal(rig.throttle.attr("aria-valuenow"), "0");
  assert.equal(rig.direction.attr("data-direction"), "D");

  rig.ui.setPedal(1, "THROTTLE", 1, true);
  rig.ui.setDirection(1, "R");
  assert.equal(rig.frames.pending, 0);
  assert.equal(rig.throttle.attr("aria-valuenow"), "0");
  assert.equal(rig.direction.attr("data-direction"), "D");
});

test("generation numbers must increase monotonically", () => {
  const rig = createUi();
  rig.ui.beginGeneration(2);
  assert.throws(() => rig.ui.beginGeneration(2), RangeError);
  assert.throws(() => rig.ui.beginGeneration(1), RangeError);
});

test("single active pedal dims only its peer; simultaneous pedals remain equally active", () => {
  const rig = createUi();
  rig.ui.beginGeneration(1);

  rig.ui.setPedal(1, "THROTTLE", 0.5, true);
  rig.frames.flush();
  assert.equal(rig.throttle.has("data-active"), true);
  assert.equal(rig.throttle.has("data-peer-active"), false);
  assert.equal(rig.brake.has("data-active"), false);
  assert.equal(rig.brake.has("data-peer-active"), true);

  rig.ui.setPedal(1, "BRAKE", 0.4, true);
  rig.frames.flush();
  assert.equal(rig.throttle.has("data-active"), true);
  assert.equal(rig.brake.has("data-active"), true);
  assert.equal(rig.throttle.has("data-peer-active"), false);
  assert.equal(rig.brake.has("data-peer-active"), false);
});

test("dispose cancels pending visual work and ignores later callbacks", () => {
  const rig = createUi();
  rig.ui.beginGeneration(1);
  rig.ui.setSteering(1, 1, true);
  assert.equal(rig.frames.pending, 1);
  rig.ui.dispose();
  assert.equal(rig.frames.pending, 0);
  rig.ui.setSteering(1, -1, true);
  assert.equal(rig.frames.pending, 0);
});
