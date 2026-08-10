import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildOwnerM6FullRigPackageR3 } from '../tools/owner-vehicle/owner-m6-full-rig-package-r3.mjs';
import { buildOwnerM6InterfaceAudit } from '../tools/owner-vehicle/owner-m6-interface-audit.mjs';

const sourceRoot = 'assets/owner-vehicle/source';
const contractRoot = 'assets/owner-vehicle/contracts';

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

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function barycentricPoint(points, barycentric) {
  return [0, 1, 2].map((axis) =>
    points[0][axis] * barycentric[0] +
    points[1][axis] * barycentric[1] +
    points[2][axis] * barycentric[2],
  );
}

test('S1-C FL upper start is geometry-derived from authored suspension intent onto semantic main chassis group5', async () => {
  const result = buildOwnerM6FullRigPackageR3(await inputs());
  const pilot = result.report.frontUpperPilot;
  const mate = pilot.chassisMate;

  assert.equal(pilot.corner, 'fl');
  assert.equal(
    mate.selectionRule,
    'AUTHORED_SUSPENSION_ATTACHMENT_INTENT_NEAREST_ON_SEMANTIC_MAIN_CHASSIS_PIECE',
  );
  assert.equal(mate.semanticPiece, 'group5');
  assert.deepEqual(mate.authoredIntentLocal, pilot.authoredChassisIntentLocal);
  assert.deepEqual(mate.chassisLocal, pilot.chassisLocal);
  assert.equal(mate.selected.provenance.sourceAsset, 'Nadwozie.gltf');
  assert.equal(mate.selected.provenance.pieceName, 'group5');
  assert.equal(mate.selected.provenance.jointSlot, 3);
  assert.equal(mate.selected.provenance.jointNodeIndex, 2);
  assert.equal(mate.selected.provenance.primitiveIndex, 0);
  assert.equal(mate.selected.provenance.triangleIndex, 26);
  assert.equal(mate.selected.provenance.closestRegion, 'B');

  const fromTriangle = barycentricPoint(
    mate.selected.provenance.trianglePointsChassisLocal,
    mate.selected.provenance.barycentric,
  );
  for (let axis = 0; axis < 3; axis += 1) close(fromTriangle[axis], pilot.chassisLocal[axis]);
  close(
    distance(pilot.authoredChassisIntentLocal, pilot.chassisLocal),
    mate.selected.distanceMeters,
  );
});

test('S1-C semantic selection rejects unrestricted differential hit and does not use physical hinge as visual query authority', async () => {
  const input = await inputs();
  const result = buildOwnerM6FullRigPackageR3(input);
  const mate = result.report.frontUpperPilot.chassisMate;
  const audit = buildOwnerM6InterfaceAudit(input);

  assert.equal(
    audit.corners.fl.interfaces.upperHinge.authoredToChassisSurface.piece,
    'Diferential_F',
  );
  assert.equal(mate.unrestrictedDiagnostic.result.provenance.pieceName, 'Diferential_F');
  assert.equal(
    mate.unrestrictedDiagnostic.authority,
    'DIAGNOSTIC_ONLY_NOT_SELECTION_AUTHORITY',
  );
  assert.equal(mate.selected.provenance.pieceName, 'group5');
  assert.notDeepEqual(mate.unrestrictedDiagnostic.result.point, mate.chassisLocal);

  assert.equal(mate.physicalHingeComparison.result.provenance.pieceName, 'group5');
  assert.equal(mate.physicalHingeComparison.result.provenance.triangleIndex, 254);
  assert.equal(
    mate.physicalHingeComparison.authority,
    'DIAGNOSTIC_ONLY_NOT_SELECTION_INPUT',
  );
  assert.notDeepEqual(mate.physicalHingeComparison.result.point, mate.chassisLocal);
});

test('S1-C changes only FL upper chassis-side visual point while protected outboard and FR baseline remain intact', async () => {
  const result = buildOwnerM6FullRigPackageR3(await inputs());
  const flUpper = result.visualPackage.bindings.find(
    (binding) => binding.bindingId === 'owner.fl.upper-arm',
  );
  const frUpper = result.visualPackage.bindings.find(
    (binding) => binding.bindingId === 'owner.fr.upper-arm',
  );
  assert.ok(flUpper && frUpper);
  assert.equal(flUpper.source.kind, 'PART_PAIR_ROLL_PINNED_STRETCH');
  assert.deepEqual(flUpper.source.startLocalPosition, result.report.frontUpperPilot.chassisLocal);
  assert.deepEqual(flUpper.source.endLocalPosition, result.report.frontUpperPilot.outboardLocal);
  assert.deepEqual(
    flUpper.source.endLocalPosition,
    result.report.calibration.corners.fl.arms.upper.targetBallLocal,
  );
  assert.equal(frUpper.source.kind, 'PART');
  assert.equal(frUpper.source.partId, 'm6.fr.upper-arm');
  assert.equal(result.glb.byteLength, 829944);
  assert.equal(
    result.report.output.sha256,
    '57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a',
  );
});
