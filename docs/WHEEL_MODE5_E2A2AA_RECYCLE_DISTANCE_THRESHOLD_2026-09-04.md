# Wheel mode5 E2a2aa — recycle-distance threshold / regime switch

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Source commit: `b836a70ec527f2ea99e83b6d27e88a6455d2959c`
Workflow run: `33833467268`
Job: `100901106962`

## Scope

E2a2aa is a bounded causal follow-up to E2a2z. It reuses the already validated E2a2z parameterized static-ground runner; no new solver or native binding behavior is introduced.

Held fixed:

- static-ground `SetTransform` seam;
- flat-P75 two-point carrier;
- E2a2q coupled normal solve;
- friction = 0;
- X/Y tilt locked;
- wheel spin = `5 rad/s`;
- crossing angular speed = `20 urad/s`;
- both `2 -> 1` and `1 -> 2` transitions.

Only `contactRecycleDistance` changes:

`0`, `0.0025`, `0.005`, `0.01`, `0.02`, `0.03`, `0.04`, `0.05 m`.

Primary question: does transition severity track recycler activation/cadence as the policy threshold is increased, or does the prior recycler explanation fail under a controlled threshold sweep?

## Execution integrity

Native/WASM recovery, composition, build, tests, and E2a2aa runner all completed successfully.

For every tested case the runner asserted:

- static ground seam intact;
- zero contact dropouts;
- zero contact-ID changes;
- exactly one topology transition;
- exactly one persisted old feature through the transition.

## Result: sharp two-regime switch

There is no gradual response across the tested recycle-distance range.

### Regime A — `recycleDistance <= 0.02 m`

For `0`, `0.0025`, `0.005`, `0.01`, and `0.02 m`:

- recycled motion steps = `0 / 180` in both directions;
- all measured transition observables are numerically identical across these thresholds.

`2 -> 1`:

- transition dVy = `-0.0483121 mm/s`;
- max |Vy| = `0.0483497 mm/s`;
- transition total-impulse delta = `-0.000399210`.

`1 -> 2`:

- transition dVy = `+0.000854915 mm/s`;
- max |Vy| = `0.00151739 mm/s`;
- transition total-impulse delta = `+0.000341518`.

This regime is effectively the same as recycle-off in this apparatus.

### Regime B — `recycleDistance >= 0.03 m`

For `0.03`, `0.04`, and `0.05 m`:

- recycled motion steps = exactly `90 / 180` in both directions;
- all measured transition observables are numerically identical across these thresholds.

`2 -> 1`:

- transition dVy = `+0.198434 mm/s`;
- max |Vy| = `0.291349 mm/s`;
- transition total-impulse delta = `+0.00258797`.

`1 -> 2`:

- transition dVy = `+0.248166 mm/s`;
- max |Vy| = `0.248412 mm/s`;
- transition total-impulse delta = `+0.00351728`.

The `1 -> 2` transition step also moves from 349 in regime A to 350 in regime B; `2 -> 1` remains at step 310.

## Falsification / causal interpretation

### SUPPORTED: entry into the recycling regime is tightly coupled to the large transient

The recycler-on/off difference is reproduced while holding physical wheel motion and crossing rate fixed. The large transient appears exactly when the runtime begins reporting recycled contacts.

This is substantially stronger causal evidence than E2a2y/z alone.

### FALSIFIED: simple monotonic recycle-distance amplitude model

Transition severity does **not** increase gradually with `recycleDistance`.

Instead the tested range contains a discrete regime boundary between `0.02` and `0.03 m`:

- below it: no recycling and quiet transition;
- above it: `90/180` recycling and the full larger transient.

Therefore `recycleDistance` should be interpreted primarily as an eligibility tolerance in this bounded setup, not as a direct continuous gain on transient magnitude.

## Source-semantics audit

The pinned Box3D source (`8441b4a06d6d09dcfb0b0f704df4d847d1437b92`) is consistent with the observed threshold behavior.

Contact recycling uses the configured recycle distance as a geometric tolerance. The implementation compares cached/current relative transforms and accepts recycling only when translational distance plus an angular-arc bound fits within the tolerance. For a static body its `maxExtent` contribution is zero; the dynamic wheel extent remains in the angular-arc calculation.

This explains why a fixed physical motion can cross a hard eligibility threshold as recycle distance changes, and it is consistent with E2a2x/E2a2y removing the earlier moving 5 m kinematic-ground extent confound.

The source audit does **not** by itself prove why the active regime produces exactly `90/180` recycled steps or which part of recycled manifold/cache state causes the larger transient.

## Status

### TRUSTED EXECUTED / BOUNDED CAUSAL EVIDENCE

Supported:

1. At fixed `spin=5 rad/s` and `20 urad/s` crossing rate, recycler activation has a sharp threshold between `0.02` and `0.03 m` in the tested setup.
2. The large transition transient appears together with entry into the active recycling regime.
3. Thresholds within the same regime produce numerically identical runtime behavior in this sweep.
4. A monotonic `recycleDistance -> transient amplitude` interpretation is false in this bounded range.
5. Source semantics support a hard geometric eligibility threshold rather than a continuous response to recycle distance.

### CURRENT ACCEPTED

- canonical `main` and Owner Preview remain untouched by this experimental branch;
- closed product/Owner-accepted state is not changed by E2a2aa.

### OPEN

- Why the active regime produces exactly `90/180` recycled steps.
- Whether the transient is caused by the act/cadence of recycling itself, by the manifold/cache contents reused on recycled steps, by warm-start state interacting with recycled manifolds, or by a combination.
- Exact threshold location inside `(0.02, 0.03) m` is not yet measured, but locating it more precisely has low decision value unless needed for a mechanism test.

### NOT VALIDATED

- production-equivalence of repeated static-body `SetTransform`;
- acceptability of the measured transient;
- frictional rolling;
- free camber/steer;
- full annular wheel geometry;
- side/inner/bore contact;
- product integration.

### HISTORICAL-ONLY

Earlier invalid/interrupted apparatus and superseded point-order hypotheses remain forensic provenance only. E2a2aa does not reopen them.

## Natural boundary / next move

Do **not** spend the next experiment merely binary-searching the `0.02–0.03 m` threshold. E2a2aa already establishes the decision-relevant fact: there are two sharply separated runtime regimes and the transient switches with recycler activation.

The next bounded problem should move one causal layer inward while keeping the same physical setup. Inspect and instrument the recycler/cache path enough to distinguish:

1. steps where a manifold is recycled from steps where a fresh manifold is generated;
2. whether the cached manifold's persisted points / impulses are carried into the solver differently;
3. why the current motion produces the exact `90/180` recycle cadence.

Then design one minimal intervention that changes recycler/cache reuse while preserving the same contact geometry and physical motion. The goal is to separate **recycler eligibility/cadence** from **the reused manifold/warm-start contents** before changing solver physics, friction, geometry, or product code.
