import { createE2rWorld } from "./e2r-world.js";
import { loadLocalJsprev2Scan } from "./jsprev2-scan.js";
import type {
  JvScanWorld,
  JvWorldData,
} from "./jv-world-contract.js";

type WorldListener = (world: JvWorldData) => void;

let sharedWorldPromise: Promise<JvWorldData> | null = null;
let currentWorld: JvWorldData | null = null;
const listeners = new Set<WorldListener>();

export function createProductWorld(
  scan: JvScanWorld | null = null,
): JvWorldData {
  return createE2rWorld(scan);
}

export function loadProductWorld(): Promise<JvWorldData> {
  sharedWorldPromise ??= loadLocalJsprev2Scan()
    .then((scan) => createProductWorld(scan))
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
