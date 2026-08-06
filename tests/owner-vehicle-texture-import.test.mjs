import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectBlockbenchRigidSourceV1,
  buildOwnerM6RigidPackageR1,
} from '../tools/owner-vehicle/blockbench-owner-m6-r1.mjs';

const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lLQW3QAAAABJRU5ErkJggg==';

function f32(values) {
  const bytes = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => bytes.writeFloatLE(value, index * 4));
  return bytes;
}
function u16(values) {
  const bytes = Buffer.alloc(values.length * 2);
  values.forEach((value, index) => bytes.writeUInt16LE(value, index * 2));
  return bytes;
}
function source({
  wheelMarkers = false,
  alphaMode = 'MASK',
  alphaCutoff = 0.05,
  magFilter = 9728,
  wrapS = 33071,
} = {}) {
  const chunks = [];
  const bufferViews = [];
  const accessors = [];
  const append = (bytes, target, byteStride) => {
    const consumed = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const padding = (4 - consumed % 4) % 4;
    if (padding > 0) chunks.push(Buffer.alloc(padding));
    const byteOffset = consumed + padding;
    const index = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset,
      byteLength: bytes.length,
      ...(target === undefined ? {} : { target }),
      ...(byteStride === undefined ? {} : { byteStride }),
    });
    chunks.push(bytes);
    return index;
  };
  const accessor = ({bytes,componentType,count,type,target,byteStride,min,max}) => {
    const index = accessors.length;
    accessors.push({
      bufferView: append(bytes,target,byteStride),
      componentType,count,type,
      ...(min===undefined?{}:{min}),
      ...(max===undefined?{}:{max}),
    });
    return index;
  };
  const position = accessor({
    bytes:f32([0,0,0, 1,0,0, 0,1,0]),
    componentType:5126,count:3,type:'VEC3',target:34962,byteStride:12,
    min:[0,0,0],max:[1,1,0],
  });
  const normal = accessor({
    bytes:f32([0,0,1, 0,0,1, 0,0,1]),
    componentType:5126,count:3,type:'VEC3',target:34962,byteStride:12,
  });
  const uv = accessor({
    bytes:f32([0,0, 1,0, 0,1]),
    componentType:5126,count:3,type:'VEC2',target:34962,byteStride:8,
  });
  const indices = accessor({
    bytes:u16([0,1,2]),componentType:5123,count:3,type:'SCALAR',target:34963,
  });
  const nodes = [{name:'Root',mesh:0}];
  const children = [];
  if (wheelMarkers) {
    for (const [name,translation] of [
      ['Socket_WheelMount',[-0.4,0,0]],
      ['Marker_TireRadiusOuter',[0,1,0]],
      ['Marker_TireWidthLeft',[-0.5,0,0]],
      ['Marker_TireWidthRight',[0.5,0,0]],
    ]) {
      children.push(nodes.length);
      nodes.push({name,translation});
    }
    nodes[0].children = children;
  }
  const binary = Buffer.concat(chunks);
  return JSON.stringify({
    asset:{version:'2.0',generator:'Blockbench 5.1.4 glTF exporter'},
    scene:0,
    scenes:[{nodes:[0]}],
    nodes,
    buffers:[{
      byteLength:binary.length,
      uri:`data:application/octet-stream;base64,${binary.toString('base64')}`,
    }],
    bufferViews,
    accessors,
    images:[{
      name:'Pixel texture',
      mimeType:'image/png',
      uri:`data:image/png;base64,${PNG_BASE64}`,
    }],
    samplers:[{
      name:'Pixel sampler',
      magFilter,
      minFilter:9728,
      wrapS,
      wrapT:33071,
    }],
    textures:[{name:'Pixel texture',sampler:0,source:0}],
    materials:[{
      name:'Pixel body',
      doubleSided:true,
      alphaMode,
      ...(alphaMode==='MASK'?{alphaCutoff}:{}),
      pbrMetallicRoughness:{
        baseColorFactor:[1,1,1,1],
        baseColorTexture:{index:0,texCoord:0},
        metallicFactor:0,
        roughnessFactor:1,
      },
    }],
    meshes:[{primitives:[{
      attributes:{POSITION:position,NORMAL:normal,TEXCOORD_0:uv},
      indices,
      material:0,
      mode:4,
    }]}],
  });
}

function glbJson(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const jsonLength = view.getUint32(12,true);
  const raw = bytes.subarray(20,20+jsonLength);
  let end = raw.length;
  while (end > 0 && (raw[end-1] === 0x20 || raw[end-1] === 0)) end -= 1;
  return JSON.parse(new TextDecoder().decode(raw.subarray(0,end)));
}

test('Blockbench MASK pixel material is preserved in the generated GLB', () => {
  const result = buildOwnerM6RigidPackageR1({
    chassisText:source(),
    wheelText:source({wheelMarkers:true}),
  });
  assert.equal(result.report.output.textureRendering,'EMBEDDED_BASE_COLOR_MASK_V1');
  assert.equal(result.report.output.textureCount,1);
  assert.equal(result.report.output.imageCount,1);
  const json = glbJson(result.glb);
  assert.equal(json.images.length,1);
  assert.equal(json.textures.length,1);
  assert.deepEqual(json.samplers[0],{
    name:'Pixel sampler',
    magFilter:9728,
    minFilter:9728,
    wrapS:33071,
    wrapT:33071,
  });
  const textured = json.materials.find((material)=>material.name==='Pixel body');
  assert.equal(textured.alphaMode,'MASK');
  assert.equal(textured.alphaCutoff,0.05);
  assert.equal(textured.doubleSided,true);
  assert.deepEqual(textured.pbrMetallicRoughness.baseColorTexture,{index:0,texCoord:0});
});

test('same owner inputs produce byte-identical textured GLB', () => {
  const input = {chassisText:source(),wheelText:source({wheelMarkers:true})};
  assert.deepEqual(
    buildOwnerM6RigidPackageR1(input).glb,
    buildOwnerM6RigidPackageR1(input).glb,
  );
});

test('BLEND and non-pixel samplers fail closed', () => {
  assert.throws(
    ()=>inspectBlockbenchRigidSourceV1(source({alphaMode:'BLEND'})),
    /OPAQUE or MASK/,
  );
  assert.throws(
    ()=>inspectBlockbenchRigidSourceV1(source({magFilter:9729})),
    /NEAREST filtering/,
  );
  assert.throws(
    ()=>inspectBlockbenchRigidSourceV1(source({wrapS:10497})),
    /CLAMP_TO_EDGE/,
  );
});
