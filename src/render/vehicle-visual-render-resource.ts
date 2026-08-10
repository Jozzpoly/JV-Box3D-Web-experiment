import {
  createRigidMeshGpuAssetV1,
  type RigidMeshGpuAssetV1,
} from "./rigid-mesh-gpu-asset.js";
import {
  createVehicleVisualGpuTexturesV1,
  type VehicleVisualGpuTextureResourceV1,
  type VehicleVisualImageDecoderV1,
} from "./vehicle-visual-texture-gpu.js";
import {
  loadVehicleVisualRuntimeV1,
  type LoadedVehicleVisualRuntimeV1,
  type VehicleVisualFetcherV1,
} from "../visual/vehicle-visual-runtime-loader.js";

export interface VehicleVisualRenderResourceV1 {
  readonly runtime: LoadedVehicleVisualRuntimeV1;
  readonly gpuAsset: RigidMeshGpuAssetV1;
  readonly gpuTextures: VehicleVisualGpuTextureResourceV1;
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
    imageDecoder?: VehicleVisualImageDecoderV1;
  }> = {},
): Promise<VehicleVisualRenderResourceV1> {
  if (options.signal?.aborted) {
    throw abortError();
  }
  const runtime = await loadVehicleVisualRuntimeV1(
    pageBaseUrl,
    packageUrl,
    options.fetcher === undefined
      ? options.signal === undefined
        ? {}
        : { signal: options.signal }
      : options.signal === undefined
        ? { fetcher: options.fetcher }
        : { signal: options.signal, fetcher: options.fetcher },
  );
  if (options.signal?.aborted) {
    throw abortError();
  }

  const gpuAsset = createRigidMeshGpuAssetV1(gl, runtime.cpuAsset);
  let gpuTextures: VehicleVisualGpuTextureResourceV1 | null = null;
  try {
    if (gpuAsset.gpuByteLength !== runtime.budgetReceipt.geometryBytes) {
      throw new Error(
        `Vehicle visual GPU byte accounting ${gpuAsset.gpuByteLength} differs from decoded geometry ${runtime.budgetReceipt.geometryBytes}.`,
      );
    }
    gpuTextures = await createVehicleVisualGpuTexturesV1(
      gl,
      runtime.cpuAsset,
      options.imageDecoder === undefined
        ? options.signal === undefined
          ? {}
          : { signal: options.signal }
        : options.signal === undefined
          ? { imageDecoder: options.imageDecoder }
          : { signal: options.signal, imageDecoder: options.imageDecoder },
    );
    if (
      gpuTextures.gpuByteLength !== runtime.budgetReceipt.decodedTextureBytes
    ) {
      throw new Error(
        `Vehicle visual texture GPU byte accounting ${gpuTextures.gpuByteLength} differs from decoded texture budget ${runtime.budgetReceipt.decodedTextureBytes}.`,
      );
    }
    if (options.signal?.aborted) {
      throw abortError();
    }

    const ownedTextures = gpuTextures;
    let isDisposed = false;
    return Object.freeze({
      runtime,
      gpuAsset,
      gpuTextures: ownedTextures,
      get disposed(): boolean {
        return isDisposed;
      },
      dispose(): void {
        if (isDisposed) {
          return;
        }
        isDisposed = true;
        ownedTextures.dispose();
        gpuAsset.dispose();
      },
    });
  } catch (error: unknown) {
    gpuTextures?.dispose();
    gpuAsset.dispose();
    throw error;
  }
}
