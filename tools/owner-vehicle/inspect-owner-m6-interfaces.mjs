import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildOwnerM6InterfaceAudit } from './owner-m6-interface-audit.mjs';

function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null;}
const sourceRoot=arg('--source-root');
const contractRoot=arg('--contract-root');
const receiptPath=arg('--factory-receipt');
const jsonPath=arg('--json');
if(!sourceRoot||!contractRoot||!receiptPath){
  throw new Error('Usage: inspect-owner-m6-interfaces.mjs --source-root <assets/source> --contract-root <assets/contracts> --factory-receipt <receipt.json> [--json <output.json>]');
}
const readSource=(name)=>readFile(join(sourceRoot,name),'utf8');
const readContract=(name)=>readFile(join(contractRoot,name),'utf8');
const input={
  chassisText:await readSource('Nadwozie.gltf'),
  wheelText:await readSource('Offroad_Big_Wheels.gltf'),
  frontSuspensionText:await readSource('OneSided_Steering_Suspension_Rig.gltf'),
  rearSuspensionText:await readSource('One_Sided_wheel_mount.gltf'),
  damperText:await readSource('Asset_Dumper.gltf'),
  cardanText:await readSource('Cardan_shaft.gltf'),
  factoryReceiptText:await readFile(receiptPath,'utf8'),
  contractTexts:{
    wheel:await readContract('offroad_big_wheel.asset.json'),
    frontSuspension:await readContract('one_sided_steering_suspension.asset.json'),
    rearSuspension:await readContract('one_sided_wheel_mount.asset.json'),
    damper:await readContract('asset_dumper.asset.json'),
    cardan:await readContract('cardan_shaft.asset.json'),
  },
};
const audit=buildOwnerM6InterfaceAudit(input);
console.log(`Owner M6 interface audit · ${audit.classification}`);
console.log(`Artifact ${audit.artifact.id} · ${audit.artifact.byteLength} bytes · ${audit.artifact.realBindingCount} real bindings · ${audit.artifact.sha256}`);
for(const corner of ['fl','fr','rl','rr']){
  const c=audit.corners[corner];
  console.log(`\n${corner.toUpperCase()} ${c.sourceRig}`);
  for(const name of ['upperHinge','lowerHinge','damperUpper']){
    const m=c.interfaces[name];
    console.log(
      `${name.padEnd(12)} authored->chassis=${m.authoredToChassisSurface.meters.toFixed(4)}m (${m.authoredToChassisSurface.piece}) `+
      `current->chassis=${m.currentToChassisSurface.meters.toFixed(4)}m (${m.currentToChassisSurface.piece}) `+
      `authored->current=${m.authoredToCurrentMeters.toFixed(4)}m`,
    );
  }
  console.log(`wheel center authored->physical=${c.deltas.authoredWheelCenterToPhysicalCenterMeters.toFixed(4)}m`);
  if(c.deltas.authoredSteeringRodToPhysicalArmMeters!==null){
    console.log(`steering socket authored->physical arm=${c.deltas.authoredSteeringRodToPhysicalArmMeters.toFixed(4)}m`);
  }
  console.log(`cardan authored drive->current start=${c.deltas.authoredCardanDriveToCurrentStartMeters.toFixed(4)}m`);
  console.log(`cardan authored hub->current end=${c.deltas.authoredCardanHubToCurrentEndMeters.toFixed(4)}m`);
}
if(jsonPath){await writeFile(jsonPath,`${JSON.stringify(audit,null,2)}\n`,'utf8');console.log(`\nJSON: ${jsonPath}`);}
