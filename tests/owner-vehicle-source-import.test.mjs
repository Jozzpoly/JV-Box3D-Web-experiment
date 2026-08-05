import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectBlockbenchRigidSourceV1,
  buildOwnerM6RigidPackageR1,
} from '../tools/owner-vehicle/blockbench-owner-m6-r1.mjs';

function encodeFloat32(values) {
  const bytes = Buffer.alloc(values.length * 4);
  values.forEach((value, index) =>
    bytes.writeFloatLE(value, index * 4),
  );
  return bytes;
}

function encodeUint16(values) {
  const bytes = Buffer.alloc(values.length * 2);
  values.forEach((value, index) =>
    bytes.writeUInt16LE(value, index * 2),
  );
  return bytes;
}

function source({
  generator = 'Blockbench 5.1.4 glTF exporter',
  external = false,
  mode = 4,
  skinned = false,
  inverseBindCount = 1,
  badBindPose = false,
  extraAttribute = false,
  indices = [0, 1, 2],
  animations = undefined,
  matrixAndTrs = false,
} = {}) {
  const chunks = [];
  const bufferViews = [];
  const accessors = [];

  function append(bytes, target, byteStride) {
    let offset = chunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0,
    );
    const padding = (4 - (offset % 4)) % 4;
    if (padding > 0) {
      chunks.push(Buffer.alloc(padding));
      offset += padding;
    }
    const viewIndex = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: offset,
      byteLength: bytes.length,
      ...(target === undefined ? {} : { target }),
      ...(byteStride === undefined ? {} : { byteStride }),
    });
    chunks.push(bytes);
    return viewIndex;
  }

  function accessor({
    bytes,
    componentType,
    count,
    type,
    target,
    byteStride,
    min,
    max,
  }) {
    const bufferView = append(bytes, target, byteStride);
    const index = accessors.length;
    accessors.push({
      bufferView,
      componentType,
      count,
      type,
      ...(min === undefined ? {} : { min }),
      ...(max === undefined ? {} : { max }),
    });
    return index;
  }

  const positions = accessor({
    bytes: encodeFloat32([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
    ]),
    componentType: 5126,
    count: 3,
    type: 'VEC3',
    target: 34962,
    byteStride: 12,
    min: [0, 0, 0],
    max: [1, 1, 0],
  });
  const normals = accessor({
    bytes: encodeFloat32([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ]),
    componentType: 5126,
    count: 3,
    type: 'VEC3',
    target: 34962,
    byteStride: 12,
  });
  const uvs = accessor({
    bytes: encodeFloat32([
      0, 0,
      1, 0,
      0, 1,
    ]),
    componentType: 5126,
    count: 3,
    type: 'VEC2',
    target: 34962,
    byteStride: 8,
  });

  const attributes = {
    POSITION: positions,
    NORMAL: normals,
    TEXCOORD_0: uvs,
  };

  if (skinned) {
    attributes.JOINTS_0 = accessor({
      bytes: encodeUint16([
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
      ]),
      componentType: 5123,
      count: 3,
      type: 'VEC4',
      target: 34962,
      byteStride: 8,
    });
    attributes.WEIGHTS_0 = accessor({
      bytes: encodeFloat32([
        1, 0, 0, 0,
        1, 0, 0, 0,
        1, 0, 0, 0,
      ]),
      componentType: 5126,
      count: 3,
      type: 'VEC4',
      target: 34962,
      byteStride: 16,
    });
  }

  if (extraAttribute) {
    attributes.COLOR_0 = positions;
  }

  const indexAccessor = accessor({
    bytes: encodeUint16(indices),
    componentType: 5123,
    count: indices.length,
    type: 'SCALAR',
    target: 34963,
  });

  let inverseBindMatrices;
  if (skinned) {
    const matrices = [];
    for (
      let matrixIndex = 0;
      matrixIndex < inverseBindCount;
      matrixIndex += 1
    ) {
      matrices.push(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      );
    }
    inverseBindMatrices = accessor({
      bytes: encodeFloat32(matrices),
      componentType: 5126,
      count: inverseBindCount,
      type: 'MAT4',
    });
  }

  const binary = Buffer.concat(chunks);
  const meshNode = {
    name: 'Root',
    mesh: 0,
    ...(matrixAndTrs
      ? {
          matrix: [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
          ],
          translation: [2, 3, 4],
        }
      : { translation: [2, 3, 4] }),
    ...(skinned ? { children: [1], skin: 0 } : {}),
  };
  const nodes = skinned
    ? [
        meshNode,
        {
          name: 'Joint',
          ...(badBindPose
            ? { translation: [1, 0, 0] }
            : {}),
        },
      ]
    : [meshNode];

  const document = {
    asset: { version: '2.0', generator },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes,
    buffers: [
      {
        byteLength: binary.length,
        uri: external
          ? 'model.bin'
          : `data:application/octet-stream;base64,${binary.toString('base64')}`,
      },
    ],
    bufferViews,
    accessors,
    materials: [
      {
        name: 'Body',
        pbrMetallicRoughness: {
          baseColorFactor: [0.3, 0.4, 0.5, 1],
        },
      },
    ],
    meshes: [
      {
        primitives: [
          {
            attributes,
            indices: indexAccessor,
            material: 0,
            mode,
          },
        ],
      },
    ],
    ...(skinned
      ? {
          skins: [
            {
              inverseBindMatrices,
              joints: [1],
              skeleton: 1,
            },
          ],
        }
      : {}),
    ...(animations === undefined ? {} : { animations }),
  };

  return JSON.stringify(document);
}

test(
  'inspector flattens the active Blockbench scene into world-space rigid geometry',
  () => {
    const result = inspectBlockbenchRigidSourceV1(
      source(),
      'fixture',
    );
    assert.equal(result.vertexCount, 3);
    assert.equal(result.triangleCount, 1);
    assert.deepEqual(
      result.primitives[0].positions,
      [2, 3, 4, 3, 3, 4, 2, 4, 4],
    );
    assert.equal(result.bindPoseFlattening, 'NOT_REQUIRED');
  },
);

test(
  'Blockbench skin must prove its bind pose before rigid flattening',
  () => {
    const result = inspectBlockbenchRigidSourceV1(
      source({ skinned: true }),
      'skinned fixture',
    );
    assert.equal(result.skinCount, 1);
    assert.equal(result.validatedJointCount, 1);
    assert.equal(result.bindPoseFlattening, 'VERIFIED');
    assert.deepEqual(
      result.primitives[0].positions,
      [2, 3, 4, 3, 3, 4, 2, 4, 4],
    );
  },
);

test(
  'owner package is deterministic and covers the complete M6 visual contract',
  () => {
    const chassisText = source({ skinned: true });
    const wheelText = source({ skinned: true });
    const first = buildOwnerM6RigidPackageR1({
      chassisText,
      wheelText,
    });
    const second = buildOwnerM6RigidPackageR1({
      chassisText,
      wheelText,
    });
    assert.deepEqual(first.glb, second.glb);
    assert.equal(first.visualPackage.bindings.length, 26);
    assert.equal(
      first.report.output.sha256,
      second.report.output.sha256,
    );
    assert.equal(
      first.visualPackage.asset.byteLength,
      first.glb.byteLength,
    );
    assert.equal(first.report.output.textureRendering, 'NOT_IMPLEMENTED');
    assert.equal(first.report.output.diagnosticChannelCount, 21);
  },
);

test(
  'external buffers and non-triangle primitives fail closed',
  () => {
    assert.throws(
      () =>
        inspectBlockbenchRigidSourceV1(
          source({ external: true }),
        ),
      /embedded/,
    );
    assert.throws(
      () =>
        inspectBlockbenchRigidSourceV1(source({ mode: 1 })),
      /triangle primitive/,
    );
  },
);

test('unknown exporter versions fail closed', () => {
  assert.throws(
    () =>
      inspectBlockbenchRigidSourceV1(
        source({ generator: 'other' }),
      ),
    /exact supported Blockbench/,
  );
});

test(
  'unknown attributes and incomplete triangles fail closed',
  () => {
    assert.throws(
      () =>
        inspectBlockbenchRigidSourceV1(
          source({ extraAttribute: true }),
        ),
      /COLOR_0 is unsupported/,
    );
    assert.throws(
      () =>
        inspectBlockbenchRigidSourceV1(
          source({ indices: [0, 1] }),
        ),
      /divisible by three/,
    );
  },
);

test(
  'animations and matrix plus TRS cannot enter the rigid boundary',
  () => {
    assert.throws(
      () =>
        inspectBlockbenchRigidSourceV1(
          source({ animations: [{}] }),
        ),
      /animations is unsupported/,
    );
    assert.throws(
      () =>
        inspectBlockbenchRigidSourceV1(
          source({ matrixAndTrs: true }),
        ),
      /matrix cannot coexist with TRS/,
    );
  },
);

test(
  'skin count and bind-pose drift fail closed',
  () => {
    assert.throws(
      () =>
        inspectBlockbenchRigidSourceV1(
          source({
            skinned: true,
            inverseBindCount: 2,
          }),
        ),
      /count differs from joints/,
    );
    assert.throws(
      () =>
        inspectBlockbenchRigidSourceV1(
          source({
            skinned: true,
            badBindPose: true,
          }),
        ),
      /does not reproduce the mesh bind pose/,
    );
  },
);
