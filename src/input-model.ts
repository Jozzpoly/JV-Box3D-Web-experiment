import type { DriveInput } from './input';

export interface DriverInputTelemetry {
  rawSteer: number;
  filteredSteer: number;
  steeringEngaged: boolean;
  centreHoldRemaining: number;
}

/**
 * Converts binary keyboard keys into a finite steering-wheel motion.
 *
 * This is deliberately a driver/input model, not a vehicle stabilizer:
 * it never reads yaw, slip, wheel forces, rack position or vehicle speed and
 * therefore cannot secretly counter-steer or self-align the car. It only
 * limits how fast a human command can move and represents the driver's hands
 * actively returning/holding the steering wheel at centre for a short time.
 */
export class KeyboardDriverInputModel {
  readonly telemetry: DriverInputTelemetry = {
    rawSteer: 0,
    filteredSteer: 0,
    steeringEngaged: false,
    centreHoldRemaining: 0,
  };

  private steer = 0;
  private previousRawSteer = 0;
  private centreHoldRemaining = 0;

  constructor(
    private readonly steerRatePerSecond = 2.25,
    private readonly releaseRatePerSecond = 3.5,
    private readonly centreHoldSeconds = 0.35,
  ) {}

  update(raw: DriveInput, deltaSeconds: number): DriveInput {
    const dt = Math.max(deltaSeconds, 0);
    const target = clamp(raw.steer, -1, 1);
    const releasedToCentre = target === 0 && this.previousRawSteer !== 0;
    if (releasedToCentre) this.centreHoldRemaining = this.centreHoldSeconds;
    if (target !== 0) this.centreHoldRemaining = 0;

    const returningToCentre = target === 0 || Math.abs(target) < Math.abs(this.steer);
    const changingDirection = target !== 0 && this.steer !== 0 && Math.sign(target) !== Math.sign(this.steer);
    const rate = returningToCentre || changingDirection
      ? this.releaseRatePerSecond
      : this.steerRatePerSecond;

    this.steer = moveTowards(this.steer, target, rate * dt);
    if (target === 0 && this.steer === 0 && this.centreHoldRemaining > 0) {
      this.centreHoldRemaining = Math.max(0, this.centreHoldRemaining - dt);
    }

    const steeringEngaged = target !== 0
      || Math.abs(this.steer) > 1e-6
      || this.centreHoldRemaining > 0;
    this.previousRawSteer = target;
    this.telemetry.rawSteer = target;
    this.telemetry.filteredSteer = this.steer;
    this.telemetry.steeringEngaged = steeringEngaged;
    this.telemetry.centreHoldRemaining = this.centreHoldRemaining;
    return {
      drive: raw.drive,
      steer: this.steer,
      brake: raw.brake,
      steeringEngaged,
    };
  }

  reset(): void {
    this.steer = 0;
    this.previousRawSteer = 0;
    this.centreHoldRemaining = 0;
    this.telemetry.rawSteer = 0;
    this.telemetry.filteredSteer = 0;
    this.telemetry.steeringEngaged = false;
    this.telemetry.centreHoldRemaining = 0;
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
