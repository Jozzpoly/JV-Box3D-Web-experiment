export type JvRenderScaleCap = 1 | 1.5 | 2;

export interface JvPerformanceExperimentSettings {
  readonly scanCulling: boolean;
  readonly renderScaleCap: JvRenderScaleCap;
}

export const DEFAULT_JV_PERFORMANCE_EXPERIMENT_SETTINGS:
  JvPerformanceExperimentSettings = Object.freeze({
    scanCulling: true,
    renderScaleCap: 2,
  });

export function parseJvPerformanceExperimentSettings(
  search: string,
): JvPerformanceExperimentSettings {
  const params = new URLSearchParams(search);
  const scanCulling = params.get("jvScanCull") !== "0";
  const requestedScale = params.get("jvRenderScale");
  const renderScaleCap: JvRenderScaleCap =
    requestedScale === "1"
      ? 1
      : requestedScale === "1.5"
        ? 1.5
        : 2;
  return Object.freeze({
    scanCulling,
    renderScaleCap,
  });
}

export function getJvPerformanceExperimentSettings():
  JvPerformanceExperimentSettings {
  const search = typeof globalThis.location === "object"
    ? globalThis.location.search
    : "";
  return parseJvPerformanceExperimentSettings(search);
}
