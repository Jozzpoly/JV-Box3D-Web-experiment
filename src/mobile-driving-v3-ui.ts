export type MobileDrivingPedal = "THROTTLE" | "BRAKE";
export type MobileDrivingDirection = "D" | "R";

export interface MobileDrivingV3UiTargets {
  readonly steering: HTMLElement;
  readonly throttle: HTMLButtonElement;
  readonly brake: HTMLButtonElement;
  readonly direction: HTMLButtonElement;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function clampSigned(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-1, Math.min(1, value));
}

export class MobileDrivingV3Ui {
  readonly #steering: HTMLElement;
  readonly #throttle: HTMLButtonElement;
  readonly #brake: HTMLButtonElement;
  readonly #direction: HTMLButtonElement;

  constructor(targets: MobileDrivingV3UiTargets) {
    this.#steering = targets.steering;
    this.#throttle = targets.throttle;
    this.#brake = targets.brake;
    this.#direction = targets.direction;
    this.setSteeringState(0, false);
    this.setPedalState("THROTTLE", 0, false);
    this.setPedalState("BRAKE", 0, false);
    this.setDirection("D");
  }

  setSteeringState(value: number, active: boolean): void {
    const normalized = clampSigned(value);
    const magnitude = Math.round(Math.abs(normalized) * 100);
    const side = normalized > 0 ? "L" : normalized < 0 ? "R" : "CENTER";

    this.#steering.style.setProperty(
      "--steering-angle",
      `${(-normalized * 126).toFixed(2)}deg`,
    );
    this.#steering.style.setProperty(
      "--steering-strength",
      Math.abs(normalized).toFixed(4),
    );
    this.#steering.toggleAttribute("data-active", active);
    this.#steering.setAttribute("aria-valuenow", String(Math.round(normalized * 100)));
    this.#steering.setAttribute(
      "aria-valuetext",
      normalized === 0 ? "CENTER" : `${side} ${magnitude}%`,
    );

    const readout = this.#steering.querySelector<HTMLElement>("[data-steering-value]");
    if (readout !== null) {
      readout.textContent = normalized === 0 ? "CENTER" : `${side} ${magnitude}`;
    }
  }

  setPedalState(pedal: MobileDrivingPedal, value: number, active: boolean): void {
    const target = pedal === "THROTTLE" ? this.#throttle : this.#brake;
    const normalized = clamp01(value);
    const percentage = Math.round(normalized * 100);

    target.style.setProperty("--pedal-value", normalized.toFixed(4));
    target.style.setProperty("--pedal-fill", `${(normalized * 100).toFixed(1)}%`);
    target.style.setProperty("--pedal-face-shift", `${(normalized * 8).toFixed(2)}px`);
    target.toggleAttribute("data-active", active);
    target.setAttribute("aria-valuenow", String(percentage));
    target.setAttribute("aria-valuetext", `${percentage}%`);

    const readout = target.querySelector<HTMLElement>("[data-pedal-value]");
    if (readout !== null) readout.textContent = `${percentage}%`;
    this.#syncPedalPeers();
  }

  setDirection(direction: MobileDrivingDirection): void {
    const reverse = direction === "R";
    this.#direction.setAttribute("data-direction", direction);
    this.#direction.setAttribute("aria-pressed", String(reverse));
    this.#direction.setAttribute(
      "aria-label",
      `Drive direction ${direction}. Tap to switch D/R.`,
    );

    for (const option of Array.from(
      this.#direction.querySelectorAll<HTMLElement>("[data-direction-option]"),
    )) {
      option.toggleAttribute(
        "data-selected",
        option.getAttribute("data-direction-option") === direction,
      );
    }
  }

  resetTransientState(): void {
    this.setSteeringState(0, false);
    this.setPedalState("THROTTLE", 0, false);
    this.setPedalState("BRAKE", 0, false);
  }

  #syncPedalPeers(): void {
    const throttleActive = this.#throttle.hasAttribute("data-active");
    const brakeActive = this.#brake.hasAttribute("data-active");
    this.#throttle.toggleAttribute("data-peer-active", brakeActive && !throttleActive);
    this.#brake.toggleAttribute("data-peer-active", throttleActive && !brakeActive);
  }
}
