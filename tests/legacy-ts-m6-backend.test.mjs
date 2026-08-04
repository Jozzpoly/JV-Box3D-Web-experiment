import test from "node:test";
import assert from "node:assert/strict";
import {
  LEGACY_TS_M6_BACKEND,
  LEGACY_TS_M6_BACKEND_ID,
  LEGACY_TS_M6_PARITY_STATUS,
} from "../.test-dist/vehicle/m6/legacy-ts-m6-backend.js";

test("legacy TypeScript M6 is explicitly non-authoritative", () => {
  assert.equal(LEGACY_TS_M6_BACKEND_ID, "legacy_ts_m6");
  assert.equal(LEGACY_TS_M6_PARITY_STATUS, "NOT_PROVEN");
  assert.equal(LEGACY_TS_M6_BACKEND.id, LEGACY_TS_M6_BACKEND_ID);
  assert.equal(
    LEGACY_TS_M6_BACKEND.role,
    "REFERENCE_BROWSER_FIXTURE",
  );
  assert.equal(LEGACY_TS_M6_BACKEND.productPhysicsAuthority, false);
  assert.equal(LEGACY_TS_M6_BACKEND.acceptsNewProductPhysics, false);
  assert.equal(LEGACY_TS_M6_BACKEND.nativeParity, "NOT_PROVEN");
  assert.equal(LEGACY_TS_M6_BACKEND.commandContractVersion, 1);
  assert.equal(LEGACY_TS_M6_BACKEND.traceContractVersion, 1);
  assert.equal(LEGACY_TS_M6_BACKEND.visualFrameContractVersion, 1);
  assert.equal(Object.isFrozen(LEGACY_TS_M6_BACKEND), true);
  assert.equal(Object.isFrozen(LEGACY_TS_M6_BACKEND.knownMismatches), true);
});

test("known drive semantic mismatch cannot disappear from the contract silently", () => {
  assert.equal(LEGACY_TS_M6_BACKEND.knownMismatches.length, 1);
  const mismatch = LEGACY_TS_M6_BACKEND.knownMismatches[0];
  assert.equal(mismatch.id, "drive.maxDriveSpeed-semantics");
  assert.match(mismatch.nativeMeaning, /rad\/s/);
  assert.match(mismatch.nativeMeaning, /throttle scales available torque/i);
  assert.match(mismatch.legacyMeaning, /m\/s/);
  assert.match(mismatch.legacyMeaning, /throttle scales target speed/i);
  assert.match(mismatch.consequence, /behaviorally different from native JV/i);
});
