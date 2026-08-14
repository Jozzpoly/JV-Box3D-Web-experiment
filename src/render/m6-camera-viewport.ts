export const M6_CAMERA_VERTICAL_FOV_RADIANS = Math.PI / 4;
export const M6_CAMERA_REFERENCE_ASPECT = 16 / 9;

export interface M6CameraViewportMetrics {
  readonly width: number;
  readonly height: number;
  readonly aspect: number;
  readonly verticalFovRadians: number;
  readonly horizontalFovRadians: number;
  readonly horizontalCoverageVsReference: number;
  readonly equalHorizontalFramingDistanceMultiplier: number;
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

  return {
    width: safeWidth,
    height: safeHeight,
    aspect,
    verticalFovRadians,
    horizontalFovRadians,
    horizontalCoverageVsReference,
    equalHorizontalFramingDistanceMultiplier:
      1 / horizontalCoverageVsReference,
  };
}
