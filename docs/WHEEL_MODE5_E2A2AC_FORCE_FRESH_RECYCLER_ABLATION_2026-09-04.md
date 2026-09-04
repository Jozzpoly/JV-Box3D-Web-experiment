# Wheel mode5 E2a2ac — force-fresh recycler ablation

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Trusted source commit: `c290d4f2da4e3d0b574803d89a9ff4959d26eaa4`
Workflow run: `33841723905`
Job: `100925208623`

## Scope

E2a2ac is a bounded causal ablation of the Box3D contact-recycling shortcut. It is not a product-physics acceptance test.

The setup remains fixed at the trusted static-ground diagnostic seam:

- wheel spin: `5 rad/s`;
- crossing angular speed: `20 urad/s`;
- static 5 m support moved by `b3Body_SetTransform`;
- flat-P75 two-point carrier;
- E2a2q coupled normal solve;
- friction: `0`;
- global warm starting: ON;
- both `2 -> 1` and `1 -> 2` crossings.

Three arms are compared:

1. `recycle-normal`: `recycleDistance=0.05 m`, normal recycled-manifold shortcut;
2. `eligible-force-fresh`: `recycleDistance=0.05 m`, the same recycler eligibility calculation and preserved recycler pose-cache history, but every eligible event bypasses the recycled-manifold mutation/`continue` and falls through to fresh `b3UpdateContact`;
3. `recycle-off`: `recycleDistance=0 m`.

The primary causal question is whether merely entering the recycler-eligible cadence is enough to produce the amplified transition transient, or whether execution of the recycled-manifold shortcut itself is necessary.

## Source-grounded intervention

In the donor-composed pinned Box3D `physics_world.c`, an eligible recycled contact keeps the existing manifold anchors, updates separation from the cached/current relative transform, marks manifold points persisted, updates recycler statistics, and `continue`s. That `continue` skips the normal fresh contact update path.

E2a2ac therefore does **not** blindly clear the manifold or solver state. Instead it makes the smallest intervention at that branch:

- evaluate eligibility exactly as normal;
- count the eligibility event;
- in the control arm, execute normal recycling unchanged;
- in the force-fresh arm, skip the recycled-manifold shortcut and execute the ordinary fresh `b3UpdateContact` path;
- on a force-fresh eligible step, do **not** refresh `cachedRotationA/B` or `cachedRelativePose`, so future eligibility decisions see the same recycler pose-cache history that normal recycling would retain.

This last constraint is essential: refreshing the pose cache on every forced-fresh event would alter future eligibility cadence and invalidate the causal A/B.

## Apparatus provenance

Several apparatus-only attempts preceded the trusted execution. They are **HISTORICAL-ONLY**, not physics evidence:

- `56d3625b2ed12d67c77ffc9797f38fa17cbbf714`, run `33841180509`: patch assumed clean-upstream indentation and failed before build/runtime against donor-composed source;
- `d50b33690978412fae527172aee0e13707f576fb`, run `33841619207`: native intervention composed, but the binding patch used an over-broad `return result;` assertion and failed before build/runtime;
- intervening fixes aligned the patch to donor-composed source and preserved recycler pose-cache cadence.

Only the successful execution at `c290d4f2da4e3d0b574803d89a9ff4959d26eaa4` is treated as executed physics evidence.

## Validity gates

All causal validity gates passed.

For both crossing directions:

- normal recycler eligibility count: `240`;
- force-fresh eligibility count: `240`;
- recycle-off eligibility count: `0`;
- normal recycled motion steps: `90 / 180`;
- force-fresh recycled motion steps: `0 / 180`;
- recycle-off recycled motion steps: `0 / 180`;
- contact dropouts: `0` in every arm;
- contact-ID changes: `0` in every arm;
- topology transition count: exactly `1`;
- one old feature persists through the transition.

Thus force-fresh preserved the measured recycler eligibility cadence while removing actual recycled-manifold shortcut execution.

## Results

### Transition velocity delta

| arm | `2 -> 1` | `1 -> 2` |
|---|---:|---:|
| recycle-normal | `+0.198434 mm/s` | `+0.248166 mm/s` |
| eligible-force-fresh | `-0.048312 mm/s` | `+0.000855 mm/s` |
| recycle-off | `-0.048312 mm/s` | `+0.000855 mm/s` |

The force-fresh and recycle-off results are numerically identical at the reported precision in both directions.

### Other transition observables

`2 -> 1`:

- recycle-normal: `transitionTotalImpulseDelta ~= +0.00258797`, `maxAbsVyMotion ~= 0.291349 mm/s`;
- eligible-force-fresh: `transitionTotalImpulseDelta ~= -0.000399210`, `maxAbsVyMotion ~= 0.048350 mm/s`;
- recycle-off: exactly the same reported values as eligible-force-fresh.

`1 -> 2`:

- recycle-normal: `transitionTotalImpulseDelta ~= +0.00351728`, `maxAbsVyMotion ~= 0.248412 mm/s`;
- eligible-force-fresh: `transitionTotalImpulseDelta ~= +0.000341518`, `maxAbsVyMotion ~= 0.001517 mm/s`;
- recycle-off: exactly the same reported values as eligible-force-fresh.

The detailed transition samples likewise match between force-fresh and recycle-off in the reported execution.

## Interpretation

### TRUSTED EXECUTED / BOUNDED CAUSAL EVIDENCE

Within this flat-P75 static-ground apparatus, **recycler eligibility/cadence alone is not sufficient to produce the amplified `1 <-> 2` transition transient**.

The amplified transient requires execution of the recycled-manifold shortcut as a whole. When eligibility remains unchanged but that shortcut is replaced by a fresh `b3UpdateContact`, the result collapses exactly to the recycle-off baseline for both directions.

This materially strengthens the causal chain established by E2a2aa and E2a2ab:

1. E2a2aa showed the large transient appears at the recycler activation threshold rather than varying continuously with recycle distance.
2. E2a2ab showed global solver warm-start carry is not necessary for the large transient.
3. E2a2ac now shows the recycler **shortcut execution itself**, rather than eligibility cadence, is necessary for the amplified transient in this apparatus.

### What E2a2ac does NOT isolate

Do not overread this as proof that a single cached field is the cause.

The recycled shortcut bundles several semantic differences relative to fresh `b3UpdateContact`, including:

- reuse of existing manifold anchors;
- separation update against cached/current relative transforms instead of fresh narrow-phase manifold generation;
- persisted-point semantics;
- skipping other normal contact-update work on the recycled step.

Also, fresh `b3UpdateContact` can still perform its normal feature matching / manifold-state transfer. Therefore E2a2ac isolates **recycled-manifold shortcut vs fresh contact update**, not every possible lower-level cache or warm-start mechanism.

## Current evidence classification

### CURRENT ACCEPTED

Canonical product `main` remains separate and untouched by this experiment. No E2a2 result is promoted to Owner Preview or product physics.

### TRUSTED EXECUTED

E2a2y, E2a2z, E2a2aa, E2a2ab, and now E2a2ac form the current bounded causal chain for the static-ground flat-P75 transition problem.

### OPEN

The next unresolved causal question is **which semantic component inside the recycled-manifold shortcut produces the amplification**: stale/reprojected anchor geometry and separation, persisted-point semantics/state transfer, skipped fresh material/contact update work, or a narrower combination.

### NOT VALIDATED

- acceptability threshold for real wheel dynamics;
- full annular wheel geometry;
- frictional rolling;
- free camber / steering dynamics;
- side / inner / bore contact;
- representative road interaction;
- product integration.

### HISTORICAL-ONLY

Failed E2a2ac apparatus compositions listed above and earlier superseded/broken apparatus runs remain provenance only.

## Natural boundary / next move

E2a2ac closes the question "eligibility cadence vs actual recycled shortcut" strongly enough that another recycle-distance or crossing-rate sweep would add little value.

The next bounded experiment should stay on this exact static-ground setup and split the recycled shortcut **one semantic layer deeper**. The strongest first candidate is a geometry-state ablation: preserve recycler eligibility and the shortcut cadence, but regenerate/reproject the contact manifold geometry freshly while separately controlling persisted/warm-start state. The intervention must be designed from the actual donor-composed `b3UpdateContact` / manifold matching path rather than by clearing the whole manifold struct.

Do not yet introduce friction, the full annular profile, camber, side contacts, or product integration.