import * as THREE from 'three';
import { CapsuleGeometry } from 'three/addons/geometries/CapsuleGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJECT_CATEGORY, TERRAIN_CATEGORY } from '../physics/rig-config';

const DEG = Math.PI / 180;
const PLATE_HALF_EXTENT = 200;
const PLATE_BODY_Y = -1;
const OFFROAD_SEED = 1337;
const SCAN_SOUTH_EDGE_Z = 320;

type BumperPattern = 'full' | 'alternating' | 'wave';

interface BumperBankSpec {
  id: string;
  x: number;
  z: number;
  yaw: number;
  count: number;
  spacing: number;
  radius: number;
  width: number;
  centerY: number;
  sideOffset: number;
  pattern: BumperPattern;
}

interface RockIslandSpec {
  id: string;
  x: number;
  z: number;
  yaw: number;
  lengthX: number;
  widthZ: number;
  clusterCount: number;
  rocksPerCluster: number;
  clusterRadius: number;
  minSize: number;
  maxSize: number;
  seedOffset: number;
}

const BUMPER_BANKS: BumperBankSpec[] = [
  { id: 'N1 low rhythm', x: -34, z: 38, yaw: 0, count: 9, spacing: 1.2, radius: 0.09, width: 8, centerY: 0.030, sideOffset: 0, pattern: 'full' },
  { id: 'N2 alternating', x: -12, z: 38, yaw: 0, count: 14, spacing: 1.0, radius: 0.09, width: 8, centerY: 0.035, sideOffset: 2.2, pattern: 'alternating' },
  { id: 'N3 wave', x: 12, z: 38, yaw: 0, count: 10, spacing: 1.4, radius: 0.12, width: 8, centerY: 0.045, sideOffset: 2.0, pattern: 'wave' },
  { id: 'N4 return rhythm', x: 32, z: 38, yaw: 0, count: 8, spacing: 1.6, radius: 0.10, width: 8, centerY: 0.032, sideOffset: 0, pattern: 'full' },
  { id: 'W1 alternating', x: -34, z: -12, yaw: -90, count: 10, spacing: 0.8, radius: 0.08, width: 7, centerY: 0.028, sideOffset: 1.7, pattern: 'alternating' },
  { id: 'W2 cross rhythm', x: -34, z: 0, yaw: -90, count: 14, spacing: 1.0, radius: 0.10, width: 7, centerY: 0.035, sideOffset: 2.0, pattern: 'wave' },
  { id: 'W3 low exit', x: -34, z: 12, yaw: -90, count: 10, spacing: 1.0, radius: 0.11, width: 7, centerY: 0.040, sideOffset: 1.6, pattern: 'alternating' },
  { id: 'E1 outside rhythm', x: 22, z: 0, yaw: 90, count: 12, spacing: 1.0, radius: 0.09, width: 6, centerY: 0.030, sideOffset: 1.5, pattern: 'wave' },
  { id: 'E2 outside exit', x: 46, z: 0, yaw: 90, count: 10, spacing: 1.0, radius: 0.10, width: 6, centerY: 0.034, sideOffset: 1.5, pattern: 'alternating' },
  { id: 'S1 approach', x: -34, z: -38, yaw: 0, count: 12, spacing: 1.0, radius: 0.10, width: 8, centerY: 0.032, sideOffset: 2.0, pattern: 'wave' },
  { id: 'S2 alternating', x: -10, z: -38, yaw: 0, count: 16, spacing: 0.9, radius: 0.08, width: 8, centerY: 0.025, sideOffset: 2.2, pattern: 'alternating' },
  { id: 'S3 medium', x: 16, z: -38, yaw: 0, count: 12, spacing: 1.2, radius: 0.12, width: 8, centerY: 0.045, sideOffset: 0, pattern: 'full' },
  { id: 'S4 return', x: 34, z: -38, yaw: 0, count: 10, spacing: 1.3, radius: 0.10, width: 8, centerY: 0.032, sideOffset: 2.0, pattern: 'alternating' },
];

const ROCK_ISLANDS: RockIslandSpec[] = [
  { id: 'E1 Gravel Island', x: 34, z: -14, yaw: 90, lengthX: 8, widthZ: 14, clusterCount: 3, rocksPerCluster: 31, clusterRadius: 2.4, minSize: 0.16, maxSize: 0.34, seedOffset: 910 },
  { id: 'E2 Mixed Rock Island', x: 34, z: 0, yaw: 90, lengthX: 8, widthZ: 14, clusterCount: 4, rocksPerCluster: 32, clusterRadius: 2.5, minSize: 0.20, maxSize: 0.42, seedOffset: 920 },
  { id: 'E3 Heavy Boulder Island', x: 34, z: 14, yaw: 90, lengthX: 8, widthZ: 14, clusterCount: 5, rocksPerCluster: 36, clusterRadius: 2.7, minSize: 0.24, maxSize: 0.52, seedOffset: 930 },
];

export interface WorldResources {
  groundBodyId: any;
  meshData: any[];
  dispose(): void;
}

export async function createWorldScene(b3: any, worldId: any, scene: THREE.Scene): Promise<WorldResources> {
  const meshData: any[] = [];
  const groundBodyId = createPlate(b3, worldId, scene);
  addCampusZoneGuide(scene);

  for (const bank of BUMPER_BANKS) addBumperBank(b3, worldId, scene, bank);
  for (const island of ROCK_ISLANDS) addRockIsland(b3, worldId, scene, island, OFFROAD_SEED + island.seedOffset);

  const scan = await tryLoadScanIsland(b3, worldId, scene);
  if (scan) meshData.push(scan);

  return {
    groundBodyId,
    meshData,
    dispose() {
      for (const data of meshData) b3.b3DestroyMesh(data);
    },
  };
}

function createPlate(b3: any, worldId: any, scene: THREE.Scene): any {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = { x: 0, y: PLATE_BODY_Y, z: 0 };
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.baseMaterial.friction = 1.05;
  shapeDef.filter.categoryBits = TERRAIN_CATEGORY;
  b3.b3CreateBoxShape(bodyId, shapeDef, PLATE_HALF_EXTENT, 1, PLATE_HALF_EXTENT);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(PLATE_HALF_EXTENT * 2, 2, PLATE_HALF_EXTENT * 2),
    new THREE.MeshStandardMaterial({ color: 0x394957, roughness: 0.94 }),
  );
  mesh.position.set(0, PLATE_BODY_Y, 0);
  mesh.receiveShadow = true;
  scene.add(mesh);

  const tileGrid = new THREE.GridHelper(400, 3, 0x708090, 0x526170);
  tileGrid.position.y = 0.006;
  scene.add(tileGrid);
  return bodyId;
}

function addCampusZoneGuide(scene: THREE.Scene): void {
  const zones = [
    { x: 0, z: 38, sx: 92, sz: 28, color: 0x657887 },
    { x: -34, z: 0, sx: 44, sz: 36, color: 0x6e655f },
    { x: 34, z: 0, sx: 44, sz: 36, color: 0x596f58 },
    { x: 0, z: -38, sx: 92, sz: 28, color: 0x756451 },
  ];
  for (const zone of zones) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(zone.sx, zone.sz),
      new THREE.MeshStandardMaterial({
        color: zone.color,
        transparent: true,
        opacity: 0.18,
        roughness: 1,
        depthWrite: false,
      }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(zone.x, 0.012, zone.z);
    scene.add(mesh);
  }

  const core = new THREE.RingGeometry(9.5, 10, 64);
  const coreMesh = new THREE.Mesh(
    core,
    new THREE.MeshBasicMaterial({ color: 0x9ab4c4, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
  );
  coreMesh.rotation.x = -Math.PI / 2;
  coreMesh.position.y = 0.018;
  scene.add(coreMesh);
}

function addBumperBank(b3: any, worldId: any, scene: THREE.Scene, spec: BumperBankSpec): void {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = { x: spec.x, y: 0, z: spec.z };
  bodyDef.rotation = b3.b3MakeQuatFromAxisAngle({ x: 0, y: 1, z: 0 }, spec.yaw * DEG);
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.baseMaterial.friction = 0.85;
  shapeDef.filter.categoryBits = TERRAIN_CATEGORY;

  const group = new THREE.Group();
  group.name = spec.id;
  group.position.set(spec.x, 0, spec.z);
  group.rotation.y = spec.yaw * DEG;
  const material = new THREE.MeshStandardMaterial({ color: 0x937658, roughness: 0.8 });
  const startX = -spec.spacing * (spec.count - 1) * 0.5;

  for (let i = 0; i < spec.count; i += 1) {
    const localX = startX + spec.spacing * i;
    let localZ = 0;
    let elementWidth = spec.width;
    if (spec.pattern === 'alternating') {
      localZ = (i & 1) === 0 ? -spec.sideOffset : spec.sideOffset;
      elementWidth = spec.width * 0.58;
    } else if (spec.pattern === 'wave') {
      localZ = (i % 4) < 2 ? -spec.sideOffset : spec.sideOffset;
      elementWidth = spec.width * ((i & 1) === 0 ? 0.72 : 0.48);
    }

    const halfSpan = Math.max(0.1, elementWidth * 0.5 - spec.radius);
    b3.b3CreateCapsuleShape(bodyId, shapeDef, {
      center1: { x: localX, y: spec.centerY, z: localZ - halfSpan },
      center2: { x: localX, y: spec.centerY, z: localZ + halfSpan },
      radius: spec.radius,
    });

    const visual = new THREE.Mesh(
      new CapsuleGeometry(spec.radius, halfSpan * 2, 3, 8),
      material,
    );
    visual.position.set(localX, spec.centerY, localZ);
    visual.rotation.x = Math.PI / 2;
    visual.castShadow = true;
    visual.receiveShadow = true;
    group.add(visual);
  }
  scene.add(group);
}

function addRockIsland(
  b3: any,
  worldId: any,
  scene: THREE.Scene,
  spec: RockIslandSpec,
  seed: number,
): void {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = { x: spec.x, y: 0, z: spec.z };
  bodyDef.rotation = b3.b3MakeQuatFromAxisAngle({ x: 0, y: 1, z: 0 }, spec.yaw * DEG);
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.baseMaterial.friction = 1;
  shapeDef.filter.categoryBits = TERRAIN_CATEGORY;

  const cubeHull = b3.b3CreateHull(new Float32Array([
    -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
  ]));
  if (!cubeHull) throw new Error(`${spec.id}: failed to create source hull`);

  const count = spec.clusterCount * spec.rocksPerCluster;
  const visual = new THREE.InstancedMesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0x68645d, roughness: 0.98 }),
    count,
  );
  visual.name = spec.id;
  visual.position.set(spec.x, 0, spec.z);
  visual.rotation.y = spec.yaw * DEG;
  visual.castShadow = true;
  visual.receiveShadow = true;

  const random = xorshift(seed || 1);
  const columns = Math.ceil(Math.sqrt(spec.clusterCount));
  const rows = Math.ceil(spec.clusterCount / columns);
  let instance = 0;
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  for (let cluster = 0; cluster < spec.clusterCount; cluster += 1) {
    const row = Math.floor(cluster / columns);
    const column = cluster % columns;
    const u = columns === 1 ? 0.5 : column / (columns - 1);
    const v = rows === 1 ? 0.5 : row / (rows - 1);
    const clusterX = (u - 0.5) * spec.lengthX * 0.58 + randomRange(random, -1, 1);
    const clusterZ = (v - 0.5) * spec.widthZ * 0.58 + randomRange(random, -1, 1);

    for (let rock = 0; rock < spec.rocksPerCluster; rock += 1) {
      const angle = randomRange(random, 0, Math.PI * 2);
      const radial = Math.sqrt(random()) * Math.max(0.05, spec.clusterRadius);
      const size = randomRange(random, Math.max(0.05, spec.minSize), Math.max(spec.minSize, spec.maxSize));
      const hx = size * randomRange(random, 0.70, 1.25) * 0.5;
      const hy = size * randomRange(random, 0.55, 1.15) * 0.5;
      const hz = size * randomRange(random, 0.70, 1.25) * 0.5;
      const rx = clamp(clusterX + Math.cos(angle) * radial, -spec.lengthX * 0.5 + hx, spec.lengthX * 0.5 - hx);
      const rz = clamp(clusterZ + Math.sin(angle) * radial, -spec.widthZ * 0.5 + hz, spec.widthZ * 0.5 - hz);
      const embed = hy * randomRange(random, 0.35, 0.55);
      const yaw = randomRange(random, 0, Math.PI * 2);
      const tilt = randomRange(random, -18 * DEG, 18 * DEG);
      const qYaw = b3.b3MakeQuatFromAxisAngle({ x: 0, y: 1, z: 0 }, yaw);
      const qTilt = b3.b3MakeQuatFromAxisAngle({ x: 1, y: 0, z: 0 }, tilt);
      const q = b3.b3MulQuat(qYaw, qTilt);

      b3.b3CreateTransformedHullShape(
        bodyId,
        shapeDef,
        cubeHull,
        { p: { x: rx, y: hy - embed, z: rz }, q },
        { x: hx, y: hy, z: hz },
      );

      position.set(rx, hy - embed, rz);
      quaternion.set(q.v.x, q.v.y, q.v.z, q.s);
      scale.set(hx, hy, hz);
      matrix.compose(position, quaternion, scale);
      visual.setMatrixAt(instance, matrix);
      instance += 1;
    }
  }
  visual.instanceMatrix.needsUpdate = true;
  scene.add(visual);
  b3.b3DestroyHull(cubeHull);
}

async function tryLoadScanIsland(b3: any, worldId: any, scene: THREE.Scene): Promise<any | null> {
  const loader = new GLTFLoader();
  try {
    const [visual, collision] = await Promise.all([
      loader.loadAsync('./assets/scan/terrain-visual.glb'),
      loader.loadAsync('./assets/scan/terrain-collision.glb'),
    ]);

    collision.scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(collision.scene);
    if (bounds.isEmpty()) throw new Error('terrain-collision.glb has empty bounds');
    const offset = new THREE.Vector3(
      -(bounds.min.x + bounds.max.x) * 0.5,
      -bounds.min.y,
      SCAN_SOUTH_EDGE_Z - bounds.min.z,
    );
    visual.scene.position.copy(offset);
    collision.scene.position.copy(offset);

    visual.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    scene.add(visual.scene);

    collision.scene.updateMatrixWorld(true);
    const positions: number[] = [];
    const indices: number[] = [];
    collision.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || !object.geometry.attributes.position) return;
      const geometry = object.geometry;
      const vertexOffset = positions.length / 3;
      const attribute = geometry.attributes.position;
      const vertex = new THREE.Vector3();
      for (let i = 0; i < attribute.count; i += 1) {
        vertex.fromBufferAttribute(attribute, i).applyMatrix4(object.matrixWorld);
        positions.push(vertex.x, vertex.y, vertex.z);
      }
      if (geometry.index) {
        for (let i = 0; i < geometry.index.count; i += 1) {
          indices.push(vertexOffset + geometry.index.getX(i));
        }
      } else {
        for (let i = 0; i < attribute.count; i += 1) indices.push(vertexOffset + i);
      }
    });
    if (indices.length < 3) throw new Error('terrain-collision.glb contains no triangles');

    const meshData = b3.b3CreateMesh(new Float32Array(positions), new Uint32Array(indices));
    if (!meshData) throw new Error('Box3D rejected the scan collision mesh');
    const bodyDef = b3.b3DefaultBodyDef();
    const bodyId = b3.b3CreateBody(worldId, bodyDef);
    const shapeDef = b3.b3DefaultShapeDef();
    shapeDef.filter.categoryBits = TERRAIN_CATEGORY;
    shapeDef.baseMaterial.friction = 1.15;
    b3.b3CreateMeshShape(bodyId, shapeDef, meshData, { x: 1, y: 1, z: 1 });
    return meshData;
  } catch (error) {
    console.info('Scan assets not present yet; running the JV campus only.', error);
    return null;
  }
}

function xorshift(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return (state & 0x00ff_ffff) / 0x00ff_ffff;
  };
}

function randomRange(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
