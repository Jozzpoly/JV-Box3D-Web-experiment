import {
  FixedStepClock,
  type FrameAdvanceReport,
  type FixedStepInterval,
} from "../core/fixed-step-clock.js";
import {
  OwnedResourceStack,
  runResourceTransaction,
} from "../core/owned-resource-stack.js";
import { KeyboardSteeringAdapter } from "../input/keyboard-steering-adapter.js";
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
  readonly onStep: (step: FixedStepInterval, input: SteeringTimelineSample) => void;
  readonly onFrame?: (report: FrameAdvanceReport) => void;
}

export class CleanBrowserHost {
  readonly #resources: OwnedResourceStack;
  #disposed = false;

  private constructor(resources: OwnedResourceStack) {
    this.#resources = resources;
  }

  static start(options: CleanBrowserHostOptions): CleanBrowserHost {
    const transaction = runResourceTransaction((resources) => {
      const startTimeMs = options.now();
      const timeline = new SteeringInputTimeline(startTimeMs);
      const keyboard = new KeyboardSteeringAdapter({
        windowTarget: options.windowTarget,
        documentTarget: options.documentTarget,
        timeline,
        now: options.now,
        isDocumentHidden: options.isDocumentHidden,
      });
      resources.defer("keyboard steering adapter", () => keyboard.dispose());

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
        }
      });

      const frame: FrameRequestCallback = (frameTimeMs) => {
        if (!running) {
          return;
        }

        const report = clock.advance(
          frameTimeMs,
          (step) => {
            const input = timeline.consumeInterval(step.startTimeMs, step.endTimeMs);
            options.onStep(step, input);
          },
          (dropped) => {
            timeline.skipInterval(dropped.startTimeMs, dropped.endTimeMs);
          },
        );
        options.onFrame?.(report);
        animationFrameHandle = options.animationFrames.request(frame);
      };

      animationFrameHandle = options.animationFrames.request(frame);
      return undefined;
    });

    return new CleanBrowserHost(transaction.resources);
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    const report = this.#resources.dispose();
    if (report.failures.length > 0) {
      throw new AggregateError(
        report.failures.map((failure) => failure.error),
        `Failed to dispose ${report.failures.length} browser resources.`,
      );
    }
  }
}
