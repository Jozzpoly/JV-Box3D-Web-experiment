export interface JvRuntimePerformanceFrame {
  readonly browserFrameDeltaMs: number;
  readonly executedSteps: number;
  readonly droppedTimeMs: number;
  readonly physicsStepMs: number;
  readonly presentationMs: number;
  readonly presented: boolean;
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
