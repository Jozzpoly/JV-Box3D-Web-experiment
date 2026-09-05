# Wheel mode5 RQ2C4D — orientation-aware slip instrument audit result

Date: 2026-09-05

Status: **TRUSTED DIAGNOSTIC / INSTRUMENT HYPOTHESIS FALSIFIED**

Classification: **`RQ2C4D_FIXED_RADIUS_ARTIFACT_NOT_PRIMARY`**

This is bounded donor-carrier research evidence only. It does not alter accepted product `main`, authorize yaw qualification, or relax the frozen rolling-slip gate.

## Question

Is the remaining RQ2C4 `~0.03469 mm/s` rolling-slip signature mainly an artifact of the legacy fixed-radius approximation

`V_H + R0 * omega_A`

when the wheel has small angular compliance and an axially offset support witness?

## Provenance

- executed source: `8a65846ff4e2a41a096221e5908f3899f694461b`
- workflow run: `33969662893`
- job: `101315812890`
- artifact: `9970554522`
- artifact digest: `sha256:483fc944f7ef55bf4e6f9ba4c400531cb0ab6137027312c334662d3e21bf949c`

## Trust barrier

RQ2C4D changed no physics. It transiently added read-only telemetry to exact RQ2C4 0-degree physics.

The successful run established:

1. pinned vendor/donor composition PASS;
2. full Box3D.js build/tests PASS;
3. frozen RH0 replay PASS;
4. exact RQ2C4 primary metrics reproduced within strict non-drift tolerances;
5. only then was actual support-witness velocity interpreted.

`+3.5°/-3.5°` did not execute.

## Instrument

For world down `D=(0,-1,0)`:

- transform `D` into the current wheel-local frame;
- obtain the actual geometric support witness with `b3ComputeWheelSupport`;
- obtain the attached point's true rigid-body velocity with `b3Body_GetLocalPointVelocity`;
- project that velocity onto the existing rolling heading.

The legacy fixed-radius slip remained recorded in parallel.

## Primary non-drift

RQ2C4 primary metrics reproduced, including:

- settled Y range: `0.688076019 mm`;
- max `|Vy|`: `47.7727763 mm/s`;
- max axle-axis error: `0.008527510°`;
- max heading error: `1.33403e-8°`;
- max cross-heading speed: `2.32831e-7 mm/s`;
- max cross-track: `0.006835691 mm`;
- max plane separation: `0.003802234 mm`;
- legacy mean absolute slip: `0.008565519 mm/s`;
- legacy max absolute slip: `0.034689903 mm/s`.

Therefore RQ2C4D is non-perturbing relative to the physical signal under audit.

## Actual support-witness result

- mean absolute actual-witness slip: **`0.008013017 mm/s`**;
- max absolute actual-witness slip: **`0.034093857 mm/s`**;
- final actual-witness slip: `0.003993511 mm/s`.

The actual witness retains **98.2818%** of the legacy maximum.

The fixed-radius formula is therefore slightly inaccurate, but it does **not** manufacture the blocker. The actual geometric support point itself has a real tangential residual of essentially the same scale.

## Decision

The RQ2C4 measurement concern is resolved:

- **falsified:** legacy fixed-radius approximation is the primary cause of the `~0.0347 mm/s` signature;
- **retained:** exact 0-degree actual support-witness slip remains far above the frozen `0.002 mm/s` gate;
- **not established:** what rigid-body contribution creates the real witness residual.

No gate is relaxed and yaw remains blocked.

## Next bounded move

Execute read-only **RQ2C4E angular-contribution localization** on the same exact RQ2C4D physics. Decompose authoritative support-witness velocity into COM translation, pure current-axle spin and non-spin/nutation contributions, with explicit rigid-body reconstruction integrity before interpretation.
