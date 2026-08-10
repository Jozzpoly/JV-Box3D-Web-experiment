import type { JvWorldData } from "../scene/jv-world-contract.js";
import {
  assertCheckedWebGlContextHealthy,
  createCheckedWebGlContext,
} from "./jv-checked-webgl.js";
import {
  getJvProductViewSettings,
  subscribeJvProductViewSettings,
} from "./jv-product-view-settings.js";
import {
  createJvScanWebGlPolicy,
  type JvScanWebGlPolicy,
} from "./jv-scan-webgl-policy.js";
import {
  JvWorldRendererMobile,
  type JvRenderMatrix,
} from "./jv-world-renderer-mobile.js";

export type { JvRenderMatrix } from "./jv-world-renderer-mobile.js";

export class JvWorldRenderer {
  readonly #checkedGl: WebGLRenderingContext;
  readonly #policy: JvScanWebGlPolicy;
  readonly #inner: JvWorldRendererMobile;
  readonly #unsubscribeViewSettings: () => void;

  constructor(gl: WebGLRenderingContext, world: JvWorldData) {
    this.#checkedGl = createCheckedWebGlContext(gl);
    const policy = createJvScanWebGlPolicy(
      this.#checkedGl,
      getJvProductViewSettings().textureFilter,
    );
    let inner: JvWorldRendererMobile;
    try {
      inner = new JvWorldRendererMobile(policy.context, world);
    } catch (error: unknown) {
      policy.dispose();
      throw error;
    }
    this.#policy = policy;
    this.#inner = inner;
    this.#unsubscribeViewSettings = subscribeJvProductViewSettings(
      (settings) => {
        policy.setTextureFilter(settings.textureFilter);
        assertCheckedWebGlContextHealthy(this.#checkedGl);
      },
    );
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
    this.#unsubscribeViewSettings();
    this.#inner.dispose();
    this.#policy.dispose();
  }
}
