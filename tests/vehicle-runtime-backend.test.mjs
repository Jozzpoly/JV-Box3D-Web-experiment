import test from "node:test";
import assert from "node:assert/strict";
import {
  assertVehicleRuntimeBackendDescriptor,
  LEGACY_TS_M6_BACKEND as RUNTIME_LEGACY_BACKEND,
} from "../.test-dist/runtime/vehicle-runtime-backend.js";
import { LEGACY_TS_M6_BACKEND as M6_LEGACY_BACKEND } from "../.test-dist/vehicle/m6/legacy-ts-m6-backend.js";

test("runtime and M6 imports expose one frozen legacy backend descriptor", () => {
  assert.equal(RUNTIME_LEGACY_BACKEND, M6_LEGACY_BACKEND);
  assert.equal(Object.isFrozen(RUNTIME_LEGACY_BACKEND), true);
  assert.equal(RUNTIME_LEGACY_BACKEND.id, "legacy_ts_m6");
  assert.equal(
    RUNTIME_LEGACY_BACKEND.displayName,
    "Legacy TypeScript M6 reference fixture",
  );
  assert.equal(RUNTIME_LEGACY_BACKEND.role, "REFERENCE_BROWSER_FIXTURE");
  assert.equal(RUNTIME_LEGACY_BACKEND.productPhysicsAuthority, false);
  assert.equal(RUNTIME_LEGACY_BACKEND.nativeParity, "NOT_PROVEN");
  assert.equal(RUNTIME_LEGACY_BACKEND.commandContractVersion, 1);
  assert.equal(RUNTIME_LEGACY_BACKEND.traceContractVersion, 1);
  assert.equal(RUNTIME_LEGACY_BACKEND.visualFrameContractVersion, 1);
  assert.doesNotThrow(() =>
    assertVehicleRuntimeBackendDescriptor(RUNTIME_LEGACY_BACKEND),
  );
});

test("legacy runtime cannot elevate itself to product authority", () => {
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...RUNTIME_LEGACY_BACKEND,
        productPhysicsAuthority: true,
      }),
    /cannot claim product physics authority/,
  );
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...RUNTIME_LEGACY_BACKEND,
        nativeParity: "PROVEN",
      }),
    /cannot claim product physics authority/,
  );
});

test("unknown command, trace and visual contracts fail closed", () => {
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...RUNTIME_LEGACY_BACKEND,
        commandContractVersion: 2,
      }),
    /command contract version/,
  );
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...RUNTIME_LEGACY_BACKEND,
        traceContractVersion: 2,
      }),
    /trace contract version/,
  );
  assert.throws(
    () =>
      assertVehicleRuntimeBackendDescriptor({
        ...RUNTIME_LEGACY_BACKEND,
        visualFrameContractVersion: 2,
      }),
    /visual frame contract version/,
  );
});
