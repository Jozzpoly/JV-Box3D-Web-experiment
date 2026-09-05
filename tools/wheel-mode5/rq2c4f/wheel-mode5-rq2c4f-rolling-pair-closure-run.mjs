import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import Box3D from '../../../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from '../../owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const [outputPath] = process.argv.slice(2);
if (!outputPath) throw new Error('usage: node wheel-mode5-rq2c4f-rolling-pair-closure-run.mjs <output.json>');

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
assert.equal(raw.rq2c4dInstrument, 'RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT');
assert.equal(raw.rq2c4eInstrument, 'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION');
assert.equal(raw.rq2c4fInstrument, 'RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION');

const finite = (value, name) => {
  assert.ok(Number.isFinite(value), `${name}: non-finite ${value}`);
  return value;
};
const mm = 1000;
const mps = (value, name) => finite(value, name) * mm;
const metersToMm = (value, name) => finite(value, name) * mm;

const result = {
  schemaVersion: 1,
  method: 'RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION',
  role: 'Read-only exact symmetric decomposition of RQ2C4E rolling-pair evolution relative to the post-shape, pre-step baseline. Not yaw qualification and not contact-solver causality.',
  executedSource: process.env.GITHUB_SHA ?? null,
  dependencies: {
    box3dJs: '2617a0ff763a60c9f17cee57c6ea72aab75a5077',
    vendorBox3d: '8441b4a06d6d09dcfb0b0f704df4d847d1437b92',
    canonicalProductMain: '5b28cc03d22264010680deb95a04abd04661bc22',
    rq2c4ExecutedSource: '13dfe885f8d949a25fa057f0cd47c7d86b95d817',
    rq2c4dExecutedSource: '8a65846ff4e2a41a096221e5908f3899f694461b',
    rq2c4eExecutedSource: '14b500c7f174c7107316fd9b31ef92b74964f501',
    rq2c4eRun: 33971215026,
    rq2c4eJob: 101319952137,
  },
  instrument: {
    yawDegrees: 0,
    baselineMoment: 'after wheel shape/joint creation and validation; before first b3World_Step',
    spinLever: 'dot(cross(currentAxle, rotate(q, supportLocal-localCOM)), targetHeading)',
    decomposition: 'R=R0+dV+dOmega*(L+L0)/2+dL*(omega+omega0)/2',
    symmetricProductSplit: true,
    physicsMutation: false,
  },
  carrier,
  provenance: tire.provenance,
  retained: {
    actualWitnessMeanAbsMmPerS: mps(raw.settledMeanAbsWitnessSlip, 'retained.actualWitnessMeanAbs'),
    actualWitnessMaxAbsMmPerS: mps(raw.settledMaxAbsWitnessSlip, 'retained.actualWitnessMaxAbs'),
    rq2c4eRollingPairMeanMmPerS: mps(raw.settledMeanRollingPairTangent, 'retained.rq2c4eRollingPairMean'),
    rq2c4eRollingPairMeanAbsMmPerS: mps(raw.settledMeanAbsRollingPairTangent, 'retained.rq2c4eRollingPairMeanAbs'),
    rq2c4eRollingPairMaxAbsMmPerS: mps(raw.settledMaxAbsRollingPairTangent, 'retained.rq2c4eRollingPairMaxAbs'),
    rq2c4ePeakWitnessSlipMmPerS: mps(raw.settledPeakWitnessSlip, 'retained.rq2c4ePeakWitnessSlip'),
    rq2c4ePeakWitnessRollingPairMmPerS: mps(raw.settledPeakWitnessRollingPairTangent, 'retained.rq2c4ePeakWitnessRollingPair'),
    rq2c4eReconstructionMaxScalarErrorMmPerS: mps(raw.settledMaxAbsScalarReconstructionError, 'retained.rq2c4eReconstructionMaxScalarError'),
    rq2c4eReconstructionMaxVectorErrorMmPerS: mps(raw.settledMaxVectorReconstructionError, 'retained.rq2c4eReconstructionMaxVectorError'),
  },
  baseline: {
    translationTangentMmPerS: mps(raw.rq2c4fBaselineTranslationTangent, 'baseline.translationTangent'),
    spinRateRadPerS: finite(raw.rq2c4fBaselineSpinRate, 'baseline.spinRate'),
    spinLeverMm: metersToMm(raw.rq2c4fBaselineSpinLever, 'baseline.spinLever'),
    spinTangentMmPerS: mps(raw.rq2c4fBaselineSpinTangent, 'baseline.spinTangent'),
    rollingPairMmPerS: mps(raw.rq2c4fBaselineRollingPair, 'baseline.rollingPair'),
  },
  settled: {
    translationDrift: {
      meanMmPerS: mps(raw.rq2c4fSettledMeanDeltaTranslation, 'settled.translationDrift.mean'),
      meanAbsMmPerS: mps(raw.rq2c4fSettledMeanAbsDeltaTranslation, 'settled.translationDrift.meanAbs'),
      maxAbsMmPerS: mps(raw.rq2c4fSettledMaxAbsDeltaTranslation, 'settled.translationDrift.maxAbs'),
    },
    spinRateContribution: {
      meanMmPerS: mps(raw.rq2c4fSettledMeanSpinRateContribution, 'settled.spinRateContribution.mean'),
      meanAbsMmPerS: mps(raw.rq2c4fSettledMeanAbsSpinRateContribution, 'settled.spinRateContribution.meanAbs'),
      maxAbsMmPerS: mps(raw.rq2c4fSettledMaxAbsSpinRateContribution, 'settled.spinRateContribution.maxAbs'),
    },
    leverContribution: {
      meanMmPerS: mps(raw.rq2c4fSettledMeanLeverContribution, 'settled.leverContribution.mean'),
      meanAbsMmPerS: mps(raw.rq2c4fSettledMeanAbsLeverContribution, 'settled.leverContribution.meanAbs'),
      maxAbsMmPerS: mps(raw.rq2c4fSettledMaxAbsLeverContribution, 'settled.leverContribution.maxAbs'),
    },
    reconstructedRollingPair: {
      meanMmPerS: mps(raw.rq2c4fSettledMeanReconstructedRollingPair, 'settled.reconstructed.mean'),
      meanAbsMmPerS: mps(raw.rq2c4fSettledMeanAbsReconstructedRollingPair, 'settled.reconstructed.meanAbs'),
      maxAbsMmPerS: mps(raw.rq2c4fSettledMaxAbsReconstructedRollingPair, 'settled.reconstructed.maxAbs'),
    },
    closureReconstruction: {
      meanAbsErrorMmPerS: mps(raw.rq2c4fSettledMeanAbsClosureReconstructionError, 'settled.closureError.meanAbs'),
      maxAbsErrorMmPerS: mps(raw.rq2c4fSettledMaxAbsClosureReconstructionError, 'settled.closureError.maxAbs'),
    },
    stateDrift: {
      meanAbsSpinRateRadPerS: finite(raw.rq2c4fSettledMeanAbsDeltaSpinRate, 'settled.stateDrift.meanAbsSpinRate'),
      maxAbsSpinRateRadPerS: finite(raw.rq2c4fSettledMaxAbsDeltaSpinRate, 'settled.stateDrift.maxAbsSpinRate'),
      meanAbsSpinLeverMm: metersToMm(raw.rq2c4fSettledMeanAbsDeltaSpinLever, 'settled.stateDrift.meanAbsSpinLever'),
      maxAbsSpinLeverMm: metersToMm(raw.rq2c4fSettledMaxAbsDeltaSpinLever, 'settled.stateDrift.maxAbsSpinLever'),
    },
  },
  peakWitness: {
    witnessSlipMmPerS: mps(raw.settledPeakWitnessSlip, 'peakWitness.witnessSlip'),
    rollingPairMmPerS: mps(raw.settledPeakWitnessRollingPairTangent, 'peakWitness.rollingPair'),
    deltaTranslationMmPerS: mps(raw.rq2c4fPeakWitnessDeltaTranslation, 'peakWitness.deltaTranslation'),
    deltaSpinRateRadPerS: finite(raw.rq2c4fPeakWitnessDeltaSpinRate, 'peakWitness.deltaSpinRate'),
    deltaSpinLeverMm: metersToMm(raw.rq2c4fPeakWitnessDeltaSpinLever, 'peakWitness.deltaSpinLever'),
    spinRateContributionMmPerS: mps(raw.rq2c4fPeakWitnessSpinRateContribution, 'peakWitness.spinRateContribution'),
    leverContributionMmPerS: mps(raw.rq2c4fPeakWitnessLeverContribution, 'peakWitness.leverContribution'),
    reconstructedRollingPairMmPerS: mps(raw.rq2c4fPeakWitnessReconstructedRollingPair, 'peakWitness.reconstructedRollingPair'),
    closureReconstructionErrorMmPerS: mps(raw.rq2c4fPeakWitnessClosureReconstructionError, 'peakWitness.closureError'),
  },
  peakRollingPair: {
    rollingPairMmPerS: mps(raw.rq2c4fPeakRollingPairValue, 'peakRollingPair.rollingPair'),
    deltaTranslationMmPerS: mps(raw.rq2c4fPeakRollingPairDeltaTranslation, 'peakRollingPair.deltaTranslation'),
    deltaSpinRateRadPerS: finite(raw.rq2c4fPeakRollingPairDeltaSpinRate, 'peakRollingPair.deltaSpinRate'),
    deltaSpinLeverMm: metersToMm(raw.rq2c4fPeakRollingPairDeltaSpinLever, 'peakRollingPair.deltaSpinLever'),
    spinRateContributionMmPerS: mps(raw.rq2c4fPeakRollingPairSpinRateContribution, 'peakRollingPair.spinRateContribution'),
    leverContributionMmPerS: mps(raw.rq2c4fPeakRollingPairLeverContribution, 'peakRollingPair.leverContribution'),
    reconstructedRollingPairMmPerS: mps(raw.rq2c4fPeakRollingPairReconstructed, 'peakRollingPair.reconstructedRollingPair'),
    closureReconstructionErrorMmPerS: mps(raw.rq2c4fPeakRollingPairClosureReconstructionError, 'peakRollingPair.closureError'),
  },
  final: {
    rollingPairMmPerS: mps(raw.finalRollingPairTangent, 'final.rollingPair'),
    spinLeverMm: metersToMm(raw.rq2c4fFinalSpinLever, 'final.spinLever'),
    deltaTranslationMmPerS: mps(raw.rq2c4fFinalDeltaTranslation, 'final.deltaTranslation'),
    deltaSpinRateRadPerS: finite(raw.rq2c4fFinalDeltaSpinRate, 'final.deltaSpinRate'),
    deltaSpinLeverMm: metersToMm(raw.rq2c4fFinalDeltaSpinLever, 'final.deltaSpinLever'),
    spinRateContributionMmPerS: mps(raw.rq2c4fFinalSpinRateContribution, 'final.spinRateContribution'),
    leverContributionMmPerS: mps(raw.rq2c4fFinalLeverContribution, 'final.leverContribution'),
    reconstructedRollingPairMmPerS: mps(raw.rq2c4fFinalReconstructedRollingPair, 'final.reconstructedRollingPair'),
    closureReconstructionErrorMmPerS: mps(raw.rq2c4fFinalClosureReconstructionError, 'final.closureError'),
  },
};

await writeFile(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log('WHEEL_MODE5_RQ2C4F_RESULT', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ2C4F_EXECUTED');
