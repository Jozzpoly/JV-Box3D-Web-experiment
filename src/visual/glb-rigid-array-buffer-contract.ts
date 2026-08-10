import type {
  GlbRigidCpuAssetV1,
  GlbRigidNodeV1,
  GlbRigidPrimitiveV1,
} from "./glb-rigid-mesh-decoder.js";

export type OwnedFloat32ArrayV1 = Float32Array<ArrayBuffer>;
export type OwnedUint16ArrayV1 = Uint16Array<ArrayBuffer>;

export type ArrayBufferBackedGlbRigidPrimitiveV1 = Omit<
  GlbRigidPrimitiveV1,
  "positions" | "normals" | "texcoord0" | "indices"
> &
  Readonly<{
    positions: OwnedFloat32ArrayV1;
    normals: OwnedFloat32ArrayV1 | null;
    texcoord0: OwnedFloat32ArrayV1 | null;
    indices: OwnedUint16ArrayV1;
  }>;

export type ArrayBufferBackedGlbRigidNodeV1 = Omit<
  GlbRigidNodeV1,
  "localFromParent"
> &
  Readonly<{
    localFromParent: OwnedFloat32ArrayV1;
  }>;

export type ArrayBufferBackedGlbRigidCpuAssetV1 = Omit<
  GlbRigidCpuAssetV1,
  "nodes" | "meshes"
> &
  Readonly<{
    nodes: readonly ArrayBufferBackedGlbRigidNodeV1[];
    meshes: readonly Readonly<{
      name: string | null;
      primitives: readonly ArrayBufferBackedGlbRigidPrimitiveV1[];
    }>[];
  }>;

function requireArrayBuffer(
  view: ArrayBufferView<ArrayBufferLike>,
  label: string,
): void {
  if (!(view.buffer instanceof ArrayBuffer)) {
    throw new Error(
      `Rigid GLB CPU asset rejected: ${label} must be backed by ArrayBuffer before WebGL upload.`,
    );
  }
}

export function assertGlbRigidCpuAssetArrayBufferBackedV1(
  asset: GlbRigidCpuAssetV1,
): asserts asset is ArrayBufferBackedGlbRigidCpuAssetV1 {
  for (const node of asset.nodes) {
    requireArrayBuffer(
      node.localFromParent,
      `node ${node.name ?? `#${node.index}`} localFromParent`,
    );
  }

  for (const [meshIndex, mesh] of asset.meshes.entries()) {
    for (const [primitiveIndex, primitive] of mesh.primitives.entries()) {
      const label = `mesh ${meshIndex} primitive ${primitiveIndex}`;
      requireArrayBuffer(primitive.positions, `${label} POSITION`);
      if (primitive.normals !== null) {
        requireArrayBuffer(primitive.normals, `${label} NORMAL`);
      }
      if (primitive.texcoord0 !== null) {
        requireArrayBuffer(primitive.texcoord0, `${label} TEXCOORD_0`);
      }
      requireArrayBuffer(primitive.indices, `${label} indices`);
    }
  }
}
