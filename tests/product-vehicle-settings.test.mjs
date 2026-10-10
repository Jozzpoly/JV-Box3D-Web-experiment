import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_JV_PRODUCT_VEHICLE_SETTINGS,
  formatJvMultiplier,
  getJvProductVehicleSettings,
  initializeJvProductVehicleSettings,
  setJvVehicleBrake,
  setJvVehiclePower,
} from "../.test-dist/product-vehicle-settings.js";
import { getM6DriveTuning, resetM6DriveTuning } from "../.test-dist/vehicle/m6/m6-drive-tuning.js";

function memoryStorage() {
  const map = new Map();
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v), map };
}

test("vehicle settings default to the JV-Web power profile and apply live", () => {
  try {
    const settings = initializeJvProductVehicleSettings(null);
    assert.deepEqual(settings, { power: 1.5, brake: 1 });
    assert.deepEqual(getM6DriveTuning(), { torqueScale: 1.5, brakeScale: 1 });
    setJvVehiclePower(2);
    setJvVehicleBrake(1.3);
    assert.deepEqual(getM6DriveTuning(), { torqueScale: 2, brakeScale: 1.3 });
  } finally {
    resetM6DriveTuning();
  }
});

test("vehicle settings survive a reload in the same session and reject bad data", () => {
  try {
    const storage = memoryStorage();
    initializeJvProductVehicleSettings(storage);
    setJvVehiclePower(1.25);
    assert.deepEqual(initializeJvProductVehicleSettings(storage), { power: 1.25, brake: 1 });
    storage.setItem("jv.product.vehicle.v1", JSON.stringify({ schema: "JV_PRODUCT_VEHICLE_SETTINGS_V1", power: 9, brake: 1 }));
    assert.deepEqual(initializeJvProductVehicleSettings(storage), DEFAULT_JV_PRODUCT_VEHICLE_SETTINGS);
    storage.setItem("jv.product.vehicle.v1", "{not json");
    assert.deepEqual(initializeJvProductVehicleSettings(storage), DEFAULT_JV_PRODUCT_VEHICLE_SETTINGS);
    assert.throws(() => setJvVehiclePower(7), /Unsupported power/);
    const throwing = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
    assert.deepEqual(initializeJvProductVehicleSettings(throwing), DEFAULT_JV_PRODUCT_VEHICLE_SETTINGS);
    setJvVehiclePower(2);
    assert.equal(getJvProductVehicleSettings().power, 2);
  } finally {
    resetM6DriveTuning();
  }
});

test("multipliers use the Polish decimal comma", () => {
  assert.equal(formatJvMultiplier(1.5), "1,5×");
  assert.equal(formatJvMultiplier(2), "2×");
});
