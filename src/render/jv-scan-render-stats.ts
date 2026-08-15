export interface JvScanRenderStats {
  readonly visibleGroups: number;
  readonly totalGroups: number;
  readonly visibleDrawCalls: number;
  readonly totalDrawCalls: number;
  readonly readyTextures: number;
  readonly failedTextures: number;
  readonly textureUploadMs: number;
}

const STATS = new WeakMap<object, JvScanRenderStats>();

export function publishJvScanRenderStats(
  target: object,
  visibleGroups: number,
  totalGroups: number,
  visibleDrawCalls: number,
  totalDrawCalls: number,
  readyTextures: number,
  failedTextures: number,
  textureUploadMs: number,
): void {
  const previous = STATS.get(target);
  if (
    previous?.visibleGroups === visibleGroups &&
    previous.totalGroups === totalGroups &&
    previous.visibleDrawCalls === visibleDrawCalls &&
    previous.totalDrawCalls === totalDrawCalls &&
    previous.readyTextures === readyTextures &&
    previous.failedTextures === failedTextures &&
    previous.textureUploadMs === textureUploadMs
  ) {
    return;
  }
  STATS.set(target, {
    visibleGroups,
    totalGroups,
    visibleDrawCalls,
    totalDrawCalls,
    readyTextures,
    failedTextures,
    textureUploadMs,
  });
}

export function readJvScanRenderStats(target: object): JvScanRenderStats | null {
  return STATS.get(target) ?? null;
}

export function clearJvScanRenderStats(target: object): void {
  STATS.delete(target);
}
