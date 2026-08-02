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
  allWheelDrive: boolean;
  maxSteeringAngleDegrees: number;
  frontToeDeg: number;
  rearToeDeg: number;
  steeringHertz: number;
  steeringDampingRatio: number;
  maxSteeringTorque: number;
  rackFrictionBase: number;
  rackFrictionLoadCoeff: number;
  steeringFrictionTorque: number;
  steerInputDeadzone: number;
  rackCenteringHertz: number;
  uprightAssist: boolean;
  uprightHertz: number;
  uprightDampingRatio: number;
  bodyVisualModel: string;
  bodyVisualOffset: Vec3;
  frontSuspensionVisualModel: string;
  filterGroupIndex: number;
}

// Exact factory snapshot from Box3d_FunProject/main,
// samples/jozz_vehicle_m6_geometry.cpp::JozzVehicleM6DefaultConfig.
// Asset inputs: radius 1.46875*0.35, width 1.25*0.35, travel 2.0*0.35.
export const DEFAULT_M6_CONFIG: M6RigConfig = {
  chassisHalfExtents: { x: 1.55, y: 0.35, z: 0.55 },
  chassisDensity: 200,
  cgVerticalOffset: 0.15,
  axleHalfSpacing: 1.25,
  trackHalfWidth: 1.05,
  restDrop: 0.55,
  wishbone: {
    uprightHalfHeight: 0.18,
    kingpinOffset: 0.14,
    casterDeg: 5,
    kingpinInclinationDeg: 7,
    upperArmLength: 0.34,
    lowerArmLength: 0.46,
    armHalfSpread: 0.24,
    steeringArmBack: 0.17,
    ackermannTrapezoid: true,
    ackermannFraction: 0.6,
    coiloverTopHeight: 0.42,
    coiloverTopInboard: 0.12,
    restArmDroopDeg: 15,
  },
  knuckleMass: 28,
  armMass: 5,
  rackMass: 5,
  rackHalfWidth: 0.45,
  rackTravel: 0,
  rackServoForce: 12000,
  rackServoSpeedGain: 12,
  rackServoMaxSpeed: 1.2,
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
  suspensionPreloadFront: 0.07,
  suspensionPreloadRear: 0.07,
  arbFrontStiffness: 16000,
  arbRearStiffness: 10000,
  aeroDragArea: 0.9,
  maxDriveSpeed: 40,
  maxDriveTorque: 320,
  driveTaperStart: 0.6,
  brakeTorque: 650,
  coastTorque: 8,
  allWheelDrive: true,
  maxSteeringAngleDegrees: 32,
  frontToeDeg: 0,
  rearToeDeg: 0,
  steeringHertz: 14,
  steeringDampingRatio: 1,
  maxSteeringTorque: 700,
  rackFrictionBase: 40,
  rackFrictionLoadCoeff: 0.1,
  steeringFrictionTorque: 40,
  steerInputDeadzone: 0.02,
  rackCenteringHertz: 0,
  uprightAssist: false,
  uprightHertz: 0.4,
  uprightDampingRatio: 1,
  bodyVisualModel: 'rama_rurowa',
  bodyVisualOffset: { x: 0, y: 0, z: 0 },
  frontSuspensionVisualModel: 'rig_kierowniczy',
  filterGroupIndex: -19,
};
