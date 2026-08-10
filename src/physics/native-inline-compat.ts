import type { b3Quat } from "box3d.js";

export interface NativeInlineShimReceipt {
  readonly nativeName: "b3MulQuat";
  readonly reason: "native-inline-helper-not-exported-by-embind";
  readonly formula: "hamilton-product-vector-scalar-layout";
}

export const NATIVE_INLINE_SHIMS: readonly NativeInlineShimReceipt[] = [
  {
    nativeName: "b3MulQuat",
    reason: "native-inline-helper-not-exported-by-embind",
    formula: "hamilton-product-vector-scalar-layout",
  },
];

export function multiplyQuat(a: b3Quat, b: b3Quat): b3Quat {
  return {
    v: {
      x: a.s * b.v.x + b.s * a.v.x + a.v.y * b.v.z - a.v.z * b.v.y,
      y: a.s * b.v.y + b.s * a.v.y + a.v.z * b.v.x - a.v.x * b.v.z,
      z: a.s * b.v.z + b.s * a.v.z + a.v.x * b.v.y - a.v.y * b.v.x,
    },
    s: a.s * b.s - (a.v.x * b.v.x + a.v.y * b.v.y + a.v.z * b.v.z),
  };
}
