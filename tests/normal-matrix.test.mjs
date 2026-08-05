import test from "node:test";
import assert from "node:assert/strict";
import {
  createNormalMatrix3FromMat4V1,
  writeNormalMatrix3FromMat4V1,
} from "../.test-dist/render/normal-matrix.js";

function approximate(actual, expected, epsilon = 1e-6) {
  assert.equal(actual.length, expected.length);
  for (let index = 0; index < expected.length; index += 1) {
    assert.ok(
      Math.abs(actual[index] - expected[index]) <= epsilon,
      `component ${index}: expected ${expected[index]}, received ${actual[index]}`,
    );
  }
}

function transformDirection3(matrix, vector) {
  return [
    matrix[0] * vector[0] + matrix[3] * vector[1] + matrix[6] * vector[2],
    matrix[1] * vector[0] + matrix[4] * vector[1] + matrix[7] * vector[2],
    matrix[2] * vector[0] + matrix[5] * vector[1] + matrix[8] * vector[2],
  ];
}

function transformDirection4(matrix, vector) {
  return [
    matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8] * vector[2],
    matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9] * vector[2],
    matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2],
  ];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

test("normal matrix ignores translation and reuses the caller-owned output", () => {
  const matrix = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    123, -456, 789, 1,
  ]);
  const output = new Float32Array(9).fill(99);

  assert.equal(writeNormalMatrix3FromMat4V1(matrix, output), output);
  approximate(output, [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ]);
});

test("normal matrix handles rotation combined with non-uniform scale", () => {
  // Rz(90 degrees) * scale(2, 3, 4), column-major.
  const matrix = new Float32Array([
    0, 2, 0, 0,
    -3, 0, 0, 0,
    0, 0, 4, 0,
    7, 8, 9, 1,
  ]);

  approximate(createNormalMatrix3FromMat4V1(matrix), [
    0, 0.5, 0,
    -1 / 3, 0, 0,
    0, 0, 0.25,
  ]);
});

test("inverse-transpose preserves tangent-normal orthogonality under shear and scale", () => {
  const matrix = new Float32Array([
    2, 0, 0, 0,
    1, 3, 0, 0,
    0.5, -0.25, 4, 0,
    0, 0, 0, 1,
  ]);
  const tangent = [1, 1, 0];
  const normal = [1, -1, 0];
  assert.equal(dot(tangent, normal), 0);

  const worldTangent = transformDirection4(matrix, tangent);
  const worldNormal = transformDirection3(
    createNormalMatrix3FromMat4V1(matrix),
    normal,
  );
  assert.ok(Math.abs(dot(worldTangent, worldNormal)) <= 1e-6);
});

test("singular and scale-relative ill-conditioned transforms fail closed", () => {
  assert.throws(
    () =>
      createNormalMatrix3FromMat4V1(new Float32Array([
        1, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ])),
    /singular or ill-conditioned|singular/,
  );

  assert.throws(
    () =>
      createNormalMatrix3FromMat4V1(new Float32Array([
        1, 0, 0, 0,
        0, 1e-10, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ])),
    /singular or ill-conditioned/,
  );
});

test("invalid lengths and non-finite coefficients fail before output publication", () => {
  assert.throws(
    () => createNormalMatrix3FromMat4V1(new Float32Array(15)),
    /input length 15 is less than 16/,
  );
  assert.throws(
    () =>
      writeNormalMatrix3FromMat4V1(
        new Float32Array([
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
        ]),
        new Float32Array(8),
      ),
    /output length 8 is less than 9/,
  );

  const invalid = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
  invalid[5] = Number.NaN;
  const output = new Float32Array(9).fill(17);
  assert.throws(
    () => writeNormalMatrix3FromMat4V1(invalid, output),
    /matrix\[5\] must be finite/,
  );
  assert.deepEqual([...output], new Array(9).fill(17));
});
