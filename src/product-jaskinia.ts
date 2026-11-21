// JV in a Jaskinia window (2026-11-21, Opus Code). The owner, 2026-11-21: JV may be changed boldly and adapted to
// what Jaskinia needs ("nie bójcie się tam ruszać i mieszać, dostosowywać pod nasze potrzeby").
//
// Optional and silent by default. Nothing happens unless the page that framed JV says hi with the Jaskinia window
// contract ({jaskinia: 1, type: "hi"}). Then JV says who it is (hello), what is happening (state), live numbers
// (signals), events and owner flags (Ctrl+.). When the host speaks generation 2 (okno/2), JV also reads its two knobs
// from the Jaskinia settings (jv.moc, jv.hamulec and the native JV core knobs of m6-live-parameters.ts) and applies
// them live, re-reading them whenever the host says something changed. Values are taken as given: any finite number,
// only a negative one of a quantity the solver cannot take negative is clamped, and every clamp or refusal is reported
// back as an event (the Owner's rule from the native JV, 2026-07-09: sliders allow absurd values on purpose).
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
  /** Any finite multiplier >= 0 (a negative one becomes 0); returns the value in force, or null when refused. */
  readonly setPower: (value: number) => number | null;
  readonly setBrake: (value: number) => number | null;
}

export interface JaskiniaKnobAccess {
  /** The world's own knobs, read from the Jaskinia settings next to jv.moc and jv.hamulec. */
  readonly names: readonly string[];
  readonly label: (name: string) => string;
  readonly current: (name: string) => number | undefined;
  readonly set: (
    name: string,
    value: unknown,
  ) => { readonly applied: number | null; readonly clamped: boolean; readonly reason: string | null };
}

export interface JaskiniaBridgeDeps {
  readonly name: string;
  readonly version: string;
  readonly location: () => string;
  readonly speedKmh: () => number;
  readonly fps: () => number | null;
  readonly vehicle: JaskiniaVehicleAccess;
  readonly knobs: JaskiniaKnobAccess;
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

/** The value of one knob in a Jaskinia answer: undefined when the answer does not carry it. */
function knobValue(values: unknown, name: string): unknown {
  if (typeof values !== "object" || values === null) return undefined;
  const entry = (values as Record<string, unknown>)[name];
  if (typeof entry !== "object" || entry === null) return undefined;
  return (entry as Record<string, unknown>)["wartosc"];
}

const decimal = (value: number): string => String(Math.round(value * 1000) / 1000).replace(".", ",");

/** Pure core: a message from the host in, messages for the host out. No DOM, so it is tested in Node. */
export function createJaskiniaBridge(deps: JaskiniaBridgeDeps): JaskiniaBridge {
  let active = false;
  let readsSettings = false;
  let visible = true;
  let pendingRead: string | null = null;
  let readSequence = 0;
  // Knobs belong to the world: JV first asks the host who it is (read ja) and then reads the settings for its own
  // guest thing (dla), so a value set for JV does not change the whole Place. Opened by bare address (no guest
  // thing), it reads the Place-wide values.
  let pendingWhoAmI: string | null = null;
  let scope: string | null = null;
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
        pokretla: Object.fromEntries(
          deps.knobs.names.flatMap((name) => {
            const value = deps.knobs.current(name);
            return value === undefined ? [] : [[name, value]];
          }),
        ),
        wersja: deps.version,
      },
    };
  };
  const readKnobs = (): JaskiniaOutgoing[] => {
    if (!readsSettings || pendingRead !== null || pendingWhoAmI !== null) return [];
    readSequence += 1;
    pendingRead = `jv-pokretla-${String(readSequence)}`;
    return [{
      type: "read",
      id: pendingRead,
      what: "ustawienia",
      nazwy: [JASKINIA_KNOB_POWER, JASKINIA_KNOB_BRAKE, ...deps.knobs.names],
      ...(scope === null ? {} : { dla: scope }),
    }];
  };
  const askWhoAmI = (): JaskiniaOutgoing[] => {
    readSequence += 1;
    pendingWhoAmI = `jv-ja-${String(readSequence)}`;
    return [{ type: "read", id: pendingWhoAmI, what: "ja" }];
  };
  const apply = (values: unknown): JaskiniaOutgoing[] => {
    const changed: string[] = [];
    const warnings: string[] = [];
    const vehicle = deps.vehicle.get();
    const multipliers: Array<[string, string, number, (value: number) => number | null]> = [
      [JASKINIA_KNOB_POWER, "Moc", vehicle.power, deps.vehicle.setPower],
      [JASKINIA_KNOB_BRAKE, "Hamulec", vehicle.brake, deps.vehicle.setBrake],
    ];
    for (const [name, label, before, set] of multipliers) {
      const requested = knobValue(values, name);
      if (requested === undefined || requested === before) continue;
      if (typeof requested !== "number" || !Number.isFinite(requested)) {
        warnings.push(`${label}: to nie jest skończona liczba`);
        continue;
      }
      const applied = set(requested);
      if (applied === null) {
        warnings.push(`${label}: odmowa`);
        continue;
      }
      if (applied !== requested) warnings.push(`${label}: ${decimal(requested)} przycięte do ${decimal(applied)}, bo ujemne rozbiłoby solver`);
      if (applied !== before) changed.push(`${label} ${deps.format(applied)}`);
    }
    for (const name of deps.knobs.names) {
      const requested = knobValue(values, name);
      const before = deps.knobs.current(name);
      if (requested === undefined || requested === before) continue;
      const result = deps.knobs.set(name, requested);
      if (result.applied === null) {
        warnings.push(`${deps.knobs.label(name)}: ${result.reason ?? "odmowa"}`);
        continue;
      }
      if (result.clamped) warnings.push(`${deps.knobs.label(name)}: ${result.reason ?? "przycięte"}`);
      if (result.applied !== before) changed.push(`${deps.knobs.label(name)} ${decimal(result.applied)}`);
    }
    const out: JaskiniaOutgoing[] = [];
    if (changed.length > 0) out.push({ type: "event", text: `Z ustawień Jaskini: ${changed.join(", ")}`.slice(0, 200), level: "info" });
    if (warnings.length > 0) out.push({ type: "event", text: warnings.join("; ").slice(0, 200), level: "uwaga" });
    if (changed.length > 0) out.push(state());
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
        pendingWhoAmI = null;
        scope = null;
        return [
          // "rzeczy": a generation-2 host sends "changed" only to guests that ask for it; "remark": owner notes (gen 1)
          { type: "hello", name: deps.name, version: deps.version, wants: ["remark", "rzeczy"] },
          state(),
          ...(readsSettings ? askWhoAmI() : []),
        ];
      }
      if (!active) return [];
      if (type === "visible") {
        visible = m["visible"] !== false;
        return [];
      }
      if (type === "changed") return readKnobs();
      if (type === "state?") return [state()];
      if (type === "result" && pendingWhoAmI !== null && m["id"] === pendingWhoAmI) {
        pendingWhoAmI = null;
        const data = m["ok"] === true && typeof m["data"] === "object" && m["data"] !== null ? (m["data"] as Record<string, unknown>) : null;
        const guest = data !== null && typeof data["gosc"] === "object" && data["gosc"] !== null ? (data["gosc"] as Record<string, unknown>)["rzecz"] : null;
        scope = typeof guest === "string" && /^[0-9a-z]{26}$/.test(guest) ? guest : null;
        return readKnobs();
      }
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
