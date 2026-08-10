import type { VehicleVisualFrameV1 } from "../runtime/vehicle-visual-frame.js";
import type { GlbRigidCpuAssetV1 } from "./glb-rigid-mesh-decoder.js";
import type { LoadedVehicleVisualRuntimeV1 } from "./vehicle-visual-runtime-loader.js";
import {
  multiplyVehicleVisualMatricesV1,
  resolveVehicleVisualBindingsV1,
  type VehicleVisualMatrixV1,
} from "./vehicle-visual-transform.js";

export interface RigidMeshDrawCommandV1 {
  readonly nodeIndex: number;
  readonly nodeName: string | null;
  readonly meshIndex: number;
  readonly worldFromNode: VehicleVisualMatrixV1;
}

export function buildRigidMeshDrawPlanV1(
  asset: GlbRigidCpuAssetV1,
  worldFromRoots: ReadonlyMap<number, VehicleVisualMatrixV1>,
): readonly RigidMeshDrawCommandV1[] {
  const commands: RigidMeshDrawCommandV1[] = [];
  const owned = new Set<number>();

  const visit = (
    nodeIndex: number,
    worldFromParent: VehicleVisualMatrixV1,
  ): void => {
    if (owned.has(nodeIndex)) {
      throw new Error(
        `Rigid mesh draw plan node ${nodeIndex} is owned more than once.`,
      );
    }
    const node = asset.nodes[nodeIndex];
    if (node === undefined) {
      throw new Error(`Rigid mesh draw plan references missing node ${nodeIndex}.`);
    }
    owned.add(nodeIndex);
    const worldFromNode = multiplyVehicleVisualMatricesV1(
      worldFromParent,
      node.localFromParent,
    );
    if (node.meshIndex !== null) {
      if (asset.meshes[node.meshIndex] === undefined) {
        throw new Error(
          `Rigid mesh draw plan node ${nodeIndex} references missing mesh ${node.meshIndex}.`,
        );
      }
      commands.push(
        Object.freeze({
          nodeIndex,
          nodeName: node.name,
          meshIndex: node.meshIndex,
          worldFromNode,
        }),
      );
    }
    for (const child of node.children) {
      visit(child, worldFromNode);
    }
  };

  for (const [rootIndex, worldFromRootParent] of worldFromRoots) {
    const node = asset.nodes[rootIndex];
    if (node === undefined) {
      throw new Error(`Rigid mesh draw plan root ${rootIndex} is missing.`);
    }
    if (!asset.rootNodeIndices.includes(rootIndex)) {
      throw new Error(`Rigid mesh draw plan node ${rootIndex} is not a root.`);
    }
    visit(rootIndex, worldFromRootParent);
  }

  return Object.freeze(commands);
}

export function buildVehicleVisualDrawPlanV1(
  runtime: LoadedVehicleVisualRuntimeV1,
  frame: VehicleVisualFrameV1,
): readonly RigidMeshDrawCommandV1[] {
  const resolved = resolveVehicleVisualBindingsV1(
    runtime.visualPackage,
    frame,
  );
  const roots = new Map<number, VehicleVisualMatrixV1>();
  for (const binding of resolved) {
    const nodeIndex = runtime.cpuAsset.nodeIndexByName.get(binding.nodeName);
    if (nodeIndex === undefined) {
      throw new Error(
        `Vehicle visual CPU asset is missing bound node ${binding.nodeName}.`,
      );
    }
    if (roots.has(nodeIndex)) {
      throw new Error(
        `Vehicle visual node ${binding.nodeName} has duplicate runtime ownership.`,
      );
    }
    roots.set(nodeIndex, binding.worldFromNode);
  }
  return buildRigidMeshDrawPlanV1(runtime.cpuAsset, roots);
}
