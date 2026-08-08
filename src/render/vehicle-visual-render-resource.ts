import { createRigidMeshGpuAssetV1, type RigidMeshGpuAssetV1 } from "./rigid-mesh-gpu-asset.js";
import {
  createRigidMeshGpuTextureAssetV1,
  type RigidMeshGpuTextureAssetV1,
  type VehicleTextureImageDecoderV1,
} from "./rigid-mesh-gpu-textures.js";
import {
  loadVehicleVisualRuntimeV1,
  type LoadedVehicleVisualRuntimeV1,
  type VehicleVisualFetcherV1,
} from "../visual/vehicle-visual-runtime-loader.js";

export interface VehicleVisualRenderResourceV1 {
  readonly runtime: LoadedVehicleVisualRuntimeV1;
  readonly gpuAsset: RigidMeshGpuAssetV1;
  readonly textureGpuAsset: RigidMeshGpuTextureAssetV1;
  readonly disposed: boolean;
  dispose(): void;
}

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
    imageDecoder?: VehicleTextureImageDecoderV1;
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

  const gpuAsset = createRigidMeshGpuAssetV1(gl, runtime.cpuAsset);
  let textureGpuAsset: RigidMeshGpuTextureAssetV1 | null = null;
  try {
    if (gpuAsset.gpuByteLength !== runtime.budgetReceipt.geometryBytes) {
      throw new Error(
        `Vehicle visual GPU byte accounting ${gpuAsset.gpuByteLength} differs from decoded geometry ${runtime.budgetReceipt.geometryBytes}.`,
      );
    }
    textureGpuAsset = await createRigidMeshGpuTextureAssetV1(
      gl,
      runtime.textureAsset,
      {
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.imageDecoder === undefined
          ? {}
          : { decoder: options.imageDecoder }),
      },
    );
    if (
      textureGpuAsset.gpuByteLength !==
      runtime.assetReceipt.texturePolicy.decodedTextureBytes
    ) {
      throw new Error(
        `Vehicle texture GPU byte accounting ${textureGpuAsset.gpuByteLength} differs from validated texture budget ${runtime.assetReceipt.texturePolicy.decodedTextureBytes}.`,
      );
    }
    if (options.signal?.aborted) {
      throw abortError();
    }

    const ownedTextureGpuAsset = textureGpuAsset;
    let isDisposed = false;
    return Object.freeze({
      runtime,
      gpuAsset,
      textureGpuAsset: ownedTextureGpuAsset,
      get disposed(): boolean {
        return isDisposed;
      },
      dispose(): void {
        if (isDisposed) {
          return;
        }
        isDisposed = true;
        ownedTextureGpuAsset.dispose();
        gpuAsset.dispose();
      },
    });
  } catch (error: unknown) {
    textureGpuAsset?.dispose();
    gpuAsset.dispose();
    throw error;
  }
}
