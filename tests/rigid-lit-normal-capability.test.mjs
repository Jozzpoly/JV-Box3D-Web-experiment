import test from "node:test";
import assert from "node:assert/strict";
import {
  assertRigidLitNormalBaseColorCapabilityV1,
  RIGID_LIT_NORMAL_BASE_COLOR_CAPABILITY_ID,
} from "../.test-dist/render/rigid-lit-normal-capability.js";

function identityMatrix() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function primitive(overrides = {}) {
  return {
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
    materialIndex: 0,
    ...overrides,
  };
}

function asset({
  primitives = [primitive(), primitive({ materialIndex: null })],
  materials = [
    {
      name: "body",
      baseColorFactor: [0.2, 0.4, 0.8, 1],
      doubleSided: true,
    },
  ],
} = {}) {
  return {
    nodes: [
      {
        index: 0,
        name: "Root",
        meshIndex: 0,
        children: [],
        localFromParent: identityMatrix(),
      },
    ],
    rootNodeIndices: [0],
    nodeIndexByName: new Map([["Root", 0]]),
    meshes: [{ name: "fixture", primitives }],
    materials,
    primitiveCount: primitives.length,
    triangleCount: primitives.length,
  };
}

test("lit-normal capability accepts complete opaque normal-bearing geometry", () => {
  assert.deepEqual(assertRigidLitNormalBaseColorCapabilityV1(asset()), {
    capabilityId: RIGID_LIT_NORMAL_BASE_COLOR_CAPABILITY_ID,
    meshCount: 1,
    primitiveCount: 2,
    vertexCount: 6,
    materialCount: 1,
    defaultMaterialPrimitiveCount: 1,
    doubleSidedPrimitiveCount: 1,
    floatIntegrity: {
      nodeMatrixValueCount: 16,
      positionVertexCount: 6,
      normalVectorCount: 6,
      texcoordPairCount: 0,
    },
  });
});

test("every rendered primitive must provide NORMAL", () => {
  assert.throws(
    () =>
      assertRigidLitNormalBaseColorCapabilityV1(
        asset({ primitives: [primitive({ normals: null })] }),
      ),
    /missing required NORMAL/,
  );
});

test("the factor-only lit capability rejects unconsumed texture coordinates", () => {
  assert.throws(
    () =>
      assertRigidLitNormalBaseColorCapabilityV1(
        asset({
          primitives: [
            primitive({
              texcoord0: new Float32Array([0, 0, 1, 0, 0, 1]),
            }),
          ],
        }),
      ),
    /does not consume texture coordinates/,
  );
});

test("partial base-color alpha is rejected instead of silently rendered opaque", () => {
  assert.throws(
    () =>
      assertRigidLitNormalBaseColorCapabilityV1(
        asset({
          primitives: [primitive()],
          materials: [
            {
              name: "transparent-looking",
              baseColorFactor: [1, 1, 1, 0.5],
              doubleSided: false,
            },
          ],
        }),
      ),
    /only opaque alpha 1 is supported/,
  );
});

test("missing materials and invalid normals fail before capability publication", () => {
  assert.throws(
    () =>
      assertRigidLitNormalBaseColorCapabilityV1(
        asset({ primitives: [primitive({ materialIndex: 3 })] }),
      ),
    /references missing material 3/,
  );

  const normals = new Float32Array([
    0, 0, 2,
    0, 0, 1,
    0, 0, 1,
  ]);
  assert.throws(
    () =>
      assertRigidLitNormalBaseColorCapabilityV1(
        asset({ primitives: [primitive({ normals })] }),
      ),
    /NORMAL vector 0 has length 2/,
  );
});

test("empty assets are rejected as non-renderable", () => {
  assert.throws(
    () =>
      assertRigidLitNormalBaseColorCapabilityV1(
        asset({ primitives: [], materials: [] }),
      ),
    /no renderable primitives/,
  );
});
