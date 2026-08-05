const MARKER_TOLERANCE_METERS = 1e-5;
export const M6_R1_WHEEL_RADIUS_METERS = 0.514062464;
export const M6_R1_WHEEL_WIDTH_METERS = 0.4375;
export const M6_R1_FACTORY_RECEIPT_GIT_BLOB =
  '6a5cb337a7d4707946835e83e036365130c52459';
export const M6_R1_HISTORICAL_VISUAL_COMMIT =
  '891c7561142b601f62ea76b68b0f55f8fababc6c';
export const M6_R1_SOURCE_AUTHORITY_COMMIT =
  '33722127777248b3dcb228fb47f7de2fad847036';
export const M6_R1_CHASSIS_SOURCE_GIT_BLOB =
  'a25cb0ef61d342ce476c9ef26a3b24188bace047';
export const M6_R1_WHEEL_SOURCE_GIT_BLOB =
  'c13c77a8e5552175ee8266b2da33a54691f1dae9';

const REQUIRED_WHEEL_MARKERS = Object.freeze([
  'Socket_WheelMount',
  'Marker_TireRadiusOuter',
  'Marker_TireWidthLeft',
  'Marker_TireWidthRight',
]);

export const M6_R1_CHASSIS_LOCAL_FROM_SOURCE = Object.freeze({
  position: Object.freeze([0, -0.60, 0]),
  rotation: Object.freeze([
    0,
    -Math.SQRT1_2,
    0,
    Math.SQRT1_2,
  ]),
  scale: Object.freeze([0.35, 0.35, 0.35]),
});

function reject(message) {
  throw new Error(`Owner vehicle calibration rejected: ${message}`);
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scale(value, factor) {
  return [value[0] * factor, value[1] * factor, value[2] * factor];
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
  if (!(magnitude > 1e-9)) {
    reject(`${label} is degenerate`);
  }
  return scale(value, 1 / magnitude);
}

function requireMarker(source, name) {
  if (source.duplicateNodeNames.includes(name)) {
    reject(`wheel marker ${name} is duplicated`);
  }
  const value = source.uniqueNodeWorldPositions[name];
  if (!Array.isArray(value) || value.length !== 3) {
    reject(`wheel asset is missing required marker ${name}`);
  }
  return value;
}

function mapDirection(
  value,
  authoredAxle,
  authoredRadial,
  authoredTangent,
  bodyAxle,
  bodyRadial,
  bodyTangent,
  axialFactor,
  radialFactor,
) {
  return add(
    add(
      scale(bodyAxle, dot(value, authoredAxle) * axialFactor),
      scale(bodyRadial, dot(value, authoredRadial) * radialFactor),
    ),
    scale(bodyTangent, dot(value, authoredTangent) * radialFactor),
  );
}

export function calibrateOwnerWheelR1(
  source,
  requestedRadius = M6_R1_WHEEL_RADIUS_METERS,
  requestedWidth = M6_R1_WHEEL_WIDTH_METERS,
) {
  if (!(requestedRadius > 0) || !(requestedWidth > 0)) {
    reject('requested physical wheel dimensions must be positive');
  }
  const socket = requireMarker(source, 'Socket_WheelMount');
  const radiusMarker = requireMarker(source, 'Marker_TireRadiusOuter');
  const widthLeft = requireMarker(source, 'Marker_TireWidthLeft');
  const widthRight = requireMarker(source, 'Marker_TireWidthRight');

  const axleVector = subtract(widthRight, widthLeft);
  const authoredWidth = length(axleVector);
  const authoredAxle = normalize(axleVector, 'wheel width marker axis');
  const authoredCenter = scale(add(widthLeft, widthRight), 0.5);
  const centerToRadius = subtract(radiusMarker, authoredCenter);
  const radialVector = subtract(
    centerToRadius,
    scale(authoredAxle, dot(centerToRadius, authoredAxle)),
  );
  const authoredRadius = length(radialVector);
  let authoredRadial = normalize(radialVector, 'wheel radius marker');
  const authoredTangent = normalize(
    cross(authoredAxle, authoredRadial),
    'wheel marker basis',
  );
  authoredRadial = normalize(
    cross(authoredTangent, authoredAxle),
    'wheel corrected radial basis',
  );

  const bodyAxle = [0, 1, 0];
  const bodyRadial = [1, 0, 0];
  const bodyTangent = normalize(
    cross(bodyAxle, bodyRadial),
    'physical wheel basis',
  );
  const axialScale = requestedWidth / authoredWidth;
  const radialScale = requestedRadius / authoredRadius;

  const transformPoint = (point) =>
    mapDirection(
      subtract(point, authoredCenter),
      authoredAxle,
      authoredRadial,
      authoredTangent,
      bodyAxle,
      bodyRadial,
      bodyTangent,
      axialScale,
      radialScale,
    );
  const transformNormal = (normal) =>
    normalize(
      mapDirection(
        normal,
        authoredAxle,
        authoredRadial,
        authoredTangent,
        bodyAxle,
        bodyRadial,
        bodyTangent,
        1 / axialScale,
        1 / radialScale,
      ),
      'transformed wheel normal',
    );

  const transformedCenter = transformPoint(authoredCenter);
  const transformedSocket = transformPoint(socket);
  const socketAxial = dot(transformedSocket, bodyAxle);
  const mountAxisError = length(
    subtract(transformedSocket, scale(bodyAxle, socketAxial)),
  );
  const centerError = length(transformedCenter);
  const radiusError = Math.abs(
    authoredRadius * radialScale - requestedRadius,
  );
  const widthError = Math.abs(
    authoredWidth * axialScale - requestedWidth,
  );

  if (
    centerError > MARKER_TOLERANCE_METERS ||
    mountAxisError > MARKER_TOLERANCE_METERS ||
    radiusError > MARKER_TOLERANCE_METERS ||
    widthError > MARKER_TOLERANCE_METERS
  ) {
    reject(
      `wheel marker transform mismatch: center=${centerError}, ` +
      `mountAxis=${mountAxisError}, radius=${radiusError}, width=${widthError}`,
    );
  }

  const primitives = source.primitives.map((primitive) => {
    const positions = [];
    for (let index = 0; index < primitive.positions.length; index += 3) {
      positions.push(
        ...transformPoint([
          primitive.positions[index],
          primitive.positions[index + 1],
          primitive.positions[index + 2],
        ]),
      );
    }
    const normals = [];
    for (let index = 0; index < primitive.normals.length; index += 3) {
      normals.push(
        ...transformNormal([
          primitive.normals[index],
          primitive.normals[index + 1],
          primitive.normals[index + 2],
        ]),
      );
    }
    return Object.freeze({
      ...primitive,
      positions,
      normals,
    });
  });

  return Object.freeze({
    primitives: Object.freeze(primitives),
    report: Object.freeze({
      markerContract: 'VERIFIED',
      requiredMarkers: REQUIRED_WHEEL_MARKERS,
      authoredCenter: Object.freeze([...authoredCenter]),
      authoredRadius,
      authoredWidth,
      requestedRadius,
      requestedWidth,
      radialScale,
      axialScale,
      centerError,
      mountOffset: Math.abs(socketAxial),
      mountAxisError,
      radiusError,
      widthError,
      sourceAuthority: Object.freeze({
        repository: 'Jozzpoly/Box3d_FunProject',
        sourceAuthorityCommit: M6_R1_SOURCE_AUTHORITY_COMMIT,
        wheelSourceGitBlob: M6_R1_WHEEL_SOURCE_GIT_BLOB,
        factoryReceiptGitBlob: M6_R1_FACTORY_RECEIPT_GIT_BLOB,
        historicalVisualCommit: M6_R1_HISTORICAL_VISUAL_COMMIT,
      }),
    }),
  });
}
