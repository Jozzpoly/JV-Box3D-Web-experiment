import {
  mapPiecePrimitives,
  requireMarker,
  requirePiece,
} from './owner-m6-full-rig-calibration-r2.mjs';
import {
  OWNER_M6_R3_SCALE_METERS_PER_BU,
  calibrateFrontChassisPieceR3,
  calibrateFrontKnucklePieceR3,
} from './owner-m6-reference-calibration-r3.mjs';

const EPS = 1e-9;
const FACE_EPS = 1e-8;

function fail(message) {
  throw new Error(`Owner M6 R3 rear reference calibration rejected: ${message}`);
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
  if(face.length<3)fail(`${label} has fewer than three vertices (${face.length})`);
  const centroid=mul(face.reduce((sum,point)=>add(sum,point),[0,0,0]),1/face.length);
  return Object.freeze({
    projection,
    vertexCount:face.length,
    centroid:Object.freeze(centroid),
    points:Object.freeze(face.map((point)=>Object.freeze(point))),
  });
}

function faceSpread(face,origin,axis,label) {
  let min=Infinity,max=-Infinity;
  for(const point of face.points){
    const value=dot(sub(point,origin),axis);
    min=Math.min(min,value);max=Math.max(max,value);
  }
  if(!(max-min>EPS))fail(`${label} spread is degenerate`);
  return Object.freeze({min,max,length:max-min,center:(min+max)*0.5});
}

export function deriveRearSuspensionReferencesR3(extracted) {
  const upperHinge=requireMarker(extracted,'Chassis_Top','rear suspension reference');
  const lowerHinge=requireMarker(extracted,'Chassis_Bottom','rear suspension reference');
  const wheelCenter=requireMarker(extracted,'Socket_WheelCenter','rear suspension reference');
  const travelTop=requireMarker(extracted,'Axis_SuspensionTravel_Top','rear suspension reference');
  const travelBottom=requireMarker(extracted,'Axis_SuspensionTravel_Bottom','rear suspension reference');
  const upperPiece=requirePiece(extracted,'Chassis_Top','rear upper wishbone reference');
  const lowerPiece=requirePiece(extracted,'Chassis_Bottom','rear lower wishbone reference');
  const hubPiece=requirePiece(extracted,'Socket_WheelCenter','rear hub reference');

  const sourceUp=norm(sub(travelTop,travelBottom),'rear authored suspension travel axis');
  const hingeMid=midpoint(upperHinge,lowerHinge);
  const sourceAxial=norm(sub(wheelCenter,hingeMid),'rear authored radial/arm axis');
  if(Math.abs(dot(sourceUp,sourceAxial))>1e-6)fail('rear authored radial axis is not perpendicular to suspension travel axis');
  const sourceSpread=norm(cross(sourceUp,sourceAxial),'rear authored wishbone spread axis');

  const upperArmFace=extremeFace(upperPiece,sourceAxial,'max','rear upper arm outboard mating face');
  const lowerArmFace=extremeFace(lowerPiece,sourceAxial,'max','rear lower arm outboard mating face');
  const hubInboardFace=extremeFace(hubPiece,sourceAxial,'min','rear hub inboard mating face');
  const upperInboardFace=extremeFace(upperPiece,sourceAxial,'min','rear upper chassis mounting face');
  const lowerInboardFace=extremeFace(lowerPiece,sourceAxial,'min','rear lower chassis mounting face');

  const matingProjection=(upperArmFace.projection+hubInboardFace.projection)*0.5;
  const lowerMatingProjection=(lowerArmFace.projection+hubInboardFace.projection)*0.5;
  const upperOutboard=add(
    upperArmFace.centroid,
    mul(sourceAxial,matingProjection-upperArmFace.projection),
  );
  const lowerOutboard=add(
    lowerArmFace.centroid,
    mul(sourceAxial,lowerMatingProjection-lowerArmFace.projection),
  );

  const upperTransverseError=Math.hypot(
    dot(sub(upperArmFace.centroid,upperHinge),sourceUp),
    dot(sub(upperArmFace.centroid,upperHinge),sourceSpread),
  );
  const lowerTransverseError=Math.hypot(
    dot(sub(lowerArmFace.centroid,lowerHinge),sourceUp),
    dot(sub(lowerArmFace.centroid,lowerHinge),sourceSpread),
  );
  if(upperTransverseError>1e-8||lowerTransverseError>1e-8){
    fail(`rear arm mating faces are not centered on authored hinges (${upperTransverseError}, ${lowerTransverseError})`);
  }

  const upperSpread=faceSpread(upperInboardFace,upperHinge,sourceSpread,'rear upper chassis mounting face');
  const lowerSpread=faceSpread(lowerInboardFace,lowerHinge,sourceSpread,'rear lower chassis mounting face');
  if(Math.abs(upperSpread.center)>1e-8||Math.abs(lowerSpread.center)>1e-8){
    fail(`rear chassis mounting faces are not centered on authored hinges (${upperSpread.center}, ${lowerSpread.center})`);
  }

  const sourceBallMid=midpoint(upperOutboard,lowerOutboard);
  return Object.freeze({
    upperHinge:Object.freeze(upperHinge),
    lowerHinge:Object.freeze(lowerHinge),
    upperOutboard:Object.freeze(upperOutboard),
    lowerOutboard:Object.freeze(lowerOutboard),
    wheelCenter:Object.freeze(wheelCenter),
    sourceUp:Object.freeze(sourceUp),
    sourceAxial:Object.freeze(sourceAxial),
    sourceSpread:Object.freeze(sourceSpread),
    mating:Object.freeze({
      upper:Object.freeze({armFace:upperArmFace,transverseCenterErrorBU:upperTransverseError}),
      lower:Object.freeze({armFace:lowerArmFace,transverseCenterErrorBU:lowerTransverseError}),
      hubInboard:hubInboardFace,
    }),
    wishboneSpread:Object.freeze({upper:upperSpread,lower:lowerSpread}),
    provenance:Object.freeze({
      upperHinge:'AUTHORED_NODE:Chassis_Top',
      lowerHinge:'AUTHORED_NODE:Chassis_Bottom',
      upperOutboard:'GEOMETRY_DERIVED_MATING_SURFACE_MIDPOINT:upper-arm<->hub',
      lowerOutboard:'GEOMETRY_DERIVED_MATING_SURFACE_MIDPOINT:lower-arm<->hub',
      wheelCenter:'AUTHORED_NODE:Socket_WheelCenter',
      sourceUp:'AUTHORED_AXIS:Axis_SuspensionTravel_Bottom->Top',
      upperSpread:'GEOMETRY_DERIVED_INBOARD_CHASSIS_MOUNTING_FACE:upper-arm',
      lowerSpread:'GEOMETRY_DERIVED_INBOARD_CHASSIS_MOUNTING_FACE:lower-arm',
    }),
    sanity:Object.freeze({
      authoredKingpinOffsetBU:distance(sourceBallMid,wheelCenter),
      authoredKingpinOffsetMeters:distance(sourceBallMid,wheelCenter)*OWNER_M6_R3_SCALE_METERS_PER_BU,
      authoredUpperArmLengthBU:distance(upperHinge,upperOutboard),
      authoredLowerArmLengthBU:distance(lowerHinge,lowerOutboard),
    }),
  });
}

export function calibrateRearWishbonePieceR3(piece,references,geometry,which) {
  if(which!=='upper'&&which!=='lower')fail(`unknown rear wishbone kind ${which}`);
  const sourceHinge=which==='upper'?references.upperHinge:references.lowerHinge;
  const sourceOutboard=which==='upper'?references.upperOutboard:references.lowerOutboard;
  const targetHinge=which==='upper'?geometry.upperHinge:geometry.lowerHinge;
  const targetBall=which==='upper'?geometry.upperBall:geometry.lowerBall;
  const targetFront=which==='upper'?geometry.upperFront:geometry.lowerFront;
  const targetRear=which==='upper'?geometry.upperRear:geometry.lowerRear;
  const sourceSpreadAuthority=which==='upper'?references.wishboneSpread.upper:references.wishboneSpread.lower;

  const sourceAxial=norm(sub(sourceOutboard,sourceHinge),`${geometry.corner} rear ${which} source axial`);
  const sourceSpread=references.sourceSpread;
  const sourceUp=references.sourceUp;
  const targetAxial=norm(sub(targetBall,targetHinge),`${geometry.corner} rear ${which} target axial`);
  const targetSpread=norm(sub(targetRear,targetFront),`${geometry.corner} rear ${which} target spread`);
  let targetUp=norm(cross(targetAxial,targetSpread),`${geometry.corner} rear ${which} target up`);
  if(targetUp[1]<0)targetUp=mul(targetUp,-1);

  const sourceAxialLength=distance(sourceHinge,sourceOutboard);
  const targetAxialLength=distance(targetHinge,targetBall);
  const targetSpreadLength=distance(targetFront,targetRear);
  const axialScale=targetAxialLength/sourceAxialLength;
  const spreadScale=targetSpreadLength/sourceSpreadAuthority.length;
  const thicknessScale=OWNER_M6_R3_SCALE_METERS_PER_BU;
  const targetDeterminant=determinantColumns(targetAxial,targetSpread,targetUp);
  if(Math.abs(Math.abs(targetDeterminant)-1)>1e-6)fail(`${geometry.corner} rear ${which} target basis is not orthonormal`);
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
    mapPoint:(value)=>Object.freeze(point(value)),
    report:Object.freeze({
      mode:'GEOMETRY_DERIVED_REAR_REFERENCE_TO_PHYSICAL_HARDPOINT_R3',
      sourceHinge:Object.freeze([...sourceHinge]),
      sourceOutboard:Object.freeze([...sourceOutboard]),
      sourceAxialLength,
      targetAxialLength,
      axialScale,
      sourceSpreadLength:sourceSpreadAuthority.length,
      sourceSpreadCenter:sourceSpreadAuthority.center,
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
        spread:which==='upper'?references.provenance.upperSpread:references.provenance.lowerSpread,
        physicalTarget:'M6_WISHBONE_HARDPOINT',
      }),
    }),
  });
}

export function calibrateRearKnucklePieceR3(piece,references,geometry) {
  const calibrated=calibrateFrontKnucklePieceR3(piece,references,geometry);
  return Object.freeze({
    ...calibrated,
    report:Object.freeze({
      ...calibrated.report,
      mode:'GEOMETRY_DERIVED_REAR_UPRIGHT_REFERENCE_TO_PHYSICAL_KNUCKLE_R3',
    }),
  });
}

export function calibrateRearChassisPieceR3(piece,references,geometry) {
  const calibrated=calibrateFrontChassisPieceR3(piece,references,geometry);
  return Object.freeze({
    ...calibrated,
    report:Object.freeze({
      ...calibrated.report,
      mode:'REAR_AUTHORED_CHASSIS_REFERENCE_TO_PHYSICAL_WISHBONE_FRAME_R3',
    }),
  });
}
