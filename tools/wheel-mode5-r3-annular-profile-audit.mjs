import { readFile } from 'node:fs/promises';

const root='owner-ab/vehicles/m6-owner-r3';
const pkg=JSON.parse(await readFile(`${root}/m6-owner-full-rig-r3.visual.json`,'utf8'));
const glb=new Uint8Array(await readFile(`${root}/models/m6-owner-full-rig-r3.glb`));
const view=new DataView(glb.buffer,glb.byteOffset,glb.byteLength);
if(view.getUint32(0,true)!==0x46546c67)throw new Error('not GLB');
const jsonLength=view.getUint32(12,true);
const json=JSON.parse(new TextDecoder().decode(glb.slice(20,20+jsonLength)).trim());
const binaryHeader=20+jsonLength;
const binaryLength=view.getUint32(binaryHeader,true);
const binary=glb.slice(binaryHeader+8,binaryHeader+8+binaryLength);
const dv=new DataView(binary.buffer,binary.byteOffset,binary.byteLength);

const binding=pkg.bindings.find(b=>b.bindingId==='owner.fl.wheel');
if(!binding)throw new Error('missing owner.fl.wheel binding');
const node=json.nodes.find(n=>n.name===binding.nodeName);
if(!node||node.mesh===undefined)throw new Error(`missing R3 wheel mesh ${binding.nodeName}`);
if(node.matrix||node.translation||node.rotation||node.scale){
  throw new Error(`R3 wheel node unexpectedly transformed: ${JSON.stringify(node)}`);
}

function componentReader(componentType){
  if(componentType===5120)return{bytes:1,read:o=>dv.getInt8(o)};
  if(componentType===5121)return{bytes:1,read:o=>dv.getUint8(o)};
  if(componentType===5122)return{bytes:2,read:o=>dv.getInt16(o,true)};
  if(componentType===5123)return{bytes:2,read:o=>dv.getUint16(o,true)};
  if(componentType===5125)return{bytes:4,read:o=>dv.getUint32(o,true)};
  if(componentType===5126)return{bytes:4,read:o=>dv.getFloat32(o,true)};
  throw new Error(`unsupported component ${componentType}`);
}
function typeCount(type){const n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[type];if(!n)throw new Error(`unsupported type ${type}`);return n;}
function readAccessor(index){
  const a=json.accessors[index],bv=json.bufferViews[a.bufferView],reader=componentReader(a.componentType),n=typeCount(a.type);
  const stride=bv.byteStride??reader.bytes*n,start=(bv.byteOffset??0)+(a.byteOffset??0),out=[];
  for(let i=0;i<a.count;i++){
    const row=[];for(let c=0;c<n;c++)row.push(reader.read(start+i*stride+c*reader.bytes));
    out.push(n===1?row[0]:row);
  }
  return out;
}
const triangles=[];
for(const primitive of json.meshes[node.mesh].primitives){
  if(primitive.mode!==undefined&&primitive.mode!==4)throw new Error('non-triangle primitive');
  const pos=readAccessor(primitive.attributes.POSITION);
  const idx=primitive.indices!==undefined?readAccessor(primitive.indices):pos.map((_,i)=>i);
  for(let i=0;i<idx.length;i+=3)triangles.push([pos[idx[i]],pos[idx[i+1]],pos[idx[i+2]]]);
}
if(triangles.length!==396)throw new Error(`R3 triangle count drifted: ${triangles.length}`);

const all=triangles.flat();
const minAxial=Math.min(...all.map(p=>p[1]));
const maxAxial=Math.max(...all.map(p=>p[1]));
const axialCenter=0.5*(minAxial+maxAxial);
const width=maxAxial-minAxial;
const maxVertexRadius=Math.max(...all.map(p=>Math.hypot(p[0],p[2])));
if(!(width>0.43&&width<0.45))throw new Error(`implausible R3 width ${width}`);
if(!(maxVertexRadius>0.53&&maxVertexRadius<0.56))throw new Error(`implausible R3 radius ${maxVertexRadius}`);

const EPS=1e-9;
function lerp3(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function uniquePoints(points){
  const out=[];
  for(const p of points){if(!out.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])<1e-8))out.push(p);}
  return out;
}
function trianglePlaneSegments(tri,axial){
  const pts=[];
  for(let e=0;e<3;e++){
    const a=tri[e],b=tri[(e+1)%3];
    const da=a[1]-axial,db=b[1]-axial;
    if(Math.abs(da)<=EPS)pts.push(a);
    if(da*db< -EPS*EPS){const t=da/(da-db);pts.push(lerp3(a,b,t));}
    else if(Math.abs(db)<=EPS)pts.push(b);
  }
  const unique=uniquePoints(pts);
  if(unique.length<2)return[];
  if(unique.length===2)return[[unique[0],unique[1]]];
  // Coplanar/vertex degeneracy: retain the longest segment only.
  let best=null,bestD2=-1;
  for(let i=0;i<unique.length;i++)for(let j=i+1;j<unique.length;j++){
    const dx=unique[i][0]-unique[j][0],dz=unique[i][2]-unique[j][2],d2=dx*dx+dz*dz;
    if(d2>bestD2){bestD2=d2;best=[unique[i],unique[j]];}
  }
  return best?[best]:[];
}
function radialExtremaOnSegment(a,b){
  const ax=a[0],az=a[2],dx=b[0]-ax,dz=b[2]-az;
  const denom=dx*dx+dz*dz;
  const t=denom>1e-20?Math.max(0,Math.min(1,-(ax*dx+az*dz)/denom)):0;
  const c=[ax+dx*t,az+dz*t];
  const min=Math.hypot(c[0],c[1]);
  const ra=Math.hypot(a[0],a[2]),rb=Math.hypot(b[0],b[2]);
  return{min,max:Math.max(ra,rb)};
}

const sliceCount=129;
const slices=[];
for(let i=0;i<sliceCount;i++){
  // Avoid exact open boundaries where a measure-zero vertex can dominate.
  const u=(i+0.5)/sliceCount;
  const axial=minAxial+u*width;
  const segments=[];
  for(const tri of triangles)segments.push(...trianglePlaneSegments(tri,axial));
  if(segments.length===0)continue;
  let inner=Infinity,outer=0;
  for(const seg of segments){const ex=radialExtremaOnSegment(seg[0],seg[1]);inner=Math.min(inner,ex.min);outer=Math.max(outer,ex.max);}
  slices.push({axial,axialCentered:axial-axialCenter,innerRadius:inner,outerRadius:outer,segmentCount:segments.length});
}
if(slices.length<120)throw new Error(`insufficient R3 axial coverage: ${slices.length}`);

function stats(values){
  const s=[...values].sort((a,b)=>a-b),mean=values.reduce((a,b)=>a+b,0)/values.length;
  const q=f=>{const p=(s.length-1)*f,l=Math.floor(p),h=Math.ceil(p);return l===h?s[l]:s[l]+(s[h]-s[l])*(p-l);};
  return{min:s[0],p05:q(.05),p25:q(.25),median:q(.5),p75:q(.75),p95:q(.95),max:s.at(-1),mean,range:s.at(-1)-s[0]};
}
const central=slices.filter(s=>Math.abs(s.axialCentered)<=0.75*(width/2));
const innerStats=stats(slices.map(s=>s.innerRadius));
const centralInnerStats=stats(central.map(s=>s.innerRadius));
const outerStats=stats(slices.map(s=>s.outerRadius));

// Evaluate scalar inner-void radii. Safe means the scalar cylinder stays strictly
// inside the R3 inner surface for every sampled axial slice it spans.
const scalarCandidates=[0.08,0.10,0.12,0.14,0.16,0.18,0.20,0.22,0.24,0.26,0.28,0.30].map(radius=>({
  radius,
  minClearance:Math.min(...slices.map(s=>s.innerRadius-radius)),
  violatingSlices:slices.filter(s=>s.innerRadius<radius).length,
}));

// Conservative piecewise-linear inner profile at 9 axial stations. For each
// station choose the minimum inner radius inside its Voronoi band so linear
// interpolation cannot intentionally expand beyond locally observed void.
const stationCount=9;
const stations=[];
for(let i=0;i<stationCount;i++){
  const axialCentered=-width/2+(width*i)/(stationCount-1);
  const bandHalf=width/(stationCount-1)/2+1e-9;
  const local=slices.filter(s=>Math.abs(s.axialCentered-axialCentered)<=bandHalf);
  stations.push({axialCentered,innerRadius:local.length?Math.min(...local.map(s=>s.innerRadius)):null,samples:local.length});
}

console.log('R3_ANNULAR_PROFILE_RESULT',JSON.stringify({
  triangleCount:triangles.length,
  bindingNode:binding.nodeName,
  axial:{min:minAxial,max:maxAxial,center:axialCenter,width},
  maxVertexRadius,
  sliceCount:slices.length,
  innerStats,
  centralInnerStats,
  outerStats,
  scalarCandidates,
  stations,
  slices,
}));
console.log('R3_ANNULAR_PROFILE_OK');
