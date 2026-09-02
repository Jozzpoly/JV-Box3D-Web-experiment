import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import { loadMode5Box3DModule } from "../.test-dist/physics/mode5-box3d-runtime.js";
import {
  createMode5WheelForGeometry,
  MODE5_CORE_TORUS_BACKEND_ID,
  MODE5_CORE_TORUS_CROWN_RATIO,
  MODE5_CORE_TORUS_GEOMETRY,
  MODE5_CORE_TORUS_ID,
  MODE5_CORE_TORUS_SEGMENTS,
  MODE5_FLAT_CONTROL_GEOMETRY,
} from "../.test-dist/vehicle/m6/mode5-wheel-backend.js";
import { m6TopologyConfigFromReceipt } from "../.test-dist/vehicle/m6/m6-topology-config.js";
import {
  M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS,
  m6TopologyCountsForWheelBackend,
} from "../.test-dist/vehicle/m6/m6-topology-contract.js";

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(
    new URL("../public/receipts/jv_m6_factory_receipt.json", import.meta.url),
    "utf8",
  ),
);

function close(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual} vs ${expected}`,
  );
}

function closeMassData(actual, expected, label) {
  close(actual.mass, expected.mass, 1e-6, `${label} mass`);
  for (const axis of ["x", "y", "z"]) {
    close(actual.center[axis], expected.center[axis], 1e-7, `${label} center.${axis}`);
  }
  for (const column of ["cx", "cy", "cz"]) {
    for (const axis of ["x", "y", "z"]) {
      close(
        actual.inertia[column][axis],
        expected.inertia[column][axis],
        1e-5,
        `${label} inertia.${column}.${axis}`,
      );
    }
  }
}

test("exact recovered CORE torus keeps the frozen sphere mass and 64-shape contact contract", async () => {
  const b3 = await loadMode5Box3DModule();
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  const worldId = b3.b3CreateWorld(worldDef);
  const config = m6TopologyConfigFromReceipt(receipt);
  try {
    const flat = createMode5WheelForGeometry(
      MODE5_FLAT_CONTROL_GEOMETRY,
      b3,
      worldId,
      config,
      { x: -2, y: 2, z: 0 },
      -9401,
    );
    const torus = createMode5WheelForGeometry(
      MODE5_CORE_TORUS_GEOMETRY,
      b3,
      worldId,
      config,
      { x: 2, y: 2, z: 0 },
      -9402,
    );

    assert.equal(torus.backendId, MODE5_CORE_TORUS_BACKEND_ID);
    assert.equal(torus.geometryVariant, MODE5_CORE_TORUS_GEOMETRY);
    assert.equal(torus.contactGeometryId, MODE5_CORE_TORUS_ID);
    assert.equal(torus.profileId, null);
    assert.equal(torus.profileCount, 0);
    assert.equal(torus.rollingShapeId, null);
    assert.equal(torus.shapeCount, MODE5_CORE_TORUS_SEGMENTS);
    assert.equal(torus.shapeIds.length, MODE5_CORE_TORUS_SEGMENTS);
    assert.equal(b3.b3Body_GetShapeCount(torus.bodyId), MODE5_CORE_TORUS_SEGMENTS);

    const halfWidth = 0.5 * config.wheelWidth;
    const expectedCrown = MODE5_CORE_TORUS_CROWN_RATIO * halfWidth;
    close(torus.torusCrownRadius, expectedCrown, 1e-12, "crown");
    close(
      torus.torusRingRadius,
      config.wheelRadius - expectedCrown,
      1e-12,
      "ring",
    );
    close(
      torus.torusCapsuleHalfLength,
      halfWidth - expectedCrown,
      1e-12,
      "capsule half length",
    );
    assert.equal(torus.torusSegments, MODE5_CORE_TORUS_SEGMENTS);

    closeMassData(
      b3.b3Body_GetMassData(torus.bodyId),
      b3.b3Body_GetMassData(flat.bodyId),
      "CORE torus vs analytic frozen reference sphere",
    );

    assert.ok(flat.rollingShapeId);
    const flatFilter = b3.b3Shape_GetFilter(flat.rollingShapeId);
    for (const [index, shapeId] of torus.shapeIds.entries()) {
      assert.ok(b3.b3Shape_IsValid(shapeId), `capsule ${index} is valid`);
      assert.deepEqual(
        b3.b3Shape_GetFilter(shapeId),
        flatFilter,
        `capsule ${index} preserves the mode5 collision filter`,
      );
    }
  } finally {
    b3.b3DestroyWorld(worldId);
  }
});

test("CORE torus backend keeps M6 bodies/joints fixed and expands only contact shapes", () => {
  assert.deepEqual(
    m6TopologyCountsForWheelBackend(MODE5_CORE_TORUS_BACKEND_ID),
    M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS,
  );
  assert.deepEqual(M6_MODE5_CORE_TORUS_TOPOLOGY_COUNTS, {
    bodies: 19,
    joints: 28,
    shapes: 257,
    corners: 4,
  });
});
