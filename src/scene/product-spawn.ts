import type {
  JvScanWorld,
  JvVec3,
  JvWorldData,
} from "./jv-world-contract.js";

export type JvProductSpawnTarget = "map" | "scan";

const TRIANGLE_EPSILON = 1e-7;

export function parseProductSpawnTarget(
  search: string,
): JvProductSpawnTarget {
  const value = new URLSearchParams(search).get("jvSpawn");
  return value === "scan" ? "scan" : "map";
}

export function scanSurfaceHeightAt(
  scan: JvScanWorld,
  worldX: number,
  worldZ: number,
): number | null {
  if (
    worldX < scan.worldBounds.minimum.x ||
    worldX > scan.worldBounds.maximum.x ||
    worldZ < scan.worldBounds.minimum.z ||
    worldZ > scan.worldBounds.maximum.z
  ) {
    return null;
  }

  const localX = worldX - scan.origin.x;
  const localZ = worldZ - scan.origin.z;
  const positions = scan.collision.positions;
  const indices = scan.collision.indices;
  let highest = -Infinity;

  for (let offset = 0; offset < indices.length; offset += 3) {
    const indexA = indices[offset]! * 3;
    const indexB = indices[offset + 1]! * 3;
    const indexC = indices[offset + 2]! * 3;

    const ax = positions[indexA]!;
    const ay = positions[indexA + 1]!;
    const az = positions[indexA + 2]!;
    const bx = positions[indexB]!;
    const by = positions[indexB + 1]!;
    const bz = positions[indexB + 2]!;
    const cx = positions[indexC]!;
    const cy = positions[indexC + 1]!;
    const cz = positions[indexC + 2]!;

    const denominator =
      (bz - cz) * (ax - cx) +
      (cx - bx) * (az - cz);
    if (Math.abs(denominator) <= TRIANGLE_EPSILON) {
      continue;
    }

    const weightA =
      ((bz - cz) * (localX - cx) +
        (cx - bx) * (localZ - cz)) /
      denominator;
    const weightB =
      ((cz - az) * (localX - cx) +
        (ax - cx) * (localZ - cz)) /
      denominator;
    const weightC = 1 - weightA - weightB;
    if (
      weightA < -TRIANGLE_EPSILON ||
      weightB < -TRIANGLE_EPSILON ||
      weightC < -TRIANGLE_EPSILON
    ) {
      continue;
    }

    const localY =
      weightA * ay +
      weightB * by +
      weightC * cy;
    highest = Math.max(highest, localY + scan.origin.y);
  }

  return Number.isFinite(highest) ? highest : null;
}

export function scanCenterSpawn(
  scan: JvScanWorld,
  clearanceMeters: number,
): JvVec3 {
  if (
    !Number.isFinite(clearanceMeters) ||
    clearanceMeters <= 0
  ) {
    throw new Error("Scan spawn clearance must be positive and finite.");
  }

  const x =
    0.5 *
    (scan.worldBounds.minimum.x + scan.worldBounds.maximum.x);
  const z =
    0.5 *
    (scan.worldBounds.minimum.z + scan.worldBounds.maximum.z);
  const surfaceY = scanSurfaceHeightAt(scan, x, z);
  if (surfaceY === null) {
    throw new Error(
      "The selected JSPREV2 scan has no drivable surface at its AABB center.",
    );
  }
  return { x, y: surfaceY + clearanceMeters, z };
}

export function resolveProductSpawn(
  world: JvWorldData,
  target: JvProductSpawnTarget,
  clearanceMeters = world.spawn.y,
): JvVec3 {
  if (target === "map") {
    return world.spawn;
  }
  if (world.scan === null) {
    throw new Error(
      "Scan spawn was selected, but the exact JSPREV2 pack is unavailable.",
    );
  }
  return scanCenterSpawn(world.scan, clearanceMeters);
}
