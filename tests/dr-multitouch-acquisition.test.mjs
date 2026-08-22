import test from 'node:test';
import assert from 'node:assert/strict';
import { LongitudinalInputTimeline } from '../.test-dist/input/longitudinal-input-timeline.js';
import { PointerAnalogDriveAdapter } from '../.test-dist/input/pointer-analog-drive-adapter.js';

class FakeTarget extends EventTarget {
  captures = new Set();
  top = 20;
  height = 120;

  setPointerCapture(id) { this.captures.add(id); }
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

test('second pointer can switch D/R while throttle remains owned', () => {
  let now = 0;
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
    isDocumentHidden: () => false,
    timeline,
    controls: { throttle, brake, direction },
    now: () => now,
    onDirectionChange: value => directions.push(value),
  });

  throttle.dispatchEvent(pointer('pointerdown', 1, 80));
  assert.deepEqual([...throttle.captures], [1]);

  now = 2;
  direction.dispatchEvent(pointer('pointerdown', 2));
  direction.dispatchEvent(pointer('pointerup', 2));

  assert.deepEqual(directions, ['D', 'R']);
  assert.deepEqual([...throttle.captures], [1]);

  const sample = timeline.consumeInterval(0, 10);
  const throttleEvents = sample.consumedEvents.filter(
    event => event.kind === 'LONGITUDINAL_ANALOG_THROTTLE',
  );
  assert.ok(throttleEvents.at(-2).value > 0);
  assert.equal(throttleEvents.at(-1).value, -throttleEvents.at(-2).value);
  assert.equal(throttleEvents.at(-1).timestampMs, 2);

  adapter.dispose();
});
