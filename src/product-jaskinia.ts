// JV in a Jaskinia window (2026-11-21, Opus Code). The owner, 2026-11-21: JV may be changed boldly and adapted to
// what Jaskinia needs ("nie bójcie się tam ruszać i mieszać, dostosowywać pod nasze potrzeby").
//
// Optional and silent by default. Nothing happens unless the page that framed JV says hi with the Jaskinia window
// contract ({jaskinia: 1, type: "hi"}). Then JV says who it is (hello), what is happening (state), live numbers
// (signals), events and owner flags (Ctrl+.). When the host speaks generation 2 (okno/2), JV also reads its two knobs
// from the Jaskinia settings (jv.moc, jv.hamulec) and applies them live through the same functions as the in-game
// Moc / Hamulec tab, re-reading them whenever the host says something changed.
//
// Generation 1 is the old Jaskinia Studio instrument contract (hello, state, signals, event, flag), so the same page
// talks to both hosts. Opened directly (not in a frame), JV is unchanged: no listener reacts and no message leaves.
// Known limit of this first version: knobs flow from Jaskinia to JV only; a change made in the JV tab is reported in
// state.data, not written back as a Jaskinia setting.

export const JASKINIA_KNOB_POWER = "jv.moc";
export const JASKINIA_KNOB_BRAKE = "jv.hamulec";
export const JASKINIA_SIGNALS_EVERY_MS = 250;
export const JASKINIA_STATE_EVERY_MS = 1000;

export interface JaskiniaVehicleAccess {
  readonly get: () => { readonly power: number; readonly brake: number };
  readonly setPower: (value: number) => void;
  readonly setBrake: (value: number) => void;
  readonly powerChoices: readonly number[];
  readonly brakeChoices: readonly number[];
}

export interface JaskiniaBridgeDeps {
  readonly name: string;
  readonly version: string;
  readonly location: () => string;
  readonly speedKmh: () => number;
  readonly fps: () => number | null;
  readonly vehicle: JaskiniaVehicleAccess;
  readonly format: (value: number) => string;
}

export interface JaskiniaOutgoing {
  readonly type: string;
  readonly [field: string]: unknown;
}

export interface JaskiniaBridge {
  readonly receive: (message: unknown) => JaskiniaOutgoing[];
  readonly tick: (nowMs: number) => JaskiniaOutgoing[];
  readonly flag: () => JaskiniaOutgoing[];
  readonly isActive: () => boolean;
}

/** The allowed choice closest to a value coming from a Jaskinia knob; null for anything that is not a number. */
export function nearestChoice(value: number, choices: readonly number[]): number | null {
  if (!Number.isFinite(value)) return null;
  let best: number | null = null;
  for (const choice of choices) {
    if (best === null || Math.abs(choice - value) < Math.abs(best - value)) best = choice;
  }
  return best;
}

function knobValue(values: unknown, name: string): number | null {
  if (typeof values !== "object" || values === null) return null;
  const entry = (values as Record<string, unknown>)[name];
  if (typeof entry !== "object" || entry === null) return null;
  const value = (entry as Record<string, unknown>)["wartosc"];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Pure core: a message from the host in, messages for the host out. No DOM, so it is tested in Node. */
export function createJaskiniaBridge(deps: JaskiniaBridgeDeps): JaskiniaBridge {
  let active = false;
  let readsSettings = false;
  let visible = true;
  let pendingRead: string | null = null;
  let readSequence = 0;
  let lastSignalsAt = Number.NEGATIVE_INFINITY;
  let lastStateAt = Number.NEGATIVE_INFINITY;
  let lastStateText = "";

  const speed = (): number => Math.round(Math.abs(deps.speedKmh()));
  const stateText = (): string => {
    const vehicle = deps.vehicle.get();
    return `${deps.location()} · ${String(speed())} km/h · Moc ${deps.format(vehicle.power)} · Hamulec ${deps.format(vehicle.brake)}`;
  };
  const state = (): JaskiniaOutgoing => {
    const vehicle = deps.vehicle.get();
    lastStateText = stateText();
    return {
      type: "state",
      text: lastStateText,
      data: {
        lokacja: deps.location(),
        predkosc_kmh: speed(),
        moc: vehicle.power,
        hamulec: vehicle.brake,
        wersja: deps.version,
      },
    };
  };
  const readKnobs = (): JaskiniaOutgoing[] => {
    if (!readsSettings || pendingRead !== null) return [];
    readSequence += 1;
    pendingRead = `jv-pokretla-${String(readSequence)}`;
    return [{ type: "read", id: pendingRead, what: "ustawienia", nazwy: [JASKINIA_KNOB_POWER, JASKINIA_KNOB_BRAKE] }];
  };
  const apply = (values: unknown): JaskiniaOutgoing[] => {
    const out: JaskiniaOutgoing[] = [];
    const before = deps.vehicle.get();
    const requestedPower = knobValue(values, JASKINIA_KNOB_POWER);
    const requestedBrake = knobValue(values, JASKINIA_KNOB_BRAKE);
    const power = requestedPower === null ? null : nearestChoice(requestedPower, deps.vehicle.powerChoices);
    const brake = requestedBrake === null ? null : nearestChoice(requestedBrake, deps.vehicle.brakeChoices);
    if (power !== null && power !== before.power) {
      deps.vehicle.setPower(power);
      out.push({ type: "event", text: `Moc z ustawień Jaskini: ${deps.format(power)}`, level: "info" });
    }
    if (brake !== null && brake !== before.brake) {
      deps.vehicle.setBrake(brake);
      out.push({ type: "event", text: `Hamulec z ustawień Jaskini: ${deps.format(brake)}`, level: "info" });
    }
    if (out.length > 0) out.push(state());
    return out;
  };

  return {
    isActive: () => active,
    receive(message) {
      if (typeof message !== "object" || message === null) return [];
      const m = message as Record<string, unknown>;
      if (m["jaskinia"] !== 1 || typeof m["type"] !== "string") return [];
      const type = m["type"];
      if (type === "hi") {
        active = true;
        const contracts: unknown[] = Array.isArray(m["umowy"]) ? (m["umowy"] as unknown[]) : [];
        const generation = m["v"];
        readsSettings = typeof generation === "number" && generation >= 2 && contracts.includes("okno/2");
        pendingRead = null;
        return [
          // "rzeczy": a generation-2 host sends "changed" only to guests that ask for it; "remark": owner notes (gen 1)
          { type: "hello", name: deps.name, version: deps.version, wants: ["remark", "rzeczy"] },
          state(),
          ...readKnobs(),
        ];
      }
      if (!active) return [];
      if (type === "visible") {
        visible = m["visible"] !== false;
        return [];
      }
      if (type === "changed") return readKnobs();
      if (type === "state?") return [state()];
      if (type === "result" && pendingRead !== null && m["id"] === pendingRead) {
        pendingRead = null;
        if (m["ok"] !== true) {
          return [{ type: "event", text: `Ustawienia Jaskini nieczytelne: ${String(m["error"] ?? "brak odpowiedzi").slice(0, 120)}`, level: "uwaga" }];
        }
        const data = m["data"];
        return apply(typeof data === "object" && data !== null ? (data as Record<string, unknown>)["wartosci"] : null);
      }
      return [];
    },
    tick(nowMs) {
      if (!active || !visible) return [];
      const out: JaskiniaOutgoing[] = [];
      if (nowMs - lastSignalsAt >= JASKINIA_SIGNALS_EVERY_MS) {
        lastSignalsAt = nowMs;
        const values: Record<string, number> = { predkosc_kmh: Math.round(Math.abs(deps.speedKmh()) * 10) / 10 };
        const fps = deps.fps();
        if (fps !== null && Number.isFinite(fps)) values["klatki_na_s"] = Math.round(fps);
        out.push({ type: "signals", values });
      }
      if (nowMs - lastStateAt >= JASKINIA_STATE_EVERY_MS && stateText() !== lastStateText) {
        lastStateAt = nowMs;
        out.push(state());
      }
      return out;
    },
    flag() {
      return active ? [{ type: "flag" }, state()] : [];
    },
  };
}

/** Browser wiring. Returns a function that removes everything it installed. */
export function installJaskiniaWindow(deps: Omit<JaskiniaBridgeDeps, "fps">, win: Window = window): () => void {
  if (win.parent === win) return () => {};
  let frames = 0;
  let windowStart = 0;
  let fps: number | null = null;
  let raf = 0;
  const countFrame = (now: number): void => {
    if (windowStart === 0) windowStart = now;
    frames += 1;
    if (now - windowStart >= 1000) {
      fps = (frames * 1000) / (now - windowStart);
      frames = 0;
      windowStart = now;
    }
    raf = win.requestAnimationFrame(countFrame);
  };
  const bridge = createJaskiniaBridge({ ...deps, fps: () => fps });
  const send = (messages: JaskiniaOutgoing[]): void => {
    for (const message of messages) win.parent.postMessage({ jaskinia: 1, ...message }, "*");
  };
  const onMessage = (event: MessageEvent): void => {
    if (event.source !== win.parent) return;
    const wasActive = bridge.isActive();
    send(bridge.receive(event.data));
    if (!wasActive && bridge.isActive()) raf = win.requestAnimationFrame(countFrame);
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.ctrlKey && event.key === ".") send(bridge.flag());
  };
  win.addEventListener("message", onMessage);
  win.addEventListener("keydown", onKey);
  const timer = win.setInterval(() => send(bridge.tick(win.performance.now())), JASKINIA_SIGNALS_EVERY_MS);
  return () => {
    win.removeEventListener("message", onMessage);
    win.removeEventListener("keydown", onKey);
    win.clearInterval(timer);
    if (raf !== 0) win.cancelAnimationFrame(raf);
  };
}
