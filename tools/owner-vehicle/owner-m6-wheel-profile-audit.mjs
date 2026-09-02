import { calibrateOwnerWheelR1 } from './owner-m6-visual-calibration-r1.mjs';

const EPS = 1e-12;
const DEFAULT_ANGULAR_BINS = 72;
const DEFAULT_AXIAL_BINS = 32;
const AXIAL_SEGMENT_SAMPLES = 9;

function fail(message) {
  throw new Error(`Owner M6 wheel profile audit rejected: ${message}`);
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function mul(a, scalar) {
  return [a[0] * scalar, a[1] * scalar, a[2] * scalar];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function length(value) {
  return Math.hypot(value[0], value[1], value[2]);
}

function normalize(value, label) {
  const magnitude = length(value);
  if (!(magnitude > EPS)) fail(`${label} is degenerate`);
  return mul(value, 1 / magnitude);
}

function midpoint(a, b) {
  return mul(add(a, b), 0.5);
}

function lerp(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function requireMarker(source, name) {
  if (source.duplicateNodeNames.includes(name)) fail(`marker ${name} is duplicated`);
  const marker = source.uniqueNodeWorldPositions[name];
  if (!Array.isArray(marker) || marker.length !== 3) fail(`marker ${name} is missing`);
  return [...marker];
}

function requirePositiveInteger(value, fallback, label) {
  const resolved = value ?? fallback;
  if (!Number.isInteger(resolved) || resolved < 1) fail(`${label} must be a positive integer`);
  return resolved;
}

function close(actual, expected, tolerance, label) {
  if (Math.abs(actual - expected) > tolerance) {
    fail(`${label} drifted: ${actual} != ${expected}`);
  }
}

function freezeBins(bins) {
  return Object.freeze(bins.map((bin) => Object.freeze({ ...bin })));
}

function triangleArea(a, b, c) {
  return 0.5 * length(cross(sub(b, a), sub(c, a)));
}

function triangleSamples(a, b, c) {
  return [
    a,
    b,
    c,
    midpoint(a, b),
    midpoint(b, c),
    midpoint(c, a),
    mul(add(add(a, b), c), 1 / 3),
  ];
}

function angularIndex(theta, binCount) {
  const normalized = (theta + Math.PI) / (2 * Math.PI);
  return Math.min(binCount - 1, Math.max(0, Math.floor(normalized * binCount)));
}

function samePoint(a, b, tolerance = 1e-10) {
  return length(sub(a, b)) <= tolerance;
}

function uniquePoints(points) {
  const unique = [];
  for (const point of points) {
    if (!unique.some((candidate) => samePoint(candidate, point))) unique.push(point);
  }
  return unique;
}

function farthestPair(points) {
  let best = null;
  let bestDistance = -1;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const distance = length(sub(points[i], points[j]));
      if (distance > bestDistance) {
        bestDistance = distance;
        best = [points[i], points[j]];
      }
    }
  }
  return best;
}

function triangleAxialSegment(triangle, axial) {
  const vertices = [triangle.a, triangle.b, triangle.c];
  const intersections = [];
  for (let i = 0; i < 3; i += 1) {
    const a = vertices[i];
    const b = vertices[(i + 1) % 3];
    const da = a[1] - axial;
    const db = b[1] - axial;
    const aOn = Math.abs(da) <= EPS;
    const bOn = Math.abs(db) <= EPS;
    if (aOn) intersections.push(a);
    if (bOn) intersections.push(b);
    if (!aOn && !bOn && da * db < 0) {
      intersections.push(lerp(a, b, da / (da - db)));
    }
  }
  const unique = uniquePoints(intersections);
  if (unique.length < 2) return null;
  return farthestPair(unique);
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

function buildAxialSliceEnvelope(triangles, minAxial, maxAxial, axialBinCount, angularBinCount) {
  const span = maxAxial - minAxial;
  const bins = [];
  for (let index = 0; index < axialBinCount; index += 1) {
    const axial = minAxial + ((index + 0.5) / axialBinCount) * span;
    const outerByAngle = new Array(angularBinCount).fill(-Infinity);
    let segmentCount = 0;
    let sampleCount = 0;

    for (const triangle of triangles) {
      const segment = triangleAxialSegment(triangle, axial);
      if (segment === null) continue;
      segmentCount += 1;
      for (let sampleIndex = 0; sampleIndex < AXIAL_SEGMENT_SAMPLES; sampleIndex += 1) {
        const t = sampleIndex / (AXIAL_SEGMENT_SAMPLES - 1);
        const point = lerp(segment[0], segment[1], t);
        const radius = Math.hypot(point[0], point[2]);
        const theta = Math.atan2(point[2], point[0]);
        const angleIndex = angularIndex(theta, angularBinCount);
        outerByAngle[angleIndex] = Math.max(outerByAngle[angleIndex], radius);
        sampleCount += 1;
      }
    }

    const outerRadii = outerByAngle
      .filter((radius) => Number.isFinite(radius))
      .sort((a, b) => a - b);
    bins.push({
      index,
      axial,
      intersectionSegmentCount: segmentCount,
      sampleCount,
      coveredAngularBinCount: outerRadii.length,
      angularCoverage: outerRadii.length / angularBinCount,
      outerRadiusMin: quantile(outerRadii, 0),
      outerRadiusP25: quantile(outerRadii, 0.25),
      outerRadiusMedian: quantile(outerRadii, 0.5),
      outerRadiusP75: quantile(outerRadii, 0.75),
      outerRadiusMax: quantile(outerRadii, 1),
      outerRadiusSpread: outerRadii.length > 0 ? outerRadii[outerRadii.length - 1] - outerRadii[0] : null,
    });
  }
  return bins;
}

export function auditOwnerWheelProfileR3(
  rigidParts,
  requestedRadius,
  requestedWidth,
  options = {},
) {
  if (!(requestedRadius > 0) || !(requestedWidth > 0)) {
    fail('requested wheel dimensions must be positive');
  }
  if (!rigidParts || !Array.isArray(rigidParts.rigidPieces) || !rigidParts.source) {
    fail('validated rigid-parts input is required');
  }

  const angularBinCount = requirePositiveInteger(
    options.angularBins,
    DEFAULT_ANGULAR_BINS,
    'angularBins',
  );
  const axialBinCount = requirePositiveInteger(
    options.axialBins,
    DEFAULT_AXIAL_BINS,
    'axialBins',
  );

  const matches = rigidParts.rigidPieces.filter((piece) => piece.jointName === 'Tire');
  if (matches.length !== 1) {
    fail(`expected exactly one rigid Tire piece, found ${matches.length}`);
  }
  const tire = matches[0];
  if (!(tire.triangleCount > 0) || tire.primitives.length === 0) {
    fail('Tire piece contains no triangles');
  }

  const source = rigidParts.source;
  const calibration = calibrateOwnerWheelR1(source, requestedRadius, requestedWidth);
  const widthLeft = requireMarker(source, 'Marker_TireWidthLeft');
  const widthRight = requireMarker(source, 'Marker_TireWidthRight');
  const radiusMarker = requireMarker(source, 'Marker_TireRadiusOuter');
  const authoredCenter = midpoint(widthLeft, widthRight);
  const axleVector = sub(widthRight, widthLeft);
  const authoredWidth = length(axleVector);
  const authoredAxle = normalize(axleVector, 'authored axle');
  const centerToRadius = sub(radiusMarker, authoredCenter);
  const radialWithoutAxial = sub(
    centerToRadius,
    mul(authoredAxle, dot(centerToRadius, authoredAxle)),
  );
  const authoredRadius = length(radialWithoutAxial);
  let authoredRadial = normalize(radialWithoutAxial, 'authored radial');
  const authoredTangent = normalize(cross(authoredAxle, authoredRadial), 'authored tangent');
  authoredRadial = normalize(cross(authoredTangent, authoredAxle), 'corrected authored radial');
  const axialScale = requestedWidth / authoredWidth;
  const radialScale = requestedRadius / authoredRadius;

  close(authoredWidth, calibration.report.authoredWidth, 1e-12, 'authored width');
  close(authoredRadius, calibration.report.authoredRadius, 1e-12, 'authored radius');
  close(axialScale, calibration.report.axialScale, 1e-12, 'axial scale');
  close(radialScale, calibration.report.radialScale, 1e-12, 'radial scale');

  const toWheelPoint = (point) => {
    const delta = sub(point, authoredCenter);
    return [
      dot(delta, authoredRadial) * radialScale,
      dot(delta, authoredAxle) * axialScale,
      dot(delta, authoredTangent) * radialScale,
    ];
  };

  const triangles = [];
  let minAxial = Infinity;
  let maxAxial = -Infinity;
  let minRadius = Infinity;
  let maxRadius = -Infinity;

  for (const primitive of tire.primitives) {
    for (let offset = 0; offset < primitive.indices.length; offset += 3) {
      const points = primitive.indices.slice(offset, offset + 3).map((vertexIndex) =>
        toWheelPoint([
          primitive.positions[vertexIndex * 3],
          primitive.positions[vertexIndex * 3 + 1],
          primitive.positions[vertexIndex * 3 + 2],
        ]),
      );
      const [a, b, c] = points;
      const area = triangleArea(a, b, c);
      if (!(area > EPS)) continue;
      triangles.push(Object.freeze({ a, b, c, area }));
      for (const point of points) {
        const axial = point[1];
        const radius = Math.hypot(point[0], point[2]);
        minAxial = Math.min(minAxial, axial);
        maxAxial = Math.max(maxAxial, axial);
        minRadius = Math.min(minRadius, radius);
        maxRadius = Math.max(maxRadius, radius);
      }
    }
  }

  if (triangles.length === 0 || !Number.isFinite(minAxial) || !Number.isFinite(maxRadius)) {
    fail('Tire geometry produced no non-degenerate physical triangles');
  }

  const angularBins = Array.from({ length: angularBinCount }, (_, index) => ({
    index,
    sampleCount: 0,
    maxRadius: -Infinity,
  }));

  let surfaceArea = 0;
  let weightedRadius = 0;
  let weightedRadiusSquared = 0;
  let weightedAxial = 0;

  for (const triangle of triangles) {
    const centroid = mul(add(add(triangle.a, triangle.b), triangle.c), 1 / 3);
    const centroidRadius = Math.hypot(centroid[0], centroid[2]);
    surfaceArea += triangle.area;
    weightedRadius += centroidRadius * triangle.area;
    weightedRadiusSquared += centroidRadius * centroidRadius * triangle.area;
    weightedAxial += centroid[1] * triangle.area;

    for (const point of triangleSamples(triangle.a, triangle.b, triangle.c)) {
      const radius = Math.hypot(point[0], point[2]);
      const theta = Math.atan2(point[2], point[0]);
      const angular = angularBins[angularIndex(theta, angularBinCount)];
      angular.sampleCount += 1;
      angular.maxRadius = Math.max(angular.maxRadius, radius);
    }
  }

  if (!(surfaceArea > EPS)) fail('Tire surface area is degenerate');
  const meanRadius = weightedRadius / surfaceArea;
  const radiusVariance = Math.max(0, weightedRadiusSquared / surfaceArea - meanRadius * meanRadius);
  const meanAxial = weightedAxial / surfaceArea;

  const coveredAngular = angularBins.filter((bin) => bin.sampleCount > 0);
  const angularOuterRadii = coveredAngular.map((bin) => bin.maxRadius);
  const angularOuterMin = Math.min(...angularOuterRadii);
  const angularOuterMax = Math.max(...angularOuterRadii);
  const axialBins = buildAxialSliceEnvelope(
    triangles,
    minAxial,
    maxAxial,
    axialBinCount,
    angularBinCount,
  );
  const coveredAxial = axialBins.filter((bin) => bin.intersectionSegmentCount > 0);

  return Object.freeze({
    piece: Object.freeze({
      jointName: tire.jointName,
      jointSlot: tire.jointSlot,
      jointNodeIndex: tire.jointNodeIndex,
      primitiveCount: tire.primitives.length,
      triangleCount: tire.triangleCount,
      nonDegenerateTriangleCount: triangles.length,
    }),
    frame: Object.freeze({
      authoredCenter: Object.freeze(authoredCenter),
      authoredAxle: Object.freeze(authoredAxle),
      authoredRadial: Object.freeze(authoredRadial),
      authoredTangent: Object.freeze(authoredTangent),
      authoredWidth,
      authoredRadius,
      requestedWidth,
      requestedRadius,
      axialScale,
      radialScale,
      markerContract: calibration.report.markerContract,
    }),
    physical: Object.freeze({
      surfaceArea,
      axialMin: minAxial,
      axialMax: maxAxial,
      axialWidth: maxAxial - minAxial,
      radialMin: minRadius,
      outerRadius: maxRadius,
      outerRadiusError: maxRadius - requestedRadius,
      axialWidthError: (maxAxial - minAxial) - requestedWidth,
      areaWeightedMeanRadius: meanRadius,
      areaWeightedRadiusStdDev: Math.sqrt(radiusVariance),
      areaWeightedMeanAxial: meanAxial,
    }),
    angularEnvelope: Object.freeze({
      binCount: angularBinCount,
      coveredBinCount: coveredAngular.length,
      coverage: coveredAngular.length / angularBinCount,
      outerRadiusMin: angularOuterMin,
      outerRadiusMax: angularOuterMax,
      outerRadiusSpread: angularOuterMax - angularOuterMin,
      bins: freezeBins(angularBins.map((bin) => ({
        ...bin,
        maxRadius: bin.sampleCount > 0 ? bin.maxRadius : null,
      }))),
    }),
    axialEnvelope: Object.freeze({
      method: 'TRIANGLE_PLANE_INTERSECTION_WITH_ANGULAR_OUTER_ENVELOPE',
      binCount: axialBinCount,
      coveredBinCount: coveredAxial.length,
      coverage: coveredAxial.length / axialBinCount,
      segmentSampleCount: AXIAL_SEGMENT_SAMPLES,
      bins: freezeBins(axialBins),
    }),
    provenance: Object.freeze({
      sourceLabel: source.label,
      sourceAuthority: calibration.report.sourceAuthority,
      extraction: 'inspectBlockbenchRigidPartsV1:Tire',
      coordinateFrame: 'R1_VERIFIED_WHEEL_MARKERS',
      angularEnvelopeSampling: 'TRIANGLE_VERTICES_EDGE_MIDPOINTS_AND_CENTROIDS',
      axialEnvelopeSampling: 'TRIANGLE_PLANE_INTERSECTIONS_WITH_SEGMENT_RESAMPLING',
      areaStatistics: 'TRIANGLE_AREA_WEIGHTED_CENTROIDS',
    }),
  });
}
