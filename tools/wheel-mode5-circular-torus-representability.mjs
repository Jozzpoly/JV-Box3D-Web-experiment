import { readFile } from 'node:fs/promises';
import { validatePinnedNativeFactoryReceiptText } from '../.test-dist/config/native-factory-receipt.js';
import { m6TopologyConfigFromReceipt } from '../.test-dist/vehicle/m6/m6-topology-config.js';
import {
  MODE5_SOLVER_AWARE_PROFILE,
  MODE5_SOLVER_AWARE_PROFILE_CORNER_RADIUS,
} from '../.test-dist/vehicle/m6/mode5-wheel-backend.js';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile('public/receipts/jv_m6_factory_receipt.json', 'utf8'),
);
const config = m6TopologyConfigFromReceipt(receipt);
const tire = await loadOwnerM6TireGeometryR3();
const radius = config.wheelRadius;
const halfWidth = 0.5 * config.wheelWidth;

function torusSlice(ratio, axial) {
  const crown = ratio * halfWidth;
  const ring = radius - crown;
  const halfLength = halfWidth - crown;
  const extra = Math.max(Math.abs(axial) - halfLength, 0);
  if (!(crown > 0) || !(ring > 0) || halfLength < 0 || extra > crown + 1e-12) return null;
  const radial = Math.sqrt(Math.max(0, crown * crown - extra * extra));
  return {
    inner: ring - radial,
    outer: ring + radial,
    crown,
    ring,
    halfLength,
  };
}
function stats(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const q = (fraction) => {
    const position = (sorted.length - 1) * fraction;
    const lo = Math.floor(position), hi = Math.ceil(position);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (position - lo);
  };
  return { min: sorted[0], p05: q(0.05), median: q(0.5), p95: q(0.95), max: sorted.at(-1), mean };
}
function ratioRow(ratio) {
  const outerErrors = [];
  const outerStations = [];
  for (const point of MODE5_SOLVER_AWARE_PROFILE) {
    const slice = torusSlice(ratio, point.x);
    if (!slice) continue;
    const target = point.y + MODE5_SOLVER_AWARE_PROFILE_CORNER_RADIUS;
    const error = slice.outer - target;
    outerErrors.push(error);
    outerStations.push({ axial: point.x, target, candidate: slice.outer, error });
  }

  const innerErrors = [];
  const innerStations = [];
  const stationCount = 129;
  for (let i = 0; i < stationCount; i += 1) {
    // Stay half a bin inside the authored side planes. A circular torus collapses
    // to its ring center at the exact width extrema, while the visual mesh has a
    // finite sidewall; sampling the open interior avoids letting that singular
    // endpoint dominate the whole representability score.
    const axial = tire.bounds.axialMin + ((i + 0.5) / stationCount) * tire.bounds.axialWidth;
    const visualInner = tire.innerRadiusAt(axial);
    const slice = torusSlice(ratio, axial);
    if (visualInner === null || slice === null) continue;
    const error = slice.inner - visualInner;
    innerErrors.push(error);
    innerStations.push({ axial, target: visualInner, candidate: slice.inner, error });
  }

  const maxOuterAbs = Math.max(...outerErrors.map(Math.abs));
  const maxInnerAbs = Math.max(...innerErrors.map(Math.abs));
  const rmsOuter = Math.sqrt(outerErrors.reduce((sum, value) => sum + value * value, 0) / outerErrors.length);
  const rmsInner = Math.sqrt(innerErrors.reduce((sum, value) => sum + value * value, 0) / innerErrors.length);
  const central = torusSlice(ratio, 0);
  return {
    ratio,
    dimensions: central ? {
      crownRadius: central.crown,
      ringRadius: central.ring,
      capsuleHalfLength: central.halfLength,
      centralInnerRadius: central.inner,
      centralOuterRadius: central.outer,
    } : null,
    outer: {
      maxAbsError: maxOuterAbs,
      rmsError: rmsOuter,
      signedError: stats(outerErrors),
      worst: [...outerStations].sort((a, b) => Math.abs(b.error) - Math.abs(a.error)).slice(0, 3),
    },
    inner: {
      maxAbsError: maxInnerAbs,
      rmsError: rmsInner,
      signedError: stats(innerErrors),
      maxHoleOversize: Math.max(0, ...innerErrors),
      maxHoleFill: Math.max(0, ...innerErrors.map((value) => -value)),
      worst: [...innerStations].sort((a, b) => Math.abs(b.error) - Math.abs(a.error)).slice(0, 3),
    },
    combined: {
      maxAbsError: Math.max(maxOuterAbs, maxInnerAbs),
      rmsError: Math.sqrt(0.5 * (rmsOuter * rmsOuter + rmsInner * rmsInner)),
    },
  };
}

const ratios = new Set([0.45, 0.55, 0.65, 0.914]);
for (let ratio = 0.4; ratio <= 0.951; ratio += 0.025) ratios.add(Number(ratio.toFixed(3)));
const rows = [...ratios].sort((a, b) => a - b).map(ratioRow);
const byCombined = [...rows].sort((a, b) => a.combined.maxAbsError - b.combined.maxAbsError || a.combined.rmsError - b.combined.rmsError);
const byOuter = [...rows].sort((a, b) => a.outer.maxAbsError - b.outer.maxAbsError || a.outer.rmsError - b.outer.rmsError);
const byInner = [...rows].sort((a, b) => a.inner.maxAbsError - b.inner.maxAbsError || a.inner.rmsError - b.inner.rmsError);
const under10Both = rows.filter((row) => row.outer.maxAbsError <= 0.01 && row.inner.maxAbsError <= 0.01);
const under20Both = rows.filter((row) => row.outer.maxAbsError <= 0.02 && row.inner.maxAbsError <= 0.02);
const result = {
  provenance: {
    wheelRadius: radius,
    wheelWidth: config.wheelWidth,
    cOuterProfile: MODE5_SOLVER_AWARE_PROFILE,
    cCornerRadius: MODE5_SOLVER_AWARE_PROFILE_CORNER_RADIUS,
    tire: tire.provenance,
  },
  visualInnerAtCenter: tire.innerRadiusAt(0),
  rows,
  bestCombined: byCombined.slice(0, 5),
  bestOuter: byOuter.slice(0, 5),
  bestInner: byInner.slice(0, 5),
  under10mmBoth: under10Both.map((row) => row.ratio),
  under20mmBoth: under20Both.map((row) => row.ratio),
  controls: Object.fromEntries([0.45, 0.55, 0.65, 0.914].map((ratio) => [String(ratio), rows.find((row) => row.ratio === ratio)])),
};
console.log('CIRCULAR_TORUS_REPRESENTABILITY', JSON.stringify(result));
console.log('CIRCULAR_TORUS_REPRESENTABILITY_OK');
