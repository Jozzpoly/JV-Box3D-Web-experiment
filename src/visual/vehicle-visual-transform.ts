import {
  indexVehicleVisualFrameV1,
  type VehicleVisualFrameV1,
  type VehicleVisualRotationV1,
  type VehicleVisualVector3V1,
} from "../runtime/vehicle-visual-frame.js";
import type {
  VehicleVisualAxisV1,
  VehicleVisualBindingV1,
  VehicleVisualLocalTransformV1,
  VehicleVisualPackageV1,
} from "./vehicle-visual-package.js";

export type VehicleVisualMatrixV1 = Float32Array;

export interface ResolvedVehicleVisualBindingV1 {
  readonly bindingId: string;
  readonly nodeName: string;
  readonly worldFromNode: VehicleVisualMatrixV1;
}

type Vec3 = Readonly<{ x: number; y: number; z: number }>;
type Quat = Readonly<{ x: number; y: number; z: number; w: number }>;

const EPSILON = 1e-8;

function vector(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return vector(a.x + b.x, a.y + b.y, a.z + b.z);
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return vector(a.x - b.x, a.y - b.y, a.z - b.z);
}

function scale(value: Vec3, factor: number): Vec3 {
  return vector(value.x * factor, value.y * factor, value.z * factor);
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return vector(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x,
  );
}

function length(value: Vec3): number {
  return Math.hypot(value.x, value.y, value.z);
}

function normalize(value: Vec3, label: string): Vec3 {
  const magnitude = length(value);
  if (!(magnitude > EPSILON)) {
    throw new Error(`${label} must have non-zero length.`);
  }
  return scale(value, 1 / magnitude);
}

function normalizeQuaternion(value: Quat, label: string): Quat {
  const magnitude = Math.hypot(value.x, value.y, value.z, value.w);
  if (!(magnitude > EPSILON)) {
    throw new Error(`${label} must have non-zero magnitude.`);
  }
  return {
    x: value.x / magnitude,
    y: value.y / magnitude,
    z: value.z / magnitude,
    w: value.w / magnitude,
  };
}

function axisVector(axis: VehicleVisualAxisV1): Vec3 {
  switch (axis) {
    case "+X":
      return vector(1, 0, 0);
    case "-X":
      return vector(-1, 0, 0);
    case "+Y":
      return vector(0, 1, 0);
    case "-Y":
      return vector(0, -1, 0);
    case "+Z":
      return vector(0, 0, 1);
    case "-Z":
      return vector(0, 0, -1);
  }
}

function shortestArcRotation(fromUnit: Vec3, toUnit: Vec3): Quat {
  const cosine = Math.max(-1, Math.min(1, dot(fromUnit, toUnit)));
  if (cosine > 1 - EPSILON) {
    return { x: 0, y: 0, z: 0, w: 1 };
  }
  if (cosine < -1 + EPSILON) {
    const absolute = {
      x: Math.abs(fromUnit.x),
      y: Math.abs(fromUnit.y),
      z: Math.abs(fromUnit.z),
    };
    const basis =
      absolute.x <= absolute.y && absolute.x <= absolute.z
        ? vector(1, 0, 0)
        : absolute.y <= absolute.z
          ? vector(0, 1, 0)
          : vector(0, 0, 1);
    const axis = normalize(cross(fromUnit, basis), "opposite-axis rotation");
    return { x: axis.x, y: axis.y, z: axis.z, w: 0 };
  }
  const rotationAxis = cross(fromUnit, toUnit);
  return normalizeQuaternion(
    {
      x: rotationAxis.x,
      y: rotationAxis.y,
      z: rotationAxis.z,
      w: 1 + cosine,
    },
    "shortest-arc rotation",
  );
}

export function multiplyVehicleVisualMatricesV1(
  a: VehicleVisualMatrixV1,
  b: VehicleVisualMatrixV1,
): VehicleVisualMatrixV1 {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] =
        a[row]! * b[column * 4]! +
        a[4 + row]! * b[column * 4 + 1]! +
        a[8 + row]! * b[column * 4 + 2]! +
        a[12 + row]! * b[column * 4 + 3]!;
    }
  }
  return out;
}

function matrixFromTrs(
  position: Vec3,
  rotation: Quat,
  scaleValue: Vec3,
): VehicleVisualMatrixV1 {
  const { x, y, z, w } = normalizeQuaternion(rotation, "TRS rotation");
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const xz = x * z;
  const yz = y * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;
  return new Float32Array([
    (1 - 2 * (yy + zz)) * scaleValue.x,
    2 * (xy + wz) * scaleValue.x,
    2 * (xz - wy) * scaleValue.x,
    0,
    2 * (xy - wz) * scaleValue.y,
    (1 - 2 * (xx + zz)) * scaleValue.y,
    2 * (yz + wx) * scaleValue.y,
    0,
    2 * (xz + wy) * scaleValue.z,
    2 * (yz - wx) * scaleValue.z,
    (1 - 2 * (xx + yy)) * scaleValue.z,
    0,
    position.x,
    position.y,
    position.z,
    1,
  ]);
}

function localTransformMatrix(
  transform: VehicleVisualLocalTransformV1,
): VehicleVisualMatrixV1 {
  return matrixFromTrs(
    vector(...transform.position),
    {
      x: transform.rotation[0],
      y: transform.rotation[1],
      z: transform.rotation[2],
      w: transform.rotation[3],
    },
    vector(...transform.scale),
  );
}

function partTransformMatrix(
  position: VehicleVisualVector3V1,
  rotation: VehicleVisualRotationV1,
): VehicleVisualMatrixV1 {
  return matrixFromTrs(position, rotation, vector(1, 1, 1));
}

function transformPointByMatrix(
  matrix: VehicleVisualMatrixV1,
  point: readonly [number, number, number],
): Vec3 {
  return vector(
    matrix[0]! * point[0] + matrix[4]! * point[1] + matrix[8]! * point[2] + matrix[12]!,
    matrix[1]! * point[0] + matrix[5]! * point[1] + matrix[9]! * point[2] + matrix[13]!,
    matrix[2]! * point[0] + matrix[6]! * point[1] + matrix[10]! * point[2] + matrix[14]!,
  );
}

function stretchScale(
  axis: VehicleVisualAxisV1,
  factor: number,
): Vec3 {
  switch (axis) {
    case "+X":
    case "-X":
      return vector(factor, 1, 1);
    case "+Y":
    case "-Y":
      return vector(1, factor, 1);
    case "+Z":
    case "-Z":
      return vector(1, 1, factor);
  }
}

function resolveSegmentSourceMatrix(
  binding: VehicleVisualBindingV1,
  start: VehicleVisualVector3V1,
  end: VehicleVisualVector3V1,
): VehicleVisualMatrixV1 {
  if (
    binding.source.kind === "PART" ||
    binding.source.kind === "PART_PAIR_STRETCH" ||
    binding.source.kind === "PART_PAIR_ENDPOINT_AIM"
  ) {
    throw new Error(`${binding.source.kind} binding cannot resolve from a frame segment.`);
  }
  const startVector = vector(start.x, start.y, start.z);
  const endVector = vector(end.x, end.y, end.z);
  const forward = subtract(endVector, startVector);
  const measuredLength = length(forward);
  if (!(measuredLength > EPSILON)) {
    throw new Error(`${binding.source.segmentId} has zero visual length.`);
  }

  if (binding.source.kind === "SEGMENT_STRETCH") {
    const direction = scale(forward, 1 / measuredLength);
    const rotation = shortestArcRotation(
      axisVector(binding.source.axis),
      direction,
    );
    return matrixFromTrs(
      scale(add(startVector, endVector), 0.5),
      rotation,
      stretchScale(
        binding.source.axis,
        measuredLength / binding.source.referenceLengthMeters,
      ),
    );
  }

  const atStart = binding.source.endpoint === "START";
  const origin = atStart ? startVector : endVector;
  const direction = normalize(
    atStart ? forward : scale(forward, -1),
    `${binding.source.segmentId} aim direction`,
  );
  return matrixFromTrs(
    origin,
    shortestArcRotation(axisVector(binding.source.axis), direction),
    vector(1, 1, 1),
  );
}

function resolvePartPairSourceMatrix(
  binding: VehicleVisualBindingV1,
  startWorld: Vec3,
  endWorld: Vec3,
): VehicleVisualMatrixV1 {
  if (
    binding.source.kind !== "PART_PAIR_STRETCH" &&
    binding.source.kind !== "PART_PAIR_ENDPOINT_AIM"
  ) {
    throw new Error("Only PART_PAIR bindings can resolve from two part endpoints.");
  }
  const forward = subtract(endWorld, startWorld);
  const measuredLength = length(forward);
  if (!(measuredLength > EPSILON)) {
    throw new Error(`${binding.bindingId} has zero part-pair visual length.`);
  }
  if (binding.source.kind === "PART_PAIR_STRETCH") {
    const direction = scale(forward, 1 / measuredLength);
    return matrixFromTrs(
      scale(add(startWorld, endWorld), 0.5),
      shortestArcRotation(axisVector(binding.source.axis), direction),
      stretchScale(
        binding.source.axis,
        measuredLength / binding.source.referenceLengthMeters,
      ),
    );
  }
  const atStart = binding.source.endpoint === "START";
  const origin = atStart ? startWorld : endWorld;
  const direction = normalize(
    atStart ? forward : scale(forward, -1),
    `${binding.bindingId} part-pair aim direction`,
  );
  return matrixFromTrs(
    origin,
    shortestArcRotation(axisVector(binding.source.axis), direction),
    vector(1, 1, 1),
  );
}

export function resolveVehicleVisualBindingsV1(
  visual: VehicleVisualPackageV1,
  frame: VehicleVisualFrameV1,
): readonly ResolvedVehicleVisualBindingV1[] {
  const indexed = indexVehicleVisualFrameV1(frame);
  return Object.freeze(
    visual.bindings.map((binding) => {
      let worldFromSource: VehicleVisualMatrixV1;
      if (binding.source.kind === "PART") {
        const part = indexed.parts.get(binding.source.partId);
        if (part === undefined) {
          throw new Error(
            `Vehicle visual frame is missing part ${binding.source.partId}.`,
          );
        }
        worldFromSource = partTransformMatrix(
          part.transform.position,
          part.transform.rotation,
        );
      } else if (
        binding.source.kind === "PART_PAIR_STRETCH" ||
        binding.source.kind === "PART_PAIR_ENDPOINT_AIM"
      ) {
        const startPart = indexed.parts.get(binding.source.startPartId);
        const endPart = indexed.parts.get(binding.source.endPartId);
        if (startPart === undefined) {
          throw new Error(
            `Vehicle visual frame is missing part ${binding.source.startPartId}.`,
          );
        }
        if (endPart === undefined) {
          throw new Error(
            `Vehicle visual frame is missing part ${binding.source.endPartId}.`,
          );
        }
        const startMatrix = partTransformMatrix(
          startPart.transform.position,
          startPart.transform.rotation,
        );
        const endMatrix = partTransformMatrix(
          endPart.transform.position,
          endPart.transform.rotation,
        );
        worldFromSource = resolvePartPairSourceMatrix(
          binding,
          transformPointByMatrix(
            startMatrix,
            binding.source.startLocalPosition,
          ),
          transformPointByMatrix(
            endMatrix,
            binding.source.endLocalPosition,
          ),
        );
      } else {
        const segment = indexed.segments.get(binding.source.segmentId);
        if (segment === undefined) {
          throw new Error(
            `Vehicle visual frame is missing segment ${binding.source.segmentId}.`,
          );
        }
        worldFromSource = resolveSegmentSourceMatrix(
          binding,
          segment.start,
          segment.end,
        );
      }
      return Object.freeze({
        bindingId: binding.bindingId,
        nodeName: binding.nodeName,
        worldFromNode: multiplyVehicleVisualMatricesV1(
          worldFromSource,
          localTransformMatrix(binding.localFromSource),
        ),
      });
    }),
  );
}

export function transformVehicleVisualPointV1(
  matrix: VehicleVisualMatrixV1,
  point: Vec3,
): Vec3 {
  return vector(
    matrix[0]! * point.x +
      matrix[4]! * point.y +
      matrix[8]! * point.z +
      matrix[12]!,
    matrix[1]! * point.x +
      matrix[5]! * point.y +
      matrix[9]! * point.z +
      matrix[13]!,
    matrix[2]! * point.x +
      matrix[6]! * point.y +
      matrix[10]! * point.z +
      matrix[14]!,
  );
}
