import test from 'node:test';
import assert from 'node:assert/strict';
import { LongitudinalInputTimeline } from '../.test-dist/input/longitudinal-input-timeline.js';
import { PointerAnalogDriveAdapter } from '../.test-dist/input/pointer-analog-drive-adapter.js';

class FakeTarget extends EventTarget {
  captures = new Set();
  top = 20;
  height = 120;
  throwOnCapture = false;

  setPointerCapture(id) {
    if (this.throwOnCapture) throw new Error('capture rejected');
    this.captures.add(id);
  }
  releasePointerCapture(id) { this.captures.delete(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  getBoundingClientRect() { return { top: this.top, height: this.height }; }
}

function pointer(type, id, y = 80) {
  const event = new Event(type, { cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: id },
    clientY: { value: y },
    button: { value: 0 },
  });
  return event;
}

function click(detail = 0) {
  const event = new Event('click', { cancelable: true });
  Object.defineProperty(event, 'detail', { value: detail });
  return event;
}

function createRig() {
  let now = 0;
  let hidden = false;
  const timeline = new LongitudinalInputTimeline(0);
  const throttle = new FakeTarget();
  const brake = new FakeTarget();
  const direction = new FakeTarget();
  const windowTarget = new EventTarget();
  const documentTarget = new EventTarget();
  const directions = [];
  const adapter = new PointerAnalogDriveAdapter({
    windowTarget,
    documentTarget,
    isDocumentHidden: () => hidden,
    timeline,
    controls: { throttle, brake, direction },
    now: () => now,
    onDirectionChange: value => directions.push(value),
  });
  return {
    timeline,
    throttle,
    brake,
    direction,
    windowTarget,
    documentTarget,
    directions,
    adapter,
    setNow(value) { now = value; },
    setHidden(value) { hidden = value; },
  };
}

test('second pointer can switch D/R while throttle remains owned', () => {
  const rig = createRig();
  rig.throttle.dispatchEvent(pointer('pointerdown', 1, 80));
  assert.deepEqual([...rig.throttle.captures], [1]);

  rig.setNow(2);
  rig.direction.dispatchEvent(pointer('pointerdown', 2));
  assert.deepEqual([...rig.direction.captures], [2]);
  rig.direction.dispatchEvent(pointer('pointerup', 2));

  assert.deepEqual(rig.directions, ['D', 'R']);
  assert.deepEqual([...rig.throttle.captures], [1]);
  assert.equal(rig.direction.captures.size, 0);

  const sample = rig.timeline.consumeInterval(0, 10);
  const throttleEvents = sample.consumedEvents.filter(
    event => event.kind === 'LONGITUDINAL_ANALOG_THROTTLE',
  );
  assert.ok(throttleEvents.at(-2).value > 0);
  assert.equal(throttleEvents.at(-1).value, -throttleEvents.at(-2).value);
  assert.equal(throttleEvents.at(-1).timestampMs, 2);

  rig.adapter.dispose();
});

test('cancelled D/R pointer releases capture without changing direction', () => {
  const rig = createRig();
  rig.direction.dispatchEvent(pointer('pointerdown', 4));
  assert.deepEqual([...rig.direction.captures], [4]);
  rig.direction.dispatchEvent(pointer('pointercancel', 4));
  assert.deepEqual(rig.directions, ['D']);
  assert.equal(rig.direction.captures.size, 0);
  rig.adapter.dispose();
});

test('pointer-generated click after D/R pointer gesture cannot toggle twice', () => {
  const rig = createRig();
  rig.direction.dispatchEvent(pointer('pointerdown', 5));
  rig.direction.dispatchEvent(pointer('pointerup', 5));
  rig.direction.dispatchEvent(click(1));
  assert.deepEqual(rig.directions, ['D', 'R']);
  rig.adapter.dispose();
});

test('keyboard-style click remains an accessible D/R fallback', () => {
  const rig = createRig();
  rig.direction.dispatchEvent(click(0));
  assert.deepEqual(rig.directions, ['D', 'R']);
  rig.adapter.dispose();
});

test('direction pointer capture failure is fail-closed', () => {
  const rig = createRig();
  rig.direction.throwOnCapture = true;
  rig.direction.dispatchEvent(pointer('pointerdown', 6));
  rig.direction.dispatchEvent(pointer('pointerup', 6));
  assert.deepEqual(rig.directions, ['D']);
  assert.equal(rig.direction.captures.size, 0);
  rig.adapter.dispose();
});

test('visibility loss releases an in-flight D/R pointer without toggling', () => {
  const rig = createRig();
  rig.direction.dispatchEvent(pointer('pointerdown', 7));
  assert.deepEqual([...rig.direction.captures], [7]);
  rig.setHidden(true);
  rig.documentTarget.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(rig.directions, ['D']);
  assert.equal(rig.direction.captures.size, 0);
  rig.adapter.dispose();
});
