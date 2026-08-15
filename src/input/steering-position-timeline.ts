import type { InputReleaseReason } from "./raw-device-event.js";
import {
  positionSteering,
  RELEASE_STEERING,
  type SteeringCommand,
} from "./steering-command.js";

interface SteeringPositionEventBase {
  readonly timestampMs: number;
  readonly sequence: number;
  readonly sourceId: string;
}

export interface SteeringPositionEvent extends SteeringPositionEventBase {
  readonly kind: "STEERING_POSITION";
  readonly value: number;
}

export interface SteeringPositionReleaseEvent extends SteeringPositionEventBase {
  readonly kind: "STEERING_POSITION_RELEASE";
  readonly reason: InputReleaseReason;
}

export type RawSteeringPositionEvent =
  | SteeringPositionEvent
  | SteeringPositionReleaseEvent;

export interface SteeringPositionTimelineSample {
  readonly startTimeMs: number;
  readonly endTimeMs: number;
  readonly command: SteeringCommand;
  readonly activeSourceIdAtEnd: string | null;
  readonly positionAtEnd: number;
  readonly consumedEvents: readonly RawSteeringPositionEvent[];
}

type ActivePositionSource = Readonly<{
  value: number;
  sequence: number;
}>;

function compareEvents(
  left: RawSteeringPositionEvent,
  right: RawSteeringPositionEvent,
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

export class SteeringPositionTimeline {
  readonly #events: RawSteeringPositionEvent[] = [];
  readonly #activeSources = new Map<string, ActivePositionSource>();
  #nextSequence = 0;
  #cursorTimeMs: number;

  constructor(startTimeMs: number) {
    assertFiniteTimestamp(startTimeMs);
    this.#cursorTimeMs = startTimeMs;
  }

  get cursorTimeMs(): number {
    return this.#cursorTimeMs;
  }

  enqueuePosition(
    value: number,
    timestampMs: number,
    sourceId: string,
  ): void {
    assertFiniteTimestamp(timestampMs);
    const normalized = positionSteering(value);
    if (normalized.mode !== "POSITION") {
      throw new Error("Position steering normalization failed.");
    }
    this.#insertEvent({
      kind: "STEERING_POSITION",
      value: normalized.value,
      timestampMs,
      sourceId,
      sequence: this.#nextSequence++,
    });
  }

  enqueueRelease(
    timestampMs: number,
    reason: InputReleaseReason,
    sourceId: string,
  ): void {
    assertFiniteTimestamp(timestampMs);
    this.#insertEvent({
      kind: "STEERING_POSITION_RELEASE",
      reason,
      timestampMs,
      sourceId,
      sequence: this.#nextSequence++,
    });
  }

  consumeInterval(
    startTimeMs: number,
    endTimeMs: number,
  ): SteeringPositionTimelineSample {
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

    const consumedEvents: RawSteeringPositionEvent[] = [];
    while (this.#events.length > 0) {
      const event = this.#events[0];
      if (event === undefined || event.timestampMs >= endTimeMs) {
        break;
      }
      this.#events.shift();
      this.#applyEvent(event);
      consumedEvents.push(event);
    }
    this.#cursorTimeMs = endTimeMs;

    const active = this.#latestActiveSource();
    const positionAtEnd = active?.state.value ?? 0;
    return {
      startTimeMs,
      endTimeMs,
      command:
        active === null
          ? RELEASE_STEERING
          : positionSteering(positionAtEnd),
      activeSourceIdAtEnd: active?.sourceId ?? null,
      positionAtEnd,
      consumedEvents,
    };
  }

  skipInterval(startTimeMs: number, endTimeMs: number): void {
    this.consumeInterval(startTimeMs, endTimeMs);
  }

  #insertEvent(event: RawSteeringPositionEvent): void {
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

  #applyEvent(event: RawSteeringPositionEvent): void {
    if (event.kind === "STEERING_POSITION_RELEASE") {
      this.#activeSources.delete(event.sourceId);
      return;
    }
    this.#activeSources.set(event.sourceId, {
      value: event.value,
      sequence: event.sequence,
    });
  }

  #latestActiveSource(): Readonly<{
    sourceId: string;
    state: ActivePositionSource;
  }> | null {
    let latest: Readonly<{
      sourceId: string;
      state: ActivePositionSource;
    }> | null = null;
    for (const [sourceId, state] of this.#activeSources) {
      if (latest === null || state.sequence > latest.state.sequence) {
        latest = { sourceId, state };
      }
    }
    return latest;
  }
}
