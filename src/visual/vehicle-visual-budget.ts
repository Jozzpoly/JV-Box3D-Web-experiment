import type { GlbRigidCpuAssetV1 } from "./glb-rigid-mesh-decoder.js";

export const VEHICLE_VISUAL_PLATFORM_LIMITS_V1 = Object.freeze({
  maxNodes: 512,
  maxPrimitives: 512,
  maxTriangles: 300_000,
  maxMaterials: 64,
  maxGeometryBytes: 64 * 1024 * 1024,
});

export interface VehicleVisualBudgetReceiptV1 {
  readonly nodes: number;
  readonly primitives: number;
  readonly triangles: number;
  readonly materials: number;
  readonly geometryBytes: number;
}

function reject(message: string): never {
  throw new Error(`Vehicle visual budget V1 rejected: ${message}`);
}

export function measureVehicleVisualGeometryBytesV1(
  asset: GlbRigidCpuAssetV1,
): number {
  return asset.meshes.reduce(
    (total, mesh) =>
      total +
      mesh.primitives.reduce(
        (meshTotal, primitive) =>
          meshTotal +
          primitive.positions.byteLength +
          (primitive.normals?.byteLength ?? 0) +
          (primitive.texcoord0?.byteLength ?? 0) +
          primitive.indices.byteLength,
        0,
      ),
    0,
  );
}

export function assertVehicleVisualBudgetV1(
  asset: GlbRigidCpuAssetV1,
): VehicleVisualBudgetReceiptV1 {
  const receipt = Object.freeze({
    nodes: asset.nodes.length,
    primitives: asset.primitiveCount,
    triangles: asset.triangleCount,
    materials: asset.materials.length,
    geometryBytes: measureVehicleVisualGeometryBytesV1(asset),
  });
  const limits = VEHICLE_VISUAL_PLATFORM_LIMITS_V1;
  if (receipt.nodes > limits.maxNodes) {
    reject(`node count ${receipt.nodes} exceeds ${limits.maxNodes}`);
  }
  if (receipt.primitives > limits.maxPrimitives) {
    reject(
      `primitive count ${receipt.primitives} exceeds ${limits.maxPrimitives}`,
    );
  }
  if (receipt.triangles > limits.maxTriangles) {
    reject(
      `triangle count ${receipt.triangles} exceeds ${limits.maxTriangles}`,
    );
  }
  if (receipt.materials > limits.maxMaterials) {
    reject(
      `material count ${receipt.materials} exceeds ${limits.maxMaterials}`,
    );
  }
  if (receipt.geometryBytes > limits.maxGeometryBytes) {
    reject(
      `geometry bytes ${receipt.geometryBytes} exceeds ${limits.maxGeometryBytes}`,
    );
  }
  return receipt;
}
