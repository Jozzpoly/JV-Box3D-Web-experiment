export interface FixedStepClockOptions {
  readonly fixedStepMs: number;
  readonly maxCatchUpSteps: number;
  readonly maxFrameDeltaMs: number;
}

export interface FixedStepInterval {
  readonly index: number;
  readonly startTimeMs: number;
  readonly endTimeMs: number;
  readonly durationMs: number;
}

export interface DroppedSimulationInterval {
  readonly startTimeMs: number;
  readonly endTimeMs: number;
  readonly durationMs: number;
}

export interface FrameAdvanceReport {
  readonly frameTimeMs: number;
  readonly rawFrameDeltaMs: number;
  readonly acceptedFrameDeltaMs: number;
  readonly executedSteps: number;
  readonly droppedTimeMs: number;
  readonly interpolationAlpha: number;
  readonly simulationTimeMs: number;
}

const EPSILON_MS = 1e-9;

function assertPositiveFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
}

export class FixedStepClock {
  readonly #options: FixedStepClockOptions;
  #lastFrameTimeMs: number;
  #simulationTimeMs: number;
  #accumulatorMs = 0;
  #stepIndex = 0;

  constructor(startTimeMs: number, options: FixedStepClockOptions) {
    if (!Number.isFinite(startTimeMs)) {
      throw new RangeError("startTimeMs must be finite.");
    }

    assertPositiveFinite("fixedStepMs", options.fixedStepMs);
    assertPositiveFinite("maxFrameDeltaMs", options.maxFrameDeltaMs);
    if (!Number.isInteger(options.maxCatchUpSteps) || options.maxCatchUpSteps <= 0) {
      throw new RangeError("maxCatchUpSteps must be a positive integer.");
    }

    this.#options = { ...options };
    this.#lastFrameTimeMs = startTimeMs;
    this.#simulationTimeMs = startTimeMs;
  }

  get fixedStepMs(): number {
    return this.#options.fixedStepMs;
  }

  get simulationTimeMs(): number {
    return this.#simulationTimeMs;
  }

  advance(
    frameTimeMs: number,
    onStep: (step: FixedStepInterval) => void,
    onDrop?: (interval: DroppedSimulationInterval) => void,
  ): FrameAdvanceReport {
    if (!Number.isFinite(frameTimeMs)) {
      throw new RangeError("frameTimeMs must be finite.");
    }

    const rawFrameDeltaMs = Math.max(0, frameTimeMs - this.#lastFrameTimeMs);
    const acceptedFrameDeltaMs = Math.min(rawFrameDeltaMs, this.#options.maxFrameDeltaMs);
    const clampedFrameGapMs = rawFrameDeltaMs - acceptedFrameDeltaMs;
    let droppedTimeMs = 0;
    this.#lastFrameTimeMs = Math.max(this.#lastFrameTimeMs, frameTimeMs);

    if (clampedFrameGapMs > 0) {
      const droppedPrefixMs = this.#accumulatorMs + clampedFrameGapMs;
      const startTimeMs = this.#simulationTimeMs;
      const endTimeMs = startTimeMs + droppedPrefixMs;
      this.#simulationTimeMs = endTimeMs;
      this.#accumulatorMs = 0;
      droppedTimeMs += droppedPrefixMs;
      onDrop?.({ startTimeMs, endTimeMs, durationMs: droppedPrefixMs });
    }

    this.#accumulatorMs += acceptedFrameDeltaMs;

    let executedSteps = 0;
    while (
      this.#accumulatorMs + EPSILON_MS >= this.#options.fixedStepMs &&
      executedSteps < this.#options.maxCatchUpSteps
    ) {
      const startTimeMs = this.#simulationTimeMs;
      const endTimeMs = startTimeMs + this.#options.fixedStepMs;
      onStep({
        index: this.#stepIndex,
        startTimeMs,
        endTimeMs,
        durationMs: this.#options.fixedStepMs,
      });

      this.#simulationTimeMs = endTimeMs;
      this.#accumulatorMs -= this.#options.fixedStepMs;
      if (this.#accumulatorMs < EPSILON_MS) {
        this.#accumulatorMs = 0;
      }
      this.#stepIndex += 1;
      executedSteps += 1;
    }

    if (this.#accumulatorMs + EPSILON_MS >= this.#options.fixedStepMs) {
      const wholeDroppedSteps = Math.floor(
        (this.#accumulatorMs + EPSILON_MS) / this.#options.fixedStepMs,
      );
      const droppedBacklogMs = wholeDroppedSteps * this.#options.fixedStepMs;
      const startTimeMs = this.#simulationTimeMs;
      const endTimeMs = startTimeMs + droppedBacklogMs;

      this.#simulationTimeMs = endTimeMs;
      this.#accumulatorMs -= droppedBacklogMs;
      if (this.#accumulatorMs < EPSILON_MS) {
        this.#accumulatorMs = 0;
      }
      this.#stepIndex += wholeDroppedSteps;
      droppedTimeMs += droppedBacklogMs;
      onDrop?.({ startTimeMs, endTimeMs, durationMs: droppedBacklogMs });
    }

    return {
      frameTimeMs,
      rawFrameDeltaMs,
      acceptedFrameDeltaMs,
      executedSteps,
      droppedTimeMs,
      interpolationAlpha: this.#accumulatorMs / this.#options.fixedStepMs,
      simulationTimeMs: this.#simulationTimeMs,
    };
  }
}
