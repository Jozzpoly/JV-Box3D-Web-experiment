import { subscribeProductWorld } from "../scene/product-world.js";
import type { JvWorldData } from "../scene/jv-world-contract.js";
import { publishJvStartupPerformance } from "../runtime/startup-performance.js";
import { M6WorldRenderer } from "./m6-world-renderer.js";

export const M6_OWNER_VISUAL_PACKAGE_URL =
  "vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json" as const;

export class M6ProductRenderer extends M6WorldRenderer {
  readonly #unsubscribeWorld: () => void;
  #productDisposed = false;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.#unsubscribeWorld = subscribeProductWorld(
      (world: JvWorldData) => {
        const startedAt = performance.now();
        this.setWorld(world);
        publishJvStartupPerformance({
          worldGpuSetupMs: Math.max(0, performance.now() - startedAt),
        });
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
