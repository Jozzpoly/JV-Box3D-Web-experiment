import type {
  JvScanWorld,
  JvVec3,
  JvWorldData,
} from "./jv-world-contract.js";

export type JvProductSpawnTarget =
  | "map"
  | "offroad"
  | "scan"
  | "scan-cal-a"
  | "scan-cal-b"
  | "scan-cal-c";

const TRIANGLE_EPSILON = 1e-7;
const ACCEPTED_CALIBRATION_PACK_ID = "scan/photogrammetry-primary";

// Geometry-only calibration candidates recovered from the exact accepted
// JSPREV2 pack at public commit a325c279cfe63a0607dba33c3c635a1716e09f8f.
// They passed both the triangle-raster discovery and the independent
// vertex-normal occupancy crosscheck. They are deliberately NOT named roads:
// only Owner preview validation can establish the useful semantic landmark.
const SCAN_CALIBRATION_LOCAL_XZ = {
  "scan-cal-a": { x: 35.25, z: -59.25 }, // crosscheck-passing discovery rank 6
  "scan-cal-b": { x: 54.75, z: -36.75 }, // crosscheck-passing discovery rank 3
  "scan-cal-c": { x: 110.25, z: -11.25 }, // crosscheck-passing discovery rank 4
} as const satisfies Readonly<
  Record<"scan-cal-a" | "scan-cal-b" | "scan-cal-c", Readonly<{ x: number; z: number }>>
>;

type JvScanCalibrationTarget = keyof typeof SCAN_CALIBRATION_LOCAL_XZ;

export function parseProductSpawnTarget(
  search: string,
): JvProductSpawnTarget {
  const value = new URLSearchParams(search).get("jvSpawn");
  if (
    value === "offroad" ||
    value === "scan" ||
    value === "scan-cal-a" ||
    value === "scan-cal-b" ||
    value === "scan-cal-c"
  ) {
    return value;
  }
  return "map";
}

function surfaceHeightAt(
  positions: Float32Array,
  indices: Uint32Array,
  x: number,
  z: number,
): number | null {
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
      ((bz - cz) * (x - cx) +
        (cx - bx) * (z - cz)) /
      denominator;
    const weightB =
      ((cz - az) * (x - cx) +
        (ax - cx) * (z - cz)) /
      denominator;
    const weightC = 1 - weightA - weightB;
    if (
      weightA < -TRIANGLE_EPSILON ||
      weightB < -TRIANGLE_EPSILON ||
      weightC < -TRIANGLE_EPSILON
    ) {
      continue;
    }
    highest = Math.max(
      highest,
      weightA * ay + weightB * by + weightC * cy,
    );
  }
  return Number.isFinite(highest) ? highest : null;
}

function offroadEntrySpawn(
  world: JvWorldData,
  clearanceMeters: number,
): JvVec3 {
  const positions = world.offroad.positions;
  if (positions.length < 9) {
    throw new Error("E2R offroad mesh has no drivable triangles.");
  }
  let minimumX = Infinity;
  let maximumX = -Infinity;
  let minimumZ = Infinity;
  let maximumZ = -Infinity;
  for (let offset = 0; offset < positions.length; offset += 3) {
    minimumX = Math.min(minimumX, positions[offset]!);
    maximumX = Math.max(maximumX, positions[offset]!);
    minimumZ = Math.min(minimumZ, positions[offset + 2]!);
    maximumZ = Math.max(maximumZ, positions[offset + 2]!);
  }
  const x = minimumX + Math.min(8, (maximumX - minimumX) * 0.08);
  const z = 0.5 * (minimumZ + maximumZ);
  const surfaceY = surfaceHeightAt(
    positions,
    world.offroad.indices,
    x,
    z,
  );
  if (surfaceY === null) {
    throw new Error("E2R offroad entry has no drivable surface.");
  }
  return { x, y: surfaceY + clearanceMeters, z };
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
  const localY = surfaceHeightAt(
    scan.collision.positions,
    scan.collision.indices,
    worldX - scan.origin.x,
    worldZ - scan.origin.z,
  );
  return localY === null ? null : localY + scan.origin.y;
}

function requirePositiveClearance(clearanceMeters: number): void {
  if (!Number.isFinite(clearanceMeters) || clearanceMeters <= 0) {
    throw new Error("Scan spawn clearance must be positive and finite.");
  }
}

export function scanCenterSpawn(
  scan: JvScanWorld,
  clearanceMeters: number,
): JvVec3 {
  requirePositiveClearance(clearanceMeters);

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

export function scanCalibrationSpawn(
  scan: JvScanWorld,
  target: JvScanCalibrationTarget,
  clearanceMeters: number,
): JvVec3 {
  requirePositiveClearance(clearanceMeters);
  if (scan.packId !== ACCEPTED_CALIBRATION_PACK_ID) {
    throw new Error(
      `JSPREV2 spawn calibration is pinned to ${ACCEPTED_CALIBRATION_PACK_ID}; received ${scan.packId}.`,
    );
  }
  const local = SCAN_CALIBRATION_LOCAL_XZ[target];
  const x = scan.origin.x + local.x;
  const z = scan.origin.z + local.z;
  const surfaceY = scanSurfaceHeightAt(scan, x, z);
  if (surfaceY === null) {
    throw new Error(
      `JSPREV2 calibration target ${target} has no drivable collision surface.`,
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
  if (target === "offroad") {
    return offroadEntrySpawn(world, clearanceMeters);
  }
  if (world.scan === null) {
    throw new Error(
      "Scan spawn was selected, but the exact JSPREV2 pack is unavailable.",
    );
  }
  if (
    target === "scan-cal-a" ||
    target === "scan-cal-b" ||
    target === "scan-cal-c"
  ) {
    return scanCalibrationSpawn(world.scan, target, clearanceMeters);
  }
  return scanCenterSpawn(world.scan, clearanceMeters);
}
