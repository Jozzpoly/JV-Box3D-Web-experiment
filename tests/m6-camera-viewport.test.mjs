import test from "node:test";
import assert from "node:assert/strict";
import {
  inspectM6CameraViewport,
  M6_CAMERA_REFERENCE_ASPECT,
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
  assert.ok(metrics.horizontalFovRadians < Math.PI / 4);
  assert.ok(
    metrics.equalProjectedAreaDistanceMultiplier <
      metrics.equalHorizontalFramingDistanceMultiplier,
  );
});

test("wide landscape has more horizontal coverage than the 16:9 reference", () => {
  const metrics = inspectM6CameraViewport(2520, 1080);
  assert.ok(metrics.horizontalCoverageVsReference > 1);
  assert.ok(metrics.equalHorizontalFramingDistanceMultiplier < 1);
  assert.ok(metrics.equalProjectedAreaDistanceMultiplier < 1);
});

test("camera viewport diagnostics reject invalid dimensions and FOV", () => {
  assert.throws(
    () => inspectM6CameraViewport(0, 1080),
    /width must be finite and > 0/,
  );
  assert.throws(
    () => inspectM6CameraViewport(1920, 1080, Math.PI),
    /vertical FOV/,
  );
});
