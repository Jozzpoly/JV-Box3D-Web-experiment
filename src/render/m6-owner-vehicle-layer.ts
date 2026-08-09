import type { VehicleVisualFrameV1 } from "../runtime/vehicle-visual-frame.js";
import {
  buildVehicleVisualDrawPlanV1,
  type RigidMeshDrawCommandV1,
} from "../visual/rigid-mesh-draw-plan.js";
import {
  multiplyVehicleVisualMatricesV1,
  type VehicleVisualMatrixV1,
} from "../visual/vehicle-visual-transform.js";
import {
  createVehicleVisualRenderResourceV1,
  type VehicleVisualRenderResourceV1,
} from "./vehicle-visual-render-resource.js";

export const M6_OWNER_REAL_PART_IDS = Object.freeze([
  "m6.chassis",
  "m6.fl.wheel",
  "m6.fr.wheel",
  "m6.rl.wheel",
  "m6.rr.wheel",
] as const);

const VERTEX_SHADER_SOURCE = `
attribute vec3 aPosition;
attribute vec2 aUv;
uniform mat4 uMvp;
varying vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = uMvp * vec4(aPosition, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec4 uBaseColorFactor;
uniform bool uUseTexture;
uniform float uAlphaCutoff;
void main() {
  vec4 texel = uUseTexture ? texture2D(uTexture, vUv) : vec4(1.0);
  vec4 color = texel * uBaseColorFactor;
  if (uAlphaCutoff > 0.0 && color.a < uAlphaCutoff) {
    discard;
  }
  gl_FragColor = color;
}
`;

type ProgramLocations = Readonly<{
  program: WebGLProgram;
  position: number;
  uv: number;
  mvp: WebGLUniformLocation;
  texture: WebGLUniformLocation;
  baseColorFactor: WebGLUniformLocation;
  useTexture: WebGLUniformLocation;
  alphaCutoff: WebGLUniformLocation;
}>;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("Owner vehicle shader allocation failed.");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(`Owner vehicle shader compilation failed: ${message}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): ProgramLocations {
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
  const program = gl.createProgram();
  if (program === null) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error("Owner vehicle program allocation failed.");
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "unknown link error";
    gl.deleteProgram(program);
    throw new Error(`Owner vehicle program link failed: ${message}`);
  }
  const position = gl.getAttribLocation(program, "aPosition");
  const uv = gl.getAttribLocation(program, "aUv");
  const mvp = gl.getUniformLocation(program, "uMvp");
  const texture = gl.getUniformLocation(program, "uTexture");
  const baseColorFactor = gl.getUniformLocation(program, "uBaseColorFactor");
  const useTexture = gl.getUniformLocation(program, "uUseTexture");
  const alphaCutoff = gl.getUniformLocation(program, "uAlphaCutoff");
  if (
    position < 0 ||
    uv < 0 ||
    mvp === null ||
    texture === null ||
    baseColorFactor === null ||
    useTexture === null ||
    alphaCutoff === null
  ) {
    gl.deleteProgram(program);
    throw new Error("Owner vehicle program locations are incomplete.");
  }
  return Object.freeze({
    program,
    position,
    uv,
    mvp,
    texture,
    baseColorFactor,
    useTexture,
    alphaCutoff,
  });
}

function realNodeNames(resource: VehicleVisualRenderResourceV1): ReadonlySet<string> {
  const names = new Set<string>();
  for (const partId of M6_OWNER_REAL_PART_IDS) {
    const matches = resource.runtime.visualPackage.bindings.filter(
      (binding) =>
        binding.source.kind === "PART" && binding.source.partId === partId,
    );
    if (matches.length !== 1) {
      throw new Error(`Owner vehicle requires exactly one binding for ${partId}.`);
    }
    names.add(matches[0]!.nodeName);
  }
  if (names.size !== M6_OWNER_REAL_PART_IDS.length) {
    throw new Error("Owner vehicle real bindings must use five independent roots.");
  }
  return names;
}

export function buildM6OwnerRealDrawPlanV1(
  resource: VehicleVisualRenderResourceV1,
  frame: VehicleVisualFrameV1,
): readonly RigidMeshDrawCommandV1[] {
  const names = realNodeNames(resource);
  const commands = buildVehicleVisualDrawPlanV1(resource.runtime, frame).filter(
    (command) => command.nodeName !== null && names.has(command.nodeName),
  );
  if (commands.length !== M6_OWNER_REAL_PART_IDS.length) {
    throw new Error(
      `Owner vehicle draw plan expected ${M6_OWNER_REAL_PART_IDS.length} real commands, received ${commands.length}.`,
    );
  }
  return Object.freeze(commands);
}

export class M6OwnerVehicleLayer {
  readonly #gl: WebGLRenderingContext;
  #resource: VehicleVisualRenderResourceV1 | null = null;
  #locations: ProgramLocations | null = null;
  #loadAbort: AbortController | null = null;
  #loadGeneration = 0;
  #disposed = false;

  constructor(gl: WebGLRenderingContext) {
    this.#gl = gl;
  }

  async load(pageBaseUrl: string, packageUrl: string): Promise<void> {
    if (this.#disposed) {
      throw new Error("Owner vehicle layer has been disposed.");
    }
    this.#loadAbort?.abort();
    const controller = new AbortController();
    this.#loadAbort = controller;
    const generation = ++this.#loadGeneration;
    let resource: VehicleVisualRenderResourceV1 | null = null;
    let locations: ProgramLocations | null = null;
    try {
      resource = await createVehicleVisualRenderResourceV1(
        this.#gl,
        pageBaseUrl,
        packageUrl,
        { signal: controller.signal },
      );
      realNodeNames(resource);
      locations = createProgram(this.#gl);
      if (
        this.#disposed ||
        controller.signal.aborted ||
        generation !== this.#loadGeneration
      ) {
        throw new DOMException("Owner vehicle load was superseded.", "AbortError");
      }
      this.#resource?.dispose();
      if (this.#locations !== null) {
        this.#gl.deleteProgram(this.#locations.program);
      }
      this.#resource = resource;
      this.#locations = locations;
      resource = null;
      locations = null;
    } finally {
      resource?.dispose();
      if (locations !== null) {
        this.#gl.deleteProgram(locations.program);
      }
      if (this.#loadAbort === controller) {
        this.#loadAbort = null;
      }
    }
  }

  render(
    frame: VehicleVisualFrameV1,
    viewProjection: VehicleVisualMatrixV1,
  ): boolean {
    const resource = this.#resource;
    const locations = this.#locations;
    if (this.#disposed || resource === null || locations === null) {
      return false;
    }
    const commands = buildM6OwnerRealDrawPlanV1(resource, frame);
    this.#gl.useProgram(locations.program);
    try {
      for (const command of commands) {
        this.#drawCommand(resource, locations, command, viewProjection);
      }
    } finally {
      this.#gl.disable(this.#gl.CULL_FACE);
      this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
      this.#gl.disableVertexAttribArray(locations.uv);
    }
    return true;
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#loadGeneration += 1;
    this.#loadAbort?.abort();
    this.#loadAbort = null;
    this.#resource?.dispose();
    this.#resource = null;
    if (this.#locations !== null) {
      this.#gl.deleteProgram(this.#locations.program);
      this.#locations = null;
    }
  }

  #drawCommand(
    resource: VehicleVisualRenderResourceV1,
    locations: ProgramLocations,
    command: RigidMeshDrawCommandV1,
    viewProjection: VehicleVisualMatrixV1,
  ): void {
    const cpuMesh = resource.runtime.cpuAsset.meshes[command.meshIndex];
    const gpuMesh = resource.gpuAsset.meshes[command.meshIndex];
    if (cpuMesh === undefined || gpuMesh === undefined) {
      throw new Error(`Owner vehicle mesh ${command.meshIndex} is missing.`);
    }
    if (cpuMesh.primitives.length !== gpuMesh.primitives.length) {
      throw new Error(`Owner vehicle mesh ${command.meshIndex} CPU/GPU primitive count differs.`);
    }
    const mvp = multiplyVehicleVisualMatricesV1(
      viewProjection,
      command.worldFromNode,
    );
    this.#gl.uniformMatrix4fv(locations.mvp, false, mvp);

    for (let index = 0; index < cpuMesh.primitives.length; index += 1) {
      const cpu = cpuMesh.primitives[index]!;
      const gpu = gpuMesh.primitives[index]!;
      const material =
        cpu.materialIndex === null
          ? null
          : resource.runtime.cpuAsset.materials[cpu.materialIndex] ?? null;
      const factor = material?.baseColorFactor ?? [1, 1, 1, 1];
      this.#gl.uniform4f(
        locations.baseColorFactor,
        factor[0],
        factor[1],
        factor[2],
        factor[3],
      );
      this.#gl.uniform1f(
        locations.alphaCutoff,
        material?.alphaMode === "MASK" ? material.alphaCutoff : 0,
      );

      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, gpu.positionBuffer);
      this.#gl.enableVertexAttribArray(locations.position);
      this.#gl.vertexAttribPointer(
        locations.position,
        3,
        this.#gl.FLOAT,
        false,
        0,
        0,
      );

      const textureIndex = material?.baseColorTextureIndex ?? null;
      if (textureIndex === null) {
        this.#gl.uniform1i(locations.useTexture, 0);
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
        this.#gl.disableVertexAttribArray(locations.uv);
        this.#gl.vertexAttrib2f(locations.uv, 0, 0);
      } else {
        if (gpu.texcoord0Buffer === null) {
          throw new Error("Owner vehicle textured primitive is missing TEXCOORD_0 GPU data.");
        }
        const texture = resource.gpuTextures.textures[textureIndex];
        if (texture === undefined) {
          throw new Error(`Owner vehicle GPU texture ${textureIndex} is missing.`);
        }
        this.#gl.activeTexture(this.#gl.TEXTURE0);
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, texture);
        this.#gl.uniform1i(locations.texture, 0);
        this.#gl.uniform1i(locations.useTexture, 1);
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, gpu.texcoord0Buffer);
        this.#gl.enableVertexAttribArray(locations.uv);
        this.#gl.vertexAttribPointer(
          locations.uv,
          2,
          this.#gl.FLOAT,
          false,
          0,
          0,
        );
      }

      if (material?.doubleSided === true) {
        this.#gl.disable(this.#gl.CULL_FACE);
      } else {
        this.#gl.enable(this.#gl.CULL_FACE);
        this.#gl.cullFace(this.#gl.BACK);
      }
      this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, gpu.indexBuffer);
      this.#gl.drawElements(
        this.#gl.TRIANGLES,
        gpu.indexCount,
        this.#gl.UNSIGNED_SHORT,
        0,
      );
    }
  }
}
