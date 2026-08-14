import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateJvMeshBounds,
  isJvBoundsVisibleInClipSpace,
} from "../.test-dist/render/jv-frustum-culling.js";

const IDENTITY = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]);

function bounds(minimum, maximum) {
  return { minimum, maximum };
}

test("mesh bounds are derived once from finite vec3 positions", () => {
  assert.deepEqual(
    calculateJvMeshBounds(new Float32Array([
      -2, 3, 4,
      5, -6, 1,
      0, 2, -7,
    ])),
    bounds(
      { x: -2, y: -6, z: -7 },
      { x: 5, y: 3, z: 4 },
    ),
  );
  assert.throws(
    () => calculateJvMeshBounds(new Float32Array([0, 1])),
    /complete vec3/,
  );
  assert.throws(
    () => calculateJvMeshBounds(new Float32Array([0, 1, Number.NaN])),
    /finite positions/,
  );
});

test("clip-space AABB test rejects only a box fully outside one frustum plane", () => {
  assert.equal(
    isJvBoundsVisibleInClipSpace(
      bounds(
        { x: -0.5, y: -0.5, z: -0.5 },
        { x: 0.5, y: 0.5, z: 0.5 },
      ),
      IDENTITY,
    ),
    true,
  );
  assert.equal(
    isJvBoundsVisibleInClipSpace(
      bounds(
        { x: 1.2, y: -0.2, z: -0.2 },
        { x: 2, y: 0.2, z: 0.2 },
      ),
      IDENTITY,
    ),
    false,
  );
  assert.equal(
    isJvBoundsVisibleInClipSpace(
      bounds(
        { x: -0.2, y: -0.2, z: 1.1 },
        { x: 0.2, y: 0.2, z: 3 },
      ),
      IDENTITY,
    ),
    false,
  );
});

test("intersecting and enclosing boxes remain conservatively visible", () => {
  assert.equal(
    isJvBoundsVisibleInClipSpace(
      bounds(
        { x: 0.8, y: -0.2, z: -0.2 },
        { x: 1.2, y: 0.2, z: 0.2 },
      ),
      IDENTITY,
    ),
    true,
  );
  assert.equal(
    isJvBoundsVisibleInClipSpace(
      bounds(
        { x: -100, y: -100, z: -100 },
        { x: 100, y: 100, z: 100 },
      ),
      IDENTITY,
    ),
    true,
  );
});

test("clip transform can move a distant local group into the visible volume", () => {
  const translateToOrigin = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -10, 0, 0, 1,
  ]);
  assert.equal(
    isJvBoundsVisibleInClipSpace(
      bounds(
        { x: 9.5, y: -0.25, z: -0.25 },
        { x: 10.5, y: 0.25, z: 0.25 },
      ),
      translateToOrigin,
    ),
    true,
  );
});
