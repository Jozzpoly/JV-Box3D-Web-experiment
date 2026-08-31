import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_JV_PRODUCT_STEERING_SETTINGS,
  getJvProductSteeringSettings,
  initializeJvProductSteeringSettings,
  setJvSteeringCenteringAssist,
  setJvSteeringWheelRangeDegrees,
} from "../.test-dist/product-steering-settings.js";

class FakeStorage {
  values = new Map();
  getItem(key) {
    return this.values.get(key) ?? null;
  }
  setItem(key, value) {
    this.values.set(key, value);
  }
}

test("steering settings default to 900 degrees with artificial centering disabled", () => {
  initializeJvProductSteeringSettings(null);
  assert.deepEqual(
    getJvProductSteeringSettings(),
    DEFAULT_JV_PRODUCT_STEERING_SETTINGS,
  );
});

test("steering settings persist range and assist in session storage", () => {
  const storage = new FakeStorage();
  initializeJvProductSteeringSettings(storage);
  setJvSteeringWheelRangeDegrees(720);
  setJvSteeringCenteringAssist(true);

  initializeJvProductSteeringSettings(null);
  assert.equal(getJvProductSteeringSettings().wheelRangeDegrees, 900);
  assert.equal(getJvProductSteeringSettings().centeringAssist, false);

  initializeJvProductSteeringSettings(storage);
  assert.equal(getJvProductSteeringSettings().wheelRangeDegrees, 720);
  assert.equal(getJvProductSteeringSettings().centeringAssist, true);
});

test("invalid or stale session payload falls back to product defaults", () => {
  const storage = new FakeStorage();
  storage.setItem(
    "jv.product.steering.v1",
    JSON.stringify({
      schema: "JV_PRODUCT_STEERING_SETTINGS_V1",
      wheelRangeDegrees: 123,
      centeringAssist: true,
    }),
  );
  initializeJvProductSteeringSettings(storage);
  assert.deepEqual(
    getJvProductSteeringSettings(),
    DEFAULT_JV_PRODUCT_STEERING_SETTINGS,
  );
});

test("unsupported steering range is rejected instead of silently clamped", () => {
  initializeJvProductSteeringSettings(null);
  assert.throws(
    () => setJvSteeringWheelRangeDegrees(123),
    /Unsupported JV steering wheel range/,
  );
});
