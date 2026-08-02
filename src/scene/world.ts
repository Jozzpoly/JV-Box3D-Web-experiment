import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJECT_CATEGORY, TERRAIN_CATEGORY } from '../physics/rig-config';

export interface WorldResources {
  groundBodyId: any;
  meshData: any[];
  dispose(): void;
}

export async function createWorldScene(b3: any, worldId: any, scene: any): Promise<WorldResources> {
  const meshData: any[] = [];
  const groundBodyId = createStaticBox(b3, worldId, scene, {
    position: { x: 0, y: -0.5, z: 0 },
    half: { x: 66, y: 0.5, z: 66 },
    color: 0x394957,
    terrain: true,
  });

  // A small, recognizable JV-style central test campus. It is intentionally
  // procedural until the real board assets are copied into this repository.
  for (let i = 0; i < 12; i += 1) {
    createStaticBox(b3, worldId, scene, {
      position: { x: -28 + i * 4.8, y: 0.04, z: 28 },
      half: { x: 1.7, y: 0.04 + (i % 3) * 0.025, z: 4.0 },
      color: i % 2 ? 0x66717a : 0x7a674f,
      terrain: true,
    });
  }
  createRamp(b3, worldId, scene, { x: 22, y: 1.1, z: -22 }, -0.18);
  createRamp(b3, worldId, scene, { x: 31, y: 2.2, z: -22 }, -0.34);

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

function createStaticBox(
  b3: any,
  worldId: any,
  scene: any,
  spec: { position: { x: number; y: number; z: number }; half: { x: number; y: number; z: number }; color: number; terrain: boolean },
): any {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = spec.position;
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.baseMaterial.friction = 1.05;
  shapeDef.filter.categoryBits = spec.terrain ? TERRAIN_CATEGORY : OBJECT_CATEGORY;
  b3.b3CreateBoxShape(bodyId, shapeDef, spec.half.x, spec.half.y, spec.half.z);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(spec.half.x * 2, spec.half.y * 2, spec.half.z * 2),
    new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.9 }),
  );
  mesh.position.set(spec.position.x, spec.position.y, spec.position.z);
  mesh.receiveShadow = true;
  mesh.castShadow = spec.half.y > 0.1;
  scene.add(mesh);
  return bodyId;
}

function createRamp(b3: any, worldId: any, scene: any, position: { x: number; y: number; z: number }, angleZ: number): void {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = position;
  bodyDef.rotation = b3.b3MakeQuatFromAxisAngle({ x: 0, y: 0, z: 1 }, angleZ);
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.baseMaterial.friction = 1.05;
  shapeDef.filter.categoryBits = TERRAIN_CATEGORY;
  b3.b3CreateBoxShape(bodyId, shapeDef, 5, 0.45, 4);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0x756452, roughness: 0.86 }),
  );
  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.z = angleZ;
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
}

async function tryLoadScanIsland(b3: any, worldId: any, scene: any): Promise<any | null> {
  const loader = new GLTFLoader();
  try {
    const [visual, collision] = await Promise.all([
      loader.loadAsync('./assets/scan/terrain-visual.glb'),
      loader.loadAsync('./assets/scan/terrain-collision.glb'),
    ]);
    visual.scene.position.set(0, 0, 95);
    visual.scene.traverse((object: any) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    scene.add(visual.scene);

    collision.scene.position.set(0, 0, 95);
    collision.scene.updateMatrixWorld(true);
    const positions: number[] = [];
    const indices: number[] = [];
    collision.scene.traverse((object: any) => {
      if (!object.isMesh || !object.geometry?.attributes?.position) return;
      const geometry = object.geometry;
      const offset = positions.length / 3;
      const p = geometry.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < p.count; i += 1) {
        v.fromBufferAttribute(p, i).applyMatrix4(object.matrixWorld);
        positions.push(v.x, v.y, v.z);
      }
      if (geometry.index) {
        for (let i = 0; i < geometry.index.count; i += 1) indices.push(offset + geometry.index.getX(i));
      } else {
        for (let i = 0; i < p.count; i += 1) indices.push(offset + i);
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
    console.info('Scan assets not present yet; running the procedural JV board only.', error);
    return null;
  }
}
