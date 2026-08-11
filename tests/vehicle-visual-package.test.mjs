import test from "node:test";
import assert from "node:assert/strict";
import {
  loadVehicleVisualPackageV1,
  validateVehicleVisualPackageV1,
} from "../.test-dist/visual/vehicle-visual-package.js";
import {
  M6_VISUAL_PART_IDS,
  M6_VISUAL_SEGMENT_IDS,
} from "../.test-dist/vehicle/m6/m6-visual-contract.js";

const identityTransform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
};

function nodeName(id) {
  return `JV_${id.replaceAll(".", "_").replaceAll("-", "_")}`;
}

function validPackage() {
  const partBindings = M6_VISUAL_PART_IDS.map((partId) => ({
    bindingId: `bind.${partId}`,
    nodeName: nodeName(partId),
    source: { kind: "PART", partId },
    localFromSource: identityTransform,
  }));
  const segmentBindings = M6_VISUAL_SEGMENT_IDS.map((segmentId) => ({
    bindingId: `bind.${segmentId}`,
    nodeName: nodeName(segmentId),
    source: {
      kind: "SEGMENT_STRETCH",
      segmentId,
      axis: "+Y",
      referenceLengthMeters: 1,
    },
    localFromSource: identityTransform,
  }));
  return {
    format: "jv-web-vehicle-visual-package",
    schemaVersion: 1,
    id: "m6-demonstrator-full-rig",
    displayName: "M6 Demonstrator Full Rig",
    vehicleFamily: "M6",
    rigProfile: "M6_FULL_RIG_V1",
    units: "meter",
    axes: { forward: "+X", up: "+Y", right: "+Z" },
    asset: {
      kind: "GLB",
      url: "models/m6-demonstrator.glb",
      sha256: "a".repeat(64),
      byteLength: 123456,
    },
    bindings: [...partBindings, ...segmentBindings],
  };
}

test("strict M6 full-rig package accepts complete rigid and segment coverage", () => {
  const visual = validateVehicleVisualPackageV1(validPackage());
  assert.equal(visual.bindings.length, 26);
  assert.equal(visual.asset.url, "models/m6-demonstrator.glb");
  assert.equal(visual.rigProfile, "M6_FULL_RIG_V1");
});

test("stretch bindings require an explicit positive authored baseline", () => {
  const missing = validPackage();
  delete missing.bindings.find(
    (binding) => binding.source.kind === "SEGMENT_STRETCH",
  ).source.referenceLengthMeters;
  assert.throws(
    () => validateVehicleVisualPackageV1(missing),
    /keys differ|referenceLengthMeters/,
  );

  const zero = validPackage();
  zero.bindings.find(
    (binding) => binding.source.kind === "SEGMENT_STRETCH",
  ).source.referenceLengthMeters = 0;
  assert.throws(
    () => validateVehicleVisualPackageV1(zero),
    /greater than zero/,
  );
});

test("multiple visual nodes may follow one physical source", () => {
  const input = validPackage();
  input.bindings.push({
    bindingId: "bind.m6.fl.wheel.brake-disc",
    nodeName: "JV_BrakeDisc_FL",
    source: { kind: "PART", partId: "m6.fl.wheel" },
    localFromSource: identityTransform,
  });
  assert.doesNotThrow(() => validateVehicleVisualPackageV1(input));
});

test("one GLB node cannot be bound twice", () => {
  const input = validPackage();
  input.bindings[1].nodeName = input.bindings[0].nodeName;
  assert.throws(
    () => validateVehicleVisualPackageV1(input),
    /nodeName is bound more than once/,
  );
});

test("M6 full-rig package rejects missing or unknown runtime channels", () => {
  const missing = validPackage();
  missing.bindings = missing.bindings.filter(
    (binding) => binding.source.partId !== "m6.rr.lower-arm",
  );
  assert.throws(
    () => validateVehicleVisualPackageV1(missing),
    /coverage is incomplete/,
  );

  const unknown = validPackage();
  unknown.bindings[0].source.partId = "m6.unknown.body";
  assert.throws(
    () => validateVehicleVisualPackageV1(unknown),
    /unknown M6 partId/,
  );
});

test("visual package rejects negative scale and non-normalized corrections", () => {
  const mirrored = validPackage();
  mirrored.bindings[0].localFromSource = {
    ...identityTransform,
    scale: [-1, 1, 1],
  };
  assert.throws(
    () => validateVehicleVisualPackageV1(mirrored),
    /only positive values/,
  );

  const badRotation = validPackage();
  badRotation.bindings[0].localFromSource = {
    ...identityTransform,
    rotation: [0, 0, 0, 2],
  };
  assert.throws(
    () => validateVehicleVisualPackageV1(badRotation),
    /normalized quaternion/,
  );
});

test("GLB reference remains portable, local and byte-pinned", () => {
  for (const url of [
    "/models/m6.glb",
    "../models/m6.glb",
    "models\\m6.glb",
    "models//m6.glb",
    "models/%2e%2e/m6.glb",
    "models/m6.glb?version=1",
    "https://cdn.example/m6.glb",
    "models/m6.gltf",
  ]) {
    const input = validPackage();
    input.asset.url = url;
    assert.throws(
      () => validateVehicleVisualPackageV1(input),
      /site-relative URL|inside its asset package|\.glb file/,
      url,
    );
  }

  const badHash = validPackage();
  badHash.asset.sha256 = "bad";
  assert.throws(() => validateVehicleVisualPackageV1(badHash), /SHA-256/);

  const badLength = validPackage();
  badLength.asset.byteLength = 0;
  assert.throws(() => validateVehicleVisualPackageV1(badLength), /positive integer/);
});

test("endpoint-aim bindings support two-piece coilovers", () => {
  const input = validPackage();
  input.bindings.push(
    {
      bindingId: "bind.m6.fl.coilover.body",
      nodeName: "JV_CoiloverBody_FL",
      source: {
        kind: "SEGMENT_ENDPOINT_AIM",
        segmentId: "m6.fl.coilover",
        endpoint: "START",
        axis: "+Y",
      },
      localFromSource: identityTransform,
    },
    {
      bindingId: "bind.m6.fl.coilover.shaft",
      nodeName: "JV_CoiloverShaft_FL",
      source: {
        kind: "SEGMENT_ENDPOINT_AIM",
        segmentId: "m6.fl.coilover",
        endpoint: "END",
        axis: "-Y",
      },
      localFromSource: identityTransform,
    },
  );
  assert.doesNotThrow(() => validateVehicleVisualPackageV1(input));
});

test("visual package loader validates HTTP and the strict payload", async () => {
  const loaded = await loadVehicleVisualPackageV1(
    "vehicles/m6.visual.json",
    async (url) => ({
      ok: url === "vehicles/m6.visual.json",
      status: 200,
      async json() {
        return validPackage();
      },
    }),
  );
  assert.equal(loaded.id, "m6-demonstrator-full-rig");

  await assert.rejects(
    () =>
      loadVehicleVisualPackageV1("vehicles/missing.visual.json", async () => ({
        ok: false,
        status: 404,
        async json() {
          return null;
        },
      })),
    /HTTP 404/,
  );
});

test("part-pair visual bindings validate two live body endpoints without creating physics", () => {
  const input = validPackage();
  input.bindings.push(
    {
      bindingId: "bind.m6.fl.cardan.mid",
      nodeName: "JV_CardanMid_FL",
      source: {
        kind: "PART_PAIR_STRETCH",
        startPartId: "m6.chassis",
        startLocalPosition: [1, 0, -0.3],
        endPartId: "m6.fl.knuckle",
        endLocalPosition: [0, 0, 0.1],
        axis: "-X",
        referenceLengthMeters: 0.5,
      },
      localFromSource: identityTransform,
    },
    {
      bindingId: "bind.m6.fl.cardan.hub",
      nodeName: "JV_CardanHub_FL",
      source: {
        kind: "PART_PAIR_ENDPOINT_AIM",
        startPartId: "m6.chassis",
        startLocalPosition: [1, 0, -0.3],
        endPartId: "m6.fl.knuckle",
        endLocalPosition: [0, 0, 0.1],
        endpoint: "END",
        axis: "+X",
      },
      localFromSource: identityTransform,
    },
  );
  assert.doesNotThrow(() => validateVehicleVisualPackageV1(input));

  const invalid = structuredClone(input);
  invalid.bindings.at(-1).source.endPartId = "m6.unknown.knuckle";
  assert.throws(() => validateVehicleVisualPackageV1(invalid), /unknown M6 partId/);
});

test("roll-pinned part-pair stretch can represent one visual part without changing pair-stretch semantics", () => {
  const input = validPackage();
  const upper = input.bindings.find(
    (binding) => binding.source.kind === "PART" && binding.source.partId === "m6.fl.upper-arm",
  );
  assert.ok(upper);
  upper.source = {
    kind: "PART_PAIR_ROLL_PINNED_STRETCH",
    partId: "m6.fl.upper-arm",
    startPartId: "m6.chassis",
    startLocalPosition: [1, 0, -0.5],
    endPartId: "m6.fl.upper-arm",
    endLocalPosition: [0, 0, -0.4],
    referenceStartPosition: [0, 0, 0],
    referenceEndPosition: [0, 0, -0.4],
    referenceUpDirection: [0, 1, 0],
    rollReferenceAxis: "+Y",
  };
  assert.doesNotThrow(() => validateVehicleVisualPackageV1(input));

  const degenerate = structuredClone(input);
  degenerate.bindings.find(
    (binding) => binding.bindingId === upper.bindingId,
  ).source.referenceEndPosition = [0, 0, 0];
  assert.throws(
    () => validateVehicleVisualPackageV1(degenerate),
    /reference endpoints must be distinct/,
  );

  const parallelUp = structuredClone(input);
  parallelUp.bindings.find(
    (binding) => binding.bindingId === upper.bindingId,
  ).source.referenceUpDirection = [0, 0, 1];
  assert.throws(
    () => validateVehicleVisualPackageV1(parallelUp),
    /must not be parallel to the reference pair axis/,
  );
});
