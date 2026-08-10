import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { inspectBlockbenchRigidPartsV1 } from '../tools/owner-vehicle/blockbench-gltf-rigid-parts.mjs';
import {
  parseM6FactoryConfig,
  cornerRestGeometry,
} from '../tools/owner-vehicle/owner-m6-full-rig-calibration-r2.mjs';
import { buildOwnerM6FullRigPackageR2 } from '../tools/owner-vehicle/owner-m6-full-rig-package-r2.mjs';
import { buildOwnerM6FullRigPackageR3 } from '../tools/owner-vehicle/owner-m6-full-rig-package-r3.mjs';
import { deriveFrontSuspensionReferencesR3 } from '../tools/owner-vehicle/owner-m6-reference-calibration-r3.mjs';
import { deriveRearSuspensionReferencesR3 } from '../tools/owner-vehicle/owner-m6-rear-reference-calibration-r3.mjs';
import { calibrateCardanEndpointsR3 } from '../tools/owner-vehicle/owner-m6-cardan-reference-calibration-r3.mjs';

const SOURCE='assets/owner-vehicle/source';
const CONTRACT='assets/owner-vehicle/contracts';
const RECEIPT='public/receipts/jv_m6_factory_receipt.json';

async function inputs(){
  const read=(n)=>readFile(`${SOURCE}/${n}`,'utf8');
  const contract=(n)=>readFile(`${CONTRACT}/${n}`,'utf8');
  return {
    chassisText:await read('Nadwozie.gltf'),
    wheelText:await read('Offroad_Big_Wheels.gltf'),
    frontSuspensionText:await read('OneSided_Steering_Suspension_Rig.gltf'),
    rearSuspensionText:await read('One_Sided_wheel_mount.gltf'),
    damperText:await read('Asset_Dumper.gltf'),
    cardanText:await read('Cardan_shaft.gltf'),
    factoryReceiptText:await readFile(RECEIPT,'utf8'),
    contractTexts:{
      wheel:await contract('offroad_big_wheel.asset.json'),
      frontSuspension:await contract('one_sided_steering_suspension.asset.json'),
      rearSuspension:await contract('one_sided_wheel_mount.asset.json'),
      damper:await contract('asset_dumper.asset.json'),
      cardan:await contract('cardan_shaft.asset.json'),
    },
  };
}
function decodeGlb(glb){
  const v=new DataView(glb.buffer,glb.byteOffset,glb.byteLength);
  const jl=v.getUint32(12,true);
  return {json:JSON.parse(new TextDecoder().decode(glb.slice(20,20+jl)).trim()),bin:glb.slice(20+jl+8)};
}
function accessorBytes(d,index){const a=d.json.accessors[index],bv=d.json.bufferViews[a.bufferView],o=bv.byteOffset??0;return d.bin.slice(o,o+bv.byteLength);}
function bindingGeometryHash(d,pkg,id){
  const b=pkg.bindings.find(x=>x.bindingId===id); assert.ok(b);
  const n=d.json.nodes.find(x=>x.name===b.nodeName); assert.ok(n&&n.mesh!==undefined);
  const h=createHash('sha256');
  for(const pr of d.json.meshes[n.mesh].primitives){
    h.update(accessorBytes(d,pr.attributes.POSITION));
    if(pr.attributes.NORMAL!==undefined)h.update(accessorBytes(d,pr.attributes.NORMAL));
    h.update(accessorBytes(d,pr.indices));
  }
  return h.digest('hex');
}
function closePoint(a,b,t=1e-12){assert.equal(a.length,b.length);for(let i=0;i<a.length;i++)assert.ok(Math.abs(a[i]-b[i])<=t,`${a[i]} != ${b[i]}`);}

test('R3 package cardans use exact differential-face to authored-hub endpoints without changing cardan geometry',async()=>{
  const i=await inputs();
  const r2=buildOwnerM6FullRigPackageR2(i);
  const r3=buildOwnerM6FullRigPackageR3(i);
  const d2=decodeGlb(r2.glb),d3=decodeGlb(r3.glb);
  const chassis=inspectBlockbenchRigidPartsV1(i.chassisText,'Nadwozie.gltf');
  const front=inspectBlockbenchRigidPartsV1(i.frontSuspensionText,'OneSided_Steering_Suspension_Rig.gltf');
  const rear=inspectBlockbenchRigidPartsV1(i.rearSuspensionText,'One_Sided_wheel_mount.gltf');
  const fr=deriveFrontSuspensionReferencesR3(front),rr=deriveRearSuspensionReferencesR3(rear);
  const config=parseM6FactoryConfig(i.factoryReceiptText);

  for(const corner of ['fl','fr','rl','rr']){
    const isFront=corner.startsWith('f');
    const expected=calibrateCardanEndpointsR3({
      chassis,
      suspension:isFront?front:rear,
      references:isFront?fr:rr,
      geometry:cornerRestGeometry(config,corner),
      corner,
    });
    for(const suffix of ['drive-end','mid','hub-end']){
      const id=`owner.${corner}.cardan.${suffix}`;
      const b=r3.visualPackage.bindings.find(x=>x.bindingId===id); assert.ok(b,id);
      assert.equal(b.source.startPartId,'m6.chassis');
      assert.equal(b.source.endPartId,`m6.${corner}.knuckle`);
      closePoint(b.source.startLocalPosition,expected.startLocalPosition);
      closePoint(b.source.endLocalPosition,expected.endLocalPosition);
      assert.equal(bindingGeometryHash(d3,r3.visualPackage,id),bindingGeometryHash(d2,r2.visualPackage,id),`${id} geometry must remain R2-identical`);
    }
    assert.equal(r3.report.cardanCalibration[corner].historicalDriveAuthority,'REJECTED_AS_FINAL_ENDPOINT_BY_DIFFERENTIAL_GEOMETRY');
    assert.ok(r3.report.cardanCalibration[corner].historicalDriveMismatchMeters>0.26);
  }
});
