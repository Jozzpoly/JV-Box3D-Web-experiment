import test from "node:test";
import assert from "node:assert/strict";
import {
  computeM6ChaseCameraPose,
  createDefaultM6ChaseCameraState,
  DEFAULT_M6_CAMERA_INTERACTION_POLICY,
  DEFAULT_M6_CHASE_CAMERA,
  orbitM6ChaseCameraState,
  zoomM6ChaseCameraState,
} from "../.test-dist/render/m6-chase-camera.js";

const origin = { x: 10, y: 2, z: 20 };

function yawQuaternion(radians) {
  return {
    x: 0,
    y: Math.sin(radians / 2),
    z: 0,
    w: Math.cos(radians / 2),
  };
}

test("chase camera stays behind +X vehicle heading", () => {
  const pose = computeM6ChaseCameraPose(
    origin,
    yawQuaternion(0),
    DEFAULT_M6_CHASE_CAMERA,
  );
  assert.ok(pose.eye.x < origin.x);
  assert.ok(Math.abs(pose.eye.z - origin.z) < 1e-9);
  assert.ok(pose.target.x > origin.x);
});

test("chase camera rotates with chassis heading instead of world yaw", () => {
  const pose = computeM6ChaseCameraPose(
    origin,
    yawQuaternion(-Math.PI / 2),
    DEFAULT_M6_CHASE_CAMERA,
  );
  assert.ok(pose.target.z > origin.z);
  assert.ok(pose.eye.z < pose.target.z);
  assert.ok(Math.abs(pose.forward.x) < 1e-9);
});

test("manual orbit yaw remains relative to the vehicle heading", () => {
  const pose = computeM6ChaseCameraPose(
    origin,
    yawQuaternion(0),
    {
      ...DEFAULT_M6_CHASE_CAMERA,
      orbitYaw: Math.PI / 2,
    },
  );
  assert.ok(Math.abs(pose.eye.x - pose.target.x) < 1e-9);
  assert.ok(pose.eye.z < pose.target.z);
});

test("manual camera state reset reproduces the current chase defaults", () => {
  assert.deepEqual(createDefaultM6ChaseCameraState(), {
    orbitYaw: DEFAULT_M6_CHASE_CAMERA.orbitYaw,
    pitch: DEFAULT_M6_CHASE_CAMERA.pitch,
    distance: DEFAULT_M6_CHASE_CAMERA.distance,
  });
});

test("manual orbit preserves current pointer sensitivity and pitch bounds", () => {
  const initial = createDefaultM6ChaseCameraState();
  const moved = orbitM6ChaseCameraState(initial, 100, 20);
  assert.equal(
    moved.orbitYaw,
    initial.orbitYaw + 100 * DEFAULT_M6_CAMERA_INTERACTION_POLICY.orbitRadiansPerPixel,
  );
  assert.equal(
    moved.pitch,
    initial.pitch - 20 * DEFAULT_M6_CAMERA_INTERACTION_POLICY.orbitRadiansPerPixel,
  );
  assert.equal(
    orbitM6ChaseCameraState(initial, 0, 10000).pitch,
    DEFAULT_M6_CAMERA_INTERACTION_POLICY.minPitch,
  );
  assert.equal(
    orbitM6ChaseCameraState(initial, 0, -10000).pitch,
    DEFAULT_M6_CAMERA_INTERACTION_POLICY.maxPitch,
  );
});

test("manual wheel zoom preserves current exponential response and distance bounds", () => {
  const initial = createDefaultM6ChaseCameraState();
  const deltaY = 120;
  const zoomed = zoomM6ChaseCameraState(initial, deltaY);
  assert.equal(
    zoomed.distance,
    initial.distance *
      Math.exp(deltaY * DEFAULT_M6_CAMERA_INTERACTION_POLICY.wheelZoomExponentPerDelta),
  );
  assert.equal(
    zoomM6ChaseCameraState(initial, -100000).distance,
    DEFAULT_M6_CAMERA_INTERACTION_POLICY.minDistance,
  );
  assert.equal(
    zoomM6ChaseCameraState(initial, 100000).distance,
    DEFAULT_M6_CAMERA_INTERACTION_POLICY.maxDistance,
  );
});
