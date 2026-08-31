export type MobileDrivingPedal = "THROTTLE" | "BRAKE";
export type MobileDrivingDirection = "D" | "R";

export interface MobileDrivingStyleTarget {
  readonly style: {
    setProperty(name: string, value: string): void;
  };
  toggleAttribute(name: string, force?: boolean): boolean;
  setAttribute(name: string, value: string): void;
}

export interface MobileDrivingUiTargets {
  readonly steering: MobileDrivingStyleTarget;
  readonly throttle: MobileDrivingStyleTarget;
  readonly brake: MobileDrivingStyleTarget;
  readonly direction: MobileDrivingStyleTarget;
}

export interface MobileDrivingFrameScheduler {
  request(callback: FrameRequestCallback): number;
  cancel(handle: number): void;
}

interface MobileDrivingPresentationState {
  steering: number;
  steeringActive: boolean;
  throttle: number;
  throttleActive: boolean;
  brake: number;
  brakeActive: boolean;
  direction: MobileDrivingDirection;
}

const DEFAULT_STEERING_WHEEL_LOCK_DEGREES = 450;

const NEUTRAL_STATE: Readonly<MobileDrivingPresentationState> = Object.freeze({
  steering: 0,
  steeringActive: false,
  throttle: 0,
  throttleActive: false,
  brake: 0,
  brakeActive: false,
  direction: "D",
});

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function clampSigned(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(-1, Math.min(1, value));
}

function cloneNeutralState(): MobileDrivingPresentationState {
  return { ...NEUTRAL_STATE };
}

export class MobileDrivingUi {
  readonly #targets: MobileDrivingUiTargets;
  readonly #frames: MobileDrivingFrameScheduler;
  #generation = 0;
  #state = cloneNeutralState();
  #frameHandle = 0;
  #dirty = false;
  #disposed = false;

  constructor(
    targets: MobileDrivingUiTargets,
    frames: MobileDrivingFrameScheduler,
  ) {
    this.#targets = targets;
    this.#frames = frames;
    this.#commit();
  }

  get generation(): number {
    return this.#generation;
  }

  beginGeneration(generation: number): void {
    if (!Number.isInteger(generation) || generation <= this.#generation) {
      throw new RangeError(
        `Mobile driving generation must increase monotonically (${generation} <= ${this.#generation}).`,
      );
    }
    if (this.#disposed) {
      return;
    }
    this.#generation = generation;
    this.#state = cloneNeutralState();
    this.#dirty = false;
    if (this.#frameHandle !== 0) {
      this.#frames.cancel(this.#frameHandle);
      this.#frameHandle = 0;
    }
    this.#commit();
  }

  setSteering(
    generation: number,
    value: number,
    active: boolean,
  ): void {
    if (!this.#acceptGeneration(generation)) {
      return;
    }
    this.#state.steering = clampSigned(value);
    this.#state.steeringActive = active;
    this.#schedule();
  }

  setPedal(
    generation: number,
    pedal: MobileDrivingPedal,
    value: number,
    active: boolean,
  ): void {
    if (!this.#acceptGeneration(generation)) {
      return;
    }
    const normalized = clamp01(value);
    if (pedal === "THROTTLE") {
      this.#state.throttle = normalized;
      this.#state.throttleActive = active;
    } else {
      this.#state.brake = normalized;
      this.#state.brakeActive = active;
    }
    this.#schedule();
  }

  setDirection(
    generation: number,
    direction: MobileDrivingDirection,
  ): void {
    if (!this.#acceptGeneration(generation)) {
      return;
    }
    this.#state.direction = direction;
    this.#schedule();
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    if (this.#frameHandle !== 0) {
      this.#frames.cancel(this.#frameHandle);
      this.#frameHandle = 0;
    }
    this.#dirty = false;
  }

  #acceptGeneration(generation: number): boolean {
    return !this.#disposed && generation === this.#generation;
  }

  #schedule(): void {
    this.#dirty = true;
    if (this.#frameHandle !== 0) {
      return;
    }
    this.#frameHandle = this.#frames.request(() => {
      this.#frameHandle = 0;
      if (this.#disposed || !this.#dirty) {
        return;
      }
      this.#dirty = false;
      this.#commit();
    });
  }

  #commit(): void {
    const steering = this.#state.steering;
    const steeringMagnitude = Math.round(Math.abs(steering) * 100);
    this.#targets.steering.style.setProperty(
      "--steering-angle",
      `${(-steering * DEFAULT_STEERING_WHEEL_LOCK_DEGREES).toFixed(2)}deg`,
    );
    this.#targets.steering.style.setProperty(
      "--steering-strength",
      Math.abs(steering).toFixed(4),
    );
    this.#targets.steering.toggleAttribute(
      "data-active",
      this.#state.steeringActive,
    );
    this.#targets.steering.setAttribute(
      "aria-valuenow",
      String(Math.round(steering * 100)),
    );
    this.#targets.steering.setAttribute(
      "aria-valuetext",
      steering > 0
        ? `LEFT ${steeringMagnitude}%`
        : steering < 0
          ? `RIGHT ${steeringMagnitude}%`
          : "CENTER",
    );

    this.#commitPedal(
      this.#targets.throttle,
      this.#state.throttle,
      this.#state.throttleActive,
      this.#state.brakeActive && !this.#state.throttleActive,
    );
    this.#commitPedal(
      this.#targets.brake,
      this.#state.brake,
      this.#state.brakeActive,
      this.#state.throttleActive && !this.#state.brakeActive,
    );

    const reverse = this.#state.direction === "R";
    this.#targets.direction.setAttribute(
      "data-direction",
      this.#state.direction,
    );
    this.#targets.direction.setAttribute("aria-pressed", String(reverse));
    this.#targets.direction.setAttribute(
      "aria-label",
      `Drive direction ${this.#state.direction}. Tap to switch D/R.`,
    );
  }

  #commitPedal(
    target: MobileDrivingStyleTarget,
    value: number,
    active: boolean,
    peerActive: boolean,
  ): void {
    const percentage = Math.round(value * 100);
    target.style.setProperty("--pedal-value", value.toFixed(4));
    target.toggleAttribute("data-active", active);
    target.toggleAttribute("data-peer-active", peerActive);
    target.setAttribute("aria-valuenow", String(percentage));
    target.setAttribute("aria-valuetext", `${percentage}%`);
  }
}
