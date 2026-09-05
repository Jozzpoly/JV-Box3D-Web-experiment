import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../../../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from '../../owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const [outputPath, ...angleArgs] = process.argv.slice(2);
if (!outputPath || angleArgs.length === 0) {
  throw new Error('usage: node wheel-mode5-rq2c1-local-carrier-run.mjs <output.json> <yaw-deg> [yaw-deg ...]');
}

const requestedYawDegrees = angleArgs.map((value) => Number(value));
for (const yaw of requestedYawDegrees) {
  assert.ok(Number.isFinite(yaw), `invalid yaw argument: ${yaw}`);
  assert.ok([0, 3.5, -3.5].some((allowed) => Math.abs(yaw - allowed) <= 1e-9), `unsupported RQ2C1 yaw: ${yaw}`);
}
assert.equal(new Set(requestedYawDegrees).size, requestedYawDegrees.length, 'duplicate RQ2C1 yaw arguments');

const b3 = await Box3D();
assert.equal(typeof b3.rq2c1RunOuterP75LocalCarrier, 'function', 'RQ2C1 local-carrier binding missing');
assert.equal(typeof b3.e2aOuterP75CarrierInfo, 'function', 'E2a carrier info binding missing');

const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire provenance marker contract drifted');

const carrier = b3.e2aOuterP75CarrierInfo();
assert.equal(carrier.valid, true, `outer-P75 carrier unavailable: ${JSON.stringify(carrier)}`);

const finite = (value, context) => {
  assert.ok(Number.isFinite(value), `${context}: non-finite value ${value}`);
  return value;
};
const radToDeg = 180 / Math.PI;
const cases = {};

for (const yawDegrees of requestedYawDegrees) {
  const raw = b3.rq2c1RunOuterP75LocalCarrier(yawDegrees);
  assert.equal(raw.valid, true, `RQ2C1 yaw ${yawDegrees}: invalid raw run ${JSON.stringify(raw)}`);
  assert.equal(raw.apparatus, 'RQ2C1_H_PRISMATIC_Y_PRISMATIC_SPHERICAL_PARALLEL', 'RQ2C1 apparatus identity drifted');
  assert.ok(Math.abs(raw.yawDegrees - yawDegrees) <= 1e-5, `RQ2C1 yaw echo drifted: ${raw.yawDegrees} vs ${yawDegrees}`);

  cases[String(yawDegrees)] = {
    yawDegrees: finite(raw.yawDegrees, 'yawDegrees'),
    yawRadians: finite(raw.yawRadians, 'yawRadians'),
    wheelMassKg: finite(raw.wheelMass, 'wheelMass'),
    totalGuideMassRatio: finite(raw.totalGuideMassRatio, 'totalGuideMassRatio'),
    perGuideBodyMassRatio: finite(raw.perGuideBodyMassRatio, 'perGuideBodyMassRatio'),
    guideBodyMassKg: finite(raw.guideBodyMass, 'guideBodyMass'),
    mountHertz: finite(raw.mountHertz, 'mountHertz'),
    mountDampingRatio: finite(raw.mountDampingRatio, 'mountDampingRatio'),
    supportRadius: finite(raw.supportRadius, 'supportRadius'),
    targetHeading: [finite(raw.targetHeadingX, 'targetHeadingX'), finite(raw.targetHeadingZ, 'targetHeadingZ')],
    targetAxle: [finite(raw.targetAxleX, 'targetAxleX'), finite(raw.targetAxleZ, 'targetAxleZ')],
    firstContactStep: raw.firstContactStep,
    firstImpulseStep: raw.firstImpulseStep,
    settledContactDropouts: raw.settledContactDropouts,
    settledFeatureSetChanges: raw.settledFeatureSetChanges,
    settledMinPointCount: raw.settledMinPointCount,
    settledMaxPointCount: raw.settledMaxPointCount,
    settledYRangeMm: finite(raw.settledYRange * 1000, 'settledYRangeMm'),
    settledMaxAbsVyMmPerS: finite(raw.settledMaxAbsVy * 1000, 'settledMaxAbsVyMmPerS'),
    settledMeanAbsSlipMmPerS: finite(raw.settledMeanAbsSlip * 1000, 'settledMeanAbsSlipMmPerS'),
    settledMaxAbsSlipMmPerS: finite(raw.settledMaxAbsSlip * 1000, 'settledMaxAbsSlipMmPerS'),
    settledMaxAxisErrorDegrees: finite(raw.settledMaxAxisError * radToDeg, 'settledMaxAxisErrorDegrees'),
    settledMaxHeadingErrorDegrees: finite(raw.settledMaxHeadingError * radToDeg, 'settledMaxHeadingErrorDegrees'),
    settledMaxAbsCrossHeadingSpeedMmPerS: finite(raw.settledMaxAbsCrossHeadingSpeed * 1000, 'settledMaxAbsCrossHeadingSpeedMmPerS'),
    settledMaxAbsCrossTrackMm: finite(raw.settledMaxAbsCrossTrack * 1000, 'settledMaxAbsCrossTrackMm'),
    settledMaxCenterErrorMm: finite(raw.settledMaxCenterError * 1000, 'settledMaxCenterErrorMm'),
    settledHeadingTranslationRangeM: [
      finite(raw.settledHeadingTranslationMin, 'settledHeadingTranslationMin'),
      finite(raw.settledHeadingTranslationMax, 'settledHeadingTranslationMax'),
    ],
    settledVerticalTranslationRangeMm: [
      finite(raw.settledVerticalTranslationMin * 1000, 'settledVerticalTranslationMinMm'),
      finite(raw.settledVerticalTranslationMax * 1000, 'settledVerticalTranslationMaxMm'),
    ],
    finalPosition: [finite(raw.finalX, 'finalX'), finite(raw.finalY, 'finalY'), finite(raw.finalZ, 'finalZ')],
    finalVelocity: [finite(raw.finalVx, 'finalVx'), finite(raw.finalVy, 'finalVy'), finite(raw.finalVz, 'finalVz')],
    finalAngularVelocity: [finite(raw.finalOmegaX, 'finalOmegaX'), finite(raw.finalOmegaY, 'finalOmegaY'), finite(raw.finalOmegaZ, 'finalOmegaZ')],
    finalSlipMmPerS: finite(raw.finalSlip * 1000, 'finalSlipMmPerS'),
    finalAxisErrorDegrees: finite(raw.finalAxisError * radToDeg, 'finalAxisErrorDegrees'),
    finalHeadingErrorDegrees: finite(raw.finalHeadingError * radToDeg, 'finalHeadingErrorDegrees'),
  };
}

const result = {
  schemaVersion: 1,
  method: 'RQ2C1_LOCAL_TRANSLATIONAL_CARRIER_EQUIVALENCE',
  role: 'Post-falsifier local H/Y carrier qualification. Cross-heading translation constrained mechanically in the yaw-rotated frame; 120 Hz ParallelJoint retained.',
  executedSource: process.env.GITHUB_SHA ?? null,
  dependencies: {
    box3dJs: '2617a0ff763a60c9f17cee57c6ea72aab75a5077',
    vendorBox3d: '8441b4a06d6d09dcfb0b0f704df4d847d1437b92',
    canonicalProductMain: '5b28cc03d22264010680deb95a04abd04661bc22',
  },
  apparatus: {
    topology: 'static-root -> H-prismatic sled -> Y-prismatic carrier -> spherical wheel-center; carrier -> 120Hz ParallelJoint -> wheel',
    totalGuideMassRatio: 0.01,
    perGuideBodyMassRatio: 0.005,
    guideGravityScale: 0,
    guideRotationalInertia: 0,
    mountHertz: 120,
    mountDampingRatio: 1,
    challengeDegrees: 3.5,
    maxAxisErrorDegrees: 0.035,
    maxHeadingErrorDegrees: 0.035,
  },
  carrier,
  provenance: tire.provenance,
  requestedYawDegrees,
  cases,
};

await writeFile(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ2C1_LOCAL_CARRIER_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ2C1_LOCAL_CARRIER_EXECUTED');
