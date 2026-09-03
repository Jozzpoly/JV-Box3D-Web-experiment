# Wheel mode5 E2a2u — dynamic support-transition observation

Date: 2026-09-03
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Initial apparatus head: `a81757f8679b1647b92a9be371db06a06d3b6355`
Observation-reporting head: `2b7177264140cea3be033d46c74024300faa2d74`
Initial run: `33809307191`
Observation run: `33809672582`
Observation job: `100828303586`

## Scope

E2a2u moved from static support-feature classification to continuous physical crossing.

Controls:

- unchanged flat P75 two-endpoint wheel profile,
- dynamic wheel with X/Y angular locks,
- spin Z = 0 or 40 rad/s,
- kinematic ground box,
- ground angular speed = `20 µrad/s`,
- friction = 0,
- warm starting enabled,
- validated E2a2q coupled normal solver,
- source-predicted static topology threshold ~= `5.827366 µrad`, derived from the E2a2t support-value tolerance.

Two directions were tested:

- flat settle then tilt: nominal `2 -> 1`,
- settle at +15 µrad then return to flat: nominal `1 -> 2`.

The original validity gate required live topology to equal the fresh narrow-phase source prediction every step. That gate failed. The reporting-only revision reran the exact same physics and emitted all four observations before applying the unchanged assertion.

## Executed observation

### Spin 0 rad/s

The live contact did **not** cross topology within the 15 µrad sweep.

`2 -> 1` direction:

- topology mismatches vs fresh source oracle: `171`,
- observed transition count: `0`,
- contact dropouts: `0`,
- contact ID changes: `0`,
- max |Vy| during motion: `2.102297e-9 m/s`.

`1 -> 2` direction:

- topology mismatches vs fresh source oracle: `130`,
- observed transition count: `0`,
- contact dropouts: `0`,
- contact ID changes: `0`,
- max |Vy| during motion: `3.663667e-6 m/s`.

Thus the persistent live manifold can remain on its prior topology far past the ~5.83 µrad fresh-contact support-feature boundary when the wheel itself has no spin.

### Spin 40 rad/s

The live contact did cross near the static source threshold.

`2 -> 1`:

- transition step: `311`,
- pre-transition angle: `5.916668 µrad`, fresh oracle already predicts one point,
- transition angle: `6.000001 µrad`,
- topology mismatch count: `2`,
- topology: `2 -> 1`,
- exactly one point persisted,
- contact ID unchanged,
- transition `ΔVy = -5.590299e-5 m/s`,
- transition final-normal-impulse delta: `-2.153683e-7`,
- transition total-normal-impulse delta: `-4.391465e-4`.

At the transition the surviving feature `259` retained persistence and the previous two final normal impulses were replaced by one final impulse with essentially unchanged combined final magnitude.

`1 -> 2`:

- transition step: `350`,
- pre-transition angle: `5.833330 µrad`, fresh oracle predicts one point,
- transition angle: `5.749997 µrad`, fresh oracle predicts two,
- topology mismatch count: `0`,
- topology: `1 -> 2`,
- exactly one point persisted,
- contact ID unchanged,
- newly born feature `65795` had `persisted=false`,
- transition `ΔVy = +3.339015e-6 m/s`,
- transition final-normal-impulse delta: `-9.313226e-10`,
- transition total-normal-impulse delta: `+3.819577e-4`.

The newly born second point immediately acquired a nonzero solved impulse in the transition step while the combined final normal impulse stayed essentially unchanged.

## Source grounding: contact recycling

Pinned Box3D uses contact recycling before `b3UpdateContact`. For a recyclable contact under sufficiently small relative translation/rotation, it keeps the existing anchors/manifold, updates separation, marks points persisted, increments `recycledContactCount`, and skips narrow-phase contact regeneration for that step.

The pinned default recycle distance is:

```c
#define B3_CONTACT_RECYCLE_DISTANCE ( 10.0f * B3_LINEAR_SLOP )
```

With `B3_LINEAR_SLOP = 5 mm`, the default is `50 mm`.

The public API explicitly states that `b3World_SetContactRecycleDistance(world, 0)` disables contact recycling.

## Classification

### TRUSTED EXECUTED OBSERVATION

- Continuous runtime topology is not determined solely by the fresh-contact E2a2t support-feature threshold.
- The persistent contact can exhibit strong topology hysteresis under microscopic relative orientation change.
- With spin 0, the prior topology survived the entire tested 15 µrad motion in both directions.
- With spin 40, transitions occurred close to the fresh narrow-phase threshold, with stable contact identity and exactly one surviving persisted feature.

### APPARATUS EXPECTATION FALSIFIED

The original E2a2u assertion `live topology == fresh support-feature prediction every step` is invalid while contact recycling is enabled. E2a2u therefore failed its original validity gate by design; its transient amplitudes are observations, not yet a general verdict on transition quality.

### STRONG SOURCE-BACKED HYPOTHESIS

Contact recycling explains the spin-sensitive runtime topology hysteresis. Spin changes the relative-rotation recycling eligibility, while a nearly motionless wheel/slowly rotating ground can keep a recycled manifold for much longer than the micron-scale support-feature equality band.

### NOT YET VALIDATED

- direct causal A/B proving recycling is responsible,
- fresh-narrow-phase crossing behavior with recycling disabled,
- whether the observed spin-40 transition transients are materially problematic,
- the desired production policy for wheel contacts,
- friction/tangential coupling.

## Next bounded gate

Run the exact same crossing with contact recycle distance explicitly set to:

1. pinned default-equivalent `0.05 m`,
2. `0.0 m` (disabled),

for both directions and spins, while recording `b3Counters.recycledContactCount`.

Only the recycle-off case should be required to match the E2a2t fresh support oracle step-by-step. If spin-0 recycle-off returns to the ~5.83 µrad transition while default recycling reproduces the hysteresis, the causal mechanism is established.
