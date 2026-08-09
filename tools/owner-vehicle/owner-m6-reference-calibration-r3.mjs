import {
  mapPiecePrimitives,
  requireMarker,
} from './owner-m6-full-rig-calibration-r2.mjs';

const EPS = 1e-9;
export const OWNER_M6_R3_SCALE_METERS_PER_BU = 0.35;

function fail(message) {
  throw new Error(`Owner M6 R3 reference calibration rejected: ${message}`);
}
function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mul(a,k){return [a[0]*k,a[1]*k,a[2]*k];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function len(a){return Math.hypot(a[0],a[1],a[2]);}
function norm(a,label='vector'){const l=len(a);if(!(l>EPS))fail(`${label} is degenerate`);return mul(a,1/l);}
function midpoint(a,b){return mul(add(a,b),0.5);}
function distance(a,b){return len(sub(a,b));}
function determinantColumns(a,b,c){return dot(a,cross(b,c));}

function projectionRange(piece, origin, axis) {
  let min=Infinity,max=-Infinity;
  for(const primitive of piece.primitives){
    for(let i=0;i<primitive.positions.length;i+=3){
      const p=primitive.positions.slice(i,i+3);
      const value=dot(sub(p,origin),axis);
      min=Math.min(min,value);max=Math.max(max,value);
    }
  }
  if(!(Number.isFinite(min)&&Number.isFinite(max)&&max-min>EPS))fail(`piece ${piece.jointName} projection is degenerate`);
  return Object.freeze({min,max,length:max-min,center:(min+max)*0.5});
}

export function deriveFrontSuspensionReferencesR3(extracted) {
  const upperHinge=requireMarker(extracted,'Chassis_Top','front suspension reference');
  const lowerHinge=requireMarker(extracted,'Chassis_Bottom','front suspension reference');
  const upperOutboard=requireMarker(extracted,'Socket_ChassisMount_b','front suspension reference');
  const wheelCenter=requireMarker(extracted,'Socket_WheelCenter','front suspension reference');
  const travelTop=requireMarker(extracted,'Axis_SuspensionTravel_Top','front suspension reference');
  const travelBottom=requireMarker(extracted,'Axis_SuspensionTravel_Bottom','front suspension reference');
  const sourceUp=norm(sub(travelTop,travelBottom),'front authored suspension travel axis');
  const upperAxial=norm(sub(upperOutboard,upperHinge),'front authored upper arm axis');
  if(Math.abs(dot(sourceUp,upperAxial))>1e-6)fail('authored upper arm axis is not perpendicular to suspension travel axis');

  const hingeDelta=sub(lowerHinge,upperHinge);
  const lowerOutboard=add(upperOutboard,hingeDelta);
  const lowerAxial=norm(sub(lowerOutboard,lowerHinge),'front inferred lower arm axis');
  if(len(cross(upperAxial,lowerAxial))>1e-6)fail('authored upper/lower arm axes are not parallel');

  const sourceSpread=norm(cross(sourceUp,upperAxial),'front authored wishbone spread axis');
  const sourceBallMid=midpoint(upperOutboard,lowerOutboard);
  return Object.freeze({
    upperHinge:Object.freeze(upperHinge),
    lowerHinge:Object.freeze(lowerHinge),
    upperOutboard:Object.freeze(upperOutboard),
    lowerOutboard:Object.freeze(lowerOutboard),
    wheelCenter:Object.freeze(wheelCenter),
    sourceUp:Object.freeze(sourceUp),
    sourceAxial:Object.freeze(upperAxial),
    sourceSpread:Object.freeze(sourceSpread),
    provenance:Object.freeze({
      upperHinge:'AUTHORED_NODE:Chassis_Top',
      lowerHinge:'AUTHORED_NODE:Chassis_Bottom',
      upperOutboard:'AUTHORED_VISUAL_REFERENCE:Socket_ChassisMount_b',
      lowerOutboard:'INFERRED_PARALLEL_UPRIGHT_FROM_AUTHORED_UPPER_REFERENCE',
      wheelCenter:'AUTHORED_NODE:Socket_WheelCenter',
      sourceUp:'AUTHORED_AXIS:Axis_SuspensionTravel_Bottom->Top',
    }),
    sanity:Object.freeze({
      authoredKingpinOffsetBU:distance(sourceBallMid,wheelCenter),
      authoredKingpinOffsetMeters:distance(sourceBallMid,wheelCenter)*OWNER_M6_R3_SCALE_METERS_PER_BU,
      authoredUpperArmLengthBU:distance(upperHinge,upperOutboard),
      authoredLowerArmLengthBU:distance(lowerHinge,lowerOutboard),
    }),
  });
}

export function calibrateFrontWishbonePieceR3(piece,references,geometry,which) {
  if(which!=='upper'&&which!=='lower')fail(`unknown front wishbone kind ${which}`);
  const sourceHinge=which==='upper'?references.upperHinge:references.lowerHinge;
  const sourceOutboard=which==='upper'?references.upperOutboard:references.lowerOutboard;
  const targetHinge=which==='upper'?geometry.upperHinge:geometry.lowerHinge;
  const targetBall=which==='upper'?geometry.upperBall:geometry.lowerBall;
  const targetFront=which==='upper'?geometry.upperFront:geometry.lowerFront;
  const targetRear=which==='upper'?geometry.upperRear:geometry.lowerRear;

  const sourceAxial=norm(sub(sourceOutboard,sourceHinge),`${geometry.corner} ${which} source axial`);
  const sourceSpread=references.sourceSpread;
  const sourceUp=references.sourceUp;
  const targetAxial=norm(sub(targetBall,targetHinge),`${geometry.corner} ${which} target axial`);
  // Source +spread is the historical authored rearward direction after the -90deg vehicle yaw.
  const targetSpread=norm(sub(targetRear,targetFront),`${geometry.corner} ${which} target spread`);
  let targetUp=norm(cross(targetAxial,targetSpread),`${geometry.corner} ${which} target up`);
  if(targetUp[1]<0)targetUp=mul(targetUp,-1);

  const sourceAxialLength=distance(sourceHinge,sourceOutboard);
  const targetAxialLength=distance(targetHinge,targetBall);
  const spreadRange=projectionRange(piece,sourceHinge,sourceSpread);
  if(Math.abs(spreadRange.center)>1e-6)fail(`${geometry.corner} ${which} source wishbone spread is not centered on its authored hinge`);
  const targetSpreadLength=distance(targetFront,targetRear);
  const axialScale=targetAxialLength/sourceAxialLength;
  const spreadScale=targetSpreadLength/spreadRange.length;
  const thicknessScale=OWNER_M6_R3_SCALE_METERS_PER_BU;
  const targetDeterminant=determinantColumns(targetAxial,targetSpread,targetUp);
  if(Math.abs(Math.abs(targetDeterminant)-1)>1e-6)fail(`${geometry.corner} ${which} target basis is not orthonormal`);
  const reverseWinding=targetDeterminant<0;

  const point=(p)=>{
    const q=sub(p,sourceHinge);
    return add(
      add(mul(targetAxial,dot(q,sourceAxial)*axialScale),mul(targetSpread,dot(q,sourceSpread)*spreadScale)),
      mul(targetUp,dot(q,sourceUp)*thicknessScale),
    );
  };
  const normal=(n)=>add(
    add(mul(targetAxial,dot(n,sourceAxial)/axialScale),mul(targetSpread,dot(n,sourceSpread)/spreadScale)),
    mul(targetUp,dot(n,sourceUp)/thicknessScale),
  );
  const mappedHinge=point(sourceHinge);
  const mappedOutboard=point(sourceOutboard);
  const targetBallLocal=sub(targetBall,targetHinge);
  return Object.freeze({
    primitives:mapPiecePrimitives(piece,point,normal,reverseWinding),
    report:Object.freeze({
      mode:'AUTHORED_REFERENCE_TO_PHYSICAL_HARDPOINT_R3',
      sourceHinge:Object.freeze([...sourceHinge]),
      sourceOutboard:Object.freeze([...sourceOutboard]),
      sourceAxialLength,
      targetAxialLength,
      axialScale,
      sourceSpreadLength:spreadRange.length,
      targetSpreadLength,
      spreadScale,
      thicknessScale,
      mirrored:reverseWinding,
      mappedHinge:Object.freeze(mappedHinge),
      mappedOutboard:Object.freeze(mappedOutboard),
      targetBallLocal:Object.freeze(targetBallLocal),
      hingeErrorMeters:len(mappedHinge),
      outboardErrorMeters:distance(mappedOutboard,targetBallLocal),
      referenceAuthority:Object.freeze({
        hinge:which==='upper'?references.provenance.upperHinge:references.provenance.lowerHinge,
        outboard:which==='upper'?references.provenance.upperOutboard:references.provenance.lowerOutboard,
        physicalTarget:'M6_WISHBONE_HARDPOINT',
      }),
    }),
  });
}
