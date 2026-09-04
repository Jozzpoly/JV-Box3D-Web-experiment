# Wheel mode5 E2a2ag — fixed-ground separation-reprojection causal transfer

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Trusted runtime source commit: `39e695048173eb3692f27f8d3d985d4f8deceb74`
Trusted workflow run: `33859360275`
Trusted job: `100979989071`
Prior trusted checkpoint: E2a2af `53cf2caae57b5d345e3c4bbca480d937a84471a4`

## Scope

E2a2ag asks whether the E2a2ae separation-reprojection causal finding transfers across the external-validity boundary established by E2a2af.

The apparatus is the already validated fixed-road `2 -> 1` wheel-side crossing:

- ground body static at identity;
- zero ground-transform updates during the run;
- dynamic flat-P75 two-point carrier;
- E2a2q coupled normal solve;
- friction `0`;
- spin `5 rad/s`;
- crossing angular speed `20 urad/s`;
- bounded X/Y wheel unlock during the crossing window;
- `2 -> 1` only.

Three arms are compared:

1. normal recycling, `recycleDistance = 0.05 m`;
2. identical recycling policy plus the E2a2ae test-only intervention that sets recycled-point `separation = baseSeparation` instead of `baseSeparation + dot(dp, normal)`;
3. recycling disabled, `recycleDistance = 0 m`.

This is a causal-transfer diagnostic, not product-physics acceptance and not a proposed production patch.

## Apparatus history / rejected executions

Two executions before the trusted run are **HISTORICAL-ONLY** and provide no physics evidence.

### Rejected run 1 — topology predictor gate was over-constrained

Source commit: `a5f28c06b4b3db24249bcb901d5bbb381d92e04a`
Workflow run: `33858848005`
Job: `100978345819`

The build, donor recovery, solver composition and runtime wiring all succeeded. The run stopped because the freeze arm produced `topologyMismatchCount = 3` while the runner asserted `<= 2`.

That assertion was rejected as an invalid causal invariant. The intervention directly changes recycled separation geometry, so a small change in predictor-vs-observed topology classification may itself be an effect of the intervention. Contact continuity, actual `2 -> 1` transition semantics and recycler execution are stronger validity authorities here.

### Rejected run 2 — exact transition timing was over-constrained

Source commit: `ef2ba4adda68c45f82ccc65b2c0f3d457fe94289`
Workflow run: `33859160674`
Job: `100979342523`

After correcting the predictor gate, the freeze arm shifted the observed topology transition from outer step `430` to `432`. The runner still required exact transition-step equality and therefore rejected the run.

That gate was also removed. Because the intervention changes the separation geometry used by the recycled manifold, a small shift in the point at which topology changes is a legitimate measured outcome, not automatically apparatus corruption. Transition timing is therefore telemetry in the trusted run.

Neither rejected execution is used as physics evidence.

## Trusted executed result

The final run completed successfully and passed the bounded validity gates.

### Validity / intervention execution

Across all three arms:

- fixed static ground remained at identity;
- ground transform updates: `0`;
- `contactDropoutsMotion = 0`;
- `contactIdChangesMotion = 0`;
- exactly one topology transition;
- `transitionFrom = 2`;
- `transitionTo = 1`;
- `transitionPersistedCount = 1`.

Normal recycle and freeze both executed exactly `90 / 180` recycled motion steps. Therefore the separation intervention did **not** disable recycling or alter its outer-step cadence.

The freeze arm touched `456` recycled manifold points, confirming that the intervention executed materially rather than merely toggling an unused flag.

### Causal A/B/C

| arm | recycled steps | transition step | transition dVy | transition total impulse delta | final Vy |
|---|---:|---:|---:|---:|---:|
| normal recycle | `90 / 180` | `430` | `+0.196861 mm/s` | `+0.002644032` | `-0.241892 mm/s` |
| recycle + freeze separation reprojection | `90 / 180` | `432` | `-0.031991 mm/s` | `-0.000383109` | `+0.006321 mm/s` |
| recycle off | `0 / 180` | `431` | `-0.032159 mm/s` | `-0.000382874` | `+0.004895 mm/s` |

The freeze arm therefore collapses extremely close to recycle-off despite retaining the normal recycler cadence:

- freeze vs recycle-off transition-dVy difference: about `+0.000168 mm/s`;
- normal recycle vs recycle-off transition-dVy difference: about `+0.229019 mm/s`;
- normal recycle vs freeze difference: about `+0.228851 mm/s`.

The same collapse is visible in transition total impulse delta: freeze and recycle-off are nearly identical while normal recycling is qualitatively and quantitatively separated.

### Timing / predictor effects

The freeze intervention shifts the topology transition by `+2` outer steps relative to normal recycle and raises `topologyMismatchCount` from `2` to `3`.

These are retained as real measured effects/limitations rather than hidden or tuned away. They do not invalidate the causal comparison because:

- contact identity remains continuous;
- the same single `2 -> 1` transition occurs;
- one feature persists;
- recycler cadence remains exactly `90 / 180` in both recycle-on arms;
- the intervention directly changes the recycled separation geometry, so some timing/classification movement is expected to be possible.

## Status

### TRUSTED EXECUTED / BOUNDED CAUSAL TRANSFER EVIDENCE

Supported in this bounded flat-P75 fixed-road `2 -> 1` apparatus:

1. The recycler-associated positive vertical transient survives genuinely fixed-road wheel-side motion under normal recycling.
2. Freezing only the recycled separation reprojection term while retaining the same recycler cadence removes essentially the entire amplification and collapses the immediate transition response to the recycle-off control.
3. Therefore the E2a2ae identification of recycled separation reprojection as a necessary amplifier **transfers across the transformed-ground -> fixed-road external-validity boundary** for the validated `2 -> 1` case.
4. The effect is not explained merely by whether recycling runs, because both recycle-on arms execute `90 / 180` recycled steps.
5. The intervention also shifts transition timing by two outer steps, so it is not behaviorally invisible and must not be interpreted as a ready production fix.

## What this does NOT establish

E2a2ag does **not** establish:

- that Box3D's recycler is generally incorrect;
- that `separation = baseSeparation` is a correct production replacement;
- that the measured transient is unacceptable in a representative vehicle;
- fixed-road `1 -> 2` behavior;
- full annular wheel behavior;
- frictional rolling;
- free camber/steer dynamics;
- side / inner / bore contact;
- representative road/vehicle integration;
- product integration or Owner acceptance.

## Interpretation

The causal picture is now considerably narrower than at E2a2aa:

- E2a2aa tied the transient to the recycling regime;
- E2a2ab showed ordinary carried normal impulse / global warm start is not the dominant necessary cause;
- E2a2ac showed recycler eligibility alone is insufficient and the recycled-manifold shortcut is necessary;
- E2a2ae localized the amplification to recycled separation reprojection in the transformed-ground apparatus;
- E2a2af showed the broad recycler amplification survives genuinely fixed road;
- E2a2ag now shows the separation-reprojection mechanism itself also transfers to that fixed-road apparatus for `2 -> 1`.

The strongest remaining uncertainty is therefore no longer *whether* the separation-reprojection term is involved. It is **why the reprojection differs so strongly from fresh contact geometry near the topology transition** and whether that difference reflects cached-anchor/reference-pose age, refresh cadence, or another local approximation inside the recycler.

## Natural boundary / next move

Stop here. Do not patch canonical Box3D behavior or open friction/full-wheel/product work yet.

The next bounded experiment should be **telemetry-first and non-perturbing**: on recycle-eligible steps around the fixed-road `2 -> 1` transition, compute a shadow fresh narrow-phase manifold without replacing the active recycled manifold, then compare for matched feature IDs:

- active recycled `separation`;
- `baseSeparation`;
- the reprojection correction `dot(dp, normal)`;
- shadow-fresh separation;
- cache/reference-pose age or number of outer steps since the last fresh manifold update.

The purpose is to measure directly where the approximately `0.229 mm/s` causal divergence is coming from before proposing any recycler correction. If recycled separation systematically departs from shadow-fresh separation with cache age near the switch, the next intervention can be designed around that evidence rather than around an assumed fix.
