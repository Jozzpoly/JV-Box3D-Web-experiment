import test from "node:test";
import assert from "node:assert/strict";
import Box3DFactory from "box3d.js/inline";
import {
  installJvWorldPhysics,
  JvWorldMeshOwner,
} from "../.test-dist/scene/jv-world-physics.js";

function tinyWorld() {
  return {
    schema: "JV_WEB_E2R_WORLD_V1",
    nativeAuthorityCommit: "fixture",
    spawn: { x: 0, y: 2, z: 0 },
    boxes: [],
    capsules: [],
    offroad: {
      positions: new Float32Array([
        -5, 0, -5,
        5, 0, -5,
        -5, 0, 5,
        5, 0, 5,
      ]),
      indices: new Uint32Array([0, 2, 1, 1, 2, 3]),
      color: [0.2, 0.4, 0.2, 1],
    },
    scan: null,
    scanStatus: "NOT_AVAILABLE",
  };
}

test("product mesh owns real Box3D contact data until world teardown", async () => {
  const b3 = await Box3DFactory();
  const worldDefinition = b3.b3DefaultWorldDef();
  worldDefinition.gravity = { x: 0, y: -10, z: 0 };
  const worldId = b3.b3CreateWorld(worldDefinition);
  const meshOwner = new JvWorldMeshOwner(b3);

  const receipt = installJvWorldPhysics(
    b3,
    worldId,
    tinyWorld(),
    2n,
    meshOwner,
  );
  assert.deepEqual(receipt, {
    staticBodies: 1,
    staticShapes: 1,
    meshShapes: 1,
    scanInstalled: false,
  });

  const bodyDefinition = b3.b3DefaultBodyDef();
  bodyDefinition.type = b3.b3BodyType.b3_dynamicBody;
  bodyDefinition.position = { x: 0, y: 3, z: 0 };
  const bodyId = b3.b3CreateBody(worldId, bodyDefinition);
  b3.b3CreateSphereShape(
    bodyId,
    b3.b3DefaultShapeDef(),
    {
      center: { x: 0, y: 0, z: 0 },
      radius: 0.5,
    },
  );

  for (let step = 0; step < 240; step += 1) {
    b3.b3World_Step(worldId, 1 / 60, 4);
  }
  const settled = b3.b3Body_GetPosition(bodyId);
  assert.ok(
    Math.abs(settled.y - 0.5) < 0.02,
    `sphere should settle on the retained terrain mesh, y=${settled.y}`,
  );

  b3.b3DestroyWorld(worldId);
  assert.equal(meshOwner.disposeAfterWorld(), 1);
  assert.equal(meshOwner.disposeAfterWorld(), 0);
});
