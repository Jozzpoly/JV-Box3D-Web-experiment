# Wheel mode5 E2a2n — combined-mechanism closure

Date: 2026-09-03

## Question

Do the two independently identified mechanisms — rotational-anchor separation and off-axis tilt/manifold feedback — together account for the real-wheel spin-dependent flat-ground pathology?

## Scope

Diagnostic only. Same two-point P75 real `b3Wheel` flat-support carrier as E2a2/E2a2m:

- friction = 0,
- restitution = 0,
- 2 s rollout,
- `dt = 1/240`,
- 4 substeps,
- spin 0 / 40 rad/s around authored local Z,
- pinned Box3D vendor `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`.

The experiment crosses two previously validated diagnostic interventions:

1. normal body vs `motionLocks.angularX = true` + `angularY = true` (Z remains free),
2. pinned convex-wide separation vs E2a2k-r2 broad counterfactual removing the rotational-anchor contribution from geometric separation.

Workflow run: `33797095991`
Job: `100787310653`
Executed source head: `d1c6e5e022b62a1ecf68c1deb637946fb33e7ec1`

## Baseline matrix

### Free angular X/Y, pinned solver

Spin40 vs spin0:

- final Y delta: `-1.8835067749023438 mm`
- final Vy delta: `-0.03920627530408183 m/s`
- mean support impulse ratio: `1.992362179937743`
- point count: `1..2`
- feature-set changes: `231`
- final wheel-axis tilt: `0.01978234015405178 deg`
- final angular X: `-0.058968208730220795 rad/s`

### X/Y locked, pinned solver

Spin40 vs spin0:

- final Y delta: `-1.1464357376098633 mm`
- final Vy delta: `-0.03525479882955551 m/s`
- mean support impulse ratio: `1.975524044600432`
- point count: stable `2..2`
- feature-set changes: `0`
- wheel-axis tilt: `0`
- angular X/Y: `0`

This reproduces E2a2m.

## Broad no-rotational-separation matrix

### Free angular X/Y

Spin40 vs spin0:

- final Y delta: `-0.15866756439208984 mm`
- final Vy delta: `+0.004972150961634725 m/s`
- mean support impulse ratio: `1.2078119230167232`
- point count: `1..2`
- feature-set changes: `116`
- final wheel-axis tilt: `0.2654081881046295 deg`
- final angular X: `+0.15037032961845398 rad/s`
- final angular Y: `-0.017656784504652023 rad/s`

This reproduces the E2a2l-r2 broad-separation control and shows that removing the separation term alone does not suppress the off-axis feedback.

### X/Y locked + broad no-rotational-anchor separation

Spin40 vs spin0:

- final Y delta: **`-0.0002980232238769531 mm`** (`-0.298 micrometers`)
- final Vy delta: **`-6.860524166540927e-7 m/s`**
- mean support impulse ratio: **`1.000394201006796`**
- settled Y-range delta: `0.00011920928955078125 mm`
- point count: stable `2..2`
- feature-set changes: `0`
- contact ID changes: `0`
- contact-normal tilt: `0`
- wheel-axis tilt: `0`
- angular X/Y: `0`
- final angular Z: `40 rad/s`
- feature signature remains the same.

Spin0 and spin40 therefore converge to effectively the same flat-ground support behavior at the scale of this experiment.

## Verdict

**EXECUTED / TRUSTED EXPERIMENTAL EVIDENCE.**

Within the bounded E2a2 flat-support carrier, the combination of:

1. removing the rotational-anchor contribution from convex-wide geometric separation, and
2. suppressing off-axis angular X/Y feedback,

reduces the spin40-vs-spin0 discrepancy from millimeter / nearly-2x-impulse scale to sub-micrometer / ~0.04% impulse scale.

This strongly supports a **two-mechanism decomposition** of the observed flat-ground pathology:

- rotational-anchor separation is one causal mechanism;
- off-axis angular feedback, which drives manifold topology/feature churn, is the other major mechanism.

No substantial third vertical-bias mechanism is required by this specific experiment.

## Important non-conclusion

This does **not** validate either diagnostic intervention as a production design:

- globally removing anchor rotation from the solver is not justified;
- locking wheel-body angular X/Y would destroy legitimate steering/camber/tilt dynamics.

The next task is therefore not to ship the combined counterfactual. It is to identify a physically correct wheel-specific/contact-solver semantic that preserves legitimate non-axial orientation while removing artificial symmetry-breaking feedback under pure axial roll.

## Next discriminating frontier

Inspect how the two manifold points are solved. The pinned wide solver updates body angular state while iterating contact points, so a symmetric two-point support may be susceptible to point-order feedback. A bounded next falsifier is to reverse only the order of the two otherwise identical flat-wheel manifold points and test whether the sign/direction of off-axis tilt and associated residual reverses.

If point-order reversal reverses the off-axis response, sequential manifold-point ordering becomes a strong causal target for a principled block/symmetric wheel-contact solve. If it does not, the next candidate remains velocity-anchor/impulse kinematics.

## Evidence classification

- E2a2k-r2 rotational-anchor separation mechanism: **CAUSALLY CONFIRMED**.
- E2a2m off-axis tilt -> topology/feature churn: **CAUSALLY CONFIRMED**.
- combined two-mechanism closure on bounded flat carrier: **STRONGLY SUPPORTED / EXECUTED**.
- production solver policy: **NOT VALIDATED**.
- point-order causality: **NOT VALIDATED**.
- steer/camber behavior: **NOT VALIDATED**.
- product / Owner Preview acceptance: **NOT VALIDATED**.
