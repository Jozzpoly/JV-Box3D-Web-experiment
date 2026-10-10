// Headless driving harness: the exact product M6 vehicle on Box3D, no renderer.
// Used by behavior tests that measure what a player would actually feel
// (acceleration, braking, straight-line tracking, steering release) instead of
// asserting on the shape of source text.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Box3DFactory from "box3d.js/inline";
import { validatePinnedNativeFactoryReceiptText } from "../../.test-dist/config/native-factory-receipt.js";
import { M6TopologyWorld } from "../../.test-dist/vehicle/m6/m6-topology-world.js";

const receiptPath = fileURLToPath(
  new URL("../../public/receipts/jv_m6_factory_receipt.json", import.meta.url),
);

let shared = null;

async function shared3d() {
  shared ??= (async () => {
    const b3 = await Box3DFactory();
    const receipt = await validatePinnedNativeFactoryReceiptText(
      await readFile(receiptPath, "utf8"),
    );
    return { b3, receipt };
  })();
  return shared;
}

export const STEPS_PER_SECOND = 60;

export function kmh(trace) {
  return trace.drive.forwardSpeedMetersPerSecond * 3.6;
}

export function yawDegrees(trace) {
  const q = trace.chassisRotation;
  return (
    (Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z)) *
      180) /
    Math.PI
  );
}

/** Fresh world + one settled vehicle on the flat test ground. */
export async function createSettledVehicle() {
  const { b3, receipt } = await shared3d();
  const world = new M6TopologyWorld(b3, receipt);
  const vehicle = world.createVehicle({ x: 0, y: 1.3, z: 0 });
  vehicle.setDrive({ throttle: 0, brake: 0 });
  vehicle.setSteering({ mode: "RELEASE" });
  let trace = null;
  for (let i = 0; i < STEPS_PER_SECOND * 2; i += 1) {
    trace = world.step(1)[0];
  }
  return {
    world,
    vehicle,
    get trace() {
      return trace;
    },
    seconds(duration) {
      const steps = Math.round(duration * STEPS_PER_SECOND);
      for (let i = 0; i < steps; i += 1) {
        trace = world.step(1)[0];
      }
      return trace;
    },
    dispose() {
      world.dispose();
    },
  };
}
