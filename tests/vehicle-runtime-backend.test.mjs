import test from "node:test";
import assert from "node:assert/strict";
import {
  assertVehicleRuntimeBackendDescriptor,
  LEGACY_TS_M6_BACKEND,
} from "../.test-dist/runtime/vehicle-runtime-backend.js";

test("legacy runtime descriptor is frozen and explicitly non-authoritative", () => {
  assert.equal(Object.isFrozen(LEGACY_TS_M6_BACKEND), true);
  assert.deepEqual(LEGACY_TS_M6_BACKEND, {
    id: "legacy_ts_m6",
    displayName: "Legacy TypeScript M6 reference fixture",
    productPhysicsAuthority: false,
    nativeParity: "NOT_PROVEN",
    commandContractVersion: 1,
    traceContractVersion: 1,
    visualFrameContractVersion: 1,
  });
  assert.doesNotThrow(() =>
    assertVehicleRuntimeBackendDescriptor(LEGACY_TS_M6_BACKEND),
  );
});

test("legacy runtime cannot elevate itself to product authority", () => {
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...LEGACY_TS_M6_BACKEND,
        productPhysicsAuthority: true,
      }),
    /cannot claim product physics authority/,
  );
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...LEGACY_TS_M6_BACKEND,
        nativeParity: "PROVEN",
      }),
    /cannot claim product physics authority/,
  );
});

test("unknown command, trace and visual contracts fail closed", () => {
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...LEGACY_TS_M6_BACKEND,
        commandContractVersion: 2,
      }),
    /command contract version/,
  );
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...LEGACY_TS_M6_BACKEND,
        traceContractVersion: 2,
      }),
    /trace contract version/,
  );
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...LEGACY_TS_M6_BACKEND,
        visualFrameContractVersion: 2,
      }),
    /visual frame contract version/,
  );
});
