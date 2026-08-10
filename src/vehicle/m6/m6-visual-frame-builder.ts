import type {
  Box3DModule,
  b3BodyId,
  b3Quat,
  b3Vec3,
} from "../../physics/box3d-runtime-contract.js";
import {
  VEHICLE_VISUAL_FRAME_CONTRACT_VERSION,
  type VehicleVisualFrameV1,
  type VehicleVisualPartTransformV1,
  type VehicleVisualRotationV1,
  type VehicleVisualSegmentV1,
  type VehicleVisualTransformV1,
  type VehicleVisualVector3V1,
} from "../../runtime/vehicle-visual-frame.js";
import { add3, clone3, distance3 } from "./m6-geometry.js";
import type {
  M6VehicleRuntime,
  M6VisualSegmentRuntime,
} from "./m6-topology-contract.js";
import { m6CornerVisualIds } from "./m6-visual-contract.js";

function rotation(rotation: b3Quat): VehicleVisualRotationV1 {
  return Object.freeze({
    x: rotation.v.x,
    y: rotation.v.y,
    z: rotation.v.z,
    w: rotation.s,
  });
}

function vector(value: b3Vec3): VehicleVisualVector3V1 {
  return Object.freeze(clone3(value));
}

function bodyTransform(
  b3: Box3DModule,
  bodyId: b3BodyId,
): VehicleVisualTransformV1 {
  return Object.freeze({
    position: vector(b3.b3Body_GetPosition(bodyId)),
    rotation: rotation(b3.b3Body_GetRotation(bodyId)),
  });
}

function part(
  b3: Box3DModule,
  partId: string,
  bodyId: b3BodyId,
): VehicleVisualPartTransformV1 {
  return Object.freeze({
    partId,
    transform: bodyTransform(b3, bodyId),
  });
}

function worldAnchor(
  b3: Box3DModule,
  bodyId: b3BodyId,
  localAnchor: b3Vec3,
): b3Vec3 {
  return add3(
    b3.b3Body_GetPosition(bodyId),
    b3.b3RotateVector(b3.b3Body_GetRotation(bodyId), localAnchor),
  );
}

function segment(
  b3: Box3DModule,
  segmentId: string,
  runtime: M6VisualSegmentRuntime,
): VehicleVisualSegmentV1 {
  const start = worldAnchor(
    b3,
    runtime.bodyIdA,
    runtime.localAnchorA,
  );
  const end = worldAnchor(
    b3,
    runtime.bodyIdB,
    runtime.localAnchorB,
  );
  return Object.freeze({
    segmentId,
    start: vector(start),
    end: vector(end),
    lengthMeters: distance3(start, end),
  });
}

export function buildM6VisualFrameV1(
  b3: Box3DModule,
  runtime: M6VehicleRuntime,
  generation: number,
  stepIndex: number,
): VehicleVisualFrameV1 {
  const parts: VehicleVisualPartTransformV1[] = [
    part(b3, "m6.chassis", runtime.chassisId),
    part(b3, "m6.rack", runtime.rackId),
  ];
  const segments: VehicleVisualSegmentV1[] = [];

  runtime.corners.forEach((corner, index) => {
    const ids = m6CornerVisualIds(index);
    parts.push(
      part(b3, ids.wheel, corner.wheel.bodyId),
      part(b3, ids.knuckle, corner.knuckleId),
      part(b3, ids.upperArm, corner.upperArmId),
      part(b3, ids.lowerArm, corner.lowerArmId),
    );
    segments.push(
      segment(b3, ids.coilover, corner.coiloverVisual),
      segment(b3, ids.steeringLink, corner.steeringLinkVisual),
    );
  });

  return Object.freeze({
    contractVersion: VEHICLE_VISUAL_FRAME_CONTRACT_VERSION,
    generation,
    stepIndex,
    parts: Object.freeze(parts),
    segments: Object.freeze(segments),
  });
}
