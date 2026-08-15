export type M6CameraVec3 = Readonly<{ x: number; y: number; z: number }>;
export type M6CameraRotation = Readonly<{
  x: number;
  y: number;
  z: number;
  w: number;
}>;

export interface M6CameraFocusOffset {
  readonly forward: number;
  readonly right: number;
  readonly up: number;
}

export interface M6ChaseCameraState {
  readonly orbitYaw: number;
  readonly pitch: number;
  readonly distance: number;
  readonly focusOffset: M6CameraFocusOffset;
}

export interface M6CameraInteractionPolicy {
  readonly orbitRadiansPerPixel: number;
  readonly minPitch: number;
  readonly maxPitch: number;
  readonly wheelZoomExponentPerDelta: number;
  readonly minDistance: number;
  readonly maxDistance: number;
}

export interface M6ChaseCameraPose {
  readonly eye: M6CameraVec3;
  readonly target: M6CameraVec3;
  readonly forward: M6CameraVec3;
}

export const DEFAULT_M6_CAMERA_INTERACTION_POLICY = Object.freeze({
  orbitRadiansPerPixel: 0.006,
  minPitch: -0.12,
  maxPitch: 1.25,
  wheelZoomExponentPerDelta: 0.001,
  minDistance: 0.35,
  maxDistance: 2_000,
} satisfies M6CameraInteractionPolicy);

export const DEFAULT_M6_CHASE_CAMERA = Object.freeze({
  orbitYaw: 0,
  pitch: 0.34,
  distance: 9.5,
  focusOffset: Object.freeze({ forward: 0, right: 0, up: 0 }),
  lookAhead: 1.35,
  targetLift: 0.55,
} as const);

export function createDefaultM6ChaseCameraState(): M6ChaseCameraState {
  return {
    orbitYaw: DEFAULT_M6_CHASE_CAMERA.orbitYaw,
    pitch: DEFAULT_M6_CHASE_CAMERA.pitch,
    distance: DEFAULT_M6_CHASE_CAMERA.distance,
    focusOffset: { ...DEFAULT_M6_CHASE_CAMERA.focusOffset },
  };
}

export function orbitM6ChaseCameraState(
  state: M6ChaseCameraState,
  deltaX: number,
  deltaY: number,
  policy: M6CameraInteractionPolicy = DEFAULT_M6_CAMERA_INTERACTION_POLICY,
): M6ChaseCameraState {
  return {
    ...state,
    orbitYaw: state.orbitYaw + deltaX * policy.orbitRadiansPerPixel,
    pitch: Math.max(
      policy.minPitch,
      Math.min(
        policy.maxPitch,
        state.pitch - deltaY * policy.orbitRadiansPerPixel,
      ),
    ),
  };
}

export function scaleM6ChaseCameraDistance(
  state: M6ChaseCameraState,
  scale: number,
  policy: M6CameraInteractionPolicy = DEFAULT_M6_CAMERA_INTERACTION_POLICY,
): M6ChaseCameraState {
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new RangeError("Camera distance scale must be finite and > 0.");
  }
  return {
    ...state,
    distance: Math.max(
      policy.minDistance,
      Math.min(policy.maxDistance, state.distance * scale),
    ),
  };
}

export function zoomM6ChaseCameraState(
  state: M6ChaseCameraState,
  wheelDeltaY: number,
  policy: M6CameraInteractionPolicy = DEFAULT_M6_CAMERA_INTERACTION_POLICY,
): M6ChaseCameraState {
  return scaleM6ChaseCameraDistance(
    state,
    Math.exp(wheelDeltaY * policy.wheelZoomExponentPerDelta),
    policy,
  );
}

export function translateM6ChaseCameraFocus(
  state: M6ChaseCameraState,
  delta: M6CameraFocusOffset,
): M6ChaseCameraState {
  return {
    ...state,
    focusOffset: {
      forward: state.focusOffset.forward + delta.forward,
      right: state.focusOffset.right + delta.right,
      up: state.focusOffset.up + delta.up,
    },
  };
}

function rotateVector(
  rotation: M6CameraRotation,
  value: M6CameraVec3,
): M6CameraVec3 {
  const ix =
    rotation.w * value.x +
    rotation.y * value.z -
    rotation.z * value.y;
  const iy =
    rotation.w * value.y +
    rotation.z * value.x -
    rotation.x * value.z;
  const iz =
    rotation.w * value.z +
    rotation.x * value.y -
    rotation.y * value.x;
  const iw =
    -rotation.x * value.x -
    rotation.y * value.y -
    rotation.z * value.z;
  return {
    x:
      ix * rotation.w +
      iw * -rotation.x +
      iy * -rotation.z -
      iz * -rotation.y,
    y:
      iy * rotation.w +
      iw * -rotation.y +
      iz * -rotation.x -
      ix * -rotation.z,
    z:
      iz * rotation.w +
      iw * -rotation.z +
      ix * -rotation.y -
      iy * -rotation.x,
  };
}

function normalizeVector(value: M6CameraVec3): M6CameraVec3 {
  const length = Math.hypot(value.x, value.y, value.z);
  if (length <= 1e-12) {
    return { x: 0, y: 0, z: 0 };
  }
  return { x: value.x / length, y: value.y / length, z: value.z / length };
}

function crossVector(
  left: M6CameraVec3,
  right: M6CameraVec3,
): M6CameraVec3 {
  return {
    x: left.y * right.z - left.z * right.y,
    y: left.z * right.x - left.x * right.z,
    z: left.x * right.y - left.y * right.x,
  };
}

function dotVector(left: M6CameraVec3, right: M6CameraVec3): number {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}

export function computeM6ChaseCameraPose(
  chassisPosition: M6CameraVec3,
  chassisRotation: M6CameraRotation,
  state: M6ChaseCameraState,
): M6ChaseCameraPose {
  const bodyForward = rotateVector(
    chassisRotation,
    { x: 1, y: 0, z: 0 },
  );
  const planarLength = Math.hypot(bodyForward.x, bodyForward.z);
  const forward =
    planarLength > 1e-6
      ? {
          x: bodyForward.x / planarLength,
          y: 0,
          z: bodyForward.z / planarLength,
        }
      : { x: 1, y: 0, z: 0 };
  const heading = Math.atan2(forward.z, forward.x);
  const cameraAngle = heading + Math.PI + state.orbitYaw;
  const right = { x: -forward.z, y: 0, z: forward.x };
  const targetForward =
    DEFAULT_M6_CHASE_CAMERA.lookAhead + state.focusOffset.forward;
  const target = {
    x:
      chassisPosition.x +
      forward.x * targetForward +
      right.x * state.focusOffset.right,
    y:
      chassisPosition.y +
      DEFAULT_M6_CHASE_CAMERA.targetLift +
      state.focusOffset.up,
    z:
      chassisPosition.z +
      forward.z * targetForward +
      right.z * state.focusOffset.right,
  };
  const horizontal = Math.cos(state.pitch) * state.distance;
  return {
    target,
    forward,
    eye: {
      x: target.x + Math.cos(cameraAngle) * horizontal,
      y: target.y + Math.sin(state.pitch) * state.distance,
      z: target.z + Math.sin(cameraAngle) * horizontal,
    },
  };
}

export function resolveM6ChaseCameraPanDelta(
  chassisRotation: M6CameraRotation,
  state: M6ChaseCameraState,
  deltaX: number,
  deltaY: number,
  viewportHeight: number,
  verticalFovRadians: number,
): M6CameraFocusOffset {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    throw new RangeError(
      "Camera pan viewport height must be finite and > 0.",
    );
  }
  if (
    !Number.isFinite(verticalFovRadians) ||
    verticalFovRadians <= 0 ||
    verticalFovRadians >= Math.PI
  ) {
    throw new RangeError(
      "Camera pan FOV must be finite and between 0 and PI.",
    );
  }
  const pose = computeM6ChaseCameraPose(
    { x: 0, y: 0, z: 0 },
    chassisRotation,
    state,
  );
  const viewForward = normalizeVector({
    x: pose.target.x - pose.eye.x,
    y: pose.target.y - pose.eye.y,
    z: pose.target.z - pose.eye.z,
  });
  const cameraRight = normalizeVector(
    crossVector(viewForward, { x: 0, y: 1, z: 0 }),
  );
  const cameraUp = normalizeVector(crossVector(cameraRight, viewForward));
  const worldUnitsPerPixel = (2 * state.distance * Math.tan(verticalFovRadians / 2)) / viewportHeight;
  const worldDelta = {
    x:
      cameraRight.x * -deltaX * worldUnitsPerPixel +
      cameraUp.x * deltaY * worldUnitsPerPixel,
    y:
      cameraRight.y * -deltaX * worldUnitsPerPixel +
      cameraUp.y * deltaY * worldUnitsPerPixel,
    z:
      cameraRight.z * -deltaX * worldUnitsPerPixel +
      cameraUp.z * deltaY * worldUnitsPerPixel,
  };
  const vehicleRight = { x: -pose.forward.z, y: 0, z: pose.forward.x };
  return {
    forward: dotVector(worldDelta, pose.forward),
    right: dotVector(worldDelta, vehicleRight),
    up: worldDelta.y,
  };
}
