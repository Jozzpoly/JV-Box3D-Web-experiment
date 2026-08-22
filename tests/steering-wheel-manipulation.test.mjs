import test from "node:test";
import assert from "node:assert/strict";
import {
  advanceSteeringWheelHorizontalManipulation,
  advanceSteeringWheelRotation,
  beginSteeringWheelHorizontalManipulation,
  beginSteeringWheelRotation,
  freezeSteeringWheelGeometry,
  resolveSteeringWheelPointerAngle,
  shortestAngularDelta,
  steeringPositionForWheelRotation,
  steeringPositionToWheelAngle,
  wheelAngleToSteeringPosition,
} from "../.test-dist/input/steering-wheel-manipulation.js";

const LOCK = 120 * Math.PI / 180;

function radians(degrees) {
  return degrees * Math.PI / 180;
}

function near(actual, expected, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${actual} != ${expected}`,
  );
}

test("ellipse projection recovers wheel-local cardinal angles", () => {
  const geometry = freezeSteeringWheelGeometry(
    { left: 10, top: 20, width: 300, height: 120 },
    0.2,
  );

  near(resolveSteeringWheelPointerAngle(310, 80, geometry), 0);
  near(resolveSteeringWheelPointerAngle(160, 140, geometry), Math.PI / 2);
  near(
    Math.abs(resolveSteeringWheelPointerAngle(10, 80, geometry)),
    Math.PI,
  );
  near(resolveSteeringWheelPointerAngle(160, 20, geometry), -Math.PI / 2);
});

test("ellipse normalization gives the same angle at different projected radii", () => {
  const geometry = freezeSteeringWheelGeometry(
    { left: 0, top: 0, width: 300, height: 120 },
    0.1,
  );

  const outer = resolveSteeringWheelPointerAngle(256.066017, 102.426407, geometry);
  const inner = resolveSteeringWheelPointerAngle(203.033009, 81.213203, geometry);
  near(outer, Math.PI / 4, 1e-7);
  near(inner, Math.PI / 4, 1e-7);
});

test("center guard suspends angular authority", () => {
  const geometry = freezeSteeringWheelGeometry(
    { left: 0, top: 0, width: 200, height: 80 },
    0.25,
  );

  assert.equal(resolveSteeringWheelPointerAngle(100, 40, geometry), null);
  assert.equal(resolveSteeringWheelPointerAngle(110, 40, geometry), null);
  near(resolveSteeringWheelPointerAngle(130, 40, geometry), 0);
});

test("invalid projected geometry is rejected", () => {
  assert.throws(
    () => freezeSteeringWheelGeometry(
      { left: 0, top: 0, width: 0, height: 80 },
      0.2,
    ),
    RangeError,
  );
  assert.throws(
    () => freezeSteeringWheelGeometry(
      { left: 0, top: 0, width: 200, height: 80 },
      1,
    ),
    RangeError,
  );
});

test("grab at an arbitrary pointer angle does not jump steering", () => {
  const state = beginSteeringWheelRotation(0.45, radians(137), LOCK);
  near(steeringPositionForWheelRotation(state, LOCK), 0.45);
});

test("relative clockwise manipulation rotates the wheel one-to-one", () => {
  let state = beginSteeringWheelRotation(0, radians(20), LOCK);
  state = advanceSteeringWheelRotation(state, radians(50), LOCK);

  near(state.wheelAngleRadians, radians(30));
  near(steeringPositionForWheelRotation(state, LOCK), -0.25);
});

test("relative manipulation starts from the steering position held at grab", () => {
  let state = beginSteeringWheelRotation(-0.5, radians(-40), LOCK);
  state = advanceSteeringWheelRotation(state, radians(-70), LOCK);

  // -0.5 steering is +60 deg visual clockwise. A -30 deg finger move returns
  // the wheel to +30 deg without ever snapping to the pointer's absolute angle.
  near(state.wheelAngleRadians, radians(30));
  near(steeringPositionForWheelRotation(state, LOCK), -0.25);
});

test("angular delta unwraps across the atan2 branch cut", () => {
  near(shortestAngularDelta(radians(179), radians(-179)), radians(2));
  near(shortestAngularDelta(radians(-179), radians(179)), radians(-2));
});

test("full-lock clamps the accumulator without overshoot debt", () => {
  let state = beginSteeringWheelRotation(0, radians(0), LOCK);
  state = advanceSteeringWheelRotation(state, radians(100), LOCK);
  near(state.wheelAngleRadians, radians(100));

  state = advanceSteeringWheelRotation(state, radians(150), LOCK);
  near(state.wheelAngleRadians, LOCK);
  near(steeringPositionForWheelRotation(state, LOCK), -1);

  state = advanceSteeringWheelRotation(state, radians(140), LOCK);
  near(state.wheelAngleRadians, radians(110));
  near(steeringPositionForWheelRotation(state, LOCK), -110 / 120);
});

test("center-guard interruption re-anchors without a command jump", () => {
  let state = beginSteeringWheelRotation(0, radians(10), LOCK);
  state = advanceSteeringWheelRotation(state, radians(40), LOCK);
  near(state.wheelAngleRadians, radians(30));

  state = advanceSteeringWheelRotation(state, null, LOCK);
  state = advanceSteeringWheelRotation(state, radians(150), LOCK);
  near(state.wheelAngleRadians, radians(30));

  state = advanceSteeringWheelRotation(state, radians(160), LOCK);
  near(state.wheelAngleRadians, radians(40));
});

test("wheel-angle calibration matches current positive-left steering convention", () => {
  near(steeringPositionToWheelAngle(1, LOCK), -LOCK);
  near(steeringPositionToWheelAngle(-1, LOCK), LOCK);
  near(wheelAngleToSteeringPosition(-LOCK / 2, LOCK), 0.5);
  near(wheelAngleToSteeringPosition(LOCK / 2, LOCK), -0.5);
});


test("relative horizontal grab preserves the held steering position", () => {
  const state = beginSteeringWheelHorizontalManipulation(0.45, 137, LOCK);
  near(steeringPositionForWheelRotation(state, LOCK), 0.45);
});

test("relative horizontal movement has one steering direction independent of grab height", () => {
  const geometry = freezeSteeringWheelGeometry(
    { left: 20, top: 100, width: 280, height: 120 },
    0.18,
  );

  let top = beginSteeringWheelHorizontalManipulation(0, 160, LOCK);
  let bottom = beginSteeringWheelHorizontalManipulation(0, 160, LOCK);
  top = advanceSteeringWheelHorizontalManipulation(
    top,
    174,
    geometry.radiusX,
    LOCK,
  );
  bottom = advanceSteeringWheelHorizontalManipulation(
    bottom,
    174,
    geometry.radiusX,
    LOCK,
  );

  const topPosition = steeringPositionForWheelRotation(top, LOCK);
  const bottomPosition = steeringPositionForWheelRotation(bottom, LOCK);
  near(topPosition, bottomPosition);
  assert.ok(topPosition < 0, "moving right must steer right");
});

test("relative horizontal manipulation preserves direct-rotation tangent sensitivity", () => {
  const radiusX = 140;
  let horizontal = beginSteeringWheelHorizontalManipulation(0, 200, LOCK);
  horizontal = advanceSteeringWheelHorizontalManipulation(
    horizontal,
    210,
    radiusX,
    LOCK,
  );

  let direct = beginSteeringWheelRotation(0, 0, LOCK);
  direct = advanceSteeringWheelRotation(direct, 10 / radiusX, LOCK);

  near(horizontal.wheelAngleRadians, direct.wheelAngleRadians);
  near(
    steeringPositionForWheelRotation(horizontal, LOCK),
    steeringPositionForWheelRotation(direct, LOCK),
  );
});

test("relative horizontal manipulation is incremental rather than absolute screen X", () => {
  const radiusX = 140;
  let leftGrab = beginSteeringWheelHorizontalManipulation(0, 60, LOCK);
  let rightGrab = beginSteeringWheelHorizontalManipulation(0, 260, LOCK);

  leftGrab = advanceSteeringWheelHorizontalManipulation(
    leftGrab,
    70,
    radiusX,
    LOCK,
  );
  rightGrab = advanceSteeringWheelHorizontalManipulation(
    rightGrab,
    270,
    radiusX,
    LOCK,
  );

  near(
    steeringPositionForWheelRotation(leftGrab, LOCK),
    steeringPositionForWheelRotation(rightGrab, LOCK),
  );
});

test("relative horizontal full-lock has no overshoot debt", () => {
  const radiusX = 100;
  let state = beginSteeringWheelHorizontalManipulation(0, 0, LOCK);
  state = advanceSteeringWheelHorizontalManipulation(
    state,
    radiusX * LOCK * 1.5,
    radiusX,
    LOCK,
  );
  near(state.wheelAngleRadians, LOCK);
  near(steeringPositionForWheelRotation(state, LOCK), -1);

  state = advanceSteeringWheelHorizontalManipulation(
    state,
    radiusX * LOCK * 1.5 - 10,
    radiusX,
    LOCK,
  );
  near(state.wheelAngleRadians, LOCK - 0.4);
});



test("relative horizontal gain grows smoothly away from center", () => {
  const radiusX = 140;
  let center = beginSteeringWheelHorizontalManipulation(0, 200, LOCK);
  center = advanceSteeringWheelHorizontalManipulation(
    center,
    201,
    radiusX,
    LOCK,
  );

  let halfLock = beginSteeringWheelHorizontalManipulation(-0.5, 200, LOCK);
  halfLock = advanceSteeringWheelHorizontalManipulation(
    halfLock,
    201,
    radiusX,
    LOCK,
  );

  near(center.wheelAngleRadians, 1 / radiusX);
  near(
    halfLock.wheelAngleRadians - steeringPositionToWheelAngle(-0.5, LOCK),
    2.5 / radiusX,
  );
});

test("relative horizontal progressive gain reaches full lock in about one wheel radius", () => {
  const radiusX = 142;
  let state = beginSteeringWheelHorizontalManipulation(0, 200, LOCK);
  let pointerX = 200;
  let traveled = 0;

  while (
    Math.abs(steeringPositionForWheelRotation(state, LOCK)) < 1 &&
    traveled < radiusX * 1.2
  ) {
    pointerX += 1;
    traveled += 1;
    state = advanceSteeringWheelHorizontalManipulation(
      state,
      pointerX,
      radiusX,
      LOCK,
    );
  }

  near(steeringPositionForWheelRotation(state, LOCK), -1);
  assert.ok(traveled >= radiusX * 0.9, `lock too aggressive at ${traveled}px`);
  assert.ok(traveled <= radiusX * 1.05, `lock unreachable at ${traveled}px`);
});

test("relative horizontal manipulation rejects invalid radius", () => {
  const state = beginSteeringWheelHorizontalManipulation(0, 10, LOCK);
  assert.throws(
    () => advanceSteeringWheelHorizontalManipulation(state, 20, 0, LOCK),
    RangeError,
  );
});
