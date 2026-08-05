import type {
  M6SceneRenderPassFactoryV1,
  M6SceneRenderPassInstallationV1,
} from "./m6-scene-render-pass.js";

export type VehicleVisualDebugFallbackStateV1 =
  | "LOADING"
  | "ACTIVE"
  | "FALLBACK"
  | "DISPOSED";

export interface VehicleVisualDebugFallbackRendererV1 {
  installRenderPass(
    factory: M6SceneRenderPassFactoryV1,
  ): Promise<M6SceneRenderPassInstallationV1>;
  setDebugVehicleVisible(visible: boolean): void;
}

export interface VehicleVisualDebugFallbackOptionsV1 {
  readonly renderer: VehicleVisualDebugFallbackRendererV1;
  readonly createPassFactory: (
    onFirstFrame: () => void,
  ) => M6SceneRenderPassFactoryV1;
  readonly onStateChange?: (
    state: VehicleVisualDebugFallbackStateV1,
  ) => void;
  readonly reportError?: (error: unknown) => void;
}

export interface VehicleVisualDebugFallbackControllerV1 {
  readonly state: VehicleVisualDebugFallbackStateV1;
  readonly installation: Promise<void>;
  handleRenderPassError(error: unknown): void;
  dispose(): void;
}

class VehicleVisualDebugFallbackController
  implements VehicleVisualDebugFallbackControllerV1
{
  readonly #renderer: VehicleVisualDebugFallbackRendererV1;
  readonly #createPassFactory: (
    onFirstFrame: () => void,
  ) => M6SceneRenderPassFactoryV1;
  readonly #onStateChange: (
    state: VehicleVisualDebugFallbackStateV1,
  ) => void;
  readonly #reportErrorCallback: (error: unknown) => void;
  #state: VehicleVisualDebugFallbackStateV1 = "LOADING";
  #installed: M6SceneRenderPassInstallationV1 | null = null;
  #disposed = false;
  readonly installation: Promise<void>;

  constructor(options: VehicleVisualDebugFallbackOptionsV1) {
    this.#renderer = options.renderer;
    this.#createPassFactory = options.createPassFactory;
    this.#onStateChange = options.onStateChange ?? (() => undefined);
    this.#reportErrorCallback = options.reportError ?? ((error) => console.error(error));

    this.#renderer.setDebugVehicleVisible(true);
    this.#publishState("LOADING");
    this.installation = Promise.resolve()
      .then(() => {
        if (this.#disposed) {
          return null;
        }
        return this.#renderer.installRenderPass(
          this.#createPassFactory(() => this.#activateFirstFrame()),
        );
      })
      .then((installation) => {
        if (installation === null) {
          return;
        }
        if (this.#disposed) {
          installation.uninstall();
          return;
        }
        if (!installation.active) {
          this.#enterFallback(
            new Error("Vehicle visual render pass was inactive after installation."),
          );
          return;
        }
        this.#installed = installation;
      })
      .catch((error: unknown) => {
        if (!this.#disposed) {
          this.#enterFallback(error);
        }
      });
  }

  get state(): VehicleVisualDebugFallbackStateV1 {
    return this.#state;
  }

  handleRenderPassError(error: unknown): void {
    this.#enterFallback(error);
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#installed?.uninstall();
    this.#installed = null;
    this.#publishState("DISPOSED");
  }

  #activateFirstFrame(): void {
    if (this.#disposed) {
      return;
    }
    try {
      this.#renderer.setDebugVehicleVisible(false);
    } catch (error: unknown) {
      this.#enterFallback(error);
      return;
    }
    this.#publishState("ACTIVE");
  }

  #enterFallback(error: unknown): void {
    if (this.#disposed) {
      return;
    }
    try {
      this.#renderer.setDebugVehicleVisible(true);
    } catch (visibilityError: unknown) {
      this.#reportError(visibilityError);
    }
    this.#installed = null;
    this.#publishState("FALLBACK");
    this.#reportError(error);
  }

  #publishState(state: VehicleVisualDebugFallbackStateV1): void {
    this.#state = state;
    try {
      this.#onStateChange(state);
    } catch (error: unknown) {
      this.#reportError(error);
    }
  }

  #reportError(error: unknown): void {
    try {
      this.#reportErrorCallback(error);
    } catch (reportingError: unknown) {
      console.error(
        "Vehicle visual fallback error reporter failed.",
        error,
        reportingError,
      );
    }
  }
}

export function installVehicleVisualWithDebugFallbackV1(
  options: VehicleVisualDebugFallbackOptionsV1,
): VehicleVisualDebugFallbackControllerV1 {
  return new VehicleVisualDebugFallbackController(options);
}
