import type { InputReleaseReason } from "./raw-device-event.js";
import type { SteeringPositionTimeline } from "./steering-position-timeline.js";
import {
  advanceSteeringWheelHorizontalManipulation,
  advanceSteeringWheelRotation,
  beginSteeringWheelHorizontalManipulation,
  beginSteeringWheelRotation,
  freezeSteeringWheelGeometry,
  resolveSteeringWheelPointerAngle,
  steeringPositionForWheelRotation,
  type FrozenSteeringWheelGeometry,
  type SteeringWheelHorizontalState,
  type SteeringWheelRotationState,
} from "./steering-wheel-manipulation.js";

export type PointerSteeringInteraction =
  | "X_POSITION"
  | "DIRECT_ROTATION"
  | "RELATIVE_X";

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
  readonly getInteraction?: () => PointerSteeringInteraction;
  readonly deadZone?: number;
  readonly wheelGeometrySource?: PointerSteeringWheelGeometrySource;
  readonly wheelCenterGuardRatio?: number;
  readonly wheelLockRadians?: number;
  readonly getWheelLockRadians?: () => number;
  readonly centeringAssist?: boolean;
  readonly getCenteringAssist?: () => boolean;
  readonly getRestingPosition?: () => number;
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
const DEFAULT_DIRECT_WHEEL_LOCK_RADIANS = 450 * Math.PI / 180;

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

function clampSigned(value: number): number {
  return Math.max(-1, Math.min(1, value));
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
  readonly #getInteraction: () => PointerSteeringInteraction;
  readonly #deadZone: number;
  readonly #wheelGeometrySource:
    | PointerSteeringWheelGeometrySource
    | undefined;
  readonly #wheelCenterGuardRatio: number;
  readonly #getWheelLockRadians: () => number;
  readonly #getCenteringAssist: () => boolean;
  readonly #getRestingPosition: (() => number) | undefined;
  readonly #onStateChange:
    | ((value: number, active: boolean) => void)
    | undefined;
  readonly #listeners: InstalledListener[] = [];
  #activePointerId: number | null = null;
  #activeInteraction: PointerSteeringInteraction | null = null;
  #activeXGeometry: ActiveXSteeringGeometry | null = null;
  #activeWheelGeometry: FrozenSteeringWheelGeometry | null = null;
  #activeWheelLockRadians: number | null = null;
  #rotationState: SteeringWheelRotationState | null = null;
  #horizontalState: SteeringWheelHorizontalState | null = null;
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
    if (
      options.interaction !== undefined &&
      options.getInteraction !== undefined
    ) {
      throw new Error(
        "Steering interaction must use either a fixed mode or a provider, not both.",
      );
    }
    if (options.getInteraction !== undefined) {
      this.#getInteraction = options.getInteraction;
    } else {
      const interaction = options.interaction ?? "DIRECT_ROTATION";
      this.#assertInteraction(interaction);
      this.#getInteraction = () => interaction;
    }
    if (
      options.wheelLockRadians !== undefined &&
      options.getWheelLockRadians !== undefined
    ) {
      throw new Error(
        "Steering wheel lock must use either a fixed value or a provider, not both.",
      );
    }
    const fixedWheelLockRadians =
      options.wheelLockRadians ?? DEFAULT_DIRECT_WHEEL_LOCK_RADIANS;
    this.#getWheelLockRadians =
      options.getWheelLockRadians ?? (() => fixedWheelLockRadians);
    if (
      options.centeringAssist !== undefined &&
      options.getCenteringAssist !== undefined
    ) {
      throw new Error(
        "Steering centering assist must use either a fixed value or a provider, not both.",
      );
    }
    const fixedCenteringAssist = options.centeringAssist ?? false;
    this.#getCenteringAssist =
      options.getCenteringAssist ?? (() => fixedCenteringAssist);
    this.#getRestingPosition = options.getRestingPosition;
    this.#deadZone = options.deadZone ?? DEFAULT_DEAD_ZONE;
    this.#wheelGeometrySource = options.wheelGeometrySource;
    this.#wheelCenterGuardRatio =
      options.wheelCenterGuardRatio ?? DEFAULT_DIRECT_CENTER_GUARD_RATIO;
    this.#onStateChange = options.onStateChange;

    resolvePointerSteeringPosition(0, -1, 2, this.#deadZone);
    const validationGeometry = freezeSteeringWheelGeometry(
      { left: 0, top: 0, width: 2, height: 2 },
      this.#wheelCenterGuardRatio,
    );
    const validationLock = this.#wheelLockRadiansForNewGesture();
    if (validationLock === null) {
      throw new RangeError("Steering wheel lock provider returned an invalid value.");
    }
    beginSteeringWheelRotation(0, 0, validationLock);
    beginSteeringWheelHorizontalManipulation(
      0,
      validationGeometry.centerX,
      validationLock,
    );

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
    this.#activeInteraction = prepared.interaction;
    this.#activeXGeometry = prepared.xGeometry;
    this.#activeWheelGeometry = prepared.wheelGeometry;
    this.#activeWheelLockRadians = prepared.wheelLockRadians;
    this.#rotationState = prepared.rotationState;
    this.#horizontalState = prepared.horizontalState;
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
    interaction: PointerSteeringInteraction;
    value: number;
    xGeometry: ActiveXSteeringGeometry | null;
    wheelGeometry: FrozenSteeringWheelGeometry | null;
    wheelLockRadians: number | null;
    rotationState: SteeringWheelRotationState | null;
    horizontalState: SteeringWheelHorizontalState | null;
  }> | null {
    const interaction = this.#interactionForNewGesture();
    if (interaction === null) {
      return null;
    }

    if (interaction === "X_POSITION") {
      const geometry = this.#captureXGeometry();
      if (geometry === null) {
        return null;
      }
      const value = this.#xPositionFor(event.clientX, geometry);
      if (value === null) {
        return null;
      }
      return {
        interaction,
        value,
        xGeometry: geometry,
        wheelGeometry: null,
        wheelLockRadians: null,
        rotationState: null,
        horizontalState: null,
      };
    }

    const geometry = this.#captureWheelGeometry();
    const wheelLockRadians = this.#wheelLockRadiansForNewGesture();
    const restingPosition = this.#restingPositionForNewGesture();
    if (
      geometry === null ||
      wheelLockRadians === null ||
      restingPosition === null
    ) {
      return null;
    }
    if (interaction === "RELATIVE_X") {
      return {
        interaction,
        value: restingPosition,
        xGeometry: null,
        wheelGeometry: geometry,
        wheelLockRadians,
        rotationState: null,
        horizontalState: beginSteeringWheelHorizontalManipulation(
          restingPosition,
          event.clientX,
          wheelLockRadians,
        ),
      };
    }

    const pointerAngle = this.#wheelPointerAngleFor(event, geometry);
    const rotationState = beginSteeringWheelRotation(
      restingPosition,
      pointerAngle,
      wheelLockRadians,
    );
    return {
      interaction,
      value: restingPosition,
      xGeometry: null,
      wheelGeometry: geometry,
      wheelLockRadians,
      rotationState,
      horizontalState: null,
    };
  }

  #valueForMove(event: PointerEvent): number | null {
    if (this.#activeInteraction === "X_POSITION") {
      if (this.#activeXGeometry === null) {
        return null;
      }
      return this.#xPositionFor(event.clientX, this.#activeXGeometry);
    }

    const wheelLockRadians = this.#activeWheelLockRadians;
    if (wheelLockRadians === null) {
      return null;
    }

    if (this.#activeInteraction === "RELATIVE_X") {
      if (
        this.#activeWheelGeometry === null ||
        this.#horizontalState === null
      ) {
        return null;
      }
      this.#horizontalState = advanceSteeringWheelHorizontalManipulation(
        this.#horizontalState,
        event.clientX,
        this.#activeWheelGeometry.radiusX,
        wheelLockRadians,
      );
      return steeringPositionForWheelRotation(
        this.#horizontalState,
        wheelLockRadians,
      );
    }

    if (
      this.#activeInteraction !== "DIRECT_ROTATION" ||
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
      wheelLockRadians,
    );
    return steeringPositionForWheelRotation(
      this.#rotationState,
      wheelLockRadians,
    );
  }

  #releasePointer(event: PointerEvent, releaseCapture: boolean): void {
    if (event.pointerId !== this.#activePointerId) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.#clearActiveGesture();
    this.#finishOwnership("POINTER_RELEASE");
    if (releaseCapture) {
      this.#releaseCapture(event.pointerId);
    }
  }

  #neutralize(reason: InputReleaseReason): void {
    if (this.#disposed || !this.#hasActivated) {
      return;
    }
    this.#releaseCapture();
    this.#clearActiveGesture();
    this.#finishOwnership(reason);
  }

  #finishOwnership(reason: InputReleaseReason): void {
    if (this.#centeringAssistEnabled()) {
      this.#currentPosition = 0;
      this.#timeline.enqueuePosition(
        0,
        this.#safeTimestamp(),
        this.#sourceId,
      );
      this.#onStateChange?.(0, false);
      return;
    }
    this.#timeline.enqueueRelease(
      this.#safeTimestamp(),
      reason,
      this.#sourceId,
    );
    this.#onStateChange?.(this.#currentPosition, false);
  }

  #clearActiveGesture(): void {
    this.#activePointerId = null;
    this.#activeInteraction = null;
    this.#activeXGeometry = null;
    this.#activeWheelGeometry = null;
    this.#activeWheelLockRadians = null;
    this.#rotationState = null;
    this.#horizontalState = null;
  }

  #interactionForNewGesture(): PointerSteeringInteraction | null {
    try {
      const interaction = this.#getInteraction();
      this.#assertInteraction(interaction);
      return interaction;
    } catch {
      return null;
    }
  }

  #wheelLockRadiansForNewGesture(): number | null {
    try {
      const value = this.#getWheelLockRadians();
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch {
      return null;
    }
  }

  #restingPositionForNewGesture(): number | null {
    if (this.#getRestingPosition === undefined) {
      return this.#currentPosition;
    }
    try {
      const value = this.#getRestingPosition();
      return Number.isFinite(value) ? clampSigned(value) : null;
    } catch {
      return null;
    }
  }

  #centeringAssistEnabled(): boolean {
    try {
      return this.#getCenteringAssist() === true;
    } catch {
      return false;
    }
  }

  #assertInteraction(
    interaction: unknown,
  ): asserts interaction is PointerSteeringInteraction {
    if (
      interaction !== "X_POSITION" &&
      interaction !== "DIRECT_ROTATION" &&
      interaction !== "RELATIVE_X"
    ) {
      throw new Error(`Unsupported steering interaction: ${String(interaction)}`);
    }
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
