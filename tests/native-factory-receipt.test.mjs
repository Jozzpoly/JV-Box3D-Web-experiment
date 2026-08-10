import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  canonicalSha256,
  gitBlobSha1,
  loadPinnedNativeFactoryReceipt,
  PINNED_NATIVE_FACTORY_RECEIPT_URL,
  validateNativeFactoryReceipt,
} from "../.test-dist/config/native-factory-receipt.js";

function setPath(root, path, value) {
  const parts = path.split(".");
  let current = root;
  for (const part of parts.slice(0, -1)) {
    current[part] ??= {};
    current = current[part];
  }
  current[parts.at(-1)] = value;
}

function fixtureRows() {
  const critical = [
    ["frontRigType", "int", 1],
    ["rearRigType", "int", 1],
    ["wheelEnvelope.mode", "int", 3],
    ["rackCenteringHertz", "float", 0],
    ["uprightAssist", "bool", false],
    ["maxSteeringAngleDegrees", "float", 32],
    ["bodyVisualModel", "string", "rama_rurowa"],
    ["chassisHalfExtents", "vec3", [1.55, 0.35, 0.55]],
  ];
  const fillers = Array.from({ length: 68 }, (_, index) => [
    `fixture.value${index}`,
    "float",
    index + 0.25,
  ]);
  return [...critical, ...fillers];
}

async function makeFixture() {
  const rows = fixtureRows();
  const config = {};
  for (const [path, , value] of rows) setPath(config, path, value);
  const payload = {
    assetResolution: {
      assetSuspensionTravelHint: 0.7,
      metadataLoadedFromRuntimeReport: true,
      metadataSourcePath: "assets/reports/asset_audit_latest.json",
      metadataStatus: "loaded runtime asset audit report",
      metersPerBlockbenchUnit: 0.35,
      trailingArmContractLoaded: true,
      trailingArmFallbackUsed: false,
      trailingArmStatus: "contract loaded",
      travelHintFallbackUsed: false,
      wheelDimensionsFallbackUsed: false,
      wheelRadius: 0.514062464,
      wheelWidth: 0.4375,
    },
    derived: {
      minimumTorusSegments: 0,
      rackTravel: 0.0752846599,
      steeringDeadPointDegrees: 57.5,
      terrainCategoryBitsHex: "0x2",
      wheelRadius: 0.514062464,
      wheelWidth: 0.4375,
    },
    factoryComposition: ["fixture"],
    factoryConfig: structuredClone(config),
    features: {
      activeFrontRigType: 1,
      activeRearRigType: 1,
      activeWheelEnvelopeMode: 3,
      rackCenteringAssistEnabled: false,
      supportedRigTypes: [0, 1, 2],
      supportedWheelEnvelopeModes: [0, 1, 2, 3, 4, 5],
      uprightAssistEnabled: false,
    },
    fieldSource: "SaveJozzVehicleM6Config/JozzFieldDesc",
    format: "jv-web-factory-payload",
    runtimeOnly: { filterGroupIndex: -19 },
    sanitizedConfig: structuredClone(config),
    sanitizerChanged: false,
    schemaVersion: 1,
    solverProfile: {
      contactDampingRatio: 10,
      contactHertz: 30,
      contactSpeed: 3,
      enableContinuous: false,
      fixedDt: 1 / 60,
      gravity: [0, -10, 0],
      substeps: 4,
      workerCount: 0,
    },
  };
  return {
    derivedFields: [
      "rackTravel",
      "steeringDeadPointDegrees",
      "wheelRadius",
      "wheelWidth",
      "terrainCategoryBitsHex",
      "minimumTorusSegments",
    ],
    fieldSchema: rows.map(([path, type]) => ({
      path,
      source: "native-JozzFieldDesc:fixture",
      type,
    })),
    format: "jv-web-factory-receipt",
    payload,
    payloadReceipt: {
      bytes: 1,
      canonicalSha256: await canonicalSha256(payload),
      rawSha256: "0".repeat(64),
    },
    runtimeOnlyFields: ["filterGroupIndex"],
    schemaVersion: 1,
    serializedFieldCount: 76,
    source: {
      branch: "agent/web-factory-receipt",
      commit: "a740dec74f4243679c71a17eb59723ee0b42f8bb",
      dirty: false,
      files: Array.from({ length: 10 }, (_, index) => ({
        bytes: index + 1,
        gitBlob: "a".repeat(40),
        path: `fixture/${index}`,
        sha256: "b".repeat(64),
      })),
      repository: "Jozzpoly/Box3d_FunProject",
    },
  };
}

async function refreshHash(receipt) {
  receipt.payloadReceipt.canonicalSha256 = await canonicalSha256(receipt.payload);
}

test("pinned receipt loader uses a site-relative URL", async () => {
  let requestedUrl = null;
  await assert.rejects(
    loadPinnedNativeFactoryReceipt(async (url) => {
      requestedUrl = url;
      return {
        ok: false,
        status: 404,
        async text() {
          return "";
        },
      };
    }),
    /HTTP 404/,
  );
  assert.equal(
    PINNED_NATIVE_FACTORY_RECEIPT_URL,
    "./receipts/jv_m6_factory_receipt.json",
  );
  assert.equal(requestedUrl, PINNED_NATIVE_FACTORY_RECEIPT_URL);
  assert.equal(PINNED_NATIVE_FACTORY_RECEIPT_URL.startsWith("/"), false);
});

test("valid native factory receipt produces a strict effective snapshot", async () => {
  const receipt = await makeFixture();
  const snapshot = await validateNativeFactoryReceipt(receipt);
  assert.equal(snapshot.serializedFieldCount, 76);
  assert.equal(snapshot.derived.rackTravel, 0.0752846599);
  assert.equal(snapshot.activeFeatures.rackCenteringAssistEnabled, false);
  assert.equal(snapshot.assetResolution.fallbackUsed, false);
  assert.equal(snapshot.effectiveFields.length, 76);
  assert.equal(
    snapshot.effectiveFields.find((row) => row.path === "rackCenteringHertz")?.status,
    "SUPPORTED_INACTIVE",
  );
});

test("unknown schema version fails closed", async () => {
  const receipt = await makeFixture();
  receipt.schemaVersion = 2;
  await assert.rejects(validateNativeFactoryReceipt(receipt), /schemaVersion/);
});

test("unknown serialized leaf fails closed even with a refreshed payload hash", async () => {
  const receipt = await makeFixture();
  receipt.payload.factoryConfig.hiddenAssist = 1;
  receipt.payload.sanitizedConfig.hiddenAssist = 1;
  await refreshHash(receipt);
  await assert.rejects(validateNativeFactoryReceipt(receipt), /leaves do not exactly match/);
});

test("field descriptor type drift fails closed", async () => {
  const receipt = await makeFixture();
  receipt.fieldSchema.find((row) => row.path === "frontRigType").type = "bool";
  await assert.rejects(validateNativeFactoryReceipt(receipt), /frontRigType must be a boolean/);
});

test("unsupported topology fails closed", async () => {
  const receipt = await makeFixture();
  receipt.payload.features.activeFrontRigType = 2;
  await refreshHash(receipt);
  await assert.rejects(validateNativeFactoryReceipt(receipt), /activeFrontRigType/);
});

test("assist activation fails closed", async () => {
  const receipt = await makeFixture();
  receipt.payload.features.rackCenteringAssistEnabled = true;
  receipt.payload.factoryConfig.rackCenteringHertz = 2;
  receipt.payload.sanitizedConfig.rackCenteringHertz = 2;
  await refreshHash(receipt);
  await assert.rejects(validateNativeFactoryReceipt(receipt), /rackCenteringAssistEnabled/);
});

test("asset fallback fails closed", async () => {
  const receipt = await makeFixture();
  receipt.payload.assetResolution.wheelDimensionsFallbackUsed = true;
  await refreshHash(receipt);
  await assert.rejects(validateNativeFactoryReceipt(receipt), /wheelDimensionsFallbackUsed/);
});

test("canonical payload drift fails closed", async () => {
  const receipt = await makeFixture();
  receipt.payload.derived.rackTravel = 0.1;
  await assert.rejects(validateNativeFactoryReceipt(receipt), /SHA-256 mismatch/);
});

test("Git blob helper matches native Git object hashing", async () => {
  const text = "JV receipt\n";
  const bytes = Buffer.from(text);
  const expected = createHash("sha1")
    .update(Buffer.from(`blob ${bytes.length}\0`))
    .update(bytes)
    .digest("hex");
  assert.equal(await gitBlobSha1(text), expected);
});
