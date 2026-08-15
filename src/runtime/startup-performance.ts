export interface JvStartupPerformanceSnapshot {
  /** Product-world loader wall time. Includes scan network/decode/merge when scan is selected. */
  readonly productWorldLoadMs?: number;
  /** Synchronous world renderer setup and initial GPU buffer/placeholder texture submission. */
  readonly worldGpuSetupMs?: number;
  /** Box3D module/boundary load time. */
  readonly box3dBoundaryLoadMs?: number;
  /** Static world/collision installation time inside Box3D. */
  readonly box3dWorldCreateMs?: number;
  /** Vehicle topology creation time after the world exists. */
  readonly vehicleCreateMs?: number;
}

let latestSnapshot: JvStartupPerformanceSnapshot | null = null;

export function publishJvStartupPerformance(
  patch: JvStartupPerformanceSnapshot,
): void {
  latestSnapshot = Object.freeze({
    ...(latestSnapshot ?? {}),
    ...patch,
  });
}

export function readJvStartupPerformance():
  JvStartupPerformanceSnapshot | null {
  return latestSnapshot;
}

export function clearJvStartupPerformance(): void {
  latestSnapshot = null;
}
