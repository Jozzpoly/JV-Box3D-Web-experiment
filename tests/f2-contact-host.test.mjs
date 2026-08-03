import test from "node:test";
import assert from "node:assert/strict";
import { F2ContactHost } from "../.test-dist/app/f2-contact-host.js";

class FakeAnimationFrames {
  nextId = 1;
  callbacks = new Map();

  request(callback) {
    const id = this.nextId++;
    this.callbacks.set(id, callback);
    return id;
  }

  cancel(handle) {
    this.callbacks.delete(handle);
  }

  run(timeMs) {
    const entry = this.callbacks.entries().next().value;
    assert.ok(entry, "missing scheduled frame");
    const [id, callback] = entry;
    this.callbacks.delete(id);
    callback(timeMs);
  }
}

test("F1 fixed-step host drives F2 contact and restart leaves no scheduled resources", async () => {
  for (let cycle = 0; cycle < 2; cycle += 1) {
    const frames = new FakeAnimationFrames();
    let latest = null;
    const host = await F2ContactHost.start({
      now: () => 0,
      animationFrames: frames,
      windowTarget: new EventTarget(),
      documentTarget: new EventTarget(),
      isDocumentHidden: () => false,
      onPhysicsStep: (_step, _input, snapshot) => {
        latest = snapshot;
      },
    });

    assert.equal(host.snapshot.counters.bodyCount, 2);
    assert.equal(frames.callbacks.size, 1);
    for (let frame = 0; frame < 180; frame += 1) {
      frames.run(frame * (1000 / 60));
    }
    assert.ok(latest !== null);
    assert.ok(host.snapshot.contactBeginEvents >= 1);
    assert.ok(host.snapshot.activeContacts >= 1);
    for (const id of ["B0", "B1", "B2", "B3", "B4", "B5"]) {
      assert.equal(host.validationLevels.find((level) => level.id === id)?.status, "PASS");
    }

    host.dispose();
    host.dispose();
    assert.equal(frames.callbacks.size, 0);
    assert.throws(() => host.snapshot, /disposed/);
  }
});
