import test from "node:test";
import assert from "node:assert/strict";
import {
  assertVehicleVisualFrameV1,
  indexVehicleVisualFrameV1,
} from "../.test-dist/runtime/vehicle-visual-frame.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
  assertM6VisualFrameCoverage,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";

const identity = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });

function validFrame() {
  return {
    contractVersion: 1,
    generation: 2,
    stepIndex: 17,
    parts: M6_VISUAL_PART_IDS.map((partId, index) => ({
      partId,
      transform: {
        position: { x: index, y: 1, z: -index },
        rotation: identity,
      },
    })),
    segments: M6_VISUAL_SEGMENT_IDS.map((segmentId, index) => ({
      segmentId,
      start: { x: index, y: 1, z: 0 },
      end: { x: index, y: 2, z: 0 },
      lengthMeters: 1,
    })),
  };
}

test("M6 visual frame requires exact stable part and segment coverage", () => {
  const frame = validFrame();
  assert.doesNotThrow(() => assertM6VisualFrameCoverage(frame));
  const indexed = indexVehicleVisualFrameV1(frame);
  assert.equal(indexed.parts.size, 18);
  assert.equal(indexed.segments.size, 8);
  assert.equal(indexed.parts.get("m6.fl.wheel")?.partId, "m6.fl.wheel");
});

test("visual frame rejects duplicate identifiers", () => {
  const frame = validFrame();
  frame.parts[1] = { ...frame.parts[1], partId: frame.parts[0].partId };
  assert.throws(() => assertVehicleVisualFrameV1(frame), /Duplicate.*partId/);
});

test("visual frame rejects non-normalized rotations", () => {
  const frame = validFrame();
  frame.parts[0] = {
    ...frame.parts[0],
    transform: {
      ...frame.parts[0].transform,
      rotation: { x: 0, y: 0, z: 0, w: 2 },
    },
  };
  assert.throws(() => assertVehicleVisualFrameV1(frame), /normalized quaternion/);
});

test("visual segment length must match exact world endpoints", () => {
  const frame = validFrame();
  frame.segments[0] = { ...frame.segments[0], lengthMeters: 0.9 };
  assert.throws(() => assertVehicleVisualFrameV1(frame), /length does not match/);
});

test("M6 coverage rejects missing and unknown visual channels", () => {
  const missing = validFrame();
  missing.parts.pop();
  assert.throws(() => assertM6VisualFrameCoverage(missing), /coverage mismatch/);

  const unknown = validFrame();
  unknown.segments[0] = {
    ...unknown.segments[0],
    segmentId: "m6.fl.unknown-link",
  };
  assert.throws(() => assertM6VisualFrameCoverage(unknown), /coverage mismatch/);
});
