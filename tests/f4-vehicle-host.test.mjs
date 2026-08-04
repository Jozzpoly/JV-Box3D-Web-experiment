import test from "node:test";
import assert from "node:assert/strict";
import { F4VehicleHost } from "../.test-dist/app/f4-vehicle-host.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";

function nativeReceiptStub() {
  return {
    source: {
      repository: "Jozzpoly/Box3d_FunProject",
      branch: "agent/web-factory-receipt",
      commit: "a740dec74f4243679c71a17eb59723ee0b42f8bb",
    },
    serializedFieldCount: 76,
    config: {},
    derived: {
      rackTravel: 0.075,
      steeringDeadPointDegrees: 57.5,
      wheelRadius: 0.514,
      wheelWidth: 0.4375,
      terrainCategoryBitsHex: "0x2",
      minimumTorusSegments: 0,
    },
    solver: {
      gravity: [0, -10, 0],
      fixedDt: 1 / 60,
      substeps: 4,
      contactHertz: 30,
      contactDampingRatio: 10,
      contactSpeed: 3,
      enableContinuous: false,
      workerCount: 0,
    },
    activeFeatures: {
      frontRigType: 1,
      rearRigType: 1,
      wheelEnvelopeMode: 3,
      rackCenteringAssistEnabled: false,
      uprightAssistEnabled: false,
    },
    assetResolution: {
      metadataSourcePath: "fixture",
      metadataStatus: "loaded",
      trailingArmStatus: "loaded",
      fallbackUsed: false,
    },
    effectiveFields: [],
    canonicalPayloadSha256: "a".repeat(64),
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
    defaultWorld: {
      gravityY: -10,
      contactHertz: 30,
      contactDampingRatio: 10,
      contactSpeed: 3,
      enableContinuous: true,
      workerCount: 0,
      internalValue: 1_152_023,
    },
    requiredExports: [],
    nativeInlineShims: [],
  };
}

function visualFrameStub(generation, stepIndex, identity) {
  return {
    contractVersion: 1,
    generation,
    stepIndex,
    parts: M6_VISUAL_PART_IDS.map((partId, index) => ({
      partId,
      transform: {
        position: { x: index, y: 1, z: 0 },
        rotation: identity,
      },
    })),
    segments: M6_VISUAL_SEGMENT_IDS.map((segmentId, index) => ({
      segmentId,
      start: { x: index, y: 0, z: 0 },
      end: { x: index, y: 1, z: 0 },
      lengthMeters: 1,
    })),
  };
}

function traceStub(command = { mode: "RELEASE" }) {
  const identity = { x: 0, y: 0, z: 0, w: 1 };
  return {
    generation: 4,
    stepIndex: 1,
    command,
    steeringActuator:
      command.mode === "POSITION" ? "POSITION" : "OFF",
    steering: {
      profileId: "reference_0_21",
      rackRateMetersPerSecond: 0.21,
      maxTargetLeadMeters: 0.008,
      handsOn: command.mode !== "RELEASE",
      handsOnEdge: "NONE",
      commandedRack: null,
      liveRackTranslation: 0,
      targetError: 0,
      springEnabled: command.mode !== "RELEASE",
      targetTranslation: null,
      requestedMotorSpeed: 0,
      motorForceCap: 0,
      rackFrictionBase: 40,
      rackFrictionLoadTerm: 0,
    },
    drive: {
      command: { throttle: 0.5, brake: 0 },
      mode: "THROTTLE",
      allWheelDrive: true,
      drivenCornerCount: 4,
      forwardSpeedMetersPerSecond: 0,
      targetLinearSpeedMetersPerSecond: 20,
      targetWheelAngularSpeed: -40,
      driveTaper: 1,
      motorTorqueCapPerWheel: 160,
      currentMotorTorqueTotal: 0,
    },
    collisionGroupIndex: -1000,
    wheelBackendId: "legacy_m6_split_sphere_sidewall",
    visualGeometry: {
      chassisHalfExtents: { x: 1.55, y: 0.35, z: 0.55 },
      wheelRadius: 0.514,
      wheelWidth: 0.4375,
      rackHalfWidth: 0.45,
    },
    visualFrame: visualFrameStub(4, 1, identity),
    chassisPosition: { x: 0, y: 1.1, z: 0 },
    chassisRotation: identity,
    chassisVelocity: { x: 0, y: 0, z: 0 },
    chassisAngularVelocity: { x: 0, y: 0, z: 0 },
    rackPosition: { x: 0, y: 0.7, z: 0 },
    rackRotation: identity,
    rackTranslation: 0,
    rackSpeed: 0,
    worldContacts: 4,
    worldContactBegins: 4,
    corners: [],
  };
}

function hostOptions(onVehicleStep = () => {}) {
  return {
    now: () => 0,
    animationFrames: {
      request: () => 1,
      cancel() {},
    },
    windowTarget: new EventTarget(),
    documentTarget: new EventTarget(),
    isDocumentHidden: () => false,
    generation: 4,
    spawn: { x: 1, y: 2, z: 3 },
    onVehicleStep,
  };
}

const RATE_PROFILE = Object.freeze({
  id: "reference_0_21",
  rackRateMetersPerSecond: 0.21,
  maxTargetLeadMeters: 0.008,
});

test("F4 startup validates receipt before creating Box3D world and dual-input browser loop", async () => {
  const order = [];
  let browserOptions = null;
  let browserDisposals = 0;
  let worldDisposals = 0;
  let steeringCommand = null;
  let driveCommand = null;
  let vehicleTrace = null;
  const trace = traceStub({ mode: "POSITION", value: 0.25 });

  const host = await F4VehicleHost.start(
    hostOptions((step, steering, longitudinal, receivedTrace) => {
      order.push(
        `callback:${step.index}:${steering.command.mode}:${longitudinal.command.throttle}`,
      );
      vehicleTrace = receivedTrace;
    }),
    {
      loadReceipt: async () => {
        order.push("receipt");
        return nativeReceiptStub();
      },
      loadBoundary: async () => {
        order.push("boundary");
        return {
          receipt: box3dReceiptStub(),
          createM6TopologyWorld(receipt) {
            order.push(`world:${receipt.serializedFieldCount}`);
            return {
              rateProfile: RATE_PROFILE,
              counters: {
                bodyCount: 19,
                shapeCount: 10,
                contactCount: 4,
                jointCount: 29,
              },
              createVehicle(spawn, generation) {
                order.push(
                  `vehicle:${spawn.x},${spawn.y},${spawn.z}:${generation}`,
                );
                return {
                  lastTrace: trace,
                  setSteering(nextCommand) {
                    steeringCommand = nextCommand;
                    order.push(`steering:${nextCommand.mode}`);
                  },
                  setDrive(nextCommand) {
                    driveCommand = nextCommand;
                    order.push(
                      `drive:${nextCommand.throttle}:${nextCommand.brake}`,
                    );
                  },
                };
              },
              step(stepCount) {
                order.push(`world-step:${stepCount}`);
                return [trace];
              },
              dispose() {
                worldDisposals += 1;
                order.push("world-dispose");
                return {
                  disposed: true,
                  worldValidAfterDestroy: false,
                };
              },
            };
          },
        };
      },
      startBrowserHost(options) {
        order.push("browser");
        browserOptions = options;
        return {
          dispose() {
            browserDisposals += 1;
            order.push("browser-dispose");
          },
        };
      },
    },
  );

  assert.deepEqual(order.slice(0, 5), [
    "receipt",
    "boundary",
    "world:76",
    "vehicle:1,2,3:4",
    "browser",
  ]);
  assert.equal(host.counters.bodyCount, 19);
  assert.equal(host.nativeReceipt.serializedFieldCount, 76);
  assert.equal(host.box3dReceipt.identity.packageVersion, "0.0.2");
  assert.equal(host.rateProfile.id, "reference_0_21");

  browserOptions.onStep(
    { index: 1, startTimeMs: 0, endTimeMs: 1000 / 60 },
    {
      command: { mode: "POSITION", value: 0.25 },
      integratedDirectionMs: 1000 / 60,
    },
    {
      command: { throttle: 0.5, brake: 0 },
      integratedThrottleMs: (1000 / 60) * 0.5,
      integratedBrakeMs: 0,
    },
  );
  assert.deepEqual(steeringCommand, {
    mode: "POSITION",
    value: 0.25,
  });
  assert.deepEqual(driveCommand, { throttle: 0.5, brake: 0 });
  assert.equal(vehicleTrace, trace);
  assert.equal(vehicleTrace.visualFrame.parts.length, 18);
  assert.equal(vehicleTrace.visualFrame.segments.length, 8);
  assert.deepEqual(order.slice(-4), [
    "steering:POSITION",
    "drive:0.5:0",
    "world-step:1",
    "callback:1:POSITION:0.5",
  ]);

  host.dispose();
  host.dispose();
  assert.equal(browserDisposals, 1);
  assert.equal(worldDisposals, 1);
  assert.deepEqual(order.slice(-2), [
    "browser-dispose",
    "world-dispose",
  ]);
  assert.throws(() => host.trace, /disposed/);
});

test("rejected receipt creates zero Box3D or browser resources", async () => {
  let boundaryLoads = 0;
  let browserStarts = 0;
  await assert.rejects(
    F4VehicleHost.start(hostOptions(), {
      loadReceipt: async () => {
        throw new Error("receipt rejected");
      },
      loadBoundary: async () => {
        boundaryLoads += 1;
        throw new Error("must not load");
      },
      startBrowserHost() {
        browserStarts += 1;
        return { dispose() {} };
      },
    }),
    /receipt rejected/,
  );
  assert.equal(boundaryLoads, 0);
  assert.equal(browserStarts, 0);
});

test("runtime fault stops browser ownership and destroys M6 world", async () => {
  let browserOptions = null;
  let browserDisposals = 0;
  let worldDisposals = 0;
  let reported = null;

  const host = await F4VehicleHost.start(
    {
      ...hostOptions(),
      onFatalError(error) {
        reported = error;
      },
    },
    {
      loadReceipt: async () => nativeReceiptStub(),
      loadBoundary: async () => ({
        receipt: box3dReceiptStub(),
        createM6TopologyWorld() {
          return {
            rateProfile: RATE_PROFILE,
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

  const fault = new Error("physics fault");
  browserOptions.onFatalError(fault);
  assert.equal(reported, fault);
  assert.equal(browserDisposals, 1);
  assert.equal(worldDisposals, 1);
  assert.equal(host.fatalError, fault);
  assert.throws(() => host.trace, /faulted/);
  host.dispose();
});
