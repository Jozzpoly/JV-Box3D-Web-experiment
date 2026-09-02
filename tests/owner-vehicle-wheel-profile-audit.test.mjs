import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { inspectBlockbenchRigidPartsV1 } from '../tools/owner-vehicle/blockbench-gltf-rigid-parts.mjs';
import { parseM6FactoryConfig } from '../tools/owner-vehicle/owner-m6-full-rig-calibration-r2.mjs';
import { auditOwnerWheelProfileR3 } from '../tools/owner-vehicle/owner-m6-wheel-profile-audit.mjs';
import { buildOwnerWheelProfileCandidateSetV1 } from '../tools/owner-vehicle/owner-m6-wheel-profile-candidates.mjs';
import { auditOwnerWheelSupportCandidatesV1 } from '../tools/owner-vehicle/owner-m6-wheel-support-audit.mjs';

const WHEEL = 'assets/owner-vehicle/source/Offroad_Big_Wheels.gltf';
const RECEIPT = 'public/receipts/jv_m6_factory_receipt.json';
const MODE5_BACKEND = 'src/vehicle/m6/mode5-wheel-backend.ts';
const EXPECTED_WHEEL_SOURCE_BLOB = 'c13c77a8e5552175ee8266b2da33a54691f1dae9';

function finite(value, label) {
  assert.ok(Number.isFinite(value), `${label} must be finite, got ${value}`);
}

function currentMode5CornerRadius(sourceText) {
  const match = sourceText.match(/const OWNER_SELECTED_CORNER_RADIUS = ([0-9.]+);/);
  assert.ok(match, 'mode5 backend must expose OWNER_SELECTED_CORNER_RADIUS');
  const value = Number(match[1]);
  finite(value, 'current mode5 corner radius');
  return value;
}

function compactErrors(errors) {
  return {
    signedMeanError: errors.signedMeanError,
    meanAbsoluteError: errors.meanAbsoluteError,
    p95AbsoluteError: errors.p95AbsoluteError,
    maxAbsoluteError: errors.maxAbsoluteError,
    meanOutsideEnvelope: errors.meanOutsideEnvelope,
    outsideOverLinearSlopRate: errors.outsideOverLinearSlopRate,
    meanInsetFromEnvelope: errors.meanInsetFromEnvelope,
    insetOverLinearSlopRate: errors.insetOverLinearSlopRate,
  };
}

test('real Owner Tire produces asset-derived profile and convex-support evidence against current mode5', async () => {
  const [wheelText, receiptText, mode5BackendText] = await Promise.all([
    readFile(WHEEL, 'utf8'),
    readFile(RECEIPT, 'utf8'),
    readFile(MODE5_BACKEND, 'utf8'),
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

  assert.ok(report.physical.surfaceArea > 0);
  assert.ok(report.physical.axialWidth > 0);
  assert.ok(report.physical.outerRadius > 0);
  assert.ok(report.physical.radialMin >= 0);
  assert.ok(report.angularEnvelope.coverage >= 0.75);
  assert.ok(report.axialEnvelope.coverage >= 0.75);
  assert.ok(report.axialEnvelope.bins.every((bin) => bin.outerRadii.length > 0));

  const mode5CornerRadius = currentMode5CornerRadius(mode5BackendText);
  const candidateSet = buildOwnerWheelProfileCandidateSetV1(report, mode5CornerRadius);
  const control = candidateSet.candidates.find((candidate) => candidate.id === 'current-mode5-flat');
  assert.ok(control, 'current mode5 geometry must remain an explicit control');
  assert.equal(control.cornerRadius, Math.min(mode5CornerRadius, 0.5 * config.wheelWidth, config.wheelRadius));
  assert.ok(candidateSet.candidates.length > 1);

  for (const candidate of candidateSet.candidates) {
    assert.ok(candidate.profileCount >= 1);
    assert.ok(candidate.profileCount <= candidateSet.donorSemantics.maxProfilePoints);
    assert.equal(candidate.metrics.missingSliceCount, 0);
  }

  const support = auditOwnerWheelSupportCandidatesV1(
    rigidParts,
    report,
    candidateSet,
  );
  assert.equal(support.method, 'CONVEX_SUPPORT_FUNCTION_DIRECTION_GRID');
  assert.ok(support.supportPointCount > 0);
  assert.equal(support.semantics.radialDirectionCount, 72);
  assert.equal(support.semantics.tiltStepDegrees, 5);
  assert.equal(support.semantics.tiltCount, 37);
  assert.equal(support.semantics.directionCount, 2664);
  assert.equal(support.candidates.length, candidateSet.candidates.length);

  const supportControl = support.candidates.find((candidate) => candidate.id === 'current-mode5-flat');
  assert.ok(supportControl, 'support audit must retain current mode5 control');
  assert.equal(supportControl.pureRadial.tiltDegrees, 0);
  assert.equal(supportControl.negativeAxialSide.tiltDegrees, -90);
  assert.equal(supportControl.positiveAxialSide.tiltDegrees, 90);

  for (const candidate of support.candidates) {
    for (const [label, value] of Object.entries(compactErrors(candidate.uniformTiltGrid))) {
      finite(value, `${candidate.id}.support.uniform.${label}`);
    }
    for (const [label, value] of Object.entries(compactErrors(candidate.pureRadial.errors))) {
      finite(value, `${candidate.id}.support.radial.${label}`);
    }
  }

  const supportRanking = [...support.candidates]
    .sort((a, b) => a.uniformTiltGrid.meanAbsoluteError - b.uniformTiltGrid.meanAbsoluteError)
    .map((candidate) => ({
      id: candidate.id,
      source: candidate.source,
      targetStrategy: candidate.targetStrategy,
      cornerRadius: candidate.cornerRadius,
      profileCount: candidate.profileCount,
      uniformTiltGrid: compactErrors(candidate.uniformTiltGrid),
      pureRadial: {
        actualSupport: candidate.pureRadial.actualSupport,
        candidateSupport: candidate.pureRadial.candidateSupport,
        errors: compactErrors(candidate.pureRadial.errors),
      },
      tilt30: candidate.byTilt
        .filter((row) => Math.abs(row.tiltDegrees) === 30)
        .map((row) => ({
          tiltDegrees: row.tiltDegrees,
          candidateSupport: row.candidateSupport,
          actualSupport: row.actualSupport,
          errors: compactErrors(row.errors),
        })),
      tilt60: candidate.byTilt
        .filter((row) => Math.abs(row.tiltDegrees) === 60)
        .map((row) => ({
          tiltDegrees: row.tiltDegrees,
          candidateSupport: row.candidateSupport,
          actualSupport: row.actualSupport,
          errors: compactErrors(row.errors),
        })),
      axialSides: [candidate.negativeAxialSide, candidate.positiveAxialSide].map((row) => ({
        tiltDegrees: row.tiltDegrees,
        candidateSupport: row.candidateSupport,
        actualSupport: row.actualSupport,
        errors: compactErrors(row.errors),
      })),
    }));

  console.log('OWNER_WHEEL_GEOMETRY_SUMMARY', JSON.stringify({
    piece: report.piece,
    frame: {
      requestedRadius: report.frame.requestedRadius,
      requestedWidth: report.frame.requestedWidth,
      axialScale: report.frame.axialScale,
      radialScale: report.frame.radialScale,
    },
    physical: report.physical,
    angularEnvelope: {
      coverage: report.angularEnvelope.coverage,
      outerRadiusMin: report.angularEnvelope.outerRadiusMin,
      outerRadiusMax: report.angularEnvelope.outerRadiusMax,
      outerRadiusSpread: report.angularEnvelope.outerRadiusSpread,
    },
    axialEnvelope: {
      method: report.axialEnvelope.method,
      coverage: report.axialEnvelope.coverage,
      binCount: report.axialEnvelope.binCount,
    },
    donorSemantics: candidateSet.donorSemantics,
    supportSemantics: support.semantics,
    supportPointCount: support.supportPointCount,
    candidates: candidateSet.candidates.map((candidate) => ({
      id: candidate.id,
      targetStrategy: candidate.targetStrategy,
      cornerRadius: candidate.cornerRadius,
      profileCount: candidate.profileCount,
      profile: candidate.profile,
      surfaceGrid: {
        meanAbsoluteError: candidate.metrics.meanAbsoluteError,
        p95AbsoluteError: candidate.metrics.p95AbsoluteError,
        meanOutsideRubber: candidate.metrics.meanOutsideRubber,
        outsideOverLinearSlopRate: candidate.metrics.outsideOverLinearSlopRate,
        meanInsetFromRubber: candidate.metrics.meanInsetFromRubber,
        insetOverLinearSlopRate: candidate.metrics.insetOverLinearSlopRate,
      },
    })),
  }, null, 2));

  console.log('OWNER_WHEEL_SUPPORT_RANKING', JSON.stringify(supportRanking, null, 2));
});
