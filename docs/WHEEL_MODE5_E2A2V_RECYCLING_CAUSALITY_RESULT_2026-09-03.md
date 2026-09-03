# Wheel mode5 E2a2v — contact recycling causality result

Date: 2026-09-03

## Scope

Bounded dynamic falsifier for the flat-P75 outer-ground `1↔2` support-feature transition.

E2a2v repeats the exact E2a2u controlled kinematic-ground crossing while changing one variable only:

- contact recycle distance `0.05 m` (pinned Box3D default-scale behavior used by E2a2u), or
- contact recycle distance `0.0 m` (recycling disabled).

Unchanged:

- pinned Box3D / Box3D.js provenance,
- recovered flat P75 wheel profile,
- friction `0`,
- warm starting enabled,
- X/Y wheel tilt locks,
- kinematic ground angular speed `20 µrad/s`,
- E2a2q diagnostic coupled 2×2 normal solve,
- separate `2→1` and `1→2` crossings,
- spin `0` and `40 rad/s`.

`b3Counters.recycledContactCount` is recorded during every controlled motion step.

## Trusted executed authority

- source/gate commit: `80aaa06812dbe68cb9ab948c4961dcbc896b42d1`
- workflow run: `33810744623`
- job: `100831722220`
- conclusion: **SUCCESS**

The preceding run `33810028535` exposed the same observations but failed an overly strict assertion requiring exact per-step agreement with the static E2a2t oracle. That assertion was replaced with a causal gate; geometry, motion and solver were not changed.

## Source context

Pinned Box3D contact recycling can preserve the previous manifold and anchors, update only separation, mark points persisted, and skip `b3UpdateContact` while the relative-motion recycle criteria remain satisfied.

Pinned constants/API also establish:

- default recycle distance: `10 * B3_LINEAR_SLOP = 0.05 m`,
- recycle distance `0` disables contact recycling,
- world angular recycle threshold corresponds to `10°`.

## Result

### Default recycling, spin 0

Both crossing directions were recycled on **180/180 controlled motion steps**:

- `recycledStepsMotion = 180`,
- `recycledContactCountSumMotion = 180`,
- `maxRecycledContactCountMotion = 1`.

Observed topology never transitioned:

- `2→1`: `transitionCount = 0`, `topologyMismatchCount = 171`,
- `1→2`: `transitionCount = 0`, `topologyMismatchCount = 130`.

No contact dropout or contact-ID replacement occurred.

The fully recycled `2→1` path was extremely quiet:

- `maxAbsVyMotion ≈ 2.10e-9 m/s`.

### Default recycling, spin 40 rad/s

Recycling was naturally ineligible for every controlled motion step:

- `recycledStepsMotion = 0`,
- `recycledContactCountSumMotion = 0`.

The support topology refreshed and crossed once:

- `2→1`: transition step `311`, ground angle `≈ 6.000001 µrad`, one surviving feature persisted,
- `1→2`: transition step `350`, ground angle `≈ 5.749997 µrad`, one surviving feature persisted.

No contact dropout or contact-ID replacement occurred.

Transition velocity deltas:

- `2→1`: `Δvy ≈ -5.5903e-5 m/s` (`-55.9 µm/s`),
- `1→2`: `Δvy ≈ +3.3390e-6 m/s` (`+3.34 µm/s`).

For `1→2`, the old point persists while the new point is born with `persisted=false`; the coupled solver immediately redistributes the normal impulse while the final impulse sum remains essentially continuous.

### Recycling disabled, spin 0

The intervention removed recycling completely:

- `configuredRecycleDistance = 0`,
- `recycledStepsMotion = 0`,
- `recycledContactCountSumMotion = 0`.

The previously frozen spin-0 topology now follows the same single-transition path as the naturally non-recycled spin-40 case:

- `2→1`: transition step `311`,
- `1→2`: transition step `350`,
- correct source/destination topology,
- exactly one surviving persisted feature,
- no contact dropout,
- no contact-ID replacement.

The recycle-off spin-0 and spin-40 transition steps are exactly identical for each crossing direction.

### Recycling disabled, spin 40

Results are the same transition path as default spin 40 because default spin 40 was already not recycling.

## Verdict

### TRUSTED EXECUTED

**Contact recycling is the causal mechanism behind the E2a2u spin-0 live-manifold hysteresis.**

This is not merely correlation:

1. default spin 0 recycles every controlled step and preserves the old topology throughout the sweep;
2. disabling recycling changes no geometry, motion, friction, warm-start or solver setting;
3. the intervention removes all recycled steps;
4. the same spin-0 experiment then regains the same single-transition path and transition step seen in the naturally non-recycled spin-40 case.

### FALSIFIED / corrected interpretation

The earlier E2a2v hard assertion that a continuously moving dynamic contact with recycling disabled must match the static E2a2t point-count oracle on **every exact frame** was too strong.

For `2→1`, the dynamic transition occurs at about `6.000 µrad` while the static source threshold predicts about `5.827 µrad`, producing two discrete mismatch samples. `1→2` has zero such mismatch samples. This small update-order/discretization lag is not evidence against the recycling-causality result.

### Important non-conclusion

This result does **not** justify globally disabling contact recycling, nor even wheel-specific disabling yet.

In this apparatus, full spin-0 recycling is smoother than forcing topology refresh. The relevant remaining risk is the regime between the two tested extremes: wheel spin values where recycling may become intermittent or switch eligibility as relative arc motion changes.

## Next bounded frontier

E2a2w should sweep wheel spin under the unchanged default recycle distance and measure, for both `2→1` and `1→2`:

- recycled motion-step count and pattern,
- transition count/step/topology,
- persisted feature count,
- contact dropouts / ID changes,
- transition `Δvy`, final impulse delta and total impulse delta,
- maximum motion jitter.

The purpose is not to tune a recycle threshold. It is to determine whether a partially/intermittently recycled regime exists and whether it creates a worse contact-semantic or dynamic discontinuity than either fully recycled spin 0 or non-recycled spin 40.

## Still NOT VALIDATED

- acceptability of the measured transition transient in a real wheel/suspension/vehicle,
- behavior under friction and longitudinal/lateral tire forces,
- wheel-specific recycling policy,
- dynamic native single-wheel-shape product integration,
- Owner hands-on acceptance,
- any change to canonical `main` or Owner Preview.
