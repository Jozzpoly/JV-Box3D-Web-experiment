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
  OWNER_M6_R3_SCALE_METERS_PER_BU,
  deriveFrontSuspensionReferencesR3,
  calibrateFrontWishbonePieceR3,
} from '../tools/owner-vehicle/owner-m6-reference-calibration-r3.mjs';

const FRONT_SOURCE = 'assets/owner-vehicle/source/OneSided_Steering_Suspension_Rig.gltf';
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
