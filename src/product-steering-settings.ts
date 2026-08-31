export const JV_STEERING_WHEEL_RANGE_DEGREES = [
  360,
  540,
  720,
  900,
  1080,
] as const;

export type JvSteeringWheelRangeDegrees =
  (typeof JV_STEERING_WHEEL_RANGE_DEGREES)[number];

export interface JvProductSteeringSettings {
  readonly wheelRangeDegrees: JvSteeringWheelRangeDegrees;
  /** Internal compatibility value. Product UI cannot enable artificial centering. */
  readonly centeringAssist: false;
}

export interface JvSteeringSessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

type SteeringSettingsListener = (
  settings: JvProductSteeringSettings,
) => void;

export const DEFAULT_JV_PRODUCT_STEERING_SETTINGS: JvProductSteeringSettings =
  Object.freeze({
    wheelRangeDegrees: 900,
    centeringAssist: false,
  });

const STORAGE_KEY = "jv.product.steering.v1";
let currentSettings = DEFAULT_JV_PRODUCT_STEERING_SETTINGS;
let sessionStorageTarget: JvSteeringSessionStorage | null = null;
const listeners = new Set<SteeringSettingsListener>();

function isWheelRangeDegrees(
  value: unknown,
): value is JvSteeringWheelRangeDegrees {
  return typeof value === "number" &&
    JV_STEERING_WHEEL_RANGE_DEGREES.includes(
      value as JvSteeringWheelRangeDegrees,
    );
}

function normalizeSettings(value: unknown): JvProductSteeringSettings {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return DEFAULT_JV_PRODUCT_STEERING_SETTINGS;
  }
  const record = value as Record<string, unknown>;
  if (
    record["schema"] !== "JV_PRODUCT_STEERING_SETTINGS_V1" ||
    !isWheelRangeDegrees(record["wheelRangeDegrees"])
  ) {
    return DEFAULT_JV_PRODUCT_STEERING_SETTINGS;
  }
  return Object.freeze({
    wheelRangeDegrees: record["wheelRangeDegrees"],
    // Preview-era payloads may contain centeringAssist=true. Never restore it
    // into the product: ordinary hands-off steering belongs to the physics.
    centeringAssist: false,
  });
}

function persist(): void {
  if (sessionStorageTarget === null) {
    return;
  }
  try {
    sessionStorageTarget.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schema: "JV_PRODUCT_STEERING_SETTINGS_V1",
        wheelRangeDegrees: currentSettings.wheelRangeDegrees,
      }),
    );
  } catch {
    // Session persistence is convenience only. Steering remains usable when
    // browser privacy/security policy denies storage writes.
  }
}

function publish(next: JvProductSteeringSettings): void {
  if (next.wheelRangeDegrees === currentSettings.wheelRangeDegrees) {
    return;
  }
  currentSettings = Object.freeze({ ...next, centeringAssist: false });
  persist();
  for (const listener of [...listeners]) {
    listener(currentSettings);
  }
}

export function initializeJvProductSteeringSettings(
  storage: JvSteeringSessionStorage | null,
): JvProductSteeringSettings {
  sessionStorageTarget = storage;
  let restored = DEFAULT_JV_PRODUCT_STEERING_SETTINGS;
  if (storage !== null) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw !== null) {
        restored = normalizeSettings(JSON.parse(raw));
      }
    } catch {
      restored = DEFAULT_JV_PRODUCT_STEERING_SETTINGS;
    }
  }
  const changed =
    restored.wheelRangeDegrees !== currentSettings.wheelRangeDegrees ||
    currentSettings.centeringAssist !== false;
  currentSettings = restored;
  if (changed) {
    for (const listener of [...listeners]) {
      listener(currentSettings);
    }
  }
  return currentSettings;
}

export function getJvProductSteeringSettings(): JvProductSteeringSettings {
  return currentSettings;
}

export function setJvSteeringWheelRangeDegrees(
  wheelRangeDegrees: JvSteeringWheelRangeDegrees,
): void {
  if (!isWheelRangeDegrees(wheelRangeDegrees)) {
    throw new Error(
      `Unsupported JV steering wheel range: ${String(wheelRangeDegrees)} degrees.`,
    );
  }
  publish({
    wheelRangeDegrees,
    centeringAssist: false,
  });
}

export function subscribeJvProductSteeringSettings(
  listener: SteeringSettingsListener,
): () => void {
  listeners.add(listener);
  listener(currentSettings);
  return () => {
    listeners.delete(listener);
  };
}
