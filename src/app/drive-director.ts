// Drive director (2026-11-21, Opus Code): decides, before every physics step, which commands the vehicle gets.
// Normally the live input (keyboard, pointer, pedals), recorded as it goes. While an input program plays, the program
// and nothing else: live input is ignored until it ends, so a stray key in one window cannot spoil an A/B comparison.
//
// A program starts with the first physics step after a vehicle start (a fresh world, the car at its start), so every
// window that plays it begins from the same state. The program is counted in executed physics steps, not in wall-clock
// time: a slow frame delays it, but never changes which command goes to which step. While it plays the director samples
// the vehicle every SAMPLE_EVERY_STEPS steps and at the end; when it has run out, the run ("przebieg/1") goes to whoever
// armed it. Sampling reads the trace only (captureTrace sets no state that a later step reads), so a played program
// drives exactly like the same commands given live.

import {
  InputRecorder,
  PROGRAM_STEPS_PER_SECOND,
  identityHash,
  type InputProgram,
  type ParsedInputProgram,
  type ProgramStepCommands,
} from "../input/input-program.js";

export const RUN_SCHEMA = "przebieg/1";
export const SAMPLE_EVERY_STEPS = 6;
export const RUN_COLUMNS = ["t", "v_kmh", "x", "y", "z", "odchylenie_st", "przechyl_st"] as const;

/** What a sample needs from a vehicle trace (M6TraceFrame has it). */
export interface DriveSampleSource {
  readonly drive: { readonly forwardSpeedMetersPerSecond: number };
  readonly chassisPosition: { readonly x: number; readonly y: number; readonly z: number };
  readonly chassisRotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number };
}

export interface ProgramRun {
  readonly schemat: typeof RUN_SCHEMA;
  readonly program: { readonly nazwa: string; readonly skrot: string; readonly kroki: number; readonly krok_s: number };
  readonly kolumny: typeof RUN_COLUMNS;
  /**
   * One row per sample: t (s from the program start), forward speed (km/h), chassis position (m), yaw (degrees) and
   * tilt (degrees between the chassis' up axis and the vertical: 0 upright, 90 on its side, 180 on its roof).
   */
  readonly probki: readonly (readonly number[])[];
  readonly koniec: {
    readonly t: number;
    readonly v_kmh: number;
    readonly x: number;
    readonly y: number;
    readonly z: number;
    /** Horizontal distance from where the chassis stood after the program's first step. */
    readonly odleglosc_m: number;
  };
  readonly vmax_kmh: number;
  readonly t_vmax: number;
  /** The largest tilt in the samples: a fast run that ended on its side is not simply faster (seen 2026-11-21). */
  readonly przechyl_max_st: number;
  readonly t_przechyl_max: number;
  /** Identity of the sampled run, from the unrounded numbers: equal digests mean the windows drove bit for bit alike. */
  readonly skrot: string;
}

export type ProgramOutcome =
  | { readonly ok: true; readonly run: ProgramRun }
  | { readonly ok: false; readonly error: string };

type Done = (outcome: ProgramOutcome) => void;

interface Playing {
  readonly program: ParsedInputProgram;
  readonly done: Done;
  executed: number;
  segment: number;
  leftInSegment: number;
  readonly rows: number[][];
  readonly raw: number[];
  start: { readonly x: number; readonly z: number } | null;
  vmax: number;
  tVmax: number;
  tiltMax: number;
  tTiltMax: number;
}

const round = (value: number, digits: number): number => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

function yawDegrees(q: DriveSampleSource["chassisRotation"]): number {
  return (Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z)) * 180) / Math.PI;
}

/** Angle between the chassis' up axis (the unit quaternion applied to +y) and the world vertical. */
function tiltDegrees(q: DriveSampleSource["chassisRotation"]): number {
  const upY = 1 - 2 * (q.x * q.x + q.z * q.z);
  return (Math.acos(Math.max(-1, Math.min(1, upY))) * 180) / Math.PI;
}

export class DriveDirector {
  readonly #recorder = new InputRecorder();
  #armed: { readonly program: ParsedInputProgram; readonly done: Done } | null = null;
  #playing: Playing | null = null;

  get playing(): boolean {
    return this.#playing !== null;
  }

  get armed(): boolean {
    return this.#armed !== null;
  }

  /** The program starts with the first step after the next vehicle start. Whatever was armed or playing is cut off. */
  arm(program: ParsedInputProgram, done: Done): void {
    this.#end("przerwane: przyszedł nowy program");
    this.#armed = { program, done };
  }

  /** Stops an armed or playing program and says why. */
  cancel(reason: string): void {
    this.#end(reason);
  }

  /** The host started a vehicle: a fresh recording begins, and an armed program begins with it. */
  hostStarted(): void {
    if (this.#playing !== null) {
      this.#finish({ ok: false, error: "przerwane: pojazd postawiony od nowa" });
    }
    this.#recorder.clear();
    const armed = this.#armed;
    this.#armed = null;
    if (armed === null) return;
    const first = armed.program.segments[0];
    this.#playing = {
      program: armed.program,
      done: armed.done,
      executed: 0,
      segment: 0,
      leftInSegment: first === undefined ? 0 : first.steps,
      rows: [],
      raw: [],
      start: null,
      vmax: 0,
      tVmax: 0,
      tiltMax: 0,
      tTiltMax: 0,
    };
  }

  /** The host could not start a vehicle, or its physics stopped: nothing armed or playing can go on. */
  hostFailed(reason: string): void {
    this.#end(`przerwane: ${reason}`.slice(0, 200));
  }

  /** Before each physics step: the commands the vehicle gets. */
  commands(live: ProgramStepCommands, stepMs: number): ProgramStepCommands {
    const playing = this.#playing;
    if (playing === null) {
      this.#recorder.record(live);
      return live;
    }
    if (Math.abs(stepMs * PROGRAM_STEPS_PER_SECOND - 1000) > 1e-6) {
      this.#finish({
        ok: false,
        error: `krok fizyki ${String(stepMs)} ms, a program liczy kroki po ${String(1000 / PROGRAM_STEPS_PER_SECOND)} ms`,
      });
      this.#recorder.record(live);
      return live;
    }
    while (playing.leftInSegment === 0 && playing.segment < playing.program.segments.length - 1) {
      playing.segment += 1;
      playing.leftInSegment = playing.program.segments[playing.segment]?.steps ?? 0;
    }
    const segment = playing.program.segments[playing.segment];
    if (segment === undefined || playing.leftInSegment <= 0) {
      // afterStep ends a program on its last step, so this is reached only if a step went by without it
      this.#finish({ ok: false, error: "program skończył się bez ostatniej próbki" });
      this.#recorder.record(live);
      return live;
    }
    playing.leftInSegment -= 1;
    this.#recorder.record(segment.commands);
    return segment.commands;
  }

  /** After each physics step: sample when it is time; when the program has run out, report the run. */
  afterStep(capture: () => DriveSampleSource): void {
    const playing = this.#playing;
    if (playing === null) return;
    playing.executed += 1;
    const last = playing.executed >= playing.program.totalSteps;
    if (playing.start === null || last || playing.executed % SAMPLE_EVERY_STEPS === 0) {
      const trace = capture();
      const p = trace.chassisPosition;
      if (playing.start === null) playing.start = { x: p.x, z: p.z };
      if (last || playing.executed % SAMPLE_EVERY_STEPS === 0) {
        const t = playing.executed / PROGRAM_STEPS_PER_SECOND;
        const kmh = trace.drive.forwardSpeedMetersPerSecond * 3.6;
        const yaw = yawDegrees(trace.chassisRotation);
        const tilt = tiltDegrees(trace.chassisRotation);
        playing.raw.push(t, kmh, p.x, p.y, p.z, yaw, tilt);
        playing.rows.push([round(t, 4), round(kmh, 3), round(p.x, 4), round(p.y, 4), round(p.z, 4), round(yaw, 3), round(tilt, 2)]);
        if (Math.abs(kmh) > Math.abs(playing.vmax)) {
          playing.vmax = kmh;
          playing.tVmax = t;
        }
        if (tilt > playing.tiltMax) {
          playing.tiltMax = tilt;
          playing.tTiltMax = t;
        }
      }
    }
    if (last) this.#finish({ ok: true, run: this.#run(playing) });
  }

  /** What was driven since the last vehicle start, as a program that replays it; null when nothing was. */
  recording(name: string): { readonly program: InputProgram; readonly truncated: boolean } | null {
    const program = this.#recorder.toProgram(name);
    return program === null ? null : { program, truncated: this.#recorder.truncated };
  }

  #run(playing: Playing): ProgramRun {
    const end = playing.rows[playing.rows.length - 1] ?? [0, 0, 0, 0, 0, 0, 0];
    const start = playing.start ?? { x: 0, z: 0 };
    const [t = 0, v = 0, x = 0, y = 0, z = 0] = end;
    const rawEnd = playing.raw.slice(-RUN_COLUMNS.length);
    return {
      schemat: RUN_SCHEMA,
      program: {
        nazwa: playing.program.name,
        skrot: playing.program.digest,
        kroki: playing.program.totalSteps,
        krok_s: 1 / PROGRAM_STEPS_PER_SECOND,
      },
      kolumny: RUN_COLUMNS,
      probki: playing.rows,
      koniec: {
        t,
        v_kmh: v,
        x,
        y,
        z,
        odleglosc_m: round(Math.hypot((rawEnd[2] ?? 0) - start.x, (rawEnd[4] ?? 0) - start.z), 3),
      },
      vmax_kmh: round(playing.vmax, 3),
      t_vmax: round(playing.tVmax, 4),
      przechyl_max_st: round(playing.tiltMax, 2),
      t_przechyl_max: round(playing.tTiltMax, 4),
      skrot: identityHash(playing.raw.map(String).join(",")),
    };
  }

  #finish(outcome: ProgramOutcome): void {
    const playing = this.#playing;
    this.#playing = null;
    playing?.done(outcome);
  }

  #end(reason: string): void {
    const armed = this.#armed;
    this.#armed = null;
    armed?.done({ ok: false, error: reason });
    this.#finish({ ok: false, error: reason });
  }
}

/** The one director of the product page: the Jaskinia bridge arms it, the vehicle host asks it before every step. */
export const productDriveDirector = new DriveDirector();
