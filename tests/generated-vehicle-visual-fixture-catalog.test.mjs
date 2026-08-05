import test from "node:test";
import assert from "node:assert/strict";
import {
  GENERATED_VEHICLE_VISUAL_FIXTURES,
  GENERATED_VEHICLE_VISUAL_RUNTIME_ASSETS,
  LIT_NORMAL_VEHICLE_VISUAL_FIXTURE,
  TINY_VEHICLE_VISUAL_FIXTURE,
} from "../tools/generated-vehicle-visual-fixture-catalog.mjs";

test("generated vehicle fixture catalog owns unique portable package and asset paths", () => {
  assert.deepEqual(GENERATED_VEHICLE_VISUAL_FIXTURES, [
    TINY_VEHICLE_VISUAL_FIXTURE,
    LIT_NORMAL_VEHICLE_VISUAL_FIXTURE,
  ]);
  assert.equal(
    new Set(GENERATED_VEHICLE_VISUAL_RUNTIME_ASSETS).size,
    GENERATED_VEHICLE_VISUAL_RUNTIME_ASSETS.length,
  );

  for (const fixture of GENERATED_VEHICLE_VISUAL_FIXTURES) {
    assert.equal(
      fixture.packagePath,
      `${fixture.packageDirectory}/vehicle.visual.json`,
    );
    assert.equal(
      fixture.assetPath,
      `${fixture.packageDirectory}/models/${fixture.modelFileName}`,
    );
  }
});

test("tiny and lit-normal fixture identities remain distinct and capability-pinned", () => {
  assert.notEqual(
    TINY_VEHICLE_VISUAL_FIXTURE.id,
    LIT_NORMAL_VEHICLE_VISUAL_FIXTURE.id,
  );
  assert.notEqual(
    TINY_VEHICLE_VISUAL_FIXTURE.packageDirectory,
    LIT_NORMAL_VEHICLE_VISUAL_FIXTURE.packageDirectory,
  );
  assert.equal(
    TINY_VEHICLE_VISUAL_FIXTURE.capabilityId,
    "UNLIT_POSITION_BASE_COLOR_V1",
  );
  assert.equal(
    LIT_NORMAL_VEHICLE_VISUAL_FIXTURE.capabilityId,
    "LIT_NORMAL_BASE_COLOR_V1",
  );
});
