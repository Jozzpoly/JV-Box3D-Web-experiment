import { createHash } from 'node:crypto';
import { align4 } from './blockbench-gltf-core.mjs';
import { inspectBlockbenchRigidSourceV1 } from './blockbench-gltf-inspector.mjs';
import { inspectBlockbenchRigidPartsV1 } from './blockbench-gltf-rigid-parts.mjs';
import {
  parseM6FactoryConfig,
  cornerRestGeometry,
  computeSuspensionPlacement,
  requirePiece,
} from './owner-m6-full-rig-calibration-r2.mjs';
import { buildOwnerM6FullRigPackageR2 } from './owner-m6-full-rig-package-r2.mjs';
import {
  deriveFrontSuspensionReferencesR3,
  calibrateFrontWishbonePieceR3,
  calibrateFrontChassisPieceR3,
  calibrateFrontKnucklePieceR3,
} from './owner-m6-reference-calibration-r3.mjs';
import {
  deriveRearSuspensionReferencesR3,
  calibrateRearWishbonePieceR3,
  calibrateRearKnucklePieceR3,
  calibrateRearChassisPieceR3,
  calibrateRearDamperPairsR3,
} from './owner-m6-rear-reference-calibration-r3.mjs';
import {
  calibrateCardanEndpointsR3,
  replaceCardanBindingSourcesR3,
} from './owner-m6-cardan-reference-calibration-r3.mjs';
import {
  deriveWheelMountInterfaceR3,
  wheelVisualLocalFromSourceR3,
} from './owner-m6-wheel-interface-calibration-r3.mjs';
import {
  deriveFrontUpperChassisMateR3,
  deriveFrontUpperSplitAuthorityR3,
} from './owner-m6-front-upper-chassis-mate-r3.mjs';

const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;
const FRONT_CORNERS = Object.freeze(['fl', 'fr']);
const REAR_CORNERS = Object.freeze(['rl', 'rr']);
const ARM_KINDS = Object.freeze(['upper', 'lower']);
const FRONT_KNUCKLE_PIECES = Object.freeze([
  ['Socket_ChassisMount_b', 'socket-chassismount-b'],
  ['Socket_WheelCenter', 'socket-wheelcenter'],
]);
const FRONT_CHASSIS_PIECES = Object.freeze([
  ['Socket_ChassisMount_a', 'socket-chassismount-a'],
  ['Socket_SingleDamper_Mount', 'socket-singledamper-mount'],
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


function pointDistance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function subtractPoint(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function crossPoint(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalizePoint(value, label) {
  const magnitude = Math.hypot(...value);
  if (!(magnitude > 1e-9)) throw new Error(`${label} is degenerate.`);
  return value.map((entry) => entry / magnitude);
}

function frontUpperReferenceUp(geometry, corner) {
  const axial = normalizePoint(
    subtractPoint(geometry.upperBall, geometry.upperHinge),
    `${corner} front upper pilot axial`,
  );
  const spread = normalizePoint(
    subtractPoint(geometry.upperRear, geometry.upperFront),
    `${corner} front upper pilot spread`,
  );
  let up = normalizePoint(
    crossPoint(axial, spread),
    `${corner} front upper pilot up`,
  );
  if (up[1] < 0) up = up.map((entry) => -entry);
  return up;
}

function replaceFrontUpperWishbonePilotBinding(bindings, pilot) {
  const bindingId = 'owner.fl.upper-arm';
  const byId = new Map(bindings.map((binding) => [binding.bindingId, binding]));
  const binding = byId.get(bindingId);
  if (!binding) throw new Error(`Owner M6 R3 base is missing pilot binding ${bindingId}.`);
  if (binding.source.kind !== 'PART' || binding.source.partId !== 'm6.fl.upper-arm') {
    throw new Error(`Owner M6 R3 pilot binding ${bindingId} has unexpected source semantics.`);
  }
  byId.set(bindingId, {
    ...binding,
    source: {
      kind: 'PART_PAIR_ROLL_PINNED_STRETCH',
      partId: 'm6.fl.upper-arm',
      startPartId: 'm6.chassis',
      startLocalPosition: pilot.chassisLocal,
      endPartId: 'm6.fl.upper-arm',
      endLocalPosition: pilot.outboardLocal,
      referenceStartPosition: pilot.referenceStartLocal,
      referenceEndPosition: pilot.referenceEndLocal,
      referenceUpDirection: pilot.referenceUpDirection,
      rollReferenceAxis: '+Y',
    },
  });
  return bindings.map((candidate) => byId.get(candidate.bindingId));
}

function replaceWheelBindingTransformsR3(bindings, wheelInterface) {
  const corners = ['fl', 'fr', 'rl', 'rr'];
  const byId = new Map(bindings.map((binding) => [binding.bindingId, binding]));
  for (const corner of corners) {
    const bindingId = `owner.${corner}.wheel`;
    const binding = byId.get(bindingId);
    if (!binding) throw new Error(`Owner M6 R3 base is missing wheel binding ${bindingId}.`);
    if (binding.source.kind !== 'PART' || binding.source.partId !== `m6.${corner}.wheel`) {
      throw new Error(`Owner M6 R3 wheel binding ${bindingId} has unexpected source semantics.`);
    }
    byId.set(bindingId, {
      ...binding,
      localFromSource: wheelVisualLocalFromSourceR3(corner, wheelInterface),
    });
  }
  return bindings.map((binding) => byId.get(binding.bindingId));
}


function replaceFrontDamperBindingSources(bindings, damperEndpoints) {
  const byId = new Map(bindings.map((binding) => [binding.bindingId, binding]));
  for (const corner of FRONT_CORNERS) {
    const endpoints = damperEndpoints[corner];
    const pairBase = {
      startPartId: 'm6.chassis',
      startLocalPosition: endpoints.upperChassisLocal,
      endPartId: `m6.${corner}.lower-arm`,
      endLocalPosition: endpoints.lowerArmLocal,
    };
    const replacements = {
      [`owner.${corner}.coilover.upper`]: {
        kind: 'PART_PAIR_ENDPOINT_AIM',
        ...pairBase,
        endpoint: 'START',
        axis: '-Y',
      },
      [`owner.${corner}.coilover.stretch`]: {
        kind: 'PART_PAIR_STRETCH',
        ...pairBase,
        axis: '+Y',
        referenceLengthMeters: byId.get(`owner.${corner}.coilover.stretch`)?.source.referenceLengthMeters,
      },
      [`owner.${corner}.coilover.lower`]: {
        kind: 'PART_PAIR_ENDPOINT_AIM',
        ...pairBase,
        endpoint: 'END',
        axis: '+Y',
      },
    };
    for (const [bindingId, source] of Object.entries(replacements)) {
      const binding = byId.get(bindingId);
      if (!binding) throw new Error(`Owner M6 R3 base is missing damper binding ${bindingId}.`);
      if (source.kind === 'PART_PAIR_STRETCH' && !(source.referenceLengthMeters > 0)) {
        throw new Error(`Owner M6 R3 base is missing damper reference length for ${bindingId}.`);
      }
      byId.set(bindingId, { ...binding, source });
    }
  }
  return bindings.map((binding) => byId.get(binding.bindingId));
}


function expandRearTwinDamperBindings(json, bindings, damperPairsByCorner) {
  const byId = new Map(bindings.map((binding) => [binding.bindingId, binding]));
  const added = [];
  const scene = json.scenes?.[json.scene ?? 0];
  if (!scene || !Array.isArray(scene.nodes)) {
    throw new Error('Owner M6 R3 rear twin dampers require an explicit root scene node list.');
  }

  const cloneNode = (sourceNodeName, newNodeName) => {
    const sourceIndex = json.nodes.findIndex((node) => node.name === sourceNodeName);
    if (sourceIndex < 0) throw new Error(`Owner M6 R3 rear damper source node is missing: ${sourceNodeName}.`);
    if (json.nodes.some((node) => node.name === newNodeName)) {
      throw new Error(`Owner M6 R3 rear damper clone node already exists: ${newNodeName}.`);
    }
    const cloneIndex = json.nodes.length;
    json.nodes.push({ ...json.nodes[sourceIndex], name: newNodeName });
    scene.nodes.push(cloneIndex);
  };

  const sourceFor = (component, pair, referenceLengthMeters = null) => {
    const pairBase = {
      startPartId: 'm6.chassis',
      startLocalPosition: pair.upperChassisLocal,
      endPartId: `m6.${pair.corner}.lower-arm`,
      endLocalPosition: pair.lowerArmLocal,
    };
    if (component === 'upper') {
      return { kind: 'PART_PAIR_ENDPOINT_AIM', ...pairBase, endpoint: 'START', axis: '-Y' };
    }
    if (component === 'stretch') {
      if (!(referenceLengthMeters > 0)) throw new Error(`Owner M6 R3 rear damper ${pair.corner} reference length is invalid.`);
      return { kind: 'PART_PAIR_STRETCH', ...pairBase, axis: '+Y', referenceLengthMeters };
    }
    if (component === 'lower') {
      return { kind: 'PART_PAIR_ENDPOINT_AIM', ...pairBase, endpoint: 'END', axis: '+Y' };
    }
    throw new Error(`Owner M6 R3 rear damper component is unknown: ${component}.`);
  };

  for (const corner of REAR_CORNERS) {
    const pairSet = damperPairsByCorner[corner];
    const fore = pairSet?.pairs.find((pair) => pair.role === 'FORE');
    const aft = pairSet?.pairs.find((pair) => pair.role === 'AFT');
    if (!fore || !aft) throw new Error(`Owner M6 R3 rear damper pair set is incomplete for ${corner}.`);
    const forePair = { ...fore, corner };
    const aftPair = { ...aft, corner };
    for (const component of ['upper', 'stretch', 'lower']) {
      const baseId = `owner.${corner}.coilover.${component}`;
      const base = byId.get(baseId);
      if (!base) throw new Error(`Owner M6 R3 base is missing rear damper binding ${baseId}.`);
      const referenceLengthMeters = component === 'stretch' ? base.source.referenceLengthMeters : null;
      byId.set(baseId, { ...base, source: sourceFor(component, forePair, referenceLengthMeters) });

      const addedId = `owner.${corner}.coilover-aft.${component}`;
      const addedNodeName = `JV_R3_Real_owner_${corner}_coilover_aft_${component}`;
      cloneNode(base.nodeName, addedNodeName);
      added.push({
        ...base,
        bindingId: addedId,
        nodeName: addedNodeName,
        source: sourceFor(component, aftPair, referenceLengthMeters),
      });
    }
  }
  return Object.freeze([...bindings.map((binding) => byId.get(binding.bindingId)), ...added]);
}

function addPhysicalCoiloverCoverageBindings(json, bindings) {
  const scene = json.scenes?.[json.scene ?? 0];
  if (!scene || !Array.isArray(scene.nodes)) {
    throw new Error('Owner M6 R3 physical coilover coverage requires an explicit root scene node list.');
  }
  const rackCoverage = bindings.find((binding) => binding.bindingId === 'diagnostic.rack.coverage');
  if (!rackCoverage) {
    throw new Error('Owner M6 R3 base is missing diagnostic.rack.coverage.');
  }
  const sourceIndex = json.nodes.findIndex((node) => node.name === rackCoverage.nodeName);
  if (sourceIndex < 0) {
    throw new Error(`Owner M6 R3 diagnostic source node is missing: ${rackCoverage.nodeName}.`);
  }
  const added = [];
  for (const corner of ['fl', 'fr', 'rl', 'rr']) {
    const bindingId = `diagnostic.${corner}.physical-coilover.coverage`;
    const nodeName = `JV_R3_Diagnostic_${corner}_physical_coilover_coverage`;
    if (bindings.some((binding) => binding.bindingId === bindingId)) {
      throw new Error(`Owner M6 R3 physical coilover coverage binding already exists: ${bindingId}.`);
    }
    if (json.nodes.some((node) => node.name === nodeName)) {
      throw new Error(`Owner M6 R3 physical coilover coverage node already exists: ${nodeName}.`);
    }
    const cloneIndex = json.nodes.length;
    json.nodes.push({ ...json.nodes[sourceIndex], name: nodeName });
    scene.nodes.push(cloneIndex);
    added.push({
      ...rackCoverage,
      bindingId,
      nodeName,
      source: {
        kind: 'SEGMENT_ENDPOINT_AIM',
        segmentId: `m6.${corner}.coilover`,
        endpoint: 'START',
        axis: '+Y',
      },
    });
  }
  return Object.freeze([...bindings, ...added]);
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

  const config = parseM6FactoryConfig(input.factoryReceiptText);
  const wheel = inspectBlockbenchRigidSourceV1(
    input.wheelText,
    'Offroad_Big_Wheels.gltf',
  );
  const wheelInterface = deriveWheelMountInterfaceR3(
    wheel,
    config.wheelRadius,
    config.wheelWidth,
  );
  const chassis = inspectBlockbenchRigidPartsV1(
    input.chassisText,
    'Nadwozie.gltf',
  );
  const front = inspectBlockbenchRigidPartsV1(
    input.frontSuspensionText,
    'OneSided_Steering_Suspension_Rig.gltf',
  );
  const references = deriveFrontSuspensionReferencesR3(front);
  const rear = inspectBlockbenchRigidPartsV1(
    input.rearSuspensionText,
    'One_Sided_wheel_mount.gltf',
  );
  const rearReferences = deriveRearSuspensionReferencesR3(rear);
  const armReports = {};
  const knuckleReports = {};
  const chassisReports = {};
  const damperReports = {};
  const damperEndpoints = {};
  const rearArmReports = {};
  const rearKnuckleReports = {};
  const rearChassisReports = {};
  const cardanReports = {};
  const cardanEndpoints = {};
  const rearDamperPairs = {};
  let frontUpperPilot = null;

  for (const corner of FRONT_CORNERS) {
    const geometry = cornerRestGeometry(config, corner);
    armReports[corner] = {};
    for (const which of ARM_KINDS) {
      const pieceName = which === 'upper' ? 'Chassis_Top' : 'Chassis_Bottom';
      const piece = requirePiece(front, pieceName, `${corner} front suspension`);
      const calibrated = calibrateFrontWishbonePieceR3(piece, references, geometry, which);
      replaceBindingGeometry(decoded, r2.visualPackage, `owner.${corner}.${which}-arm`, calibrated.primitives);
      armReports[corner][which] = calibrated.report;
      if (corner === 'fl' && which === 'upper') {
        const placement = computeSuspensionPlacement(
          front,
          config,
          corner,
          wheelInterface.mountOffsetMeters,
        );
        const authoredChassisIntentLocal = placement.point(references.upperHinge);
        const chassisMate = deriveFrontUpperChassisMateR3({
          chassis,
          authoredIntentLocal: authoredChassisIntentLocal,
          physicalUpperHingeLocal: geometry.upperHinge,
        });
        const splitAuthority = deriveFrontUpperSplitAuthorityR3({
          semanticChassisLocal: chassisMate.chassisLocal,
          physicalUpperFrontLocal: geometry.upperFront,
          physicalUpperRearLocal: geometry.upperRear,
          physicalUpperHingeLocal: geometry.upperHinge,
          physicalUpperBallLocal: geometry.upperBall,
        });
        frontUpperPilot = Object.freeze({
          chassisLocal: splitAuthority.chassisLocal,
          authoredChassisIntentLocal: Object.freeze([...authoredChassisIntentLocal]),
          chassisMate,
          splitAuthority,
          outboardLocal: Object.freeze([...calibrated.report.targetBallLocal]),
          referenceStartLocal: Object.freeze([...calibrated.report.mappedHinge]),
          referenceEndLocal: Object.freeze([...calibrated.report.mappedOutboard]),
          referenceUpDirection: Object.freeze(frontUpperReferenceUp(geometry, corner)),
        });
      }
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

    chassisReports[corner] = {};
    let chassisMapPoint = null;
    for (const [pieceName, bindingToken] of FRONT_CHASSIS_PIECES) {
      const piece = requirePiece(front, pieceName, `${corner} front chassis`);
      const calibrated = calibrateFrontChassisPieceR3(piece, references, geometry);
      replaceBindingGeometry(
        decoded,
        r2.visualPackage,
        `owner.${corner}.chassis-bracket.${bindingToken}`,
        calibrated.primitives,
      );
      chassisReports[corner][bindingToken] = calibrated.report;
      chassisMapPoint ??= calibrated.mapPoint;
    }
    if (chassisMapPoint === null) throw new Error(`${corner} front chassis calibration produced no map.`);
    const lowerPiece = requirePiece(front, 'Chassis_Bottom', `${corner} front lower wishbone damper endpoint`);
    const lowerArm = calibrateFrontWishbonePieceR3(lowerPiece, references, geometry, 'lower');
    const upperChassisLocal = chassisMapPoint(references.damperUpper);
    const lowerArmLocal = lowerArm.mapPoint(references.damperLower);
    const lowerRestWorld = [
      geometry.lowerHinge[0] + lowerArmLocal[0],
      geometry.lowerHinge[1] + lowerArmLocal[1],
      geometry.lowerHinge[2] + lowerArmLocal[2],
    ];
    damperEndpoints[corner] = Object.freeze({ upperChassisLocal, lowerArmLocal });
    damperReports[corner] = Object.freeze({
      treatment: 'VISUAL_AUTHORED_CHASSIS_TO_LOWER_ARM_PART_PAIR',
      upperChassisLocal,
      lowerArmLocal,
      restVisualLengthMeters: pointDistance(upperChassisLocal, lowerRestWorld),
      physicalSpringLengthMeters: pointDistance(geometry.coiloverChassis, geometry.coiloverKnuckle),
      referenceAuthority: Object.freeze({
        upper: references.provenance.damperUpper,
        lower: references.provenance.damperLower,
        physicalSpring: 'M6_COILOVER_CONSTRAINT_UNCHANGED',
      }),
    });
  }


  for (const corner of REAR_CORNERS) {
    const geometry = cornerRestGeometry(config, corner);
    rearArmReports[corner] = {};
    for (const which of ARM_KINDS) {
      const pieceName = which === 'upper' ? 'Chassis_Top' : 'Chassis_Bottom';
      const piece = requirePiece(rear, pieceName, `${corner} rear suspension`);
      const calibrated = calibrateRearWishbonePieceR3(piece, rearReferences, geometry, which);
      replaceBindingGeometry(decoded, r2.visualPackage, `owner.${corner}.${which}-arm`, calibrated.primitives);
      rearArmReports[corner][which] = calibrated.report;
    }

    const hubPiece = requirePiece(rear, 'Socket_WheelCenter', `${corner} rear hub`);
    const hub = calibrateRearKnucklePieceR3(hubPiece, rearReferences, geometry);
    replaceBindingGeometry(
      decoded,
      r2.visualPackage,
      `owner.${corner}.knuckle.socket-wheelcenter`,
      hub.primitives,
    );
    rearKnuckleReports[corner] = hub.report;

    const chassisPiece = requirePiece(rear, 'Socket_ChassisMount', `${corner} rear chassis`);
    const chassis = calibrateRearChassisPieceR3(chassisPiece, rearReferences, geometry);
    replaceBindingGeometry(
      decoded,
      r2.visualPackage,
      `owner.${corner}.chassis-bracket.socket-chassismount`,
      chassis.primitives,
    );
    rearChassisReports[corner] = chassis.report;

    rearDamperPairs[corner] = calibrateRearDamperPairsR3(rear, rearReferences, geometry);
  }

  const wheelBindings = replaceWheelBindingTransformsR3(
    renameR3Nodes(decoded.json, r2.visualPackage),
    wheelInterface,
  );
  const frontDamperBindings = replaceFrontDamperBindingSources(
    wheelBindings,
    damperEndpoints,
  );
  if (frontUpperPilot === null) {
    throw new Error('Owner M6 R3 front upper visual pilot was not derived.');
  }
  const frontUpperPilotBindings = replaceFrontUpperWishbonePilotBinding(
    frontDamperBindings,
    frontUpperPilot,
  );

  for (const corner of ['fl', 'fr', 'rl', 'rr']) {
    const isFront = FRONT_CORNERS.includes(corner);
    const endpoints = calibrateCardanEndpointsR3({
      chassis,
      suspension: isFront ? front : rear,
      references: isFront ? references : rearReferences,
      geometry: cornerRestGeometry(config, corner),
      corner,
    });
    cardanEndpoints[corner] = endpoints;
    cardanReports[corner] = endpoints.report;
  }

  const preCardanBindings = expandRearTwinDamperBindings(decoded.json, frontUpperPilotBindings, rearDamperPairs);
  const cardanBindings = replaceCardanBindingSourcesR3(preCardanBindings, cardanEndpoints);
  const bindings = addPhysicalCoiloverCoverageBindings(decoded.json, cardanBindings);
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
            chassis: Object.freeze(chassisReports[corner]),
            damperVisual: damperReports[corner],
          })
        : REAR_CORNERS.includes(corner)
          ? Object.freeze({
              ...value,
              arms: Object.freeze(rearArmReports[corner]),
              knuckle: rearKnuckleReports[corner],
              chassis: rearChassisReports[corner],
              damperVisual: rearDamperPairs[corner].report,
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
      frontChassis: 'R3_AUTHORED_CHASSIS_REFERENCE_PATCH_OVER_EXACT_R2',
      frontDamper: 'VISUAL_AUTHORED_CHASSIS_TO_LOWER_ARM_PART_PAIR',
      rearWishbones: 'R3_GEOMETRY_MATING_AND_CHASSIS_FACE_REFERENCE_PATCH_OVER_EXACT_R2',
      rearKnuckle: 'R3_GEOMETRY_MATING_UPRIGHT_REFERENCE_PATCH_OVER_EXACT_R2',
      rearChassis: 'R3_AUTHORED_CHASSIS_REFERENCE_PATCH_OVER_EXACT_R2',
      rearDamper: 'R3_AUTHORED_TWIN_CHASSIS_TO_LOWER_ARM_PART_PAIRS',
      cardan: 'R3_DIFFERENTIAL_OUTPUT_FACE_TO_AUTHORED_HUB_PART_PAIR',
      wheelMount: 'R3_AUTHORED_SOCKET_WHEELMOUNT_HANDED_VISUAL_INTERFACE',
      otherSubsystems: 'R2_BYTE_LAYOUT_INHERITED',
    }),
    calibration: Object.freeze({ corners: Object.freeze(calibrationCorners) }),
    cardanCalibration: Object.freeze(cardanReports),
    wheelInterface: Object.freeze({
      mountLocalPosition: wheelInterface.mountLocalPosition,
      mountOffsetMeters: wheelInterface.mountOffsetMeters,
      provenance: wheelInterface.provenance,
      treatment: 'WHEEL_CENTER_REMAINS_PHYSICAL_SPIN_CENTER_SOCKET_WHEELMOUNT_IS_VISUAL_HUB_INTERFACE',
    }),
    frontUpperPilot: Object.freeze({
      corner: 'fl',
      treatment: 'VISUAL_ONLY_ROLL_PINNED_SPLIT_AXIS_CHASSIS_TO_PHYSICAL_OUTBOARD',
      chassisLocal: frontUpperPilot.chassisLocal,
      authoredChassisIntentLocal: frontUpperPilot.authoredChassisIntentLocal,
      chassisMate: frontUpperPilot.chassisMate,
      splitAuthority: frontUpperPilot.splitAuthority,
      outboardLocal: frontUpperPilot.outboardLocal,
      referenceStartLocal: frontUpperPilot.referenceStartLocal,
      referenceEndLocal: frontUpperPilot.referenceEndLocal,
      referenceUpDirection: frontUpperPilot.referenceUpDirection,
      physics: 'UNCHANGED',
    }),
    output: Object.freeze({
      ...r2.report.output,
      byteLength: glb.length,
      sha256: digest,
      nodeCount: decoded.json.nodes.length,
      bindingCount: bindings.length,
      realBindingCount: bindings.filter((binding) => binding.nodeName.startsWith('JV_R3_Real_')).length,
      realBindingIds: Object.freeze(bindings.filter((binding) => binding.nodeName.startsWith('JV_R3_Real_')).map((binding) => binding.bindingId)),
      diagnosticBindingIds: Object.freeze(bindings.filter((binding) => binding.nodeName.includes('_Diagnostic_')).map((binding) => binding.bindingId)),
      rearDamperTreatment: 'AUTHORED_TWIN_PART_PAIR_NO_PHYSICS_CHANGE',
      physicalCoiloverCoverage: 'DIAGNOSTIC_SEGMENT_ENDPOINT_BINDINGS_NOT_RENDERED',
    }),
  });

  return Object.freeze({
    glb,
    visualPackage,
    manifestText: `${JSON.stringify(visualPackage, null, 2)}\n`,
    report,
  });
}
