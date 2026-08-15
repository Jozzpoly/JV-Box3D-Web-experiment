import { getJvPerformanceExperimentSettings } from "../render/jv-performance-experiment-settings.js";
import { readJvScanRenderStats } from "../render/jv-scan-render-stats.js";
import { readJvRuntimePerformanceFrame } from "./runtime-performance-frame.js";

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
  const hud = document.createElement("div");
  hud.dataset.jvPerfHud = "";
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
    backdropFilter: "blur(4px)",
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
  value.dataset.performance = "";
  value.textContent = hudEnabled ? "SAMPLING" : "OPEN DEBUG TO SAMPLE";
  card.append(term, value);
  metrics.append(card);

  let animationFrame: number | null = null;
  let previousTimestamp: number | null = null;
  let samplingStartedAt: number | null = null;
  let lastHudUpdateAt = -Infinity;
  const frameSamples: TimedFrameSample[] = [];

  const shouldSample = (): boolean =>
    hudEnabled || panel.hasAttribute("data-open");

  const resetWindow = (): void => {
    previousTimestamp = null;
    samplingStartedAt = null;
    lastHudUpdateAt = -Infinity;
    frameSamples.length = 0;
  };

  const updateReadout = (timestamp: number): void => {
    const summary = summarizeJvFrameSamples(
      frameSamples.map((sample) => sample.frameMs),
    );
    if (summary === null) {
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
    const scanText = scan === null || scan.totalGroups === 0
      ? "scan waiting"
      : `scan ${scan.visibleGroups}/${scan.totalGroups} groups · ` +
        `${scan.visibleDrawCalls}/${scan.totalDrawCalls} draws`;
    const runtime = readJvRuntimePerformanceFrame();
    const runtimeText = runtime === null
      ? "runtime waiting"
      : `sim ${runtime.executedSteps} · phys ${runtime.physicsStepMs.toFixed(1)} ms · ` +
        `present ${runtime.presented ? `${runtime.presentationMs.toFixed(1)} ms` : "—"}`;
    const culling = experiment.scanCulling ? "ON" : "OFF";
    const settled = samplingStartedAt !== null &&
      timestamp - samplingStartedAt >= HUD_SETTLE_MS;

    value.textContent =
      `${summary.frameMs.toFixed(1)} ms avg · ${summary.fps.toFixed(0)} fps · ` +
      `p95 ${summary.p95FrameMs.toFixed(1)} ms · ${canvas.width}×${canvas.height} · ` +
      `render ${renderScale}× · device DPR ${devicePixelRatio.toFixed(2)} · ` +
      `${scanText} · ${runtimeText} · cull ${culling}`;

    if (hud !== null) {
      const state = settled ? "SETTLED" : "WARMING";
      hud.textContent =
        `LIVE PERF · ${state} · ${summary.fps.toFixed(0)} fps · ` +
        `${summary.frameMs.toFixed(1)} ms avg · p95 ${summary.p95FrameMs.toFixed(1)} ms\n` +
        `${canvas.width}×${canvas.height} · render ${renderScale}× · ` +
        `DPR ${devicePixelRatio.toFixed(2)} · cap ${experiment.renderScaleCap}×\n` +
        `${scanText} · cull ${culling}\n` +
        runtimeText;
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
        frameSamples.push({ timestamp, frameMs });
      }
    }
    previousTimestamp = timestamp;

    const cutoff = timestamp - ROLLING_WINDOW_MS;
    while (frameSamples.length > 0 && frameSamples[0]!.timestamp < cutoff) {
      frameSamples.shift();
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
