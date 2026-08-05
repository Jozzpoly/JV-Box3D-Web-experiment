import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectBlockbenchRigidSourceV1,
  buildOwnerM6RigidPackageR1,
} from '../tools/owner-vehicle/blockbench-owner-m6-r1.mjs';

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

function source(options = {}) {
  const {
    generator = 'Blockbench 5.1.4 glTF exporter',
    external = false,
    mode = 4,
    skinned = false,
    inverseBindCount = 1,
    badBindPose = false,
    extraAttribute = false,
    indices = [0, 1, 2],
    animations,
    matrixAndTrs = false,
    wheelMarkers = false,
    missingWheelMarker = null,
    duplicateWheelMarker = null,
  } = options;
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
  const accessor = ({
    bytes, componentType, count, type, target, byteStride, min, max,
  }) => {
    const index = accessors.length;
    accessors.push({
      bufferView: append(bytes, target, byteStride),
      componentType,
      count,
      type,
      ...(min === undefined ? {} : { min }),
      ...(max === undefined ? {} : { max }),
    });
    return index;
  };

  const position = accessor({
    bytes: f32([0,0,0, 1,0,0, 0,1,0]),
    componentType: 5126,
    count: 3,
    type: 'VEC3',
    target: 34962,
    byteStride: 12,
    min: [0,0,0],
    max: [1,1,0],
  });
  const normal = accessor({
    bytes: f32([0,0,1, 0,0,1, 0,0,1]),
    componentType: 5126,
    count: 3,
    type: 'VEC3',
    target: 34962,
    byteStride: 12,
  });
  const uv = accessor({
    bytes: f32([0,0, 1,0, 0,1]),
    componentType: 5126,
    count: 3,
    type: 'VEC2',
    target: 34962,
    byteStride: 8,
  });
  const attributes = {
    POSITION: position,
    NORMAL: normal,
    TEXCOORD_0: uv,
  };
  if (skinned) {
    attributes.JOINTS_0 = accessor({
      bytes: u16([0,0,0,0, 0,0,0,0, 0,0,0,0]),
      componentType: 5123,
      count: 3,
      type: 'VEC4',
      target: 34962,
      byteStride: 8,
    });
    attributes.WEIGHTS_0 = accessor({
      bytes: f32([1,0,0,0, 1,0,0,0, 1,0,0,0]),
      componentType: 5126,
      count: 3,
      type: 'VEC4',
      target: 34962,
      byteStride: 16,
    });
  }
  if (extraAttribute) attributes.COLOR_0 = position;
  const indexAccessor = accessor({
    bytes: u16(indices),
    componentType: 5123,
    count: indices.length,
    type: 'SCALAR',
    target: 34963,
  });

  let inverseBindMatrices;
  if (skinned) {
    const matrices = Array.from(
      { length: inverseBindCount },
      () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
    ).flat();
    inverseBindMatrices = accessor({
      bytes: f32(matrices),
      componentType: 5126,
      count: inverseBindCount,
      type: 'MAT4',
    });
  }

  const meshNode = {
    name: 'Root',
    mesh: 0,
    ...(matrixAndTrs
      ? {
          matrix: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
          translation: [2,3,4],
        }
      : { translation: [2,3,4] }),
    ...(skinned ? { skin: 0 } : {}),
  };
  const nodes = [meshNode];
  const children = [];
  if (skinned) {
    children.push(nodes.length);
    nodes.push({
      name: 'Joint',
      ...(badBindPose ? { translation: [1,0,0] } : {}),
    });
  }
  if (wheelMarkers) {
    for (const [name, translation] of [
      ['Socket_WheelMount', [-0.4,0,0]],
      ['Marker_TireRadiusOuter', [0,1,0]],
      ['Marker_TireWidthLeft', [-0.5,0,0]],
      ['Marker_TireWidthRight', [0.5,0,0]],
    ]) {
      if (name === missingWheelMarker) continue;
      children.push(nodes.length);
      nodes.push({ name, translation });
      if (name === duplicateWheelMarker) {
        children.push(nodes.length);
        nodes.push({ name, translation });
      }
    }
  }
  if (children.length > 0) meshNode.children = children;

  const binary = Buffer.concat(chunks);
  return JSON.stringify({
    asset: { version: '2.0', generator },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes,
    buffers: [{
      byteLength: binary.length,
      uri: external
        ? 'model.bin'
        : `data:application/octet-stream;base64,${binary.toString('base64')}`,
    }],
    bufferViews,
    accessors,
    materials: [{
      name: 'Body',
      pbrMetallicRoughness: { baseColorFactor: [0.3,0.4,0.5,1] },
    }],
    meshes: [{
      primitives: [{
        attributes,
        indices: indexAccessor,
        material: 0,
        mode,
      }],
    }],
    ...(skinned
      ? {
          skins: [{
            inverseBindMatrices,
            joints: [1],
            skeleton: 1,
          }],
        }
      : {}),
    ...(animations === undefined ? {} : { animations }),
  });
}

test('inspector flattens active Blockbench geometry into world space', () => {
  const result = inspectBlockbenchRigidSourceV1(source(), 'fixture');
  assert.equal(result.vertexCount, 3);
  assert.equal(result.triangleCount, 1);
  assert.deepEqual(
    result.primitives[0].positions,
    [2,3,4, 3,3,4, 2,4,4],
  );
  assert.equal(result.bindPoseFlattening, 'NOT_REQUIRED');
});

test('skinned source must prove bind pose before rigid flattening', () => {
  const result = inspectBlockbenchRigidSourceV1(
    source({ skinned: true }),
    'skinned fixture',
  );
  assert.equal(result.skinCount, 1);
  assert.equal(result.validatedJointCount, 1);
  assert.equal(result.bindPoseFlattening, 'VERIFIED');
  assert.deepEqual(result.primitives[0].positions, [2,3,4, 3,3,4, 2,4,4]);
});

test('owner package is deterministic, calibrated and covers M6', () => {
  const chassisText = source({ skinned: true });
  const wheelText = source({ skinned: true, wheelMarkers: true });
  const first = buildOwnerM6RigidPackageR1({ chassisText, wheelText });
  const second = buildOwnerM6RigidPackageR1({ chassisText, wheelText });
  assert.deepEqual(first.glb, second.glb);
  assert.equal(first.visualPackage.bindings.length, 26);
  assert.equal(first.report.output.sha256, second.report.output.sha256);
  assert.equal(first.visualPackage.asset.byteLength, first.glb.byteLength);
  assert.equal(first.report.output.textureRendering, 'NOT_IMPLEMENTED');
  assert.equal(first.report.output.diagnosticChannelCount, 21);
  assert.equal(first.report.wheel.calibration.markerContract, 'VERIFIED');
  assert.equal(first.report.wheel.calibration.centerError, 0);
  assert.equal(first.report.wheel.calibration.mountAxisError, 0);
  assert.equal(first.report.wheel.calibration.requestedRadius, 0.514062464);
  assert.equal(first.report.wheel.calibration.requestedWidth, 0.4375);
  const chassis = first.visualPackage.bindings.find(
    (binding) => binding.source.kind === 'PART'
      && binding.source.partId === 'm6.chassis',
  );
  assert.deepEqual(chassis.localFromSource, {
    position: [0,-0.6,0],
    rotation: [0,-Math.SQRT1_2,0,Math.SQRT1_2],
    scale: [0.35,0.35,0.35],
  });
});

test('wheel marker contract fails closed for missing and duplicate markers', () => {
  const chassisText = source({ skinned: true });
  for (const [options, pattern] of [
    [{ missingWheelMarker: 'Marker_TireRadiusOuter' }, /missing required marker/],
    [{ duplicateWheelMarker: 'Socket_WheelMount' }, /marker Socket_WheelMount is duplicated/],
  ]) {
    assert.throws(
      () => buildOwnerM6RigidPackageR1({
        chassisText,
        wheelText: source({
          skinned: true,
          wheelMarkers: true,
          ...options,
        }),
      }),
      pattern,
    );
  }
});

test('external buffers and non-triangle primitives fail closed', () => {
  assert.throws(
    () => inspectBlockbenchRigidSourceV1(source({ external: true })),
    /embedded/,
  );
  assert.throws(
    () => inspectBlockbenchRigidSourceV1(source({ mode: 1 })),
    /triangle primitive/,
  );
});

test('unknown exporter versions fail closed', () => {
  assert.throws(
    () => inspectBlockbenchRigidSourceV1(source({ generator: 'other' })),
    /exact supported Blockbench/,
  );
});

test('unknown attributes and incomplete triangles fail closed', () => {
  assert.throws(
    () => inspectBlockbenchRigidSourceV1(source({ extraAttribute: true })),
    /COLOR_0 is unsupported/,
  );
  assert.throws(
    () => inspectBlockbenchRigidSourceV1(source({ indices: [0,1] })),
    /divisible by three/,
  );
});

test('animations and matrix plus TRS cannot enter rigid boundary', () => {
  assert.throws(
    () => inspectBlockbenchRigidSourceV1(source({ animations: [{}] })),
    /animations is unsupported/,
  );
  assert.throws(
    () => inspectBlockbenchRigidSourceV1(source({ matrixAndTrs: true })),
    /matrix cannot coexist with TRS/,
  );
});

test('skin count and bind-pose drift fail closed', () => {
  assert.throws(
    () => inspectBlockbenchRigidSourceV1(source({
      skinned: true,
      inverseBindCount: 2,
    })),
    /count differs from joints/,
  );
  assert.throws(
    () => inspectBlockbenchRigidSourceV1(source({
      skinned: true,
      badBindPose: true,
    })),
    /does not reproduce the mesh bind pose/,
  );
});
