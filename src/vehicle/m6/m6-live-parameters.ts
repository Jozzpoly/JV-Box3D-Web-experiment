// Live parameters of the M6 vehicle and its world (2026-11-21, Opus Code): the native JV core sliders that JV Web
// never exposed. The Owner, 2026-11-21: "jv core miało w chuj suwaków bardzo ważnych dla mnie, jv web całkowicie tego
// nie ruszało". The names, groups and slider ranges follow the native M5 drivable lab (samples/
// jozz_vehicle_m5_drivable_lab.cpp in Box3d_FunProject), the lab he drove for twenty minutes on 2026-07-05.
//
// His rule from 2026-07-09 (native JV): sliders allow absurd values on purpose, for tests and for fun; hard limits only
// protect the solver from falling apart. So a slider range here is a suggestion for a face, never a clamp. The only
// clamps: a value must be a finite number, and a quantity the solver cannot take negative is held at zero, and every
// such clamp is reported back with its reason.
//
// Values live outside any world or vehicle: a reset or a new vehicle picks them up, so nothing returns to its default
// by itself (the wheel workshop lesson, 2026-07/08). With no override ever set nothing is applied at all, so the
// accepted vehicle behaves exactly as built from the native receipt.

import type { M6TopologyConfig } from "./m6-topology-config.js";

export type M6LiveVehicleField =
  | "maxDriveTorque"
  | "maxDriveSpeed"
  | "brakeTorque"
  | "suspensionHertz"
  | "suspensionDampingRatio"
  | "frontSuspensionScale"
  | "rearSuspensionScale"
  | "wheelFriction"
  | "steeringHertz"
  | "steeringDampingRatio";

export type M6LiveWorldField = "contactHertz" | "contactDampingRatio" | "contactSpeed" | "gravity";

export interface M6LiveParameter {
  /** Jaskinia knob name. */
  readonly id: string;
  readonly label: string;
  readonly group: string;
  readonly unit: string;
  readonly description: string;
  /** Range of the native slider: a suggestion for a face, never a clamp. */
  readonly slider: Readonly<{ min: number; max: number; step: number }>;
  readonly nonNegative: boolean;
  readonly scope: "vehicle" | "world";
  readonly field: M6LiveVehicleField | M6LiveWorldField;
}

function parameter(p: M6LiveParameter): M6LiveParameter {
  return Object.freeze({ ...p, slider: Object.freeze({ ...p.slider }) });
}

export const M6_LIVE_PARAMETERS: readonly M6LiveParameter[] = Object.freeze([
  parameter({ id: "jv.naped.moment_nm", label: "Moment napędu", group: "Napęd", unit: "Nm na koło", description: "Największy moment silnika na każde napędzane koło, zanim zadziała mnożnik Mocy.", slider: { min: 0, max: 6000, step: 10 }, nonNegative: true, scope: "vehicle", field: "maxDriveTorque" }),
  parameter({ id: "jv.naped.predkosc_rad_s", label: "Prędkość napędu", group: "Napęd", unit: "rad/s koła", description: "Do jakiej prędkości obrotowej koła silnik jeszcze ciągnie przy pełnym gazie.", slider: { min: 0, max: 150, step: 1 }, nonNegative: true, scope: "vehicle", field: "maxDriveSpeed" }),
  parameter({ id: "jv.hamulec.moment_nm", label: "Moment hamulca", group: "Hamulec", unit: "Nm na koło", description: "Moment hamowania na każde koło, zanim zadziała mnożnik Hamulca.", slider: { min: 0, max: 6000, step: 10 }, nonNegative: true, scope: "vehicle", field: "brakeTorque" }),
  parameter({ id: "jv.zawieszenie.sztywnosc_hz", label: "Sztywność sprężyn", group: "Zawieszenie", unit: "Hz", description: "Częstotliwość sprężyn zawieszenia; wyżej znaczy twardziej.", slider: { min: 0.2, max: 30, step: 0.05 }, nonNegative: true, scope: "vehicle", field: "suspensionHertz" }),
  parameter({ id: "jv.zawieszenie.tlumienie", label: "Tłumienie zawieszenia", group: "Zawieszenie", unit: "współczynnik", description: "Jak szybko gaśnie bujanie; 1 to tłumienie krytyczne.", slider: { min: 0, max: 6, step: 0.01 }, nonNegative: true, scope: "vehicle", field: "suspensionDampingRatio" }),
  parameter({ id: "jv.zawieszenie.skala_przod", label: "Skala osi przedniej", group: "Zawieszenie", unit: "mnożnik", description: "Mnożnik sztywności i tłumienia przednich sprężyn.", slider: { min: 0.3, max: 3, step: 0.01 }, nonNegative: true, scope: "vehicle", field: "frontSuspensionScale" }),
  parameter({ id: "jv.zawieszenie.skala_tyl", label: "Skala osi tylnej", group: "Zawieszenie", unit: "mnożnik", description: "Mnożnik sztywności i tłumienia tylnych sprężyn.", slider: { min: 0.3, max: 3, step: 0.01 }, nonNegative: true, scope: "vehicle", field: "rearSuspensionScale" }),
  parameter({ id: "jv.opony.tarcie", label: "Tarcie opon", group: "Opony", unit: "współczynnik", description: "Przyczepność opon. Box3D łączy ją z tarciem podłoża (0,9) średnią geometryczną: opona 0,05 działa jak ok. 0,21, a opona 4 jak ok. 1,9.", slider: { min: 0.1, max: 4, step: 0.01 }, nonNegative: true, scope: "vehicle", field: "wheelFriction" }),
  parameter({ id: "jv.kierownica.sztywnosc_hz", label: "Sztywność kierownicy", group: "Kierownica", unit: "Hz", description: "Jak mocno przekładnia trzyma zadany skręt, gdy trzymasz kierownicę.", slider: { min: 0.5, max: 40, step: 0.1 }, nonNegative: true, scope: "vehicle", field: "steeringHertz" }),
  parameter({ id: "jv.kierownica.tlumienie", label: "Tłumienie kierownicy", group: "Kierownica", unit: "współczynnik", description: "Jak szybko gaśnie drganie przekładni kierowniczej.", slider: { min: 0, max: 6, step: 0.01 }, nonNegative: true, scope: "vehicle", field: "steeringDampingRatio" }),
  parameter({ id: "jv.swiat.kontakt_hz", label: "Sztywność kontaktu", group: "Świat", unit: "Hz", description: "Jak twardo bryły odpychają się przy styku.", slider: { min: 5, max: 240, step: 1 }, nonNegative: true, scope: "world", field: "contactHertz" }),
  parameter({ id: "jv.swiat.kontakt_tlumienie", label: "Tłumienie kontaktu", group: "Świat", unit: "współczynnik", description: "Jak szybko gaśnie odbicie przy styku.", slider: { min: 0.5, max: 40, step: 0.1 }, nonNegative: true, scope: "world", field: "contactDampingRatio" }),
  parameter({ id: "jv.swiat.kontakt_predkosc", label: "Prędkość wypychania", group: "Świat", unit: "m/s", description: "Jak szybko solver wypycha bryły, które w siebie weszły.", slider: { min: 0.5, max: 20, step: 0.1 }, nonNegative: true, scope: "world", field: "contactSpeed" }),
  parameter({ id: "jv.swiat.grawitacja", label: "Grawitacja", group: "Świat", unit: "m/s² w dół", description: "Przyspieszenie ziemskie; ujemne ciągnie w górę.", slider: { min: 0, max: 30, step: 0.1 }, nonNegative: false, scope: "world", field: "gravity" }),
]);

const BY_ID = new Map(M6_LIVE_PARAMETERS.map((p) => [p.id, p]));
const overrides = new Map<string, number>();
const listeners = new Set<() => void>();
let version = 0;

export interface M6LiveSetResult {
  readonly id: string;
  /** The value now in force, or null when the request was refused. */
  readonly applied: number | null;
  readonly clamped: boolean;
  /** Why the value was refused or clamped; null when taken as given. */
  readonly reason: string | null;
}

export function m6LiveParameter(id: string): M6LiveParameter | null {
  return BY_ID.get(id) ?? null;
}

/** Sets a live value. Anything finite is taken; only negatives of non-negative quantities are clamped, visibly. */
export function setM6LiveParameter(id: string, value: unknown): M6LiveSetResult {
  const p = BY_ID.get(id);
  if (p === undefined) return { id, applied: null, clamped: false, reason: "nie ma takiego pokrętła JV" };
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { id, applied: null, clamped: false, reason: "to nie jest skończona liczba" };
  }
  let applied = value;
  let reason: string | null = null;
  if (p.nonNegative && value < 0) {
    applied = 0;
    reason = "ujemna wartość rozbiłaby solver, przyjęte 0";
  }
  if (overrides.get(id) !== applied) {
    overrides.set(id, applied);
    version += 1;
    for (const listener of listeners) listener();
  }
  return { id, applied, clamped: reason !== null, reason };
}

/** Back to the value from the native receipt. */
export function clearM6LiveParameter(id: string): void {
  if (overrides.delete(id)) {
    version += 1;
    for (const listener of listeners) listener();
  }
}

export function resetM6LiveParameters(): void {
  if (overrides.size === 0 && version === 0) return;
  overrides.clear();
  version += 1;
  for (const listener of listeners) listener();
}

export function getM6LiveOverride(id: string): number | undefined {
  return overrides.get(id);
}

/** Changes every time a value is set or cleared; 0 means nothing was ever set. */
export function m6LiveVersion(): number {
  return version;
}

export function subscribeM6LiveParameters(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const VEHICLE_ID = new Map(
  M6_LIVE_PARAMETERS.filter((p) => p.scope === "vehicle").map((p) => [p.field as M6LiveVehicleField, p.id]),
);

/** A vehicle quantity as it is in force now: the live override, otherwise the native receipt. */
export function liveVehicleValue(config: M6TopologyConfig, field: M6LiveVehicleField): number {
  const id = VEHICLE_ID.get(field);
  const override = id === undefined ? undefined : overrides.get(id);
  return override ?? config[field];
}

/** World quantities as they are in force now (gravity as downward acceleration). */
export function liveWorldValues(config: M6TopologyConfig): {
  readonly contactHertz: number;
  readonly contactDampingRatio: number;
  readonly contactSpeed: number;
  readonly gravityDown: number;
} {
  const pick = (id: string, fallback: number): number => overrides.get(id) ?? fallback;
  return {
    contactHertz: pick("jv.swiat.kontakt_hz", config.solver.contactHertz),
    contactDampingRatio: pick("jv.swiat.kontakt_tlumienie", config.solver.contactDampingRatio),
    contactSpeed: pick("jv.swiat.kontakt_predkosc", config.solver.contactSpeed),
    gravityDown: pick("jv.swiat.grawitacja", -config.solver.gravity[1]),
  };
}

/** Defaults as built from the native receipt, for a host that wants to declare the knobs. */
export function m6LiveDefaults(config: M6TopologyConfig): Readonly<Record<string, number>> {
  const world = {
    contactHertz: config.solver.contactHertz,
    contactDampingRatio: config.solver.contactDampingRatio,
    contactSpeed: config.solver.contactSpeed,
    gravity: -config.solver.gravity[1],
  };
  const out: Record<string, number> = {};
  for (const p of M6_LIVE_PARAMETERS) {
    out[p.id] = p.scope === "vehicle" ? config[p.field as M6LiveVehicleField] : world[p.field as M6LiveWorldField];
  }
  return Object.freeze(out);
}
