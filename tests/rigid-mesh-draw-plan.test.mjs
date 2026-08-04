import test from "node:test";
import assert from "node:assert/strict";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { decodeGlbRigidCpuAssetV1 } from "../.test-dist/visual/glb-rigid-mesh-decoder.js";
import {
  buildRigidMeshDrawPlanV1,
  buildVehicleVisualDrawPlanV1,
} from "../.test-dist/visual/rigid-mesh-draw-plan.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import { transformVehicleVisualPointV1 } from "../.test-dist/visual/vehicle-visual-transform.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";
import { buildTinyVehicleVisualFixture } from "../tools/tiny-vehicle-visual-fixture-lib.mjs";
import {
  buildGlb,
  completeVisualBindings,
  packageForGlb,
} from "./helpers/vehicle-visual-fixture.mjs";

function visualFrame() {
  return {
    contractVersion: 1,
    generation: 1,
    stepIndex: 10,
    parts: M6_VISUAL_PART_IDS.map((partId, index) => ({
      partId,
      transform: {
        position: { x: index, y: 1, z: -index },
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

function identityMatrix() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

test("tiny vehicle runtime produces one draw node for every visual channel", async () => {
  const generated = buildTinyVehicleVisualFixture({
    partIds: M6_VISUAL_PART_IDS,
    segmentIds: M6_VISUAL_SEGMENT_IDS,
  });
  const visualPackage = validateVehicleVisualPackageV1(
    generated.visualPackage,
  );
  const assetReceipt = await validateVehicleVisualAssetV1(
    visualPackage,
    generated.glb,
    null,
  );
  const cpuAsset = decodeGlbRigidCpuAssetV1(
    generated.glb,
    visualPackage.bindings.map((binding) => binding.nodeName),
  );
  const runtime = {
    packageUrl: "https://example.test/vehicles/tiny/vehicle.visual.json",
    assetUrl: "https://example.test/vehicles/tiny/models/m6-rig-proof.glb",
    visualPackage,
    assetReceipt,
    cpuAsset,
  };
  const frame = visualFrame();
  const plan = buildVehicleVisualDrawPlanV1(runtime, frame);

  assert.equal(plan.length, 26);
  assert.equal(plan.filter((command) => command.meshIndex === 0).length, 18);
  assert.equal(plan.filter((command) => command.meshIndex === 1).length, 8);

  const chassis = plan.find((command) => command.nodeName === "JV_m6_chassis");
  assert.deepEqual(
    transformVehicleVisualPointV1(chassis.worldFromNode, { x: 0, y: 0, z: 0 }),
    { x: 0, y: 1, z: 0 },
  );

  const coilover = plan.find(
    (command) => command.nodeName === "JV_m6_fl_coilover",
  );
  assert.deepEqual(
    transformVehicleVisualPointV1(coilover.worldFromNode, { x: 0, y: -0.5, z: 0 }),
    { x: 0, y: 0, z: 0 },
  );
  assert.deepEqual(
    transformVehicleVisualPointV1(coilover.worldFromNode, { x: 0, y: 0.5, z: 0 }),
    { x: 0, y: 2, z: 0 },
  );
});

test("generic draw plan composes decorative child hierarchy under one owned root", () => {
  const bindings = completeVisualBindings();
  const childIndex = bindings.length;
  const nodes = [
    ...bindings.map((binding, index) => ({
      name: binding.nodeName,
      ...(index === 0 ? { children: [childIndex] } : {}),
    })),
    {
      name: "JV_DecorativeChild",
      mesh: 0,
      translation: [1, 2, 3],
    },
  ];
  const bytes = buildGlb({ nodes });
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  const cpu = decodeGlbRigidCpuAssetV1(
    bytes,
    visual.bindings.map((binding) => binding.nodeName),
  );
  const rootIndex = cpu.nodeIndexByName.get(bindings[0].nodeName);
  const plan = buildRigidMeshDrawPlanV1(
    cpu,
    new Map([[rootIndex, identityMatrix()]]),
  );
  assert.equal(plan.length, 1);
  assert.equal(plan[0].nodeName, "JV_DecorativeChild");
  assert.deepEqual(
    transformVehicleVisualPointV1(plan[0].worldFromNode, { x: 0, y: 0, z: 0 }),
    { x: 1, y: 2, z: 3 },
  );
});

test("overlapping root ownership fails before duplicate draws", () => {
  const bindings = completeVisualBindings();
  const childIndex = bindings.length;
  const nodes = [
    ...bindings.map((binding, index) => ({
      name: binding.nodeName,
      ...(index === 0 ? { children: [childIndex] } : {}),
    })),
    { name: "JV_Child", mesh: 0 },
  ];
  const bytes = buildGlb({ nodes });
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  const cpu = decodeGlbRigidCpuAssetV1(
    bytes,
    visual.bindings.map((binding) => binding.nodeName),
  );
  assert.throws(
    () =>
      buildRigidMeshDrawPlanV1(
        cpu,
        new Map([
          [0, identityMatrix()],
          [childIndex, identityMatrix()],
        ]),
      ),
    /not a root|owned more than once/,
  );
});
