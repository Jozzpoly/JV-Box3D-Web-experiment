import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveVehicleVisualBindingsV1,
  transformVehicleVisualPointV1,
} from "../.test-dist/visual/vehicle-visual-transform.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";

const identityTransform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
};

function nodeName(id) {
  return `JV_${id.replaceAll(".", "_").replaceAll("-", "_")}`;
}

function packageWith(overrides = new Map()) {
  const bindings = [
    ...M6_VISUAL_PART_IDS.map((partId) => ({
      bindingId: `bind.${partId}`,
      nodeName: nodeName(partId),
      source: { kind: "PART", partId },
      localFromSource: identityTransform,
    })),
    ...M6_VISUAL_SEGMENT_IDS.map((segmentId) => ({
      bindingId: `bind.${segmentId}`,
      nodeName: nodeName(segmentId),
      source: {
        kind: "SEGMENT_STRETCH",
        segmentId,
        axis: "+Y",
        referenceLengthMeters: 1,
      },
      localFromSource: identityTransform,
    })),
  ].map((binding) => overrides.get(binding.bindingId) ?? binding);
  return validateVehicleVisualPackageV1({
    format: "jv-web-vehicle-visual-package",
    schemaVersion: 1,
    id: "transform-test-rig",
    displayName: "Transform test rig",
    vehicleFamily: "M6",
    rigProfile: "M6_FULL_RIG_V1",
    units: "meter",
    axes: { forward: "+X", up: "+Y", right: "+Z" },
    asset: {
      kind: "GLB",
      url: "models/test.glb",
      sha256: "a".repeat(64),
      byteLength: 1,
    },
    bindings,
  });
}

function frame() {
  return {
    contractVersion: 1,
    generation: 1,
    stepIndex: 4,
    parts: M6_VISUAL_PART_IDS.map((partId) => ({
      partId,
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
    })),
    segments: M6_VISUAL_SEGMENT_IDS.map((segmentId) => ({
      segmentId,
      start: { x: 0, y: 0, z: 0 },
      end: { x: 0, y: 1, z: 0 },
      lengthMeters: 1,
    })),
  };
}

function binding(result, id) {
  const found = result.find((entry) => entry.bindingId === id);
  assert.ok(found, `missing resolved binding ${id}`);
  return found;
}

function close(actual, expected, epsilon = 1e-5) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

function closePoint(actual, expected) {
  close(actual.x, expected.x);
  close(actual.y, expected.y);
  close(actual.z, expected.z);
}

test("PART composes runtime transform before localFromSource", () => {
  const visualFrame = frame();
  const chassis = visualFrame.parts.find((part) => part.partId === "m6.chassis");
  chassis.transform = {
    position: { x: 10, y: 2, z: 3 },
    rotation: {
      x: 0,
      y: Math.sin(Math.PI / 4),
      z: 0,
      w: Math.cos(Math.PI / 4),
    },
  };
  const visual = packageWith(
    new Map([
      [
        "bind.m6.chassis",
        {
          bindingId: "bind.m6.chassis",
          nodeName: nodeName("m6.chassis"),
          source: { kind: "PART", partId: "m6.chassis" },
          localFromSource: {
            position: [1, 0, 0],
            rotation: [0, 0, 0, 1],
            scale: [1, 1, 1],
          },
        },
      ],
    ]),
  );
  const resolved = binding(
    resolveVehicleVisualBindingsV1(visual, visualFrame),
    "bind.m6.chassis",
  );
  closePoint(
    transformVehicleVisualPointV1(resolved.worldFromNode, { x: 0, y: 0, z: 0 }),
    { x: 10, y: 2, z: 2 },
  );
});

test("SEGMENT_STRETCH maps authored baseline endpoints onto exact physical endpoints", () => {
  const visualFrame = frame();
  const segment = visualFrame.segments.find(
    (entry) => entry.segmentId === "m6.fl.coilover",
  );
  Object.assign(segment, {
    start: { x: 2, y: 3, z: 4 },
    end: { x: 2, y: 5, z: 4 },
    lengthMeters: 2,
  });
  const visual = packageWith(
    new Map([
      [
        "bind.m6.fl.coilover",
        {
          bindingId: "bind.m6.fl.coilover",
          nodeName: nodeName("m6.fl.coilover"),
          source: {
            kind: "SEGMENT_STRETCH",
            segmentId: "m6.fl.coilover",
            axis: "+Y",
            referenceLengthMeters: 0.5,
          },
          localFromSource: identityTransform,
        },
      ],
    ]),
  );
  const resolved = binding(
    resolveVehicleVisualBindingsV1(visual, visualFrame),
    "bind.m6.fl.coilover",
  );
  closePoint(
    transformVehicleVisualPointV1(resolved.worldFromNode, { x: 0, y: -0.25, z: 0 }),
    segment.start,
  );
  closePoint(
    transformVehicleVisualPointV1(resolved.worldFromNode, { x: 0, y: 0.25, z: 0 }),
    segment.end,
  );
});

test("SEGMENT_ENDPOINT_AIM places its pivot at the selected endpoint", () => {
  const visualFrame = frame();
  const segment = visualFrame.segments.find(
    (entry) => entry.segmentId === "m6.fl.steering-link",
  );
  Object.assign(segment, {
    start: { x: 5, y: 1, z: 2 },
    end: { x: 7, y: 1, z: 2 },
    lengthMeters: 2,
  });
  const visual = packageWith(
    new Map([
      [
        "bind.m6.fl.steering-link",
        {
          bindingId: "bind.m6.fl.steering-link",
          nodeName: nodeName("m6.fl.steering-link"),
          source: {
            kind: "SEGMENT_ENDPOINT_AIM",
            segmentId: "m6.fl.steering-link",
            endpoint: "START",
            axis: "+Y",
          },
          localFromSource: identityTransform,
        },
      ],
    ]),
  );
  const resolved = binding(
    resolveVehicleVisualBindingsV1(visual, visualFrame),
    "bind.m6.fl.steering-link",
  );
  closePoint(
    transformVehicleVisualPointV1(resolved.worldFromNode, { x: 0, y: 0, z: 0 }),
    segment.start,
  );
  closePoint(
    transformVehicleVisualPointV1(resolved.worldFromNode, { x: 0, y: 1, z: 0 }),
    { x: 6, y: 1, z: 2 },
  );
});

test("all authoring axes and exact opposite directions resolve deterministically", () => {
  const cases = [
    ["+X", { x: 1, y: 0, z: 0 }],
    ["-X", { x: -1, y: 0, z: 0 }],
    ["+Y", { x: 0, y: 1, z: 0 }],
    ["-Y", { x: 0, y: -1, z: 0 }],
    ["+Z", { x: 0, y: 0, z: 1 }],
    ["-Z", { x: 0, y: 0, z: -1 }],
  ];
  for (const [axis, localAxis] of cases) {
    const visualFrame = frame();
    const segment = visualFrame.segments.find(
      (entry) => entry.segmentId === "m6.fl.coilover",
    );
    Object.assign(segment, {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 0, y: -2, z: 0 },
      lengthMeters: 2,
    });
    const visual = packageWith(
      new Map([
        [
          "bind.m6.fl.coilover",
          {
            bindingId: "bind.m6.fl.coilover",
            nodeName: nodeName("m6.fl.coilover"),
            source: {
              kind: "SEGMENT_STRETCH",
              segmentId: "m6.fl.coilover",
              axis,
              referenceLengthMeters: 2,
            },
            localFromSource: identityTransform,
          },
        ],
      ]),
    );
    const resolved = binding(
      resolveVehicleVisualBindingsV1(visual, visualFrame),
      "bind.m6.fl.coilover",
    );
    closePoint(
      transformVehicleVisualPointV1(resolved.worldFromNode, {
        x: -localAxis.x,
        y: -localAxis.y,
        z: -localAxis.z,
      }),
      { x: 0, y: 0, z: 0 },
    );
  }
});

test("missing runtime sources fail before any partial binding result is returned", () => {
  const visualFrame = frame();
  visualFrame.parts = visualFrame.parts.filter(
    (part) => part.partId !== "m6.chassis",
  );
  assert.throws(
    () => resolveVehicleVisualBindingsV1(packageWith(), visualFrame),
    /missing part m6\.chassis/,
  );
});

test("PART_PAIR_STRETCH follows endpoints owned by two moving rigid parts", () => {
  const visualFrame = frame();
  const chassis = visualFrame.parts.find((part) => part.partId === "m6.chassis");
  const knuckle = visualFrame.parts.find((part) => part.partId === "m6.fl.knuckle");
  chassis.transform = {
    position: { x: 10, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  };
  knuckle.transform = {
    position: { x: 10, y: 0, z: 4 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  };
  const base = packageWith();
  const input = structuredClone(base);
  input.bindings.push({
    bindingId: "bind.cardan.mid",
    nodeName: "JV_CardanMid",
    source: {
      kind: "PART_PAIR_STRETCH",
      startPartId: "m6.chassis",
      startLocalPosition: [0, 0, 1],
      endPartId: "m6.fl.knuckle",
      endLocalPosition: [0, 0, -1],
      axis: "+Y",
      referenceLengthMeters: 1,
    },
    localFromSource: identityTransform,
  });
  const visual = validateVehicleVisualPackageV1(input);
  const resolved = binding(resolveVehicleVisualBindingsV1(visual, visualFrame), "bind.cardan.mid");
  closePoint(
    transformVehicleVisualPointV1(resolved.worldFromNode, { x: 0, y: -0.5, z: 0 }),
    { x: 10, y: 0, z: 1 },
  );
  closePoint(
    transformVehicleVisualPointV1(resolved.worldFromNode, { x: 0, y: 0.5, z: 0 }),
    { x: 10, y: 0, z: 3 },
  );
});

test("PART_PAIR_ENDPOINT_AIM anchors its pivot at the selected live body endpoint", () => {
  const visualFrame = frame();
  const chassis = visualFrame.parts.find((part) => part.partId === "m6.chassis");
  const knuckle = visualFrame.parts.find((part) => part.partId === "m6.fl.knuckle");
  chassis.transform = { position: { x: 1, y: 2, z: 3 }, rotation: { x: 0, y: 0, z: 0, w: 1 } };
  knuckle.transform = { position: { x: 5, y: 2, z: 3 }, rotation: { x: 0, y: 0, z: 0, w: 1 } };
  const input = structuredClone(packageWith());
  input.bindings.push({
    bindingId: "bind.cardan.end",
    nodeName: "JV_CardanEnd",
    source: {
      kind: "PART_PAIR_ENDPOINT_AIM",
      startPartId: "m6.chassis",
      startLocalPosition: [1, 0, 0],
      endPartId: "m6.fl.knuckle",
      endLocalPosition: [-1, 0, 0],
      endpoint: "END",
      axis: "+X",
    },
    localFromSource: identityTransform,
  });
  const visual = validateVehicleVisualPackageV1(input);
  const resolved = binding(resolveVehicleVisualBindingsV1(visual, visualFrame), "bind.cardan.end");
  closePoint(
    transformVehicleVisualPointV1(resolved.worldFromNode, { x: 0, y: 0, z: 0 }),
    { x: 4, y: 2, z: 3 },
  );
  closePoint(
    transformVehicleVisualPointV1(resolved.worldFromNode, { x: 1, y: 0, z: 0 }),
    { x: 3, y: 2, z: 3 },
  );
});

test("PART_PAIR_STRETCH remains endpoint-only when an endpoint body rolls around an unchanged pair axis", () => {
  const visualFrame = frame();
  const upper = visualFrame.parts.find((part) => part.partId === "m6.fl.upper-arm");
  upper.transform = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  };
  const input = structuredClone(packageWith());
  input.bindings.push({
    bindingId: "bind.compat.pair-stretch",
    nodeName: "JV_CompatPairStretch",
    source: {
      kind: "PART_PAIR_STRETCH",
      startPartId: "m6.chassis",
      startLocalPosition: [0, 0, 0],
      endPartId: "m6.fl.upper-arm",
      endLocalPosition: [1, 0, 0],
      axis: "+Y",
      referenceLengthMeters: 1,
    },
    localFromSource: identityTransform,
  });
  const visual = validateVehicleVisualPackageV1(input);
  const before = binding(
    resolveVehicleVisualBindingsV1(visual, visualFrame),
    "bind.compat.pair-stretch",
  ).worldFromNode;
  upper.transform.rotation = {
    x: Math.SQRT1_2,
    y: 0,
    z: 0,
    w: Math.SQRT1_2,
  };
  const after = binding(
    resolveVehicleVisualBindingsV1(visual, visualFrame),
    "bind.compat.pair-stretch",
  ).worldFromNode;
  assert.deepEqual(Array.from(after), Array.from(before));
});

function rollPinnedProbe(end) {
  const visualFrame = frame();
  const upper = visualFrame.parts.find((part) => part.partId === "m6.fl.upper-arm");
  upper.transform = {
    position: end,
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  };
  const input = structuredClone(packageWith());
  input.bindings.push({
    bindingId: "bind.roll-pinned",
    nodeName: "JV_RollPinned",
    source: {
      kind: "PART_PAIR_ROLL_PINNED_STRETCH",
      partId: "m6.fl.upper-arm",
      startPartId: "m6.chassis",
      startLocalPosition: [0, 0, 0],
      endPartId: "m6.fl.upper-arm",
      endLocalPosition: [0, 0, 0],
      referenceStartPosition: [1, 2, 3],
      referenceEndPosition: [3, 2, 3],
      referenceUpDirection: [0, 1, 0],
      rollReferenceAxis: "+Y",
    },
    localFromSource: identityTransform,
  });
  const visual = validateVehicleVisualPackageV1(input);
  return binding(
    resolveVehicleVisualBindingsV1(visual, visualFrame),
    "bind.roll-pinned",
  ).worldFromNode;
}

test("PART_PAIR_ROLL_PINNED_STRETCH maps both reference endpoints exactly through oblique live motion", () => {
  const end = { x: 2, y: 1, z: 4 };
  const matrix = rollPinnedProbe(end);
  closePoint(
    transformVehicleVisualPointV1(matrix, { x: 1, y: 2, z: 3 }),
    { x: 0, y: 0, z: 0 },
  );
  closePoint(
    transformVehicleVisualPointV1(matrix, { x: 3, y: 2, z: 3 }),
    end,
  );
});

test("PART_PAIR_ROLL_PINNED_STRETCH keeps a deterministic mirrored up frame instead of shortest-arc twist", () => {
  const left = rollPinnedProbe({ x: 2, y: 1, z: 4 });
  const right = rollPinnedProbe({ x: 2, y: 1, z: -4 });
  const origin = { x: 1, y: 2, z: 3 };
  const upPoint = { x: 1, y: 3, z: 3 };
  const leftOrigin = transformVehicleVisualPointV1(left, origin);
  const rightOrigin = transformVehicleVisualPointV1(right, origin);
  const leftUp = transformVehicleVisualPointV1(left, upPoint);
  const rightUp = transformVehicleVisualPointV1(right, upPoint);
  const leftVector = {
    x: leftUp.x - leftOrigin.x,
    y: leftUp.y - leftOrigin.y,
    z: leftUp.z - leftOrigin.z,
  };
  const rightVector = {
    x: rightUp.x - rightOrigin.x,
    y: rightUp.y - rightOrigin.y,
    z: rightUp.z - rightOrigin.z,
  };
  close(leftVector.x, rightVector.x);
  close(leftVector.y, rightVector.y);
  close(leftVector.z, -rightVector.z);
  assert.ok(leftVector.y > 0.9);
  assert.ok(rightVector.y > 0.9);
});
