import test from "node:test";
import assert from "node:assert/strict";
import { JvWorldRendererMobile } from "../.test-dist/render/jv-world-renderer-mobile.js";
import { readJvScanRenderStats } from "../.test-dist/render/jv-scan-render-stats.js";

class FakeImage {
  static instances = [];
  onload = null;
  onerror = null;
  decoding = "auto";
  #src = "";
  constructor() { FakeImage.instances.push(this); }
  set src(value) { this.#src = value; }
  get src() { return this.#src; }
}

globalThis.Image = FakeImage;

globalThis.location = { search: "?jvScanCull=0" };

function fakeGl({ uint32 = false } = {}) {
  let objectId = 0;
  const calls = [];
  const gl = {
    canvas: {},
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    UNSIGNED_SHORT: 0x1403,
    UNSIGNED_INT: 0x1405,
    TRIANGLES: 0x0004,
    TEXTURE_2D: 0x0de1,
    RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_MAG_FILTER: 0x2800,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    LINEAR: 0x2601,
    CLAMP_TO_EDGE: 0x812f,
    TEXTURE0: 0x84c0,
    UNPACK_FLIP_Y_WEBGL: 0x9240,
    createShader() { return { id: ++objectId, kind: "shader" }; },
    shaderSource() {},
    compileShader() {},
    getShaderParameter() { return true; },
    getShaderInfoLog() { return null; },
    deleteShader() {},
    createProgram() { return { id: ++objectId, kind: "program" }; },
    attachShader() {},
    linkProgram() {},
    getProgramParameter() { return true; },
    getProgramInfoLog() { return null; },
    deleteProgram() {},
    getAttribLocation(_program, name) {
      return name === "aPosition" ? 0 : name === "aNormal" ? 1 : 2;
    },
    getUniformLocation(_program, name) { return { name }; },
    createBuffer() { return { id: ++objectId, kind: "buffer" }; },
    deleteBuffer() {},
    bindBuffer(target, buffer) { calls.push(["bindBuffer", target, buffer]); },
    bufferData(target, data, usage) { calls.push(["bufferData", target, data.constructor.name, data.length, usage]); },
    createTexture() { return { id: ++objectId, kind: "texture" }; },
    deleteTexture() {},
    bindTexture(target, texture) { calls.push(["bindTexture", target, texture]); },
    texImage2D() {},
    texParameteri() {},
    pixelStorei() {},
    getExtension(name) {
      return name === "OES_element_index_uint" && uint32 ? {} : null;
    },
    useProgram(program) { calls.push(["useProgram", program]); },
    uniformMatrix4fv(location) { calls.push(["uniformMatrix4fv", location.name]); },
    uniform4f(location) { calls.push(["uniform4f", location.name]); },
    activeTexture(unit) { calls.push(["activeTexture", unit]); },
    uniform1i(location, value) { calls.push(["uniform1i", location.name, value]); },
    enableVertexAttribArray(index) { calls.push(["enableVertexAttribArray", index]); },
    vertexAttribPointer(index) { calls.push(["vertexAttribPointer", index]); },
    drawElements(mode, count, type, offset) { calls.push(["drawElements", mode, count, type, offset]); },
  };
  return { gl, calls };
}

function mesh({ textureUrl, maximumIndex = 2, vertexCount = 3 } = {}) {
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = maximumIndex <= 2
    ? new Uint32Array([0, 1, 2])
    : new Uint32Array([0, 1, maximumIndex]);
  return {
    positions,
    normals,
    uvs,
    indices,
    bounds: {
      minimum: { x: -0.25, y: -0.25, z: -0.25 },
      maximum: { x: 0.25, y: 0.25, z: 0.25 },
    },
    textureUrl,
    color: [0.68, 0.68, 0.64, 1],
    doubleSided: true,
  };
}

function world(groups) {
  return {
    schema: "JV_WEB_E2R_WORLD_V1",
    nativeAuthorityCommit: "0".repeat(40),
    spawn: { x: 0, y: 0, z: 0 },
    boxes: [],
    capsules: [],
    offroad: {
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 0, 1]),
      normals: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0]),
      indices: new Uint32Array([0, 1, 2]),
      color: [0.4, 0.4, 0.4, 1],
    },
    scan: {
      source: "JSPREV2",
      packId: "renderer-test",
      origin: { x: 0, y: 0, z: 0 },
      worldBounds: {
        minimum: { x: -1, y: -1, z: -1 },
        maximum: { x: 1, y: 1, z: 1 },
      },
      collision: {
        positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 0, 1]),
        indices: new Uint32Array([0, 1, 2]),
        bounds: {
          minimum: { x: 0, y: 0, z: 0 },
          maximum: { x: 1, y: 0, z: 1 },
        },
        color: [0.6, 0.6, 0.6, 1],
      },
      groups,
      tileCount: 1,
      groupCount: groups.length,
      textureCount: groups.length,
      vertexCount: groups.reduce((sum, group) => sum + group.positions.length / 3, 0),
      indexCount: groups.reduce((sum, group) => sum + group.indices.length, 0),
      triangleCount: groups.reduce((sum, group) => sum + group.indices.length / 3, 0),
      manifestBytes: 1,
      binaryBytes: 1,
      textureBytes: groups.length,
      totalBytes: groups.length + 2,
      estimatedCpuGeometryBytes: 1,
      estimatedGpuGeometryBytes: 1,
    },
    scanStatus: "LOADED",
  };
}

function identity() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}


test("scan texture readiness is published only after async image upload completes", () => {
  FakeImage.instances.length = 0;
  const { gl } = fakeGl({ uint32: true });
  const renderer = new JvWorldRendererMobile(gl, world([
    mesh({ textureUrl: "https://example.test/texture-ready.png" }),
  ]));

  renderer.render(identity());
  assert.equal(readJvScanRenderStats(gl.canvas)?.readyTextures, 0);
  assert.equal(FakeImage.instances.length, 1);
  FakeImage.instances[0].onload?.();
  renderer.render(identity());

  const stats = readJvScanRenderStats(gl.canvas);
  assert.ok(stats);
  assert.equal(stats.readyTextures, 1);
  assert.equal(stats.failedTextures, 0);
  assert.ok(Number.isFinite(stats.textureUploadMs));
  assert.ok(stats.textureUploadMs >= 0);
  renderer.dispose();
});

test("scan rendering configures the shared textured pass once for multiple visible groups", () => {
  const { gl, calls } = fakeGl({ uint32: true });
  const renderer = new JvWorldRendererMobile(gl, world([
    mesh({ textureUrl: "https://example.test/a.png" }),
    mesh({ textureUrl: "https://example.test/b.png" }),
  ]));
  calls.length = 0;

  renderer.render(identity());

  assert.equal(calls.filter(([name]) => name === "useProgram").length, 2,
    "one solid offroad program + one shared scan textured program");
  assert.equal(calls.filter(([name]) => name === "uniform1i").length, 1,
    "scan sampler binding is configured once per scan pass");
  assert.equal(calls.filter(([name]) => name === "activeTexture").length, 1,
    "active texture unit is configured once per scan pass");
  assert.equal(calls.filter(([name]) => name === "drawElements").length, 3,
    "offroad plus two scan groups render exactly once each");

  renderer.dispose();
});

test("small scan groups use direct Uint16 even without Uint32 extension", () => {
  const { gl, calls } = fakeGl({ uint32: false });
  new JvWorldRendererMobile(gl, world([
    mesh({ textureUrl: "https://example.test/a.png" }),
  ]));
  const elementUploads = calls.filter(
    ([name, target]) => name === "bufferData" && target === gl.ELEMENT_ARRAY_BUFFER,
  );
  assert.equal(elementUploads.length, 2, "offroad and scan each upload one EBO");
  assert.equal(elementUploads[1][2], "Uint16Array");
});

test("small scan groups keep zero-copy Uint32 when the extension is available", () => {
  const withExtension = fakeGl({ uint32: true });
  new JvWorldRendererMobile(withExtension.gl, world([
    mesh({ textureUrl: "https://example.test/small-u32.png" }),
  ]));
  const uploads = withExtension.calls.filter(
    ([name, target]) => name === "bufferData" && target === withExtension.gl.ELEMENT_ARRAY_BUFFER,
  );
  assert.equal(uploads[1][2], "Uint32Array");
});

test("large scan indices use direct Uint32 only when the extension is available", () => {
  const large = mesh({
    textureUrl: "https://example.test/large.png",
    maximumIndex: 65_536,
    vertexCount: 65_537,
  });
  const withExtension = fakeGl({ uint32: true });
  new JvWorldRendererMobile(withExtension.gl, world([large]));
  const uploads = withExtension.calls.filter(
    ([name, target]) => name === "bufferData" && target === withExtension.gl.ELEMENT_ARRAY_BUFFER,
  );
  assert.equal(uploads[1][2], "Uint32Array");
});

test("large scan indices fall back to Uint16 chunking without the extension", () => {
  const large = mesh({
    textureUrl: "https://example.test/large-fallback.png",
    maximumIndex: 65_536,
    vertexCount: 65_537,
  });
  const withoutExtension = fakeGl({ uint32: false });
  const renderer = new JvWorldRendererMobile(withoutExtension.gl, world([large]));
  renderer.render(identity());
  const uploads = withoutExtension.calls.filter(
    ([name, target]) =>
      name === "bufferData" &&
      target === withoutExtension.gl.ELEMENT_ARRAY_BUFFER,
  );
  assert.equal(uploads[1][2], "Uint16Array");
  assert.equal(
    withoutExtension.calls.some(
      ([name, _mode, _count, type]) =>
        name === "drawElements" && type === withoutExtension.gl.UNSIGNED_INT,
    ),
    false,
    "fallback path must never issue an UNSIGNED_INT draw",
  );
});
