import type {
  GlbRigidImageV1,
  GlbRigidTextureAssetV1,
} from "../visual/glb-rigid-texture-decoder.js";

export interface DecodedVehicleTextureImageV1 {
  readonly source: TexImageSource;
  readonly width: number;
  readonly height: number;
  release(): void;
}

export type VehicleTextureImageDecoderV1 = (
  image: GlbRigidImageV1,
  signal?: AbortSignal,
) => Promise<DecodedVehicleTextureImageV1>;

export interface RigidMeshGpuTextureAssetV1 {
  readonly textures: readonly WebGLTexture[];
  readonly gpuByteLength: number;
  readonly disposed: boolean;
  dispose(): void;
}

function abortError(): DOMException {
  return new DOMException("Vehicle texture upload was aborted.", "AbortError");
}

function assertNoGlError(gl: WebGLRenderingContext, label: string): void {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    throw new Error(`${label} failed with WebGL error 0x${error.toString(16)}.`);
  }
}

export async function decodeVehiclePngImageV1(
  image: GlbRigidImageV1,
  signal?: AbortSignal,
): Promise<DecodedVehicleTextureImageV1> {
  if (signal?.aborted) {
    throw abortError();
  }
  if (typeof createImageBitmap !== "function") {
    throw new Error("Vehicle texture decode requires createImageBitmap.");
  }
  const ownedBytes = image.bytes.slice();
  const blob = new Blob([ownedBytes.buffer as ArrayBuffer], {
    type: image.mimeType,
  });
  const bitmap = await createImageBitmap(blob, {
    imageOrientation: "none",
    premultiplyAlpha: "none",
    colorSpaceConversion: "none",
  });
  if (signal?.aborted) {
    bitmap.close();
    throw abortError();
  }
  if (bitmap.width !== image.width || bitmap.height !== image.height) {
    bitmap.close();
    throw new Error(
      `Vehicle texture decoded dimensions ${bitmap.width}x${bitmap.height} differ from PNG IHDR ${image.width}x${image.height}.`,
    );
  }
  let released = false;
  return Object.freeze({
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    release(): void {
      if (released) {
        return;
      }
      released = true;
      bitmap.close();
    },
  });
}

export async function createRigidMeshGpuTextureAssetV1(
  gl: WebGLRenderingContext,
  asset: GlbRigidTextureAssetV1,
  options: Readonly<{
    signal?: AbortSignal;
    decoder?: VehicleTextureImageDecoderV1;
  }> = {},
): Promise<RigidMeshGpuTextureAssetV1> {
  if (options.signal?.aborted) {
    throw abortError();
  }
  if (asset.textures.length === 0) {
    let isDisposed = false;
    return Object.freeze({
      textures: Object.freeze([]),
      gpuByteLength: 0,
      get disposed(): boolean {
        return isDisposed;
      },
      dispose(): void {
        isDisposed = true;
      },
    });
  }
  const decoder = options.decoder ?? decodeVehiclePngImageV1;
  const owned: WebGLTexture[] = [];
  try {
    for (let textureIndex = 0; textureIndex < asset.textures.length; textureIndex += 1) {
      if (options.signal?.aborted) {
        throw abortError();
      }
      const textureInfo = asset.textures[textureIndex]!;
      const image = asset.images[textureInfo.source];
      const sampler = asset.samplers[textureInfo.sampler];
      if (image === undefined || sampler === undefined) {
        throw new Error(`Vehicle texture ${textureIndex} has incomplete decoded ownership.`);
      }
      const decoded = await decoder(image, options.signal);
      try {
        if (decoded.width !== image.width || decoded.height !== image.height) {
          throw new Error(
            `Vehicle texture ${textureIndex} decoder dimensions drifted from validated PNG dimensions.`,
          );
        }
        if (options.signal?.aborted) {
          throw abortError();
        }
        const texture = gl.createTexture();
        if (texture === null) {
          throw new Error(`Vehicle texture ${textureIndex} allocation failed.`);
        }
        owned.push(texture);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, sampler.minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, sampler.magFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, sampler.wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, sampler.wrapT);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          decoded.source,
        );
        assertNoGlError(gl, `vehicle texture ${textureIndex} upload`);
      } finally {
        decoded.release();
      }
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    if (options.signal?.aborted) {
      throw abortError();
    }

    let isDisposed = false;
    return Object.freeze({
      textures: Object.freeze([...owned]),
      gpuByteLength: asset.decodedTextureBytes,
      get disposed(): boolean {
        return isDisposed;
      },
      dispose(): void {
        if (isDisposed) {
          return;
        }
        isDisposed = true;
        for (let index = owned.length - 1; index >= 0; index -= 1) {
          gl.deleteTexture(owned[index]!);
        }
        owned.length = 0;
      },
    });
  } catch (error: unknown) {
    for (let index = owned.length - 1; index >= 0; index -= 1) {
      gl.deleteTexture(owned[index]!);
    }
    owned.length = 0;
    gl.bindTexture(gl.TEXTURE_2D, null);
    throw error;
  }
}
