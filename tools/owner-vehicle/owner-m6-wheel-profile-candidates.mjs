const EPS = 1e-9;
export const DONOR_LINEAR_SLOP_METERS = 0.005;
export const DONOR_MIN_PROFILE_SPACING_METERS = 2 * DONOR_LINEAR_SLOP_METERS;
export const DONOR_MAX_PROFILE_POINTS = 8;

const TARGET_STRATEGIES = Object.freeze([
  Object.freeze({ id: 'lower-quartile', field: 'outerRadiusP25' }),
  Object.freeze({ id: 'median', field: 'outerRadiusMedian' }),
  Object.freeze({ id: 'upper-quartile', field: 'outerRadiusP75' }),
  Object.freeze({ id: 'outer-envelope', field: 'outerRadiusMax' }),
]);

const CORNER_RADIUS_SWEEP_METERS = Object.freeze([
  0,
  DONOR_LINEAR_SLOP_METERS,
  DONOR_MIN_PROFILE_SPACING_METERS,
  0.02,
  0.03,
  0.04,
]);

function fail(message) {
  throw new Error(`Owner M6 wheel profile candidate rejected: ${message}`);
}

function finite(value, label) {
  if (!Number.isFinite(value)) fail(`${label} must be finite`);
  return value;
}

function lineYAtX(a, b, x) {
  const dx = b[0] - a[0];
  if (Math.abs(dx) <= EPS) return Math.max(a[1], b[1]);
  const t = (x - a[0]) / dx;
  return a[1] + (b[1] - a[1]) * t;
}

function upperHull(points) {
  const sorted = points
    .map(([x, y]) => [finite(x, 'profile x'), Math.max(0, finite(y, 'profile y'))])
    .sort((a, b) => a[0] - b[0]);
  const unique = [];
  for (const point of sorted) {
    const previous = unique[unique.length - 1];
    if (previous && point[0] - previous[0] <= 1e-6) {
      if (point[1] > previous[1]) previous[1] = point[1];
    } else {
      unique.push(point);
    }
  }
  const hull = [];
  for (const point of unique) {
    while (hull.length >= 2) {
      const o = hull[hull.length - 2];
      const a = hull[hull.length - 1];
      const cross =
        (a[0] - o[0]) * (point[1] - o[1]) -
        (a[1] - o[1]) * (point[0] - o[0]);
      if (cross < 0) break;
      hull.pop();
    }
    hull.push(point);
  }
  return hull;
}

function simplifyUpperHull(points, maxPoints = DONOR_MAX_PROFILE_POINTS) {
  const simplified = points.map((point) => [...point]);
  while (simplified.length > maxPoints) {
    let removeIndex = -1;
    let smallestLoss = Infinity;
    for (let index = 1; index < simplified.length - 1; index += 1) {
      const previous = simplified[index - 1];
      const point = simplified[index];
      const next = simplified[index + 1];
      const chordY = lineYAtX(previous, next, point[0]);
      const loss = Math.max(0, point[1] - chordY);
      if (loss < smallestLoss) {
        smallestLoss = loss;
        removeIndex = index;
      }
    }
    if (removeIndex < 0) fail('cannot simplify profile to donor point budget');
    simplified.splice(removeIndex, 1);
  }
  return simplified;
}

export function normalizeB3WheelProfileV1(points) {
  let profile = upperHull(points.slice(0, DONOR_MAX_PROFILE_POINTS));
  if (profile.length === 0) profile = [[0, 0]];

  const tooFine = profile.some(
    (point, index) =>
      index > 0 &&
      point[0] - profile[index - 1][0] < DONOR_MIN_PROFILE_SPACING_METERS,
  );
  if (tooFine && profile.length > 2) {
    const first = profile[0];
    const last = profile[profile.length - 1];
    let peak = profile[0];
    for (const point of profile.slice(1, -1)) {
      if (point[1] > peak[1]) peak = point;
    }
    const thinned = [first];
    if (
      peak !== first &&
      peak !== last &&
      peak[0] - first[0] >= DONOR_MIN_PROFILE_SPACING_METERS &&
      last[0] - peak[0] >= DONOR_MIN_PROFILE_SPACING_METERS
    ) {
      thinned.push(peak);
    }
    if (last[0] - first[0] >= DONOR_MIN_PROFILE_SPACING_METERS) {
      thinned.push(last);
    } else if (last[1] > first[1]) {
      thinned[0] = last;
    }
    profile = thinned;
  }

  return Object.freeze(profile.map((point) => Object.freeze([...point])));
}

function lineIntersection(a1, a2, b1, b2) {
  const dax = a2[0] - a1[0];
  const day = a2[1] - a1[1];
  const dbx = b2[0] - b1[0];
  const dby = b2[1] - b1[1];
  const determinant = dax * dby - day * dbx;
  if (Math.abs(determinant) <= EPS) return null;
  const rx = b1[0] - a1[0];
  const ry = b1[1] - a1[1];
  const t = (rx * dby - ry * dbx) / determinant;
  return [a1[0] + t * dax, a1[1] + t * day];
}

function inwardOffsetSegment(a, b, cornerRadius) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const segmentLength = Math.hypot(dx, dy);
  if (!(segmentLength > EPS)) fail('target profile contains a degenerate segment');
  const outwardNormal = [-dy / segmentLength, dx / segmentLength];
  const inward = [-cornerRadius * outwardNormal[0], -cornerRadius * outwardNormal[1]];
  return [
    [a[0] + inward[0], a[1] + inward[1]],
    [b[0] + inward[0], b[1] + inward[1]],
  ];
}

function erodeUpperTargetV1(outerProfile, cornerRadius) {
  if (cornerRadius <= EPS) return outerProfile.map((point) => [...point]);
  if (outerProfile.length < 2) fail('outer target needs at least two points for corner sweep');

  const segments = [];
  for (let index = 0; index < outerProfile.length - 1; index += 1) {
    segments.push(inwardOffsetSegment(outerProfile[index], outerProfile[index + 1], cornerRadius));
  }

  const leftX = outerProfile[0][0] + cornerRadius;
  const rightX = outerProfile[outerProfile.length - 1][0] - cornerRadius;
  if (!(rightX - leftX >= DONOR_MIN_PROFILE_SPACING_METERS)) {
    fail(`corner radius ${cornerRadius} consumes the target width`);
  }

  const core = [];
  core.push([leftX, lineYAtX(segments[0][0], segments[0][1], leftX)]);
  for (let index = 1; index < segments.length; index += 1) {
    const intersection = lineIntersection(
      segments[index - 1][0],
      segments[index - 1][1],
      segments[index][0],
      segments[index][1],
    );
    if (intersection === null) fail('adjacent inward-offset profile segments are parallel');
    core.push(intersection);
  }
  core.push([
    rightX,
    lineYAtX(segments[segments.length - 1][0], segments[segments.length - 1][1], rightX),
  ]);

  if (core.some((point) => !Number.isFinite(point[0]) || !Number.isFinite(point[1]) || point[1] < 0)) {
    fail(`corner radius ${cornerRadius} produced an invalid eroded core`);
  }
  return core;
}

export function evaluateB3WheelOuterRadiusV1(profileInput, cornerRadius, axial) {
  const profile = normalizeB3WheelProfileV1(profileInput);
  if (!(cornerRadius >= 0)) fail('cornerRadius must be non-negative');
  const minAxial = profile[0][0] - cornerRadius;
  const maxAxial = profile[profile.length - 1][0] + cornerRadius;
  if (axial < minAxial - EPS || axial > maxAxial + EPS) return null;

  let best = -Infinity;
  for (const point of profile) {
    const dx = axial - point[0];
    if (Math.abs(dx) <= cornerRadius + EPS) {
      const inside = Math.max(0, cornerRadius * cornerRadius - dx * dx);
      best = Math.max(best, point[1] + Math.sqrt(inside));
    }
  }

  for (let index = 0; index < profile.length - 1; index += 1) {
    const a = profile[index];
    const b = profile[index + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const segmentLength = Math.hypot(dx, dy);
    if (!(segmentLength > EPS)) continue;
    const outwardNormal = [-dy / segmentLength, dx / segmentLength];
    const offsetA = [
      a[0] + cornerRadius * outwardNormal[0],
      a[1] + cornerRadius * outwardNormal[1],
    ];
    const offsetB = [
      b[0] + cornerRadius * outwardNormal[0],
      b[1] + cornerRadius * outwardNormal[1],
    ];
    const minX = Math.min(offsetA[0], offsetB[0]) - EPS;
    const maxX = Math.max(offsetA[0], offsetB[0]) + EPS;
    if (axial >= minX && axial <= maxX) {
      best = Math.max(best, lineYAtX(offsetA, offsetB, axial));
    }
  }

  return Number.isFinite(best) ? best : null;
}

export function makeFlatB3WheelProfileV1(radius, halfWidth, cornerRadius) {
  const coreRadius = Math.max(0, radius - cornerRadius);
  const coreHalfWidth = Math.max(0, halfWidth - cornerRadius);
  if (coreHalfWidth <= EPS) return normalizeB3WheelProfileV1([[0, coreRadius]]);
  return normalizeB3WheelProfileV1([
    [-coreHalfWidth, coreRadius],
    [coreHalfWidth, coreRadius],
  ]);
}

function quantile(sortedValues, fraction) {
  if (sortedValues.length === 0) return null;
  const position = (sortedValues.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedValues[lower];
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (position - lower);
}

function candidateBounds(profile, cornerRadius) {
  let radius = 0;
  let halfWidth = 0;
  for (const point of profile) {
    radius = Math.max(radius, point[1]);
    halfWidth = Math.max(halfWidth, Math.abs(point[0]));
  }
  return Object.freeze({
    radius: radius + cornerRadius,
    halfWidth: halfWidth + cornerRadius,
    width: 2 * (halfWidth + cornerRadius),
  });
}

export function compareB3WheelCandidateToAuditV1(report, candidate) {
  const outside = [];
  const inset = [];
  const absolute = [];
  const signed = [];
  let missingSliceCount = 0;

  for (const bin of report.axialEnvelope.bins) {
    const candidateRadius = evaluateB3WheelOuterRadiusV1(
      candidate.profile,
      candidate.cornerRadius,
      bin.axial,
    );
    if (candidateRadius === null) {
      missingSliceCount += 1;
      continue;
    }
    for (const observedRadius of bin.outerRadii) {
      const error = candidateRadius - observedRadius;
      signed.push(error);
      absolute.push(Math.abs(error));
      outside.push(Math.max(0, error));
      inset.push(Math.max(0, -error));
    }
  }

  if (missingSliceCount > 0) fail(`candidate ${candidate.id} misses ${missingSliceCount} audited axial slices`);
  if (signed.length === 0) fail(`candidate ${candidate.id} has no comparable observations`);

  const sortedAbsolute = [...absolute].sort((a, b) => a - b);
  const sum = (values) => values.reduce((total, value) => total + value, 0);
  const countOver = (values, threshold) => values.filter((value) => value > threshold).length;
  const bounds = candidateBounds(candidate.profile, candidate.cornerRadius);

  return Object.freeze({
    observationCount: signed.length,
    missingSliceCount,
    signedMeanError: sum(signed) / signed.length,
    meanAbsoluteError: sum(absolute) / absolute.length,
    p95AbsoluteError: quantile(sortedAbsolute, 0.95),
    maxAbsoluteError: sortedAbsolute[sortedAbsolute.length - 1],
    meanOutsideRubber: sum(outside) / outside.length,
    maxOutsideRubber: Math.max(...outside),
    outsideOverLinearSlopRate:
      countOver(outside, DONOR_LINEAR_SLOP_METERS) / outside.length,
    meanInsetFromRubber: sum(inset) / inset.length,
    maxInsetFromRubber: Math.max(...inset),
    insetOverLinearSlopRate:
      countOver(inset, DONOR_LINEAR_SLOP_METERS) / inset.length,
    candidateRadius: bounds.radius,
    candidateWidth: bounds.width,
    widthError: bounds.width - report.physical.axialWidth,
    radiusErrorVsObservedMaximum: bounds.radius - report.physical.outerRadius,
  });
}

function buildOuterTarget(report, field) {
  const bins = report.axialEnvelope.bins;
  if (!Array.isArray(bins) || bins.length < 2) fail('axial audit bins are required');
  const points = bins.map((bin) => [bin.axial, finite(bin[field], `${field}@${bin.index}`)]);
  points.unshift([report.physical.axialMin, points[0][1]]);
  points.push([report.physical.axialMax, points[points.length - 1][1]]);
  return simplifyUpperHull(upperHull(points));
}

function makeAssetDerivedCandidate(report, strategy, cornerRadius) {
  const targetOuterProfile = buildOuterTarget(report, strategy.field);
  const erodedCore = erodeUpperTargetV1(targetOuterProfile, cornerRadius);
  const profile = normalizeB3WheelProfileV1(erodedCore);
  const candidate = Object.freeze({
    id: `asset-${strategy.id}-c${Math.round(cornerRadius * 1000)}mm`,
    source: 'ASSET_DERIVED',
    targetStatistic: strategy.field,
    targetStrategy: strategy.id,
    cornerRadius,
    targetOuterProfile: Object.freeze(targetOuterProfile.map((point) => Object.freeze([...point]))),
    profile,
    profileCount: profile.length,
  });
  return Object.freeze({
    ...candidate,
    metrics: compareB3WheelCandidateToAuditV1(report, candidate),
  });
}

export function buildOwnerWheelProfileCandidateSetV1(report, currentMode5CornerRadius) {
  if (!report?.axialEnvelope?.bins?.every((bin) => Array.isArray(bin.outerRadii))) {
    fail('audit must retain per-slice angular outer radii');
  }

  const currentCornerRadius = Math.min(
    finite(currentMode5CornerRadius, 'current mode5 corner radius'),
    0.5 * report.frame.requestedWidth,
    report.frame.requestedRadius,
  );
  const currentProfile = makeFlatB3WheelProfileV1(
    report.frame.requestedRadius,
    0.5 * report.frame.requestedWidth,
    currentCornerRadius,
  );
  const currentCandidate = Object.freeze({
    id: 'current-mode5-flat',
    source: 'CURRENT_MODE5_CONTROL',
    targetStatistic: null,
    targetStrategy: null,
    cornerRadius: currentCornerRadius,
    targetOuterProfile: null,
    profile: currentProfile,
    profileCount: currentProfile.length,
  });

  const candidates = [
    Object.freeze({
      ...currentCandidate,
      metrics: compareB3WheelCandidateToAuditV1(report, currentCandidate),
    }),
  ];
  const rejected = [];

  for (const strategy of TARGET_STRATEGIES) {
    for (const cornerRadius of CORNER_RADIUS_SWEEP_METERS) {
      try {
        candidates.push(makeAssetDerivedCandidate(report, strategy, cornerRadius));
      } catch (error) {
        rejected.push(Object.freeze({
          id: `asset-${strategy.id}-c${Math.round(cornerRadius * 1000)}mm`,
          reason: error instanceof Error ? error.message : String(error),
        }));
      }
    }
  }

  return Object.freeze({
    donorSemantics: Object.freeze({
      maxProfilePoints: DONOR_MAX_PROFILE_POINTS,
      linearSlopMeters: DONOR_LINEAR_SLOP_METERS,
      minProfileSpacingMeters: DONOR_MIN_PROFILE_SPACING_METERS,
      profileNormalization: 'SORT_MERGE_UPPER_CONVEX_HULL_THIN_IF_BELOW_2X_LINEAR_SLOP',
      cornerSweep: 'MINKOWSKI_BALL_SWEEP',
    }),
    targetStrategies: TARGET_STRATEGIES,
    cornerRadiusSweepMeters: CORNER_RADIUS_SWEEP_METERS,
    candidates: Object.freeze(candidates),
    rejected: Object.freeze(rejected),
  });
}
