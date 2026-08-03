import type { DriveInput } from './input';

export interface DriverInputTelemetry {
  rawSteer: number;
  filteredSteer: number;
}

/**
 * Converts binary keyboard keys into a finite steering-wheel motion.
 *
 * This is deliberately a driver/input model, not a vehicle stabilizer:
 * it never reads yaw, slip, wheel forces or the rack position and therefore
 * cannot secretly counter-steer or self-align the car. It only limits how fast
 * a human command can move from centre to lock and back.
 */
export class KeyboardDriverInputModel {
  readonly telemetry: DriverInputTelemetry = {
    rawSteer: 0,
    filteredSteer: 0,
  };

  private steer = 0;

  constructor(
    private readonly steerRatePerSecond = 2.25,
    private readonly releaseRatePerSecond = 3.5,
  ) {}

  update(raw: DriveInput, deltaSeconds: number): DriveInput {
    const target = clamp(raw.steer, -1, 1);
    const returningToCentre = target === 0 || Math.abs(target) < Math.abs(this.steer);
    const changingDirection = target !== 0 && this.steer !== 0 && Math.sign(target) !== Math.sign(this.steer);
    const rate = returningToCentre || changingDirection
      ? this.releaseRatePerSecond
      : this.steerRatePerSecond;

    this.steer = moveTowards(this.steer, target, rate * Math.max(deltaSeconds, 0));
    this.telemetry.rawSteer = target;
    this.telemetry.filteredSteer = this.steer;
    return {
      drive: raw.drive,
      steer: this.steer,
      brake: raw.brake,
    };
  }

  reset(): void {
    this.steer = 0;
    this.telemetry.rawSteer = 0;
    this.telemetry.filteredSteer = 0;
  }
}

function moveTowards(current: number, target: number, maxDelta: number): number {
  const delta = target - current;
  if (Math.abs(delta) <= maxDelta) return target;
  return current + Math.sign(delta) * maxDelta;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
