import assert from 'node:assert/strict';
import fs from 'node:fs';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const mode = process.argv[2] ?? 'observe';
const outputPath = process.argv[3] ?? null;
const referencePath = process.argv[4] ?? null;
const b3 = await Box3D();

assert.equal(typeof b3.e2a2sRunBiasedFlatP75GroundCarrier, 'function', 'E2a2s runner missing');
assert.equal(typeof b3.e2a2qResetPairSolveCounter, 'function', 'E2a2q counter reset missing');
assert.equal(typeof b3.e2a2qGetPairSolveCounter, 'function', 'E2a2q counter getter missing');

// Pre-qualified by executed E2a2s1. Do not tune after reversal results.
const REQUESTED_BIAS_METERS = 0.000001; // 0.001 mm
const SPINS = [0, 40];

function runWheel(spin) {
  b3.e2a2qResetPairSolveCounter();
  const raw = b3.e2a2sRunBiasedFlatP75GroundCarrier(0, spin, true, REQUESTED_BIAS_METERS);
  const pairSolveCalls = b3.e2a2qGetPairSolveCounter();

  assert.equal(raw.valid, true, `spin=${spin}: invalid wheel run`);
  assert.ok(Math.abs(raw.requestedSupportBias - REQUESTED_BIAS_METERS) < 1e-10,
    `spin=${spin}: requested bias changed`);
  assert.ok(Number.isFinite(raw.effectiveSupportBias) && raw.effectiveSupportBias > 0,
    `spin=${spin}: effective bias is not nonzero`);
  assert.ok(raw.effectiveSupportBias >= 0.0000009 && raw.effectiveSupportBias <= 0.0000011,
    `spin=${spin}: effective bias left pre-qualified window: ${raw.effectiveSupportBias}`);
  assert.equal(raw.contactDropoutsAfterImpulse, 0, `spin=${spin}: contact dropout`);
  assert.equal(raw.minPointCountAfterImpulse, 2, `spin=${spin}: left two-point regime`);
  assert.equal(raw.maxPointCountAfterImpulse, 2, `spin=${spin}: unexpected point count`);
  assert.equal(raw.featureSetChangesAfterImpulse, 0, `spin=${spin}: feature-set churn`);
  assert.equal(raw.contactIdChangesAfterImpulse, 0, `spin=${spin}: contact-id churn`);
  assert.equal(raw.settledFeaturePairStable, true, `spin=${spin}: unstable settled pair`);
  assert.ok(raw.settledPairGeometrySamples > 0, `spin=${spin}: no settled pair samples`);
  assert.ok(pairSolveCalls > 0, `spin=${spin}: coupled block path never executed`);

  const separationDelta = Math.abs(
    raw.settledHighFeatureSeparationMean - raw.settledLowFeatureSeparationMean,
  );
  assert.ok(Math.abs(separationDelta - raw.effectiveSupportBias) <= 2e-10,
    `spin=${spin}: measured separation delta does not match effective profile bias`);

  return {
    spin,
    requestedBiasMeters: raw.requestedSupportBias,
    effectiveBiasMeters: raw.effectiveSupportBias,
    minPointCountAfterImpulse: raw.minPointCountAfterImpulse,
    maxPointCountAfterImpulse: raw.maxPointCountAfterImpulse,
    featureSetChangesAfterImpulse: raw.featureSetChangesAfterImpulse,
    contactIdChangesAfterImpulse: raw.contactIdChangesAfterImpulse,
    settledPairGeometrySamples: raw.settledPairGeometrySamples,
    settledFeaturePairStable: raw.settledFeaturePairStable,
    settledLowFeatureId: raw.settledLowFeatureId,
    settledHighFeatureId: raw.settledHighFeatureId,
    settledLowFeatureSeparationMean: raw.settledLowFeatureSeparationMean,
    settledHighFeatureSeparationMean: raw.settledHighFeatureSeparationMean,
    settledSeparationDelta: separationDelta,
    settledLowFeatureNormalImpulseMean: raw.settledLowFeatureNormalImpulseMean,
    settledHighFeatureNormalImpulseMean: raw.settledHighFeatureNormalImpulseMean,
    settledTotalImpulseMean: raw.settledTotalImpulseMean,
    settledTotalImpulseStd: raw.settledTotalImpulseStd,
    settledYRange: raw.settledYRange,
    settledMaxAbsVy: raw.settledMaxAbsVy,
    finalY: raw.finalY,
    finalVy: raw.finalVy,
    finalAngularX: raw.finalAngularX,
    finalAngularY: raw.finalAngularY,
    finalAngularZ: raw.finalAngularZ,
    finalAxisTiltDeg: raw.finalAxisTiltDeg,
    uniqueFeatureIds: raw.uniqueFeatureIds,
    pairSolveCalls,
  };
}

const runs = SPINS.map(runWheel);
const result = {
  mode,
  scope: 'E2a2s2 strict point-order falsifier at the largest E2a2s1 pre-qualified unequal two-point support bias. Same validated E2a2q coupled 2x2 normal solve, horizontal ground, friction=0, X/Y angular lock. Only native wheel-plane manifold point order differs between canonical and reversed builds.',
  requestedBiasMm: REQUESTED_BIAS_METERS * 1000,
  runs,
};

if (referencePath) {
  const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
  assert.equal(reference.requestedBiasMm, result.requestedBiasMm, 'reference bias changed');
  assert.equal(reference.runs.length, result.runs.length, 'reference run count changed');

  result.referenceMode = reference.mode;
  result.deltaFromReference = result.runs.map((run, index) => {
    const ref = reference.runs[index];
    assert.equal(run.spin, ref.spin, `spin index ${index}: spin changed`);
    assert.deepEqual(run.uniqueFeatureIds, ref.uniqueFeatureIds, `spin=${run.spin}: feature IDs changed`);
    assert.equal(run.minPointCountAfterImpulse, ref.minPointCountAfterImpulse, `spin=${run.spin}: min point count changed`);
    assert.equal(run.maxPointCountAfterImpulse, ref.maxPointCountAfterImpulse, `spin=${run.spin}: max point count changed`);
    assert.equal(run.pairSolveCalls, ref.pairSolveCalls, `spin=${run.spin}: pair-solve call count changed`);
    assert.ok(Math.abs(run.effectiveBiasMeters - ref.effectiveBiasMeters) <= 1e-12,
      `spin=${run.spin}: effective bias changed under reversal`);

    return {
      spin: run.spin,
      finalY: run.finalY - ref.finalY,
      finalVy: run.finalVy - ref.finalVy,
      finalAngularX: run.finalAngularX - ref.finalAngularX,
      finalAngularY: run.finalAngularY - ref.finalAngularY,
      finalAngularZ: run.finalAngularZ - ref.finalAngularZ,
      finalAxisTiltDeg: run.finalAxisTiltDeg - ref.finalAxisTiltDeg,
      lowSeparation: run.settledLowFeatureSeparationMean - ref.settledLowFeatureSeparationMean,
      highSeparation: run.settledHighFeatureSeparationMean - ref.settledHighFeatureSeparationMean,
      separationDelta: run.settledSeparationDelta - ref.settledSeparationDelta,
      lowImpulseMean: run.settledLowFeatureNormalImpulseMean - ref.settledLowFeatureNormalImpulseMean,
      highImpulseMean: run.settledHighFeatureNormalImpulseMean - ref.settledHighFeatureNormalImpulseMean,
      totalImpulseMean: run.settledTotalImpulseMean - ref.settledTotalImpulseMean,
      settledYRange: run.settledYRange - ref.settledYRange,
      settledMaxAbsVy: run.settledMaxAbsVy - ref.settledMaxAbsVy,
    };
  });
}

if (outputPath) {
  fs.writeFileSync(outputPath, `${JSON.stringify(result)}\n`, 'utf8');
}

// Emit evidence before applying the reversal-invariance acceptance bounds.
console.log(`E2A2S2_MICRO_UNEQUAL_ORDER_RESULT ${JSON.stringify(result)}`);

if (result.deltaFromReference) {
  for (const delta of result.deltaFromReference) {
    assert.ok(Math.abs(delta.finalY) <= 1e-7, `spin=${delta.spin}: reversal finalY delta too large: ${delta.finalY}`);
    assert.ok(Math.abs(delta.finalVy) <= 1e-6, `spin=${delta.spin}: reversal finalVy delta too large: ${delta.finalVy}`);
    assert.ok(Math.abs(delta.finalAngularX) <= 1e-8, `spin=${delta.spin}: reversal angularX delta too large`);
    assert.ok(Math.abs(delta.finalAngularY) <= 1e-8, `spin=${delta.spin}: reversal angularY delta too large`);
    assert.ok(Math.abs(delta.finalAxisTiltDeg) <= 1e-7, `spin=${delta.spin}: reversal tilt delta too large`);
    assert.ok(Math.abs(delta.lowSeparation) <= 2e-7, `spin=${delta.spin}: reversal low separation delta too large`);
    assert.ok(Math.abs(delta.highSeparation) <= 2e-7, `spin=${delta.spin}: reversal high separation delta too large`);
    assert.ok(Math.abs(delta.separationDelta) <= 2e-7, `spin=${delta.spin}: reversal separation-delta change too large`);
    assert.ok(Math.abs(delta.lowImpulseMean) <= 1e-6, `spin=${delta.spin}: reversal low impulse change too large`);
    assert.ok(Math.abs(delta.highImpulseMean) <= 1e-6, `spin=${delta.spin}: reversal high impulse change too large`);
    assert.ok(Math.abs(delta.totalImpulseMean) <= 1e-6, `spin=${delta.spin}: reversal total impulse change too large`);
  }
}

console.log(`E2A2S2_MICRO_UNEQUAL_ORDER_EXECUTED ${mode}`);
