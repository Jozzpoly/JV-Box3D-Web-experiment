import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { inspectBlockbenchRigidPartsV1 } from '../tools/owner-vehicle/blockbench-gltf-rigid-parts.mjs';
import { parseM6FactoryConfig } from '../tools/owner-vehicle/owner-m6-full-rig-calibration-r2.mjs';
import { auditOwnerWheelProfileR3 } from '../tools/owner-vehicle/owner-m6-wheel-profile-audit.mjs';

const WHEEL = 'assets/owner-vehicle/source/Offroad_Big_Wheels.gltf';
const RECEIPT = 'public/receipts/jv_m6_factory_receipt.json';
const EXPECTED_WHEEL_SOURCE_BLOB = 'c13c77a8e5552175ee8266b2da33a54691f1dae9';

function finite(value, label) {
  assert.ok(Number.isFinite(value), `${label} must be finite, got ${value}`);
}

test('real Owner Tire produces a bounded wheel-frame geometry audit without mixing rim geometry', async () => {
  const [wheelText, receiptText] = await Promise.all([
    readFile(WHEEL, 'utf8'),
    readFile(RECEIPT, 'utf8'),
  ]);
  const rigidParts = inspectBlockbenchRigidPartsV1(wheelText, 'Offroad_Big_Wheels.gltf');
  const config = parseM6FactoryConfig(receiptText);
  const report = auditOwnerWheelProfileR3(
    rigidParts,
    config.wheelRadius,
    config.wheelWidth,
  );

  assert.equal(report.piece.jointName, 'Tire');
  assert.ok(report.piece.triangleCount > 0);
  assert.ok(report.piece.nonDegenerateTriangleCount > 0);
  assert.equal(report.frame.markerContract, 'VERIFIED');
  assert.equal(report.provenance.sourceAuthority.wheelSourceGitBlob, EXPECTED_WHEEL_SOURCE_BLOB);
  assert.equal(report.frame.requestedRadius, config.wheelRadius);
  assert.equal(report.frame.requestedWidth, config.wheelWidth);

  for (const [label, value] of Object.entries({
    surfaceArea: report.physical.surfaceArea,
    axialMin: report.physical.axialMin,
    axialMax: report.physical.axialMax,
    axialWidth: report.physical.axialWidth,
    radialMin: report.physical.radialMin,
    outerRadius: report.physical.outerRadius,
    outerRadiusError: report.physical.outerRadiusError,
    axialWidthError: report.physical.axialWidthError,
    areaWeightedMeanRadius: report.physical.areaWeightedMeanRadius,
    areaWeightedRadiusStdDev: report.physical.areaWeightedRadiusStdDev,
    angularOuterRadiusSpread: report.angularEnvelope.outerRadiusSpread,
  })) {
    finite(value, label);
  }

  console.log('OWNER_WHEEL_PROFILE_AUDIT', JSON.stringify({
    piece: report.piece,
    frame: {
      requestedRadius: report.frame.requestedRadius,
      requestedWidth: report.frame.requestedWidth,
      axialScale: report.frame.axialScale,
      radialScale: report.frame.radialScale,
    },
    physical: report.physical,
    angularEnvelope: {
      binCount: report.angularEnvelope.binCount,
      coveredBinCount: report.angularEnvelope.coveredBinCount,
      coverage: report.angularEnvelope.coverage,
      outerRadiusMin: report.angularEnvelope.outerRadiusMin,
      outerRadiusMax: report.angularEnvelope.outerRadiusMax,
      outerRadiusSpread: report.angularEnvelope.outerRadiusSpread,
    },
    axialEnvelope: {
      binCount: report.axialEnvelope.binCount,
      coveredBinCount: report.axialEnvelope.coveredBinCount,
      coverage: report.axialEnvelope.coverage,
    },
    provenance: report.provenance,
  }, null, 2));

  assert.ok(report.physical.surfaceArea > 0);
  assert.ok(report.physical.axialWidth > 0);
  assert.ok(report.physical.outerRadius > 0);
  assert.ok(report.physical.radialMin >= 0);
  assert.ok(report.angularEnvelope.coverage >= 0.75);
  assert.ok(report.axialEnvelope.coverage >= 0.75);
});
