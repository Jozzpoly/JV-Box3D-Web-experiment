import { readFile } from 'node:fs/promises';
import { validatePinnedNativeFactoryReceiptText } from '../.test-dist/config/native-factory-receipt.js';
import { loadMode5Box3DModule } from '../.test-dist/physics/mode5-box3d-runtime.js';
import { m6TopologyConfigFromReceipt } from '../.test-dist/vehicle/m6/m6-topology-config.js';
import { createM6VehicleRuntime } from '../.test-dist/vehicle/m6/m6-runtime-builder.js';
import {
  createMode5WheelForGeometry,
  MODE5_CORE_TORUS_GEOMETRY,
  MODE5_CORE_TORUS_SEGMENTS,
  MODE5_CORE_TORUS_CROWN_RATIO,
  MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
  MODE5_WHEEL_GEOMETRY_VARIANT,
} from '../.test-dist/vehicle/m6/mode5-wheel-backend.js';

const SOURCE = 'd52aa3776e022649af21cddc6d9dcfae3bac42f9';
const FULL_MASK = 0xffff_ffff_ffff_ffffn;

// Literal recovery of the historical worst C falsifier from run 33683673451.
// Do not resolve this through a procedural-world index: the old diagnostic's
// index was relative to a ranked/sliced rock set and caused one misleading D run.
const ROCK = Object.freeze({
  halfExtents: Object.freeze({
    x: 0.059916594306979265,
    y: 0.04547782222493919,
    z: 0.06463660159566842,
  }),
  rotation: Object.freeze({
    x: 0.0003777313710980216,
    y: 0.24466730447345725,
    z: 0.00009531543729218681,
    w: -0.9696070123280212,
  }),
  friction: 1,
});
const DIRECTION = Object.freeze({
  x: 0.1440046082211958,
  y: -0.24000768036865966,
  z: 0.9600307214746386,
});
const HISTORICAL_C_ONSET = 0.31151123046875007;
const HISTORICAL_C_EXACT_TRIANGLE_GAP = 0.074714984;

if (MODE5_WHEEL_GEOMETRY_VARIANT !== MODE5_CORE_TORUS_GEOMETRY) {
  throw new Error(`full-M6 compile did not select D: ${MODE5_WHEEL_GEOMETRY_VARIANT}`);
}

const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(new URL('../public/receipts/jv_m6_factory_receipt.json', import.meta.url), 'utf8'),
);
const config = m6TopologyConfigFromReceipt(receipt);
const b3 = await loadMode5Box3DModule();

function add(a,b){return{x:a.x+b.x,y:a.y+b.y,z:a.z+b.z};}
function sub(a,b){return{x:a.x-b.x,y:a.y-b.y,z:a.z-b.z};}
function scale(s,v){return{x:s*v.x,y:s*v.y,z:s*v.z};}
function rotate(q,v){
  const ux=q.x,uy=q.y,uz=q.z,s=q.w;
  const du=ux*v.x+uy*v.y+uz*v.z, uu=ux*ux+uy*uy+uz*uz;
  const cx=uy*v.z-uz*v.y,cy=uz*v.x-ux*v.z,cz=ux*v.y-uy*v.x;
  return{x:2*du*ux+(s*s-uu)*v.x+2*s*cx,y:2*du*uy+(s*s-uu)*v.y+2*s*cy,z:2*du*uz+(s*s-uu)*v.z+2*s*cz};
}
function inverseRotate(q,v){return rotate({x:-q.x,y:-q.y,z:-q.z,w:q.w},v);}

async function readFlTriangles(){
  const root=new URL('../owner-ab/vehicles/m6-owner-r3/',import.meta.url);
  const pkg=JSON.parse(await readFile(new URL('m6-owner-full-rig-r3.visual.json',root),'utf8'));
  const raw=new Uint8Array(await readFile(new URL('models/m6-owner-full-rig-r3.glb',root)));
  const view=new DataView(raw.buffer,raw.byteOffset,raw.byteLength);
  if(view.getUint32(0,true)!==0x46546c67)throw new Error('R3 is not GLB');
  const jsonLength=view.getUint32(12,true);
  const json=JSON.parse(new TextDecoder().decode(raw.slice(20,20+jsonLength)).trim());
  const binHeader=20+jsonLength,binLength=view.getUint32(binHeader,true);
  const binary=raw.slice(binHeader+8,binHeader+8+binLength);
  const dv=new DataView(binary.buffer,binary.byteOffset,binary.byteLength);
  const binding=pkg.bindings.find(b=>b.bindingId==='owner.fl.wheel');
  if(!binding)throw new Error('missing owner.fl.wheel binding');
  const node=json.nodes.find(n=>n.name===binding.nodeName);
  if(!node||node.mesh===undefined)throw new Error(`missing mesh ${binding.nodeName}`);
  function reader(type){
    if(type===5120)return{bytes:1,read:o=>dv.getInt8(o)};
    if(type===5121)return{bytes:1,read:o=>dv.getUint8(o)};
    if(type===5122)return{bytes:2,read:o=>dv.getInt16(o,true)};
    if(type===5123)return{bytes:2,read:o=>dv.getUint16(o,true)};
    if(type===5125)return{bytes:4,read:o=>dv.getUint32(o,true)};
    if(type===5126)return{bytes:4,read:o=>dv.getFloat32(o,true)};
    throw new Error(`unsupported component ${type}`);
  }
  const ncomp=t=>({SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[t]);
  function accessor(i){
    const a=json.accessors[i],bv=json.bufferViews[a.bufferView],r=reader(a.componentType),n=ncomp(a.type);
    if(!n)throw new Error(`unsupported accessor ${a.type}`);
    const stride=bv.byteStride??r.bytes*n,start=(bv.byteOffset??0)+(a.byteOffset??0),out=[];
    for(let row=0;row<a.count;row++){
      const values=[];for(let c=0;c<n;c++)values.push(r.read(start+row*stride+c*r.bytes));
      out.push(n===1?values[0]:values);
    }
    return out;
  }
  const tris=[];
  for(const p of json.meshes[node.mesh].primitives){
    if(p.mode!==undefined&&p.mode!==4)throw new Error('non-triangle primitive');
    const pos=accessor(p.attributes.POSITION),idx=p.indices!==undefined?accessor(p.indices):pos.map((_,i)=>i);
    for(let i=0;i<idx.length;i+=3)tris.push([pos[idx[i]],pos[idx[i+1]],pos[idx[i+2]]]);
  }
  return tris;
}
const localTriangles=await readFlTriangles();

function vsub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function vadd(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function vmul(a,s){return[a[0]*s,a[1]*s,a[2]*s];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function len2(a){return dot(a,a);}
function pointAabbDist2(p,h){let d2=0;for(let k=0;k<3;k++){const d=Math.max(Math.abs(p[k])-h[k],0);d2+=d*d;}return d2;}
function axisSeparates(axis,tri,h){
  if(len2(axis)<1e-18)return false;
  const p=tri.map(v=>dot(v,axis)),mn=Math.min(...p),mx=Math.max(...p);
  const r=h[0]*Math.abs(axis[0])+h[1]*Math.abs(axis[1])+h[2]*Math.abs(axis[2]);
  return mn>r||mx<-r;
}
function triIntersectsBox(tri,h){
  const e=[vsub(tri[1],tri[0]),vsub(tri[2],tri[1]),vsub(tri[0],tri[2])];
  const axes=[[1,0,0],[0,1,0],[0,0,1],cross(e[0],e[1])];
  for(const edge of e)axes.push(cross(edge,[1,0,0]),cross(edge,[0,1,0]),cross(edge,[0,0,1]));
  return !axes.some(a=>axisSeparates(a,tri,h));
}
function pointTriDist2(p,a,b,c){
  const ab=vsub(b,a),ac=vsub(c,a),ap=vsub(p,a);const d1=dot(ab,ap),d2=dot(ac,ap);if(d1<=0&&d2<=0)return len2(ap);
  const bp=vsub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);if(d3>=0&&d4<=d3)return len2(bp);
  const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0){const v=d1/(d1-d3);return len2(vsub(p,vadd(a,vmul(ab,v))));}
  const cp=vsub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);if(d6>=0&&d5<=d6)return len2(cp);
  const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0){const w=d2/(d2-d6);return len2(vsub(p,vadd(a,vmul(ac,w))));}
  const va=d3*d6-d5*d4;if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){const w=(d4-d3)/((d4-d3)+(d5-d6));return len2(vsub(p,vadd(b,vmul(vsub(c,b),w))));}
  const denom=1/(va+vb+vc),v=vb*denom,w=vc*denom;return len2(vsub(p,vadd(a,vadd(vmul(ab,v),vmul(ac,w)))));
}
function segSegDist2(p1,q1,p2,q2){
  const d1=vsub(q1,p1),d2=vsub(q2,p2),r=vsub(p1,p2),a=dot(d1,d1),e=dot(d2,d2),f=dot(d2,r),EPS=1e-14;let s,t;
  if(a<=EPS&&e<=EPS)return len2(vsub(p1,p2));
  if(a<=EPS){s=0;t=Math.max(0,Math.min(1,f/e));}
  else{const c=dot(d1,r);if(e<=EPS){t=0;s=Math.max(0,Math.min(1,-c/a));}else{const b=dot(d1,d2),den=a*e-b*b;s=den!==0?Math.max(0,Math.min(1,(b*f-c*e)/den)):0;t=(b*s+f)/e;if(t<0){t=0;s=Math.max(0,Math.min(1,-c/a));}else if(t>1){t=1;s=Math.max(0,Math.min(1,(b-c)/a));}}}
  return len2(vsub(vadd(p1,vmul(d1,s)),vadd(p2,vmul(d2,t))));
}
function exactVisualGap(bodyId,box){
  const h=[box.halfExtents.x,box.halfExtents.y,box.halfExtents.z];
  const corners=[];for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1])corners.push([sx*h[0],sy*h[1],sz*h[2]]);
  const boxEdges=[];for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){let diffs=0;for(let k=0;k<3;k++)if(corners[i][k]!==corners[j][k])diffs++;if(diffs===1)boxEdges.push([corners[i],corners[j]]);}
  const toBox=p=>{const w=b3.b3Body_GetWorldPoint(bodyId,{x:p[0],y:p[1],z:p[2]});const l=inverseRotate(box.rotation,sub(w,box.center));return[l.x,l.y,l.z];};
  let best2=Infinity;
  for(const source of localTriangles){
    const t=source.map(toBox);if(triIntersectsBox(t,h))return 0;
    for(const v of t)best2=Math.min(best2,pointAabbDist2(v,h));
    for(const c of corners)best2=Math.min(best2,pointTriDist2(c,t[0],t[1],t[2]));
    for(const a of [[t[0],t[1]],[t[1],t[2]],[t[2],t[0]]])for(const e of boxEdges)best2=Math.min(best2,segSegDist2(a[0],a[1],e[0],e[1]));
  }
  return Math.sqrt(best2);
}

function createStaticRock(worldId,box){
  const bd=b3.b3DefaultBodyDef();bd.position={...box.center};bd.rotation={v:{x:box.rotation.x,y:box.rotation.y,z:box.rotation.z},s:box.rotation.w};
  const bodyId=b3.b3CreateBody(worldId,bd);const sd=b3.b3DefaultShapeDef();sd.baseMaterial.friction=box.friction;sd.filter.categoryBits=config.terrainCategoryBits;sd.filter.maskBits=FULL_MASK;sd.enableContactEvents=true;
  const shapeId=b3.b3CreateBoxShape(bodyId,sd,box.halfExtents.x,box.halfExtents.y,box.halfExtents.z);return{bodyId,shapeId};
}
function shapeContact(shapeId){
  const contacts=b3.createContactsBuffer();try{b3.getShapeContactData(contacts,shapeId);let min=Infinity,impulse=0,points=0;const count=b3.getNumContacts(contacts);
    for(let i=0;i<count;i++){const c=b3.getContactAt(b3.createContact(),contacts,i);for(let m=0;m<c.manifoldCount;m++){const mf=b3.getManifoldAt(b3.createManifold(),c,m);for(let p=0;p<mf.pointCount;p++){const pt=mf.points[p];min=Math.min(min,pt.separation);impulse=Math.max(impulse,pt.totalNormalImpulse??pt.normalImpulse??0);points++;}}}
    return{contacts:count,points,minSeparation:Number.isFinite(min)?min:null,maxNormalImpulse:impulse};
  }finally{b3.destroyContactsBuffer(contacts);}}
function aggregateContacts(ids){let contactShapes=0,contacts=0,points=0,min=Infinity,impulse=0;for(const id of ids){const c=shapeContact(id);if(c.contacts)contactShapes++;contacts+=c.contacts;points+=c.points;if(c.minSeparation!==null)min=Math.min(min,c.minSeparation);impulse=Math.max(impulse,c.maxNormalImpulse);}return{shapeCount:ids.length,contactShapes,contacts,points,minSeparation:Number.isFinite(min)?min:null,maxNormalImpulse:impulse};}

function isolatedAt(geometry,speculative,distance){
  const wd=b3.b3DefaultWorldDef();wd.gravity={x:0,y:0,z:0};wd.enableContinuous=false;const worldId=b3.b3CreateWorld(wd);b3.b3World_EnableSpeculative(worldId,speculative);
  try{
    const wheel=createMode5WheelForGeometry(geometry,b3,worldId,config,{x:0,y:0,z:0},-9501);
    const box={...ROCK,center:scale(distance,DIRECTION)};createStaticRock(worldId,box);const visualGap=exactVisualGap(wheel.bodyId,box);b3.b3World_Step(worldId,1/60,4);
    return{distance,visualGap,contact:aggregateContacts(wheel.shapeIds),receipt:{backendId:wheel.backendId,geometryVariant:wheel.geometryVariant,contactGeometryId:wheel.contactGeometryId,shapeCount:wheel.shapeCount,rollingShapeIdIsNull:wheel.rollingShapeId===null,torusSegments:wheel.torusSegments,torusCrownRadius:wheel.torusCrownRadius,torusRingRadius:wheel.torusRingRadius,torusCapsuleHalfLength:wheel.torusCapsuleHalfLength}};
  }finally{b3.b3DestroyWorld(worldId);}
}
function findOuterOnset(geometry,speculative){
  let far=1.25,farResult=isolatedAt(geometry,speculative,far),near=null,nearResult=null;if(farResult.contact.contacts)throw new Error('far probe contacts');
  for(let d=1.20;d>=0.03;d-=0.03){const r=isolatedAt(geometry,speculative,d);if(r.contact.contacts){near=d;nearResult=r;break;}far=d;farResult=r;}
  if(near===null)throw new Error(`no contact found for ${geometry}`);
  for(let i=0;i<16;i++){const mid=0.5*(far+near),r=isolatedAt(geometry,speculative,mid);if(r.contact.contacts){near=mid;nearResult=r;}else{far=mid;farResult=r;}}
  return{onset:nearResult,lastFree:farResult};
}

const cOn=findOuterOnset(MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,true);
const dOn=findOuterOnset(MODE5_CORE_TORUS_GEOMETRY,true);
const dOff=findOuterOnset(MODE5_CORE_TORUS_GEOMETRY,false);
const cHistoricalPose=isolatedAt(MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,true,HISTORICAL_C_ONSET);
const dAtHistoricalCPose=isolatedAt(MODE5_CORE_TORUS_GEOMETRY,true,HISTORICAL_C_ONSET);

function fullM6At(distance,speculative){
  const wd=b3.b3DefaultWorldDef();wd.gravity={x:0,y:0,z:0};wd.enableContinuous=false;const worldId=b3.b3CreateWorld(wd);b3.b3World_EnableSpeculative(worldId,speculative);
  try{
    const vehicle=createM6VehicleRuntime(b3,worldId,config,{x:0,y:0,z:0},-9601),fl=vehicle.corners[0].wheel,center=b3.b3Body_GetPosition(fl.bodyId);
    const box={...ROCK,center:add(center,scale(distance,DIRECTION))};createStaticRock(worldId,box);const visualGap=exactVisualGap(fl.bodyId,box);b3.b3World_Step(worldId,1/60,4);
    return{wheelBackendId:vehicle.wheelBackendId,wheelReceipt:{backendId:fl.backendId,geometryVariant:fl.geometryVariant,contactGeometryId:fl.contactGeometryId,shapeCount:fl.shapeCount,rollingShapeIdIsNull:fl.rollingShapeId===null,torusSegments:fl.torusSegments},visualGap,flWheel:aggregateContacts(fl.shapeIds),chassis:shapeContact(vehicle.chassisShapeId)};
  }finally{b3.b3DestroyWorld(worldId);}
}
const fullD=fullM6At(dOn.onset.distance,true);

const halfWidth=0.5*config.wheelWidth,crown=MODE5_CORE_TORUS_CROWN_RATIO*halfWidth,ring=config.wheelRadius-crown;
const result={
  source:SOURCE,
  rock:ROCK,
  direction:DIRECTION,
  historicalC:{onsetDistance:HISTORICAL_C_ONSET,exactTriangleGap:HISTORICAL_C_EXACT_TRIANGLE_GAP,recomputedAtPose:cHistoricalPose},
  wheel:{radius:config.wheelRadius,width:config.wheelWidth,segments:MODE5_CORE_TORUS_SEGMENTS,crownRadius:crown,ringRadius:ring,innerVoidRadius:ring-crown,outerRadius:ring+crown},
  C_speculative_on:cOn,
  D_speculative_on:dOn,
  D_speculative_off:dOff,
  D_at_historical_C_pose:dAtHistoricalCPose,
  fullM6_D_at_D_onset:fullD,
  deltas:{DminusCVisualGap:dOn.onset.visualGap-cOn.onset.visualGap,DOnMinusOffVisualGap:dOn.onset.visualGap-dOff.onset.visualGap},
};
console.log('D_EXACT_FALSIFIER_RESULT',JSON.stringify(result));

if(Math.abs(cHistoricalPose.visualGap-HISTORICAL_C_EXACT_TRIANGLE_GAP)>0.004){
  throw new Error(`R3 oracle drift: recomputed ${cHistoricalPose.visualGap}, historical ${HISTORICAL_C_EXACT_TRIANGLE_GAP}`);
}
if(fullD.wheelBackendId!=='native_m6_mode5_core_torus64'||fullD.wheelReceipt.shapeCount!==64||!fullD.wheelReceipt.rollingShapeIdIsNull){
  throw new Error('full M6 did not actually use torus D');
}
if(fullD.flWheel.contacts===0)throw new Error('full M6 D did not reproduce FL torus contact');
console.log('D_EXACT_FALSIFIER_OK');
