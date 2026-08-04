import test from "node:test";
import assert from "node:assert/strict";
import { F4VehicleHost } from "../.test-dist/app/f4-vehicle-host.js";

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

test("F4 host exposes the explicit non-authoritative runtime backend", async () => {
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

  assert.deepEqual(host.backend, {
    id: "legacy_ts_m6",
    displayName: "Legacy TypeScript M6 reference fixture",
    productPhysicsAuthority: false,
    nativeParity: "NOT_PROVEN",
    commandContractVersion: 1,
    traceContractVersion: 1,
  });

  host.dispose();
});
