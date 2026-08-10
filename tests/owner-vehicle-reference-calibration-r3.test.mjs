import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inspectBlockbenchRigidSourceV1 } from '../tools/owner-vehicle/blockbench-gltf-inspector.mjs';
import { inspectBlockbenchRigidPartsV1 } from '../tools/owner-vehicle/blockbench-gltf-rigid-parts.mjs';
import {
  parseM6FactoryConfig,
  cornerRestGeometry,
  requirePiece,
} from '../tools/owner-vehicle/owner-m6-full-rig-calibration-r2.mjs';
import { calibrateOwnerWheelR1 } from '../tools/owner-vehicle/owner-m6-visual-calibration-r1.mjs';
import {
  OWNER_M6_R3_SCALE_METERS_PER_BU,
  deriveFrontSuspensionReferencesR3,
  calibrateFrontWishbonePieceR3,
  calibrateFrontChassisPieceR3,
  calibrateFrontKnucklePieceR3,
} from '../tools/owner-vehicle/owner-m6-reference-calibration-r3.mjs';

const FRONT_SOURCE = 'assets/owner-vehicle/source/OneSided_Steering_Suspension_Rig.gltf';
const WHEEL_SOURCE = 'assets/owner-vehicle/source/Offroad_Big_Wheels.gltf';
const FACTORY_RECEIPT = 'public/receipts/jv_m6_factory_receipt.json';

async function fixture() {
  const front = inspectBlockbenchRigidPartsV1(
    await readFile(FRONT_SOURCE, 'utf8'),
    'OneSided_Steering_Suspension_Rig.gltf',
  );
  const config = parseM6FactoryConfig(await readFile(FACTORY_RECEIPT, 'utf8'));
  return { front, config, references: deriveFrontSuspensionReferencesR3(front) };
}

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test('R3 recovers a coherent authored front suspension reference skeleton', async () => {
  const { config, references } = await fixture();
  assert.deepEqual(references.upperHinge, [0.40625, 0.96875, 0]);
  assert.deepEqual(references.lowerHinge, [0.40625, 0.03125, 0]);
  assert.deepEqual(references.upperOutboard, [-0.78125, 0.96875, 0]);
  assert.deepEqual(references.lowerOutboard, [-0.78125, 0.03125, 0]);
  assert.deepEqual(references.wheelCenter, [-1.1875, 0.5, 0]);
  close(references.sanity.authoredKingpinOffsetBU, 0.40625);
  close(references.sanity.authoredKingpinOffsetMeters, 0.1421875);
  close(references.sanity.authoredUpperArmLengthBU, 1.1875);
  close(references.sanity.authoredLowerArmLengthBU, 1.1875);
  assert.ok(
    Math.abs(references.sanity.authoredKingpinOffsetMeters - config.wishbone.kingpinOffset) < 0.003,
    'authored kingpin offset should independently agree with M6 within 3 mm',
  );
  close(OWNER_M6_R3_SCALE_METERS_PER_BU, 0.35);

  const wheel = inspectBlockbenchRigidSourceV1(
    await readFile(WHEEL_SOURCE, 'utf8'),
    'Offroad_Big_Wheels.gltf',
  );
  const wheelCalibration = calibrateOwnerWheelR1(
    wheel,
    config.wheelRadius,
    config.wheelWidth,
  );
  const mountPlaneResidual = config.wishbone.kingpinOffset - wheelCalibration.report.mountOffset;
  close(wheelCalibration.report.mountOffset, 0.13125);
  close(mountPlaneResidual, 0.00875);
  assert.ok(
    Math.abs(references.sanity.authoredKingpinOffsetMeters - mountPlaneResidual) > 0.13,
    'suspension Socket_WheelCenter cannot be the wheel mount plane: it would collapse the authored kingpin offset',
  );
});

test('R3 front wishbone solve anchors authored pivots to live M6 hardpoints and mirrors without side fudge', async () => {
  const { front, config, references } = await fixture();
  const upperPiece = requirePiece(front, 'Chassis_Top', 'front suspension');
  const lowerPiece = requirePiece(front, 'Chassis_Bottom', 'front suspension');
  const reports = {};

  for (const corner of ['fl', 'fr']) {
    const geometry = cornerRestGeometry(config, corner);
    const upper = calibrateFrontWishbonePieceR3(upperPiece, references, geometry, 'upper');
    const lower = calibrateFrontWishbonePieceR3(lowerPiece, references, geometry, 'lower');
    reports[corner] = { upper: upper.report, lower: lower.report };

    close(upper.report.hingeErrorMeters, 0);
    close(upper.report.outboardErrorMeters, 0);
    close(lower.report.hingeErrorMeters, 0);
    close(lower.report.outboardErrorMeters, 0);
    assert.equal(upper.report.mirrored, corner === 'fr');
    assert.equal(lower.report.mirrored, corner === 'fr');
    assert.equal(upper.report.referenceAuthority.physicalTarget, 'M6_WISHBONE_HARDPOINT');
    assert.equal(lower.report.referenceAuthority.physicalTarget, 'M6_WISHBONE_HARDPOINT');
  }

  close(reports.fl.upper.axialScale, reports.fr.upper.axialScale);
  close(reports.fl.lower.axialScale, reports.fr.lower.axialScale);
  close(reports.fl.upper.spreadScale, reports.fr.upper.spreadScale);
  close(reports.fl.lower.spreadScale, reports.fr.lower.spreadScale);
  assert.ok(reports.fl.upper.axialScale > 0.29 && reports.fl.upper.axialScale < 0.30);
  assert.ok(reports.fl.lower.axialScale > 0.40 && reports.fl.lower.axialScale < 0.41);
  assert.ok(reports.fl.upper.spreadScale > 0.45 && reports.fl.upper.spreadScale < 0.46);
});

test('R3 front upright solve maps authored wheel/kingpin references to physical knuckle hardpoints without mount offset', async () => {
  const { front, config, references } = await fixture();
  const uprightPiece = requirePiece(front, 'Socket_ChassisMount_b', 'front upright');
  const hubPiece = requirePiece(front, 'Socket_WheelCenter', 'front upright');
  const reports = {};

  for (const corner of ['fl', 'fr']) {
    const geometry = cornerRestGeometry(config, corner);
    const upright = calibrateFrontKnucklePieceR3(uprightPiece, references, geometry);
    const hub = calibrateFrontKnucklePieceR3(hubPiece, references, geometry);
    reports[corner] = upright.report;

    for (const result of [upright, hub]) {
      close(result.report.wheelCenterErrorMeters, 0);
      close(result.report.upperBallErrorMeters, 0, 1e-15);
      close(result.report.lowerBallErrorMeters, 0, 1e-15);
      assert.equal(result.report.mirrored, corner === 'fr');
      assert.equal(result.report.referenceAuthority.physicalTarget, 'M6_KNUCKLE_WHEEL_CENTER_AND_BALL_HARDPOINTS');
    }
  }

  close(reports.fl.radialScale, reports.fr.radialScale);
  close(reports.fl.kingpinScale, reports.fr.kingpinScale);
  close(reports.fl.thicknessScale, reports.fr.thicknessScale);
  close(reports.fl.radialScale, 0.3446153846153845);
  assert.ok(reports.fl.kingpinScale > 0.388 && reports.fl.kingpinScale < 0.389);
  assert.ok(reports.fl.targetRadialKingpinDot > 0.12 && reports.fl.targetRadialKingpinDot < 0.13);
  assert.ok(reports.fl.determinant > 0);
  assert.ok(reports.fr.determinant < 0);
});


test('R3 front chassis frame preserves authored damper mechanism as a visual body-to-body constraint', async () => {
  const { front, config, references } = await fixture();
  const chassisPiece = requirePiece(front, 'Socket_SingleDamper_Mount', 'front chassis damper mount');
  const lowerPiece = requirePiece(front, 'Chassis_Bottom', 'front lower wishbone');
  const reports = {};
  const lines = {};

  for (const corner of ['fl', 'fr']) {
    const geometry = cornerRestGeometry(config, corner);
    const chassis = calibrateFrontChassisPieceR3(chassisPiece, references, geometry);
    const lowerArm = calibrateFrontWishbonePieceR3(lowerPiece, references, geometry, 'lower');
    reports[corner] = chassis.report;

    close(chassis.report.wheelCenterErrorMeters, 0);
    close(chassis.report.upperHingeErrorMeters, 0, 1e-15);
    close(chassis.report.lowerHingeErrorMeters, 0, 1e-15);
    assert.equal(chassis.report.mirrored, corner === 'fr');

    const upperChassisLocal = chassis.mapPoint(references.damperUpper);
    const lowerArmLocal = lowerArm.mapPoint(references.damperLower);
    const lowerWorld = [
      geometry.lowerHinge[0] + lowerArmLocal[0],
      geometry.lowerHinge[1] + lowerArmLocal[1],
      geometry.lowerHinge[2] + lowerArmLocal[2],
    ];
    const visualLength = Math.hypot(
      upperChassisLocal[0] - lowerWorld[0],
      upperChassisLocal[1] - lowerWorld[1],
      upperChassisLocal[2] - lowerWorld[2],
    );
    const physicalLength = Math.hypot(
      geometry.coiloverChassis[0] - geometry.coiloverKnuckle[0],
      geometry.coiloverChassis[1] - geometry.coiloverKnuckle[1],
      geometry.coiloverChassis[2] - geometry.coiloverKnuckle[2],
    );
    const visualUpperInboard = Math.abs(upperChassisLocal[2] - geometry.wheelCenter[2]);
    const physicalUpperInboard = Math.abs(geometry.coiloverChassis[2] - geometry.wheelCenter[2]);
    lines[corner] = { visualLength, physicalLength, visualUpperInboard, physicalUpperInboard };

    assert.ok(
      visualLength > physicalLength + 0.15,
      'authored visual damper and M6 spring constraint must remain distinct authorities',
    );
    assert.ok(
      visualUpperInboard > physicalUpperInboard + 0.18,
      'authored upper damper eye should remain materially farther inboard than the physical coilover anchor',
    );
    assert.equal(references.provenance.damperUpper, 'AUTHORED_NODE:Socket_SingleDamperUpper');
    assert.equal(references.provenance.damperLower, 'AUTHORED_NODE:Socket_SingleDamperLower_CHILD_OF_Chassis_Bottom');
  }

  close(reports.fl.radialScale, reports.fr.radialScale);
  close(reports.fl.verticalScale, reports.fr.verticalScale);
  close(reports.fl.thicknessScale, reports.fr.thicknessScale);
  assert.ok(reports.fl.determinant > 0);
  assert.ok(reports.fr.determinant < 0);
  close(lines.fl.visualLength, lines.fr.visualLength);
  close(lines.fl.visualUpperInboard, lines.fr.visualUpperInboard);
});
