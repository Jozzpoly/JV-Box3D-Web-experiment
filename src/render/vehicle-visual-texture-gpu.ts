import type {
  GlbRigidCpuAssetV1,
  GlbRigidImageV1,
} from "../visual/glb-rigid-mesh-decoder.js";

export interface VehicleVisualDecodedImageV1 {
  readonly source: TexImageSource;
  readonly width: number;
  readonly height: number;
  close(): void;
}

export type VehicleVisualImageDecoderV1 = (
  image: GlbRigidImageV1,
  signal?: AbortSignal,
) => Promise<VehicleVisualDecodedImageV1>;

export interface VehicleVisualGpuTextureResourceV1 {
  readonly textures: readonly WebGLTexture[];
  readonly gpuByteLength: number;
  readonly disposed: boolean;
  dispose(): void;
}

function abortError(): DOMException {
  return new DOMException("Vehicle visual texture load was aborted.", "AbortError");
}

function assertNoGlError(gl: WebGLRenderingContext, label: string): void {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    throw new Error(`${label} failed with WebGL error 0x${error.toString(16)}.`);
  }
}

async function decodeBrowserPng(
  image: GlbRigidImageV1,
  signal?: AbortSignal,
): Promise<VehicleVisualDecodedImageV1> {
  if (signal?.aborted) {
    throw abortError();
  }
  if (typeof createImageBitmap !== "function") {
    throw new Error("Vehicle visual PNG decode requires createImageBitmap().");
  }
  const ownedBytes = new Uint8Array(image.bytes);
  const blob = new Blob([ownedBytes], { type: image.mimeType });
  const bitmap = await createImageBitmap(blob);
  if (signal?.aborted) {
    bitmap.close();
    throw abortError();
  }
  return Object.freeze({
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    close(): void {
      bitmap.close();
    },
  });
}

export async function createVehicleVisualGpuTexturesV1(
  gl: WebGLRenderingContext,
  cpuAsset: GlbRigidCpuAssetV1,
  options: Readonly<{
    signal?: AbortSignal;
    imageDecoder?: VehicleVisualImageDecoderV1;
  }> = {},
): Promise<VehicleVisualGpuTextureResourceV1> {
  if (options.signal?.aborted) {
    throw abortError();
  }
  const decodeImage = options.imageDecoder ?? decodeBrowserPng;
  const ownedTextures: WebGLTexture[] = [];
  let gpuByteLength = 0;
  try {
    for (const [textureIndex, texture] of cpuAsset.textures.entries()) {
      if (options.signal?.aborted) {
        throw abortError();
      }
      const image = cpuAsset.images[texture.sourceImageIndex];
      const sampler = cpuAsset.samplers[texture.samplerIndex];
      if (image === undefined || sampler === undefined) {
        throw new Error(`Vehicle visual texture ${textureIndex} has invalid CPU references.`);
      }
      const decoded = await decodeImage(image, options.signal);
      try {
        if (decoded.width !== image.width || decoded.height !== image.height) {
          throw new Error(
            `Vehicle visual texture ${textureIndex} decoded dimensions ${decoded.width}x${decoded.height} differ from PNG IHDR ${image.width}x${image.height}.`,
          );
        }
        if (options.signal?.aborted) {
          throw abortError();
        }
        const gpuTexture = gl.createTexture();
        if (gpuTexture === null) {
          throw new Error(`Vehicle visual texture ${textureIndex} allocation failed.`);
        }
        ownedTextures.push(gpuTexture);
        gl.bindTexture(gl.TEXTURE_2D, gpuTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          decoded.source,
        );
        assertNoGlError(gl, `vehicle visual texture ${textureIndex} upload`);
        gpuByteLength += image.decodedRgbaBytes;
      } finally {
        decoded.close();
      }
    }
    gl.bindTexture(gl.TEXTURE_2D, null);

    let isDisposed = false;
    return Object.freeze({
      textures: Object.freeze([...ownedTextures]),
      gpuByteLength,
      get disposed(): boolean {
        return isDisposed;
      },
      dispose(): void {
        if (isDisposed) {
          return;
        }
        isDisposed = true;
        for (let index = ownedTextures.length - 1; index >= 0; index -= 1) {
          gl.deleteTexture(ownedTextures[index]!);
        }
        ownedTextures.length = 0;
      },
    });
  } catch (error: unknown) {
    gl.bindTexture(gl.TEXTURE_2D, null);
    for (let index = ownedTextures.length - 1; index >= 0; index -= 1) {
      gl.deleteTexture(ownedTextures[index]!);
    }
    ownedTextures.length = 0;
    throw error;
  }
}
