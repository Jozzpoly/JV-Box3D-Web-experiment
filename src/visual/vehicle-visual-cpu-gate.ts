import type { GlbRigidCpuAssetV1 } from "./glb-rigid-mesh-decoder.js";
import type { VehicleVisualPackageV1 } from "./vehicle-visual-package.js";

export interface VehicleVisualCpuOwnershipReceiptV1 {
  readonly boundRootCount: number;
  readonly ownedNodeCount: number;
  readonly ownedMeshNodeCount: number;
}

function reject(message: string): never {
  throw new Error(`Vehicle visual CPU ownership rejected: ${message}`);
}

export function assertVehicleVisualCpuOwnershipV1(
  visual: VehicleVisualPackageV1,
  asset: GlbRigidCpuAssetV1,
): VehicleVisualCpuOwnershipReceiptV1 {
  const nodeOwner = new Map<number, string>();
  let ownedMeshNodeCount = 0;

  const visit = (nodeIndex: number, owner: string): number => {
    const node = asset.nodes[nodeIndex];
    if (node === undefined) {
      reject(`${owner} references missing node ${nodeIndex}`);
    }
    const existingOwner = nodeOwner.get(nodeIndex);
    if (existingOwner !== undefined) {
      reject(
        `node ${nodeIndex} is owned by both ${existingOwner} and ${owner}`,
      );
    }
    nodeOwner.set(nodeIndex, owner);
    let meshNodeCount = node.meshIndex === null ? 0 : 1;
    if (node.meshIndex !== null) {
      ownedMeshNodeCount += 1;
    }
    for (const child of node.children) {
      meshNodeCount += visit(child, owner);
    }
    return meshNodeCount;
  };

  for (const binding of visual.bindings) {
    const rootIndex = asset.nodeIndexByName.get(binding.nodeName);
    if (rootIndex === undefined) {
      reject(`bound root is missing: ${binding.nodeName}`);
    }
    if (!asset.rootNodeIndices.includes(rootIndex)) {
      reject(`bound node is not a root: ${binding.nodeName}`);
    }
    if (visit(rootIndex, binding.bindingId) === 0) {
      reject(`binding ${binding.bindingId} owns no renderable mesh node`);
    }
  }

  for (const node of asset.nodes) {
    if (node.meshIndex !== null && !nodeOwner.has(node.index)) {
      reject(
        `mesh node ${node.name ?? `#${node.index}`} is outside every binding root`,
      );
    }
  }

  return Object.freeze({
    boundRootCount: visual.bindings.length,
    ownedNodeCount: nodeOwner.size,
    ownedMeshNodeCount,
  });
}
