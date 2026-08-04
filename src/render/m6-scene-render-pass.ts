import type { M6TraceFrame } from "../vehicle/m6/m6-topology-world.js";

export type M6SceneMatrixV1 = Float32Array<ArrayBuffer>;

export type M6SceneRenderPhaseV1 =
  | "BEFORE_DEBUG_VEHICLE"
  | "AFTER_DEBUG_VEHICLE";

export interface M6SceneRenderFrameV1 {
  readonly gl: WebGLRenderingContext;
  readonly viewProjection: M6SceneMatrixV1;
  readonly trace: M6TraceFrame;
}

export interface M6SceneRenderPassV1 {
  readonly phase: M6SceneRenderPhaseV1;
  render(frame: M6SceneRenderFrameV1): void;
  dispose(): void;
}

export type M6SceneRenderPassFactoryV1 = (
  gl: WebGLRenderingContext,
  signal: AbortSignal,
) => Promise<M6SceneRenderPassV1>;

export interface M6SceneRenderPassInstallationV1 {
  readonly active: boolean;
  uninstall(): void;
}

interface InstalledPassV1 {
  readonly pass: M6SceneRenderPassV1;
  readonly viewProjection: M6SceneMatrixV1;
  active: boolean;
}

function abortError(): DOMException {
  return new DOMException("Scene render-pass installation was aborted.", "AbortError");
}

function isRenderPhase(value: string): value is M6SceneRenderPhaseV1 {
  return (
    value === "BEFORE_DEBUG_VEHICLE" ||
    value === "AFTER_DEBUG_VEHICLE"
  );
}

export class M6SceneRenderPassHostV1 {
  readonly #gl: WebGLRenderingContext;
  readonly #reportErrorCallback: (error: unknown) => void;
  readonly #lifecycle = new AbortController();
  readonly #entries: InstalledPassV1[] = [];
  #disposed = false;

  constructor(
    gl: WebGLRenderingContext,
    reportError: (error: unknown) => void,
  ) {
    this.#gl = gl;
    this.#reportErrorCallback = reportError;
  }

  get disposed(): boolean {
    return this.#disposed;
  }

  async install(
    factory: M6SceneRenderPassFactoryV1,
  ): Promise<M6SceneRenderPassInstallationV1> {
    if (this.#disposed) {
      throw abortError();
    }

    const pass = await factory(this.#gl, this.#lifecycle.signal);
    if (this.#disposed || this.#lifecycle.signal.aborted) {
      this.#disposePass(pass);
      throw abortError();
    }
    if (!isRenderPhase(pass.phase)) {
      this.#disposePass(pass);
      throw new Error(`Unknown scene render-pass phase: ${String(pass.phase)}.`);
    }

    const entry: InstalledPassV1 = {
      pass,
      viewProjection: new Float32Array(16),
      active: true,
    };
    this.#entries.push(entry);
    const host = this;
    return Object.freeze({
      get active(): boolean {
        return entry.active;
      },
      uninstall(): void {
        host.#uninstall(entry);
      },
    });
  }

  render(
    phase: M6SceneRenderPhaseV1,
    viewProjection: M6SceneMatrixV1,
    trace: M6TraceFrame,
  ): void {
    if (this.#disposed) {
      return;
    }

    for (const entry of [...this.#entries]) {
      if (!entry.active || entry.pass.phase !== phase) {
        continue;
      }
      entry.viewProjection.set(viewProjection);
      const frame = Object.freeze({
        gl: this.#gl,
        viewProjection: entry.viewProjection,
        trace,
      });
      try {
        entry.pass.render(frame);
      } catch (error: unknown) {
        entry.active = false;
        this.#removeEntry(entry);
        this.#disposePass(entry.pass);
        this.#reportError(error);
      }
    }
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#lifecycle.abort();
    for (let index = this.#entries.length - 1; index >= 0; index -= 1) {
      const entry = this.#entries[index]!;
      entry.active = false;
      this.#disposePass(entry.pass);
    }
    this.#entries.length = 0;
  }

  #uninstall(entry: InstalledPassV1): void {
    if (!entry.active) {
      return;
    }
    entry.active = false;
    this.#removeEntry(entry);
    this.#disposePass(entry.pass);
  }

  #removeEntry(entry: InstalledPassV1): void {
    const index = this.#entries.indexOf(entry);
    if (index >= 0) {
      this.#entries.splice(index, 1);
    }
  }

  #disposePass(pass: M6SceneRenderPassV1): void {
    try {
      pass.dispose();
    } catch (error: unknown) {
      this.#reportError(error);
    }
  }

  #reportError(error: unknown): void {
    try {
      this.#reportErrorCallback(error);
    } catch (reportingError: unknown) {
      console.error(
        "Scene render-pass error handler failed.",
        error,
        reportingError,
      );
    }
  }
}
