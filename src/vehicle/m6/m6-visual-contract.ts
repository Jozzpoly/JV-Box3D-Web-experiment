import {
  assertVehicleVisualFrameV1,
  type VehicleVisualFrameV1,
} from "../../runtime/vehicle-visual-frame.js";

export const M6_VISUAL_CORNER_IDS = Object.freeze([
  "fl",
  "fr",
  "rl",
  "rr",
] as const);

export type M6VisualCornerId = (typeof M6_VISUAL_CORNER_IDS)[number];

export interface M6CornerVisualIds {
  readonly cornerId: M6VisualCornerId;
  readonly wheel: `m6.${M6VisualCornerId}.wheel`;
  readonly knuckle: `m6.${M6VisualCornerId}.knuckle`;
  readonly upperArm: `m6.${M6VisualCornerId}.upper-arm`;
  readonly lowerArm: `m6.${M6VisualCornerId}.lower-arm`;
  readonly coilover: `m6.${M6VisualCornerId}.coilover`;
  readonly steeringLink: `m6.${M6VisualCornerId}.steering-link`;
}

export function m6CornerVisualIds(cornerIndex: number): M6CornerVisualIds {
  const cornerId = M6_VISUAL_CORNER_IDS[cornerIndex];
  if (cornerId === undefined) {
    throw new RangeError(`Unknown M6 visual corner index: ${cornerIndex}`);
  }
  return Object.freeze({
    cornerId,
    wheel: `m6.${cornerId}.wheel`,
    knuckle: `m6.${cornerId}.knuckle`,
    upperArm: `m6.${cornerId}.upper-arm`,
    lowerArm: `m6.${cornerId}.lower-arm`,
    coilover: `m6.${cornerId}.coilover`,
    steeringLink: `m6.${cornerId}.steering-link`,
  });
}

export const M6_VISUAL_PART_IDS = Object.freeze([
  "m6.chassis",
  "m6.rack",
  ...M6_VISUAL_CORNER_IDS.flatMap((_, index) => {
    const ids = m6CornerVisualIds(index);
    return [ids.wheel, ids.knuckle, ids.upperArm, ids.lowerArm] as const;
  }),
] as const);

export const M6_VISUAL_SEGMENT_IDS = Object.freeze(
  M6_VISUAL_CORNER_IDS.flatMap((_, index) => {
    const ids = m6CornerVisualIds(index);
    return [ids.coilover, ids.steeringLink] as const;
  }),
);

export type M6VisualPartId = (typeof M6_VISUAL_PART_IDS)[number];
export type M6VisualSegmentId = (typeof M6_VISUAL_SEGMENT_IDS)[number];

function assertExactCoverage(
  actual: readonly string[],
  expected: readonly string[],
  label: string,
): void {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  if (actualSet.size !== actual.length) {
    throw new Error(`M6 ${label} contains duplicate identifiers.`);
  }
  const missing = expected.filter((id) => !actualSet.has(id));
  const unknown = actual.filter((id) => !expectedSet.has(id));
  if (missing.length > 0 || unknown.length > 0) {
    throw new Error(
      `M6 ${label} coverage mismatch; missing=[${missing.join(", ")}], unknown=[${unknown.join(", ")}].`,
    );
  }
}

export function assertM6VisualFrameCoverage(
  frame: VehicleVisualFrameV1,
): void {
  assertVehicleVisualFrameV1(frame);
  assertExactCoverage(
    frame.parts.map((part) => part.partId),
    M6_VISUAL_PART_IDS,
    "part",
  );
  assertExactCoverage(
    frame.segments.map((segment) => segment.segmentId),
    M6_VISUAL_SEGMENT_IDS,
    "segment",
  );
}
