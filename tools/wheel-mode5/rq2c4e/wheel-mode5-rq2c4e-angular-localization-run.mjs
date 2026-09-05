import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../../../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from '../../owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const [outputPath] = process.argv.slice(2);
if (!outputPath) throw new Error('usage: node wheel-mode5-rq2c4e-angular-localization-run.mjs <output.json>');

const b3 = await Box3D();
assert.equal(typeof b3.rq2c4RunOuterP75HardRelaxGuide, 'function', 'RQ2C4 binding missing');
const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396, 'tire provenance triangle count drifted');
assert.equal(tire.provenance.markerContract, 'VERIFIED', 'tire marker contract drifted');
const carrier = b3.e2aOuterP75CarrierInfo();
assert.equal(carrier.valid, true, 'outer-P75 carrier unavailable');

const raw = b3.rq2c4RunOuterP75HardRelaxGuide(0);
assert.equal(raw.valid, true, JSON.stringify(raw));
assert.equal(raw.apparatus, 'RQ2C4_DIRECT_PARALLEL_LOCAL_Z_ENGINE_NATIVE_HARD_RELAX');
assert.equal(raw.linearGuideRelaxation, 'USE_BIAS_SOFT_SOLVE_HARD_RELAX');
assert.equal(raw.rq2c4dInstrument, 'RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT');
assert.equal(raw.rq2c4eInstrument, 'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION');

const finite = (value, name) => {
  assert.ok(Number.isFinite(value), `${name}: non-finite ${value}`);
  return value;
};
const radToDeg = 180 / Math.PI;
const mm = 1000;

const primary = {
  yawDegrees: finite(raw.yawDegrees, 'yawDegrees'),
  mountHertz: finite(raw.mountHertz, 'mountHertz'),
  mountDampingRatio: finite(raw.mountDampingRatio, 'mountDampingRatio'),
  linearGuideHertz: finite(raw.linearGuideHertz, 'linearGuideHertz'),
  linearGuideDampingRatio: finite(raw.linearGuideDampingRatio, 'linearGuideDampingRatio'),
  firstContactStep: raw.firstContactStep,
  firstImpulseStep: raw.firstImpulseStep,
  settledContactDropouts: raw.settledContactDropouts,
  settledFeatureSetChanges: raw.settledFeatureSetChanges,
  settledMinPointCount: raw.settledMinPointCount,
  settledMaxPointCount: raw.settledMaxPointCount,
  settledYRangeMm: finite(raw.settledYRange * mm, 'settledYRangeMm'),
  settledMaxAbsVyMmPerS: finite(raw.settledMaxAbsVy * mm, 'settledMaxAbsVyMmPerS'),
  settledMeanAbsSlipMmPerS: finite(raw.settledMeanAbsSlip * mm, 'settledMeanAbsSlipMmPerS'),
  settledMaxAbsSlipMmPerS: finite(raw.settledMaxAbsSlip * mm, 'settledMaxAbsSlipMmPerS'),
  settledMaxAxisErrorDegrees: finite(raw.settledMaxAxisError * radToDeg, 'settledMaxAxisErrorDegrees'),
  settledMaxHeadingErrorDegrees: finite(raw.settledMaxHeadingError * radToDeg, 'settledMaxHeadingErrorDegrees'),
  settledMaxAbsCrossHeadingSpeedMmPerS: finite(raw.settledMaxAbsCrossHeadingSpeed * mm, 'settledMaxAbsCrossHeadingSpeedMmPerS'),
  settledMaxAbsCrossTrackMm: finite(raw.settledMaxAbsCrossTrack * mm, 'settledMaxAbsCrossTrackMm'),
  settledMaxAbsPlaneSeparationMm: finite(raw.settledMaxAbsPlaneSeparation * mm, 'settledMaxAbsPlaneSeparationMm'),
  finalSlipMmPerS: finite(raw.finalSlip * mm, 'finalSlipMmPerS'),
  finalAxisErrorDegrees: finite(raw.finalAxisError * radToDeg, 'finalAxisErrorDegrees'),
  finalHeadingErrorDegrees: finite(raw.finalHeadingError * radToDeg, 'finalHeadingErrorDegrees'),
  finalPlaneSeparationMm: finite(raw.finalPlaneSeparation * mm, 'finalPlaneSeparationMm'),
};

const rq2c4d = {
  settledMeanAbsWitnessSlipMmPerS: finite(raw.settledMeanAbsWitnessSlip * mm, 'settledMeanAbsWitnessSlipMmPerS'),
  settledMaxAbsWitnessSlipMmPerS: finite(raw.settledMaxAbsWitnessSlip * mm, 'settledMaxAbsWitnessSlipMmPerS'),
  finalWitnessSlipMmPerS: finite(raw.finalWitnessSlip * mm, 'finalWitnessSlipMmPerS'),
};

const localization = {
  settledMeanTranslationTangentMmPerS: finite(raw.settledMeanTranslationTangent * mm, 'settledMeanTranslationTangentMmPerS'),
  settledMeanAbsTranslationTangentMmPerS: finite(raw.settledMeanAbsTranslationTangent * mm, 'settledMeanAbsTranslationTangentMmPerS'),
  settledMaxAbsTranslationTangentMmPerS: finite(raw.settledMaxAbsTranslationTangent * mm, 'settledMaxAbsTranslationTangentMmPerS'),
  settledMeanSpinTangentMmPerS: finite(raw.settledMeanSpinTangent * mm, 'settledMeanSpinTangentMmPerS'),
  settledMeanAbsSpinTangentMmPerS: finite(raw.settledMeanAbsSpinTangent * mm, 'settledMeanAbsSpinTangentMmPerS'),
  settledMaxAbsSpinTangentMmPerS: finite(raw.settledMaxAbsSpinTangent * mm, 'settledMaxAbsSpinTangentMmPerS'),
  settledMeanRollingPairTangentMmPerS: finite(raw.settledMeanRollingPairTangent * mm, 'settledMeanRollingPairTangentMmPerS'),
  settledMeanAbsRollingPairTangentMmPerS: finite(raw.settledMeanAbsRollingPairTangent * mm, 'settledMeanAbsRollingPairTangentMmPerS'),
  settledMaxAbsRollingPairTangentMmPerS: finite(raw.settledMaxAbsRollingPairTangent * mm, 'settledMaxAbsRollingPairTangentMmPerS'),
  settledMeanNonSpinTangentMmPerS: finite(raw.settledMeanNonSpinTangent * mm, 'settledMeanNonSpinTangentMmPerS'),
  settledMeanAbsNonSpinTangentMmPerS: finite(raw.settledMeanAbsNonSpinTangent * mm, 'settledMeanAbsNonSpinTangentMmPerS'),
  settledMaxAbsNonSpinTangentMmPerS: finite(raw.settledMaxAbsNonSpinTangent * mm, 'settledMaxAbsNonSpinTangentMmPerS'),
  settledMaxNonSpinOmegaRadPerS: finite(raw.settledMaxNonSpinOmega, 'settledMaxNonSpinOmegaRadPerS'),
  settledMeanAbsScalarReconstructionErrorMmPerS: finite(raw.settledMeanAbsScalarReconstructionError * mm, 'settledMeanAbsScalarReconstructionErrorMmPerS'),
  settledMaxAbsScalarReconstructionErrorMmPerS: finite(raw.settledMaxAbsScalarReconstructionError * mm, 'settledMaxAbsScalarReconstructionErrorMmPerS'),
  settledMaxVectorReconstructionErrorMmPerS: finite(raw.settledMaxVectorReconstructionError * mm, 'settledMaxVectorReconstructionErrorMmPerS'),
  peakWitness: {
    witnessSlipMmPerS: finite(raw.settledPeakWitnessSlip * mm, 'peakWitness.witnessSlipMmPerS'),
    translationTangentMmPerS: finite(raw.settledPeakWitnessTranslationTangent * mm, 'peakWitness.translationTangentMmPerS'),
    spinTangentMmPerS: finite(raw.settledPeakWitnessSpinTangent * mm, 'peakWitness.spinTangentMmPerS'),
    rollingPairTangentMmPerS: finite(raw.settledPeakWitnessRollingPairTangent * mm, 'peakWitness.rollingPairTangentMmPerS'),
    nonSpinTangentMmPerS: finite(raw.settledPeakWitnessNonSpinTangent * mm, 'peakWitness.nonSpinTangentMmPerS'),
    reconstructedSlipMmPerS: finite(raw.settledPeakWitnessReconstructedSlip * mm, 'peakWitness.reconstructedSlipMmPerS'),
    scalarReconstructionErrorMmPerS: finite(raw.settledPeakWitnessScalarReconstructionError * mm, 'peakWitness.scalarReconstructionErrorMmPerS'),
  },
  final: {
    translationTangentMmPerS: finite(raw.finalTranslationTangent * mm, 'final.translationTangentMmPerS'),
    spinTangentMmPerS: finite(raw.finalSpinTangent * mm, 'final.spinTangentMmPerS'),
    rollingPairTangentMmPerS: finite(raw.finalRollingPairTangent * mm, 'final.rollingPairTangentMmPerS'),
    nonSpinTangentMmPerS: finite(raw.finalNonSpinTangent * mm, 'final.nonSpinTangentMmPerS'),
    nonSpinOmegaRadPerS: finite(raw.finalNonSpinOmega, 'final.nonSpinOmegaRadPerS'),
    reconstructedSlipMmPerS: finite(raw.finalReconstructedWitnessSlip * mm, 'final.reconstructedSlipMmPerS'),
    scalarReconstructionErrorMmPerS: finite(raw.finalScalarReconstructionError * mm, 'final.scalarReconstructionErrorMmPerS'),
    vectorReconstructionErrorMmPerS: finite(raw.finalVectorReconstructionError * mm, 'final.vectorReconstructionErrorMmPerS'),
  },
};

const result = {
  schemaVersion: 1,
  method: 'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION',
  role: 'Read-only kinematic decomposition of exact RQ2C4D 0deg actual support-witness velocity. Not yaw qualification and not a stiffness test.',
  executedSource: process.env.GITHUB_SHA ?? null,
  dependencies: {
    box3dJs: '2617a0ff763a60c9f17cee57c6ea72aab75a5077',
    vendorBox3d: '8441b4a06d6d09dcfb0b0f704df4d847d1437b92',
    canonicalProductMain: '5b28cc03d22264010680deb95a04abd04661bc22',
    rq2c4ExecutedSource: '13dfe885f8d949a25fa057f0cd47c7d86b95d817',
    rq2c4dExecutedSource: '8a65846ff4e2a41a096221e5908f3899f694461b',
    rq2c4dRun: 33969662893,
    rq2c4dJob: 101315812890,
  },
  instrument: {
    yawDegrees: 0,
    tangent: 'targetHeading',
    support: 'b3ComputeWheelSupport(wheel, inverse-rotated world-down)',
    witnessVelocity: 'b3Body_GetLocalPointVelocity(wheelBody, supportLocal)',
    localCenterOfMass: 'b3Body_GetLocalCenterOfMass(wheelBody)',
    rWorld: 'rotate(bodyRotation, supportLocal - localCenterOfMass)',
    spinOmega: 'dot(omega,currentAxle) * currentAxle',
    nonSpinOmega: 'omega - spinOmega',
    reconstructedVelocity: 'vCOM + cross(spinOmega,rWorld) + cross(nonSpinOmega,rWorld)',
    rollingPair: 'dot(vCOM,tangent) + dot(cross(spinOmega,rWorld),tangent)',
    physicsMutation: false,
  },
  carrier,
  provenance: tire.provenance,
  primary,
  rq2c4d,
  localization,
};

await writeFile(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ2C4E_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ2C4E_EXECUTED');
