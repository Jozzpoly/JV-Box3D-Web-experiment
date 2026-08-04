import test from "node:test";
import assert from "node:assert/strict";
import { M6SceneRenderPassHostV1 } from "../.test-dist/render/m6-scene-render-pass.js";

function pass({ phase = "BEFORE_DEBUG_VEHICLE", render, dispose }) {
  return {
    phase,
    render: render ?? (() => {}),
    dispose: dispose ?? (() => {}),
  };
}

const viewProjection = new Float32Array(16);
const trace = { generation: 1, stepIndex: 1 };

test("passes render only in their declared phase and receive the owned context", async () => {
  const gl = { id: "shared-webgl" };
  const errors = [];
  const calls = [];
  const host = new M6SceneRenderPassHostV1(gl, (error) => errors.push(error));

  await host.install(async (receivedGl, signal) => {
    assert.equal(receivedGl, gl);
    assert.equal(signal.aborted, false);
    return pass({
      phase: "BEFORE_DEBUG_VEHICLE",
      render(frame) {
        calls.push(`before:${frame.gl.id}:${frame.trace.stepIndex}`);
        assert.equal(frame.viewProjection, viewProjection);
      },
    });
  });
  await host.install(async () =>
    pass({
      phase: "AFTER_DEBUG_VEHICLE",
      render(frame) {
        calls.push(`after:${frame.gl.id}:${frame.trace.stepIndex}`);
      },
    }),
  );

  host.render("BEFORE_DEBUG_VEHICLE", viewProjection, trace);
  host.render("AFTER_DEBUG_VEHICLE", viewProjection, trace);

  assert.deepEqual(calls, ["before:shared-webgl:1", "after:shared-webgl:1"]);
  assert.deepEqual(errors, []);
});

test("one failing pass is removed without stopping healthy passes", async () => {
  const errors = [];
  const calls = [];
  let failedDisposals = 0;
  const host = new M6SceneRenderPassHostV1({}, (error) => errors.push(error));

  const failed = await host.install(async () =>
    pass({
      render() {
        calls.push("failed-render");
        throw new Error("pass render failed");
      },
      dispose() {
        failedDisposals += 1;
      },
    }),
  );
  const healthy = await host.install(async () =>
    pass({
      render() {
        calls.push("healthy-render");
      },
    }),
  );

  host.render("BEFORE_DEBUG_VEHICLE", viewProjection, trace);
  host.render("BEFORE_DEBUG_VEHICLE", viewProjection, trace);

  assert.deepEqual(calls, [
    "failed-render",
    "healthy-render",
    "healthy-render",
  ]);
  assert.equal(failed.active, false);
  assert.equal(healthy.active, true);
  assert.equal(failedDisposals, 1);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /pass render failed/);
});

test("uninstall is owned, immediate and idempotent", async () => {
  let disposals = 0;
  let renders = 0;
  const host = new M6SceneRenderPassHostV1({}, () => {});
  const installation = await host.install(async () =>
    pass({
      render() {
        renders += 1;
      },
      dispose() {
        disposals += 1;
      },
    }),
  );

  installation.uninstall();
  installation.uninstall();
  host.render("BEFORE_DEBUG_VEHICLE", viewProjection, trace);

  assert.equal(installation.active, false);
  assert.equal(disposals, 1);
  assert.equal(renders, 0);
});

test("host disposal aborts pending installation and disposes a late result", async () => {
  let resolveFactory;
  let observedSignal;
  let disposals = 0;
  const host = new M6SceneRenderPassHostV1({}, () => {});
  const pending = host.install(
    async (_gl, signal) =>
      new Promise((resolve) => {
        observedSignal = signal;
        resolveFactory = resolve;
      }),
  );

  host.dispose();
  assert.equal(host.disposed, true);
  assert.equal(observedSignal.aborted, true);
  resolveFactory(
    pass({
      dispose() {
        disposals += 1;
      },
    }),
  );

  await assert.rejects(pending, /AbortError|aborted/);
  assert.equal(disposals, 1);
});

test("host disposal releases installed passes in reverse order once", async () => {
  const order = [];
  const host = new M6SceneRenderPassHostV1({}, () => {});
  const first = await host.install(async () =>
    pass({ dispose: () => order.push("first") }),
  );
  const second = await host.install(async () =>
    pass({ dispose: () => order.push("second") }),
  );

  host.dispose();
  host.dispose();

  assert.deepEqual(order, ["second", "first"]);
  assert.equal(first.active, false);
  assert.equal(second.active, false);
});
