import type { ScenePackageV1 } from "./scene-package.js";
import type { JvWorldData } from "./jv-world-contract.js";
import {
  resolveProductSpawn,
  type JvProductSpawnTarget,
} from "./product-spawn.js";

export function applyProductSpawnToScene(
  scene: ScenePackageV1,
  world: JvWorldData,
  target: JvProductSpawnTarget,
): ScenePackageV1 {
  if (target === "map") {
    return scene;
  }

  const spawn = resolveProductSpawn(
    world,
    target,
    scene.spawn.position[1],
  );
  const position: readonly [number, number, number] = Object.freeze([
    spawn.x,
    spawn.y,
    spawn.z,
  ]);
  return Object.freeze({
    ...scene,
    spawn: Object.freeze({
      position,
      yawRadians: scene.spawn.yawRadians,
    }),
  });
}
