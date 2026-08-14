export interface JvScanRenderStats {
  readonly visibleGroups: number;
  readonly totalGroups: number;
  readonly visibleDrawCalls: number;
  readonly totalDrawCalls: number;
}

const STATS = new WeakMap<object, JvScanRenderStats>();

export function publishJvScanRenderStats(
  target: object,
  visibleGroups: number,
  totalGroups: number,
  visibleDrawCalls: number,
  totalDrawCalls: number,
): void {
  const previous = STATS.get(target);
  if (
    previous?.visibleGroups === visibleGroups &&
    previous.totalGroups === totalGroups &&
    previous.visibleDrawCalls === visibleDrawCalls &&
    previous.totalDrawCalls === totalDrawCalls
  ) {
    return;
  }
  STATS.set(target, {
    visibleGroups,
    totalGroups,
    visibleDrawCalls,
    totalDrawCalls,
  });
}

export function readJvScanRenderStats(target: object): JvScanRenderStats | null {
  return STATS.get(target) ?? null;
}

export function clearJvScanRenderStats(target: object): void {
  STATS.delete(target);
}
