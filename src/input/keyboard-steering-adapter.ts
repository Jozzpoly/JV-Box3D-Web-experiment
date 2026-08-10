import type { SteeringInputTimeline } from "./steering-input-timeline.js";
import type { SteeringSide } from "./raw-device-event.js";

export interface KeyboardSteeringAdapterOptions {
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly timeline: SteeringInputTimeline;
  readonly now: () => number;
  readonly isDocumentHidden: () => boolean;
  readonly sourceId?: string;
}

const KEY_SIDE: Readonly<Record<string, SteeringSide>> = Object.freeze({
  KeyA: "LEFT",
  ArrowLeft: "LEFT",
  KeyD: "RIGHT",
  ArrowRight: "RIGHT",
});

export class KeyboardSteeringAdapter {
  readonly #windowTarget: EventTarget;
  readonly #documentTarget: EventTarget;
  readonly #timeline: SteeringInputTimeline;
  readonly #now: () => number;
  readonly #isDocumentHidden: () => boolean;
  readonly #sourceId: string;
  readonly #pressedCodes = new Set<string>();
  #disposed = false;

  readonly #onKeyDown: EventListener = (event) => {
    const keyboardEvent = event as KeyboardEvent;
    const side = KEY_SIDE[keyboardEvent.code];
    if (side === undefined || this.#pressedCodes.has(keyboardEvent.code)) {
      return;
    }

    const wasSideActive = this.#isSideActive(side);
    this.#pressedCodes.add(keyboardEvent.code);
    if (!wasSideActive) {
      this.#timeline.enqueueButton(
        side,
        true,
        this.#safeTimestamp(),
        this.#sourceId,
      );
    }
    keyboardEvent.preventDefault();
  };

  readonly #onKeyUp: EventListener = (event) => {
    const keyboardEvent = event as KeyboardEvent;
    const side = KEY_SIDE[keyboardEvent.code];
    if (side === undefined || !this.#pressedCodes.delete(keyboardEvent.code)) {
      return;
    }

    if (!this.#isSideActive(side)) {
      this.#timeline.enqueueButton(
        side,
        false,
        this.#safeTimestamp(),
        this.#sourceId,
      );
    }
    keyboardEvent.preventDefault();
  };

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

  constructor(options: KeyboardSteeringAdapterOptions) {
    this.#windowTarget = options.windowTarget;
    this.#documentTarget = options.documentTarget;
    this.#timeline = options.timeline;
    this.#now = options.now;
    this.#isDocumentHidden = options.isDocumentHidden;
    this.#sourceId = options.sourceId ?? "keyboard";

    this.#windowTarget.addEventListener("keydown", this.#onKeyDown);
    this.#windowTarget.addEventListener("keyup", this.#onKeyUp);
    this.#windowTarget.addEventListener("blur", this.#onBlur);
    this.#windowTarget.addEventListener("pagehide", this.#onPageHide);
    this.#documentTarget.addEventListener("visibilitychange", this.#onVisibilityChange);
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#releaseAll("DISPOSE");
    this.#windowTarget.removeEventListener("keydown", this.#onKeyDown);
    this.#windowTarget.removeEventListener("keyup", this.#onKeyUp);
    this.#windowTarget.removeEventListener("blur", this.#onBlur);
    this.#windowTarget.removeEventListener("pagehide", this.#onPageHide);
    this.#documentTarget.removeEventListener("visibilitychange", this.#onVisibilityChange);
  }

  #isSideActive(side: SteeringSide): boolean {
    for (const code of this.#pressedCodes) {
      if (KEY_SIDE[code] === side) {
        return true;
      }
    }
    return false;
  }

  #safeTimestamp(): number {
    return Math.max(this.#now(), this.#timeline.cursorTimeMs);
  }

  #releaseAll(reason: "BLUR" | "VISIBILITY_HIDDEN" | "PAGE_HIDE" | "DISPOSE"): void {
    if (this.#pressedCodes.size === 0) {
      return;
    }

    this.#pressedCodes.clear();
    this.#timeline.enqueueReleaseAll(
      this.#safeTimestamp(),
      reason,
      this.#sourceId,
    );
  }
}