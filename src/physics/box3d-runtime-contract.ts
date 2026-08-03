import type { NativeInlineShimReceipt } from "./native-inline-compat.js";

export type {
  Box3DModule,
  EventsBuffer,
  b3BodyId,
  b3JointId,
  b3Quat,
  b3ShapeId,
  b3Vec3,
  b3WorldId,
} from "box3d.js";

export const BOX3D_RUNTIME_IDENTITY = Object.freeze({
  packageName: "box3d.js",
  packageVersion: "0.0.2",
  packageIntegrity: "sha512-ziC6IqMbMAYns1aJ7E1czhBEE2Kj+/QK9L16vMXOz7UaXKUj9gX7Za5ut+Dg3euHK6I/1brFSHOpmOwCI6FhYQ==",
  packageTarballSha256: "020ba0ca3ecfea79d8f776bdca982779e6d13f80ce437bc4a0dac18830bd62dd",
  bindingCommit: "2617a0ff763a60c9f17cee57c6ea72aab75a5077",
  engineCommit: "8441b4a06d6d09dcfb0b0f704df4d847d1437b92",
  buildVariant: "inline-single-threaded",
} as const);

export type F2ValidationId = "B0" | "B1" | "B2" | "B3" | "B4" | "B5";
export type ValidationStatus = "PASS" | "PENDING" | "FAIL";

export interface F2ValidationLevel {
  readonly id: F2ValidationId;
  readonly status: ValidationStatus;
  readonly summary: string;
  readonly details: readonly string[];
}

export interface Box3DRuntimeReceipt {
  readonly identity: typeof BOX3D_RUNTIME_IDENTITY;
  readonly engineVersion: Readonly<{ major: number; minor: number; revision: number }>;
  readonly defaultWorld: Readonly<{
    gravityY: number;
    contactHertz: number;
    contactDampingRatio: number;
    contactSpeed: number;
    enableContinuous: boolean;
    workerCount: number;
    internalValue: number;
  }>;
  readonly requiredExports: readonly string[];
  readonly nativeInlineShims: readonly NativeInlineShimReceipt[];
}

export interface ContactPointSnapshot {
  readonly separation: number;
  readonly normalImpulse: number;
  readonly totalNormalImpulse: number;
  readonly featureId: number;
  readonly triangleIndex: number;
  readonly persisted: boolean;
}

export interface MinimalContactSnapshot {
  readonly stepIndex: number;
  readonly bodyPosition: Readonly<{ x: number; y: number; z: number }>;
  readonly bodyLinearVelocity: Readonly<{ x: number; y: number; z: number }>;
  readonly bodyMass: number;
  readonly shapeMass: number;
  readonly computedSphereMass: number;
  readonly customMassRoundTrip: Readonly<{
    mass: number;
    center: Readonly<{ x: number; y: number; z: number }>;
    inertiaDiagonal: Readonly<{ x: number; y: number; z: number }>;
  }>;
  readonly counters: Readonly<{
    bodyCount: number;
    shapeCount: number;
    contactCount: number;
    jointCount: number;
    awakeContactCount: number;
  }>;
  readonly contactBeginEvents: number;
  readonly activeContacts: number;
  readonly activeManifolds: number;
  readonly activeContactPoints: number;
  readonly points: readonly ContactPointSnapshot[];
  readonly filterRoundTrip: Readonly<{ categoryBits: bigint; maskBits: bigint; groupIndex: number }>;
  readonly materialRoundTrip: Readonly<{ friction: number; rollingResistance: number; userMaterialId: bigint }>;
}

export interface FixtureDisposalReceipt {
  readonly disposed: true;
  readonly worldValidAfterDestroy: false;
}

export function almostEqual(a: number, b: number, tolerance = 1e-5): boolean {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
}

export function cloneVec3(
  value: Readonly<{ x: number; y: number; z: number }>,
): { x: number; y: number; z: number } {
  return { x: value.x, y: value.y, z: value.z };
}

export function createLevel(
  id: F2ValidationId,
  status: ValidationStatus,
  summary: string,
  details: readonly string[],
): F2ValidationLevel {
  return { id, status, summary, details: [...details] };
}
