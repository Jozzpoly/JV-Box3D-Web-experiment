import type {
  JvBounds,
  JvColor,
  JvIndexedMesh,
  JvQuat,
  JvStaticCapsule,
  JvVec3,
  JvWorldData,
} from "../scene/jv-world-contract.js";
import {
  calculateJvMeshBounds,
  isJvBoundsVisibleInClipSpace,
} from "./jv-frustum-culling.js";
import {
  splitJvIndexedMeshForUint16,
  type JvUint16MeshChunk,
} from "./jv-mesh-chunker.js";
import {
  clearJvScanRenderStats,
  publishJvScanRenderStats,
} from "./jv-scan-render-stats.js";

export type JvRenderMatrix = Float32Array;

type CpuPrimitive = Readonly<{
  positions: readonly number[];
  normals: readonly number[];
  indices: readonly number[];
}>;

type BatchBuilder = {
  readonly color: JvColor;
  readonly positions: number[];
  readonly normals: number[];
  readonly indices: number[];
};

type GpuMesh = Readonly<{
  positionBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer;
  indexCount: number;
}>;

type GpuGroup = Readonly<{
  color: JvColor;
  meshes: readonly GpuMesh[];
  texture: WebGLTexture | null;
  bounds: JvBounds | null;
}>;

type ProgramLocations = Readonly<{
  program: WebGLProgram;
  position: number;
  normal: number;
  uv: number | null;
  mvp: WebGLUniformLocation;
  model: WebGLUniformLocation;
  color: WebGLUniformLocation;
  sampler: WebGLUniformLocation | null;
}>;

const SOLID_VERTEX = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uMvp;
uniform mat4 uModel;
varying float vLight;
void main() {
  vec3 normal = normalize(mat3(uModel) * aNormal);
  vec3 lightDirection = normalize(vec3(0.35, 0.85, 0.45));
  vLight = 0.32 + 0.68 * max(dot(normal, lightDirection), 0.0);
  gl_Position = uMvp * vec4(aPosition, 1.0);
}
`;

const SOLID_FRAGMENT = `
precision mediump float;
uniform vec4 uColor;
varying float vLight;
void main() {
  gl_FragColor = vec4(uColor.rgb * vLight, uColor.a);
}
`;

const TEXTURED_VERTEX = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUv;
uniform mat4 uMvp;
uniform mat4 uModel;
varying vec2 vUv;
varying float vLight;
void main() {
  vec3 normal = normalize(mat3(uModel) * aNormal);
  vec3 lightDirection = normalize(vec3(0.35, 0.85, 0.45));
  vLight = 0.42 + 0.58 * max(dot(normal, lightDirection), 0.0);
  vUv = aUv;
  gl_Position = uMvp * vec4(aPosition, 1.0);
}
`;

const TEXTURED_FRAGMENT = `
precision mediump float;
uniform sampler2D uTexture;
uniform vec4 uColor;
varying vec2 vUv;
varying float vLight;
void main() {
  vec4 texel = texture2D(uTexture, vUv);
  gl_FragColor = vec4(texel.rgb * uColor.rgb * vLight, texel.a * uColor.a);
}
`;

const IDENTITY_ROTATION: JvQuat = { x: 0, y: 0, z: 0, w: 1 };
const IDENTITY_SCALE: JvVec3 = { x: 1, y: 1, z: 1 };

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("JV world shader allocation failed.");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(`JV world shader compilation failed: ${message}`);
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
  textured: boolean,
): ProgramLocations {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  let fragment: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  try {
    fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    if (program === null) {
      throw new Error("JV world program allocation failed.");
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) ?? "unknown link error";
      throw new Error(`JV world program link failed: ${message}`);
    }

    const position = gl.getAttribLocation(program, "aPosition");
    const normal = gl.getAttribLocation(program, "aNormal");
    const uv = textured ? gl.getAttribLocation(program, "aUv") : null;
    const mvp = gl.getUniformLocation(program, "uMvp");
    const model = gl.getUniformLocation(program, "uModel");
    const color = gl.getUniformLocation(program, "uColor");
    const sampler = textured
      ? gl.getUniformLocation(program, "uTexture")
      : null;
    if (
      position < 0 ||
      normal < 0 ||
      (uv !== null && uv < 0) ||
      mvp === null ||
      model === null ||
      color === null ||
      (textured && sampler === null)
    ) {
      throw new Error("JV world program locations are incomplete.");
    }
    return { program, position, normal, uv, mvp, model, color, sampler };
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

function multiply(a: JvRenderMatrix, b: JvRenderMatrix): JvRenderMatrix {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] =
        a[row]! * b[column * 4]! +
        a[4 + row]! * b[column * 4 + 1]! +
        a[8 + row]! * b[column * 4 + 2]! +
        a[12 + row]! * b[column * 4 + 3]!;
    }
  }
  return out;
}

function modelMatrix(
  position: JvVec3,
  rotation: JvQuat,
  scale: JvVec3,
): JvRenderMatrix {
  const { x, y, z, w } = rotation;
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const xz = x * z;
  const yz = y * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;
  return new Float32Array([
    (1 - 2 * (yy + zz)) * scale.x,
    (2 * (xy + wz)) * scale.x,
    (2 * (xz - wy)) * scale.x,
    0,
    (2 * (xy - wz)) * scale.y,
    (1 - 2 * (xx + zz)) * scale.y,
    (2 * (yz + wx)) * scale.y,
    0,
    (2 * (xz + wy)) * scale.z,
    (2 * (yz - wx)) * scale.z,
    (1 - 2 * (xx + yy)) * scale.z,
    0,
    position.x,
    position.y,
    position.z,
    1,
  ]);
}

const IDENTITY_MODEL = modelMatrix(
  { x: 0, y: 0, z: 0 },
  IDENTITY_ROTATION,
  IDENTITY_SCALE,
);

function rotate(rotation: JvQuat, value: JvVec3): JvVec3 {
  const ix = rotation.w * value.x + rotation.y * value.z - rotation.z * value.y;
  const iy = rotation.w * value.y + rotation.z * value.x - rotation.x * value.z;
  const iz = rotation.w * value.z + rotation.x * value.y - rotation.y * value.x;
  const iw = -rotation.x * value.x - rotation.y * value.y - rotation.z * value.z;
  return {
    x: ix * rotation.w + iw * -rotation.x + iy * -rotation.z - iz * -rotation.y,
    y: iy * rotation.w + iw * -rotation.y + iz * -rotation.x - ix * -rotation.z,
    z: iz * rotation.w + iw * -rotation.z + ix * -rotation.y - iy * -rotation.x,
  };
}

function add(a: JvVec3, b: JvVec3): JvVec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function normalize(value: JvVec3): JvVec3 {
  const length = Math.hypot(value.x, value.y, value.z) || 1;
  return { x: value.x / length, y: value.y / length, z: value.z / length };
}

function rotationFromYAxis(direction: JvVec3): JvQuat {
  const normalized = normalize(direction);
  const dot = Math.max(-1, Math.min(1, normalized.y));
  if (dot > 0.999_999) {
    return IDENTITY_ROTATION;
  }
  if (dot < -0.999_999) {
    return { x: 1, y: 0, z: 0, w: 0 };
  }
  const axis = normalize({ x: normalized.z, y: 0, z: -normalized.x });
  const half = Math.acos(dot) / 2;
  const sine = Math.sin(half);
  return {
    x: axis.x * sine,
    y: axis.y * sine,
    z: axis.z * sine,
    w: Math.cos(half),
  };
}

function boxPrimitive(): CpuPrimitive {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const faces = [
    { normal: [0, 0, -1], corners: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1]] },
    { normal: [0, 0, 1], corners: [[-1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, 1]] },
    { normal: [-1, 0, 0], corners: [[-1, -1, -1], [-1, 1, -1], [-1, 1, 1], [-1, -1, 1]] },
    { normal: [1, 0, 0], corners: [[1, -1, -1], [1, -1, 1], [1, 1, 1], [1, 1, -1]] },
    { normal: [0, -1, 0], corners: [[-1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, -1, -1]] },
    { normal: [0, 1, 0], corners: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]] },
  ] as const;
  for (const face of faces) {
    const base = positions.length / 3;
    for (const corner of face.corners) {
      positions.push(corner[0], corner[1], corner[2]);
      normals.push(face.normal[0], face.normal[1], face.normal[2]);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { positions, normals, indices };
}

function cylinderPrimitive(segments = 16): CpuPrimitive {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    positions.push(x, -1, z, x, 1, z);
    normals.push(x, 0, z, x, 0, z);
  }
  for (let index = 0; index < segments; index += 1) {
    const next = (index + 1) % segments;
    const bottom = index * 2;
    const top = bottom + 1;
    const nextBottom = next * 2;
    const nextTop = nextBottom + 1;
    indices.push(bottom, nextBottom, top, top, nextBottom, nextTop);
  }
  return { positions, normals, indices };
}

function spherePrimitive(latitude = 6, longitude = 12): CpuPrimitive {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  for (let lat = 0; lat <= latitude; lat += 1) {
    const theta = (lat / latitude) * Math.PI;
    const y = Math.cos(theta);
    const radius = Math.sin(theta);
    for (let lon = 0; lon <= longitude; lon += 1) {
      const phi = (lon / longitude) * Math.PI * 2;
      const x = radius * Math.cos(phi);
      const z = radius * Math.sin(phi);
      positions.push(x, y, z);
      normals.push(x, y, z);
    }
  }
  for (let lat = 0; lat < latitude; lat += 1) {
    for (let lon = 0; lon < longitude; lon += 1) {
      const a = lat * (longitude + 1) + lon;
      const b = a + longitude + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return { positions, normals, indices };
}

function colorKey(color: JvColor): string {
  return color.join(",");
}

function getBatch(
  batches: Map<string, BatchBuilder>,
  color: JvColor,
): BatchBuilder {
  const key = colorKey(color);
  const existing = batches.get(key);
  if (existing !== undefined) {
    return existing;
  }
  const created: BatchBuilder = {
    color,
    positions: [],
    normals: [],
    indices: [],
  };
  batches.set(key, created);
  return created;
}

function appendPrimitive(
  batch: BatchBuilder,
  primitive: CpuPrimitive,
  position: JvVec3,
  rotation: JvQuat,
  scale: JvVec3,
): void {
  const vertexBase = batch.positions.length / 3;
  for (let offset = 0; offset < primitive.positions.length; offset += 3) {
    const local = {
      x: primitive.positions[offset]! * scale.x,
      y: primitive.positions[offset + 1]! * scale.y,
      z: primitive.positions[offset + 2]! * scale.z,
    };
    const world = add(position, rotate(rotation, local));
    batch.positions.push(world.x, world.y, world.z);
    const normal = normalize(
      rotate(rotation, {
        x: primitive.normals[offset]!,
        y: primitive.normals[offset + 1]!,
        z: primitive.normals[offset + 2]!,
      }),
    );
    batch.normals.push(normal.x, normal.y, normal.z);
  }
  for (const index of primitive.indices) {
    batch.indices.push(vertexBase + index);
  }
}

function capsuleWorldEndpoints(capsule: JvStaticCapsule) {
  return {
    first: add(
      capsule.bodyCenter,
      rotate(capsule.bodyRotation, capsule.point1),
    ),
    second: add(
      capsule.bodyCenter,
      rotate(capsule.bodyRotation, capsule.point2),
    ),
  };
}

function buildStaticBatchMeshes(world: JvWorldData): readonly JvIndexedMesh[] {
  const batches = new Map<string, BatchBuilder>();
  const box = boxPrimitive();
  const cylinder = cylinderPrimitive();
  const sphere = spherePrimitive();

  for (const item of world.boxes) {
    appendPrimitive(
      getBatch(batches, item.color),
      box,
      item.center,
      item.rotation,
      item.halfExtents,
    );
  }

  for (const capsule of world.capsules) {
    const batch = getBatch(batches, capsule.color);
    const endpoints = capsuleWorldEndpoints(capsule);
    const delta = {
      x: endpoints.second.x - endpoints.first.x,
      y: endpoints.second.y - endpoints.first.y,
      z: endpoints.second.z - endpoints.first.z,
    };
    const length = Math.hypot(delta.x, delta.y, delta.z);
    const midpoint = {
      x: (endpoints.first.x + endpoints.second.x) * 0.5,
      y: (endpoints.first.y + endpoints.second.y) * 0.5,
      z: (endpoints.first.z + endpoints.second.z) * 0.5,
    };
    if (length > 1e-6) {
      appendPrimitive(
        batch,
        cylinder,
        midpoint,
        rotationFromYAxis(delta),
        { x: capsule.radius, y: length * 0.5, z: capsule.radius },
      );
    }
    const capScale = {
      x: capsule.radius,
      y: capsule.radius,
      z: capsule.radius,
    };
    appendPrimitive(
      batch,
      sphere,
      endpoints.first,
      IDENTITY_ROTATION,
      capScale,
    );
    appendPrimitive(
      batch,
      sphere,
      endpoints.second,
      IDENTITY_ROTATION,
      capScale,
    );
  }

  return [...batches.values()].map((batch) => ({
    positions: new Float32Array(batch.positions),
    normals: new Float32Array(batch.normals),
    indices: new Uint32Array(batch.indices),
    color: batch.color,
  }));
}

function uploadChunk(
  gl: WebGLRenderingContext,
  chunk: JvUint16MeshChunk,
): GpuMesh {
  const positionBuffer = gl.createBuffer();
  const normalBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  const uvBuffer = chunk.uvs === undefined ? null : gl.createBuffer();
  if (
    positionBuffer === null ||
    normalBuffer === null ||
    indexBuffer === null ||
    (chunk.uvs !== undefined && uvBuffer === null)
  ) {
    if (positionBuffer !== null) gl.deleteBuffer(positionBuffer);
    if (normalBuffer !== null) gl.deleteBuffer(normalBuffer);
    if (indexBuffer !== null) gl.deleteBuffer(indexBuffer);
    if (uvBuffer !== null) gl.deleteBuffer(uvBuffer);
    throw new Error("JV world GPU buffer allocation failed.");
  }

  try {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, chunk.positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, chunk.normals, gl.STATIC_DRAW);
    if (uvBuffer !== null && chunk.uvs !== undefined) {
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, chunk.uvs, gl.STATIC_DRAW);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, chunk.indices, gl.STATIC_DRAW);
    return {
      positionBuffer,
      normalBuffer,
      uvBuffer,
      indexBuffer,
      indexCount: chunk.indices.length,
    };
  } catch (error: unknown) {
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(normalBuffer);
    gl.deleteBuffer(indexBuffer);
    if (uvBuffer !== null) gl.deleteBuffer(uvBuffer);
    throw error;
  }
}

export class JvWorldRendererMobile {
  readonly #gl: WebGLRenderingContext;
  readonly #world: JvWorldData;
  readonly #staticGroups: GpuGroup[] = [];
  readonly #scanGroups: GpuGroup[] = [];
  readonly #pendingImages = new Set<HTMLImageElement>();
  readonly #scanModel: JvRenderMatrix | null;
  readonly #scanDrawCallBudget: number;
  #solid: ProgramLocations | null = null;
  #textured: ProgramLocations | null = null;
  #offroad: GpuGroup | null = null;
  #disposed = false;

  constructor(gl: WebGLRenderingContext, world: JvWorldData) {
    this.#gl = gl;
    this.#world = world;
    this.#scanModel = world.scan === null
      ? null
      : modelMatrix(world.scan.origin, IDENTITY_ROTATION, IDENTITY_SCALE);
    try {
      this.#solid = createProgram(
        gl,
        SOLID_VERTEX,
        SOLID_FRAGMENT,
        false,
      );
      this.#textured = createProgram(
        gl,
        TEXTURED_VERTEX,
        TEXTURED_FRAGMENT,
        true,
      );
      for (const mesh of buildStaticBatchMeshes(world)) {
        this.#staticGroups.push(this.#uploadGroup(mesh));
      }
      this.#offroad = this.#uploadGroup(world.offroad);
      if (world.scan !== null) {
        for (const source of world.scan.groups) {
          this.#scanGroups.push(this.#uploadGroup(source, true));
        }
      }
    } catch (error: unknown) {
      this.#releaseResources();
      this.#disposed = true;
      throw error;
    }
    this.#scanDrawCallBudget = this.#scanGroups.reduce(
      (sum, group) => sum + group.meshes.length,
      0,
    );
  }

  get drawCallBudget(): number {
    let count = this.#offroad?.meshes.length ?? 0;
    for (const group of this.#staticGroups) count += group.meshes.length;
    for (const group of this.#scanGroups) count += group.meshes.length;
    return count;
  }

  render(viewProjection: JvRenderMatrix): void {
    if (this.#disposed) {
      return;
    }
    for (const group of this.#staticGroups) {
      this.#drawGroup(group, viewProjection, IDENTITY_MODEL);
    }
    if (this.#offroad !== null) {
      this.#drawGroup(this.#offroad, viewProjection, IDENTITY_MODEL);
    }

    let visibleScanGroups = 0;
    let visibleScanDrawCalls = 0;
    if (this.#scanModel !== null) {
      const clipFromScanLocal = multiply(viewProjection, this.#scanModel);
      for (const group of this.#scanGroups) {
        if (
          group.bounds !== null &&
          !isJvBoundsVisibleInClipSpace(group.bounds, clipFromScanLocal)
        ) {
          continue;
        }
        visibleScanGroups += 1;
        visibleScanDrawCalls += group.meshes.length;
        this.#drawGroup(group, clipFromScanLocal, this.#scanModel);
      }
    }
    publishJvScanRenderStats(
      this.#gl.canvas,
      visibleScanGroups,
      this.#scanGroups.length,
      visibleScanDrawCalls,
      this.#scanDrawCallBudget,
    );
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    clearJvScanRenderStats(this.#gl.canvas);
    this.#releaseResources();
  }

  #uploadGroup(source: JvIndexedMesh, captureBounds = false): GpuGroup {
    const bounds = captureBounds
      ? calculateJvMeshBounds(source.positions)
      : null;
    const meshes: GpuMesh[] = [];
    let texture: WebGLTexture | null = null;
    try {
      for (const chunk of splitJvIndexedMeshForUint16(source)) {
        meshes.push(uploadChunk(this.#gl, chunk));
      }
      if (source.textureUrl !== undefined) {
        if (source.uvs === undefined) {
          throw new Error("Textured JV mesh has no UV stream.");
        }
        texture = this.#createTexture(source.textureUrl);
      }
      return { color: source.color, meshes, texture, bounds };
    } catch (error: unknown) {
      for (const mesh of meshes) this.#deleteMesh(mesh);
      if (texture !== null) this.#gl.deleteTexture(texture);
      throw error;
    }
  }

  #createTexture(url: string): WebGLTexture {
    const gl = this.#gl;
    const texture = gl.createTexture();
    if (texture === null) {
      throw new Error("JV scan texture allocation failed.");
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([190, 190, 184, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const image = new Image();
    const releaseImage = (): void => {
      image.onload = null;
      image.onerror = null;
      this.#pendingImages.delete(image);
      image.src = "";
    };
    image.decoding = "async";
    image.onload = () => {
      if (!this.#disposed) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      }
      releaseImage();
    };
    image.onerror = () => {
      console.error(`JV scan texture failed to load: ${url}`);
      releaseImage();
    };
    this.#pendingImages.add(image);
    image.src = url;
    return texture;
  }

  #drawGroup(
    group: GpuGroup,
    mvp: JvRenderMatrix,
    model: JvRenderMatrix,
  ): void {
    for (const mesh of group.meshes) {
      if (group.texture === null) {
        this.#drawSolid(mesh, mvp, model, group.color);
      } else {
        this.#drawTextured(
          mesh,
          group.texture,
          mvp,
          model,
          group.color,
        );
      }
    }
  }

  #drawSolid(
    mesh: GpuMesh,
    mvp: JvRenderMatrix,
    model: JvRenderMatrix,
    color: JvColor,
  ): void {
    const locations = this.#solid;
    if (locations === null) {
      throw new Error("JV solid renderer is unavailable.");
    }
    const gl = this.#gl;
    gl.useProgram(locations.program);
    this.#bindCommon(mesh, locations);
    gl.uniformMatrix4fv(locations.mvp, false, mvp);
    gl.uniformMatrix4fv(locations.model, false, model);
    gl.uniform4f(
      locations.color,
      color[0],
      color[1],
      color[2],
      color[3],
    );
    gl.drawElements(
      gl.TRIANGLES,
      mesh.indexCount,
      gl.UNSIGNED_SHORT,
      0,
    );
  }

  #drawTextured(
    mesh: GpuMesh,
    texture: WebGLTexture,
    mvp: JvRenderMatrix,
    model: JvRenderMatrix,
    color: JvColor,
  ): void {
    const locations = this.#textured;
    if (
      locations === null ||
      locations.uv === null ||
      locations.sampler === null ||
      mesh.uvBuffer === null
    ) {
      throw new Error("Textured JV mesh has an incomplete GPU binding.");
    }
    const gl = this.#gl;
    gl.useProgram(locations.program);
    this.#bindCommon(mesh, locations);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);
    gl.enableVertexAttribArray(locations.uv);
    gl.vertexAttribPointer(locations.uv, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(locations.mvp, false, mvp);
    gl.uniformMatrix4fv(locations.model, false, model);
    gl.uniform4f(
      locations.color,
      color[0],
      color[1],
      color[2],
      color[3],
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(locations.sampler, 0);
    gl.drawElements(
      gl.TRIANGLES,
      mesh.indexCount,
      gl.UNSIGNED_SHORT,
      0,
    );
  }

  #bindCommon(mesh: GpuMesh, locations: ProgramLocations): void {
    const gl = this.#gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
    gl.enableVertexAttribArray(locations.position);
    gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
    gl.enableVertexAttribArray(locations.normal);
    gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
  }

  #releaseResources(): void {
    for (const image of this.#pendingImages) {
      image.onload = null;
      image.onerror = null;
      image.src = "";
    }
    this.#pendingImages.clear();
    for (const group of this.#staticGroups) this.#deleteGroup(group);
    this.#staticGroups.length = 0;
    if (this.#offroad !== null) {
      this.#deleteGroup(this.#offroad);
      this.#offroad = null;
    }
    for (const group of this.#scanGroups) this.#deleteGroup(group);
    this.#scanGroups.length = 0;
    if (this.#solid !== null) {
      this.#gl.deleteProgram(this.#solid.program);
      this.#solid = null;
    }
    if (this.#textured !== null) {
      this.#gl.deleteProgram(this.#textured.program);
      this.#textured = null;
    }
  }

  #deleteGroup(group: GpuGroup): void {
    for (const mesh of group.meshes) this.#deleteMesh(mesh);
    if (group.texture !== null) this.#gl.deleteTexture(group.texture);
  }

  #deleteMesh(mesh: GpuMesh): void {
    this.#gl.deleteBuffer(mesh.positionBuffer);
    this.#gl.deleteBuffer(mesh.normalBuffer);
    if (mesh.uvBuffer !== null) this.#gl.deleteBuffer(mesh.uvBuffer);
    this.#gl.deleteBuffer(mesh.indexBuffer);
  }
}
