import type {
  LongitudinalControl,
  LongitudinalInputTimeline,
} from "./longitudinal-input-timeline.js";

export interface KeyboardLongitudinalAdapterOptions {
  readonly windowTarget: EventTarget;
  readonly documentTarget: EventTarget;
  readonly timeline: LongitudinalInputTimeline;
  readonly now: () => number;
  readonly isDocumentHidden: () => boolean;
  readonly sourceId?: string;
}

const KEY_CONTROL: Readonly<Record<string, LongitudinalControl>> =
  Object.freeze({
    KeyW: "FORWARD",
    ArrowUp: "FORWARD",
    KeyS: "REVERSE",
    ArrowDown: "REVERSE",
    Space: "BRAKE",
  });

export class KeyboardLongitudinalAdapter {
  readonly #windowTarget: EventTarget;
  readonly #documentTarget: EventTarget;
  readonly #timeline: LongitudinalInputTimeline;
  readonly #now: () => number;
  readonly #isDocumentHidden: () => boolean;
  readonly #sourceId: string;
  readonly #pressedCodes = new Set<string>();
  #disposed = false;

  readonly #onKeyDown: EventListener = (event) => {
    const keyboardEvent = event as KeyboardEvent;
    const control = KEY_CONTROL[keyboardEvent.code];
    if (
      control === undefined ||
      this.#pressedCodes.has(keyboardEvent.code)
    ) {
      return;
    }

    const wasControlActive = this.#isControlActive(control);
    this.#pressedCodes.add(keyboardEvent.code);
    if (!wasControlActive) {
      this.#timeline.enqueueButton(
        control,
        true,
        this.#now(),
        this.#sourceId,
      );
    }
    keyboardEvent.preventDefault();
  };

  readonly #onKeyUp: EventListener = (event) => {
    const keyboardEvent = event as KeyboardEvent;
    const control = KEY_CONTROL[keyboardEvent.code];
    if (
      control === undefined ||
      !this.#pressedCodes.delete(keyboardEvent.code)
    ) {
      return;
    }

    if (!this.#isControlActive(control)) {
      this.#timeline.enqueueButton(
        control,
        false,
        this.#now(),
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

  constructor(options: KeyboardLongitudinalAdapterOptions) {
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
    this.#documentTarget.addEventListener(
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
    this.#windowTarget.removeEventListener("keydown", this.#onKeyDown);
    this.#windowTarget.removeEventListener("keyup", this.#onKeyUp);
    this.#windowTarget.removeEventListener("blur", this.#onBlur);
    this.#windowTarget.removeEventListener("pagehide", this.#onPageHide);
    this.#documentTarget.removeEventListener(
      "visibilitychange",
      this.#onVisibilityChange,
    );
  }

  #isControlActive(control: LongitudinalControl): boolean {
    for (const code of this.#pressedCodes) {
      if (KEY_CONTROL[code] === control) {
        return true;
      }
    }
    return false;
  }

  #releaseAll(
    reason: "BLUR" | "VISIBILITY_HIDDEN" | "PAGE_HIDE" | "DISPOSE",
  ): void {
    if (this.#pressedCodes.size === 0) {
      return;
    }

    this.#pressedCodes.clear();
    this.#timeline.enqueueReleaseAll(
      this.#now(),
      reason,
      this.#sourceId,
    );
  }
}
