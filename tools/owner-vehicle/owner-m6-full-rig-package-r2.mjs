import { createHash } from 'node:crypto';
import { align4 } from './blockbench-gltf-core.mjs';
import { inspectBlockbenchRigidSourceV1 } from './blockbench-gltf-inspector.mjs';
import { inspectBlockbenchRigidPartsV1 } from './blockbench-gltf-rigid-parts.mjs';
import {
  M6_R1_CHASSIS_LOCAL_FROM_SOURCE,
  calibrateOwnerWheelR1,
} from './owner-m6-visual-calibration-r1.mjs';
import {
  OWNER_M6_R2_SOURCE_SHA256,
  OWNER_M6_R2_CONTRACT_SHA256,
  parseM6FactoryConfig,
  cornerRestGeometry,
  computeSuspensionPlacement,
  bakePlacedPieceToBody,
  calibrateWishbonePiece,
  canonicalizeSteeringRod,
  damperCalibration,
  cardanCalibration,
  cardanPartPairEndpoints,
  requirePiece,
  identityLocal,
} from './owner-m6-full-rig-calibration-r2.mjs';

const GLB_MAGIC=0x46546c67,GLB_VERSION=2,GLB_JSON_CHUNK=0x4e4f534a,GLB_BIN_CHUNK=0x004e4942;
const CORNERS=Object.freeze(['fl','fr','rl','rr']);
const PART_IDS=Object.freeze([
  'm6.chassis','m6.rack',
  ...CORNERS.flatMap((id)=>[`m6.${id}.wheel`,`m6.${id}.knuckle`,`m6.${id}.upper-arm`,`m6.${id}.lower-arm`]),
]);
const SEGMENT_IDS=Object.freeze(CORNERS.flatMap((id)=>[`m6.${id}.coilover`,`m6.${id}.steering-link`]));

function sha256(bytes){return createHash('sha256').update(bytes).digest('hex');}
function float32(values){const out=new Uint8Array(values.length*4),v=new DataView(out.buffer);values.forEach((x,i)=>v.setFloat32(i*4,x,true));return out;}
function uint16(values){const out=new Uint8Array(values.length*2),v=new DataView(out.buffer);values.forEach((x,i)=>v.setUint16(i*2,x,true));return out;}
function paddedJson(value){const raw=new TextEncoder().encode(JSON.stringify(value)),out=new Uint8Array(align4(raw.length));out.fill(0x20);out.set(raw);return out;}
function bounds(values){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<values.length;i+=3)for(let a=0;a<3;a++){min[a]=Math.min(min[a],values[i+a]);max[a]=Math.max(max[a],values[i+a]);}return {minimum:min,maximum:max};}
function diagnosticBox(h=0.02){return {positions:[-h,-h,-h,h,-h,-h,h,h,-h,-h,h,-h,-h,-h,h,h,-h,h,h,h,h,-h,h,h],normals:null,uvs:null,indices:[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,3,2,6,3,6,7,1,5,6,1,6,2,0,3,7,0,7,4],material:{name:'JV R2 diagnostic hidden',baseColorFactor:[0.15,0.15,0.18,1],doubleSided:false,baseColorTextureIndex:null,sourceAlphaMode:'OPAQUE',alphaCutoff:0}};}
function nodeSafe(value){return value.replaceAll('.','_').replaceAll('-','_');}
function stableToken(value){return value.toLowerCase().replaceAll('_','-').replace(/[^a-z0-9.-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
function realNode(bindingId){return `JV_R2_Real_${nodeSafe(bindingId)}`;}
function diagnosticNode(bindingId){return `JV_R2_Diagnostic_${nodeSafe(bindingId)}`;}
function sourceReport(source){return {nodeCount:source.nodeCount,primitiveCount:source.primitiveCount,vertexCount:source.vertexCount,triangleCount:source.triangleCount,skinCount:source.skinCount,validatedJointCount:source.validatedJointCount,bindPoseFlattening:source.bindPoseFlattening,textureCount:source.textureResources.textures.length};}
function requireSourceSha(text,expected,label){const actual=sha256(Buffer.from(text,'utf8'));if(actual!==expected)throw new Error(`${label} SHA-256 mismatch: ${actual}`);}
function localTransform(position=[0,0,0],rotation=[0,0,0,1],scale=[1,1,1]){return {position,rotation,scale};}

export function buildOwnerM6FullRigPackageR2({
  chassisText,wheelText,frontSuspensionText,rearSuspensionText,damperText,cardanText,factoryReceiptText,
  contractTexts,
}){
  requireSourceSha(chassisText,OWNER_M6_R2_SOURCE_SHA256.chassis,'Nadwozie.gltf');
  requireSourceSha(wheelText,OWNER_M6_R2_SOURCE_SHA256.wheel,'Offroad_Big_Wheels.gltf');
  requireSourceSha(frontSuspensionText,OWNER_M6_R2_SOURCE_SHA256.frontSuspension,'OneSided_Steering_Suspension_Rig.gltf');
  requireSourceSha(rearSuspensionText,OWNER_M6_R2_SOURCE_SHA256.rearSuspension,'One_Sided_wheel_mount.gltf');
  requireSourceSha(damperText,OWNER_M6_R2_SOURCE_SHA256.damper,'Asset_Dumper.gltf');
  requireSourceSha(cardanText,OWNER_M6_R2_SOURCE_SHA256.cardan,'Cardan_shaft.gltf');
  for(const [key,expected] of Object.entries(OWNER_M6_R2_CONTRACT_SHA256)){
    const text=contractTexts?.[key];
    if(typeof text!=='string')throw new Error(`Owner M6 R2 contract text is missing: ${key}`);
    requireSourceSha(text,expected,`${key} contract`);
  }

  const config=parseM6FactoryConfig(factoryReceiptText);
  const chassis=inspectBlockbenchRigidSourceV1(chassisText,'Nadwozie.gltf');
  const wheel=inspectBlockbenchRigidSourceV1(wheelText,'Offroad_Big_Wheels.gltf');
  const front=inspectBlockbenchRigidPartsV1(frontSuspensionText,'OneSided_Steering_Suspension_Rig.gltf');
  const rear=inspectBlockbenchRigidPartsV1(rearSuspensionText,'One_Sided_wheel_mount.gltf');
  const damper=inspectBlockbenchRigidPartsV1(damperText,'Asset_Dumper.gltf');
  const cardan=inspectBlockbenchRigidPartsV1(cardanText,'Cardan_shaft.gltf');
  const calibratedWheel=calibrateOwnerWheelR1(wheel,config.wheelRadius,config.wheelWidth);
  const mountOffset=calibratedWheel.report.mountOffset;
  const damperCal=damperCalibration(damper);
  const cardanCal=cardanCalibration(cardan);
  const steeringRod=canonicalizeSteeringRod(requirePiece(front,'Socket_SteeringRod','front suspension'));

  const binaryParts=[];let binaryLength=0;const views=[],accessors=[],materials=[],images=[],textures=[],samplers=[];
  const materialKeys=new Map(),textureKeys=new Map();
  const append=(bytes,target=null)=>{const offset=align4(binaryLength);if(offset>binaryLength)binaryParts.push({offset:binaryLength,bytes:new Uint8Array(offset-binaryLength)});binaryParts.push({offset,bytes});binaryLength=offset+bytes.length;const index=views.length;views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,...(target===null?{}:{target})});return index;};
  const addTexture=(source,index)=>{if(index===null)return null;const t=source.textureResources.textures[index],image=t===undefined?undefined:source.textureResources.images[t.source],sampler=t===undefined?undefined:source.textureResources.samplers[t.sampler];if(!t||!image||!sampler)throw new Error('Owner M6 R2 texture resource is incomplete.');const key=JSON.stringify({sha:sha256(image.bytes),mime:image.mimeType,mag:sampler.magFilter,min:sampler.minFilter,s:sampler.wrapS,t:sampler.wrapT});if(textureKeys.has(key))return textureKeys.get(key);const si=samplers.length;samplers.push({...(sampler.name===null?{}:{name:sampler.name}),magFilter:sampler.magFilter,minFilter:sampler.minFilter,wrapS:sampler.wrapS,wrapT:sampler.wrapT});const ii=images.length;images.push({...(image.name===null?{}:{name:image.name}),bufferView:append(image.bytes),mimeType:image.mimeType});const oi=textures.length;textures.push({...(t.name===null?{}:{name:t.name}),sampler:si,source:ii});textureKeys.set(key,oi);return oi;};
  const addMaterial=(source,m)=>{const tex=addTexture(source,m.baseColorTextureIndex);const rendered={name:m.name??null,doubleSided:m.doubleSided,baseColorFactor:m.baseColorFactor,baseColorTextureIndex:tex,alphaMode:m.sourceAlphaMode,alphaCutoff:m.alphaCutoff};const key=JSON.stringify(rendered);if(materialKeys.has(key))return materialKeys.get(key);const i=materials.length;materials.push({...(m.name===null?{}:{name:m.name}),doubleSided:m.doubleSided,pbrMetallicRoughness:{baseColorFactor:m.baseColorFactor,metallicFactor:0,roughnessFactor:1,...(tex===null?{}:{baseColorTexture:{index:tex,texCoord:0}})},alphaMode:m.sourceAlphaMode,...(m.sourceAlphaMode==='MASK'?{alphaCutoff:m.alphaCutoff}:{})});materialKeys.set(key,i);return i;};
  const meshFrom=(name,source,primitives)=>({name,primitives:primitives.map((p)=>{const pv=append(float32(p.positions),34962),pa=accessors.length,pb=bounds(p.positions);accessors.push({bufferView:pv,componentType:5126,count:p.positions.length/3,type:'VEC3',min:pb.minimum,max:pb.maximum});const attributes={POSITION:pa};if(p.normals){const v=append(float32(p.normals),34962);attributes.NORMAL=accessors.length;accessors.push({bufferView:v,componentType:5126,count:p.normals.length/3,type:'VEC3'});}if(p.uvs){const v=append(float32(p.uvs),34962);attributes.TEXCOORD_0=accessors.length;accessors.push({bufferView:v,componentType:5126,count:p.uvs.length/2,type:'VEC2'});}const iv=append(uint16(p.indices),34963),ia=accessors.length;accessors.push({bufferView:iv,componentType:5123,count:p.indices.length,type:'SCALAR'});return {attributes,indices:ia,material:addMaterial(source,p.material),mode:4};})});

  const meshes=[];const nodes=[];const bindings=[];const realBindingIds=[];const calibrationReport={corners:{}};
  const addBinding=({bindingId,source,primitives,sourceAsset,localFromSource=identityLocal(),real=true,meshName=bindingId})=>{
    const meshIndex=meshes.length;meshes.push(meshFrom(meshName,sourceAsset,primitives));const nodeName=real?realNode(bindingId):diagnosticNode(bindingId);nodes.push({name:nodeName,mesh:meshIndex});bindings.push({bindingId,nodeName,source,localFromSource});if(real)realBindingIds.push(bindingId);return bindingId;};
  const diagnosticSource={textureResources:{images:[],samplers:[],textures:[]}};

  addBinding({bindingId:'owner.chassis',source:{kind:'PART',partId:'m6.chassis'},primitives:chassis.primitives,sourceAsset:chassis,localFromSource:M6_R1_CHASSIS_LOCAL_FROM_SOURCE,meshName:'JV Owner chassis R2'});
  const wheelOutput={...wheel,primitives:calibratedWheel.primitives};
  const wheelMeshIndex=meshes.length;meshes.push(meshFrom('JV Owner wheel R2',wheelOutput,calibratedWheel.primitives));
  for(const corner of CORNERS){const bindingId=`owner.${corner}.wheel`,nodeName=realNode(bindingId);nodes.push({name:nodeName,mesh:wheelMeshIndex});bindings.push({bindingId,nodeName,source:{kind:'PART',partId:`m6.${corner}.wheel`},localFromSource:identityLocal()});realBindingIds.push(bindingId);}
  addBinding({bindingId:'diagnostic.rack.coverage',source:{kind:'PART',partId:'m6.rack'},primitives:[diagnosticBox()],sourceAsset:diagnosticSource,real:false,meshName:'JV R2 hidden rack coverage'});

  for(const corner of CORNERS){
    const geometry=cornerRestGeometry(config,corner),isFront=geometry.front,extracted=isFront?front:rear;
    const placement=computeSuspensionPlacement(extracted,config,corner,mountOffset);
    const upperPiece=requirePiece(extracted,'Chassis_Top',`${corner} suspension`),lowerPiece=requirePiece(extracted,'Chassis_Bottom',`${corner} suspension`);
    const upper=calibrateWishbonePiece(upperPiece,geometry,'upper'),lower=calibrateWishbonePiece(lowerPiece,geometry,'lower');
    addBinding({bindingId:`owner.${corner}.upper-arm`,source:{kind:'PART',partId:`m6.${corner}.upper-arm`},primitives:upper.primitives,sourceAsset:extracted.source,meshName:`JV Owner ${corner} upper wishbone`});
    addBinding({bindingId:`owner.${corner}.lower-arm`,source:{kind:'PART',partId:`m6.${corner}.lower-arm`},primitives:lower.primitives,sourceAsset:extracted.source,meshName:`JV Owner ${corner} lower wishbone`});

    const knucklePieces=isFront
      ? ['Socket_ChassisMount_b','Socket_WheelCenter']
      : ['Socket_WheelCenter'];
    for(const pieceName of knucklePieces){const piece=requirePiece(extracted,pieceName,`${corner} suspension`);addBinding({bindingId:`owner.${corner}.knuckle.${stableToken(pieceName)}`,source:{kind:'PART',partId:`m6.${corner}.knuckle`},primitives:bakePlacedPieceToBody(piece,placement,geometry.wheelCenter),sourceAsset:extracted.source,meshName:`JV Owner ${corner} ${pieceName}`});}

    const chassisPieces=isFront
      ? ['Socket_ChassisMount_a','Socket_SingleDamper_Mount']
      : ['Socket_ChassisMount'];
    for(const pieceName of chassisPieces){const piece=requirePiece(extracted,pieceName,`${corner} suspension`);addBinding({bindingId:`owner.${corner}.chassis-bracket.${stableToken(pieceName)}`,source:{kind:'PART',partId:'m6.chassis'},primitives:bakePlacedPieceToBody(piece,placement,[0,0,0]),sourceAsset:extracted.source,meshName:`JV Owner ${corner} ${pieceName}`});}

    addBinding({bindingId:`owner.${corner}.coilover.upper`,source:{kind:'SEGMENT_ENDPOINT_AIM',segmentId:`m6.${corner}.coilover`,endpoint:'START',axis:'-Y'},primitives:damperCal.upper.primitives,sourceAsset:damper.source,localFromSource:damperCal.upperTransform,meshName:`JV Owner ${corner} damper upper`});
    addBinding({bindingId:`owner.${corner}.coilover.stretch`,source:{kind:'SEGMENT_STRETCH',segmentId:`m6.${corner}.coilover`,axis:'+Y',referenceLengthMeters:damperCal.stretchReferenceLengthMeters},primitives:damperCal.centeredStretch,sourceAsset:damper.source,meshName:`JV Owner ${corner} damper stretch`});
    addBinding({bindingId:`owner.${corner}.coilover.lower`,source:{kind:'SEGMENT_ENDPOINT_AIM',segmentId:`m6.${corner}.coilover`,endpoint:'END',axis:'+Y'},primitives:damperCal.lower.primitives,sourceAsset:damper.source,localFromSource:damperCal.lowerTransform,meshName:`JV Owner ${corner} damper lower`});

    addBinding({bindingId:`owner.${corner}.steering-link`,source:{kind:'SEGMENT_STRETCH',segmentId:`m6.${corner}.steering-link`,axis:steeringRod.axis,referenceLengthMeters:steeringRod.referenceLengthMeters},primitives:steeringRod.primitives,sourceAsset:front.source,meshName:`JV Owner ${corner} steering toe link`});

    const endpoints=cardanPartPairEndpoints(extracted,placement);
    const pairBase={startPartId:endpoints.startPartId,startLocalPosition:endpoints.startLocalPosition,endPartId:endpoints.endPartId,endLocalPosition:endpoints.endLocalPosition};
    addBinding({bindingId:`owner.${corner}.cardan.drive-end`,source:{kind:'PART_PAIR_ENDPOINT_AIM',...pairBase,endpoint:'START',axis:'-X'},primitives:cardanCal.first.primitives,sourceAsset:cardan.source,localFromSource:cardanCal.firstTransform,meshName:`JV Owner ${corner} cardan drive end`});
    addBinding({bindingId:`owner.${corner}.cardan.mid`,source:{kind:'PART_PAIR_STRETCH',...pairBase,axis:'-X',referenceLengthMeters:cardanCal.midReferenceLengthMeters},primitives:cardanCal.centeredMid,sourceAsset:cardan.source,meshName:`JV Owner ${corner} cardan mid`});
    addBinding({bindingId:`owner.${corner}.cardan.hub-end`,source:{kind:'PART_PAIR_ENDPOINT_AIM',...pairBase,endpoint:'END',axis:'+X'},primitives:cardanCal.last.primitives,sourceAsset:cardan.source,localFromSource:cardanCal.lastTransform,meshName:`JV Owner ${corner} cardan hub end`});

    calibrationReport.corners[corner]={
      placement:{translation:placement.translation,attach:placement.attach,mirrored:placement.mirrored},
      physical:{wheelCenter:geometry.wheelCenter,upperHinge:geometry.upperHinge,upperBall:geometry.upperBall,lowerHinge:geometry.lowerHinge,lowerBall:geometry.lowerBall,steeringStart:geometry.steeringStart,steeringArm:geometry.steeringArm,coiloverChassis:geometry.coiloverChassis,coiloverKnuckle:geometry.coiloverKnuckle},
      arms:{upper:upper.report,lower:lower.report},
      cardan:endpoints.restWorld,
    };
  }

  // Coverage assertions are explicit in the generated source set before the package validator sees it.
  const coveredParts=new Set(),coveredSegments=new Set();
  for(const binding of bindings){
    if(binding.source.kind==='PART')coveredParts.add(binding.source.partId);
    else if(binding.source.kind==='SEGMENT_STRETCH'||binding.source.kind==='SEGMENT_ENDPOINT_AIM')coveredSegments.add(binding.source.segmentId);
  }
  for(const id of PART_IDS)if(!coveredParts.has(id))throw new Error(`R2 generator missed part coverage: ${id}`);
  for(const id of SEGMENT_IDS)if(!coveredSegments.has(id))throw new Error(`R2 generator missed segment coverage: ${id}`);

  const binLength=align4(binaryLength),binary=new Uint8Array(binLength);for(const part of binaryParts)binary.set(part.bytes,part.offset);
  const root={asset:{version:'2.0',generator:'JV Web owner M6 full rig R2'},scene:0,scenes:[{nodes:nodes.map((_,i)=>i)}],nodes,buffers:[{byteLength:binLength}],bufferViews:views,accessors,materials,meshes,...(images.length===0?{}:{images,textures,samplers})};
  const json=paddedJson(root),total=12+8+json.length+8+binary.length,glb=new Uint8Array(total),dv=new DataView(glb.buffer);dv.setUint32(0,GLB_MAGIC,true);dv.setUint32(4,GLB_VERSION,true);dv.setUint32(8,total,true);dv.setUint32(12,json.length,true);dv.setUint32(16,GLB_JSON_CHUNK,true);glb.set(json,20);const bh=20+json.length;dv.setUint32(bh,binary.length,true);dv.setUint32(bh+4,GLB_BIN_CHUNK,true);glb.set(binary,bh+8);
  const digest=sha256(glb);
  const visualPackage={format:'jv-web-vehicle-visual-package',schemaVersion:1,id:'m6-owner-full-rig-r2',displayName:'M6 Owner Full Rig R2',vehicleFamily:'M6',rigProfile:'M6_FULL_RIG_V1',units:'meter',axes:{forward:'+X',up:'+Y',right:'+Z'},asset:{kind:'GLB',url:'models/m6-owner-full-rig-r2.glb',sha256:digest,byteLength:glb.length},bindings};
  return Object.freeze({
    glb,
    visualPackage:Object.freeze(visualPackage),
    manifestText:`${JSON.stringify(visualPackage,null,2)}\n`,
    report:Object.freeze({
      schema:'JV_WEB_OWNER_M6_FULL_RIG_R2',
      sourceAuthority:{sourceSha256:OWNER_M6_R2_SOURCE_SHA256,contractSha256:OWNER_M6_R2_CONTRACT_SHA256},
      sourceAuthorityInterpretation:'LEGACY_REPORT_FIELD_NAME_HASH_PINNED_INPUTS_NOT_PROJECT_AUTHORITY',
      sources:{chassis:sourceReport(chassis),wheel:sourceReport(wheel),frontSuspension:sourceReport(front.source),rearSuspension:sourceReport(rear.source),damper:sourceReport(damper.source),cardan:sourceReport(cardan.source)},
      wheelCalibration:calibratedWheel.report,
      calibration:calibrationReport,
      output:{byteLength:glb.length,sha256:digest,nodeCount:nodes.length,meshCount:meshes.length,imageCount:images.length,textureCount:textures.length,bindingCount:bindings.length,realBindingCount:realBindingIds.length,realBindingIds:Object.freeze(realBindingIds),diagnosticBindingIds:Object.freeze(bindings.filter((b)=>b.nodeName.startsWith('JV_R2_Diagnostic_')).map((b)=>b.bindingId)),textureRendering:'EMBEDDED_BASE_COLOR_MASK_V1',cardanTreatment:'VISUAL_ONLY_PART_PAIR_NO_TORQUE_TRANSFER'},
    }),
  });
}
