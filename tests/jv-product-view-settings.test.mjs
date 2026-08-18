import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_JV_PRODUCT_VIEW_SETTINGS,
  getJvProductViewSettings,
  replaceJvProductViewSettings,
  setJvGridVisible,
  setJvSteeringPlateVisible,
  setJvTextureFilter,
  subscribeJvProductViewSettings,
} from "../.test-dist/render/jv-product-view-settings.js";

function reset() {
  replaceJvProductViewSettings(DEFAULT_JV_PRODUCT_VIEW_SETTINGS);
}

test("product view settings default to native nearest filtering, no grid and no steering plate", () => {
  reset();
  assert.deepEqual(getJvProductViewSettings(), {
    textureFilter: "nearest",
    gridVisible: false,
    steeringPlateVisible: false,
  });
  assert.equal(Object.isFrozen(getJvProductViewSettings()), true);
});

test("view settings publish live texture, grid and steering plate changes without duplicate events", () => {
  reset();
  const observed = [];
  const unsubscribe = subscribeJvProductViewSettings((settings) => {
    observed.push(settings);
  });
  try {
    setJvTextureFilter("linear");
    setJvTextureFilter("linear");
    setJvGridVisible(true);
    setJvSteeringPlateVisible(true);
    setJvSteeringPlateVisible(true);
    setJvSteeringPlateVisible(false);
    assert.deepEqual(observed, [
      { textureFilter: "nearest", gridVisible: false, steeringPlateVisible: false },
      { textureFilter: "linear", gridVisible: false, steeringPlateVisible: false },
      { textureFilter: "linear", gridVisible: true, steeringPlateVisible: false },
      { textureFilter: "linear", gridVisible: true, steeringPlateVisible: true },
      { textureFilter: "linear", gridVisible: true, steeringPlateVisible: false },
    ]);
    assert.ok(observed.every((settings) => Object.isFrozen(settings)));
  } finally {
    unsubscribe();
    reset();
  }
});

test("invalid texture filtering fails closed", () => {
  reset();
  assert.throws(
    () => replaceJvProductViewSettings({
      textureFilter: "mipmap",
      gridVisible: false,
      steeringPlateVisible: false,
    }),
    /nearest or linear/,
  );
  assert.deepEqual(getJvProductViewSettings(), {
    textureFilter: "nearest",
    gridVisible: false,
    steeringPlateVisible: false,
  });
});

test("invalid steering plate visibility fails closed", () => {
  reset();
  assert.throws(
    () => replaceJvProductViewSettings({
      textureFilter: "nearest",
      gridVisible: false,
      steeringPlateVisible: "yes",
    }),
    /steering plate visibility must be boolean/,
  );
  assert.deepEqual(getJvProductViewSettings(), DEFAULT_JV_PRODUCT_VIEW_SETTINGS);
});
