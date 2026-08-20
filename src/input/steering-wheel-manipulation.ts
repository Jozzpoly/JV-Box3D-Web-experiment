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

export interface SteeringWheelHorizontalState {
  readonly wheelAngleRadians: number;
  readonly pointerX: number;
}

const TAU = Math.PI * 2;
const RELATIVE_HORIZONTAL_GAIN_AT_LOCK = 4;

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
  state: Readonly<{ wheelAngleRadians: number }>,
  lockRadians: number,
): number {
  return wheelAngleToSteeringPosition(
    clampWheelAngle(state.wheelAngleRadians, lockRadians),
    lockRadians,
  );
}

export function beginSteeringWheelHorizontalManipulation(
  steeringPosition: number,
  pointerX: number,
  lockRadians: number,
): SteeringWheelHorizontalState {
  assertFinite(pointerX, "Steering pointer X");
  return {
    wheelAngleRadians: steeringPositionToWheelAngle(
      steeringPosition,
      lockRadians,
    ),
    pointerX,
  };
}

export function advanceSteeringWheelHorizontalManipulation(
  state: SteeringWheelHorizontalState,
  pointerX: number,
  radiusX: number,
  lockRadians: number,
): SteeringWheelHorizontalState {
  assertFinite(state.wheelAngleRadians, "Steering wheel angle");
  assertFinite(state.pointerX, "Previous steering pointer X");
  assertFinite(pointerX, "Steering pointer X");
  assertPositive(radiusX, "Steering wheel horizontal radius");
  assertPositive(lockRadians, "Steering wheel lock");

  const deltaX = pointerX - state.pointerX;
  const steeringMagnitude = Math.abs(
    wheelAngleToSteeringPosition(state.wheelAngleRadians, lockRadians),
  );
  const gain = 1 +
    (RELATIVE_HORIZONTAL_GAIN_AT_LOCK - 1) * steeringMagnitude;
  return {
    // Around center, gain=1 and the motion exactly matches the horizontal
    // tangent of direct wheel manipulation. Gain rises smoothly toward lock so
    // full steering remains reachable from a typical central grab on the
    // left-side mobile control without sacrificing fine center corrections.
    // The accumulator is
    // clamped directly, so motion beyond lock creates no overshoot debt.
    wheelAngleRadians: clampWheelAngle(
      state.wheelAngleRadians + deltaX / radiusX * gain,
      lockRadians,
    ),
    pointerX,
  };
}
