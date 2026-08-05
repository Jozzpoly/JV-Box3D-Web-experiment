import type { GlbRigidCpuAssetV1 } from "./glb-rigid-mesh-decoder.js";

export const RIGID_NORMAL_LENGTH_TOLERANCE_V1 = 1e-3;

export interface RigidFloatStreamIntegrityReceiptV1 {
  readonly nodeMatrixValueCount: number;
  readonly positionVertexCount: number;
  readonly normalVectorCount: number;
  readonly texcoordPairCount: number;
}

function reject(message: string): never {
  throw new Error(`Rigid float stream integrity V1 rejected: ${message}`);
}

function assertFiniteValues(
  values: Float32Array,
  label: string,
): void {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === undefined || !Number.isFinite(value)) {
      reject(`${label}[${index}] must be finite`);
    }
  }
}

export function assertRigidFloatStreamIntegrityV1(
  asset: GlbRigidCpuAssetV1,
): RigidFloatStreamIntegrityReceiptV1 {
  let nodeMatrixValueCount = 0;
  let positionVertexCount = 0;
  let normalVectorCount = 0;
  let texcoordPairCount = 0;

  for (const node of asset.nodes) {
    const label = `node ${node.name ?? `#${node.index}`} localFromParent`;
    if (node.localFromParent.length !== 16) {
      reject(`${label} must contain exactly 16 values`);
    }
    assertFiniteValues(node.localFromParent, label);
    nodeMatrixValueCount += node.localFromParent.length;
  }

  for (const [meshIndex, mesh] of asset.meshes.entries()) {
    for (const [primitiveIndex, primitive] of mesh.primitives.entries()) {
      const label = `mesh ${meshIndex} primitive ${primitiveIndex}`;
      if (primitive.positions.length % 3 !== 0) {
        reject(`${label} POSITION must contain complete VEC3 values`);
      }
      assertFiniteValues(primitive.positions, `${label} POSITION`);
      const vertexCount = primitive.positions.length / 3;
      positionVertexCount += vertexCount;

      if (primitive.normals !== null) {
        if (
          primitive.normals.length % 3 !== 0 ||
          primitive.normals.length !== primitive.positions.length
        ) {
          reject(`${label} NORMAL count differs from POSITION`);
        }
        assertFiniteValues(primitive.normals, `${label} NORMAL`);
        for (let offset = 0; offset < primitive.normals.length; offset += 3) {
          const x = primitive.normals[offset];
          const y = primitive.normals[offset + 1];
          const z = primitive.normals[offset + 2];
          if (x === undefined || y === undefined || z === undefined) {
            reject(`${label} NORMAL vector ${offset / 3} is incomplete`);
          }
          const length = Math.hypot(x, y, z);
          if (Math.abs(length - 1) > RIGID_NORMAL_LENGTH_TOLERANCE_V1) {
            reject(
              `${label} NORMAL vector ${offset / 3} has length ${String(length)}; ` +
                `expected 1 ± ${RIGID_NORMAL_LENGTH_TOLERANCE_V1}`,
            );
          }
          normalVectorCount += 1;
        }
      }

      if (primitive.texcoord0 !== null) {
        if (
          primitive.texcoord0.length % 2 !== 0 ||
          primitive.texcoord0.length / 2 !== vertexCount
        ) {
          reject(`${label} TEXCOORD_0 count differs from POSITION`);
        }
        assertFiniteValues(primitive.texcoord0, `${label} TEXCOORD_0`);
        texcoordPairCount += primitive.texcoord0.length / 2;
      }
    }
  }

  return Object.freeze({
    nodeMatrixValueCount,
    positionVertexCount,
    normalVectorCount,
    texcoordPairCount,
  });
}
