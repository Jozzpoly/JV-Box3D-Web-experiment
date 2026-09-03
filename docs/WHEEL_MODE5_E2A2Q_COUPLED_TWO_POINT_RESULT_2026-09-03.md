# Wheel mode5 E2a2q — coupled two-point mini-LCP result

Date: 2026-09-03

Status: **TRUSTED EXECUTED EXPERIMENTAL EVIDENCE**

Scope: diagnostic-only broad flat-ground support experiment on the recovered P75 wheel carrier. This is **not** accepted product geometry, not Owner Preview authority, and not a production solver change.

## Authority and run

- branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
- E2a2q r2 source head: `1b93ce520929a7dacfb1dec74bd2a919cc4f3790`
- successful workflow run: `33802198464`
- successful job: `100804126806`
- pinned Box3D.js: `2617a0ff763a60c9f17cee57c6ea72aab75a5077`
- pinned Box3D: `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`

The previous E2a2q run `33801754289` is **APPARATUS-INVALID for the coupled intervention** because the first patch used SIMD mask helpers from a newer upstream API. Its sequential and Jacobi controls did execute, but no coupled physics result was produced. R2 adapts mask composition to the exact pinned SIMD API without changing the coupled equations.

## Experimental matrix

One workflow reconstructs all compared variants from the same pinned source/toolchain:

1. sequential no-rotation baseline,
2. E2a2p simultaneous/Jacobi control,
3. restore the exact saved sequential `contact_solver.c`,
4. compose the E2a2q coupled 2×2 normal mini-LCP,
5. reverse only the two wheel-plane manifold points and rebuild.

Controls remain:

- free wheel,
- X/Y angular-lock wheel,
- spin 0 and 40 rad/s,
- friction 0,
- 2 s / 480 outer steps / 4 substeps,
- one-point matched-sphere control.

The coupled path exposes a diagnostic execution counter. The experiment fails if the wheel does not exercise the pair path or if the matched sphere does.

## Sequential control reproduced

Spin-40 vs spin-0, free wheel:

- final Y delta: `-0.15866756439208984 mm`
- final Vy delta: `+0.004972150961634725 m/s`
- settled normal-impulse ratio: `1.2078119230167232`
- feature-set changes after impulse: `116`
- minimum point count: `1`
- final axis tilt: `0.2654081881046295 deg`
- final angular X: `0.15037032961845398 rad/s`
- final angular Y: `-0.017656784504652023 rad/s`

This reproduces the already-known sequential order-selected pathology under the no-rot separation apparatus.

## Jacobi control reproduced

Spin-40 vs spin-0, free wheel:

- final Y delta: `-0.00017881393432617188 mm`
- final Vy delta: `-0.000002307587351424445 m/s`
- settled normal-impulse ratio: `1.000368854468691`
- feature-set changes after impulse: `0`
- point count: always `2`
- final axis tilt: `0 deg`
- final angular X/Y: `0 / 0`
- final angular Z: `40 rad/s`

This independently reproduces E2a2p in the E2a2q workflow.

## Coupled 2×2 result

The mini-LCP uses the pinned 3D normal Jacobian. For two contact points i,j:

`Kij = mA + mB + (rAi × n) · IA^-1(rAj × n) + (rBi × n) · IB^-1(rBj × n)`

with the existing Box3D soft-step terms preserved in the vector residual. One-point/ineligible lanes fall back to the scalar/Jacobi path.

Spin-40 vs spin-0, free wheel:

- final Y delta: `-0.00035762786865234375 mm`
- final Vy delta: `-1.0663825378287584e-10 m/s`
- settled normal-impulse ratio: `1.0003583888454626`
- settled Y-range delta: `0.000059604644775390625 mm`
- feature-set changes after impulse: `0`
- contact-ID changes: `0`
- point count: always `2`
- final axis tilt: `0 deg`
- final angular X/Y: `0 / 0`
- final angular Z: `40 rad/s`

Relative to the Jacobi control for spin 40:

- final Y shift: `-0.00002759695053100586 m` (~`-27.597 µm`)
- final Vy shift: `-6.196661388457869e-7 m/s`
- final X/Y angular difference: `0 / 0`
- axis-tilt difference: `0 deg`
- settled impulse-mean shift: `+7.539987564170181e-8`

The coupled result is therefore not byte-identical to Jacobi, but it preserves the closure of the observed order-selected instability in this symmetric flat-support case.

## Proof that the block path actually ran

Pair-solve counter per run:

- free spin 0: `3840`
- free spin 40: `3840`
- locked spin 0: `3840`
- locked spin 40: `3840`
- matched sphere spin 0: `0`
- matched sphere spin 40: `0`

Thus the coupled result is not a fallback artifact, and the one-point control does not enter the block path.

## Point-order reversal

After reversing only the two wheel-plane support points, the coupled result is exactly identical to coupled canonical in all reported metrics:

- final Y delta from canonical: `0`
- final Vy delta: `0`
- final angular X/Y difference: `0 / 0`
- axis-tilt difference: `0 deg`
- settled impulse-mean difference: `0`
- locked final-Y difference: `0`
- locked impulse-mean difference: `0`

Pair-solve usage also remains exactly `3840` for every wheel run and `0` for both sphere controls.

## Interpretation

E2a2q strengthens E2a2p substantially:

1. the broad-support instability is not merely removed by an uncoupled Jacobi approximation;
2. a coupled two-point solve derived from the pinned 3D contact Jacobian also removes the observed order-selected tilt/feature churn;
3. reversing the two contact points produces exact invariance in this symmetric plateau case;
4. the result was produced by the block path itself, not by a fallback;
5. one-point matched-sphere behavior remains outside the block path and unchanged.

This is strong **causal solver evidence**, but it is not yet a general solution. The current case is highly symmetric: equal flat-support geometry, centered body, equal contact regime and identical broad plane support.

## What E2a2q does NOT validate

Still **NOT VALIDATED**:

- order invariance for asymmetric two-point support,
- unequal effective masses / unequal lever arms,
- unequal separations or biased loading across the pair,
- transitions between two-point and one-point support,
- non-flat outer profile contacts,
- inner/bore/side contacts,
- frictional/tangent coupling,
- general native wheel manifold production suitability,
- product/Owner acceptance,
- production integration of this diagnostic solver.

## Next bounded gate

The next useful falsifier is an **asymmetric two-point support** case that preserves a genuine two-point manifold while intentionally breaking left/right symmetry. Canonical and reversed ordering should then be compared under the same coupled block solve with one-point controls retained.

Prefer an asymmetry that changes the two contacts' lever arms/effective masses without simultaneously opening a new geometry/manifold campaign. If that remains invariant, only then broaden toward unequal separation/loading and one↔two-point transitions.
