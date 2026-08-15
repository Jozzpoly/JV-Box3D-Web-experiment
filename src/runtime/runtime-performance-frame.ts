/**
 * Cost snapshot for the most recent browser frame that actually presented a
 * new physics state. Browser RAF cadence is measured independently by the
 * performance observer, so zero-step high-refresh RAF callbacks do not erase
 * the useful scene-cost sample with a row of zeroes.
 */
export interface JvRuntimePerformanceFrame {
  readonly browserFrameDeltaMs: number;
  /** Time between this and the previous actually presented scene frame. */
  readonly presentationIntervalMs: number | null;
  readonly executedSteps: number;
  readonly droppedTimeMs: number;
  readonly physicsStepMs: number;
  readonly traceCaptureMs: number;
  readonly renderUiMs: number;
}

let latestFrame: JvRuntimePerformanceFrame | null = null;

export function publishJvRuntimePerformanceFrame(
  frame: JvRuntimePerformanceFrame,
): void {
  latestFrame = Object.freeze({ ...frame });
}

export function readJvRuntimePerformanceFrame():
  JvRuntimePerformanceFrame | null {
  return latestFrame;
}

export function clearJvRuntimePerformanceFrame(): void {
  latestFrame = null;
}
