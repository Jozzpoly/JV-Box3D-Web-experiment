import type { VehicleRuntimeBackendDescriptor } from "../../runtime/vehicle-runtime-backend.js";

export const LEGACY_TS_M6_BACKEND_ID = "legacy_ts_m6" as const;
export const LEGACY_TS_M6_PARITY_STATUS = "NOT_PROVEN" as const;

export interface LegacyTsM6KnownMismatch {
  readonly id: string;
  readonly nativeMeaning: string;
  readonly legacyMeaning: string;
  readonly consequence: string;
}

export interface LegacyTsM6BackendContract
  extends VehicleRuntimeBackendDescriptor {
  readonly id: typeof LEGACY_TS_M6_BACKEND_ID;
  readonly nativeParity: typeof LEGACY_TS_M6_PARITY_STATUS;
  readonly role: "REFERENCE_BROWSER_FIXTURE";
  readonly productPhysicsAuthority: false;
  readonly acceptsNewProductPhysics: false;
  readonly knownMismatches: readonly LegacyTsM6KnownMismatch[];
}

export const LEGACY_TS_M6_BACKEND = Object.freeze({
  id: LEGACY_TS_M6_BACKEND_ID,
  displayName: "Legacy TypeScript M6 reference fixture",
  role: "REFERENCE_BROWSER_FIXTURE",
  productPhysicsAuthority: false,
  nativeParity: LEGACY_TS_M6_PARITY_STATUS,
  acceptsNewProductPhysics: false,
  commandContractVersion: 1,
  traceContractVersion: 1,
  visualFrameContractVersion: 1,
  knownMismatches: Object.freeze([
    Object.freeze({
      id: "drive.maxDriveSpeed-semantics",
      nativeMeaning:
        "Wheel motor rev limit in rad/s; throttle scales available torque and wheel spin drives torque taper.",
      legacyMeaning:
        "Chassis-linear target in m/s; throttle scales target speed and chassis speed drives torque taper.",
      consequence:
        "The reference backend can drive deterministically while remaining behaviorally different from native JV.",
    }),
  ]),
} as const satisfies LegacyTsM6BackendContract);
