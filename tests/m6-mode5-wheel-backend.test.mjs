import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  validatePinnedNativeFactoryReceiptText,
} from "../.test-dist/config/native-factory-receipt.js";
import {
  Box3DBoundary,
  configureBox3DRuntimeVariant,
} from "../.test-dist/physics/box3d-boundary.js";
import {
  BOX3D_MODE5_RUNTIME_PATCH,
  loadMode5Box3DModule,
} from "../.test-dist/physics/mode5-box3d-runtime.js";
import {
  createLegacySplitWheel,
} from "../.test-dist/vehicle/m6/legacy-split-wheel-backend.js";
import {
  createMode5Wheel,
  MODE5_ASSET_PROFILE,
  MODE5_ASSET_PROFILE_CORNER_RADIUS,
  MODE5_ASSET_PROFILE_ID,
  MODE5_WHEEL_BACKEND_ID,
} from "../.test-dist/vehicle/m6/mode5-wheel-backend.js";
import {
  m6TopologyConfigFromReceipt,
} from "../.test-dist/vehicle/m6/m6-topology-config.js";
import {
  M6_MODE5_TOPOLOGY_COUNTS,
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

function createStaticBox(b3, worldId, position, halfExtents) {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.type = b3.b3BodyType.b3_staticBody;
  bodyDef.position = position;
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  b3.b3CreateBoxShape(
    bodyId,
    b3.b3DefaultShapeDef(),
    halfExtents.x,
    halfExtents.y,
    halfExtents.z,
  );
  return bodyId;
}

function addVerticalGuide(b3, worldId, bodyId, position) {
  const guideDef = b3.b3DefaultBodyDef();
  guideDef.type = b3.b3BodyType.b3_staticBody;
  guideDef.position = position;
  const guideId = b3.b3CreateBody(worldId, guideDef);
  const verticalFrame = b3.b3ComputeQuatBetweenUnitVectors(
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
  );
  const jointDef = b3.b3DefaultPrismaticJointDef();
  jointDef.base.bodyIdA = guideId;
  jointDef.base.bodyIdB = bodyId;
  jointDef.base.localFrameA = {
    p: { x: 0, y: 0, z: 0 },
    q: verticalFrame,
  };
  jointDef.base.localFrameB = {
    p: { x: 0, y: 0, z: 0 },
    q: verticalFrame,
  };
  jointDef.base.collideConnected = false;
  jointDef.enableSpring = false;
  jointDef.enableLimit = false;
  b3.b3CreatePrismaticJoint(worldId, jointDef);
}

async function runGuidedProfileContactCase({
  axis,
  centerX = 0,
  addStep = false,
}) {
  const b3 = await loadMode5Box3DModule();
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: -10, z: 0 };
  const worldId = b3.b3CreateWorld(worldDef);
  try {
    createStaticBox(
      b3,
      worldId,
      { x: 0, y: -0.25, z: 0 },
      { x: 4, y: 0.25, z: 2 },
    );
    if (addStep) {
      createStaticBox(
        b3,
        worldId,
        { x: 0.5, y: 0.04, z: 0 },
        { x: 0.25, y: 0.04, z: 1 },
      );
    }

    const initial = { x: centerX, y: 1.25, z: 0 };
    const bodyDef = b3.b3DefaultBodyDef();
    bodyDef.type = b3.b3BodyType.b3_dynamicBody;
    bodyDef.position = initial;
    bodyDef.allowFastRotation = true;
    const bodyId = b3.b3CreateBody(worldId, bodyDef);
    const shapeDef = b3.b3DefaultShapeDef();
    shapeDef.density = 1;
    shapeDef.baseMaterial.friction = 0.8;
    shapeDef.enableContactEvents = true;
    const shapeId = b3.b3CreateWheelShapeProfile(
      bodyId,
      shapeDef,
      { x: 0, y: 0, z: 0 },
      axis,
      MODE5_ASSET_PROFILE,
      MODE5_ASSET_PROFILE_CORNER_RADIUS,
    );
    assert.ok(b3.b3Shape_IsValid(shapeId));
    addVerticalGuide(b3, worldId, bodyId, initial);

    for (let index = 0; index < 360; index += 1) {
      b3.b3World_Step(worldId, 1 / 60, 4);
    }

    const position = b3.b3Body_GetPosition(bodyId);
    assert.ok(Number.isFinite(position.x));
    assert.ok(Number.isFinite(position.y));
    assert.ok(Number.isFinite(position.z));
    assert.ok(
      position.y > 0.35 && position.y < 0.85,
      `profile contact settled outside plausible height: ${JSON.stringify(position)}`,
    );

    const contacts = b3.createContactsBuffer();
    try {
      b3.getShapeContactData(contacts, shapeId);
      assert.ok(
        b3.getNumContacts(contacts) >= 1,
        `profile contact case has no contact at ${JSON.stringify(position)}`,
      );
    } finally {
      b3.destroyContactsBuffer(contacts);
    }
    return position;
  } finally {
    b3.b3DestroyWorld(worldId);
  }
}

test("mode5 asset profile preserves reference-sphere mass while replacing split contact geometry", async () => {
  const b3 = await loadMode5Box3DModule();
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  const worldId = b3.b3CreateWorld(worldDef);
  const config = m6TopologyConfigFromReceipt(receipt);
  try {
    const legacy = createLegacySplitWheel(
      b3,
      worldId,
      config,
      { x: -2, y: 2, z: 0 },
      -4001,
    );
    const mode5 = createMode5Wheel(
      b3,
      worldId,
      config,
      { x: 2, y: 2, z: 0 },
      -4002,
    );

    assert.equal(legacy.shapeCount, 2);
    assert.equal(mode5.shapeCount, 1);
    assert.equal(mode5.backendId, MODE5_WHEEL_BACKEND_ID);
    assert.equal(mode5.profileId, MODE5_ASSET_PROFILE_ID);
    assert.equal(mode5.profileCount, MODE5_ASSET_PROFILE.length);
    assert.equal(mode5.cornerRadius, MODE5_ASSET_PROFILE_CORNER_RADIUS);
    assert.equal(mode5.flatControlCornerRadius, 0.2);
    closeMassData(
      b3.b3Body_GetMassData(mode5.bodyId),
      b3.b3Body_GetMassData(legacy.bodyId),
      "mode5 vs mode3 reference sphere",
    );

    const fullMask = 0xffff_ffff_ffff_ffffn;
    assert.equal(
      b3.b3Shape_GetFilter(legacy.rollingShapeId).maskBits,
      config.terrainCategoryBits,
    );
    assert.equal(
      b3.b3Shape_GetFilter(mode5.rollingShapeId).maskBits,
      fullMask,
    );
  } finally {
    b3.b3DestroyWorld(worldId);
  }
});

test("mode5 asset profile keeps finite contact on flat, edge-biased and tilted-shoulder microcases", async () => {
  const flat = await runGuidedProfileContactCase({
    axis: { x: 0, y: 0, z: 1 },
  });
  const edge = await runGuidedProfileContactCase({
    axis: { x: 0, y: 0, z: 1 },
    centerX: 0,
    addStep: true,
  });
  const tiltRadians = 20 * Math.PI / 180;
  const shoulder = await runGuidedProfileContactCase({
    axis: {
      x: 0,
      y: Math.sin(tiltRadians),
      z: Math.cos(tiltRadians),
    },
  });

  assert.ok(flat.y > 0.45, `flat rest height unexpectedly low: ${flat.y}`);
  assert.ok(edge.y >= flat.y - 0.03, `edge contact collapsed below flat rest: ${edge.y} vs ${flat.y}`);
  assert.ok(shoulder.y > 0.4, `tilted shoulder rest height unexpectedly low: ${shoulder.y}`);
});

test("patched boundary builds and drives a full M6 on the asset-profile mode5 backend", async () => {
  configureBox3DRuntimeVariant("mode5-experiment");
  const boundary = await Box3DBoundary.load();
  assert.equal(
    boundary.receipt.runtimePatch?.id,
    BOX3D_MODE5_RUNTIME_PATCH.id,
  );
  assert.equal(
    boundary.receipt.runtimePatch?.inlineArtifactSha256,
    BOX3D_MODE5_RUNTIME_PATCH.inlineArtifactSha256,
  );
  assert.ok(
    boundary.receipt.requiredExports.includes("b3CreateWheelShapeProfile"),
    "mode5 boundary receipt must name the general profile export",
  );

  const world = boundary.createM6TopologyWorld(receipt);
  try {
    const before = { ...world.counters };
    const vehicle = world.createVehicle(
      { x: 0, y: 1.2, z: 0 },
      5,
    );
    assert.deepEqual(
      vehicle.topologyCounts,
      M6_MODE5_TOPOLOGY_COUNTS,
    );
    assert.equal(
      world.counters.bodyCount - before.bodyCount,
      M6_MODE5_TOPOLOGY_COUNTS.bodies,
    );
    assert.equal(
      world.counters.shapeCount - before.shapeCount,
      M6_MODE5_TOPOLOGY_COUNTS.shapes,
    );
    assert.equal(
      world.counters.jointCount - before.jointCount,
      M6_MODE5_TOPOLOGY_COUNTS.joints,
    );

    const settled = world.step(240)[0];
    assert.ok(settled);
    assert.equal(settled.wheelBackendId, MODE5_WHEEL_BACKEND_ID);
    assert.ok(settled.worldContacts >= 1);
    for (const [index, corner] of settled.corners.entries()) {
      assert.ok(
        Number.isFinite(corner.wheelPosition.x) &&
          Number.isFinite(corner.wheelPosition.y) &&
          Number.isFinite(corner.wheelPosition.z),
        `corner ${index} wheel position is finite`,
      );
    }

    const start = settled.chassisPosition;
    vehicle.setDrive({ throttle: 0.35, brake: 0 });
    const driven = world.step(180)[0];
    assert.ok(driven);
    assert.equal(driven.drive.mode, "THROTTLE");
    assert.ok(Number.isFinite(driven.drive.forwardSpeedMetersPerSecond));
    assert.ok(Number.isFinite(driven.drive.currentMotorTorqueTotal));
    const travel = Math.hypot(
      driven.chassisPosition.x - start.x,
      driven.chassisPosition.z - start.z,
    );
    assert.ok(travel > 0.05, `mode5 M6 did not translate under drive: ${travel}`);
  } finally {
    world.dispose();
  }
});
