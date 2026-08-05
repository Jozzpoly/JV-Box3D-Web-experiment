const EXPECTED_GENERATOR = 'Blockbench 5.1.4 glTF exporter';
const ALLOWED_ATTRIBUTES = new Set([
  'POSITION',
  'NORMAL',
  'TEXCOORD_0',
  'JOINTS_0',
  'WEIGHTS_0',
]);
const BIND_POSE_TOLERANCE = 2e-4;
const WEIGHT_TOLERANCE = 2e-4;

function reject(message) {
  throw new Error(`Owner vehicle source rejected: ${message}`);
}
function align4(value) { return Math.ceil(value / 4) * 4; }
function requireObject(value, label) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) reject(`${label} must be an object`);
  return value;
}
function requireArray(value, label) {
  if (!Array.isArray(value)) reject(`${label} must be an array`);
  return value;
}
function finite(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) reject(`${label} must be finite`);
  return value;
}
function integer(value, label, min = 0) {
  if (!Number.isInteger(value) || value < min) reject(`${label} must be an integer >= ${min}`);
  return value;
}
function rejectNonEmptyArray(value, label) {
  if (value !== undefined && requireArray(value, label).length > 0) {
    reject(`${label} is unsupported`);
  }
}
function decodeDataUri(uri, label) {
  if (typeof uri !== 'string' || !uri.startsWith('data:application/octet-stream;base64,')) {
    reject(`${label} must be one embedded application/octet-stream base64 URI`);
  }
  const encoded = uri.slice(uri.indexOf(',') + 1);
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length === 0 || bytes.toString('base64').replace(/=+$/u, '') !== encoded.replace(/=+$/u, '')) {
    reject(`${label} contains invalid base64`);
  }
  return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function identity() {
  return new Float64Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}
function multiply(a, b) {
  const out = new Float64Array(16);
  for (let c = 0; c < 4; c += 1) for (let r = 0; r < 4; r += 1) {
    out[c*4+r] = a[r]*b[c*4] + a[4+r]*b[c*4+1] + a[8+r]*b[c*4+2] + a[12+r]*b[c*4+3];
  }
  return out;
}
function matrixClose(actual, expected, tolerance = BIND_POSE_TOLERANCE) {
  for (let index = 0; index < 16; index += 1) {
    const scale = Math.max(1, Math.abs(expected[index]));
    if (Math.abs(actual[index] - expected[index]) > tolerance * scale) return false;
  }
  return true;
}
function nodeMatrix(node, label) {
  if (node.matrix !== undefined) {
    if (node.translation !== undefined || node.rotation !== undefined || node.scale !== undefined) {
      reject(`${label}.matrix cannot coexist with TRS`);
    }
    const values = requireArray(node.matrix, `${label}.matrix`);
    if (values.length !== 16) reject(`${label}.matrix must contain 16 values`);
    return new Float64Array(values.map((v, i) => finite(v, `${label}.matrix[${i}]`)));
  }
  const t = node.translation === undefined ? [0,0,0] : requireArray(node.translation, `${label}.translation`);
  const r = node.rotation === undefined ? [0,0,0,1] : requireArray(node.rotation, `${label}.rotation`);
  const s = node.scale === undefined ? [1,1,1] : requireArray(node.scale, `${label}.scale`);
  if (t.length !== 3 || r.length !== 4 || s.length !== 3) reject(`${label} TRS has invalid tuple length`);
  const [x,y,z,w] = r.map((v,i) => finite(v, `${label}.rotation[${i}]`));
  const mag = Math.hypot(x,y,z,w);
  if (Math.abs(mag - 1) > 1e-4) reject(`${label}.rotation must be normalized`);
  const [sx,sy,sz] = s.map((v,i) => finite(v, `${label}.scale[${i}]`));
  if (sx === 0 || sy === 0 || sz === 0) reject(`${label}.scale cannot contain zero`);
  const [tx,ty,tz] = t.map((v,i) => finite(v, `${label}.translation[${i}]`));
  const xx=x*x, yy=y*y, zz=z*z, xy=x*y, xz=x*z, yz=y*z, wx=w*x, wy=w*y, wz=w*z;
  return new Float64Array([
    (1-2*(yy+zz))*sx, (2*(xy+wz))*sx, (2*(xz-wy))*sx, 0,
    (2*(xy-wz))*sy, (1-2*(xx+zz))*sy, (2*(yz+wx))*sy, 0,
    (2*(xz+wy))*sz, (2*(yz-wx))*sz, (1-2*(xx+yy))*sz, 0,
    tx,ty,tz,1,
  ]);
}
function transformPoint(m, x, y, z) {
  return [m[0]*x+m[4]*y+m[8]*z+m[12], m[1]*x+m[5]*y+m[9]*z+m[13], m[2]*x+m[6]*y+m[10]*z+m[14]];
}
function transformNormal(m, x, y, z) {
  const a=m[0], b=m[4], c=m[8], d=m[1], e=m[5], f=m[9], g=m[2], h=m[6], i=m[10];
  const A=e*i-f*h, B=c*h-b*i, C=b*f-c*e, D=f*g-d*i, E=a*i-c*g, F=c*d-a*f, G=d*h-e*g, H=b*g-a*h, I=a*e-b*d;
  const det=a*A+b*D+c*G;
  if (Math.abs(det) < 1e-12) reject('node transform has a singular normal matrix');
  const nx=(A*x+B*y+C*z)/det, ny=(D*x+E*y+F*z)/det, nz=(G*x+H*y+I*z)/det;
  const length=Math.hypot(nx,ny,nz) || 1;
  return [nx/length,ny/length,nz/length];
}

function componentInfo(type) {
  if (type === 5121) return { bytes:1, read:(v,o)=>v.getUint8(o) };
  if (type === 5123) return { bytes:2, read:(v,o)=>v.getUint16(o,true) };
  if (type === 5125) return { bytes:4, read:(v,o)=>v.getUint32(o,true) };
  if (type === 5126) return { bytes:4, read:(v,o)=>v.getFloat32(o,true) };
  reject(`unsupported accessor componentType ${type}`);
}
function typeWidth(type) {
  return ({SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16})[type] ?? reject(`unsupported accessor type ${String(type)}`);
}
function decodeAccessor(doc, binary, index, expectedType, allowedComponents, label) {
  const accessors = requireArray(doc.accessors, 'accessors');
  const accessorIndex = integer(index, label);
  const accessor = requireObject(accessors[accessorIndex], label);
  if (accessor.sparse !== undefined) reject(`${label}.sparse is unsupported`);
  if (accessor.bufferView === undefined) reject(`${label} must own a bufferView`);
  if (accessor.type !== expectedType) reject(`${label}.type must equal ${expectedType}`);
  const componentType = integer(accessor.componentType, `${label}.componentType`);
  if (!allowedComponents.includes(componentType)) reject(`${label}.componentType is unsupported`);
  const count = integer(accessor.count, `${label}.count`, 1);
  const width = typeWidth(accessor.type);
  const info = componentInfo(componentType);
  const views = requireArray(doc.bufferViews, 'bufferViews');
  const viewIndex = integer(accessor.bufferView, `${label}.bufferView`);
  const view = requireObject(views[viewIndex], `bufferViews[${viewIndex}]`);
  if (integer(view.buffer ?? 0, `bufferViews[${viewIndex}].buffer`) !== 0) reject('only buffer 0 is supported');
  const viewOffset = integer(view.byteOffset ?? 0, `bufferViews[${viewIndex}].byteOffset`);
  const accessorOffset = integer(accessor.byteOffset ?? 0, `${label}.byteOffset`);
  const elementBytes = info.bytes * width;
  const stride = integer(view.byteStride ?? elementBytes, `bufferViews[${viewIndex}].byteStride`, elementBytes);
  if (stride < elementBytes || stride % info.bytes !== 0) reject(`${label} byteStride is invalid`);
  if (viewOffset % info.bytes !== 0 || accessorOffset % info.bytes !== 0) reject(`${label} byte offsets violate component alignment`);
  const start = viewOffset + accessorOffset;
  const end = start + (count - 1) * stride + elementBytes;
  const viewLength = integer(view.byteLength, `bufferViews[${viewIndex}].byteLength`, 1);
  if (end > viewOffset + viewLength || end > binary.byteLength) reject(`${label} exceeds its bufferView`);
  const dataView = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  const values = new Array(count * width);
  for (let row=0; row<count; row+=1) for (let col=0; col<width; col+=1) {
    const value = info.read(dataView, start + row*stride + col*info.bytes);
    if (!Number.isFinite(value)) reject(`${label}[${row},${col}] must be finite`);
    values[row*width+col] = value;
  }
  return { values, count, componentType, normalized: accessor.normalized === true, accessor };
}

function validateDeclaredPositionBounds(accessor, positions, label) {
  const minimum = requireArray(accessor.min, `${label}.min`);
  const maximum = requireArray(accessor.max, `${label}.max`);
  if (minimum.length !== 3 || maximum.length !== 3) reject(`${label} min/max must contain three values`);
  const actualMin = [Infinity, Infinity, Infinity];
  const actualMax = [-Infinity, -Infinity, -Infinity];
  for (let index = 0; index < positions.values.length; index += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      actualMin[axis] = Math.min(actualMin[axis], positions.values[index + axis]);
      actualMax[axis] = Math.max(actualMax[axis], positions.values[index + axis]);
    }
  }
  for (let axis = 0; axis < 3; axis += 1) {
    const declaredMin = finite(minimum[axis], `${label}.min[${axis}]`);
    const declaredMax = finite(maximum[axis], `${label}.max[${axis}]`);
    if (Math.abs(declaredMin - actualMin[axis]) > 1e-4 || Math.abs(declaredMax - actualMax[axis]) > 1e-4) {
      reject(`${label} declared min/max differs from decoded data`);
    }
  }
}

function material(doc, index, label) {
  if (index === undefined) {
    return {
      name: null,
      baseColorFactor: [0.72,0.74,0.78,1],
      doubleSided: false,
      hasBaseColorTexture: false,
      sourceAlphaMode: 'OPAQUE',
    };
  }
  const materialLabel = `${label}.material`;
  const source = requireObject(
    requireArray(doc.materials ?? [], 'materials')[integer(index, materialLabel)],
    materialLabel,
  );
  const allowedMaterialKeys = new Set([
    'name',
    'pbrMetallicRoughness',
    'doubleSided',
    'alphaMode',
  ]);
  for (const key of Object.keys(source)) {
    if (!allowedMaterialKeys.has(key)) {
      reject(`${materialLabel}.${key} is unsupported by the R1 base-colour boundary`);
    }
  }
  if (
    source.doubleSided !== undefined &&
    typeof source.doubleSided !== 'boolean'
  ) {
    reject(`${materialLabel}.doubleSided must be boolean`);
  }
  const alphaMode = source.alphaMode ?? 'OPAQUE';
  if (alphaMode !== 'OPAQUE') {
    reject(`${materialLabel}.alphaMode must remain OPAQUE`);
  }

  const pbrLabel = `${materialLabel}.pbrMetallicRoughness`;
  const pbr = source.pbrMetallicRoughness === undefined
    ? {}
    : requireObject(source.pbrMetallicRoughness, pbrLabel);
  const allowedPbrKeys = new Set([
    'baseColorFactor',
    'baseColorTexture',
    'metallicFactor',
    'roughnessFactor',
  ]);
  for (const key of Object.keys(pbr)) {
    if (!allowedPbrKeys.has(key)) {
      reject(`${pbrLabel}.${key} is unsupported by the R1 base-colour boundary`);
    }
  }
  const metallicFactor = pbr.metallicFactor === undefined
    ? 1
    : finite(pbr.metallicFactor, `${pbrLabel}.metallicFactor`);
  const roughnessFactor = pbr.roughnessFactor === undefined
    ? 1
    : finite(pbr.roughnessFactor, `${pbrLabel}.roughnessFactor`);
  if (metallicFactor !== 0 || roughnessFactor !== 1) {
    reject(`${pbrLabel} must use metallicFactor=0 and roughnessFactor=1`);
  }

  const factor = pbr.baseColorFactor === undefined
    ? [1,1,1,1]
    : requireArray(pbr.baseColorFactor, `${pbrLabel}.baseColorFactor`);
  if (factor.length !== 4) {
    reject(`${pbrLabel}.baseColorFactor must contain four values`);
  }
  const baseColorFactor = factor.map((value, component) => {
    const finiteValue = finite(
      value,
      `${pbrLabel}.baseColorFactor[${component}]`,
    );
    if (finiteValue < 0 || finiteValue > 1) {
      reject(`${pbrLabel}.baseColorFactor must stay inside [0,1]`);
    }
    return finiteValue;
  });

  if (pbr.baseColorTexture !== undefined) {
    const texture = requireObject(
      pbr.baseColorTexture,
      `${pbrLabel}.baseColorTexture`,
    );
    const allowedTextureKeys = new Set(['index', 'texCoord']);
    for (const key of Object.keys(texture)) {
      if (!allowedTextureKeys.has(key)) {
        reject(`${pbrLabel}.baseColorTexture.${key} is unsupported`);
      }
    }
    integer(texture.index, `${pbrLabel}.baseColorTexture.index`);
    if (
      texture.texCoord !== undefined &&
      integer(texture.texCoord, `${pbrLabel}.baseColorTexture.texCoord`) !== 0
    ) {
      reject(`${pbrLabel}.baseColorTexture.texCoord must equal 0`);
    }
  }

  return {
    name: typeof source.name === 'string' ? source.name : null,
    baseColorFactor,
    doubleSided: source.doubleSided === true,
    hasBaseColorTexture: pbr.baseColorTexture !== undefined,
    sourceAlphaMode: alphaMode,
  };
}

function validateDocumentBoundary(doc, label) {
  const asset = requireObject(doc.asset, `${label}.asset`);
  if (asset.version !== '2.0' || asset.generator !== EXPECTED_GENERATOR) {
    reject(`${label} must be the exact supported Blockbench 5.1.4 glTF export`);
  }
  rejectNonEmptyArray(doc.animations, `${label}.animations`);
  rejectNonEmptyArray(doc.cameras, `${label}.cameras`);
  rejectNonEmptyArray(doc.extensionsUsed, `${label}.extensionsUsed`);
  rejectNonEmptyArray(doc.extensionsRequired, `${label}.extensionsRequired`);
  if (doc.extensions !== undefined) reject(`${label}.extensions is unsupported`);
}


export {
  EXPECTED_GENERATOR,
  ALLOWED_ATTRIBUTES,
  WEIGHT_TOLERANCE,
  reject,
  align4,
  requireObject,
  requireArray,
  finite,
  integer,
  decodeDataUri,
  identity,
  multiply,
  matrixClose,
  nodeMatrix,
  transformPoint,
  transformNormal,
  decodeAccessor,
  validateDeclaredPositionBounds,
  material,
  validateDocumentBoundary,
};
