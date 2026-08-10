import {
  WEIGHT_TOLERANCE,
  decodeAccessor,
  decodeDataUri,
  integer,
  requireArray,
  requireObject,
} from './blockbench-gltf-core.mjs';
import { inspectBlockbenchRigidSourceV1 } from './blockbench-gltf-inspector.mjs';

function reject(message) {
  throw new Error(`Owner vehicle rigid-part source rejected: ${message}`);
}

function singleJointSlot(joints, weights, vertex, jointCount, label) {
  let selected = -1;
  let selectedWeight = -1;
  let sum = 0;
  for (let slot = 0; slot < 4; slot += 1) {
    const joint = joints.values[vertex * 4 + slot];
    const weight = weights.values[vertex * 4 + slot];
    if (!Number.isInteger(joint) || joint < 0 || joint >= jointCount) {
      reject(`${label} vertex ${vertex} references unknown joint slot ${joint}`);
    }
    if (weight < 0 || weight > 1) {
      reject(`${label} vertex ${vertex} weight is outside [0,1]`);
    }
    sum += weight;
    if (weight > selectedWeight) {
      selectedWeight = weight;
      selected = joint;
    }
  }
  if (Math.abs(sum - 1) > WEIGHT_TOLERANCE) {
    reject(`${label} vertex ${vertex} weights do not sum to one`);
  }
  if (selectedWeight < 1 - WEIGHT_TOLERANCE) {
    reject(`${label} vertex ${vertex} is not rigidly owned by one joint`);
  }
  for (let slot = 0; slot < 4; slot += 1) {
    const weight = weights.values[vertex * 4 + slot];
    const joint = joints.values[vertex * 4 + slot];
    if (joint !== selected && weight > WEIGHT_TOLERANCE) {
      reject(`${label} vertex ${vertex} has non-rigid secondary joint influence`);
    }
  }
  return selected;
}

function remapPrimitive(sourcePrimitive, triangleIndices) {
  const sourceToOutput = new Map();
  const outputIndices = [];
  const positions = [];
  const normals = [];
  const uvs = [];

  const copyVertex = (sourceIndex) => {
    let outputIndex = sourceToOutput.get(sourceIndex);
    if (outputIndex !== undefined) return outputIndex;
    outputIndex = sourceToOutput.size;
    sourceToOutput.set(sourceIndex, outputIndex);
    positions.push(
      sourcePrimitive.positions[sourceIndex * 3],
      sourcePrimitive.positions[sourceIndex * 3 + 1],
      sourcePrimitive.positions[sourceIndex * 3 + 2],
    );
    normals.push(
      sourcePrimitive.normals[sourceIndex * 3],
      sourcePrimitive.normals[sourceIndex * 3 + 1],
      sourcePrimitive.normals[sourceIndex * 3 + 2],
    );
    uvs.push(
      sourcePrimitive.uvs[sourceIndex * 2],
      sourcePrimitive.uvs[sourceIndex * 2 + 1],
    );
    return outputIndex;
  };

  for (const sourceIndex of triangleIndices) {
    outputIndices.push(copyVertex(sourceIndex));
  }

  return Object.freeze({
    positions: Object.freeze(positions),
    normals: Object.freeze(normals),
    uvs: Object.freeze(uvs),
    indices: Object.freeze(outputIndices),
    material: sourcePrimitive.material,
  });
}

export function inspectBlockbenchRigidPartsV1(text, label = 'source') {
  const source = inspectBlockbenchRigidSourceV1(text, label);
  const doc = requireObject(JSON.parse(text), label);
  const buffers = requireArray(doc.buffers, `${label}.buffers`);
  if (buffers.length !== 1) reject(`${label} must contain exactly one buffer`);
  const binary = decodeDataUri(buffers[0].uri, `${label}.buffers[0].uri`);
  const nodes = requireArray(doc.nodes, `${label}.nodes`);
  const meshes = requireArray(doc.meshes, `${label}.meshes`);
  const skins = requireArray(doc.skins ?? [], `${label}.skins`);
  const sceneIndex = integer(doc.scene ?? 0, `${label}.scene`);
  const scene = requireObject(requireArray(doc.scenes, `${label}.scenes`)[sceneIndex], `${label}.scenes[${sceneIndex}]`);
  const roots = requireArray(scene.nodes, `${label}.scenes[${sceneIndex}].nodes`);

  const traversal = [];
  const visit = (nodeIndex) => {
    const node = requireObject(nodes[nodeIndex], `${label}.nodes[${nodeIndex}]`);
    traversal.push(nodeIndex);
    for (const child of requireArray(node.children ?? [], `${label}.nodes[${nodeIndex}].children`)) {
      visit(integer(child, `${label}.nodes[${nodeIndex}].children[]`));
    }
  };
  for (const root of roots) visit(integer(root, `${label}.scene.nodes[]`));

  const pieces = new Map();
  let inspectedPrimitiveIndex = 0;

  for (const nodeIndex of traversal) {
    const node = requireObject(nodes[nodeIndex], `${label}.nodes[${nodeIndex}]`);
    if (node.mesh === undefined) continue;
    if (node.skin === undefined) {
      reject(`${label}.nodes[${nodeIndex}] mesh must be skinned for rigid-part extraction`);
    }
    const skinIndex = integer(node.skin, `${label}.nodes[${nodeIndex}].skin`);
    const skin = requireObject(skins[skinIndex], `${label}.skins[${skinIndex}]`);
    const jointNodeIndices = requireArray(skin.joints, `${label}.skins[${skinIndex}].joints`).map((value, index) =>
      integer(value, `${label}.skins[${skinIndex}].joints[${index}]`),
    );
    const jointNames = jointNodeIndices.map((jointNodeIndex, slot) => {
      const jointNode = requireObject(nodes[jointNodeIndex], `${label}.nodes[${jointNodeIndex}]`);
      if (typeof jointNode.name !== 'string' || jointNode.name.length === 0) {
        reject(`${label}.skins[${skinIndex}].joints[${slot}] must have a name`);
      }
      return jointNode.name;
    });
    if (new Set(jointNames).size !== jointNames.length) {
      reject(`${label}.skins[${skinIndex}] joint names must be unique`);
    }

    const meshIndex = integer(node.mesh, `${label}.nodes[${nodeIndex}].mesh`);
    const mesh = requireObject(meshes[meshIndex], `${label}.meshes[${meshIndex}]`);
    const rawPrimitives = requireArray(mesh.primitives, `${label}.meshes[${meshIndex}].primitives`);
    for (let rawPrimitiveIndex = 0; rawPrimitiveIndex < rawPrimitives.length; rawPrimitiveIndex += 1) {
      const raw = requireObject(rawPrimitives[rawPrimitiveIndex], `${label}.meshes[${meshIndex}].primitives[${rawPrimitiveIndex}]`);
      const attributes = requireObject(raw.attributes, `${label}.meshes[${meshIndex}].primitives[${rawPrimitiveIndex}].attributes`);
      const joints = decodeAccessor(doc, binary, attributes.JOINTS_0, 'VEC4', [5121, 5123], `${label}.JOINTS_0`);
      const weights = decodeAccessor(doc, binary, attributes.WEIGHTS_0, 'VEC4', [5126], `${label}.WEIGHTS_0`);
      const indices = decodeAccessor(doc, binary, raw.indices, 'SCALAR', [5121, 5123, 5125], `${label}.indices`);
      const inspected = source.primitives[inspectedPrimitiveIndex];
      if (inspected === undefined) reject(`${label} primitive traversal differs from validated source`);
      inspectedPrimitiveIndex += 1;
      if (joints.count !== inspected.positions.length / 3 || weights.count !== joints.count) {
        reject(`${label} rigid-part skin vertex count differs from validated primitive`);
      }

      const ownerByVertex = new Array(joints.count);
      for (let vertex = 0; vertex < joints.count; vertex += 1) {
        ownerByVertex[vertex] = singleJointSlot(joints, weights, vertex, jointNames.length, label);
      }

      const trianglesByJoint = new Map();
      for (let offset = 0; offset < indices.values.length; offset += 3) {
        const triangle = indices.values.slice(offset, offset + 3);
        const a = ownerByVertex[triangle[0]];
        const b = ownerByVertex[triangle[1]];
        const c = ownerByVertex[triangle[2]];
        if (a !== b || a !== c) {
          reject(`${label} triangle ${offset / 3} mixes rigid joints ${a}/${b}/${c}`);
        }
        let list = trianglesByJoint.get(a);
        if (list === undefined) {
          list = [];
          trianglesByJoint.set(a, list);
        }
        list.push(...triangle);
      }

      for (const [jointSlot, triangleIndices] of trianglesByJoint.entries()) {
        const jointName = jointNames[jointSlot];
        let piece = pieces.get(jointName);
        if (piece === undefined) {
          piece = {
            jointName,
            jointSlot,
            jointNodeIndex: jointNodeIndices[jointSlot],
            primitives: [],
          };
          pieces.set(jointName, piece);
        }
        piece.primitives.push(remapPrimitive(inspected, triangleIndices));
      }
    }
  }

  if (inspectedPrimitiveIndex !== source.primitives.length) {
    reject(`${label} did not consume all validated primitives`);
  }

  const rigidPieces = Object.freeze(
    [...pieces.values()]
      .map((piece) => Object.freeze({
        ...piece,
        primitives: Object.freeze(piece.primitives),
        triangleCount: piece.primitives.reduce((sum, primitive) => sum + primitive.indices.length / 3, 0),
      }))
      .sort((a, b) => a.jointSlot - b.jointSlot),
  );
  return Object.freeze({ source, rigidPieces });
}
