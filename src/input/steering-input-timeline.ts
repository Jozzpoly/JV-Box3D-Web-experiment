import type {
  InputReleaseReason,
  RawDeviceEvent,
  SteeringSide,
} from "./raw-device-event.js";
import {
  RELEASE_STEERING,
  rateSteering,
  type SteeringCommand,
} from "./steering-command.js";

export interface SteeringTimelineSample {
  readonly startTimeMs: number;
  readonly endTimeMs: number;
  readonly command: SteeringCommand;
  readonly integratedDirectionMs: number;
  readonly leftPressedAtEnd: boolean;
  readonly rightPressedAtEnd: boolean;
  readonly consumedEvents: readonly RawDeviceEvent[];
}

function compareEvents(left: RawDeviceEvent, right: RawDeviceEvent): number {
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

export class SteeringInputTimeline {
  readonly #events: RawDeviceEvent[] = [];
  readonly #leftSources = new Set<string>();
  readonly #rightSources = new Set<string>();
  #nextSequence = 0;
  #cursorTimeMs: number;

  constructor(startTimeMs: number) {
    assertFiniteTimestamp(startTimeMs);
    this.#cursorTimeMs = startTimeMs;
  }

  get cursorTimeMs(): number {
    return this.#cursorTimeMs;
  }

  enqueueButton(
    side: SteeringSide,
    pressed: boolean,
    timestampMs: number,
    sourceId: string,
  ): void {
    assertFiniteTimestamp(timestampMs);
    this.#insertEvent({
      kind: "STEERING_BUTTON",
      side,
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

  consumeInterval(startTimeMs: number, endTimeMs: number): SteeringTimelineSample {
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

    const consumedEvents: RawDeviceEvent[] = [];
    let segmentStartMs = startTimeMs;
    let integratedDirectionMs = 0;

    while (this.#events.length > 0) {
      const event = this.#events[0];
      if (event === undefined || event.timestampMs >= endTimeMs) {
        break;
      }

      this.#events.shift();
      const clampedEventTimeMs = Math.max(segmentStartMs, event.timestampMs);
      integratedDirectionMs +=
        this.#currentDirection() * (clampedEventTimeMs - segmentStartMs);
      segmentStartMs = clampedEventTimeMs;
      this.#applyEvent(event);
      consumedEvents.push(event);
    }

    integratedDirectionMs += this.#currentDirection() * (endTimeMs - segmentStartMs);
    this.#cursorTimeMs = endTimeMs;

    const durationMs = endTimeMs - startTimeMs;
    const averageDirection = integratedDirectionMs / durationMs;
    const command =
      Math.abs(averageDirection) <= 1e-12
        ? RELEASE_STEERING
        : rateSteering(averageDirection);

    return {
      startTimeMs,
      endTimeMs,
      command,
      integratedDirectionMs,
      leftPressedAtEnd: this.#leftSources.size > 0,
      rightPressedAtEnd: this.#rightSources.size > 0,
      consumedEvents,
    };
  }

  skipInterval(startTimeMs: number, endTimeMs: number): void {
    this.consumeInterval(startTimeMs, endTimeMs);
  }

  #insertEvent(event: RawDeviceEvent): void {
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

  #applyEvent(event: RawDeviceEvent): void {
    if (event.kind === "RELEASE_ALL") {
      this.#leftSources.delete(event.sourceId);
      this.#rightSources.delete(event.sourceId);
      return;
    }

    const sources =
      event.side === "LEFT" ? this.#leftSources : this.#rightSources;
    if (event.pressed) {
      sources.add(event.sourceId);
    } else {
      sources.delete(event.sourceId);
    }
  }

  #currentDirection(): number {
    const left = this.#leftSources.size > 0 ? 1 : 0;
    const right = this.#rightSources.size > 0 ? 1 : 0;
    return left - right;
  }
}
