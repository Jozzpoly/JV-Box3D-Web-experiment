import type { VehicleVisualFrameV1 } from "../runtime/vehicle-visual-frame.js";
import { buildRigidMeshDrawPlanV1 } from "../visual/rigid-mesh-draw-plan.js";
import {
  multiplyVehicleVisualMatricesV1,
  resolveVehicleVisualBindingsV1,
  type VehicleVisualMatrixV1,
} from "../visual/vehicle-visual-transform.js";
import {
  createVehicleVisualRenderResourceV1,
  type VehicleVisualRenderResourceV1,
} from "./vehicle-visual-render-resource.js";
import type {
  VehicleTextureImageDecoderV1,
} from "./rigid-mesh-gpu-textures.js";
import type { VehicleVisualFetcherV1 } from "../visual/vehicle-visual-runtime-loader.js";

const REAL_OWNER_PART_IDS = Object.freeze([
  "m6.chassis",
  "m6.fl.wheel",
  "m6.fr.wheel",
  "m6.rl.wheel",
  "m6.rr.wheel",
] as const);
const REAL_OWNER_PART_ID_SET = new Set<string>(REAL_OWNER_PART_IDS);

const VERTEX_SHADER_SOURCE = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUv;
uniform mat4 uMvp;
uniform mat3 uNormalMatrix;
varying vec2 vUv;
varying float vLight;
void main() {
  vec3 normal = normalize(uNormalMatrix * aNormal);
  vec3 lightDirection = normalize(vec3(0.35, 0.85, 0.45));
  vLight = 0.42 + 0.58 * max(dot(normal, lightDirection), 0.0);
  vUv = aUv;
  gl_Position = uMvp * vec4(aPosition, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
uniform sampler2D uTexture;
uniform vec4 uBaseColor;
uniform float uUseTexture;
uniform float uUseAlphaMask;
uniform float uAlphaCutoff;
varying vec2 vUv;
varying float vLight;
void main() {
  vec4 base = uBaseColor;
  if (uUseTexture > 0.5) {
    base *= texture2D(uTexture, vUv);
  }
  if (uUseAlphaMask > 0.5 && base.a < uAlphaCutoff) {
    discard;
  }
  gl_FragColor = vec4(base.rgb * vLight, base.a);
}
`;

interface ProgramLocations {
  readonly program: WebGLProgram;
  readonly position: number;
  readonly normal: number;
  readonly uv: number;
  readonly mvp: WebGLUniformLocation;
  readonly normalMatrix: WebGLUniformLocation;
  readonly baseColor: WebGLUniformLocation;
  readonly texture: WebGLUniformLocation;
  readonly useTexture: WebGLUniformLocation;
  readonly useAlphaMask: WebGLUniformLocation;
  readonly alphaCutoff: WebGLUniformLocation;
}

export interface OwnerM6VisualRendererV1 {
  readonly disposed: boolean;
  render(
    frame: VehicleVisualFrameV1,
    viewProjection: VehicleVisualMatrixV1,
  ): boolean;
  dispose(): void;
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("Owner M6 shader allocation failed.");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(`Owner M6 shader compilation failed: ${message}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): ProgramLocations {
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  let fragment: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  try {
    fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    program = gl.createProgram();
    if (program === null) {
      throw new Error("Owner M6 program allocation failed.");
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) ?? "unknown link error";
      throw new Error(`Owner M6 program link failed: ${message}`);
    }
    const position = gl.getAttribLocation(program, "aPosition");
    const normal = gl.getAttribLocation(program, "aNormal");
    const uv = gl.getAttribLocation(program, "aUv");
    const mvp = gl.getUniformLocation(program, "uMvp");
    const normalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
    const baseColor = gl.getUniformLocation(program, "uBaseColor");
    const texture = gl.getUniformLocation(program, "uTexture");
    const useTexture = gl.getUniformLocation(program, "uUseTexture");
    const useAlphaMask = gl.getUniformLocation(program, "uUseAlphaMask");
    const alphaCutoff = gl.getUniformLocation(program, "uAlphaCutoff");
    if (
      position < 0 ||
      normal < 0 ||
      uv < 0 ||
      mvp === null ||
      normalMatrix === null ||
      baseColor === null ||
      texture === null ||
      useTexture === null ||
      useAlphaMask === null ||
      alphaCutoff === null
    ) {
      throw new Error("Owner M6 program locations are incomplete.");
    }
    return {
      program,
      position,
      normal,
      uv,
      mvp,
      normalMatrix,
      baseColor,
      texture,
      useTexture,
      useAlphaMask,
      alphaCutoff,
    };
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

function normalMatrix(model: VehicleVisualMatrixV1): Float32Array {
  const a = model[0]!;
  const b = model[4]!;
  const c = model[8]!;
  const d = model[1]!;
  const e = model[5]!;
  const f = model[9]!;
  const g = model[2]!;
  const h = model[6]!;
  const i = model[10]!;
  const determinant =
    a * (e * i - f * h) -
    b * (d * i - f * g) +
    c * (d * h - e * g);
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-10) {
    throw new Error("Owner M6 model transform has a singular normal matrix.");
  }
  const inverseDet = 1 / determinant;
  const inverse = [
    (e * i - f * h) * inverseDet,
    (c * h - b * i) * inverseDet,
    (b * f - c * e) * inverseDet,
    (f * g - d * i) * inverseDet,
    (a * i - c * g) * inverseDet,
    (c * d - a * f) * inverseDet,
    (d * h - e * g) * inverseDet,
    (b * g - a * h) * inverseDet,
    (a * e - b * d) * inverseDet,
  ];
  return new Float32Array(inverse);
}

export interface OwnerM6RealBindingNodeV1 {
  readonly bindingIndex: number;
  readonly nodeIndex: number;
}

export function selectOwnerM6RealBindingNodesV1(
  resource: VehicleVisualRenderResourceV1,
): readonly OwnerM6RealBindingNodeV1[] {
  const { runtime } = resource;
  const selected: OwnerM6RealBindingNodeV1[] = [];
  for (let index = 0; index < runtime.visualPackage.bindings.length; index += 1) {
    const binding = runtime.visualPackage.bindings[index]!;
    if (
      binding.source.kind !== "PART" ||
      !REAL_OWNER_PART_ID_SET.has(binding.source.partId)
    ) {
      continue;
    }
    const nodeIndex = runtime.cpuAsset.nodeIndexByName.get(binding.nodeName);
    const node = nodeIndex === undefined ? undefined : runtime.cpuAsset.nodes[nodeIndex];
    if (
      nodeIndex === undefined ||
      node === undefined ||
      !runtime.cpuAsset.rootNodeIndices.includes(nodeIndex) ||
      node.meshIndex === null ||
      node.children.length !== 0
    ) {
      throw new Error(
        `Owner M6 real binding ${binding.bindingId} must be a direct renderable root.`,
      );
    }
    selected.push(Object.freeze({ bindingIndex: index, nodeIndex }));
  }
  if (selected.length !== REAL_OWNER_PART_IDS.length) {
    throw new Error(
      `Owner M6 visual requires ${REAL_OWNER_PART_IDS.length} real roots; found ${selected.length}.`,
    );
  }
  return Object.freeze(selected);
}

export function resolveOwnerM6RealRootsV1(
  resource: VehicleVisualRenderResourceV1,
  frame: VehicleVisualFrameV1,
): ReadonlyMap<number, VehicleVisualMatrixV1> {
  const resolved = resolveVehicleVisualBindingsV1(
    resource.runtime.visualPackage,
    frame,
  );
  const roots = new Map<number, VehicleVisualMatrixV1>();
  for (const selected of selectOwnerM6RealBindingNodesV1(resource)) {
    const binding = resource.runtime.visualPackage.bindings[selected.bindingIndex]!;
    const runtimeBinding = resolved[selected.bindingIndex];
    if (runtimeBinding === undefined) {
      throw new Error(`Owner M6 real binding ${binding.bindingId} is incomplete.`);
    }
    roots.set(selected.nodeIndex, runtimeBinding.worldFromNode);
  }
  return roots;
}

function assertRenderableRealRoots(resource: VehicleVisualRenderResourceV1): void {
  const { runtime, gpuAsset } = resource;
  for (const selected of selectOwnerM6RealBindingNodesV1(resource)) {
    const binding = runtime.visualPackage.bindings[selected.bindingIndex]!;
    const nodeIndex = selected.nodeIndex;
    const node = runtime.cpuAsset.nodes[nodeIndex]!;
    const meshIndex = node.meshIndex;
    if (meshIndex === null) {
      throw new Error(`Owner M6 binding ${binding.bindingId} lost its mesh.`);
    }
    const cpuMesh = runtime.cpuAsset.meshes[meshIndex];
    const gpuMesh = gpuAsset.meshes[meshIndex];
    if (cpuMesh === undefined || gpuMesh === undefined) {
      throw new Error(`Owner M6 binding ${binding.bindingId} references a missing mesh.`);
    }
    if (cpuMesh.primitives.length !== gpuMesh.primitives.length) {
      throw new Error(`Owner M6 binding ${binding.bindingId} CPU/GPU primitive counts differ.`);
    }
    for (let primitiveIndex = 0; primitiveIndex < cpuMesh.primitives.length; primitiveIndex += 1) {
      const cpu = cpuMesh.primitives[primitiveIndex]!;
      const gpu = gpuMesh.primitives[primitiveIndex]!;
      if (cpu.normals === null || gpu.normalBuffer === null) {
        throw new Error(`Owner M6 ${binding.bindingId} primitive ${primitiveIndex} has no NORMAL.`);
      }
      if (cpu.texcoord0 === null || gpu.texcoord0Buffer === null) {
        throw new Error(`Owner M6 ${binding.bindingId} primitive ${primitiveIndex} has no TEXCOORD_0.`);
      }
    }
  }
  if (runtime.textureAsset.textures.length === 0) {
    throw new Error("Owner M6 exact visual requires at least one embedded base-colour texture.");
  }
}

export async function createOwnerM6VisualRendererV1(
  gl: WebGLRenderingContext,
  pageBaseUrl: string,
  packageUrl: string,
  options: Readonly<{
    signal?: AbortSignal;
    fetcher?: VehicleVisualFetcherV1;
    imageDecoder?: VehicleTextureImageDecoderV1;
  }> = {},
): Promise<OwnerM6VisualRendererV1> {
  const resource = await createVehicleVisualRenderResourceV1(
    gl,
    pageBaseUrl,
    packageUrl,
    options,
  );
  let locations: ProgramLocations | null = null;
  try {
    assertRenderableRealRoots(resource);
    locations = createProgram(gl);
    const programLocations = locations;
    let isDisposed = false;
    return Object.freeze({
      get disposed(): boolean {
        return isDisposed;
      },
      render(
        frame: VehicleVisualFrameV1,
        viewProjection: VehicleVisualMatrixV1,
      ): boolean {
        if (isDisposed) {
          return false;
        }
        const roots = resolveOwnerM6RealRootsV1(resource, frame);
        const commands = buildRigidMeshDrawPlanV1(resource.runtime.cpuAsset, roots);
        if (commands.length !== REAL_OWNER_PART_IDS.length) {
          throw new Error(
            `Owner M6 real draw plan produced ${commands.length} commands instead of ${REAL_OWNER_PART_IDS.length}.`,
          );
        }

        const cullWasEnabled = gl.isEnabled(gl.CULL_FACE);
        const previousCullMode = gl.getParameter(gl.CULL_FACE_MODE) as number;
        try {
          gl.useProgram(programLocations.program);
          for (const command of commands) {
            const cpuMesh = resource.runtime.cpuAsset.meshes[command.meshIndex]!;
            const gpuMesh = resource.gpuAsset.meshes[command.meshIndex]!;
            for (let primitiveIndex = 0; primitiveIndex < cpuMesh.primitives.length; primitiveIndex += 1) {
              const cpu = cpuMesh.primitives[primitiveIndex]!;
              const gpu = gpuMesh.primitives[primitiveIndex]!;
              if (gpu.normalBuffer === null || gpu.texcoord0Buffer === null) {
                throw new Error("Owner M6 validated vertex streams disappeared before draw.");
              }
              const material =
                cpu.materialIndex === null
                  ? null
                  : resource.runtime.cpuAsset.materials[cpu.materialIndex] ?? null;
              const textureMaterial =
                cpu.materialIndex === null
                  ? null
                  : resource.runtime.textureAsset.materials[cpu.materialIndex] ?? null;
              const baseColor = material?.baseColorFactor ?? [1, 1, 1, 1];
              const textureIndex = textureMaterial?.baseColorTextureIndex ?? null;
              const texture =
                textureIndex === null
                  ? null
                  : resource.textureGpuAsset.textures[textureIndex] ?? null;
              if (textureIndex !== null && texture === null) {
                throw new Error(`Owner M6 material references missing GPU texture ${textureIndex}.`);
              }

              if (material?.doubleSided === true) {
                gl.disable(gl.CULL_FACE);
              } else {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
              }

              gl.bindBuffer(gl.ARRAY_BUFFER, gpu.positionBuffer);
              gl.enableVertexAttribArray(programLocations.position);
              gl.vertexAttribPointer(programLocations.position, 3, gl.FLOAT, false, 0, 0);
              gl.bindBuffer(gl.ARRAY_BUFFER, gpu.normalBuffer);
              gl.enableVertexAttribArray(programLocations.normal);
              gl.vertexAttribPointer(programLocations.normal, 3, gl.FLOAT, false, 0, 0);
              gl.bindBuffer(gl.ARRAY_BUFFER, gpu.texcoord0Buffer);
              gl.enableVertexAttribArray(programLocations.uv);
              gl.vertexAttribPointer(programLocations.uv, 2, gl.FLOAT, false, 0, 0);
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpu.indexBuffer);

              gl.uniformMatrix4fv(
                programLocations.mvp,
                false,
                multiplyVehicleVisualMatricesV1(viewProjection, command.worldFromNode),
              );
              gl.uniformMatrix3fv(
                programLocations.normalMatrix,
                false,
                normalMatrix(command.worldFromNode),
              );
              gl.uniform4f(
                programLocations.baseColor,
                baseColor[0],
                baseColor[1],
                baseColor[2],
                baseColor[3],
              );
              gl.activeTexture(gl.TEXTURE0);
              gl.bindTexture(gl.TEXTURE_2D, texture);
              gl.uniform1i(programLocations.texture, 0);
              gl.uniform1f(programLocations.useTexture, texture === null ? 0 : 1);
              gl.uniform1f(
                programLocations.useAlphaMask,
                textureMaterial?.alphaMode === "MASK" ? 1 : 0,
              );
              gl.uniform1f(
                programLocations.alphaCutoff,
                textureMaterial?.alphaCutoff ?? 0,
              );
              gl.drawElements(
                gl.TRIANGLES,
                gpu.indexCount,
                gl.UNSIGNED_SHORT,
                0,
              );
            }
          }
        } finally {
          if (cullWasEnabled) {
            gl.enable(gl.CULL_FACE);
          } else {
            gl.disable(gl.CULL_FACE);
          }
          gl.cullFace(previousCullMode);
        }
        return true;
      },
      dispose(): void {
        if (isDisposed) {
          return;
        }
        isDisposed = true;
        gl.deleteProgram(programLocations.program);
        resource.dispose();
      },
    });
  } catch (error: unknown) {
    if (locations !== null) {
      gl.deleteProgram(locations.program);
    }
    resource.dispose();
    throw error;
  }
}
