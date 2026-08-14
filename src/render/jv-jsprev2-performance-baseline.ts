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

function count(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer.`);
  }
  return value;
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
  // Uint16 chunk indices. Texture residency is deliberately NOT estimated
  // here because encoded PNG bytes are not GPU texture memory.
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
