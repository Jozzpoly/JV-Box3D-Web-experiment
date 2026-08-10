import test from "node:test";
import assert from "node:assert/strict";
import {
  assertCheckedWebGlContextHealthy,
  assertNoWebGlError,
  createCheckedWebGlContext,
} from "../.test-dist/render/jv-checked-webgl.js";

function fakeGl() {
  const errors = [];
  const calls = [];
  const gl = {
    NO_ERROR: 0,
    INVALID_ENUM: 0x0500,
    INVALID_VALUE: 0x0501,
    INVALID_OPERATION: 0x0502,
    OUT_OF_MEMORY: 0x0505,
    INVALID_FRAMEBUFFER_OPERATION: 0x0506,
    CONTEXT_LOST_WEBGL: 0x9242,
    getError() {
      return errors.shift() ?? 0;
    },
    bufferData(...args) {
      calls.push(args);
    },
    texImage2D(...args) {
      calls.push(args);
    },
    bindBuffer(...args) {
      calls.push(args);
    },
  };
  return { gl, errors, calls };
}

test("checked WebGL context preserves ordinary bound method calls", () => {
  const fixture = fakeGl();
  const checked = createCheckedWebGlContext(fixture.gl);
  checked.bindBuffer(1, 2);
  checked.bufferData(1, new Uint8Array([1]), 2);
  assertCheckedWebGlContextHealthy(checked);
  assert.equal(fixture.calls.length, 2);
});

test("checked WebGL context fails after a silent buffer upload error", () => {
  const fixture = fakeGl();
  fixture.gl.bufferData = (...args) => {
    fixture.calls.push(args);
    fixture.errors.push(fixture.gl.OUT_OF_MEMORY);
  };
  const checked = createCheckedWebGlContext(fixture.gl);
  assert.throws(
    () => checked.bufferData(1, new Uint8Array([1]), 2),
    /OUT_OF_MEMORY/,
  );
  assert.throws(
    () => assertCheckedWebGlContextHealthy(checked),
    /faulted/,
  );
});

test("an asynchronous texture upload fault remains visible to the next frame", () => {
  const fixture = fakeGl();
  fixture.gl.texImage2D = (...args) => {
    fixture.calls.push(args);
    fixture.errors.push(fixture.gl.INVALID_OPERATION);
  };
  const checked = createCheckedWebGlContext(fixture.gl);
  assert.throws(
    () => checked.texImage2D(1, 2, 3, 4, 5, {}),
    /INVALID_OPERATION/,
  );
  assert.throws(
    () => assertCheckedWebGlContextHealthy(checked),
    /faulted/,
  );
});

test("pre-existing WebGL errors fail before allocating more GPU data", () => {
  const fixture = fakeGl();
  fixture.errors.push(fixture.gl.INVALID_OPERATION);
  assert.throws(
    () => assertNoWebGlError(fixture.gl, "preflight"),
    /INVALID_OPERATION/,
  );
});
