import { readFile } from 'node:fs/promises';
import { inspectBlockbenchRigidPartsV1 } from './owner-vehicle/blockbench-gltf-rigid-parts.mjs';
import { auditOwnerWheelProfileR3 } from './owner-vehicle/owner-m6-wheel-profile-audit.mjs';

const WHEEL_PATH = new URL('../assets/owner-vehicle/source/Offroad_Big_Wheels.gltf', import.meta.url);
const REQUESTED_RADIUS = 0.514062464;
const REQUESTED_WIDTH = 0.4375;
const HALF_WIDTH = REQUESTED_WIDTH / 2;

const text = await readFile(WHEEL_PATH, 'utf8');
const rigidParts = inspectBlockbenchRigidPartsV1(text, 'Offroad_Big_Wheels.gltf');
const audit = auditOwnerWheelProfileR3(rigidParts, REQUESTED_RADIUS, REQUESTED_WIDTH, {
  angularBins: 72,
  axialBins: 64,
});

if (audit.piece.triangleCount !== 396 || audit.piece.nonDegenerateTriangleCount !== 396) {
  throw new Error(`validated Tire recovery drifted: ${JSON.stringify(audit.piece)}`);
}
if (Math.abs(audit.physical.axialWidth - REQUESTED_WIDTH) > 1e-9) {
  throw new Error(`validated Tire width drifted: ${audit.physical.axialWidth}`);
}
if (!(audit.physical.outerRadius > 0.54 && audit.physical.outerRadius < 0.55)) {
  throw new Error(`validated Tire outer radius is implausible: ${audit.physical.outerRadius}`);
}

function torusOuterRadiusAtAxial(ratio, axial) {
  const crownRadius = ratio * HALF_WIDTH;
  const ringRadius = REQUESTED_RADIUS - crownRadius;
  const capsuleHalfLength = HALF_WIDTH - crownRadius;
  const shoulder = Math.max(Math.abs(axial) - capsuleHalfLength, 0);
  if (shoulder > crownRadius) return null;
  return ringRadius + Math.sqrt(Math.max(0, crownRadius * crownRadius - shoulder * shoulder));
}

function quantile(sorted, fraction) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function stats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    min: sorted[0],
    p25: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    p75: quantile(sorted, 0.75),
    p95: quantile(sorted, 0.95),
    max: sorted.at(-1),
    mean,
    rms: Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length),
  };
}

const fits = [];
for (const ratio of [0.45, 0.55, 0.65, 0.914]) {
  const rows = [];
  for (const bin of audit.axialEnvelope.bins) {
    if (!(bin.intersectionSegmentCount > 0) || bin.outerRadiusMedian === null) continue;
    const torusOuter = torusOuterRadiusAtAxial(ratio, bin.axial);
    if (torusOuter === null) continue;
    rows.push({
      axialMm: bin.axial * 1000,
      angularCoverage: bin.angularCoverage,
      visualMinMm: bin.outerRadiusMin * 1000,
      visualP25Mm: bin.outerRadiusP25 * 1000,
      visualMedianMm: bin.outerRadiusMedian * 1000,
      visualP75Mm: bin.outerRadiusP75 * 1000,
      visualMaxMm: bin.outerRadiusMax * 1000,
      torusOuterMm: torusOuter * 1000,
      torusMinusMinMm: (torusOuter - bin.outerRadiusMin) * 1000,
      torusMinusP25Mm: (torusOuter - bin.outerRadiusP25) * 1000,
      torusMinusMedianMm: (torusOuter - bin.outerRadiusMedian) * 1000,
      torusMinusP75Mm: (torusOuter - bin.outerRadiusP75) * 1000,
      torusMinusMaxMm: (torusOuter - bin.outerRadiusMax) * 1000,
    });
  }
  const vsMin = rows.map((row) => row.torusMinusMinMm);
  const vsP25 = rows.map((row) => row.torusMinusP25Mm);
  const vsMedian = rows.map((row) => row.torusMinusMedianMm);
  const vsP75 = rows.map((row) => row.torusMinusP75Mm);
  const vsMax = rows.map((row) => row.torusMinusMaxMm);
  fits.push({
    ratio,
    crownRadiusMm: ratio * HALF_WIDTH * 1000,
    ringRadiusMm: (REQUESTED_RADIUS - ratio * HALF_WIDTH) * 1000,
    capsuleHalfLengthMm: (HALF_WIDTH - ratio * HALF_WIDTH) * 1000,
    sliceCount: rows.length,
    torusMinusVisualMinMm: stats(vsMin),
    torusMinusVisualP25Mm: stats(vsP25),
    torusMinusVisualMedianMm: stats(vsMedian),
    torusMinusVisualP75Mm: stats(vsP75),
    torusMinusVisualMaxMm: stats(vsMax),
    outsideMinOver5mmSlices: rows.filter((row) => row.torusMinusMinMm > 5).length,
    outsideP25Over5mmSlices: rows.filter((row) => row.torusMinusP25Mm > 5).length,
    outsideMedianOver5mmSlices: rows.filter((row) => row.torusMinusMedianMm > 5).length,
    rows,
  });
}

console.log('TIRE_CROSS_SECTION_AUDIT_RESULT', JSON.stringify({
  method: 'VALIDATED_R3_MARKER_FRAME_AXIAL_ENVELOPE',
  piece: audit.piece,
  frame: audit.frame,
  physical: audit.physical,
  angularEnvelope: {
    binCount: audit.angularEnvelope.binCount,
    coverage: audit.angularEnvelope.coverage,
    outerRadiusMin: audit.angularEnvelope.outerRadiusMin,
    outerRadiusMax: audit.angularEnvelope.outerRadiusMax,
    outerRadiusSpread: audit.angularEnvelope.outerRadiusSpread,
  },
  axialEnvelope: {
    binCount: audit.axialEnvelope.binCount,
    coveredBinCount: audit.axialEnvelope.coveredBinCount,
    coverage: audit.axialEnvelope.coverage,
  },
  fits,
}));
console.log('TIRE_CROSS_SECTION_AUDIT_OK');
