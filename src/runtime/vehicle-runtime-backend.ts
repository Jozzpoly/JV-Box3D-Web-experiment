export type VehicleRuntimeBackendId =
  | "legacy_ts_m6"
  | "native_jv_wasm";

export type NativeParityStatus = "NOT_PROVEN" | "PROVEN";

export interface VehicleRuntimeBackendDescriptor {
  readonly id: VehicleRuntimeBackendId;
  readonly displayName: string;
  readonly productPhysicsAuthority: boolean;
  readonly nativeParity: NativeParityStatus;
  readonly commandContractVersion: 1;
  readonly traceContractVersion: 1;
  readonly visualFrameContractVersion: 1;
}

export function assertVehicleRuntimeBackendDescriptor(
  descriptor: VehicleRuntimeBackendDescriptor,
): void {
  if (descriptor.commandContractVersion !== 1) {
    throw new Error(
      `Unsupported vehicle command contract version: ${descriptor.commandContractVersion}`,
    );
  }
  if (descriptor.traceContractVersion !== 1) {
    throw new Error(
      `Unsupported vehicle trace contract version: ${descriptor.traceContractVersion}`,
    );
  }
  if (descriptor.visualFrameContractVersion !== 1) {
    throw new Error(
      `Unsupported vehicle visual frame contract version: ${descriptor.visualFrameContractVersion}`,
    );
  }
  if (
    descriptor.id === "legacy_ts_m6" &&
    (descriptor.productPhysicsAuthority || descriptor.nativeParity !== "NOT_PROVEN")
  ) {
    throw new Error(
      "legacy_ts_m6 cannot claim product physics authority or proven native parity.",
    );
  }
}

// Compatibility re-export. The concrete legacy descriptor has one source of
// truth in the M6 backend module; F4/browser code may continue importing it
// from the generic runtime boundary.
export { LEGACY_TS_M6_BACKEND } from "../vehicle/m6/legacy-ts-m6-backend.js";
