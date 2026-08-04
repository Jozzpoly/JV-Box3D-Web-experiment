import { createRigidMeshGpuAssetV1, type RigidMeshGpuAssetV1 } from "./rigid-mesh-gpu-asset.js";
import {
  loadVehicleVisualRuntimeV1,
  type LoadedVehicleVisualRuntimeV1,
  type VehicleVisualFetcherV1,
} from "../visual/vehicle-visual-runtime-loader.js";

export interface VehicleVisualRenderResourceV1 {
  readonly runtime: LoadedVehicleVisualRuntimeV1;
  readonly gpuAsset: RigidMeshGpuAssetV1;
  readonly disposed: boolean;
  dispose(): void;
}

export type VehicleVisualRuntimeValidatorV1 = (
  runtime: LoadedVehicleVisualRuntimeV1,
) => void;

function abortError(): DOMException {
  return new DOMException("Vehicle visual load was aborted.", "AbortError");
}

export async function createVehicleVisualRenderResourceV1(
  gl: WebGLRenderingContext,
  pageBaseUrl: string,
  packageUrl: string,
  options: Readonly<{
    signal?: AbortSignal;
    fetcher?: VehicleVisualFetcherV1;
    validateRuntime?: VehicleVisualRuntimeValidatorV1;
  }> = {},
): Promise<VehicleVisualRenderResourceV1> {
  if (options.signal?.aborted) {
    throw abortError();
  }
  const runtime = await loadVehicleVisualRuntimeV1(
    pageBaseUrl,
    packageUrl,
    options,
  );
  if (options.signal?.aborted) {
    throw abortError();
  }
  options.validateRuntime?.(runtime);
  if (options.signal?.aborted) {
    throw abortError();
  }

  const gpuAsset = createRigidMeshGpuAssetV1(gl, runtime.cpuAsset);
  try {
    if (gpuAsset.gpuByteLength !== runtime.budgetReceipt.geometryBytes) {
      throw new Error(
        `Vehicle visual GPU byte accounting ${gpuAsset.gpuByteLength} differs from decoded geometry ${runtime.budgetReceipt.geometryBytes}.`,
      );
    }
    if (options.signal?.aborted) {
      throw abortError();
    }

    let isDisposed = false;
    return Object.freeze({
      runtime,
      gpuAsset,
      get disposed(): boolean {
        return isDisposed;
      },
      dispose(): void {
        if (isDisposed) {
          return;
        }
        isDisposed = true;
        gpuAsset.dispose();
      },
    });
  } catch (error: unknown) {
    gpuAsset.dispose();
    throw error;
  }
}
