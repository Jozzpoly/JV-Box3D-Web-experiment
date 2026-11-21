// Live drive tuning for the M6 vehicle: multipliers over the native factory
// receipt (which stays untouched). The controller reads this every step, so a
// change applies immediately without rebuilding the vehicle.

import { JV_WEB_DRIVE_TORQUE_SCALE } from "./m6-geometry.js";

export interface M6DriveTuning {
  /** Multiplier on the native per-wheel drive torque cap. */
  readonly torqueScale: number;
  /** Multiplier on the native per-wheel brake torque. */
  readonly brakeScale: number;
}

export const M6_DRIVE_TORQUE_SCALE_RANGE = Object.freeze({ min: 0.5, max: 3 });
export const M6_BRAKE_SCALE_RANGE = Object.freeze({ min: 0.5, max: 2 });

export const DEFAULT_M6_DRIVE_TUNING: M6DriveTuning = Object.freeze({
  torqueScale: JV_WEB_DRIVE_TORQUE_SCALE,
  brakeScale: 1,
});

let current: M6DriveTuning = DEFAULT_M6_DRIVE_TUNING;

export function getM6DriveTuning(): M6DriveTuning {
  return current;
}

// The ranges above are where the in-game tab offers its choices, not limits: the Owner's rule from the native JV
// (2026-07-09) is that sliders allow absurd values on purpose and hard limits only protect the solver. So any finite,
// non-negative multiplier is taken (2026-11-21, Opus Code); a Jaskinia knob may set 5x or 0x.
function solverSafe(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function setM6DriveTuning(next: M6DriveTuning): void {
  if (!solverSafe(next.torqueScale)) {
    throw new RangeError(`Drive torque scale must be a finite number >= 0: ${String(next.torqueScale)}`);
  }
  if (!solverSafe(next.brakeScale)) {
    throw new RangeError(`Brake scale must be a finite number >= 0: ${String(next.brakeScale)}`);
  }
  current = Object.freeze({
    torqueScale: next.torqueScale,
    brakeScale: next.brakeScale,
  });
}

export function resetM6DriveTuning(): void {
  current = DEFAULT_M6_DRIVE_TUNING;
}
