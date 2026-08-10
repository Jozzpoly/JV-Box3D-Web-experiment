import type { JvIndexedMesh } from "../scene/jv-world-contract.js";

export interface JvUint16MeshChunk {
  readonly positions: Float32Array;
  readonly normals: Float32Array;
  readonly uvs?: Float32Array;
  readonly indices: Uint16Array;
}

const DEFAULT_MAX_VERTICES = 65_535;

function assertMeshStreams(mesh: JvIndexedMesh): number {
  if (mesh.positions.length === 0 || mesh.positions.length % 3 !== 0) {
    throw new Error("JV mesh positions must contain complete vec3 vertices.");
  }
  const vertexCount = mesh.positions.length / 3;
  if (mesh.indices.length === 0 || mesh.indices.length % 3 !== 0) {
    throw new Error("JV mesh indices must contain complete triangles.");
  }
  if (
    mesh.normals !== undefined &&
    mesh.normals.length !== mesh.positions.length
  ) {
    throw new Error("JV mesh normals do not match its position stream.");
  }
  if (
    mesh.uvs !== undefined &&
    mesh.uvs.length !== vertexCount * 2
  ) {
    throw new Error("JV mesh UVs do not match its position stream.");
  }
  for (const index of mesh.indices) {
    if (index >= vertexCount) {
      throw new Error("JV mesh index is outside its position stream.");
    }
  }
  return vertexCount;
}

function calculateNormals(
  positions: Float32Array,
  indices: Uint32Array,
): Float32Array {
  const normals = new Float32Array(positions.length);
  for (let offset = 0; offset < indices.length; offset += 3) {
    const ia = indices[offset]! * 3;
    const ib = indices[offset + 1]! * 3;
    const ic = indices[offset + 2]! * 3;
    const abx = positions[ib]! - positions[ia]!;
    const aby = positions[ib + 1]! - positions[ia + 1]!;
    const abz = positions[ib + 2]! - positions[ia + 2]!;
    const acx = positions[ic]! - positions[ia]!;
    const acy = positions[ic + 1]! - positions[ia + 1]!;
    const acz = positions[ic + 2]! - positions[ia + 2]!;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    for (const index of [ia, ib, ic]) {
      normals[index] = normals[index]! + nx;
      normals[index + 1] = normals[index + 1]! + ny;
      normals[index + 2] = normals[index + 2]! + nz;
    }
  }
  for (let offset = 0; offset < normals.length; offset += 3) {
    const length =
      Math.hypot(
        normals[offset]!,
        normals[offset + 1]!,
        normals[offset + 2]!,
      ) || 1;
    normals[offset] = normals[offset]! / length;
    normals[offset + 1] = normals[offset + 1]! / length;
    normals[offset + 2] = normals[offset + 2]! / length;
  }
  return normals;
}

function maximumIndex(indices: Uint32Array): number {
  let result = 0;
  for (const index of indices) {
    result = Math.max(result, index);
  }
  return result;
}

export function splitJvIndexedMeshForUint16(
  mesh: JvIndexedMesh,
  maxVertices = DEFAULT_MAX_VERTICES,
): readonly JvUint16MeshChunk[] {
  const vertexCount = assertMeshStreams(mesh);
  if (
    !Number.isInteger(maxVertices) ||
    maxVertices < 3 ||
    maxVertices > 65_535
  ) {
    throw new Error("JV mesh chunk vertex limit must be an integer from 3 to 65535.");
  }

  const normals = mesh.normals ?? calculateNormals(mesh.positions, mesh.indices);
  if (vertexCount <= maxVertices && maximumIndex(mesh.indices) < maxVertices) {
    return [
      {
        positions: mesh.positions,
        normals,
        ...(mesh.uvs === undefined ? {} : { uvs: mesh.uvs }),
        indices: new Uint16Array(mesh.indices),
      },
    ];
  }

  const chunks: JvUint16MeshChunk[] = [];
  let remap = new Map<number, number>();
  let positions: number[] = [];
  let chunkNormals: number[] = [];
  let uvs: number[] | null = mesh.uvs === undefined ? null : [];
  let indices: number[] = [];

  const flush = (): void => {
    if (indices.length === 0) {
      return;
    }
    chunks.push({
      positions: new Float32Array(positions),
      normals: new Float32Array(chunkNormals),
      ...(uvs === null ? {} : { uvs: new Float32Array(uvs) }),
      indices: new Uint16Array(indices),
    });
    remap = new Map<number, number>();
    positions = [];
    chunkNormals = [];
    uvs = mesh.uvs === undefined ? null : [];
    indices = [];
  };

  const appendVertex = (sourceIndex: number): number => {
    const existing = remap.get(sourceIndex);
    if (existing !== undefined) {
      return existing;
    }
    const destination = remap.size;
    const positionOffset = sourceIndex * 3;
    positions.push(
      mesh.positions[positionOffset]!,
      mesh.positions[positionOffset + 1]!,
      mesh.positions[positionOffset + 2]!,
    );
    chunkNormals.push(
      normals[positionOffset]!,
      normals[positionOffset + 1]!,
      normals[positionOffset + 2]!,
    );
    if (uvs !== null && mesh.uvs !== undefined) {
      const uvOffset = sourceIndex * 2;
      uvs.push(mesh.uvs[uvOffset]!, mesh.uvs[uvOffset + 1]!);
    }
    remap.set(sourceIndex, destination);
    return destination;
  };

  for (let offset = 0; offset < mesh.indices.length; offset += 3) {
    const triangle = [
      mesh.indices[offset]!,
      mesh.indices[offset + 1]!,
      mesh.indices[offset + 2]!,
    ] as const;
    let requiredVertices = 0;
    for (const sourceIndex of new Set(triangle)) {
      if (!remap.has(sourceIndex)) {
        requiredVertices += 1;
      }
    }
    if (
      indices.length > 0 &&
      remap.size + requiredVertices > maxVertices
    ) {
      flush();
    }
    indices.push(
      appendVertex(triangle[0]),
      appendVertex(triangle[1]),
      appendVertex(triangle[2]),
    );
  }
  flush();

  if (chunks.length === 0) {
    throw new Error("JV mesh chunking produced no triangles.");
  }
  return chunks;
}
