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
}

export class F2ContactHost {
  readonly #resources: OwnedResourceStack;
  readonly #receipt: Box3DRuntimeReceipt;
  readonly #validation: () => readonly F2ValidationLevel[];
  readonly #snapshot: () => MinimalContactSnapshot;
  #disposed = false;

  private constructor(
    resources: OwnedResourceStack,
    receipt: Box3DRuntimeReceipt,
    validation: () => readonly F2ValidationLevel[],
    snapshot: () => MinimalContactSnapshot,
  ) {
    this.#resources = resources;
    this.#receipt = receipt;
    this.#validation = validation;
    this.#snapshot = snapshot;
  }

  static async start(options: F2ContactHostOptions): Promise<F2ContactHost> {
    const resources = new OwnedResourceStack();
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
      });
      resources.defer("clean browser host", () => browserHost.dispose());

      return new F2ContactHost(
        resources,
        boundary.receipt,
        () => fixture.validationLevels(),
        () => fixture.snapshot,
      );
    } catch (error: unknown) {
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

  get validationLevels(): readonly F2ValidationLevel[] {
    this.#assertActive();
    return this.#validation();
  }

  get snapshot(): MinimalContactSnapshot {
    this.#assertActive();
    return this.#snapshot();
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
        `Failed to dispose ${report.failures.length} F2 resources.`,
      );
    }
  }

  #assertActive(): void {
    if (this.#disposed) {
      throw new Error("F2ContactHost has been disposed.");
    }
  }
}
