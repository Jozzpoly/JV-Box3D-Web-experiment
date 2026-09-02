import { readFile } from 'node:fs/promises';

const path=new URL('../assets/owner-vehicle/source/Offroad_Big_Wheels.gltf',import.meta.url);
const gltf=JSON.parse(await readFile(path,'utf8'));
const uri=gltf.buffers?.[0]?.uri;
if(typeof uri!=='string'||!uri.startsWith('data:application/octet-stream;base64,'))throw new Error('expected embedded glTF buffer');
const bytes=Buffer.from(uri.slice(uri.indexOf(',')+1),'base64');
const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);

function componentInfo(type){
  if(type===5120)return{bytes:1,read:o=>dv.getInt8(o)};
  if(type===5121)return{bytes:1,read:o=>dv.getUint8(o)};
  if(type===5122)return{bytes:2,read:o=>dv.getInt16(o,true)};
  if(type===5123)return{bytes:2,read:o=>dv.getUint16(o,true)};
  if(type===5125)return{bytes:4,read:o=>dv.getUint32(o,true)};
  if(type===5126)return{bytes:4,read:o=>dv.getFloat32(o,true)};
  throw new Error(`unsupported component ${type}`);
}
const components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
function accessor(index){
  const a=gltf.accessors[index];
  const bv=gltf.bufferViews[a.bufferView];
  const info=componentInfo(a.componentType);
  const n=components[a.type];
  if(!n)throw new Error(`unsupported accessor type ${a.type}`);
  const stride=bv.byteStride??info.bytes*n;
  const start=(bv.byteOffset??0)+(a.byteOffset??0);
  const out=[];
  for(let row=0;row<a.count;row++){
    const values=[];
    for(let c=0;c<n;c++)values.push(info.read(start+row*stride+c*info.bytes));
    out.push(n===1?values[0]:values);
  }
  return out;
}

const tireNodeIndex=gltf.nodes.findIndex(n=>n.name==='Tire');
if(tireNodeIndex<0)throw new Error('Tire node missing');
const meshNode=gltf.nodes.find(n=>n.mesh!==undefined&&n.skin!==undefined);
if(!meshNode)throw new Error('skinned mesh node missing');
const skin=gltf.skins[meshNode.skin];
const tireJointPaletteIndex=skin.joints.indexOf(tireNodeIndex);
if(tireJointPaletteIndex<0)throw new Error('Tire node not present in skin joints');

const vertices=[];
const triangles=[];
for(const primitive of gltf.meshes[meshNode.mesh].primitives){
  const positions=accessor(primitive.attributes.POSITION);
  const joints=accessor(primitive.attributes.JOINTS_0);
  const weights=accessor(primitive.attributes.WEIGHTS_0);
  const indices=primitive.indices===undefined?positions.map((_,i)=>i):accessor(primitive.indices);
  const isTire=positions.map((_,i)=>{
    let best=0;
    for(let j=1;j<4;j++)if(weights[i][j]>weights[i][best])best=j;
    return joints[i][best]===tireJointPaletteIndex && weights[i][best]>0.5;
  });
  for(let i=0;i<indices.length;i+=3){
    const ids=[indices[i],indices[i+1],indices[i+2]];
    if(ids.every(id=>isTire[id])){
      triangles.push(ids.map(id=>positions[id]));
      for(const id of ids)vertices.push(positions[id]);
    }
  }
}
if(triangles.length!==396)throw new Error(`Tire triangle recovery drifted: expected 396, got ${triangles.length}`);

const uniqueMap=new Map();
for(const p of vertices){
  const key=p.map(v=>v.toFixed(8)).join(',');
  if(!uniqueMap.has(key))uniqueMap.set(key,p);
}
const unique=[...uniqueMap.values()];
const xs=unique.map(p=>p[0]);
const minX=Math.min(...xs),maxX=Math.max(...xs),centerX=0.5*(minX+maxX);
const radial=unique.map(p=>Math.hypot(p[1],p[2]));
const maxRadius=Math.max(...radial);

const BIN=0.01;
const bins=new Map();
for(const p of unique){
  const axial=p[0]-centerX;
  const r=Math.hypot(p[1],p[2]);
  const key=Math.round(axial/BIN);
  let row=bins.get(key);
  if(!row){row={key,axials:[],radii:[]};bins.set(key,row);}
  row.axials.push(axial);row.radii.push(r);
}
const profiles=[...bins.values()].map(row=>({
  axialMm:1000*row.axials.reduce((a,b)=>a+b,0)/row.axials.length,
  minRadiusMm:1000*Math.min(...row.radii),
  maxRadiusMm:1000*Math.max(...row.radii),
  samples:row.radii.length,
})).sort((a,b)=>a.axialMm-b.axialMm);

const WHEEL_RADIUS=0.514062464;
const HALF_WIDTH=0.4375/2;
function torusAt(ratio,axial){
  const crown=ratio*HALF_WIDTH;
  const ring=WHEEL_RADIUS-crown;
  const capsuleHalfLength=HALF_WIDTH-crown;
  const extra=Math.max(Math.abs(axial)-capsuleHalfLength,0);
  if(extra>crown)return null;
  const radialHalf=Math.sqrt(Math.max(0,crown*crown-extra*extra));
  return{outer:ring+radialHalf,inner:ring-radialHalf};
}
const fits=[];
for(const ratio of [0.45,0.55,0.65,0.914]){
  const diffs=[];
  const innerDiffs=[];
  const rows=[];
  for(const p of profiles){
    const t=torusAt(ratio,p.axialMm/1000);
    if(!t)continue;
    const outerDiffMm=1000*t.outer-p.maxRadiusMm;
    const innerDiffMm=p.minRadiusMm-1000*t.inner;
    diffs.push(outerDiffMm);innerDiffs.push(innerDiffMm);
    rows.push({axialMm:p.axialMm,visualOuterMm:p.maxRadiusMm,visualInnerMm:p.minRadiusMm,torusOuterMm:1000*t.outer,torusInnerMm:1000*t.inner,outerDiffMm,innerDiffMm});
  }
  fits.push({
    ratio,
    crownRadiusMm:ratio*HALF_WIDTH*1000,
    ringRadiusMm:(WHEEL_RADIUS-ratio*HALF_WIDTH)*1000,
    maxOuterProtrusionMm:Math.max(...diffs),
    maxOuterUnderfillMm:-Math.min(...diffs),
    rmsOuterMm:Math.sqrt(diffs.reduce((s,v)=>s+v*v,0)/diffs.length),
    maxInnerFillBeyondVisualVoidMm:Math.max(...innerDiffs),
    rows,
  });
}
console.log('TIRE_CROSS_SECTION_AUDIT_RESULT',JSON.stringify({
  tireNodeIndex,tireJointPaletteIndex,triangles:triangles.length,uniqueVertices:unique.length,
  axialBoundsMm:[minX*1000,maxX*1000],axialCenterMm:centerX*1000,widthMm:(maxX-minX)*1000,
  maxRadiusMm:maxRadius*1000,profiles,fits,
}));
console.log('TIRE_CROSS_SECTION_AUDIT_OK');
