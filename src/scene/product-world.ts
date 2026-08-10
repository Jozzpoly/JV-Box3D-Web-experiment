import { createE2rWorld } from "./e2r-world.js";
import type {
  JvScanWorld,
  JvWorldData,
} from "./jv-world-contract.js";

type WorldListener = (world: JvWorldData) => void;
export type ProductWorldLoader = () => Promise<JvWorldData>;

let configuredWorldLoader: ProductWorldLoader | null = null;
let sharedWorldPromise: Promise<JvWorldData> | null = null;
let currentWorld: JvWorldData | null = null;
const listeners = new Set<WorldListener>();

export function createProductWorld(
  scan: JvScanWorld | null = null,
): JvWorldData {
  return createE2rWorld(scan);
}

export function configureProductWorldLoader(
  loader: ProductWorldLoader,
): void {
  if (configuredWorldLoader === loader) {
    return;
  }
  if (configuredWorldLoader !== null) {
    throw new Error("Product world loader is already configured with another profile.");
  }
  if (sharedWorldPromise !== null || currentWorld !== null) {
    throw new Error("Product world loader must be configured before loading starts.");
  }
  configuredWorldLoader = loader;
}

export function loadProductWorld(): Promise<JvWorldData> {
  const loader = configuredWorldLoader;
  if (loader === null) {
    return Promise.reject(
      new Error("Product world loader is not configured."),
    );
  }

  sharedWorldPromise ??= Promise.resolve()
    .then(() => loader())
    .then((world) => {
      currentWorld = world;
      for (const listener of listeners) {
        listener(world);
      }
      return world;
    })
    .catch((error: unknown) => {
      sharedWorldPromise = null;
      throw error;
    });
  return sharedWorldPromise;
}

export function subscribeProductWorld(
  listener: WorldListener,
): () => void {
  listeners.add(listener);
  if (currentWorld !== null) {
    listener(currentWorld);
  }
  return () => {
    listeners.delete(listener);
  };
}
