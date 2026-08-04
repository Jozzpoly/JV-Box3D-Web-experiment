import type {
  LongitudinalControl,
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

export interface PointerControlTarget extends EventTarget {
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
  hasPointerCapture(pointerId: number): boolean;
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
  ) => void;
}

type ControlBinding = Readonly<
  | {
      id: "STEER_LEFT" | "STEER_RIGHT";
      kind: "STEERING";
      value: SteeringSide;
      target: PointerControlTarget;
    }
  | {
      id: "FORWARD" | "REVERSE" | "BRAKE";
      kind: "LONGITUDINAL";
      value: LongitudinalControl;
      target: PointerControlTarget;
    }
>;

interface InstalledListener {
  readonly target: EventTarget;
  readonly type: string;
  readonly listener: EventListener;
}

function pointerButtonIsSupported(event: PointerEvent): boolean {
  return event.button === 0 || event.button === -1;
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
    | ((control: PointerVehicleControlId, active: boolean) => void)
    | undefined;
  readonly #bindings: readonly ControlBinding[];
  readonly #listeners: InstalledListener[] = [];
  readonly #pointerOwners = new Map<number, ControlBinding>();
  readonly #activePointersByControl = new Map<
    PointerVehicleControlId,
    Set<number>
  >();
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
        kind: "LONGITUDINAL",
        value: "FORWARD",
        target: options.controls.forward,
      },
      {
        id: "REVERSE",
        kind: "LONGITUDINAL",
        value: "REVERSE",
        target: options.controls.reverse,
      },
      {
        id: "BRAKE",
        kind: "LONGITUDINAL",
        value: "BRAKE",
        target: options.controls.brake,
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
    const onPointerDown: EventListener = (event) => {
      this.#handlePointerDown(binding, event as PointerEvent);
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

  #handlePointerDown(binding: ControlBinding, event: PointerEvent): void {
    if (
      this.#disposed ||
      !pointerButtonIsSupported(event) ||
      this.#pointerOwners.has(event.pointerId)
    ) {
      return;
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
    this.#enqueueButton(
      binding,
      true,
      this.#safeTimestamp(binding),
      this.#sourceId(event.pointerId),
    );
    if (!wasActive) {
      this.#onControlStateChange?.(binding.id, true);
    }
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
    this.#enqueueButton(
      binding,
      false,
      this.#safeTimestamp(binding),
      this.#sourceId(event.pointerId),
    );

    if (releaseCapture) {
      try {
        if (binding.target.hasPointerCapture(event.pointerId)) {
          binding.target.releasePointerCapture(event.pointerId);
        }
      } catch {
        // The semantic release is already queued. Browser capture teardown may
        // race with pointercancel/lostpointercapture and must not re-arm input.
      }
    }

    if (activePointers.size === 0) {
      this.#onControlStateChange?.(binding.id, false);
    }
  }

  #releaseAll(reason: InputReleaseReason): void {
    if (this.#pointerOwners.size === 0) {
      return;
    }

    const timestampByKind = new Map<ControlBinding["kind"], number>();
    for (const [pointerId, binding] of this.#pointerOwners) {
      const timestamp =
        timestampByKind.get(binding.kind) ?? this.#safeTimestamp(binding);
      timestampByKind.set(binding.kind, timestamp);
      this.#enqueueReleaseAll(
        binding,
        timestamp,
        reason,
        this.#sourceId(pointerId),
      );
      try {
        if (binding.target.hasPointerCapture(pointerId)) {
          binding.target.releasePointerCapture(pointerId);
        }
      } catch {
        // Capture state is already outside the semantic input contract.
      }
    }

    this.#pointerOwners.clear();
    for (const binding of this.#bindings) {
      const activePointers = this.#activePointers(binding.id);
      if (activePointers.size > 0) {
        activePointers.clear();
        this.#onControlStateChange?.(binding.id, false);
      }
    }
  }

  #enqueueButton(
    binding: ControlBinding,
    pressed: boolean,
    timestampMs: number,
    sourceId: string,
  ): void {
    if (binding.kind === "STEERING") {
      this.#steeringTimeline.enqueueButton(
        binding.value,
        pressed,
        timestampMs,
        sourceId,
      );
    } else {
      this.#longitudinalTimeline.enqueueButton(
        binding.value,
        pressed,
        timestampMs,
        sourceId,
      );
    }
  }

  #enqueueReleaseAll(
    binding: ControlBinding,
    timestampMs: number,
    reason: InputReleaseReason,
    sourceId: string,
  ): void {
    if (binding.kind === "STEERING") {
      this.#steeringTimeline.enqueueReleaseAll(
        timestampMs,
        reason,
        sourceId,
      );
    } else {
      this.#longitudinalTimeline.enqueueReleaseAll(
        timestampMs,
        reason,
        sourceId,
      );
    }
  }

  #safeTimestamp(binding: ControlBinding): number {
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
