export type SteeringCommand =
  | { readonly mode: "RELEASE" }
  | { readonly mode: "POSITION"; readonly value: number }
  | { readonly mode: "RATE"; readonly value: number };

export const RELEASE_STEERING: SteeringCommand = Object.freeze({ mode: "RELEASE" });

export function clampNormalized(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError("Normalized steering value must be finite.");
  }
  return Math.max(-1, Math.min(1, value));
}

export function rateSteering(value: number): SteeringCommand {
  const normalized = clampNormalized(value);
  if (Math.abs(normalized) <= Number.EPSILON) {
    return RELEASE_STEERING;
  }
  return { mode: "RATE", value: normalized };
}

export function positionSteering(value: number): SteeringCommand {
  return { mode: "POSITION", value: clampNormalized(value) };
}
