import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildOwnerM6FullRigPackageR3 } from '../tools/owner-vehicle/owner-m6-full-rig-package-r3.mjs';
import { parseM6FactoryConfig, cornerRestGeometry } from '../tools/owner-vehicle/owner-m6-full-rig-calibration-r2.mjs';

const SOURCE='assets/owner-vehicle/source';
const CONTRACT='assets/owner-vehicle/contracts';
async function inputs(){
  const read=n=>readFile(`${SOURCE}/${n}`,'utf8');
  const contract=n=>readFile(`${CONTRACT}/${n}`,'utf8');
  return {
    chassisText:await read('Nadwozie.gltf'),wheelText:await read('Offroad_Big_Wheels.gltf'),
    frontSuspensionText:await read('OneSided_Steering_Suspension_Rig.gltf'),rearSuspensionText:await read('One_Sided_wheel_mount.gltf'),
    damperText:await read('Asset_Dumper.gltf'),cardanText:await read('Cardan_shaft.gltf'),
    factoryReceiptText:await readFile('public/receipts/jv_m6_factory_receipt.json','utf8'),
    contractTexts:{wheel:await contract('offroad_big_wheel.asset.json'),frontSuspension:await contract('one_sided_steering_suspension.asset.json'),rearSuspension:await contract('one_sided_wheel_mount.asset.json'),damper:await contract('asset_dumper.asset.json'),cardan:await contract('cardan_shaft.asset.json')},
  };
}
function decodeGlb(glb){const dv=new DataView(glb.buffer,glb.byteOffset,glb.byteLength),jl=dv.getUint32(12,true);return {json:JSON.parse(new TextDecoder().decode(glb.slice(20,20+jl)).trim()),bin:glb.slice(20+jl+8)};}
function positions(d,index){const a=d.json.accessors[index],bv=d.json.bufferViews[a.bufferView],off=bv.byteOffset??0,v=new DataView(d.bin.buffer,d.bin.byteOffset+off,bv.byteLength),out=[];for(let i=0;i<a.count;i++)out.push([v.getFloat32(i*12,true),v.getFloat32(i*12+4,true),v.getFloat32(i*12+8,true)]);return out;}
function origin(partId,geos){if(partId==='m6.chassis')return [0,0,0];const m=partId.match(/^m6\.(fl|fr|rl|rr)\.(wheel|knuckle|upper-arm|lower-arm)$/);if(!m)return null;const g=geos[m[1]];if(m[2]==='wheel'||m[2]==='knuckle')return g.wheelCenter;if(m[2]==='upper-arm')return g.upperHinge;return g.lowerHinge;}
function worldPoints(binding,d,geos){const partId=binding.source.kind==='PART'?binding.source.partId:binding.source.kind==='PART_PAIR_ROLL_PINNED_STRETCH'?binding.source.partId:null;if(!partId)return null;const o=origin(partId,geos);if(!o)return null;const node=d.json.nodes.find(n=>n.name===binding.nodeName);if(!node||node.mesh===undefined)return null;const out=[];for(const pr of d.json.meshes[node.mesh].primitives)for(const p of positions(d,pr.attributes.POSITION))out.push([p[0]+o[0],p[1]+o[1],p[2]+o[2]]);return out;}
function bounds(pts){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const p of pts)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],p[i]);hi[i]=Math.max(hi[i],p[i]);}return {lo,hi,center:hi.map((x,i)=>(x+lo[i])*0.5)};}
const key=p=>p.map(x=>Math.round(x*1e6)/1e6).join(',');
function assertMirrored(left,right,label){const l=new Set(left.map(p=>key([p[0],p[1],-p[2]]))),r=new Set(right.map(key));assert.equal(l.size,r.size,`${label} unique vertex count`);for(const p of l)assert.ok(r.has(p),`${label} missing mirrored vertex ${p}`);}

test('R3 calibrated structural geometry stays corner-local and exactly mirrors left/right',async()=>{
  const i=await inputs(),r=buildOwnerM6FullRigPackageR3(i),d=decodeGlb(r.glb),cfg=parseM6FactoryConfig(i.factoryReceiptText);
  const geos=Object.fromEntries(['fl','fr','rl','rr'].map(c=>[c,cornerRestGeometry(cfg,c)]));
  const entries=new Map();
  for(const binding of r.visualPackage.bindings){const pts=worldPoints(binding,d,geos);if(pts)entries.set(binding.bindingId,{pts,bounds:bounds(pts)});}
  assert.ok(entries.size>=25,'expected full structural PART coverage');
  // Wheel meshes are intentionally excluded: wheel visual calibration is covered
  // by its dedicated marker/radius/width tests, while the runtime wheel body has
  // a separate rest/spin orientation. This gate audits the suspension geometry
  // baked into PART-local coordinates, where exact L/R mirroring is meaningful.
  const pairs=[
    ['owner.fl.upper-arm','owner.fr.upper-arm'],['owner.fl.lower-arm','owner.fr.lower-arm'],
    ['owner.fl.knuckle.socket-chassismount-b','owner.fr.knuckle.socket-chassismount-b'],['owner.fl.knuckle.socket-wheelcenter','owner.fr.knuckle.socket-wheelcenter'],
    ['owner.fl.chassis-bracket.socket-chassismount-a','owner.fr.chassis-bracket.socket-chassismount-a'],['owner.fl.chassis-bracket.socket-singledamper-mount','owner.fr.chassis-bracket.socket-singledamper-mount'],
    ['owner.rl.upper-arm','owner.rr.upper-arm'],['owner.rl.lower-arm','owner.rr.lower-arm'],
    ['owner.rl.knuckle.socket-wheelcenter','owner.rr.knuckle.socket-wheelcenter'],['owner.rl.chassis-bracket.socket-chassismount','owner.rr.chassis-bracket.socket-chassismount'],
  ];
  for(const [l,rid] of pairs){assert.ok(entries.has(l)&&entries.has(rid),`${l}/${rid}`);assertMirrored(entries.get(l).pts,entries.get(rid).pts,`${l}<->${rid}`);}
  for(const [id,e] of entries){const corner=id.match(/^owner\.(fl|fr|rl|rr)\./)?.[1];if(!corner||id.endsWith('.wheel'))continue;const wc=geos[corner].wheelCenter,c=e.bounds.center,dist=Math.hypot(c[0]-wc[0],c[1]-wc[1],c[2]-wc[2]);assert.ok(dist<1.25,`${id} escaped corner envelope: ${dist}`);}
});
