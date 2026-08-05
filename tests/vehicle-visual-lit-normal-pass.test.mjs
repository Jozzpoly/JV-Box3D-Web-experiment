import test from "node:test";
import assert from "node:assert/strict";
import {
  createVehicleVisualLitNormalPassFactoryV1,
  createVehicleVisualLitNormalPassV1,
} from "../.test-dist/render/vehicle-visual-lit-normal-pass.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import { buildLitNormalVehicleVisualFixture } from "../tools/lit-normal-vehicle-visual-fixture-lib.mjs";
import { buildTinyVehicleVisualFixture } from "../tools/tiny-vehicle-visual-fixture-lib.mjs";

function response({ jsonValue, bytes }) {
  return {
    ok: true,
    status: 200,
    async json() {
      return jsonValue;
    },
    async arrayBuffer() {
      return bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      );
    },
  };
}

function fixtureFetcher(generated, requests = []) {
  return async (url) => {
    requests.push(url);
    if (url.endsWith("vehicle.visual.json")) {
      return response({
        jsonValue: generated.visualPackage,
        bytes: new Uint8Array(),
      });
    }
    if (
      url.endsWith("m6-lit-normal-proof.glb") ||
      url.endsWith("m6-rig-proof.glb")
    ) {
      return response({ jsonValue: null, bytes: generated.glb });
    }
    return { ok: false, status: 404 };
  };
}

function fakeGl({
  shaderCompileResults = [],
  failDrawAt = -1,
  drawGlErrorAt = -1,
} = {}) {
  let nextId = 1;
  let shaderCheck = 0;
  let drawIndex = 0;
  let pendingError = 0;
  let bufferAllocations = 0;
  let shaderAllocations = 0;
  const deletedBuffers = [];
  const deletedShaders = [];
  const deletedPrograms = [];
  const draws = [];
  const normalMatrices = [];
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
    DEPTH_TEST: 0x0b71,
    CULL_FACE: 0x0b44,
    BLEND: 0x0be2,
    SCISSOR_TEST: 0x0c11,
    LESS: 0x0201,
    BACK: 0x0405,
    CCW: 0x0901,
    NO_ERROR: 0,
    createBuffer() {
      bufferAllocations += 1;
      return { kind: "buffer", id: nextId++ };
    },
    bindBuffer() {},
    bufferData() {},
    deleteBuffer(buffer) {
      deletedBuffers.push(buffer.id);
    },
    createShader() {
      shaderAllocations += 1;
      return { kind: "shader", id: nextId++ };
    },
    shaderSource() {},
    compileShader() {},
    getShaderParameter() {
      const result = shaderCompileResults[shaderCheck];
      shaderCheck += 1;
      return result ?? true;
    },
    getShaderInfoLog() {
      return "fixture shader failure";
    },
    deleteShader(shader) {
      deletedShaders.push(shader.id);
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
      deletedPrograms.push(program.id);
    },
    getAttribLocation(_program, name) {
      return name === "aPosition" ? 0 : 1;
    },
    getUniformLocation(_program, name) {
      return { name };
    },
    getError() {
      const result = pendingError;
      pendingError = 0;
      return result;
    },
    enable() {},
    disable() {},
    depthMask() {},
    depthFunc() {},
    colorMask() {},
    cullFace() {},
    frontFace() {},
    useProgram() {},
    uniformMatrix4fv() {},
    uniformMatrix3fv(_location, _transpose, value) {
      normalMatrices.push([...value]);
    },
    uniform3f() {},
    uniform1f() {},
    uniform4f() {},
    enableVertexAttribArray() {},
    vertexAttribPointer() {},
    drawElements(mode, count, type, offset) {
      drawIndex += 1;
      if (drawIndex === failDrawAt) {
        throw new Error("fixture lit draw failure");
      }
      draws.push({ mode, count, type, offset });
      if (drawIndex === drawGlErrorAt) {
        pendingError = 0x0502;
      }
    },
  };
  return {
    gl,
    deletedBuffers,
    deletedShaders,
    deletedPrograms,
    draws,
    normalMatrices,
    get bufferAllocations() {
      return bufferAllocations;
    },
    get shaderAllocations() {
      return shaderAllocations;
    },
  };
}

function identityMatrix() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function visualFrame() {
  const rotation = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });
  return Object.freeze({
    contractVersion: 1,
    generation: 1,
    stepIndex: 7,
    parts: Object.freeze(
      M6_VISUAL_PART_IDS.map((partId, index) =>
        Object.freeze({
          partId,
          transform: Object.freeze({
            position: Object.freeze({ x: index * 0.1, y: 1, z: 0 }),
            rotation,
          }),
        }),
      ),
    ),
    segments: Object.freeze(
      M6_VISUAL_SEGMENT_IDS.map((segmentId, index) =>
        Object.freeze({
          segmentId,
          start: Object.freeze({ x: 0, y: 0, z: index * 0.1 }),
          end: Object.freeze({ x: 0, y: 1.4, z: index * 0.1 }),
          lengthMeters: 1.4,
        }),
      ),
    ),
  });
}

function renderFrame(gl) {
  return Object.freeze({
    gl,
    viewProjection: identityMatrix(),
    trace: Object.freeze({
      generation: 1,
      stepIndex: 7,
      visualFrame: visualFrame(),
    }),
  });
}

function generatedLitFixture() {
  return buildLitNormalVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
}

test("lit-normal pass draws all 18 parts and 8 tapered segments before first-frame publication", async () => {
  const generated = generatedLitFixture();
  const fixture = fakeGl();
  const firstFrames = [];
  const requests = [];
  const pass = await createVehicleVisualLitNormalPassFactoryV1({
    pageBaseUrl: "https://example.test/demo/",
    packageUrl: "vehicles/lit-normal/vehicle.visual.json",
    fetcher: fixtureFetcher(generated, requests),
    onFirstFrame: (receipt) => firstFrames.push(receipt),
  })(fixture.gl, new AbortController().signal);

  assert.equal(pass.phase, "BEFORE_DEBUG_VEHICLE");
  assert.equal(fixture.bufferAllocations, 6);
  pass.render(renderFrame(fixture.gl));
  assert.equal(fixture.draws.length, 26);
  assert.equal(fixture.normalMatrices.length, 26);
  assert.equal(firstFrames.length, 1);
  assert.equal(
    firstFrames[0].capability.capabilityId,
    "LIT_NORMAL_BASE_COLOR_V1",
  );
  assert.equal(firstFrames[0].drawCommandCount, 26);
  assert.equal(firstFrames[0].primitiveDrawCount, 26);
  assert.equal(firstFrames[0].generation, 1);
  assert.equal(firstFrames[0].stepIndex, 7);
  assert.equal(requests.length, 2);

  pass.render(renderFrame(fixture.gl));
  assert.equal(fixture.draws.length, 52);
  assert.equal(firstFrames.length, 1);

  pass.dispose();
  assert.equal(fixture.deletedPrograms.length, 1);
  assert.deepEqual(fixture.deletedBuffers, [6, 5, 4, 3, 2, 1]);
  pass.dispose();
  assert.equal(fixture.deletedPrograms.length, 1);
  assert.deepEqual(fixture.deletedBuffers, [6, 5, 4, 3, 2, 1]);
});

test("hidden lit-normal frames issue zero draws and publish no receipt", async () => {
  const generated = generatedLitFixture();
  const fixture = fakeGl();
  const firstFrames = [];
  let visible = false;
  const pass = await createVehicleVisualLitNormalPassV1(
    fixture.gl,
    new AbortController().signal,
    {
      pageBaseUrl: "https://example.test/",
      packageUrl: "vehicles/lit-normal/vehicle.visual.json",
      fetcher: fixtureFetcher(generated),
      isVisible: () => visible,
      onFirstFrame: (receipt) => firstFrames.push(receipt),
    },
  );

  pass.render(renderFrame(fixture.gl));
  assert.equal(fixture.draws.length, 0);
  assert.equal(firstFrames.length, 0);
  visible = true;
  pass.render(renderFrame(fixture.gl));
  assert.equal(fixture.draws.length, 26);
  assert.equal(firstFrames.length, 1);
  pass.dispose();
});

test("draw and WebGL failures cannot publish the first-frame receipt", async () => {
  const generated = generatedLitFixture();
  for (const fixture of [
    fakeGl({ failDrawAt: 10 }),
    fakeGl({ drawGlErrorAt: 10 }),
  ]) {
    const firstFrames = [];
    const pass = await createVehicleVisualLitNormalPassV1(
      fixture.gl,
      new AbortController().signal,
      {
        pageBaseUrl: "https://example.test/",
        packageUrl: "vehicles/lit-normal/vehicle.visual.json",
        fetcher: fixtureFetcher(generated),
        onFirstFrame: (receipt) => firstFrames.push(receipt),
      },
    );

    assert.throws(
      () => pass.render(renderFrame(fixture.gl)),
      /fixture lit draw failure|WebGL error 0x502/,
    );
    assert.deepEqual(firstFrames, []);
    pass.dispose();
  }
});

test("the old position-only proof is rejected before GPU or shader allocation", async () => {
  const generated = buildTinyVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
  const fixture = fakeGl();

  await assert.rejects(
    () =>
      createVehicleVisualLitNormalPassV1(
        fixture.gl,
        new AbortController().signal,
        {
          pageBaseUrl: "https://example.test/",
          packageUrl: "vehicles/tiny/vehicle.visual.json",
          fetcher: fixtureFetcher(generated),
        },
      ),
    /missing required NORMAL/,
  );
  assert.equal(fixture.bufferAllocations, 0);
  assert.equal(fixture.shaderAllocations, 0);
});

test("fragment shader failure releases the complete loaded GPU asset", async () => {
  const generated = generatedLitFixture();
  const fixture = fakeGl({ shaderCompileResults: [true, false] });

  await assert.rejects(
    () =>
      createVehicleVisualLitNormalPassV1(
        fixture.gl,
        new AbortController().signal,
        {
          pageBaseUrl: "https://example.test/",
          packageUrl: "vehicles/lit-normal/vehicle.visual.json",
          fetcher: fixtureFetcher(generated),
        },
      ),
    /shader compilation failed: fixture shader failure/,
  );
  assert.deepEqual(fixture.deletedBuffers, [6, 5, 4, 3, 2, 1]);
  assert.equal(fixture.deletedShaders.length, 2);
  assert.deepEqual(fixture.deletedPrograms, []);
});

test("an already-aborted lit factory performs no fetch or GPU allocation", async () => {
  const controller = new AbortController();
  controller.abort();
  const fixture = fakeGl();
  let fetched = false;

  await assert.rejects(
    () =>
      createVehicleVisualLitNormalPassV1(fixture.gl, controller.signal, {
        pageBaseUrl: "https://example.test/",
        packageUrl: "vehicles/lit-normal/vehicle.visual.json",
        fetcher: async () => {
          fetched = true;
          throw new Error("should not fetch");
        },
      }),
    /AbortError|aborted/,
  );
  assert.equal(fetched, false);
  assert.equal(fixture.bufferAllocations, 0);
  assert.equal(fixture.shaderAllocations, 0);
});
