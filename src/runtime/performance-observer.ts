import { readJvScanRenderStats } from "../render/jv-scan-render-stats.js";

export interface JvFrameWindowSummary {
  readonly frameMs: number;
  readonly fps: number;
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

export function installJvPerformanceObserver(root: ParentNode = document): void {
  const panel = root.querySelector<HTMLElement>("[data-debug-panel]");
  const metrics = root.querySelector<HTMLElement>(".primary-metrics");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-scene]");
  if (panel === null || metrics === null || canvas === null) {
    throw new Error("JV performance observer requires debug panel, metrics and scene canvas.");
  }

  const card = document.createElement("div");
  const term = document.createElement("dt");
  term.textContent = "Frame / viewport";
  const value = document.createElement("dd");
  value.dataset.performance = "";
  value.textContent = "OPEN DEBUG TO SAMPLE";
  card.append(term, value);
  metrics.append(card);

  let animationFrame: number | null = null;
  let previousTimestamp: number | null = null;
  let elapsedMs = 0;
  let frameCount = 0;

  const resetWindow = (): void => {
    previousTimestamp = null;
    elapsedMs = 0;
    frameCount = 0;
  };

  const sample = (timestamp: number): void => {
    if (!panel.hasAttribute("data-open")) {
      animationFrame = null;
      resetWindow();
      return;
    }

    if (previousTimestamp !== null) {
      elapsedMs += timestamp - previousTimestamp;
      frameCount += 1;
    }
    previousTimestamp = timestamp;

    if (elapsedMs >= 500) {
      const summary = summarizeJvFrameWindow(elapsedMs, frameCount);
      if (summary !== null) {
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
          : ((resolution.renderScaleX + resolution.renderScaleY) / 2)
              .toFixed(2);
        const scan = readJvScanRenderStats(canvas);
        const scanText = scan === null || scan.totalGroups === 0
          ? ""
          : ` · scan ${scan.visibleGroups}/${scan.totalGroups} groups · ` +
            `${scan.visibleDrawCalls}/${scan.totalDrawCalls} draws`;
        value.textContent =
          `${summary.frameMs.toFixed(1)} ms · ${summary.fps.toFixed(0)} fps · ` +
          `${canvas.width}×${canvas.height} · render ${renderScale}× · ` +
          `device DPR ${devicePixelRatio.toFixed(2)}${scanText}`;
      }
      elapsedMs = 0;
      frameCount = 0;
    }

    animationFrame = window.requestAnimationFrame(sample);
  };

  const start = (): void => {
    if (animationFrame !== null || !panel.hasAttribute("data-open")) {
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
    if (panel.hasAttribute("data-open")) {
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
    },
    { once: true },
  );
}
