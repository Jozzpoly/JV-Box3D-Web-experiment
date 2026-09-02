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

// Worst exact R3 gap from the 401-rock / 3208-case D matrix run 33695584702.
const rock={
  halfExtents:{x:0.17784966867017035,y:0.1592311117453275,z:0.2748915311249766},
  rotation:{x:-0.020211092372999603,y:-0.21002645253430952,z:0.004342673498051548,w:-0.9774771312761403},
  friction:1,
};
const direction={x:0,y:0,z:1};
let text=source.slice(0,rockStart);
text+=`const ROCK = Object.freeze(${JSON.stringify(rock)});\n`;
text+=`const DIRECTION = Object.freeze(${JSON.stringify(direction)});\n`;
text+=source.slice(historicalStart,cut);
text+=String.raw`
if(typeof b3.b3Body_SetLinearVelocity!=='function'||typeof b3.b3Body_GetLinearVelocity!=='function')throw new Error('velocity API missing');

function dynamicWorst(speculative,speed){
  const wd=b3.b3DefaultWorldDef();wd.gravity={x:0,y:0,z:0};wd.enableContinuous=false;
  const worldId=b3.b3CreateWorld(wd);b3.b3World_EnableSpeculative(worldId,speculative);
  try{
    const wheel=createMode5WheelForGeometry(MODE5_CORE_TORUS_GEOMETRY,b3,worldId,config,{x:0,y:0,z:0},-9901);
    const initialDistance=0.85;
    const box={...ROCK,center:scale(initialDistance,DIRECTION)};createStaticRock(worldId,box);
    b3.b3Body_SetLinearVelocity(wheel.bodyId,scale(speed,DIRECTION));
    const dt=1/960;
    let firstContact=null,firstImpulse=null,minPositiveGapAtImpulse=null;
    const samples=[];
    for(let step=0;step<1800;step++){
      const gapBefore=exactVisualGap(wheel.bodyId,box);
      const velocityBefore={...b3.b3Body_GetLinearVelocity(wheel.bodyId)};
      const positionBefore={...b3.b3Body_GetPosition(wheel.bodyId)};
      b3.b3World_Step(worldId,dt,4);
      const contact=aggregateContacts(wheel.shapeIds);
      const gapAfter=exactVisualGap(wheel.bodyId,box);
      const velocityAfter={...b3.b3Body_GetLinearVelocity(wheel.bodyId)};
      const sample={step,time:(step+1)*dt,gapBefore,gapAfter,positionBefore,velocityBefore,velocityAfter,contact};
      if(contact.contacts>0&&!firstContact)firstContact=sample;
      if(contact.maxNormalImpulse>1e-8&&!firstImpulse){firstImpulse=sample;minPositiveGapAtImpulse=Math.max(gapBefore,gapAfter);}
      if(contact.contacts>0||gapBefore<0.060)samples.push(sample);
      if(firstImpulse&&step>firstImpulse.step+10)break;
      if(positionBefore.z>0.70)break;
    }
    return{speculative,speed,firstContact,firstImpulse,visualGapAtFirstImpulse:minPositiveGapAtImpulse,samples:samples.slice(-30),receipt:{backendId:wheel.backendId,shapeCount:wheel.shapeCount,rollingShapeIdIsNull:wheel.rollingShapeId===null}};
  }finally{b3.b3DestroyWorld(worldId);}
}

const staticOn=findOuterOnset(MODE5_CORE_TORUS_GEOMETRY,true);
const results=[];
for(const speculative of [true,false])for(const speed of [0.5,1,2,5])results.push(dynamicWorst(speculative,speed));
console.log('D_WORST_ROCK_DYNAMIC_RESULT',JSON.stringify({
  source:SOURCE,rock:ROCK,direction:DIRECTION,staticOnset:staticOn,results,
}));
console.log('D_WORST_ROCK_DYNAMIC_OK');
`;

const tmp=new URL('./__tmp-wheel-mode5-d-worst-rock-dynamic-run.mjs',import.meta.url);
await writeFile(tmp,text,'utf8');
try{
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[tmp.pathname],{stdio:'inherit'});child.on('exit',code=>code===0?resolve():reject(new Error(`dynamic child failed ${code}`)));});
}finally{await unlink(tmp).catch(()=>{});}
