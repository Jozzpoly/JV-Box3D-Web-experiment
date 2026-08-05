import type { JvWorldData } from "../scene/jv-world-contract.js";
import {
  assertCheckedWebGlContextHealthy,
  createCheckedWebGlContext,
} from "./jv-checked-webgl.js";
import {
  JvWorldRendererMobile,
  type JvRenderMatrix,
} from "./jv-world-renderer-mobile.js";

export type { JvRenderMatrix } from "./jv-world-renderer-mobile.js";

export class JvWorldRenderer {
  readonly #checkedGl: WebGLRenderingContext;
  readonly #inner: JvWorldRendererMobile;

  constructor(gl: WebGLRenderingContext, world: JvWorldData) {
    this.#checkedGl = createCheckedWebGlContext(gl);
    this.#inner = new JvWorldRendererMobile(this.#checkedGl, world);
    assertCheckedWebGlContextHealthy(this.#checkedGl);
  }

  get drawCallBudget(): number {
    return this.#inner.drawCallBudget;
  }

  render(viewProjection: JvRenderMatrix): void {
    assertCheckedWebGlContextHealthy(this.#checkedGl);
    this.#inner.render(viewProjection);
    assertCheckedWebGlContextHealthy(this.#checkedGl);
  }

  dispose(): void {
    this.#inner.dispose();
  }
}
