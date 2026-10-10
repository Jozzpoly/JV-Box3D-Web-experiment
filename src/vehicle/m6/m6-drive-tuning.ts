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

function inRange(value: number, range: Readonly<{ min: number; max: number }>): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max;
}

export function getM6DriveTuning(): M6DriveTuning {
  return current;
}

export function setM6DriveTuning(next: M6DriveTuning): void {
  if (!inRange(next.torqueScale, M6_DRIVE_TORQUE_SCALE_RANGE)) {
    throw new RangeError(`Drive torque scale out of range: ${String(next.torqueScale)}`);
  }
  if (!inRange(next.brakeScale, M6_BRAKE_SCALE_RANGE)) {
    throw new RangeError(`Brake scale out of range: ${String(next.brakeScale)}`);
  }
  current = Object.freeze({
    torqueScale: next.torqueScale,
    brakeScale: next.brakeScale,
  });
}

export function resetM6DriveTuning(): void {
  current = DEFAULT_M6_DRIVE_TUNING;
}
