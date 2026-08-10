import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildOwnerM6InterfaceAudit, OWNER_M6_INTERFACE_AUDIT_SCHEMA } from '../tools/owner-vehicle/owner-m6-interface-audit.mjs';

const SOURCE='assets/owner-vehicle/source';
const CONTRACT='assets/owner-vehicle/contracts';
async function inputs(){
  const read=(name)=>readFile(`${SOURCE}/${name}`,'utf8');
  const contract=(name)=>readFile(`${CONTRACT}/${name}`,'utf8');
  return {
    chassisText:await read('Nadwozie.gltf'),wheelText:await read('Offroad_Big_Wheels.gltf'),
    frontSuspensionText:await read('OneSided_Steering_Suspension_Rig.gltf'),rearSuspensionText:await read('One_Sided_wheel_mount.gltf'),
    damperText:await read('Asset_Dumper.gltf'),cardanText:await read('Cardan_shaft.gltf'),
    factoryReceiptText:await readFile('public/receipts/jv_m6_factory_receipt.json','utf8'),
    contractTexts:{wheel:await contract('offroad_big_wheel.asset.json'),frontSuspension:await contract('one_sided_steering_suspension.asset.json'),rearSuspension:await contract('one_sided_wheel_mount.asset.json'),damper:await contract('asset_dumper.asset.json'),cardan:await contract('cardan_shaft.asset.json')},
  };
}
function close(a,b,label){assert.ok(Math.abs(a-b)<1e-9,`${label}: ${a} != ${b}`);}

test('owner interface audit is deterministic measurement, not a visual acceptance gate',async()=>{
  const audit=buildOwnerM6InterfaceAudit(await inputs());
  assert.equal(audit.schema,OWNER_M6_INTERFACE_AUDIT_SCHEMA);
  assert.equal(audit.classification,'MEASUREMENT_ONLY_NOT_ACCEPTANCE');
  assert.deepEqual(audit.artifact,{
    id:'m6-owner-full-rig-r3',byteLength:829944,
    sha256:'57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a',realBindingCount:59,
  });
  assert.deepEqual(Object.keys(audit.corners),['fl','fr','rl','rr']);
  assert.equal(audit.bindingGroups.other.length,0);
  assert.equal(Object.values(audit.bindingGroups).flat().length,59);
  for(const [corner,value] of Object.entries(audit.corners)){
    for(const name of ['upperHinge','lowerHinge','damperUpper']){
      const m=value.interfaces[name];
      for(const number of [m.authoredToCurrentMeters,m.authoredToChassisSurface.meters,m.currentToChassisSurface.meters]){
        assert.equal(Number.isFinite(number),true,`${corner}.${name} measurement must be finite`);
        assert.ok(number>=0,`${corner}.${name} measurement must be non-negative`);
      }
    }
  }
  close(audit.corners.fl.interfaces.upperHinge.currentToChassisSurface.meters,audit.corners.fr.interfaces.upperHinge.currentToChassisSurface.meters,'front upper surface mirror');
  close(audit.corners.rl.interfaces.upperHinge.currentToChassisSurface.meters,audit.corners.rr.interfaces.upperHinge.currentToChassisSurface.meters,'rear upper surface mirror');
  close(audit.corners.fl.interfaces.damperUpper.currentToChassisSurface.meters,audit.corners.fr.interfaces.damperUpper.currentToChassisSurface.meters,'front damper surface mirror');
});
