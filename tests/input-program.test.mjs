// Input program "wejscie/1" (src/input/input-program.ts, 2026-11-21, Opus Code): the format two JV windows share, so
// that the same drive goes to both. Each refusal has a control (the valid neighbour is accepted).
import test from "node:test";
import assert from "node:assert/strict";
import {
  INPUT_PROGRAM_SCHEMA,
  InputProgramError,
  InputRecorder,
  inputProgramJson,
  parseInputProgram,
  PROGRAM_MAX_SEGMENTS,
  PROGRAM_MAX_STEPS,
} from "../.test-dist/input/input-program.js";

const program = (odcinki, extra = {}) => ({ schemat: INPUT_PROGRAM_SCHEMA, odcinki, ...extra });

/** Command of every step, expanded from the parsed segments. */
function steps(parsed) {
  return parsed.segments.flatMap((segment) => Array.from({ length: segment.steps }, () => segment.commands));
}

test("IP1 seconds become whole physics steps, defaults are coast and released steering, a drive merges", () => {
  const p = parseInputProgram(program([{ s: 0.5 }, { s: 3, gaz: 1 }, { kroki: 30, hamulec: 1, skret: -0.6 }], { nazwa: "Start" }));
  assert.equal(p.name, "Start");
  assert.equal(p.totalSteps, 30 + 180 + 30);
  assert.deepEqual(p.segments.map((s) => s.steps), [30, 180, 30]);
  assert.deepEqual({ ...p.segments[0].commands.longitudinal }, { throttle: 0, brake: 0 });
  assert.equal(p.segments[0].commands.steering.mode, "RELEASE");
  assert.deepEqual({ ...p.segments[2].commands.steering }, { mode: "POSITION", value: -0.6 });
  const rate = parseInputProgram(program([{ s: 1, skret_tempo: 0.5 }]));
  assert.deepEqual({ ...rate.segments[0].commands.steering }, { mode: "RATE", value: 0.5 });
  const zeroRate = parseInputProgram(program([{ s: 1, skret_tempo: 0 }]));
  assert.equal(zeroRate.segments[0].commands.steering.mode, "RELEASE", "a zero rate is released, as live input gives it");

  // The digest is the drive, not the text: split, renamed or given in steps, the same drive has the same digest.
  const one = parseInputProgram(program([{ s: 5, gaz: 1 }]));
  const split = parseInputProgram(program([{ s: 3, gaz: 1 }, { kroki: 120, gaz: 1 }], { nazwa: "inna nazwa" }));
  assert.equal(split.segments.length, 1, "adjacent equal segments merge");
  assert.equal(one.digest, split.digest);
  const control = parseInputProgram(program([{ kroki: 299, gaz: 1 }]));
  assert.notEqual(control.digest, one.digest, "control: one step less is another drive");
  assert.notEqual(parseInputProgram(program([{ s: 5, gaz: 0.99 }])).digest, one.digest, "control: another throttle");
});

test("IP2 anything outside the format is refused with a reason, never clipped quietly", () => {
  const cases = [
    [null, /nie obiekt/],
    [{ schemat: "wejscie/2", odcinki: [{ s: 1 }] }, /nieznany schemat/],
    [program([]), /bez odcinków/],
    [program([{ s: 1, kroki: 60 }]), /dokładnie jedno/],
    [program([{ gaz: 1 }]), /dokładnie jedno/],
    [program([{ s: 0 }]), /dodatnią liczbą sekund/],
    [program([{ s: 0.001 }]), /krótszy niż jeden krok/],
    [program([{ kroki: 1.5 }]), /całkowitą/],
    [program([{ s: 1, gaz: 1.5 }]), /gaz musi być liczbą w \[-1, 1\]/],
    [program([{ s: 1, gaz: Number.NaN }]), /gaz musi być/],
    [program([{ s: 1, hamulec: -0.1 }]), /hamulec musi być liczbą w \[0, 1\]/],
    [program([{ s: 1, skret: 0.2, skret_tempo: 0.2 }]), /nie oba/],
    [program([{ s: 1, skret: -1.01 }]), /skret musi być/],
    [program([{ s: 301 }]), /za długi/],
    [program([{ s: 1 }], { nazwa: 7 }), /nazwa programu to nie napis/],
    [program([{ s: 1 }], { nazwa: "x".repeat(81) }), /dłuższa niż 80/],
    [program(Array.from({ length: PROGRAM_MAX_SEGMENTS + 1 }, (_, i) => ({ kroki: 1, gaz: i % 2 }))), /za dużo odcinków/],
  ];
  for (const [raw, reason] of cases) {
    assert.throws(() => parseInputProgram(raw), (error) => error instanceof InputProgramError && reason.test(error.message), JSON.stringify(raw)?.slice(0, 80));
  }
  // controls: the edges themselves are accepted
  assert.equal(parseInputProgram(program([{ s: 300, gaz: -1, hamulec: 1, skret: 1 }], { nazwa: "x".repeat(80) })).totalSteps, PROGRAM_MAX_STEPS);
  assert.equal(parseInputProgram(program([{ s: 1 / 60 }])).totalSteps, 1);
  assert.equal(parseInputProgram(program([{ s: 1, nieznane_pole: true }])).totalSteps, 60, "unknown fields are skipped");
});

test("IP3 a parsed program written back in steps parses to the same drive", () => {
  const p = parseInputProgram(program([{ s: 0.25 }, { s: 1.5, gaz: 0.7, skret_tempo: -0.3 }, { s: 0.5, hamulec: 0.4, skret: 0.25 }], { nazwa: "Zakręt" }));
  const json = inputProgramJson(p);
  assert.equal(json.schemat, INPUT_PROGRAM_SCHEMA);
  assert.ok(json.odcinki.every((segment) => Number.isInteger(segment.kroki) && segment.s === undefined));
  const again = parseInputProgram(JSON.parse(JSON.stringify(json)));
  assert.equal(again.digest, p.digest);
  assert.equal(again.name, "Zakręt");
  assert.deepEqual(steps(again), steps(p));
});

test("IP4 a recording replays exactly the commands that were recorded, and says when it hit a limit", () => {
  const recorded = [];
  const recorder = new InputRecorder();
  assert.equal(recorder.toProgram("nic"), null, "control: nothing recorded, nothing to replay");
  for (let i = 0; i < 400; i += 1) {
    // what live input gives: averaged fractions at key edges, joystick positions, analog pedals
    const commands = {
      steering: i < 100 ? { mode: "RELEASE" } : i < 200 ? { mode: "RATE", value: i === 100 ? 0.4 : 1 } : { mode: "POSITION", value: Math.sin(i / 7) },
      longitudinal: { throttle: i < 300 ? (i % 50 === 0 ? 0.35 : 1) : 0, brake: i >= 300 ? 0.62 : 0 },
    };
    recorded.push(commands);
    recorder.record(commands);
  }
  const json = recorder.toProgram("Przejazd");
  assert.equal(recorder.truncated, false);
  const replay = parseInputProgram(JSON.parse(JSON.stringify(json)));
  assert.equal(replay.totalSteps, 400);
  assert.deepEqual(steps(replay).map((c) => [c.steering, c.longitudinal]), recorded.map((c) => [c.steering, c.longitudinal]));

  const long = new InputRecorder();
  for (let i = 0; i < PROGRAM_MAX_STEPS + 5; i += 1) long.record({ steering: { mode: "RELEASE" }, longitudinal: { throttle: 1, brake: 0 } });
  assert.equal(long.totalSteps, PROGRAM_MAX_STEPS);
  assert.equal(long.truncated, true);
  long.clear();
  assert.equal(long.totalSteps, 0);
  assert.equal(long.truncated, false, "a new start records afresh");
});
