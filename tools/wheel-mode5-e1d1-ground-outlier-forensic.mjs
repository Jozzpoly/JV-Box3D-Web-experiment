import assert from 'node:assert/strict';
import Box3D from '../box3djs/dist/box3d.inline.mjs';
import { loadOwnerM6TireGeometryR3 } from './owner-vehicle/owner-m6-tire-geometry-r3.mjs';

const b3 = await Box3D();
assert.equal(typeof b3.e1ProbeAnnularP75Box, 'function');
assert.equal(typeof b3.e1InspectAnnularP75BoxPatch, 'function');
const tire = await loadOwnerM6TireGeometryR3();
assert.equal(tire.provenance.triangleCount, 396);
assert.equal(tire.provenance.markerContract, 'VERIFIED');

const IDENTITY = [0, 0, 0, 1];
const PHASE_INDICES = [154, 155, 156, 157, 158, 159, 160, 190, 191, 192, 193];
const PHASE_COUNT = 256;

function add(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mul(a,s){return[a[0]*s,a[1]*s,a[2]*s];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function length(a){return Math.hypot(...a);}
function normalize(a){const n=length(a);return mul(a,1/n);}
function distance(a,b){return length(sub(a,b));}
function qnormalize(q){const n=Math.hypot(...q);return q.map(v=>v/n);}
function qconj(q){return[-q[0],-q[1],-q[2],q[3]];}
function qmul(a,b){return[
 a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],
 a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],
 a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],
 a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];}
function qrot(q,v){q=qnormalize(q);const u=[q[0],q[1],q[2]],s=q[3];const uv=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const uuv=[u[1]*uv[2]-u[2]*uv[1],u[2]*uv[0]-u[0]*uv[2],u[0]*uv[1]-u[1]*uv[0]];return[v[0]+2*(s*uv[0]+uuv[0]),v[1]+2*(s*uv[1]+uuv[1]),v[2]+2*(s*uv[2]+uuv[2])];}
function qz(a){return[0,0,Math.sin(a/2),Math.cos(a/2)];}
function mean(values){return values.reduce((a,b)=>a+b,0)/values.length;}
function vmean(values){return values.reduce((a,b)=>add(a,b),[0,0,0]).map(v=>v/values.length);}
function minmax(values){return{min:Math.min(...values),max:Math.max(...values),range:Math.max(...values)-Math.min(...values)};}
function histogram(values){const out={};for(const v of values)out[v]=(out[v]??0)+1;return out;}
function jaccard(a,b){const A=new Set(a),B=new Set(b);let intersection=0;for(const v of A)if(B.has(v))intersection++;const union=A.size+B.size-intersection;return union?intersection/union:1;}

function localBox(box,phase){const wheelQ=qz(phase),inv=qconj(wheelQ);return{halfExtents:box.halfExtents,center:qrot(inv,box.center),rotation:qnormalize(qmul(inv,box.rotation)),wheelQ};}
function probe(box,phase){const l=localBox(box,phase),h=l.halfExtents,p=l.center,q=l.rotation;const r=b3.e1ProbeAnnularP75Box(h[0],h[1],h[2],p[0],p[1],p[2],q[0],q[1],q[2],q[3],0);if(!r.valid)throw new Error('probe invalid');return{hit:Boolean(r.hit),meshTriangleCount:r.meshTriangleCount,rawCandidates:r.rawCandidates,acceptedCandidates:r.acceptedCandidates,separation:r.hit?r.separation:null,surface:r.hit?r.surface:null,station:r.hit?r.station:null,sector:r.hit?r.sector:null,pointWorld:r.hit?qrot(l.wheelQ,[r.pointX,r.pointY,r.pointZ]):null,normalWorld:r.hit?qrot(l.wheelQ,[r.normalX,r.normalY,r.normalZ]):null};}
function inspect(box,phase){const l=localBox(box,phase),h=l.halfExtents,p=l.center,q=l.rotation;const r=b3.e1InspectAnnularP75BoxPatch(h[0],h[1],h[2],p[0],p[1],p[2],q[0],q[1],q[2],q[3],0);if(!r.valid)throw new Error('inspect invalid');const candidates=Array.from(r.candidates??[]).map(c=>({acceptedIndex:c.acceptedIndex,triangleIndex:c.triangleIndex,surface:c.surface,station:c.station,sector:c.sector,separation:c.candidateSeparation,normalWorld:qrot(l.wheelQ,[c.normalX,c.normalY,c.normalZ]),witnessWorld:qrot(l.wheelQ,[c.witnessX,c.witnessY,c.witnessZ]),points:Array.from(c.points??[]).map(p=>({separation:p.separation,pointWorld:qrot(l.wheelQ,[p.x,p.y,p.z])}))}));return{bestAcceptedIndex:r.bestAcceptedIndex,bestSeparation:r.bestSeparation,rawCandidates:r.rawCandidates,acceptedCandidates:r.acceptedCandidates,candidates};}
function groundBox(d){return{halfExtents:[1.5,0.5,0.06],center:[0,-(d+0.5),0],rotation:IDENTITY};}
function onset(phase){let prevD=0.58,prev=probe(groundBox(prevD),phase),sep=null,touch=null,touchProbe=null;assert.equal(prev.hit,false);for(let i=1;i<=96;i++){const d=0.58+(0.50-0.58)*(i/96),r=probe(groundBox(d),phase);if(!prev.hit&&r.hit){sep=prevD;touch=d;touchProbe=r;break;}prevD=d;prev=r;}assert.notEqual(touch,null);for(let i=0;i<22;i++){const mid=.5*(sep+touch),r=probe(groundBox(mid),phase);if(r.hit){touch=mid;touchProbe=r;}else sep=mid;}return{onset:touch,...touchProbe};}

function summarize(phaseIndex){const phase=2*Math.PI*phaseIndex/PHASE_COUNT,o=onset(phase),ins=inspect(groundBox(o.onset),phase);assert.equal(ins.acceptedCandidates,o.acceptedCandidates);const winner=ins.candidates[ins.bestAcceptedIndex];assert.equal(winner.station,o.station);assert.equal(winner.sector,o.sector);assert.ok(distance(winner.witnessWorld,o.pointWorld)<2e-6);
 const candidates=ins.candidates,points=candidates.flatMap(c=>c.points.map(p=>p.pointWorld)),witnesses=candidates.map(c=>c.witnessWorld),normals=candidates.map(c=>normalize(c.normalWorld));
 const pointCentroid=vmean(points),witnessCentroid=vmean(witnesses),normalMean=normalize(vmean(normals));
 const stationGroups={};for(const c of candidates){const g=stationGroups[c.station]??={count:0,witnessZ:[],separationMm:[]};g.count++;g.witnessZ.push(c.witnessWorld[2]);g.separationMm.push(c.separation*1000);stationGroups[c.station]=g;}
 const stationSummary=Object.entries(stationGroups).map(([station,g])=>({station:Number(station),count:g.count,witnessZMeanMm:mean(g.witnessZ)*1000,separationMm:minmax(g.separationMm)}));
 return{phaseIndex,phase,onset:o.onset,winner:{triangleIndex:winner.triangleIndex,station:winner.station,sector:winner.sector,separationMm:winner.separation*1000,witnessWorld:winner.witnessWorld},rawCandidates:ins.rawCandidates,acceptedCandidates:ins.acceptedCandidates,candidateSeparationMm:minmax(candidates.map(c=>c.separation*1000)),stationCount:new Set(candidates.map(c=>c.station)).size,sectorCount:new Set(candidates.map(c=>c.sector)).size,stationHistogram:histogram(candidates.map(c=>c.station)),sectorHistogram:histogram(candidates.map(c=>c.sector)),pointCentroid,witnessCentroid,pointZMm:minmax(points.map(p=>p[2]*1000)),witnessZMm:minmax(witnesses.map(p=>p[2]*1000)),normalMean,pointCentroidMomentProxy:cross(pointCentroid,normalMean),stationSummary,triangleIds:candidates.map(c=>c.triangleIndex)};}

const rows=PHASE_INDICES.map(summarize);
const adjacent=[];for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1];if(b.phaseIndex!==a.phaseIndex+1)continue;adjacent.push({from:a.phaseIndex,to:b.phaseIndex,onsetDeltaMm:(b.onset-a.onset)*1000,candidateJaccard:jaccard(a.triangleIds,b.triangleIds),candidateCountDelta:b.acceptedCandidates-a.acceptedCandidates,pointCentroidStepMm:distance(a.pointCentroid,b.pointCentroid)*1000,witnessCentroidStepMm:distance(a.witnessCentroid,b.witnessCentroid)*1000,momentProxyStepMm:distance(a.pointCentroidMomentProxy,b.pointCentroidMomentProxy)*1000,pointCentroidZ:[a.pointCentroid[2]*1000,b.pointCentroid[2]*1000],witnessCentroidZ:[a.witnessCentroid[2]*1000,b.witnessCentroid[2]*1000]});}
for(const row of rows)delete row.triangleIds;
console.log('E1D1_GROUND_OUTLIER_RESULT',JSON.stringify({method:'E1D1_GROUND_FIRST_CONTACT_PATCH_MEMBERSHIP_FORENSIC',acceptanceSkin:0,phaseCount:PHASE_COUNT,phaseIndices:PHASE_INDICES,provenance:tire.provenance,rows,adjacent}));
console.log('E1D1_GROUND_OUTLIER_MEASURED');
