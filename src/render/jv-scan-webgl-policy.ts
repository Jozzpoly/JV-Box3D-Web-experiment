import type { JvTextureFilterMode } from "./jv-product-view-settings.js";

export interface JvScanWebGlPolicy {
  readonly context: WebGLRenderingContext;
  setTextureFilter(mode: JvTextureFilterMode): void;
  dispose(): void;
}

function filterEnum(
  gl: WebGLRenderingContext,
  mode: JvTextureFilterMode,
): number {
  return mode === "nearest" ? gl.NEAREST : gl.LINEAR;
}

function applyTextureFilter(
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  mode: JvTextureFilterMode,
): void {
  const filter = filterEnum(gl, mode);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
}

export function createJvScanWebGlPolicy(
  gl: WebGLRenderingContext,
  initialMode: JvTextureFilterMode,
): JvScanWebGlPolicy {
  let mode = initialMode;
  let disposed = false;
  const textures = new Set<WebGLTexture>();

  const context = new Proxy(gl, {
    get(target, property) {
      if (property === "createTexture") {
        return () => {
          const texture = target.createTexture();
          if (texture !== null) {
            textures.add(texture);
          }
          return texture;
        };
      }
      if (property === "deleteTexture") {
        return (texture: WebGLTexture | null) => {
          if (texture !== null) {
            textures.delete(texture);
          }
          target.deleteTexture(texture);
        };
      }
      if (property === "pixelStorei") {
        return (pname: number, parameter: number) => {
          target.pixelStorei(
            pname,
            pname === target.UNPACK_FLIP_Y_WEBGL ? 0 : parameter,
          );
        };
      }
      if (property === "texParameteri") {
        return (
          textureTarget: number,
          pname: number,
          parameter: number,
        ) => {
          const isFilter =
            textureTarget === target.TEXTURE_2D &&
            (pname === target.TEXTURE_MIN_FILTER ||
              pname === target.TEXTURE_MAG_FILTER);
          target.texParameteri(
            textureTarget,
            pname,
            isFilter ? filterEnum(target, mode) : parameter,
          );
        };
      }
      const value = Reflect.get(target, property, target) as unknown;
      return typeof value === "function" ? value.bind(target) : value;
    },
  }) as WebGLRenderingContext;

  return {
    context,
    setTextureFilter(nextMode) {
      if (disposed) {
        throw new Error("JV scan WebGL policy has been disposed.");
      }
      if (nextMode === mode) {
        return;
      }
      mode = nextMode;
      const previous = gl.getParameter(
        gl.TEXTURE_BINDING_2D,
      ) as WebGLTexture | null;
      for (const texture of textures) {
        applyTextureFilter(gl, texture, mode);
      }
      gl.bindTexture(gl.TEXTURE_2D, previous);
    },
    dispose() {
      disposed = true;
      textures.clear();
    },
  };
}
