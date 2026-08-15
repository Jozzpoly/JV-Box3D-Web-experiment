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
import { getJvPerformanceExperimentSettings } from "./jv-performance-experiment-settings.js";
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
  indexType: number;
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
  gl_FragColor = vec4(texel.rgb * uColor.rgb * vLigight, texel.a * uColor.a);
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
    if (!gl.getProgramParameter(program, gl.LINK_STATUT)) {
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
  const normalized = normalize(direc²È="24¹Õ±°€˜˜(€€€€€€€€€€…¥Í)Ù	½Õ¹‘ÍY¥Í¥‰±•%¹±¥ÁMÁ…”¡É½ÕÀ¹‰½Õ¹‘Ì°±¥ÁÉ½µM…¹1½…°¤(€€€€€€€€¤ì(€€€€€€€€€½¹Ñ¥¹Õ”ì(€€€€€€€ô(€€€€€€€Ù¥Í¥‰±•M…¹É½ÕÁÌ€¬ô€Äì(€€€€€€€Ù¥Í¥‰±•M…¹É…Ý…±±Ì€¬ôÉ½ÕÀ¹µ•Í¡•Ì¹±•¹Ñ ì(€€€€€€€Ñ¡¥Ì¸‘É…ÝÉ½ÕÀ¡É½ÕÀ°±¥ÁÉ½µM…¹1½…°°Ñ¡¥Ì¸Í…¹5½‘•°¤ì(€€€€€ô(€€€ô(€€€ÁÕ‰±¥Í¡)ÙM…¹I•¹‘•ÉMÑ…ÑÌ (€€€€€Ñ¡¥Ì¸°¹…¹Ù…Ì°(€€€€€Ù¥Í¥‰±•M…¹É½ÕÁÌ°(€€€€€Ñ¡¥Ì¸Í…¹É½ÕÁÌ¹±•¹Ñ °(€€€€€Ù¥Í¥‰±•M…¹É…Ý…±±Ì°(€€€€€Ñ¡¥Ì¸Í…¹É…Ý…±±	Õ‘•Ð°(€€€€¤ì(€ô((€‘¥ÍÁ½Í” ¤èÙ½¥ì(€€€¥˜€¡Ñ¡¥Ì¸‘¥ÍÁ½Í•¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€Ñ¡¥Ì¸‘¥ÍÁ½Í•€ôÑÉÕ”ì(€€€±•…É)ÙM…¹I•¹‘•ÉMÑ…ÑÌ¡Ñ¡¥Ì¸°¹…¹Ù…Ì¤ì(€€€Ñ¡¥Ì¸É•±•…Í•I•Í½ÕÉ•Ì ¤ì(€ô((€€ÕÁ±½…‘É½ÕÀ¡Í½ÕÉ”è)Ù%¹‘•á•‘5•Í °…ÁÑÕÉ•	½Õ¹‘Ì€ô™…±Í”¤èÁÕÉ½ÕÀì(€€€½¹ÍÐ‰½Õ¹‘Ì€ô…ÁÑÕÉ•	½Õ¹‘Ì(€€€€€€ü…±Õ±…Ñ•)Ù5•Í¡	½Õ¹‘Ì¡Í½ÕÉ”¹Á½Í¥Ñ¥½¹Ì¤(€€€€€€è¹Õ±°ì(€€€½¹ÍÐµ•Í¡•ÌèÁÕ5•Í¡mt€ômtì(€€€±•ÐÑ•áÑÕÉ”è]•‰1Q•áÑÕÉ”ð¹Õ±°€ô¹Õ±°ì(€€€ÑÉäì(€€€€€½¹ÍÐÙ•ÉÑ•á½Õ¹Ð€ôÍ½ÕÉ”¹Á½Í¥Ñ¥½¹Ì¹±•¹Ñ €¼€Ìì(€€€€€¥˜€ (€€€€€€€…ÁÑÕÉ•	½Õ¹‘Ì€˜˜(€€€€€€€Ù•ÉÑ•á½Õ¹Ð€ø€ØÕ|ÔÌÔ€˜˜(€€€€€€€Ñ¡¥Ì¸Õ¥¹ÐÌÉ±•µ•¹Ñ%¹‘¥•Ì€˜˜(€€€€€€€Í½ÕÉ”¹¹½Éµ…±Ì€„ôôÕ¹‘•™¥¹•(€€€€€€¤ì(€€€€€€€µ•Í¡•Ì¹ÁÕÍ ¡ÕÁ±½…‘U¥¹ÐÌÉ5•Í ¡Ñ¡¥Ì¸°°Í½ÕÉ”¤¤ì(€€€€€ô•±Í”ì(€€€€€€€™½È€¡½¹ÍÐ¡Õ¹¬½˜ÍÁ±¥Ñ)Ù%¹‘•á•‘5•Í¡½ÉU¥¹ÐÄØ¡Í½ÕÉ”¤¤ì(€€€€€€€€€µ•Í¡•Ì¹ÁÕÍ ¡ÕÁ±½…‘¡Õ¹¬¡Ñ¡¥Ì¸°°¡Õ¹¬¤¤ì(€€€€€€€ô(€€€€€ô(€€€€€¥˜€¡Í½ÕÉ”¹Ñ•áÑÕÉ•UÉ°€„ôôÕ¹‘•™¥¹•¤ì(€€€€€€€¥˜€¡Í½ÕÉ”¹ÕÙÌ€ôôôÕ¹‘•™¥¹•¤ì(€€€€€€€€€Ñ¡É½Ü¹•ÜÉÉ½È ‰Q•áÑÕÉ•)Xµ•Í ¡…Ì¹¼UXÍÑÉ•…´¸ˆ¤ì(€€€€€€€ô(€€€€€€€Ñ•áÑÕÉ”€ôÑ¡¥Ì¸É•…Ñ•Q•áÑÕÉ”¡Í½ÕÉ”¹Ñ•áÑÕÉ•UÉ°¤ì(€€€€€ô(€€€€€É•ÑÕÉ¸ì½±½ÈèÍ½ÕÉ”¹½±½È°µ•Í¡•Ì°Ñ•áÑÕÉ”°‰½Õ¹‘Ìôì(€€€ô…Ñ €¡•ÉÉ½ÈèÕ¹­¹½Ý¸¤ì(€€€€€™½È€¡½¹ÍÐµ•Í ½˜µ•Í¡•Ì¤Ñ¡¥Ì¸‘•±•Ñ•5•Í ¡µ•Í ¤ì(€€€€€¥˜€¡Ñ•áÑÕÉ”€„ôô¹Õ±°¤Ñ¡¥Ì¸°¹‘•±•Ñ•Q•áÑÕÉ”¡Ñ•áÑÕÉ”¤ì(€€€€€Ñ¡É½Ü•ÉÉ½Èì(€€€ô(€ô((€€É•…Ñ•Q•áÑÕÉ”¡ÕÉ°èÍÑÉ¥¹œ¤è]•‰1Q•áÑÕÉ”ì(€€€½¹ÍÐ°€ôÑ¡¥Ì¸°ì(€€€½¹ÍÐÑ•áÑÕÉ”€ô°¹É•…Ñ•Q•áÑÕÉ” ¤ì(€€€¥˜€¡Ñ•áÑÕÉ”€ôôô¹Õ±°¤ì(€€€€€Ñ¡É½Ü¹•ÜÉÉ½È ‰)XÍ…¸Ñ•áÑÕÉ”…±±½…Ñ¥½¸™…¥±•¸ˆ¤ì(€€€ô(€€€°¹‰¥¹‘Q•áÑÕÉ”¡°¹QaQUI|É°Ñ•áÑÕÉ”¤ì(€€€°¹Ñ•á%µ…”É (€€€€€°¹QaQUI|É°(€€€€€€À°(€€€€€°¹I	°(€€€€€€Ä°(€€€€€€Ä°(€€€€€€À°(€€€€€°¹I	°(€€€€€°¹U9M%9}	eQ°(€€€€€¹•ÜU¥¹ÐáÉÉ…ä¡lÄäÀ°€ÄäÀ°€ÄàÐ°€ÈÔÕt¤°(€€€€¤ì(€€€°¹Ñ•áA…É…µ•Ñ•É¤¡°¹QaQUI|É°°¹QaQUI}5%9}%1QH°°¹1%9H¤ì(€€€°¹Ñ•áA…É…µ•Ñ•É¤¡°¹QaQUI|É°°¹QaQUI}5}%1QH°°¹1%9H¤ì(€€€°¹Ñ•áA…É…µ•Ñ•É¤¡°¹QaQUI|É°°¹QaQUI}]IA}L°°¹15A}Q=}¤ì(€€€°¹Ñ•áA…É…µ•Ñ•É¤¡°¹QaQUI|É°°¹QaQUI}]IA}P°°¹15A}Q=}¤ì((€€€½¹ÍÐ¥µ…”€ô¹•Ü%µ…” ¤ì(€€€½¹ÍÐÉ•±•…Í•%µ…”€ô€ ¤èÙ½¥€ôøì(€€€€€¥µ…”¹½¹±½…€ô¹Õ±°ì(€€€€€¥µ…”¹½¹•ÉÉ½È€ô¹Õ±°ì(ˆ\ËˆÜ[™[™Ò[XYÙ\Ë™[]J[XYÙJNÂˆ[XYÙKœÜ˜ÈHˆŽÂˆNÂˆ[XYÙK™XÛÙ[™ÈH˜\Þ[˜ÈŽÂˆ[XYÙK›Û›ØYH

HOˆÂˆYˆ
]\ËˆÙ\ÜÜÙY
HÂˆÛ˜š[™^\™JÛ•VT‘WÌ‘^\™JNÂˆÛœ^[ÝÜ™ZJÛ•S”PÒ×Ñ“TÖWÕÑP‘ÓJNÂˆÛ^[XYÙL‘
ˆÛ•VT‘WÌ‘ˆˆÛ”‘ÐKˆÛ”‘ÐKˆÛ•S”ÒQÓ‘QÐ–UKˆ[XYÙKˆ
NÂˆÛœ^[ÝÜ™ZJÛ•S”PÒ×Ñ“TÖWÕÑP‘Ó
NÂˆBˆ™[X\ÙR[XYÙJ
NÂˆNÂˆ[XYÙK›Û™\œ›ÜˆH

HOˆÂˆÛÛœÛÛK™\œ›ÜŠ•ˆØØ[ˆ^\™H˜Z[YÈØYˆ	Ý\›X
NÂˆ™[X\ÙR[XYÙJ
NÂˆNÂˆ\ËˆÜ[™[™Ò[XYÙ\Ë˜Y
[XYÙJNÂˆ[XYÙKœÜ˜ÈH\›Âˆ™]\›ˆ^\™NÂˆB‚ˆÙ˜]ÑÜ›Ý\
ˆÜ›Ý\ˆÜQÜ›Ý\ˆ]œˆ”™[™\“X]š^ˆ[Ù[ˆ”™[™\“X]š^ˆ
Nˆ›ÚYÂˆ]ÛÛ™šYÝ\™QÜ›Ý\HYNÂˆ›Üˆ
ÛÛœÝY\ÚÙˆÜ›Ý\›Y\Ú\ÊHÂˆYˆ
Ü›Ý\^\™HOOH[
HÂˆ\ËˆÙ˜]ÔÛÛY
Y\Ú]œ[Ù[Ü›Ý\˜ÛÛÜ‹ÛÛ™šYÝ\™QÜ›Ý\
NÂˆH[ÙHÂˆ\ËˆÙ˜]Õ^\™Y
ˆY\ÚˆÜ›Ý\^\™Kˆ]œˆ[Ù[ˆÜ›Ý\˜ÛÛÜ‹ˆÛÛ™šYÝ\™QÜ›Ý\ˆ
NÂˆBˆÛÛ™šYÝ\™QÜ›Ý\H˜[ÙNÂˆBˆB‚ˆÙ˜]ÔÛÛY
ˆY\ÚˆÜSY\Úˆ]œˆ”™[™\“X]š^ˆ[Ù[ˆ”™[™\“X]š^ˆÛÛÜŽˆÛÛÜ‹ˆÛÛ™šYÝ\™QÜ›Ý\ˆ›ÛÛX[‹ˆ
Nˆ›ÚYÂˆÛÛœÝØØ][ÛœÈH\ËˆÜÛÛYÂˆYˆ
ØØ][ÛœÈOOH[
HÂˆ›ÝÈ™]È\œ›ÜŠ’•ˆÛÛY™[™\™\ˆ\È[˜]˜Z[X›KˆŠNÂˆBˆÛÛœÝÛH\ËˆÙÛÂˆYˆ
ÛÛ™šYÝ\™QÜ›Ý\
HÂˆÛ\ÙT›ÙÜ˜[JØØ][ÛœËœ›ÙÜ˜[JNÂˆÛ[šY›Ü›SX]š^ŠØØ][ÛœË›]œ˜[ÙK]œ
NÂˆÛ[šY›Ü›SX]š^ŠØØ][ÛœË›[Ù[˜[ÙK[Ù[
NÂˆÛ[šY›Ü›MŠˆØØ][ÛœË˜ÛÛÜ‹ˆÛÛÜ–ÌKˆÛÛÜ–ÌWKˆÛÛÜ–Ì—KˆÛÛÜ–Ì×Kˆ
NÂˆBˆ\ËˆØš[™ÛÛ[[ÛŠY\ÚØØ][ÛœÊNÂˆÛ™˜]Ñ[[Y[ÊˆÛ•’PS‘ÓTÂˆY\Úš[™^ÛÝ[ˆY\Úš[™^\Kˆˆ
NÂˆB‚ˆÙ˜]Õ^\™Y
ˆY\ÚˆÜSY\Úˆ^\™NˆÙX‘Ó^\™Kˆ]œˆ”™[™\“X]š^ˆ[Ù[ˆ”™[™\“X]š^ˆÛÛÜŽˆÛÛÜ‹ˆÛÛ™šYÝ\™QÜ›Ý\ˆ›ÛÛX[‹ˆ
Nˆ›ÚYÂˆÛÛœÝØØ][ÛœÈH\ËˆÝ^\™YÂˆYˆ
ˆØØ][ÛœÈOOH[ˆØØ][ÛœË]ˆOOH[ˆØØ][ÛœËœØ[\\ˆOOH[ˆY\Ú]Y™™\ˆOOH[ˆ
HÂˆ›ÝÈ™]È\œ›ÜŠ•^\™Y•ˆY\Ú\È[ˆ[˜ÛÛ\]HÔHš[™[™ËˆŠNÂˆBˆÛÛœÝÛH\ËˆÙÛÂˆYˆ
ÛÛ™šYÝ\™QÜ›Ý\
HÂˆÛ\ÙT›ÙÜ˜[JØØ][ÛœËœ›ÙÜ˜[JNÂˆÛ[šY›Ü›SX]š^ŠØØ][ÛœË›]œ˜[ÙK]œ
NÂˆÛ[šY›Ü›SX]š^ŠØØ][ÛœË›[Ù[˜[ÙK[Ù[
NÂˆÛ[šY›Ü›MŠˆØØ][ÛœË˜ÛÛÜ‹ˆÛÛÜ–ÌKˆÛÛÜ–ÌWKˆÛÛÜ–Ì—KˆÛÛÜ–Ì×Kˆ
NÂˆÛ˜XÝ]™U^\™JÛ•VT‘L
NÂˆÛ˜š[™^\™JÛ•VT‘WÌ‘^\™JNÂˆÛ[šY›Ü›LZJØØ][ÛœËœØ[\\‹
NÂˆBˆ\ËˆØš[™ÛÛ[[ÛŠY\ÚØØ][ÛœÊNÂˆÛ˜š[™Y™™\ŠÛT”VWÐ•Q‘‘T‹Y\Ú]Y™™\ŠNÂˆÛ™[˜X›U™\^]šX\œ˜^JØØ][ÛœË]ŠNÂˆÛ™\^]šX”Ú[\ŠØØ][ÛœË]‹‹Û‘“ÐU˜[ÙK
NÂˆÛ™˜]Ñ[[Y[ÊˆÛ•’PS‘ÓTËˆY\Úš[™^ÛÝ[ˆY\Úš[™^\Kˆˆ
NÂˆB‚ˆØš[™ÛÛ[[ÛŠY\ÚˆÜSY\ÚØØ][ÛœÎˆ›ÙÜ˜[SØØ][ÛœÊNˆ›ÚYÂˆÛÛœÝÛH\ËˆÙÛÂˆÛ˜š[™Y™™\ŠÛT”VWÐ•Q‘‘T‹Y\ÚœÜÚ][ÛY™™\ŠNÂˆÛ™[˜X›U™\^]šX\œ˜^JØØ][ÛœËœÜÚ][ÛŠNÂˆÛ™\^]šX”Ú[\ŠØØ][ÛœËœÜÚ][Û‹ËÛ‘“ÐU˜[ÙK
NÂˆÛ˜š[™Y™™\ŠÛT”VWÐ•Q‘‘T‹Y\Ú››Ü›X[Y™™\ŠNÂˆÛ™[˜X›U™\^]šX\œ˜^JØØ][ÛœË››Ü›X[
NÂˆÛ™\^]šX”Ú[\ŠØØ][ÛœË››Ü›X[ËÛ‘“ÐU˜[ÙK
NÂˆÛ˜š[™Y™™\ŠÛ‘SSQS•ÐT”VWÐ•Q‘‘T‹Y\Úš[™^Y™™\ŠNÂˆB‚ˆÜ™[X\ÙT™\ÛÝ\˜Ù\Ê
Nˆ›ÚYÂˆ›Üˆ
ÛÛœÝ[XYÙHÙˆ\ËˆÜ[™[™Ò[XYÙ\ÊHÂˆ[XYÙK›Û›ØYH[Âˆ[XYÙK›Û™\œ›ÜˆH[Âˆ[XYÙKœÜ˜ÈHˆŽÂˆBˆ\ËˆÜ[™[™Ò[XYÙ\Ë˜ÛX\Š
NÂˆ›Üˆ
ÛÛœÝÜ›Ý\Ùˆ\ËˆÜÝ]XÑÜ›Ý\ÊH\ËˆÙ[]QÜ›Ý\
Ü›Ý\
NÂˆ\ËˆÜÝ]XÑÜ›Ý\Ë›[™ÝHÂˆYˆ
\ËˆÛÙ™œ›ØYOOH[
HÂˆ\ËˆÙ[]QÜ›Ý\
\ËˆÛÙ™œ›ØY
NÂˆ\ËˆÛÙ™œ›ØYH[ÂˆBˆ›Üˆ
ÛÛœÝÜ›Ý\Ùˆ\ËˆÜØØ[‘Ü›Ý\ÊH\ËˆÙ[]QÜ›Ý\
Ü›Ý\
NÂˆ\ËˆÜØØ[‘Ü›Ý\Ë›[™ÝHÂˆYˆ
\ËˆÜÛÛYOOH[
HÂˆ\ËˆÙÛ™[]T›ÙÜ˜[J\ËˆÜÛÛYœ›ÙÜ˜[JNÂˆ\ËˆÜÛÛYH[ÂˆBˆYˆ
\ËˆÝ^\™YOOH[
HÂˆ\ËˆÙÛ™[]T›ÙÜ˜[J\ËˆÝ^\™Yœ›ÙÜ˜[JNÂˆ\ËˆÝ^\™YH[ÂˆBˆB‚ˆÙ[]QÜ›Ý\
Ü›Ý\ˆÜQÜ›Ý\
Nˆ›ÚYÂˆ›Üˆ
ÛÛœÝY\ÚÙˆÜ›Ý\›Y\Ú\ÊH\ËˆÙ[]SY\Ú
Y\Ú
NÂˆYˆ
Ü›Ý\^\™HOOH[
H\ËˆÙÛ™[]U^\™JÜ›Ý\^\™JNÂˆB‚ˆÙ[]SY\Ú
Y\ÚˆÜSY\Ú
Nˆ›ÚYÂˆ\ËˆÙÛ™[]PY™™\ŠY\ÚœÜÚ][ÛY™™\ŠNÂˆ\ËˆÙÛ™[]PY™™\ŠY\Ú››Ü›X[Y™™\ŠNÂˆYˆ
Y\Ú]Y™™\ˆOOH[
H\ËˆÙÛ™[]PY™™\ŠY\Ú]Y™™\ŠNÂˆ\ËˆÙÛ™[]PY™™\ŠY\Úš[™^Y™™\ŠNÂˆBŸB