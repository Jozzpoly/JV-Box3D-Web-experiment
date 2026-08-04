import {
  FixedStepClock,
  type FrameAdvanceReport,
  type FixedStepInterval,
} from "../core/fixed-step-clock.js";
import {
  OwnedResourceStack,
  runResourceTransaction,
} from "../core/owned-resource-stack.js";
import { KeyboardLongitudinalAdapter } from "../input/keyboard-longitudinal-adapter.js";
import { KeyboardSteeringAdapter } from "../input/keyboard-steering-adapter.js";
import {
  LongitudinalInputTimeline,
  type LongitudinalTimelineSample,
} from "../input/longitudinal-input-timeline.js";
import {
  SteeringInputTimeline,
  type SteeringTimelineSample,
} from "../input/steering-input-timeline.js";

export interface AnimationFrameDriver {
  request(callback: FrameRequestCallback): number;
  cancel(handle: number): void;
}

export interface CleanBrowserHostOptions {
  readonly now: () => number;
  readonly animationFrames: AnimationFrameDriver;
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly isDocumentHidden: () => boolean;
  readonly onStep: (
    step: FixedStepInterval,
    steering: SteeringTimelineSample,
    longitudinal: LongitudinalTimelineSample,
  ) => void;
  readonly onFrame?: (report: FrameAdvanceReport) => void;
  readonly onFatalError?: (error: unknown) => void;
}

interface HostState {
  disposed: boolean;
  fatalError: unknown | null;
}

export class CleanBrowserHost {
  readonly #resources: OwnedResourceStack;
  readonly #state: HostState;

  private constructor(resources: OwnedResourceStack, state: HostState) {
    this.#resources = resources;
    this.#state = state;
  }

  static start(options: CleanBrowserHostOptions): CleanBrowserHost {
    const state: HostState = { disposed: false, fatalError: null };
    let committedResources: OwnedResourceStack | null = null;

    const transaction = runResourceTransaction((resources) => {
      const startTimeMs = options.now();
      const steeringTimeline = new SteeringInputTimeline(startTimeMs);
      const longitudinalTimeline = new LongitudinalInputTimeline(
        startTimeMs,
      );
      const steeringKeyboard = new KeyboardSteeringAdapter({
        windowTarget: options.windowTarget,
        documentTarget: options.documentTarget,
        timeline: steeringTimeline,
        now: options.now,
        isDocumentHidden: options.isDocumentHidden,
      });
      resources.defer(
        "keyboard steering adapter",
        () => steeringKeyboard.dispose(),
      );
      const longitudinalKeyboard = new KeyboardLongitudinalAdapter({
        windowTarget: options.windowTarget,
        documentTarget: options.documentTarget,
        timeline: longitudinalTimeline,
        now: options.now,
        isDocumentHidden: options.isDocumentHidden,
      });
      resources.defer(
        "keyboard longitudinal adapter",
        () => longitudinalKeyboard.dispose(),
      );

      const clock = new FixedStepClock(startTimeMs, {
        fixedStepMs: 1000 / 60,
        maxCatchUpSteps: 8,
        maxFrameDeltaMs: 250,
      });

      let animationFrameHandle = 0;
      let running = true;
      resources.defer("animation frame", () => {
        running = false;
        if (animationFrameHandle !== 0) {
          options.animationFrames.cancel(animationFrameHandle);
          animationFrameHandle = 0;
        }
      });

      const frame: FrameRequestCallback = (frameTimeMs) => {
        if (!running || state.disposed) {
          return;
        }
        animationFrameHandle = 0;

        try {
          const report = clock.advance(
            frameTimeMs,
            (step) => {
              const steering = steeringTimeline.consumeInterval(
                step.startTimeMs,
                step.endTimeMs,
              );
              const longitudinal = longitudinalTimeline.consumeInterval(
                step.startTimeMs,
                step.endTimeMs,
              );
              options.onStep(step, steering, longitudinal);
            },
            (dropped) => {
              steeringTimeline.skipInterval(
                dropped.startTimeMs,
                dropped.endTimeMs,
              );
              longitudinalTimeline.skipInterval(
                dropped.startTimeMs,
                dropped.endTimeMs,
              );
            },
          );
          options.onFrame?.(report);
        } catch (error: unknown) {
          running = false;
          state.disposed = true;
          state.fatalError = error;
          const disposal = committedResources?.dispose();
          const fatal =
            disposal !== undefined && disposal.failures.length > 0
              ? new AggregateError(
                  [
                    error,
                    ...disposal.failures.map(
                      (failure) => failure.error,
                    ),
                  ],
                  "Browser host runtime failed and cleanup reported errors.",
                )
              : error;
          options.onFatalError?.(fatal);
          return;
        }

        if (running && !state.disposed) {
          animationFrameHandle = options.animationFrames.request(frame);
        }
      };

      animationFrameHandle = options.animationFrames.request(frame);
      return undefined;
    });

    committedResources = transaction.resources;
    return new CleanBrowserHost(transaction.resources, state);
  }

  get fatalError(): unknown | null {
    return this.#state.fatalError;
  }

  dispose(): void {
    if (this.#state.disposed) {
      return;
    }
    this.#state.disposed = true;
    const report = this.#resources.dispose();
    if (report.failures.length > 0) {
      throw new AggregateError(
        report.failures.map((failure) => failure.error),
        `Failed to dispose ${report.failures.length} browser resources.`,
      );
    }
  }
}
