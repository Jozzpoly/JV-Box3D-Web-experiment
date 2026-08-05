import {
  WEIGHT_TOLERANCE,
  reject,
  requireArray,
  requireObject,
  integer,
  decodeAccessor,
  matrixClose,
  multiply,
} from './blockbench-gltf-core.mjs';

function validateSkinForMeshNode({doc, binary, node, nodeIndex, nodeWorld, worldByNode, label}) {
  if (node.skin === undefined) return null;
  const skins = requireArray(doc.skins, `${label}.skins`);
  const skinIndex = integer(node.skin, `${label}.nodes[${nodeIndex}].skin`);
  const skinLabel = `${label}.skins[${skinIndex}]`;
  const skin = requireObject(skins[skinIndex], skinLabel);
  if (skin.inverseBindMatrices === undefined) reject(`${skinLabel}.inverseBindMatrices is required`);
  const joints = requireArray(skin.joints, `${skinLabel}.joints`).map((value,index)=>integer(value,`${skinLabel}.joints[${index}]`));
  if (joints.length === 0) reject(`${skinLabel}.joints cannot be empty`);
  if (new Set(joints).size !== joints.length) reject(`${skinLabel}.joints contains duplicates`);
  const skeleton = skin.skeleton === undefined ? null : integer(skin.skeleton, `${skinLabel}.skeleton`);
  if (skeleton !== null && !joints.includes(skeleton)) reject(`${skinLabel}.skeleton must be one of the joints`);
  const inverseBind = decodeAccessor(doc,binary,skin.inverseBindMatrices,'MAT4',[5126],`${skinLabel}.inverseBindMatrices`);
  if (inverseBind.normalized) reject(`${skinLabel}.inverseBindMatrices cannot be normalized`);
  if (inverseBind.count !== joints.length) reject(`${skinLabel}.inverseBindMatrices count differs from joints`);
  for (let slot=0; slot<joints.length; slot+=1) {
    const jointWorld = worldByNode[joints[slot]];
    if (jointWorld === undefined) reject(`${skinLabel}.joints[${slot}] is outside the active scene`);
    const inverseMatrix = new Float64Array(inverseBind.values.slice(slot*16,slot*16+16));
    if (!matrixClose(multiply(jointWorld,inverseMatrix),nodeWorld)) {
      reject(`${skinLabel}.joints[${slot}] does not reproduce the mesh bind pose`);
    }
  }
  return Object.freeze({skinIndex,jointCount:joints.length,skeleton,bindPoseFlattening:'VERIFIED'});
}

function validateSkinAttributes({doc,binary,attributes,positionCount,skin,label}) {
  const hasJoints = attributes.JOINTS_0 !== undefined;
  const hasWeights = attributes.WEIGHTS_0 !== undefined;
  if (hasJoints !== hasWeights) reject(`${label} JOINTS_0 and WEIGHTS_0 must appear together`);
  if (skin === null && (hasJoints || hasWeights)) reject(`${label} cannot contain skin attributes without a node skin`);
  if (skin !== null && (!hasJoints || !hasWeights)) reject(`${label} must contain JOINTS_0 and WEIGHTS_0 for its skin`);
  if (skin === null) return;
  const joints = decodeAccessor(doc,binary,attributes.JOINTS_0,'VEC4',[5121,5123],`${label}.JOINTS_0`);
  const weights = decodeAccessor(doc,binary,attributes.WEIGHTS_0,'VEC4',[5126],`${label}.WEIGHTS_0`);
  if (joints.normalized) reject(`${label}.JOINTS_0 cannot be normalized`);
  if (weights.normalized) reject(`${label}.WEIGHTS_0 float data cannot be normalized`);
  if (joints.count !== positionCount || weights.count !== positionCount) reject(`${label} skin attribute count differs from POSITION`);
  for (let vertex=0; vertex<positionCount; vertex+=1) {
    let sum = 0;
    for (let slot=0; slot<4; slot+=1) {
      const joint = joints.values[vertex*4+slot];
      const weight = weights.values[vertex*4+slot];
      if (!Number.isInteger(joint) || joint >= skin.jointCount) reject(`${label}.JOINTS_0 references an unknown joint`);
      if (weight < 0 || weight > 1) reject(`${label}.WEIGHTS_0 must stay inside [0,1]`);
      sum += weight;
    }
    if (Math.abs(sum - 1) > WEIGHT_TOLERANCE) reject(`${label}.WEIGHTS_0 must sum to one`);
  }
}


export { validateSkinForMeshNode, validateSkinAttributes };
