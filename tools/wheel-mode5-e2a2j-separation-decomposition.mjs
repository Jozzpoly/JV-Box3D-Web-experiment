import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2a2jProbeSphereSeparationDecomposition, 'function');

const axisNames = ['X-tangent', 'Y-contact-normal', 'Z-tangent'];

function run(spin, axis, substeps) {
  const r = b3.e2a2jProbeSphereSeparationDecomposition(spin, axis, substeps);
  assert.equal(r.valid, true, `invalid E2a2j probe spin=${spin} axis=${axis} substeps=${substeps}`);
  assert.ok(r.contactCount > 0);
  assert.equal(r.pointCount, 1);
  assert.ok(r.startQuatIdentityError < 1e-6);
  assert.ok(Math.abs(r.sphereAnchorLength - r.supportRadius) < 2e-4,
    `sphere anchor radius mismatch: ${r.sphereAnchorLength} vs ${r.supportRadius}`);
  assert.ok(Math.abs(r.normalY) > 0.9999, `ground normal is not vertical: ${JSON.stringify(r)}`);
  return {
    axis,
    axisName: axisNames[axis],
    spin,
    substeps,
    sphereIsA: r.sphereIsA,
    supportRadiusMm: r.supportRadius * 1000,
    normal: [r.normalX, r.normalY, r.normalZ],
    sphereAnchorMm: [r.sphereAnchorX * 1000, r.sphereAnchorY * 1000, r.sphereAnchorZ * 1000],
    sphereAnchorLengthMm: r.sphereAnchorLength * 1000,
    preparedSeparationMm: r.preparedSeparation * 1000,
    baseSeparationMm: r.baseSeparation * 1000,
    translationContributionMm: r.translationContribution * 1000,
    rotationalContributionMm: r.rotationalContribution * 1000,
    reconstructedEndSeparationMm: r.reconstructedEndSeparation * 1000,
    observedRotationAngleDeg: r.observedRotationAngleDeg,
    analyticRotationalContributionMm: r.analyticRotationalContribution * 1000,
    rotationMinusAnalyticMicrometers: r.rotationMinusAnalytic * 1e6,
    normalImpulse: r.normalImpulse,
    totalNormalImpulse: r.totalNormalImpulse,
    deltaYMicrometers: r.deltaY * 1e6,
    finalVy: r.finalVy,
    finalAngular: [r.finalAngularX, r.finalAngularY, r.finalAngularZ],
  };
}

const rows = [];
for (const substeps of [1, 4]) {
  rows.push(run(0, 2, substeps));
  for (const axis of [0, 1, 2]) rows.push(run(40, axis, substeps));
}

const comparisons = [];
for (const substeps of [1, 4]) {
  const x = rows.find((r) => r.spin === 40 && r.axis === 0 && r.substeps === substeps);
  const y = rows.find((r) => r.spin === 40 && r.axis === 1 && r.substeps === substeps);
  const z = rows.find((r) => r.spin === 40 && r.axis === 2 && r.substeps === substeps);
  comparisons.push({
    substeps,
    xRotationMm: x.rotationalContributionMm,
    yRotationMm: y.rotationalContributionMm,
    zRotationMm: z.rotationalContributionMm,
    xAnalyticMm: x.analyticRotationalContributionMm,
    yAnalyticMm: y.analyticRotationalContributionMm,
    zAnalyticMm: z.analyticRotationalContributionMm,
    xMinusAnalyticMicrometers: x.rotationMinusAnalyticMicrometers,
    yMinusAnalyticMicrometers: y.rotationMinusAnalyticMicrometers,
    zMinusAnalyticMicrometers: z.rotationMinusAnalyticMicrometers,
    xzRotationDifferenceMicrometers: (x.rotationalContributionMm - z.rotationalContributionMm) * 1000,
    tangentToNormalContrastMm: 0.5 * (x.rotationalContributionMm + z.rotationalContributionMm) - y.rotationalContributionMm,
    xEndSeparationMm: x.reconstructedEndSeparationMm,
    yEndSeparationMm: y.reconstructedEndSeparationMm,
    zEndSeparationMm: z.reconstructedEndSeparationMm,
  });
}

const result = {
  scope: 'E2a2j read-only decomposition of the pinned solver separation equation using public manifold anchors and observed body transforms; matched native sphere, touching ground, friction=0, dt=1/240',
  equation: 's_end = preparedSeparation + dot(dpB-dpA,n) + dot((R_B rB-rB)-(R_A rA-rA),n)',
  analyticSpherePrediction: 'For tangent-axis spin from a bottom material anchor: R*(1-cos(theta)); for spin about contact normal: 0.',
  comparisons,
  rows,
};

console.log(`E2A2J_SEPARATION_DECOMPOSITION_RESULT ${JSON.stringify(result)}`);
console.log('E2A2J_SEPARATION_DECOMPOSITION_EXECUTED');
