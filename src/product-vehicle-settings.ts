// Player-facing vehicle tuning (session-scoped, like the steering range).
// Choices are discrete multipliers over the native vehicle; the default power
// is the JV-Web profile (1.5x). Applied live through the M6 drive tuning.

import {
  DEFAULT_M6_DRIVE_TUNING,
  setM6DriveTuning,
} from "./vehicle/m6/m6-drive-tuning.js";

export const JV_POWER_CHOICES = [1, 1.25, 1.5, 2] as const;
export const JV_BRAKE_CHOICES = [0.7, 1, 1.3] as const;

export type JvPowerChoice = (typeof JV_POWER_CHOICES)[number];
export type JvBrakeChoice = (typeof JV_BRAKE_CHOICES)[number];

export interface JvProductVehicleSettings {
  readonly power: JvPowerChoice;
  readonly brake: JvBrakeChoice;
}

export interface JvVehicleSessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const DEFAULT_JV_PRODUCT_VEHICLE_SETTINGS: JvProductVehicleSettings =
  Object.freeze({
    power: DEFAULT_M6_DRIVE_TUNING.torqueScale as JvPowerChoice,
    brake: DEFAULT_M6_DRIVE_TUNING.brakeScale as JvBrakeChoice,
  });

const STORAGE_KEY = "jv.product.vehicle.v1";
const SCHEMA = "JV_PRODUCT_VEHICLE_SETTINGS_V1";
let current = DEFAULT_JV_PRODUCT_VEHICLE_SETTINGS;
let storageTarget: JvVehicleSessionStorage | null = null;

function isPower(value: unknown): value is JvPowerChoice {
  return JV_POWER_CHOICES.includes(value as JvPowerChoice);
}

function isBrake(value: unknown): value is JvBrakeChoice {
  return JV_BRAKE_CHOICES.includes(value as JvBrakeChoice);
}

function apply(): void {
  setM6DriveTuning({ torqueScale: current.power, brakeScale: current.brake });
}

function persist(): void {
  if (storageTarget === null) return;
  try {
    storageTarget.setItem(
      STORAGE_KEY,
      JSON.stringify({ schema: SCHEMA, power: current.power, brake: current.brake }),
    );
  } catch {
    // Convenience only; driving works when storage is denied.
  }
}

export function initializeJvProductVehicleSettings(
  storage: JvVehicleSessionStorage | null,
): JvProductVehicleSettings {
  storageTarget = storage;
  current = DEFAULT_JV_PRODUCT_VEHICLE_SETTINGS;
  if (storage !== null) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (parsed["schema"] === SCHEMA && isPower(parsed["power"]) && isBrake(parsed["brake"])) {
          current = Object.freeze({ power: parsed["power"], brake: parsed["brake"] });
        }
      }
    } catch {
      current = DEFAULT_JV_PRODUCT_VEHICLE_SETTINGS;
    }
  }
  apply();
  return current;
}

export function getJvProductVehicleSettings(): JvProductVehicleSettings {
  return current;
}

export function setJvVehiclePower(power: JvPowerChoice): void {
  if (!isPower(power)) throw new Error(`Unsupported power choice: ${String(power)}`);
  current = Object.freeze({ ...current, power });
  apply();
  persist();
}

export function setJvVehicleBrake(brake: JvBrakeChoice): void {
  if (!isBrake(brake)) throw new Error(`Unsupported brake choice: ${String(brake)}`);
  current = Object.freeze({ ...current, brake });
  apply();
  persist();
}

/** "1,5×" — Polish decimal comma, as shown in the product. */
export function formatJvMultiplier(value: number): string {
  return `${String(value).replace(".", ",")}×`;
}
