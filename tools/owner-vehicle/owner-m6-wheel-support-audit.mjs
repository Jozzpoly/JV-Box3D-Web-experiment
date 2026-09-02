import { DONOR_LINEAR_SLOP_METERS } from './owner-m6-wheel-profile-candidates.mjs';

const EPS = 1e-12;
const DEFAULT_RADIAL_DIRECTIONS = 72;
const DEFAULT_TILT_STEP_DEGREES = 5;

function fail(message) {
  throw new Error(`Owner M6 wheel support audit rejected: ${message}`);
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function finite(value, label) {
  if (!Number.isFinite(value)) fail(`${label} must be finite`);
  return value;
}

function positiveInteger(value, fallback, label) {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved < 1) fail(`${label} must be a positive integer`);
  return resolved;
}

function quantile(sortedValues, fraction) {
  if (sortedValues.length === 0) return null;
  if (sortedValues.length === 1) return sortedValues[0];
  const position = (sortedValues.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedValues[lower];
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (position - lower);
}

function summarizeErrors(errors) {
  if (errors.length === 0) fail('support comparison produced no observations');
  const absolute = errors.map((value) => Math.abs(value));
  const outside = errors.map((value) => Math.max(0, value));
  const inset = errors.map((value) => Math.max(0, -value));
  const sortedAbsolute = [...absolute].sort((a, b) => a - b);
  const sum = (values) => values.reduce((total, value) => total + value, 0);
  const rateOver = (values, threshold) =>
    values.filter((value) => value > threshold).length / values.length;

  return Object.freeze({
    observationCount: errors.length,
    signedMeanError: sum(errors) / errors.length,
    meanAbsoluteError: sum(absolute) / absolute.length,
    p95AbsoluteError: quantile(sortedAbsolute, 0.95),
    maxAbsoluteError: sortedAbsolute[sortedAbsolute.length - 1],
    meanOutsideEnvelope: sum(outside) / outside.length,
    maxOutsideEnvelope: Math.max(...outside),
    outsideOverLinearSlopRate: rateOver(outside, DONOR_LINEAR_SLOP_METERS),
    meanInsetFromEnvelope: sum(inset) / inset.length,
    maxInsetFromEnvelope: Math.max(...inset),
    insetOverLinearSlopRate: rateOver(inset, DONOR_LINEAR_SLOP_METERS),
  });
}

function makeTiltDegrees(stepDegrees) {
  if (!(stepDegrees > 0) || stepDegrees > 90) fail('tiltStepDegrees must be in (0, 90]');
  const values = [];
  for (let degrees = -90; degrees < 90 - EPS; degrees += stepDegrees) {
    values.push(Number(degrees.toFixed(10)));
  }
  if (Math.abs(values[values.length - 1] - 90) > EPS) values.push(90);
  return values;
}

function uniqueSupportPoints(rigidParts, report) {
  const matches = rigidParts.rigidPieces.filter((piece) => piece.jointName === 'Tire');
  if (matches.length !== 1) fail(`expected exactly one rigid Tire piece, found ${matches.length}`);
  const tire = matches[0];
  const frame = report?.frame;
  if (
    !frame ||
    !Array.isArray(frame.authoredCenter) ||
    !Array.isArray(frame.authoredRadial) ||
    !Array.isArray(frame.authoredAxle) ||
    !Array.isArray(frame.authoredTangent)
  ) {
    fail('verified wheel-frame report is required');
  }

  const transformed = new Map();
  const toWheelPoint = (point) => {
    const delta = sub(point, frame.authoredCenter);
    return [
      dot(delta, frame.authoredRadial) * frame.radialScale,
      dot(delta, frame.authoredAxle) * frame.axialScale,
      dot(delta, frame.authoredTangent) * frame.radialScale,
    ];
  };

  for (const primitive of tire.primitives) {
    for (const vertexIndex of primitive.indices) {
      const point = toWheelPoint([
        primitive.positions[vertexIndex * 3],
        primitive.positions[vertexIndex * 3 + 1],
        primitive.positions[vertexIndex * 3 + 2],
      ]);
      const key = point.map((value) => value.toFixed(12)).join(',');
      if (!transformed.has(key)) transformed.set(key, Object.freeze(point));
    }
  }

  if (transformed.size === 0) fail('Tire support cloud is empty');
  return Object.freeze([...transformed.values()]);
}

function realSupport(points, direction) {
  let best = -Infinity;
  for (const point of points) best = Math.max(best, dot(point, direction));
  if (!Number.isFinite(best)) fail('real Tire support is invalid');
  return best;
}

export function evaluateB3WheelSupportV1(candidate, axialComponent, radialLength) {
  finite(axialComponent, 'axialComponent');
  finite(radialLength, 'radialLength');
  if (!(radialLength >= 0)) fail('radialLength must be non-negative');
  if (!candidate || !Array.isArray(candidate.profile) || candidate.profile.length < 1) {
    fail('candidate profile is required');
  }

  let best = -Infinity;
  for (const point of candidate.profile) {
    best = Math.max(best, point[0] * axialComponent + point[1] * radialLength);
  }
  if (!Number.isFinite(best)) fail(`candidate ${candidate.id ?? '<unknown>'} support is invalid`);
  return best + finite(candidate.cornerRadius, 'candidate.cornerRadius');
}

function summarizeActualSupport(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return Object.freeze({
    min: sorted[0],
    p25: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    p75: quantile(sorted, 0.75),
    max: sorted[sorted.length - 1],
    spread: sorted[sorted.length - 1] - sorted[0],
  });
}

export function auditOwnerWheelSupportCandidatesV1(
  rigidParts,
  report,
  candidateSet,
  options = {},
) {
  const radialDirectionCount = positiveInteger(
    options.radialDirections,
    DEFAULT_RADIAL_DIRECTIONS,
    'radialDirections',
  );
  const tiltStepDegrees = options.tiltStepDegrees ?? DEFAULT_TILT_STEP_DEGREES;
  const tiltDegrees = makeTiltDegrees(tiltStepDegrees);
  const supportPoints = uniqueSupportPoints(rigidParts, report);
  const candidates = candidateSet?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) fail('candidate set is required');

  const observations = [];
  for (const tilt of tiltDegrees) {
    const radians = (tilt * Math.PI) / 180;
    const axialComponent = Math.sin(radians);
    const radialLength = Math.max(0, Math.cos(radians));
    const samples = [];
    for (let radialIndex = 0; radialIndex < radialDirectionCount; radialIndex += 1) {
      const theta = (2 * Math.PI * radialIndex) / radialDirectionCount;
      const direction = [
        radialLength * Math.cos(theta),
        axialComponent,
        radialLength * Math.sin(theta),
      ];
      samples.push(realSupport(supportPoints, direction));
    }
    observations.push(Object.freeze({
      tiltDegrees: tilt,
      axialComponent,
      radialLength,
      actualSupport: Object.freeze(samples),
      actualSummary: summarizeActualSupport(samples),
    }));
  }

  const results = candidates.map((candidate) => {
    const allErrors = [];
    const byTilt = observations.map((observation) => {
      const candidateSupport = evaluateB3WheelSupportV1(
        candidate,
        observation.axialComponent,
        observation.radialLength,
      );
      const errors = observation.actualSupport.map((actual) => candidateSupport - actual);
      allErrors.push(...errors);
      return Object.freeze({
        tiltDegrees: observation.tiltDegrees,
        axialComponent: observation.axialComponent,
        radialLength: observation.radialLength,
        actualSupport: observation.actualSummary,
        candidateSupport,
        errors: summarizeErrors(errors),
      });
    });

    const radialPlane = byTilt.find((row) => row.tiltDegrees === 0);
    const negativeSide = byTilt[0];
    const positiveSide = byTilt[byTilt.length - 1];
    if (!radialPlane || negativeSide.tiltDegrees !== -90 || positiveSide.tiltDegrees !== 90) {
      fail('support direction grid lost required 0/±90 degree anchors');
    }

    return Object.freeze({
      id: candidate.id,
      source: candidate.source,
      targetStrategy: candidate.targetStrategy,
      cornerRadius: candidate.cornerRadius,
      profileCount: candidate.profileCount,
      uniformTiltGrid: summarizeErrors(allErrors),
      pureRadial: radialPlane,
      negativeAxialSide: negativeSide,
      positiveAxialSide: positiveSide,
      byTilt: Object.freeze(byTilt),
    });
  });

  return Object.freeze({
    method: 'CONVEX_SUPPORT_FUNCTION_DIRECTION_GRID',
    semantics: Object.freeze({
      realTireSupport: 'MAX_DOT_OVER_REFERENCED_TIRE_VERTICES',
      candidateSupport: 'MAX_PROFILE_DOT_PLUS_CORNER_RADIUS',
      radialDirectionCount,
      tiltStepDegrees,
      tiltCount: tiltDegrees.length,
      directionCount: radialDirectionCount * tiltDegrees.length,
      linearSlopMeters: DONOR_LINEAR_SLOP_METERS,
    }),
    supportPointCount: supportPoints.length,
    actualByTilt: Object.freeze(observations.map((observation) => Object.freeze({
      tiltDegrees: observation.tiltDegrees,
      axialComponent: observation.axialComponent,
      radialLength: observation.radialLength,
      support: observation.actualSummary,
    }))),
    candidates: Object.freeze(results),
  });
}
