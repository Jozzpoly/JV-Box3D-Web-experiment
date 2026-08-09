import { createHash } from 'node:crypto';
import { align4 } from './blockbench-gltf-core.mjs';
import { inspectBlockbenchRigidPartsV1 } from './blockbench-gltf-rigid-parts.mjs';
import {
  parseM6FactoryConfig,
  cornerRestGeometry,
  requirePiece,
} from './owner-m6-full-rig-calibration-r2.mjs';
import { buildOwnerM6FullRigPackageR2 } from './owner-m6-full-rig-package-r2.mjs';
import {
  deriveFrontSuspensionReferencesR3,
  calibrateFrontWishbonePieceR3,
  calibrateFrontKnucklePieceR3,
} from './owner-m6-reference-calibration-r3.mjs';

const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;
const FRONT_CORNERS = Object.freeze(['fl', 'fr']);
const ARM_KINDS = Object.freeze(['upper', 'lower']);
const FRONT_KNUCKLE_PIECES = Object.freeze([
  ['Socket_ChassisMount_b', 'socket-chassismount-b'],
  ['Socket_WheelCenter', 'socket-wheelcenter'],
]);
const R2_NODE_PREFIX = 'JV_R2_';
const R3_NODE_PREFIX = 'JV_R3_';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function bounds(values) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < values.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], values[i + axis]);
      max[axis] = Math.max(max[axis], values[i + axis]);
    }
  }
  return { min, max };
}

function decodeGlb(glb) {
  const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
  if (view.getUint32(0, true) !== GLB_MAGIC || view.getUint32(4, true) !== GLB_VERSION) {
    throw new Error('Owner M6 R3 requires a valid GLB v2 R2 base.');
  }
  const jsonLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== GLB_JSON_CHUNK) {
    throw new Error('Owner M6 R3 requires JSON as the first GLB chunk.');
  }
  const json = JSON.parse(new TextDecoder().decode(glb.slice(20, 20 + jsonLength)).trim());
  const binaryHeader = 20 + jsonLength;
  const binaryLength = view.getUint32(binaryHeader, true);
  if (view.getUint32(binaryHeader + 4, true) !== GLB_BIN_CHUNK) {
    throw new Error('Owner M6 R3 requires BIN as the second GLB chunk.');
  }
  return {
    json,
    binary: glb.slice(binaryHeader + 8, binaryHeader + 8 + binaryLength),
  };
}

function paddedJson(value) {
  const raw = new TextEncoder().encode(JSON.stringify(value));
  const output = new Uint8Array(align4(raw.length));
  output.fill(0x20);
  output.set(raw);
  return output;
}

function encodeGlb(json, binary) {
  const jsonBytes = paddedJson(json);
  const binaryLength = align4(binary.length);
  const binaryBytes = new Uint8Array(binaryLength);
  binaryBytes.set(binary);
  const total = 12 + 8 + jsonBytes.length + 8 + binaryBytes.length;
  const glb = new Uint8Array(total);
  const view = new DataView(glb.buffer);
  view.setUint32(0, GLB_MAGIC, true);
  view.setUint32(4, GLB_VERSION, true);
  view.setUint32(8, total, true);
  view.setUint32(12, jsonBytes.length, true);
  view.setUint32(16, GLB_JSON_CHUNK, true);
  glb.set(jsonBytes, 20);
  const binaryHeader = 20 + jsonBytes.length;
  view.setUint32(binaryHeader, binaryBytes.length, true);
  view.setUint32(binaryHeader + 4, GLB_BIN_CHUNK, true);
  glb.set(binaryBytes, binaryHeader + 8);
  return glb;
}

function writeFloat32(binary, bufferView, values, label) {
  const expected = values.length * 4;
  if (bufferView.byteLength !== expected) {
    throw new Error(`${label} float32 byte length changed: ${expected} != ${bufferView.byteLength}`);
  }
  const view = new DataView(binary.buffer, binary.byteOffset + (bufferView.byteOffset ?? 0), bufferView.byteLength);
  for (let i = 0; i < values.length; i += 1) view.setFloat32(i * 4, values[i], true);
}

function writeUint16(binary, bufferView, values, label) {
  const expected = values.length * 2;
  if (bufferView.byteLength !== expected) {
    throw new Error(`${label} uint16 byte length changed: ${expected} != ${bufferView.byteLength}`);
  }
  const view = new DataView(binary.buffer, binary.byteOffset + (bufferView.byteOffset ?? 0), bufferView.byteLength);
  for (let i = 0; i < values.length; i += 1) view.setUint16(i * 2, values[i], true);
}

function replacePrimitive(json, binary, target, source, label) {
  const positionAccessor = json.accessors[target.attributes.POSITION];
  writeFloat32(binary, json.bufferViews[positionAccessor.bufferView], source.positions, `${label} positions`);
  const positionBounds = bounds(source.positions);
  positionAccessor.min = positionBounds.min;
  positionAccessor.max = positionBounds.max;

  if ((target.attributes.NORMAL === undefined) !== (source.normals === null)) {
    throw new Error(`${label} normal layout changed.`);
  }
  if (source.normals) {
    const normalAccessor = json.accessors[target.attributes.NORMAL];
    writeFloat32(binary, json.bufferViews[normalAccessor.bufferView], source.normals, `${label} normals`);
  }

  const indexAccessor = json.accessors[target.indices];
  if (indexAccessor.componentType !== 5123) {
    throw new Error(`${label} requires the preserved R2 uint16 index layout.`);
  }
  writeUint16(binary, json.bufferViews[indexAccessor.bufferView], source.indices, `${label} indices`);
}

function replaceBindingGeometry(decoded, visualPackage, bindingId, primitives) {
  const binding = visualPackage.bindings.find((candidate) => candidate.bindingId === bindingId);
  if (!binding) throw new Error(`Owner M6 R3 base is missing binding ${bindingId}.`);
  const node = decoded.json.nodes.find((candidate) => candidate.name === binding.nodeName);
  if (!node || node.mesh === undefined) throw new Error(`Owner M6 R3 base is missing mesh node ${binding.nodeName}.`);
  const mesh = decoded.json.meshes[node.mesh];
  if (mesh.primitives.length !== primitives.length) {
    throw new Error(`${bindingId} primitive count changed: ${primitives.length} != ${mesh.primitives.length}`);
  }
  for (let index = 0; index < primitives.length; index += 1) {
    replacePrimitive(decoded.json, decoded.binary, mesh.primitives[index], primitives[index], `${bindingId}[${index}]`);
  }
}

function renameR3Nodes(json, visualPackage) {
  for (const node of json.nodes) {
    if (typeof node.name === 'string' && node.name.startsWith(R2_NODE_PREFIX)) {
      node.name = `${R3_NODE_PREFIX}${node.name.slice(R2_NODE_PREFIX.length)}`;
    }
  }
  return visualPackage.bindings.map((binding) => ({
    ...binding,
    nodeName: binding.nodeName.startsWith(R2_NODE_PREFIX)
      ? `${R3_NODE_PREFIX}${binding.nodeName.slice(R2_NODE_PREFIX.length)}`
      : binding.nodeName,
  }));
}

export function buildOwnerM6FullRigPackageR3(input) {
  const r2 = buildOwnerM6FullRigPackageR2(input);
  const decoded = decodeGlb(r2.glb);
  decoded.json.asset = {
    ...decoded.json.asset,
    generator: 'JV Web owner M6 full rig R3 reference calibration',
  };

  const front = inspectBlockbenchRigidPartsV1(
    input.frontSuspensionText,
    'OneSided_Steering_Suspension_Rig.gltf',
  );
  const references = deriveFrontSuspensionReferencesR3(front);
  const config = parseM6FactoryConfig(input.factoryReceiptText);
  const armReports = {};
  const knuckleReports = {};

  for (const corner of FRONT_CORNERS) {
    const geometry = cornerRestGeometry(config, corner);
    armReports[corner] = {};
    for (const which of ARM_KINDS) {
      const pieceName = which === 'upper' ? 'Chassis_Top' : 'Chassis_Bottom';
      const piece = requirePiece(front, pieceName, `${corner} front suspension`);
      const calibrated = calibrateFrontWishbonePieceR3(piece, references, geometry, which);
      replaceBindingGeometry(decoded, r2.visualPackage, `owner.${corner}.${which}-arm`, calibrated.primitives);
      armReports[corner][which] = calibrated.report;
    }

    knuckleReports[corner] = {};
    for (const [pieceName, bindingToken] of FRONT_KNUCKLE_PIECES) {
      const piece = requirePiece(front, pieceName, `${corner} front upright`);
      const calibrated = calibrateFrontKnucklePieceR3(piece, references, geometry);
      replaceBindingGeometry(
        decoded,
        r2.visualPackage,
        `owner.${corner}.knuckle.${bindingToken}`,
        calibrated.primitives,
      );
      knuckleReports[corner][bindingToken] = calibrated.report;
    }
  }

  const bindings = renameR3Nodes(decoded.json, r2.visualPackage);
  const glb = encodeGlb(decoded.json, decoded.binary);
  const digest = sha256(glb);
  const visualPackage = Object.freeze({
    ...r2.visualPackage,
    id: 'm6-owner-full-rig-r3',
    displayName: 'M6 Owner Full Rig R3 Reference Calibration',
    asset: Object.freeze({
      kind: 'GLB',
      url: 'models/m6-owner-full-rig-r3.glb',
      sha256: digest,
      byteLength: glb.length,
    }),
    bindings: Object.freeze(bindings),
  });

  const calibrationCorners = Object.fromEntries(
    Object.entries(r2.report.calibration.corners).map(([corner, value]) => [
      corner,
      FRONT_CORNERS.includes(corner)
        ? Object.freeze({
            ...value,
            arms: Object.freeze(armReports[corner]),
            knuckle: Object.freeze(knuckleReports[corner]),
          })
        : value,
    ]),
  );
  const report = Object.freeze({
    ...r2.report,
    schema: 'JV_WEB_OWNER_M6_FULL_RIG_R3',
    calibrationStrategy: Object.freeze({
      frontWishbones: 'R3_AUTHORED_REFERENCE_PATCH_OVER_EXACT_R2',
      frontKnuckle: 'R3_AUTHORED_UPRIGHT_REFERENCE_PATCH_OVER_EXACT_R2',
      rearWishbones: 'R2_BOUNDS_INHERITED',
      otherSubsystems: 'R2_BYTE_LAYOUT_INHERITED',
    }),
    calibration: Object.freeze({ corners: Object.freeze(calibrationCorners) }),
    output: Object.freeze({
      ...r2.report.output,
      byteLength: glb.length,
      sha256: digest,
    }),
  });

  return Object.freeze({
    glb,
    visualPackage,
    manifestText: `${JSON.stringify(visualPackage, null, 2)}\n`,
    report,
  });
}
