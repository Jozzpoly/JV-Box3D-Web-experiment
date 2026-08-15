export type JvScanIndexUploadPlan =
  | "UINT16_DIRECT"
  | "UINT32_DIRECT"
  | "UINT16_CHUNKED";

const UINT16_VERTEX_CAPACITY = 65_536;

export function selectJvScanIndexUploadPlan(
  vertexCount: number,
  uint32ElementIndicesSupported: boolean,
): JvScanIndexUploadPlan {
  if (!Number.isSafeInteger(vertexCount) || vertexCount <= 0) {
    throw new Error("JV scan vertexCount must be a positive safe integer.");
  }
  if (uint32ElementIndicesSupported) {
    return "UINT32_DIRECT";
  }
  return vertexCount <= UINT16_VERTEX_CAPACITY
    ? "UINT16_DIRECT"
    : "UINT16_CHUNKED";
}
