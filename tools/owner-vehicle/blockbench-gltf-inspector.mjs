import {
  EXPECTED_GENERATOR,
  ALLOWED_ATTRIBUTES,
  reject,
  requireObject,
  requireArray,
  integer,
  decodeDataUri,
  identity,
  multiply,
  nodeMatrix,
  transformPoint,
  transformNormal,
  decodeAccessor,
  validateDeclaredPositionBounds,
  parseTextureResources,
  material,
  validateDocumentBoundary,
} from './blockbench-gltf-core.mjs';
import {
  validateSkinForMeshNode,
  validateSkinAttributes,
} from './blockbench-gltf-skin.mjs';

export function inspectBlockbenchRigidSourceV1(text, label='source') {
  let doc;
  try {
    doc = JSON.parse(text);
  } catch (error) {
    throw new Error(`Owner vehicle source rejected: ${label} is not valid JSON`, {cause:error});
  }
  doc = requireObject(doc,label);
  validateDocumentBoundary(doc,label);

  const buffers = requireArray(doc.buffers, `${label}.buffers`);
  if (buffers.length !== 1) reject(`${label} must contain exactly one embedded buffer`);
  const buffer = requireObject(buffers[0], `${label}.buffers[0]`);
  const binary = decodeDataUri(buffer.uri, `${label}.buffers[0].uri`);
  if (integer(buffer.byteLength, `${label}.buffers[0].byteLength`, 1) !== binary.byteLength) {
    reject(`${label} embedded buffer length differs from declaration`);
  }
  const textureResources = parseTextureResources(doc, label);

  const scenes = requireArray(doc.scenes, `${label}.scenes`);
  if (scenes.length !== 1) reject(`${label} must contain exactly one active scene`);
  const sceneIndex = integer(doc.scene ?? 0, `${label}.scene`);
  if (sceneIndex !== 0) reject(`${label}.scene must identify the only scene`);
  const scene = requireObject(scenes[sceneIndex], `${label}.scenes[${sceneIndex}]`);
  const roots = requireArray(scene.nodes, `${label}.scene.nodes`).map((value,index)=>integer(value,`${label}.scene.nodes[${index}]`));
  if (roots.length === 0 || new Set(roots).size !== roots.length) reject(`${label}.scene.nodes must contain unique roots`);

  const nodes = requireArray(doc.nodes, `${label}.nodes`);
  const meshes = requireArray(doc.meshes, `${label}.meshes`);
  const visiting = new Set();
  const visited = new Set();
  const worldByNode = new Array(nodes.length);
  const traversal = [];
  const nodeNames = [];
  const nodeNameCounts = new Map();
  const nodeWorldPositionsByName = new Map();

  const visit = (nodeIndex, parentWorld) => {
    if (nodeIndex >= nodes.length) reject(`${label} node index ${nodeIndex} is out of range`);
    if (visiting.has(nodeIndex)) reject(`${label} node hierarchy contains a cycle`);
    if (visited.has(nodeIndex)) reject(`${label} node ${nodeIndex} has multiple parents`);
    const nodeLabel = `${label}.nodes[${nodeIndex}]`;
    const node = requireObject(nodes[nodeIndex], nodeLabel);
    if (node.camera !== undefined || node.weights !== undefined || node.extensions !== undefined) {
      reject(`${nodeLabel} contains unsupported runtime features`);
    }
    visiting.add(nodeIndex);
    visited.add(nodeIndex);
    const world = multiply(parentWorld, nodeMatrix(node,nodeLabel));
    worldByNode[nodeIndex] = world;
    traversal.push(nodeIndex);
    const nodeName = typeof node.name === 'string' && node.name.length > 0
      ? node.name
      : null;
    nodeNames.push(nodeName);
    if (nodeName !== null) {
      nodeNameCounts.set(nodeName, (nodeNameCounts.get(nodeName) ?? 0) + 1);
      nodeWorldPositionsByName.set(
        nodeName,
        Object.freeze([world[12], world[13], world[14]]),
      );
    }
    for (const [slot,child] of requireArray(node.children ?? [], `${nodeLabel}.children`).entries()) {
      visit(integer(child,`${nodeLabel}.children[${slot}]`),world);
    }
    visiting.delete(nodeIndex);
  };

  for (const root of roots) visit(root,identity());
  if (visited.size !== nodes.length) reject(`${label} contains nodes outside the active scene`);

  const primitives = [];
  const validatedSkins = new Map();

  for (const nodeIndex of traversal) {
    const node = requireObject(nodes[nodeIndex], `${label}.nodes[${nodeIndex}]`);
    if (node.mesh === undefined) {
      if (node.skin !== undefined) reject(`${label}.nodes[${nodeIndex}] has a skin without a mesh`);
      continue;
    }
    const meshIndex = integer(node.mesh, `${label}.nodes[${nodeIndex}].mesh`);
    const meshLabel = `${label}.meshes[${meshIndex}]`;
    const mesh = requireObject(meshes[meshIndex], meshLabel);
    if (mesh.weights !== undefined || mesh.extensions !== undefined) reject(`${meshLabel} contains unsupported runtime features`);

    const skin = validateSkinForMeshNode({
      doc,binary,node,nodeIndex,nodeWorld:worldByNode[nodeIndex],worldByNode,label,
    });
    if (skin !== null) {
      if (validatedSkins.has(skin.skinIndex)) reject(`${label}.skins[${skin.skinIndex}] is ambiguously reused`);
      validatedSkins.set(skin.skinIndex,skin);
    }

    const sourcePrimitives = requireArray(mesh.primitives, `${meshLabel}.primitives`);
    if (sourcePrimitives.length === 0) reject(`${meshLabel}.primitives cannot be empty`);

    for (const [primitiveIndex,raw] of sourcePrimitives.entries()) {
      const primitiveLabel = `${meshLabel}.primitives[${primitiveIndex}]`;
      const primitive = requireObject(raw,primitiveLabel);
      if ((primitive.mode ?? 4) !== 4 || primitive.targets !== undefined) {
        reject(`${primitiveLabel} must be one non-morphed triangle primitive`);
      }
      if (primitive.extensions !== undefined) reject(`${primitiveLabel}.extensions is unsupported`);
      if (primitive.indices === undefined) reject(`${primitiveLabel}.indices is required`);

      const attributes = requireObject(primitive.attributes,`${primitiveLabel}.attributes`);
      for (const attributeName of Object.keys(attributes)) {
        if (!ALLOWED_ATTRIBUTES.has(attributeName)) reject(`${primitiveLabel}.attributes.${attributeName} is unsupported`);
      }
      for (const required of ['POSITION','NORMAL','TEXCOORD_0']) {
        if (attributes[required] === undefined) reject(`${primitiveLabel}.${required} is required`);
      }

      const positions = decodeAccessor(doc,binary,attributes.POSITION,'VEC3',[5126],`${primitiveLabel}.POSITION`);
      const normals = decodeAccessor(doc,binary,attributes.NORMAL,'VEC3',[5126],`${primitiveLabel}.NORMAL`);
      const uvs = decodeAccessor(doc,binary,attributes.TEXCOORD_0,'VEC2',[5126],`${primitiveLabel}.TEXCOORD_0`);
      const indices = decodeAccessor(doc,binary,primitive.indices,'SCALAR',[5121,5123,5125],`${primitiveLabel}.indices`);

      if (positions.normalized || normals.normalized || uvs.normalized) {
        reject(`${primitiveLabel} float vertex attributes cannot be normalized`);
      }
      if (normals.count !== positions.count || uvs.count !== positions.count) {
        reject(`${primitiveLabel} vertex attribute counts differ`);
      }
      if (indices.count % 3 !== 0) reject(`${primitiveLabel}.indices count must be divisible by three`);

      validateDeclaredPositionBounds(positions.accessor,positions,`${primitiveLabel}.POSITION`);
      validateSkinAttributes({
        doc,binary,attributes,positionCount:positions.count,skin,label:primitiveLabel,
      });

      const outPositions = [];
      const outNormals = [];
      const world = worldByNode[nodeIndex];
      for (let vertex=0; vertex<positions.count; vertex+=1) {
        outPositions.push(...transformPoint(
          world,
          positions.values[vertex*3],
          positions.values[vertex*3+1],
          positions.values[vertex*3+2],
        ));
        outNormals.push(...transformNormal(
          world,
          normals.values[vertex*3],
          normals.values[vertex*3+1],
          normals.values[vertex*3+2],
        ));
      }
      for (const value of indices.values) {
        if (value >= positions.count) reject(`${primitiveLabel} index ${value} exceeds POSITION count ${positions.count}`);
      }
      if (positions.count > 65535 || indices.values.some((value)=>value>65535)) {
        reject(`${primitiveLabel} exceeds the mobile Uint16 boundary`);
      }
      primitives.push({
        positions:outPositions,
        normals:outNormals,
        uvs:uvs.values,
        indices:indices.values,
        material:material(doc,primitive.material,primitiveLabel),
        sourceNodeIndex:nodeIndex,
        sourceMeshIndex:meshIndex,
      });
    }
  }

  if (primitives.length === 0) reject(`${label} contains no renderable triangle primitive`);
  const declaredSkins = requireArray(doc.skins ?? [], `${label}.skins`);
  if (validatedSkins.size !== declaredSkins.length) reject(`${label} contains an unused skin`);

  const vertexCount = primitives.reduce((sum,primitive)=>sum+primitive.positions.length/3,0);
  const triangleCount = primitives.reduce((sum,primitive)=>sum+primitive.indices.length/3,0);
  const texturedMaterialCount = primitives.filter((primitive)=>primitive.material.baseColorTextureIndex !== null).length;
  const duplicateNodeNames = [...nodeNameCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([name]) => name)
    .sort();
  const uniqueNodeWorldPositions = Object.freeze(
    Object.fromEntries(
      [...nodeWorldPositionsByName.entries()]
        .filter(([name]) => nodeNameCounts.get(name) === 1)
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  );

  return Object.freeze({
    label,
    generator:EXPECTED_GENERATOR,
    nodeCount:visited.size,
    meshCount:meshes.length,
    primitiveCount:primitives.length,
    vertexCount,
    triangleCount,
    skinCount:validatedSkins.size,
    validatedJointCount:[...validatedSkins.values()].reduce((sum,skin)=>sum+skin.jointCount,0),
    bindPoseFlattening:validatedSkins.size>0?'VERIFIED':'NOT_REQUIRED',
    hasSkin:validatedSkins.size>0,
    hasEmbeddedImages:textureResources.images.length > 0,
    texturedMaterialCount,
    nodeNames:Object.freeze(nodeNames),
    duplicateNodeNames:Object.freeze(duplicateNodeNames),
    uniqueNodeWorldPositions,
    textureResources,
    primitives:Object.freeze(primitives),
  });
}
