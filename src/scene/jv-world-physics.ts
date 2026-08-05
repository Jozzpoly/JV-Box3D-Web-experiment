import type {
  Box3DModule,
  b3BodyId,
  b3WorldId,
} from "../physics/box3d-runtime-contract.js";
import type {
  JvIndexedMesh,
  JvQuat,
  JvWorldData,
} from "./jv-world-contract.js";

const FULL_MASK = 0xffff_ffff_ffff_ffffn;
const UNIT_SCALE = { x: 1, y: 1, z: 1 } as const;

export interface JvWorldPhysicsReceipt {
  readonly staticBodies: number;
  readonly staticShapes: number;
  readonly meshShapes: number;
  readonly scanInstalled: boolean;
}

function box3dQuat(rotation: JvQuat) {
  return {
    v: { x: rotation.x, y: rotation.y, z: rotation.z },
    s: rotation.w,
  };
}

function createStaticBody(
  b3: Box3DModule,
  worldId: b3WorldId,
  position: Readonly<{ x: number; y: number; z: number }>,
  rotation: JvQuat,
): b3BodyId {
  const definition = b3.b3DefaultBodyDef();
  definition.position = { ...position };
  definition.rotation = box3dQuat(rotation);
  return b3.b3CreateBody(worldId, definition);
}

function createTerrainDefinition(
  b3: Box3DModule,
  terrainCategoryBits: bigint,
  friction: number,
) {
  const definition = b3.b3DefaultShapeDef();
  definition.baseMaterial.friction = friction;
  definition.filter.categoryBits = terrainCategoryBits;
  definition.filter.maskBits = FULL_MASK;
  definition.enableContactEvents = true;
  return definition;
}

function installMesh(
  b3: Box3DModule,
  worldId: b3WorldId,
  mesh: JvIndexedMesh,
  origin: Readonly<{ x: number; y: number; z: number }>,
  terrainCategoryBits: bigint,
  friction: number,
): void {
  const meshData = b3.b3CreateMesh(mesh.positions, mesh.indices);
  if (meshData === null) {
    throw new Error("Box3D rejected a JV static mesh.");
  }
  try {
    const body = createStaticBody(
      b3,
      worldId,
      origin,
      { x: 0, y: 0, z: 0, w: 1 },
    );
    b3.b3CreateMeshShape(
      body,
      createTerrainDefinition(
        b3,
        terrainCategoryBits,
        friction,
      ),
      meshData,
      UNIT_SCALE,
    );
  } finally {
    meshData.delete();
  }
}

export function installJvWorldPhysics(
  b3: Box3DModule,
  worldId: b3WorldId,
  world: JvWorldData,
  terrainCategoryBits: bigint,
): JvWorldPhysicsReceipt {
  let staticBodies = 0;
  let staticShapes = 0;
  let meshShapes = 0;

  for (const box of world.boxes) {
    const body = createStaticBody(
      b3,
      worldId,
      box.center,
      box.rotation,
    );
    b3.b3CreateBoxShape(
      body,
      createTerrainDefinition(
        b3,
        terrainCategoryBits,
        box.friction,
      ),
      box.halfExtents.x,
      box.halfExtents.y,
      box.halfExtents.z,
    );
    staticBodies += 1;
    staticShapes += 1;
  }

  for (const capsule of world.capsules) {
    const body = createStaticBody(
      b3,
      worldId,
      capsule.bodyCenter,
      capsule.bodyRotation,
    );
    b3.b3CreateCapsuleShape(
      body,
      createTerrainDefinition(
        b3,
        terrainCategoryBits,
        capsule.friction,
      ),
      {
        center1: { ...capsule.point1 },
        center2: { ...capsule.point2 },
        radius: capsule.radius,
      },
    );
    staticBodies += 1;
    staticShapes += 1;
  }

  installMesh(
    b3,
    worldId,
    world.offroad,
    { x: 0, y: 0, z: 0 },
    terrainCategoryBits,
    0.85,
  );
  staticBodies += 1;
  staticShapes += 1;
  meshShapes += 1;

  if (world.scan !== null) {
    installMesh(
      b3,
      worldId,
      world.scan.collision,
      world.scan.origin,
      terrainCategoryBits,
      0.85,
    );
    staticBodies += 1;
    staticShapes += 1;
    meshShapes += 1;
  }

  return {
    staticBodies,
    staticShapes,
    meshShapes,
    scanInstalled: world.scan !== null,
  };
}
