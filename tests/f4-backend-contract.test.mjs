import test from "node:test";
import assert from "node:assert/strict";
import { F4VehicleHost } from "../.test-dist/app/f4-vehicle-host.js";
import { LEGACY_TS_M6_BACKEND } from "../.test-dist/runtime/vehicle-runtime-backend.js";

function nativeReceiptStub() {
  return {
    source: { commit: "a".repeat(40) },
    serializedFieldCount: 76,
    config: {},
    derived: {},
    solver: {},
    activeFeatures: {},
    assetResolution: {},
    effectiveFields: [],
    canonicalPayloadSha256: "b".repeat(64),
    raw: {},
  };
}

function box3dReceiptStub() {
  return {
    identity: {
      packageName: "box3d.js",
      packageVersion: "0.0.2",
      packageIntegrity: "fixture",
      packageTarballSha256: "fixture",
      bindingCommit: "fixture",
      engineCommit: "fixture",
      buildVariant: "inline-single-threaded",
    },
    engineVersion: { major: 0, minor: 1, revision: 0 },
    defaultWorld: {},
    requiredExports: [],
    nativeInlineShims: [],
  };
}

test("F4 host exposes the one shared non-authoritative runtime backend", async () => {
  const host = await F4VehicleHost.start(
    {
      now: () => 0,
      animationFrames: {
        request: () => 1,
        cancel() {},
      },
      windowTarget: new EventTarget(),
      documentTarget: new EventTarget(),
      isDocumentHidden: () => false,
      onVehicleStep() {},
    },
    {
      loadReceipt: async () => nativeReceiptStub(),
      loadBoundary: async () => ({
        receipt: box3dReceiptStub(),
        createM6TopologyWorld() {
          return {
            rateProfile: {
              id: "reference_0_21",
              rackRateMetersPerSecond: 0.21,
              maxTargetLeadMeters: 0.008,
            },
            counters: {
              bodyCount: 19,
              shapeCount: 10,
              contactCount: 0,
              jointCount: 29,
            },
            createVehicle() {
              return {
                lastTrace: null,
                setSteering() {},
                setDrive() {},
              };
            },
            step() {
              return [];
            },
            dispose() {
              return {
                disposed: true,
                worldValidAfterDestroy: false,
              };
            },
          };
        },
      }),
      startBrowserHost() {
        return { dispose() {} };
      },
    },
  );

  assert.equal(host.backend, LEGACY_TS_M6_BACKEND);
  assert.equal(Object.isFrozen(host.backend), true);
  assert.equal(host.backend.productPhysicsAuthority, false);
  assert.equal(host.backend.nativeParity, "NOT_PROVEN");
  assert.equal(host.backend.acceptsNewProductPhysics, false);
  assert.equal(host.backend.visualFrameContractVersion, 1);

  host.dispose();
});
