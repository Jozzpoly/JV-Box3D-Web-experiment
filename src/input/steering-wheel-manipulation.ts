export interface SteeringWheelProjectedRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface FrozenSteeringWheelGeometry {
  readonly centerX: number;
  readonly centerY: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly centerGuardRatio: number;
}

export interface SteeringWheelRotationState {
  readonly wheelAngleRadians: number;
  readonly pointerAngleRadians: number | null;
}

const TAU = Math.PI * 2;

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be finite.`);
  }
}

function assertPositive(value: number, label: string): void {
  assertFinite(value, label);
  if (value <= 0) {
    throw new RangeError(`${label} must be positive.`);
  }
}

function assertCenterGuardRatio(centerGuardRatio: number): void {
  assertFinite(centerGuardRatio, "Steering wheel center guard ratio");
  if (centerGuardRatio < 0 || centerGuardRatio >= 1) {
    throw new RangeError(
      "Steering wheel center guard ratio must be in [0, 1).",
    );
  }
}

function clampSigned(value: number): number {
  assertFinite(value, "Steering wheel normalized position");
  return Math.max(-1, Math.min(1, value));
}

function clampWheelAngle(angleRadians: number, lockRadians: number): number {
  assertFinite(angleRadians, "Steering wheel angle");
  assertPositive(lockRadians, "Steering wheel lock");
  return Math.max(-lockRadians, Math.min(lockRadians, angleRadians));
}

export function freezeSteeringWheelGeometry(
  rect: SteeringWheelProjectedRect,
  centerGuardRatio: number,
): FrozenSteeringWheelGeometry {
  assertFinite(rect.left, "Steering wheel left");
  assertFinite(rect.top, "Steering wheel top");
  assertPositive(rect.width, "Steering wheel width");
  assertPositive(rect.height, "Steering wheel height");
  assertCenterGuardRatio(centerGuardRatio);

  return {
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    radiusX: rect.width / 2,
    radiusY: rect.height / 2,
    centerGuardRatio,
  };
}

export function resolveSteeringWheelPointerAngle(
  clientX: number,
  clientY: number,
  geometry: FrozenSteeringWheelGeometry,
): number | null {
  assertFinite(clientX, "Steering pointer X");
  assertFinite(clientY, "Steering pointer Y");
  assertFinite(geometry.centerX, "Steering wheel center X");
  assertFinite(geometry.centerY, "Steering wheel center Y");
  assertPositive(geometry.radiusX, "Steering wheel radius X");
  assertPositive(geometry.radiusY, "Steering wheel radius Y");
  assertCenterGuardRatio(geometry.centerGuardRatio);

  const localX = (clientX - geometry.centerX) / geometry.radiusX;
  const localY = (clientY - geometry.centerY) / geometry.radiusY;
  if (Math.hypot(localX, localY) < geometry.centerGuardRatio) {
    return null;
  }

  // Screen Y grows downward, so increasing atan2 angle is clockwise. That
  // matches CSS positive rotation and lets the manipulation model track the
  // projected wheel directly after ellipse normalization.
  return Math.atan2(localY, localX);
}

export function shortestAngularDelta(
  previousAngleRadians: number,
  currentAngleRadians: number,
): number {
  assertFinite(previousAngleRadians, "Previous steering pointer angle");
  assertFinite(currentAngleRadians, "Current steering pointer angle");

  let delta = currentAngleRadians - previousAngleRadians;
  while (delta > Math.PI) {
    delta -= TAU;
  }
  while (delta < -Math.PI) {
    delta += TAU;
  }
  return delta;
}

export function steeringPositionToWheelAngle(
  steeringPosition: number,
  lockRadians: number,
): number {
  assertPositive(lockRadians, "Steering wheel lock");
  // JV steering POSITION is positive-left. CSS/screen rotation is
  // positive-clockwise, so the visual/manipulation angle has the opposite sign.
  return -clampSigned(steeringPosition) * lockRadians;
}

export function wheelAngleToSteeringPosition(
  wheelAngleRadians: number,
  lockRadians: number,
): number {
  assertPositive(lockRadians, "Steering wheel lock");
  return clampSigned(-wheelAngleRadians / lockRadians);
}

export function beginSteeringWheelRotation(
  steeringPosition: number,
  pointerAngleRadians: number | null,
  lockRadians: number,
): SteeringWheelRotationState {
  if (pointerAngleRadians !== null) {
    assertFinite(pointerAngleRadians, "Steering pointer angle");
  }
  return {
    wheelAngleRadians: steeringPositionToWheelAngle(
      steeringPosition,
      lockRadians,
    ),
    pointerAngleRadians,
  };
}

export function advanceSteeringWheelRotation(
  state: SteeringWheelRotationState,
  pointerAngleRadians: number | null,
  lockRadians: number,
): SteeringWheelRotationState {
  assertFinite(state.wheelAngleRadians, "Steering wheel angle");
  if (state.pointerAngleRadians !== null) {
    assertFinite(state.pointerAngleRadians, "Previous steering pointer angle");
  }
  assertPositive(lockRadians, "Steering wheel lock");

  if (pointerAngleRadians === null) {
    return {
      wheelAngleRadians: state.wheelAngleRadians,
      pointerAngleRadians: null,
    };
  }
  assertFinite(pointerAngleRadians, "Steering pointer angle");

  if (state.pointerAngleRadians === null) {
    // Re-entering from the center guard re-anchors the finger without changing
    // command. This prevents a stationary/near-center finger from creating an
    // angular jump when a stable direction becomes available again.
    return {
      wheelAngleRadians: state.wheelAngleRadians,
      pointerAngleRadians,
    };
  }

  const delta = shortestAngularDelta(
    state.pointerAngleRadians,
    pointerAngleRadians,
  );
  return {
    // Clamp the accumulator itself rather than only the emitted command. Motion
    // beyond full lock therefore creates no hidden overshoot debt: reversing the
    // finger immediately starts moving the wheel back from the stop.
    wheelAngleRadians: clampWheelAngle(
      state.wheelAngleRadians + delta,
      lockRadians,
    ),
    pointerAngleRadians,
  };
}

export function steeringPositionForWheelRotation(
  state: SteeringWheelRotationState,
  lockRadians: number,
): number {
  return wheelAngleToSteeringPosition(
    clampWheelAngle(state.wheelAngleRadians, lockRadians),
    lockRadians,
  );
}
