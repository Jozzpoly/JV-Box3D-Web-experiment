import type { JvBounds } from "../scene/jv-world-contract.js";

export type JvClipMatrix = Float32Array;

const CLIP_EPSILON = 1e-5;

export function calculateJvMeshBounds(positions: Float32Array): JvBounds {
  if (positions.length === 0 || positions.length % 3 !== 0) {
    throw new Error("JV mesh bounds require complete vec3 positions.");
  }

  let minimumX = Infinity;
  let minimumY = Infinity;
  let minimumZ = Infinity;
  let maximumX = -Infinity;
  let maximumY = -Infinity;
  let maximumZ = -Infinity;

  for (let offset = 0; offset < positions.length; offset += 3) {
    const x = positions[offset]!;
    const y = positions[offset + 1]!;
    const z = positions[offset + 2]!;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      throw new Error("JV mesh bounds require finite positions.");
    }
    minimumX = Math.min(minimumX, x);
    minimumY = Math.min(minimumY, y);
    minimumZ = Math.min(minimumZ, z);
    maximumX = Math.max(maximumX, x);
    maximumY = Math.max(maximumY, y);
    maximumZ = Math.max(maximumZ, z);
  }

  return {
    minimum: { x: minimumX, y: minimumY, z: minimumZ },
    maximum: { x: maximumX, y: maximumY, z: maximumZ },
  };
}

export function isJvBoundsVisibleInClipSpace(
  bounds: JvBounds,
  clipFromLocal: JvClipMatrix,
): boolean {
  let outsideLeft = true;
  let outsideRight = true;
  let outsideBottom = true;
  let outsideTop = true;
  let outsideNear = true;
  let outsideFar = true;

  for (let corner = 0; corner < 8; corner += 1) {
    const x = (corner & 1) === 0 ? bounds.minimum.x : bounds.maximum.x;
    const y = (corner & 2) === 0 ? bounds.minimum.y : bounds.maximum.y;
    const z = (corner & 4) === 0 ? bounds.minimum.z : bounds.maximum.z;

    const clipX =
      clipFromLocal[0]! * x +
      clipFromLocal[4]! * y +
      clipFromLocal[8]! * z +
      clipFromLocal[12]!;
    const clipY =
      clipFromLocal[1]! * x +
      clipFromLocal[5]! * y +
      clipFromLocal[9]! * z +
      clipFromLocal[13]!;
    const clipZ =
      clipFromLocal[2]! * x +
      clipFromLocal[6]! * y +
      clipFromLocal[10]! * z +
      clipFromLocal[14]!;
    const clipW =
      clipFromLocal[3]! * x +
      clipFromLocal[7]! * y +
      clipFromLocal[11]! * z +
      clipFromLocal[15]!;

    outsideLeft &&= clipX + clipW < -CLIP_EPSILON;
    outsideRight &&= clipW - clipX < -CLIP_EPSILON;
    outsideBottom &&= clipY + clipW < -CLIP_EPSILON;
    outsideTop &&= clipW - clipY < -CLIP_EPSILON;
    outsideNear &&= clipZ + clipW < -CLIP_EPSILON;
    outsideFar &&= clipW - clipZ < -CLIP_EPSILON;

    if (
      !outsideLeft &&
      !outsideRight &&
      !outsideBottom &&
      !outsideTop &&
      !outsideNear &&
      !outsideFar
    ) {
      return true;
    }
  }

  return !(
    outsideLeft ||
    outsideRight ||
    outsideBottom ||
    outsideTop ||
    outsideNear ||
    outsideFar
  );
}
