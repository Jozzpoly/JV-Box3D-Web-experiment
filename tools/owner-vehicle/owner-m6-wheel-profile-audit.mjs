import { calibrateOwnerWheelR1 } from './owner-m6-visual-calibration-r1.mjs';

const EPS = 1e-12;
const DEFAULT_ANGULAR_BINS = 72;
const DEFAULT_AXIAL_BINS = 32;

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
  const normalized = ((theta + Math.PI) / (2 * Math.PI));
  return Math.min(binCount - 1, Math.max(0, Math.floor(normalized * binCount)));
}

function axialIndex(axial, minAxial, maxAxial, binCount) {
  const span = maxAxial - minAxial;
  if (!(span > EPS)) return 0;
  const normalized = (axial - minAxial) / span;
  return Math.min(binCount - 1, Math.max(0, Math.floor(normalized * binCount)));
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
  const axialBins = Array.from({ length: axialBinCount }, (_, index) => ({
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
      const axial = point[1];
      const radius = Math.hypot(point[0], point[2]);
      const theta = Math.atan2(point[2], point[0]);
      const angular = angularBins[angularIndex(theta, angularBinCount)];
      angular.sampleCount += 1;
      angular.maxRadius = Math.max(angular.maxRadius, radius);
      const axialBin = axialBins[axialIndex(axial, minAxial, maxAxial, axialBinCount)];
      axialBin.sampleCount += 1;
      axialBin.maxRadius = Math.max(axialBin.maxRadius, radius);
    }
  }

  if (!(surfaceArea > EPS)) fail('Tire surface area is degenerate');
  const meanRadius = weightedRadius / surfaceArea;
  const radiusVariance = Math.max(0, weightedRadiusSquared / surfaceArea - meanRadius * meanRadius);
  const meanAxial = weightedAxial / surfaceArea;

  const coveredAngular = angularBins.filter((bin) => bin.sampleCount > 0);
  const coveredAxial = axialBins.filter((bin) => bin.sampleCount > 0);
  const angularOuterRadii = coveredAngular.map((bin) => bin.maxRadius);
  const angularOuterMin = Math.min(...angularOuterRadii);
  const angularOuterMax = Math.max(...angularOuterRadii);

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
      binCount: axialBinCount,
      coveredBinCount: coveredAxial.length,
      coverage: coveredAxial.length / axialBinCount,
      bins: freezeBins(axialBins.map((bin) => ({
        ...bin,
        maxRadius: bin.sampleCount > 0 ? bin.maxRadius : null,
      }))),
    }),
    provenance: Object.freeze({
      sourceLabel: source.label,
      sourceAuthority: calibration.report.sourceAuthority,
      extraction: 'inspectBlockbenchRigidPartsV1:Tire',
      coordinateFrame: 'R1_VERIFIED_WHEEL_MARKERS',
      envelopeSampling: 'TRIANGLE_VERTICES_EDGE_MIDPOINTS_AND_CENTROIDS',
      areaStatistics: 'TRIANGLE_AREA_WEIGHTED_CENTROIDS',
    }),
  });
}
