export interface JvJsprev2LoadingStats {
  readonly indexLoadMs?: number;
  readonly tilePipelineMs?: number;
  readonly tileParseCpuMs?: number;
  readonly collisionMergeMs?: number;
}

let latestStats: JvJsprev2LoadingStats | null = null;

export function publishJvJsprev2LoadingStats(
  patch: JvJsprev2LoadingStats,
): void {
  latestStats = Object.freeze({
    ...(latestStats ?? {}),
    ...patch,
  });
}

export function readJvJsprev2LoadingStats(): JvJsprev2LoadingStats | null {
  return latestStats;
}

export function clearJvJsprev2LoadingStats(): void {
  latestStats = null;
}
