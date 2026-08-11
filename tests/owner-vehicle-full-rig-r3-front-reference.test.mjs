import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { buildOwnerM6FullRigPackageR2 } from '../tools/owner-vehicle/owner-m6-full-rig-package-r2.mjs';
import { buildOwnerM6FullRigPackageR3 } from '../tools/owner-vehicle/owner-m6-full-rig-package-r3.mjs';
import {
  resolveVehicleVisualBindingsV1,
  transformVehicleVisualPointV1,
} from '../.test-dist/visual/vehicle-visual-transform.js';

const sourceRoot = 'assets/owner-vehicle/source';
const contractRoot = 'assets/owner-vehicle/contracts';
const EXPECTED_CHANGED_BINDINGS = Object.freeze([
  'owner.fl.upper-arm',
  'owner.fl.lower-arm',
  'owner.fl.knuckle.socket-chassismount-b',
  'owner.fl.knuckle.socket-wheelcenter',
  'owner.fl.chassis-bracket.socket-chassismount-a',
  'owner.fl.chassis-bracket.socket-singledamper-mount',
  'owner.fr.upper-arm',
  'owner.fr.lower-arm',
  'owner.fr.knuckle.socket-chassismount-b',
  'owner.fr.knuckle.socket-wheelcenter',
  'owner.fr.chassis-bracket.socket-chassismount-a',
  'owner.fr.chassis-bracket.socket-singledamper-mount',
  'owner.rl.upper-arm',
  'owner.rl.lower-arm',
  'owner.rl.knuckle.socket-wheelcenter',
  'owner.rl.chassis-bracket.socket-chassismount',
  'owner.rr.upper-arm',
  'owner.rr.lower-arm',
  'owner.rr.knuckle.socket-wheelcenter',
  'owner.rr.chassis-bracket.socket-chassismount',
]);
const EXPECTED_CHANGED_SOURCE_BINDINGS = Object.freeze([
  'owner.fl.upper-arm',
  'owner.fl.coilover.upper',
  'owner.fl.coilover.stretch',
  'owner.fl.coilover.lower',
  'owner.fr.coilover.upper',
  'owner.fr.coilover.stretch',
  'owner.fr.coilover.lower',
  'owner.rl.coilover.upper',
  'owner.rl.coilover.stretch',
  'owner.rl.coilover.lower',
  'owner.rr.coilover.upper',
  'owner.rr.coilover.stretch',
  'owner.rr.coilover.lower',

  'owner.fl.cardan.drive-end',
  'owner.fl.cardan.mid',
  'owner.fl.cardan.hub-end',
  'owner.fr.cardan.drive-end',
  'owner.fr.cardan.mid',
  'owner.fr.cardan.hub-end',
  'owner.rl.cardan.drive-end',
  'owner.rl.cardan.mid',
  'owner.rl.cardan.hub-end',
  'owner.rr.cardan.drive-end',
  'owner.rr.cardan.mid',
  'owner.rr.cardan.hub-end',]);

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

test('R3 reference-calibrated package is deterministic and keeps R2 source authority', async () => {
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
    frontChassis: 'R3_AUTHORED_CHASSIS_REFERENCE_PATCH_OVER_EXACT_R2',
    frontDamper: 'VISUAL_AUTHORED_CHASSIS_TO_LOWER_ARM_PART_PAIR',
    rearWishbones: 'R3_GEOMETRY_MATING_AND_CHASSIS_FACE_REFERENCE_PATCH_OVER_EXACT_R2',
    rearKnuckle: 'R3_GEOMETRY_MATING_UPRIGHT_REFERENCE_PATCH_OVER_EXACT_R2',
    rearChassis: 'R3_AUTHORED_CHASSIS_REFERENCE_PATCH_OVER_EXACT_R2',
    rearDamper: 'R3_AUTHORED_TWIN_CHASSIS_TO_LOWER_ARM_PART_PAIRS',
    cardan: 'R3_DIFFERENTIAL_OUTPUT_FACE_TO_AUTHORED_HUB_PART_PAIR',
    wheelMount: 'R3_AUTHORED_SOCKET_WHEELMOUNT_HANDED_VISUAL_INTERFACE',
    otherSubsystems: 'R2_BYTE_LAYOUT_INHERITED',
  });
  assert.equal(a.report.output.realBindingCount, 59);
  assert.deepEqual(a.report.output.diagnosticBindingIds, [
    'diagnostic.rack.coverage',
    'diagnostic.fl.physical-coilover.coverage',
    'diagnostic.fr.physical-coilover.coverage',
    'diagnostic.rl.physical-coilover.coverage',
    'diagnostic.rr.physical-coilover.coverage',
  ]);
  assert.equal(a.report.output.nodeCount, 64);
  assert.equal(a.report.output.bindingCount, 64);
  assert.equal(a.report.output.physicalCoiloverCoverage, 'DIAGNOSTIC_SEGMENT_ENDPOINT_BINDINGS_NOT_RENDERED');
  assert.equal(a.report.frontUpperPilot.corner, 'fl');
  assert.equal(
    a.report.frontUpperPilot.treatment,
    'VISUAL_ONLY_ROLL_PINNED_SPLIT_AXIS_CHASSIS_TO_PHYSICAL_OUTBOARD',
  );
  assert.equal(a.report.frontUpperPilot.physics, 'UNCHANGED');
  assert.deepEqual(a.report.frontUpperPilot.referenceStartLocal, [0, 0, 0]);
  for (let axis = 0; axis < 3; axis += 1) {
    close(
      a.report.frontUpperPilot.referenceEndLocal[axis],
      a.report.frontUpperPilot.outboardLocal[axis],
    );
  }
  assert.ok(
    a.report.frontUpperPilot.chassisLocal.every(Number.isFinite) &&
      a.report.frontUpperPilot.outboardLocal.every(Number.isFinite) &&
      a.report.frontUpperPilot.referenceUpDirection.every(Number.isFinite),
  );
  close(Math.hypot(...a.report.frontUpperPilot.referenceUpDirection), 1);
  assert.ok(a.report.frontUpperPilot.referenceUpDirection[1] > 0);
  assert.equal(a.report.wheelInterface.mountOffsetMeters, 0.13124999999999998);
  assert.deepEqual(a.report.wheelInterface.mountLocalPosition, [0, 0.13124999999999998, 0]);
  assert.equal(
    a.report.wheelInterface.treatment,
    'WHEEL_CENTER_REMAINS_PHYSICAL_SPIN_CENTER_SOCKET_WHEELMOUNT_IS_VISUAL_HUB_INTERFACE',
  );
  assert.equal(a.glb.byteLength, 829944);
  assert.equal(a.report.output.sha256, '57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a');
});

test('R3 blast radius is exactly the accepted front and rear structural geometry bindings', async () => {
  const input = await inputs();
  const r2 = buildOwnerM6FullRigPackageR2(input);
  const r3 = buildOwnerM6FullRigPackageR3(input);
  const d2 = decodeGlb(r2.glb);
  const d3 = decodeGlb(r3.glb);

  const r2Ids = r2.visualPackage.bindings.map((binding) => binding.bindingId);
  const r3Ids = r3.visualPackage.bindings.map((binding) => binding.bindingId);
  assert.deepEqual(r3Ids.slice(0, r2Ids.length), r2Ids);
  assert.deepEqual(r3Ids.slice(r2Ids.length), [
    'owner.rl.coilover-aft.upper',
    'owner.rl.coilover-aft.stretch',
    'owner.rl.coilover-aft.lower',
    'owner.rr.coilover-aft.upper',
    'owner.rr.coilover-aft.stretch',
    'owner.rr.coilover-aft.lower',
    'diagnostic.fl.physical-coilover.coverage',
    'diagnostic.fr.physical-coilover.coverage',
    'diagnostic.rl.physical-coilover.coverage',
    'diagnostic.rr.physical-coilover.coverage',
  ]);
  for (const corner of ['fl', 'fr', 'rl', 'rr']) {
    const binding = r3.visualPackage.bindings.find(
      (candidate) => candidate.bindingId === `diagnostic.${corner}.physical-coilover.coverage`,
    );
    assert.ok(binding, `missing physical coilover diagnostic coverage for ${corner}`);
    assert.equal(binding.source.kind, 'SEGMENT_ENDPOINT_AIM');
    assert.equal(binding.source.segmentId, `m6.${corner}.coilover`);
    assert.equal(binding.source.endpoint, 'START');
    assert.equal(binding.source.axis, '+Y');
    assert.ok(binding.nodeName.startsWith('JV_R3_Diagnostic_'));
  }
  assert.deepEqual(r3.report.sourceAuthority, r2.report.sourceAuthority);
  assert.deepEqual(imageHashes(d3), imageHashes(d2));
  assert.equal(d3.json.nodes.length, d2.json.nodes.length + 10);
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

  const changedSources = [];
  for (const r2Binding of r2.visualPackage.bindings) {
    const r3Binding = r3.visualPackage.bindings.find((candidate) => candidate.bindingId === r2Binding.bindingId);
    assert.ok(r3Binding, `missing R3 binding ${r2Binding.bindingId}`);
    if (JSON.stringify(r2Binding.source) !== JSON.stringify(r3Binding.source)) {
      changedSources.push(r2Binding.bindingId);
    }
  }
  assert.deepEqual([...changedSources].sort(), [...EXPECTED_CHANGED_SOURCE_BINDINGS].sort());

  const changedLocalTransforms = [];
  for (const r2Binding of r2.visualPackage.bindings) {
    const r3Binding = r3.visualPackage.bindings.find((candidate) => candidate.bindingId === r2Binding.bindingId);
    assert.ok(r3Binding, `missing R3 binding ${r2Binding.bindingId}`);
    if (JSON.stringify(r2Binding.localFromSource) !== JSON.stringify(r3Binding.localFromSource)) {
      changedLocalTransforms.push(r2Binding.bindingId);
    }
  }
  assert.deepEqual(changedLocalTransforms, ['owner.fr.wheel', 'owner.rr.wheel']);
  const flUpper = r3.visualPackage.bindings.find(
    (binding) => binding.bindingId === 'owner.fl.upper-arm',
  );
  const frUpper = r3.visualPackage.bindings.find(
    (binding) => binding.bindingId === 'owner.fr.upper-arm',
  );
  assert.ok(flUpper && frUpper);
  assert.equal(flUpper.source.kind, 'PART_PAIR_ROLL_PINNED_STRETCH');
  assert.equal(flUpper.source.partId, 'm6.fl.upper-arm');
  assert.equal(flUpper.source.startPartId, 'm6.chassis');
  assert.equal(flUpper.source.endPartId, 'm6.fl.upper-arm');
  assert.deepEqual(flUpper.source.startLocalPosition, r3.report.frontUpperPilot.chassisLocal);
  assert.deepEqual(flUpper.source.endLocalPosition, r3.report.frontUpperPilot.outboardLocal);
  assert.deepEqual(flUpper.source.referenceStartPosition, r3.report.frontUpperPilot.referenceStartLocal);
  assert.deepEqual(flUpper.source.referenceEndPosition, r3.report.frontUpperPilot.referenceEndLocal);
  assert.deepEqual(flUpper.source.referenceUpDirection, r3.report.frontUpperPilot.referenceUpDirection);
  assert.equal(flUpper.source.rollReferenceAxis, '+Y');
  assert.equal(frUpper.source.kind, 'PART');
  assert.equal(frUpper.source.partId, 'm6.fr.upper-arm');
  for (const corner of ['fl', 'fr', 'rl', 'rr']) {
    const binding = r3.visualPackage.bindings.find((candidate) => candidate.bindingId === `owner.${corner}.wheel`);
    assert.ok(binding, `missing R3 wheel binding ${corner}`);
    assert.deepEqual(binding.localFromSource.position, [0, 0, 0]);
    assert.deepEqual(binding.localFromSource.scale, [1, 1, 1]);
    assert.deepEqual(
      binding.localFromSource.rotation,
      corner === 'fr' || corner === 'rr' ? [1, 0, 0, 0] : [0, 0, 0, 1],
    );
  }
  for (const corner of ['rl', 'rr']) {
    for (const component of ['upper', 'stretch', 'lower']) {
      const binding = r3.visualPackage.bindings.find(
        (candidate) => candidate.bindingId === `owner.${corner}.coilover-aft.${component}`,
      );
      assert.ok(binding, `missing ${corner} aft damper ${component}`);
      assert.equal(binding.source.startPartId, 'm6.chassis');
      assert.equal(binding.source.endPartId, `m6.${corner}.lower-arm`);
      assert.equal(
        binding.source.kind,
        component === 'stretch' ? 'PART_PAIR_STRETCH' : 'PART_PAIR_ENDPOINT_AIM',
      );
    }
  }

  for (const corner of ['fl', 'fr']) {
    const upper = r3.visualPackage.bindings.find((binding) => binding.bindingId === `owner.${corner}.coilover.upper`);
    const stretch = r3.visualPackage.bindings.find((binding) => binding.bindingId === `owner.${corner}.coilover.stretch`);
    const lower = r3.visualPackage.bindings.find((binding) => binding.bindingId === `owner.${corner}.coilover.lower`);
    for (const binding of [upper, stretch, lower]) {
      assert.ok(binding);
      assert.equal(binding.source.startPartId, 'm6.chassis');
      assert.equal(binding.source.endPartId, `m6.${corner}.lower-arm`);
    }
    assert.equal(upper.source.kind, 'PART_PAIR_ENDPOINT_AIM');
    assert.equal(stretch.source.kind, 'PART_PAIR_STRETCH');
    assert.equal(lower.source.kind, 'PART_PAIR_ENDPOINT_AIM');
  }
});

test('S1-B FL upper pilot maps its selected authored chassis and physical outboard endpoints exactly', async () => {
  const result = buildOwnerM6FullRigPackageR3(await inputs());
  const pilot = result.visualPackage.bindings.find(
    (binding) => binding.bindingId === 'owner.fl.upper-arm',
  );
  assert.ok(pilot);
  assert.equal(pilot.source.kind, 'PART_PAIR_ROLL_PINNED_STRETCH');
  const physical = result.report.calibration.corners.fl.physical;
  const resolved = resolveVehicleVisualBindingsV1(
    { bindings: [pilot] },
    {
      contractVersion: 1,
      generation: 1,
      stepIndex: 0,
      parts: [
        {
          partId: 'm6.chassis',
          transform: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
          },
        },
        {
          partId: 'm6.fl.upper-arm',
          transform: {
            position: {
              x: physical.upperHinge[0],
              y: physical.upperHinge[1],
              z: physical.upperHinge[2],
            },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
          },
        },
      ],
      segments: [],
    },
  )[0];
  const start = transformVehicleVisualPointV1(resolved.worldFromNode, {
    x: pilot.source.referenceStartPosition[0],
    y: pilot.source.referenceStartPosition[1],
    z: pilot.source.referenceStartPosition[2],
  });
  const end = transformVehicleVisualPointV1(resolved.worldFromNode, {
    x: pilot.source.referenceEndPosition[0],
    y: pilot.source.referenceEndPosition[1],
    z: pilot.source.referenceEndPosition[2],
  });
  close(start.x, pilot.source.startLocalPosition[0], 1e-6);
  close(start.y, pilot.source.startLocalPosition[1], 1e-6);
  close(start.z, pilot.source.startLocalPosition[2], 1e-6);
  close(end.x, physical.upperBall[0], 1e-6);
  close(end.y, physical.upperBall[1], 1e-6);
  close(end.z, physical.upperBall[2], 1e-6);
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
  for (const corner of ['fl', 'fr']) {
    for (const token of ['socket-chassismount-a', 'socket-singledamper-mount']) {
      const chassis = corners[corner].chassis[token];
      close(chassis.wheelCenterErrorMeters, 0);
      close(chassis.upperHingeErrorMeters, 0, 1e-15);
      close(chassis.lowerHingeErrorMeters, 0, 1e-15);
      assert.equal(chassis.mirrored, corner === 'fr');
    }
    const damper = corners[corner].damperVisual;
    assert.equal(damper.treatment, 'VISUAL_AUTHORED_CHASSIS_TO_LOWER_ARM_PART_PAIR');
    assert.ok(damper.restVisualLengthMeters > damper.physicalSpringLengthMeters + 0.15);
    assert.equal(damper.referenceAuthority.physicalSpring, 'M6_COILOVER_CONSTRAINT_UNCHANGED');
  }
  close(corners.fl.chassis['socket-chassismount-a'].radialScale, corners.fr.chassis['socket-chassismount-a'].radialScale);
  close(corners.fl.chassis['socket-chassismount-a'].verticalScale, corners.fr.chassis['socket-chassismount-a'].verticalScale);
  for (const corner of ['rl', 'rr']) {
    for (const which of ['upper', 'lower']) {
      const arm = corners[corner].arms[which];
      assert.equal(arm.mode, 'GEOMETRY_DERIVED_REAR_REFERENCE_TO_PHYSICAL_HARDPOINT_R3');
      close(arm.hingeErrorMeters, 0);
      close(arm.outboardErrorMeters, 0);
      assert.equal(arm.mirrored, corner === 'rr');
    }
    close(corners[corner].knuckle.wheelCenterErrorMeters, 0);
    close(corners[corner].knuckle.upperBallErrorMeters, 0, 1e-15);
    close(corners[corner].knuckle.lowerBallErrorMeters, 0, 1e-15);
    close(corners[corner].chassis.wheelCenterErrorMeters, 0);
    close(corners[corner].chassis.upperHingeErrorMeters, 0, 1e-15);
    close(corners[corner].chassis.lowerHingeErrorMeters, 0, 1e-15);
  }
  close(corners.rl.arms.upper.axialScale, corners.rr.arms.upper.axialScale);
  close(corners.rl.arms.lower.axialScale, corners.rr.arms.lower.axialScale);
  close(corners.rl.arms.upper.spreadScale, corners.rr.arms.upper.spreadScale);
  close(corners.rl.arms.lower.spreadScale, corners.rr.arms.lower.spreadScale);
  close(corners.rl.knuckle.radialScale, corners.rr.knuckle.radialScale);
  close(corners.rl.knuckle.kingpinScale, corners.rr.knuckle.kingpinScale);
  close(corners.rl.chassis.radialScale, corners.rr.chassis.radialScale);
  close(corners.rl.chassis.verticalScale, corners.rr.chassis.verticalScale);
});

test('R3 active consumers share one final artifact and root-count contract', async () => {
  const [runtimeMotion, portable, publicPreview, ownerLayer] = await Promise.all([
    readFile('tests/owner-vehicle-full-rig-runtime-motion.test.mjs', 'utf8'),
    readFile('tools/validate-portable-vehicle-visual.mjs', 'utf8'),
    readFile('tools/validate-public-r1-preview.mjs', 'utf8'),
    readFile('src/render/m6-owner-vehicle-layer.ts', 'utf8'),
  ]);
  const sha = '57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a';
  assert.match(runtimeMotion, new RegExp(sha));
  assert.match(runtimeMotion, /plan\.length, 59/);
  assert.match(portable, new RegExp(sha));
  assert.match(portable, /EXPECTED_OWNER_BYTES = 829944/);
  assert.match(portable, /boundNodeCount !== 64/);
  assert.match(portable, /boundRootCount !== 64/);
  assert.match(portable, /budget\.nodes !== 64/);
  assert.match(publicPreview, new RegExp(sha));
  assert.match(publicPreview, /byteLength !== 829944/);
  assert.match(publicPreview, /length !== 59/);
  assert.match(ownerLayer, /M6_OWNER_R3_REAL_NODE_COUNT = 59 as const/);
});
