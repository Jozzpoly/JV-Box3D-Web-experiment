import test from "node:test";
import assert from "node:assert/strict";
import {
  createJvScanWebGlPolicy,
} from "../.test-dist/render/jv-scan-webgl-policy.js";

function fakeWebGl() {
  const calls = {
    bindings: [],
    parameters: [],
    pixelStore: [],
    deleted: [],
  };
  let nextTexture = 1;
  let binding = null;
  const gl = {
    TEXTURE_2D: 0x0de1,
    TEXTURE_BINDING_2D: 0x8069,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_MAG_FILTER: 0x2800,
    UNPACK_FLIP_Y_WEBGL: 0x9240,
    NEAREST: 0x2600,
    LINEAR: 0x2601,
    createTexture() {
      return { id: nextTexture++ };
    },
    deleteTexture(texture) {
      calls.deleted.push(texture);
      if (binding === texture) {
        binding = null;
      }
    },
    bindTexture(target, texture) {
      assert.equal(target, gl.TEXTURE_2D);
      binding = texture;
      calls.bindings.push(texture);
    },
    texParameteri(target, pname, parameter) {
      assert.equal(target, gl.TEXTURE_2D);
      calls.parameters.push({ texture: binding, pname, parameter });
    },
    pixelStorei(pname, parameter) {
      calls.pixelStore.push({ pname, parameter });
    },
    getParameter(pname) {
      assert.equal(pname, gl.TEXTURE_BINDING_2D);
      return binding;
    },
  };
  return { gl, calls, currentBinding: () => binding };
}

test("scan WebGL policy restores native no-flip and nearest filtering", () => {
  const fixture = fakeWebGl();
  const policy = createJvScanWebGlPolicy(fixture.gl, "nearest");
  const gl = policy.context;
  const texture = gl.createTexture();
  assert.ok(texture !== null);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MAG_FILTER,
    gl.LINEAR,
  );
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  assert.deepEqual(
    fixture.calls.parameters.map(({ pname, parameter }) => ({
      pname,
      parameter,
    })),
    [
      { pname: gl.TEXTURE_MIN_FILTER, parameter: gl.NEAREST },
      { pname: gl.TEXTURE_MAG_FILTER, parameter: gl.NEAREST },
    ],
  );
  assert.deepEqual(fixture.calls.pixelStore, [
    { pname: gl.UNPACK_FLIP_Y_WEBGL, parameter: 0 },
  ]);
  policy.dispose();
});

test("texture filter changes update every live texture and preserve binding", () => {
  const fixture = fakeWebGl();
  const policy = createJvScanWebGlPolicy(fixture.gl, "nearest");
  const first = policy.context.createTexture();
  const second = policy.context.createTexture();
  assert.ok(first !== null && second !== null);
  policy.context.bindTexture(policy.context.TEXTURE_2D, second);

  fixture.calls.parameters.length = 0;
  policy.setTextureFilter("linear");
  assert.deepEqual(fixture.calls.parameters, [
    {
      texture: first,
      pname: fixture.gl.TEXTURE_MIN_FILTER,
      parameter: fixture.gl.LINEAR,
    },
    {
      texture: first,
      pname: fixture.gl.TEXTURE_MAG_FILTER,
      parameter: fixture.gl.LINEAR,
    },
    {
      texture: second,
      pname: fixture.gl.TEXTURE_MIN_FILTER,
      parameter: fixture.gl.LINEAR,
    },
    {
      texture: second,
      pname: fixture.gl.TEXTURE_MAG_FILTER,
      parameter: fixture.gl.LINEAR,
    },
  ]);
  assert.equal(fixture.currentBinding(), second);

  policy.context.deleteTexture(first);
  fixture.calls.parameters.length = 0;
  policy.setTextureFilter("nearest");
  assert.deepEqual(fixture.calls.parameters, [
    {
      texture: second,
      pname: fixture.gl.TEXTURE_MIN_FILTER,
      parameter: fixture.gl.NEAREST,
    },
    {
      texture: second,
      pname: fixture.gl.TEXTURE_MAG_FILTER,
      parameter: fixture.gl.NEAREST,
    },
  ]);
  policy.dispose();
  assert.throws(
    () => policy.setTextureFilter("linear"),
    /disposed/,
  );
});
