import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import { projectLegacyM6FrontLeftWishboneNeutral } from "../.test-dist/vehicle/m6/m6-neutral-geometry.js";
import { m6TopologyConfigFromReceipt } from "../.test-dist/vehicle/m6/m6-topology-config.js";

const receiptUrl = new URL(
  "../public/receipts/jv_m6_factory_receipt.json",
  import.meta.url,
);
const snapshot = await validatePinnedNativeFactoryReceiptText(
  await readFile(receiptUrl, "utf8"),
);
const config = m6TopologyConfigFromReceipt(snapshot);

function assertUniqueIds(values, label) {
  const ids = values.map((value) => value.id);
  assert.equal(new Set(ids).size, ids.length, `${label} ids must be unique`);
}

function assertFiniteVec3(value, label) {
  for (const axis of ["x", "y", "z"]) {
    assert.equal(Number.isFinite(value[axis]), true, `${label}.${axis} must be finite`);
  }
}

function rotateVec3ByUnitQuaternion(value, rotation) {
  const tx = 2 * (rotation.y * value.z - rotation.z * value.y);
  const ty = 2 * (rotation.z * value.x - rotation.x * value.z);
  const tz = 2 * (rotation.x * value.y - rotation.y * value.x);
  return {
    x: value.x + rotation.w * tx + (rotation.y * tz - rotation.z * ty),
    y: value.y + rotation.w * ty + (rotation.z * tx - rotation.x * tz),
    z: value.z + rotation.w * tz + (rotation.x * ty - rotation.y * tx),
  };
}

function ownerBody(mechanism, frame) {
  const owner = mechanism.bodies.find((body) => body.id === frame.ownerBody);
  assert.ok(owner, `missing owner body ${frame.ownerBody}`);
  return owner;
}

function worldFramePosition(mechanism, frame) {
  const owner = ownerBody(mechanism, frame);
  const rotatedLocal = rotateVec3ByUnitQuaternion(
    frame.localPosition,
    owner.neutralPose.rotation,
  );
  return {
    x: owner.neutralPose.position.x + rotatedLocal.x,
    y: owner.neutralPose.position.y + rotatedLocal.y,
    z: owner.neutralPose.position.z + rotatedLocal.z,
  };
}

function worldFrameAxis(mechanism, frame) {
  assert.ok(frame.primaryAxisLocal, `${frame.id} requires primaryAxisLocal`);
  return rotateVec3ByUnitQuaternion(
    frame.primaryAxisLocal,
    ownerBody(mechanism, frame).neutralPose.rotation,
  );
}

function assertCoincident(a, b, label) {
  for (const axis of ["x", "y", "z"]) {
    assert.ok(
      Math.abs(a[axis] - b[axis]) <= 1e-12,
      `${label}.${axis}: ${a[axis]} != ${b[axis]}`,
    );
  }
}

function assertColinear(a, b, label) {
  const normA = Math.hypot(a.x, a.y, a.z);
  const normB = Math.hypot(b.x, b.y, b.z);
  assert.ok(normA > 1e-12, `${label} axis A must be non-zero`);
  assert.ok(normB > 1e-12, `${label} axis B must be non-zero`);
  const normalizedDot = Math.abs(
    (a.x * b.x + a.y * b.y + a.z * b.z) / (normA * normB),
  );
  assert.ok(
    Math.abs(normalizedDot - 1) <= 1e-12,
    `${label} world axes must be colinear; |dot|=${normalizedDot}`,
  );
}

test("neutral mechanism graph keeps coherent identities, transforms and relation references", () => {
  const mechanism = projectLegacyM6FrontLeftWishboneNeutral(config);

  assertUniqueIds(mechanism.bodies, "body");
  assertUniqueIds(mechanism.frames, "frame");
  assertUniqueIds(mechanism.relations, "relation");

  const bodyIds = new Set(mechanism.bodies.map((body) => body.id));
  const frameIds = new Set(mechanism.frames.map((frame) => frame.id));

  for (const body of mechanism.bodies) {
    assertFiniteVec3(body.neutralPose.position, `${body.id}.neutralPose.position`);
    const rotation = body.neutralPose.rotation;
    for (const axis of ["x", "y", "z", "w"]) {
      assert.equal(Number.isFinite(rotation[axis]), true, `${body.id}.neutralPose.rotation.${axis} must be finite`);
    }
    const norm = Math.hypot(rotation.x, rotation.y, rotation.z, rotation.w);
    assert.ok(Math.abs(norm - 1) <= 1e-12, `${body.id} neutral quaternion must be unit length`);
  }

  for (const frame of mechanism.frames) {
    assert.equal(bodyIds.has(frame.ownerBody), true, `${frame.id} references missing body ${frame.ownerBody}`);
    assertFiniteVec3(frame.localPosition, `${frame.id}.localPosition`);
    if (frame.primaryAxisLocal !== undefined) {
      assertFiniteVec3(frame.primaryAxisLocal, `${frame.id}.primaryAxisLocal`);
      assert.ok(
        Math.hypot(frame.primaryAxisLocal.x, frame.primaryAxisLocal.y, frame.primaryAxisLocal.z) > 1e-12,
        `${frame.id}.primaryAxisLocal must be non-zero`,
      );
    }
  }

  for (const relation of mechanism.relations) {
    assert.ok(
      relation.type === "revolute" || relation.type === "spherical",
      `${relation.id} has unsupported relation type ${relation.type}`,
    );
    assert.equal(frameIds.has(relation.frameA), true, `${relation.id} references missing frameA ${relation.frameA}`);
    assert.equal(frameIds.has(relation.frameB), true, `${relation.id} references missing frameB ${relation.frameB}`);
    assert.notEqual(relation.frameA, relation.frameB, `${relation.id} must connect two distinct frames`);

    const frameA = mechanism.frames.find((frame) => frame.id === relation.frameA);
    const frameB = mechanism.frames.find((frame) => frame.id === relation.frameB);
    assert.ok(frameA);
    assert.ok(frameB);
    assert.notEqual(
      frameA.ownerBody,
      frameB.ownerBody,
      `${relation.id} must connect frames owned by distinct bodies`,
    );
    assertCoincident(
      worldFramePosition(mechanism, frameA),
      worldFramePosition(mechanism, frameB),
      `${relation.id} neutral endpoints`,
    );

    if (relation.type === "revolute") {
      assertColinear(
        worldFrameAxis(mechanism, frameA),
        worldFrameAxis(mechanism, frameB),
        `${relation.id} revolute`,
      );
    }
  }
});