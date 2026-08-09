import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { buildOwnerM6FullRigPackageR2 } from '../tools/owner-vehicle/owner-m6-full-rig-package-r2.mjs';
import { buildOwnerM6FullRigPackageR3 } from '../tools/owner-vehicle/owner-m6-full-rig-package-r3.mjs';

const sourceRoot = 'assets/owner-vehicle/source';
const contractRoot = 'assets/owner-vehicle/contracts';
const EXPECTED_CHANGED_BINDINGS = Object.freeze([
  'owner.fl.upper-arm',
  'owner.fl.lower-arm',
  'owner.fl.knuckle.socket-chassismount-b',
  'owner.fl.knuckle.socket-wheelcenter',
  'owner.fr.upper-arm',
  'owner.fr.lower-arm',
  'owner.fr.knuckle.socket-chassismount-b',
  'owner.fr.knuckle.socket-wheelcenter',
]);

async function inputs() {
  const read = (name) => readFile(`${sourceRoot}/${name}`, 'utf8');
  const contract = (name) => readFile(`${contractRoot}/${name}`, 'utf8');
  return {
    chassisText: await read('Nadwozie.gltf'),
    wheelText: await read('Offroad_Big_Wheels.gltf'),
    frontSuspensionText: await read('OneSided_Steering_Suspension_Rig.gltf'),
    rearSuspensionText: await read('One_Sided_wheel_mount.gltf'),
    damperText: await read('Asset_Dumper.gltf'),
    cardanText: await read('Cardan_shaft.gltf'),
    factoryReceiptText: await readFile('public/receipts/jv_m6_factory_receipt.json', 'utf8'),
    contractTexts: {
      wheel: await contract('offroad_big_wheel.asset.json'),
      frontSuspension: await contract('one_sided_steering_suspension.asset.json'),
      rearSuspension: await contract('one_sided_wheel_mount.asset.json'),
      damper: await contract('asset_dumper.asset.json'),
      cardan: await contract('cardan_shaft.asset.json'),
    },
  };
}

function decodeGlb(glb) {
  const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
  const jsonLength = view.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(glb.slice(20, 20 + jsonLength)).trim());
  return Object.freeze({ json, bin: glb.slice(20 + jsonLength + 8) });
}

function bufferViewBytes(decoded, index) {
  const view = decoded.json.bufferViews[index];
  const offset = view.byteOffset ?? 0;
  return decoded.bin.slice(offset, offset + view.byteLength);
}

function accessorBytes(decoded, index) {
  return bufferViewBytes(decoded, decoded.json.accessors[index].bufferView);
}

function bindingGeometryHash(decoded, visualPackage, bindingId) {
  const binding = visualPackage.bindings.find((candidate) => candidate.bindingId === bindingId);
  assert.ok(binding, `missing binding ${bindingId}`);
  const node = decoded.json.nodes.find((candidate) => candidate.name === binding.nodeName);
  assert.ok(node, `missing node ${binding.nodeName}`);
  const mesh = decoded.json.meshes[node.mesh];
  const hash = createHash('sha256');
  for (const primitive of mesh.primitives) {
    hash.update(accessorBytes(decoded, primitive.attributes.POSITION));
    if (primitive.attributes.NORMAL !== undefined) hash.update(accessorBytes(decoded, primitive.attributes.NORMAL));
    if (primitive.indices !== undefined) hash.update(accessorBytes(decoded, primitive.indices));
  }
  return hash.digest('hex');
}

function imageHashes(decoded) {
  return (decoded.json.images ?? []).map((image) =>
    createHash('sha256').update(bufferViewBytes(decoded, image.bufferView)).digest('hex'),
  );
}

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test('R3 front-reference package is deterministic and keeps R2 source authority', async () => {
  const input = await inputs();
  const a = buildOwnerM6FullRigPackageR3(input);
  const b = buildOwnerM6FullRigPackageR3(input);
  assert.deepEqual(a.glb, b.glb);
  assert.equal(a.manifestText, b.manifestText);
  assert.deepEqual(a.report, b.report);
  assert.equal(a.visualPackage.id, 'm6-owner-full-rig-r3');
  assert.equal(a.report.schema, 'JV_WEB_OWNER_M6_FULL_RIG_R3');
  assert.deepEqual(a.report.calibrationStrategy, {
    frontWishbones: 'R3_AUTHORED_REFERENCE_PATCH_OVER_EXACT_R2',
    frontKnuckle: 'R3_AUTHORED_UPRIGHT_REFERENCE_PATCH_OVER_EXACT_R2',
    rearWishbones: 'R2_BOUNDS_INHERITED',
    otherSubsystems: 'R2_BYTE_LAYOUT_INHERITED',
  });
  assert.equal(a.report.output.realBindingCount, 53);
  assert.deepEqual(a.report.output.diagnosticBindingIds, ['diagnostic.rack.coverage']);
  assert.equal(a.glb.byteLength, 829128);
  assert.equal(a.report.output.sha256, '2a9b368a6e3a24c601cf0ee05d2739a12783e70a5147fa7d07f34e0cbe68ab8e');
});

test('R3 blast radius is exactly the front wishbone and knuckle geometry bindings', async () => {
  const input = await inputs();
  const r2 = buildOwnerM6FullRigPackageR2(input);
  const r3 = buildOwnerM6FullRigPackageR3(input);
  const d2 = decodeGlb(r2.glb);
  const d3 = decodeGlb(r3.glb);

  assert.deepEqual(
    r3.visualPackage.bindings.map((binding) => binding.bindingId),
    r2.visualPackage.bindings.map((binding) => binding.bindingId),
  );
  assert.deepEqual(r3.report.sourceAuthority, r2.report.sourceAuthority);
  assert.deepEqual(imageHashes(d3), imageHashes(d2));
  assert.equal(d3.json.nodes.length, d2.json.nodes.length);
  assert.equal(d3.json.meshes.length, d2.json.meshes.length);
  assert.equal(d3.json.images.length, d2.json.images.length);
  assert.equal(d3.json.textures.length, d2.json.textures.length);

  const changed = [];
  for (const binding of r2.visualPackage.bindings) {
    if (
      bindingGeometryHash(d2, r2.visualPackage, binding.bindingId) !==
      bindingGeometryHash(d3, r3.visualPackage, binding.bindingId)
    ) {
      changed.push(binding.bindingId);
    }
  }
  assert.deepEqual(changed, EXPECTED_CHANGED_BINDINGS);
});

test('R3 front wishbones map authored references to physical hardpoints with one mirrored solve', async () => {
  const result = buildOwnerM6FullRigPackageR3(await inputs());
  const corners = result.report.calibration.corners;
  for (const corner of ['fl', 'fr']) {
    for (const which of ['upper', 'lower']) {
      const arm = corners[corner].arms[which];
      assert.equal(arm.mode, 'AUTHORED_REFERENCE_TO_PHYSICAL_HARDPOINT_R3');
      close(arm.hingeErrorMeters, 0);
      close(arm.outboardErrorMeters, 0);
      assert.equal(arm.mirrored, corner === 'fr');
    }
  }
  close(corners.fl.arms.upper.axialScale, corners.fr.arms.upper.axialScale);
  close(corners.fl.arms.lower.axialScale, corners.fr.arms.lower.axialScale);
  close(corners.fl.arms.upper.spreadScale, corners.fr.arms.upper.spreadScale);
  close(corners.fl.arms.lower.spreadScale, corners.fr.arms.lower.spreadScale);
  for (const corner of ['fl', 'fr']) {
    for (const token of ['socket-chassismount-b', 'socket-wheelcenter']) {
      const knuckle = corners[corner].knuckle[token];
      close(knuckle.wheelCenterErrorMeters, 0);
      close(knuckle.upperBallErrorMeters, 0, 1e-15);
      close(knuckle.lowerBallErrorMeters, 0, 1e-15);
      assert.equal(knuckle.mirrored, corner === 'fr');
    }
  }
  close(corners.fl.knuckle['socket-chassismount-b'].radialScale, corners.fr.knuckle['socket-chassismount-b'].radialScale);
  close(corners.fl.knuckle['socket-chassismount-b'].kingpinScale, corners.fr.knuckle['socket-chassismount-b'].kingpinScale);
  assert.equal(corners.rl.arms.upper.restEndpointErrorMeters, 0);
  assert.equal(corners.rr.arms.upper.restEndpointErrorMeters, 0);
});
