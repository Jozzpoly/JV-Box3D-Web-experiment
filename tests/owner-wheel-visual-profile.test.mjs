import test from "node:test";
import assert from "node:assert/strict";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import { buildVehicleVisualDrawPlanV1 } from "../.test-dist/visual/rigid-mesh-draw-plan.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import {
  M6_OWNER_WHEEL_VISUAL_STOCK_WIDTH_METERS,
  resolveM6OwnerWheelVisualProfile,
} from "../.test-dist/render/m6-owner-wheel-visual-profile.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import {
  buildGlb,
  completeVisualBindings,
  packageForGlb,
} from "./helpers/vehicle-visual-fixture.mjs";

function visualFrame() {
  return {
    contractVersion: 1,
    generation: 1,
    stepIndex: 1,
    parts: M6_VISUAL_PART_IDS.map((partId, index) => ({
      partId,
      transform: {
        position: { x: index * 0.5, y: 1 + index * 0.1, z: -index * 0.25 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
    })),
    segments: M6_VISUAL_SEGMENT_IDS.map((segmentId, index) => ({
      segmentId,
      start: { x: index, y: 0, z: 0 },
      end: { x: index, y: 2, z: 0 },
      lengthMeters: 2,
    })),
  };
}

function ownerR3Bindings() {
  return completeVisualBindings().map((binding) => {
    if (
      binding.source.kind === "PART" &&
      /^m6\.(fl|fr|rl|rr)\.wheel$/.test(binding.source.partId)
    ) {
      const corner = binding.source.partId.split(".")[1];
      return { ...binding, bindingId: `owner.${corner}.wheel` };
    }
    return binding;
  });
}

async function runtimeFor(id, bindings) {
  const bytes = buildGlb();
  const visualPackage = validateVehicleVisualPackageV1(
    packageForGlb(bytes, { id, bindings }),
  );
  const assetReceipt = await validateVehicleVisualAssetV1(
    visualPackage,
    bytes,
    null,
  );
  const cpuAsset = decodeGlbRigidCpuAssetV1(
    bytes,
    visualPackage.bindings.map((binding) => binding.nodeName),
  );
  return {
    packageUrl: `https://example.test/vehicles/${id}/vehicle.visual.json`,
    assetUrl: `https://example.test/vehicles/${id}/models/vehicle.glb`,
    visualPackage,
    assetReceipt,
    cpuAsset,
  };
}

function matrixValues(matrix) {
  return Array.from(matrix);
}

function assertSameNumber(actual, expected, label, epsilon = 1e-6) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${label}: expected ${actual} to be close to ${expected}`,
  );
}

test("owner wheel visual profiles are explicit visual widths with stock fail-safe", () => {
  const stock = resolveM6OwnerWheelVisualProfile("");
  const explicitStock = resolveM6OwnerWheelVisualProfile("?jvWheelVisual=stock");
  const narrow = resolveM6OwnerWheelVisualProfile("?jvWheelVisual=narrow");
  const slim = resolveM6OwnerWheelVisualProfile("?jvWheelVisual=slim");
  const unknown = resolveM6OwnerWheelVisualProfile("?jvWheelVisual=wat");

  assert.equal(M6_OWNER_WHEEL_VISUAL_STOCK_WIDTH_METERS, 0.4375);
  assert.deepEqual(stock, explicitStock);
  assert.equal(stock.id, "stock");
  assert.equal(stock.widthMeters, 0.4375);
  assert.equal(stock.widthScale, 1);
  assert.equal(narrow.id, "narrow");
  assert.equal(narrow.widthMeters, 0.36);
  assertSameNumber(narrow.widthScale, 0.36 / 0.4375, "narrow scale");
  assert.equal(slim.id, "slim");
  assert.equal(slim.widthMeters, 0.32);
  assertSameNumber(slim.widthScale, 0.32 / 0.4375, "slim scale");
  assert.deepEqual(unknown, stock);
});

test("R3 wheel profile scales only four wheel-root local Y axes and preserves centers plus X/Z", async () => {
  const bindings = ownerR3Bindings();
  assert.equal(bindings.filter((binding) => binding.bindingId.endsWith(".wheel")).length, 4);
  const runtime = await runtimeFor("m6-owner-full-rig-r3", bindings);
  const frame = visualFrame();
  const stock = buildVehicleVisualDrawPlanV1(runtime, frame, 1);
  const widthScale = 0.32 / 0.4375;
  const slim = buildVehicleVisualDrawPlanV1(runtime, frame, widthScale);

  assert.equal(stock.length, slim.length);
  let scaledWheelCommands = 0;
  for (let index = 0; index < stock.length; index += 1) {
    const before = stock[index];
    const after = slim[index];
    assert.equal(after.nodeName, before.nodeName);
    const binding = bindings.find((candidate) => candidate.nodeName === before.nodeName);
    assert.ok(binding);
    const isWheel = binding.bindingId.endsWith(".wheel");
    if (!isWheel) {
      assert.deepEqual(matrixValues(after.worldFromNode), matrixValues(before.worldFromNode));
      continue;
    }
    scaledWheelCommands += 1;
    for (const matrixIndex of [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15]) {
      assertSameNumber(
        after.worldFromNode[matrixIndex],
        before.worldFromNode[matrixIndex],
        `wheel matrix index ${matrixIndex}`,
      );
    }
    for (const matrixIndex of [4, 5, 6, 7]) {
      assertSameNumber(
        after.worldFromNode[matrixIndex],
        before.worldFromNode[matrixIndex] * widthScale,
        `wheel Y-axis matrix index ${matrixIndex}`,
      );
    }
  }
  assert.equal(scaledWheelCommands, 4);
});

test("wheel width scale is inert for non-owner-R3 visual packages", async () => {
  const bindings = ownerR3Bindings();
  const runtime = await runtimeFor("m6-demonstrator-full-rig", bindings);
  const frame = visualFrame();
  const stock = buildVehicleVisualDrawPlanV1(runtime, frame, 1);
  const requestedSlim = buildVehicleVisualDrawPlanV1(runtime, frame, 0.32 / 0.4375);
  assert.equal(stock.length, requestedSlim.length);
  for (let index = 0; index < stock.length; index += 1) {
    assert.deepEqual(
      matrixValues(requestedSlim[index].worldFromNode),
      matrixValues(stock[index].worldFromNode),
    );
  }
});
