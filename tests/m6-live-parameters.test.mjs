// Native JV core sliders as live parameters of the product M6 (src/vehicle/m6/m6-live-parameters.ts, 2026-11-21,
// Opus Code). Causal checks on the real vehicle and Box3D, no renderer: each knob has to change what a driver would
// feel, each test has a control, and with nothing ever set the accepted vehicle must stay exactly as built.
import test from "node:test";
import assert from "node:assert/strict";
import { createSettledVehicle, kmh } from "./helpers/headless-vehicle.mjs";
import {
  clearM6LiveParameter,
  M6_LIVE_PARAMETERS,
  m6LiveDefaults,
  m6LiveVersion,
  resetM6LiveParameters,
  setM6LiveParameter,
} from "../.test-dist/vehicle/m6/m6-live-parameters.js";

async function run(scenario) {
  const r = await createSettledVehicle();
  try {
    return scenario(r);
  } finally {
    r.dispose();
  }
}
const fullThrottle = (seconds) => (r) => {
  r.vehicle.setDrive({ throttle: 1, brake: 0 });
  return kmh(r.seconds(seconds));
};
const restHeight = (r) => r.seconds(2).chassisPosition.y;

test("LP1 every knob has a native default, a name the Jaskinia host accepts, and its slider range is only a suggestion", async () => {
  const r = await createSettledVehicle();
  try {
    const defaults = m6LiveDefaults(r.world.config);
    assert.equal(Object.keys(defaults).length, M6_LIVE_PARAMETERS.length);
    for (const p of M6_LIVE_PARAMETERS) {
      assert.ok(Number.isFinite(defaults[p.id]), `${p.id} has a finite native default`);
      assert.match(p.id, /^[a-z0-9_.]{3,250}$/, `${p.id} passes the host's knob-name filter`);
      assert.ok(p.slider.min < p.slider.max && p.slider.step > 0, `${p.id} slider`);
    }
    assert.equal(new Set(M6_LIVE_PARAMETERS.map((p) => p.id)).size, M6_LIVE_PARAMETERS.length, "names are unique");
  } finally {
    r.dispose();
  }
});

test("LP2 with nothing ever set nothing is applied: two runs drive exactly alike", async () => {
  resetM6LiveParameters();
  assert.ok(m6LiveVersion() >= 0);
  const a = await run(fullThrottle(2));
  const b = await run(fullThrottle(2));
  assert.equal(a, b, "control of determinism: the same scenario gives the same speed to the last digit");
});

test("LP3 drive torque 0 holds the car still under full throttle, also after a reset, until cleared", async () => {
  try {
    const free = await run(fullThrottle(2));
    assert.ok(free > 10, `control: the native vehicle reaches ${free.toFixed(1)} km/h`);
    setM6LiveParameter("jv.naped.moment_nm", 0);
    const held = await run(fullThrottle(2));
    assert.ok(Math.abs(held) < 1, `no torque, ${held.toFixed(2)} km/h`);
    const afterReset = await run(fullThrottle(2)); // a fresh world and vehicle: nothing returns to default by itself
    assert.ok(Math.abs(afterReset) < 1, `after a reset the value is still in force: ${afterReset.toFixed(2)} km/h`);
    clearM6LiveParameter("jv.naped.moment_nm");
    const back = await run(fullThrottle(2));
    assert.equal(back, free, "cleared: exactly the native behaviour again");
  } finally {
    resetM6LiveParameters();
  }
});

test("LP4 slippery tires (friction 0.05) cut acceleration; changing friction while driving takes effect live", async () => {
  try {
    const grip = await run(fullThrottle(2));
    setM6LiveParameter("jv.opony.tarcie", 0.05);
    const ice = await run(fullThrottle(2));
    // Box3D mixes tire and ground friction (0.9) by geometric mean, so a 0.05 tire behaves like ~0.21 on this ground:
    // measured 2026-11-21, 15.2 vs 28.8 km/h. The threshold says "clearly slower", not "no grip at all".
    assert.ok(ice < grip * 0.65, `ice ${ice.toFixed(1)} vs native grip ${grip.toFixed(1)} km/h after 2 s`);
    resetM6LiveParameters();
    const live = await run((r) => {
      r.vehicle.setDrive({ throttle: 1, brake: 0 });
      r.seconds(1);
      setM6LiveParameter("jv.opony.tarcie", 0.05); // mid-run, the world applies it before its next step
      return kmh(r.seconds(1));
    });
    assert.ok(live < grip * 0.85, `friction dropped mid-run: ${live.toFixed(1)} vs ${grip.toFixed(1)} km/h`);
  } finally {
    resetM6LiveParameters();
  }
});

test("LP5 soft springs sit lower than stiff ones (front and rear scale included)", async () => {
  try {
    setM6LiveParameter("jv.zawieszenie.sztywnosc_hz", 1);
    const soft = await run(restHeight);
    setM6LiveParameter("jv.zawieszenie.sztywnosc_hz", 20);
    const stiff = await run(restHeight);
    assert.ok(stiff - soft > 0.02, `stiff ${stiff.toFixed(3)} m vs soft ${soft.toFixed(3)} m`);
    setM6LiveParameter("jv.zawieszenie.skala_przod", 0.3);
    setM6LiveParameter("jv.zawieszenie.skala_tyl", 0.3);
    const scaledDown = await run(restHeight);
    assert.ok(stiff - scaledDown > 0.01, `axle scales 0.3 soften the stiff springs: ${scaledDown.toFixed(3)} m`);
  } finally {
    resetM6LiveParameters();
  }
});

test("LP6 low gravity lifts the car on its springs; absurd values are taken, only solver-breaking ones are clamped", async () => {
  try {
    setM6LiveParameter("jv.swiat.grawitacja", 3);
    const moon = await run(restHeight);
    setM6LiveParameter("jv.swiat.grawitacja", 30);
    const heavy = await run(restHeight);
    assert.ok(moon - heavy > 0.02, `g=3 ${moon.toFixed(3)} m vs g=30 ${heavy.toFixed(3)} m`);
    assert.deepEqual(setM6LiveParameter("jv.naped.moment_nm", 60000), { id: "jv.naped.moment_nm", applied: 60000, clamped: false, reason: null }, "ten times the native slider maximum is taken as given");
    assert.deepEqual(setM6LiveParameter("jv.swiat.grawitacja", -5).applied, -5, "upward gravity is allowed: the solver takes it");
    const negative = setM6LiveParameter("jv.opony.tarcie", -1);
    assert.equal(negative.applied, 0);
    assert.equal(negative.clamped, true);
    assert.match(negative.reason, /solver/);
    assert.equal(setM6LiveParameter("jv.opony.tarcie", Number.NaN).applied, null);
    assert.equal(setM6LiveParameter("jv.nie.ma", 1).applied, null);
  } finally {
    resetM6LiveParameters();
  }
});

test("LP7 steering stiffness and damping reach the rack while the driver holds the wheel", async () => {
  const rackAfterTurnIn = (r) => {
    r.vehicle.setDrive({ throttle: 0.3, brake: 0 });
    r.seconds(1);
    r.vehicle.setSteering({ mode: "POSITION", value: 0.6 });
    return Math.abs(r.seconds(0.25).rackTranslation);
  };
  try {
    setM6LiveParameter("jv.kierownica.sztywnosc_hz", 0.5);
    setM6LiveParameter("jv.kierownica.tlumienie", 6);
    const lazy = await run(rackAfterTurnIn);
    setM6LiveParameter("jv.kierownica.sztywnosc_hz", 40);
    setM6LiveParameter("jv.kierownica.tlumienie", 0.2);
    const sharp = await run(rackAfterTurnIn);
    assert.notEqual(lazy, sharp, `control: the two settings must not steer identically (${lazy.toFixed(4)} vs ${sharp.toFixed(4)} m)`);
    assert.ok(sharp > lazy, `stiff steering turns in further after 0.25 s: ${sharp.toFixed(4)} vs ${lazy.toFixed(4)} m of rack`);
  } finally {
    resetM6LiveParameters();
  }
});

test("LP8 a vehicle respawned in the same world (the product reset) carries the values in force, not the defaults", async () => {
  try {
    setM6LiveParameter("jv.zawieszenie.sztywnosc_hz", 1);
    const r = await createSettledVehicle();
    try {
      const first = r.seconds(1).chassisPosition.y;
      r.vehicle.dispose?.();
      const again = r.world.createVehicle({ x: 20, y: 1.3, z: 0 }, 2);
      again.setDrive({ throttle: 0, brake: 0 });
      again.setSteering({ mode: "RELEASE" });
      let trace = null;
      for (let i = 0; i < 180; i += 1) trace = r.world.step(1).at(-1);
      assert.ok(Math.abs(trace.chassisPosition.y - first) < 0.02, `respawned car sits like the first soft one: ${trace.chassisPosition.y.toFixed(3)} vs ${first.toFixed(3)} m`);
    } finally {
      r.dispose();
    }
  } finally {
    resetM6LiveParameters();
  }
});
