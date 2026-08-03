import type { DriveInput } from '../input';
import { computeRackStroke } from './m6-parity-controller';
import type { M6WebRig } from './m6-rig';
import { DEG, clamp } from './math';

export interface RackResponseTelemetry {
  mode: 'servo' | 'friction';
  handsOn: boolean;
  targetTranslation: number;
  translation: number;
  error: number;
  speed: number;
  stalledFrames: number;
  maxStalledFrames: number;
}

/**
 * Observes the rack without changing it.
 *
 * A stall is only counted while the assisted steering servo should be moving
 * toward a clearly different target. Hands-off stiction at standstill is not
 * classified as a stall because physical caster has no useful restoring force
 * without tyre motion.
 */
export class RackResponseWatchdog {
  readonly telemetry: RackResponseTelemetry = {
    mode: 'friction',
    handsOn: false,
    targetTranslation: 0,
    translation: 0,
    error: 0,
    speed: 0,
    stalledFrames: 0,
    maxStalledFrames: 0,
  };

  constructor(
    private readonly b3: any,
    private readonly rig: M6WebRig,
  ) {}

  update(input: DriveInput): RackResponseTelemetry {
    const cfg = this.rig.config;
    const handsOn = input.steeringEngaged ?? Math.abs(input.steer) > cfg.steerInputDeadzone;
    let targetTranslation = 0;

    if (handsOn) {
      const rackAngle = clamp(input.steer, -1, 1) * cfg.maxSteeringAngleDegrees * DEG;
      const stroke = computeRackStroke(
        cfg.wishbone,
        2 * cfg.axleHalfSpacing,
        cfg.trackHalfWidth,
        cfg.rackHalfWidth,
        Math.abs(rackAngle),
      );
      targetTranslation = clamp(
        (rackAngle >= 0 ? 1 : -1) * stroke,
        -cfg.rackTravel,
        cfg.rackTravel,
      );
    }

    const translation = this.b3.b3PrismaticJoint_GetTranslation(this.rig.rackJointId);
    const speed = this.b3.b3PrismaticJoint_GetSpeed(this.rig.rackJointId);
    const error = targetTranslation - translation;
    const errorThreshold = Math.max(0.0025, cfg.rackTravel * 0.04);
    const speedThreshold = 0.002;
    const stalled = handsOn
      && Math.abs(error) > errorThreshold
      && Math.abs(speed) < speedThreshold;

    if (stalled) this.telemetry.stalledFrames += 1;
    else this.telemetry.stalledFrames = 0;
    this.telemetry.maxStalledFrames = Math.max(
      this.telemetry.maxStalledFrames,
      this.telemetry.stalledFrames,
    );
    this.telemetry.mode = handsOn ? 'servo' : 'friction';
    this.telemetry.handsOn = handsOn;
    this.telemetry.targetTranslation = targetTranslation;
    this.telemetry.translation = translation;
    this.telemetry.error = error;
    this.telemetry.speed = speed;
    return this.telemetry;
  }

  resetPeak(): void {
    this.telemetry.stalledFrames = 0;
    this.telemetry.maxStalledFrames = 0;
  }
}
