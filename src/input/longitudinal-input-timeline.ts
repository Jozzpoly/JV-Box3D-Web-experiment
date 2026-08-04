import type { InputReleaseReason } from "./raw-device-event.js";
import {
  longitudinalCommand,
  type LongitudinalCommand,
} from "./longitudinal-command.js";

export type LongitudinalControl = "FORWARD" | "REVERSE" | "BRAKE";

interface LongitudinalEventBase {
  readonly timestampMs: number;
  readonly sequence: number;
  readonly sourceId: string;
}

export interface LongitudinalButtonEvent extends LongitudinalEventBase {
  readonly kind: "LONGITUDINAL_BUTTON";
  readonly control: LongitudinalControl;
  readonly pressed: boolean;
}

export interface LongitudinalReleaseAllEvent extends LongitudinalEventBase {
  readonly kind: "RELEASE_ALL";
  readonly reason: InputReleaseReason;
}

export type RawLongitudinalEvent =
  | LongitudinalButtonEvent
  | LongitudinalReleaseAllEvent;

export interface LongitudinalTimelineSample {
  readonly startTimeMs: number;
  readonly endTimeMs: number;
  readonly command: LongitudinalCommand;
  readonly integratedThrottleMs: number;
  readonly integratedBrakeMs: number;
  readonly forwardPressedAtEnd: boolean;
  readonly reversePressedAtEnd: boolean;
  readonly brakePressedAtEnd: boolean;
  readonly consumedEvents: readonly RawLongitudinalEvent[];
}

function compareEvents(
  left: RawLongitudinalEvent,
  right: RawLongitudinalEvent,
): number {
  if (left.timestampMs !== right.timestampMs) {
    return left.timestampMs - right.timestampMs;
  }
  return left.sequence - right.sequence;
}

function assertFiniteTimestamp(timestampMs: number): void {
  if (!Number.isFinite(timestampMs)) {
    throw new RangeError("Input event timestamp must be finite.");
  }
}

export class LongitudinalInputTimeline {
  readonly #events: RawLongitudinalEvent[] = [];
  #nextSequence = 0;
  #cursorTimeMs: number;
  #forwardPressed = false;
  #reversePressed = false;
  #brakePressed = false;

  constructor(startTimeMs: number) {
    assertFiniteTimestamp(startTimeMs);
    this.#cursorTimeMs = startTimeMs;
  }

  get cursorTimeMs(): number {
    return this.#cursorTimeMs;
  }

  enqueueButton(
    control: LongitudinalControl,
    pressed: boolean,
    timestampMs: number,
    sourceId: string,
  ): void {
    assertFiniteTimestamp(timestampMs);
    this.#insertEvent({
      kind: "LONGITUDINAL_BUTTON",
      control,
      pressed,
      timestampMs,
      sourceId,
      sequence: this.#nextSequence++,
    });
  }

  enqueueReleaseAll(
    timestampMs: number,
    reason: InputReleaseReason,
    sourceId: string,
  ): void {
    assertFiniteTimestamp(timestampMs);
    this.#insertEvent({
      kind: "RELEASE_ALL",
      reason,
      timestampMs,
      sourceId,
      sequence: this.#nextSequence++,
    });
  }

  consumeInterval(
    startTimeMs: number,
    endTimeMs: number,
  ): LongitudinalTimelineSample {
    assertFiniteTimestamp(startTimeMs);
    assertFiniteTimestamp(endTimeMs);
    if (endTimeMs <= startTimeMs) {
      throw new RangeError("Input interval must have positive duration.");
    }
    if (Math.abs(startTimeMs - this.#cursorTimeMs) > 1e-7) {
      throw new Error(
        `Timeline interval must be contiguous. Expected ${this.#cursorTimeMs}, got ${startTimeMs}.`,
      );
    }

    const consumedEvents: RawLongitudinalEvent[] = [];
    let segmentStartMs = startTimeMs;
    let integratedThrottleMs = 0;
    let integratedBrakeMs = 0;

    while (this.#events.length > 0) {
      const event = this.#events[0];
      if (event === undefined || event.timestampMs >= endTimeMs) {
        break;
      }

      this.#events.shift();
      const clampedEventTimeMs = Math.max(
        segmentStartMs,
        event.timestampMs,
      );
      const durationMs = clampedEventTimeMs - segmentStartMs;
      integratedThrottleMs += this.#currentThrottle() * durationMs;
      integratedBrakeMs += this.#currentBrake() * durationMs;
      segmentStartMs = clampedEventTimeMs;
      this.#applyEvent(event);
      consumedEvents.push(event);
    }

    const tailDurationMs = endTimeMs - segmentStartMs;
    integratedThrottleMs += this.#currentThrottle() * tailDurationMs;
    integratedBrakeMs += this.#currentBrake() * tailDurationMs;
    this.#cursorTimeMs = endTimeMs;

    const intervalDurationMs = endTimeMs - startTimeMs;
    return {
      startTimeMs,
      endTimeMs,
      command: longitudinalCommand(
        integratedThrottleMs / intervalDurationMs,
        integratedBrakeMs / intervalDurationMs,
      ),
      integratedThrottleMs,
      integratedBrakeMs,
      forwardPressedAtEnd: this.#forwardPressed,
      reversePressedAtEnd: this.#reversePressed,
      brakePressedAtEnd: this.#brakePressed,
      consumedEvents,
    };
  }

  skipInterval(startTimeMs: number, endTimeMs: number): void {
    this.consumeInterval(startTimeMs, endTimeMs);
  }

  #insertEvent(event: RawLongitudinalEvent): void {
    if (event.timestampMs < this.#cursorTimeMs - 1e-7) {
      throw new Error(
        `Cannot enqueue input event in the consumed past (${event.timestampMs} < ${this.#cursorTimeMs}).`,
      );
    }

    const insertionIndex = this.#events.findIndex(
      (candidate) => compareEvents(event, candidate) < 0,
    );
    if (insertionIndex === -1) {
      this.#events.push(event);
    } else {
      this.#events.splice(insertionIndex, 0, event);
    }
  }

  #applyEvent(event: RawLongitudinalEvent): void {
    if (event.kind === "RELEASE_ALL") {
      this.#forwardPressed = false;
      this.#reversePressed = false;
      this.#brakePressed = false;
      return;
    }

    switch (event.control) {
      case "FORWARD":
        this.#forwardPressed = event.pressed;
        break;
      case "REVERSE":
        this.#reversePressed = event.pressed;
        break;
      case "BRAKE":
        this.#brakePressed = event.pressed;
        break;
    }
  }

  #currentThrottle(): number {
    const forward = this.#forwardPressed ? 1 : 0;
    const reverse = this.#reversePressed ? 1 : 0;
    return forward - reverse;
  }

  #currentBrake(): number {
    return this.#brakePressed ? 1 : 0;
  }
}
