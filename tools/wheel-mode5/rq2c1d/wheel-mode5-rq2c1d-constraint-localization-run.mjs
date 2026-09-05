import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../../../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from '../../owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const [outputPath] = process.argv.slice(2);
if (!outputPath) {
  throw new Error('usage: node wheel-mode5-rq2c1d-constraint-localization-run.mjs <output.json>');
}

const b3 = await Box3D();
assert.equal(typeof b3.rq2c1dRunOuterP75ConstraintLocalization0, 'function', 'RQ2C1D diagnostic binding missing');
assert.equal(typeof b3.e2aOuterP75CarrierInfo, 'function', 'E2a carrier info binding missing');

const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire provenance marker contract drifted');

const carrier = b3.e2aOuterP75CarrierInfo();
assert.equal(carrier.valid, true, `outer-P75 carrier unavailable: ${JSON.stringify(carrier)}`);

const raw = b3.rq2c1dRunOuterP75ConstraintLocalization0();
assert.equal(raw.valid, true, `RQ2C1D invalid raw run: ${JSON.stringify(raw)}`);
assert.equal(raw.apparatus, 'RQ2C1D_SAME_RQ2C1_PHYSICS_DIAGNOSTIC_ONLY', 'RQ2C1D apparatus identity drifted');

const finite = (value, context) => {
  assert.ok(Number.isFinite(value), `${context}: non-finite value ${value}`);
  return value;
};
const radToDeg = 180 / Math.PI;
const mToMm = 1000;

const primary = {
  firstContactStep: raw.firstContactStep,
  firstImpulseStep: raw.firstImpulseStep,
  settledContactDropouts: raw.settledContactDropouts,
  settledFeatureSetChanges: raw.settledFeatureSetChanges,
  settledMinPointCount: raw.settledMinPointCount,
  settledMaxPointCount: raw.settledMaxPointCount,
  settledYRangeMm: finite(raw.settledYRange * mToMm, 'settledYRangeMm'),
  settledMaxAbsVyMmPerS: finite(raw.settledMaxAbsVy * mToMm, 'settledMaxAbsVyMmPerS'),
  settledMaxAbsSlipMmPerS: finite(raw.settledMaxAbsSlip * mToMm, 'settledMaxAbsSlipMmPerS'),
  settledMaxAxisErrorDegrees: finite(raw.settledMaxAxisError * radToDeg, 'settledMaxAxisErrorDegrees'),
  settledMaxHeadingErrorDegrees: finite(raw.settledMaxHeadingError * radToDeg, 'settledMaxHeadingErrorDegrees'),
  settledMaxAbsCrossHeadingSpeedMmPerS: finite(raw.settledMaxAbsCrossHeadingSpeed * mToMm, 'settledMaxAbsCrossHeadingSpeedMmPerS'),
  settledMaxAbsCrossTrackMm: finite(raw.settledMaxAbsCrossTrack * mToMm, 'settledMaxAbsCrossTrackMm'),
  settledHeadingTranslationRangeM: [
    finite(raw.settledHeadingTranslationMin, 'settledHeadingTranslationMin'),
    finite(raw.settledHeadingTranslationMax, 'settledHeadingTranslationMax'),
  ],
  settledVerticalTranslationRangeMm: [
    finite(raw.settledVerticalTranslationMin * mToMm, 'settledVerticalTranslationMinMm'),
    finite(raw.settledVerticalTranslationMax * mToMm, 'settledVerticalTranslationMaxMm'),
  ],
};

const localization = {
  maxAbsSledCrossFromRootMm: finite(raw.maxAbsSledCrossFromRoot * mToMm, 'maxAbsSledCrossFromRootMm'),
  maxAbsSledVerticalFromRootMm: finite(raw.maxAbsSledVerticalFromRoot * mToMm, 'maxAbsSledVerticalFromRootMm'),
  maxAbsCarrierCrossFromRootMm: finite(raw.maxAbsCarrierCrossFromRoot * mToMm, 'maxAbsCarrierCrossFromRootMm'),
  maxAbsCarrierVsSledHeadingMm: finite(raw.maxAbsCarrierVsSledHeading * mToMm, 'maxAbsCarrierVsSledHeadingMm'),
  maxAbsCarrierVsSledCrossMm: finite(raw.maxAbsCarrierVsSledCross * mToMm, 'maxAbsCarrierVsSledCrossMm'),
  maxAbsWheelVsCarrierHeadingMm: finite(raw.maxAbsWheelVsCarrierHeading * mToMm, 'maxAbsWheelVsCarrierHeadingMm'),
  maxAbsWheelVsCarrierVerticalMm: finite(raw.maxAbsWheelVsCarrierVertical * mToMm, 'maxAbsWheelVsCarrierVerticalMm'),
  maxAbsWheelVsCarrierCrossMm: finite(raw.maxAbsWheelVsCarrierCross * mToMm, 'maxAbsWheelVsCarrierCrossMm'),
  maxCenterLinearSeparationMm: finite(raw.maxCenterLinearSeparation * mToMm, 'maxCenterLinearSeparationMm'),
  forcesNewton: {
    heading: {
      magnitude: finite(raw.maxHeadingForceMagnitude, 'maxHeadingForceMagnitude'),
      H: finite(raw.maxHeadingForceH, 'maxHeadingForceH'),
      Y: finite(raw.maxHeadingForceY, 'maxHeadingForceY'),
      A: finite(raw.maxHeadingForceA, 'maxHeadingForceA'),
    },
    vertical: {
      magnitude: finite(raw.maxVerticalForceMagnitude, 'maxVerticalForceMagnitude'),
      H: finite(raw.maxVerticalForceH, 'maxVerticalForceH'),
      Y: finite(raw.maxVerticalForceY, 'maxVerticalForceY'),
      A: finite(raw.maxVerticalForceA, 'maxVerticalForceA'),
    },
    center: {
      magnitude: finite(raw.maxCenterForceMagnitude, 'maxCenterForceMagnitude'),
      H: finite(raw.maxCenterForceH, 'maxCenterForceH'),
      Y: finite(raw.maxCenterForceY, 'maxCenterForceY'),
      A: finite(raw.maxCenterForceA, 'maxCenterForceA'),
    },
  },
  mountTorqueNewtonMeter: {
    magnitude: finite(raw.maxMountTorqueMagnitude, 'maxMountTorqueMagnitude'),
    H: finite(raw.maxMountTorqueH, 'maxMountTorqueH'),
    Y: finite(raw.maxMountTorqueY, 'maxMountTorqueY'),
    A: finite(raw.maxMountTorqueA, 'maxMountTorqueA'),
  },
};

const result = {
  schemaVersion: 1,
  method: 'RQ2C1D_CONSTRAINT_LOCALIZATION_0DEG',
  role: 'Diagnostic-only rerun of the executed RQ2C1 0-degree apparatus. No physics parameter or gate changed; added observations localize constraint-chain compliance.',
  executedSource: process.env.GITHUB_SHA ?? null,
  dependencies: {
    box3dJs: '2617a0ff763a60c9f17cee57c6ea72aab75a5077',
    vendorBox3d: '8441b4a06d6d09dcfb0b0f704df4d847d1437b92',
    canonicalProductMain: '5b28cc03d22264010680deb95a04abd04661bc22',
    rq2c1ReferenceSource: 'f7ef795bedd4a5821556fc32bf953505d681c8d5',
    rq2c1ReferenceRun: 33966506853,
  },
  apparatus: {
    yawDegrees: finite(raw.yawDegrees, 'yawDegrees'),
    wheelMassKg: finite(raw.wheelMass, 'wheelMass'),
    totalGuideMassRatio: finite(raw.totalGuideMassRatio, 'totalGuideMassRatio'),
    perGuideBodyMassRatio: finite(raw.perGuideBodyMassRatio, 'perGuideBodyMassRatio'),
    guideBodyMassKg: finite(raw.guideBodyMass, 'guideBodyMass'),
    mountHertz: finite(raw.mountHertz, 'mountHertz'),
    mountDampingRatio: finite(raw.mountDampingRatio, 'mountDampingRatio'),
    supportRadius: finite(raw.supportRadius, 'supportRadius'),
  },
  carrier,
  provenance: tire.provenance,
  primary,
  localization,
};

await writeFile(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ2C1D_CONSTRAINT_LOCALIZATION_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ2C1D_CONSTRAINT_LOCALIZATION_EXECUTED');
