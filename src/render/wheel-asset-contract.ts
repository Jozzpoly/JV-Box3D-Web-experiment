import * as THREE from 'three';
import { clone as cloneSkinnedHierarchy } from 'three/addons/utils/SkeletonUtils.js';

const EPSILON = 1e-6;
const REQUIRED_MARKERS = [
  'Socket_WheelMount',
  'Marker_TireRadiusOuter',
  'Marker_TireWidthLeft',
  'Marker_TireWidthRight',
] as const;

export interface WheelAssetContract {
  readonly transform: THREE.Matrix4;
  readonly authoredRadius: number;
  readonly authoredWidth: number;
  readonly radialScale: number;
  readonly axialScale: number;
  readonly sourceSkinnedMeshCount: number;
}

export interface WheelAssetReport {
  loaded: boolean;
  markerContract: boolean;
  cloneCount: number;
  sourceSkinnedMeshCount: number;
  uniqueSkeletonCount: number;
  independentSkeletons: boolean;
  authoredRadius: number;
  authoredWidth: number;
  requestedRadius: number;
  requestedWidth: number;
  radialScale: number;
  axialScale: number;
  radiusError: number;
  widthError: number;
  message: string;
}

export interface WheelCloneBatch {
  readonly objects: THREE.Object3D[];
  readonly report: WheelAssetReport;
}

export function resolveWheelAssetContract(
  source: THREE.Object3D,
  requestedRadius: number,
  requestedWidth: number,
): WheelAssetContract {
  if (!(requestedRadius > 0) || !(requestedWidth > 0)) {
    throw new Error(`physical wheel dimensions must be positive, got r=${requestedRadius}, w=${requestedWidth}`);
  }

  source.updateMatrixWorld(true);
  const markers = new Map<string, THREE.Vector3>();
  for (const name of REQUIRED_MARKERS) {
    const node = source.getObjectByName(name);
    if (!node) throw new Error(`wheel asset is missing required marker ${name}`);
    markers.set(name, node.getWorldPosition(new THREE.Vector3()));
  }

  const socket = requireMarker(markers, 'Socket_WheelMount');
  const radiusMarker = requireMarker(markers, 'Marker_TireRadiusOuter');
  const widthLeft = requireMarker(markers, 'Marker_TireWidthLeft');
  const widthRight = requireMarker(markers, 'Marker_TireWidthRight');

  const authoredAxle = widthRight.clone().sub(widthLeft);
  const authoredWidth = authoredAxle.length();
  if (authoredWidth < EPSILON) throw new Error('wheel width markers collapse to the same point');
  authoredAxle.multiplyScalar(1 / authoredWidth);

  const socketToRadius = radiusMarker.clone().sub(socket);
  const radialComponent = socketToRadius
    .clone()
    .addScaledVector(authoredAxle, -socketToRadius.dot(authoredAxle));
  const authoredRadius = radialComponent.length();
  if (authoredRadius < EPSILON) throw new Error('wheel radius marker lies on the authored axle');
  const authoredRadial = radialComponent.multiplyScalar(1 / authoredRadius);

  const authoredTangent = new THREE.Vector3().crossVectors(authoredAxle, authoredRadial);
  if (authoredTangent.lengthSq() < EPSILON * EPSILON) {
    throw new Error('wheel marker basis is degenerate');
  }
  authoredTangent.normalize();
  authoredRadial.crossVectors(authoredTangent, authoredAxle).normalize();

  // Box3D wheel bodies spin around local +Y. Keep the authored radius marker
  // pointing toward body +X; the third axis follows from a right-handed basis.
  const bodyAxle = new THREE.Vector3(0, 1, 0);
  const bodyRadial = new THREE.Vector3(1, 0, 0);
  const bodyTangent = new THREE.Vector3().crossVectors(bodyAxle, bodyRadial).normalize();

  const authoredBasis = new THREE.Matrix4().makeBasis(
    authoredAxle,
    authoredRadial,
    authoredTangent,
  );
  const bodyBasis = new THREE.Matrix4().makeBasis(bodyAxle, bodyRadial, bodyTangent);
  const radialScale = requestedRadius / authoredRadius;
  const axialScale = requestedWidth / authoredWidth;
  const dimensionScale = new THREE.Matrix4().makeScale(axialScale, radialScale, radialScale);

  const transform = bodyBasis
    .clone()
    .multiply(dimensionScale)
    .multiply(authoredBasis.clone().invert());
  const transformedSocket = socket.clone().applyMatrix4(transform);
  transform.setPosition(transformedSocket.multiplyScalar(-1));

  let sourceSkinnedMeshCount = 0;
  source.traverse((object) => {
    if (object instanceof THREE.SkinnedMesh) sourceSkinnedMeshCount += 1;
  });

  return {
    transform,
    authoredRadius,
    authoredWidth,
    radialScale,
    axialScale,
    sourceSkinnedMeshCount,
  };
}

export function cloneWheelAssetBatch(
  source: THREE.Object3D,
  contract: WheelAssetContract,
  count: number,
  requestedRadius: number,
  requestedWidth: number,
): WheelCloneBatch {
  if (!Number.isInteger(count) || count <= 0) throw new Error(`invalid wheel clone count ${count}`);

  const objects: THREE.Object3D[] = [];
  const skeletonIds = new Set<string>();
  let totalSkinnedMeshes = 0;

  for (let index = 0; index < count; index += 1) {
    // Object3D.clone(true) leaves SkinnedMesh clones sharing the original bone
    // hierarchy. SkeletonUtils creates an independent hierarchy per wheel.
    const clonedSource = cloneSkinnedHierarchy(source) as THREE.Object3D;
    clonedSource.name = `JV Offroad_Big_Wheels.gltf clone ${index + 1}`;
    clonedSource.traverse((object) => {
      if (!(object instanceof THREE.SkinnedMesh)) return;
      totalSkinnedMeshes += 1;
      skeletonIds.add(object.skeleton.uuid);
    });

    const contractRoot = new THREE.Group();
    contractRoot.name = `JV wheel marker contract ${index + 1}`;
    contractRoot.matrixAutoUpdate = false;
    contractRoot.matrix.copy(contract.transform);
    contractRoot.add(clonedSource);
    contractRoot.updateMatrixWorld(true);
    objects.push(contractRoot);
  }

  const expectedSkinnedMeshes = contract.sourceSkinnedMeshCount * count;
  const independentSkeletons = expectedSkinnedMeshes === 0
    || (totalSkinnedMeshes === expectedSkinnedMeshes && skeletonIds.size === expectedSkinnedMeshes);

  const transformedRadius = contract.authoredRadius * contract.radialScale;
  const transformedWidth = contract.authoredWidth * contract.axialScale;
  const radiusError = Math.abs(transformedRadius - requestedRadius);
  const widthError = Math.abs(transformedWidth - requestedWidth);

  return {
    objects,
    report: {
      loaded: true,
      markerContract: true,
      cloneCount: count,
      sourceSkinnedMeshCount: contract.sourceSkinnedMeshCount,
      uniqueSkeletonCount: skeletonIds.size,
      independentSkeletons,
      authoredRadius: contract.authoredRadius,
      authoredWidth: contract.authoredWidth,
      requestedRadius,
      requestedWidth,
      radialScale: contract.radialScale,
      axialScale: contract.axialScale,
      radiusError,
      widthError,
      message: independentSkeletons
        ? 'marker dimensions and independent wheel skeletons validated'
        : `wheel skeleton aliasing detected: ${skeletonIds.size}/${expectedSkinnedMeshes} unique`,
    },
  };
}

export function failedWheelAssetReport(
  requestedRadius: number,
  requestedWidth: number,
  error: unknown,
): WheelAssetReport {
  return {
    loaded: false,
    markerContract: false,
    cloneCount: 0,
    sourceSkinnedMeshCount: 0,
    uniqueSkeletonCount: 0,
    independentSkeletons: false,
    authoredRadius: 0,
    authoredWidth: 0,
    requestedRadius,
    requestedWidth,
    radialScale: 0,
    axialScale: 0,
    radiusError: Number.POSITIVE_INFINITY,
    widthError: Number.POSITIVE_INFINITY,
    message: error instanceof Error ? error.message : String(error),
  };
}

function requireMarker(markers: Map<string, THREE.Vector3>, name: string): THREE.Vector3 {
  const marker = markers.get(name);
  if (!marker) throw new Error(`missing wheel marker ${name}`);
  return marker;
}
