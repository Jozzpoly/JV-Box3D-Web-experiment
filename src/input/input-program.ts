// Input program (2026-11-21, Opus Code): one drive, step by step, that a JV window replays from the same start on the
// fixed physics step. The need in the owner's own words (2026-11-21): the same input on two windows, to see how other
// settings, another rig, another power react. Two windows that replay one program from the same start differ only by
// their knobs, so whatever differs in what they did is the knobs' doing.
//
// Format "wejscie/1": plain JSON with Polish field names, like the rest of the Jaskinia window contract.
//   { schemat: "wejscie/1", nazwa?: string, odcinki: [ { s | kroki, gaz?, hamulec?, skret? | skret_tempo? }, ... ] }
//   - s: how long, in seconds (> 0), rounded to whole physics steps; kroki: how long, in whole physics steps (a recording
//     uses this, so its replay is exact). Exactly one of the two.
//   - gaz: throttle in [-1, 1] (negative drives in reverse), default 0. hamulec: brake in [0, 1], default 0.
//   - skret: steering wheel position in [-1, 1] (like the on-screen wheel); skret_tempo: steering rate in [-1, 1] (like
//     the A/D keys). Neither: steering released. At most one of the two.
// Unknown fields are skipped (the window contract's rule). A value outside its range is refused with a reason, never
// clipped quietly. Limits: 5 minutes and 20 000 segments.

import {
  RELEASE_STEERING,
  type SteeringCommand,
} from "./steering-command.js";
import type { LongitudinalCommand } from "./longitudinal-command.js";

export const INPUT_PROGRAM_SCHEMA = "wejscie/1";
/** The product's fixed physics step (clean-browser-host.ts: 1000 / 60 ms). A program counts in these steps. */
export const PROGRAM_STEPS_PER_SECOND = 60;
export const PROGRAM_MAX_STEPS = 5 * 60 * PROGRAM_STEPS_PER_SECOND;
export const PROGRAM_MAX_SEGMENTS = 20_000;
export const PROGRAM_MAX_NAME = 80;

export interface InputProgramSegment {
  readonly s?: number;
  readonly kroki?: number;
  readonly gaz?: number;
  readonly hamulec?: number;
  readonly skret?: number;
  readonly skret_tempo?: number;
}

export interface InputProgram {
  readonly schemat: typeof INPUT_PROGRAM_SCHEMA;
  readonly nazwa?: string;
  readonly odcinki: readonly InputProgramSegment[];
}

export interface ProgramStepCommands {
  readonly steering: SteeringCommand;
  readonly longitudinal: LongitudinalCommand;
}

export interface ParsedProgramSegment {
  readonly steps: number;
  readonly commands: ProgramStepCommands;
}

export interface ParsedInputProgram {
  readonly name: string;
  readonly totalSteps: number;
  /** Adjacent segments that drive alike are merged: two texts of the same drive give the same segments. */
  readonly segments: readonly ParsedProgramSegment[];
  /** Identity of the drive (not of its text or name): equal digests mean step-for-step equal input. Not cryptographic. */
  readonly digest: string;
}

export class InputProgramError extends Error {
  override readonly name = "InputProgramError";
}

/** cyrb53: a small, fast, well-mixed 53-bit string hash, as 14 hex digits. An identity tag, not a security measure. */
export function identityHash(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
}

export function sameStepCommands(a: ProgramStepCommands, b: ProgramStepCommands): boolean {
  if (a.longitudinal.throttle !== b.longitudinal.throttle || a.longitudinal.brake !== b.longitudinal.brake) {
    return false;
  }
  if (a.steering.mode !== b.steering.mode) return false;
  return a.steering.mode === "RELEASE" || a.steering.value === (b.steering as { readonly value: number }).value;
}

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

function rangeField(
  segment: Record<string, unknown>,
  field: string,
  min: number,
  max: number,
  where: string,
): number | undefined {
  const value = segment[field];
  if (value === undefined) return undefined;
  if (!isNumber(value) || value < min || value > max) {
    throw new InputProgramError(`${where}: ${field} musi być liczbą w [${String(min)}, ${String(max)}], jest ${JSON.stringify(value) ?? String(value)}`);
  }
  return value;
}

function segmentSteps(segment: Record<string, unknown>, where: string): number {
  const seconds = segment["s"];
  const steps = segment["kroki"];
  if ((seconds === undefined) === (steps === undefined)) {
    throw new InputProgramError(`${where}: podaj s albo kroki, dokładnie jedno`);
  }
  if (steps !== undefined) {
    if (!isNumber(steps) || !Number.isInteger(steps) || steps < 1) {
      throw new InputProgramError(`${where}: kroki muszą być dodatnią liczbą całkowitą`);
    }
    return steps;
  }
  if (!isNumber(seconds) || seconds <= 0) {
    throw new InputProgramError(`${where}: s musi być dodatnią liczbą sekund`);
  }
  const rounded = Math.round(seconds * PROGRAM_STEPS_PER_SECOND);
  if (rounded < 1) {
    throw new InputProgramError(`${where}: krótszy niż jeden krok fizyki (1/${String(PROGRAM_STEPS_PER_SECOND)} s)`);
  }
  return rounded;
}

/** Validates and normalizes a "wejscie/1" program. Throws InputProgramError with a reason a person can read. */
export function parseInputProgram(raw: unknown): ParsedInputProgram {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new InputProgramError("program to nie obiekt");
  }
  const program = raw as Record<string, unknown>;
  if (program["schemat"] !== INPUT_PROGRAM_SCHEMA) {
    throw new InputProgramError(`nieznany schemat programu ${JSON.stringify(program["schemat"]) ?? "(brak)"}, ten świat zna ${INPUT_PROGRAM_SCHEMA}`);
  }
  const name = program["nazwa"] ?? "";
  if (typeof name !== "string") throw new InputProgramError("nazwa programu to nie napis");
  if (name.length > PROGRAM_MAX_NAME) {
    throw new InputProgramError(`nazwa programu dłuższa niż ${String(PROGRAM_MAX_NAME)} znaków`);
  }
  const rawSegments = program["odcinki"];
  if (!Array.isArray(rawSegments) || rawSegments.length === 0) {
    throw new InputProgramError("program bez odcinków");
  }
  if (rawSegments.length > PROGRAM_MAX_SEGMENTS) {
    throw new InputProgramError(`za dużo odcinków: ${String(rawSegments.length)}, najwyżej ${String(PROGRAM_MAX_SEGMENTS)}`);
  }

  const segments: { steps: number; commands: ProgramStepCommands }[] = [];
  let totalSteps = 0;
  rawSegments.forEach((value: unknown, index) => {
    const where = `odcinek ${String(index + 1)}`;
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new InputProgramError(`${where}: to nie obiekt`);
    }
    const segment = value as Record<string, unknown>;
    const steps = segmentSteps(segment, where);
    const throttle = rangeField(segment, "gaz", -1, 1, where) ?? 0;
    const brake = rangeField(segment, "hamulec", 0, 1, where) ?? 0;
    const position = rangeField(segment, "skret", -1, 1, where);
    const rate = rangeField(segment, "skret_tempo", -1, 1, where);
    if (position !== undefined && rate !== undefined) {
      throw new InputProgramError(`${where}: skret albo skret_tempo, nie oba`);
    }
    // Same commands the live input would give: a zero rate is "released" (steering-command.ts, rateSteering).
    const steering: SteeringCommand =
      position !== undefined
        ? { mode: "POSITION", value: position }
        : rate !== undefined && Math.abs(rate) > Number.EPSILON
          ? { mode: "RATE", value: rate }
          : RELEASE_STEERING;
    const commands: ProgramStepCommands = { steering, longitudinal: { throttle, brake } };
    totalSteps += steps;
    if (totalSteps > PROGRAM_MAX_STEPS) {
      throw new InputProgramError(`program za długi: ponad ${String(PROGRAM_MAX_STEPS / PROGRAM_STEPS_PER_SECOND)} s`);
    }
    const last = segments[segments.length - 1];
    if (last !== undefined && sameStepCommands(last.commands, commands)) {
      last.steps += steps;
    } else {
      segments.push({ steps, commands });
    }
  });

  const frozen = segments.map((segment) => Object.freeze({ ...segment }));
  return Object.freeze({
    name,
    totalSteps,
    segments: Object.freeze(frozen),
    digest: identityHash(JSON.stringify(frozen.map((segment) => [segment.steps, segment.commands]))),
  });
}

function segmentJson(segment: ParsedProgramSegment): InputProgramSegment {
  const { steering, longitudinal } = segment.commands;
  return {
    kroki: segment.steps,
    ...(longitudinal.throttle === 0 ? {} : { gaz: longitudinal.throttle }),
    ...(longitudinal.brake === 0 ? {} : { hamulec: longitudinal.brake }),
    ...(steering.mode === "POSITION" ? { skret: steering.value } : {}),
    ...(steering.mode === "RATE" ? { skret_tempo: steering.value } : {}),
  };
}

/** A parsed program written back as "wejscie/1" in whole steps: parsing it again gives the same drive (same digest). */
export function inputProgramJson(program: ParsedInputProgram): InputProgram {
  return {
    schemat: INPUT_PROGRAM_SCHEMA,
    ...(program.name === "" ? {} : { nazwa: program.name }),
    odcinki: program.segments.map(segmentJson),
  };
}

/** Records the commands actually applied, one per physics step, as segments of equal commands. */
export class InputRecorder {
  readonly #segments: { steps: number; commands: ProgramStepCommands }[] = [];
  #totalSteps = 0;
  #truncated = false;

  get totalSteps(): number {
    return this.#totalSteps;
  }

  /** True once the recording hit a limit (5 minutes or 20 000 segments) and stopped growing. */
  get truncated(): boolean {
    return this.#truncated;
  }

  record(commands: ProgramStepCommands): void {
    if (this.#totalSteps >= PROGRAM_MAX_STEPS) {
      this.#truncated = true;
      return;
    }
    const last = this.#segments[this.#segments.length - 1];
    if (last !== undefined && sameStepCommands(last.commands, commands)) {
      last.steps += 1;
    } else if (this.#segments.length >= PROGRAM_MAX_SEGMENTS) {
      this.#truncated = true;
      return;
    } else {
      this.#segments.push({ steps: 1, commands });
    }
    this.#totalSteps += 1;
  }

  clear(): void {
    this.#segments.length = 0;
    this.#totalSteps = 0;
    this.#truncated = false;
  }

  /** The recording as a program, or null when nothing has been recorded yet. */
  toProgram(name: string): InputProgram | null {
    if (this.#totalSteps === 0) return null;
    return {
      schemat: INPUT_PROGRAM_SCHEMA,
      nazwa: name.slice(0, PROGRAM_MAX_NAME),
      odcinki: this.#segments.map(segmentJson),
    };
  }
}
