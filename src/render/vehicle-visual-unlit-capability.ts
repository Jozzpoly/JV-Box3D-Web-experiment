import type { GlbRigidCpuAssetV1 } from "../visual/glb-rigid-mesh-decoder.js";

export const VEHICLE_VISUAL_UNLIT_CAPABILITY_ID =
  "UNLIT_POSITION_BASE_COLOR_V1" as const;

export interface VehicleVisualUnlitCapabilityReceiptV1 {
  readonly capabilityId: typeof VEHICLE_VISUAL_UNLIT_CAPABILITY_ID;
  readonly meshCount: number;
  readonly primitiveCount: number;
  readonly doubleSidedPrimitiveCount: number;
}

export function assertVehicleVisualUnlitCapabilityV1(
  asset: GlbRigidCpuAssetV1,
): VehicleVisualUnlitCapabilityReceiptV1 {
  let primitiveCount = 0;
  let doubleSidedPrimitiveCount = 0;

  asset.meshes.forEach((mesh, meshIndex) => {
    mesh.primitives.forEach((primitive, primitiveIndex) => {
      const label = `mesh ${meshIndex} primitive ${primitiveIndex}`;
      if (primitive.normals !== null) {
        throw new Error(
          `Vehicle visual unlit capability rejected: ${label} contains NORMAL, but the first renderer does not consume normals yet.`,
        );
      }
      if (primitive.texcoord0 !== null) {
        throw new Error(
          `Vehicle visual unlit capability rejected: ${label} contains TEXCOORD_0, but the first renderer has no texture path.`,
        );
      }

      primitiveCount += 1;
      if (primitive.materialIndex !== null) {
        const material = asset.materials[primitive.materialIndex];
        if (material === undefined) {
          throw new Error(
            `Vehicle visual unlit capability rejected: ${label} references missing material ${primitive.materialIndex}.`,
          );
        }
        if (material.doubleSided) {
          doubleSidedPrimitiveCount += 1;
        }
      }
    });
  });

  return Object.freeze({
    capabilityId: VEHICLE_VISUAL_UNLIT_CAPABILITY_ID,
    meshCount: asset.meshes.length,
    primitiveCount,
    doubleSidedPrimitiveCount,
  });
}
