// Drive director (src/app/drive-director.ts, 2026-11-21, Opus Code): the same input program on two windows. The pure
// part runs on a fake trace; the physics part on the real product vehicle and Box3D (tests/helpers/headless-vehicle.mjs),
// stepped the way F4VehicleHost steps it. The A/B test has its control: the same knobs give the same run, bit for bit.
import test from "node:test";
import assert from "node:assert/strict";
import { createSettledVehicle, kmh } from "./helpers/headless-vehicle.mjs";
import { DriveDirector, SAMPLE_EVERY_STEPS } from "../.test-dist/app/drive-director.js";
import { INPUT_PROGRAM_SCHEMA, parseInputProgram } from "../.test-dist/input/input-program.js";
import {
  m6LiveDefaults,
  resetM6LiveParameters,
  setM6LiveParameter,
} from "../.test-dist/vehicle/m6/m6-live-parameters.js";

const STEP_MS = 1000 / 60;
const RELEASE = { steering: { mode: "RELEASE" }, longitudinal: { throttle: 0, brake: 0 } };
const FULL = { steering: { mode: "RELEASE" }, longitudinal: { throttle: 1, brake: 0 } };
const parse = (odcinki, nazwa = "") => parseInputProgram({ schemat: INPUT_PROGRAM_SCHEMA, nazwa, odcinki });

/** A trace that moves 1 m per step along x at 36 km/h. */
function fakeTrace(step) {
  return {
    drive: { forwardSpeedMetersPerSecond: 10 },
    chassisPosition: { x: step, y: 0.5, z: 0 },
    chassisRotation: { x: 0, y: 0, z: 0, w: 1 },
  };
}

/** Steps like F4VehicleHost: ask, apply, step, tell. */
function stepHost(director, count, live = () => RELEASE, onApplied = () => {}) {
  for (let i = 0; i < count; i += 1) {
    const applied = director.commands(live(i), STEP_MS);
    onApplied(applied, i);
    director.afterStep(() => fakeTrace(i + 1));
  }
}

test("DD1 without a program the live input goes through and is recorded since the last start", () => {
  const director = new DriveDirector();
  director.hostStarted();
  assert.equal(director.recording("nic"), null, "control: nothing driven yet");
  const seen = [];
  stepHost(director, 90, (i) => (i < 60 ? FULL : RELEASE), (applied) => seen.push(applied));
  assert.ok(seen.slice(0, 60).every((c) => c === FULL) && seen.slice(60).every((c) => c === RELEASE), "live passes untouched");
  const { program, truncated } = director.recording("Przejazd");
  assert.equal(truncated, false);
  assert.deepEqual(program.odcinki, [{ kroki: 60, gaz: 1 }, { kroki: 30 }]);
  director.hostStarted();
  assert.equal(director.recording("po starcie"), null, "a new start records afresh");
});

test("DD2 an armed program waits for the next start, then drives every step itself, samples, and reports once", () => {
  const director = new DriveDirector();
  const outcomes = [];
  const p = parse([{ kroki: 10, gaz: 1 }, { kroki: 5, hamulec: 1, skret: 0.5 }], "Krótki");
  director.arm(p, (o) => outcomes.push(o));
  const before = director.commands(FULL, STEP_MS);
  assert.equal(before, FULL, "control: armed is not playing, live still drives until the start");
  director.hostStarted();
  assert.ok(director.playing);
  const applied = [];
  stepHost(director, 15, () => FULL, (c) => applied.push(c));
  assert.deepEqual(applied.map((c) => [c.longitudinal.throttle, c.longitudinal.brake, c.steering.mode]), [
    ...Array(10).fill([1, 0, "RELEASE"]),
    ...Array(5).fill([0, 1, "POSITION"]),
  ], "live full throttle ignored where the program brakes");
  assert.equal(outcomes.length, 1);
  assert.equal(outcomes[0].ok, true);
  const run = outcomes[0].run;
  assert.equal(run.schemat, "przebieg/1");
  // the world names its own series: every column has a key, a name for a person and a unit (the host compares only those)
  assert.deepEqual(run.serie.map((s) => s.klucz), [...run.kolumny], "every column is a series named by the world, in the same order");
  assert.ok(run.serie.every((s) => typeof s.nazwa === "string" && s.nazwa && typeof s.jednostka === "string" && s.jednostka));
  assert.equal(run.serie.find((s) => s.klucz === "v_kmh").jednostka, "km/h");
  assert.deepEqual(run.program, { nazwa: "Krótki", skrot: p.digest, kroki: 15, krok_s: 1 / 60 });
  assert.deepEqual(run.probki.map((r) => r[0]), [6 / 60, 12 / 60, 15 / 60].map((t) => Math.round(t * 1e4) / 1e4), `every ${SAMPLE_EVERY_STEPS} steps and the last`);
  assert.equal(run.koniec.v_kmh, 36);
  assert.equal(run.koniec.odleglosc_m, 14, "from where the chassis stood after the first step (x 1) to the end (x 15)");
  assert.equal(director.playing, false);
  assert.equal(director.commands(FULL, STEP_MS), FULL, "after the program the live input drives again");
  stepHost(director, 30);
  assert.equal(outcomes.length, 1, "reported exactly once");
  assert.deepEqual(director.recording("z programem").program.odcinki.slice(0, 2), [{ kroki: 10, gaz: 1 }, { kroki: 5, hamulec: 1, skret: 0.5 }], "the recording holds what was applied");
});

test("DD3 a program cut off says why: a new start, a new program, a failed start", () => {
  const director = new DriveDirector();
  const heard = [];
  const p = parse([{ s: 2, gaz: 1 }]);
  director.arm(p, (o) => heard.push(["pierwszy", o]));
  director.hostStarted();
  stepHost(director, 10);
  director.hostStarted(); // R in the middle
  assert.deepEqual(heard.map(([who, o]) => [who, o.ok, o.error]), [["pierwszy", false, "przerwane: pojazd postawiony od nowa"]]);

  director.arm(p, (o) => heard.push(["drugi", o]));
  director.hostStarted();
  stepHost(director, 5);
  director.arm(p, (o) => heard.push(["trzeci", o]));
  assert.deepEqual(heard.at(-1).slice(0, 1).concat([heard.at(-1)[1].error]), ["drugi", "przerwane: przyszedł nowy program"]);
  director.hostFailed("pojazd nie wystartował");
  assert.deepEqual(heard.at(-1).slice(0, 1).concat([heard.at(-1)[1].error]), ["trzeci", "przerwane: pojazd nie wystartował"]);
  assert.equal(director.armed || director.playing, false);
  assert.equal(heard.length, 3, "control: every program heard exactly once");
});

test("DD4 a program counted on another physics step is refused at its first step, not driven wrong", () => {
  const director = new DriveDirector();
  const heard = [];
  director.arm(parse([{ s: 1, gaz: 1 }]), (o) => heard.push(o));
  director.hostStarted();
  const applied = director.commands(RELEASE, 1000 / 120);
  assert.equal(applied, RELEASE, "live input, not the program");
  assert.equal(heard[0].ok, false);
  assert.match(heard[0].error, /krok fizyki/);
});

// ---- on the real vehicle ----

/** Steps the settled product vehicle like F4VehicleHost, with the director in charge. */
function driveReal(r, director, steps, live = () => RELEASE) {
  for (let i = 0; i < steps; i += 1) {
    const applied = director.commands(live(i), STEP_MS);
    r.vehicle.setSteering(applied.steering);
    r.vehicle.setDrive(applied.longitudinal);
    r.world.stepPhysics(1);
    director.afterStep(() => r.world.captureLatestTrace()[0]);
  }
  return r.world.captureLatestTrace()[0];
}

async function playOnFreshVehicle(program, live = () => RELEASE) {
  const r = await createSettledVehicle();
  try {
    const director = new DriveDirector();
    let outcome = null;
    director.arm(program, (o) => { outcome = o; });
    director.hostStarted();
    driveReal(r, director, program.totalSteps, live);
    assert.ok(outcome !== null, "the program ended within its own steps");
    assert.equal(outcome.ok, true, outcome.error);
    return outcome.run;
  } finally {
    r.dispose();
  }
}

const LAUNCH = parse([{ s: 2, gaz: 1 }, { s: 1, gaz: 1, skret: 0.5 }, { s: 1, hamulec: 1 }], "Ruszanie, łuk, hamowanie");

test("DD5 control of the A/B comparison: one program on two fresh vehicles with the same knobs is the same run, bit for bit", async () => {
  resetM6LiveParameters();
  const a = await playOnFreshVehicle(LAUNCH);
  const b = await playOnFreshVehicle(LAUNCH);
  assert.equal(a.skrot, b.skrot);
  assert.deepEqual(a.probki, b.probki);
  assert.equal(a.probki.length, Math.ceil(LAUNCH.totalSteps / SAMPLE_EVERY_STEPS));
  assert.ok(a.vmax_kmh > 15, `the program really drives: ${a.vmax_kmh} km/h at most`);
});

test("DD6 A/B: the same program with doubled drive torque is a clearly faster run, and only the knob differs", async () => {
  try {
    resetM6LiveParameters();
    const a = await playOnFreshVehicle(LAUNCH);
    const r = await createSettledVehicle();
    const torque = m6LiveDefaults(r.world.config)["jv.naped.moment_nm"];
    r.dispose();
    setM6LiveParameter("jv.naped.moment_nm", torque * 2);
    const b = await playOnFreshVehicle(LAUNCH);
    assert.equal(a.program.skrot, b.program.skrot, "the same drive");
    assert.notEqual(a.skrot, b.skrot);
    const at2s = (run) => run.probki.find((row) => Math.abs(row[0] - 2) < 1e-9)[1];
    // measured 2026-11-21 (native 320 Nm against 640 Nm): A 28.8, B 49.4 km/h after 2 s; the threshold says "clearly faster"
    assert.ok(at2s(b) > at2s(a) * 1.5, `B ${at2s(b)} km/h vs A ${at2s(a)} km/h after 2 s`);
  } finally {
    resetM6LiveParameters();
  }
});

test("DD7 a live drive, recorded and played back from the same start, ends in the same place to the last digit", async () => {
  resetM6LiveParameters();
  const live = (i) => ({
    steering: i < 60 ? { mode: "RELEASE" } : i < 90 ? { mode: "RATE", value: i === 60 ? 0.4 : 1 } : { mode: "POSITION", value: 0.3 },
    longitudinal: { throttle: i < 120 ? 1 : 0, brake: i >= 120 ? 0.6 : 0 },
  });
  const r = await createSettledVehicle();
  let recording;
  let liveEnd;
  try {
    const director = new DriveDirector();
    director.hostStarted();
    liveEnd = driveReal(r, director, 150, live);
    recording = director.recording("Przejazd").program;
  } finally {
    r.dispose();
  }
  const replay = await playOnFreshVehicle(parseInputProgram(JSON.parse(JSON.stringify(recording))), () => FULL);
  const end = replay.probki.at(-1);
  assert.deepEqual(end.slice(2, 5), [liveEnd.chassisPosition.x, liveEnd.chassisPosition.y, liveEnd.chassisPosition.z].map((v) => Math.round(v * 1e4) / 1e4));
  assert.equal(end[1], Math.round(kmh(liveEnd) * 1e3) / 1e3);

  const changed = JSON.parse(JSON.stringify(recording));
  changed.odcinki[0].kroki -= 1;
  changed.odcinki.splice(1, 0, { kroki: 1 });
  const other = await playOnFreshVehicle(parseInputProgram(changed));
  assert.notEqual(other.skrot, replay.skrot, "control: one step of coast instead of throttle is visible in the run");
});

test("DD8 while a program plays, the live input does not touch the car", async () => {
  resetM6LiveParameters();
  const still = await playOnFreshVehicle(parse([{ s: 1.5 }]), () => FULL);
  assert.ok(Math.abs(still.koniec.v_kmh) < 1, `coast program under live full throttle: ${still.koniec.v_kmh} km/h`);
  const r = await createSettledVehicle();
  try {
    const director = new DriveDirector();
    director.hostStarted();
    const end = driveReal(r, director, 90, () => FULL);
    assert.ok(kmh(end) > 10, `control: without a program the same live input drives, ${kmh(end).toFixed(1)} km/h`);
  } finally {
    r.dispose();
  }
});

test("DD9 the run's digest sees a difference the rounded samples hide: equal digests mean equal numbers, not equal to 4 digits", () => {
  const runWith = (nudge) => {
    const director = new DriveDirector();
    let run = null;
    director.arm(parse([{ kroki: 12, gaz: 1 }]), (o) => { run = o.run; });
    director.hostStarted();
    for (let i = 0; i < 12; i += 1) {
      director.commands(RELEASE, STEP_MS);
      director.afterStep(() => ({ ...fakeTrace(i + 1), chassisPosition: { x: i + 1 + nudge, y: 0.5, z: 0 } }));
    }
    return run;
  };
  const a = runWith(0);
  const b = runWith(1e-9);
  assert.deepEqual(a.probki, b.probki, "rounded to 4 digits the samples agree");
  assert.notEqual(a.skrot, b.skrot);
  assert.equal(runWith(0).skrot, a.skrot, "control: the same numbers, the same digest");
});

test("DD10 the run says how far the chassis tilted: upright 0, on its side 90, on its roof 180 (a fast run on its side is not simply faster)", () => {
  const s = Math.SQRT1_2;
  const poses = [
    { x: 0, y: 0, z: 0, w: 1 }, // upright
    { x: 0, y: s, z: 0, w: s }, // turned 90 degrees about the vertical: still upright
    { x: s, y: 0, z: 0, w: s }, // rolled 90 degrees about x: on its side
    { x: 0, y: 0, z: 1, w: 0 }, // 180 degrees about z: on its roof
  ];
  const director = new DriveDirector();
  let run = null;
  director.arm(parse([{ kroki: 24 }]), (o) => { run = o.run; });
  director.hostStarted();
  for (let i = 0; i < 24; i += 1) {
    director.commands(RELEASE, STEP_MS);
    director.afterStep(() => ({ ...fakeTrace(i + 1), chassisRotation: poses[Math.floor(i / 6)] }));
  }
  assert.equal(run.kolumny.at(-1), "przechyl_st");
  assert.deepEqual(run.probki.map((row) => row.at(-1)), [0, 0, 90, 180]);
  assert.equal(run.przechyl_max_st, 180);
  assert.equal(run.t_przechyl_max, 0.4);
  assert.equal(run.probki[1][5], 90, "control: the turn about the vertical shows in yaw, not in tilt");
});
