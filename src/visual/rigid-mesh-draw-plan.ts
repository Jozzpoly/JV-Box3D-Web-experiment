import type { VehicleVisualFrameV1 } from "../runtime/vehicle-visual-frame.js";
import { resolveM6OwnerWheelVisualProfile } from "./m6-owner-wheel-visual-profile.js";
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

const M6_OWNER_R3_VISUAL_PACKAGE_ID = "m6-owner-full-rig-r3" as const;

function browserSearch(): string {
  return typeof window === "undefined" ? "" : window.location.search;
}

function localWidthScaleMatrix(scale: number): VehicleVisualMatrixV1 {
  if (!Number.isFinite(scale) || !(scale > 0)) {
    throw new Error(`Owner wheel visual width scale must be finite and positive; received ${scale}.`);
  }
  return new Float32Array([
    1,0,0,0,
    0,scale,0,0,
    0,0,1,0,
    0,0,0,1,
  ]);
}

function ownerWheelRootTransform(
  runtime: LoadedVehicleVisualRuntimeV1,
  bindingId: string,
  worldFromNode: VehicleVisualMatrixV1,
  widthScale: number,
): VehicleVisualMatrixV1 {
  if (
    runtime.visualPackage.id !== M6_OWNER_R3_VISUAL_PACKAGE_ID ||
    !bindingId.endsWith(".wheel") ||
    widthScale === 1
  ) {
    return worldFromNode;
  }
  return multiplyVehicleVisualMatricesV1(
    worldFromNode,
    localWidthScaleMatrix(widthScale),
  );
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
  ownerWheelVisualWidthScale = resolveM6OwnerWheelVisualProfile(browserSearch()).widthScale,
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
    roots.set(
      nodeIndex,
      ownerWheelRootTransform(
        runtime,
        binding.bindingId,
        binding.worldFromNode,
        ownerWheelVisualWidthScale,
      ),
    );
  }
  return buildRigidMeshDrawPlanV1(runtime.cpuAsset, roots);
}
