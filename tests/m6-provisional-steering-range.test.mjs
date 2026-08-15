import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import { m6TopologyConfigFromReceipt } from "../.test-dist/vehicle/m6/m6-topology-config.js";
import {
  JV_WEB_TEMPORARY_DRIVE_FULL_LOCK_DEGREES,
  m6FrontLeftProvisionalSteeringAngleFromRack,
  m6JvWebTemporaryFullLockRadians,
} from "../.test-dist/vehicle/m6/m6-geometry.js";

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(
    new URL("../public/receipts/jv_m6_factory_receipt.json", import.meta.url),
    "utf8",
  ),
);
const config = m6TopologyConfigFromReceipt(receipt);
const toDegrees = (radians) => radians * 180 / Math.PI;

function near(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected}, got ${actual}`,
  );
}

test("JV-Web temporary driving bridge raises the current source range to at least 35 degrees without mutating receipt authority", () => {
  assert.equal(config.maxSteeringAngleDegrees, 32);
  assert.equal(JV_WEB_TEMPORARY_DRIVE_FULL_LOCK_DEGREES, 35);
  near(toDegrees(m6JvWebTemporaryFullLockRadians(config)), 35, 1e-9, "product full lock");
});

test("provisional rack bridge maps native full travel to mirrored +/-35 degree wheel lock", () => {
  const left = toDegrees(
    m6FrontLeftProvisionalSteeringAngleFromRack(config, config.rackTravel),
  );
  const right = toDegrees(
    m6FrontLeftProvisionalSteeringAngleFromRack(config, -config.rackTravel),
  );

  near(left, 35, 1e-6, "positive full lock");
  near(right, -35, 1e-6, "negative full lock");
});

test("provisional rack bridge preserves neutral, clamps beyond travel and retains a smooth middle range", () => {
  near(m6FrontLeftProvisionalSteeringAngleFromRack(config, 0), 0, 1e-12, "neutral");

  const positiveFull = m6FrontLeftProvisionalSteeringAngleFromRack(
    config,
    config.rackTravel,
  );
  const negativeFull = m6FrontLeftProvisionalSteeringAngleFromRack(
    config,
    -config.rackTravel,
  );
  near(
    m6FrontLeftProvisionalSteeringAngleFromRack(config, config.rackTravel * 2),
    positiveFull,
    1e-12,
    "positive clamp",
  );
  near(
    m6FrontLeftProvisionalSteeringAngleFromRack(config, -config.rackTravel * 2),
    negativeFull,
    1e-12,
    "negative clamp",
  );

  const positiveHalf = toDegrees(
    m6FrontLeftProvisionalSteeringAngleFromRack(config, config.rackTravel * 0.5),
  );
  const negativeHalf = toDegrees(
    m6FrontLeftProvisionalSteeringAngleFromRack(config, -config.rackTravel * 0.5),
  );
  assert.ok(positiveHalf > 16 && positiveHalf < 19, `positive half lock ${positiveHalf}`);
  assert.ok(negativeHalf < -16 && negativeHalf > -19, `negative half lock ${negativeHalf}`);
});
