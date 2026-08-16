import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  validatePinnedNativeFactoryReceiptText,
} from "../.test-dist/config/native-factory-receipt.js";
import {
  m6CornerOffset,
  m6FrontLeftSourceRegisteredHardpoints,
} from "../.test-dist/vehicle/m6/m6-geometry.js";
import {
  buildLegacyM6FrontLeftNeutralGeometryReceipt,
  projectLegacyM6FrontLeftWishboneNeutral,
} from "../.test-dist/vehicle/m6/m6-neutral-geometry.js";
import {
  m6TopologyConfigFromReceipt,
} from "../.test-dist/vehicle/m6/m6-topology-config.js";
import {
  JV_RIG_SPACE_V1,
  serializeJvNeutralGeometryReceiptV1,
} from "../.test-dist/vehicle/neutral-mechanism.js";

const factoryReceiptPath = new URL(
  "../public/receipts/jv_m6_factory_receipt.json",
  import.meta.url,
);
const snapshot = await validatePinnedNativeFactoryReceiptText(
  await readFile(factoryReceiptPath, "utf8"),
);
const config = m6TopologyConfigFromReceipt(snapshot);

function close(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual} != ${expected} (tol ${tolerance})`,
  );
}

function closePoint(actual, expected, tolerance, label) {
  close(actual.x, expected.x, tolerance, `${label}.x`);
  close(actual.y, expected.y, tolerance, `${label}.y`);
  close(actual.z, expected.z, tolerance, `${label}.z`);
}

function midpoint(a, b) {
  return {
    x: 0.5 * (a.x + b.x),
    y: 0.5 * (a.y + b.y),
    z: 0.5 * (a.z + b.z),
  };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function body(mechanism, id) {
  const value = mechanism.bodies.find((candidate) => candidate.id === id);
  assert.ok(value, `missing body ${id}`);
  return value;
}

function frame(mechanism, id) {
  const value = mechanism.frames.find((candidate) => candidate.id === id);
  assert.ok(value, `missing frame ${id}`);
  return value;
}

function frameNeutralWorldPosition(mechanism, id) {
  const value = frame(mechanism, id);
  const owner = body(mechanism, value.ownerBody);
  assert.deepEqual(owner.neutralPose.rotation, { x: 0, y: 0, z: 0, w: 1 });
  return add(owner.neutralPose.position, value.localPosition);
}

test("JV neutral mechanism v1 exposes one explicit engine-neutral rig space and coherent FL wishbone", () => {
  assert.deepEqual(JV_RIG_SPACE_V1, {
    id: "jv-rig-space/v1",
    units: "metres",
    handedness: "right",
    forwardAxis: "+X",
    upAxis: "+Y",
    rightAxis: "+Z",
    root: "neutral-chassis-body-origin",
  });

  const mechanism = projectLegacyM6FrontLeftWishboneNeutral(config);
  assert.equal(mechanism.schema, "jv-neutral-mechanism/v1");
  assert.equal(
    mechanism.mechanismId,
    "m6.front-left.double-wishbone.legacy-procedural",
  );
  assert.equal(mechanism.coordinateSpace, JV_RIG_SPACE_V1);
  assert.deepEqual(
    mechanism.bodies.map((value) => value.id),
    [
      "m6.chassis-reference",
      "m6.fl.upper-arm",
      "m6.fl.lower-arm",
      "m6.fl.carrier-reference",
    ],
  );
  assert.equal(mechanism.frames.length, 8);
  assert.deepEqual(
    mechanism.relations.map(({ id, type }) => ({ id, type })),
    [
      { id: "m6.fl.upper-inboard", type: "revolute" },
      { id: "m6.fl.lower-inboard", type: "revolute" },
      { id: "m6.fl.upper-outboard", type: "spherical" },
      { id: "m6.fl.lower-outboard", type: "spherical" },
    ],
  );
});

test("legacy neutral projection is geometrically equivalent to the current FL suspension input", () => {
  const rest = m6CornerOffset(config, 0);
  const current = m6FrontLeftSourceRegisteredHardpoints(config, rest);
  const mechanism = projectLegacyM6FrontLeftWishboneNeutral(config);

  const upperHinge = midpoint(
    current.upperFrontChassis,
    current.upperRearChassis,
  );
  const lowerHinge = midpoint(
    current.lowerFrontChassis,
    current.lowerRearChassis,
  );

  closePoint(
    body(mechanism, "m6.fl.carrier-reference").neutralPose.position,
    rest,
    1e-12,
    "carrier neutral origin",
  );
  closePoint(
    body(mechanism, "m6.fl.upper-arm").neutralPose.position,
    upperHinge,
    1e-12,
    "upper arm neutral origin",
  );
  closePoint(
    body(mechanism, "m6.fl.lower-arm").neutralPose.position,
    lowerHinge,
    1e-12,
    "lower arm neutral origin",
  );

  closePoint(
    frameNeutralWorldPosition(mechanism, "m6.fl.upper-inboard.chassis"),
    upperHinge,
    1e-12,
    "upper inboard chassis frame",
  );
  closePoint(
    frameNeutralWorldPosition(mechanism, "m6.fl.upper-inboard.arm"),
    upperHinge,
    1e-12,
    "upper inboard arm frame",
  );
  closePoint(
    frameNeutralWorldPosition(mechanism, "m6.fl.lower-inboard.chassis"),
    lowerHinge,
    1e-12,
    "lower inboard chassis frame",
  );
  closePoint(
    frameNeutralWorldPosition(mechanism, "m6.fl.lower-inboard.arm"),
    lowerHinge,
    1e-12,
    "lower inboard arm frame",
  );

  closePoint(
    frameNeutralWorldPosition(mechanism, "m6.fl.upper-outboard.arm"),
    current.upperBallJoint,
    1e-12,
    "upper outboard arm anchor",
  );
  closePoint(
    frameNeutralWorldPosition(mechanism, "m6.fl.upper-outboard.carrier"),
    current.upperBallJoint,
    1e-12,
    "upper outboard carrier anchor",
  );
  closePoint(
    frameNeutralWorldPosition(mechanism, "m6.fl.lower-outboard.arm"),
    current.lowerBallJoint,
    1e-12,
    "lower outboard arm anchor",
  );
  closePoint(
    frameNeutralWorldPosition(mechanism, "m6.fl.lower-outboard.carrier"),
    current.lowerBallJoint,
    1e-12,
    "lower outboard carrier anchor",
  );

  for (const id of [
    "m6.fl.upper-inboard.chassis",
    "m6.fl.upper-inboard.arm",
    "m6.fl.lower-inboard.chassis",
    "m6.fl.lower-inboard.arm",
  ]) {
    assert.deepEqual(frame(mechanism, id).primaryAxisLocal, { x: 1, y: 0, z: 0 });
  }

  closePoint(rest, { x: 1.25, y: -0.55, z: -1.05 }, 1e-12, "accepted FL rest");
  closePoint(
    current.upperBallJoint,
    {
      x: 1.2342520405653337,
      y: -0.37000000000000005,
      z: -0.8878987790374773,
    },
    1e-12,
    "accepted legacy upper ball",
  );
  closePoint(
    current.lowerBallJoint,
    {
      x: 1.2657479594346663,
      y: -0.73,
      z: -0.9321012209625229,
    },
    1e-12,
    "accepted legacy lower ball",
  );
});

test("neutral geometry receipt excludes Box3D identity and vehicle dynamics policy", () => {
  const receipt = buildLegacyM6FrontLeftNeutralGeometryReceipt(config);
  assert.equal(receipt.format, "jv-neutral-geometry-receipt/v1");
  assert.deepEqual(receipt.source, {
    kind: "legacy-procedural-m6",
    configReceiptPath: "public/receipts/jv_m6_factory_receipt.json",
  });

  const text = JSON.stringify(receipt);
  for (const forbidden of [
    "Box3D",
    "b3Body",
    "b3Joint",
    "mass",
    "density",
    "friction",
    "damping",
    "hertz",
    "motor",
    "solver",
    "steering",
  ]) {
    assert.equal(
      text.toLowerCase().includes(forbidden.toLowerCase()),
      false,
      `neutral receipt leaked ${forbidden}`,
    );
  }
});

test("neutral geometry receipt serialization is deterministic and round-trips exact logical content", () => {
  const receipt = buildLegacyM6FrontLeftNeutralGeometryReceipt(config);
  const first = serializeJvNeutralGeometryReceiptV1(receipt);
  const second = serializeJvNeutralGeometryReceiptV1(
    buildLegacyM6FrontLeftNeutralGeometryReceipt(config),
  );

  assert.equal(first, second);
  assert.ok(first.endsWith("\n"));
  assert.deepEqual(JSON.parse(first), receipt);
});
