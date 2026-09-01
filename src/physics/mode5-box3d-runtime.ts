import type {
  Box3DModule,
  b3BodyId,
  b3ShapeDef,
  b3ShapeId,
  b3Vec3,
} from "./box3d-runtime-contract.js";

export const BOX3D_MODE5_RUNTIME_PATCH = Object.freeze({
  id: "B3X-WHEEL-001",
  donorRepository: "Jozzpoly/Box3d_FunProject",
  donorSealCommit: "b0a0082252cb1f3c964f804162233bc82254bc4b",
  patchBaseCommit: "77a67132ffc4f003e84c6ffe4e72abfbcded4d33",
  patchHeadCommit: "241fe10a9056836332c21d9614471d32d749ce3d",
  patchSha256: "83ee212f062e7a81578993fc4bba93f8a6b3a8f1c786eef9769007bffe77f4d5",
  inlineArtifactSha256: "c143b37b8c7a54345cc477df3c14767a2fc321c346d6d2a9fe728906d4a9b5fd",
  validatedRunId: 33_526_390_618,
} as const);

export interface Mode5Box3DModule extends Box3DModule {
  b3CreateWheelShapeFlat(
    bodyId: b3BodyId,
    shapeDef: b3ShapeDef,
    center: b3Vec3,
    axis: b3Vec3,
    radius: number,
    halfWidth: number,
    cornerRadius: number,
  ): b3ShapeId;
  b3DestroyShape(shapeId: b3ShapeId, updateBodyMass: boolean): void;
}

const MODE5_REQUIRED_EXPORTS = [
  "b3CreateWheelShapeFlat",
  "b3DestroyShape",
] as const;

export function assertMode5Box3DModule(
  b3: Box3DModule,
): asserts b3 is Mode5Box3DModule {
  const candidate = b3 as Box3DModule & Partial<Mode5Box3DModule>;
  const missing = MODE5_REQUIRED_EXPORTS.filter(
    (name) => typeof candidate[name] !== "function",
  );
  if (missing.length > 0) {
    throw new Error(
      `Mode5 Box3D runtime is missing required exports: ${missing.join(", ")}`,
    );
  }
}

export async function loadMode5Box3DModule(): Promise<Mode5Box3DModule> {
  const { default: factory } = await import(
    "./vendor/box3d-mode5.inline.mjs"
  );
  const b3 = await factory();
  assertMode5Box3DModule(b3);
  return b3;
}
