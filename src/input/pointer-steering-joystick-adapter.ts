import type { InputReleaseReason } from "./raw-device-event.js";
import type { SteeringPositionTimeline } from "./steering-position-timeline.js";

export interface PointerSteeringJoystickTarget extends EventTarget {
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
  hasPointerCapture(pointerId: number): boolean;
  getBoundingClientRect(): Readonly<{ left: number; width: number }>;
}

export interface PointerSteeringJoystickAdapterOptions {
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly target: PointerSteeringJoystickTarget;
  readonly timeline: SteeringPositionTimeline;
  readonly now: () => number;
  readonly isDocumentHidden: () => boolean;
  readonly sourceId?: string;
  readonly deadZone?: number;
  readonly onStateChange?: (value: number, active: boolean) => void;
}

interface InstalledListener {
  readonly target: EventTarget;
  readonly type: string;
  readonly listener: EventListener;
}

interface ActiveSteeringGeometry {
  readonly left: number;
  readonly width: number;
}

const DEFAULT_DEAD_ZONE = 0.08;

function pointerButtonIsSupported(event: PointerEvent): boolean {
  return event.button === 0 || event.button === -1;
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
  readonly #deadZone: number;
  readonly #onStateChange:
    | ((value: number, active: boolean) => void)
    | undefined;
  readonly #listeners: InstalledListener[] = [];
  #activePointerId: number | null = null;
  #activeGeometry: ActiveSteeringGeometry | null = null;
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
    this.#deadZone = options.deadZone ?? DEFAULT_DEAD_ZONE;
    resolvePointerSteeringPosition(0, -1, 2, this.#deadZone);
    this.#onStateChange = options.onStateChange;

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
    this.#activePointerId = null;
    this.#activeGeometry = null;
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

    const geometry = this.#captureGeometry();
    if (geometry === null) {
      return;
    }
    const value = this.#positionFor(event.clientX, geometry);
    if (value === null) {
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
    this.#activeGeometry = geometry;
    this.#hasActivated = true;
    this.#timeline.enqueuePosition(
      value,
      this.#safeTimestamp(),
      this.#sourceId,
    );
    this.#onStateChange?.(value, true);
  }

  #handlePointerMove(event: PointerEvent): void {
    if (
      this.#disposed ||
      event.pointerId !== this.#activePointerId ||
      this.#activeGeometry === null
    ) {
      return;
    }
    const value = this.#positionFor(event.clientX, this.#activeGeometry);
    if (value === null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.#timeline.enqueuePosition(
      value,
      this.#safeTimestamp(),
      this.#sourceId,
    );
    this.#onStateChange?.(value, true);
  }

  #releasePointer(event: PointerEvent, releaseCapture: boolean): void {
    if (event.pointerId !== this.#activePointerId) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.#activePointerId = null;
    this.#activeGeometry = null;
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
    this.#activePointerId = null;
    this.#activeGeometry = null;
    this.#timeline.enqueuePosition(0, this.#safeTimestamp(), this.#sourceId);
    this.#onStateChange?.(0, false);
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

  #captureGeometry(): ActiveSteeringGeometry | null {
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

  #positionFor(
    clientX: number,
    geometry: ActiveSteeringGeometry,
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

  #safeTimestamp(): number {
    return Math.max(this.#now(), this.#timeline.cursorTimeMs);
  }
}
