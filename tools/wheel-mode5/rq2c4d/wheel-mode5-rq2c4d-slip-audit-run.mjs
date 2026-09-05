import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../../../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from '../../owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const [outputPath] = process.argv.slice(2);
if (!outputPath) throw new Error('usage: node wheel-mode5-rq2c4d-slip-audit-run.mjs <output.json>');

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

const diagnostic = {
  settledMeanAbsWitnessSlipMmPerS: finite(raw.settledMeanAbsWitnessSlip * mm, 'settledMeanAbsWitnessSlipMmPerS'),
  settledMaxAbsWitnessSlipMmPerS: finite(raw.settledMaxAbsWitnessSlip * mm, 'settledMaxAbsWitnessSlipMmPerS'),
  settledMeanAbsLegacyMinusWitnessMmPerS: finite(raw.settledMeanAbsLegacyMinusWitness * mm, 'settledMeanAbsLegacyMinusWitnessMmPerS'),
  settledMaxAbsLegacyMinusWitnessMmPerS: finite(raw.settledMaxAbsLegacyMinusWitness * mm, 'settledMaxAbsLegacyMinusWitnessMmPerS'),
  settledLegacyMinusWitnessMinMmPerS: finite(raw.settledLegacyMinusWitnessMin * mm, 'settledLegacyMinusWitnessMinMmPerS'),
  settledLegacyMinusWitnessMaxMmPerS: finite(raw.settledLegacyMinusWitnessMax * mm, 'settledLegacyMinusWitnessMaxMmPerS'),
  settledSupportAxialMinMm: finite(raw.settledSupportAxialMin * mm, 'settledSupportAxialMinMm'),
  settledSupportAxialMaxMm: finite(raw.settledSupportAxialMax * mm, 'settledSupportAxialMaxMm'),
  settledSupportRadialMinMm: finite(raw.settledSupportRadialMin * mm, 'settledSupportRadialMinMm'),
  settledSupportRadialMaxMm: finite(raw.settledSupportRadialMax * mm, 'settledSupportRadialMaxMm'),
  settledMaxFirstOrderAxialTiltMagnitudeMmPerS: finite(raw.settledMaxFirstOrderAxialTiltMagnitude * mm, 'settledMaxFirstOrderAxialTiltMagnitudeMmPerS'),
  finalWitnessSlipMmPerS: finite(raw.finalWitnessSlip * mm, 'finalWitnessSlipMmPerS'),
  finalLegacyMinusWitnessMmPerS: finite(raw.finalLegacyMinusWitness * mm, 'finalLegacyMinusWitnessMmPerS'),
  finalSupportAxialMm: finite(raw.finalSupportAxial * mm, 'finalSupportAxialMm'),
  finalSupportRadialMm: finite(raw.finalSupportRadial * mm, 'finalSupportRadialMm'),
};

const result = {
  schemaVersion: 1,
  method: 'RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT_AUDIT',
  role: 'Diagnostic-only rerun of exact RQ2C4 0deg physics with read-only actual support-witness velocity telemetry. Not yaw qualification.',
  executedSource: process.env.GITHUB_SHA ?? null,
  dependencies: {
    box3dJs: '2617a0ff763a60c9f17cee57c6ea72aab75a5077',
    vendorBox3d: '8441b4a06d6d09dcfb0b0f704df4d847d1437b92',
    canonicalProductMain: '5b28cc03d22264010680deb95a04abd04661bc22',
    rq2c4ExecutedSource: '13dfe885f8d949a25fa057f0cd47c7d86b95d817',
    rq2c4Run: 33968699659,
    rq2c4Job: 101313264377,
    rq2c4Artifact: 9970270283,
  },
  instrument: {
    worldDirection: [0, -1, 0],
    support: 'b3ComputeWheelSupport(wheel, inverse-rotated world-down)',
    velocity: 'b3Body_GetLocalPointVelocity(wheelBody, supportLocal)',
    witnessSlip: 'dot(vSupportWitness, targetHeading)',
    legacySlip: 'dot(vCOM,targetHeading) + supportRadius * dot(omega,targetAxle)',
    physicsMutation: false,
  },
  carrier,
  provenance: tire.provenance,
  primary,
  diagnostic,
};

await writeFile(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ2C4D_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ2C4D_EXECUTED');
