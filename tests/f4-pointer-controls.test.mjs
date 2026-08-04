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

function pointerTarget() {
  return {
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return true;
    },
    setPointerCapture() {},
    releasePointerCapture() {},
    hasPointerCapture() {
      return false;
    },
  };
}

test("vehicle host forwards pointer controls and state callback unchanged", async () => {
  const pointerControls = {
    steerLeft: pointerTarget(),
    steerRight: pointerTarget(),
    forward: pointerTarget(),
    reverse: pointerTarget(),
    brake: pointerTarget(),
  };
  const onPointerControlStateChange = () => {};
  let browserOptions = null;
  let browserDisposals = 0;
  let worldDisposals = 0;

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
      pointerControls,
      onPointerControlStateChange,
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
              worldDisposals += 1;
              return {
                disposed: true,
                worldValidAfterDestroy: false,
              };
            },
          };
        },
      }),
      startBrowserHost(options) {
        browserOptions = options;
        return {
          dispose() {
            browserDisposals += 1;
          },
        };
      },
    },
  );

  assert.equal(browserOptions.pointerControls, pointerControls);
  assert.equal(
    browserOptions.onPointerControlStateChange,
    onPointerControlStateChange,
  );

  host.dispose();
  assert.equal(browserDisposals, 1);
  assert.equal(worldDisposals, 1);
});
