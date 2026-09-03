# Wheel mode5 E2a2m — tilt-feedback falsifier

Date: 2026-09-03

## Question

Does solver-induced off-axis tilt cause the spin-dependent real-wheel pathology seen in E2a2, or does a substantial vertical bias remain when the wheel is forced to retain its authored spin axis?

## Scope

Diagnostic only. Same real two-point P75 `b3Wheel` flat-support carrier as E2a2:

- friction = 0,
- restitution = 0,
- 2 s rollout,
- `dt = 1/240`,
- 4 substeps,
- spin 0 / 40 rad/s around authored local Z,
- pinned Box3D vendor `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`.

Two variants are compiled into the same binary:

1. normal free angular X/Y body,
2. diagnostic body with `motionLocks.angularX = true` and `motionLocks.angularY = true`, while angular Z remains free.

Telemetry was expanded, without changing dynamics, to expose `finalAngularX`, `finalAngularY`, `finalAngularZ`, and actual world-space wheel-axis tilt.

Workflow run: `33796625481`
Job: `100785784648`
Executed source head: `ab2842d0526bbe6b4dae12c2d8932e29680f49ce`

## Executed result

### Free angular X/Y

Spin40 vs spin0:

- final Y delta: `-1.8835067749023438 mm`
- final Vy delta: `-0.03920627530408183 m/s`
- settled total impulse ratio: `1.992362179937743`
- settled Y-range delta: `0.015735626220703125 mm`
- spin40 manifold point count: `1..2`
- spin40 feature-set changes after impulse: `231`
- contact ID changes: `0`
- final world wheel-axis tilt: `0.01978234015405178 deg`
- final angular X: `-0.058968208730220795 rad/s`
- final angular Y: `-0.0034267455339431763 rad/s`
- final angular Z: `40.00080871582031 rad/s`
- contact normal remained vertical in the sampled metric (`maxNormalTiltDegAfterImpulse = 0`).

Spin0 remained essentially untilted and stable at two points.

### Angular X/Y locked; axial Z free

Spin40 vs spin0:

- final Y delta: `-1.1464357376098633 mm`
- final Vy delta: `-0.03525479882955551 m/s`
- settled total impulse ratio: `1.975524044600432`
- settled Y-range delta: `0.000059604644775390625 mm`
- spin40 manifold point count: `2..2`
- spin40 feature-set changes after impulse: `0`
- contact ID changes: `0`
- final world wheel-axis tilt: `0 deg`
- final angular X: `0`
- final angular Y: `0`
- final angular Z: `40 rad/s`
- contact normal remained vertical.

The locked spin40 manifold is therefore topologically stable and feature-stable, yet the mean support impulse remains almost twice the spin0 value and a large vertical offset/velocity bias remains.

## Verdict

**EXECUTED / TRUSTED EXPERIMENTAL EVIDENCE.**

E2a2m separates two mechanisms that had previously been entangled.

### 1. Off-axis tilt feedback is real and causally drives manifold churn

The free spin40 wheel develops measurable off-axis angular velocity and a small but real wheel-axis tilt. Suppressing only angular X/Y:

- removes the wheel-axis tilt,
- changes manifold topology from `1..2` to stable `2..2`,
- removes all feature-set churn (`231 -> 0`).

Therefore the topology/feature instability is not merely arbitrary collision noise. It is causally coupled to solver-induced off-axis motion.

### 2. Off-axis tilt is not the dominant cause of the vertical spin bias

Despite completely stabilizing the manifold topology and features, the tilt-locked spin40 case still shows:

- `-1.146 mm` final-height bias,
- `-0.0353 m/s` final vertical-velocity bias,
- `1.976x` mean support impulse.

Therefore it is falsified that the remaining E2a2 pathology can be explained by tilt/manifold churn alone.

## Current mechanism model

Evidence now supports at least two distinct contributions:

1. **rotational-anchor separation pathology** — causally established in E2a2k-r2 and strongly reduced by E2a2l / E2a2l-r2;
2. **tilt-feedback / manifold-topology loop** — causally established here by the X/Y motion-lock intervention.

It is not yet known whether those two mechanisms together explain the full real-wheel vertical bias or whether a third mechanism remains.

## Next discriminating experiment

Combine the two causal interventions on the same real wheel:

- angular X/Y locked, Z roll free,
- active convex-wide rotational-anchor separation contribution removed using the existing E2a2k-r2 counterfactual.

If spin40 then converges to spin0, the two-mechanism decomposition is strongly supported. If a substantial bias survives, at least one additional path remains, likely in velocity/Jacobian/anchor kinematics or impulse application rather than manifold topology.

## Evidence classification

- E2a2k-r2 rotational-anchor separation mechanism: **CAUSALLY CONFIRMED**.
- E2a2m off-axis tilt -> topology/feature churn: **CAUSALLY CONFIRMED**.
- tilt as sole cause of vertical spin bias: **FALSIFIED**.
- two mechanisms sufficient together: **NOT VALIDATED**.
- production solver policy: **NOT VALIDATED**.
- steer/camber qualification: **NOT VALIDATED**.
- product / Owner Preview acceptance: **NOT VALIDATED**.
