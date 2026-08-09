#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { buildOwnerM6FullRigPackageR3 } from './owner-m6-full-rig-package-r3.mjs';

function parseArgs(argv){const out={};for(let i=0;i<argv.length;i+=2){const k=argv[i],v=argv[i+1];if(!k?.startsWith('--')||v===undefined)throw new Error(`Invalid argument near ${k??'<end>'}`);out[k.slice(2)]=v;}return out;}
const args=parseArgs(process.argv.slice(2));
if(!args['source-root']||!args['contract-root']||!args['factory-receipt']||!args['output-root']){
  throw new Error('Usage: write-owner-m6-full-rig-r3.mjs --source-root <assets/source> --contract-root <assets/contracts> --factory-receipt <receipt.json> --output-root <output>');
}
const sourceRoot=resolve(args['source-root']),contractRoot=resolve(args['contract-root']),outputRoot=resolve(args['output-root']);
const read=(name)=>readFile(join(sourceRoot,name),'utf8');
const readContract=(name)=>readFile(join(contractRoot,name),'utf8');
const result=buildOwnerM6FullRigPackageR3({
  chassisText:await read('Nadwozie.gltf'),
  wheelText:await read('Offroad_Big_Wheels.gltf'),
  frontSuspensionText:await read('OneSided_Steering_Suspension_Rig.gltf'),
  rearSuspensionText:await read('One_Sided_wheel_mount.gltf'),
  damperText:await read('Asset_Dumper.gltf'),
  cardanText:await read('Cardan_shaft.gltf'),
  factoryReceiptText:await readFile(resolve(args['factory-receipt']),'utf8'),
  contractTexts:{
    wheel:await readContract('offroad_big_wheel.asset.json'),
    frontSuspension:await readContract('one_sided_steering_suspension.asset.json'),
    rearSuspension:await readContract('one_sided_wheel_mount.asset.json'),
    damper:await readContract('asset_dumper.asset.json'),
    cardan:await readContract('cardan_shaft.asset.json'),
  },
});
const modelDirectory=join(outputRoot,'models');
await mkdir(modelDirectory,{recursive:true});
await Promise.all([
  writeFile(join(modelDirectory,'m6-owner-full-rig-r3.glb'),result.glb),
  writeFile(join(outputRoot,'m6-owner-full-rig-r3.visual.json'),result.manifestText,'utf8'),
  writeFile(join(outputRoot,'m6-owner-full-rig-r3.report.json'),`${JSON.stringify(result.report,null,2)}\n`,'utf8'),
]);
console.log(`Owner M6 full rig R3 written: ${result.glb.length} bytes · ${result.report.output.sha256} · ${result.report.output.realBindingCount} real bindings.`);
