import type {
  LongitudinalInputTimeline,
} from "./longitudinal-input-timeline.js";
import type { InputReleaseReason, SteeringSide } from "./raw-device-event.js";
import type { SteeringInputTimeline } from "./steering-input-timeline.js";

export type PointerVehicleControlId =
  | "STEER_LEFT"
  | "STEER_RIGHT"
  | "FORWARD"
  | "REVERSE"
  | "BRAKE";

export type PointerDriveDirection = "D" | "R";

export interface PointerControlTarget extends EventTarget {
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
  hasPointerCapture(pointerId: number): boolean;
  getBoundingClientRect(): Readonly<{ height: number }>;
}

export interface PointerVehicleControlTargets {
  readonly steerLeft: PointerControlTarget;
  readonly steerRight: PointerControlTarget;
  readonly forward: PointerControlTarget;
  readonly reverse: PointerControlTarget;
  readonly brake: PointerControlTarget;
}

export interface PointerVehicleControlAdapterOptions {
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly isDocumentHidden: () => boolean;
  readonly steeringTimeline: SteeringInputTimeline;
  readonly longitudinalTimeline: LongitudinalInputTimeline;
  readonly controls: PointerVehicleControlTargets;
  readonly now: () => number;
  readonly sourceIdPrefix?: string;
  readonly onControlStateChange?: (
    control: PointerVehicleControlId,
    active: boolean,
    value?: number,
  ) => void;
}

type SteeringBinding = Readonly<{
  id: "STEER_LEFT" | "STEER_RIGHT";
  kind: "STEERING";
  value: SteeringSide;
  target: PointerControlTarget;
}>;

type PedalBinding = Readonly<{
  id: "FORWARD" | "BRAKE";
  kind: "PEDAL";
  pedal: "THROTTLE" | "BRAKE";
  target: PointerControlTarget;
}>;

type DirectionBinding = Readonly<{
  id: "REVERSE";
  kind: "DIRECTION";
  target: PointerControlTarget;
}>;

type ControlBinding = SteeringBinding | PedalBinding | DirectionBinding;
type CapturedBinding = SteeringBinding | PedalBinding;

interface InstalledListener {
  readonly target: EventTarget;
  readonly type: string;
  readonly listener: EventListener;
}

interface ActivePedalPointer {
  readonly binding: PedalBinding;
  readonly originY: number;
  readonly travelPx: number;
  value: number;
}

const PEDAL_TRAVEL_RATIO = 0.86;
const MIN_PEDAL_TRAVEL_PX = 64;
const MAX_PEDAL_TRAVEL_PX = 120;
const DEFAULT_PEDAL_START_SLOP_PX = 6;

function pointerButtonIsSupported(event: PointerEvent): boolean {
  return event.button === 0 || event.button === -1;
}

export function resolvePointerPedalTravelPx(height: number): number {
  if (!Number.isFinite(height) || height <= 0) {
    throw new RangeError("Pedal target height must be finite and positive.");
  }
  return Math.max(
    MIN_PEDAL_TRAVEL_PX,
    Math.min(MAX_PEDAL_TRAVEL_PX, height * PEDAL_TRAVEL_RATIO),
  );
}

export function resolvePointerPedalValue(
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
    throw new RangeError("Pedal start slop must be in [0, travelPx).");
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

export class PointerVehicleControlAdapter {
  readonly #windowTarget: EventTarget;
  readonly #documentTarget: EventTarget;
  readonly #isDocumentHidden: () => boolean;
  readonly #steeringTimeline: SteeringInputTimeline;
  readonly #longitudinalTimeline: LongitudinalInputTimeline;
  readonly #now: () => number;
  readonly #sourceIdPrefix: string;
  readonly #onControlStateChange:
    | ((
        control: PointerVehicleControlId,
        active: boolean,
        value?: number,
      ) => void)
    | undefined;
  readonly #bindings: readonly ControlBinding[];
  readonly #listeners: InstalledListener[] = [];
  readonly #pointerOwners = new Map<number, CapturedBinding>();
  readonly #pedalPointers = new Map<number, ActivePedalPointer>();
  readonly #activePointersByControl = new Map<
    PointerVehicleControlId,
    Set<number>
  >();
  #driveDirection: PointerDriveDirection = "D";
  #disposed = false;

  readonly #onBlur: EventListener = () => {
    this.#releaseAll("BLUR");
  };

  readonly #onVisibilityChange: EventListener = () => {
    if (this.#isDocumentHidden()) {
      this.#releaseAll("VISIBILITY_HIDDEN");
    }
  };

  readonly #onPageHide: EventListener = () => {
    this.#releaseAll("PAGE_HIDE");
  };

  constructor(options: PointerVehicleControlAdapterOptions) {
    this.#windowTarget = options.windowTarget;
    this.#documentTarget = options.documentTarget;
    this.#isDocumentHidden = options.isDocumentHidden;
    this.#steeringTimeline = options.steeringTimeline;
    this.#longitudinalTimeline = options.longitudinalTimeline;
    this.#now = options.now;
    this.#sourceIdPrefix = options.sourceIdPrefix ?? "pointer";
    this.#onControlStateChange = options.onControlStateChange;
    this.#bindings = Object.freeze([
      {
        id: "STEER_LEFT",
        kind: "STEERING",
        value: "LEFT",
        target: options.controls.steerLeft,
      },
      {
        id: "STEER_RIGHT",
        kind: "STEERING",
        value: "RIGHT",
        target: options.controls.steerRight,
      },
      {
        id: "FORWARD",
        kind: "PEDAL",
        pedal: "THROTTLE",
        target: options.controls.forward,
      },
      {
        id: "BRAKE",
        kind: "PEDAL",
        pedal: "BRAKE",
        target: options.controls.brake,
      },
      {
        id: "REVERSE",
        kind: "DIRECTION",
        target: options.controls.reverse,
      },
    ] satisfies readonly ControlBinding[]);

    const uniqueTargets = new Set(
      this.#bindings.map((binding) => binding.target),
    );
    if (uniqueTargets.size !== this.#bindings.length) {
      throw new Error("Each pointer vehicle control requires a unique target.");
    }

    for (const binding of this.#bindings) {
      this.#installControl(binding);
    }
    this.#listen(this.#windowTarget, "blur", this.#onBlur);
    this.#listen(this.#windowTarget, "pagehide", this.#onPageHide);
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
    this.#releaseAll("DISPOSE");
    for (const { target, type, listener } of this.#listeners.reverse()) {
      target.removeEventListener(type, listener);
    }
    this.#listeners.length = 0;
  }

  #installControl(binding: ControlBinding): void {
    if (binding.kind === "DIRECTION") {
      const onPointerDown: EventListener = (event) => {
        event.stopPropagation();
      };
      const onClick: EventListener = (event) => {
        this.#toggleDirection(event);
      };
      this.#listen(binding.target, "pointerdown", onPointerDown);
      this.#listen(binding.target, "click", onClick);
      return;
    }

    const onPointerDown: EventListener = (event) => {
      this.#handlePointerDown(binding, event as PointerEvent);
    };
    const onPointerMove: EventListener = (event) => {
      if (binding.kind === "PEDAL") {
        this.#handlePedalMove(binding, event as PointerEvent);
      }
    };
    const onPointerUp: EventListener = (event) => {
      this.#releasePointer(event as PointerEvent, true);
    };
    const onPointerCancel: EventListener = (event) => {
      this.#releasePointer(event as PointerEvent, true);
    };
    const onLostPointerCapture: EventListener = (event) => {
      this.#releasePointer(event as PointerEvent, false);
    };

    this.#listen(binding.target, "pointerdown", onPointerDown);
    if (binding.kind === "PEDAL") {
      this.#listen(binding.target, "pointermove", onPointerMove);
    }
    this.#listen(binding.target, "pointerup", onPointerUp);
    this.#listen(binding.target, "pointercancel", onPointerCancel);
    this.#listen(
      binding.target,
      "lostpointercapture",
      onLostPointerCapture,
    );
  }

  #listen(target: EventTarget, type: string, listener: EventListener): void {
    target.addEventListener(type, listener);
    this.#listeners.push({ target, type, listener });
  }

  #handlePointerDown(binding: CapturedBinding, event: PointerEvent): void {
    if (
      this.#disposed ||
      !pointerButtonIsSupported(event) ||
      this.#pointerOwners.has(event.pointerId)
    ) {
      return;
    }

    let pedalState: ActivePedalPointer | null = null;
    if (binding.kind === "PEDAL") {
      if (this.#activePointers(binding.id).size > 0) {
        return;
      }
      try {
        pedalState = {
          binding,
          originY: event.clientY,
          travelPx: resolvePointerPedalTravelPx(
            binding.target.getBoundingClientRect().height,
          ),
          value: 0,
        };
      } catch {
        return;
      }
    }

    event.preventDefault();
    event.stopPropagation();

    try {
      binding.target.setPointerCapture(event.pointerId);
    } catch {
      return;
    }

    this.#pointerOwners.set(event.pointerId, binding);
    const activePointers = this.#activePointers(binding.id);
    const wasActive = activePointers.size > 0;
    activePointers.add(event.pointerId);

    if (binding.kind === "STEERING") {
      this.#steeringTimeline.enqueueButton(
        binding.value,
        true,
        this.#safeTimestamp(binding),
        this.#sourceId(event.pointerId),
      );
      if (!wasActive) {
        this.#onControlStateChange?.(binding.id, true);
      }
      return;
    }

    if (pedalState !== null) {
      this.#pedalPointers.set(event.pointerId, pedalState);
      this.#onControlStateChange?.(binding.id, true, 0);
    }
  }

  #handlePedalMove(binding: PedalBinding, event: PointerEvent): void {
    if (
      this.#disposed ||
      this.#pointerOwners.get(event.pointerId) !== binding
    ) {
      return;
    }
    const state = this.#pedalPointers.get(event.pointerId);
    if (state === undefined) {
      return;
    }

    let value: number;
    try {
      value = resolvePointerPedalValue(
        event.clientY,
        state.originY,
        state.travelPx,
      );
    } catch {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (Math.abs(value - state.value) <= 1e-6) {
      return;
    }

    state.value = value;
    this.#enqueuePedalValue(
      binding,
      value,
      this.#safeTimestamp(binding),
      this.#sourceId(event.pointerId),
    );
    this.#onControlStateChange?.(binding.id, true, value);
  }

  #releasePointer(event: PointerEvent, releaseCapture: boolean): void {
    const binding = this.#pointerOwners.get(event.pointerId);
    if (binding === undefined) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.#pointerOwners.delete(event.pointerId);
    const activePointers = this.#activePointers(binding.id);
    activePointers.delete(event.pointerId);

    const timestampMs = this.#safeTimestamp(binding);
    const sourceId = this.#sourceId(event.pointerId);
    if (binding.kind === "STEERING") {
      this.#steeringTimeline.enqueueButton(
        binding.value,
        false,
        timestampMs,
        sourceId,
      );
    } else {
      this.#pedalPointers.delete(event.pointerId);
      this.#enqueuePedalValue(binding, 0, timestampMs, sourceId);
    }

    if (releaseCapture) {
      try {
        if (binding.target.hasPointerCapture(event.pointerId)) {
          binding.target.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Semantic release is already queued. Browser capture teardown may race
        // with pointercancel/lostpointercapture and must not re-arm input.
      }
    }

    if (activePointers.size === 0) {
      this.#onControlStateChange?.(
        binding.id,
        false,
        binding.kind === "PEDAL" ? 0 : undefined,
      );
    }
  }

  #toggleDirection(event: Event): void {
    if (this.#disposed) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.#driveDirection = this.#driveDirection === "D" ? "R" : "D";
    const timestampMs = Math.max(
      this.#now(),
      this.#longitudinalTimeline.cursorTimeMs,
    );

    for (const [pointerId, state] of this.#pedalPointers) {
      if (state.binding.pedal !== "THROTTLE" || state.value <= 1e-12) {
        continue;
      }
      this.#enqueuePedalValue(
        state.binding,
        state.value,
        timestampMs,
        this.#sourceId(pointerId),
      );
    }

    this.#onControlStateChange?.(
      "REVERSE",
      this.#driveDirection === "R",
      this.#driveDirection === "R" ? 1 : 0,
    );
  }

  #releaseAll(reason: InputReleaseReason): void {
    if (this.#pointerOwners.size === 0) {
      return;
    }

    const timestampByKind = new Map<"STEERING" | "LONGITUDINAL", number>();
    for (const [pointerId, binding] of this.#pointerOwners) {
      const timelineKind =
        binding.kind === "STEERING" ? "STEERING" : "LONGITUDINAL";
      const timestamp =
        timestampByKind.get(timelineKind) ?? this.#safeTimestamp(binding);
      timestampByKind.set(timelineKind, timestamp);
      const sourceId = this.#sourceId(pointerId);
      if (binding.kind === "STEERING") {
        this.#steeringTimeline.enqueueReleaseAll(timestamp, reason, sourceId);
      } else {
        this.#longitudinalTimeline.enqueueReleaseAll(
          timestamp,
          reason,
          sourceId,
        );
      }
      try {
        if (binding.target.hasPointerCapture(pointerId)) {
          binding.target.releasePointerCapture(pointerId);
        }
      } catch {
        // Capture state is already outside the semantic input contract.
      }
    }

    this.#pointerOwners.clear();
    this.#pedalPointers.clear();
    for (const binding of this.#bindings) {
      if (binding.kind === "DIRECTION") {
        continue;
      }
      const activePointers = this.#activePointers(binding.id);
      if (activePointers.size > 0) {
        activePointers.clear();
        this.#onControlStateChange?.(
          binding.id,
          false,
          binding.kind === "PEDAL" ? 0 : undefined,
        );
      }
    }
  }

  #enqueuePedalValue(
    binding: PedalBinding,
    value: number,
    timestampMs: number,
    sourceId: string,
  ): void {
    if (binding.pedal === "THROTTLE") {
      const direction = this.#driveDirection === "D" ? 1 : -1;
      this.#longitudinalTimeline.enqueueAnalogThrottle(
        value * direction,
        timestampMs,
        sourceId,
      );
    } else {
      this.#longitudinalTimeline.enqueueAnalogBrake(
        value,
        timestampMs,
        sourceId,
      );
    }
  }

  #safeTimestamp(binding: CapturedBinding): number {
    const cursorTimeMs =
      binding.kind === "STEERING"
        ? this.#steeringTimeline.cursorTimeMs
        : this.#longitudinalTimeline.cursorTimeMs;
    return Math.max(this.#now(), cursorTimeMs);
  }

  #sourceId(pointerId: number): string {
    return `${this.#sourceIdPrefix}:${pointerId}`;
  }

  #activePointers(control: PointerVehicleControlId): Set<number> {
    let active = this.#activePointersByControl.get(control);
    if (active === undefined) {
      active = new Set<number>();
      this.#activePointersByControl.set(control, active);
    }
    return active;
  }
}
