import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2tRunSignedBiasFlatP75GroundCarrier, 'function', 'E2a2t signed carrier missing');
assert.equal(typeof b3.e2a2qResetPairSolveCounter, 'function', 'E2a2q counter reset missing');
assert.equal(typeof b3.e2a2qGetPairSolveCounter, 'function', 'E2a2q counter getter missing');

// Source-model constants from pinned donor wheel_shape.c and the generated E2a2 flat support header.
// Evaluate explicitly as f32 to match the Wasm/C float path.
const f32 = Math.fround;
const FLT_EPSILON_F32 = f32(1.1920928955078125e-7);
const B3_WHEEL_EPS_F32 = f32(1.0e-6);
const FLAT_P75_RADIUS_F32 = f32(0.5455107508534434);
const sourceToleranceMeters = f32(Math.max(
  B3_WHEEL_EPS_F32,
  f32(f32(f32(8.0) * FLT_EPSILON_F32) * f32(f32(1.0) + Math.abs(FLAT_P75_RADIUS_F32))),
));

// Fixed before execution. Values straddle the source-predicted support-feature tolerance.
const requestedBiasesMm = [
  0,
  0.0010,
  0.0012,
  0.0013,
  0.0014,
  0.00145,
  0.00147,
  0.0015,
  0.0016,
  0.0018,
  0.0020,
];
const loweredSides = [-1, 1];
const spins = [0, 40];

function runCase(requestedBiasMm, loweredSide, spin) {
  const requestedBiasMeters = requestedBiasMm / 1000;
  b3.e2a2qResetPairSolveCounter();
  const raw = b3.e2a2tRunSignedBiasFlatP75GroundCarrier(0, spin, true, requestedBiasMeters, loweredSide);
  const pairSolveCalls = b3.e2a2qGetPairSolveCounter();

  assert.equal(raw.valid, true, `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: invalid run`);
  assert.equal(raw.loweredSide, loweredSide, `bias=${requestedBiasMm}: lowered side changed`);
  assert.ok(Number.isFinite(raw.effectiveSupportBias), `bias=${requestedBiasMm}: no effective bias`);

  const effectiveBiasMeters = raw.effectiveSupportBias;
  const predictedPointCount = effectiveBiasMeters <= sourceToleranceMeters ? 2 : 1;

  assert.equal(raw.minPointCountAfterImpulse, predictedPointCount,
    `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: min topology disagrees with pinned source prediction`);
  assert.equal(raw.maxPointCountAfterImpulse, predictedPointCount,
    `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: max topology disagrees with pinned source prediction`);
  assert.equal(raw.contactDropoutsAfterImpulse, 0,
    `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: contact dropout`);
  assert.equal(raw.featureSetChangesAfterImpulse, 0,
    `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: feature-set churn`);
  assert.equal(raw.contactIdChangesAfterImpulse, 0,
    `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: contact-id churn`);
  assert.equal(raw.finalAxisTiltDeg, 0,
    `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: axis tilt`);

  if ( predictedPointCount === 2 ) {
    assert.equal(raw.settledFeaturePairStable, true,
      `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: unstable pair`);
    assert.ok(raw.settledPairGeometrySamples > 0,
      `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: no pair samples`);
    assert.ok(pairSolveCalls > 0,
      `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: pair solver inactive in predicted two-point regime`);
  } else {
    assert.equal(pairSolveCalls, 0,
      `bias=${requestedBiasMm} side=${loweredSide} spin=${spin}: pair solver active in predicted one-point regime`);
  }

  return {
    requestedBiasMm,
    loweredSide,
    spin,
    effectiveBiasMicrometers: effectiveBiasMeters * 1e6,
    sourceToleranceMicrometers: sourceToleranceMeters * 1e6,
    predictedPointCount,
    observedMinPointCount: raw.minPointCountAfterImpulse,
    observedMaxPointCount: raw.maxPointCountAfterImpulse,
    pairSolveCalls,
    uniqueFeatureIds: raw.uniqueFeatureIds,
    settledPairGeometrySamples: raw.settledPairGeometrySamples,
    settledLowFeatureId: raw.settledLowFeatureId,
    settledHighFeatureId: raw.settledHighFeatureId,
    settledLowFeatureSeparationMean: raw.settledLowFeatureSeparationMean,
    settledHighFeatureSeparationMean: raw.settledHighFeatureSeparationMean,
    settledLowFeatureNormalImpulseMean: raw.settledLowFeatureNormalImpulseMean,
    settledHighFeatureNormalImpulseMean: raw.settledHighFeatureNormalImpulseMean,
    settledTotalImpulseMean: raw.settledTotalImpulseMean,
    finalY: raw.finalY,
    finalVy: raw.finalVy,
    finalAngularZ: raw.finalAngularZ,
  };
}

const rows = [];
for ( const requestedBiasMm of requestedBiasesMm ) {
  for ( const loweredSide of loweredSides ) {
    for ( const spin of spins ) {
      rows.push(runCase(requestedBiasMm, loweredSide, spin));
    }
  }
}

// Sign symmetry is a topology contract here: lowering left or right by the same effective amount
// must classify identically. We compare every matching bias/spin pair.
for ( const requestedBiasMm of requestedBiasesMm ) {
  for ( const spin of spins ) {
    const left = rows.find((row) => row.requestedBiasMm === requestedBiasMm && row.loweredSide === -1 && row.spin === spin);
    const right = rows.find((row) => row.requestedBiasMm === requestedBiasMm && row.loweredSide === 1 && row.spin === spin);
    assert.ok(left && right);
    assert.ok(Math.abs(left.effectiveBiasMicrometers - right.effectiveBiasMicrometers) <= 1e-9,
      `bias=${requestedBiasMm} spin=${spin}: effective bias is not sign symmetric`);
    assert.equal(left.observedMinPointCount, right.observedMinPointCount,
      `bias=${requestedBiasMm} spin=${spin}: topology is not sign symmetric`);
    assert.equal(left.observedMaxPointCount, right.observedMaxPointCount,
      `bias=${requestedBiasMm} spin=${spin}: topology max is not sign symmetric`);
  }
}

const twoPointEffective = rows.filter((row) => row.observedMinPointCount === 2).map((row) => row.effectiveBiasMicrometers);
const onePointEffective = rows.filter((row) => row.observedMinPointCount === 1).map((row) => row.effectiveBiasMicrometers);
const largestObservedTwoPointMicrometers = Math.max(...twoPointEffective);
const smallestObservedOnePointMicrometers = Math.min(...onePointEffective);

const result = {
  scope: 'E2a2t source-predicted native wheel-plane support-feature transition falsifier. Topology prediction is derived before execution from pinned b3WheelProfileSupportFeature tolerance; both axial endpoint signs and spin 0/40 are tested. No threshold tuning after results.',
  sourceModel: {
    b3WheelEpsMicrometers: B3_WHEEL_EPS_F32 * 1e6,
    flatP75RadiusMetersF32: FLAT_P75_RADIUS_F32,
    supportToleranceMicrometers: sourceToleranceMeters * 1e6,
    rule: 'effective support-value difference <= tolerance => segment/two points; > tolerance => unique vertex/one point',
  },
  requestedBiasesMm,
  loweredSides,
  spins,
  largestObservedTwoPointMicrometers,
  smallestObservedOnePointMicrometers,
  rows,
};

console.log(`E2A2T_SOURCE_PREDICTED_TRANSITION_RESULT ${JSON.stringify(result)}`);
console.log('E2A2T_SOURCE_PREDICTED_TRANSITION_EXECUTED');
