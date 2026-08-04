export interface LongitudinalCommand {
  readonly throttle: number;
  readonly brake: number;
}

export const RELEASE_LONGITUDINAL: LongitudinalCommand = Object.freeze({
  throttle: 0,
  brake: 0,
});

export function longitudinalCommand(
  throttle: number,
  brake: number,
): LongitudinalCommand {
  if (!Number.isFinite(throttle) || Math.abs(throttle) > 1) {
    throw new RangeError(
      "Longitudinal throttle must be finite and normalized to [-1, 1].",
    );
  }
  if (!Number.isFinite(brake) || brake < 0 || brake > 1) {
    throw new RangeError(
      "Longitudinal brake must be finite and normalized to [0, 1].",
    );
  }
  return {
    throttle: Math.max(-1, Math.min(1, throttle)),
    brake: Math.max(0, Math.min(1, brake)),
  };
}
