export interface JvJsprev2PerformanceInput {
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly triangleCount: number;
  readonly groupCount: number;
  readonly textureCount: number;
  readonly totalBytes: number;
  readonly textureBytes: number;
  /** Exporter/manifest estimate retained for contract auditing only. */
  readonly estimatedCpuGeometryBytes: number;
  /** Exporter/manifest estimate retained for contract auditing only. */
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
  /** Bytes submitted by the current all-Uint32 direct scan path when supported. */
  readonly directUint32UploadBytes: number;
  /** Theoretical no-duplication floor for a fully Uint16 index representation. */
  readonly uint16UploadFloorBytes: number;
  /** Value declared by the JSPREV2 manifest/exporter, not measured GPU residency. */
  readonly declaredGpuGeometryEstimateBytes: number;
  readonly cpuEstimateMatchesContract: boolean;
  readonly declaredGpuEstimateMatchesUint16Floor: boolean;
}

const WEBGL1_UINT16_INDEX_CAPACITY = 65_536;
const BYTES_PER_RENDER_VERTEX = 32;
const BYTES_PER_COLLISION_VERTEX = 12;
const BYTES_PER_UINT16_INDEX = 2;
const BYTES_PER_UINT32_INDEX = 4;

function count(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer.`);
  }
  return value;
}

/**
 * Vertex-count-only lower bound for legacy Uint16 chunking. The real chunker
 * must preserve triangle topology and can duplicate/remap vertices, so this is
 * deliberately not presented as an exact draw count.
 */
export function minimumJvUint16ChunkDrawLowerBound(
  groupVertexCounts: readonly number[],
  maxVertices = WEBGL1_UINT16_INDEX_CAPACITY,
): number {
  if (
    !Number.isSafeInteger(maxVertices) ||
    maxVertices < 3 ||
    maxVertices > WEBGL1_UINT16_INDEX_CAPACITY
  ) {
    throw new Error("JSPREV2 maxVertices must be an integer from 3 to 65536.");
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
  const declaredGpuGeometryEstimateBytes = count(
    input.estimatedGpuGeometryBytes,
    "JSPREV2 estimatedGpuGeometryBytes",
  );

  if (indexCount % 3 !== 0 || triangleCount !== indexCount / 3) {
    throw new Error("JSPREV2 triangle count does not match its index count.");
  }

  // Parsed render groups keep POSITION + NORMAL + UV as Float32 and the source
  // index stream as Uint32, independent of the eventual WebGL upload strategy.
  const renderTypedArrayBytes =
    vertexCount * BYTES_PER_RENDER_VERTEX +
    indexCount * BYTES_PER_UINT32_INDEX;

  // The current collision merge duplicates POSITION as Float32 and indices as
  // Uint32 in one additional JS mesh.
  const collisionTypedArrayBytes =
    vertexCount * BYTES_PER_COLLISION_VERTEX +
    indexCount * BYTES_PER_UINT32_INDEX;
  const totalTypedArrayGeometryBytes =
    renderTypedArrayBytes + collisionTypedArrayBytes;

  // These are upload-payload calculations, NOT driver/GPU residency claims.
  // Current 5eeb uses one direct Uint32 EBO per scan group when the WebGL1
  // extension exists. The manifest's historical GPU estimate instead matches
  // the no-duplication Uint16 floor used by the older export model.
  const directUint32UploadBytes = renderTypedArrayBytes;
  const uint16UploadFloorBytes =
    vertexCount * BYTES_PER_RENDER_VERTEX +
    indexCount * BYTES_PER_UINT16_INDEX;

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
    directUint32UploadBytes,
    uint16UploadFloorBytes,
    declaredGpuGeometryEstimateBytes,
    cpuEstimateMatchesContract:
      totalTypedArrayGeometryBytes === declaredCpuGeometryBytes,
    declaredGpuEstimateMatchesUint16Floor:
      uint16UploadFloorBytes === declaredGpuGeometryEstimateBytes,
  };
}
