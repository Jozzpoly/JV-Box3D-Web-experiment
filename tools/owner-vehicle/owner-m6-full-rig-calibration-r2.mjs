const SCALE = 0.35;
const EPS = 1e-9;

export const OWNER_M6_R2_SOURCE_SHA256 = Object.freeze({
  chassis: '45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8',
  wheel: '1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617',
  frontSuspension: '57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750',
  rearSuspension: '374e54eb420f0b3e31bba0d749fdf1cf942db2389361dde1313d7a6b29e77ec2',
  damper: 'eca8770078d9df4ed6d7649473fa35d57501c3951232ffe8d91429a6f1f67118',
  cardan: '16f4eab46d526c273f434e109331586df2cd7e3ab0792a4dfbd21d7ed4ef0860',
});

export const OWNER_M6_R2_CONTRACT_SHA256 = Object.freeze({
  wheel: '24cf7d68bff367a6fcf267dd5efd841e13658736693881099fd52b2e7c613bfb',
  frontSuspension: '86da0ce06730317b1274d7a03079044c89cac15ea825b088772b7188028717ed',
  rearSuspension: '110e71595ba88dff11d4a29be533616b54980bcb25f035d9a0531a587e8dce01',
  damper: '6dfae948e67e9e5e73aaead3811a5f1105358ebf1d5418e87e523e45865e0812',
  cardan: '72c65b9e1527e69aac20b17d6ce305d9f808564bd71f7d17ea7984f95961919c',
});

export const OWNER_M6_R2_SCALE_METERS_PER_BU = SCALE;

function fail(message) {
  throw new Error(`Owner M6 full-rig R2 calibration rejected: ${message}`);
}
function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mul(a,k){return [a[0]*k,a[1]*k,a[2]*k];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function len(a){return Math.hypot(...a);}
function norm(a,label='vector'){const l=len(a);if(!(l>EPS))fail(`${label} is degenerate`);return mul(a,1/l);}
function midpoint(a,b){return mul(add(a,b),0.5);}
function boundsOfPiece(piece){
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  for(const primitive of piece.primitives){
    for(let i=0;i<primitive.positions.length;i+=3){
      for(let axis=0;axis<3;axis+=1){
        lo[axis]=Math.min(lo[axis],primitive.positions[i+axis]);
        hi[axis]=Math.max(hi[axis],primitive.positions[i+axis]);
      }
    }
  }
  return {min:lo,max:hi,size:sub(hi,lo),center:midpoint(lo,hi)};
}
function normalizeNormal(v){return norm(v,'transformed normal');}
function mapPrimitive(primitive, pointFn, normalFn, reverseWinding=false){
  const positions=[];
  for(let i=0;i<primitive.positions.length;i+=3){positions.push(...pointFn(primitive.positions.slice(i,i+3)));}
  const normals=[];
  for(let i=0;i<primitive.normals.length;i+=3){normals.push(...normalizeNormal(normalFn(primitive.normals.slice(i,i+3))));}
  const indices=[...primitive.indices];
  if(reverseWinding){for(let i=0;i<indices.length;i+=3){[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];}}
  return Object.freeze({...primitive,positions:Object.freeze(positions),normals:Object.freeze(normals),indices:Object.freeze(indices)});
}
export function mapPiecePrimitives(piece, pointFn, normalFn, reverseWinding=false){
  return Object.freeze(piece.primitives.map((primitive)=>mapPrimitive(primitive,pointFn,normalFn,reverseWinding)));
}
export function requirePiece(extracted,name,label='asset'){
  const matches=extracted.rigidPieces.filter((piece)=>piece.jointName===name);
  if(matches.length!==1)fail(`${label} must contain exactly one rigid piece ${name}`);
  return matches[0];
}
export function requireMarker(extracted,name,label='asset'){
  if(extracted.source.duplicateNodeNames.includes(name))fail(`${label} marker ${name} is duplicated`);
  const p=extracted.source.uniqueNodeWorldPositions[name];
  if(!Array.isArray(p)||p.length!==3)fail(`${label} marker ${name} is missing`);
  return [...p];
}
function yawMinus90(p){return [-p[2],p[1],p[0]];}
function mirroredSourcePoint(p,isLeft){return isLeft?[...p]:[-p[0],p[1],p[2]];}
function placedDirection(v,isLeft){return yawMinus90(mirroredSourcePoint(v,isLeft));}

export function parseM6FactoryConfig(receiptText){
  let receipt;
  try{receipt=JSON.parse(receiptText);}catch(error){throw new Error('Owner M6 R2 factory receipt is not valid JSON',{cause:error});}
  const c=receipt?.payload?.factoryConfig;
  if(c===null||typeof c!=='object')fail('factory receipt payload.factoryConfig is missing');
  const w=c.wishbone;
  if(w===null||typeof w!=='object')fail('factory receipt wishbone config is missing');
  const values=[c.axleHalfSpacing,c.restDrop,c.trackHalfWidth,c.rackHalfWidth,w.uprightHalfHeight,w.kingpinOffset,w.casterDeg,w.kingpinInclinationDeg,w.upperArmLength,w.lowerArmLength,w.armHalfSpread,w.steeringArmBack,w.ackermannFraction,w.coiloverTopHeight,w.coiloverTopInboard,w.restArmDroopDeg];
  if(values.some((x)=>typeof x!=='number'||!Number.isFinite(x)))fail('factory receipt geometry contains non-finite values');
  return Object.freeze({
    axleHalfSpacing:c.axleHalfSpacing,restDrop:c.restDrop,trackHalfWidth:c.trackHalfWidth,rackHalfWidth:c.rackHalfWidth,
    wheelRadius:receipt.payload.assetResolution.wheelRadius,wheelWidth:receipt.payload.assetResolution.wheelWidth,
    wishbone:Object.freeze({...w}),
  });
}
function isFront(corner){return corner==='fl'||corner==='fr';}
function isLeft(corner){return corner==='fl'||corner==='rl';}
export function cornerRestGeometry(config,corner){
  const front=isFront(corner),left=isLeft(corner),inward=left?1:-1;
  const wc=[front?config.axleHalfSpacing:-config.axleHalfSpacing,-config.restDrop,left?-config.trackHalfWidth:config.trackHalfWidth];
  const g=config.wishbone,h=g.uprightHalfHeight;
  const caster=Math.tan(g.casterDeg*Math.PI/180),kpi=Math.tan(g.kingpinInclinationDeg*Math.PI/180);
  const upperBall=add(wc,[-caster*h,h,inward*(g.kingpinOffset+kpi*h)]);
  const lowerBall=add(wc,[ caster*h,-h,inward*(g.kingpinOffset-kpi*h)]);
  const droop=Math.tan(g.restArmDroopDeg*Math.PI/180);
  const upperInboard=add(upperBall,[0,g.upperArmLength*droop,inward*g.upperArmLength]);
  const lowerInboard=add(lowerBall,[0,g.lowerArmLength*droop,inward*g.lowerArmLength]);
  let armInboard=g.kingpinOffset;
  if(g.ackermannTrapezoid){armInboard+=g.ackermannFraction*g.steeringArmBack*(config.trackHalfWidth/(2*config.axleHalfSpacing));}
  const upperFront=add(upperInboard,[g.armHalfSpread,0,0]);
  const upperRear=add(upperInboard,[-g.armHalfSpread,0,0]);
  const lowerFront=add(lowerInboard,[g.armHalfSpread,0,0]);
  const lowerRear=add(lowerInboard,[-g.armHalfSpread,0,0]);
  const upperHinge=midpoint(upperFront,upperRear),lowerHinge=midpoint(lowerFront,lowerRear);
  const steeringArm=add(wc,[-g.steeringArmBack,0,inward*armInboard]);
  const coiloverChassis=add(wc,[0,g.coiloverTopHeight,inward*g.coiloverTopInboard]);
  const rackRest=[config.axleHalfSpacing-g.steeringArmBack,-config.restDrop+g.lowerArmLength*droop,0];
  const rackEnd=add(rackRest,[0,0,left?-config.rackHalfWidth:config.rackHalfWidth]);
  const rearToe=add(steeringArm,[0,g.lowerArmLength*droop,inward*g.lowerArmLength]);
  return Object.freeze({corner,front,left,inward,wheelCenter:wc,upperBall,lowerBall,upperFront,upperRear,lowerFront,lowerRear,upperHinge,lowerHinge,steeringArm,coiloverChassis,coiloverKnuckle:lowerBall,rackRest,steeringStart:front?rackEnd:rearToe});
}

export function computeSuspensionPlacement(extracted,config,corner,mountOffsetMeters){
  const g=cornerRestGeometry(config,corner);
  const marker=requireMarker(extracted,'Socket_WheelCenter',`${corner} suspension`);
  const mirrored=mirroredSourcePoint(marker,g.left);
  const rotatedScaled=mul(yawMinus90(mirrored),SCALE);
  const attach=[g.wheelCenter[0],g.wheelCenter[1],g.wheelCenter[2]+(g.left?mountOffsetMeters:-mountOffsetMeters)];
  const translation=sub(attach,rotatedScaled);
  const point=(p)=>add(translation,mul(yawMinus90(mirroredSourcePoint(p,g.left)),SCALE));
  const normal=(n)=>placedDirection(n,g.left);
  return Object.freeze({geometry:g,translation,point,normal,mirrored:!g.left,attach});
}

export function bakePlacedPieceToBody(piece,placement,bodyOrigin){
  return mapPiecePrimitives(piece,(p)=>sub(placement.point(p),bodyOrigin),placement.normal,placement.mirrored);
}

export function calibrateWishbonePiece(piece,geometry,which){
  const b=boundsOfPiece(piece);
  const isUpper=which==='upper';
  const hinge=isUpper?geometry.upperHinge:geometry.lowerHinge;
  const ball=isUpper?geometry.upperBall:geometry.lowerBall;
  const front=isUpper?geometry.upperFront:geometry.lowerFront;
  const rear=isUpper?geometry.upperRear:geometry.lowerRear;
  const outward=norm(sub(ball,hinge),`${geometry.corner} ${which} arm axis`);
  const sourceXWorld=geometry.left?mul(outward,-1):outward;
  // Historical -90deg Y placement maps authored +Z to vehicle -X on both sides.
  const sourceZWorld=[-1,0,0];
  const sourceYWorld=norm(cross(sourceZWorld,sourceXWorld),`${geometry.corner} ${which} arm up`);
  const sourceAxialLength=b.max[0]-b.min[0];
  const sourceSpreadLength=b.max[2]-b.min[2];
  if(!(sourceAxialLength>EPS&&sourceSpreadLength>EPS))fail(`${geometry.corner} ${which} source arm bounds are degenerate`);
  const targetAxialLength=len(sub(ball,hinge));
  const targetSpreadLength=len(sub(front,rear));
  const sourceCenterY=(b.min[1]+b.max[1])*0.5;
  const sourceCenterZ=(b.min[2]+b.max[2])*0.5;
  const point=(p)=>{
    const axialT=geometry.left
      ? (b.max[0]-p[0])/sourceAxialLength
      : (p[0]-b.min[0])/sourceAxialLength;
    const spreadT=(p[2]-sourceCenterZ)/sourceSpreadLength;
    const thickness=(p[1]-sourceCenterY)*SCALE;
    return add(
      add(mul(outward,targetAxialLength*axialT),mul(sourceZWorld,targetSpreadLength*spreadT)),
      mul(sourceYWorld,thickness),
    );
  };
  const xScale=targetAxialLength/sourceAxialLength;
  const zScale=targetSpreadLength/sourceSpreadLength;
  const yScale=SCALE;
  const normalFn=(n)=>add(
    add(mul(sourceXWorld,n[0]/xScale),mul(sourceYWorld,n[1]/yScale)),
    mul(sourceZWorld,n[2]/zScale),
  );
  const primitives=mapPiecePrimitives(piece,point,normalFn,false);
  return Object.freeze({primitives,report:Object.freeze({
    sourceBounds:b,
    targetAxialLength,
    targetSpreadLength,
    xScale,
    yScale,
    zScale,
    sourceXWorld,
    sourceYWorld,
    sourceZWorld,
    restEndpointErrorMeters:0,
  })});
}

export function canonicalizeSteeringRod(piece){
  const b=boundsOfPiece(piece),center=b.center;
  const lengthMeters=b.size[0]*SCALE;
  const point=(p)=>[(p[1]-center[1])*SCALE,(center[0]-p[0])*SCALE,(p[2]-center[2])*SCALE];
  const normal=(n)=>[n[1],-n[0],n[2]];
  return Object.freeze({primitives:mapPiecePrimitives(piece,point,normal,false),referenceLengthMeters:lengthMeters,axis:'+Y',sourceBounds:b});
}

export function damperCalibration(extracted){
  const upper=requirePiece(extracted,'Part_Upper','damper');
  const stretch=requirePiece(extracted,'Part_Stretch','damper');
  const lower=requirePiece(extracted,'Part_Lower','damper');
  const upperPivot=requireMarker(extracted,'Part_Upper','damper');
  const stretchPivot=requireMarker(extracted,'Part_Stretch','damper');
  const lowerPivot=requireMarker(extracted,'Part_Lower','damper');
  const stretchBounds=boundsOfPiece(stretch);
  const stretchRef=stretchBounds.size[1]*SCALE;
  const centeredStretch=mapPiecePrimitives(
    stretch,
    (p)=>[(p[0]-stretchPivot[0])*SCALE,(p[1]-stretchPivot[1])*SCALE,(p[2]-stretchPivot[2])*SCALE],
    (n)=>n,
    false,
  );
  const scaleTransform=(pivot)=>Object.freeze({position:Object.freeze(pivot.map((x)=>-x*SCALE)),rotation:Object.freeze([0,0,0,1]),scale:Object.freeze([SCALE,SCALE,SCALE])});
  return Object.freeze({upper,lower,centeredStretch,upperTransform:scaleTransform(upperPivot),lowerTransform:scaleTransform(lowerPivot),stretchReferenceLengthMeters:stretchRef,report:Object.freeze({upperPivot,stretchPivot,lowerPivot,stretchBounds})});
}

export function cardanCalibration(extracted){
  const first=requirePiece(extracted,'First_Part','cardan');
  const mid=requirePiece(extracted,'Mid_Part','cardan');
  const last=requirePiece(extracted,'Last_Part','cardan');
  const firstPivot=requireMarker(extracted,'First_Part','cardan');
  const lastPivot=requireMarker(extracted,'Last_Part','cardan');
  const midBounds=boundsOfPiece(mid),midCenter=midBounds.center;
  const centeredMid=mapPiecePrimitives(mid,(p)=>[(p[0]-midCenter[0])*SCALE,(p[1]-midCenter[1])*SCALE,(p[2]-midCenter[2])*SCALE],(n)=>n,false);
  const transform=(pivot)=>Object.freeze({position:Object.freeze(pivot.map((x)=>-x*SCALE)),rotation:Object.freeze([0,0,0,1]),scale:Object.freeze([SCALE,SCALE,SCALE])});
  return Object.freeze({first,last,centeredMid,firstTransform:transform(firstPivot),lastTransform:transform(lastPivot),midReferenceLengthMeters:midBounds.size[0]*SCALE,report:Object.freeze({firstPivot,lastPivot,midBounds})});
}

export function cardanPartPairEndpoints(extracted,placement){
  const driveWorld=placement.point(requireMarker(extracted,'Socket_CardanDrive',`${placement.geometry.corner} cardan drive`));
  const hubWorld=placement.point(requireMarker(extracted,'Socket_CardanHub',`${placement.geometry.corner} cardan hub`));
  return Object.freeze({
    startPartId:'m6.chassis',
    startLocalPosition:Object.freeze(driveWorld),
    endPartId:`m6.${placement.geometry.corner}.knuckle`,
    endLocalPosition:Object.freeze(sub(hubWorld,placement.geometry.wheelCenter)),
    restWorld:Object.freeze({start:driveWorld,end:hubWorld,length:len(sub(hubWorld,driveWorld))}),
  });
}

export function identityLocal(){return Object.freeze({position:Object.freeze([0,0,0]),rotation:Object.freeze([0,0,0,1]),scale:Object.freeze([1,1,1])});}
