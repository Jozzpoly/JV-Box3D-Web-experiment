import type {
  M6SceneRenderFrameV1,
  M6SceneRenderPassFactoryV1,
  M6SceneRenderPassV1,
} from "./m6-scene-render-pass.js";
import {
  createVehicleVisualRenderResourceV1,
  type VehicleVisualFetcherV1,
  type VehicleVisualRenderResourceV1,
} from "./vehicle-visual-render-resource.js";
import {
  assertVehicleVisualUnlitCapabilityV1,
  type VehicleVisualUnlitCapabilityReceiptV1,
} from "./vehicle-visual-unlit-capability.js";
import { buildVehicleVisualDrawPlanV1 } from "../visual/rigid-mesh-draw-plan.js";

const VERTEX_SHADER_SOURCE = `
attribute vec3 aPosition;
uniform mat4 uViewProjection;
uniform mat4 uWorldFromNode;
void main() {
  gl_Position = uViewProjection * uWorldFromNode * vec4(aPosition, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
uniform vec4 uBaseColor;
void main() {
  gl_FragColor = uBaseColor;
}
`;

const DEFAULT_BASE_COLOR = Object.freeze([1, 1, 1, 1] as const);

interface VehicleVisualUnlitProgramV1 {
  readonly program: WebGLProgram;
  readonly positionLocation: number;
  readonly viewProjectionLocation: WebGLUniformLocation;
  readonly worldFromNodeLocation: WebGLUniformLocation;
  readonly baseColorLocation: WebGLUniformLocation;
}

export interface VehicleVisualUnlitFirstFrameReceiptV1 {
  readonly capability: VehicleVisualUnlitCapabilityReceiptV1;
  readonly generation: number;
  readonly stepIndex: number;
  readonly drawCommandCount: number;
  readonly primitiveDrawCount: number;
}

export interface VehicleVisualUnlitPassOptionsV1 {
  readonly pageBaseUrl: string;
  readonly packageUrl: string;
  readonly fetcher?: VehicleVisualFetcherV1;
  readonly onFirstFrame?: (
    receipt: VehicleVisualUnlitFirstFrameReceiptV1,
  ) => void;
}

function abortError(): DOMException {
  return new DOMException("Vehicle visual unlit pass was aborted.", "AbortError");
}

function assertNoGlError(
  gl: WebGLRenderingContext,
  label: string,
): void {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    throw new Error(`${label} failed with WebGL error 0x${error.toString(16)}.`);
  }
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("Vehicle visual unlit shader allocation failed.");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(
      `Vehicle visual unlit shader compilation failed: ${message}`,
    );
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
): VehicleVisualUnlitProgramV1 {
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  let fragment: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  try {
    fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    program = gl.createProgram();
    if (program === null) {
      throw new Error("Vehicle visual unlit program allocation failed.");
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) ?? "unknown link error";
      throw new Error(`Vehicle visual unlit program link failed: ${message}`);
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const viewProjectionLocation = gl.getUniformLocation(
      program,
      "uViewProjection",
    );
    const worldFromNodeLocation = gl.getUniformLocation(
      program,
      "uWorldFromNode",
    );
    const baseColorLocation = gl.getUniformLocation(program, "uBaseColor");
    if (
      positionLocation < 0 ||
      viewProjectionLocation === null ||
      worldFromNodeLocation === null ||
      baseColorLocation === null
    ) {
      throw new Error(
        "Vehicle visual unlit program attributes or uniforms are unavailable.",
      );
    }
    assertNoGlError(gl, "Vehicle visual unlit program creation");

    return Object.freeze({
      program,
      positionLocation,
      viewProjectionLocation,
      worldFromNodeLocation,
      baseColorLocation,
    });
  } catch (error: unknown) {
    if (program !== null) {
      gl.deleteProgram(program);
    }
    throw error;
  } finally {
    gl.deleteShader(vertex);
    if (fragment !== null) {
      gl.deleteShader(fragment);
    }
  }
}

function restoreUnlitState(gl: WebGLRenderingContext): void {
  gl.enable(gl.DEPTH_TEST);
  gl.depthMask(true);
  gl.depthFunc(gl.LESS);
  gl.colorMask(true, true, true, true);
  gl.disable(gl.BLEND);
  gl.disable(gl.SCISSOR_TEST);
}

function renderFrame(
  gl: WebGLRenderingContext,
  program: VehicleVisualUnlitProgramV1,
  resource: VehicleVisualRenderResourceV1,
  frame: M6SceneRenderFrameV1,
): Readonly<{
  drawCommandCount: number;
  primitiveDrawCount: number;
}> {
  if (frame.gl !== gl) {
    throw new Error(
      "Vehicle visual unlit pass received a different WebGL context.",
    );
  }

  const drawPlan = buildVehicleVisualDrawPlanV1(
    resource.runtime,
    frame.trace.visualFrame,
  );
  assertNoGlError(gl, "Vehicle visual unlit pass entry");
  restoreUnlitState(gl);
  gl.useProgram(program.program);
  gl.uniformMatrix4fv(
    program.viewProjectionLocation,
    false,
    frame.viewProjection,
  );

  let primitiveDrawCount = 0;
  for (const command of drawPlan) {
    const gpuMesh = resource.gpuAsset.meshes[command.meshIndex];
    const cpuMesh = resource.runtime.cpuAsset.meshes[command.meshIndex];
    if (gpuMesh === undefined || cpuMesh === undefined) {
      throw new Error(
        `Vehicle visual draw command references missing mesh ${command.meshIndex}.`,
      );
    }
    if (gpuMesh.primitives.length !== cpuMesh.primitives.length) {
      throw new Error(
        `Vehicle visual mesh ${command.meshIndex} CPU/GPU primitive counts differ.`,
      );
    }

    gl.uniformMatrix4fv(
      program.worldFromNodeLocation,
      false,
      command.worldFromNode,
    );

    for (
      let primitiveIndex = 0;
      primitiveIndex < gpuMesh.primitives.length;
      primitiveIndex += 1
    ) {
      const gpuPrimitive = gpuMesh.primitives[primitiveIndex];
      const cpuPrimitive = cpuMesh.primitives[primitiveIndex];
      if (gpuPrimitive === undefined || cpuPrimitive === undefined) {
        throw new Error(
          `Vehicle visual mesh ${command.meshIndex} primitive ${primitiveIndex} is missing.`,
        );
      }
      if (
        gpuPrimitive.normalBuffer !== null ||
        gpuPrimitive.texcoord0Buffer !== null
      ) {
        throw new Error(
          `Vehicle visual unlit pass received unsupported GPU streams for mesh ${command.meshIndex} primitive ${primitiveIndex}.`,
        );
      }

      const material =
        cpuPrimitive.materialIndex === null
          ? null
          : resource.runtime.cpuAsset.materials[
              cpuPrimitive.materialIndex
            ];
      if (
        cpuPrimitive.materialIndex !== null &&
        material === undefined
      ) {
        throw new Error(
          `Vehicle visual mesh ${command.meshIndex} primitive ${primitiveIndex} references missing material ${cpuPrimitive.materialIndex}.`,
        );
      }
      const baseColor = material?.baseColorFactor ?? DEFAULT_BASE_COLOR;
      if (material?.doubleSided ?? false) {
        gl.disable(gl.CULL_FACE);
      } else {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, gpuPrimitive.positionBuffer);
      gl.enableVertexAttribArray(program.positionLocation);
      gl.vertexAttribPointer(
        program.positionLocation,
        3,
        gl.FLOAT,
        false,
        0,
        0,
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpuPrimitive.indexBuffer);
      gl.uniform4f(
        program.baseColorLocation,
        baseColor[0],
        baseColor[1],
        baseColor[2],
        baseColor[3],
      );
      gl.drawElements(
        gl.TRIANGLES,
        gpuPrimitive.indexCount,
        gl.UNSIGNED_SHORT,
        0,
      );
      primitiveDrawCount += 1;
    }
  }
  assertNoGlError(gl, "Vehicle visual unlit frame");

  return Object.freeze({
    drawCommandCount: drawPlan.length,
    primitiveDrawCount,
  });
}

export async function createVehicleVisualUnlitPassV1(
  gl: WebGLRenderingContext,
  signal: AbortSignal,
  options: VehicleVisualUnlitPassOptionsV1,
): Promise<M6SceneRenderPassV1> {
  if (signal.aborted) {
    throw abortError();
  }

  const resource = await createVehicleVisualRenderResourceV1(
    gl,
    options.pageBaseUrl,
    options.packageUrl,
    {
      signal,
      ...(options.fetcher === undefined ? {} : { fetcher: options.fetcher }),
      validateRuntime(runtime) {
        assertVehicleVisualUnlitCapabilityV1(runtime.cpuAsset);
      },
    },
  );
  const capability = assertVehicleVisualUnlitCapabilityV1(
    resource.runtime.cpuAsset,
  );
  if (signal.aborted) {
    resource.dispose();
    throw abortError();
  }

  let program: VehicleVisualUnlitProgramV1 | null = null;
  try {
    program = createProgram(gl);
    if (signal.aborted) {
      throw abortError();
    }

    let disposed = false;
    let firstFramePublished = false;
    const ownedProgram = program;
    return Object.freeze({
      phase: "BEFORE_DEBUG_VEHICLE" as const,
      render(frame: M6SceneRenderFrameV1): void {
        if (disposed) {
          throw new Error("Cannot render a disposed vehicle visual unlit pass.");
        }
        const receipt = renderFrame(
          gl,
          ownedProgram,
          resource,
          frame,
        );
        if (!firstFramePublished) {
          firstFramePublished = true;
          options.onFirstFrame?.(
            Object.freeze({
              capability,
              generation: frame.trace.generation,
              stepIndex: frame.trace.stepIndex,
              drawCommandCount: receipt.drawCommandCount,
              primitiveDrawCount: receipt.primitiveDrawCount,
            }),
          );
        }
      },
      dispose(): void {
        if (disposed) {
          return;
        }
        disposed = true;
        gl.deleteProgram(ownedProgram.program);
        resource.dispose();
      },
    });
  } catch (error: unknown) {
    if (program !== null) {
      gl.deleteProgram(program.program);
    }
    resource.dispose();
    throw error;
  }
}

export function createVehicleVisualUnlitPassFactoryV1(
  options: VehicleVisualUnlitPassOptionsV1,
): M6SceneRenderPassFactoryV1 {
  return (gl, signal) =>
    createVehicleVisualUnlitPassV1(gl, signal, options);
}
