import test from "node:test";
import assert from "node:assert/strict";
import {
  computeM6ChaseCameraPose,
  createDefaultM6ChaseCameraState,
  DEFAULT_M6_CAMERA_INTERACTION_POLICY,
  DEFAULT_M6_CHASE_CAMERA,
  orbitM6ChaseCameraState,
  resolveM6ChaseCameraPanDelta,
  scaleM6ChaseCameraDistance,
  translateM6ChaseCameraFocus,
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
    focusOffset: { ...DEFAULT_M6_CHASE_CAMERA.focusOffset },
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

test("manual distance policy supports inspection-scale views far beyond legacy chase limits", () => {
  const initial = createDefaultM6ChaseCameraState();
  const targetDistance = 500;
  const wheelDelta =
    Math.log(targetDistance / initial.distance) /
    DEFAULT_M6_CAMERA_INTERACTION_POLICY.wheelZoomExponentPerDelta;
  const zoomed = zoomM6ChaseCameraState(initial, wheelDelta);
  assert.ok(Math.abs(zoomed.distance - targetDistance) < 1e-9);
  assert.ok(DEFAULT_M6_CAMERA_INTERACTION_POLICY.minDistance < 1);
  assert.ok(DEFAULT_M6_CAMERA_INTERACTION_POLICY.maxDistance >= 500);
});

test("pinch distance scaling is bounded and rejects invalid scales", () => {
  const initial = createDefaultM6ChaseCameraState();
  assert.equal(scaleM6ChaseCameraDistance(initial, 2).distance, initial.distance * 2);
  assert.equal(
    scaleM6ChaseCameraDistance(initial, 1e-9).distance,
    DEFAULT_M6_CAMERA_INTERACTION_POLICY.minDistance,
  );
  assert.throws(() => scaleM6ChaseCameraDistance(initial, 0), /scale must be finite/);
  assert.throws(() => scaleM6ChaseCameraDistance(initial, Number.NaN), /scale must be finite/);
});

test("manual focus offset remains vehicle-local when chassis heading changes", () => {
  const state = translateM6ChaseCameraFocus(createDefaultM6ChaseCameraState(), {
    forward: 3,
    right: 2,
    up: 1,
  });
  const xPose = computeM6ChaseCameraPose(origin, yawQuaternion(0), state);
  const zPose = computeM6ChaseCameraPose(origin, yawQuaternion(-Math.PI / 2), state);
  assert.ok(xPose.target.x > origin.x + 3);
  assert.ok(xPose.target.z > origin.z + 1.9);
  assert.ok(zPose.target.z > origin.z + 3);
  assert.ok(zPose.target.x < origin.x - 1.9);
  assert.equal(xPose.target.y, zPose.target.y);
});

test("screen-space pan scales with camera distance and maps into vehicle-local focus", () => {
  const rotation = yawQuaternion(0);
  const nearState = createDefaultM6ChaseCameraState();
  const farState = { ...nearState, distance: nearState.distance * 10 };
  const near = resolveM6ChaseCameraPanDelta(rotation, nearState, 100, 0, 1000, Math.PI / 4);
  const far = resolveM6ChaseCameraPanDelta(rotation, farState, 100, 0, 1000, Math.PI / 4);
  assert.ok(Math.abs(near.right) > 0);
  assert.ok(Math.abs(near.forward) < 1e-12);
  assert.ok(Math.abs(near.up) < 1e-12);
  assert.ok(Math.abs(far.right / near.right - 10) < 1e-12);
  assert.throws(
    () => resolveM6ChaseCameraPanDelta(rotation, nearState, 1, 1, 0, Math.PI / 4),
    /viewport height/,
  );
});
