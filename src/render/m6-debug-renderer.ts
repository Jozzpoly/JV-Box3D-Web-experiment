import type { M6TraceFrame } from "../vehicle/m6/m6-topology-world.js";
import {
  M6SceneRenderPassHostV1,
  type M6SceneMatrixV1,
  type M6SceneRenderPassFactoryV1,
  type M6SceneRenderPassInstallationV1,
} from "./m6-scene-render-pass.js";

type Vec3 = Readonly<{ x: number; y: number; z: number }>;
type Rotation = Readonly<{ x: number; y: number; z: number; w: number }>;
type Mat4 = M6SceneMatrixV1;
type Mesh = Readonly<{
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  indexCount: number;
}>;

export interface M6DebugRendererOptionsV1 {
  readonly onRenderPassError?: (error: unknown) => void;
}

const VERTEX_SHADER_SOURCE = `
attribute vec3 aPosition;
uniform mat4 uMvp;
void main() {
  gl_Position = uMvp * vec4(aPosition, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
uniform vec4 uColor;
void main() {
  gl_FragColor = uColor;
}
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("WebGL shader allocation failed.");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(`WebGL shader compilation failed: ${message}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
  const program = gl.createProgram();
  if (program === null) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error("WebGL program allocation failed.");
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "unknown link error";
    gl.deleteProgram(program);
    throw new Error(`WebGL program link failed: ${message}`);
  }
  return program;
}

function createMesh(
  gl: WebGLRenderingContext,
  vertices: readonly number[],
  indices: readonly number[],
): Mesh {
  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  if (vertexBuffer === null || indexBuffer === null) {
    if (vertexBuffer !== null) {
      gl.deleteBuffer(vertexBuffer);
    }
    if (indexBuffer !== null) {
      gl.deleteBuffer(indexBuffer);
    }
    throw new Error("WebGL buffer allocation failed.");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW,
  );
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW,
  );
  return { vertexBuffer, indexBuffer, indexCount: indices.length };
}

function boxMesh(gl: WebGLRenderingContext): Mesh {
  const vertices = [
    -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
  ];
  const indices = [
    0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1, 3, 2, 6, 3, 6, 7,
    1, 5, 6, 1, 6, 2, 0, 3, 7, 0, 7, 4,
  ];
  return createMesh(gl, vertices, indices);
}

function cylinderMesh(gl: WebGLRenderingContext, segments = 24): Mesh {
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    vertices.push(x, -1, z, x, 1, z);
  }
  const bottomCenter = vertices.length / 3;
  vertices.push(0, -1, 0);
  const topCenter = vertices.length / 3;
  vertices.push(0, 1, 0);
  for (let index = 0; index < segments; index += 1) {
    const next = (index + 1) % segments;
    const bottom = index * 2;
    const top = bottom + 1;
    const nextBottom = next * 2;
    const nextTop = nextBottom + 1;
    indices.push(bottom, nextBottom, top, top, nextBottom, nextTop);
    indices.push(bottomCenter, nextBottom, bottom);
    indices.push(topCenter, top, nextTop);
  }
  return createMesh(gl, vertices, indices);
}

function lineMesh(gl: WebGLRenderingContext): Mesh {
  return createMesh(gl, [0, 0, -1, 0, 0, 1], [0, 1]);
}

function multiply(a: Mat4, b: Mat4): Mat4 {
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

function perspective(
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const range = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * range, -1,
    0, 0, 2 * near * far * range, 0,
  ]);
}

function normalize(value: Vec3): Vec3 {
  const magnitude = Math.hypot(value.x, value.y, value.z) || 1;
  return {
    x: value.x / magnitude,
    y: value.y / magnitude,
    z: value.z / magnitude,
  };
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x.x, y.x, z.x, 0,
    x.y, y.y, z.y, 0,
    x.z, y.z, z.z, 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

function modelMatrix(
  position: Vec3,
  rotation: Rotation,
  scale: Vec3,
): Mat4 {
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
    2 * (xy + wz) * scale.x,
    2 * (xz - wy) * scale.x,
    0,
    2 * (xy - wz) * scale.y,
    (1 - 2 * (xx + zz)) * scale.y,
    2 * (yz + wx) * scale.y,
    0,
    2 * (xz + wy) * scale.z,
    2 * (yz - wx) * scale.z,
    (1 - 2 * (xx + yy)) * scale.z,
    0,
    position.x,
    position.y,
    position.z,
    1,
  ]);
}

function lineModel(start: Vec3, end: Vec3): Mat4 {
  const midpoint = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
    z: (start.z + end.z) / 2,
  };
  const delta = subtract(end, start);
  const segmentLength = Math.hypot(delta.x, delta.y, delta.z);
  if (segmentLength < 1e-8) {
    return modelMatrix(
      midpoint,
      { x: 0, y: 0, z: 0, w: 1 },
      { x: 1, y: 1, z: 0 },
    );
  }
  const direction = normalize(delta);
  const base = { x: 0, y: 0, z: 1 };
  const axis = cross(base, direction);
  const axisLength = Math.hypot(axis.x, axis.y, axis.z);
  let rotation: Rotation;
  if (axisLength < 1e-8) {
    rotation =
      direction.z >= 0
        ? { x: 0, y: 0, z: 0, w: 1 }
        : { x: 0, y: 1, z: 0, w: 0 };
  } else {
    const normalizedAxis = {
      x: axis.x / axisLength,
      y: axis.y / axisLength,
      z: axis.z / axisLength,
    };
    const angle = Math.acos(Math.max(-1, Math.min(1, direction.z)));
    const half = angle / 2;
    const sine = Math.sin(half);
    rotation = {
      x: normalizedAxis.x * sine,
      y: normalizedAxis.y * sine,
      z: normalizedAxis.z * sine,
      w: Math.cos(half),
    };
  }
  return modelMatrix(midpoint, rotation, {
    x: 1,
    y: 1,
    z: segmentLength / 2,
  });
}

function rotateVector(rotation: Rotation, value: Vec3): Vec3 {
  const ix =
    rotation.w * value.x + rotation.y * value.z - rotation.z * value.y;
  const iy =
    rotation.w * value.y + rotation.z * value.x - rotation.x * value.z;
  const iz =
    rotation.w * value.z + rotation.x * value.y - rotation.y * value.x;
  const iw =
    -rotation.x * value.x -
    rotation.y * value.y -
    rotation.z * value.z;
  return {
    x:
      ix * rotation.w +
      iw * -rotation.x +
      iy * -rotation.z -
      iz * -rotation.y,
    y:
      iy * rotation.w +
      iw * -rotation.y +
      iz * -rotation.x -
      ix * -rotation.z,
    z:
      iz * rotation.w +
      iw * -rotation.z +
      ix * -rotation.y -
      iy * -rotation.x,
  };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export class M6DebugRenderer {
  readonly #canvas: HTMLCanvasElement;
  readonly #gl: WebGLRenderingContext;
  readonly #program: WebGLProgram;
  readonly #positionLocation: number;
  readonly #mvpLocation: WebGLUniformLocation;
  readonly #colorLocation: WebGLUniformLocation;
  readonly #box: Mesh;
  readonly #cylinder: Mesh;
  readonly #line: Mesh;
  readonly #events = new AbortController();
  readonly #renderPasses: M6SceneRenderPassHostV1;
  #yaw = -0.78;
  #pitch = 0.46;
  #distance = 8.5;
  #pointer: Readonly<{ id: number; x: number; y: number }> | null = null;
  #origin: Vec3 | null = null;
  #generation = 0;
  #disposed = false;
  #contextLost = false;
  #debugVehicleVisible = true;

  constructor(
    canvas: HTMLCanvasElement,
    options: M6DebugRendererOptionsV1 = {},
  ) {
    this.#canvas = canvas;
    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: false,
    });
    if (gl === null) {
      throw new Error("WebGL is unavailable in this browser.");
    }
    this.#gl = gl;
    this.#renderPasses = new M6SceneRenderPassHostV1(
      gl,
      options.onRenderPassError ?? ((error) => console.error(error)),
    );
    this.#program = createProgram(gl);
    const positionLocation = gl.getAttribLocation(this.#program, "aPosition");
    const mvpLocation = gl.getUniformLocation(this.#program, "uMvp");
    const colorLocation = gl.getUniformLocation(this.#program, "uColor");
    if (
      positionLocation < 0 ||
      mvpLocation === null ||
      colorLocation === null
    ) {
      gl.deleteProgram(this.#program);
      this.#renderPasses.dispose();
      throw new Error("WebGL renderer uniforms or attributes are unavailable.");
    }
    this.#positionLocation = positionLocation;
    this.#mvpLocation = mvpLocation;
    this.#colorLocation = colorLocation;
    this.#box = boxMesh(gl);
    this.#cylinder = cylinderMesh(gl);
    this.#line = lineMesh(gl);
    this.#restoreDebugState();
    this.#installCameraControls();
    this.#canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        this.#contextLost = true;
        this.#renderPasses.dispose();
      },
      { signal: this.#events.signal },
    );
  }

  installRenderPass(
    factory: M6SceneRenderPassFactoryV1,
  ): Promise<M6SceneRenderPassInstallationV1> {
    return this.#renderPasses.install(factory);
  }

  setDebugVehicleVisible(visible: boolean): void {
    if (this.#disposed) {
      throw new Error("Cannot change a disposed M6 debug renderer.");
    }
    this.#debugVehicleVisible = visible;
  }

  render(trace: M6TraceFrame): void {
    if (this.#disposed) {
      return;
    }
    if (this.#contextLost) {
      throw new Error("WebGL context was lost.");
    }
    if (trace.generation !== this.#generation) {
      this.#generation = trace.generation;
      this.#origin = { ...trace.chassisPosition };
    }

    this.#resize();
    const gl = this.#gl;
    this.#restoreDebugState();
    gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    gl.clearColor(0.035, 0.043, 0.058, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.#program);

    const target = trace.chassisPosition;
    const horizontal = Math.cos(this.#pitch) * this.#distance;
    const eye = {
      x: target.x + Math.cos(this.#yaw) * horizontal,
      y: target.y + Math.sin(this.#pitch) * this.#distance + 1.1,
      z: target.z + Math.sin(this.#yaw) * horizontal,
    };
    const projection = perspective(
      Math.PI / 4,
      this.#canvas.width / this.#canvas.height,
      0.05,
      200,
    );
    const view = lookAt(eye, target, { x: 0, y: 1, z: 0 });
    const viewProjection = multiply(projection, view);

    this.#drawGrid(viewProjection, target);
    if (this.#origin !== null) {
      this.#draw(
        this.#box,
        viewProjection,
        modelMatrix(
          { x: this.#origin.x, y: 0.012, z: this.#origin.z },
          { x: 0, y: 0, z: 0, w: 1 },
          { x: 0.08, y: 0.012, z: 0.08 },
        ),
        [0.95, 0.48, 0.18, 1],
      );
    }

    this.#renderPasses.render(
      "BEFORE_DEBUG_VEHICLE",
      viewProjection,
      trace,
    );
    this.#restoreDebugState();
    gl.useProgram(this.#program);

    if (this.#debugVehicleVisible) {
      this.#drawDebugVehicle(viewProjection, trace);
    }

    this.#renderPasses.render(
      "AFTER_DEBUG_VEHICLE",
      viewProjection,
      trace,
    );
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#events.abort();
    this.#renderPasses.dispose();
    if (
      this.#pointer !== null &&
      this.#canvas.hasPointerCapture(this.#pointer.id)
    ) {
      this.#canvas.releasePointerCapture(this.#pointer.id);
    }
    this.#pointer = null;
    const gl = this.#gl;
    gl.deleteBuffer(this.#box.vertexBuffer);
    gl.deleteBuffer(this.#box.indexBuffer);
    gl.deleteBuffer(this.#cylinder.vertexBuffer);
    gl.deleteBuffer(this.#cylinder.indexBuffer);
    gl.deleteBuffer(this.#line.vertexBuffer);
    gl.deleteBuffer(this.#line.indexBuffer);
    gl.deleteProgram(this.#program);
  }

  #drawDebugVehicle(viewProjection: Mat4, trace: M6TraceFrame): void {
    const half = trace.visualGeometry.chassisHalfExtents;
    this.#draw(
      this.#box,
      viewProjection,
      modelMatrix(trace.chassisPosition, trace.chassisRotation, half),
      [0.22, 0.52, 0.92, 1],
    );

    const frontMarker = add(
      trace.chassisPosition,
      rotateVector(trace.chassisRotation, {
        x: half.x + 0.12,
        y: 0,
        z: 0,
      }),
    );
    this.#draw(
      this.#box,
      viewProjection,
      modelMatrix(
        frontMarker,
        trace.chassisRotation,
        { x: 0.12, y: 0.08, z: 0.16 },
      ),
      [0.96, 0.32, 0.2, 1],
    );

    this.#draw(
      this.#box,
      viewProjection,
      modelMatrix(
        trace.rackPosition,
        trace.rackRotation,
        {
          x: 0.045,
          y: 0.045,
          z: trace.visualGeometry.rackHalfWidth,
        },
      ),
      [0.96, 0.68, 0.16, 1],
    );

    trace.corners.forEach((corner, index) => {
      this.#draw(
        this.#cylinder,
        viewProjection,
        modelMatrix(
          corner.wheelPosition,
          corner.wheelRotation,
          {
            x: trace.visualGeometry.wheelRadius,
            y: trace.visualGeometry.wheelWidth / 2,
            z: trace.visualGeometry.wheelRadius,
          },
        ),
        index < 2
          ? [0.88, 0.92, 0.98, 1]
          : [0.56, 0.62, 0.72, 1],
      );
    });

    const rackLeft = add(
      trace.rackPosition,
      rotateVector(trace.rackRotation, {
        x: 0,
        y: 0,
        z: -trace.visualGeometry.rackHalfWidth,
      }),
    );
    const rackRight = add(
      trace.rackPosition,
      rotateVector(trace.rackRotation, {
        x: 0,
        y: 0,
        z: trace.visualGeometry.rackHalfWidth,
      }),
    );
    const frontLeft = trace.corners[0]?.wheelPosition;
    const frontRight = trace.corners[1]?.wheelPosition;
    if (frontLeft !== undefined) {
      this.#drawLine(
        viewProjection,
        rackLeft,
        frontLeft,
        [0.96, 0.68, 0.16, 1],
      );
    }
    if (frontRight !== undefined) {
      this.#drawLine(
        viewProjection,
        rackRight,
        frontRight,
        [0.96, 0.68, 0.16, 1],
      );
    }
  }

  #drawGrid(viewProjection: Mat4, target: Vec3): void {
    const extent = 20;
    const centerX = Math.round(target.x / 5) * 5;
    const centerZ = Math.round(target.z / 5) * 5;
    for (let index = -extent; index <= extent; index += 1) {
      const worldX = centerX + index;
      const worldZ = centerZ + index;
      const majorX = worldX % 5 === 0;
      const majorZ = worldZ % 5 === 0;
      this.#drawLine(
        viewProjection,
        { x: centerX - extent, y: 0.002, z: worldZ },
        { x: centerX + extent, y: 0.002, z: worldZ },
        majorZ
          ? [0.22, 0.26, 0.34, 1]
          : [0.12, 0.14, 0.19, 1],
      );
      this.#drawLine(
        viewProjection,
        { x: worldX, y: 0.002, z: centerZ - extent },
        { x: worldX, y: 0.002, z: centerZ + extent },
        majorX
          ? [0.22, 0.26, 0.34, 1]
          : [0.12, 0.14, 0.19, 1],
      );
    }
  }

  #drawLine(
    viewProjection: Mat4,
    start: Vec3,
    end: Vec3,
    color: readonly [number, number, number, number],
  ): void {
    this.#draw(
      this.#line,
      viewProjection,
      lineModel(start, end),
      color,
      this.#gl.LINES,
    );
  }

  #draw(
    mesh: Mesh,
    viewProjection: Mat4,
    model: Mat4,
    color: readonly [number, number, number, number],
    mode: number = this.#gl.TRIANGLES,
  ): void {
    const gl = this.#gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    gl.enableVertexAttribArray(this.#positionLocation);
    gl.vertexAttribPointer(
      this.#positionLocation,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    gl.uniformMatrix4fv(
      this.#mvpLocation,
      false,
      multiply(viewProjection, model),
    );
    gl.uniform4f(
      this.#colorLocation,
      color[0],
      color[1],
      color[2],
      color[3],
    );
    gl.drawElements(mode, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  #restoreDebugState(): void {
    const gl = this.#gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    gl.colorMask(true, true, true, true);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);
  }

  #resize(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(
      1,
      Math.floor(this.#canvas.clientWidth * ratio),
    );
    const height = Math.max(
      1,
      Math.floor(this.#canvas.clientHeight * ratio),
    );
    if (
      this.#canvas.width !== width ||
      this.#canvas.height !== height
    ) {
      this.#canvas.width = width;
      this.#canvas.height = height;
    }
  }

  #installCameraControls(): void {
    this.#canvas.addEventListener(
      "pointerdown",
      (event) => {
        this.#pointer = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
        this.#canvas.setPointerCapture(event.pointerId);
      },
      { signal: this.#events.signal },
    );
    this.#canvas.addEventListener(
      "pointermove",
      (event) => {
        if (
          this.#pointer === null ||
          event.pointerId !== this.#pointer.id
        ) {
          return;
        }
        const dx = event.clientX - this.#pointer.x;
        const dy = event.clientY - this.#pointer.y;
        this.#yaw += dx * 0.006;
        this.#pitch = Math.max(
          -0.12,
          Math.min(1.25, this.#pitch - dy * 0.006),
        );
        this.#pointer = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
      },
      { signal: this.#events.signal },
    );
    const release = (event: PointerEvent): void => {
      if (this.#pointer?.id === event.pointerId) {
        this.#pointer = null;
      }
    };
    this.#canvas.addEventListener("pointerup", release, {
      signal: this.#events.signal,
    });
    this.#canvas.addEventListener("pointercancel", release, {
      signal: this.#events.signal,
    });
    this.#canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        this.#distance = Math.max(
          3.5,
          Math.min(
            18,
            this.#distance * Math.exp(event.deltaY * 0.001),
          ),
        );
      },
      { passive: false, signal: this.#events.signal },
    );
  }
}
