# Wheel mode5 E2a2y — static-ground transform feasibility

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Source commit: `9be1cd6b13cc2f12bf2c50ac0f6a22f62bafadaf`
Workflow run: `33826421606`
Job: `100879936985`

## Scope

E2a2y is a **feasibility/runtime-apparatus test**, not a product-physics acceptance test.

It replaces the E2a2u/v kinematic 5 m support body with a **static** 5 m ground box and applies the same extremely slow orientation trajectory (`20 urad/s`, 180 motion steps at 240 Hz) through `b3Body_SetTransform` immediately before each `b3World_Step`.

The wheel remains the validated flat-P75 two-point carrier with the E2a2q coupled normal solve. X/Y wheel tilt remains locked. Friction is zero. Tested:

- recycle distance: `0.05 m` and `0 m`;
- spin: `0`, `5`, `10`, `40 rad/s`;
- both `2 -> 1` and `1 -> 2` support-feature crossings.

The primary question is whether static-body transform updates preserve a usable contact lifecycle well enough to remove the moving-ground-extent confound from later diagnostics.

## Executed result

Workflow and native/WASM build completed successfully.

### Contact lifecycle

Across all 16 runs:

- `contactDropoutsMotion = 0`;
- `contactIdChangesMotion = 0`;
- when a topology transition occurs, exactly one old feature persists (`transitionPersistedCount = 1`).

Therefore the static `SetTransform` seam does **not** recreate the contact or lose contact identity in this apparatus.

### Recycling behavior with default `0.05 m`

For both crossing directions:

| spin | recycled motion steps | transition behavior |
|---:|---:|---|
| 0 | 180 / 180 | old topology held for full sweep |
| 5 | 90 / 180 | one transition |
| 10 | 0 / 180 | one transition |
| 40 | 0 / 180 | one transition |

This differs materially from the earlier 5 m **kinematic** ground apparatus, where recycling already vanished by about `2.25 rad/s`. E2a2x showed that threshold was driven by the kinematic ground body's `maxExtent`. E2a2y removes that specific moving-support extent contribution while preserving a stable contact identity.

### Recycling disabled (`0 m`)

For every spin `0/5/10/40`:

- recycled motion steps: `0 / 180`;
- exactly one topology transition in each direction;
- zero contact dropouts;
- zero contact-ID changes.

`2 -> 1` transitions at step 310; `1 -> 2` transitions at step 349. One feature persists through the switch.

### Transition transients

These values are observations, **not acceptance thresholds**.

Default recycling shows cadence-sensitive transients. In particular, at spin `5 rad/s`:

- `2 -> 1`: `transitionVyDelta ~= +1.984e-4 m/s`, `maxAbsVyMotion ~= 2.913e-4 m/s`;
- `1 -> 2`: `transitionVyDelta ~= +2.482e-4 m/s`, `maxAbsVyMotion ~= 2.484e-4 m/s`.

At spin `10/40`, where default recycling is inactive, the behavior collapses close to the recycle-off path:

- `2 -> 1`: `|transitionVyDelta| ~= 4.84e-5 m/s`;
- `1 -> 2`: sub-micrometer-per-second to low-micrometer-per-second scale depending on spin.

The static seam therefore preserves the previously observed qualitative fact that **intermittent recycling cadence can amplify the crossing transient**. It does not justify calling that transient acceptable or unacceptable yet.

## Status

### TRUSTED FEASIBILITY / EXECUTED APPARATUS EVIDENCE

Supported:

1. A static ground body updated by `b3Body_SetTransform` can traverse this micro-angle crossing without contact dropout or contact-ID recreation in the tested setup.
2. It removes the specific kinematic-ground `maxExtent` confound identified by E2a2x.
3. Contact recycling remains active at low/moderate wheel spin and naturally becomes inactive at higher wheel spin; this behavior is now attributable to the remaining relative-motion/recycler semantics rather than the moving 5 m support extent.
4. The `1 <-> 2` switch continues to preserve one existing feature ID.
5. Intermittent recycling can materially amplify the measured vertical transient even in the static-ground transform apparatus.

### NOT VALIDATED

- Treating repeated `SetTransform` of a static body as production-equivalent road motion.
- Acceptability of the measured transition transient.
- Frictional rolling.
- Free camber/steer dynamics.
- Full annular wheel geometry.
- Side / inner / bore contact.
- Product integration.

## Interpretation

E2a2y is a **valid next diagnostic seam**, but not a final physical scenario. It is substantially cleaner than the kinematic-ground apparatus for studying wheel-side contact recycling because it removes the large moving-support extent from the recycler eligibility calculation while retaining a persistent contact object.

The strongest remaining uncertainty is no longer whether the static seam works. It is whether the cadence-sensitive transient is intrinsic to the existing recycler + `1 <-> 2` feature transition for a rotating wheel, and how it scales under a more representative static-world crossing rate / wheel motion.

## Natural boundary / next move

Do not reopen solver point-order work: E2a2q/r/s2 already closed that gate in the bounded flat-support regime.

The next bounded experiment should use this static-ground seam and vary **only crossing rate / contact-refresh cadence** around a representative rotating-wheel case, while retaining a recycle-off control. The objective should be to determine whether the ~0.2–0.25 mm/s-class velocity transient seen in the intermittent-recycling case is a rate/cadence artifact that converges, remains bounded, or grows. Do not yet introduce friction, camber, side contacts, or the full annular profile.
