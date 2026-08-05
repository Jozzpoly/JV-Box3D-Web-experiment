import test from "node:test";
import assert from "node:assert/strict";
import { createRigidLitNormalRendererV1 } from "../.test-dist/render/rigid-lit-normal-renderer.js";

function identityMatrix() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function cpuAsset({
  normals = true,
  texcoord0 = false,
  alpha = 1,
  doubleSided = true,
} = {}) {
  return {
    nodes: [],
    rootNodeIndices: [],
    nodeIndexByName: new Map(),
    materials: [
      {
        name: "fixture",
        baseColorFactor: [0.25, 0.5, 0.75, alpha],
        doubleSided,
      },
    ],
    primitiveCount: 1,
    triangleCount: 1,
    meshes: [
      {
        name: "fixture",
        primitives: [
          {
            positions: new Float32Array([
              0, 0, 0,
              1, 0, 0,
              0, 1, 0,
            ]),
            normals: normals
              ? new Float32Array([
                  0, 0, 1,
                  0, 0, 1,
                  0, 0, 1,
                ])
              : null,
            texcoord0: texcoord0
              ? new Float32Array([0, 0, 1, 0, 0, 1])
              : null,
            indices: new Uint16Array([0, 1, 2]),
            materialIndex: 0,
          },
        ],
      },
    ],
  };
}

function gpuAsset({ normals = true, texcoord0 = false } = {}) {
  return {
    meshes: [
      {
        primitives: [
          {
            positionBuffer: { id: "position" },
            normalBuffer: normals ? { id: "normal" } : null,
            texcoord0Buffer: texcoord0 ? { id: "uv" } : null,
            indexBuffer: { id: "index" },
            indexCount: 3,
            materialIndex: 0,
          },
        ],
      },
    ],
    gpuByteLength: 78,
    disposed: false,
    dispose() {},
  };
}

function drawPlan(worldFromNode = identityMatrix()) {
  return [
    {
      nodeIndex: 0,
      nodeName: "Root",
      meshIndex: 0,
      worldFromNode,
    },
  ];
}

function fakeGl({
  shaderCompileResults = [],
  linkResult = true,
  drawGlError = 0,
} = {}) {
  let nextId = 1;
  let shaderCheck = 0;
  let pendingError = 0;
  const shaderSources = [];
  const deletedShaders = [];
  const deletedPrograms = [];
  const draws = [];
  const normalMatrices = [];
  const states = [];
  const uniform1f = [];
  const gl = {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
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
    createShader() {
      return { id: nextId++ };
    },
    shaderSource(_shader, source) {
      shaderSources.push(source);
    },
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
      return { id: nextId++ };
    },
    attachShader() {},
    linkProgram() {},
    getProgramParameter() {
      return linkResult;
    },
    getProgramInfoLog() {
      return "fixture link failure";
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
    uniformMatrix3fv(_location, _transpose, value) {
      normalMatrices.push([...value]);
    },
    uniform3f() {},
    uniform1f(location, value) {
      uniform1f.push([location.name, value]);
    },
    uniform4f() {},
    bindBuffer() {},
    enableVertexAttribArray() {},
    vertexAttribPointer() {},
    drawElements(mode, count, type, offset) {
      draws.push({ mode, count, type, offset });
      pendingError = drawGlError;
    },
  };
  return {
    gl,
    shaderSources,
    deletedShaders,
    deletedPrograms,
    draws,
    normalMatrices,
    states,
    uniform1f,
  };
}

function approximate(actual, expected, epsilon = 1e-6) {
  assert.equal(actual.length, expected.length);
  for (let index = 0; index < expected.length; index += 1) {
    assert.ok(
      Math.abs(actual[index] - expected[index]) <= epsilon,
      `component ${index}: expected ${expected[index]}, received ${actual[index]}`,
    );
  }
}

test("shared lit renderer draws with inverse-transpose normals and explicit linear-to-sRGB output", () => {
  const fixture = fakeGl();
  const renderer = createRigidLitNormalRendererV1(fixture.gl);
  const stretched = new Float32Array([
    2, 0, 0, 0,
    0, 3, 0, 0,
    0, 0, 4, 0,
    7, 8, 9, 1,
  ]);

  const receipt = renderer.render(
    cpuAsset(),
    gpuAsset(),
    drawPlan(stretched),
    identityMatrix(),
  );
  assert.deepEqual(receipt, {
    drawCommandCount: 1,
    primitiveDrawCount: 1,
  });
  assert.equal(fixture.draws.length, 1);
  approximate(fixture.normalMatrices[0], [
    0.5, 0, 0,
    0, 1 / 3, 0,
    0, 0, 0.25,
  ]);
  assert.match(fixture.shaderSources[1], /linearToSrgb/);
  assert.match(fixture.shaderSources[1], /gl_FrontFacing/);
  assert.ok(
    fixture.states.some(
      ([operation, value]) =>
        operation === "disable" && value === fixture.gl.CULL_FACE,
    ),
  );
  assert.ok(
    fixture.uniform1f.some(
      ([name, value]) => name === "uDoubleSided" && value === 1,
    ),
  );

  renderer.dispose();
  renderer.dispose();
  assert.equal(fixture.deletedPrograms.length, 1);
  assert.equal(fixture.deletedShaders.length, 2);
});

test("missing NORMAL, unexpected UV and singular transforms fail before drawing", () => {
  const fixture = fakeGl();
  const renderer = createRigidLitNormalRendererV1(fixture.gl);

  assert.throws(
    () =>
      renderer.render(
        cpuAsset({ normals: false }),
        gpuAsset({ normals: false }),
        drawPlan(),
        identityMatrix(),
      ),
    /missing NORMAL/,
  );
  assert.equal(fixture.draws.length, 0);

  assert.throws(
    () =>
      renderer.render(
        cpuAsset({ texcoord0: true }),
        gpuAsset({ texcoord0: true }),
        drawPlan(),
        identityMatrix(),
      ),
    /unsupported TEXCOORD_0/,
  );
  assert.equal(fixture.draws.length, 0);

  const singular = new Float32Array([
    1, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
  assert.throws(
    () =>
      renderer.render(
        cpuAsset(),
        gpuAsset(),
        drawPlan(singular),
        identityMatrix(),
      ),
    /singular or ill-conditioned|singular/,
  );
  assert.equal(fixture.draws.length, 0);
  renderer.dispose();
});

test("a silent WebGL frame error prevents a successful render receipt", () => {
  const fixture = fakeGl({ drawGlError: 0x0502 });
  const renderer = createRigidLitNormalRendererV1(fixture.gl);
  assert.throws(
    () =>
      renderer.render(
        cpuAsset(),
        gpuAsset(),
        drawPlan(),
        identityMatrix(),
      ),
    /WebGL error 0x502/,
  );
  assert.equal(fixture.draws.length, 1);
  renderer.dispose();
});

test("shader and link failures clean every allocated program resource", () => {
  const shaderFailure = fakeGl({ shaderCompileResults: [true, false] });
  assert.throws(
    () => createRigidLitNormalRendererV1(shaderFailure.gl),
    /shader compilation failed: fixture shader failure/,
  );
  assert.deepEqual(shaderFailure.deletedShaders, [2, 1]);
  assert.deepEqual(shaderFailure.deletedPrograms, []);

  const linkFailure = fakeGl({ linkResult: false });
  assert.throws(
    () => createRigidLitNormalRendererV1(linkFailure.gl),
    /program link failed: fixture link failure/,
  );
  assert.equal(linkFailure.deletedPrograms.length, 1);
  assert.equal(linkFailure.deletedShaders.length, 2);
});

test("disposed renderers reject further frames", () => {
  const fixture = fakeGl();
  const renderer = createRigidLitNormalRendererV1(fixture.gl);
  renderer.dispose();
  assert.throws(
    () =>
      renderer.render(
        cpuAsset(),
        gpuAsset(),
        drawPlan(),
        identityMatrix(),
      ),
    /disposed rigid lit-normal renderer/,
  );
});
