export interface JvJsprev2PerformanceInput {
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly triangleCount: number;
  readonly groupCount: number;
  readonly textureCount: number;
  readonly totalBytes: number;
  readonly textureBytes: number;
  readonly estimatedCpuGeometryBytes: number;
  readonly estimatedGpuGeometryBytes: number;
}

export interface JvJsprev2PerformanceBaseline {
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly triangleCount: number;
  readonly drawGroups: number;
  readonly textureCount: number;
  readonly sourcePayloadBytes: number;
  readonly encodedTextureBytes: number;
  readonly renderTypedArrayBytes: number;
  readonly collisionTypedArrayBytes: number;
  readonly totalTypedArrayGeometryBytes: number;
  readonly estimatedGpuGeometryBytes: number;
  readonly cpuEstimateMatchesContract: boolean;
  readonly gpuEstimateMatchesContract: boolean;
}

const WEBGL1_MAX_UINT16_VERTICES = 65_535;

function count(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer.`);
  }
  return value;
}

export function minimumJvUint16DrawCalls(
  groupVertexCounts: readonly number[],
  maxVertices = WEBGL1_MAX_UINT16_VERTICES,
): number {
  if (
    !Number.isSafeInteger(maxVertices) ||
    maxVertices < 3 ||
    maxVertices > WEBGL1_MAX_UINT16_VERTICES
  ) {
    throw new Error("JSPREV2 maxVertices must be an integer from 3 to 65535.");
  }
  let result = 0;
  for (const [index, value] of groupVertexCounts.entries()) {
    const vertices = count(value, `JSPREV2 group ${index} vertexCount`);
    if (vertices === 0) {
      throw new Error(`JSPREV2 group ${index} vertexCount must be > 0.`);
    }
    result += Math.ceil(vertices / maxVertices);
  }
  return result;
}

export function estimateRgba8TextureBaseLevelBytes(
  textureCount: number,
  width: number,
  height: number,
): number {
  const textures = count(textureCount, "JSPREV2 textureCount");
  const textureWidth = count(width, "JSPREV2 texture width");
  const textureHeight = count(height, "JSPREV2 texture height");
  if (textures === 0 || textureWidth === 0 || textureHeight === 0) {
    return 0;
  }
  const bytes = textures * textureWidth * textureHeight * 4;
  if (!Number.isSafeInteger(bytes)) {
    throw new Error("JSPREV2 RGBA8 texture estimate exceeds safe integer range.");
  }
  return bytes;
}

export function summarizeJvJsprev2PerformanceBaseline(
  input: JvJsprev2PerformanceInput,
): JvJsprev2PerformanceBaseline {
  const vertexCount = count(input.vertexCount, "JSPREV2 vertexCount");
  const indexCount = count(input.indexCount, "JSPREV2 indexCount");
  const triangleCount = count(input.triangleCount, "JSPREV2 triangleCount");
  const drawGroups = count(input.groupCount, "JSPREV2 groupCount");
  const textureCount = count(input.textureCount, "JSPREV2 textureCount");
  const sourcePayloadBytes = count(input.totalBytes, "JSPREV2 totalBytes");
  const encodedTextureBytes = count(
    input.textureBytes,
    "JSPREV2 textureBytes",
  );
  const declaredCpuGeometryBytes = count(
    input.estimatedCpuGeometryBytes,
    "JSPREV2 estimatedCpuGeometryBytes",
  );
  const declaredGpuGeometryBytes = count(
    input.estimatedGpuGeometryBytes,
    "JSPREV2 estimatedGpuGeometryBytes",
  );

  if (indexCount % 3 !== 0 || triangleCount !== indexCount / 3) {
    throw new Error("JSPREV2 triangle count does not match its index count.");
  }

  // Parsed render groups keep POSITION + NORMAL + UV as Float32 and indices
  // as Uint32 before WebGL1 chunking.
  const renderTypedArrayBytes = vertexCount * 32 + indexCount * 4;

  // The current collision merge duplicates POSITION as Float32 and indices
  // as Uint32 in one additional mesh.
  const collisionTypedArrayBytes = vertexCount * 12 + indexCount * 4;
  const totalTypedArrayGeometryBytes =
    renderTypedArrayBytes + collisionTypedArrayBytes;

  // Current WebGL geometry uploads use the same 32-byte vertex payload and
  // Uint16 chunk indices. Texture residency is deliberately separate because
  // encoded PNG bytes are not GPU texture memory.
  const estimatedGpuGeometryBytes = vertexCount * 32 + indexCount * 2;

  return {
    vertexCount,
    indexCount,
    triangleCount,
    drawGroups,
    textureCount,
    sourcePayloadBytes,
    encodedTextureBytes,
    renderTypedArrayBytes,
    collisionTypedArrayBytes,
    totalTypedArrayGeometryBytes,
    estimatedGpuGeometryBytes,
    cpuEstimateMatchesContract:
      totalTypedArrayGeometryBytes === declaredCpuGeometryBytes,
    gpuEstimateMatchesContract:
      estimatedGpuGeometryBytes === declaredGpuGeometryBytes,
  };
}
