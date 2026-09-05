# Wheel mode5 RQ2C4 — engine-native hard-relax result

Date: 2026-09-05

Status: **TRUSTED EXECUTED / 0° CONTROL NOT PASSED / SLIP INSTRUMENT UNDER AUDIT**

Classification: **`RQ2C4_HARD_RELAX_CONTROL_SLIP_GATE_FAIL`**

This is bounded donor-carrier research evidence only. No yaw result exists from RQ2C4.

## Provenance

- executed source: `13dfe885f8d949a25fa057f0cd47c7d86b95d817`
- run: `33968699659`
- job: `101313264377`
- artifact: `9970270283`
- artifact digest: `sha256:3551d0009fee9d1da854dda31006fd279f537b8fa9160e6b3c80df39ff591a74`

## Trust barrier

- RQ2C3 direct-guide patch applied successfully;
- RQ2C4 `useBias`/hard-relax layer applied successfully;
- full pinned Box3D.js build/tests passed;
- frozen RH0 replay passed in the same composition;
- frozen RH0 replay validator passed;
- RQ2C4 0° physics executed;
- unchanged gate then failed;
- `+3.5°/-3.5°` was skipped.

## Only physical/solver difference from RQ2C3

The physical scenario is literally the RQ2C3 scenario function. RQ2C4 changes only scalar-guide participation in the existing solver lifecycle:

- biased solve: same RQ2C3 `constraintSoftness` positional correction;
- relax solve: `bias=0`, `massScale=1`, `impulseScale=0`, matching pinned hard equality semantics.

The historical angular ParallelJoint equations remain unchanged.

## Result

### Contact / vertical / angular guide — PASS

- contact dropouts: `0`;
- feature changes: `0`;
- point count: `1..1`;
- settled Y range: `0.688076 mm`;
- max `|Vy|`: `47.772776 mm/s`;
- max axle-axis error: `0.00852751° <= 0.035°`.

### Direct translational/heading guide — effectively exact

- max heading error: **`1.33403e-8°`** versus `0.035°` gate;
- max cross-heading speed: **`2.32831e-7 mm/s`**;
- max cross-track: `0.00683569 mm`;
- max plane separation: `0.00380223 mm`;
- final heading error: `0°`.

Relative to RQ2C3:

- max heading error fell from `0.04951397°` to `1.33403e-8°`;
- max cross-heading speed fell from `0.864176 mm/s` to `2.32831e-7 mm/s`;
- plane/cross-track behaviour stayed microscopic.

This strongly validates the engine-native hard-relax semantics for the direct local one-axis guide.

### Legacy rolling-slip gate — FAIL and unchanged from the angular-mount signature

- mean absolute legacy slip: **`0.00856552 mm/s`**;
- max absolute legacy slip: **`0.03468990 mm/s`** versus frozen `0.002 mm/s` gate;
- final legacy slip: `0.00572205 mm/s`.

The hard-relax change that eliminated cross-heading velocity did essentially nothing to this slip signature.

Critically, the earlier RQ2C0A 120 Hz ParallelJoint experiment — which still had a perfect world linear-Z lock and therefore could not develop translational cross-heading drift — already measured the same signature:

- mean slip `0.0085596 mm/s`;
- max slip `0.0346899 mm/s`;
- final slip `0.00578165 mm/s`;
- max axis tilt `0.008525°`.

This makes translational-guide failure an implausible explanation for the remaining legacy slip metric.

## Measurement concern

The legacy slip quantity is based on the upright/aligned approximation:

`slip_legacy = V_H + R0 * omega_A`

where `R0` is the static support radius measured at ideal orientation.

The donor outer-P75 support witness is axially offset (`~ -0.1333008 m`). With the measured ParallelJoint angular compliance (`~148.8 µrad`), rotating an off-axis support witness changes its tangential rigid-body velocity at first order. The rough scale `|axialOffset| * tilt * |omega|` is about `0.036 mm/s`, strikingly close to the observed `0.03469 mm/s` maximum.

This does **not** yet authorize changing or removing the frozen slip gate. It establishes a concrete instrument-validity hypothesis that should be tested directly.

## Next bounded move

Run diagnostic-only **RQ2C4D** on the exact RQ2C4 0° physics:

- preserve primary RQ2C4 metrics and require non-drift;
- at each step transform world-down into the actual wheel-local frame;
- obtain the actual geometric support witness with `b3ComputeWheelSupport`;
- obtain that local point's true rigid-body velocity with pinned `b3Body_GetLocalPointVelocity`;
- measure its longitudinal velocity `dot(vWitness, H)` as orientation-aware support-witness slip;
- retain the legacy slip in parallel;
- record support witness axial/radial position and relation to axis error.

No physics parameter, gate or yaw execution changes in this diagnostic.

If the orientation-aware witness slip is microscopic while legacy slip retains the ~`0.03469 mm/s` signature, classify the frozen legacy slip measurement as invalid for angularly compliant orientation apparatus and redesign the RQ2C slip gate from physically correct kinematics **before** any yaw qualification. Do not silently reinterpret the existing gate as passed.
