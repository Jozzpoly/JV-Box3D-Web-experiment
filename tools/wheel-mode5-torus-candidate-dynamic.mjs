import { readFile, writeFile, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const source = await readFile(new URL('./wheel-mode5-d-exact-falsifier.mjs', import.meta.url), 'utf8');
const rockStartToken='const ROCK = Object.freeze({';
const directionStartToken='const DIRECTION = Object.freeze({';
const historicalStartToken='const HISTORICAL_C_ONSET';
const cutToken='const cOn=findOuterOnset';
const rockStart=source.indexOf(rockStartToken);
const directionStart=source.indexOf(directionStartToken,rockStart);
const historicalStart=source.indexOf(historicalStartToken,directionStart);
const cut=source.indexOf(cutToken,historicalStart);
if(rockStart<0||directionStart<0||historicalStart<0||cut<0)throw new Error('exact falsifier anchors drifted');

const label=process.env.JV_TORUS_LABEL ?? 'candidate';
const ratio=Number(process.env.JV_TORUS_RATIO);
const rock=JSON.parse(process.env.JV_TORUS_ROCK_JSON ?? 'null');
const direction=JSON.parse(process.env.JV_TORUS_DIRECTION_JSON ?? 'null');
if(!Number.isFinite(ratio)||!rock||!direction)throw new Error('candidate env missing');
const directionLength=Math.hypot(direction.x,direction.y,direction.z);
if(Math.abs(directionLength-1)>1e-6)throw new Error(`direction must be normalized, got ${directionLength}`);

let text=source.slice(0,rockStart);
text+=`const ROCK = Object.freeze(${JSON.stringify(rock)});\n`;
text+=`const DIRECTION = Object.freeze(${JSON.stringify(direction)});\n`;
text+=source.slice(historicalStart,cut);
text+=String.raw`
if(typeof b3.b3Body_SetLinearVelocity!=='function'||typeof b3.b3Body_GetLinearVelocity!=='function')throw new Error('velocity API missing');
function projection(v){return v.x*DIRECTION.x+v.y*DIRECTION.y+v.z*DIRECTION.z;}
function dynamicCandidate(speculative,speed){
  const wd=b3.b3DefaultWorldDef();wd.gravity={x:0,y:0,z:0};wd.enableContinuous=false;
  const worldId=b3.b3CreateWorld(wd);b3.b3World_EnableSpeculative(worldId,speculative);
  try{
    const wheel=createMode5WheelForGeometry(MODE5_CORE_TORUS_GEOMETRY,b3,worldId,config,{x:0,y:0,z:0},-9911);
    const initialDistance=0.95;
    const box={...ROCK,center:scale(initialDistance,DIRECTION)};createStaticRock(worldId,box);
    b3.b3Body_SetLinearVelocity(wheel.bodyId,scale(speed,DIRECTION));
    const dt=1/960;
    let firstContact=null,firstImpulse=null;
    for(let step=0;step<2600;step++){
      const gapBefore=exactVisualGap(wheel.bodyId,box);
      const velocityBefore={...b3.b3Body_GetLinearVelocity(wheel.bodyId)};
      const positionBefore={...b3.b3Body_GetPosition(wheel.bodyId)};
      b3.b3World_Step(worldId,dt,4);
      const contact=aggregateContacts(wheel.shapeIds);
      const gapAfter=exactVisualGap(wheel.bodyId,box);
      const velocityAfter={...b3.b3Body_GetLinearVelocity(wheel.bodyId)};
      const sample={step,time:(step+1)*dt,gapBefore,gapAfter,positionBefore,velocityBefore,velocityAfter,contact};
      if(contact.contacts>0&&!firstContact)firstContact=sample;
      if(contact.maxNormalImpulse>1e-8&&!firstImpulse)firstImpulse=sample;
      if(firstImpulse&&step>firstImpulse.step+2)break;
      if(projection(positionBefore)>initialDistance+0.20)break;
    }
    return{
      speculative,speed,firstContact,firstImpulse,
      visualGapBeforeFirstImpulse:firstImpulse?.gapBefore??null,
      visualGapAfterFirstImpulse:firstImpulse?.gapAfter??null,
      receipt:{backendId:wheel.backendId,shapeCount:wheel.shapeCount,rollingShapeIdIsNull:wheel.rollingShapeId===null,torusCrownRadius:wheel.torusCrownRadius,torusRingRadius:wheel.torusRingRadius,torusCapsuleHalfLength:wheel.torusCapsuleHalfLength},
    };
  }finally{b3.b3DestroyWorld(worldId);}
}
const staticOnset=findOuterOnset(MODE5_CORE_TORUS_GEOMETRY,true);
const results=[];
for(const speed of [0.5,1,2,5])results.push(dynamicCandidate(true,speed));
results.push(dynamicCandidate(false,2));
console.log('TORUS_CANDIDATE_DYNAMIC_RESULT',JSON.stringify({label:${JSON.stringify(label)},ratio:${ratio},rock:ROCK,direction:DIRECTION,staticOnset,results}));
console.log('TORUS_CANDIDATE_DYNAMIC_OK');
`;

const tmp=new URL('./__tmp-wheel-mode5-torus-candidate-dynamic-run.mjs',import.meta.url);
await writeFile(tmp,text,'utf8');
try{
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[tmp.pathname],{stdio:'inherit'});child.on('exit',code=>code===0?resolve():reject(new Error(`candidate dynamic child failed ${code}`)));});
}finally{await unlink(tmp).catch(()=>{});}
