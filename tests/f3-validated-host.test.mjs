import test from "node:test";
import assert from "node:assert/strict";
import { F3ValidatedHost } from "../.test-dist/app/f3-validated-host.js";

function receiptStub() {
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

test("receipt gate completes before physics startup", async () => {
  const order = [];
  let disposed = 0;
  const host = await F3ValidatedHost.start(
    { marker: "fixture" },
    {
      loadReceipt: async () => {
        order.push("receipt");
        return receiptStub();
      },
      startPhysics: async (options) => {
        order.push(`physics:${options.marker}`);
        return { dispose: () => disposed += 1 };
      },
    },
  );
  assert.deepEqual(order, ["receipt", "physics:fixture"]);
  assert.equal(host.receipt.serializedFieldCount, 76);
  host.dispose();
  host.dispose();
  assert.equal(disposed, 1);
  assert.throws(() => host.receipt, /disposed/);
});

test("invalid receipt prevents Box3D startup", async () => {
  let physicsStarts = 0;
  await assert.rejects(
    F3ValidatedHost.start(
      {},
      {
        loadReceipt: async () => {
          throw new Error("receipt rejected");
        },
        startPhysics: async () => {
          physicsStarts += 1;
          return { dispose() {} };
        },
      },
    ),
    /receipt rejected/,
  );
  assert.equal(physicsStarts, 0);
});
