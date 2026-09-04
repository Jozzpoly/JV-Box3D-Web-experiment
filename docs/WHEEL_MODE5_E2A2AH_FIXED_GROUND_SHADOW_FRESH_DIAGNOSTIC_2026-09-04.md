# Wheel mode5 E2a2ah — fixed-ground shadow-fresh diagnostic

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Source commit: `0ae945355fd8f517c6b8270793fe642b3b44da8a`
Workflow run: `33865558771`
Job: `100999489386`

## Scope

E2a2ah is a **non-perturbing diagnostic**, not a product-physics acceptance test and not a recycler fix.

It uses the validated fixed-road `2 -> 1` apparatus from E2a2af/ag at:

- wheel spin: `5 rad/s`;
- wheel-side crossing rate: `20 urad/s`;
- contact recycle distance: `0.05 m`;
- flat-P75 two-point carrier;
- friction `0`;
- E2a2q coupled normal solve;
- truly static road.

When the live contact takes the normal recycler shortcut, E2a2ah also executes `b3UpdateContact` on a **stack-local shadow copy**. The shadow result is observed only. The live manifold, solver input, recycler cache, eligibility cadence and world state remain untouched.

The question is: what does the fresh narrow phase say at the same instant that the authoritative live contact is using a recycled manifold?

## Recovery / provenance

The branch was eight commits ahead of the previous trusted E2a2ag checkpoint when this result was recovered. All changed files were confined to the new E2a2ah diagnostic/workflow apparatus. Intermediate corrections before the final successful runtime are **HISTORICAL-ONLY apparatus provenance** and are not physics evidence.

The final source commit completed the full donor recovery, native/WASM composition, build, tests and runtime diagnostic successfully.

## Non-perturbation gate

The diagnostic passed the essential identity check:

- fixed-road transition step: `430`;
- recycled motion steps: `90 / 180`;
- shadow fresh calls: `240`;
- baseline transition `dVy`: `0.00019686052110046148 m/s`;
- shadow-diagnostic transition `dVy`: `0.00019686052110046148 m/s`;
- exact physics identity asserted: `true`.

Therefore the shadow narrow-phase observation did not perturb the measured live physics in this apparatus.

## Executed result

### 1. Recycled and fresh feature topology are usually aligned, but fresh sees the `2 -> 1` loss earlier

Near the authoritative live transition:

- step `427`: recycled `2`, fresh `2`;
- step `429`: recycled `2`, fresh `1`;
- step `431`: recycled `1`, fresh `1`.

At step `429`, feature `65795` still exists in the recycled manifold but is already absent from the fresh manifold. The live recycled transition follows at step `430`.

This is direct evidence of a short topology lag in the recycled shortcut near this crossing. It is not yet evidence that the lag itself causes the full transient.

### 2. Matched-feature recycled separation is consistently offset from fresh narrow-phase separation

Across matched features around the transition, the live recycled separation differs from the shadow-fresh separation by about `+0.118 mm`.

Representative values:

- step `423`, feature `259`: recycled `+0.000000536 m`, fresh `-0.000118017 m`, delta `+0.000118554 m`;
- step `427`, feature `259`: recycled approximately `0`, fresh `-0.000118613 m`, delta `+0.000118613 m`;
- step `429`, feature `259`: recycled `-0.000001609 m`, fresh `-0.000119805 m`, delta `+0.000118196 m`;
- step `431`, feature `259`: recycled `-0.000005543 m`, fresh `-0.000123858 m`, delta `+0.000118315 m`.

Aggregate matched-feature diagnostics:

- maximum absolute matched separation error: `0.0001186132722068578 m`;
- p95 matched separation error: `0.00011855366756208241 m`.

The offset is strikingly stable over the observed interval. The active recycled value is `baseSeparation + reprojection`; the shadow fresh result remains roughly `0.118 mm` more penetrating than that active recycled value.

### 3. The result explains *what differs*, not yet *why the recycler formula is wrong*

E2a2ae/ag already showed that freezing separation reprojection nearly collapses the amplified transition transient to the recycle-off path. E2a2ah now independently observes that the authoritative reprojected separation is materially different from the fresh narrow-phase separation under the same fixed-road motion.

However, this diagnostic alone does **not** establish which internal quantity is incorrect. The stable `~0.118 mm` gap could arise from the semantics/reference frame of cached `baseSeparation`, the relative-transform reprojection term, when the cache reference is refreshed, or a combination. It would be premature to patch the recycler by simply substituting fresh separation or deleting reprojection.

## Status

### TRUSTED EXECUTED / NON-PERTURBING MECHANISM DIAGNOSTIC

Supported:

1. The shadow-fresh apparatus is non-perturbing for the measured fixed-road `2 -> 1` case.
2. On recycler-shortcut steps, matched-feature live recycled separation differs from fresh narrow-phase separation by a stable approximately `0.118 mm` in the observed regime.
3. Fresh narrow phase drops the second feature before the live recycled manifold does near the `2 -> 1` crossing.
4. The previously causal separation-reprojection finding is therefore accompanied by a directly observed recycled-vs-fresh geometry discrepancy, not merely by an intervention effect.

### NOT VALIDATED

- Root cause of the `~0.118 mm` separation gap inside the cache/reference-frame semantics.
- Whether topology lag or separation-value error dominates the transition impulse response.
- `1 -> 2` fixed-road external validity.
- Frictional rolling.
- Full annular wheel geometry.
- Free camber/steer.
- Side / inner / bore contacts.
- Product integration.

## Natural boundary / next move

Do not modify production recycler semantics yet.

The next bounded experiment should remain on the same non-perturbing fixed-road `2 -> 1` apparatus and decompose the separation discrepancy by logging the exact cache/reference quantities used by the shortcut at each recycled step:

- cached reference-pose age / sequence;
- `baseSeparation` at the last fresh manifold generation;
- current `dot(dp, normal)` reprojection contribution;
- fresh matched separation at the current transform;
- difference between `(baseSeparation + reprojection)` and fresh separation.

The primary question is whether the approximately constant `0.118 mm` error is already present in `baseSeparation`, introduced by reprojection from the cached relative pose, or produced by a reference-frame/refresh mismatch. This should be answered before any algorithmic fix or broader wheel physics stage is opened.
