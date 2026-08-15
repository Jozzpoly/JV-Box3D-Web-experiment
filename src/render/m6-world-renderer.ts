import type { JvWorldData } from "../scene/jv-world-contract.js";
import type { M6TraceFrame } from "../vehicle/m6/m6-topology-world.js";
import { JvWorldRenderer } from "./jv-world-renderer.js";
import { getJvPerformanceExperimentSettings } from "./jv-performance-experiment-settings.js";
import { getJvProductViewSettings } from "./jv-product-view-settings.js";
import { M6OwnerVehicleLayer } from "./m6-owner-vehicle-layer.js";
import {
  computeM6ChaseCameraPose,
  createDefaultM6ChaseCameraState,
  DEFAULT_M6_CHASE_CAMERA,
  orbitM6ChaseCameraState,
  resolveM6ChaseCameraPanDelta,
  scaleM6ChaseCameraDistance,
  translateM6ChaseCameraFocus,
  zoomM6ChaseCameraState,
} from "./m6-chase-camera.js";
import {
  M6_CAMERA_VERTICAL_FOV_RADIANS,
  resolveM6CameraClipPlanes,
  resolveM6ResponsiveChaseDistance,
} from "./m6-camera-viewport.js";

type Vec3 = Readonly<{ x: number; y: number; z: number }>;
type Rotation = Readonly<{ x: number; y: number; z: number; w: number }>;
type Mat4 = Float32Array;

type Mesh = Readonly<{
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  indexCount: number;
}>;

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
  const vertex = createShader(
    gl,
    gl.VERTEX_SHADER,
    VERTEX_SHADER_SOURCE,
  );
  const fragment = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    FRAGMENT_SHADER_SOURCE,
  );
  const program = gl.createProgram();
  if (program === null) {
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
    -1,-1,-1, 1,-1,-1, 1,1,-1, -1,1,-1,
    -1,-1,1, 1,-1,1, 1,1,1, -1,1,1,
  ];
  const indices = [
    0,1,2, 0,2,3, 4,6,5, 4,7,6,
    0,4,5, 0,5,1, 3,2,6, 3,6,7,
    1,5,6, 1,6,2, 0,3,7, 0,7,4,
  ];
  return createMesh(gl, vertices, indices);
}

function cylinderMesh(
  gl: WebGLRenderingContext,
  segments = 24,
): Mesh {
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
    indices.push(
      bottom,
      nextBottom,
      top,
      top,
      nextBottom,
      nextTop,
    );
    indices.push(bottomCenter, nextBottom, bottom);
    indices.push(topCenter, top, nextTop);
  }
  return createMesh(gl, vertices, indices);
}

function lineMesh(gl: WebGLRenderingContext): Mesh {
  return createMesh(gl, [0,0,-1, 0,0,1], [0,1]);
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
    f / aspect,0,0,0,
    0,f,0,0,
    0,0,(near + far) * range,-1,
    0,0,2 * near * far * range,0,
  ]);
}

function normalize(value: Vec3): Vec3 {
  const length = Math.hypot(value.x, value.y, value.z) || 1;
  return {
    x: value.x / length,
    y: value.y / length,
    z: value.z / length,
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
    x.x,y.x,z.x,0,
    x.y,y.y,z.y,0,
    x.z,y.z,z.z,0,
    -dot(x, eye),-dot(y, eye),-dot(z, eye),1,
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

function lineModel(start: Vec3, end: Vec3): Mat4 {
  const midpoint = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
    z: (start.z + end.z) / 2,
  };
  const delta = subtract(end, start);
  const length = Math.hypot(delta.x, delta.y, delta.z);
  if (length < 1e-8) {
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
    const angle = Math.acos(
      Math.max(-1, Math.min(1, direction.z)),
    );
    const half = angle / 2;
    const sine = Math.sin(half);
    rotation = {
      x: normalizedAxis.x * sine,
      y: normalizedAxis.y * sine,
      z: normalizedAxis.z * sine,
      w: Math.cos(half),
    };
  }
  return modelMatrix(
    midpoint,
    rotation,
    { x: 1, y: 1, z: length / 2 },
  );
}

function rotateVector(rotation: Rotation, value: Vec3): Vec3 {
  const ix =
    rotation.w * value.x +
    rotation.y * value.z -
    rotation.z * value.y;
  const iy =
    rotation.w * value.y +
    rotation.z * value.x -
    rotation.x * value.z;
  const iz =
    rotation.w * value.z +
    rotation.x * value.y -
    rotation.y * value.x;
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

export class M6WorldRenderer {
  readonly #canvas: HTMLCanvasElement;
  readonly #gl: WebGLRenderingContext;
  readonly #program: WebGLProgram;
  readonly #positionLocation: number;
  readonly #mvpLocation: WebGLUniformLocation;
  readonly #colorLocation: WebGLUniformLocation;
  readonly #box: Mesh;
  readonly #cylinder: Mesh;
  readonly #line: Mesh;
  readonly #ownerVehicle: M6OwnerVehicleLayer;
  readonly #events = new AbortController();
  readonly #renderScaleCap: number;
  #world: JvWorldRenderer | null = null;
  #diagnosticsVisible = false;
  #cameraState = createDefaultM6ChaseCameraState();
  #cameraUsesViewportDefaultDistance = true;
  #cameraPointers = new Map<
    number,
    {
      x: number;
      y: number;
      pointerType: string;
      mode: "ORBIT" | "PAN";
    }
  >();
  #cameraReferenceRotation: Rotation = { x: 0, y: 0, z: 0, w: 1 };
  #origin: Vec3 | null = null;
  #generation = 0;
  #disposed = false;
  #contextLost = false;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    this.#renderScaleCap = getJvPerformanceExperimentSettings().renderScaleCap;
    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: false,
    });
    if (gl === null) {
      throw new Error("WebGL is unavailable in this browser.");
    }
    this.#gl = gl;
    this.#program = createProgram(gl);
    const positionLocation = gl.getAttribLocation(
      this.#program,
      "aPosition",
    );
    const mvpLocation = gl.getUniformLocation(
      this.#program,
      "uMvp",
    );
    const colorLocation = gl.getUniformLocation(
      this.#program,
      "uColor",
    );
    if (
      positionLocation < 0 ||
      mvpLocation === null ||
      colorLocation === null
    ) {
      throw new Error(
        "WebGL renderer uniforms or attributes are unavailable.",
      );
    }
    this.#positionLocation = positionLocation;
    this.#mvpLocation = mvpLocation;
    this.#colorLocation = colorLocation;
    this.#box = boxMesh(gl);
    this.#cylinder = cylinderMesh(gl);
    this.#line = lineMesh(gl);
    this.#ownerVehicle = new M6OwnerVehicleLayer(gl);
    gl.enable(gl.DEPTH_TEST);
    this.#installCameraControls();
    this.#canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        this.#contextLost = true;
      },
      { signal: this.#events.signal },
    );
  }

  setWorld(world: JvWorldData): void {
    if (this.#disposed) {
      throw new Error("M6WorldRenderer has been disposed.");
    }
    this.#world?.dispose();
    this.#world = new JvWorldRenderer(this.#gl, world);
  }

  loadOwnerVehicle(pageBaseUrl: string, packageUrl: string): Promise<void> {
    if (this.#disposed) {
      return Promise.reject(new Error("M6WorldRenderer has been disposed."));
    }
    return this.#ownerVehicle.load(pageBaseUrl, packageUrl);
  }

  resetCamera(): void {
    if (this.#disposed) {
      return;
    }
    this.#cameraUsesViewportDefaultDistance = true;
    this.#cameraState = {
      ...createDefaultM6ChaseCameraState(),
      distance: this.#responsiveCameraDistance(),
    };
  }

  setDiagnosticsVisible(visible: boolean): void {
    if (this.#disposed) {
      return;
    }
    this.#diagnosticsVisible = visible;
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
    this.#cameraReferenceRotation = trace.chassisRotation;
    this.#resize();
    const gl = this.#gl;
    gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    gl.clearColor(0.035, 0.043, 0.058, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const target = trace.chassisPosition;
    const camera = computeM6ChaseCameraPose(
      trace.chassisPosition,
      trace.chassisRotation,
      this.#cameraState,
    );
    const clipPlanes = resolveM6CameraClipPlanes(
      this.#cameraState.distance,
    );
    const projection = perspective(
      M6_CAMERA_VERTICAL_FOV_RADIANS,
      this.#canvas.width / this.#canvas.height,
      clipPlanes.near,
      clipPlanes.far,
    );
    const view = lookAt(camera.eye, camera.target, { x: 0, y: 1, z: 0 });
    const viewProjection = multiply(projection, view);

    this.#world?.render(viewProjection);
    gl.useProgram(this.#program);
    if (getJvProductViewSettings().gridVisible) {
      this.#drawGrid(viewProjection, target);
    }
    if (this.#diagnosticsVisible && this.#origin !== null) {
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

    const half = trace.visualGeometry.chassisHalfExtents;
    const ownerVehicleDrawn = this.#ownerVehicle.render(
      trace.visualFrame,
      viewProjection,
    );
    gl.useProgram(this.#program);

    if (!ownerVehicleDrawn) {
      this.#draw(
        this.#box,
        viewProjection,
        modelMatrix(
          trace.chassisPosition,
          trace.chassisRotation,
          half,
        ),
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
    }

    if (this.#diagnosticsVisible) {
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
    }

    if (!ownerVehicleDrawn) {
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
    }

    if (this.#diagnosticsVisible) {
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
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#events.abort();
    this.#world?.dispose();
    this.#world = null;
    for (const pointerId of this.#cameraPointers.keys()) {
      if (this.#canvas.hasPointerCapture(pointerId)) {
        this.#canvas.releasePointerCapture(pointerId);
      }
    }
    this.#cameraPointers.clear();
    const gl = this.#gl;
    this.#ownerVehicle.dispose();
    gl.deleteBuffer(this.#box.vertexBuffer);
    gl.deleteBuffer(this.#box.indexBuffer);
    gl.deleteBuffer(this.#cylinder.vertexBuffer);
    gl.deleteBuffer(this.#cylinder.indexBuffer);
    gl.deleteBuffer(this.#line.vertexBuffer);
    gl.deleteBuffer(this.#line.indexBuffer);
    gl.deleteProgram(this.#program);
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

  #resize(): void {
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      this.#renderScaleCap,
    );
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
    if (this.#cameraUsesViewportDefaultDistance) {
      const distance = this.#responsiveCameraDistance();
      if (distance !== this.#cameraState.distance) {
        this.#cameraState = { ...this.#cameraState, distance };
      }
    }
  }

  #responsiveCameraDistance(): number {
    const width = this.#canvas.clientWidth;
    const height = this.#canvas.clientHeight;
    if (width <= 0 || height <= 0) {
      return DEFAULT_M6_CHASE_CAMERA.distance;
    }
    return resolveM6ResponsiveChaseDistance(
      DEFAULT_M6_CHASE_CAMERA.distance,
      width,
      height,
    );
  }

  #panCameraByPixels(deltaX: number, deltaY: number): void {
    const height = this.#canvas.clientHeight;
    if (height <= 0) {
      return;
    }
    const delta = resolveM6ChaseCameraPanDelta(
      this.#cameraReferenceRotation,
      this.#cameraState,
      deltaX,
      deltaY,
      height,
      M6_CAMERA_VERTICAL_FOV_RADIANS,
    );
    this.#cameraState = translateM6ChaseCameraFocus(
      this.#cameraState,
      delta,
    );
  }

  #touchGestureMetrics(): Readonly<{
    centroidX: number;
    centroidY: number;
    span: number;
  }> | null {
    const touches = Array.from(this.#cameraPointers.values()).filter(
      (pointer) => pointer.pointerType === "touch",
    );
    if (touches.length < 2) {
      return null;
    }
    const [first, second] = touches;
    if (first === undefined || second === undefined) {
      return null;
    }
    return {
      centroidX: (first.x + second.x) / 2,
      centroidY: (first.y + second.y) / 2,
      span: Math.hypot(second.x - first.x, second.y - first.y),
    };
  }

  #installCameraControls(): void {
    this.#canvas.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();
        const pan =
          event.pointerType === "mouse" &&
          (event.button === 1 || (event.button === 0 && event.shiftKey));
        this.#cameraPointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
          pointerType: event.pointerType,
          mode: pan ? "PAN" : "ORBIT",
        });
        this.#canvas.setPointerCapture(event.pointerId);
      },
      { signal: this.#events.signal },
    );
    this.#canvas.addEventListener(
      "pointermove",
      (event) => {
        const pointer = this.#cameraPointers.get(event.pointerId);
        if (pointer === undefined) {
          return;
        }
        const previousTouchGesture = this.#touchGestureMetrics();
        const dx = event.clientX - pointer.x;
        const dy = event.clientY - pointer.y;
        this.#cameraPointers.set(event.pointerId, {
          ...pointer,
          x: event.clientX,
          y: event.clientY,
        });
        const nextTouchGesture = this.#touchGestureMetrics();
        if (
          previousTouchGesture !== null &&
          nextTouchGesture !== null &&
          previousTouchGesture.span > 1e-6 &&
          nextTouchGesture.span > 1e-6
        ) {
          this.#cameraUsesViewportDefaultDistance = false;
          this.#cameraState = scaleM6ChaseCameraDistance(
            this.#cameraState,
            previousTouchGesture.span / nextTouchGesture.span,
          );
          this.#panCameraByPixels(
            nextTouchGesture.centroidX - previousTouchGesture.centroidX,
            nextTouchGesture.centroidY - previousTouchGesture.centroidY,
          );
          return;
        }
        if (pointer.mode === "PAN") {
          this.#panCameraByPixels(dx, dy);
        } else {
          this.#cameraState = orbitM6ChaseCameraState(
            this.#cameraState,
            dx,
            dy,
          );
        }
      },
      { signal: this.#events.signal },
    );
    const release = (event: PointerEvent) => {
      if (!this.#cameraPointers.has(event.pointerId)) {
        return;
      }
      this.#cameraPointers.delete(event.pointerId);
      if (this.#canvas.hasPointerCapture(event.pointerId)) {
        this.#canvas.releasePointerCapture(event.pointerId);
      }
    };
    this.#canvas.addEventListener(
      "pointerup",
      release,
      { signal: this.#events.signal },
    );
    this.#canvas.addEventListener(
      "pointercancel",
      release,
      { signal: this.#events.signal },
    );
    this.#canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        this.#cameraUsesViewportDefaultDistance = false;
        this.#cameraState = zoomM6ChaseCameraState(
          this.#cameraState,
          event.deltaY,
        );
      },
      { passive: false, signal: this.#events.signal },
    );
    this.#canvas.addEventListener(
      "contextmenu",
      (event) => event.preventDefault(),
      { signal: this.#events.signal },
    );
  }
}
