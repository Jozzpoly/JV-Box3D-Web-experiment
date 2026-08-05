export const NORMAL_MATRIX_RELATIVE_DETERMINANT_EPSILON_V1 = 1e-8;

function requireFinite(
  value: number | undefined,
  label: string,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    throw new Error(`Normal matrix V1 rejected: ${label} must be finite.`);
  }
  return value;
}

/**
 * Writes the inverse-transpose of the upper-left 3x3 portion of a column-major
 * 4x4 matrix into a column-major 3x3 output buffer.
 *
 * Calculations are normalized by the largest matrix coefficient before the
 * determinant is evaluated. This avoids overflow/underflow and makes the
 * singularity threshold relative to the transform scale.
 */
export function writeNormalMatrix3FromMat4V1(
  matrix: ArrayLike<number>,
  output: Float32Array,
): Float32Array {
  if (matrix.length < 16) {
    throw new Error(
      `Normal matrix V1 rejected: input length ${matrix.length} is less than 16.`,
    );
  }
  if (output.length < 9) {
    throw new Error(
      `Normal matrix V1 rejected: output length ${output.length} is less than 9.`,
    );
  }

  const raw00 = requireFinite(matrix[0], "matrix[0]");
  const raw10 = requireFinite(matrix[1], "matrix[1]");
  const raw20 = requireFinite(matrix[2], "matrix[2]");
  const raw01 = requireFinite(matrix[4], "matrix[4]");
  const raw11 = requireFinite(matrix[5], "matrix[5]");
  const raw21 = requireFinite(matrix[6], "matrix[6]");
  const raw02 = requireFinite(matrix[8], "matrix[8]");
  const raw12 = requireFinite(matrix[9], "matrix[9]");
  const raw22 = requireFinite(matrix[10], "matrix[10]");

  const maximumCoefficient = Math.max(
    Math.abs(raw00),
    Math.abs(raw10),
    Math.abs(raw20),
    Math.abs(raw01),
    Math.abs(raw11),
    Math.abs(raw21),
    Math.abs(raw02),
    Math.abs(raw12),
    Math.abs(raw22),
  );
  if (!(maximumCoefficient > 0)) {
    throw new Error(
      "Normal matrix V1 rejected: linear transform is singular.",
    );
  }

  const inverseMaximum = 1 / maximumCoefficient;
  const a00 = raw00 * inverseMaximum;
  const a10 = raw10 * inverseMaximum;
  const a20 = raw20 * inverseMaximum;
  const a01 = raw01 * inverseMaximum;
  const a11 = raw11 * inverseMaximum;
  const a21 = raw21 * inverseMaximum;
  const a02 = raw02 * inverseMaximum;
  const a12 = raw12 * inverseMaximum;
  const a22 = raw22 * inverseMaximum;

  const cofactor00 = a11 * a22 - a12 * a21;
  const cofactor01 = a12 * a20 - a10 * a22;
  const cofactor02 = a10 * a21 - a11 * a20;
  const cofactor10 = a02 * a21 - a01 * a22;
  const cofactor11 = a00 * a22 - a02 * a20;
  const cofactor12 = a01 * a20 - a00 * a21;
  const cofactor20 = a01 * a12 - a02 * a11;
  const cofactor21 = a02 * a10 - a00 * a12;
  const cofactor22 = a00 * a11 - a01 * a10;

  const relativeDeterminant =
    a00 * cofactor00 + a01 * cofactor01 + a02 * cofactor02;
  if (
    !Number.isFinite(relativeDeterminant) ||
    Math.abs(relativeDeterminant) <=
      NORMAL_MATRIX_RELATIVE_DETERMINANT_EPSILON_V1
  ) {
    throw new Error(
      `Normal matrix V1 rejected: linear transform is singular or ill-conditioned ` +
        `(relative determinant ${String(relativeDeterminant)}).`,
    );
  }

  const factor = 1 / (maximumCoefficient * relativeDeterminant);
  const values = [
    cofactor00,
    cofactor10,
    cofactor20,
    cofactor01,
    cofactor11,
    cofactor21,
    cofactor02,
    cofactor12,
    cofactor22,
  ] as const;

  for (const [index, cofactor] of values.entries()) {
    const value = cofactor * factor;
    if (!Number.isFinite(value)) {
      throw new Error(
        `Normal matrix V1 rejected: output component ${index} is not finite.`,
      );
    }
    output[index] = value;
  }
  return output;
}

export function createNormalMatrix3FromMat4V1(
  matrix: ArrayLike<number>,
): Float32Array {
  return writeNormalMatrix3FromMat4V1(matrix, new Float32Array(9));
}
