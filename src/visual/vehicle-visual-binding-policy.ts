import type { VehicleVisualPackageV1 } from "./vehicle-visual-package.js";

function reject(message: string): never {
  throw new Error(`Vehicle visual binding policy V1 rejected: ${message}`);
}

function equals(
  actual: readonly number[],
  expected: readonly number[],
): boolean {
  return (
    actual.length === expected.length &&
    actual.every(
      (value, index) => Math.abs(value - expected[index]!) <= 1e-8,
    )
  );
}

export function assertVehicleVisualBindingPolicyV1(
  visual: VehicleVisualPackageV1,
): void {
  for (const binding of visual.bindings) {
    if (binding.source.kind !== "SEGMENT_STRETCH") {
      continue;
    }
    const referenceLength = binding.source.referenceLengthMeters;
    if (referenceLength < 0.001 || referenceLength > 10) {
      reject(
        `${binding.bindingId}.referenceLengthMeters must be within [0.001, 10] metres`,
      );
    }
    const local = binding.localFromSource;
    if (
      !equals(local.position, [0, 0, 0]) ||
      !equals(local.rotation, [0, 0, 0, 1]) ||
      !equals(local.scale, [1, 1, 1])
    ) {
      reject(
        `${binding.bindingId} stretch root must use identity localFromSource to avoid shear and ambiguous endpoints`,
      );
    }
  }
}
