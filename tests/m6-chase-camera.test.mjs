import test from "node:test";
import assert from "node:assert/strict";
import {
  computeM6ChaseCameraPose,
  DEFAULT_M6_CHASE_CAMERA,
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
