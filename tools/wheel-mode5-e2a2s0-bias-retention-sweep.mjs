import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2sRunBiasedFlatP75GroundCarrier, 'function', 'E2a2s biased carrier missing');
assert.equal(typeof b3.e2a2qResetPairSolveCounter, 'function');
assert.equal(typeof b3.e2a2qGetPairSolveCounter, 'function');

const biasesMm = [0, 0.5, 1, 2, 3, 4, 5, 6, 8, 10];
const spins = [0, 40];
const rows = [];

for (const biasMm of biasesMm) {
  for (const spin of spins) {
    b3.e2a2qResetPairSolveCounter();
    const run = b3.e2a2sRunBiasedFlatP75GroundCarrier(0, spin, true, biasMm / 1000);
    const pairSolveCalls = b3.e2a2qGetPairSolveCounter();
    assert.equal(run.valid, true, `bias=${biasMm}mm spin=${spin}: invalid`);
    const sepDelta = Number.isFinite(run.settledLowFeatureSeparationMean)
      && Number.isFinite(run.settledHighFeatureSeparationMean)
      ? Math.abs(run.settledHighFeatureSeparationMean - run.settledLowFeatureSeparationMean)
      : null;
    rows.push({
      biasMm,
      spin,
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
      settledSeparationDeltaMm: sepDelta === null ? null : sepDelta * 1000,
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
    });
  }
}

const byBias = biasesMm.map((biasMm) => {
  const pair = rows.filter((r) => r.biasMm === biasMm);
  const bothRetainTwo = pair.every((r) => r.minPointCountAfterImpulse === 2 && r.maxPointCountAfterImpulse === 2);
  const bothHaveSettledPair = pair.every((r) => r.settledPairGeometrySamples > 0 && r.settledFeaturePairStable === true);
  const minSepDeltaMm = Math.min(...pair.map((r) => r.settledSeparationDeltaMm ?? Number.POSITIVE_INFINITY));
  return { biasMm, bothRetainTwo, bothHaveSettledPair, minSepDeltaMm };
});

const qualifying = byBias.filter((r) => r.bothRetainTwo && r.bothHaveSettledPair && r.minSepDeltaMm >= 0.5);
const largestQualifiedBiasMm = qualifying.length > 0 ? qualifying.at(-1).biasMm : null;

const result = {
  scope: 'E2a2s0 bounded native two-point retention sweep for diagnostic endpoint-height bias. Same validated E2a2q coupled solver, horizontal ground, X/Y angular lock, friction=0. Bias grid fixed before execution: 0/0.5/1/2/3/4/5/6/8/10 mm; spin 0 and 40.',
  biasesMm,
  spins,
  byBias,
  largestQualifiedBiasMm,
  rows,
};

console.log(`E2A2S0_BIAS_RETENTION_SWEEP ${JSON.stringify(result)}`);
console.log('E2A2S0_BIAS_RETENTION_SWEEP_EXECUTED');
