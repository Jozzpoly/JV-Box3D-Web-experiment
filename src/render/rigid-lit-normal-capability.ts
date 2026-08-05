import type { GlbRigidCpuAssetV1 } from "../visual/glb-rigid-mesh-decoder.js";
import {
  assertRigidFloatStreamIntegrityV1,
  type RigidFloatStreamIntegrityReceiptV1,
} from "../visual/rigid-float-stream-integrity.js";

export const RIGID_LIT_NORMAL_BASE_COLOR_CAPABILITY_ID =
  "LIT_NORMAL_BASE_COLOR_V1" as const;

export interface RigidLitNormalBaseColorCapabilityReceiptV1 {
  readonly capabilityId: typeof RIGID_LIT_NORMAL_BASE_COLOR_CAPABILITY_ID;
  readonly meshCount: number;
  readonly primitiveCount: number;
  readonly vertexCount: number;
  readonly materialCount: number;
  readonly defaultMaterialPrimitiveCount: number;
  readonly doubleSidedPrimitiveCount: number;
  readonly floatIntegrity: RigidFloatStreamIntegrityReceiptV1;
}

function reject(message: string): never {
  throw new Error(`Rigid lit-normal capability rejected: ${message}`);
}

export function assertRigidLitNormalBaseColorCapabilityV1(
  asset: GlbRigidCpuAssetV1,
): RigidLitNormalBaseColorCapabilityReceiptV1 {
  const floatIntegrity = assertRigidFloatStreamIntegrityV1(asset);
  let primitiveCount = 0;
  let vertexCount = 0;
  let defaultMaterialPrimitiveCount = 0;
  let doubleSidedPrimitiveCount = 0;

  for (const [meshIndex, mesh] of asset.meshes.entries()) {
    for (const [primitiveIndex, primitive] of mesh.primitives.entries()) {
      const label = `mesh ${meshIndex} primitive ${primitiveIndex}`;
      if (primitive.normals === null) {
        reject(`${label} is missing required NORMAL`);
      }
      if (primitive.texcoord0 !== null) {
        reject(
          `${label} contains TEXCOORD_0, but ${RIGID_LIT_NORMAL_BASE_COLOR_CAPABILITY_ID} does not consume texture coordinates`,
        );
      }

      primitiveCount += 1;
      vertexCount += primitive.positions.length / 3;
      if (primitive.materialIndex === null) {
        defaultMaterialPrimitiveCount += 1;
        continue;
      }

      const material = asset.materials[primitive.materialIndex];
      if (material === undefined) {
        reject(`${label} references missing material ${primitive.materialIndex}`);
      }
      if (material.baseColorFactor[3] !== 1) {
        reject(
          `${label} material ${primitive.materialIndex} uses baseColor alpha ${String(material.baseColorFactor[3])}; only opaque alpha 1 is supported`,
        );
      }
      if (material.doubleSided) {
        doubleSidedPrimitiveCount += 1;
      }
    }
  }

  if (primitiveCount === 0) {
    reject("asset contains no renderable primitives");
  }

  return Object.freeze({
    capabilityId: RIGID_LIT_NORMAL_BASE_COLOR_CAPABILITY_ID,
    meshCount: asset.meshes.length,
    primitiveCount,
    vertexCount,
    materialCount: asset.materials.length,
    defaultMaterialPrimitiveCount,
    doubleSidedPrimitiveCount,
    floatIntegrity,
  });
}
