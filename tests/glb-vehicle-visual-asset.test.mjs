import test from "node:test";
import assert from "node:assert/strict";
import { inspectGlbV2 } from "../.test-dist/visual/glb-container.js";
import { validateVehicleVisualAssetV1 } from "../.test-dist/visual/vehicle-visual-asset-gate.js";
import { validateVehicleVisualPackageV1 } from "../.test-dist/visual/vehicle-visual-package.js";
import {
  VALID_TRIANGLE_PRIMITIVE,
  buildGlb,
  completeVisualBindings,
  packageForGlb,
  validTriangleGeometryJson,
} from "./helpers/vehicle-visual-fixture.mjs";

test("complete M6 GLB passes byte, geometry and node ownership gates", async () => {
  const bytes = buildGlb();
  const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
  const receipt = await validateVehicleVisualAssetV1(visual, bytes, null);

  assert.equal(receipt.byteLength, bytes.byteLength);
  assert.equal(receipt.boundNodeCount, 26);
  assert.equal(receipt.glb.version, 2);
  assert.equal(receipt.glb.meshCount, 1);
  assert.equal(receipt.glb.primitiveCount, 1);
  assert.equal(receipt.glb.trianglePrimitiveCount, 1);
  assert.equal(receipt.glb.bufferViewCount, 2);
  assert.equal(receipt.glb.accessorCount, 2);
  assert.equal(receipt.glb.declaredBufferByteLength, 42);
  assert.equal(receipt.glb.nodeNames.length, 26);
  assert.deepEqual(receipt.glb.duplicateNodeNames, []);
  assert.deepEqual(receipt.glb.externalUris, []);
});

test("GLB container rejects invalid magic, version and declared length", () => {
  const badMagic = buildGlb();
  new DataView(badMagic.buffer).setUint32(0, 0, true);
  assert.throws(() => inspectGlbV2(badMagic), /magic/);

  const badVersion = buildGlb();
  new DataView(badVersion.buffer).setUint32(4, 1, true);
  assert.throws(() => inspectGlbV2(badVersion), /version/);

  const badLength = buildGlb();
  new DataView(badLength.buffer).setUint32(8, badLength.byteLength - 4, true);
  assert.throws(() => inspectGlbV2(badLength), /declared byte length/);
});

test("asset gate rejects byteLength and SHA-256 drift before GLB use", async () => {
  const bytes = buildGlb();
  const wrongLength = validateVehicleVisualPackageV1({
    ...packageForGlb(bytes),
    asset: { ...packageForGlb(bytes).asset, byteLength: bytes.byteLength + 4 },
  });
  await assert.rejects(
    () => validateVehicleVisualAssetV1(wrongLength, bytes, null),
    /byteLength/,
  );

  const wrongHash = validateVehicleVisualPackageV1({
    ...packageForGlb(bytes),
    asset: { ...packageForGlb(bytes).asset, sha256: "f".repeat(64) },
  });
  await assert.rejects(
    () => validateVehicleVisualAssetV1(wrongHash, bytes, null),
    /SHA-256/,
  );
});

test("asset gate rejects duplicate and missing bound nodes", async () => {
  const bindings = completeVisualBindings();
  const duplicateName = bindings[0].nodeName;
  const duplicateBytes = buildGlb({
    nodes: bindings.map((binding, index) => ({
      name: index === 1 ? duplicateName : binding.nodeName,
      ...(index === 0 ? { mesh: 0 } : {}),
    })),
  });
  const duplicatePackage = validateVehicleVisualPackageV1(
    packageForGlb(duplicateBytes),
  );
  await assert.rejects(
    () => validateVehicleVisualAssetV1(duplicatePackage, duplicateBytes, null),
    /duplicate GLB node names/,
  );

  const missingBytes = buildGlb({
    nodes: bindings.slice(0, -1).map((binding, index) => ({
      name: binding.nodeName,
      ...(index === 0 ? { mesh: 0 } : {}),
    })),
  });
  const missingPackage = validateVehicleVisualPackageV1(packageForGlb(missingBytes));
  await assert.rejects(
    () => validateVehicleVisualAssetV1(missingPackage, missingBytes, null),
    /bound GLB nodes are missing/,
  );
});

test("V1 rejects external resources and unsupported deformation features", async () => {
  const cases = [
    [{ buffers: [{ byteLength: 42, uri: "mesh.bin" }] }, /external GLB resources/],
    [{ images: [{ uri: "texture.png" }] }, /external GLB resources/],
    [{ animations: [{}] }, /animations/],
    [{ skins: [{}] }, /skins/],
    [
      {
        meshes: [
          {
            primitives: [
              { ...VALID_TRIANGLE_PRIMITIVE, targets: [{}] },
            ],
          },
        ],
      },
      /morph targets/,
    ],
    [{ extensionsUsed: ["KHR_draco_mesh_compression"] }, /extensions/],
    [{ extensionsRequired: ["KHR_texture_basisu"] }, /extensions/],
    [
      {
        nodes: completeVisualBindings().map((binding, index) => ({
          name: binding.nodeName,
          ...(index === 0 ? { mesh: 0, scale: [-1, 1, 1] } : {}),
        })),
      },
      /zero\/negative scale/,
    ],
  ];

  for (const [overrides, expected] of cases) {
    const bytes = buildGlb(overrides);
    const visual = validateVehicleVisualPackageV1(packageForGlb(bytes));
    await assert.rejects(
      () => validateVehicleVisualAssetV1(visual, bytes, null),
      expected,
    );
  }
});

test("V1 rejects non-triangle and sparse mesh data explicitly", async () => {
  const lineBytes = buildGlb({
    meshes: [
      {
        primitives: [{ ...VALID_TRIANGLE_PRIMITIVE, mode: 1 }],
      },
    ],
  });
  const linePackage = validateVehicleVisualPackageV1(packageForGlb(lineBytes));
  await assert.rejects(
    () => validateVehicleVisualAssetV1(linePackage, lineBytes, null),
    /TRIANGLES primitives only/,
  );

  const geometry = validTriangleGeometryJson();
  geometry.accessors[0].sparse = {
    count: 1,
    indices: { bufferView: 1, componentType: 5123 },
    values: { bufferView: 0 },
  };
  const sparseBytes = buildGlb({ accessors: geometry.accessors });
  const sparsePackage = validateVehicleVisualPackageV1(packageForGlb(sparseBytes));
  await assert.rejects(
    () => validateVehicleVisualAssetV1(sparsePackage, sparseBytes, null),
    /sparse accessors/,
  );
});

test("GLB geometry references and byte ranges fail closed", () => {
  const missingPosition = buildGlb({
    meshes: [{ primitives: [{ attributes: {}, mode: 4 }] }],
  });
  assert.throws(() => inspectGlbV2(missingPosition), /POSITION/);

  const missingAccessor = buildGlb({
    meshes: [
      {
        primitives: [
          { attributes: { POSITION: 99 }, mode: 4 },
        ],
      },
    ],
  });
  assert.throws(() => inspectGlbV2(missingAccessor), /missing accessor/);

  const escapingView = buildGlb({
    bufferViews: [
      { buffer: 0, byteOffset: 20, byteLength: 40 },
      { buffer: 0, byteOffset: 36, byteLength: 6 },
    ],
  });
  assert.throws(() => inspectGlbV2(escapingView), /exceeds buffer/);

  const wrongPositionType = buildGlb({
    accessors: [
      { bufferView: 0, componentType: 5123, count: 3, type: "VEC3" },
      { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
    ],
  });
  assert.throws(() => inspectGlbV2(wrongPositionType), /FLOAT VEC3/);
});

test("GLB parser rejects malformed chunk structure", () => {
  const unknownChunk = buildGlb();
  const view = new DataView(unknownChunk.buffer);
  const jsonLength = view.getUint32(12, true);
  view.setUint32(20 + jsonLength + 4, 0x12345678, true);
  assert.throws(() => inspectGlbV2(unknownChunk), /unsupported chunk type/);

  const unaligned = buildGlb();
  new DataView(unaligned.buffer).setUint32(12, 3, true);
  assert.throws(() => inspectGlbV2(unaligned), /4-byte aligned/);
});
