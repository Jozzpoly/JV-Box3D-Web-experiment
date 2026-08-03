import test from "node:test";
import assert from "node:assert/strict";
import {
  Box3DBoundary,
  BOX3D_RUNTIME_IDENTITY,
} from "../.test-dist/physics/box3d-boundary.js";
import { multiplyQuat } from "../.test-dist/physics/native-inline-compat.js";

test("B0-B5 are reported separately and a real contact fixture passes all levels", async () => {
  const boundary = await Box3DBoundary.load();
  assert.equal(boundary.receipt.identity, BOX3D_RUNTIME_IDENTITY);
  assert.deepEqual(boundary.receipt.engineVersion, { major: 0, minor: 1, revision: 0 });
  for (const id of ["B0", "B1", "B2", "B4"]) {
    assert.equal(boundary.validationLevels.find((level) => level.id === id)?.status, "PASS");
  }
  assert.equal(boundary.validationLevels.find((level) => level.id === "B3")?.status, "PENDING");
  assert.equal(boundary.validationLevels.find((level) => level.id === "B5")?.status, "PENDING");

  const fixture = boundary.createMinimalContactFixture();
  try {
    const initial = fixture.snapshot;
    assert.equal(initial.counters.bodyCount, 2);
    assert.equal(initial.counters.shapeCount, 2);
    assert.equal(initial.activeContacts, 0);
    assert.equal(initial.filterRoundTrip.categoryBits, 0x0123_4567_89ab_cdefn);
    assert.equal(initial.filterRoundTrip.maskBits, 0x0fed_cba9_8765_4321n);
    assert.equal(initial.filterRoundTrip.groupIndex, -37);
    assert.equal(initial.materialRoundTrip.userMaterialId, 0x1_2345_6789n);
    assert.equal(initial.customMassRoundTrip.mass, 7.25);
    assert.deepEqual(initial.customMassRoundTrip.center, {
      x: 0.125,
      y: -0.25,
      z: 0.375,
    });
    assert.deepEqual(initial.customMassRoundTrip.inertiaDiagonal, { x: 2, y: 3, z: 4 });

    const firstContact = fixture.runUntilContact(240);
    assert.ok(firstContact.contactBeginEvents >= 1);
    assert.ok(firstContact.activeContacts >= 1);
    assert.ok(firstContact.activeManifolds >= 1);
    assert.ok(firstContact.activeContactPoints >= 1);
    assert.ok(
      firstContact.points.every(
        (point) => Number.isFinite(point.separation) && Number.isFinite(point.totalNormalImpulse),
      ),
    );

    const settled = fixture.step(120);
    assert.ok(Math.abs(settled.bodyPosition.y - 0.5) < 0.01);
    for (const id of ["B0", "B1", "B2", "B3", "B4", "B5"]) {
      const level = fixture.validationLevels().find((candidate) => candidate.id === id);
      assert.equal(level?.status, "PASS", `${id}: ${JSON.stringify(level)}`);
    }
  } finally {
    assert.deepEqual(fixture.dispose(), {
      disposed: true,
      worldValidAfterDestroy: false,
    });
    assert.deepEqual(fixture.dispose(), {
      disposed: true,
      worldValidAfterDestroy: false,
    });
  }
  assert.throws(() => fixture.step(), /disposed/);
});

test("fixture ownership survives destroy and rebuild cycles", async () => {
  const boundary = await Box3DBoundary.load();
  for (let cycle = 0; cycle < 3; cycle += 1) {
    const fixture = boundary.createMinimalContactFixture();
    fixture.runUntilContact();
    fixture.dispose();
    assert.throws(() => fixture.snapshot, /disposed/);
  }
});

test("native inline quaternion shim preserves Hamilton product identity", () => {
  const sample = { v: { x: 0.2, y: -0.3, z: 0.4 }, s: 0.5 };
  assert.deepEqual(
    multiplyQuat({ v: { x: 0, y: 0, z: 0 }, s: 1 }, sample),
    sample,
  );
});
