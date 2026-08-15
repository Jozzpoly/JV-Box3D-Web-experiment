import test from "node:test";
import assert from "node:assert/strict";
import {
  inspectM6CameraViewport,
  M6_CAMERA_DEFAULT_FAR_PLANE,
  M6_CAMERA_DEFAULT_NEAR_PLANE,
  M6_CAMERA_MAX_RESPONSIVE_DISTANCE_MULTIPLIER,
  M6_CAMERA_REFERENCE_ASPECT,
  resolveM6CameraClipPlanes,
  resolveM6ResponsiveChaseDistance,
  resolveM6ResponsiveDistanceMultiplier,
} from "../.test-dist/render/m6-camera-viewport.js";

function approximately(actual, expected, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${actual} differs from ${expected} by more than ${epsilon}`,
  );
}

test("16:9 viewport is the neutral current camera framing reference", () => {
  const metrics = inspectM6CameraViewport(1920, 1080);
  approximately(metrics.aspect, M6_CAMERA_REFERENCE_ASPECT);
  approximately(metrics.horizontalCoverageVsReference, 1);
  approximately(metrics.equalHorizontalFramingDistanceMultiplier, 1);
  approximately(metrics.equalProjectedAreaDistanceMultiplier, 1);
  approximately(resolveM6ResponsiveDistanceMultiplier(1920, 1080), 1);
  approximately(resolveM6ResponsiveChaseDistance(9.5, 1920, 1080), 9.5);
});

test("portrait viewport quantifies why the fixed-distance camera feels much tighter", () => {
  const metrics = inspectM6CameraViewport(1080, 1920);
  approximately(metrics.aspect, 9 / 16);
  approximately(metrics.horizontalCoverageVsReference, 81 / 256);
  approximately(
    metrics.equalHorizontalFramingDistanceMultiplier,
    256 / 81,
  );
  approximately(metrics.equalProjectedAreaDistanceMultiplier, 16 / 9);
  approximately(resolveM6ResponsiveDistanceMultiplier(1080, 1920), 16 / 9);
  approximately(
    resolveM6ResponsiveChaseDistance(9.5, 1080, 1920),
    9.5 * 16 / 9,
  );
  assert.ok(metrics.horizontalFovRadians < Math.PI / 4);
  assert.ok(
    metrics.equalProjectedAreaDistanceMultiplier <
      metrics.equalHorizontalFramingDistanceMultiplier,
  );
});

test("wide landscape preserves the existing desktop chase distance", () => {
  const metrics = inspectM6CameraViewport(2520, 1080);
  assert.ok(metrics.horizontalCoverageVsReference > 1);
  assert.ok(metrics.equalHorizontalFramingDistanceMultiplier < 1);
  assert.ok(metrics.equalProjectedAreaDistanceMultiplier < 1);
  approximately(resolveM6ResponsiveDistanceMultiplier(2520, 1080), 1);
  approximately(resolveM6ResponsiveChaseDistance(9.5, 2520, 1080), 9.5);
});

test("extreme portrait compensation is bounded instead of preserving full horizontal FOV", () => {
  const multiplier = resolveM6ResponsiveDistanceMultiplier(360, 1000);
  approximately(multiplier, M6_CAMERA_MAX_RESPONSIVE_DISTANCE_MULTIPLIER);
  assert.ok(multiplier < inspectM6CameraViewport(360, 1000)
    .equalHorizontalFramingDistanceMultiplier);
});

test("camera viewport diagnostics reject invalid dimensions and tuning bounds", () => {
  assert.throws(
    () => inspectM6CameraViewport(0, 1080),
    /width must be finite and > 0/,
  );
  assert.throws(
    () => inspectM6CameraViewport(1920, 1080, Math.PI),
    /vertical FOV/,
  );
  assert.throws(
    () => resolveM6ResponsiveDistanceMultiplier(1920, 1080, 0.9),
    /maximum must be >= 1/,
  );
  assert.throws(
    () => resolveM6ResponsiveChaseDistance(0, 1920, 1080),
    /base chase distance must be finite and > 0/,
  );
});


test("known A53 viewports use responsive reset only where framing is narrow", () => {
  approximately(
    resolveM6ResponsiveChaseDistance(9.5, 384, 718),
    9.5 * M6_CAMERA_MAX_RESPONSIVE_DISTANCE_MULTIPLIER,
  );
  approximately(resolveM6ResponsiveChaseDistance(9.5, 774, 304), 9.5);
});

test("camera clip planes preserve current chase projection and scale to inspection distances", () => {
  const current = resolveM6CameraClipPlanes(9.5);
  approximately(current.near, M6_CAMERA_DEFAULT_NEAR_PLANE);
  approximately(current.far, M6_CAMERA_DEFAULT_FAR_PLANE);

  const close = resolveM6CameraClipPlanes(0.35);
  assert.ok(close.near < current.near);
  assert.equal(close.far, M6_CAMERA_DEFAULT_FAR_PLANE);

  const distant = resolveM6CameraClipPlanes(500);
  assert.ok(distant.near > current.near);
  assert.ok(distant.far > 500);
  assert.ok(distant.far > M6_CAMERA_DEFAULT_FAR_PLANE);

  const extreme = resolveM6CameraClipPlanes(2_000);
  assert.ok(extreme.far > 2_000);
});
