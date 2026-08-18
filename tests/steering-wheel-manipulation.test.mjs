import test from "node:test";
import assert from "node:assert/strict";
import {
  advanceSteeringWheelRotation,
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
