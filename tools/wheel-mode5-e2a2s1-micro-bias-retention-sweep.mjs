import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2sRunBiasedFlatP75GroundCarrier, 'function', 'E2a2s biased carrier missing');
assert.equal(typeof b3.e2a2qResetPairSolveCounter, 'function');
assert.equal(typeof b3.e2a2qGetPairSolveCounter, 'function');

// Predeclared before execution. Units are millimeters.
// This spans roughly float-resolution scale at R ~= 0.5455 m through the
// already-known one-point case at 0.5 mm.
const biasesMm = [
  0,
  0.0001,
  0.00025,
  0.0005,
  0.001,
  0.002,
  0.005,
  0.01,
  0.02,
  0.05,
  0.1,
  0.25,
  0.5,
];
const spins = [0, 40];
const rows = [];

for (const requestedBiasMm of biasesMm) {
  for (const spin of spins) {
    b3.e2a2qResetPairSolveCounter();
    const run = b3.e2a2sRunBiasedFlatP75GroundCarrier(0, spin, true, requestedBiasMm / 1000);
    const pairSolveCalls = b3.e2a2qGetPairSolveCounter();
    assert.equal(run.valid, true, `bias=${requestedBiasMm}mm spin=${spin}: invalid`);
    assert.equal(run.effectiveProfileCountForBias, 2,
      `bias=${requestedBiasMm}mm spin=${spin}: effective profile count drifted`);

    const effectiveBiasM = run.effectiveSupportBias;
    const effectiveBiasMm = effectiveBiasM * 1000;
    const effectiveNonzero = effectiveBiasM > 0;
    const hasSettledPair = run.settledPairGeometrySamples > 0 && run.settledFeaturePairStable === true;
    const retainsTwo = run.minPointCountAfterImpulse === 2 && run.maxPointCountAfterImpulse === 2;
    const separationDeltaM = Number.isFinite(run.settledLowFeatureSeparationMean)
      && Number.isFinite(run.settledHighFeatureSeparationMean)
      ? Math.abs(run.settledHighFeatureSeparationMean - run.settledLowFeatureSeparationMean)
      : null;

    rows.push({
      requestedBiasMm,
      effectiveBiasMm,
      effectiveNonzero,
      spin,
      retainsTwo,
      minPointCountAfterImpulse: run.minPointCountAfterImpulse,
      maxPointCountAfterImpulse: run.maxPointCountAfterImpulse,
      contactDropoutsAfterImpulse: run.contactDropoutsAfterImpulse,
      featureSetChangesAfterImpulse: run.featureSetChangesAfterImpulse,
      contactIdChangesAfterImpulse: run.contactIdChangesAfterImpulse,
      settledPairGeometrySamples: run.settledPairGeometrySamples,
      settledFeaturePairStable: run.settledFeaturePairStable,
      settledLowFeatureId: run.settledLowFeatureId,
      settledHighFeatureId: run.settledHighFeatureId,
      settledLowFeatureSeparationMean: run.settledLowFeatureSeparationMean,
      settledHighFeatureSeparationMean: run.settledHighFeatureSeparationMean,
      settledSeparationDeltaMm: separationDeltaM === null ? null : separationDeltaM * 1000,
      settledLowFeatureNormalImpulseMean: run.settledLowFeatureNormalImpulseMean,
      settledHighFeatureNormalImpulseMean: run.settledHighFeatureNormalImpulseMean,
      settledTotalImpulseMean: run.settledTotalImpulseMean,
      settledYRange: run.settledYRange,
      settledMaxAbsVy: run.settledMaxAbsVy,
      finalY: run.finalY,
      finalVy: run.finalVy,
      finalAngularX: run.finalAngularX,
      finalAngularY: run.finalAngularY,
      finalAngularZ: run.finalAngularZ,
      finalAxisTiltDeg: run.finalAxisTiltDeg,
      pairSolveCalls,
      uniqueFeatureIds: run.uniqueFeatureIds,
      hasSettledPair,
    });
  }
}

const byBias = biasesMm.map((requestedBiasMm) => {
  const pair = rows.filter((r) => r.requestedBiasMm === requestedBiasMm);
  const effectiveBiasMmValues = [...new Set(pair.map((r) => r.effectiveBiasMm))];
  assert.equal(effectiveBiasMmValues.length, 1,
    `requested bias ${requestedBiasMm}mm canonicalized differently by spin`);
  const effectiveBiasMm = effectiveBiasMmValues[0];
  const effectiveNonzero = effectiveBiasMm > 0;
  const bothRetainTwo = pair.every((r) => r.retainsTwo);
  const bothHaveSettledPair = pair.every((r) => r.hasSettledPair);
  const pairSolveActiveForBoth = pair.every((r) => r.pairSolveCalls > 0);
  const separationDeltas = pair
    .map((r) => r.settledSeparationDeltaMm)
    .filter((v) => v !== null);
  const minSeparationDeltaMm = separationDeltas.length > 0 ? Math.min(...separationDeltas) : null;
  const maxSeparationDeltaMm = separationDeltas.length > 0 ? Math.max(...separationDeltas) : null;
  return {
    requestedBiasMm,
    effectiveBiasMm,
    effectiveNonzero,
    bothRetainTwo,
    bothHaveSettledPair,
    pairSolveActiveForBoth,
    minSeparationDeltaMm,
    maxSeparationDeltaMm,
  };
});

const effectiveNonzeroRows = byBias.filter((r) => r.effectiveNonzero);
const nonzeroTwoPoint = effectiveNonzeroRows.filter(
  (r) => r.bothRetainTwo && r.bothHaveSettledPair && r.pairSolveActiveForBoth,
);
const onePoint = effectiveNonzeroRows.filter((r) => !r.bothRetainTwo);

const result = {
  scope: 'E2a2s1 micro/sub-mm native two-point retention sweep. Same validated E2a2q coupled solver and E2a2s diagnostic endpoint-height carrier; horizontal ground, X/Y angular lock, friction=0. Requested grid fixed before execution and effective b3Wheel profile bias measured after float/canonicalization.',
  biasesMm,
  spins,
  byBias,
  largestEffectiveNonzeroTwoPointBiasMm: nonzeroTwoPoint.length > 0
    ? nonzeroTwoPoint.at(-1).effectiveBiasMm
    : null,
  largestRequestedNonzeroTwoPointBiasMm: nonzeroTwoPoint.length > 0
    ? nonzeroTwoPoint.at(-1).requestedBiasMm
    : null,
  smallestEffectiveOnePointBiasMm: onePoint.length > 0
    ? onePoint[0].effectiveBiasMm
    : null,
  smallestRequestedOnePointBiasMm: onePoint.length > 0
    ? onePoint[0].requestedBiasMm
    : null,
  anyEffectiveNonzeroTwoPointRegime: nonzeroTwoPoint.length > 0,
  rows,
};

console.log(`E2A2S1_MICRO_BIAS_RETENTION_SWEEP ${JSON.stringify(result)}`);
console.log('E2A2S1_MICRO_BIAS_RETENTION_SWEEP_EXECUTED');
