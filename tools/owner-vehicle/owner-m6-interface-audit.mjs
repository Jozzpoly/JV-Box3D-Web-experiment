import { inspectBlockbenchRigidPartsV1 } from './blockbench-gltf-rigid-parts.mjs';
import { buildOwnerM6FullRigPackageR3 } from './owner-m6-full-rig-package-r3.mjs';
import {
  parseM6FactoryConfig,
  cornerRestGeometry,
} from './owner-m6-full-rig-calibration-r2.mjs';
import { M6_R1_CHASSIS_LOCAL_FROM_SOURCE } from './owner-m6-visual-calibration-r1.mjs';

export const OWNER_M6_INTERFACE_AUDIT_SCHEMA = 'JV_WEB_OWNER_M6_INTERFACE_AUDIT_V1';

const CORNERS = Object.freeze(['fl', 'fr', 'rl', 'rr']);
const SCALE = 0.35;

function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mul(a,k){return [a[0]*k,a[1]*k,a[2]*k];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function length(a){return Math.hypot(a[0],a[1],a[2]);}
function distance(a,b){return length(sub(a,b));}

function rotateQuaternion(rotation,value){
  const q=[rotation[0],rotation[1],rotation[2]];
  const t=mul(cross(q,value),2);
  return add(value,add(mul(t,rotation[3]),cross(q,t)));
}

function chassisSourceToLocal(point){
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

function closestPointTriangle(p,a,b,c){
  const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a);
  const d1=dot(ab,ap),d2=dot(ac,ap);
  if(d1<=0&&d2<=0)return a;
  const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
  if(d3>=0&&d4<=d3)return b;
  const vc=d1*d4-d3*d2;
  if(vc<=0&&d1>=0&&d3<=0){const v=d1/(d1-d3);return add(a,mul(ab,v));}
  const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
  if(d6>=0&&d5<=d6)return c;
  const vb=d5*d2-d1*d6;
  if(vb<=0&&d2>=0&&d6<=0){const w=d2/(d2-d6);return add(a,mul(ac,w));}
  const va=d3*d6-d5*d4;
  if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){
    const w=(d4-d3)/((d4-d3)+(d5-d6));
    return add(b,mul(sub(c,b),w));
  }
  const inverse=1/(va+vb+vc);
  const v=vb*inverse,w=vc*inverse;
  return add(a,add(mul(ab,v),mul(ac,w)));
}

function chassisTriangles(chassis){
  const triangles=[];
  for(const piece of chassis.rigidPieces){
    for(const primitive of piece.primitives){
      for(let offset=0;offset<primitive.indices.length;offset+=3){
        const points=primitive.indices.slice(offset,offset+3).map((index)=>
          chassisSourceToLocal(primitive.positions.slice(index*3,index*3+3)),
        );
        triangles.push(Object.freeze({piece:piece.jointName,points:Object.freeze(points)}));
      }
    }
  }
  return Object.freeze(triangles);
}

function nearestSurface(triangles,point){
  let best=null;
  for(const triangle of triangles){
    const nearest=closestPointTriangle(point,...triangle.points);
    const meters=distance(point,nearest);
    if(best===null||meters<best.meters){
      best={meters,piece:triangle.piece,point:Object.freeze(nearest)};
    }
  }
  if(best===null)throw new Error('Owner M6 interface audit found no chassis triangles.');
  return Object.freeze(best);
}

function marker(extracted,name,label){
  const value=extracted.source.uniqueNodeWorldPositions[name];
  if(!Array.isArray(value)||value.length!==3){
    throw new Error(`Owner M6 interface audit is missing ${label} marker ${name}.`);
  }
  return value;
}

function placedAuthoredPoint(extracted,corner,name,translation){
  const isLeft=corner.endsWith('l');
  const source=[...marker(extracted,name,corner)];
  if(!isLeft)source[0]=-source[0];
  const vehicle=[-source[2]*SCALE,source[1]*SCALE,source[0]*SCALE];
  return Object.freeze(add(translation,vehicle));
}

function measurement(triangles,authoredPlaced,currentTarget){
  const authoredSurface=nearestSurface(triangles,authoredPlaced);
  const currentSurface=nearestSurface(triangles,currentTarget);
  return Object.freeze({
    authoredPlaced:Object.freeze([...authoredPlaced]),
    currentTarget:Object.freeze([...currentTarget]),
    authoredToCurrentMeters:distance(authoredPlaced,currentTarget),
    authoredToChassisSurface:authoredSurface,
    currentToChassisSurface:currentSurface,
  });
}

function groupBindings(bindingIds){
  const groups={chassis:[],wheels:[],arms:[],knuckles:[],brackets:[],dampers:[],steering:[],cardans:[],other:[]};
  for(const id of bindingIds){
    if(id==='owner.chassis')groups.chassis.push(id);
    else if(id.endsWith('.wheel'))groups.wheels.push(id);
    else if(id.includes('.upper-arm')||id.includes('.lower-arm'))groups.arms.push(id);
    else if(id.includes('.knuckle.'))groups.knuckles.push(id);
    else if(id.includes('.chassis-bracket.'))groups.brackets.push(id);
    else if(id.includes('.coilover'))groups.dampers.push(id);
    else if(id.includes('.steering-link'))groups.steering.push(id);
    else if(id.includes('.cardan.'))groups.cardans.push(id);
    else groups.other.push(id);
  }
  return Object.freeze(Object.fromEntries(Object.entries(groups).map(([key,value])=>[key,Object.freeze(value)])));
}

export function buildOwnerM6InterfaceAudit(input){
  const generated=buildOwnerM6FullRigPackageR3(input);
  const config=parseM6FactoryConfig(input.factoryReceiptText);
  const chassis=inspectBlockbenchRigidPartsV1(input.chassisText,'Nadwozie.gltf');
  const front=inspectBlockbenchRigidPartsV1(input.frontSuspensionText,'OneSided_Steering_Suspension_Rig.gltf');
  const rear=inspectBlockbenchRigidPartsV1(input.rearSuspensionText,'One_Sided_wheel_mount.gltf');
  const triangles=chassisTriangles(chassis);
  const corners={};

  for(const corner of CORNERS){
    const extracted=corner.startsWith('f')?front:rear;
    const geometry=cornerRestGeometry(config,corner);
    const translation=generated.report.calibration.corners[corner].placement.translation;
    const damperUpperName=corner.startsWith('f')?'Socket_SingleDamperUpper':'Socket_DamperUpper_R';
    const damperLowerName=corner.startsWith('f')?'Socket_SingleDamperLower':'Socket_DamperLower_R';
    const steeringName=corner.startsWith('f')?'Socket_SteeringRod':null;
    const cardan=generated.report.calibration.corners[corner].cardan;

    const authored={
      upperHinge:placedAuthoredPoint(extracted,corner,'Chassis_Top',translation),
      lowerHinge:placedAuthoredPoint(extracted,corner,'Chassis_Bottom',translation),
      wheelCenter:placedAuthoredPoint(extracted,corner,'Socket_WheelCenter',translation),
      damperUpper:placedAuthoredPoint(extracted,corner,damperUpperName,translation),
      damperLower:placedAuthoredPoint(extracted,corner,damperLowerName,translation),
      cardanDrive:placedAuthoredPoint(extracted,corner,'Socket_CardanDrive',translation),
      cardanHub:placedAuthoredPoint(extracted,corner,'Socket_CardanHub',translation),
    };
    if(steeringName!==null){authored.steeringRod=placedAuthoredPoint(extracted,corner,steeringName,translation);}

    corners[corner]=Object.freeze({
      sourceRig:corner.startsWith('f')?'FRONT_STEERING_SUSPENSION':'REAR_WHEEL_MOUNT',
      placementTranslation:Object.freeze([...translation]),
      interfaces:Object.freeze({
        upperHinge:measurement(triangles,authored.upperHinge,geometry.upperHinge),
        lowerHinge:measurement(triangles,authored.lowerHinge,geometry.lowerHinge),
        damperUpper:measurement(triangles,authored.damperUpper,geometry.coiloverChassis),
      }),
      authored:Object.freeze(authored),
      currentPhysical:Object.freeze({
        wheelCenter:Object.freeze([...geometry.wheelCenter]),
        upperHinge:Object.freeze([...geometry.upperHinge]),
        lowerHinge:Object.freeze([...geometry.lowerHinge]),
        upperBall:Object.freeze([...geometry.upperBall]),
        lowerBall:Object.freeze([...geometry.lowerBall]),
        steeringArm:Object.freeze([...geometry.steeringArm]),
        coiloverChassis:Object.freeze([...geometry.coiloverChassis]),
        coiloverKnuckle:Object.freeze([...geometry.coiloverKnuckle]),
      }),
      currentVisualPairEndpoints:Object.freeze({
        cardanStart:Object.freeze([...cardan.start]),
        cardanEnd:Object.freeze([...cardan.end]),
      }),
      deltas:Object.freeze({
        authoredWheelCenterToPhysicalCenterMeters:distance(authored.wheelCenter,geometry.wheelCenter),
        authoredCardanDriveToCurrentStartMeters:distance(authored.cardanDrive,cardan.start),
        authoredCardanHubToCurrentEndMeters:distance(authored.cardanHub,cardan.end),
        authoredSteeringRodToPhysicalArmMeters:steeringName===null?null:distance(authored.steeringRod,geometry.steeringArm),
      }),
    });
  }

  return Object.freeze({
    schema:OWNER_M6_INTERFACE_AUDIT_SCHEMA,
    classification:'MEASUREMENT_ONLY_NOT_ACCEPTANCE',
    artifact:Object.freeze({
      id:generated.visualPackage.id,
      byteLength:generated.glb.length,
      sha256:generated.report.output.sha256,
      realBindingCount:generated.report.output.realBindingCount,
    }),
    chassisVisualTransform:M6_R1_CHASSIS_LOCAL_FROM_SOURCE,
    bindingGroups:groupBindings(generated.report.output.realBindingIds),
    corners:Object.freeze(corners),
  });
}
