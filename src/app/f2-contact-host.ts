import { CleanBrowserHost, type AnimationFrameDriver } from "./clean-browser-host.js";
import type { FrameAdvanceReport, FixedStepInterval } from "../core/fixed-step-clock.js";
import { OwnedResourceStack } from "../core/owned-resource-stack.js";
import type { SteeringTimelineSample } from "../input/steering-input-timeline.js";
import {
  Box3DBoundary,
  type Box3DRuntimeReceipt,
  type F2ValidationLevel,
  type MinimalContactSnapshot,
} from "../physics/box3d-boundary.js";

export interface F2ContactHostOptions {
  readonly now: () => number;
  readonly animationFrames: AnimationFrameDriver;
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly isDocumentHidden: () => boolean;
  readonly onPhysicsStep: (
    step: FixedStepInterval,
    input: SteeringTimelineSample,
    snapshot: MinimalContactSnapshot,
  ) => void;
  readonly onFrame?: (report: FrameAdvanceReport) => void;
  readonly onFatalError?: (error: unknown) => void;
}

interface F2HostState {
  disposed: boolean;
  fatalError: unknown | null;
}

export class F2ContactHost {
  readonly #resources: OwnedResourceStack;
  readonly #receipt: Box3DRuntimeReceipt;
  readonly #validation: () => readonly F2ValidationLevel[];
  readonly #snapshot: () => MinimalContactSnapshot;
  readonly #state: F2HostState;

  private constructor(
    resources: OwnedResourceStack,
    receipt: Box3DRuntimeReceipt,
    validation: () => readonly F2ValidationLevel[],
    snapshot: () => MinimalContactSnapshot,
    state: F2HostState,
  ) {
    this.#resources = resources;
    this.#receipt = receipt;
    this.#validation = validation;
    this.#snapshot = snapshot;
    this.#state = state;
  }

  static async start(options: F2ContactHostOptions): Promise<F2ContactHost> {
    const resources = new OwnedResourceStack();
    const state: F2HostState = { disposed: false, fatalError: null };
    try {
      const boundary = await Box3DBoundary.load();
      const fixture = boundary.createMinimalContactFixture();
      resources.defer("minimal Box3D contact fixture", () => fixture.dispose());

      const browserHost = CleanBrowserHost.start({
        now: options.now,
        animationFrames: options.animationFrames,
        windowTarget: options.windowTarget,
        documentTarget: options.documentTarget,
        isDocumentHidden: options.isDocumentHidden,
        onStep: (step, input) => {
          const snapshot = fixture.step();
          options.onPhysicsStep(step, input, snapshot);
        },
        ...(options.onFrame === undefined ? {} : { onFrame: options.onFrame }),
        onFatalError: (error) => {
          state.fatalError = error;
          state.disposed = true;
          const report = resources.dispose();
          const fatal =
            report.failures.length > 0
              ? new AggregateError(
                  [error, ...report.failures.map((failure) => failure.error)],
                  "F2 runtime failed and cleanup reported errors.",
                )
              : error;
          options.onFatalError?.(fatal);
        },
      });
      resources.defer("clean browser host", () => browserHost.dispose());

      return new F2ContactHost(
        resources,
        boundary.receipt,
        () => fixture.validationLevels(),
        () => fixture.snapshot,
        state,
      );
    } catch (error: unknown) {
      state.disposed = true;
      state.fatalError = error;
      const report = resources.dispose();
      if (report.failures.length > 0) {
        throw new AggregateError(
          [error, ...report.failures.map((failure) => failure.error)],
          "F2 startup and rollback both failed.",
        );
      }
      throw error;
    }
  }

  get receipt(): Box3DRuntimeReceipt {
    return this.#receipt;
  }

  get fatalError(): unknown | null {
    return this.#state.fatalError;
  }

  get validationLevels(): readonly F2ValidationLevel[] {
    this.#assertActive();
    return this.#validation();
  }

  get snapshot(): MinimalContactSnapshot {
    this.#assertActive();
    return this.#snapshot();
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
        `Failed to dispose ${report.failures.length} F2 resources.`,
      );
    }
  }

  #assertActive(): void {
    if (this.#state.fatalError !== null) {
      throw new Error("F2ContactHost is faulted and has been disposed.", {
        cause: this.#state.fatalError,
      });
    }
    if (this.#state.disposed) {
      throw new Error("F2ContactHost has been disposed.");
    }
  }
}
