# Wheel mode5 E2a2ab — warm-start ablation

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Executed source commit: `8925c3aa7272980d8a092373323a77ffb573e863`
Workflow run: `33838734468`
Job: `100916465548`

## Scope

E2a2ab is a bounded causal ablation on the trusted E2a2y/z static-ground diagnostic seam. It does not change product code, wheel geometry, solver topology, friction, camber/steer, or the accepted `main` state.

Fixed conditions:

- spin: `5 rad/s`;
- crossing angular speed: `20 urad/s`;
- static 5 m ground moved through `b3Body_SetTransform` immediately before each world step;
- flat-P75 two-point carrier;
- zero friction;
- E2a2q coupled normal solve;
- both `2 -> 1` and `1 -> 2` feature crossings.

2x2 factors:

1. contact recycling distance `0.05 m` vs `0 m`;
2. world constraint warm starting enabled vs disabled.

Primary question: **does the recycler-associated transition amplification found in E2a2y/z/aa disappear when solver warm-start impulse carry is disabled?**

## Recovery / apparatus validation

The live branch had advanced seven commits beyond the E2a2aa checkpoint before this run. Those commits only added and repaired the E2a2ab harness (`workflow`, `binding patch`, `runner`). The final live head was `8925c3aa...` with `fix: replace inherited warm-start enable in E2a2ab`.

The successful final workflow:

- recovered the pinned Box3D.js source and donor wheel patch;
- composed the full previously validated E2a2 stack;
- applied the E2a2ab binding patch;
- built native/WASM successfully;
- asserted that requested `warmStarting` exactly matched the live world state returned by `b3World_IsWarmStartingEnabled`;
- completed all eight runs with zero contact dropouts and zero contact-ID changes;
- observed exactly one feature persisted at every topology transition.

Therefore only the final run on `8925c3aa...` is treated as executed E2a2ab evidence. Earlier harness-repair commits are provenance, not physics evidence.

## Executed result

Transition velocity deltas (`transitionVyDelta`) in mm/s:

| recycling | warm start | `2 -> 1` | `1 -> 2` | recycled steps |
|---|---|---:|---:|---:|
| on (`0.05 m`) | on | `+0.198434` | `+0.248166` | `90 / 180` |
| on (`0.05 m`) | off | `+0.198298` | `+0.187539` | `90 / 180` |
| off (`0 m`) | on | `-0.048312` | `+0.000855` | `0 / 180` |
| off (`0 m`) | off | `-0.044592` | `-0.060026` | `0 / 180` |

Maximum absolute vertical velocity during the motion window (`maxAbsVyMotion`) in mm/s:

| recycling | warm start | `2 -> 1` | `1 -> 2` |
|---|---|---:|---:|
| on | on | `0.291349` | `0.248412` |
| on | off | `0.309329` | `0.308048` |
| off | on | `0.048350` | `0.001517` |
| off | off | `0.062088` | `0.060626` |

## Causal verdict

### Strongly falsified

**The amplified transition is not explained solely by ordinary solver warm-start impulse carry.**

For `2 -> 1`, disabling global warm starting leaves the transition almost unchanged:

- warm-start on: `+0.198434 mm/s`;
- warm-start off: `+0.198298 mm/s`.

The difference is only about `0.000135 mm/s` (~`0.07%`).

For `1 -> 2`, warm-start removal reduces the transition from `+0.248166` to `+0.187539 mm/s` (~24% reduction), but the remaining transient is still far larger than the corresponding recycle-off baselines.

Therefore warm starting can modulate the effect, particularly asymmetrically for `1 -> 2`, but **it is not the primary necessary cause of the recycler-associated amplification**.

### Strengthened

The dominant causal boundary remains the **recycling regime itself / recycled manifold state**:

- recycling state does not change when warm starting is toggled (`90/180` vs `0/180` exactly);
- contact identity remains stable in every case;
- the amplified regime survives with solver warm starting disabled.

This narrows the remaining hypotheses toward the contact-recycling path itself: recycled manifold geometry/state, refresh cadence, cached separations/features, or another state carried by the recycler independently of solver warm-start impulses.

## Important complication

Disabling warm starting is not behaviorally neutral even when recycling is off. In particular `1 -> 2 / recycle-off` changes from about `+0.000855 mm/s` to `-0.060026 mm/s` and the motion-window maximum rises to `0.060626 mm/s`.

Therefore E2a2ab should **not** be interpreted as proving that warm starting is irrelevant to transition dynamics. It only proves that removing it does not remove the amplified recycle-on regime. Global warm-start-off also changes the fresh-manifold baseline and cannot by itself isolate the exact recycler-internal state responsible for the effect.

## Status

### TRUSTED EXECUTED / BOUNDED CAUSAL FALSIFIER

Supported:

1. E2a2ab correctly controls the world warm-start state at runtime.
2. Recycler-associated transition amplification survives removal of ordinary solver warm-start impulse carry.
3. `2 -> 1` amplification is essentially invariant to global warm-start disable in this test.
4. `1 -> 2` amplification is partially reduced but not eliminated.
5. The dominant causal question has moved below the global solver warm-start switch, into recycled-manifold/cache semantics.

### NOT VALIDATED

- the exact recycler-internal state responsible for amplification;
- production acceptability of any measured transient;
- full annular wheel geometry;
- frictional rolling;
- free camber/steer dynamics;
- side / inner / bore contact;
- product integration;
- treating repeated static-body `SetTransform` as production road motion.

## Current state classification

- **CURRENT ACCEPTED:** canonical `main` remains `5b28cc03d22264010680deb95a04abd04661bc22`; no product/Preview promotion.
- **TRUSTED EXECUTED:** prior closed E2a2 causal evidence plus E2a2y static-ground feasibility, E2a2z crossing-rate falsifier, E2a2aa recycling-threshold evidence, and now E2a2ab warm-start ablation.
- **OPEN:** identify which recycler-carried manifold/cache state creates the amplified transition.
- **NOT VALIDATED:** production wheel/contact behavior listed above.
- **HISTORICAL-ONLY:** failed/intermediate apparatus runs and superseded harness repairs; they are provenance only.

## Natural boundary / next move

Do not spend another iteration sweeping global warm-start settings; E2a2ab has answered that causal question.

The next bounded experiment should stay at the same `spin=5 rad/s`, `20 urad/s` static-ground crossing and **intervene inside the recycle path while keeping global warm starting enabled**. The cleanest next falsifier is to preserve recycler eligibility/cadence but clear or neutralize the recycled manifold's carried solver/manifold state immediately before it is reused, then compare against unmodified recycle-on and recycle-off controls.

The intervention must be narrow and source-audited: first identify exactly which fields are copied/preserved by the pinned Box3D contact-recycling path (feature IDs, separations/anchors, normal impulses, tangent state, etc.). Do not zero an arbitrary broad struct. The goal is to distinguish `recycled geometry/manifold cache` from `fresh manifold generation` without simultaneously changing eligibility, cadence, contact identity, or global solver behavior.
