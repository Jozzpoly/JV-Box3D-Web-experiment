import type {
  JvColor,
  JvIndexedMesh,
  JvQuat,
  JvStaticBox,
  JvStaticCapsule,
  JvVec3,
  JvWorldData,
} from "./jv-world-contract.js";

const NATIVE_AUTHORITY_COMMIT =
  "959aefb78587ce60cf2b8eb03ff82797a4165142";

const PLATE_EXTENT = 400;
const PLATE_TILE_COUNT = 3;
const PLATE_TILE_SIZE = PLATE_EXTENT / PLATE_TILE_COUNT;
const PLATE_TILE_HALF = PLATE_TILE_SIZE / 2;
const PLATE_BODY_Y = -1;

const OFFROAD_SIZE = 400;
const OFFROAD_CELL_SIZE = 1.25;
const OFFROAD_GRID_POINTS = 321;
const OFFROAD_ORIGIN_X = 198;
const OFFROAD_ORIGIN_Z = -200;
const OFFROAD_MIN_HEIGHT = -12;
const OFFROAD_MAX_HEIGHT = 28;
const OFFROAD_SEED = 1337;

const MACRO_WAVELENGTH = 90;
const MACRO_AMPLITUDE = 8;
const MACRO_OCTAVE_2_WAVELENGTH_SCALE = 0.45;
const MACRO_OCTAVE_2_WEIGHT = 0.3;
const WARP_WAVELENGTH = 60;
const WARP_STRENGTH = 22;
const MESO_WAVELENGTH = 16;
const MESO_AMPLITUDE = 1.2;
const MICRO_WAVELENGTH = 2.8;
const MICRO_AMPLITUDE = 0.22;
const ROUGHNESS_WAVELENGTH = 30;
const ROUGHNESS_MESO_FLOOR = 0.2;
const ROUGHNESS_MICRO_FLOOR = 0.1;
const ROUGHNESS_NOISE_LOW = 0.4;
const ROUGHNESS_NOISE_HIGH = 1.3;
const DIFFICULTY_DISTANCE = 60;
const SEAM_OVERLAP_RUN = 4 * OFFROAD_CELL_SIZE;
const SEAM_OVERLAP_DEPTH = -0.12;

const MOUNTAIN_CENTER = OFFROAD_SIZE / 2;
const MOUNTAIN_JITTER = 45;
const MOUNTAIN_RADIUS = 110;
const MOUNTAIN_PEAK_HEIGHT = 17;
const MOUNTAIN_WARP_WAVELENGTH = 70;
const MOUNTAIN_WARP_STRENGTH = 30;
const MOUNTAIN_SPUR_RING_RADIUS = 2.5;
const MOUNTAIN_SPUR_WAVELENGTH = 1;
const MOUNTAIN_SPUR_AMOUNT = 0.22;
const MOUNTAIN_SURFACE_WAVELENGTH = 34;
const MOUNTAIN_SURFACE_OCTAVES = 4;
const MOUNTAIN_SURFACE_AMPLITUDE = 5.5;
const MOUNTAIN_SURFACE_BIAS = 0.35;
const MOUNTAIN_BASE_SUPPRESS = 0.55;

const ARM_RING_WAVELENGTH = 1.35;
const ARM_RING_RADIUS = 1;
const ARM_SHARPNESS = 2.2;
const ARM_INNER_RADIUS_SCALE = 0.35;
const ARM_MID_RADIUS_SCALE = 0.55;
const ARM_OUTER_START_SCALE = 0.85;
const ARM_OUTER_END_SCALE = 1.7;
const ARM_HEIGHT_SCALE = 0.5;
const ARM_SUB_PEAK_WAVELENGTH = 22;
const ARM_SUB_PEAK_AMPLITUDE = 4;

const EDGE_FADE_DISTANCE = 35;
const EDGE_FADE_BASE_FLOOR = 0.7;

const MACRO_SEED_OFFSET = 0x1;
const MESO_SEED_OFFSET = 0x2;
const MICRO_SEED_OFFSET = 0x3;
const MACRO_OCTAVE_2_SEED_OFFSET = 0x4;
const WARP_SEED_X = 0x5;
const WARP_SEED_Z = 0x6;
const ROUGHNESS_SEED = 0x7;
const MOUNTAIN_CENTER_SEED_X = 0x8;
const MOUNTAIN_CENTER_SEED_Z = 0x9;
const MOUNTAIN_WARP_SEED_X = 0xa;
const MOUNTAIN_WARP_SEED_Z = 0xb;
const MOUNTAIN_SPUR_SEED = 0xc;
const MOUNTAIN_SURFACE_SEED = 0xd;
const MOUNTAIN_ARM_ANGULAR_SEED = 0xe;
const MOUNTAIN_ARM_SUB_PEAK_SEED = 0xf;

const IDENTITY: JvQuat = { x: 0, y: 0, z: 0, w: 1 };
const PLATE_COLOR: JvColor = [0.19, 0.23, 0.28, 1];
const OFFROAD_COLOR: JvColor = [0.18, 0.34, 0.2, 1];
const ROCK_COLOR: JvColor = [0.35, 0.31, 0.26, 1];
const BUMPER_COLOR: JvColor = [0.48, 0.29, 0.16, 1];

function u32(value: number): number {
  return value >>> 0;
}

function hashLattice(seed: number, ix: number, iz: number): number {
  let hash = u32(seed);
  hash = u32(hash ^ Math.imul(ix | 0, 0x27d4eb2d));
  hash = u32(hash ^ Math.imul(iz | 0, 0x165667b1));
  hash = u32(Math.imul(hash, 0x85ebca6b));
  hash = u32(hash ^ (hash >>> 13));
  hash = u32(Math.imul(hash, 0xc2b2ae35));
  return u32(hash ^ (hash >>> 16));
}

function hashToUnit(hash: number): number {
  return (hash & 0x00ff_ffff) / 0x00ff_ffff;
}

function quintic(value: number): number {
  return value * value * value *
    (value * (value * 6 - 15) + 10);
}

function lerp(a: number, b: number, amount: number): number {
  return a + (b - a) * amount;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(
  edge0: number,
  edge1: number,
  value: number,
): number {
  const amount = clamp01((value - edge0) / (edge1 - edge0));
  return amount * amount * (3 - 2 * amount);
}

function valueNoise2D(
  seed: number,
  x: number,
  z: number,
  wavelength: number,
): number {
  const gridX = x / wavelength;
  const gridZ = z / wavelength;
  const ix = Math.floor(gridX);
  const iz = Math.floor(gridZ);
  const ux = quintic(gridX - ix);
  const uz = quintic(gridZ - iz);
  const value00 = hashToUnit(hashLattice(seed, ix, iz));
  const value10 = hashToUnit(hashLattice(seed, ix + 1, iz));
  const value01 = hashToUnit(hashLattice(seed, ix, iz + 1));
  const value11 = hashToUnit(hashLattice(seed, ix + 1, iz + 1));
  return lerp(
    lerp(value00, value10, ux),
    lerp(value01, value11, ux),
    uz,
  );
}

function signedNoise2D(
  seed: number,
  x: number,
  z: number,
  wavelength: number,
): number {
  return valueNoise2D(seed, x, z, wavelength) * 2 - 1;
}

function ridged(value: number): number {
  const ridge = 1 - Math.abs(value);
  return ridge * ridge;
}

function seedUnit(seed: number): number {
  return hashToUnit(hashLattice(seed, 0, 0));
}

function ridgedFbm(
  seed: number,
  x: number,
  z: number,
  baseWavelength: number,
  octaves: number,
): number {
  let sum = 0;
  let amplitude = 1;
  let normalizer = 0;
  let wavelength = baseWavelength;
  let layer = seed;
  for (let index = 0; index < octaves; index += 1) {
    sum +=
      ridged(signedNoise2D(layer, x, z, wavelength)) *
      amplitude;
    normalizer += amplitude;
    amplitude *= 0.5;
    wavelength *= 0.5;
    layer = u32(layer + 0x100 * (index + 1));
  }
  return sum / normalizer;
}

function computeMountain(
  seed: number,
  localX: number,
  localZ: number,
): Readonly<{ height: number; mass: number }> {
  const centerX =
    MOUNTAIN_CENTER +
    (seedUnit(seed + MOUNTAIN_CENTER_SEED_X) * 2 - 1) *
      MOUNTAIN_JITTER;
  const centerZ =
    MOUNTAIN_CENTER +
    (seedUnit(seed + MOUNTAIN_CENTER_SEED_Z) * 2 - 1) *
      MOUNTAIN_JITTER;
  const warpX =
    signedNoise2D(
      seed + MOUNTAIN_WARP_SEED_X,
      localX,
      localZ,
      MOUNTAIN_WARP_WAVELENGTH,
    ) * MOUNTAIN_WARP_STRENGTH;
  const warpZ =
    signedNoise2D(
      seed + MOUNTAIN_WARP_SEED_Z,
      localX,
      localZ,
      MOUNTAIN_WARP_WAVELENGTH,
    ) * MOUNTAIN_WARP_STRENGTH;
  const dx = localX + warpX - centerX;
  const dz = localZ + warpZ - centerZ;
  const distance = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const spur = signedNoise2D(
    seed + MOUNTAIN_SPUR_SEED,
    Math.cos(angle) * MOUNTAIN_SPUR_RING_RADIUS,
    Math.sin(angle) * MOUNTAIN_SPUR_RING_RADIUS,
    MOUNTAIN_SPUR_WAVELENGTH,
  );
  const effectiveRadius =
    MOUNTAIN_RADIUS * (1 + spur * MOUNTAIN_SPUR_AMOUNT);
  const radial = clamp01(1 - distance / effectiveRadius);
  const mountainMass =
    radial * radial * (3 - 2 * radial);

  let mountainHeight = 0;
  if (mountainMass > 0) {
    const surface =
      (ridgedFbm(
        seed + MOUNTAIN_SURFACE_SEED,
        localX,
        localZ,
        MOUNTAIN_SURFACE_WAVELENGTH,
        MOUNTAIN_SURFACE_OCTAVES,
      ) - MOUNTAIN_SURFACE_BIAS) *
      MOUNTAIN_SURFACE_AMPLITUDE;
    mountainHeight =
      mountainMass * MOUNTAIN_PEAK_HEIGHT +
      surface * mountainMass;
  }

  const armAngularRaw = signedNoise2D(
    seed + MOUNTAIN_ARM_ANGULAR_SEED,
    Math.cos(angle) * ARM_RING_RADIUS,
    Math.sin(angle) * ARM_RING_RADIUS,
    ARM_RING_WAVELENGTH,
  );
  const armAngular = Math.pow(
    ridged(armAngularRaw),
    ARM_SHARPNESS,
  );
  const armInner = smoothstep(
    ARM_INNER_RADIUS_SCALE * MOUNTAIN_RADIUS,
    ARM_MID_RADIUS_SCALE * MOUNTAIN_RADIUS,
    distance,
  );
  const armOuter =
    1 -
    smoothstep(
      ARM_OUTER_START_SCALE * MOUNTAIN_RADIUS,
      ARM_OUTER_END_SCALE * MOUNTAIN_RADIUS,
      distance,
    );
  const armMass = armInner * armOuter * armAngular;
  let armHeight = 0;
  if (armMass > 0) {
    const subPeak = ridged(
      signedNoise2D(
        seed + MOUNTAIN_ARM_SUB_PEAK_SEED,
        localX,
        localZ,
        ARM_SUB_PEAK_WAVELENGTH,
      ),
    );
    armHeight =
      armMass *
      (MOUNTAIN_PEAK_HEIGHT * ARM_HEIGHT_SCALE +
        subPeak * ARM_SUB_PEAK_AMPLITUDE);
  }

  return {
    height: mountainHeight + armHeight,
    mass: clamp01(mountainMass + armMass),
  };
}

export function sampleE2rOffroadHeight(
  localX: number,
  localZ: number,
  seed = OFFROAD_SEED,
): number {
  const difficulty = smoothstep(
    0,
    DIFFICULTY_DISTANCE,
    localX,
  );
  const warpX =
    signedNoise2D(
      seed + WARP_SEED_X,
      localX,
      localZ,
      WARP_WAVELENGTH,
    ) * WARP_STRENGTH;
  const warpZ =
    signedNoise2D(
      seed + WARP_SEED_Z,
      localX,
      localZ,
      WARP_WAVELENGTH,
    ) * WARP_STRENGTH;
  const warpedX = localX + warpX;
  const warpedZ = localZ + warpZ;
  const ridge1 = ridged(
    signedNoise2D(
      seed + MACRO_SEED_OFFSET,
      warpedX,
      warpedZ,
      MACRO_WAVELENGTH,
    ),
  );
  const ridge2 = ridged(
    signedNoise2D(
      seed + MACRO_OCTAVE_2_SEED_OFFSET,
      warpedX,
      warpedZ,
      MACRO_WAVELENGTH *
        MACRO_OCTAVE_2_WAVELENGTH_SCALE,
    ),
  );
  const elevationShape = lerp(
    ridge1,
    ridge2,
    MACRO_OCTAVE_2_WEIGHT,
  );
  const macro =
    (elevationShape * 2 - 1) * MACRO_AMPLITUDE;
  const mountain = computeMountain(seed, localX, localZ);
  const edgeDistance = Math.min(
    localZ,
    OFFROAD_SIZE - localZ,
    OFFROAD_SIZE - localX,
  );
  const edgeMass = smoothstep(
    0,
    EDGE_FADE_DISTANCE,
    edgeDistance,
  );
  const edgeBase = lerp(
    EDGE_FADE_BASE_FLOOR,
    1,
    edgeMass,
  );
  const mountainHeight = mountain.height * edgeMass;
  const mountainMass = mountain.mass * edgeMass;
  const roughnessNoise = valueNoise2D(
    seed + ROUGHNESS_SEED,
    localX,
    localZ,
    ROUGHNESS_WAVELENGTH,
  );
  const roughnessSignal = Math.max(
    elevationShape,
    0.8 * mountainMass,
  );
  const roughness = clamp01(
    roughnessSignal *
      lerp(
        ROUGHNESS_NOISE_LOW,
        ROUGHNESS_NOISE_HIGH,
        roughnessNoise,
      ),
  );
  const meso =
    signedNoise2D(
      seed + MESO_SEED_OFFSET,
      localX,
      localZ,
      MESO_WAVELENGTH,
    ) *
    MESO_AMPLITUDE *
    lerp(ROUGHNESS_MESO_FLOOR, 1, roughness);
  const micro =
    signedNoise2D(
      seed + MICRO_SEED_OFFSET,
      localX,
      localZ,
      MICRO_WAVELENGTH,
    ) *
    MICRO_AMPLITUDE *
    lerp(ROUGHNESS_MICRO_FLOOR, 1, roughness);
  const baseScale =
    (1 - mountainMass * MOUNTAIN_BASE_SUPPRESS) *
    edgeBase;
  const seamRamp =
    SEAM_OVERLAP_DEPTH *
    (1 - smoothstep(0, SEAM_OVERLAP_RUN, localX));
  const height =
    seamRamp +
    difficulty *
      ((macro + meso + micro) * baseScale +
        mountainHeight);
  return Math.max(
    OFFROAD_MIN_HEIGHT + 0.5,
    Math.min(OFFROAD_MAX_HEIGHT - 0.5, height),
  );
}

function calculateNormals(
  positions: Float32Array,
  indices: Uint32Array,
): Float32Array {
  const accumulated = new Array<number>(positions.length).fill(0);
  for (let offset = 0; offset < indices.length; offset += 3) {
    const ia = indices[offset]! * 3;
    const ib = indices[offset + 1]! * 3;
    const ic = indices[offset + 2]! * 3;
    const abx = positions[ib]! - positions[ia]!;
    const aby = positions[ib + 1]! - positions[ia + 1]!;
    const abz = positions[ib + 2]! - positions[ia + 2]!;
    const acx = positions[ic]! - positions[ia]!;
    const acy = positions[ic + 1]! - positions[ia + 1]!;
    const acz = positions[ic + 2]! - positions[ia + 2]!;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    for (const index of [ia, ib, ic]) {
      accumulated[index] = accumulated[index]! + nx;
      accumulated[index + 1] =
        accumulated[index + 1]! + ny;
      accumulated[index + 2] =
        accumulated[index + 2]! + nz;
    }
  }

  const normals = new Float32Array(positions.length);
  for (let offset = 0; offset < accumulated.length; offset += 3) {
    const x = accumulated[offset]!;
    const y = accumulated[offset + 1]!;
    const z = accumulated[offset + 2]!;
    const length = Math.hypot(x, y, z) || 1;
    normals[offset] = x / length;
    normals[offset + 1] = y / length;
    normals[offset + 2] = z / length;
  }
  return normals;
}

function createOffroadMesh(seed = OFFROAD_SEED): JvIndexedMesh {
  const positions = new Float32Array(
    OFFROAD_GRID_POINTS * OFFROAD_GRID_POINTS * 3,
  );
  let vertexOffset = 0;
  for (let row = 0; row < OFFROAD_GRID_POINTS; row += 1) {
    const localZ = row * OFFROAD_CELL_SIZE;
    for (
      let column = 0;
      column < OFFROAD_GRID_POINTS;
      column += 1
    ) {
      const localX = column * OFFROAD_CELL_SIZE;
      positions[vertexOffset] = OFFROAD_ORIGIN_X + localX;
      positions[vertexOffset + 1] =
        sampleE2rOffroadHeight(localX, localZ, seed);
      positions[vertexOffset + 2] =
        OFFROAD_ORIGIN_Z + localZ;
      vertexOffset += 3;
    }
  }

  const cellCount = OFFROAD_GRID_POINTS - 1;
  const indices = new Uint32Array(
    cellCount * cellCount * 6,
  );
  let indexOffset = 0;
  for (let row = 0; row < cellCount; row += 1) {
    for (let column = 0; column < cellCount; column += 1) {
      const a = row * OFFROAD_GRID_POINTS + column;
      const b = a + 1;
      const c = a + OFFROAD_GRID_POINTS;
      const d = c + 1;
      indices[indexOffset++] = a;
      indices[indexOffset++] = c;
      indices[indexOffset++] = b;
      indices[indexOffset++] = b;
      indices[indexOffset++] = c;
      indices[indexOffset++] = d;
    }
  }

  return {
    positions,
    indices,
    normals: calculateNormals(positions, indices),
    color: OFFROAD_COLOR,
    doubleSided: false,
  };
}

function yawQuaternion(degrees: number): JvQuat {
  const half = (degrees * Math.PI) / 360;
  return { x: 0, y: Math.sin(half), z: 0, w: Math.cos(half) };
}

function axisXQuaternion(radians: number): JvQuat {
  const half = radians / 2;
  return { x: Math.sin(half), y: 0, z: 0, w: Math.cos(half) };
}

function multiplyQuat(a: JvQuat, b: JvQuat): JvQuat {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

function rotateYaw(value: JvVec3, degrees: number): JvVec3 {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return {
    x: value.x * cosine + value.z * sine,
    y: value.y,
    z: -value.x * sine + value.z * cosine,
  };
}

function add(a: JvVec3, b: JvVec3): JvVec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function nextRandom(state: { value: number }): number {
  let value = u32(state.value);
  value = u32(value ^ (value << 13));
  value = u32(value ^ (value >>> 17));
  value = u32(value ^ (value << 5));
  state.value = value;
  return value;
}

function randomUnit(state: { value: number }): number {
  return (nextRandom(state) & 0x00ff_ffff) / 0x00ff_ffff;
}

function randomRange(
  state: { value: number },
  low: number,
  high: number,
): number {
  return low + randomUnit(state) * (high - low);
}

interface RockIslandSpec {
  readonly center: JvVec3;
  readonly yaw: number;
  readonly lengthX: number;
  readonly widthZ: number;
  readonly clusters: number;
  readonly rocksPerCluster: number;
  readonly clusterRadius: number;
  readonly minSize: number;
  readonly maxSize: number;
  readonly seedOffset: number;
}

const ROCK_ISLANDS: readonly RockIslandSpec[] = [
  {
    center: { x: 34, y: 0, z: -14 },
    yaw: 90,
    lengthX: 8,
    widthZ: 14,
    clusters: 3,
    rocksPerCluster: 31,
    clusterRadius: 2.4,
    minSize: 0.16,
    maxSize: 0.34,
    seedOffset: 910,
  },
  {
    center: { x: 34, y: 0, z: 0 },
    yaw: 90,
    lengthX: 8,
    widthZ: 14,
    clusters: 4,
    rocksPerCluster: 32,
    clusterRadius: 2.5,
    minSize: 0.2,
    maxSize: 0.42,
    seedOffset: 920,
  },
  {
    center: { x: 34, y: 0, z: 14 },
    yaw: 90,
    lengthX: 8,
    widthZ: 14,
    clusters: 5,
    rocksPerCluster: 36,
    clusterRadius: 2.7,
    minSize: 0.24,
    maxSize: 0.52,
    seedOffset: 930,
  },
];

function createRockBoxes(): JvStaticBox[] {
  const boxes: JvStaticBox[] = [];
  for (const spec of ROCK_ISLANDS) {
    const state = {
      value: OFFROAD_SEED + spec.seedOffset,
    };
    const columns = Math.ceil(Math.sqrt(spec.clusters));
    const rows = Math.ceil(spec.clusters / columns);
    for (let cluster = 0; cluster < spec.clusters; cluster += 1) {
      const row = Math.floor(cluster / columns);
      const column = cluster % columns;
      const u = columns === 1 ? 0.5 : column / (columns - 1);
      const v = rows === 1 ? 0.5 : row / (rows - 1);
      const clusterX =
        (u - 0.5) * spec.lengthX * 0.58 +
        randomRange(state, -1, 1);
      const clusterZ =
        (v - 0.5) * spec.widthZ * 0.58 +
        randomRange(state, -1, 1);
      for (
        let rock = 0;
        rock < spec.rocksPerCluster;
        rock += 1
      ) {
        const angle = randomRange(state, 0, Math.PI * 2);
        const radial =
          Math.sqrt(randomUnit(state)) * spec.clusterRadius;
        let rx = clusterX + Math.cos(angle) * radial;
        let rz = clusterZ + Math.sin(angle) * radial;
        const size = randomRange(
          state,
          spec.minSize,
          spec.maxSize,
        );
        const hx =
          size * randomRange(state, 0.7, 1.25) * 0.5;
        const hy =
          size * randomRange(state, 0.55, 1.15) * 0.5;
        const hz =
          size * randomRange(state, 0.7, 1.25) * 0.5;
        rx = Math.max(
          -spec.lengthX / 2 + hx,
          Math.min(spec.lengthX / 2 - hx, rx),
        );
        rz = Math.max(
          -spec.widthZ / 2 + hz,
          Math.min(spec.widthZ / 2 - hz, rz),
        );
        const embed = hy * randomRange(state, 0.35, 0.55);
        const localYaw = randomRange(state, 0, 360);
        const tilt =
          (randomRange(state, -18, 18) * Math.PI) / 180;
        const localCenter = {
          x: rx,
          y: hy - embed,
          z: rz,
        };
        boxes.push({
          center: add(
            spec.center,
            rotateYaw(localCenter, spec.yaw),
          ),
          rotation: multiplyQuat(
            yawQuaternion(spec.yaw),
            multiplyQuat(
              yawQuaternion(localYaw),
              axisXQuaternion(tilt),
            ),
          ),
          halfExtents: { x: hx, y: hy, z: hz },
          friction: 1,
          color: ROCK_COLOR,
        });
      }
    }
  }
  return boxes;
}

type BumperPattern = "FULL" | "ALTERNATING" | "WAVE";

interface BumperSpec {
  readonly center: JvVec3;
  readonly yaw: number;
  readonly count: number;
  readonly spacing: number;
  readonly radius: number;
  readonly width: number;
  readonly centerY: number;
  readonly sideOffset: number;
  readonly pattern: BumperPattern;
}

const BUMPER_BANKS: readonly BumperSpec[] = [
  { center:{x:-34,y:0,z:38}, yaw:0, count:9, spacing:1.2, radius:.09, width:8, centerY:.03, sideOffset:0, pattern:"FULL" },
  { center:{x:-12,y:0,z:38}, yaw:0, count:14, spacing:1, radius:.09, width:8, centerY:.035, sideOffset:2.2, pattern:"ALTERNATING" },
  { center:{x:12,y:0,z:38}, yaw:0, count:10, spacing:1.4, radius:.12, width:8, centerY:.045, sideOffset:2, pattern:"WAVE" },
  { center:{x:32,y:0,z:38}, yaw:0, count:8, spacing:1.6, radius:.1, width:8, centerY:.032, sideOffset:0, pattern:"FULL" },
  { center:{x:-34,y:0,z:-12}, yaw:-90, count:10, spacing:.8, radius:.08, width:7, centerY:.028, sideOffset:1.7, pattern:"ALTERNATING" },
  { center:{x:-34,y:0,z:0}, yaw:-90, count:14, spacing:1, radius:.1, width:7, centerY:.035, sideOffset:2, pattern:"WAVE" },
  { center:{x:-34,y:0,z:12}, yaw:-90, count:10, spacing:1, radius:.11, width:7, centerY:.04, sideOffset:1.6, pattern:"ALTERNATING" },
  { center:{x:22,y:0,z:0}, yaw:90, count:12, spacing:1, radius:.09, width:6, centerY:.03, sideOffset:1.5, pattern:"WAVE" },
  { center:{x:46,y:0,z:0}, yaw:90, count:10, spacing:1, radius:.1, width:6, centerY:.034, sideOffset:1.5, pattern:"ALTERNATING" },
  { center:{x:-34,y:0,z:-38}, yaw:0, count:12, spacing:1, radius:.1, width:8, centerY:.032, sideOffset:2, pattern:"WAVE" },
  { center:{x:-10,y:0,z:-38}, yaw:0, count:16, spacing:.9, radius:.08, width:8, centerY:.025, sideOffset:2.2, pattern:"ALTERNATING" },
  { center:{x:16,y:0,z:-38}, yaw:0, count:12, spacing:1.2, radius:.12, width:8, centerY:.045, sideOffset:0, pattern:"FULL" },
  { center:{x:34,y:0,z:-38}, yaw:0, count:10, spacing:1.3, radius:.1, width:8, centerY:.032, sideOffset:2, pattern:"ALTERNATING" },
];

function createBumperCapsules(): JvStaticCapsule[] {
  const capsules: JvStaticCapsule[] = [];
  for (const spec of BUMPER_BANKS) {
    const startX =
      -spec.spacing * (spec.count - 1) * 0.5;
    for (let index = 0; index < spec.count; index += 1) {
      const localX = startX + spec.spacing * index;
      let localZ = 0;
      let elementWidth = spec.width;
      if (spec.pattern === "ALTERNATING") {
        localZ =
          (index & 1) === 0
            ? -spec.sideOffset
            : spec.sideOffset;
        elementWidth = spec.width * 0.58;
      } else if (spec.pattern === "WAVE") {
        localZ =
          (index % 4 < 2 ? -1 : 1) * spec.sideOffset;
        elementWidth =
          spec.width * ((index & 1) === 0 ? 0.72 : 0.48);
      }
      const halfSpan = Math.max(
        0.1,
        elementWidth * 0.5 - spec.radius,
      );
      capsules.push({
        bodyCenter: spec.center,
        bodyRotation: yawQuaternion(spec.yaw),
        point1: {
          x: localX,
          y: spec.centerY,
          z: localZ - halfSpan,
        },
        point2: {
          x: localX,
          y: spec.centerY,
          z: localZ + halfSpan,
        },
        radius: spec.radius,
        friction: 0.85,
        color: BUMPER_COLOR,
      });
    }
  }
  return capsules;
}

function createPlateBoxes(): JvStaticBox[] {
  const boxes: JvStaticBox[] = [];
  for (let row = 0; row < PLATE_TILE_COUNT; row += 1) {
    for (
      let column = 0;
      column < PLATE_TILE_COUNT;
      column += 1
    ) {
      boxes.push({
        center: {
          x: (column - 1) * PLATE_TILE_SIZE,
          y: PLATE_BODY_Y,
          z: (row - 1) * PLATE_TILE_SIZE,
        },
        rotation: IDENTITY,
        halfExtents: {
          x: PLATE_TILE_HALF,
          y: 1,
          z: PLATE_TILE_HALF,
        },
        friction: 0.9,
        color: PLATE_COLOR,
      });
    }
  }
  return boxes;
}

export function createE2rWorld(
  scan: JvWorldData["scan"] = null,
): JvWorldData {
  return {
    schema: "JV_WEB_E2R_WORLD_V1",
    nativeAuthorityCommit: NATIVE_AUTHORITY_COMMIT,
    spawn: { x: 0, y: 1.2, z: 0 },
    boxes: [...createPlateBoxes(), ...createRockBoxes()],
    capsules: createBumperCapsules(),
    offroad: createOffroadMesh(),
    scan,
    scanStatus: scan === null ? "NOT_AVAILABLE" : "LOADED",
  };
}
