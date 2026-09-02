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
    const wheel=createMode5WheelForGeometry(MODE5_CORE_TORUS_GEOMETRY,b3,worldId,config,{x:0,y:0,z:0},-9801);
    const box={...ROCK,center:scale(distance,DIRECTION)};createStaticRock(worldId,box);
    b3.b3World_Step(worldId,1/60,4);
    return aggregateContacts(wheel.shapeIds);
  }finally{b3.b3DestroyWorld(worldId);}
}

function findFastD(){
  const support=Math.hypot(ROCK.halfExtents.x,ROCK.halfExtents.y,ROCK.halfExtents.z);
  let far=config.wheelRadius+support+0.10;
  let farContact=contactOnlyAt(far);
  if(farContact.contacts!==0){
    far+=0.25;
    farContact=contactOnlyAt(far);
    if(farContact.contacts!==0)throw new Error('far contact bracket failed');
  }
  let near=null;
  let nearContact=null;
  const step=0.035;
  for(let d=far-step;d>=0.015;d-=step){
    const c=contactOnlyAt(d);
    if(c.contacts>0){near=d;nearContact=c;break;}
    far=d;
  }
  if(near===null)return null;
  for(let i=0;i<13;i++){
    const mid=0.5*(far+near),c=contactOnlyAt(mid);
    if(c.contacts>0){near=mid;nearContact=c;}else{far=mid;}
  }
  const exact=isolatedAt(MODE5_CORE_TORUS_GEOMETRY,true,near);
  return{onsetDistance:near,visualGap:exact.visualGap,contact:exact.contact,lastFreeDistance:far};
}

const boxes=createE2rWorld().boxes;
const rocks=boxes.slice(9);
const rows=[];
for(let index=0;index<rocks.length;index++){
  const rock=rocks[index];
  // Keep only the brown procedural rock family. The legacy world slice also
  // contains other finite box obstacles; color identity makes this explicit.
  if(!Array.isArray(rock.color) || Math.abs(rock.color[0]-0.35)>1e-9 || Math.abs(rock.color[1]-0.31)>1e-9 || Math.abs(rock.color[2]-0.26)>1e-9)continue;
  ROCK=rock;
  for(const [directionName,direction] of DIRECTIONS){
    DIRECTION=direction;
    const result=findFastD();
    if(!result)continue;
    rows.push({
      rockIndex:index,
      worldBoxIndex:index+9,
      directionName,
      direction,
      halfExtents:rock.halfExtents,
      rotation:rock.rotation,
      onsetDistance:result.onsetDistance,
      visualGapMm:1000*result.visualGap,
      contactShapes:result.contact.contactShapes,
      contacts:result.contact.contacts,
      points:result.contact.points,
      minSeparationMm:result.contact.minSeparation===null?null:1000*result.contact.minSeparation,
    });
  }
}

const byGap=[...rows].sort((a,b)=>b.visualGapMm-a.visualGapMm);
const byMultiplicity=[...rows].sort((a,b)=>b.contactShapes-a.contactShapes || b.visualGapMm-a.visualGapMm);
const gapThresholds=[1,3,5,10,20,40].map(mm=>({mm,count:rows.filter(r=>r.visualGapMm>=mm).length}));
const multiplicityCounts={};
for(const row of rows)multiplicityCounts[row.contactShapes]=(multiplicityCounts[row.contactShapes]??0)+1;
const summary={
  source:SOURCE,
  worldBoxCount:boxes.length,
  proceduralRockCount:new Set(rows.map(r=>r.rockIndex)).size,
  cases:rows.length,
  gapThresholds,
  multiplicityCounts,
  maxVisualGapMm:byGap[0]?.visualGapMm??null,
  maxContactShapes:byMultiplicity[0]?.contactShapes??null,
  topGap:byGap.slice(0,30),
  topMultiplicity:byMultiplicity.slice(0,30),
};
console.log('D_REAL_ROCK_MATRIX_RESULT',JSON.stringify(summary));
console.log('D_REAL_ROCK_MATRIX_OK');
`;

const tmp=new URL('./__tmp-wheel-mode5-d-real-rock-matrix-run.mjs',import.meta.url);
await writeFile(tmp,text,'utf8');
try{
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[tmp.pathname],{stdio:'inherit'});
    child.on('exit',code=>code===0?resolve():reject(new Error(`matrix child failed ${code}`)));
  });
}finally{await unlink(tmp).catch(()=>{});}
