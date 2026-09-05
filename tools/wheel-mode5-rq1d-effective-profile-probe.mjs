import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e2aOuterP75CarrierInfo, 'function', 'E2a carrier info binding missing');

const info = b3.e2aOuterP75CarrierInfo();
assert.equal(info.valid, true, `outer P75 carrier unavailable: ${JSON.stringify(info)}`);
assert.ok(Array.isArray(info.profile), `effective profile missing: ${JSON.stringify(info)}`);
assert.ok(info.profile.length >= 1, 'effective profile empty');

const FLT_EPSILON = 1.1920928955078125e-7;
const scoreAtBank = (point, bankMicroradians) => {
  const theta = bankMicroradians * 1e-6;
  const axial = -Math.sin(theta);
  const radial = Math.cos(theta);
  return point.axial * axial + point.radius * radial;
};

const classify = (bankMicroradians) => {
  const values = info.profile.map((p) => scoreAtBank(p, bankMicroradians));
  const bestValue = Math.max(...values);
  const tolerance = Math.max(1e-6, 8 * FLT_EPSILON * (1 + Math.abs(bestValue)));
  const winners = values
    .map((value, index) => ({ index, value, deltaFromBest: value - bestValue }))
    .filter((row) => Math.abs(row.value - bestValue) <= tolerance);
  return { bankMicroradians, bestValue, tolerance, values, winners };
};

const flat = classify(0);
const centerIndex = flat.values.indexOf(Math.max(...flat.values));
const center = info.profile[centerIndex];

const equalityAngles = info.profile
  .map((point, index) => {
    if (index === centerIndex) return null;
    const dx = point.axial - center.axial;
    const dr = point.radius - center.radius;
    if (Math.abs(dx) < 1e-15) return null;
    const theta = Math.atan(dr / dx);
    return {
      againstIndex: index,
      dx,
      dr,
      equalityRadians: theta,
      equalityMicroradians: theta * 1e6,
      equalityDegrees: theta * 180 / Math.PI,
    };
  })
  .filter(Boolean);

const result = {
  method: 'RQ1D_EFFECTIVE_DONOR_PROFILE_SUPPORT_PROBE',
  carrier: {
    rawHullCount: info.rawHullCount,
    effectiveProfileCount: info.effectiveProfileCount,
    sourceOuterMax: info.sourceOuterMax,
    effectiveOuterMax: info.effectiveOuterMax,
    supportRadiusDown: info.supportRadiusDown,
    supportAxialDown: info.supportAxialDown,
    plateauAxialMin: info.plateauAxialMin,
    plateauAxialMax: info.plateauAxialMax,
    profile: info.profile,
  },
  flatBestIndex: centerIndex,
  equalityAngles,
  classifications: [classify(0), classify(10), classify(-10), classify(1000), classify(-1000)],
};

console.log('WHEEL_MODE5_RQ1D_EFFECTIVE_PROFILE_PROBE', JSON.stringify(result));
console.log('WHEEL_MODE5_RQ1D_EFFECTIVE_PROFILE_PROBE_EXECUTED');
