import type { InputReleaseReason } from "./raw-device-event.js";
import type { SteeringPositionTimeline } from "./steering-position-timeline.js";
import {
  advanceSteeringWheelRotation,
  beginSteeringWheelRotation,
  freezeSteeringWheelGeometry,
  resolveSteeringWheelPointerAngle,
  steeringPositionForWheelRotation,
  type FrozenSteeringWheelGeometry,
  type SteeringWheelRotationState,
} from "./steering-wheel-manipulation.js";

export type PointerSteeringInteraction =
  | "X_POSITION"
  | "DIRECT_ROTATION";

export interface PointerSteeringJoystickTarget extends EventTarget {
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
  hasPointerCapture(pointerId: number): boolean;
  getBoundingClientRect(): Readonly<{
    left: number;
    width: number;
    top?: number;
    height?: number;
  }>;
}

export interface PointerSteeringWheelGeometrySource {
  getBoundingClientRect(): Readonly<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>;
}

export interface PointerSteeringJoystickAdapterOptions {
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly target: PointerSteeringJoystickTarget;
  readonly timeline: SteeringPositionTimeline;
  readonly now: () => number;
  readonly isDocumentHidden: () => boolean;
  readonly sourceId?: string;
  readonly interaction?: PointerSteeringInteraction;
  readonly deadZone?: number;
  readonly wheelGeometrySource?: PointerSteeringWheelGeometrySource;
  readonly wheelCenterGuardRatio?: number;
  readonly wheelLockRadians?: number;
  readonly onStateChange?: (value: number, active: boolean) => void;
}

interface InstalledListener {
  readonly target: EventTarget;
  readonly type: string;
  readonly listener: EventListener;
}

interface ActiveXSteeringGeometry {
  readonly left: number;
  readonly width: number;
}

const DEFAULT_DEAD_ZONE = 0.08;
const DEFAULT_DIRECT_CENTER_GUARD_RATIO = 0.18;
const DEFAULT_DIRECT_WHEEL_LOCK_RADIANS = 120 * Math.PI / 180;

function pointerButtonIsSupported(event: PointerEvent): boolean {
  return event.button === 0 || event.button === -1;
}

function hasGeometrySource(
  value: unknown,
): value is PointerSteeringWheelGeometrySource {
  return typeof value === "object" &&
    value !== null &&
    "getBoundingClientRect" in value &&
    typeof (value as { getBoundingClientRect?: unknown }).getBoundingClientRect ===
      "function";
}

export function resolvePointerSteeringPosition(
  clientX: number,
  left: number,
  width: number,
  deadZone = DEFAULT_DEAD_ZONE,
): number {
  if (
    !Number.isFinite(clientX) ||
    !Number.isFinite(left) ||
    !Number.isFinite(width) ||
    width <= 0
  ) {
    throw new RangeError(
      "Steering joystick geometry must be finite and positive.",
    );
  }
  if (!Number.isFinite(deadZone) || deadZone < 0 || deadZone >= 1) {
    throw new RangeError("Steering joystick dead zone must be in [0, 1).");
  }

  const centerX = left + width / 2;
  const raw = Math.max(
    -1,
    Math.min(1, (centerX - clientX) / (width / 2)),
  );
  const magnitude = Math.abs(raw);
  if (magnitude <= deadZone) {
    return 0;
  }
  const rescaled = (magnitude - deadZone) / (1 - deadZone);
  return Math.sign(raw) * rescaled;
}

export class PointerSteeringJoystickAdapter {
  readonly #windowTarget: EventTarget;
  readonly #documentTarget: EventTarget;
  readonly #target: PointerSteeringJoystickTarget;
  readonly #timeline: SteeringPositionTimeline;
  readonly #now: () => number;
  readonly #isDocumentHidden: () => boolean;
  readonly #sourceId: string;
  readonly #interaction: PointerSteeringInteraction;
  readonly #deadZone: number;
  readonly #wheelGeometrySource:
    | PointerSteeringWheelGeometrySource
    | undefined;
  readonly #wheelCenterGuardRatio: number;
  readonly #wheelLockRadians: number;
  readonly #onStateChange:
    | ((value: number, active: boolean) => void)
    | undefined;
  readonly #listeners: InstalledListener[] = [];
  #activePointerId: number | null = null;
  #activeXGeometry: ActiveXSteeringGeometry | null = null;
  #activeWheelGeometry: FrozenSteeringWheelGeometry | null = null;
  #rotationState: SteeringWheelRotationState | null = null;
  #currentPosition = 0;
  #hasActivated = false;
  #disposed = false;

  readonly #onPointerDown: EventListener = (event) => {
    this.#handlePointerDown(event as PointerEvent);
  };

  readonly #onPointerMove: EventListener = (event) => {
    this.#handlePointerMove(event as PointerEvent);
  };

  readonly #onPointerUp: EventListener = (event) => {
    this.#releasePointer(event as PointerEvent, true);
  };

  readonly #onPointerCancel: EventListener = (event) => {
    this.#releasePointer(event as PointerEvent, true);
  };

  readonly #onLostPointerCapture: EventListener = (event) => {
    this.#releasePointer(event as PointerEvent, false);
  };

  readonly #onBlur: EventListener = () => {
    this.#neutralize("BLUR");
  };

  readonly #onVisibilityChange: EventListener = () => {
    if (this.#isDocumentHidden()) {
      this.#neutralize("VISIBILITY_HIDDEN");
    }
  };

  readonly #onPageHide: EventListener = () => {
    this.#neutralize("PAGE_HIDE");
  };

  readonly #onViewportChange: EventListener = () => {
    this.#neutralize("VIEWPORT_CHANGE");
  };

  constructor(options: PointerSteeringJoystickAdapterOptions) {
    this.#windowTarget = options.windowTarget;
    this.#documentTarget = options.documentTarget;
    this.#target = options.target;
    this.#timeline = options.timeline;
    this.#now = options.now;
    this.#isDocumentHidden = options.isDocumentHidden;
    this.#sourceId = options.sourceId ?? "pointer-steering-joystick";
    this.#interaction = options.interaction ?? "DIRECT_ROTATION";
    this.#deadZone = options.deadZone ?? DEFAULT_DEAD_ZONE;
    this.#wheelGeometrySource = options.wheelGeometrySource;
    this.#wheelCenterGuardRatio =
      options.wheelCenterGuardRatio ?? DEFAULT_DIRECT_CENTER_GUARD_RATIO;
    this.#wheelLockRadians =
      options.wheelLockRadians ?? DEFAULT_DIRECT_WHEEL_LOCK_RADIANS;
    this.#onStateChange = options.onStateChange;

    if (this.#interaction === "X_POSITION") {
      resolvePointerSteeringPosition(0, -1, 2, this.#deadZone);
    } else {
      freezeSteeringWheelGeometry(
        { left: 0, top: 0, width: 2, height: 2 },
        this.#wheelCenterGuardRatio,
      );
      beginSteeringWheelRotation(0, 0, this.#wheelLockRadians);
    }

    this.#listen(this.#target, "pointerdown", this.#onPointerDown);
    this.#listen(this.#target, "pointermove", this.#onPointerMove);
    this.#listen(this.#target, "pointerup", this.#onPointerUp);
    this.#listen(this.#target, "pointercancel", this.#onPointerCancel);
    this.#listen(
      this.#target,
      "lostpointercapture",
      this.#onLostPointerCapture,
    );
    this.#listen(this.#windowTarget, "blur", this.#onBlur);
    this.#listen(this.#windowTarget, "pagehide", this.#onPageHide);
    this.#listen(
      this.#windowTarget,
      "orientationchange",
      this.#onViewportChange,
    );
    this.#listen(
      this.#documentTarget,
      "fullscreenchange",
      this.#onViewportChange,
    );
    this.#listen(
      this.#documentTarget,
      "visibilitychange",
      this.#onVisibilityChange,
    );
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#releaseCapture();
    if (this.#hasActivated) {
      this.#timeline.enqueueRelease(
        this.#safeTimestamp(),
        "DISPOSE",
        this.#sourceId,
      );
    }
    this.#clearActiveGesture();
    this.#currentPosition = 0;
    this.#onStateChange?.(0, false);
    for (const { target, type, listener } of this.#listeners.reverse()) {
      target.removeEventListener(type, listener);
    }
    this.#listeners.length = 0;
  }

  #listen(target: EventTarget, type: string, listener: EventListener): void {
    target.addEventListener(type, listener);
    this.#listeners.push({ target, type, listener });
  }

  #handlePointerDown(event: PointerEvent): void {
    if (
      this.#disposed ||
      this.#activePointerId !== null ||
      !pointerButtonIsSupported(event)
    ) {
      return;
    }

    const prepared = this.#prepareGesture(event);
    if (prepared === null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    try {
      this.#target.setPointerCapture(event.pointerId);
    } catch {
      return;
    }

    this.#activePointerId = event.pointerId;
    this.#activeXGeometry = prepared.xGeometry;
    this.#activeWheelGeometry = prepared.wheelGeometry;
    this.#rotationState = prepared.rotationState;
    this.#currentPosition = prepared.value;
    this.#hasActivated = true;
    this.#timeline.enqueuePosition(
      this.#currentPosition,
      this.#safeTimestamp(),
      this.#sourceId,
    );
    this.#onStateChange?.(this.#currentPosition, true);
  }

  #handlePointerMove(event: PointerEvent): void {
    if (
      this.#disposed ||
      event.pointerId !== this.#activePointerId
    ) {
      return;
    }

    const value = this.#valueForMove(event);
    if (value === null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.#currentPosition = value;
    this.#timeline.enqueuePosition(
      value,
      this.#safeTimestamp(),
      this.#sourceId,
    );
    this.#onStateChange?.(value, true);
  }

  #prepareGesture(event: PointerEvent): Readonly<{
    value: number;
    xGeometry: ActiveXSteeringGeometry | null;
    wheelGeometry: FrozenSteeringWheelGeometry | null;
    rotationState: SteeringWheelRotationState | null;
  }> | null {
    if (this.#interaction === "X_POSITION") {
      const geometry = this.#captureXGeometry();
      if (geometry === null) {
        return null;
      }
      const value = this.#xPositionFor(event.clientX, geometry);
      if (value === null) {
        return null;
      }
      return {
        value,
        xGeometry: geometry,
        wheelGeometry: null,
        rotationState: null,
      };
    }

    const geometry = this.#captureWheelGeometry();
    if (geometry === null) {
      return null;
    }
    const pointerAngle = this.#wheelPointerAngleFor(event, geometry);
    const rotationState = beginSteeringWheelRotation(
      this.#currentPosition,
      pointerAngle,
      this.#wheelLockRadians,
    );
    return {
      // Direct manipulation is relative to the wheel position at grab. Pointer
      // down therefore re-enqueues the existing position instead of snapping to
      // the absolute touch angle.
      value: this.#currentPosition,
      xGeometry: null,
      wheelGeometry: geometry,
      rotationState,
    };
  }

  #valueForMove(event: PointerEvent): number | null {
    if (this.#interaction === "X_POSITION") {
      if (this.#activeXGeometry === null) {
        return null;
      }
      return this.#xPositionFor(event.clientX, this.#activeXGeometry);
    }

    if (
      this.#activeWheelGeometry === null ||
      this.#rotationState === null
    ) {
      return null;
    }
    const pointerAngle = this.#wheelPointerAngleFor(
      event,
      this.#activeWheelGeometry,
    );
    this.#rotationState = advanceSteeringWheelRotation(
      this.#rotationState,
      pointerAngle,
      this.#wheelLockRadians,
    );
    return steeringPositionForWheelRotation(
      this.#rotationState,
      this.#wheelLockRadians,
    );
  }

  #releasePointer(event: PointerEvent, releaseCapture: boolean): void {
    if (event.pointerId !== this.#activePointerId) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.#clearActiveGesture();
    this.#currentPosition = 0;
    this.#timeline.enqueuePosition(0, this.#safeTimestamp(), this.#sourceId);
    if (releaseCapture) {
      this.#releaseCapture(event.pointerId);
    }
    this.#onStateChange?.(0, false);
  }

  #neutralize(_reason: InputReleaseReason): void {
    if (this.#disposed || !this.#hasActivated) {
      return;
    }
    this.#releaseCapture();
    this.#clearActiveGesture();
    this.#currentPosition = 0;
    this.#timeline.enqueuePosition(0, this.#safeTimestamp(), this.#sourceId);
    this.#onStateChange?.(0, false);
  }

  #clearActiveGesture(): void {
    this.#activePointerId = null;
    this.#activeXGeometry = null;
    this.#activeWheelGeometry = null;
    this.#rotationState = null;
  }

  #releaseCapture(pointerId = this.#activePointerId): void {
    if (pointerId === null) {
      return;
    }
    try {
      if (this.#target.hasPointerCapture(pointerId)) {
        this.#target.releasePointerCapture(pointerId);
      }
    } catch {
      // Semantic neutralization is independent from browser capture teardown.
    }
  }

  #captureXGeometry(): ActiveXSteeringGeometry | null {
    try {
      const rect = this.#target.getBoundingClientRect();
      if (
        !Number.isFinite(rect.left) ||
        !Number.isFinite(rect.width) ||
        rect.width <= 0
      ) {
        return null;
      }
      return { left: rect.left, width: rect.width };
    } catch {
      return null;
    }
  }

  #captureWheelGeometry(): FrozenSteeringWheelGeometry | null {
    try {
      const source =
        this.#wheelGeometrySource ?? this.#discoverWheelGeometrySource();
      if (source === null) {
        return null;
      }
      const rect = source.getBoundingClientRect();
      return freezeSteeringWheelGeometry(
        {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        this.#wheelCenterGuardRatio,
      );
    } catch {
      return null;
    }
  }

  #discoverWheelGeometrySource(): PointerSteeringWheelGeometrySource | null {
    const queryable = this.#target as unknown as {
      querySelector?: (selector: string) => unknown;
    };
    if (typeof queryable.querySelector === "function") {
      const wheel = queryable.querySelector(".mobile-steering-wheel-tilt");
      if (hasGeometrySource(wheel)) {
        return wheel;
      }
    }

    const targetRect = this.#target.getBoundingClientRect();
    if (
      Number.isFinite(targetRect.top) &&
      Number.isFinite(targetRect.height) &&
      targetRect.top !== undefined &&
      targetRect.height !== undefined
    ) {
      return {
        getBoundingClientRect: () => ({
          left: targetRect.left,
          top: targetRect.top as number,
          width: targetRect.width,
          height: targetRect.height as number,
        }),
      };
    }
    return null;
  }

  #xPositionFor(
    clientX: number,
    geometry: ActiveXSteeringGeometry,
  ): number | null {
    try {
      return resolvePointerSteeringPosition(
        clientX,
        geometry.left,
        geometry.width,
        this.#deadZone,
      );
    } catch {
      return null;
    }
  }

  #wheelPointerAngleFor(
    event: PointerEvent,
    geometry: FrozenSteeringWheelGeometry,
  ): number | null {
    try {
      return resolveSteeringWheelPointerAngle(
        event.clientX,
        event.clientY,
        geometry,
      );
    } catch {
      return null;
    }
  }

  #safeTimestamp(): number {
    return Math.max(this.#now(), this.#timeline.cursorTimeMs);
  }
}
