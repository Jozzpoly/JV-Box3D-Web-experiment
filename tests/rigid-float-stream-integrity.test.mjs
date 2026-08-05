import test from "node:test";
import assert from "node:assert/strict";
import {
  assertRigidFloatStreamIntegrityV1,
  RIGID_NORMAL_LENGTH_TOLERANCE_V1,
} from "../.test-dist/visual/rigid-float-stream-integrity.js";

function identityMatrix() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function asset(overrides = {}) {
  const primitive = {
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
    texcoord0: new Float32Array([
      0, 0,
      1, 0,
      0, 1,
    ]),
    indices: new Uint16Array([0, 1, 2]),
    materialIndex: null,
    ...overrides.primitive,
  };
  return {
    nodes: [
      {
        index: 0,
        name: "Root",
        meshIndex: 0,
        children: [],
        localFromParent: overrides.nodeMatrix ?? identityMatrix(),
      },
    ],
    rootNodeIndices: [0],
    nodeIndexByName: new Map([["Root", 0]]),
    meshes: [{ name: null, primitives: [primitive] }],
    materials: [],
    primitiveCount: 1,
    triangleCount: 1,
  };
}

test("shared float-stream gate measures one valid rigid primitive", () => {
  assert.deepEqual(assertRigidFloatStreamIntegrityV1(asset()), {
    nodeMatrixValueCount: 16,
    positionValueCount: 9,
    normalVectorCount: 3,
    texcoordValueCount: 6,
  });
});

test("non-finite POSITION and TEXCOORD_0 values fail closed", () => {
  const positions = new Float32Array([
    0, 0, 0,
    1, Number.NaN, 0,
    0, 1, 0,
  ]);
  assert.throws(
    () => assertRigidFloatStreamIntegrityV1(asset({ primitive: { positions } })),
    /POSITION\[4\] must be finite/,
  );

  const texcoord0 = new Float32Array([
    0, 0,
    1, Number.POSITIVE_INFINITY,
    0, 1,
  ]);
  assert.throws(
    () => assertRigidFloatStreamIntegrityV1(asset({ primitive: { texcoord0 } })),
    /TEXCOORD_0\[3\] must be finite/,
  );
});

test("NORMAL vectors must be complete, finite and normalized", () => {
  const zeroNormal = new Float32Array([
    0, 0, 1,
    0, 0, 0,
    0, 0, 1,
  ]);
  assert.throws(
    () =>
      assertRigidFloatStreamIntegrityV1(
        asset({ primitive: { normals: zeroNormal } }),
      ),
    /NORMAL vector 1 has length 0/,
  );

  const longNormal = new Float32Array([
    0, 0, 1,
    0, 0, 1 + RIGID_NORMAL_LENGTH_TOLERANCE_V1 * 2,
    0, 0, 1,
  ]);
  assert.throws(
    () =>
      assertRigidFloatStreamIntegrityV1(
        asset({ primitive: { normals: longNormal } }),
      ),
    /NORMAL vector 1 has length/,
  );

  const mismatched = new Float32Array([0, 0, 1]);
  assert.throws(
    () =>
      assertRigidFloatStreamIntegrityV1(
        asset({ primitive: { normals: mismatched } }),
      ),
    /NORMAL count differs from POSITION/,
  );
});

test("node matrices and UV counts are validated before rendering", () => {
  const matrix = identityMatrix();
  matrix[10] = Number.NaN;
  assert.throws(
    () => assertRigidFloatStreamIntegrityV1(asset({ nodeMatrix: matrix })),
    /localFromParent\[10\] must be finite/,
  );

  assert.throws(
    () =>
      assertRigidFloatStreamIntegrityV1(
        asset({ primitive: { texcoord0: new Float32Array([0, 0]) } }),
      ),
    /TEXCOORD_0 count differs from POSITION/,
  );
});

test("missing optional NORMAL and TEXCOORD_0 streams remain valid", () => {
  assert.deepEqual(
    assertRigidFloatStreamIntegrityV1(
      asset({ primitive: { normals: null, texcoord0: null } }),
    ),
    {
      nodeMatrixValueCount: 16,
      positionValueCount: 9,
      normalVectorCount: 0,
      texcoordValueCount: 0,
    },
  );
});
