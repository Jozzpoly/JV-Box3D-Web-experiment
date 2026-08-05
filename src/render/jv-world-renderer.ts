import type {
  JvColor,
  JvIndexedMesh,
  JvQuat,
  JvStaticCapsule,
  JvVec3,
  JvWorldData,
} from "../scene/jv-world-contract.js";

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
  indexType: number;
  texture: WebGLTexture | null;
}>;

type SolidBatch = Readonly<{
  color: JvColor;
  mesh: GpuMesh;
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
const IDENTITY_MODEL = modelMatrix(
  { x: 0, y: 0, z: 0 },
  IDENTITY_ROTATION,
  IDENTITY_SCALE,
);

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
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (program === null) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error("JV world program allocation failed.");
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "unknown link error";
    gl.deleteProgram(program);
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
    gl.deleteProgram(program);
    throw new Error("JV world program locations are incomplete.");
  }
  return { program, position, normal, uv, mvp, model, color, sampler };
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

function calculateNormals(
  positions: Float32Array,
  indices: Uint32Array,
): Float32Array {
  const normals = new Float32Array(positions.length);
  for (let offset = 0; offset < indices.length; offset += 3) {
    const ia = indices[offset]! * 3;
    const ib = indices[offset + 1]! * 3;
    const ic = indices[offset + 2]! * 3;
    const abx = positions[ib]! - positions[ia]!;
    const aby = positions[ib + 1]! - positions[ia + 1]!;
    const abz = positions[ib + 2]! - positions[ia + 2]!;
    const acx = positions[ic]! - positions[ia]!;
    const acy = positions[ic + 1]! - positions[ia + 1]!;
    const acz = positions[ic + 2]! - positions[ia + 2]!;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    for (const index of [ia, ib, ic]) {
      normals[index] = normals[index]! + nx;
      normals[index + 1] = normals[index + 1]! + ny;
      normals[index + 2] = normals[index + 2]! + nz;
    }
  }
  for (let offset = 0; offset < normals.length; offset += 3) {
    const length =
      Math.hypot(
        normals[offset]!,
        normals[offset + 1]!,
        normals[offset + 2]!,
      ) || 1;
    normals[offset] = normals[offset]! / length;
    normals[offset + 1] = normals[offset + 1]! / length;
    normals[offset + 2] = normals[offset + 2]! / length;
  }
  return normals;
}

function maxIndex(indices: Uint32Array): number {
  let maximum = 0;
  for (const index of indices) {
    maximum = Math.max(maximum, index);
  }
  return maximum;
}

function uploadMesh(
  gl: WebGLRenderingContext,
  mesh: JvIndexedMesh,
  uintIndicesAvailable: boolean,
): GpuMesh {
  const positionBuffer = gl.createBuffer();
  const normalBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  const uvBuffer = mesh.uvs === undefined ? null : gl.createBuffer();
  if (
    positionBuffer === null ||
    normalBuffer === null ||
    indexBuffer === null ||
    (mesh.uvs !== undefined && uvBuffer === null)
  ) {
    throw new Error("JV world GPU buffer allocation failed.");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    mesh.normals ?? calculateNormals(mesh.positions, mesh.indices),
    gl.STATIC_DRAW,
  );
  if (uvBuffer !== null && mesh.uvs !== undefined) {
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);
  }

  const useUint32 = maxIndex(mesh.indices) > 65_535;
  if (useUint32 && !uintIndicesAvailable) {
    throw new Error(
      "JV world needs OES_element_index_uint for the E2R/scan mesh.",
    );
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    useUint32 ? mesh.indices : new Uint16Array(mesh.indices),
    gl.STATIC_DRAW,
  );

  return {
    positionBuffer,
    normalBuffer,
    uvBuffer,
    indexBuffer,
    indexCount: mesh.indices.length,
    indexType: useUint32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
    texture: null,
  };
}

function boxPrimitive(): CpuPrimitive {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const faces = [
    { normal: [0, 0, -1], corners: [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1]] },
    { normal: [0, 0, 1], corners: [[-1,-1,1],[-1,1,1],[1,1,1],[1,-1,1]] },
    { normal: [-1, 0, 0], corners: [[-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,-1,1]] },
    { normal: [1, 0, 0], corners: [[1,-1,-1],[1,-1,1],[1,1,1],[1,1,-1]] },
    { normal: [0, -1, 0], corners: [[-1,-1,-1],[-1,-1,1],[1,-1,1],[1,-1,-1]] },
    { normal: [0, 1, 0], corners: [[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]] },
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

function buildStaticBatches(world: JvWorldData): readonly Readonly<{
  color: JvColor;
  mesh: JvIndexedMesh;
}>[] {
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
        {
          x: capsule.radius,
          y: length * 0.5,
          z: capsule.radius,
        },
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
    color: batch.color,
    mesh: {
      positions: new Float32Array(batch.positions),
      normals: new Float32Array(batch.normals),
      indices: new Uint32Array(batch.indices),
      color: batch.color,
    },
  }));
}

export class JvWorldRenderer {
  readonly #gl: WebGLRenderingContext;
  readonly #solid: ProgramLocations;
  readonly #textured: ProgramLocations;
  readonly #staticBatches: SolidBatch[] = [];
  readonly #offroad: GpuMesh;
  readonly #scanGroups: Array<Readonly<{
    gpu: GpuMesh;
    source: JvIndexedMesh;
  }>> = [];
  readonly #images: HTMLImageElement[] = [];
  readonly #world: JvWorldData;
  #disposed = false;

  constructor(gl: WebGLRenderingContext, world: JvWorldData) {
    this.#gl = gl;
    this.#world = world;
    const uintIndicesAvailable =
      gl.getExtension("OES_element_index_uint") !== null;
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

    for (const batch of buildStaticBatches(world)) {
      this.#staticBatches.push({
        color: batch.color,
        mesh: uploadMesh(gl, batch.mesh, uintIndicesAvailable),
      });
    }
    this.#offroad = uploadMesh(
      gl,
      world.offroad,
      uintIndicesAvailable,
    );

    if (world.scan !== null) {
      for (const source of world.scan.groups) {
        const gpu = uploadMesh(gl, source, uintIndicesAvailable);
        if (source.textureUrl !== undefined) {
          const texture = this.#createTexture(source.textureUrl);
          this.#scanGroups.push({
            gpu: { ...gpu, texture },
            source,
          });
        } else {
          this.#scanGroups.push({ gpu, source });
        }
      }
    }
  }

  get drawCallBudget(): number {
    return (
      this.#staticBatches.length +
      1 +
      this.#scanGroups.length
    );
  }

  render(viewProjection: JvRenderMatrix): void {
    if (this.#disposed) {
      return;
    }
    for (const batch of this.#staticBatches) {
      this.#drawSolid(
        batch.mesh,
        viewProjection,
        IDENTITY_MODEL,
        batch.color,
      );
    }

    this.#drawSolid(
      this.#offroad,
      viewProjection,
      IDENTITY_MODEL,
      this.#world.offroad.color,
    );

    if (this.#world.scan !== null) {
      const scanModel = modelMatrix(
        this.#world.scan.origin,
        IDENTITY_ROTATION,
        IDENTITY_SCALE,
      );
      for (const group of this.#scanGroups) {
        if (group.gpu.texture === null) {
          this.#drawSolid(
            group.gpu,
            viewProjection,
            scanModel,
            group.source.color,
          );
        } else {
          this.#drawTextured(
            group.gpu,
            viewProjection,
            scanModel,
            group.source.color,
          );
        }
      }
    }
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    for (const image of this.#images) {
      image.onload = null;
      image.onerror = null;
      image.src = "";
    }
    this.#images.length = 0;
    for (const batch of this.#staticBatches) {
      this.#deleteMesh(batch.mesh);
    }
    this.#staticBatches.length = 0;
    this.#deleteMesh(this.#offroad);
    for (const group of this.#scanGroups) {
      this.#deleteMesh(group.gpu);
    }
    this.#scanGroups.length = 0;
    this.#gl.deleteProgram(this.#solid.program);
    this.#gl.deleteProgram(this.#textured.program);
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
    image.decoding = "async";
    image.onload = () => {
      if (this.#disposed) {
        return;
      }
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
    };
    image.onerror = () => {
      console.error(`JV scan texture failed to load: ${url}`);
    };
    image.src = url;
    this.#images.push(image);
    return texture;
  }

  #drawSolid(
    mesh: GpuMesh,
    viewProjection: JvRenderMatrix,
    model: JvRenderMatrix,
    color: JvColor,
  ): void {
    const gl = this.#gl;
    const locations = this.#solid;
    gl.useProgram(locations.program);
    this.#bindCommon(mesh, locations);
    gl.uniformMatrix4fv(
      locations.mvp,
      false,
      multiply(viewProjection, model),
    );
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
      mesh.indexType,
      0,
    );
  }

  #drawTextured(
    mesh: GpuMesh,
    viewProjection: JvRenderMatrix,
    model: JvRenderMatrix,
    color: JvColor,
  ): void {
    const gl = this.#gl;
    const locations = this.#textured;
    if (
      mesh.texture === null ||
      mesh.uvBuffer === null ||
      locations.uv === null ||
      locations.sampler === null
    ) {
      throw new Error("Textured JV scan group has an incomplete GPU binding.");
    }
    gl.useProgram(locations.program);
    this.#bindCommon(mesh, locations);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);
    gl.enableVertexAttribArray(locations.uv);
    gl.vertexAttribPointer(locations.uv, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(
      locations.mvp,
      false,
      multiply(viewProjection, model),
    );
    gl.uniformMatrix4fv(locations.model, false, model);
    gl.uniform4f(
      locations.color,
      color[0],
      color[1],
      color[2],
      color[3],
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mesh.texture);
    gl.uniform1i(locations.sampler, 0);
    gl.drawElements(
      gl.TRIANGLES,
      mesh.indexCount,
      mesh.indexType,
      0,
    );
  }

  #bindCommon(mesh: GpuMesh, locations: ProgramLocations): void {
    const gl = this.#gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
    gl.enableVertexAttribArray(locations.position);
    gl.vertexAttribPointer(
      locations.position,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
    gl.enableVertexAttribArray(locations.normal);
    gl.vertexAttribPointer(
      locations.normal,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
  }

  #deleteMesh(mesh: GpuMesh): void {
    const gl = this.#gl;
    gl.deleteBuffer(mesh.positionBuffer);
    gl.deleteBuffer(mesh.normalBuffer);
    if (mesh.uvBuffer !== null) {
      gl.deleteBuffer(mesh.uvBuffer);
    }
    gl.deleteBuffer(mesh.indexBuffer);
    if (mesh.texture !== null) {
      gl.deleteTexture(mesh.texture);
    }
  }
}
