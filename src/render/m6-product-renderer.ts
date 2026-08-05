import { subscribeProductWorld } from "../scene/product-world.js";
import type { JvWorldData } from "../scene/jv-world-contract.js";
import { M6WorldRenderer } from "./m6-world-renderer.js";

export class M6ProductRenderer extends M6WorldRenderer {
  readonly #unsubscribeWorld: () => void;
  #productDisposed = false;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.#unsubscribeWorld = subscribeProductWorld(
      (world: JvWorldData) => {
        this.setWorld(world);
      },
    );
  }

  override dispose(): void {
    if (this.#productDisposed) {
      return;
    }
    this.#productDisposed = true;
    this.#unsubscribeWorld();
    super.dispose();
  }
}
