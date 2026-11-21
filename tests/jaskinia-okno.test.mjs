// JV in a Jaskinia window: the pure core of src/product-jaskinia.ts (2026-11-21, Opus Code).
// Each test has a control: the same situation without the triggering message must stay silent or unchanged.
import test from "node:test";
import assert from "node:assert/strict";
import {
  createJaskiniaBridge,
  JASKINIA_KNOB_BRAKE,
  JASKINIA_KNOB_POWER,
} from "../.test-dist/product-jaskinia.js";

function world({ power = 1.5, brake = 1 } = {}) {
  const car = { power, brake, sets: [] };
  const live = new Map();
  const knobSets = [];
  let speed = 0;
  const bridge = createJaskiniaBridge({
    name: "JV Web",
    version: "abc123def456",
    location: () => "Plac",
    speedKmh: () => speed,
    fps: () => 60,
    vehicle: {
      get: () => ({ power: car.power, brake: car.brake }),
      // like the product: any finite value >= 0, a negative one becomes 0
      setPower: (v) => { const a = Math.max(0, v); car.power = a; car.sets.push(["moc", a]); return a; },
      setBrake: (v) => { const a = Math.max(0, v); car.brake = a; car.sets.push(["hamulec", a]); return a; },
    },
    knobs: {
      names: ["jv.opony.tarcie", "jv.swiat.grawitacja"],
      label: (n) => ({ "jv.opony.tarcie": "Tarcie opon", "jv.swiat.grawitacja": "Grawitacja" })[n] ?? n,
      current: (n) => live.get(n),
      set: (n, v) => {
        knobSets.push([n, v]);
        if (typeof v !== "number" || !Number.isFinite(v)) return { applied: null, clamped: false, reason: "to nie jest skończona liczba" };
        const a = n === "jv.opony.tarcie" && v < 0 ? 0 : v;
        live.set(n, a);
        return { applied: a, clamped: a !== v, reason: a !== v ? "ujemna wartość rozbiłaby solver, przyjęte 0" : null };
      },
    },
    format: (v) => `${String(v).replace(".", ",")}×`,
  });
  return { bridge, car, live, knobSets, setSpeed: (v) => { speed = v; } };
}
const HI_NEW = { jaskinia: 1, type: "hi", v: 2, umowy: ["okno/2", "okno/3"], umie: ["look"] };
const HI_OLD = { jaskinia: 1, type: "hi", v: 1 };
const types = (list) => list.map((m) => m.type);
const knobs = (power, brake) => ({
  ...(power === undefined ? {} : { [JASKINIA_KNOB_POWER]: { wartosc: power, skad: "wartosc" } }),
  ...(brake === undefined ? {} : { [JASKINIA_KNOB_BRAKE]: { wartosc: brake, skad: "wartosc" } }),
});

test("TJ1 opened directly, JV stays silent: nothing before a host says hi", () => {
  const { bridge, setSpeed } = world();
  setSpeed(40);
  assert.deepEqual(bridge.tick(10_000), []);
  assert.deepEqual(bridge.flag(), []);
  assert.deepEqual(bridge.receive({ jaskinia: 1, type: "changed", akt: 5 }), []);
  assert.deepEqual(bridge.receive({ type: "hi" }), [], "a message without jaskinia: 1 is not a host");
  assert.equal(bridge.isActive(), false);
});

test("TJ2 the old Jaskinia Studio (generation 1): hello and state, no settings read", () => {
  const { bridge } = world();
  const out = bridge.receive(HI_OLD);
  assert.deepEqual(types(out), ["hello", "state"]);
  assert.equal(out[0].name, "JV Web");
  assert.equal(out[0].version, "abc123def456");
  assert.match(out[1].text, /^Plac · 0 km\/h · Moc 1,5× · Hamulec 1×$/);
  assert.deepEqual(bridge.receive({ jaskinia: 1, type: "changed", akt: 3 }), [], "generation 1 never reads settings");
});

test("TJ3 the new Jaskinia (generation 2): hello asks for changes and JV reads its two knobs", () => {
  const { bridge } = world();
  const out = bridge.receive(HI_NEW);
  assert.deepEqual(types(out), ["hello", "state", "read"]);
  assert.ok(out[0].wants.includes("rzeczy"), "without wants: rzeczy the host never sends changed");
  assert.equal(out[2].what, "ustawienia");
  assert.deepEqual(out[2].nazwy, [JASKINIA_KNOB_POWER, JASKINIA_KNOB_BRAKE, "jv.opony.tarcie", "jv.swiat.grawitacja"], "Moc, Hamulec and the native core knobs");
});

test("TJ4 Moc and Hamulec from Jaskinia apply as given (no snapping to the tab presets); only a negative is clamped, and visibly", () => {
  const { bridge, car } = world();
  const read = bridge.receive(HI_NEW)[2];
  assert.deepEqual(bridge.receive({ jaskinia: 1, type: "result", id: "inne-czytanie", ok: true, data: { wartosci: knobs(2, 1.3) } }), [], "control: an answer to someone else's read");
  assert.deepEqual(car.sets, []);
  // 5x and 0.6x are not tab presets: the Owner's rule from the native JV is that sliders allow absurd values
  const out = bridge.receive({ jaskinia: 1, type: "result", id: read.id, ok: true, data: { wartosci: knobs(5, 0.6) } });
  assert.deepEqual(car.sets, [["moc", 5], ["hamulec", 0.6]]);
  assert.deepEqual(types(out), ["event", "state"]);
  assert.match(out[0].text, /^Z ustawień Jaskini: Moc 5×, Hamulec 0,6×$/);
  assert.match(out[1].text, /Moc 5× · Hamulec 0,6×/);
  const again = bridge.receive({ jaskinia: 1, type: "changed", akt: 9 })[0];
  const clamped = bridge.receive({ jaskinia: 1, type: "result", id: again.id, ok: true, data: { wartosci: knobs(-2, undefined) } });
  assert.deepEqual(types(clamped), ["event", "event", "state"]);
  assert.equal(clamped[1].level, "uwaga");
  assert.match(clamped[1].text, /Moc: -2 przycięte do 0, bo ujemne rozbiłoby solver/);
  const third = bridge.receive({ jaskinia: 1, type: "changed", akt: 10 })[0];
  const notNumber = bridge.receive({ jaskinia: 1, type: "result", id: third.id, ok: true, data: { wartosci: knobs("dużo", undefined) } });
  assert.deepEqual(types(notNumber), ["event"]);
  assert.match(notNumber[0].text, /Moc: to nie jest skończona liczba/);
  const fourth = bridge.receive({ jaskinia: 1, type: "changed", akt: 11 })[0];
  const failed = bridge.receive({ jaskinia: 1, type: "result", id: fourth.id, ok: false, error: "drzwi odpowiedziały: 401" });
  assert.deepEqual(types(failed), ["event"]);
  assert.equal(failed[0].level, "uwaga");
  assert.deepEqual(car.sets, [["moc", 5], ["hamulec", 0.6], ["moc", 0]], "only the good and the clamped value moved the car");
});

test("TJ5 one read at a time: a burst of changes waits for the answer", () => {
  const { bridge } = world();
  const read = bridge.receive(HI_NEW)[2];
  assert.deepEqual(bridge.receive({ jaskinia: 1, type: "changed", akt: 2 }), [], "control: the first read is still pending");
  bridge.receive({ jaskinia: 1, type: "result", id: read.id, ok: true, data: { wartosci: {} } });
  const next = bridge.receive({ jaskinia: 1, type: "changed", akt: 3 });
  assert.deepEqual(types(next), ["read"]);
  assert.notEqual(next[0].id, read.id);
});

test("TJ6 live numbers: signals at most every 250 ms, state at most every second and only when it says something new; hidden window rests", () => {
  const { bridge, setSpeed } = world();
  bridge.receive(HI_NEW);
  setSpeed(-36.04);
  const first = bridge.tick(1_000);
  assert.deepEqual(types(first), ["signals", "state"]);
  assert.deepEqual(first[0].values, { predkosc_kmh: 36, klatki_na_s: 60 });
  assert.deepEqual(bridge.tick(1_100), [], "control: 100 ms later there is nothing new to say");
  assert.deepEqual(types(bridge.tick(1_260)), ["signals"]);
  setSpeed(50);
  assert.deepEqual(types(bridge.tick(2_100)), ["signals", "state"]);
  assert.deepEqual(types(bridge.tick(3_200)), ["signals"], "a second later with nothing new, no state");
  bridge.receive({ jaskinia: 1, type: "visible", visible: false });
  assert.deepEqual(bridge.tick(5_000), [], "a hidden window gets no signals");
  bridge.receive({ jaskinia: 1, type: "visible", visible: true });
  assert.deepEqual(types(bridge.tick(5_300)), ["signals"]);
});

test("TJ7 the owner's flag (Ctrl+.) goes with the state of the moment", () => {
  const { bridge, setSpeed } = world();
  bridge.receive(HI_OLD);
  setSpeed(12);
  const out = bridge.flag();
  assert.deepEqual(types(out), ["flag", "state"]);
  assert.equal(out[1].data.predkosc_kmh, 12);
});

test("TJ9 every vehicle-settings change reaches its listeners, so the in-game tab never shows a stale choice", async () => {
  const settings = await import("../.test-dist/product-vehicle-settings.js");
  settings.initializeJvProductVehicleSettings(null);
  const seen = [];
  const off = settings.subscribeJvProductVehicleSettings(() => seen.push(settings.getJvProductVehicleSettings().power));
  settings.setJvVehiclePower(2);
  settings.setJvVehicleBrake(1.3);
  assert.deepEqual(seen, [2, 2], "both changes reached the listener with the new state");
  off();
  settings.setJvVehiclePower(1);
  assert.deepEqual(seen, [2, 2], "control: after unsubscribing nothing more arrives");
  settings.initializeJvProductVehicleSettings(null);
});

test("TJ8 native core knobs: taken as given (absurd too), a refused or clamped one is reported, an unchanged one is silent", () => {
  const { bridge, live, knobSets } = world();
  const read = bridge.receive(HI_NEW)[2];
  const wartosci = { "jv.opony.tarcie": { wartosc: 40 }, "jv.swiat.grawitacja": { wartosc: -3 } };
  const out = bridge.receive({ jaskinia: 1, type: "result", id: read.id, ok: true, data: { wartosci } });
  assert.deepEqual([...live], [["jv.opony.tarcie", 40], ["jv.swiat.grawitacja", -3]], "40x the native friction and upward gravity are both taken");
  assert.deepEqual(types(out), ["event", "state"]);
  assert.match(out[0].text, /Tarcie opon 40, Grawitacja -3/);
  assert.deepEqual(out[1].data.pokretla, { "jv.opony.tarcie": 40, "jv.swiat.grawitacja": -3 }, "the host sees the values in force");
  const second = bridge.receive({ jaskinia: 1, type: "changed", akt: 2 })[0];
  const before = knobSets.length;
  assert.deepEqual(bridge.receive({ jaskinia: 1, type: "result", id: second.id, ok: true, data: { wartosci } }), [], "control: the same values again change nothing and say nothing");
  assert.equal(knobSets.length, before, "and are not even set again");
  const third = bridge.receive({ jaskinia: 1, type: "changed", akt: 3 })[0];
  const bad = bridge.receive({ jaskinia: 1, type: "result", id: third.id, ok: true, data: { wartosci: { "jv.opony.tarcie": { wartosc: -1 }, "jv.swiat.grawitacja": { wartosc: "?" } } } });
  assert.deepEqual(types(bad), ["event", "event", "state"]);
  assert.match(bad[1].text, /Tarcie opon: ujemna wartość rozbiłaby solver, przyjęte 0; Grawitacja: to nie jest skończona liczba/);
  assert.equal(live.get("jv.opony.tarcie"), 0);
  assert.equal(live.get("jv.swiat.grawitacja"), -3, "the refused value left the old one in force");
});
