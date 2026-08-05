import test from "node:test";
import assert from "node:assert/strict";
import {
  installVehicleVisualWithDebugFallbackV1,
} from "../.test-dist/render/vehicle-visual-debug-fallback.js";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function fakeInstallation() {
  let active = true;
  let uninstallCount = 0;
  return {
    installation: Object.freeze({
      get active() {
        return active;
      },
      uninstall() {
        if (!active) {
          return;
        }
        active = false;
        uninstallCount += 1;
      },
    }),
    get uninstallCount() {
      return uninstallCount;
    },
  };
}

function setup({ install } = {}) {
  const visibility = [];
  const states = [];
  const errors = [];
  let firstFrame = null;
  const installation = fakeInstallation();
  const renderer = {
    installRenderPass(factory) {
      return install?.(factory) ?? Promise.resolve(installation.installation);
    },
    setDebugVehicleVisible(visible) {
      visibility.push(visible);
    },
  };
  const controller = installVehicleVisualWithDebugFallbackV1({
    renderer,
    createPassFactory(onFirstFrame) {
      firstFrame = onFirstFrame;
      return async () => ({
        phase: "BEFORE_DEBUG_VEHICLE",
        render() {},
        dispose() {},
      });
    },
    onStateChange: (state) => states.push(state),
    reportError: (error) => errors.push(error),
  });
  return {
    controller,
    visibility,
    states,
    errors,
    installation,
    get firstFrame() {
      return firstFrame;
    },
  };
}

test("debug vehicle remains visible until the first complete visual frame", async () => {
  const fixture = setup();
  assert.deepEqual(fixture.visibility, [true]);
  assert.deepEqual(fixture.states, ["LOADING"]);

  await fixture.controller.installation;
  assert.equal(typeof fixture.firstFrame, "function");
  assert.deepEqual(fixture.visibility, [true]);
  assert.equal(fixture.controller.state, "LOADING");

  fixture.firstFrame();
  assert.deepEqual(fixture.visibility, [true, false]);
  assert.deepEqual(fixture.states, ["LOADING", "ACTIVE"]);
  assert.equal(fixture.controller.state, "ACTIVE");
  assert.deepEqual(fixture.errors, []);
});

test("a later render-pass failure restores the debug vehicle", async () => {
  const fixture = setup();
  await fixture.controller.installation;
  fixture.firstFrame();

  const failure = new Error("frame failed");
  fixture.controller.handleRenderPassError(failure);

  assert.deepEqual(fixture.visibility, [true, false, true]);
  assert.deepEqual(fixture.states, ["LOADING", "ACTIVE", "FALLBACK"]);
  assert.equal(fixture.controller.state, "FALLBACK");
  assert.deepEqual(fixture.errors, [failure]);
});

test("installation rejection keeps the debug fallback visible", async () => {
  const failure = new Error("asset load failed");
  const fixture = setup({
    install() {
      return Promise.reject(failure);
    },
  });

  await fixture.controller.installation;

  assert.deepEqual(fixture.visibility, [true, true]);
  assert.deepEqual(fixture.states, ["LOADING", "FALLBACK"]);
  assert.equal(fixture.controller.state, "FALLBACK");
  assert.deepEqual(fixture.errors, [failure]);
});

test("dispose during installation prevents late visual activation", async () => {
  const pending = deferred();
  const fixture = setup({
    install() {
      return pending.promise;
    },
  });

  await Promise.resolve();
  fixture.controller.dispose();
  pending.resolve(fixture.installation.installation);
  await fixture.controller.installation;

  assert.deepEqual(fixture.visibility, [true]);
  assert.deepEqual(fixture.states, ["LOADING", "DISPOSED"]);
  assert.equal(fixture.controller.state, "DISPOSED");
  assert.equal(fixture.installation.uninstallCount, 1);

  fixture.firstFrame();
  assert.deepEqual(fixture.visibility, [true]);
});

test("dispose after installation uninstalls exactly once", async () => {
  const fixture = setup();
  await fixture.controller.installation;

  fixture.controller.dispose();
  fixture.controller.dispose();

  assert.equal(fixture.installation.uninstallCount, 1);
  assert.deepEqual(fixture.states, ["LOADING", "DISPOSED"]);
  assert.deepEqual(fixture.errors, []);
});
