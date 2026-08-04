import type {
  GlbRigidCpuAssetV1,
  GlbRigidPrimitiveV1,
} from "../visual/glb-rigid-mesh-decoder.js";
import { assertGlbRigidCpuAssetArrayBufferBackedV1 } from "../visual/glb-rigid-array-buffer-contract.js";

export interface RigidMeshGpuPrimitiveV1 {
  readonly positionBuffer: WebGLBuffer;
  readonly normalBuffer: WebGLBuffer | null;
  readonly texcoord0Buffer: WebGLBuffer | null;
  readonly indexBuffer: WebGLBuffer;
  readonly indexCount: number;
  readonly materialIndex: number | null;
}

export interface RigidMeshGpuMeshV1 {
  readonly primitives: readonly RigidMeshGpuPrimitiveV1[];
}

export interface RigidMeshGpuAssetV1 {
  readonly meshes: readonly RigidMeshGpuMeshV1[];
  readonly gpuByteLength: number;
  readonly disposed: boolean;
  dispose(): void;
}

function assertNoGlError(
  gl: WebGLRenderingContext,
  label: string,
): void {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    throw new Error(`${label} failed with WebGL error 0x${error.toString(16)}.`);
  }
}

function uploadBuffer(
  gl: WebGLRenderingContext,
  owned: WebGLBuffer[],
  target: number,
  data: BufferSource,
  label: string,
): WebGLBuffer {
  const buffer = gl.createBuffer();
  if (buffer === null) {
    throw new Error(`${label} allocation failed.`);
  }
  owned.push(buffer);
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  assertNoGlError(gl, label);
  return buffer;
}

function primitiveGpuBytes(primitive: GlbRigidPrimitiveV1): number {
  return (
    primitive.positions.byteLength +
    (primitive.normals?.byteLength ?? 0) +
    (primitive.texcoord0?.byteLength ?? 0) +
    primitive.indices.byteLength
  );
}

export function createRigidMeshGpuAssetV1(
  gl: WebGLRenderingContext,
  cpuAsset: GlbRigidCpuAssetV1,
): RigidMeshGpuAssetV1 {
  assertGlbRigidCpuAssetArrayBufferBackedV1(cpuAsset);
  const uploadAsset = cpuAsset;
  const owned: WebGLBuffer[] = [];
  try {
    const meshes = uploadAsset.meshes.map((mesh, meshIndex) =>
      Object.freeze({
        primitives: Object.freeze(
          mesh.primitives.map((primitive, primitiveIndex) => {
            const label = `mesh ${meshIndex} primitive ${primitiveIndex}`;
            const positionBuffer = uploadBuffer(
              gl,
              owned,
              gl.ARRAY_BUFFER,
              primitive.positions,
              `${label} POSITION`,
            );
            const normalBuffer =
              primitive.normals === null
                ? null
                : uploadBuffer(
                    gl,
                    owned,
                    gl.ARRAY_BUFFER,
                    primitive.normals,
                    `${label} NORMAL`,
                  );
            const texcoord0Buffer =
              primitive.texcoord0 === null
                ? null
                : uploadBuffer(
                    gl,
                    owned,
                    gl.ARRAY_BUFFER,
                    primitive.texcoord0,
                    `${label} TEXCOORD_0`,
                  );
            const indexBuffer = uploadBuffer(
              gl,
              owned,
              gl.ELEMENT_ARRAY_BUFFER,
              primitive.indices,
              `${label} indices`,
            );
            return Object.freeze({
              positionBuffer,
              normalBuffer,
              texcoord0Buffer,
              indexBuffer,
              indexCount: primitive.indices.length,
              materialIndex: primitive.materialIndex,
            });
          }),
        ),
      }),
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    let isDisposed = false;
    return Object.freeze({
      meshes: Object.freeze(meshes),
      gpuByteLength: uploadAsset.meshes.reduce(
        (total, mesh) =>
          total +
          mesh.primitives.reduce(
            (meshTotal, primitive) =>
              meshTotal + primitiveGpuBytes(primitive),
            0,
          ),
        0,
      ),
      get disposed(): boolean {
        return isDisposed;
      },
      dispose(): void {
        if (isDisposed) {
          return;
        }
        isDisposed = true;
        for (let index = owned.length - 1; index >= 0; index -= 1) {
          gl.deleteBuffer(owned[index]!);
        }
        owned.length = 0;
      },
    });
  } catch (error: unknown) {
    for (let index = owned.length - 1; index >= 0; index -= 1) {
      gl.deleteBuffer(owned[index]!);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    throw error;
  }
}
