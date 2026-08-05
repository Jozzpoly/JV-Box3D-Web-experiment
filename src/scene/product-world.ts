import { createE2rWorld } from "./e2r-world.js";
import { loadLocalJsprev2Scan } from "./jsprev2-scan.js";
import type {
  JvQuat,
  JvScanWorld,
  JvStaticBox,
  JvVec3,
  JvWorldData,
} from "./jv-world-contract.js";

const OFFROAD_SEED = 1337;
const ROCK_COLOR = [0.35, 0.31, 0.26, 1] as const;

type WorldListener = (world: JvWorldData) => void;

let sharedWorldPromise: Promise<JvWorldData> | null = null;
let currentWorld: JvWorldData | null = null;
const listeners = new Set<WorldListener>();

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

function u32(value: number): number {
  return value >>> 0;
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

function createAuthoritativeRockBoxes(): readonly JvStaticBox[] {
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

function isLegacyRockBox(box: JvStaticBox): boolean {
  return (
    box.color[0] === ROCK_COLOR[0] &&
    box.color[1] === ROCK_COLOR[1] &&
    box.color[2] === ROCK_COLOR[2] &&
    box.color[3] === ROCK_COLOR[3]
  );
}

export function createProductWorld(
  scan: JvScanWorld | null = null,
): JvWorldData {
  const base = createE2rWorld(scan);
  return {
    ...base,
    boxes: [
      ...base.boxes.filter((box) => !isLegacyRockBox(box)),
      ...createAuthoritativeRockBoxes(),
    ],
  };
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
