import type { RigidMeshGpuAssetV1 } from "./rigid-mesh-gpu-asset.js";
import { writeNormalMatrix3FromMat4V1 } from "./normal-matrix.js";
import type { GlbRigidCpuAssetV1 } from "../visual/glb-rigid-mesh-decoder.js";
import type { RigidMeshDrawCommandV1 } from "../visual/rigid-mesh-draw-plan.js";

const VERTEX_SHADER_SOURCE = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uViewProjection;
uniform mat4 uWorldFromNode;
uniform mat3 uNormalFromNode;
varying vec3 vWorldNormal;
void main() {
  gl_Position = uViewProjection * uWorldFromNode * vec4(aPosition, 1.0);
  vWorldNormal = uNormalFromNode * aNormal;
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
uniform vec4 uBaseColor;
uniform vec3 uLightDirectionToLight;
uniform float uAmbientIntensity;
uniform float uDirectionalIntensity;
uniform float uDoubleSided;
varying vec3 vWorldNormal;

vec3 linearToSrgb(vec3 linearColor) {
  vec3 value = clamp(linearColor, 0.0, 1.0);
  vec3 low = value * 12.92;
  vec3 high = 1.055 * pow(value, vec3(1.0 / 2.4)) - 0.055;
  return mix(low, high, step(vec3(0.0031308), value));
}

void main() {
  vec3 normal = normalize(vWorldNormal);
  if (uDoubleSided > 0.5 && !gl_FrontFacing) {
    normal = -normal;
  }
  float diffuse = max(dot(normal, uLightDirectionToLight), 0.0);
  float intensity = uAmbientIntensity + uDirectionalIntensity * diffuse;
  vec3 linearColor = uBaseColor.rgb * intensity;
  gl_FragColor = vec4(linearToSrgb(linearColor), 1.0);
}
`;

const DEFAULT_BASE_COLOR = Object.freeze([1, 1, 1, 1] as const);
const LIGHT_DIRECTION_TO_LIGHT = Object.freeze([
  0.34912827,
  0.84788366,
  -0.39900374,
] as const);
const AMBIENT_INTENSITY = 0.28;
const DIRECTIONAL_INTENSITY = 0.72;

interface RigidLitNormalProgramV1 {
  readonly program: WebGLProgram;
  readonly positionLocation: number;
  readonly normalLocation: number;
  readonly viewProjectionLocation: WebGLUniformLocation;
  readonly worldFromNodeLocation: WebGLUniformLocation;
  readonly normalFromNodeLocation: WebGLUniformLocation;
  readonly baseColorLocation: WebGLUniformLocation;
  readonly lightDirectionLocation: WebGLUniformLocation;
  readonly ambientIntensityLocation: WebGLUniformLocation;
  readonly directionalIntensityLocation: WebGLUniformLocation;
  readonly doubleSidedLocation: WebGLUniformLocation;
}

export interface RigidLitNormalRenderReceiptV1 {
  readonly drawCommandCount: number;
  readonly primitiveDrawCount: number;
}

export interface RigidLitNormalRendererV1 {
  readonly disposed: boolean;
  render(
    cpuAsset: GlbRigidCpuAssetV1,
    gpuAsset: RigidMeshGpuAssetV1,
    drawPlan: readonly RigidMeshDrawCommandV1[],
    viewProjection: Float32Array,
  ): RigidLitNormalRenderReceiptV1;
  dispose(): void;
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
    throw new Error("Rigid lit-normal shader allocation failed.");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(`Rigid lit-normal shader compilation failed: ${message}`);
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
): RigidLitNormalProgramV1 {
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  let fragment: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  try {
    fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    program = gl.createProgram();
    if (program === null) {
      throw new Error("Rigid lit-normal program allocation failed.");
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) ?? "unknown link error";
      throw new Error(`Rigid lit-normal program link failed: ${message}`);
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const normalLocation = gl.getAttribLocation(program, "aNormal");
    const viewProjectionLocation = gl.getUniformLocation(
      program,
      "uViewProjection",
    );
    const worldFromNodeLocation = gl.getUniformLocation(
      program,
      "uWorldFromNode",
    );
    const normalFromNodeLocation = gl.getUniformLocation(
      program,
      "uNormalFromNode",
    );
    const baseColorLocation = gl.getUniformLocation(program, "uBaseColor");
    const lightDirectionLocation = gl.getUniformLocation(
      program,
      "uLightDirectionToLight",
    );
    const ambientIntensityLocation = gl.getUniformLocation(
      program,
      "uAmbientIntensity",
    );
    const directionalIntensityLocation = gl.getUniformLocation(
      program,
      "uDirectionalIntensity",
    );
    const doubleSidedLocation = gl.getUniformLocation(
      program,
      "uDoubleSided",
    );
    if (
      positionLocation < 0 ||
      normalLocation < 0 ||
      viewProjectionLocation === null ||
      worldFromNodeLocation === null ||
      normalFromNodeLocation === null ||
      baseColorLocation === null ||
      lightDirectionLocation === null ||
      ambientIntensityLocation === null ||
      directionalIntensityLocation === null ||
      doubleSidedLocation === null
    ) {
      throw new Error(
        "Rigid lit-normal program attributes or uniforms are unavailable.",
      );
    }
    assertNoGlError(gl, "Rigid lit-normal program creation");

    return Object.freeze({
      program,
      positionLocation,
      normalLocation,
      viewProjectionLocation,
      worldFromNodeLocation,
      normalFromNodeLocation,
      baseColorLocation,
      lightDirectionLocation,
      ambientIntensityLocation,
      directionalIntensityLocation,
      doubleSidedLocation,
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

function restoreLitState(gl: WebGLRenderingContext): void {
  gl.enable(gl.DEPTH_TEST);
  gl.depthMask(true);
  gl.depthFunc(gl.LESS);
  gl.colorMask(true, true, true, true);
  gl.disable(gl.BLEND);
  gl.disable(gl.SCISSOR_TEST);
}

export function createRigidLitNormalRendererV1(
  gl: WebGLRenderingContext,
): RigidLitNormalRendererV1 {
  const program = createProgram(gl);
  const normalFromNode = new Float32Array(9);
  let isDisposed = false;

  return Object.freeze({
    get disposed(): boolean {
      return isDisposed;
    },
    render(
      cpuAsset: GlbRigidCpuAssetV1,
      gpuAsset: RigidMeshGpuAssetV1,
      drawPlan: readonly RigidMeshDrawCommandV1[],
      viewProjection: Float32Array,
    ): RigidLitNormalRenderReceiptV1 {
      if (isDisposed) {
        throw new Error("Cannot render with a disposed rigid lit-normal renderer.");
      }
      if (viewProjection.length < 16) {
        throw new Error("Rigid lit-normal viewProjection must contain 16 values.");
      }

      assertNoGlError(gl, "Rigid lit-normal renderer entry");
      restoreLitState(gl);
      gl.useProgram(program.program);
      gl.uniformMatrix4fv(
        program.viewProjectionLocation,
        false,
        viewProjection,
      );
      gl.uniform3f(
        program.lightDirectionLocation,
        LIGHT_DIRECTION_TO_LIGHT[0],
        LIGHT_DIRECTION_TO_LIGHT[1],
        LIGHT_DIRECTION_TO_LIGHT[2],
      );
      gl.uniform1f(program.ambientIntensityLocation, AMBIENT_INTENSITY);
      gl.uniform1f(
        program.directionalIntensityLocation,
        DIRECTIONAL_INTENSITY,
      );

      let primitiveDrawCount = 0;
      for (const command of drawPlan) {
        const gpuMesh = gpuAsset.meshes[command.meshIndex];
        const cpuMesh = cpuAsset.meshes[command.meshIndex];
        if (gpuMesh === undefined || cpuMesh === undefined) {
          throw new Error(
            `Rigid lit-normal draw command references missing mesh ${command.meshIndex}.`,
          );
        }
        if (gpuMesh.primitives.length !== cpuMesh.primitives.length) {
          throw new Error(
            `Rigid lit-normal mesh ${command.meshIndex} CPU/GPU primitive counts differ.`,
          );
        }

        writeNormalMatrix3FromMat4V1(command.worldFromNode, normalFromNode);
        gl.uniformMatrix4fv(
          program.worldFromNodeLocation,
          false,
          command.worldFromNode,
        );
        gl.uniformMatrix3fv(
          program.normalFromNodeLocation,
          false,
          normalFromNode,
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
              `Rigid lit-normal mesh ${command.meshIndex} primitive ${primitiveIndex} is missing.`,
            );
          }
          if (
            gpuPrimitive.normalBuffer === null ||
            cpuPrimitive.normals === null
          ) {
            throw new Error(
              `Rigid lit-normal mesh ${command.meshIndex} primitive ${primitiveIndex} is missing NORMAL.`,
            );
          }
          if (
            gpuPrimitive.texcoord0Buffer !== null ||
            cpuPrimitive.texcoord0 !== null
          ) {
            throw new Error(
              `Rigid lit-normal mesh ${command.meshIndex} primitive ${primitiveIndex} contains unsupported TEXCOORD_0.`,
            );
          }

          const material =
            cpuPrimitive.materialIndex === null
              ? null
              : cpuAsset.materials[cpuPrimitive.materialIndex];
          if (
            cpuPrimitive.materialIndex !== null &&
            material === undefined
          ) {
            throw new Error(
              `Rigid lit-normal mesh ${command.meshIndex} primitive ${primitiveIndex} references missing material ${cpuPrimitive.materialIndex}.`,
            );
          }
          const baseColor = material?.baseColorFactor ?? DEFAULT_BASE_COLOR;
          const doubleSided = material?.doubleSided ?? false;
          if (doubleSided) {
            gl.disable(gl.CULL_FACE);
          } else {
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.frontFace(gl.CCW);
          }
          gl.uniform1f(program.doubleSidedLocation, doubleSided ? 1 : 0);

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
          gl.bindBuffer(gl.ARRAY_BUFFER, gpuPrimitive.normalBuffer);
          gl.enableVertexAttribArray(program.normalLocation);
          gl.vertexAttribPointer(
            program.normalLocation,
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
            1,
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

      assertNoGlError(gl, "Rigid lit-normal frame");
      return Object.freeze({
        drawCommandCount: drawPlan.length,
        primitiveDrawCount,
      });
    },
    dispose(): void {
      if (isDisposed) {
        return;
      }
      isDisposed = true;
      gl.deleteProgram(program.program);
    },
  });
}
