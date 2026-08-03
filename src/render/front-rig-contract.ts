import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type FrontRigRuntimeRole =
  | 'chassis'
  | 'nonSteeringCarrier'
  | 'knuckle'
  | 'rackToKnuckleStretch'
  | 'chassisToCarrierStretch'
  | 'lowerArmDamperEndpoint'
  | 'authoringAxis';

export interface FrontRigBindingSpec {
  readonly node: string;
  readonly role: FrontRigRuntimeRole;
  readonly m6Body: 'chassis' | 'lowerArm' | 'knuckle' | 'rack' | 'dynamic' | 'none';
}

export interface FrontRigContractReport {
  loaded: boolean;
  assetId: string;
  contractVersion: number;
  requiredNodeCount: number;
  resolvedNodeCount: number;
  missingNodes: string[];
  duplicateNodes: string[];
  skinnedMeshCount: number;
  uniqueSkeletonCount: number;
  nativeChassisMountBRidesBody: string;
  knownOwnershipDrift: boolean;
  ownershipSource: string;
  m6CarrierBody: 'lowerArm';
  message: string;
}

// Current M6 runtime ownership from jozz_vehicle_m6_rig_lab_steering_visual.cpp.
// The role name deliberately describes kinematics rather than a permanent body
// type: M9 used a carrier, while current M6 has no carrier body and maps the
// same non-steering/travelling role onto lowerArm.
export const FRONT_RIG_M6_BINDINGS: readonly FrontRigBindingSpec[] = [
  { node: 'Socket_SingleDamperUpper', role: 'chassis', m6Body: 'chassis' },
  { node: 'Socket_SingleDamper_Mount', role: 'chassis', m6Body: 'chassis' },
  { node: 'Socket_ChassisMount_a', role: 'chassis', m6Body: 'chassis' },
  { node: 'Chassis_Top', role: 'chassisToCarrierStretch', m6Body: 'dynamic' },
  { node: 'Socket_SingleDamperLower', role: 'lowerArmDamperEndpoint', m6Body: 'lowerArm' },
  { node: 'Chassis_Bottom', role: 'chassisToCarrierStretch', m6Body: 'dynamic' },
  { node: 'Socket_ChassisMount_b', role: 'nonSteeringCarrier', m6Body: 'lowerArm' },
  { node: 'Socket_SteeringRod', role: 'rackToKnuckleStretch', m6Body: 'dynamic' },
  { node: 'Socket_WheelCenter', role: 'knuckle', m6Body: 'knuckle' },
  { node: 'Socket_CardanDrive', role: 'chassis', m6Body: 'chassis' },
  { node: 'Socket_CardanHub', role: 'knuckle', m6Body: 'knuckle' },
  { node: 'Axis_SuspensionTravel_Top', role: 'authoringAxis', m6Body: 'none' },
  { node: 'Axis_SuspensionTravel_Bottom', role: 'authoringAxis', m6Body: 'none' },
] as const;

interface NativeFrontRigContract {
  assetId?: unknown;
  source?: { contractVersion?: unknown };
  semantics?: {
    sockets?: {
      chassisMountB?: { ridesBody?: unknown };
    };
  };
}

export async function loadFrontRigContractPreflight(): Promise<FrontRigContractReport> {
  try {
    const [gltf, response] = await Promise.all([
      new GLTFLoader().loadAsync('./assets/vehicle/OneSided_Steering_Suspension_Rig.gltf'),
      fetch('./assets/contracts/one_sided_steering_suspension.asset.json', { cache: 'no-store' }),
    ]);
    if (!response.ok) throw new Error(`native front-rig contract HTTP ${response.status}`);
    const native = await response.json() as NativeFrontRigContract;

    const nameCounts = new Map<string, number>();
    let skinnedMeshCount = 0;
    const skeletons = new Set<string>();
    gltf.scene.traverse((object) => {
      if (object.name) nameCounts.set(object.name, (nameCounts.get(object.name) ?? 0) + 1);
      if (object instanceof THREE.SkinnedMesh) {
        skinnedMeshCount += 1;
        skeletons.add(object.skeleton.uuid);
      }
    });

    const missingNodes = FRONT_RIG_M6_BINDINGS
      .map((binding) => binding.node)
      .filter((name) => !nameCounts.has(name));
    const duplicateNodes = FRONT_RIG_M6_BINDINGS
      .map((binding) => binding.node)
      .filter((name) => (nameCounts.get(name) ?? 0) > 1);
    const assetId = typeof native.assetId === 'string' ? native.assetId : '';
    const contractVersion = typeof native.source?.contractVersion === 'number'
      ? native.source.contractVersion
      : 0;
    const ridesBody = native.semantics?.sockets?.chassisMountB?.ridesBody;
    const nativeChassisMountBRidesBody = typeof ridesBody === 'string' ? ridesBody : '';

    // Known historical drift: the JSON is from the isolated M9 phase and says
    // knuckle. Later native commits separated WheelCenter from ChassisMount_b;
    // current M6 runtime uses lowerArm as the carrier substitute. Any different
    // value is unknown and must not be silently interpreted.
    const knownOwnershipDrift = nativeChassisMountBRidesBody === 'knuckle';
    const recognizedOwnership = knownOwnershipDrift
      || nativeChassisMountBRidesBody === 'carrier'
      || nativeChassisMountBRidesBody === 'lowerArm';
    const loaded = assetId === 'jozz.one_sided_steering_suspension.v0'
      && contractVersion >= 2
      && missingNodes.length === 0
      && duplicateNodes.length === 0
      && skinnedMeshCount > 0
      && recognizedOwnership;

    return {
      loaded,
      assetId,
      contractVersion,
      requiredNodeCount: FRONT_RIG_M6_BINDINGS.length,
      resolvedNodeCount: FRONT_RIG_M6_BINDINGS.length - missingNodes.length,
      missingNodes,
      duplicateNodes,
      skinnedMeshCount,
      uniqueSkeletonCount: skeletons.size,
      nativeChassisMountBRidesBody,
      knownOwnershipDrift,
      ownershipSource: 'current M6 runtime role map',
      m6CarrierBody: 'lowerArm',
      message: loaded
        ? knownOwnershipDrift
          ? 'GLTF complete; known M9 JSON ownership drift overridden by current M6 runtime role map'
          : 'GLTF and native semantic contract resolved'
        : `front-rig preflight failed: missing=${missingNodes.join(',') || '-'}, duplicates=${duplicateNodes.join(',') || '-'}, ridesBody=${nativeChassisMountBRidesBody || '-'}`,
    };
  } catch (error) {
    return failedFrontRigReport(error);
  }
}

function failedFrontRigReport(error: unknown): FrontRigContractReport {
  return {
    loaded: false,
    assetId: '',
    contractVersion: 0,
    requiredNodeCount: FRONT_RIG_M6_BINDINGS.length,
    resolvedNodeCount: 0,
    missingNodes: FRONT_RIG_M6_BINDINGS.map((binding) => binding.node),
    duplicateNodes: [],
    skinnedMeshCount: 0,
    uniqueSkeletonCount: 0,
    nativeChassisMountBRidesBody: '',
    knownOwnershipDrift: false,
    ownershipSource: 'current M6 runtime role map',
    m6CarrierBody: 'lowerArm',
    message: error instanceof Error ? error.message : String(error),
  };
}
