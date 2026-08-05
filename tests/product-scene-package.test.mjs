import test from "node:test";
import assert from "node:assert/strict";
import {
  applyProductSpawnToScene,
} from "../.test-dist/scene/product-scene-package.js";

function sceneFixture() {
  return Object.freeze({
    format: "jv-web-scene-package",
    schemaVersion: 1,
    id: "synthetic-flat-lab",
    displayName: "Synthetic flat lab",
    units: "meter",
    axes: Object.freeze({
      forward: "+X",
      up: "+Y",
      right: "+Z",
    }),
    spawn: Object.freeze({
      position: Object.freeze([0, 1.2, 0]),
      yawRadians: 0,
    }),
    render: Object.freeze({ kind: "NONE" }),
    collision: Object.freeze({
      kind: "BUILTIN_GROUND_PLANE",
      heightMeters: 0,
    }),
  });
}

function worldFixture() {
  return {
    schema: "JV_WEB_E2R_WORLD_V1",
    nativeAuthorityCommit: "fixture",
    spawn: { x: 0, y: 1.2, z: 0 },
    boxes: [],
    capsules: [],
    offroad: {
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 0, 1]),
      indices: new Uint32Array([0, 1, 2]),
      color: [1, 1, 1, 1],
    },
    scan: {
      source: "JSPREV2",
      packId: "fixture-scan",
      origin: { x: 10, y: 2, z: 20 },
      worldBounds: {
        minimum: { x: 9, y: 3, z: 19 },
        maximum: { x: 11, y: 4, z: 21 },
      },
      collision: {
        positions: new Float32Array([
          -1, 2, -1,
          1, 2, -1,
          0, 2, 1,
        ]),
        indices: new Uint32Array([0, 1, 2]),
        color: [0.6, 0.6, 0.6, 1],
      },
      groups: [],
      textureCount: 0,
      triangleCount: 1,
    },
    scanStatus: "LOADED",
  };
}

test("map target preserves the canonical validated scene object", () => {
  const scene = sceneFixture();
  assert.equal(
    applyProductSpawnToScene(scene, worldFixture(), "map"),
    scene,
  );
});

test("scan target changes only the frozen spawn position", () => {
  const scene = sceneFixture();
  const rewritten = applyProductSpawnToScene(
    scene,
    worldFixture(),
    "scan",
  );
  assert.notEqual(rewritten, scene);
  assert.equal(Object.isFrozen(rewritten), true);
  assert.equal(Object.isFrozen(rewritten.spawn), true);
  assert.equal(Object.isFrozen(rewritten.spawn.position), true);
  assert.deepEqual(rewritten.spawn.position, [10, 5.2, 20]);
  assert.equal(rewritten.id, scene.id);
  assert.equal(rewritten.render, scene.render);
  assert.equal(rewritten.collision, scene.collision);
  assert.equal(rewritten.spawn.yawRadians, 0);
});
