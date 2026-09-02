import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  validatePinnedNativeFactoryReceiptText,
} from "../.test-dist/config/native-factory-receipt.js";
import {
  loadMode5Box3DModule,
} from "../.test-dist/physics/mode5-box3d-runtime.js";
import {
  createMode5WheelForGeometry,
  MODE5_ASSET_PROFILE_GEOMETRY,
  MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
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

async function readR3RadialSupport() {
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
  let support = -Infinity;
  for (const primitive of mesh.primitives) {
    const accessor = json.accessors[primitive.attributes.POSITION];
    const bufferView = json.bufferViews[accessor.bufferView];
    const stride = bufferView.byteStride ?? 12;
    const start =
      (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    for (let index = 0; index < accessor.count; index += 1) {
      const offset = start + index * stride;
      support = Math.max(support, binaryView.getFloat32(offset, true));
    }
  }
  assert.ok(Number.isFinite(support));
  return support;
}

const visibleTreadSupport = await readR3RadialSupport();

function addWall(b3, worldId, nearFaceX) {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = { x: nearFaceX + 0.01, y: 0, z: 0 };
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.enableContactEvents = true;
  b3.b3CreateBoxShape(bodyId, shapeDef, 0.01, 2, 2);
}

function runImpact(b3, geometryVariant, visualGap, speed) {
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  worldDef.enableContinuous = false;
  const worldId = b3.b3CreateWorld(worldDef);
  const contacts = b3.createContactsBuffer();
  try {
    const wheel = createMode5WheelForGeometry(
      geometryVariant,
      b3,
      worldId,
      config,
      { x: 0, y: 0, z: 0 },
      -6700,
    );
    addWall(b3, worldId, visibleTreadSupport + visualGap);
    b3.b3Body_SetLinearVelocity(wheel.bodyId, { x: speed, y: 0, z: 0 });
    b3.b3World_Step(worldId, 1 / 60, 4);
    const velocity = { ...b3.b3Body_GetLinearVelocity(wheel.bodyId) };
    const position = { ...b3.b3Body_GetPosition(wheel.bodyId) };
    b3.getShapeContactData(contacts, wheel.rollingShapeId);
    return {
      contacts: b3.getNumContacts(contacts),
      velocity,
      position,
      freeFlightX: speed / 60,
    };
  } finally {
    b3.destroyContactsBuffer(contacts);
    b3.b3DestroyWorld(worldId);
  }
}

test("solver-aware C does not brake on air before the visible R3 tread reaches an obstacle", async () => {
  const b3 = await loadMode5Box3DModule();
  const preRubberGap = 0.004;

  for (const speed of [1, 2, 5]) {
    const falsifiedB = runImpact(
      b3,
      MODE5_ASSET_PROFILE_GEOMETRY,
      preRubberGap,
      speed,
    );
    const solverAwareC = runImpact(
      b3,
      MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
      preRubberGap,
      speed,
    );

    assert.ok(
      falsifiedB.contacts > 0,
      `B must preserve its measured pre-rubber contact at ${speed} m/s`,
    );
    assert.equal(
      solverAwareC.contacts,
      0,
      `C must have no contact while the obstacle is 4 mm before visible rubber at ${speed} m/s`,
    );
    assert.ok(
      Math.abs(solverAwareC.velocity.x - speed) < 1e-6,
      `C changed forward speed before visible contact at ${speed} m/s: ${solverAwareC.velocity.x}`,
    );
    assert.ok(
      Math.abs(solverAwareC.position.x - solverAwareC.freeFlightX) < 1e-6,
      `C lost free-flight travel before visible contact at ${speed} m/s`,
    );
    assert.ok(
      falsifiedB.velocity.x < solverAwareC.velocity.x - 0.25,
      `B/C pre-contact response contrast disappeared at ${speed} m/s`,
    );
  }
});

test("solver-aware C still responds immediately after the visible tread reaches the obstacle", async () => {
  const b3 = await loadMode5Box3DModule();
  const justInsideVisibleRubber = -0.002;
  const result = runImpact(
    b3,
    MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
    justInsideVisibleRubber,
    1,
  );

  assert.ok(result.contacts > 0, "C must not become a no-contact undersized wheel");
  assert.ok(
    result.velocity.x < 0.5,
    `C should materially respond after visible tread contact, got ${result.velocity.x} m/s`,
  );
});
