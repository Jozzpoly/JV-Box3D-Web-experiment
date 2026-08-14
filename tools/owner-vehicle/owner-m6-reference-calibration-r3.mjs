import {
  cornerRestGeometry,
  mapPiecePrimitives,
  requireMarker,
  requirePiece,
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

function pieceBounds(piece) {
  const min=[Infinity,Infinity,Infinity];
  const max=[-Infinity,-Infinity,-Infinity];
  for(const primitive of piece.primitives){
    for(let i=0;i<primitive.positions.length;i+=3){
      for(let axis=0;axis<3;axis+=1){
        min[axis]=Math.min(min[axis],primitive.positions[i+axis]);
        max[axis]=Math.max(max[axis],primitive.positions[i+axis]);
      }
    }
  }
  if(min.some((value)=>!Number.isFinite(value))||max.some((value)=>!Number.isFinite(value))){
    fail(`piece ${piece.jointName} has no finite geometry`);
  }
  return Object.freeze({min:Object.freeze(min),max:Object.freeze(max)});
}

/**
 * Validated rigid-part endpoint extraction convention recovered from historical native ArmEnds / PartXEnds behavior.
 * It is used here only to recover authored rigid geometry; it does not make any
 * historical M5/M6/M9 rig a whole-mechanism authority. Rigid pieces in this
 * asset family run along authored X; for the unmirrored left corner the
 * wheel/outboard end is the -X extreme.
 */
export function frontLeftPartXEndsS2(piece) {
  const bounds=pieceBounds(piece);
  const y=0.5*(bounds.min[1]+bounds.max[1]);
  const z=0.5*(bounds.min[2]+bounds.max[2]);
  return Object.freeze({
    chassisOrInboard:Object.freeze([bounds.max[0],y,z]),
    wheelOrOutboard:Object.freeze([bounds.min[0],y,z]),
    bounds,
  });
}

function frontLeftSourceDeltaMetersS2(deltaBU) {
  // Established JV source placement: yaw -90 degrees about Y, then 0.35 m/BU.
  return Object.freeze([
    -deltaBU[2]*OWNER_M6_R3_SCALE_METERS_PER_BU,
    deltaBU[1]*OWNER_M6_R3_SCALE_METERS_PER_BU,
    deltaBU[0]*OWNER_M6_R3_SCALE_METERS_PER_BU,
  ]);
}

/**
 * S2 front-left source-registration helper. Legacy aliases containing
 * "Golden" are retained below for compatibility only; they are not architecture
 * claims. This intentionally does not call deriveFrontSuspensionReferencesR3(): that older helper promoted
 * Socket_ChassisMount_b to the upper wheel-side hardpoint and inferred the
 * lower point from it, which is the rejected one-knuckle authority inversion.
 */
export function deriveFrontLeftSourceReferencesS2(extracted) {
  const wheelCenter=requireMarker(extracted,'Socket_WheelCenter','S2 FL authored source');
  const chassisMountB=requireMarker(extracted,'Socket_ChassisMount_b','S2 FL authored source');
  const travelTop=requireMarker(extracted,'Axis_SuspensionTravel_Top','S2 FL authored source');
  const travelBottom=requireMarker(extracted,'Axis_SuspensionTravel_Bottom','S2 FL authored source');
  const upperPiece=requirePiece(extracted,'Chassis_Top','S2 FL authored source');
  const lowerPiece=requirePiece(extracted,'Chassis_Bottom','S2 FL authored source');
  const steeringRodPiece=requirePiece(extracted,'Socket_SteeringRod','S2 FL authored source');
  const upperEnds=frontLeftPartXEndsS2(upperPiece);
  const lowerEnds=frontLeftPartXEndsS2(lowerPiece);
  const steeringRodEnds=frontLeftPartXEndsS2(steeringRodPiece);
  const travelMid=midpoint(travelTop,travelBottom);
  if(distance(travelMid,wheelCenter)>1e-9){
    fail(`S2 FL WheelCenter is not the authored travel-axis midpoint (${distance(travelMid,wheelCenter)} BU)`);
  }
  const steeringAxisSource=norm(sub(travelTop,travelBottom),'S2 FL authored steering axis');
  const upperAxial=norm(sub(upperEnds.wheelOrOutboard,upperEnds.chassisOrInboard),'S2 FL upper arm axis');
  const lowerAxial=norm(sub(lowerEnds.wheelOrOutboard,lowerEnds.chassisOrInboard),'S2 FL lower arm axis');
  if(len(cross(upperAxial,lowerAxial))>1e-9){
    fail('S2 FL authored upper/lower rigid-part axes are not parallel');
  }
  const sourceSpread=norm(cross(steeringAxisSource,upperAxial),'S2 FL authored wishbone spread axis');
  return Object.freeze({
    wheelCenter:Object.freeze(wheelCenter),
    chassisMountB:Object.freeze(chassisMountB),
    travelTop:Object.freeze(travelTop),
    travelBottom:Object.freeze(travelBottom),
    steeringAxisSource:Object.freeze(steeringAxisSource),
    sourceSpread:Object.freeze(sourceSpread),
    upper:Object.freeze({
      chassisEnd:upperEnds.chassisOrInboard,
      wheelEnd:upperEnds.wheelOrOutboard,
      bounds:upperEnds.bounds,
    }),
    lower:Object.freeze({
      chassisEnd:lowerEnds.chassisOrInboard,
      wheelEnd:lowerEnds.wheelOrOutboard,
      bounds:lowerEnds.bounds,
    }),
    steeringRod:Object.freeze({
      inboard:steeringRodEnds.chassisOrInboard,
      outboard:steeringRodEnds.wheelOrOutboard,
      bounds:steeringRodEnds.bounds,
    }),
    provenance:Object.freeze({
      wheelCenter:'AUTHORED_NODE:Socket_WheelCenter',
      steeringAxis:'AUTHORED_AXIS:Axis_SuspensionTravel_Bottom->Top_THROUGH_WHEELCENTER',
      upperWheelEnd:'AUTHORED_RIGID_GEOMETRY_X_EXTREME:Chassis_Top',
      lowerWheelEnd:'AUTHORED_RIGID_GEOMETRY_X_EXTREME:Chassis_Bottom',
      chassisMountB:'AUTHORED_NODE:Socket_ChassisMount_b_NON_STEERING_STRUCTURAL_MEMBER',
      steeringRodOutboard:'AUTHORED_RIGID_GEOMETRY_X_EXTREME:Socket_SteeringRod',
      steeringRodInboard:'CURRENT_WEB_RACK_CENTER_ENGINEERING_REFERENCE_NOT_AUTHORED_NOT_OWNER_ACCEPTED',
    }),
  });
}

export function frontLeftSourceWishboneReferencesS2(references) {
  return Object.freeze({
    upperHinge:references.upper.chassisEnd,
    lowerHinge:references.lower.chassisEnd,
    upperOutboard:references.upper.wheelEnd,
    lowerOutboard:references.lower.wheelEnd,
    sourceUp:references.steeringAxisSource,
    sourceSpread:references.sourceSpread,
    provenance:Object.freeze({
      upperHinge:'AUTHORED_RIGID_GEOMETRY_X_EXTREME:Chassis_Top_CHASSIS_END',
      lowerHinge:'AUTHORED_RIGID_GEOMETRY_X_EXTREME:Chassis_Bottom_CHASSIS_END',
      upperOutboard:'AUTHORED_RIGID_GEOMETRY_X_EXTREME:Chassis_Top_WHEEL_END',
      lowerOutboard:'AUTHORED_RIGID_GEOMETRY_X_EXTREME:Chassis_Bottom_WHEEL_END',
    }),
  });
}

export function frontLeftSourceRegisteredGeometryS2(config,references) {
  const current=cornerRestGeometry(config,'fl');
  const fromWheelCenter=(sourcePoint)=>add(
    current.wheelCenter,
    frontLeftSourceDeltaMetersS2(sub(sourcePoint,references.wheelCenter)),
  );
  const steeringArm=fromWheelCenter(references.steeringRod.outboard);
  const chassisMountB=fromWheelCenter(references.chassisMountB);
  const steeringAxisDirection=norm(
    frontLeftSourceDeltaMetersS2(references.steeringAxisSource),
    'S2 FL steering-axis direction',
  );
  return Object.freeze({
    ...current,
    steeringArm:Object.freeze(steeringArm),
    steeringStart:Object.freeze([...current.rackRest]),
    steeringCenter:Object.freeze([...current.wheelCenter]),
    steeringAxisDirection:Object.freeze(steeringAxisDirection),
    chassisMountB:Object.freeze(chassisMountB),
    authority:'S2_FL_SOURCE_REGISTERED_CENTER_AND_OUTBOARD__CURRENT_SUSPENSION_HARDPOINTS_PRESERVED_AS_PROVISIONAL',
  });
}

export function calibrateFrontLeftSourceRigidPieceS2(piece,references,geometry,bodyRole) {
  if(bodyRole!=='knuckle'&&bodyRole!=='lower-arm')fail(`unknown S2 FL rigid body role ${bodyRole}`);
  const bodyOrigin=bodyRole==='knuckle'?geometry.wheelCenter:geometry.lowerHinge;
  const point=(p)=>sub(
    add(
      geometry.wheelCenter,
      frontLeftSourceDeltaMetersS2(sub(p,references.wheelCenter)),
    ),
    bodyOrigin,
  );
  const normal=(n)=>frontLeftSourceDeltaMetersS2(n);
  const mappedWheelCenter=point(references.wheelCenter);
  return Object.freeze({
    primitives:mapPiecePrimitives(piece,point,normal,false),
    mapPoint:(value)=>Object.freeze(point(value)),
    report:Object.freeze({
      mode:'S2_FL_EXACT_AUTHORED_RIGID_PLACEMENT_NO_KINGPIN_AFFINE',
      bodyRole,
      bodyOrigin:Object.freeze([...bodyOrigin]),
      sourceWheelCenter:Object.freeze([...references.wheelCenter]),
      mappedWheelCenter:Object.freeze(mappedWheelCenter),
      steeringCenter:Object.freeze([...geometry.steeringCenter]),
      steeringAxisDirection:Object.freeze([...geometry.steeringAxisDirection]),
      scaleMetersPerBU:OWNER_M6_R3_SCALE_METERS_PER_BU,
      transform:'SOURCE_DELTA_FROM_WHEELCENTER_YAW_MINUS_90_UNIFORM_SCALE',
      affineKingpinCalibration:false,
    }),
  });
}

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

/**
 * Legacy exported names retained for compatibility with older R3/S2 tooling.
 * "Golden" in these identifiers is historical naming debt, not authority.
 */
export const deriveFrontLeftGoldenReferencesS2 = deriveFrontLeftSourceReferencesS2;
export const frontLeftGoldenWishboneReferencesS2 = frontLeftSourceWishboneReferencesS2;
export const frontLeftGoldenGeometryS2 = frontLeftSourceRegisteredGeometryS2;
export const calibrateFrontLeftGoldenRigidPieceS2 = calibrateFrontLeftSourceRigidPieceS2;

/**
 * Legacy R3 visual-calibration helper retained for deterministic historical
 * package generation and non-FL compatibility. Its #6-as-upper-outboard and
 * inferred-lower model is superseded for current FL source/steering semantics
 * and must not be treated as rig or steering authority.
 */
export function deriveFrontSuspensionReferencesR3(extracted) {
  const upperHinge=requireMarker(extracted,'Chassis_Top','front suspension reference');
  const lowerHinge=requireMarker(extracted,'Chassis_Bottom','front suspension reference');
  const upperOutboard=requireMarker(extracted,'Socket_ChassisMount_b','front suspension reference');
  const wheelCenter=requireMarker(extracted,'Socket_WheelCenter','front suspension reference');
  const damperMount=requireMarker(extracted,'Socket_SingleDamper_Mount','front suspension reference');
  const damperUpper=requireMarker(extracted,'Socket_SingleDamperUpper','front suspension reference');
  const damperLower=requireMarker(extracted,'Socket_SingleDamperLower','front suspension reference');
  const chassisMountA=requireMarker(extracted,'Socket_ChassisMount_a','front suspension reference');
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
    chassisMountA:Object.freeze(chassisMountA),
    damperMount:Object.freeze(damperMount),
    damperUpper:Object.freeze(damperUpper),
    damperLower:Object.freeze(damperLower),
    sourceUp:Object.freeze(sourceUp),
    sourceAxial:Object.freeze(upperAxial),
    sourceSpread:Object.freeze(sourceSpread),
    provenance:Object.freeze({
      upperHinge:'AUTHORED_NODE:Chassis_Top',
      lowerHinge:'AUTHORED_NODE:Chassis_Bottom',
      upperOutboard:'AUTHORED_VISUAL_REFERENCE:Socket_ChassisMount_b',
      lowerOutboard:'INFERRED_PARALLEL_UPRIGHT_FROM_AUTHORED_UPPER_REFERENCE',
      wheelCenter:'AUTHORED_NODE:Socket_WheelCenter',
      chassisMountA:'AUTHORED_NODE:Socket_ChassisMount_a',
      damperMount:'AUTHORED_NODE:Socket_SingleDamper_Mount',
      damperUpper:'AUTHORED_NODE:Socket_SingleDamperUpper',
      damperLower:'AUTHORED_NODE:Socket_SingleDamperLower_CHILD_OF_Chassis_Bottom',
      sourceUp:'AUTHORED_AXIS:Axis_SuspensionTravel_Bottom->Top',
    }),
    sanity:Object.freeze({
      authoredKingpinOffsetBU:distance(sourceBallMid,wheelCenter),
      authoredKingpinOffsetMeters:distance(sourceBallMid,wheelCenter)*OWNER_M6_R3_SCALE_METERS_PER_BU,
      authoredUpperArmLengthBU:distance(upperHinge,upperOutboard),
      authoredLowerArmLengthBU:distance(lowerHinge,lowerOutboard),
      legacyOffsetInterpretation:'R3_SOURCE_BALLMID_TO_WHEELCENTER_DISTANCE_NOT_STEERING_AXIS_AUTHORITY',
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
    mapPoint:(value)=>Object.freeze(point(value)),
    report:Object.freeze({
      mode:'LEGACY_R3_AUTHORED_REFERENCE_TO_CURRENT_WEB_SUSPENSION_HARDPOINT',
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
        physicalTarget:'CURRENT_WEB_SUSPENSION_HARDPOINT_DEFERRED_RIG_REFERENCE',
      }),
    }),
  });
}

export function calibrateFrontChassisPieceR3(piece,references,geometry) {
  const sourceWheelCenter=references.wheelCenter;
  const sourceHingeMid=midpoint(references.upperHinge,references.lowerHinge);
  const sourceRadialVector=sub(sourceHingeMid,sourceWheelCenter);
  const sourceVerticalHalf=mul(sub(references.upperHinge,references.lowerHinge),0.5);
  const sourceRadial=norm(sourceRadialVector,`${geometry.corner} source chassis radial`);
  const sourceVertical=norm(sourceVerticalHalf,`${geometry.corner} source chassis vertical`);
  const sourceLongitudinal=norm(cross(sourceRadial,sourceVertical),`${geometry.corner} source chassis longitudinal`);
  if(Math.abs(dot(sourceRadial,sourceVertical))>1e-6)fail(`${geometry.corner} source chassis radial/vertical basis is not orthogonal`);
  if(determinantColumns(sourceRadial,sourceVertical,sourceLongitudinal)<0.999999)fail(`${geometry.corner} source chassis basis is not right handed`);

  const targetHingeMid=midpoint(geometry.upperHinge,geometry.lowerHinge);
  const targetRadialVector=sub(targetHingeMid,geometry.wheelCenter);
  const targetVerticalHalf=mul(sub(geometry.upperHinge,geometry.lowerHinge),0.5);
  const targetLongitudinal=norm(sub(geometry.upperRear,geometry.upperFront),`${geometry.corner} target chassis longitudinal`);
  const sourceRadialLength=len(sourceRadialVector);
  const sourceVerticalHalfLength=len(sourceVerticalHalf);
  const radialColumn=mul(targetRadialVector,1/sourceRadialLength);
  const verticalColumn=mul(targetVerticalHalf,1/sourceVerticalHalfLength);
  const longitudinalColumn=mul(targetLongitudinal,OWNER_M6_R3_SCALE_METERS_PER_BU);
  const determinant=determinantColumns(radialColumn,verticalColumn,longitudinalColumn);
  if(!(Math.abs(determinant)>EPS))fail(`${geometry.corner} chassis affine map is singular`);
  const reverseWinding=determinant<0;

  const point=(p)=>{
    const q=sub(p,sourceWheelCenter);
    return add(
      add(
        add(geometry.wheelCenter,mul(radialColumn,dot(q,sourceRadial))),
        mul(verticalColumn,dot(q,sourceVertical)),
      ),
      mul(longitudinalColumn,dot(q,sourceLongitudinal)),
    );
  };
  const reciprocalRadial=mul(cross(verticalColumn,longitudinalColumn),1/determinant);
  const reciprocalVertical=mul(cross(longitudinalColumn,radialColumn),1/determinant);
  const reciprocalLongitudinal=mul(cross(radialColumn,verticalColumn),1/determinant);
  const normal=(n)=>add(
    add(
      mul(reciprocalRadial,dot(n,sourceRadial)),
      mul(reciprocalVertical,dot(n,sourceVertical)),
    ),
    mul(reciprocalLongitudinal,dot(n,sourceLongitudinal)),
  );

  const mappedWheelCenter=point(sourceWheelCenter);
  const mappedUpperHinge=point(references.upperHinge);
  const mappedLowerHinge=point(references.lowerHinge);
  return Object.freeze({
    primitives:mapPiecePrimitives(piece,point,normal,reverseWinding),
    mapPoint:(value)=>Object.freeze(point(value)),
    report:Object.freeze({
      mode:'LEGACY_R3_AUTHORED_CHASSIS_REFERENCE_TO_CURRENT_WEB_WISHBONE_FRAME',
      radialScale:len(targetRadialVector)/sourceRadialLength,
      verticalScale:len(targetVerticalHalf)/sourceVerticalHalfLength,
      thicknessScale:OWNER_M6_R3_SCALE_METERS_PER_BU,
      targetRadialVerticalDot:dot(norm(targetRadialVector),norm(targetVerticalHalf)),
      determinant,
      mirrored:reverseWinding,
      mappedWheelCenter:Object.freeze(mappedWheelCenter),
      mappedUpperHinge:Object.freeze(mappedUpperHinge),
      mappedLowerHinge:Object.freeze(mappedLowerHinge),
      wheelCenterErrorMeters:distance(mappedWheelCenter,geometry.wheelCenter),
      upperHingeErrorMeters:distance(mappedUpperHinge,geometry.upperHinge),
      lowerHingeErrorMeters:distance(mappedLowerHinge,geometry.lowerHinge),
      referenceAuthority:Object.freeze({
        sourceFrame:'AUTHORED_WHEEL_CENTER_PLUS_UPPER_LOWER_WISHBONE_HINGES',
        physicalTarget:'CURRENT_WEB_WHEELCENTER_PLUS_SUSPENSION_HINGES_DEFERRED_RIG_REFERENCE',
        longitudinal:'CURRENT_WEB_WISHBONE_FRONT_REAR_AXIS_DEFERRED_RIG_REFERENCE',
      }),
    }),
  });
}

export function calibrateFrontKnucklePieceR3(piece,references,geometry) {
  const sourceWheelCenter=references.wheelCenter;
  const sourceKingpinMid=midpoint(references.upperOutboard,references.lowerOutboard);
  const sourceRadialVector=sub(sourceKingpinMid,sourceWheelCenter);
  const sourceKingpinHalf=mul(sub(references.upperOutboard,references.lowerOutboard),0.5);
  const sourceRadial=norm(sourceRadialVector,`${geometry.corner} source upright radial`);
  const sourceKingpin=norm(sourceKingpinHalf,`${geometry.corner} source upright kingpin`);
  const sourceLongitudinal=norm(cross(sourceRadial,sourceKingpin),`${geometry.corner} source upright longitudinal`);
  if(Math.abs(dot(sourceRadial,sourceKingpin))>1e-6)fail(`${geometry.corner} source upright radial/kingpin basis is not orthogonal`);
  if(determinantColumns(sourceRadial,sourceKingpin,sourceLongitudinal)<0.999999)fail(`${geometry.corner} source upright basis is not right handed`);

  const targetUpper=sub(geometry.upperBall,geometry.wheelCenter);
  const targetLower=sub(geometry.lowerBall,geometry.wheelCenter);
  const targetRadialVector=midpoint(targetUpper,targetLower);
  const targetKingpinHalf=mul(sub(targetUpper,targetLower),0.5);
  const targetLongitudinal=norm(sub(geometry.upperRear,geometry.upperFront),`${geometry.corner} target upright longitudinal`);
  const sourceRadialLength=len(sourceRadialVector);
  const sourceKingpinHalfLength=len(sourceKingpinHalf);
  const targetRadialLength=len(targetRadialVector);
  const targetKingpinHalfLength=len(targetKingpinHalf);

  // Legacy R3 visual affine map. Target radial/old kingpin columns may be
  // non-orthogonal because current historical runtime hardpoints contain
  // caster/KPI-style shear. That shear is NOT authored/source steering-axis
  // authority and is not used for the current FL source-registered knuckle.
  const radialColumn=mul(targetRadialVector,1/sourceRadialLength);
  const kingpinColumn=mul(targetKingpinHalf,1/sourceKingpinHalfLength);
  const longitudinalColumn=mul(targetLongitudinal,OWNER_M6_R3_SCALE_METERS_PER_BU);
  const determinant=determinantColumns(radialColumn,kingpinColumn,longitudinalColumn);
  if(!(Math.abs(determinant)>EPS))fail(`${geometry.corner} upright affine map is singular`);
  const reverseWinding=determinant<0;

  const point=(p)=>{
    const q=sub(p,sourceWheelCenter);
    return add(
      add(
        mul(radialColumn,dot(q,sourceRadial)),
        mul(kingpinColumn,dot(q,sourceKingpin)),
      ),
      mul(longitudinalColumn,dot(q,sourceLongitudinal)),
    );
  };

  // For A=[r k l], A^-T*n is a linear combination of the reciprocal basis.
  const reciprocalRadial=mul(cross(kingpinColumn,longitudinalColumn),1/determinant);
  const reciprocalKingpin=mul(cross(longitudinalColumn,radialColumn),1/determinant);
  const reciprocalLongitudinal=mul(cross(radialColumn,kingpinColumn),1/determinant);
  const normal=(n)=>add(
    add(
      mul(reciprocalRadial,dot(n,sourceRadial)),
      mul(reciprocalKingpin,dot(n,sourceKingpin)),
    ),
    mul(reciprocalLongitudinal,dot(n,sourceLongitudinal)),
  );

  const mappedWheelCenter=point(sourceWheelCenter);
  const mappedUpper=point(references.upperOutboard);
  const mappedLower=point(references.lowerOutboard);
  return Object.freeze({
    primitives:mapPiecePrimitives(piece,point,normal,reverseWinding),
    report:Object.freeze({
      mode:'LEGACY_R3_AUTHORED_UPRIGHT_REFERENCE_TO_CURRENT_WEB_KNUCKLE',
      sourceWheelCenter:Object.freeze([...sourceWheelCenter]),
      sourceUpper:Object.freeze([...references.upperOutboard]),
      sourceLower:Object.freeze([...references.lowerOutboard]),
      targetUpper:Object.freeze(targetUpper),
      targetLower:Object.freeze(targetLower),
      radialScale:targetRadialLength/sourceRadialLength,
      kingpinScale:targetKingpinHalfLength/sourceKingpinHalfLength,
      thicknessScale:OWNER_M6_R3_SCALE_METERS_PER_BU,
      targetRadialKingpinDot:dot(norm(targetRadialVector),norm(targetKingpinHalf)),
      determinant,
      mirrored:reverseWinding,
      mappedWheelCenter:Object.freeze(mappedWheelCenter),
      mappedUpper:Object.freeze(mappedUpper),
      mappedLower:Object.freeze(mappedLower),
      wheelCenterErrorMeters:len(mappedWheelCenter),
      upperBallErrorMeters:distance(mappedUpper,targetUpper),
      lowerBallErrorMeters:distance(mappedLower,targetLower),
      referenceAuthority:Object.freeze({
        wheelCenter:references.provenance.wheelCenter,
        upper:references.provenance.upperOutboard,
        lower:references.provenance.lowerOutboard,
        physicalTarget:'CURRENT_WEB_LEGACY_KNUCKLE_WHEELCENTER_AND_BALL_HARDPOINTS_NOT_FL_AUTHORITY',
        longitudinal:'CURRENT_WEB_WISHBONE_FRONT_REAR_AXIS_DEFERRED_RIG_REFERENCE',
      }),
    }),
  });
}
