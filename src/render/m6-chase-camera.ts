export type M6CameraVec3 = Readonly<{ x: number; y: number; z: number }>;
export type M6CameraRotation = Readonly<{
  x: number;
  y: number;
  z: number;
  w: number;
}>;

export interface M6ChaseCameraState {
  readonly orbitYaw: number;
  readonly pitch: number;
  readonly distance: number;
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
  lookAhead: 1.35,
  targetLift: 0.55,
} as const);

export function createDefaultM6ChaseCameraState(): M6ChaseCameraState {
  return {
    orbitYaw: DEFAULT_M6_CHASE_CAMERA.orbitYaw,
    pitch: DEFAULT_M6_CHASE_CAMERA.pitch,
    distance: DEFAULT_M6_CHASE_CAMERA.distance,
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

export function zoomM6ChaseCameraState(
  state: M6ChaseCameraState,
  wheelDeltaY: number,
  policy: M6CameraInteractionPolicy = DEFAULT_M6_CAMERA_INTERACTION_POLICY,
): M6ChaseCameraState {
  return {
    ...state,
    distance: Math.max(
      policy.minDistance,
      Math.min(
        policy.maxDistance,
        state.distance *
          Math.exp(wheelDeltaY * policy.wheelZoomExponentPerDelta),
      ),
    ),
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
  const target = {
    x: chassisPosition.x + forward.x * DEFAULT_M6_CHASE_CAMERA.lookAhead,
    y: chassisPosition.y + DEFAULT_M6_CHASE_CAMERA.targetLift,
    z: chassisPosition.z + forward.z * DEFAULT_M6_CHASE_CAMERA.lookAhead,
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
