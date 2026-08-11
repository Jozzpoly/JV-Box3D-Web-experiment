import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Box3D from "box3d.js/inline";
import { inspectBlockbenchRigidPartsV1 } from "../tools/owner-vehicle/blockbench-gltf-rigid-parts.mjs";
import {
  deriveFrontLeftGoldenReferencesS2,
} from "../tools/owner-vehicle/owner-m6-reference-calibration-r3.mjs";
import { buildOwnerM6FullRigPackageR3 } from "../tools/owner-vehicle/owner-m6-full-rig-package-r3.mjs";
import { validatePinnedNativeFactoryReceiptText } from "../.test-dist/config/native-factory-receipt.js";
import {
  M6_FRONT_LEFT_GOLDEN_SOURCE,
  distance3,
  m6FrontLeftGoldenHardpoints,
  m6FrontLeftSteeringAngleFromRack,
} from "../.test-dist/vehicle/m6/m6-geometry.js";
import { M6TopologyWorld } from "../.test-dist/vehicle/m6/m6-topology-world.js";

const receiptPath = new URL(
  "../public/receipts/jv_m6_factory_receipt.json",
  import.meta.url,
);
const sourceRoot = "assets/owner-vehicle/source";
const contractRoot = "assets/owner-vehicle/contracts";
const b3 = await Box3D();
const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(receiptPath, "utf8"),
);

function close(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual} != ${expected} (tol ${tolerance})`,
  );
}

function closePoint(actual, expected, tolerance, label) {
  close(actual.x, expected.x, tolerance, `${label}.x`);
  close(actual.y, expected.y, tolerance, `${label}.y`);
  close(actual.z, expected.z, tolerance, `${label}.z`);
}

function degrees(radians) {
  return (radians * 180) / Math.PI;
}

function sourceDeltaMeters(deltaBU) {
  return {
    x: -deltaBU[2] * 0.35,
    y: deltaBU[1] * 0.35,
    z: deltaBU[0] * 0.35,
  };
}

function subtractArray(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function rotateAboutY(vector, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    x: cosine * vector.x + sine * vector.z,
    y: vector.y,
    z: -sine * vector.x + cosine * vector.z,
  };
}

function quaternionAngularDeltaDegrees(a, b) {
  const dot = Math.min(
    1,
    Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w),
  );
  return degrees(2 * Math.acos(dot));
}

function independentRackRodResidual(config, references, rackTranslation, steeringAngle) {
  const outboardRest = sourceDeltaMeters(
    subtractArray(references.steeringRod.outboard, references.wheelCenter),
  );
  const rackRest = {
    x: -config.wishbone.steeringArmBack,
    y:
      config.wishbone.lowerArmLength *
      Math.tan((config.wishbone.restArmDroopDeg * Math.PI) / 180),
    z: config.trackHalfWidth,
  };
  const restLength = distance3(outboardRest, rackRest);
  const outboardSteered = rotateAboutY(outboardRest, steeringAngle);
  const rackLive = { ...rackRest, z: rackRest.z + rackTranslation };
  return distance3(outboardSteered, rackLive) - restLength;
}

async function ownerR3Inputs() {
  const read = (name) => readFile(`${sourceRoot}/${name}`, "utf8");
  const contract = (name) => readFile(`${contractRoot}/${name}`, "utf8");
  return {
    chassisText: await read("Nadwozie.gltf"),
    wheelText: await read("Offroad_Big_Wheels.gltf"),
    frontSuspensionText: await read("OneSided_Steering_Suspension_Rig.gltf"),
    rearSuspensionText: await read("One_Sided_wheel_mount.gltf"),
    damperText: await read("Asset_Dumper.gltf"),
    cardanText: await read("Cardan_shaft.gltf"),
    factoryReceiptText: await readFile(receiptPath, "utf8"),
    contractTexts: {
      wheel: await contract("offroad_big_wheel.asset.json"),
      frontSuspension: await contract("one_sided_steering_suspension.asset.json"),
      rearSuspension: await contract("one_sided_wheel_mount.asset.json"),
      damper: await contract("asset_dumper.asset.json"),
      cardan: await contract("cardan_shaft.asset.json"),
    },
  };
}

test("S2 source authority keeps WheelCenter on the exact authored axis midpoint and derives #7 from rigid geometry", async () => {
  const frontText = await readFile(
    `${sourceRoot}/OneSided_Steering_Suspension_Rig.gltf`,
    "utf8",
  );
  const extracted = inspectBlockbenchRigidPartsV1(
    frontText,
    "OneSided_Steering_Suspension_Rig.gltf",
  );
  const references = deriveFrontLeftGoldenReferencesS2(extracted);

  for (let axis = 0; axis < 3; axis += 1) {
    close(
      references.wheelCenter[axis],
      0.5 * (references.travelTop[axis] + references.travelBottom[axis]),
      1e-12,
      `WheelCenter midpoint axis ${axis}`,
    );
  }
  assert.ok(
    Math.hypot(
      references.chassisMountB[0] - references.wheelCenter[0],
      references.chassisMountB[1] - references.wheelCenter[1],
      references.chassisMountB[2] - references.wheelCenter[2],
    ) > 0.1,
    "#6 must remain a distinct authored structural location from #8/WheelCenter",
  );

  const sourceDelta = references.steeringRod.outboard.map(
    (value, axis) => value - references.wheelCenter[axis],
  );
  close(
    sourceDelta[0],
    M6_FRONT_LEFT_GOLDEN_SOURCE.steeringRodOutboardFromWheelCenterBU.x,
    1e-12,
    "#7 rigid outboard delta x",
  );
  close(
    sourceDelta[1],
    M6_FRONT_LEFT_GOLDEN_SOURCE.steeringRodOutboardFromWheelCenterBU.y,
    1e-12,
    "#7 rigid outboard delta y",
  );
  close(
    sourceDelta[2],
    M6_FRONT_LEFT_GOLDEN_SOURCE.steeringRodOutboardFromWheelCenterBU.z,
    1e-12,
    "#7 rigid outboard delta z",
  );
});

test("S2 FL steering center and rack law are independent of rejected kingpinOffset/caster/KPI authority", () => {
  const world = new M6TopologyWorld(b3, receipt);
  try {
    const config = world.config;
    const rest = {
      x: config.axleHalfSpacing,
      y: -config.restDrop,
      z: -config.trackHalfWidth,
    };
    const baseline = m6FrontLeftGoldenHardpoints(config, rest);
    const altered = {
      ...config,
      wishbone: {
        ...config.wishbone,
        kingpinOffset: 0.31,
        casterDeg: -17,
        kingpinInclinationDeg: 23,
      },
    };
    const changed = m6FrontLeftGoldenHardpoints(altered, rest);

    closePoint(baseline.steeringCenter, changed.steeringCenter, 1e-12, "steering center");
    closePoint(baseline.steeringArm, changed.steeringArm, 1e-12, "source #7 outboard");
    closePoint(
      baseline.steeringAxisDirection,
      changed.steeringAxisDirection,
      1e-12,
      "steering axis direction",
    );

    for (const rack of [0, config.rackTravel, -config.rackTravel]) {
      close(
        m6FrontLeftSteeringAngleFromRack(config, rack),
        m6FrontLeftSteeringAngleFromRack(altered, rack),
        1e-12,
        `rack law ${rack}`,
      );
    }
    close(m6FrontLeftSteeringAngleFromRack(config, 0), 0, 1e-12, "neutral rack angle");
    assert.ok(m6FrontLeftSteeringAngleFromRack(config, config.rackTravel) > 0.1);
    assert.ok(m6FrontLeftSteeringAngleFromRack(config, -config.rackTravel) < -0.1);
  } finally {
    world.dispose();
  }
});

test("S2 visual package separates #6/#8 and leaves FR as the pre-S2 control", async () => {
  const generated = buildOwnerM6FullRigPackageR3(await ownerR3Inputs());
  const binding = (id) => {
    const value = generated.visualPackage.bindings.find(
      (candidate) => candidate.bindingId === id,
    );
    assert.ok(value, `missing binding ${id}`);
    return value;
  };

  assert.deepEqual(binding("owner.fl.knuckle.socket-chassismount-b").source, {
    kind: "PART",
    partId: "m6.fl.lower-arm",
  });
  assert.deepEqual(binding("owner.fl.knuckle.socket-wheelcenter").source, {
    kind: "PART",
    partId: "m6.fl.knuckle",
  });
  assert.deepEqual(binding("owner.fr.knuckle.socket-chassismount-b").source, {
    kind: "PART",
    partId: "m6.fr.knuckle",
  });
  assert.equal(
    generated.report.s2FrontLeftGolden.oldKingpinAffineAuthority,
    "REJECTED_FOR_FL",
  );
  assert.match(
    generated.report.s2FrontLeftGolden.steeringLinkPhysics,
    /CENTERED_REVOLUTE_TARGET_DERIVED_FROM_REST_SOURCE_ROD_AND_LIVE_RACK/,
  );
  assert.equal(
    generated.report.calibration.corners.fl.knuckle["socket-chassismount-b"].affineKingpinCalibration,
    false,
  );
  assert.equal(
    generated.report.calibration.corners.fl.knuckle["socket-wheelcenter"].affineKingpinCalibration,
    false,
  );
  assert.equal(
    generated.report.calibration.corners.fl.arms.upper.referenceAuthority.outboard,
    "AUTHORED_RIGID_GEOMETRY_X_EXTREME:Chassis_Top_WHEEL_END",
  );
  assert.equal(
    generated.report.calibration.corners.fl.arms.lower.referenceAuthority.outboard,
    "AUTHORED_RIGID_GEOMETRY_X_EXTREME:Chassis_Bottom_WHEEL_END",
  );
  assert.equal(
    generated.report.calibration.corners.fr.arms.upper.referenceAuthority.outboard,
    "AUTHORED_VISUAL_REFERENCE:Socket_ChassisMount_b",
  );
});

test("real S2 M6 keeps neutral suspension separate from steering, steers about WheelCenter, and spins independently", async () => {
  const frontText = await readFile(
    `${sourceRoot}/OneSided_Steering_Suspension_Rig.gltf`,
    "utf8",
  );
  const sourceReferences = deriveFrontLeftGoldenReferencesS2(
    inspectBlockbenchRigidPartsV1(frontText, "OneSided_Steering_Suspension_Rig.gltf"),
  );
  const world = new M6TopologyWorld(b3, receipt);
  const vehicle = world.createVehicle({ x: 0, y: 1.2, z: 0 }, 1);
  try {
    vehicle.setSteering({ mode: "POSITION", value: 0 });
    let neutralMin = Infinity;
    let neutralMax = -Infinity;
    let coiloverMin = Infinity;
    let coiloverMax = -Infinity;
    let trace = null;
    for (let step = 0; step < 300; step += 1) {
      trace = world.step(1)[0];
      const fl = trace.corners[0];
      assert.notEqual(fl.steeringJointAngle, null);
      neutralMin = Math.min(neutralMin, fl.steeringJointAngle);
      neutralMax = Math.max(neutralMax, fl.steeringJointAngle);
      coiloverMin = Math.min(coiloverMin, fl.coiloverLength);
      coiloverMax = Math.max(coiloverMax, fl.coiloverLength);
    }
    assert.ok(trace !== null);
    const neutral = trace.corners[0];
    assert.ok(
      coiloverMax - coiloverMin > 0.1,
      "neutral gate must include representative real suspension motion",
    );
    assert.ok(
      Math.max(Math.abs(degrees(neutralMin)), Math.abs(degrees(neutralMax))) < 0.25,
      `neutral suspension introduced ${degrees(neutralMin)}..${degrees(neutralMax)} deg steering`,
    );
    assert.ok(Math.abs(degrees(neutral.steeringJointAngle)) < 0.05);
    assert.ok(
      distance3(neutral.steeringCenterCarrierWorld, neutral.steeringCenterKnuckleWorld) < 0.002,
      "centered steering constraint exceeded 2 mm at neutral settle",
    );
    const neutralPartMap = new Map(
      trace.visualFrame.parts.map((part) => [part.partId, part]),
    );
    const neutralLowerArm = neutralPartMap.get("m6.fl.lower-arm");
    const neutralKnuckle = neutralPartMap.get("m6.fl.knuckle");
    assert.ok(neutralLowerArm && neutralKnuckle);

    const steeringLink = trace.visualFrame.segments.find(
      (segment) => segment.segmentId === "m6.fl.steering-link",
    );
    assert.ok(steeringLink);
    closePoint(steeringLink.start, trace.rackPosition, 1e-6, "#7 real rack-center start");

    vehicle.setSteering({ mode: "POSITION", value: 1 });
    trace = world.step(240)[0];
    let fl = trace.corners[0];
    assert.ok(degrees(fl.steeringJointAngle) > 10);
    close(
      independentRackRodResidual(
        world.config,
        sourceReferences,
        trace.rackTranslation,
        fl.steeringJointAngle,
      ),
      0,
      1e-4,
      "positive-lock authored #7/rack-center geometric residual",
    );
    assert.ok(
      distance3(fl.steeringCenterCarrierWorld, fl.steeringCenterKnuckleWorld) < 0.0025,
      "centered steering constraint exceeded 2.5 mm at positive lock",
    );
    const positivePartMap = new Map(
      trace.visualFrame.parts.map((part) => [part.partId, part]),
    );
    const positiveLowerArm = positivePartMap.get("m6.fl.lower-arm");
    const positiveKnuckle = positivePartMap.get("m6.fl.knuckle");
    assert.ok(positiveLowerArm && positiveKnuckle);
    const lowerArmMotion = quaternionAngularDeltaDegrees(
      neutralLowerArm.transform.rotation,
      positiveLowerArm.transform.rotation,
    );
    const knuckleMotion = quaternionAngularDeltaDegrees(
      neutralKnuckle.transform.rotation,
      positiveKnuckle.transform.rotation,
    );
    assert.ok(
      lowerArmMotion < 5,
      `#6/lower-arm inherited excessive steering-like rotation (${lowerArmMotion} deg)`,
    );
    assert.ok(
      knuckleMotion > lowerArmMotion + 5,
      `#8/knuckle did not rotate distinctly relative to #6 (${knuckleMotion} vs ${lowerArmMotion} deg)`,
    );

    vehicle.setSteering({ mode: "POSITION", value: -1 });
    trace = world.step(300)[0];
    fl = trace.corners[0];
    assert.ok(degrees(fl.steeringJointAngle) < -10);
    close(
      independentRackRodResidual(
        world.config,
        sourceReferences,
        trace.rackTranslation,
        fl.steeringJointAngle,
      ),
      0,
      1e-4,
      "negative-lock authored #7/rack-center geometric residual",
    );

    for (let corner = 1; corner < 4; corner += 1) {
      assert.equal(
        trace.corners[corner].steeringJointAngle,
        null,
        `corner ${corner} must remain outside S2 FL topology`,
      );
    }

    vehicle.setSteering({ mode: "POSITION", value: 0.5 });
    vehicle.setDrive({ throttle: 0.25, brake: 0 });
    trace = world.step(180)[0];
    fl = trace.corners[0];
    assert.ok(Math.abs(fl.wheelSpinSpeed) > 0.5, "wheel must spin independently under drive");
    assert.ok(Math.abs(degrees(fl.steeringJointAngle)) > 3, "#8 must remain structurally steered while wheel spins");
    assert.ok(
      distance3(fl.steeringCenterCarrierWorld, fl.steeringCenterKnuckleWorld) < 0.003,
      "centered steering constraint exceeded 3 mm while driving",
    );
  } finally {
    world.dispose();
  }
});
