# Wheel mode5 E2a2l-r2 — broad rotational-separation control

Date: 2026-09-03

## Scope

Diagnostic control only. Same real two-point P75 `b3Wheel` carrier used by E2a2l, friction = 0, 2 s rollout, axial spin 0 / 40 rad/s.

Compared:

1. pinned baseline solver,
2. broad convex-wide counterfactual from E2a2k-r2 where the rotational anchor contribution is removed from geometric separation (`ds = dp + (rB - rA)`).

This is **not** a production proposal. It is a discriminator for whether the E2a2l residual remains because of the wheel-symmetry mapping itself or because additional spin-dependent behavior exists outside the rotational-anchor separation term.

Pinned Box3D vendor: `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`.

Workflow run: `33794305014`
Job: `100778171213`
Source head executed: `56d45f7e1bd90fb573c6cdf65526c043c96830ba`

## Executed result

### Pinned baseline

- final Y delta spin40 vs spin0: `-1.8835067749023438 mm`
- final Vy delta: `-0.03920627530408183 m/s`
- settled total impulse ratio spin40/spin0: `1.992362179937743`
- settled Y-range delta: `0.015735626220703125 mm`
- spin40 manifold point count: `1..2`
- spin40 feature-set changes after impulse: `231`
- contact ID changes: `0`

### Broad no-rotational-anchor separation counterfactual

- final Y delta spin40 vs spin0: `-0.15866756439208984 mm`
- final Vy delta: `+0.004972150961634725 m/s`
- settled total impulse ratio spin40/spin0: `1.2078119230167232`
- settled Y-range delta: `0.06693601608276367 mm`
- spin40 manifold point count: `1..2`
- spin40 feature-set changes after impulse: `116`
- contact ID changes: `0`

Spin0 remained essentially unchanged; the tiny mean-impulse difference is at numerical-noise scale.

## Comparison with E2a2l wheel-symmetry intervention

E2a2l wheel-symmetry separation produced:

- final Y delta: `-0.2079606056213379 mm`
- final Vy delta: `+0.008836377824422925 m/s`
- impulse ratio: `1.2842755223447666`
- feature-set changes: `94`
- manifold point count: `1..2`

The broad counterfactual is somewhat better on final Y, Vy and mean impulse, while the wheel-symmetry intervention produced fewer feature-set changes. Neither achieves axial-spin invariance.

## Verdict

**EXECUTED / TRUSTED EXPERIMENTAL EVIDENCE.**

The residual seen after E2a2l is **not explained solely by incomplete removal of rotational-anchor separation**. Even the stronger counterfactual that removes the entire rotational-anchor contribution from the active convex-wide separation path leaves a clear spin-dependent residual and persistent `1 <-> 2` manifold topology evolution.

Therefore it would be premature to tune the E2a2l symmetry mapping or move directly to steer/camber qualification as though the remaining error were only a symmetry-decomposition problem.

The strongest next frontier is the spin-dependent **manifold/contact evolution path**: determine where an axially symmetric `b3Wheel` contact is being refreshed/recomputed and why pure roll can still alter manifold topology / feature history despite an unchanged physical surface and even when rotational-anchor separation is disabled.

## Evidence classification

- E2a2k-r2 causal mechanism for generic convex rotational-anchor separation: **CAUSALLY CONFIRMED**.
- E2a2l wheel-scoped symmetry separation: **SUPPORTED, materially beneficial, not sufficient**.
- E2a2l-r2 broad no-rotational separation: **EXECUTED discriminator; residual persists**.
- production solver policy: **NOT VALIDATED**.
- steer/camber behavior under wheel symmetry: **NOT VALIDATED**.
- dynamic product / Owner Preview acceptance: **NOT VALIDATED**.
