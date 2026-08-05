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

function cpuAsset({ alpha = 1, materialIndex = 0 } = {}) {
  return {
    nodes: [],
    rootNodeIndices: [],
    nodeIndexByName: new Map(),
    materials: [
      {
        name: "fixture",
        baseColorFactor: [0.25, 0.5, 0.75, alpha],
        doubleSided: false,
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
            normals: new Float32Array([
              0, 0, 1,
              0, 0, 1,
              0, 0, 1,
            ]),
            texcoord0: null,
            indices: new Uint16Array([0, 1, 2]),
            materialIndex,
          },
        ],
      },
    ],
  };
}

function gpuAsset({ disposed = false, materialIndex = 0, indexCount = 3 } = {}) {
  return {
    meshes: [
      {
        primitives: [
          {
            positionBuffer: { id: "position" },
            normalBuffer: { id: "normal" },
            texcoord0Buffer: null,
            indexBuffer: { id: "index" },
            indexCount,
            materialIndex,
          },
        ],
      },
    ],
    gpuByteLength: 78,
    disposed,
    dispose() {},
  };
}

function command(worldFromNode = identityMatrix(), nodeIndex = 0) {
  return {
    nodeIndex,
    nodeName: `Root${nodeIndex}`,
    meshIndex: 0,
    worldFromNode,
  };
}

function fakeGl() {
  let nextId = 1;
  const draws = [];
  const stateChanges = [];
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
    shaderSource() {},
    compileShader() {},
    getShaderParameter() {
      return true;
    },
    getShaderInfoLog() {
      return null;
    },
    deleteShader() {},
    createProgram() {
      return { id: nextId++ };
    },
    attachShader() {},
    linkProgram() {},
    getProgramParameter() {
      return true;
    },
    getProgramInfoLog() {
      return null;
    },
    deleteProgram() {},
    getAttribLocation(_program, name) {
      return name === "aPosition" ? 0 : 1;
    },
    getUniformLocation(_program, name) {
      return { name };
    },
    getError() {
      return 0;
    },
    enable(value) {
      stateChanges.push(["enable", value]);
    },
    disable(value) {
      stateChanges.push(["disable", value]);
    },
    depthMask() {},
    depthFunc() {},
    colorMask() {},
    cullFace() {},
    frontFace() {},
    useProgram() {},
    uniformMatrix4fv() {},
    uniformMatrix3fv() {},
    uniform3f() {},
    uniform1f() {},
    uniform4f() {},
    bindBuffer() {},
    enableVertexAttribArray() {},
    vertexAttribPointer() {},
    drawElements(...args) {
      draws.push(args);
    },
  };
  return { gl, draws, stateChanges };
}

function expectPreflightFailure({
  expected,
  cpu = cpuAsset(),
  gpu = gpuAsset(),
  plan = [command()],
  viewProjection = identityMatrix(),
}) {
  const fixture = fakeGl();
  const renderer = createRigidLitNormalRendererV1(fixture.gl);
  assert.throws(
    () => renderer.render(cpu, gpu, plan, viewProjection),
    expected,
  );
  assert.equal(fixture.draws.length, 0);
  assert.equal(fixture.stateChanges.length, 0);
  renderer.dispose();
}

test("a late invalid command prevents the entire frame from drawing", () => {
  const invalid = identityMatrix();
  invalid[12] = Number.NaN;
  expectPreflightFailure({
    plan: [command(identityMatrix(), 0), command(invalid, 1)],
    expected: /draw command 1 worldFromNode\[12\] must be finite/,
  });
});

test("invalid camera matrices and empty plans fail before WebGL state changes", () => {
  const invalidViewProjection = identityMatrix();
  invalidViewProjection[5] = Number.POSITIVE_INFINITY;
  expectPreflightFailure({
    viewProjection: invalidViewProjection,
    expected: /viewProjection\[5\] must be finite/,
  });
  expectPreflightFailure({
    plan: [],
    expected: /draw plan contains no commands/,
  });
});

test("disposed GPU assets and CPU-GPU identity drift fail before drawing", () => {
  expectPreflightFailure({
    gpu: gpuAsset({ disposed: true }),
    expected: /GPU asset is disposed/,
  });
  expectPreflightFailure({
    gpu: gpuAsset({ materialIndex: null }),
    expected: /CPU\/GPU material indices differ/,
  });
  expectPreflightFailure({
    gpu: gpuAsset({ indexCount: 6 }),
    expected: /inconsistent triangle indices/,
  });
});

test("renderer enforces opaque finite base color even when capability validation is bypassed", () => {
  expectPreflightFailure({
    cpu: cpuAsset({ alpha: 0.5 }),
    expected: /baseColorFactor\[3\] must equal opaque alpha 1/,
  });
  const invalidColor = cpuAsset();
  invalidColor.materials[0].baseColorFactor[1] = Number.NaN;
  expectPreflightFailure({
    cpu: invalidColor,
    expected: /baseColorFactor\[1\] must be finite in \[0,1\]/,
  });
});
