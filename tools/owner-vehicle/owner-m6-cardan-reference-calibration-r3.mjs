import {
  requireMarker,
  requirePiece,
} from './owner-m6-full-rig-calibration-r2.mjs';
import { M6_R1_CHASSIS_LOCAL_FROM_SOURCE } from './owner-m6-visual-calibration-r1.mjs';

const EPS = 1e-9;
const FACE_EPS = 1e-7;
const SOURCE_LATERAL_AXIS = Object.freeze([1, 0, 0]);
const SOURCE_SCALE_METERS_PER_BU = 0.35;

function fail(message) {
  throw new Error(`Owner M6 R3 cardan reference calibration rejected: ${message}`);
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

function pieceVertices(piece) {
  const points=[];
  for(const primitive of piece.primitives){
    for(let i=0;i<primitive.positions.length;i+=3){
      points.push(primitive.positions.slice(i,i+3));
    }
  }
  if(points.length===0)fail(`piece ${piece.jointName} has no vertices`);
  return points;
}

function extremeFace(piece,axis,mode,label) {
  const points=pieceVertices(piece);
  let projection=mode==='max'?-Infinity:Infinity;
  for(const point of points){
    const value=dot(point,axis);
    projection=mode==='max'?Math.max(projection,value):Math.min(projection,value);
  }
  const face=points.filter((point)=>Math.abs(dot(point,axis)-projection)<=FACE_EPS);
  if(face.length<4)fail(`${label} has fewer than four vertices (${face.length})`);
  const centroid=mul(face.reduce((sum,point)=>add(sum,point),[0,0,0]),1/face.length);
  return Object.freeze({
    projection,
    vertexCount:face.length,
    centroid:Object.freeze(centroid),
  });
}

function rotateQuaternion(rotation,value) {
  const q=[rotation[0],rotation[1],rotation[2]];
  const t=mul(cross(q,value),2);
  return add(value,add(mul(t,rotation[3]),cross(q,t)));
}

function chassisSourceToLocal(point) {
  const scaled=[
    point[0]*M6_R1_CHASSIS_LOCAL_FROM_SOURCE.scale[0],
    point[1]*M6_R1_CHASSIS_LOCAL_FROM_SOURCE.scale[1],
    point[2]*M6_R1_CHASSIS_LOCAL_FROM_SOURCE.scale[2],
  ];
  return add(
    M6_R1_CHASSIS_LOCAL_FROM_SOURCE.position,
    rotateQuaternion(M6_R1_CHASSIS_LOCAL_FROM_SOURCE.rotation,scaled),
  );
}

function buildKnucklePointMap(references,geometry,label) {
  const sourceWheelCenter=references.wheelCenter;
  const sourceKingpinMid=midpoint(references.upperOutboard,references.lowerOutboard);
  const sourceRadialVector=sub(sourceKingpinMid,sourceWheelCenter);
  const sourceKingpinHalf=mul(sub(references.upperOutboard,references.lowerOutboard),0.5);
  const sourceRadial=norm(sourceRadialVector,`${label} source radial`);
  const sourceKingpin=norm(sourceKingpinHalf,`${label} source kingpin`);
  const sourceLongitudinal=norm(cross(sourceRadial,sourceKingpin),`${label} source longitudinal`);

  const targetUpper=sub(geometry.upperBall,geometry.wheelCenter);
  const targetLower=sub(geometry.lowerBall,geometry.wheelCenter);
  const targetRadialVector=midpoint(targetUpper,targetLower);
  const targetKingpinHalf=mul(sub(targetUpper,targetLower),0.5);
  const targetLongitudinal=norm(sub(geometry.upperRear,geometry.upperFront),`${label} target longitudinal`);
  const radialColumn=mul(targetRadialVector,1/len(sourceRadialVector));
  const kingpinColumn=mul(targetKingpinHalf,1/len(sourceKingpinHalf));
  const longitudinalColumn=mul(targetLongitudinal,SOURCE_SCALE_METERS_PER_BU);

  return (point)=>{
    const q=sub(point,sourceWheelCenter);
    return add(
      add(mul(radialColumn,dot(q,sourceRadial)),mul(kingpinColumn,dot(q,sourceKingpin))),
      mul(longitudinalColumn,dot(q,sourceLongitudinal)),
    );
  };
}

function buildSuspensionChassisPointMap(references,geometry,label) {
  const sourceWheelCenter=references.wheelCenter;
  const sourceHingeMid=midpoint(references.upperHinge,references.lowerHinge);
  const sourceRadialVector=sub(sourceHingeMid,sourceWheelCenter);
  const sourceVerticalHalf=mul(sub(references.upperHinge,references.lowerHinge),0.5);
  const sourceRadial=norm(sourceRadialVector,`${label} source chassis radial`);
  const sourceVertical=norm(sourceVerticalHalf,`${label} source chassis vertical`);
  const sourceLongitudinal=norm(cross(sourceRadial,sourceVertical),`${label} source chassis longitudinal`);

  const targetHingeMid=midpoint(geometry.upperHinge,geometry.lowerHinge);
  const targetRadialVector=sub(targetHingeMid,geometry.wheelCenter);
  const targetVerticalHalf=mul(sub(geometry.upperHinge,geometry.lowerHinge),0.5);
  const targetLongitudinal=norm(sub(geometry.upperRear,geometry.upperFront),`${label} target chassis longitudinal`);
  const radialColumn=mul(targetRadialVector,1/len(sourceRadialVector));
  const verticalColumn=mul(targetVerticalHalf,1/len(sourceVerticalHalf));
  const longitudinalColumn=mul(targetLongitudinal,SOURCE_SCALE_METERS_PER_BU);

  return (point)=>{
    const q=sub(point,sourceWheelCenter);
    return add(
      geometry.wheelCenter,
      add(
        add(mul(radialColumn,dot(q,sourceRadial)),mul(verticalColumn,dot(q,sourceVertical))),
        mul(longitudinalColumn,dot(q,sourceLongitudinal)),
      ),
    );
  };
}

export function deriveChassisDifferentialOutputsR3(chassis) {
  const axles={
    front:{pieceName:'Diferential_F'},
    rear:{pieceName:'Diferential_B'},
  };
  const result={};
  for(const [axle,entry] of Object.entries(axles)){
    const piece=requirePiece(chassis,entry.pieceName,`${axle} differential`);
    const leftFace=extremeFace(piece,SOURCE_LATERAL_AXIS,'min',`${axle} differential left output face`);
    const rightFace=extremeFace(piece,SOURCE_LATERAL_AXIS,'max',`${axle} differential right output face`);
    if(leftFace.vertexCount!==rightFace.vertexCount){
      fail(`${axle} differential output face vertex counts differ (${leftFace.vertexCount} vs ${rightFace.vertexCount})`);
    }
    if(Math.abs(leftFace.centroid[1]-rightFace.centroid[1])>1e-8||Math.abs(leftFace.centroid[2]-rightFace.centroid[2])>1e-8){
      fail(`${axle} differential output faces are not coaxial in source space`);
    }
    const leftLocal=chassisSourceToLocal(leftFace.centroid);
    const rightLocal=chassisSourceToLocal(rightFace.centroid);
    if(!(leftLocal[2]<0&&rightLocal[2]>0)){
      fail(`${axle} differential source lateral faces do not map to vehicle left/right`);
    }
    result[axle]=Object.freeze({
      pieceName:entry.pieceName,
      left:Object.freeze({sourceFace:leftFace,chassisLocal:Object.freeze(leftLocal)}),
      right:Object.freeze({sourceFace:rightFace,chassisLocal:Object.freeze(rightLocal)}),
      widthMeters:distance(leftLocal,rightLocal),
      centerChassisLocal:Object.freeze(midpoint(leftLocal,rightLocal)),
      authority:'GEOMETRY_DERIVED_DIFFERENTIAL_OUTPUT_FACE',
    });
  }
  return Object.freeze(result);
}

export function calibrateCardanEndpointsR3({
  chassis,
  suspension,
  references,
  geometry,
  corner,
}) {
  const differentialOutputs=deriveChassisDifferentialOutputsR3(chassis);
  const axle=corner.startsWith('f')?'front':'rear';
  const side=corner.endsWith('l')?'left':'right';
  const start=differentialOutputs[axle][side].chassisLocal;
  const sourceHub=requireMarker(suspension,'Socket_CardanHub',`${corner} cardan hub`);
  const sourceDrive=requireMarker(suspension,'Socket_CardanDrive',`${corner} historical cardan drive`);
  const mapKnuckle=buildKnucklePointMap(references,geometry,`${corner} cardan hub`);
  const mapSuspensionChassis=buildSuspensionChassisPointMap(references,geometry,`${corner} historical cardan drive`);
  const endKnuckleLocal=mapKnuckle(sourceHub);
  const endRestWorld=add(geometry.wheelCenter,endKnuckleLocal);
  const historicalDriveChassisLocal=mapSuspensionChassis(sourceDrive);
  const mismatch=distance(historicalDriveChassisLocal,start);
  if(!(mismatch>0.20)){
    fail(`${corner} historical Socket_CardanDrive unexpectedly agrees with differential output (${mismatch} m)`);
  }
  const restLength=distance(start,endRestWorld);
  if(!(restLength>0.5&&restLength<1.0)){
    fail(`${corner} differential-to-hub rest shaft length is implausible (${restLength} m)`);
  }
  return Object.freeze({
    startPartId:'m6.chassis',
    startLocalPosition:Object.freeze([...start]),
    endPartId:`m6.${corner}.knuckle`,
    endLocalPosition:Object.freeze(endKnuckleLocal),
    report:Object.freeze({
      mode:'DIFFERENTIAL_OUTPUT_FACE_TO_AUTHORED_HUB_R3',
      axle,
      side,
      differentialPiece:differentialOutputs[axle].pieceName,
      differentialOutputAuthority:differentialOutputs[axle].authority,
      differentialOutputFaceVertexCount:differentialOutputs[axle][side].sourceFace.vertexCount,
      differentialWidthMeters:differentialOutputs[axle].widthMeters,
      sourceHub:Object.freeze([...sourceHub]),
      hubAuthority:'AUTHORED_NODE:Socket_CardanHub',
      hubInboardFromWheelCenterMeters:len(endKnuckleLocal),
      restLengthMeters:restLength,
      historicalDriveSocket:Object.freeze([...sourceDrive]),
      historicalDriveChassisLocal:Object.freeze(historicalDriveChassisLocal),
      historicalDriveMismatchMeters:mismatch,
      historicalDriveAuthority:'REJECTED_AS_FINAL_ENDPOINT_BY_DIFFERENTIAL_GEOMETRY',
      physicsAuthority:'VISUAL_ONLY_NO_TORQUE_TRANSFER',
    }),
  });
}

export function replaceCardanBindingSourcesR3(bindings,endpointsByCorner) {
  const byId=new Map(bindings.map((binding)=>[binding.bindingId,binding]));
  for(const corner of ['fl','fr','rl','rr']){
    const endpoints=endpointsByCorner[corner];
    if(!endpoints)fail(`missing calibrated cardan endpoints for ${corner}`);
    const pairBase={
      startPartId:endpoints.startPartId,
      startLocalPosition:endpoints.startLocalPosition,
      endPartId:endpoints.endPartId,
      endLocalPosition:endpoints.endLocalPosition,
    };
    const driveId=`owner.${corner}.cardan.drive-end`;
    const midId=`owner.${corner}.cardan.mid`;
    const hubId=`owner.${corner}.cardan.hub-end`;
    const drive=byId.get(driveId),mid=byId.get(midId),hub=byId.get(hubId);
    if(!drive||!mid||!hub)fail(`missing R3 cardan binding triplet for ${corner}`);
    const referenceLengthMeters=mid.source.referenceLengthMeters;
    if(!(referenceLengthMeters>0))fail(`missing cardan reference length for ${corner}`);
    byId.set(driveId,{...drive,source:{kind:'PART_PAIR_ENDPOINT_AIM',...pairBase,endpoint:'START',axis:'-X'}});
    byId.set(midId,{...mid,source:{kind:'PART_PAIR_STRETCH',...pairBase,axis:'-X',referenceLengthMeters}});
    byId.set(hubId,{...hub,source:{kind:'PART_PAIR_ENDPOINT_AIM',...pairBase,endpoint:'END',axis:'+X'}});
  }
  return bindings.map((binding)=>byId.get(binding.bindingId));
}
