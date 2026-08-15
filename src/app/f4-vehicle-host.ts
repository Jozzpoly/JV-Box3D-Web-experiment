import {
  CleanBrowserHost,
  type AnimationFrameDriver,
  type CleanBrowserHostOptions,
} from "./clean-browser-host.js";
import type {
  FrameAdvanceReport,
  FixedStepInterval,
} from "../core/fixed-step-clock.js";
import { OwnedResourceStack } from "../core/owned-resource-stack.js";
import {
  loadPinnedNativeFactoryReceipt,
  type NativeFactorySnapshot,
} from "../config/native-factory-receipt.js";
import type { LongitudinalTimelineSample } from "../input/longitudinal-input-timeline.js";
import type {
  PointerVehicleControlId,
  PointerVehicleControlTargets,
} from "../input/pointer-vehicle-control-adapter.js";
import type { SteeringTimelineSample } from "../input/steering-input-timeline.js";
import {
  Box3DBoundary,
  type Box3DRuntimeReceipt,
} from "../physics/box3d-boundary.js";
import type { b3Vec3 } from "../physics/box3d-runtime-contract.js";
import {
  createProductWorld,
  loadProductWorld,
} from "../scene/product-world.js";
import type { JvWorldData } from "../scene/jv-world-contract.js";
import {
  clearJvRuntimePerformanceFrame,
  publishJvRuntimePerformanceFrame,
} from "../runtime/runtime-performance-frame.js";
import {
  assertVehicleRuntimeBackendDescriptor,
  LEGACY_TS_M6_BACKEND,
  type VehicleRuntimeBackendDescriptor,
} from "../runtime/vehicle-runtime-backend.js";
import {
  INITIAL_RATE_STEERING_PROFILE_ID,
  type M6TopologyDisposalReceipt,
  type M6TraceFrame,
  type RateSteeringProfile,
  type RateSteeringProfileId,
} from "../vehicle/m6/m6-topology-world.js";

export interface F4VehicleHostOptions {
  readonly now: () => number;
  readonly animationFrames: AnimationFrameDriver;
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly isDocumentHidden: () => boolean;
  readonly pointerControls?: PointerVehicleControlTargets;
  readonly onPointerControlStateChange?: (
    control: PointerVehicleControlId,
    active: boolean,
  ) => void;
  readonly generation?: number;
  readonly spawn?: b3Vec3;
  readonly rateProfileId?: RateSteeringProfileId;
  readonly onVehicleStep: (
    step: FixedStepInterval,
    steering: SteeringTimelineSample,
    longitudinal: LongitudinalTimelineSample,
    trace: M6TraceFrame,
  ) => void;
  readonly onFrame?: (report: FrameAdvanceReport) => void;
  readonly onFatalError?: (error: unknown) => void;
}

interface F4VehicleControllerRuntime {
  readonly lastTrace: M6TraceFrame | null;
  setSteering(command: SteeringTimelineSample["command"]): void;
  setDrive(command: LongitudinalTimelineSample["command"]): void;
}

interface F4WorldRuntime {
  readonly rateProfile: RateSteeringProfile;
  readonly counters: Readonly<{
    bodyCount: number;
    shapeCount: number;
    contactCount: number;
    jointCount: number;
  }>;
  createVehicle(
    spawn: b3Vec3,
    generation?: number,
  ): F4VehicleControllerRuntime;
  step(stepCount?: number): readonly M6TraceFrame[];
  stepPhysics(stepCount?: number): void;
  captureLatestTrace(): readonly M6TraceFrame[];
  dispose(): M6TopologyDisposalReceipt;
}

interface F4BoundaryRuntime {
  readonly receipt: Box3DRuntimeReceipt;
  createM6TopologyWorld(
    receipt: NativeFactorySnapshot,
    rateProfileId?: RateSteeringProfileId,
    worldData?: JvWorldData,
  ): F4WorldRuntime;
}

interface BrowserHostRuntime {
  dispose(): void;
}

export interface F4VehicleHostDependencies {
  readonly loadReceipt: () => Promise<NativeFactorySnapshot>;
  readonly loadBoundary: () => Promise<F4BoundaryRuntime>;
  readonly loadWorld?: () => Promise<JvWorldData>;
  readonly startBrowserHost: (
    options: CleanBrowserHostOptions,
  ) => BrowserHostRuntime;
}

const DEFAULT_DEPENDENCIES: F4VehicleHostDependencies = {
  loadReceipt: () => loadPinnedNativeFactoryReceipt(),
  loadBoundary: () => Box3DBoundary.load(),
  loadWorld: () => loadProductWorld(),
  startBrowserHost: (options) => CleanBrowserHost.start(options),
};

interface F4HostState {
  disposed: boolean;
  fatalError: unknown | null;
}

export class F4VehicleHost {
  readonly #resources: OwnedResourceStack;
  readonly #backend: VehicleRuntimeBackendDescriptor;
  readonly #nativeReceipt: NativeFactorySnapshot;
  readonly #box3dReceipt: Box3DRuntimeReceipt;
  readonly #worldData: JvWorldData;
  readonly #world: F4WorldRuntime;
  readonly #vehicle: F4VehicleControllerRuntime;
  readonly #state: F4HostState;

  private constructor(
    resources: OwnedResourceStack,
    backend: VehicleRuntimeBackendDescriptor,
    nativeReceipt: NativeFactorySnapshot,
    box3dReceipt: Box3DRuntimeReceipt,
    worldData: JvWorldData,
    world: F4WorldRuntime,
    vehicle: F4VehicleControllerRuntime,
    state: F4HostState,
  ) {
    this.#resources = resources;
    this.#backend = backend;
    this.#nativeReceipt = nativeReceipt;
    this.#box3dReceipt = box3dReceipt;
    this.#worldData = worldData;
    this.#world = world;
    this.#vehicle = vehicle;
    this.#state = state;
  }

  static async start(
    options: F4VehicleHostOptions,
    dependencies: F4VehicleHostDependencies = DEFAULT_DEPENDENCIES,
  ): Promise<F4VehicleHost> {
    const resources = new OwnedResourceStack();
    const state: F4HostState = {
      disposed: false,
      fatalError: null,
    };

    try {
      assertVehicleRuntimeBackendDescriptor(LEGACY_TS_M6_BACKEND);
      const nativeReceipt = await dependencies.loadReceipt();
      const boundary = await dependencies.loadBoundary();
      const worldData = await (
        dependencies.loadWorld ??
        (() => Promise.resolve(createProductWorld()))
      )();
      const world = boundary.createM6TopologyWorld(
        nativeReceipt,
        options.rateProfileId ?? INITIAL_RATE_STEERING_PROFILE_ID,
        worldData,
      );
      resources.defer("current M6 topology world", () => {
        world.dispose();
      });

      const generation = options.generation ?? 1;
      const spawn = options.spawn ?? worldData.spawn;
      const vehicle = world.createVehicle(spawn, generation);
      let pendingPresentation: Readonly<{
        step: FixedStepInterval;
        steering: SteeringTimelineSample;
        longitudinal: LongitudinalTimelineSample;
      }> | null = null;
      let physicsStepMs = 0;

      const browserHost = dependencies.startBrowserHost({
        now: options.now,
        animationFrames: options.animationFrames,
        windowTarget: options.windowTarget,
        documentTarget: options.documentTarget,
        isDocumentHidden: options.isDocumentHidden,
        ...(options.pointerControls === undefined
          ? {}
          : { pointerControls: options.pointerControls }),
        ...(options.onPointerControlStateChange === undefined
          ? {}
          : {
              onPointerControlStateChange:
                options.onPointerControlStateChange,
            }),
        onStep: (step, steering, longitudinal) => {
          vehicle.setSteering(steering.command);
          vehicle.setDrive(longitudinal.command);
          const stepStartedAt = options.now();
          world.stepPhysics(1);
          physicsStepMs += Math.max(0, options.now() - stepStartedAt);
          pendingPresentation = {
            step,
            steering,
            longitudinal,
          };
        },
        onFrame: (report) => {
          const presentation = pendingPresentation;
          pendingPresentation = null;
          let presentationMs = 0;
          if (presentation !== null) {
            const presentationStartedAt = options.now();
            const trace = world.captureLatestTrace()[0];
            if (trace === undefined) {
              throw new Error(
                "M6 world produced no trace for its owned vehicle.",
              );
            }
            options.onVehicleStep(
              presentation.step,
              presentation.steering,
              presentation.longitudinal,
              trace,
            );
            presentationMs = Math.max(
              0,
              options.now() - presentationStartedAt,
            );
          }
          publishJvRuntimePerformanceFrame({
            browserFrameDeltaMs: report.rawFrameDeltaMs,
            executedSteps: report.executedSteps,
            droppedTimeMs: report.droppedTimeMs,
            physicsStepMs,
            presentationMs,
            presented: presentation !== null,
          });
          physicsStepMs = 0;
          options.onFrame?.(report);
        },
        onFatalError: (error) => {
          state.fatalError = error;
          state.disposed = true;
          clearJvRuntimePerformanceFrame();
          const report = resources.dispose();
          const fatal =
            report.failures.length > 0
              ? new AggregateError(
                  [
                    error,
                    ...report.failures.map(
                      (failure) => failure.error,
                    ),
                  ],
                  "M6 runtime failed and cleanup reported errors.",
                )
              : error;
          options.onFatalError?.(fatal);
        },
      });
      resources.defer("clean browser host", () => {
        browserHost.dispose();
      });

      return new F4VehicleHost(
        resources,
        LEGACY_TS_M6_BACKEND,
        nativeReceipt,
        boundary.receipt,
        worldData,
        world,
        vehicle,
        state,
      );
    } catch (error: unknown) {
      state.disposed = true;
      state.fatalError = error;
      clearJvRuntimePerformanceFrame();
      const report = resources.dispose();
      if (report.failures.length > 0) {
        throw new AggregateError(
          [
            error,
            ...report.failures.map((failure) => failure.error),
          ],
          "M6 startup and rollback both failed.",
        );
      }
      throw error;
    }
  }

  get backend(): VehicleRuntimeBackendDescriptor {
    return this.#backend;
  }

  get nativeReceipt(): NativeFactorySnapshot {
    this.#assertActive();
    return this.#nativeReceipt;
  }

  get box3dReceipt(): Box3DRuntimeReceipt {
    return this.#box3dReceipt;
  }

  get worldData(): JvWorldData {
    this.#assertActive();
    return this.#worldData;
  }

  get rateProfile(): RateSteeringProfile {
    this.#assertActive();
    return this.#world.rateProfile;
  }

  get fatalError(): unknown | null {
    return this.#state.fatalError;
  }

  get trace(): M6TraceFrame | null {
    this.#assertActive();
    return this.#vehicle.lastTrace;
  }

  get counters(): F4WorldRuntime["counters"] {
    this.#assertActive();
    const raw = this.#world.counters;
    const staticBodies =
      this.#worldData.boxes.length +
      this.#worldData.capsules.length +
      1 +
      (this.#worldData.scan === null ? 0 : 1);
    const staticShapes = staticBodies;

    // The unchanged UI subtracts one historical ground body/shape. Present
    // product-scene counts in that legacy convention only when raw Box3D
    // counters prove that the complete static scene was actually installed.
    // Lightweight test doubles and the frozen baseline retain raw values.
    if (
      raw.bodyCount >= staticBodies + 1 &&
      raw.shapeCount >= staticShapes + 1
    ) {
      return {
        ...raw,
        bodyCount: raw.bodyCount - staticBodies + 1,
        shapeCount: raw.shapeCount - staticShapes + 1,
      };
    }
    return raw;
  }

  dispose(): void {
    if (this.#state.disposed) {
      return;
    }
    this.#state.disposed = true;
    clearJvRuntimePerformanceFrame();
    const report = this.#resources.dispose();
    if (report.failures.length > 0) {
      throw new AggregateError(
        report.failures.map((failure) => failure.error),
        `Failed to dispose ${report.failures.length} M6 resources.`,
      );
    }
  }

  #assertActive(): void {
    if (this.#state.fatalError !== null) {
      throw new Error(
        "F4VehicleHost is faulted and has been disposed.",
        { cause: this.#state.fatalError },
      );
    }
    if (this.#state.disposed) {
      throw new Error("F4VehicleHost has been disposed.");
    }
  }
}
