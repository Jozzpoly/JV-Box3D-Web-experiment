import { readFile } from 'node:fs/promises';
import { validatePinnedNativeFactoryReceiptText } from '../.test-dist/config/native-factory-receipt.js';
import { Box3DBoundary, configureBox3DRuntimeVariant } from '../.test-dist/physics/box3d-boundary.js';
import { MODE5_WHEEL_GEOMETRY_VARIANT } from '../.test-dist/vehicle/m6/mode5-wheel-backend.js';

const label=process.env.JV_COAST_LABEL??'unknown';
const expectedGeometry=process.env.JV_EXPECTED_GEOMETRY??null;
if(expectedGeometry!==null&&MODE5_WHEEL_GEOMETRY_VARIANT!==expectedGeometry){
  throw new Error(`compiled geometry mismatch for ${label}: expected ${expectedGeometry}, got ${MODE5_WHEEL_GEOMETRY_VARIANT}`);
}
const receipt=await validatePinnedNativeFactoryReceiptText(await readFile(new URL('../public/receipts/jv_m6_factory_receipt.json',import.meta.url),'utf8'));
configureBox3DRuntimeVariant('mode5-experiment');
const boundary=await Box3DBoundary.load();

function mean(values){return values.reduce((a,b)=>a+b,0)/values.length;}
function sampleAt(frames,index){
  const frame=frames[Math.min(index,frames.length-1)];
  return frame?{stepOffset:index,speed:frame.drive.forwardSpeedMetersPerSecond,contacts:frame.worldContacts,chassisY:frame.chassisPosition.y}:null;
}

const world=boundary.createM6TopologyWorld(receipt);
try{
  const vehicle=world.createVehicle({x:0,y:1.2,z:0},41);
  world.step(360);
  vehicle.setDrive({throttle:0.35,brake:0});
  let launchSteps=0;
  let frame=null;
  while(launchSteps<1800){
    frame=world.step(1)[0];
    launchSteps+=1;
    if(frame.drive.forwardSpeedMetersPerSecond>=4.0)break;
  }
  if(!frame||frame.drive.forwardSpeedMetersPerSecond<4.0){
    throw new Error(`${label} failed to reach matched coast speed: ${frame?.drive.forwardSpeedMetersPerSecond}`);
  }
  const preCoast={speed:frame.drive.forwardSpeedMetersPerSecond,position:{...frame.chassisPosition},contacts:frame.worldContacts,launchSteps};
  vehicle.setDrive({throttle:0,brake:0});
  const coast=[];
  for(let i=0;i<600;i++)coast.push(world.step(1)[0]);
  if(coast.some(f=>!f||f.drive.mode!=='COAST'))throw new Error(`${label} coast mode not held`);
  const start=coast[0];
  const end=coast.at(-1);
  const speeds=coast.map(f=>f.drive.forwardSpeedMetersPerSecond);
  const contacts=coast.map(f=>f.worldContacts);
  const spinAbs=coast.map(f=>mean(f.corners.map(c=>Math.abs(c.wheelSpinSpeed))));
  const distance=Math.hypot(end.chassisPosition.x-start.chassisPosition.x,end.chassisPosition.z-start.chassisPosition.z);
  const thresholds={};
  for(const fraction of [0.9,0.75,0.5,0.25]){
    const target=start.drive.forwardSpeedMetersPerSecond*fraction;
    const index=speeds.findIndex(speed=>speed<=target);
    thresholds[String(fraction)]={targetSpeed:target,step:index<0?null:index,timeSeconds:index<0?null:(index+1)/60};
  }
  const result={
    label,
    compiledGeometry:MODE5_WHEEL_GEOMETRY_VARIANT,
    preCoast,
    coastStartSpeed:start.drive.forwardSpeedMetersPerSecond,
    coastEndSpeed:end.drive.forwardSpeedMetersPerSecond,
    speedLoss:start.drive.forwardSpeedMetersPerSecond-end.drive.forwardSpeedMetersPerSecond,
    speedRetention:end.drive.forwardSpeedMetersPerSecond/start.drive.forwardSpeedMetersPerSecond,
    distanceMeters:distance,
    meanContacts:mean(contacts),
    minContacts:Math.min(...contacts),
    maxContacts:Math.max(...contacts),
    meanWheelSpinAbsStart:mean(spinAbs.slice(0,30)),
    meanWheelSpinAbsEnd:mean(spinAbs.slice(-30)),
    thresholds,
    samples:{
      s0:sampleAt(coast,0),
      s1:sampleAt(coast,59),
      s2:sampleAt(coast,119),
      s4:sampleAt(coast,239),
      s6:sampleAt(coast,359),
      s8:sampleAt(coast,479),
      s10:sampleAt(coast,599),
    },
  };
  console.log('M6_COASTDOWN_RESULT',JSON.stringify(result));
  console.log('M6_COASTDOWN_OK');
}finally{world.dispose();}
