import test from "node:test";
import assert from "node:assert/strict";
import {
  createVehicleVisualUnlitPassFactoryV1,
  createVehicleVisualUnlitPassV1,
} from "../.test-dist/render/vehicle-visual-unlit-pass.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
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
    if (url.endsWith("m6-rig-proof.glb")) {
      return response({ jsonValue: null, bytes: generated.glb });
    }
    return { ok: false, status: 404 };
  };
}

function fakeGl({ shaderCompileResults = [], failDrawAt = -1 } = {}) {
  let nextId = 1;
  let shaderCheck = 0;
  let drawIndex = 0;
  const deletedBuffers = [];
  const deletedShaders = [];
  const deletedPrograms = [];
  const draws = [];
  const states = [];
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
      return { kind: "buffer", id: nextId++ };
    },
    bindBuffer() {},
    bufferData() {},
    getError() {
      return 0;
    },
    deleteBuffer(buffer) {
      deletedBuffers.push(buffer.id);
    },
    createShader() {
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
    getAttribLocation() {
      return 0;
    },
    getUniformLocation(_program, name) {
      return { name };
    },
    enable(value) {
      states.push(["enable", value]);
    },
    disable(value) {
      states.push(["disable", value]);
    },
    depthMask() {},
    depthFunc() {},
    colorMask() {},
    cullFace() {},
    frontFace() {},
    useProgram() {},
    uniformMatrix4fv() {},
    uniform4f() {},
    enableVertexAttribArray() {},
    vertexAttribPointer() {},
    drawElements(mode, count, type, offset) {
      drawIndex += 1;
      if (drawIndex === failDrawAt) {
        throw new Error("fixture draw failure");
      }
      draws.push({ mode, count, type, offset });
    },
  };
  return {
    gl,
    draws,
    states,
    deletedBuffers,
    deletedShaders,
    deletedPrograms,
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
          end: Object.freeze({ x: 0, y: 1, z: index * 0.1 }),
          lengthMeters: 1,
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

function generatedFixture() {
  return buildTinyVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
}

test("tiny unlit pass draws all 18 parts and 8 segments before publishing first frame", async () => {
  const generated = generatedFixture();
  const fixture = fakeGl();
  const firstFrames = [];
  const requests = [];
  const pass = await createVehicleVisualUnlitPassFactoryV1({
    pageBaseUrl: "https://example.test/demo/",
    packageUrl: "vehicles/tiny/vehicle.visual.json",
    fetcher: fixtureFetcher(generated, requests),
    onFirstFrame: (receipt) => firstFrames.push(receipt),
  })(fixture.gl, new AbortController().signal);

  assert.equal(pass.phase, "BEFORE_DEBUG_VEHICLE");
  pass.render(renderFrame(fixture.gl));
  assert.equal(fixture.draws.length, 26);
  assert.equal(firstFrames.length, 1);
  assert.equal(firstFrames[0].capability.capabilityId, "UNLIT_POSITION_BASE_COLOR_V1");
  assert.equal(firstFrames[0].drawCommandCount, 26);
  assert.equal(firstFrames[0].primitiveDrawCount, 26);
  assert.equal(firstFrames[0].generation, 1);
  assert.equal(firstFrames[0].stepIndex, 7);
  assert.equal(requests.length, 2);

  pass.render(renderFrame(fixture.gl));
  assert.equal(fixture.draws.length, 52);
  assert.equal(firstFrames.length, 1);
  assert.ok(
    fixture.states.some(
      ([operation, value]) =>
        operation === "enable" && value === fixture.gl.CULL_FACE,
    ),
  );

  pass.dispose();
  assert.equal(fixture.deletedPrograms.length, 1);
  assert.deepEqual(fixture.deletedBuffers, [4, 3, 2, 1]);
  assert.equal(fixture.deletedShaders.length, 2);
  pass.dispose();
  assert.equal(fixture.deletedPrograms.length, 1);
  assert.deepEqual(fixture.deletedBuffers, [4, 3, 2, 1]);
});

test("a failed draw cannot publish the first-frame receipt", async () => {
  const generated = generatedFixture();
  const fixture = fakeGl({ failDrawAt: 10 });
  const firstFrames = [];
  const pass = await createVehicleVisualUnlitPassV1(
    fixture.gl,
    new AbortController().signal,
    {
      pageBaseUrl: "https://example.test/",
      packageUrl: "vehicles/tiny/vehicle.visual.json",
      fetcher: fixtureFetcher(generated),
      onFirstFrame: (receipt) => firstFrames.push(receipt),
    },
  );

  assert.throws(
    () => pass.render(renderFrame(fixture.gl)),
    /fixture draw failure/,
  );
  assert.equal(fixture.draws.length, 9);
  assert.deepEqual(firstFrames, []);
  pass.dispose();
});

test("fragment shader failure releases shaders and the already-loaded GPU asset", async () => {
  const generated = generatedFixture();
  const fixture = fakeGl({ shaderCompileResults: [true, false] });

  await assert.rejects(
    () =>
      createVehicleVisualUnlitPassV1(
        fixture.gl,
        new AbortController().signal,
        {
          pageBaseUrl: "https://example.test/",
          packageUrl: "vehicles/tiny/vehicle.visual.json",
          fetcher: fixtureFetcher(generated),
        },
      ),
    /Vehicle visual unlit shader compilation failed: fixture shader failure/,
  );

  assert.deepEqual(fixture.deletedBuffers, [4, 3, 2, 1]);
  assert.deepEqual(fixture.deletedShaders, [6, 5]);
  assert.deepEqual(fixture.deletedPrograms, []);
});

test("an already-aborted factory performs no fetch or GPU allocation", async () => {
  const controller = new AbortController();
  controller.abort();
  const fixture = fakeGl();
  let fetched = false;

  await assert.rejects(
    () =>
      createVehicleVisualUnlitPassV1(fixture.gl, controller.signal, {
        pageBaseUrl: "https://example.test/",
        packageUrl: "vehicles/tiny/vehicle.visual.json",
        fetcher: async () => {
          fetched = true;
          throw new Error("should not fetch");
        },
      }),
    /AbortError|aborted/,
  );

  assert.equal(fetched, false);
  assert.deepEqual(fixture.deletedBuffers, []);
  assert.deepEqual(fixture.deletedShaders, []);
  assert.deepEqual(fixture.deletedPrograms, []);
});
