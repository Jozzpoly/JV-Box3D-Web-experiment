import type { LongitudinalInputTimeline } from "./longitudinal-input-timeline.js";
import type { InputReleaseReason } from "./raw-device-event.js";

export type AnalogDrivePedal = "THROTTLE" | "BRAKE";
export type PointerDriveDirection = "D" | "R";

export interface PointerAnalogPedalTarget extends EventTarget {
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
  hasPointerCapture(pointerId: number): boolean;
  getBoundingClientRect(): Readonly<{ height: number }>;
}

export interface PointerAnalogDriveControls {
  readonly throttle: PointerAnalogPedalTarget;
  readonly brake: PointerAnalogPedalTarget;
  readonly direction: EventTarget;
}

export interface PointerAnalogDriveAdapterOptions {
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly isDocumentHidden: () => boolean;
  readonly timeline: LongitudinalInputTimeline;
  readonly controls: PointerAnalogDriveControls;
  readonly now: () => number;
  readonly sourceIdPrefix?: string;
  readonly onPedalStateChange?: (
    pedal: AnalogDrivePedal,
    value: number,
    active: boolean,
  ) => void;
  readonly onDirectionChange?: (direction: PointerDriveDirection) => void;
}

interface InstalledListener {
  readonly target: EventTarget;
  readonly type: string;
  readonly listener: EventListener;
}

interface ActivePedalPointer {
  readonly pointerId: number;
  readonly pedal: AnalogDrivePedal;
  readonly target: PointerAnalogPedalTarget;
  readonly originY: number;
  readonly travelPx: number;
  value: number;
}

const PEDAL_TRAVEL_RATIO = 0.82;
const MIN_PEDAL_TRAVEL_PX = 72;
const MAX_PEDAL_TRAVEL_PX = 132;
const DEFAULT_PEDAL_START_SLOP_PX = 6;
const VALUE_EPSILON = 1e-6;

function pointerButtonIsSupported(event: PointerEvent): boolean {
  return event.button === 0 || event.button === -1;
}

export function resolvePointerAnalogPedalTravelPx(height: number): number {
  if (!Number.isFinite(height) || height <= 0) {
    throw new RangeError("Pedal target height must be finite and positive.");
  }
  return Math.max(
    MIN_PEDAL_TRAVEL_PX,
    Math.min(MAX_PEDAL_TRAVEL_PX, height * PEDAL_TRAVEL_RATIO),
  );
}

export function resolvePointerAnalogPedalValue(
  clientY: number,
  originY: number,
  travelPx: number,
  startSlopPx = DEFAULT_PEDAL_START_SLOP_PX,
): number {
  if (
    !Number.isFinite(clientY) ||
    !Number.isFinite(originY) ||
    !Number.isFinite(travelPx) ||
    travelPx <= 0
  ) {
    throw new RangeError("Pedal gesture geometry must be finite and positive.");
  }
  if (
    !Number.isFinite(startSlopPx) ||
    startSlopPx < 0 ||
    startSlopPx >= travelPx
  ) {
    throw new RangeError("Pedal start slop must be in [0, travelPx).\");
  }
  const upwardTravelPx = originY - clientY;
  if (upwardTravelPx <= startSlopPx) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(
      1,
      (upwardTravelPx - startSlopPx) / (travelPx - startSlopPx),
    ),
  );
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
    const onDirectionPointerDown: EventListener = (event) => {
      event.stopPropagation();
    };
    const onDirectionClick: EventListener = (event) => {
      this.#toggleDirection(event);
    };
    this.#listen(this.#controls.direction, "pointerdown", onDirectionPointerDown);
    this.#listen(this.#controls.direction, "click", onDirectionClick);
    this.#listen(this.#windowTarget, "blur", () => this.#releaseAll("BLUR"));
    this.#listen(this.#windowTarget, "pagehide", () =>
      this.#releaseAll("PAGE_HIDE"),
    );
    this.#listen(this.#documentTarget, "visibilitychange", () => {
      if (this.#isDocumentHidden()) {
        this.#releaseAll("VISIBILITY_HIDDEN");
      }
    });
    this.#onDirectionChange?.(this.#direction);
  }

  get direction(): PointerDriveDirection {
    return this.#direction;
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#releaseAll("DISPOSE");
    for (const { target, type, listener } of this.#listeners.reverse()) {
      target.removeEventListener(type, listener);
    }
    this.#listeners.length = 0;
  }

  #installPedal(
    pedal: AnalogDrivePedal,
    target: PointerAnalogPedalTarget,
  ): void {
    this.#listen(target, "pointerdown", (event) =>
      this.#handlePointerDown(pedal, target, event as PointerEvent),
    );
    this.#listen(target, "pointermove", (event) =>
      this.#handlePointerMove(event as PointerEvent),
    );
    this.#listen(target, "pointerup", (event) =>
      this.#releasePointer(event as PointerEvent, true),
    );
    this.#listen(target, "pointercancel", (event) =>
      this.#releasePointer(event as PointerEvent, true),
    );
    this.#listen(target, "lostpointercapture", (event) =>
      this.#releasePointer(event as PointerEvent, false),
    );
  }

  #listen(target: EventTarget, type: string, listener: EventListener): void {
    target.addEventListener(type, listener);
    this.#listeners.push({ target, type, listener });
  }

  #handlePointerDown(
    pedal: AnalogDrivePedal,
    target: PointerAnalogPedalTarget,
    event: PointerEvent,
  ): void {
    if (
      this.#disposed ||
      !pointerButtonIsSupported(event) ||
      this.#pointers.has(event.pointerId) ||
      this.#pointerByPedal.has(pedal)
    ) {
      return;
    }
    let travelPx: number;
    try {
      travelPx = resolvePointerAnalogPedalTravelPx(
        target.getBoundingClientRect().height,
      );
    } catch {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      return;
    }
    const state: ActivePedalPointer = {
      pointerId: event.pointerId,
      pedal,
      target,
      originY: event.clientY,
      travelPx,
      value: 0,
    };
    this.#pointers.set(event.pointerId, state);
    this.#pointerByPedal.set(pedal, event.pointerId);
    this.#onPedalStateChange?.(pedal, 0, true);
  }

  #handlePointerMove(event: PointerEvent): void {
    if (this.#disposed) {
      return;
    }
    const state = this.#pointers.get(event.pointerId);
    if (state === undefined) {
      return;
    }
    let value: number;
    try {
      value = resolvePointerAnalogPedalValue(
        event.clientY,
        state.originY,
        state.travelPx,
      );
    } catch {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (Math.abs(value - state.value) <= VALUE_EPSILON) {
      return;
    }
    state.value = value;
    this.#enqueuePedal(
      state.pedal,
      value,
      this.#safeTimestamp(),
      this.#sourceId(state.pointerId),
    );
    this.#onPedalStateChange?.(state.pedal, value, true);
  }

  #releasePointer(event: PointerEvent, releaseCapture: boolean): void {
    const state = this.#pointers.get(event.pointerId);
    if (state === undefined) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.#pointers.delete(event.pointerId);
    this.#pointerByPedal.delete(state.pedal);
    this.#enqueuePedal(
      state.pedal,
      0,
      this.#safeTimestamp(),
      this.#sourceId(state.pointerId),
    );
    if (releaseCapture) {
      try {
        if (state.target.hasPointerCapture(state.pointerId)) {
          state.target.releasePointerCapture(state.pointerId);
        }
      } catch {
        // Semantic zero was already queued.
      }
    }
    this.#onPedalStateChange?.(state.pedal, 0, false);
  }

  #toggleDirection(event: Event): void {
    if (this.#disposed) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.#direction = this.#direction === "D" ? "R" : "D";
    const timestampMs = this.#safeTimestamp();
    const throttleId = this.#pointerByPedal.get("THROTTLE");
    if (throttleId !== undefined) {
      const throttle = this.#pointers.get(throttleId);
      if (throttle !== undefined && throttle.value > VALUE_EPSILON) {
        this.#enqueuePedal(
          "THROTTLE",
          throttle.value,
          timestampMs,
          this.#sourceId(throttle.pointerId),
        );
      }
    }
    this.#onDirectionChange?.(this.#direction);
  }

  #releaseAll(reason: InputReleaseReason): void {
    if (this.#pointers.size === 0) {
      return;
    }
    const timestampMs = this.#safeTimestamp();
    for (const state of this.#pointers.values()) {
      this.#timeline.enqueueReleaseAll(
        timestampMs,
        reason,
        this.#sourceId(state.pointerId),
      );
      try {
        if (state.target.hasPointerCapture(state.pointerId)) {
          state.target.releasePointerCapture(state.pointerId);
        }
      } catch {
        // Semantic release is authoritative.
      }
      this.#onPedalStateChange?.(state.pedal, 0, false);
    }
    this.#pointers.clear();
    this.#pointerByPedal.clear();
  }

  #enqueuePedal(
    pedal: AnalogDrivePedal,
    value: number,
    timestampMs: number,
    sourceId: string,
  ): void {
    if (pedal === "THROTTLE") {
      this.#timeline.enqueueAnalogThrottle(
        value * (this.#direction === "D" ? 1 : -1),
        timestampMs,
        sourceId,
      );
    } else {
      this.#timeline.enqueueAnalogBrake(value, timestampMs, sourceId);
    }
  }

  #safeTimestamp(): number {
    return Math.max(this.#now(), this.#timeline.cursorTimeMs);
  }

  #sourceId(pointerId: number): string {
    return `${this.#sourceIdPrefix}:${pointerId}`;
  }
}
