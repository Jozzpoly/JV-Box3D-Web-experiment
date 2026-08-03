export type RateSteeringProfileId =
  | "precision_0_06"
  | "low_0_12"
  | "reference_0_21"
  | "high_0_36";

export interface RateSteeringProfile {
  readonly id: RateSteeringProfileId;
  readonly rackRateMetersPerSecond: number;
  readonly maxTargetLeadMeters: number;
  readonly productDefaultApproved: false;
}

const MAX_TARGET_LEAD_METERS = 0.008;

export const RATE_STEERING_PROFILES = Object.freeze([
  {
    id: "precision_0_06",
    rackRateMetersPerSecond: 0.06,
    maxTargetLeadMeters: MAX_TARGET_LEAD_METERS,
    productDefaultApproved: false,
  },
  {
    id: "low_0_12",
    rackRateMetersPerSecond: 0.12,
    maxTargetLeadMeters: MAX_TARGET_LEAD_METERS,
    productDefaultApproved: false,
  },
  {
    id: "reference_0_21",
    rackRateMetersPerSecond: 0.21,
    maxTargetLeadMeters: MAX_TARGET_LEAD_METERS,
    productDefaultApproved: false,
  },
  {
    id: "high_0_36",
    rackRateMetersPerSecond: 0.36,
    maxTargetLeadMeters: MAX_TARGET_LEAD_METERS,
    productDefaultApproved: false,
  },
] as const satisfies readonly RateSteeringProfile[]);

export const INITIAL_RATE_STEERING_PROFILE_ID: RateSteeringProfileId =
  "reference_0_21";

export function rateSteeringProfile(
  id: RateSteeringProfileId,
): RateSteeringProfile {
  const profile = RATE_STEERING_PROFILES.find(
    (candidate) => candidate.id === id,
  );
  if (profile === undefined) {
    throw new Error(`Unknown RATE steering profile: ${id}`);
  }
  return profile;
}
