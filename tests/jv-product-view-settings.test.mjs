import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_JV_PRODUCT_VIEW_SETTINGS,
  getJvProductViewSettings,
  replaceJvProductViewSettings,
  setJvGridVisible,
  setJvTextureFilter,
  subscribeJvProductViewSettings,
} from "../.test-dist/render/jv-product-view-settings.js";

function reset() {
  replaceJvProductViewSettings(DEFAULT_JV_PRODUCT_VIEW_SETTINGS);
}

test("product view settings default to native nearest filtering and no grid", () => {
  reset();
  assert.deepEqual(getJvProductViewSettings(), {
    textureFilter: "nearest",
    gridVisible: false,
  });
  assert.equal(Object.isFrozen(getJvProductViewSettings()), true);
});

test("view settings publish live texture and grid changes without duplicate events", () => {
  reset();
  const observed = [];
  const unsubscribe = subscribeJvProductViewSettings((settings) => {
    observed.push(settings);
  });
  try {
    setJvTextureFilter("linear");
    setJvTextureFilter("linear");
    setJvGridVisible(true);
    assert.deepEqual(observed, [
      { textureFilter: "nearest", gridVisible: false },
      { textureFilter: "linear", gridVisible: false },
      { textureFilter: "linear", gridVisible: true },
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
    }),
    /nearest or linear/,
  );
  assert.deepEqual(getJvProductViewSettings(), {
    textureFilter: "nearest",
    gridVisible: false,
  });
});
