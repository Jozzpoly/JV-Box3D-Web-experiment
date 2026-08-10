import type { NativeFactorySnapshot } from "../../config/native-factory-receipt.js";
import type { b3Vec3 } from "../../physics/box3d-runtime-contract.js";

export interface M6TopologyConfig {
  readonly chassisHalfExtents: b3Vec3;
  readonly chassisDensity: number;
  readonly cgVerticalOffset: number;
  readonly axleHalfSpacing: number;
  readonly trackHalfWidth: number;
  readonly restDrop: number;
  readonly knuckleMass: number;
  readonly armMass: number;
  readonly rackMass: number;
  readonly rackHalfWidth: number;
  readonly rackTravel: number;
  readonly rackServoForce: number;
  readonly rackServoSpeedGain: number;
  readonly rackServoMaxSpeed: number;
  readonly rackFrictionBase: number;
  readonly rackFrictionLoadCoeff: number;
  readonly steeringHertz: number;
  readonly steeringDampingRatio: number;
  readonly wheelDensity: number;
  readonly wheelFriction: number;
  readonly wheelRollingResistance: number;
  readonly wheelRadius: number;
  readonly wheelWidth: number;
  readonly wheelEnvelopeMode: 3;
  readonly terrainCategoryBits: 2n;
  readonly maxDriveSpeed: number;
  readonly maxDriveTorque: number;
  readonly driveTaperStart: number;
  readonly brakeTorque: number;
  readonly coastTorque: number;
  readonly allWheelDrive: boolean;
  readonly suspensionHertz: number;
  readonly suspensionDampingRatio: number;
  readonly frontSuspensionScale: number;
  readonly rearSuspensionScale: number;
  readonly reboundTravel: number;
  readonly compressionTravel: number;
  readonly suspensionPreloadFront: number;
  readonly suspensionPreloadRear: number;
  readonly maxSteeringAngleDegrees: number;
  readonly rackCenteringHertz: 0;
  readonly uprightAssist: false;
  readonly wishbone: Readonly<{
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
  }>;
  readonly solver: NativeFactorySnapshot["solver"];
}

type JsonRecord = { readonly [key: string]: unknown };

function fail(path: string): never {
  throw new Error(`F4 receipt field rejected: ${path}`);
}

function object(value: unknown, path: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path);
  }
  return value as JsonRecord;
}

function at(root: JsonRecord, path: string): unknown {
  let current: unknown = root;
  for (const part of path.split(".")) {
    current = object(current, path)[part];
  }
  return current;
}

function number(root: JsonRecord, path: string): number {
  const value = at(root, path);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(path);
  }
  return value;
}

function positive(root: JsonRecord, path: string): number {
  const value = number(root, path);
  if (!(value > 0)) {
    fail(path);
  }
  return value;
}

function fraction(root: JsonRecord, path: string): number {
  const value = number(root, path);
  if (value < 0 || value >= 1) {
    fail(path);
  }
  return value;
}

function bool(root: JsonRecord, path: string): boolean {
  const value = at(root, path);
  if (typeof value !== "boolean") {
    fail(path);
  }
  return value;
}

function vec3(root: JsonRecord, path: string): b3Vec3 {
  const value = at(root, path);
  if (!Array.isArray(value) || value.length !== 3) {
    fail(path);
  }
  const [x, y, z] = value;
  if (
    ![x, y, z].every(
      (entry) => typeof entry === "number" && Number.isFinite(entry),
    )
  ) {
    fail(path);
  }
  return { x: x as number, y: y as number, z: z as number };
}

export function m6TopologyConfigFromReceipt(
  snapshot: NativeFactorySnapshot,
): M6TopologyConfig {
  const config = snapshot.config;
  if (
    snapshot.activeFeatures.frontRigType !== 1 ||
    snapshot.activeFeatures.rearRigType !== 1 ||
    snapshot.activeFeatures.wheelEnvelopeMode !== 3
  ) {
    fail("active topology");
  }
  if (
    snapshot.activeFeatures.rackCenteringAssistEnabled !== false ||
    snapshot.activeFeatures.uprightAssistEnabled !== false
  ) {
    fail("optional assists");
  }
  if (snapshot.derived.terrainCategoryBitsHex !== "0x2") {
    fail("derived.terrainCategoryBitsHex");
  }

  const rackCenteringHertz = number(config, "rackCenteringHertz");
  const uprightAssist = bool(config, "uprightAssist");
  const wheelEnvelopeMode = number(config, "wheelEnvelope.mode");
  if (rackCenteringHertz !== 0) {
    fail("rackCenteringHertz");
  }
  if (uprightAssist !== false) {
    fail("uprightAssist");
  }
  if (wheelEnvelopeMode !== 3) {
    fail("wheelEnvelope.mode");
  }

  return {
    chassisHalfExtents: vec3(config, "chassisHalfExtents"),
    chassisDensity: positive(config, "chassisDensity"),
    cgVerticalOffset: number(config, "cgVerticalOffset"),
    axleHalfSpacing: positive(config, "axleHalfSpacing"),
    trackHalfWidth: positive(config, "trackHalfWidth"),
    restDrop: positive(config, "restDrop"),
    knuckleMass: positive(config, "knuckleMass"),
    armMass: positive(config, "armMass"),
    rackMass: positive(config, "rackMass"),
    rackHalfWidth: positive(config, "rackHalfWidth"),
    rackTravel: snapshot.derived.rackTravel,
    rackServoForce: positive(config, "rackServoForce"),
    rackServoSpeedGain: positive(config, "rackServoSpeedGain"),
    rackServoMaxSpeed: positive(config, "rackServoMaxSpeed"),
    rackFrictionBase: number(config, "rackFrictionBase"),
    rackFrictionLoadCoeff: number(config, "rackFrictionLoadCoeff"),
    steeringHertz: positive(config, "steeringHertz"),
    steeringDampingRatio: number(config, "steeringDampingRatio"),
    wheelDensity: positive(config, "wheelDensity"),
    wheelFriction: positive(config, "wheelFriction"),
    wheelRollingResistance: number(config, "wheelRollingResistance"),
    wheelRadius: snapshot.derived.wheelRadius,
    wheelWidth: snapshot.derived.wheelWidth,
    wheelEnvelopeMode: 3,
    terrainCategoryBits: 2n,
    maxDriveSpeed: positive(config, "maxDriveSpeed"),
    maxDriveTorque: positive(config, "maxDriveTorque"),
    driveTaperStart: fraction(config, "driveTaperStart"),
    brakeTorque: positive(config, "brakeTorque"),
    coastTorque: positive(config, "coastTorque"),
    allWheelDrive: bool(config, "allWheelDrive"),
    suspensionHertz: positive(config, "suspensionHertz"),
    suspensionDampingRatio: number(config, "suspensionDampingRatio"),
    frontSuspensionScale: positive(config, "frontSuspensionScale"),
    rearSuspensionScale: positive(config, "rearSuspensionScale"),
    reboundTravel: positive(config, "reboundTravel"),
    compressionTravel: positive(config, "compressionTravel"),
    suspensionPreloadFront: number(config, "suspensionPreloadFront"),
    suspensionPreloadRear: number(config, "suspensionPreloadRear"),
    maxSteeringAngleDegrees: positive(
      config,
      "maxSteeringAngleDegrees",
    ),
    rackCenteringHertz: 0,
    uprightAssist: false,
    wishbone: {
      uprightHalfHeight: positive(
        config,
        "wishbone.uprightHalfHeight",
      ),
      kingpinOffset: positive(config, "wishbone.kingpinOffset"),
      casterDeg: number(config, "wishbone.casterDeg"),
      kingpinInclinationDeg: number(
        config,
        "wishbone.kingpinInclinationDeg",
      ),
      upperArmLength: positive(config, "wishbone.upperArmLength"),
      lowerArmLength: positive(config, "wishbone.lowerArmLength"),
      armHalfSpread: positive(config, "wishbone.armHalfSpread"),
      steeringArmBack: positive(config, "wishbone.steeringArmBack"),
      ackermannTrapezoid: bool(
        config,
        "wishbone.ackermannTrapezoid",
      ),
      ackermannFraction: number(
        config,
        "wishbone.ackermannFraction",
      ),
      coiloverTopHeight: positive(
        config,
        "wishbone.coiloverTopHeight",
      ),
      coiloverTopInboard: number(
        config,
        "wishbone.coiloverTopInboard",
      ),
      restArmDroopDeg: number(config, "wishbone.restArmDroopDeg"),
    },
    solver: snapshot.solver,
  };
}
