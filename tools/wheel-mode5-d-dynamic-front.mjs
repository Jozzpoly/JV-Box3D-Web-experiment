import { readFile, writeFile, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const source = await readFile(new URL('./wheel-mode5-d-exact-falsifier.mjs', import.meta.url), 'utf8');
const startToken = 'const DIRECTION = Object.freeze({';
const endToken = 'const HISTORICAL_C_ONSET';
const cutToken = 'const cOn=findOuterOnset';
const start = source.indexOf(startToken);
const end = source.indexOf(endToken);
const cut = source.indexOf(cutToken);
if (start < 0 || end < 0 || cut < 0 || !(start < end && end < cut)) throw new Error('exact falsifier anchors drifted');

// Front/tread is the exact-rock direction with the largest remaining D visual gap.
let text = source.slice(0, start) + 'const DIRECTION = Object.freeze({x:1,y:0,z:0});\n' + source.slice(end, cut);
text += String.raw`
if (typeof b3.b3Body_SetLinearVelocity !== 'function' || typeof b3.b3Body_GetLinearVelocity !== 'function') {
  const candidates = Object.keys(b3).filter(k => /LinearVelocity|Velocity/.test(k)).sort();
  throw new Error('runtime lacks body velocity API: ' + JSON.stringify(candidates));
}

function clone3(v){return{x:v.x,y:v.y,z:v.z};}
function dynamicRun(geometry, speculative, speed) {
  const wd=b3.b3DefaultWorldDef();wd.gravity={x:0,y:0,z:0};wd.enableContinuous=false;
  const worldId=b3.b3CreateWorld(wd);b3.b3World_EnableSpeculative(worldId,speculative);
  try {
    const wheel=createMode5WheelForGeometry(geometry,b3,worldId,config,{x:0,y:0,z:0},-9701);
    const box={...ROCK,center:{x:0.70,y:0,z:0}};
    createStaticRock(worldId,box);
    b3.b3Body_SetLinearVelocity(wheel.bodyId,{x:speed,y:0,z:0});
    const dt=1/480;
    let firstContact=null,firstImpulse=null;
    const samples=[];
    for(let step=0;step<1000;step++){
      const gapBefore=exactVisualGap(wheel.bodyId,box);
      const velocityBefore=clone3(b3.b3Body_GetLinearVelocity(wheel.bodyId));
      const positionBefore=clone3(b3.b3Body_GetPosition(wheel.bodyId));
      b3.b3World_Step(worldId,dt,4);
      const contact=aggregateContacts(wheel.shapeIds);
      const gapAfter=exactVisualGap(wheel.bodyId,box);
      const velocityAfter=clone3(b3.b3Body_GetLinearVelocity(wheel.bodyId));
      const sample={step,time:(step+1)*dt,gapBefore,gapAfter,positionBefore,velocityBefore,velocityAfter,contact};
      if(contact.contacts>0&&!firstContact)firstContact=sample;
      if(contact.maxNormalImpulse>1e-8&&!firstImpulse)firstImpulse=sample;
      if(contact.contacts>0||gapBefore<0.03)samples.push(sample);
      if(firstImpulse&&step>firstImpulse.step+8)break;
      if(positionBefore.x>0.25)break;
    }
    return{geometry,speculative,speed,firstContact,firstImpulse,samples:samples.slice(-24),receipt:{backendId:wheel.backendId,shapeCount:wheel.shapeCount,rollingShapeIdIsNull:wheel.rollingShapeId===null}};
  } finally { b3.b3DestroyWorld(worldId); }
}

const results=[];
for(const geometry of [MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,MODE5_CORE_TORUS_GEOMETRY]){
  for(const speculative of [true,false]){
    for(const speed of [0.5,1,2,5]) results.push(dynamicRun(geometry,speculative,speed));
  }
}
console.log('D_DYNAMIC_FRONT_RESULT',JSON.stringify(results));
console.log('D_DYNAMIC_FRONT_OK');
`;

const tmp = new URL('./__tmp-wheel-mode5-d-dynamic-front-run.mjs', import.meta.url);
await writeFile(tmp,text,'utf8');
try{
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[tmp.pathname],{stdio:'inherit'});
    child.on('exit',code=>code===0?resolve():reject(new Error(`dynamic child failed ${code}`)));
  });
} finally { await unlink(tmp).catch(()=>{}); }
