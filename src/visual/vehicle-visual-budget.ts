import type { GlbRigidCpuAssetV1 } from "./glb-rigid-mesh-decoder.js";

export const VEHICLE_VISUAL_PLATFORM_LIMITS_V1 = Object.freeze({
  maxNodes: 512,
  maxPrimitives: 512,
  maxTriangles: 300_000,
  maxMaterials: 64,
  maxGeometryBytes: 64 * 1024 * 1024,
  maxImages: 8,
  maxTextures: 8,
  maxTextureDimension: 2_048,
  maxEncodedTextureBytes: 8 * 1024 * 1024,
  maxDecodedTextureBytes: 32 * 1024 * 1024,
});

export interface VehicleVisualBudgetReceiptV1 {
  readonly nodes: number;
  readonly primitives: number;
  readonly triangles: number;
  readonly materials: number;
  readonly geometryBytes: number;
  readonly images: number;
  readonly textures: number;
  readonly encodedTextureBytes: number;
  readonly decodedTextureBytes: number;
  readonly maxTextureDimension: number;
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
  const encodedTextureBytes = asset.images.reduce(
    (total, image) => total + image.bytes.byteLength,
    0,
  );
  const decodedTextureBytes = asset.textures.reduce((total, texture) => {
    const image = asset.images[texture.sourceImageIndex];
    if (image === undefined) {
      reject(`texture references missing image ${texture.sourceImageIndex}`);
    }
    return total + image.decodedRgbaBytes;
  }, 0);
  const maxTextureDimension = asset.images.reduce(
    (maximum, image) => Math.max(maximum, image.width, image.height),
    0,
  );
  const receipt = Object.freeze({
    nodes: asset.nodes.length,
    primitives: asset.primitiveCount,
    triangles: asset.triangleCount,
    materials: asset.materials.length,
    geometryBytes: measureVehicleVisualGeometryBytesV1(asset),
    images: asset.images.length,
    textures: asset.textures.length,
    encodedTextureBytes,
    decodedTextureBytes,
    maxTextureDimension,
  });
  const limits = VEHICLE_VISUAL_PLATFORM_LIMITS_V1;
  if (receipt.nodes > limits.maxNodes) {
    reject(`node count ${receipt.nodes} exceeds ${limits.maxNodes}`);
  }
  if (receipt.primitives > limits.maxPrimitives) {
    reject(`primitive count ${receipt.primitives} exceeds ${limits.maxPrimitives}`);
  }
  if (receipt.triangles > limits.maxTriangles) {
    reject(`triangle count ${receipt.triangles} exceeds ${limits.maxTriangles}`);
  }
  if (receipt.materials > limits.maxMaterials) {
    reject(`material count ${receipt.materials} exceeds ${limits.maxMaterials}`);
  }
  if (receipt.geometryBytes > limits.maxGeometryBytes) {
    reject(`geometry bytes ${receipt.geometryBytes} exceeds ${limits.maxGeometryBytes}`);
  }
  if (receipt.images > limits.maxImages) {
    reject(`image count ${receipt.images} exceeds ${limits.maxImages}`);
  }
  if (receipt.textures > limits.maxTextures) {
    reject(`texture count ${receipt.textures} exceeds ${limits.maxTextures}`);
  }
  if (receipt.maxTextureDimension > limits.maxTextureDimension) {
    reject(
      `texture dimension ${receipt.maxTextureDimension} exceeds ${limits.maxTextureDimension}`,
    );
  }
  if (receipt.encodedTextureBytes > limits.maxEncodedTextureBytes) {
    reject(
      `encoded texture bytes ${receipt.encodedTextureBytes} exceeds ${limits.maxEncodedTextureBytes}`,
    );
  }
  if (receipt.decodedTextureBytes > limits.maxDecodedTextureBytes) {
    reject(
      `decoded texture bytes ${receipt.decodedTextureBytes} exceeds ${limits.maxDecodedTextureBytes}`,
    );
  }
  return receipt;
}
