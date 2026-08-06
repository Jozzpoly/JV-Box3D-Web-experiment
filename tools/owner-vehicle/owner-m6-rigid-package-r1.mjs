import { createHash } from 'node:crypto';
import { align4 } from './blockbench-gltf-core.mjs';
import { inspectBlockbenchRigidSourceV1 } from './blockbench-gltf-inspector.mjs';
import {
  M6_R1_CHASSIS_LOCAL_FROM_SOURCE,
  M6_R1_CHASSIS_SOURCE_GIT_BLOB,
  M6_R1_HISTORICAL_VISUAL_COMMIT,
  M6_R1_SOURCE_AUTHORITY_COMMIT,
  calibrateOwnerWheelR1,
} from './owner-m6-visual-calibration-r1.mjs';

const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;
const PART_IDS = [
  'm6.chassis', 'm6.rack',
  ...['fl','fr','rl','rr'].flatMap((id) => [
    `m6.${id}.wheel`, `m6.${id}.knuckle`, `m6.${id}.upper-arm`, `m6.${id}.lower-arm`,
  ]),
];
const SEGMENT_IDS = ['fl','fr','rl','rr'].flatMap((id) => [
  `m6.${id}.coilover`, `m6.${id}.steering-link`,
]);

function float32(values) {
  const out=new Uint8Array(values.length*4);
  const view=new DataView(out.buffer);
  values.forEach((value,index)=>view.setFloat32(index*4,value,true));
  return out;
}
function uint16(values) {
  const out=new Uint8Array(values.length*2);
  const view=new DataView(out.buffer);
  values.forEach((value,index)=>view.setUint16(index*2,value,true));
  return out;
}
function boxGeometry(hx,hy,hz) {
  return {
    positions:[-hx,-hy,-hz,hx,-hy,-hz,hx,hy,-hz,-hx,hy,-hz,-hx,-hy,hz,hx,-hy,hz,hx,hy,hz,-hx,hy,hz],
    normals:null,
    uvs:null,
    indices:[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,3,2,6,3,6,7,1,5,6,1,6,2,0,3,7,0,7,4],
    material:{
      name:'JV diagnostic',
      baseColorFactor:[0.25,0.28,0.34,1],
      doubleSided:false,
      baseColorTextureIndex:null,
      sourceAlphaMode:'OPAQUE',
      alphaCutoff:0,
    },
  };
}
function nodeName(id) { return `JV_${id.replaceAll('.','_').replaceAll('-','_')}`; }
function localIdentity() { return {position:[0,0,0],rotation:[0,0,0,1],scale:[1,1,1]}; }
function paddedJson(value) {
  const raw=new TextEncoder().encode(JSON.stringify(value));
  const out=new Uint8Array(align4(raw.length));
  out.fill(0x20);
  out.set(raw);
  return out;
}
function bounds(values) {
  const minimum=[Infinity,Infinity,Infinity];
  const maximum=[-Infinity,-Infinity,-Infinity];
  for(let index=0;index<values.length;index+=3){
    for(let axis=0;axis<3;axis+=1){
      minimum[axis]=Math.min(minimum[axis],values[index+axis]);
      maximum[axis]=Math.max(maximum[axis],values[index+axis]);
    }
  }
  return {minimum,maximum};
}
function sourceReport(source) {
  return {
    nodeCount:source.nodeCount,
    primitiveCount:source.primitiveCount,
    vertexCount:source.vertexCount,
    triangleCount:source.triangleCount,
    skinCount:source.skinCount,
    validatedJointCount:source.validatedJointCount,
    bindPoseFlattening:source.bindPoseFlattening,
    hasSkin:source.hasSkin,
    hasEmbeddedImages:source.hasEmbeddedImages,
    texturedMaterialCount:source.texturedMaterialCount,
    textureCount:source.textureResources.textures.length,
  };
}

export function buildOwnerM6RigidPackageR1({chassisText,wheelText}) {
  const chassis=inspectBlockbenchRigidSourceV1(chassisText,'Nadwozie.gltf');
  const wheel=inspectBlockbenchRigidSourceV1(wheelText,'Offroad_Big_Wheels.gltf');
  const calibratedWheel=calibrateOwnerWheelR1(wheel);

  const binaryParts=[];
  let binaryLength=0;
  const views=[];
  const accessors=[];
  const materials=[];
  const materialKeys=new Map();
  const images=[];
  const textures=[];
  const samplers=[];
  const textureKeys=new Map();

  const append=(bytes,target=null)=>{
    const offset=align4(binaryLength);
    if(offset>binaryLength)binaryParts.push({offset:binaryLength,bytes:new Uint8Array(offset-binaryLength)});
    binaryParts.push({offset,bytes});
    binaryLength=offset+bytes.length;
    const index=views.length;
    views.push({
      buffer:0,
      byteOffset:offset,
      byteLength:bytes.length,
      ...(target===null?{}:{target}),
    });
    return index;
  };

  const addTexture=(source,sourceTextureIndex)=>{
    if(sourceTextureIndex===null)return null;
    const texture=source.textureResources.textures[sourceTextureIndex];
    if(texture===undefined)throw new Error(`Owner M6 texture ${sourceTextureIndex} is missing.`);
    const image=source.textureResources.images[texture.source];
    const sampler=source.textureResources.samplers[texture.sampler];
    if(image===undefined||sampler===undefined)throw new Error('Owner M6 texture resource is incomplete.');
    const bytesHash=createHash('sha256').update(image.bytes).digest('hex');
    const key=JSON.stringify({
      bytesHash,
      mimeType:image.mimeType,
      magFilter:sampler.magFilter,
      minFilter:sampler.minFilter,
      wrapS:sampler.wrapS,
      wrapT:sampler.wrapT,
    });
    const existing=textureKeys.get(key);
    if(existing!==undefined)return existing;

    const samplerIndex=samplers.length;
    samplers.push({
      ...(sampler.name===null?{}:{name:sampler.name}),
      magFilter:sampler.magFilter,
      minFilter:sampler.minFilter,
      wrapS:sampler.wrapS,
      wrapT:sampler.wrapT,
    });
    const imageIndex=images.length;
    images.push({
      ...(image.name===null?{}:{name:image.name}),
      bufferView:append(image.bytes),
      mimeType:image.mimeType,
    });
    const outputIndex=textures.length;
    textures.push({
      ...(texture.name===null?{}:{name:texture.name}),
      sampler:samplerIndex,
      source:imageIndex,
    });
    textureKeys.set(key,outputIndex);
    return outputIndex;
  };

  const addMaterial=(source,material)=>{
    const outputTextureIndex=addTexture(source,material.baseColorTextureIndex);
    const rendered={
      name:material.name??null,
      doubleSided:material.doubleSided,
      baseColorFactor:material.baseColorFactor,
      baseColorTextureIndex:outputTextureIndex,
      alphaMode:material.sourceAlphaMode,
      alphaCutoff:material.alphaCutoff,
    };
    const key=JSON.stringify(rendered);
    const existing=materialKeys.get(key);
    if(existing!==undefined)return existing;
    const index=materials.length;
    const pbr={
      baseColorFactor:material.baseColorFactor,
      metallicFactor:0,
      roughnessFactor:1,
      ...(outputTextureIndex===null?{}:{baseColorTexture:{index:outputTextureIndex,texCoord:0}}),
    };
    materials.push({
      ...(material.name===null?{}:{name:material.name}),
      doubleSided:material.doubleSided,
      pbrMetallicRoughness:pbr,
      alphaMode:material.sourceAlphaMode,
      ...(material.sourceAlphaMode==='MASK'?{alphaCutoff:material.alphaCutoff}:{}),
    });
    materialKeys.set(key,index);
    return index;
  };

  const meshFrom=(name,source,sourcePrimitives)=>{
    const primitives=sourcePrimitives.map((primitive)=>{
      const positionView=append(float32(primitive.positions),34962);
      const positionAccessor=accessors.length;
      const positionBounds=bounds(primitive.positions);
      accessors.push({
        bufferView:positionView,
        componentType:5126,
        count:primitive.positions.length/3,
        type:'VEC3',
        min:positionBounds.minimum,
        max:positionBounds.maximum,
      });
      const attributes={POSITION:positionAccessor};
      if(primitive.normals){
        const view=append(float32(primitive.normals),34962);
        attributes.NORMAL=accessors.length;
        accessors.push({bufferView:view,componentType:5126,count:primitive.normals.length/3,type:'VEC3'});
      }
      if(primitive.uvs){
        const view=append(float32(primitive.uvs),34962);
        attributes.TEXCOORD_0=accessors.length;
        accessors.push({bufferView:view,componentType:5126,count:primitive.uvs.length/2,type:'VEC2'});
      }
      const indexView=append(uint16(primitive.indices),34963);
      const indexAccessor=accessors.length;
      accessors.push({bufferView:indexView,componentType:5123,count:primitive.indices.length,type:'SCALAR'});
      return {
        attributes,
        indices:indexAccessor,
        material:addMaterial(source,primitive.material),
        mode:4,
      };
    });
    return {name,primitives};
  };

  const chassisMesh=meshFrom('JV_Owner_Nadwozie',chassis,chassis.primitives);
  const wheelForOutput=Object.freeze({...wheel,primitives:calibratedWheel.primitives});
  const wheelMesh=meshFrom('JV_Owner_Offroad_Big_Wheel',wheelForOutput,calibratedWheel.primitives);
  const diagnosticSource=Object.freeze({
    textureResources:Object.freeze({
      images:Object.freeze([]),
      samplers:Object.freeze([]),
      textures:Object.freeze([]),
    }),
  });
  const diagnosticPart=meshFrom('JV_Diagnostic_Part',diagnosticSource,[boxGeometry(0.06,0.06,0.06)]);
  const diagnosticSegment=meshFrom('JV_Diagnostic_Segment',diagnosticSource,[boxGeometry(0.025,0.5,0.025)]);
  const meshes=[chassisMesh,wheelMesh,diagnosticPart,diagnosticSegment];

  const nodes=[];
  for(const partId of PART_IDS){
    const mesh=partId==='m6.chassis'?0:partId.endsWith('.wheel')?1:2;
    nodes.push({name:nodeName(partId),mesh});
  }
  for(const segmentId of SEGMENT_IDS)nodes.push({name:nodeName(segmentId),mesh:3});

  const binLength=align4(binaryLength);
  const binary=new Uint8Array(binLength);
  for(const part of binaryParts)binary.set(part.bytes,part.offset);
  const root={
    asset:{version:'2.0',generator:'JV Web owner M6 rigid package R1'},
    scene:0,
    scenes:[{nodes:nodes.map((_,index)=>index)}],
    nodes,
    buffers:[{byteLength:binLength}],
    bufferViews:views,
    accessors,
    materials,
    meshes,
    ...(images.length===0?{}:{images,textures,samplers}),
  };
  const json=paddedJson(root);
  const total=12+8+json.length+8+binary.length;
  const glb=new Uint8Array(total);
  const view=new DataView(glb.buffer);
  view.setUint32(0,GLB_MAGIC,true);
  view.setUint32(4,GLB_VERSION,true);
  view.setUint32(8,total,true);
  view.setUint32(12,json.length,true);
  view.setUint32(16,GLB_JSON_CHUNK,true);
  glb.set(json,20);
  const binHeader=20+json.length;
  view.setUint32(binHeader,binary.length,true);
  view.setUint32(binHeader+4,GLB_BIN_CHUNK,true);
  glb.set(binary,binHeader+8);

  const sha256=createHash('sha256').update(glb).digest('hex');
  const bindings=[
    ...PART_IDS.map((partId)=>({
      bindingId:`bind.${partId}`,
      nodeName:nodeName(partId),
      source:{kind:'PART',partId},
      localFromSource:partId==='m6.chassis'
        ? M6_R1_CHASSIS_LOCAL_FROM_SOURCE
        : localIdentity(),
    })),
    ...SEGMENT_IDS.map((segmentId)=>({
      bindingId:`bind.${segmentId}`,
      nodeName:nodeName(segmentId),
      source:{kind:'SEGMENT_STRETCH',segmentId,axis:'+Y',referenceLengthMeters:1},
      localFromSource:localIdentity(),
    })),
  ];
  const visualPackage={
    format:'jv-web-vehicle-visual-package',
    schemaVersion:1,
    id:'m6-owner-rigid-r1',
    displayName:'M6 Owner Body + Wheels R1',
    vehicleFamily:'M6',
    rigProfile:'M6_FULL_RIG_V1',
    units:'meter',
    axes:{forward:'+X',up:'+Y',right:'+Z'},
    asset:{kind:'GLB',url:'models/m6-owner-rigid-r1.glb',sha256,byteLength:glb.length},
    bindings,
  };
  return Object.freeze({
    glb,
    visualPackage:Object.freeze(visualPackage),
    manifestText:`${JSON.stringify(visualPackage,null,2)}\n`,
    report:Object.freeze({
      schema:'JV_WEB_OWNER_M6_RIGID_IMPORT_R1',
      chassis:sourceReport(chassis),
      wheel:{...sourceReport(wheel),calibration:calibratedWheel.report},
      chassisCalibration:{
        localFromSource:M6_R1_CHASSIS_LOCAL_FROM_SOURCE,
        authority:{
          repository:'Jozzpoly/Box3d_FunProject',
          sourceAuthorityCommit:M6_R1_SOURCE_AUTHORITY_COMMIT,
          chassisSourceGitBlob:M6_R1_CHASSIS_SOURCE_GIT_BLOB,
          historicalVisualCommit:M6_R1_HISTORICAL_VISUAL_COMMIT,
        },
      },
      output:{
        byteLength:glb.length,
        sha256,
        nodeCount:nodes.length,
        meshCount:meshes.length,
        imageCount:images.length,
        textureCount:textures.length,
        realChannels:['m6.chassis','m6.fl.wheel','m6.fr.wheel','m6.rl.wheel','m6.rr.wheel'],
        diagnosticChannelCount:PART_IDS.length+SEGMENT_IDS.length-5,
        textureRendering:'EMBEDDED_BASE_COLOR_MASK_V1',
      },
    }),
  });
}
