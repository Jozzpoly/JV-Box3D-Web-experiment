const CHECKED_METHODS = new Set<PropertyKey>([
  "bufferData",
  "texImage2D",
]);

type CheckedState = {
  failure: Error | null;
};

const CHECKED_STATES = new WeakMap<object, CheckedState>();

function errorName(
  gl: WebGLRenderingContext,
  error: number,
): string {
  const names: readonly [number, string][] = [
    [gl.INVALID_ENUM, "INVALID_ENUM"],
    [gl.INVALID_VALUE, "INVALID_VALUE"],
    [gl.INVALID_OPERATION, "INVALID_OPERATION"],
    [gl.OUT_OF_MEMORY, "OUT_OF_MEMORY"],
    [gl.INVALID_FRAMEBUFFER_OPERATION, "INVALID_FRAMEBUFFER_OPERATION"],
    [gl.CONTEXT_LOST_WEBGL, "CONTEXT_LOST_WEBGL"],
  ];
  return names.find(([value]) => value === error)?.[1] ??
    `0x${error.toString(16)}`;
}

export function assertNoWebGlError(
  gl: WebGLRenderingContext,
  label: string,
): void {
  const errors: number[] = [];
  for (let index = 0; index < 16; index += 1) {
    const error = gl.getError();
    if (error === gl.NO_ERROR) {
      break;
    }
    errors.push(error);
  }
  if (errors.length > 0) {
    throw new Error(
      `${label} reported WebGL ${errors
        .map((error) => errorName(gl, error))
        .join(", ")}.`,
    );
  }
}

export function createCheckedWebGlContext(
  gl: WebGLRenderingContext,
): WebGLRenderingContext {
  const target = gl as unknown as Record<PropertyKey, unknown>;
  const cache = new Map<PropertyKey, unknown>();
  const state: CheckedState = { failure: null };
  const proxy = new Proxy(target, {
    get(_target, property) {
      const cached = cache.get(property);
      if (cached !== undefined) {
        return cached;
      }
      const value = Reflect.get(target, property, target);
      if (typeof value !== "function") {
        return value;
      }
      const bound = CHECKED_METHODS.has(property)
        ? (...args: unknown[]) => {
            if (state.failure !== null) {
              throw state.failure;
            }
            try {
              assertNoWebGlError(gl, `Before WebGL ${String(property)}`);
              const result = Reflect.apply(value, gl, args);
              assertNoWebGlError(gl, `WebGL ${String(property)}`);
              return result;
            } catch (error: unknown) {
              state.failure = error instanceof Error
                ? error
                : new Error(String(error));
              throw state.failure;
            }
          }
        : value.bind(gl);
      cache.set(property, bound);
      return bound;
    },
  });
  CHECKED_STATES.set(proxy, state);
  return proxy as unknown as WebGLRenderingContext;
}

export function assertCheckedWebGlContextHealthy(
  checked: WebGLRenderingContext,
): void {
  const state = CHECKED_STATES.get(checked as unknown as object);
  if (state === undefined) {
    throw new Error("WebGL context is not owned by the JV checked boundary.");
  }
  if (state.failure !== null) {
    throw new Error("JV checked WebGL context is faulted.", {
      cause: state.failure,
    });
  }
}
