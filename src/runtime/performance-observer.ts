import { getJvPerformanceExperimentSettings } from "../render/jv-performance-experiment-settings.js";
import { readJvScanRenderStats } from "../render/jv-scan-render-stats.js";
import { readJvJsprev2LoadingStats } from "../scene/jsprev2-loading-stats.js";
import { readJvRuntimePerformanceFrame } from "./runtime-performance-frame.js";
import { readJvStartupPerformance } from "./startup-performance.js";

export interface JvFrameWindowSummary {
  readonly frameMs: number;
  readonly fps: number;
}

export interface JvRollingFrameSummary extends JvFrameWindowSummary {
  readonly p95FrameMs: number;
  readonly sampleCount: number;
}

export interface JvCanvasResolutionSummary {
  readonly renderScaleX: number;
  readonly renderScaleY: number;
  readonly devicePixelRatio: number;
}

export function summarizeJvFrameWindow(
  elapsedMs: number,
  frameCount: number,
): JvFrameWindowSummary | null {
  if (
    !Number.isFinite(elapsedMs) ||
    elapsedMs <= 0 ||
    !Number.isInteger(frameCount) ||
    frameCount <= 0
  ) {
    return null;
  }
  const frameMs = elapsedMs / frameCount;
  return {
    frameMs,
    fps: 1000 / frameMs,
  };
}

export function summarizeJvFrameSamples(
  frameTimesMs: readonly number[],
): JvRollingFrameSummary | null {
  if (
    frameTimesMs.length === 0 ||
    frameTimesMs.some((sample) => !Number.isFinite(sample) || sample <= 0)
  ) {
    return null;
  }

  let elapsedMs = 0;
  for (const sample of frameTimesMs) {
    elapsedMs += sample;
  }
  const average = summarizeJvFrameWindow(elapsedMs, frameTimesMs.length);
  if (average === null) {
    return null;
  }

  const ordered = [...frameTimesMs].sort((a, b) => a - b);
  const p95Index = Math.min(
    ordered.length - 1,
    Math.max(0, Math.ceil(ordered.length * 0.95) - 1),
  );
  return {
    ...average,
    p95FrameMs: ordered[p95Index]!,
    sampleCount: ordered.length,
  };
}

export function summarizeJvCanvasResolution(
  backingWidth: number,
  backingHeight: number,
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
): JvCanvasResolutionSummary | null {
  if (
    !Number.isFinite(backingWidth) ||
    backingWidth <= 0 ||
    !Number.isFinite(backingHeight) ||
    backingHeight <= 0 ||
    !Number.isFinite(cssWidth) ||
    cssWidth <= 0 ||
    !Number.isFinite(cssHeight) ||
    cssHeight <= 0 ||
    !Number.isFinite(devicePixelRatio) ||
    devicePixelRatio <= 0
  ) {
    return null;
  }
  return {
    renderScaleX: backingWidth / cssWidth,
    renderScaleY: backingHeight / cssHeight,
    devicePixelRatio,
  };
}

type TimedFrameSample = Readonly<{
  timestamp: number;
  frameMs: number;
}>;

const ROLLING_WINDOW_MS = 2_000;
const HUD_UPDATE_MS = 500;
const HUD_SETTLE_MS = 1_500;

function performanceHudRequested(): boolean {
  return new URLSearchParams(window.location.search).get("jvPerfHud") === "1";
}

function createPerformanceHud(): HTMLElement {
  const avoidBackdropFx = window.matchMedia(
    "(hover: none) and (pointer: coarse), (max-width: 620px)",
  ).matches;
  const hud = document.createElement("div");
  hud.setAttribute("data-jv-perf-hud", "");
  hud.setAttribute("aria-live", "off");
  Object.assign(hud.style, {
    position: "fixed",
    zIndex: "20",
    top: "max(12px, env(safe-area-inset-top))",
    right: "max(12px, env(safe-area-inset-right))",
    maxWidth: "min(440px, calc(100vw - 24px))",
    padding: "8px 10px",
    border: "1px solid rgba(126, 220, 166, 0.36)",
    borderRadius: "10px",
    background: "rgba(7, 12, 11, 0.84)",
    color: "#f0f6f2",
    font: "600 clamp(11px, 1.6vw, 14px)/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    letterSpacing: "0.01em",
    textAlign: "right",
    whiteSpace: "pre-line",
    pointerEvents: "none",
    backdropFilter: avoidBackdropFx ? "none" : "blur(4px)",
    WebkitBackdropFilter: avoidBackdropFx ? "none" : "blur(4px)",
  });
  hud.textContent = "LIVE PERF · warming…";
  document.body.append(hud);
  return hud;
}

export function installJvPerformanceObserver(root: ParentNode = document): void {
  const panel = root.querySelector<HTMLElement>("[data-debug-panel]");
  const metrics = root.querySelector<HTMLElement>(".primary-metrics");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-scene]");
  if (panel === null || metrics === null || canvas === null) {
    throw new Error("JV performance observer requires debug panel, metrics and scene canvas.");
  }

  const hudEnabled = performanceHudRequested();
  const hud = hudEnabled ? createPerformanceHud() : null;
  const experiment = getJvPerformanceExperimentSettings();

  const card = document.createElement("div");
  const term = document.createElement("dt");
  term.textContent = "Frame / viewport";
  const value = document.createElement("dd");
  value.dataset["performance"] = "";
  value.textContent = hudEnabled ? "SAMPLING" : "OPEN DEBUG TO SAMPLE";
  card.append(term, value);
  metrics.append(card);

  let animationFrame: number | null = null;
  let previousTimestamp: number | null = null;
  let samplingStartedAt: number | null = null;
  let lastHudUpdateAt = -Infinity;
  const browserFrameSamples: TimedFrameSample[] = [];
  const presentationFrameSamples: TimedFrameSample[] = [];
  let lastObservedRuntimeFrame = readJvRuntimePerformanceFrame();

  const shouldSample = (): boolean =>
    hudEnabled || panel.hasAttribute("data-open");

  const resetWindow = (): void => {
    previousTimestamp = null;
    samplingStartedAt = null;
    lastHudUpdateAt = -Infinity;
    browserFrameSamples.length = 0;
    presentationFrameSamples.length = 0;
    lastObservedRuntimeFrame = readJvRuntimePerformanceFrame();
  };

  const updateReadout = (timestamp: number): void => {
    const browserSummary = summarizeJvFrameSamples(
      browserFrameSamples.map((sample) => sample.frameMs),
    );
    if (browserSummary === null) {
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const resolution = summarizeJvCanvasResolution(
      canvas.width,
      canvas.height,
      canvas.clientWidth,
      canvas.clientHeight,
      devicePixelRatio,
    );
    const renderScale = resolution === null
      ? "?"
      : ((resolution.renderScaleX + resolution.renderScaleY) / 2).toFixed(2);
    const scan = readJvScanRenderStats(canvas);
    const texturePending = scan === null
      ? 0
      : Math.max(
        0,
        scan.totalGroups - scan.readyTextures - scan.failedTextures,
      );
    const scanText = scan === null || scan.totalGroups === 0
      ? "scan waiting"
      : `scan ${scan.visibleGroups}/${scan.totalGroups} groups · ` +
        `${scan.visibleDrawCalls}/${scan.totalDrawCalls} draws · ` +
        `tex ${scan.readyTextures}/${scan.totalGroups} ready · ` +
        `${texturePending} pending` +
        (scan.failedTextures === 0 ? "" : ` · ${scan.failedTextures} failed`) +
        ` · upload ${scan.textureUploadMs.toFixed(1)} ms`;
    const presentationSummary = summarizeJvFrameSamples(
      presentationFrameSamples.map((sample) => sample.frameMs),
    );
    const runtime = readJvRuntimePerformanceFrame();
    const presentationText = presentationSummary === null
      ? "scene cadence warming"
      : `scene ${presentationSummary.fps.toFixed(0)} present/s · ` +
        `${presentationSummary.frameMs.toFixed(1)} ms avg · ` +
        `p95 ${presentationSummary.p95FrameMs.toFixed(1)} ms`;
    const runtimeText = runtime === null
      ? "scene timing waiting"
      : `scene sim ${runtime.executedSteps} · phys ${runtime.physicsStepMs.toFixed(1)} ms · ` +
        `trace ${runtime.traceCaptureMs.toFixed(1)} ms · ` +
        `render+ui ${runtime.renderUiMs.toFixed(1)} ms`;
    const startup = readJvStartupPerformance();
    const startupParts: string[] = [];
    if (startup?.productWorldLoadMs !== undefined) {
      startupParts.push(`world ${startup.productWorldLoadMs.toFixed(0)} ms`);
    }
    if (startup?.worldGpuSetupMs !== undefined) {
      startupParts.push(`gpu-sync ${startup.worldGpuSetupMs.toFixed(0)} ms`);
    }
    if (startup?.box3dBoundaryLoadMs !== undefined) {
      startupParts.push(`b3-load ${startup.box3dBoundaryLoadMs.toFixed(0)} ms`);
    }
    if (startup?.box3dWorldCreateMs !== undefined) {
      startupParts.push(`b3-world ${startup.box3dWorldCreateMs.toFixed(0)} ms`);
    }
    if (startup?.vehicleCreateMs !== undefined) {
      startupParts.push(`vehicle ${startup.vehicleCreateMs.toFixed(0)} ms`);
    }
    const startupText = startupParts.length === 0
      ? "startup timing waiting"
      : `startup ${startupParts.join(" · ")}`;
    const scanLoading = readJvJsprev2LoadingStats();
    const scanLoadParts: string[] = [];
    if (scanLoading?.indexLoadMs !== undefined) {
      scanLoadParts.push(`index ${scanLoading.indexLoadMs.toFixed(0)} ms`);
    }
    if (scanLoading?.tilePipelineMs !== undefined) {
      scanLoadParts.push(`tiles ${scanLoading.tilePipelineMs.toFixed(0)} ms`);
    }
    if (scanLoading?.tileParseCpuMs !== undefined) {
      scanLoadParts.push(`parse ${scanLoading.tileParseCpuMs.toFixed(0)} ms`);
    }
    if (scanLoading?.collisionMergeMs !== undefined) {
      scanLoadParts.push(`merge ${scanLoading.collisionMergeMs.toFixed(0)} ms`);
    }
    const scanLoadText = scanLoadParts.length === 0
      ? null
      : `scan-load ${scanLoadParts.join(" · ")}`;
    const culling = experiment.scanCulling ? "ON" : "OFF";
    const cadenceSettled = samplingStartedAt !== null &&
      timestamp - samplingStartedAt >= HUD_SETTLE_MS;
    const texturesSettled = scan === null ||
      scan.totalGroups === 0 ||
      texturePending === 0;
    const settled = cadenceSettled && texturesSettled;

    value.textContent =
      `browser ${browserSummary.frameMs.toFixed(1)} ms avg · ` +
      `${browserSummary.fps.toFixed(0)} RAF/s · ` +
      `p95 ${browserSummary.p95FrameMs.toFixed(1)} ms · ` +
      `${presentationText} · ${canvas.width}×${canvas.height} · ` +
      `render ${renderScale}× · device DPR ${devicePixelRatio.toFixed(2)} · ` +
      `${scanText} · ${runtimeText} · ${startupText}` +
      (scanLoadText === null ? "" : ` · ${scanLoadText}`) +
      ` · cull ${culling}`;

    if (hud !== null) {
      const state = settled
        ? "SETTLED"
        : cadenceSettled && !texturesSettled
        ? "TEXTURES"
        : "WARMING";
      hud.textContent =
        `LIVE PERF · ${state}\n` +
        `browser ${browserSummary.fps.toFixed(0)} RAF/s · ` +
        `${browserSummary.frameMs.toFixed(1)} ms avg · ` +
        `p95 ${browserSummary.p95FrameMs.toFixed(1)} ms\n` +
        `${presentationText}\n` +
        `${canvas.width}×${canvas.height} · render ${renderScale}× · ` +
        `DPR ${devicePixelRatio.toFixed(2)} · cap ${experiment.renderScaleCap}×\n` +
        `${scanText} · cull ${culling}\n` +
        `${runtimeText}\n` +
        startupText +
        (scanLoadText === null ? "" : `\n${scanLoadText}`);
    }
  };

  const sample = (timestamp: number): void => {
    if (!shouldSample()) {
      animationFrame = null;
      resetWindow();
      return;
    }

    if (samplingStartedAt === null) {
      samplingStartedAt = timestamp;
    }
    if (previousTimestamp !== null) {
      const frameMs = timestamp - previousTimestamp;
      if (Number.isFinite(frameMs) && frameMs > 0) {
        browserFrameSamples.push({ timestamp, frameMs });
      }
    }
    previousTimestamp = timestamp;

    const latestRuntimeFrame = readJvRuntimePerformanceFrame();
    if (
      latestRuntimeFrame !== null &&
      latestRuntimeFrame !== lastObservedRuntimeFrame
    ) {
      lastObservedRuntimeFrame = latestRuntimeFrame;
      const presentationIntervalMs = latestRuntimeFrame.presentationIntervalMs;
      if (
        presentationIntervalMs !== null &&
        Number.isFinite(presentationIntervalMs) &&
        presentationIntervalMs > 0
      ) {
        presentationFrameSamples.push({
          timestamp,
          frameMs: presentationIntervalMs,
        });
      }
    }

    const cutoff = timestamp - ROLLING_WINDOW_MS;
    while (
      browserFrameSamples.length > 0 &&
      browserFrameSamples[0]!.timestamp < cutoff
    ) {
      browserFrameSamples.shift();
    }
    while (
      presentationFrameSamples.length > 0 &&
      presentationFrameSamples[0]!.timestamp < cutoff
    ) {
      presentationFrameSamples.shift();
    }

    if (timestamp - lastHudUpdateAt >= HUD_UPDATE_MS) {
      updateReadout(timestamp);
      lastHudUpdateAt = timestamp;
    }

    animationFrame = window.requestAnimationFrame(sample);
  };

  const start = (): void => {
    if (animationFrame !== null || !shouldSample()) {
      return;
    }
    resetWindow();
    animationFrame = window.requestAnimationFrame(sample);
  };

  const stop = (): void => {
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    resetWindow();
  };

  const observer = new MutationObserver(() => {
    if (shouldSample()) {
      start();
    } else {
      stop();
      value.textContent = "OPEN DEBUG TO SAMPLE";
    }
  });
  observer.observe(panel, {
    attributes: true,
    attributeFilter: ["data-open"],
  });

  start();
  window.addEventListener(
    "pagehide",
    () => {
      observer.disconnect();
      stop();
      hud?.remove();
    },
    { once: true },
  );
}
