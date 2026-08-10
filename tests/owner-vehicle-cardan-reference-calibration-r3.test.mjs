import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inspectBlockbenchRigidPartsV1 } from '../tools/owner-vehicle/blockbench-gltf-rigid-parts.mjs';
import {
  parseM6FactoryConfig,
  cornerRestGeometry,
} from '../tools/owner-vehicle/owner-m6-full-rig-calibration-r2.mjs';
import { deriveFrontSuspensionReferencesR3 } from '../tools/owner-vehicle/owner-m6-reference-calibration-r3.mjs';
import { deriveRearSuspensionReferencesR3 } from '../tools/owner-vehicle/owner-m6-rear-reference-calibration-r3.mjs';
import {
  deriveChassisDifferentialOutputsR3,
  calibrateCardanEndpointsR3,
} from '../tools/owner-vehicle/owner-m6-cardan-reference-calibration-r3.mjs';

const SOURCE='assets/owner-vehicle/source';
const RECEIPT='public/receipts/jv_m6_factory_receipt.json';
function close(actual,expected,tolerance=1e-9){assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);}

async function fixture(){
  const [chassisText,frontText,rearText,receiptText]=await Promise.all([
    readFile(`${SOURCE}/Nadwozie.gltf`,'utf8'),
    readFile(`${SOURCE}/OneSided_Steering_Suspension_Rig.gltf`,'utf8'),
    readFile(`${SOURCE}/One_Sided_wheel_mount.gltf`,'utf8'),
    readFile(RECEIPT,'utf8'),
  ]);
  const chassis=inspectBlockbenchRigidPartsV1(chassisText,'Nadwozie.gltf');
  const front=inspectBlockbenchRigidPartsV1(frontText,'OneSided_Steering_Suspension_Rig.gltf');
  const rear=inspectBlockbenchRigidPartsV1(rearText,'One_Sided_wheel_mount.gltf');
  return {
    chassis,front,rear,
    frontReferences:deriveFrontSuspensionReferencesR3(front),
    rearReferences:deriveRearSuspensionReferencesR3(rear),
    config:parseM6FactoryConfig(receiptText),
  };
}

test('R3 derives symmetric front/rear differential output faces from actual chassis geometry',async()=>{
  const {chassis}=await fixture();
  const outputs=deriveChassisDifferentialOutputsR3(chassis);
  for(const axle of ['front','rear']){
    assert.equal(outputs[axle].left.sourceFace.vertexCount,24);
    assert.equal(outputs[axle].right.sourceFace.vertexCount,24);
    close(outputs[axle].left.sourceFace.projection,-0.7096095085144043,1e-12);
    close(outputs[axle].right.sourceFace.projection,0.7096095532178879,1e-12);
    close(outputs[axle].left.chassisLocal[1],-0.569921875,1e-12);
    close(outputs[axle].right.chassisLocal[1],-0.569921875,1e-12);
    close(outputs[axle].left.chassisLocal[2],-0.248363327980041,1e-9);
    close(outputs[axle].right.chassisLocal[2],0.248363343626261,1e-9);
    close(outputs[axle].widthMeters,0.496726671606302,1e-9);
    close(outputs[axle].centerChassisLocal[2],0,1e-8);
    assert.equal(outputs[axle].authority,'GEOMETRY_DERIVED_DIFFERENTIAL_OUTPUT_FACE');
  }
  close(outputs.front.centerChassisLocal[0],1.222265625,1e-12);
  close(outputs.rear.centerChassisLocal[0],-1.227734375,1e-12);
});

test('R3 cardan endpoints use differential output faces and authored hub markers, rejecting old drive sockets',async()=>{
  const f=await fixture();
  const reports={};
  for(const corner of ['fl','fr','rl','rr']){
    const front=corner.startsWith('f');
    const result=calibrateCardanEndpointsR3({
      chassis:f.chassis,
      suspension:front?f.front:f.rear,
      references:front?f.frontReferences:f.rearReferences,
      geometry:cornerRestGeometry(f.config,corner),
      corner,
    });
    reports[corner]=result.report;
    assert.equal(result.startPartId,'m6.chassis');
    assert.equal(result.endPartId,`m6.${corner}.knuckle`);
    assert.equal(result.report.differentialOutputFaceVertexCount,24);
    assert.equal(result.report.hubAuthority,'AUTHORED_NODE:Socket_CardanHub');
    assert.equal(result.report.historicalDriveAuthority,'REJECTED_AS_FINAL_ENDPOINT_BY_DIFFERENTIAL_GEOMETRY');
    assert.equal(result.report.physicsAuthority,'VISUAL_ONLY_NO_TORQUE_TRANSFER');
    assert.ok(result.report.historicalDriveMismatchMeters>0.26);
    assert.ok(result.report.restLengthMeters>0.7&&result.report.restLengthMeters<0.8);
  }
  // The two sides traverse mirrored float32-authored geometry. Nanometre-scale
  // differences are serialization noise, not a mechanical asymmetry.
  close(reports.fl.historicalDriveMismatchMeters,reports.fr.historicalDriveMismatchMeters,1e-7);
  close(reports.rl.historicalDriveMismatchMeters,reports.rr.historicalDriveMismatchMeters,1e-7);
  close(reports.fl.restLengthMeters,reports.fr.restLengthMeters,1e-7);
  close(reports.rl.restLengthMeters,reports.rr.restLengthMeters,1e-7);
  close(reports.fl.hubInboardFromWheelCenterMeters,0.043076923076923,1e-12);
  close(reports.fr.hubInboardFromWheelCenterMeters,0.043076923076923,1e-12);
  close(reports.rl.hubInboardFromWheelCenterMeters,0.086153846153846,1e-12);
  close(reports.rr.hubInboardFromWheelCenterMeters,0.086153846153846,1e-12);
  assert.ok(reports.fl.restLengthMeters > 0.75 && reports.fl.restLengthMeters < 0.77);
  assert.ok(reports.rl.restLengthMeters > 0.70 && reports.rl.restLengthMeters < 0.73);
  assert.ok(reports.fl.restLengthMeters > reports.rl.restLengthMeters + 0.04);
});
