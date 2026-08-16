import test from 'node:test';
import assert from 'node:assert/strict';
import { LongitudinalInputTimeline } from '../.test-dist/input/longitudinal-input-timeline.js';
import {
  PointerAnalogDriveAdapter,
  resolvePointerAnalogPedalTravelPx,
  resolvePointerAnalogPedalValue,
} from '../.test-dist/input/pointer-analog-drive-adapter.js';

function near(actual, expected, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${actual} != ${expected}`,
  );
}

class FakeTarget extends EventTarget {
  captures = new Set();
  height = 120;
  throwOnCapture = false;

  setPointerCapture(id) {
    if (this.throwOnCapture) throw new Error('capture rejected');
    this.captures.add(id);
  }

  releasePointerCapture(id) {
    this.captures.delete(id);
  }

  hasPointerCapture(id) {
    return this.captures.has(id);
  }

  getBoundingClientRect() {
    return { height: this.height };
  }
}

function pointerEvent(type, { id = 1, y = 100, button = 0 } = {}) {
  const event = new Event(type, { cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: id },
    clientY: { value: y },
    button: { value: button },
  });
  return event;
}

function click() {
  return new Event('click', { cancelable: true });
}

function createRig(options = {}) {
  let now = 0;
  let hidden = false;
  const timeline = new LongitudinalInputTimeline(0);
  const throttle = new FakeTarget();
  const brake = new FakeTarget();
  const direction = new FakeTarget();
  const windowTarget = new EventTarget();
  const documentTarget = new EventTarget();
  const pedalStates = [];
  const directions = [];
  const adapter = new PointerAnalogDriveAdapter({
    windowTarget,
    documentTarget,
    isDocumentHidden: () => hidden,
    timeline,
    controls: { throttle, brake, direction },
    now: () => now,
    onPedalStateChange: (...state) => pedalStates.push(state),
    onDirectionChange: (value) => directions.push(value),
    ...options,
  });
  return {
    timeline,
    throttle,
    brake,
    direction,
    windowTarget,
    documentTarget,
    pedalStates,
    directions,
    adapter,
    setNow(value) { now = value; },
    setHidden(value) { hidden = value; },
  };
}

test('pedal travel scales with target height and remains bounded', () => {
  assert.equal(resolvePointerAnalogPedalTravelPx(100), 82);
  assert.equal(resolvePointerAnalogPedalTravelPx(20), 72);
  assert.equal(resolvePointerAnalogPedalTravelPx(1000), 132);
});

test('pedal mapping has start slop, continuous travel and clamp', () => {
  assert.equal(resolvePointerAnalogPedalValue(96, 100, 82), 0);
  near(resolvePointerAnalogPedalValue(56, 100, 82), 38 / 76);
  assert.equal(resolvePointerAnalogPedalValue(-100, 100, 82), 1);
  assert.equal(resolvePointerAnalogPedalValue(160, 100, 82), 0);
});

test('invalid pedal geometry is rejected explicitly', () => {
  assert.throws(() => resolvePointerAnalogPedalTravelPx(0), RangeError);
  assert.throws(
    () => resolvePointerAnalogPedalValue(10, 10, 0),
    RangeError,
  );
});

test('timeline integrates analog throttle at sub-step timestamps', () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueAnalogThrottle(0.5, 5, 'pedal');
  const sample = timeline.consumeInterval(0, 10);
  near(sample.command.throttle, 0.25);
  near(sample.integratedThrottleMs, 2.5);
});

test('digital keyboard demand overrides analog while active and analog resumes', () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueAnalogThrottle(0.4, 0, 'touch');
  timeline.enqueueButton('FORWARD', true, 2, 'keyboard');
  timeline.enqueueButton('FORWARD', false, 6, 'keyboard');
  const sample = timeline.consumeInterval(0, 10);
  near(sample.integratedThrottleMs, 0.8 + 4 + 1.6);
  near(sample.command.throttle, 0.64);
});

test('analog brake uses strongest active source', () => {
  const timeline = new LongitudinalInputTimeline(0);
  timeline.enqueueAnalogBrake(0.3, 0, 'a');
  timeline.enqueueAnalogBrake(0.7, 0, 'b');
  const sample = timeline.consumeInterval(0, 10);
  near(sample.command.brake, 0.7);
});

test('adapter drives throttle continuously and releases to zero', () => {
  const rig = createRig();
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 7, y: 100 }));
  rig.setNow(2);
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 7, y: 50 }));
  rig.setNow(6);
  rig.throttle.dispatchEvent(pointerEvent('pointerup', { id: 7, y: 50 }));

  const sample = rig.timeline.consumeInterval(0, 10);
  assert.ok(sample.integratedThrottleMs > 0);
  assert.ok(sample.integratedThrottleMs < 10);
  assert.equal(sample.command.brake, 0);
  assert.deepEqual(rig.pedalStates.at(-1), ['THROTTLE', 0, false]);
  assert.equal(rig.throttle.captures.size, 0);
  rig.adapter.dispose();
});

test('D to R while throttle is held re-signs the same value at toggle time', () => {
  const rig = createRig();
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 1, y: 100 }));
  rig.setNow(1);
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 1, y: 40 }));
  rig.setNow(5);
  rig.direction.dispatchEvent(click());

  const sample = rig.timeline.consumeInterval(0, 10);
  const analog = sample.consumedEvents.filter(
    (event) => event.kind === 'LONGITUDINAL_ANALOG_THROTTLE',
  );
  assert.equal(analog.length, 2);
  assert.ok(analog[0].value > 0);
  near(analog[1].value, -analog[0].value);
  assert.equal(analog[1].timestampMs, 5);
  assert.deepEqual(rig.directions, ['D', 'R']);
  assert.ok(sample.integratedThrottleMs < 0);
  rig.adapter.dispose();
});

test('throttle and brake are independent multitouch captures', () => {
  const rig = createRig();
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 1, y: 100 }));
  rig.brake.dispatchEvent(pointerEvent('pointerdown', { id: 2, y: 100 }));
  rig.setNow(1);
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 1, y: 35 }));
  rig.brake.dispatchEvent(pointerEvent('pointermove', { id: 2, y: 55 }));

  const sample = rig.timeline.consumeInterval(0, 10);
  assert.ok(sample.command.throttle > 0);
  assert.ok(sample.command.brake > 0);
  assert.deepEqual([...rig.throttle.captures], [1]);
  assert.deepEqual([...rig.brake.captures], [2]);
  rig.adapter.dispose();
});

test('a second pointer cannot steal an already-owned pedal', () => {
  const rig = createRig();
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 1, y: 100 }));
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 2, y: 100 }));
  assert.deepEqual([...rig.throttle.captures], [1]);

  rig.setNow(1);
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 2, y: 20 }));
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 1, y: 60 }));
  const sample = rig.timeline.consumeInterval(0, 10);
  assert.ok(sample.command.throttle > 0);
  rig.adapter.dispose();
});

test('pointer capture failure is fail-closed and queues no analog demand', () => {
  const rig = createRig();
  rig.throttle.throwOnCapture = true;
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 5, y: 100 }));
  rig.setNow(1);
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 5, y: 20 }));
  const sample = rig.timeline.consumeInterval(0, 10);
  assert.equal(sample.command.throttle, 0);
  assert.equal(rig.pedalStates.length, 0);
  rig.adapter.dispose();
});

test('pointercancel semantically releases pedal input', () => {
  const rig = createRig();
  rig.brake.dispatchEvent(pointerEvent('pointerdown', { id: 8, y: 100 }));
  rig.setNow(1);
  rig.brake.dispatchEvent(pointerEvent('pointermove', { id: 8, y: 30 }));
  rig.setNow(4);
  rig.brake.dispatchEvent(pointerEvent('pointercancel', { id: 8, y: 30 }));
  const sample = rig.timeline.consumeInterval(0, 10);
  assert.ok(sample.integratedBrakeMs > 0);
  const settled = rig.timeline.consumeInterval(10, 20);
  assert.equal(settled.command.brake, 0);
  assert.equal(rig.brake.captures.size, 0);
  rig.adapter.dispose();
});

test('lostpointercapture releases semantic input even when browser capture is already gone', () => {
  const rig = createRig();
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 9, y: 100 }));
  rig.setNow(1);
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 9, y: 25 }));
  rig.throttle.captures.delete(9);
  rig.setNow(3);
  rig.throttle.dispatchEvent(pointerEvent('lostpointercapture', { id: 9, y: 25 }));
  const sample = rig.timeline.consumeInterval(0, 10);
  assert.ok(sample.integratedThrottleMs > 0);
  const settled = rig.timeline.consumeInterval(10, 20);
  assert.equal(settled.command.throttle, 0);
  rig.adapter.dispose();
});

test('visibility hidden clears owned analog input and preserves D/R state', () => {
  const rig = createRig();
  rig.direction.dispatchEvent(click());
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 3, y: 100 }));
  rig.setNow(1);
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 3, y: 30 }));
  rig.setNow(4);
  rig.setHidden(true);
  rig.documentTarget.dispatchEvent(new Event('visibilitychange'));
  const sample = rig.timeline.consumeInterval(0, 10);
  assert.ok(sample.integratedThrottleMs < 0);
  const settled = rig.timeline.consumeInterval(10, 20);
  assert.equal(settled.command.throttle, 0);
  assert.equal(rig.directions.at(-1), 'R');
  rig.adapter.dispose();
});

test('pagehide clears both active pedals without resetting direction selector', () => {
  const rig = createRig();
  rig.direction.dispatchEvent(click());
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 11, y: 100 }));
  rig.brake.dispatchEvent(pointerEvent('pointerdown', { id: 12, y: 100 }));
  rig.setNow(1);
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 11, y: 30 }));
  rig.brake.dispatchEvent(pointerEvent('pointermove', { id: 12, y: 40 }));
  rig.setNow(3);
  rig.windowTarget.dispatchEvent(new Event('pagehide'));
  const sample = rig.timeline.consumeInterval(0, 10);
  assert.ok(sample.integratedThrottleMs < 0);
  assert.ok(sample.integratedBrakeMs > 0);
  const settled = rig.timeline.consumeInterval(10, 20);
  assert.equal(settled.command.throttle, 0);
  assert.equal(settled.command.brake, 0);
  assert.equal(rig.directions.at(-1), 'R');
  assert.equal(rig.throttle.captures.size, 0);
  assert.equal(rig.brake.captures.size, 0);
  rig.adapter.dispose();
});

test('dispose clears active input and removes pointer ownership', () => {
  const rig = createRig();
  rig.throttle.dispatchEvent(pointerEvent('pointerdown', { id: 21, y: 100 }));
  rig.setNow(1);
  rig.throttle.dispatchEvent(pointerEvent('pointermove', { id: 21, y: 20 }));
  rig.setNow(2);
  rig.adapter.dispose();
  const sample = rig.timeline.consumeInterval(0, 10);
  assert.ok(sample.integratedThrottleMs > 0);
  const settled = rig.timeline.consumeInterval(10, 20);
  assert.equal(settled.command.throttle, 0);
  assert.equal(rig.throttle.captures.size, 0);
});
