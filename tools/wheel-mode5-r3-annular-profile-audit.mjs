import { readFile } from 'node:fs/promises';
import { inspectBlockbenchRigidPartsV1 } from './owner-vehicle/blockbench-gltf-rigid-parts.mjs';
import { auditOwnerWheelProfileR3 } from './owner-vehicle/owner-m6-wheel-profile-audit.mjs';
import { calibrateOwnerWheelR1 } from './owner-vehicle/owner-m6-visual-calibration-r1.mjs';

const WHEEL_PATH=new URL('../assets/owner-vehicle/source/Offroad_Big_Wheels.gltf',import.meta.url);
const REQUESTED_RADIUS=0.514062464;
const REQUESTED_WIDTH=0.4375;
const EPS=1e-12;

const text=await readFile(WHEEL_PATH,'utf8');
const rigidParts=inspectBlockbenchRigidPartsV1(text,'Offroad_Big_Wheels.gltf');
const validated=auditOwnerWheelProfileR3(rigidParts,REQUESTED_RADIUS,REQUESTED_WIDTH,{angularBins:72,axialBins:64});
if(validated.piece.triangleCount!==396||validated.piece.nonDegenerateTriangleCount!==396){
  throw new Error(`validated Tire recovery drifted: ${JSON.stringify(validated.piece)}`);
}
if(validated.frame.markerContract!=='VERIFIED')throw new Error(`marker contract is not VERIFIED: ${validated.frame.markerContract}`);
if(Math.abs(validated.physical.axialWidth-REQUESTED_WIDTH)>1e-9)throw new Error(`validated Tire width drifted: ${validated.physical.axialWidth}`);
if(!(validated.physical.outerRadius>0.54&&validated.physical.outerRadius<0.55))throw new Error(`validated Tire outer radius implausible: ${validated.physical.outerRadius}`);

function add(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mul(a,s){return[a[0]*s,a[1]*s,a[2]*s];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function length(v){return Math.hypot(v[0],v[1],v[2]);}
function normalize(v,label){const l=length(v);if(!(l>EPS))throw new Error(`${label} degenerate`);return mul(v,1/l);}
function midpoint(a,b){return mul(add(a,b),.5);}
function lerp(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function marker(source,name){const p=source.uniqueNodeWorldPositions[name];if(!Array.isArray(p)||p.length!==3)throw new Error(`missing marker ${name}`);return[...p];}

const source=rigidParts.source;
const calibration=calibrateOwnerWheelR1(source,REQUESTED_RADIUS,REQUESTED_WIDTH);
if(calibration.report.markerContract!=='VERIFIED')throw new Error('calibration marker contract lost');
const widthLeft=marker(source,'Marker_TireWidthLeft');
const widthRight=marker(source,'Marker_TireWidthRight');
const radiusMarker=marker(source,'Marker_TireRadiusOuter');
const authoredCenter=midpoint(widthLeft,widthRight);
const axleVector=sub(widthRight,widthLeft);
const authoredWidth=length(axleVector);
const authoredAxle=normalize(axleVector,'authored axle');
const centerToRadius=sub(radiusMarker,authoredCenter);
const radialWithoutAxial=sub(centerToRadius,mul(authoredAxle,dot(centerToRadius,authoredAxle)));
const authoredRadius=length(radialWithoutAxial);
let authoredRadial=normalize(radialWithoutAxial,'authored radial');
const authoredTangent=normalize(cross(authoredAxle,authoredRadial),'authored tangent');
authoredRadial=normalize(cross(authoredTangent,authoredAxle),'corrected authored radial');
const axialScale=REQUESTED_WIDTH/authoredWidth;
const radialScale=REQUESTED_RADIUS/authoredRadius;
const toWheelPoint=(point)=>{
  const delta=sub(point,authoredCenter);
  return[
    dot(delta,authoredRadial)*radialScale,
    dot(delta,authoredAxle)*axialScale,
    dot(delta,authoredTangent)*radialScale,
  ];
};

const tireMatches=rigidParts.rigidPieces.filter(piece=>piece.jointName==='Tire');
if(tireMatches.length!==1)throw new Error(`expected one Tire rigid piece, got ${tireMatches.length}`);
const tire=tireMatches[0];
const triangles=[];
for(const primitive of tire.primitives){
  for(let offset=0;offset<primitive.indices.length;offset+=3){
    const points=primitive.indices.slice(offset,offset+3).map(vertexIndex=>toWheelPoint([
      primitive.positions[vertexIndex*3],
      primitive.positions[vertexIndex*3+1],
      primitive.positions[vertexIndex*3+2],
    ]));
    const area=.5*length(cross(sub(points[1],points[0]),sub(points[2],points[0])));
    if(area>EPS)triangles.push(points);
  }
}
if(triangles.length!==396)throw new Error(`physical Tire triangles drifted: ${triangles.length}`);

const points=triangles.flat();
const minAxial=Math.min(...points.map(p=>p[1]));
const maxAxial=Math.max(...points.map(p=>p[1]));
const width=maxAxial-minAxial;
const axialCenter=.5*(minAxial+maxAxial);
const maxVertexRadius=Math.max(...points.map(p=>Math.hypot(p[0],p[2])));
const minVertexRadius=Math.min(...points.map(p=>Math.hypot(p[0],p[2])));
if(Math.abs(minAxial-validated.physical.axialMin)>1e-10||Math.abs(maxAxial-validated.physical.axialMax)>1e-10){
  throw new Error(`annular transform axial bounds disagree with validated audit`);
}
if(Math.abs(maxVertexRadius-validated.physical.outerRadius)>1e-10||Math.abs(minVertexRadius-validated.physical.radialMin)>1e-10){
  throw new Error(`annular transform radial bounds disagree with validated audit`);
}

function samePoint(a,b,tolerance=1e-10){return length(sub(a,b))<=tolerance;}
function uniquePoints(values){const out=[];for(const p of values)if(!out.some(q=>samePoint(p,q)))out.push(p);return out;}
function farthestPair(values){let best=null,bestDistance=-1;for(let i=0;i<values.length;i++)for(let j=i+1;j<values.length;j++){const d=length(sub(values[i],values[j]));if(d>bestDistance){bestDistance=d;best=[values[i],values[j]];}}return best;}
function triangleAxialSegment(triangle,axial){
  const intersections=[];
  for(let i=0;i<3;i++){
    const a=triangle[i],b=triangle[(i+1)%3],da=a[1]-axial,db=b[1]-axial;
    const aOn=Math.abs(da)<=EPS,bOn=Math.abs(db)<=EPS;
    if(aOn)intersections.push(a);
    if(bOn)intersections.push(b);
    if(!aOn&&!bOn&&da*db<0)intersections.push(lerp(a,b,da/(da-db)));
  }
  const unique=uniquePoints(intersections);
  return unique.length>=2?farthestPair(unique):null;
}
function radialExtremaOnSegment(a,b){
  const ax=a[0],az=a[2],dx=b[0]-ax,dz=b[2]-az,denom=dx*dx+dz*dz;
  const t=denom>1e-20?Math.max(0,Math.min(1,-(ax*dx+az*dz)/denom)):0;
  const closest=[ax+dx*t,az+dz*t];
  return{min:Math.hypot(...closest),max:Math.max(Math.hypot(a[0],a[2]),Math.hypot(b[0],b[2]))};
}
function stats(values){
  const sorted=[...values].sort((a,b)=>a-b),mean=values.reduce((a,b)=>a+b,0)/values.length;
  const q=f=>{const p=(sorted.length-1)*f,l=Math.floor(p),h=Math.ceil(p);return l===h?sorted[l]:sorted[l]+(sorted[h]-sorted[l])*(p-l);};
  return{min:sorted[0],p05:q(.05),p25:q(.25),median:q(.5),p75:q(.75),p95:q(.95),max:sorted.at(-1),mean,range:sorted.at(-1)-sorted[0]};
}

const sliceCount=129;
const slices=[];
for(let i=0;i<sliceCount;i++){
  const axial=minAxial+((i+.5)/sliceCount)*width;
  const segments=[];
  for(const triangle of triangles){const segment=triangleAxialSegment(triangle,axial);if(segment)segments.push(segment);}
  if(segments.length===0)continue;
  let inner=Infinity,outer=0;
  for(const [a,b] of segments){const ex=radialExtremaOnSegment(a,b);inner=Math.min(inner,ex.min);outer=Math.max(outer,ex.max);}
  slices.push({axial,axialCentered:axial-axialCenter,innerRadius:inner,outerRadius:outer,segmentCount:segments.length});
}
if(slices.length<120)throw new Error(`insufficient Tire slice coverage: ${slices.length}`);

const halfWidth=width/2;
const central=slices.filter(slice=>Math.abs(slice.axialCentered)<=.75*halfWidth);
const innerStats=stats(slices.map(slice=>slice.innerRadius));
const centralInnerStats=stats(central.map(slice=>slice.innerRadius));
const outerStats=stats(slices.map(slice=>slice.outerRadius));
const scalarCandidates=[.08,.10,.12,.14,.16,.18,.20,.22,.24,.26,.28,.30,.32,.34].map(radius=>({
  radius,
  minClearance:Math.min(...slices.map(slice=>slice.innerRadius-radius)),
  violatingSlices:slices.filter(slice=>slice.innerRadius<radius).length,
}));

// Conservative nine-station inner profile. Each station uses the local-band
// minimum, so interpolation is deliberately inward-biased rather than fitting
// through optimistic point samples.
const stationCount=9;
const stations=[];
for(let i=0;i<stationCount;i++){
  const axialCentered=-halfWidth+(2*halfWidth*i)/(stationCount-1);
  const bandHalf=width/(stationCount-1)/2+1e-9;
  const local=slices.filter(slice=>Math.abs(slice.axialCentered-axialCentered)<=bandHalf);
  stations.push({axialCentered,innerRadius:local.length?Math.min(...local.map(slice=>slice.innerRadius)):null,samples:local.length});
}

console.log('R3_ANNULAR_PROFILE_RESULT',JSON.stringify({
  method:'RIGID_TIRE_PLUS_R1_VERIFIED_WHEEL_MARKERS',
  sourceAuthority:calibration.report.sourceAuthority,
  markerContract:calibration.report.markerContract,
  tire:{triangleCount:tire.triangleCount,physicalTriangleCount:triangles.length},
  axial:{min:minAxial,max:maxAxial,center:axialCenter,width},
  radial:{minVertexRadius,maxVertexRadius,validatedRadialMin:validated.physical.radialMin,validatedOuterRadius:validated.physical.outerRadius},
  sliceCount:slices.length,
  innerStats,
  centralInnerStats,
  outerStats,
  scalarCandidates,
  stations,
  slices,
}));
console.log('R3_ANNULAR_PROFILE_OK');
