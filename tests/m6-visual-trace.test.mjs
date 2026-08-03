import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Box3D from "box3d.js/inline";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
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

const b3 = await Box3D();
const receiptText = await readFile(receiptPath, "utf8");
const receipt = await validatePinnedNativeFactoryReceiptText(receiptText);

test("real M6 trace exposes renderer-safe physical transforms", () => {
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
    });
  } finally {
    world.dispose();
  }
});
