import { subscribeProductWorld } from "../scene/product-world.js";
import type { JvWorldData } from "../scene/jv-world-contract.js";
import { M6WorldRenderer } from "./m6-world-renderer.js";

export const M6_OWNER_VISUAL_PACKAGE_URL =
  "vehicles/m6-owner-r1/m6-owner-rigid-r1.visual.json" as const;

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
    void this.loadOwnerVehicle(
      document.baseURI,
      M6_OWNER_VISUAL_PACKAGE_URL,
    ).catch((error: unknown) => {
      console.error(
        "Owner vehicle visual failed to load; keeping the accepted debug vehicle fallback.",
        error,
      );
    });
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
