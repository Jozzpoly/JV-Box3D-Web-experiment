export const TERRAIN_CATEGORY = 0x2n;
export const OBJECT_CATEGORY = 0x1n;
export const ALL_CATEGORIES = 0xffff_ffff_ffff_ffffn;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface WishboneGeometry {
  uprightHalfHeight: number;
  kingpinOffset: number;
  casterDeg: number;
  kingpinInclinationDeg: number;
  upperArmLength: number;
  lowerArmLength: number;
  armHalfSpread: number;
  steeringArmBack: number;
  ackermannTrapezoid: boolean;
  ackermannFraction: number;
  coiloverTopHeight: number;
  coiloverTopInboard: number;
  restArmDroopDeg: number;
}

export interface M6RigConfig {
  chassisHalfExtents: Vec3;
  chassisDensity: number;
  cgVerticalOffset: number;
  axleHalfSpacing: number;
  trackHalfWidth: number;
  restDrop: number;
  wishbone: WishboneGeometry;
  knuckleMass: number;
  armMass: number;
  rackMass: number;
  rackHalfWidth: number;
  rackTravel: number;
  rackServoForce: number;
  rackServoSpeedGain: number;
  rackServoMaxSpeed: number;
  wheelRadius: number;
  wheelWidth: number;
  wheelDensity: number;
  wheelFriction: number;
  wheelRollingResistance: number;
  suspensionHertz: number;
  suspensionDampingRatio: number;
  frontSuspensionScale: number;
  rearSuspensionScale: number;
  reboundTravel: number;
  compressionTravel: number;
  suspensionPreloadFront: number;
  suspensionPreloadRear: number;
  arbFrontStiffness: number;
  arbRearStiffness: number;
  aeroDragArea: number;
  maxDriveSpeed: number;
  maxDriveTorque: number;
  driveTaperStart: number;
  brakeTorque: number;
  coastTorque: number;
  maxSteeringAngleDegrees: number;
  steeringHertz: number;
  steeringDampingRatio: number;
  rackFrictionBase: number;
  steerInputDeadzone: number;
  filterGroupIndex: number;
}

// Current web bootstrap contract: M6/M7 mechanisms, not the historical M5 rig.
// Values are deliberately isolated in one snapshot so a later export from JV can
// replace them without changing the runtime builder.
export const DEFAULT_M6_CONFIG: M6RigConfig = {
  chassisHalfExtents: { x: 1.55, y: 0.35, z: 0.55 },
  chassisDensity: 200,
  cgVerticalOffset: 0.15,
  axleHalfSpacing: 1.25,
  trackHalfWidth: 1.05,
  restDrop: 0.55,
  wishbone: {
    uprightHalfHeight: 0.26,
    kingpinOffset: 0.10,
    casterDeg: 8,
    kingpinInclinationDeg: 7,
    upperArmLength: 0.54,
    lowerArmLength: 0.64,
    armHalfSpread: 0.22,
    steeringArmBack: 0.20,
    ackermannTrapezoid: true,
    ackermannFraction: 0.6,
    coiloverTopHeight: 0.58,
    coiloverTopInboard: 0.30,
    restArmDroopDeg: 7,
  },
  knuckleMass: 18,
  armMass: 7,
  rackMass: 6,
  rackHalfWidth: 0.55,
  rackTravel: 0.075,
  rackServoForce: 4000,
  rackServoSpeedGain: 18,
  rackServoMaxSpeed: 1.3,
  wheelRadius: 0.5140625,
  wheelWidth: 0.4375,
  wheelDensity: 80,
  wheelFriction: 1.25,
  wheelRollingResistance: 0.02,
  suspensionHertz: 6,
  suspensionDampingRatio: 0.7,
  frontSuspensionScale: 1,
  rearSuspensionScale: 1,
  reboundTravel: 0.28,
  compressionTravel: 0.42,
  suspensionPreloadFront: 0.05,
  suspensionPreloadRear: 0.05,
  arbFrontStiffness: 6500,
  arbRearStiffness: 5200,
  aeroDragArea: 0.85,
  maxDriveSpeed: 52,
  maxDriveTorque: 950,
  driveTaperStart: 0.72,
  brakeTorque: 1500,
  coastTorque: 18,
  maxSteeringAngleDegrees: 32,
  steeringHertz: 14,
  steeringDampingRatio: 1,
  rackFrictionBase: 18,
  steerInputDeadzone: 0.04,
  filterGroupIndex: -18,
};
