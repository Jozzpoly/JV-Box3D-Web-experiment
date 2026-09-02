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
  loadMode5Box3DModule,
} from "../.test-dist/physics/mode5-box3d-runtime.js";
import {
  createMode5WheelForGeometry,
  MODE5_ASSET_PROFILE,
  MODE5_ASSET_PROFILE_GEOMETRY,
  MODE5_FLAT_CONTROL_GEOMETRY,
  MODE5_SOLVER_AWARE_PROFILE,
  MODE5_SOLVER_AWARE_PROFILE_CORNER_RADIUS,
  MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
  MODE5_SOLVER_AWARE_PROFILE_ID,
  MODE5_WHEEL_BACKEND_ID,
  MODE5_WHEEL_GEOMETRY_VARIANT,
} from "../.test-dist/vehicle/m6/mode5-wheel-backend.js";
import {
  m6TopologyConfigFromReceipt,
} from "../.test-dist/vehicle/m6/m6-topology-config.js";

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(
    new URL("../public/receipts/jv_m6_factory_receipt.json", import.meta.url),
    "utf8",
  ),
);
const config = m6TopologyConfigFromReceipt(receipt);

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

function normalize(v) {
  const length = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

const CONTACT_DIRECTIONS = Object.freeze([
  ["radial-X", normalize({ x: 1, y: 0, z: 0 })],
  ["radial-Y", normalize({ x: 0, y: 1, z: 0 })],
  ["axial+Z", normalize({ x: 0, y: 0, z: 1 })],
  ["axial-Z", normalize({ x: 0, y: 0, z: -1 })],
  ["shoulder-X+Z-30", normalize({ x: Math.cos(Math.PI / 6), y: 0, z: Math.sin(Math.PI / 6) })],
  ["shoulder-X-Z-30", normalize({ x: Math.cos(Math.PI / 6), y: 0, z: -Math.sin(Math.PI / 6) })],
  ["shoulder-X+Z-45", normalize({ x: 1, y: 0, z: 1 })],
  ["shoulder-X-Z-45", normalize({ x: 1, y: 0, z: -1 })],
  ["shoulder-X+Z-60", normalize({ x: 0.5, y: 0, z: Math.sqrt(3) / 2 })],
  ["shoulder-X-Z-60", normalize({ x: 0.5, y: 0, z: -Math.sqrt(3) / 2 })],
]);

async function readR3WheelVertices() {
  const buffer = await readFile(
    new URL(
      "../owner-ab/vehicles/m6-owner-r3/models/m6-owner-full-rig-r3.glb",
      import.meta.url,
    ),
  );
  const glb = new Uint8Array(buffer);
  const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
  const jsonLength = view.getUint32(12, true);
  const json = JSON.parse(
    new TextDecoder().decode(glb.slice(20, 20 + jsonLength)).trim(),
  );
  const binaryHeader = 20 + jsonLength;
  const binaryLength = view.getUint32(binaryHeader, true);
  const binary = glb.slice(
    binaryHeader + 8,
    binaryHeader + 8 + binaryLength,
  );
  const node = json.nodes.find(
    (candidate) => candidate.name === "JV_R3_Real_owner_fl_wheel",
  );
  assert.ok(node, "R3 front-left visual wheel node must exist");
  const mesh = json.meshes[node.mesh];
  const binaryView = new DataView(
    binary.buffer,
    binary.byteOffset,
    binary.byteLength,
  );
  const vertices = [];
  for (const primitive of mesh.primitives) {
    const accessor = json.accessors[primitive.attributes.POSITION];
    const bufferView = json.bufferViews[accessor.bufferView];
    const stride = bufferView.byteStride ?? 12;
    const start =
      (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    for (let index = 0; index < accessor.count; index += 1) {
      const offset = start + index * stride;
      vertices.push({
        x: binaryView.getFloat32(offset, true),
        y: binaryView.getFloat32(offset + 4, true),
        z: binaryView.getFloat32(offset + 8, true),
      });
    }
  }
  return vertices;
}

const visualVertices = await readR3WheelVertices();

function makeWorld(b3) {
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  worldDef.enableContinuous = false;
  return b3.b3CreateWorld(worldDef);
}

function wallAt(b3, worldId, normal, nearFace) {
  const thickness = 0.01;
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = {
    x: normal.x * (nearFace + thickness),
    y: normal.y * (nearFace + thickness),
    z: normal.z * (nearFace + thickness),
  };
  bodyDef.rotation = b3.b3ComputeQuatBetweenUnitVectors(
    { x: 1, y: 0, z: 0 },
    normal,
  );
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.enableContactEvents = true;
  b3.b3CreateBoxShape(bodyId, shapeDef, thickness, 2, 2);
}

function visualSupport(b3, wheel, normal) {
  const local = b3.b3Body_GetLocalVector(wheel.bodyId, normal);
  let support = -Infinity;
  for (const point of visualVertices) {
    support = Math.max(
      support,
      point.x * local.x + point.y * local.y + point.z * local.z,
    );
  }
  return support;
}

function contactAt(b3, geometryVariant, normal, nearFace) {
  const worldId = makeWorld(b3);
  const contacts = b3.createContactsBuffer();
  try {
    const wheel = createMode5WheelForGeometry(
      geometryVariant,
      b3,
      worldId,
      config,
      { x: 0, y: 0, z: 0 },
      -6600,
    );
    wallAt(b3, worldId, normal, nearFace);
    b3.b3World_Step(worldId, 1 / 60, 4);
    b3.getShapeContactData(contacts, wheel.rollingShapeId);
    return b3.getNumContacts(contacts);
  } finally {
    b3.destroyContactsBuffer(contacts);
    b3.b3DestroyWorld(worldId);
  }
}

function supportForGeometry(b3, geometryVariant, normal) {
  const worldId = makeWorld(b3);
  try {
    const wheel = createMode5WheelForGeometry(
      geometryVariant,
      b3,
      worldId,
      config,
      { x: 0, y: 0, z: 0 },
      -6601,
    );
    return visualSupport(b3, wheel, normal);
  } finally {
    b3.b3DestroyWorld(worldId);
  }
}

function findOnsetFromVisible(b3, geometryVariant, normal, visibleSupport) {
  for (
    let offset = 0.002;
    offset >= -0.021 - 1e-9;
    offset -= 0.0005
  ) {
    if (
      contactAt(
        b3,
        geometryVariant,
        normal,
        visibleSupport + offset,
      ) > 0
    ) {
      return offset;
    }
  }
  return null;
}

test("solver-aware profile C is explicitly symmetric and keeps the falsified B separate", () => {
  assert.equal(MODE5_WHEEL_GEOMETRY_VARIANT, MODE5_SOLVER_AWARE_PROFILE_GEOMETRY);
  assert.equal(MODE5_SOLVER_AWARE_PROFILE.length, 6);
  assert.equal(MODE5_SOLVER_AWARE_PROFILE_CORNER_RADIUS, 0.005);

  for (
    let left = 0, right = MODE5_SOLVER_AWARE_PROFILE.length - 1;
    left <= right;
    left += 1, right -= 1
  ) {
    const a = MODE5_SOLVER_AWARE_PROFILE[left];
    const b = MODE5_SOLVER_AWARE_PROFILE[right];
    close(a.x, -b.x, 1e-12, `C symmetric x ${left}/${right}`);
    close(a.y, b.y, 1e-12, `C symmetric y ${left}/${right}`);
  }

  assert.notEqual(
    MODE5_SOLVER_AWARE_PROFILE_ID,
    "asset-lower-quartile-c20mm",
  );
  assert.equal(MODE5_ASSET_PROFILE.length, 3);
  assert.ok(
    Math.abs(MODE5_ASSET_PROFILE[1].x) > 0.1,
    "falsified B retains its off-centre single peak for causal comparison",
  );
});

test("A, falsified B and solver-aware C preserve the same wheel mass/filter contract", async () => {
  const b3 = await loadMode5Box3DModule();
  const worldId = makeWorld(b3);
  try {
    const flat = createMode5WheelForGeometry(
      MODE5_FLAT_CONTROL_GEOMETRY,
      b3,
      worldId,
      config,
      { x: -2, y: 2, z: 0 },
      -6610,
    );
    const profileB = createMode5WheelForGeometry(
      MODE5_ASSET_PROFILE_GEOMETRY,
      b3,
      worldId,
      config,
      { x: 0, y: 2, z: 0 },
      -6610,
    );
    const profileC = createMode5WheelForGeometry(
      MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
      b3,
      worldId,
      config,
      { x: 2, y: 2, z: 0 },
      -6610,
    );

    for (const wheel of [flat, profileB, profileC]) {
      assert.equal(wheel.backendId, MODE5_WHEEL_BACKEND_ID);
      assert.equal(wheel.shapeCount, 1);
      assert.equal(wheel.radius, config.wheelRadius);
      assert.equal(wheel.width, config.wheelWidth);
    }
    assert.equal(profileC.profileId, MODE5_SOLVER_AWARE_PROFILE_ID);
    assert.equal(profileC.profileCount, MODE5_SOLVER_AWARE_PROFILE.length);
    assert.equal(
      profileC.cornerRadius,
      MODE5_SOLVER_AWARE_PROFILE_CORNER_RADIUS,
    );

    closeMassData(
      b3.b3Body_GetMassData(profileB.bodyId),
      b3.b3Body_GetMassData(flat.bodyId),
      "B vs A reference mass",
    );
    closeMassData(
      b3.b3Body_GetMassData(profileC.bodyId),
      b3.b3Body_GetMassData(flat.bodyId),
      "C vs A reference mass",
    );
    assert.deepEqual(
      b3.b3Shape_GetFilter(profileC.rollingShapeId),
      b3.b3Shape_GetFilter(profileB.rollingShapeId),
    );
  } finally {
    b3.b3DestroyWorld(worldId);
  }
});

test("solver-aware C does not create stationary contact outside the real R3 rubber envelope", async () => {
  const b3 = await loadMode5Box3DModule();
  const onsets = new Map();

  for (const [name, normal] of CONTACT_DIRECTIONS) {
    const visible = supportForGeometry(
      b3,
      MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
      normal,
    );
    assert.equal(
      contactAt(
        b3,
        MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
        normal,
        visible,
      ),
      0,
      `${name}: C must not contact at the visible rubber surface before penetration`,
    );
    const onset = findOnsetFromVisible(
      b3,
      MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
      normal,
      visible,
    );
    assert.notEqual(onset, null, `${name}: C contact onset must remain within 21 mm of visible rubber`);
    assert.ok(
      onset <= 0.0005,
      `${name}: C onset is outside visible rubber by ${onset} m`,
    );
    assert.ok(
      onset >= -0.0205,
      `${name}: C is excessively inset from visible rubber by ${onset} m`,
    );
    onsets.set(name, onset);
  }

  for (const angle of [30, 45, 60]) {
    const plus = onsets.get(`shoulder-X+Z-${angle}`);
    const minus = onsets.get(`shoulder-X-Z-${angle}`);
    close(
      plus,
      minus,
      0.001,
      `C shoulder ${angle} degree left/right onset symmetry`,
    );
  }
  close(
    onsets.get("radial-X"),
    onsets.get("radial-Y"),
    0.001,
    "C radial onset symmetry",
  );

  const radialNormal = { x: 1, y: 0, z: 0 };
  const radialVisible = supportForGeometry(
    b3,
    MODE5_ASSET_PROFILE_GEOMETRY,
    radialNormal,
  );
  assert.ok(
    contactAt(
      b3,
      MODE5_ASSET_PROFILE_GEOMETRY,
      radialNormal,
      radialVisible + 0.004,
    ) > 0,
    "falsified B must preserve the measured radial pre-rubber contact for regression contrast",
  );
});

test("full mode5 M6 settles and drives with solver-aware C as the diagnostic default", async () => {
  configureBox3DRuntimeVariant("mode5-experiment");
  const boundary = await Box3DBoundary.load();
  const world = boundary.createM6TopologyWorld(receipt);
  try {
    const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 17);
    const settled = world.step(240)[0];
    assert.ok(settled, "C M6 must produce a settled trace");
    assert.equal(settled.wheelBackendId, MODE5_WHEEL_BACKEND_ID);
    assert.ok(settled.worldContacts >= 1, "C M6 must settle into world contact");
    for (const [index, corner] of settled.corners.entries()) {
      assert.ok(
        Number.isFinite(corner.wheelPosition.x) &&
          Number.isFinite(corner.wheelPosition.y) &&
          Number.isFinite(corner.wheelPosition.z),
        `C corner ${index} wheel position must be finite`,
      );
    }

    const start = settled.chassisPosition;
    vehicle.setDrive({ throttle: 0.35, brake: 0 });
    const driven = world.step(180)[0];
    assert.ok(driven, "C M6 must produce a driven trace");
    assert.equal(driven.drive.mode, "THROTTLE");
    assert.ok(Number.isFinite(driven.drive.forwardSpeedMetersPerSecond));
    assert.ok(Number.isFinite(driven.drive.currentMotorTorqueTotal));
    const travel = Math.hypot(
      driven.chassisPosition.x - start.x,
      driven.chassisPosition.z - start.z,
    );
    assert.ok(travel > 0.05, `C M6 did not translate under drive: ${travel}`);
  } finally {
    world.dispose();
  }
});
