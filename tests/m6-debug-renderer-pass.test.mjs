import test from "node:test";
import assert from "node:assert/strict";
import { M6DebugRenderer } from "../.test-dist/render/m6-debug-renderer.js";

function fakeCanvasAndGl() {
  let nextId = 1;
  const events = new Map();
  const deleted = [];
  const draws = [];
  const gl = {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    UNSIGNED_SHORT: 0x1403,
    TRIANGLES: 0x0004,
    LINES: 0x0001,
    DEPTH_TEST: 0x0b71,
    CULL_FACE: 0x0b44,
    BLEND: 0x0be2,
    SCISSOR_TEST: 0x0c11,
    LESS: 0x0201,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    createShader() {
      return { kind: "shader", id: nextId++ };
    },
    shaderSource() {},
    compileShader() {},
    getShaderParameter() {
      return true;
    },
    getShaderInfoLog() {
      return null;
    },
    deleteShader(shader) {
      deleted.push(`shader:${shader.id}`);
    },
    createProgram() {
      return { kind: "program", id: nextId++ };
    },
    attachShader() {},
    linkProgram() {},
    getProgramParameter() {
      return true;
    },
    getProgramInfoLog() {
      return null;
    },
    deleteProgram(program) {
      deleted.push(`program:${program.id}`);
    },
    getAttribLocation() {
      return 0;
    },
    getUniformLocation(_program, name) {
      return { name };
    },
    createBuffer() {
      return { kind: "buffer", id: nextId++ };
    },
    bindBuffer() {},
    bufferData() {},
    deleteBuffer(buffer) {
      deleted.push(`buffer:${buffer.id}`);
    },
    enable() {},
    disable() {},
    depthMask() {},
    depthFunc() {},
    colorMask() {},
    viewport() {},
    clearColor() {},
    clear() {},
    useProgram() {},
    enableVertexAttribArray() {},
    vertexAttribPointer() {},
    uniformMatrix4fv() {},
    uniform4f() {},
    drawElements(mode, count) {
      draws.push({ mode, count });
    },
  };
  const canvas = {
    clientWidth: 640,
    clientHeight: 360,
    width: 0,
    height: 0,
    getContext(kind) {
      assert.equal(kind, "webgl");
      return gl;
    },
    addEventListener(type, listener) {
      events.set(type, listener);
    },
    setPointerCapture() {},
    hasPointerCapture() {
      return false;
    },
    releasePointerCapture() {},
  };
  return { canvas, gl, deleted, draws, events };
}

function trace() {
  const identity = { x: 0, y: 0, z: 0, w: 1 };
  const corner = (z) => ({
    wheelPosition: { x: 0, y: 0.5, z },
    wheelRotation: identity,
  });
  return {
    generation: 1,
    stepIndex: 1,
    chassisPosition: { x: 0, y: 1, z: 0 },
    chassisRotation: identity,
    rackPosition: { x: 0.8, y: 0.8, z: 0 },
    rackRotation: identity,
    visualGeometry: {
      chassisHalfExtents: { x: 1, y: 0.3, z: 0.6 },
      wheelRadius: 0.35,
      wheelWidth: 0.2,
      rackHalfWidth: 0.5,
    },
    corners: [corner(-0.6), corner(0.6), corner(-0.6), corner(0.6)],
  };
}

test("debug renderer owns before/after passes on the same WebGL context", async () => {
  const originalWindow = globalThis.window;
  globalThis.window = { devicePixelRatio: 1 };
  try {
    const fixture = fakeCanvasAndGl();
    const errors = [];
    const phases = [];
    const renderer = new M6DebugRenderer(fixture.canvas, {
      onRenderPassError: (error) => errors.push(error),
    });

    const before = await renderer.installRenderPass(async (gl) => ({
      phase: "BEFORE_DEBUG_VEHICLE",
      render(frame) {
        assert.equal(gl, fixture.gl);
        assert.equal(frame.gl, fixture.gl);
        assert.equal(frame.viewProjection.length, 16);
        phases.push("before");
      },
      dispose() {
        phases.push("dispose-before");
      },
    }));
    const after = await renderer.installRenderPass(async () => ({
      phase: "AFTER_DEBUG_VEHICLE",
      render() {
        phases.push("after");
      },
      dispose() {
        phases.push("dispose-after");
      },
    }));

    renderer.render(trace());
    assert.deepEqual(phases, ["before", "after"]);
    const drawsWithDebugVehicle = fixture.draws.length;

    renderer.setDebugVehicleVisible(false);
    renderer.render(trace());
    const drawsWithoutDebugVehicle =
      fixture.draws.length - drawsWithDebugVehicle;
    assert.ok(drawsWithoutDebugVehicle < drawsWithDebugVehicle);
    assert.deepEqual(phases, ["before", "after", "before", "after"]);
    assert.deepEqual(errors, []);

    renderer.dispose();
    assert.equal(before.active, false);
    assert.equal(after.active, false);
    assert.deepEqual(phases.slice(-2), ["dispose-after", "dispose-before"]);
    assert.equal(
      fixture.deleted.filter((entry) => entry.startsWith("buffer:")).length,
      6,
    );
    assert.equal(
      fixture.deleted.filter((entry) => entry.startsWith("program:")).length,
      1,
    );
  } finally {
    globalThis.window = originalWindow;
  }
});

test("a failing installed pass is isolated from the debug observer", async () => {
  const originalWindow = globalThis.window;
  globalThis.window = { devicePixelRatio: 1 };
  try {
    const fixture = fakeCanvasAndGl();
    const errors = [];
    let disposals = 0;
    const renderer = new M6DebugRenderer(fixture.canvas, {
      onRenderPassError: (error) => errors.push(error),
    });
    const installation = await renderer.installRenderPass(async () => ({
      phase: "BEFORE_DEBUG_VEHICLE",
      render() {
        throw new Error("isolated visual pass failure");
      },
      dispose() {
        disposals += 1;
      },
    }));

    assert.doesNotThrow(() => renderer.render(trace()));
    assert.equal(installation.active, false);
    assert.equal(disposals, 1);
    assert.equal(errors.length, 1);
    assert.match(errors[0].message, /isolated visual pass failure/);
    assert.ok(fixture.draws.length > 0);
    renderer.dispose();
  } finally {
    globalThis.window = originalWindow;
  }
});
