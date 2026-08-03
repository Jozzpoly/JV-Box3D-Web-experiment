import * as THREE from 'three';

export class VehicleOrbitCamera {
  private yaw = 0;
  private pitch = 0.42;
  private distance = 9.5;
  private dragging = false;
  private pointerId = -1;
  private lastX = 0;
  private lastY = 0;
  private readonly smoothPosition = new THREE.Vector3(-8.5, 4.2, 0);
  private readonly desiredPosition = new THREE.Vector3();
  private readonly targetPosition = new THREE.Vector3();
  private readonly localOffset = new THREE.Vector3();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: THREE.PerspectiveCamera,
  ) {
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('keydown', this.onKeyDown);
  }

  update(target: THREE.Object3D, deltaSeconds: number): void {
    target.getWorldPosition(this.targetPosition);
    this.targetPosition.y += 0.55;

    const cosPitch = Math.cos(this.pitch);
    this.localOffset.set(
      -Math.cos(this.yaw) * cosPitch * this.distance,
      Math.sin(this.pitch) * this.distance,
      Math.sin(this.yaw) * cosPitch * this.distance,
    );
    this.localOffset.applyQuaternion(target.quaternion);
    this.desiredPosition.copy(this.targetPosition).add(this.localOffset);

    const blend = 1 - Math.exp(-7 * Math.max(deltaSeconds, 0));
    this.smoothPosition.lerp(this.desiredPosition, blend);
    this.camera.position.copy(this.smoothPosition);
    this.camera.lookAt(this.targetPosition);
  }

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private reset(): void {
    this.yaw = 0;
    this.pitch = 0.42;
    this.distance = 9.5;
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 && event.button !== 2) return;
    this.dragging = true;
    this.pointerId = event.pointerId;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging || event.pointerId !== this.pointerId) return;
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.yaw -= dx * 0.006;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.005, -0.12, 1.28);
    event.preventDefault();
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.dragging = false;
    this.pointerId = -1;
    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }
  };

  private readonly onWheel = (event: WheelEvent): void => {
    this.distance = THREE.MathUtils.clamp(
      this.distance * Math.exp(event.deltaY * 0.0012),
      2.2,
      42,
    );
    event.preventDefault();
  };

  private readonly onContextMenu = (event: MouseEvent): void => event.preventDefault();

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'KeyC' && !event.repeat) this.reset();
  };
}
