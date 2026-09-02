import { readFile, writeFile, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const source = await readFile(new URL('./wheel-mode5-d-exact-falsifier.mjs', import.meta.url), 'utf8');
const rockStartToken = 'const ROCK = Object.freeze({';
const directionStartToken = 'const DIRECTION = Object.freeze({';
const historicalStartToken = 'const HISTORICAL_C_ONSET';
const cutToken = 'const cOn=findOuterOnset';
const rockStart = source.indexOf(rockStartToken);
const directionStart = source.indexOf(directionStartToken, rockStart);
const historicalStart = source.indexOf(historicalStartToken, directionStart);
const cut = source.indexOf(cutToken, historicalStart);
if (rockStart < 0 || directionStart < 0 || historicalStart < 0 || cut < 0) {
  throw new Error('exact falsifier anchors drifted');
}

let text = source.slice(0, rockStart);
text += 'let ROCK = null;\n';
text += 'let DIRECTION = {x:1,y:0,z:0};\n';
text += source.slice(historicalStart, cut);
text += String.raw`
const { createE2rWorld } = await import('../.test-dist/scene/e2r-world.js');
const TARGET_SEPARATION = 0.0001; // 0.1 mm: collider surface, not 20 mm speculative manifold onset.

function normalize(v){const l=Math.hypot(v.x,v.y,v.z);return{x:v.x/l,y:v.y/l,z:v.z/l};}
const DIRECTIONS = [
  ['front', normalize({x:1,y:0,z:0})],
  ['front-low', normalize({x:1,y:-0.35,z:0})],
  ['front-left', normalize({x:1,y:0,z:0.65})],
  ['front-low-left', normalize({x:1,y:-0.30,z:0.45})],
  ['side-low', normalize({x:0.15,y:-0.25,z:1})],
  ['side', normalize({x:0,y:0,z:1})],
  ['rear-low', normalize({x:-1,y:-0.35,z:0})],
  ['rear-side-low', normalize({x:-0.55,y:-0.25,z:1})],
];

function contactOnlyAt(distance){
  const wd=b3.b3DefaultWorldDef();wd.gravity={x:0,y:0,z:0};wd.enableContinuous=false;
  const worldId=b3.b3CreateWorld(wd);b3.b3World_EnableSpeculative(worldId,true);
  try{
    const wheel=createMode5WheelForGeometry(MODE5_CORE_TORUS_GEOMETRY,b3,worldId,config,{x:0,y:0,z:0},-9821);
    const box={...ROCK,center:scale(distance,DIRECTION)};createStaticRock(worldId,box);
    b3.b3World_Step(worldId,1/60,4);
    return aggregateContacts(wheel.shapeIds);
  }finally{b3.b3DestroyWorld(worldId);}
}
function isSurfaceReached(contact){
  return contact.contacts>0 && contact.minSeparation!==null && contact.minSeparation<=TARGET_SEPARATION;
}
function findSurfaceOnset(){
  const support=Math.hypot(ROCK.halfExtents.x,ROCK.halfExtents.y,ROCK.halfExtents.z);
  let far=config.wheelRadius+support+0.10;
  let c=contactOnlyAt(far);
  if(c.contacts!==0){far+=0.25;c=contactOnlyAt(far);if(c.contacts!==0)throw new Error('far contact bracket failed');}

  // Find the first speculative manifold while moving inward.
  const coarse=0.035;
  let manifoldDistance=null;
  for(let d=far-coarse;d>=0.015;d-=coarse){
    c=contactOnlyAt(d);
    if(c.contacts>0){manifoldDistance=d;break;}
    far=d;
  }
  if(manifoldDistance===null)return null;

  // From manifold onset continue inward until the actual collider surface is reached.
  let surfaceNear=null;
  let surfaceContact=null;
  let surfaceFar=manifoldDistance;
  c=contactOnlyAt(surfaceFar);
  if(isSurfaceReached(c)){surfaceNear=surfaceFar;surfaceContact=c;}
  else{
    for(let d=surfaceFar-0.010;d>=0.005;d-=0.010){
      const next=contactOnlyAt(d);
      if(isSurfaceReached(next)){surfaceNear=d;surfaceContact=next;break;}
      surfaceFar=d;
    }
  }
  if(surfaceNear===null)return null;

  // Maximize distance while keeping separation <= 0.1 mm.
  for(let i=0;i<14;i++){
    const mid=0.5*(surfaceFar+surfaceNear);
    const next=contactOnlyAt(mid);
    if(isSurfaceReached(next)){surfaceNear=mid;surfaceContact=next;}else{surfaceFar=mid;}
  }
  const exact=isolatedAt(MODE5_CORE_TORUS_GEOMETRY,true,surfaceNear);
  return{
    surfaceDistance:surfaceNear,
    lastOutsideDistance:surfaceFar,
    visualGap:exact.visualGap,
    contact:exact.contact,
  };
}

const boxes=createE2rWorld().boxes;
const rocks=boxes.slice(9);
const rows=[];
for(let index=0;index<rocks.length;index++){
  const rock=rocks[index];
  if(!Array.isArray(rock.color) || Math.abs(rock.color[0]-0.35)>1e-9 || Math.abs(rock.color[1]-0.31)>1e-9 || Math.abs(rock.color[2]-0.26)>1e-9)continue;
  ROCK=rock;
  for(const [directionName,direction] of DIRECTIONS){
    DIRECTION=direction;
    const result=findSurfaceOnset();
    if(!result)continue;
    rows.push({
      rockIndex:index,
      worldBoxIndex:index+9,
      directionName,
      direction,
      halfExtents:rock.halfExtents,
      rotation:rock.rotation,
      surfaceDistance:result.surfaceDistance,
      visualGapMm:1000*result.visualGap,
      contactShapes:result.contact.contactShapes,
      contacts:result.contact.contacts,
      points:result.contact.points,
      minSeparationMm:result.contact.minSeparation===null?null:1000*result.contact.minSeparation,
    });
  }
}
const byGap=[...rows].sort((a,b)=>b.visualGapMm-a.visualGapMm);
const gapThresholds=[0.5,1,2,3,5,8,10,15,20].map(mm=>({mm,count:rows.filter(r=>r.visualGapMm>=mm).length}));
const summary={
  source:SOURCE,
  targetSeparationMm:TARGET_SEPARATION*1000,
  worldBoxCount:boxes.length,
  proceduralRockCount:new Set(rows.map(r=>r.rockIndex)).size,
  cases:rows.length,
  gapThresholds,
  maxVisualGapMm:byGap[0]?.visualGapMm??null,
  topGap:byGap.slice(0,30),
};
console.log('TORUS_SURFACE_MATRIX_RESULT',JSON.stringify(summary));
console.log('TORUS_SURFACE_MATRIX_OK');
`;

const tmp=new URL('./__tmp-wheel-mode5-torus-surface-matrix-run.mjs',import.meta.url);
await writeFile(tmp,text,'utf8');
try{
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[tmp.pathname],{stdio:'inherit'});
    child.on('exit',code=>code===0?resolve():reject(new Error(`surface matrix child failed ${code}`)));
  });
}finally{await unlink(tmp).catch(()=>{});}
