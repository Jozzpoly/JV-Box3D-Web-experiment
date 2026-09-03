# Wheel mode5 E2a2o — manifold point-order falsifier

Date: 2026-09-03

## Question

Does sequential ordering of the two otherwise symmetric flat-wheel support points causally choose the direction of the off-axis tilt feedback observed after the rotational-separation confounder is removed?

## Scope

Diagnostic only. Same two-point P75 real `b3Wheel` flat-support carrier as E2a2n:

- friction = 0,
- restitution = 0,
- 2 s rollout,
- `dt = 1/240`,
- 4 substeps,
- spin 0 / 40 rad/s around authored local Z,
- pinned Box3D vendor `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`,
- E2a2k-r2 broad no-rotational-anchor geometric-separation counterfactual active in both compared builds.

The only second-build intervention is inside `b3CollideWheelAndPlane`: when exactly two support points are returned, swap `manifold->points[0]` and `[1]` after their positions, separations and feature pairs have been computed. No point geometry, separation, feature identity, normal, mass, velocity, solver formula or time step is changed.

The same runner also executes X/Y tilt-locked controls.

First workflow attempt `33797665832` / job `100789146054` is **APPARATUS-INVALID**: the reversal locator excluded the end of `b3CollideWheelAndPlane`, so the fail-fast patch stopped before the reversed build. Its canonical control reproduced the existing E2a2n no-rot result but provides no point-order comparison.

Valid workflow run: `33797986367`
Job: `100790212003`
Executed source head: `f757e84f768aca1d21aad6172f392aaaf8ce08cd`

## Canonical point order — no-rot separation

### Free X/Y, spin40 vs spin0

- final Y delta: `-0.15866756439208984 mm`
- final Vy delta: `+0.004972150961634725 m/s`
- mean support impulse ratio: `1.2078119230167232`
- point count: `1..2`
- feature-set changes: `116`
- contact ID changes: `0`
- final axis tilt magnitude: `0.2654081881046295 deg`
- final angular X: `+0.15037032961845398 rad/s`
- final angular Y: `-0.017656784504652023 rad/s`
- final angular Z: `39.99922180175781 rad/s`

### X/Y locked

- final Y delta: `-0.0002980232238769531 mm`
- final Vy delta: `-6.860524166540927e-7 m/s`
- mean support impulse ratio: `1.000394201006796`
- stable `2..2` manifold
- `0` feature churn
- `0` axis tilt
- angular X/Y = `0`
- angular Z = `40`.

## Reversed point order — no-rot separation

### Free X/Y, spin40 vs spin0

All scalar support/pathology metrics are unchanged from canonical order:

- final Y delta: `-0.15866756439208984 mm`
- final Vy delta: `+0.004972150961634725 m/s`
- mean support impulse ratio: `1.2078119230167232`
- point count: `1..2`
- feature-set changes: `116`
- contact ID changes: `0`
- final axis tilt magnitude: `0.2654081881046295 deg`
- final angular Z: `39.99922180175781 rad/s`.

But the off-axis angular response reverses sign exactly:

- final angular X: `-0.15037032961845398 rad/s`
- final angular Y: `+0.017656784504652023 rad/s`.

Even the tiny spin0 X component reverses sign:

- canonical: `+0.00000525575342180673 rad/s`
- reversed: `-0.00000525575342180673 rad/s`.

### X/Y locked

The locked comparison remains numerically identical to the canonical-order locked comparison, including:

- `-0.0002980232238769531 mm` final Y delta,
- `1.000394201006796` impulse ratio,
- stable `2..2` points,
- zero feature churn,
- zero tilt,
- angular Z = `40`.

## Verdict

**EXECUTED / TRUSTED EXPERIMENTAL EVIDENCE.**

Reversing only the order of the symmetric support-point pair reverses the sign of the generated off-axis angular response while preserving its magnitude and every measured scalar support metric. The tilt-locked control is invariant.

Therefore manifold point ordering **causally selects the direction of the symmetry-breaking off-axis response** in this bounded flat-wheel case.

This strongly supports the hypothesis that the sequential per-point contact solve is order-sensitive for a symmetric two-point wheel support. The result is substantially stronger than a correlation with feature churn because the contact geometry, separations and feature identities are unchanged.

## Important limitation

E2a2o does **not** yet prove that a particular block/symmetric solver formulation is correct, nor does it show that point ordering alone determines the magnitude of the spin-dependent support residual. The scalar residual is unchanged under reversal; order controls the direction of the off-axis branch, while E2a2n shows that suppressing the resulting off-axis degree of freedom removes that branch's contribution when combined with the separation intervention.

## Next frontier

Construct a bounded order-invariant two-point normal-solve falsifier for the symmetric wheel support. Prefer an actual simultaneous/block treatment or another formulation whose result is mathematically invariant to swapping the two points; avoid choosing a fixed canonical order as a pseudo-fix.

Required controls:

- canonical vs reversed input order must converge to the same state,
- ordinary one-point contacts must remain unchanged,
- pure axial wheel spin must retain angular Z,
- no artificial X/Y body lock,
- the broad no-rot separation counterfactual may remain active initially to isolate the second mechanism,
- then independently recombine with wheel-scoped symmetry separation rather than the global no-rot diagnostic.

## Evidence classification

- rotational-anchor separation mechanism: **CAUSALLY CONFIRMED** (E2a2k-r2).
- off-axis tilt -> topology/feature churn: **CAUSALLY CONFIRMED** (E2a2m).
- two-mechanism bounded closure: **STRONGLY SUPPORTED / EXECUTED** (E2a2n).
- manifold point order -> sign of off-axis symmetry breaking: **CAUSALLY CONFIRMED** (E2a2o).
- simultaneous/block two-point solve as correct remedy: **NOT VALIDATED**.
- production wheel-specific solver semantics: **NOT VALIDATED**.
- steer/camber behavior: **NOT VALIDATED**.
- product / Owner Preview acceptance: **NOT VALIDATED**.
