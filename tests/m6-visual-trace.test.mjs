import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Box3D from "box3d.js/inline";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import { indexVehicleVisualFrameV1 } from "../.test-dist/runtime/vehicle-visual-frame.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
  assertM6VisualFrameCoverage,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import { M6TopologyWorld } from "../.test-dist/vehicle/m6/m6-topology-world.js";

const receiptPath = new URL(
  "../public/receipts/jv_m6_factory_receipt.json",
  import.meta.url,
);

function assertFiniteVector(value, label) {
  for (const axis of ["x", "y", "z"]) {
    assert.equal(
      Number.isFinite(value[axis]),
      true,
      `${label}.${axis} must be finite`,
    );
  }
}

function assertUnitRotation(value, label) {
  for (const axis of ["x", "y", "z", "w"]) {
    assert.equal(
      Number.isFinite(value[axis]),
      true,
      `${label}.${axis} must be finite`,
    );
  }
  const length = Math.hypot(value.x, value.y, value.z, value.w);
  assert.ok(
    Math.abs(length - 1) < 1e-4,
    `${label} must stay normalized; length=${length}`,
  );
}

function assertVectorNear(actual, expected, tolerance, label) {
  for (const axis of ["x", "y", "z"]) {
    assert.ok(
      Math.abs(actual[axis] - expected[axis]) <= tolerance,
      `${label}.${axis}: ${actual[axis]} != ${expected[axis]}`,
    );
  }
}

function assertRotationNear(actual, expected, tolerance, label) {
  const direct = Math.hypot(
    actual.x - expected.x,
    actual.y - expected.y,
    actual.z - expected.z,
    actual.w - expected.w,
  );
  const negated = Math.hypot(
    actual.x + expected.x,
    actual.y + expected.y,
    actual.z + expected.z,
    actual.w + expected.w,
  );
  assert.ok(
    Math.min(direct, negated) <= tolerance,
    `${label} quaternion differs from the physical trace`,
  );
}

const b3 = await Box3D();
const receiptText = await readFile(receiptPath, "utf8");
const receipt = await validatePinnedNativeFactoryReceiptText(receiptText);

test("real M6 trace exposes a complete renderer-safe rigid-part rig", () => {
  const world = new M6TopologyWorld(b3, receipt);
  try {
    const vehicle = world.createVehicle(
      { x: 0, y: 1.2, z: 0 },
      11,
    );
    world.step(180);
    const trace = vehicle.lastTrace;
    assert.ok(trace !== null);

    assert.equal(trace.generation, 11);
    assertFiniteVector(trace.chassisPosition, "chassisPosition");
    assertUnitRotation(trace.chassisRotation, "chassisRotation");
    assertFiniteVector(trace.rackPosition, "rackPosition");
    assertUnitRotation(trace.rackRotation, "rackRotation");

    assert.ok(trace.visualGeometry.chassisHalfExtents.x > 0);
    assert.ok(trace.visualGeometry.chassisHalfExtents.y > 0);
    assert.ok(trace.visualGeometry.chassisHalfExtents.z > 0);
    assert.ok(trace.visualGeometry.wheelRadius > 0);
    assert.ok(trace.visualGeometry.wheelWidth > 0);
    assert.ok(trace.visualGeometry.rackHalfWidth > 0);

    assertM6VisualFrameCoverage(trace.visualFrame);
    assert.equal(trace.visualFrame.generation, trace.generation);
    assert.equal(trace.visualFrame.stepIndex, trace.stepIndex);
    assert.deepEqual(
      trace.visualFrame.parts.map((part) => part.partId),
      [...M6_VISUAL_PART_IDS],
    );
    assert.deepEqual(
      trace.visualFrame.segments.map((segment) => segment.segmentId),
      [...M6_VISUAL_SEGMENT_IDS],
    );

    const visual = indexVehicleVisualFrameV1(trace.visualFrame);
    const chassis = visual.parts.get("m6.chassis");
    const rack = visual.parts.get("m6.rack");
    assert.ok(chassis !== undefined);
    assert.ok(rack !== undefined);
    assertVectorNear(
      chassis.transform.position,
      trace.chassisPosition,
      1e-8,
      "visual chassis position",
    );
    assertRotationNear(
      chassis.transform.rotation,
      trace.chassisRotation,
      1e-8,
      "visual chassis rotation",
    );
    assertVectorNear(
      rack.transform.position,
      trace.rackPosition,
      1e-8,
      "visual rack position",
    );
    assertRotationNear(
      rack.transform.rotation,
      trace.rackRotation,
      1e-8,
      "visual rack rotation",
    );

    assert.equal(trace.corners.length, 4);
    trace.corners.forEach((corner, index) => {
      assertFiniteVector(
        corner.wheelPosition,
        `corners[${index}].wheelPosition`,
      );
      assertUnitRotation(
        corner.wheelRotation,
        `corners[${index}].wheelRotation`,
      );
      const cornerId = ["fl", "fr", "rl", "rr"][index];
      const wheel = visual.parts.get(`m6.${cornerId}.wheel`);
      const coilover = visual.segments.get(`m6.${cornerId}.coilover`);
      assert.ok(wheel !== undefined);
      assert.ok(coilover !== undefined);
      assertVectorNear(
        wheel.transform.position,
        corner.wheelPosition,
        1e-8,
        `${cornerId} wheel position`,
      );
      assertRotationNear(
        wheel.transform.rotation,
        corner.wheelRotation,
        1e-8,
        `${cornerId} wheel rotation`,
      );
      assert.ok(
        Math.abs(coilover.lengthMeters - corner.coiloverLength) < 1e-5,
        `${cornerId} coilover endpoints must match the physical distance joint`,
      );
    });

    const serialized = JSON.stringify(trace.visualFrame);
    assert.equal(serialized.includes("bodyId"), false);
    assert.equal(serialized.includes("jointId"), false);
  } finally {
    world.dispose();
  }
});

test("visual rig transforms follow real steering, wheel spin and chassis motion", () => {
  const world = new M6TopologyWorld(b3, receipt);
  try {
    const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 12);
    world.step(180);
    const before = vehicle.lastTrace;
    assert.ok(before !== null);

    vehicle.setSteering({ mode: "RATE", value: 1 });
    vehicle.setDrive({ throttle: 0.25, brake: 0 });
    world.step(90);
    const after = vehicle.lastTrace;
    assert.ok(after !== null);

    const beforeVisual = indexVehicleVisualFrameV1(before.visualFrame);
    const afterVisual = indexVehicleVisualFrameV1(after.visualFrame);
    const beforeChassis = beforeVisual.parts.get("m6.chassis");
    const afterChassis = afterVisual.parts.get("m6.chassis");
    const beforeFrontWheel = beforeVisual.parts.get("m6.fl.wheel");
    const afterFrontWheel = afterVisual.parts.get("m6.fl.wheel");
    const beforeRack = beforeVisual.parts.get("m6.rack");
    const afterRack = afterVisual.parts.get("m6.rack");
    assert.ok(beforeChassis && afterChassis);
    assert.ok(beforeFrontWheel && afterFrontWheel);
    assert.ok(beforeRack && afterRack);

    const chassisTravel = Math.hypot(
      afterChassis.transform.position.x - beforeChassis.transform.position.x,
      afterChassis.transform.position.z - beforeChassis.transform.position.z,
    );
    assert.ok(chassisTravel > 0.05, `expected chassis travel, got ${chassisTravel}`);

    const wheelRotationDelta = Math.min(
      Math.hypot(
        afterFrontWheel.transform.rotation.x - beforeFrontWheel.transform.rotation.x,
        afterFrontWheel.transform.rotation.y - beforeFrontWheel.transform.rotation.y,
        afterFrontWheel.transform.rotation.z - beforeFrontWheel.transform.rotation.z,
        afterFrontWheel.transform.rotation.w - beforeFrontWheel.transform.rotation.w,
      ),
      Math.hypot(
        afterFrontWheel.transform.rotation.x + beforeFrontWheel.transform.rotation.x,
        afterFrontWheel.transform.rotation.y + beforeFrontWheel.transform.rotation.y,
        afterFrontWheel.transform.rotation.z + beforeFrontWheel.transform.rotation.z,
        afterFrontWheel.transform.rotation.w + beforeFrontWheel.transform.rotation.w,
      ),
    );
    assert.ok(wheelRotationDelta > 1e-3);
    assert.ok(
      Math.abs(afterRack.transform.position.z - beforeRack.transform.position.z) >
        1e-4,
    );
  } finally {
    world.dispose();
  }
});
