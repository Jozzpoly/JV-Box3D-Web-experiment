import { DEFAULT_M6_CONFIG, type M6RigConfig, type Vec3 } from './rig-config';

export interface RuntimeConfigResult {
  config: M6RigConfig;
  source: string;
  warnings: string[];
}

const SCALAR_FIELDS: (keyof M6RigConfig)[] = [
  'chassisDensity',
  'cgVerticalOffset',
  'axleHalfSpacing',
  'trackHalfWidth',
  'restDrop',
  'knuckleMass',
  'armMass',
  'rackMass',
  'rackHalfWidth',
  'rackServoForce',
  'rackServoSpeedGain',
  'rackServoMaxSpeed',
  'wheelDensity',
  'wheelFriction',
  'wheelRollingResistance',
  'suspensionHertz',
  'suspensionDampingRatio',
  'frontSuspensionScale',
  'rearSuspensionScale',
  'reboundTravel',
  'compressionTravel',
  'suspensionPreloadFront',
  'suspensionPreloadRear',
  'arbFrontStiffness',
  'arbRearStiffness',
  'aeroDragArea',
  'maxDriveSpeed',
  'maxDriveTorque',
  'driveTaperStart',
  'brakeTorque',
  'coastTorque',
  'maxSteeringAngleDegrees',
  'frontToeDeg',
  'rearToeDeg',
  'steeringHertz',
  'steeringDampingRatio',
  'maxSteeringTorque',
  'rackFrictionBase',
  'rackFrictionLoadCoeff',
  'steeringFrictionTorque',
  'steerInputDeadzone',
  'rackCenteringHertz',
  'uprightHertz',
  'uprightDampingRatio',
];

const BOOLEAN_FIELDS: (keyof M6RigConfig)[] = [
  'allWheelDrive',
  'uprightAssist',
];

const WISHBONE_FIELDS = [
  'uprightHalfHeight',
  'kingpinOffset',
  'casterDeg',
  'kingpinInclinationDeg',
  'upperArmLength',
  'lowerArmLength',
  'armHalfSpread',
  'steeringArmBack',
  'ackermannFraction',
  'coiloverTopHeight',
  'coiloverTopInboard',
  'restArmDroopDeg',
] as const;

export async function loadRuntimeM6Config(): Promise<RuntimeConfigResult> {
  const config = structuredClone(DEFAULT_M6_CONFIG);
  const warnings: string[] = [];

  try {
    const response = await fetch('./assets/config/current-session.json', { cache: 'no-store' });
    if (response.status === 404) {
      return { config, source: 'factory/uliczny', warnings };
    }
    if (!response.ok) {
      warnings.push(`Nie udało się odczytać sesji JV: HTTP ${response.status}.`);
      return { config, source: 'factory/uliczny', warnings };
    }

    const raw = await response.json() as unknown;
    if (!isRecord(raw)) throw new Error('root JSON nie jest obiektem');
    applyNativeSession(config, raw, warnings);
    sanitizeConfig(config, warnings);
    return { config, source: 'lokalny jozz_vehicle_m6_session.json', warnings };
  } catch (error) {
    warnings.push(`Sesja JV została odrzucona: ${error instanceof Error ? error.message : String(error)}`);
    return { config, source: 'factory/uliczny', warnings };
  }
}

function applyNativeSession(config: M6RigConfig, raw: Record<string, unknown>, warnings: string[]): void {
  for (const field of SCALAR_FIELDS) assignFiniteNumber(config, raw, field, warnings);
  for (const field of BOOLEAN_FIELDS) assignBoolean(config, raw, field);

  const chassisHalfExtents = readVec3(raw.chassisHalfExtents);
  if (chassisHalfExtents) config.chassisHalfExtents = chassisHalfExtents;
  const bodyVisualOffset = readVec3(raw.bodyVisualOffset);
  if (bodyVisualOffset) config.bodyVisualOffset = bodyVisualOffset;

  if (typeof raw.bodyVisualModel === 'string') config.bodyVisualModel = raw.bodyVisualModel;
  if (typeof raw.frontSuspensionVisualModel === 'string') {
    config.frontSuspensionVisualModel = raw.frontSuspensionVisualModel;
  }

  if (isRecord(raw.wishbone)) {
    for (const field of WISHBONE_FIELDS) {
      const value = raw.wishbone[field];
      if (typeof value === 'number' && Number.isFinite(value)) config.wishbone[field] = value;
    }
    if (typeof raw.wishbone.ackermannTrapezoid === 'boolean') {
      config.wishbone.ackermannTrapezoid = raw.wishbone.ackermannTrapezoid;
    }
  }

  if (isRecord(raw.wheelEnvelope)) {
    if (isFiniteNumber(raw.wheelEnvelope.radius)) config.wheelRadius = raw.wheelEnvelope.radius;
    if (isFiniteNumber(raw.wheelEnvelope.width)) config.wheelWidth = raw.wheelEnvelope.width;
    const mode = raw.wheelEnvelope.mode;
    if (typeof mode === 'number' && mode !== 3) {
      warnings.push(`Web obsługuje obecnie tylko split sphere/sidewall; sesja używa wheelEnvelope.mode=${mode}.`);
    }
  }

  const frontRigType = raw.frontRigType;
  const rearRigType = raw.rearRigType;
  if ((typeof frontRigType === 'number' && frontRigType !== 1)
      || (typeof rearRigType === 'number' && rearRigType !== 1)) {
    warnings.push(
      `Webowy PoC obsługuje tylko double wishbone (1/1), a sesja ma ${String(frontRigType)}/${String(rearRigType)}.`,
    );
  }
}

function sanitizeConfig(config: M6RigConfig, warnings: string[]): void {
  clampField(config, 'axleHalfSpacing', 0.3, 6, warnings);
  clampField(config, 'trackHalfWidth', 0.3, 4, warnings);
  clampField(config, 'restDrop', 0.05, 3, warnings);
  clampField(config, 'wheelRadius', 0.05, 3, warnings);
  clampField(config, 'wheelWidth', 0.03, 2, warnings);
  clampField(config, 'chassisDensity', 10, 5000, warnings);
  clampField(config, 'wheelDensity', 5, 2000, warnings);
  clampField(config, 'knuckleMass', 1, 500, warnings);
  clampField(config, 'armMass', 0.5, 200, warnings);
  clampField(config, 'rackMass', 0.5, 200, warnings);
  clampField(config, 'compressionTravel', 0.02, 2, warnings);
  clampField(config, 'reboundTravel', 0.02, 2, warnings);
  clampField(config, 'suspensionHertz', 0.2, 60, warnings);
  clampField(config, 'suspensionDampingRatio', 0, 20, warnings);
  clampField(config, 'frontToeDeg', -5, 5, warnings);
  clampField(config, 'rearToeDeg', -5, 5, warnings);
  clampField(config, 'steeringHertz', 0.5, 60, warnings);
  clampField(config, 'rackFrictionBase', 0, 1000, warnings);
  clampField(config, 'rackFrictionLoadCoeff', 0, 1, warnings);
  clampField(config, 'maxSteeringAngleDegrees', 15, 60, warnings);
  config.wishbone.restArmDroopDeg = clampNumber(config.wishbone.restArmDroopDeg, 0, 16);
}

function assignFiniteNumber(
  config: M6RigConfig,
  raw: Record<string, unknown>,
  field: keyof M6RigConfig,
  warnings: string[],
): void {
  const value = raw[field as string];
  if (value === undefined) return;
  if (!isFiniteNumber(value)) {
    warnings.push(`Pole ${String(field)} nie jest skończoną liczbą i zostało pominięte.`);
    return;
  }
  (config as unknown as Record<string, unknown>)[field as string] = value;
}

function assignBoolean(config: M6RigConfig, raw: Record<string, unknown>, field: keyof M6RigConfig): void {
  const value = raw[field as string];
  if (typeof value === 'boolean') {
    (config as unknown as Record<string, unknown>)[field as string] = value;
  }
}

function clampField(
  config: M6RigConfig,
  field: keyof M6RigConfig,
  min: number,
  max: number,
  warnings: string[],
): void {
  const record = config as unknown as Record<string, unknown>;
  const value = record[field as string];
  if (typeof value !== 'number') return;
  const clamped = clampNumber(value, min, max);
  if (clamped !== value) warnings.push(`${String(field)}: ${value} → ${clamped}`);
  record[field as string] = clamped;
}

function readVec3(value: unknown): Vec3 | null {
  if (Array.isArray(value) && value.length >= 3
      && value.slice(0, 3).every(isFiniteNumber)) {
    return { x: value[0] as number, y: value[1] as number, z: value[2] as number };
  }
  if (isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y) && isFiniteNumber(value.z)) {
    return { x: value.x, y: value.y, z: value.z };
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
