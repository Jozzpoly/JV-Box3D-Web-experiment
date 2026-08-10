import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inspectBlockbenchRigidPartsV1 } from '../tools/owner-vehicle/blockbench-gltf-rigid-parts.mjs';
import {
  parseM6FactoryConfig,
  cornerRestGeometry,
  requirePiece,
} from '../tools/owner-vehicle/owner-m6-full-rig-calibration-r2.mjs';
import {
  deriveRearSuspensionReferencesR3,
  calibrateRearWishbonePieceR3,
  calibrateRearKnucklePieceR3,
  calibrateRearChassisPieceR3,
  calibrateRearDamperPairsR3,
} from '../tools/owner-vehicle/owner-m6-rear-reference-calibration-r3.mjs';

const REAR_SOURCE = 'assets/owner-vehicle/source/One_Sided_wheel_mount.gltf';
const FACTORY_RECEIPT = 'public/receipts/jv_m6_factory_receipt.json';

async function fixture() {
  const rear = inspectBlockbenchRigidPartsV1(
    await readFile(REAR_SOURCE, 'utf8'),
    'One_Sided_wheel_mount.gltf',
  );
  const config = parseM6FactoryConfig(await readFile(FACTORY_RECEIPT, 'utf8'));
  return { rear, config, references: deriveRearSuspensionReferencesR3(rear) };
}

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test('R3 rear mating surfaces recover the authored kingpin skeleton without borrowing front markers', async () => {
  const { config, references } = await fixture();
  assert.deepEqual(references.upperHinge, [0.40625, 0.96875, 0]);
  assert.deepEqual(references.lowerHinge, [0.40625, 0.03125, 0]);
  assert.deepEqual(references.upperOutboard, [-0.78125, 0.96875, 0]);
  assert.deepEqual(references.lowerOutboard, [-0.78125, 0.03125, 0]);
  assert.deepEqual(references.wheelCenter, [-1.1875, 0.5, 0]);
  close(references.mating.upper.armFace.projection, 0.8125);
  close(references.mating.lower.armFace.projection, 0.8125);
  close(references.mating.hubInboard.projection, 0.75);
  close(references.mating.upper.transverseCenterErrorBU, 0);
  close(references.mating.lower.transverseCenterErrorBU, 0);
  close(references.wishboneSpread.upper.length, 1.0625);
  close(references.wishboneSpread.lower.length, 1.0625);
  close(references.wishboneSpread.upper.center, 0);
  close(references.wishboneSpread.lower.center, 0);
  close(references.sanity.authoredKingpinOffsetBU, 0.40625);
  close(references.sanity.authoredKingpinOffsetMeters, 0.1421875);
  assert.ok(
    Math.abs(references.sanity.authoredKingpinOffsetMeters - config.wishbone.kingpinOffset) < 0.003,
    'rear geometry-derived kingpin offset should independently agree with M6 within 3 mm',
  );
  assert.match(references.provenance.upperOutboard, /^GEOMETRY_DERIVED_MATING_SURFACE_MIDPOINT/);
  assert.match(references.provenance.lowerOutboard, /^GEOMETRY_DERIVED_MATING_SURFACE_MIDPOINT/);
  assert.match(references.provenance.upperSpread, /^GEOMETRY_DERIVED_INBOARD_CHASSIS_MOUNTING_FACE/);
});

test('R3 rear structural solve maps mating-derived arms, hub and chassis to RL/RR hardpoints without side offsets', async () => {
  const { rear, config, references } = await fixture();
  const upperPiece = requirePiece(rear, 'Chassis_Top', 'rear upper wishbone');
  const lowerPiece = requirePiece(rear, 'Chassis_Bottom', 'rear lower wishbone');
  const hubPiece = requirePiece(rear, 'Socket_WheelCenter', 'rear hub');
  const chassisPiece = requirePiece(rear, 'Socket_ChassisMount', 'rear chassis mount');
  const reports = {};

  for (const corner of ['rl', 'rr']) {
    const geometry = cornerRestGeometry(config, corner);
    const upper = calibrateRearWishbonePieceR3(upperPiece, references, geometry, 'upper');
    const lower = calibrateRearWishbonePieceR3(lowerPiece, references, geometry, 'lower');
    const hub = calibrateRearKnucklePieceR3(hubPiece, references, geometry);
    const chassis = calibrateRearChassisPieceR3(chassisPiece, references, geometry);
    reports[corner] = { upper: upper.report, lower: lower.report, hub: hub.report, chassis: chassis.report };

    close(upper.report.hingeErrorMeters, 0);
    close(upper.report.outboardErrorMeters, 0);
    close(lower.report.hingeErrorMeters, 0);
    close(lower.report.outboardErrorMeters, 0);
    close(hub.report.wheelCenterErrorMeters, 0);
    close(hub.report.upperBallErrorMeters, 0, 1e-15);
    close(hub.report.lowerBallErrorMeters, 0, 1e-15);
    close(chassis.report.wheelCenterErrorMeters, 0);
    close(chassis.report.upperHingeErrorMeters, 0, 1e-15);
    close(chassis.report.lowerHingeErrorMeters, 0, 1e-15);
    assert.equal(upper.report.mirrored, corner === 'rr');
    assert.equal(lower.report.mirrored, corner === 'rr');
    assert.equal(hub.report.mirrored, corner === 'rr');
    assert.equal(chassis.report.mirrored, corner === 'rr');
  }

  for (const key of ['upper','lower']) {
    close(reports.rl[key].axialScale, reports.rr[key].axialScale);
    close(reports.rl[key].spreadScale, reports.rr[key].spreadScale);
  }
  close(reports.rl.hub.radialScale, reports.rr.hub.radialScale);
  close(reports.rl.hub.kingpinScale, reports.rr.hub.kingpinScale);
  close(reports.rl.chassis.radialScale, reports.rr.chassis.radialScale);
  close(reports.rl.chassis.verticalScale, reports.rr.chassis.verticalScale);

  close(reports.rl.upper.axialScale, 0.29641591691741326);
  close(reports.rl.lower.axialScale, 0.4010332993588532);
  close(reports.rl.upper.spreadScale, 0.4517647058823529);
  close(reports.rl.lower.spreadScale, 0.4517647058823529);
  close(reports.rl.hub.radialScale, 0.3446153846153845);
  assert.ok(reports.rl.hub.kingpinScale > 0.388 && reports.rl.hub.kingpinScale < 0.389);
  close(reports.rl.chassis.radialScale, 0.3454329829280961);
  close(reports.rl.chassis.verticalScale, 0.36049597593207616);

  assert.match(reports.rl.upper.referenceAuthority.outboard, /^GEOMETRY_DERIVED_MATING_SURFACE_MIDPOINT/);
  assert.match(reports.rl.upper.referenceAuthority.spread, /^GEOMETRY_DERIVED_INBOARD_CHASSIS_MOUNTING_FACE/);
});


test('R3 rear authored R/L sockets resolve to two fore/aft visual dampers per corner', async () => {
  const { rear, config, references } = await fixture();
  assert.deepEqual(references.damperUpperR, [0.046875, 1.84375, -0.8125]);
  assert.deepEqual(references.damperUpperL, [0.046875, 1.84375, 0.8125]);
  assert.deepEqual(references.damperLowerR, [-0.71875, 0.03125, -0.8125]);
  assert.deepEqual(references.damperLowerL, [-0.71875, 0.03125, 0.8125]);
  const reports = {};

  for (const corner of ['rl', 'rr']) {
    const geometry = cornerRestGeometry(config, corner);
    const result = calibrateRearDamperPairsR3(rear, references, geometry);
    reports[corner] = result.report;
    assert.equal(result.pairs.length, 2);
    const fore = result.pairs.find((pair) => pair.role === 'FORE');
    const aft = result.pairs.find((pair) => pair.role === 'AFT');
    assert.ok(fore && aft);
    assert.equal(fore.sourceSuffix, 'R');
    assert.equal(aft.sourceSuffix, 'L');
    assert.equal(fore.referenceAuthority.upperBody, 'm6.chassis');
    assert.equal(fore.referenceAuthority.lowerBody, `m6.${corner}.lower-arm`);
    assert.equal(aft.referenceAuthority.upperBody, 'm6.chassis');
    assert.equal(aft.referenceAuthority.lowerBody, `m6.${corner}.lower-arm`);
    assert.ok(fore.upperChassisLocal[0] > aft.upperChassisLocal[0]);
    assert.ok(fore.lowerRestWorld[0] > aft.lowerRestWorld[0]);
    close(fore.restLengthMeters, 0.7591940693494738);
    close(aft.restLengthMeters, 0.7458126206270728);
    assert.ok(result.report.crossPairLengthsMeters.foreUpperToAftLower > 0.95);
    assert.ok(result.report.crossPairLengthsMeters.aftUpperToForeLower > 1.03);
    close(result.report.upperRestSeparationMeters, 0.5687500000000001);
    close(result.report.lowerRestSeparationMeters, 0.7341176470588233);
    close(result.report.physicalSpringLengthMeters, 0.6002103076055002);
    assert.equal(result.report.sourcePairing, 'R_TO_R__L_TO_L');
    assert.equal(result.report.sourceRRole, 'FORE_AFTER_VEHICLE_ORIENTATION');
    assert.equal(result.report.sourceLRole, 'AFT_AFTER_VEHICLE_ORIENTATION');
    close(result.report.sourcePairAxisAlignment, 1);
  }

  close(reports.rl.upperRestSeparationMeters, reports.rr.upperRestSeparationMeters);
  close(reports.rl.lowerRestSeparationMeters, reports.rr.lowerRestSeparationMeters);
  close(reports.rl.crossPairLengthsMeters.foreUpperToAftLower, reports.rr.crossPairLengthsMeters.foreUpperToAftLower);
});
