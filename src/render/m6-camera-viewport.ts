export const M6_CAMERA_VERTICAL_FOV_RADIANS = Math.PI / 4;
export const M6_CAMERA_REFERENCE_ASPECT = 16 / 9;
export const M6_CAMERA_MAX_RESPONSIVE_DISTANCE_MULTIPLIER = 1.8;

export interface M6CameraViewportMetrics {
  readonly width: number;
  readonly height: number;
  readonly aspect: number;
  readonly verticalFovRadians: number;
  readonly horizontalFovRadians: number;
  readonly horizontalCoverageVsReference: number;
  readonly equalHorizontalFramingDistanceMultiplier: number;
  readonly equalProjectedAreaDistanceMultiplier: number;
}

function positiveFinite(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be finite and > 0.`);
  }
  return value;
}

export function inspectM6CameraViewport(
  width: number,
  height: number,
  verticalFovRadians = M6_CAMERA_VERTICAL_FOV_RADIANS,
  referenceAspect = M6_CAMERA_REFERENCE_ASPECT,
): M6CameraViewportMetrics {
  const safeWidth = positiveFinite(width, "Camera viewport width");
  const safeHeight = positiveFinite(height, "Camera viewport height");
  const safeReferenceAspect = positiveFinite(
    referenceAspect,
    "Camera reference aspect",
  );
  if (
    !Number.isFinite(verticalFovRadians) ||
    verticalFovRadians <= 0 ||
    verticalFovRadians >= Math.PI
  ) {
    throw new Error("Camera vertical FOV must be finite and between 0 and PI.");
  }

  const aspect = safeWidth / safeHeight;
  const halfVerticalTangent = Math.tan(verticalFovRadians / 2);
  const horizontalFovRadians =
    2 * Math.atan(halfVerticalTangent * aspect);
  const horizontalCoverageVsReference = aspect / safeReferenceAspect;
  const equalHorizontalFramingDistanceMultiplier =
    1 / horizontalCoverageVsReference;

  return {
    width: safeWidth,
    height: safeHeight,
    aspect,
    verticalFovRadians,
    horizontalFovRadians,
    horizontalCoverageVsReference,
    equalHorizontalFramingDistanceMultiplier,
    // Preserving projected object area is the geometric-mean compromise
    // between unchanged vertical framing (1x) and full horizontal framing.
    // It is a diagnostic candidate, not an accepted product tuning value.
    equalProjectedAreaDistanceMultiplier:
      Math.sqrt(equalHorizontalFramingDistanceMultiplier),
  };
}

export function resolveM6ResponsiveDistanceMultiplier(
  width: number,
  height: number,
  maxMultiplier = M6_CAMERA_MAX_RESPONSIVE_DISTANCE_MULTIPLIER,
): number {
  const safeMaximum = positiveFinite(
    maxMultiplier,
    "Camera responsive distance maximum",
  );
  if (safeMaximum < 1) {
    throw new Error("Camera responsive distance maximum must be >= 1.");
  }
  const metrics = inspectM6CameraViewport(width, height);

  // Wide/desktop viewports retain the current chase distance. Narrower
  // viewports use only the geometric-mean compensation and are hard bounded;
  // this avoids the ~3.16x full-horizontal correction at 9:16 portrait.
  return Math.min(
    safeMaximum,
    Math.max(1, metrics.equalProjectedAreaDistanceMultiplier),
  );
}

export function resolveM6ResponsiveChaseDistance(
  baseDistance: number,
  width: number,
  height: number,
  maxMultiplier = M6_CAMERA_MAX_RESPONSIVE_DISTANCE_MULTIPLIER,
): number {
  const safeBaseDistance = positiveFinite(
    baseDistance,
    "Camera base chase distance",
  );
  return safeBaseDistance *
    resolveM6ResponsiveDistanceMultiplier(width, height, maxMultiplier);
}
