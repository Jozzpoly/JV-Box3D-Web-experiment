import type { LongitudinalInputTimeline } from "./longitudinal-input-timeline.js";
import type { InputReleaseReason } from "./raw-device-event.js";

export type AnalogDrivePedal = "THROTTLE" | "BRAKE";
export type PointerDriveDirection = "D" | "R";

export interface PointerCaptureTarget extends EventTarget {
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
  hasPointerCapture(pointerId: number): boolean;
}

export interface PointerAnalogPedalTarget extends PointerCaptureTarget {
  getBoundingClientRect(): Readonly<{ top: number; height: number }>;
}

export interface PointerAnalogDriveControls {
  readonly throttle: PointerAnalogPedalTarget;
  readonly brake: PointerAnalogPedalTarget;
  readonly direction: PointerCaptureTarget;
}

export interface PointerAnalogDriveAdapterOptions {
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly isDocumentHidden: () => boolean;
  readonly timeline: LongitudinalInputTimeline;
  readonly controls: PointerAnalogDriveControls;
  readonly now: () => number;
  readonly sourceIdPrefix?: string;
  readonly onPedalStateChange?: (pedal: AnalogDrivePedal, value: number, active: boolean) => void;
  readonly onDirectionChange?: (direction: PointerDriveDirection) => void;
}

interface InstalledListener { readonly target: EventTarget; readonly type: string; readonly listener: EventListener; }
interface ActivePedalPointer {
  readonly pointerId: number;
  readonly pedal: AnalogDrivePedal;
  readonly target: PointerAnalogPedalTarget;
  readonly topY: number;
  readonly heightPx: number;
  value: number;
}

const VALUE_EPSILON = 1e-6;

function pointerButtonIsSupported(event: PointerEvent): boolean { return event.button === 0 || event.button === -1; }

function clickDetail(event: Event): number {
  const detail = (event as Event & { readonly detail?: unknown }).detail;
  return typeof detail === "number" && Number.isFinite(detail) ? detail : 0;
}

export function resolvePointerAnalogPedalValue(clientY: number, topY: number, heightPx: number): number {
  if (!Number.isFinite(clientY) || !Number.isFinite(topY) || !Number.isFinite(heightPx) || heightPx <= 0) {
    throw new RangeError("Pedal acquisition geometry must be finite and positive.");
  }
  const bottomY = topY + heightPx;
  return Math.max(0, Math.min(1, (bottomY - clientY) / heightPx));
}

export class PointerAnalogDriveAdapter {
  readonly #windowTarget: EventTarget;
  readonly #documentTarget: EventTarget;
  readonly #isDocumentHidden: () => boolean;
  readonly #timeline: LongitudinalInputTimeline;
  readonly #controls: PointerAnalogDriveControls;
  readonly #now: () => number;
  readonly #sourceIdPrefix: string;
  readonly #onPedalStateChange: PointerAnalogDriveAdapterOptions["onPedalStateChange"];
  readonly #onDirectionChange: PointerAnalogDriveAdapterOptions["onDirectionChange"];
  readonly #listeners: InstalledListener[] = [];
  readonly #pointers = new Map<number, ActivePedalPointer>();
  readonly #pointerByPedal = new Map<AnalogDrivePedal, number>();
  #directionPointerId: number | null = null;
  #direction: PointerDriveDirection = "D";
  #disposed = false;

  constructor(options: PointerAnalogDriveAdapterOptions) {
    this.#windowTarget = options.windowTarget;
    this.#documentTarget = options.documentTarget;
    this.#isDocumentHidden = options.isDocumentHidden;
    this.#timeline = options.timeline;
    this.#controls = options.controls;
    this.#now = options.now;
    this.#sourceIdPrefix = options.sourceIdPrefix ?? "pointer-analog-drive";
    this.#onPedalStateChange = options.onPedalStateChange;
    this.#onDirectionChange = options.onDirectionChange;

    this.#installPedal("THROTTLE", this.#controls.throttle);
    this.#installPedal("BRAKE", this.#controls.brake);
    this.#installDirection(this.#controls.direction);
    this.#listen(this.#windowTarget, "blur", () => this.#releaseAll("BLUR"));
    this.#listen(this.#windowTarget, "pagehide", () => this.#releaseAll("PAGE_HIDE"));
    this.#listen(this.#windowTarget, "orientationchange", () =>
      this.#releaseAll("VIEWPORT_CHANGE"),
    );
    this.#listen(this.#documentTarget, "fullscreenchange", () =>
      this.#releaseAll("VIEWPORT_CHANGE"),
    );
    this.#listen(this.#documentTarget, "visibilitychange", () => { if (this.#isDocumentHidden()) this.#releaseAll("VISIBILITY_HIDDEN"); });
    this.#onDirectionChange?.(this.#direction);
  }

  get direction(): PointerDriveDirection { return this.#direction; }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#releaseAll("DISPOSE");
    for (const { target, type, listener } of this.#listeners.reverse()) target.removeEventListener(type, listener);
    this.#listeners.length = 0;
  }

  #installPedal(pedal: AnalogDrivePedal, target: PointerAnalogPedalTarget): void {
    this.#listen(target, "pointerdown", event => this.#handlePointerDown(pedal, target, event as PointerEvent));
    this.#listen(target, "pointermove", event => this.#handlePointerMove(event as PointerEvent));
    this.#listen(target, "pointerup", event => this.#releasePointer(event as PointerEvent, true));
    this.#listen(target, "pointercancel", event => this.#releasePointer(event as PointerEvent, true));
    this.#listen(target, "lostpointercapture", event => this.#releasePointer(event as PointerEvent, false));
  }

  #installDirection(target: PointerCaptureTarget): void {
    this.#listen(target, "pointerdown", event => this.#handleDirectionPointerDown(target, event as PointerEvent));
    this.#listen(target, "pointerup", event => this.#handleDirectionPointerUp(target, event as PointerEvent));
    this.#listen(target, "pointercancel", event => this.#releaseDirectionPointer(target, event as PointerEvent, true));
    this.#listen(target, "lostpointercapture", event => this.#releaseDirectionPointer(target, event as PointerEvent, false));
    this.#listen(target, "click", event => this.#handleDirectionClick(event));
  }

  #listen(target: EventTarget, type: string, listener: EventListener): void { target.addEventListener(type, listener); this.#listeners.push({ target, type, listener }); }

  #handlePointerDown(pedal: AnalogDrivePedal, target: PointerAnalogPedalTarget, event: PointerEvent): void {
    if (
      this.#disposed ||
      !pointerButtonIsSupported(event) ||
      this.#pointers.has(event.pointerId) ||
      this.#directionPointerId === event.pointerId ||
      this.#pointerByPedal.has(pedal)
    ) return;
    let topY: number;
    let heightPx: number;
    let value: number;
    try {
      const rect = target.getBoundingClientRect();
      topY = rect.top;
      heightPx = rect.height;
      value = resolvePointerAnalogPedalValue(event.clientY, topY, heightPx);
    } catch {
      return;
    }
    event.preventDefault(); event.stopPropagation();
    try { target.setPointerCapture(event.pointerId); } catch { return; }
    const state: ActivePedalPointer = { pointerId: event.pointerId, pedal, target, topY, heightPx, value };
    this.#pointers.set(event.pointerId, state); this.#pointerByPedal.set(pedal, event.pointerId);
    this.#enqueuePedal(pedal, value, this.#safeTimestamp(), this.#sourceId(event.pointerId));
    this.#onPedalStateChange?.(pedal, value, true);
  }

  #handlePointerMove(event: PointerEvent): void {
    if (this.#disposed) return;
    const state = this.#pointers.get(event.pointerId); if (state === undefined) return;
    let value: number;
    try { value = resolvePointerAnalogPedalValue(event.clientY, state.topY, state.heightPx); } catch { return; }
    event.preventDefault(); event.stopPropagation();
    if (Math.abs(value - state.value) <= VALUE_EPSILON) return;
    state.value = value;
    this.#enqueuePedal(state.pedal, value, this.#safeTimestamp(), this.#sourceId(state.pointerId));
    this.#onPedalStateChange?.(state.pedal, value, true);
  }

  #releasePointer(event: PointerEvent, releaseCapture: boolean): void {
    const state = this.#pointers.get(event.pointerId); if (state === undefined) return;
    event.preventDefault(); event.stopPropagation();
    this.#pointers.delete(event.pointerId); this.#pointerByPedal.delete(state.pedal);
    this.#enqueuePedal(state.pedal, 0, this.#safeTimestamp(), this.#sourceId(state.pointerId));
    if (releaseCapture) {
      try { if (state.target.hasPointerCapture(state.pointerId)) state.target.releasePointerCapture(state.pointerId); } catch { /* semantic zero already queued */ }
    }
    this.#onPedalStateChange?.(state.pedal, 0, false);
  }

  #handleDirectionPointerDown(target: PointerCaptureTarget, event: PointerEvent): void {
    if (
      this.#disposed ||
      !pointerButtonIsSupported(event) ||
      this.#directionPointerId !== null ||
      this.#pointers.has(event.pointerId)
    ) return;
    event.preventDefault(); event.stopPropagation();
    try { target.setPointerCapture(event.pointerId); } catch { return; }
    this.#directionPointerId = event.pointerId;
  }

  #handleDirectionPointerUp(target: PointerCaptureTarget, event: PointerEvent): void {
    if (this.#disposed || this.#directionPointerId !== event.pointerId) return;
    event.preventDefault(); event.stopPropagation();
    this.#directionPointerId = null;
    try { if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId); } catch { /* pointer edge already resolved */ }
    this.#toggleDirection();
  }

  #releaseDirectionPointer(target: PointerCaptureTarget, event: PointerEvent, releaseCapture: boolean): void {
    if (this.#directionPointerId !== event.pointerId) return;
    event.preventDefault(); event.stopPropagation();
    this.#directionPointerId = null;
    if (releaseCapture) {
      try { if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId); } catch { /* no semantic direction change to roll back */ }
    }
  }

  #handleDirectionClick(event: Event): void {
    if (this.#disposed) return;
    event.preventDefault(); event.stopPropagation();
    if (clickDetail(event) > 0) return;
    this.#toggleDirection();
  }

  #toggleDirection(): void {
    if (this.#disposed) return;
    this.#direction = this.#direction === "D" ? "R" : "D";
    const timestampMs = this.#safeTimestamp();
    const throttleId = this.#pointerByPedal.get("THROTTLE");
    if (throttleId !== undefined) {
      const throttle = this.#pointers.get(throttleId);
      if (throttle !== undefined && throttle.value > VALUE_EPSILON) {
        this.#enqueuePedal("THROTTLE", throttle.value, timestampMs, this.#sourceId(throttle.pointerId));
      }
    }
    this.#onDirectionChange?.(this.#direction);
  }

  #releaseAll(reason: InputReleaseReason): void {
    if (this.#pointers.size === 0 && this.#directionPointerId === null) return;
    const timestampMs = this.#safeTimestamp();
    for (const state of this.#pointers.values()) {
      this.#timeline.enqueueReleaseAll(timestampMs, reason, this.#sourceId(state.pointerId));
      try { if (state.target.hasPointerCapture(state.pointerId)) state.target.releasePointerCapture(state.pointerId); } catch { /* semantic release is authoritative */ }
      this.#onPedalStateChange?.(state.pedal, 0, false);
    }
    this.#pointers.clear(); this.#pointerByPedal.clear();
    const directionPointerId = this.#directionPointerId;
    this.#directionPointerId = null;
    if (directionPointerId !== null) {
      try {
        if (this.#controls.direction.hasPointerCapture(directionPointerId)) {
          this.#controls.direction.releasePointerCapture(directionPointerId);
        }
      } catch { /* direction state is unchanged */ }
    }
  }

  #enqueuePedal(pedal: AnalogDrivePedal, value: number, timestampMs: number, sourceId: string): void {
    if (pedal === "THROTTLE") {
      this.#timeline.enqueueAnalogThrottle(value * (this.#direction === "D" ? 1 : -1), timestampMs, sourceId);
    } else {
      this.#timeline.enqueueAnalogBrake(value, timestampMs, sourceId);
    }
  }

  #safeTimestamp(): number { return Math.max(this.#now(), this.#timeline.cursorTimeMs); }
  #sourceId(pointerId: number): string { return `${this.#sourceIdPrefix}:${pointerId}`; }
}
