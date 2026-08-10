import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Box3D from "box3d.js/inline";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import {
  M6TopologyWorld,
  RATE_STEERING_PROFILES,
} from "../.test-dist/vehicle/m6/m6-topology-world.js";

const receiptPath = new URL(
  "../public/receipts/jv_m6_factory_receipt.json",
  import.meta.url,
);
const b3 = await Box3D();
const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(receiptPath, "utf8"),
);

const CATASTROPHIC_RACK_EXCESS_METERS = 0.01;
const COMMAND_EPSILON_METERS = 1e-10;

function finite(value, label) {
  assert.equal(Number.isFinite(value), true, `${label} must be finite`);
}

function runScenario({
  profileId,
  throttle,
  steeringValue,
  accelerationSteps = 90,
  steeringSteps = 150,
  releaseSteps = 60,
}) {
  const world = new M6TopologyWorld(b3, receipt, profileId);
  const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 1);
  try {
    world.step(300);
    vehicle.setSteering({ mode: "RELEASE" });
    vehicle.setDrive({ throttle, brake: 0 });
    world.step(accelerationSteps);

    const rackTravel = world.config.rackTravel;
    let peakLiveExcess = 0;
    let peakCommandExcess = 0;
    let peakAbsRack = 0;
    let peakAbsSpeed = 0;
    let minContacts = Number.POSITIVE_INFINITY;
    let firstLockStep = null;
    let finalTrace = null;

    vehicle.setSteering({ mode: "RATE", value: steeringValue });
    for (let index = 0; index < steeringSteps; index += 1) {
      const trace = world.step(1)[0];
      assert.ok(trace !== undefined);
      finalTrace = trace;

      const absRack = Math.abs(trace.rackTranslation);
      const liveExcess = Math.max(0, absRack - rackTravel);
      const commanded = trace.steering.commandedRack;
      const commandExcess = Math.max(
        0,
        Math.abs(commanded ?? 0) - rackTravel,
      );

      finite(absRack, "absolute rack translation");
      finite(liveExcess, "live rack excess");
      finite(commandExcess, "commanded rack excess");
      finite(
        trace.drive.forwardSpeedMetersPerSecond,
        "forward speed",
      );

      peakLiveExcess = Math.max(peakLiveExcess, liveExcess);
      peakCommandExcess = Math.max(
        peakCommandExcess,
        commandExcess,
      );
      peakAbsRack = Math.max(peakAbsRack, absRack);
      peakAbsSpeed = Math.max(
        peakAbsSpeed,
        Math.abs(trace.drive.forwardSpeedMetersPerSecond),
      );
      minContacts = Math.min(minContacts, trace.worldContacts);
      if (firstLockStep === null && absRack >= rackTravel * 0.999) {
        firstLockStep = trace.stepIndex;
      }
    }

    vehicle.setSteering({ mode: "RELEASE" });
    vehicle.setDrive({ throttle: 0, brake: 0 });
    let postReleasePeakExcess = 0;
    for (let index = 0; index < releaseSteps; index += 1) {
      const trace = world.step(1)[0];
      assert.ok(trace !== undefined);
      finalTrace = trace;
      postReleasePeakExcess = Math.max(
        postReleasePeakExcess,
        Math.max(0, Math.abs(trace.rackTranslation) - rackTravel),
      );
      minContacts = Math.min(minContacts, trace.worldContacts);
    }

    assert.ok(finalTrace !== null);
    return {
      profileId,
      throttle,
      steeringValue,
      rackTravel,
      peakAbsRack,
      peakLiveExcess,
      peakCommandExcess,
      postReleasePeakExcess,
      peakAbsSpeed,
      minContacts,
      firstLockStep,
      finalRack: finalTrace.rackTranslation,
      finalForwardSpeed:
        finalTrace.drive.forwardSpeedMetersPerSecond,
    };
  } finally {
    world.dispose();
  }
}

function assertSafetyEnvelope(result) {
  assert.ok(
    result.peakCommandExcess <= COMMAND_EPSILON_METERS,
    `command escaped native rack travel: ${JSON.stringify(result)}`,
  );
  assert.ok(
    result.peakLiveExcess < CATASTROPHIC_RACK_EXCESS_METERS,
    `live rack exceeded the 10 mm diagnostic safety ceiling: ${JSON.stringify(result)}`,
  );
  assert.ok(
    result.minContacts >= 2,
    `vehicle lost too many terrain contacts: ${JSON.stringify(result)}`,
  );
}

function diagnosticLine(result) {
  return [
    result.profileId,
    `throttle=${result.throttle.toFixed(2)}`,
    `steer=${result.steeringValue > 0 ? "+1" : "-1"}`,
    `speed=${result.peakAbsSpeed.toFixed(3)}m/s`,
    `rack=${result.peakAbsRack.toFixed(6)}m`,
    `excess=${(result.peakLiveExcess * 1000).toFixed(3)}mm`,
    `releasePeak=${(result.postReleasePeakExcess * 1000).toFixed(3)}mm`,
    `contacts>=${result.minContacts}`,
  ].join(" · ");
}

test("all RATE profiles keep commanded rack inside native travel at stationary lock", (t) => {
  for (const profile of RATE_STEERING_PROFILES) {
    for (const steeringValue of [1, -1]) {
      const result = runScenario({
        profileId: profile.id,
        throttle: 0,
        steeringValue,
        accelerationSteps: 1,
      });
      assertSafetyEnvelope(result);
      t.diagnostic(diagnosticLine(result));
    }
  }
});

test("reference RATE profile measures bounded rack excursion while physically driving", (t) => {
  const results = [];
  for (const throttle of [0.15, 0.3]) {
    for (const steeringValue of [1, -1]) {
      const result = runScenario({
        profileId: "reference_0_21",
        throttle,
        steeringValue,
      });
      assertSafetyEnvelope(result);
      results.push(result);
      t.diagnostic(diagnosticLine(result));
    }
  }

  for (const throttle of [0.15, 0.3]) {
    const pair = results.filter(
      (result) => result.throttle === throttle,
    );
    assert.equal(pair.length, 2);
    const asymmetry = Math.abs(
      pair[0].peakLiveExcess - pair[1].peakLiveExcess,
    );
    assert.ok(
      asymmetry < 0.005,
      `left/right dynamic rack-excess asymmetry exceeded 5 mm: ${JSON.stringify(pair)}`,
    );
  }
});
