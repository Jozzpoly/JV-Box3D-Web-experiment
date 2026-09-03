# Wheel mode5 E2a2w — intermittent contact recycling result

Date: 2026-09-03

## Scope

E2a2w asks whether the E2a2u/E2a2v controlled flat-support crossing contains a partially/intermittently recycled regime between the two previously observed endpoints:

- spin `0 rad/s`: full recycling, topology frozen throughout the crossing;
- spin `40 rad/s`: no recycling, one ordinary `1↔2` support-feature transition.

The experiment reuses the exact E2a2v runner and changes **wheel spin only** under contact recycle distance `0.05 m`.

Unchanged:

- pinned Box3D / Box3D.js provenance,
- recovered flat P75 wheel profile,
- friction `0`,
- warm starting enabled,
- X/Y wheel tilt locks,
- kinematic ground angular speed `20 µrad/s`,
- E2a2q diagnostic coupled 2×2 normal solve,
- separate `2→1` and `1→2` crossings.

No dynamic acceptability threshold was pre-registered. The experiment is diagnostic: classify recycling cadence, topology behavior and transition transients without tuning a policy around the result.

## Trusted executed authority

### Broad sweep

- commit: `df0b72492b59bf135ec08f2ec59833674015f549`
- workflow run: `33811142869`
- job: `100832994694`
- conclusion: **SUCCESS**
- spins: `0, 5, 10, 15, 20, 25, 30, 35, 40 rad/s`

Broad result:

- spin `0`: `180/180` controlled motion steps recycled; no topology transition;
- every sampled spin `5–40`: `0/180` recycled; exactly one transition;
- no contact dropouts;
- no contact-ID changes.

This showed that any partial regime, if present, had to lie below `5 rad/s` in this apparatus.

### Low-spin refinement

- commit: `36a1b2ee9860ec90ea9886dd4f386934fb057220`
- workflow run: `33811542669`
- job: `100834260890`
- conclusion: **SUCCESS**
- spins: `0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 4, 5 rad/s`

## Recycling cadence

The refinement found a clear intermittent regime. Recycling counts were identical for `2→1` and `1→2` at each spin:

| spin (rad/s) | recycled motion steps | recycle fraction |
|---:|---:|---:|
| 0 | 180 / 180 | 1.0000 |
| 0.25 | 160 / 180 | 0.8889 |
| 0.5 | 144 / 180 | 0.8000 |
| 0.75 | 120 / 180 | 0.6667 |
| 1.0 | 120 / 180 | 0.6667 |
| 1.25 | 90 / 180 | 0.5000 |
| 1.5 | 90 / 180 | 0.5000 |
| 1.75 | 90 / 180 | 0.5000 |
| 2.0 | 90 / 180 | 0.5000 |
| 2.25 | 0 / 180 | 0.0000 |
| 2.5 | 0 / 180 | 0.0000 |
| 2.75 | 0 / 180 | 0.0000 |
| 3.0 | 0 / 180 | 0.0000 |
| 4.0 | 0 / 180 | 0.0000 |
| 5.0 | 0 / 180 | 0.0000 |

This is strongly consistent with a deterministic cached-pose refresh cadence rather than random recycling eligibility.

## Topology behavior

Across every **partially recycled** case:

- exactly **one** support-topology transition occurred;
- no `1↔2` chatter was observed;
- no contact dropout occurred;
- no contact-ID replacement occurred;
- exactly one old feature persisted through the transition.

### `2→1`

Transition step by spin:

- spin `0`: no transition;
- `0.25`, `0.5`: step `315`;
- `0.75–2.0`: step `312`;
- `≥2.25`: step `311` (non-recycled baseline).

Thus partial recycling delayed the live `2→1` topology refresh by up to four outer steps in the lowest nonzero-spin cases.

Static-oracle mismatch counts followed the same pattern:

- spin `0`: `171`;
- `0.25`, `0.5`: `6`;
- `0.75–2.0`: `3`;
- `≥2.25`: `2`.

### `1→2`

Transition step by spin:

- spin `0`: no transition;
- `0.25`: step `351`;
- `0.5`: step `350`;
- `0.75`, `1.0`: step `351`;
- `1.25–5.0`: step `350`.

The partial-recycling delay was therefore at most one outer step for `1→2`.

Static-oracle mismatch counts:

- spin `0`: `130`;
- `0.25`: `1`;
- `0.5`: `0`;
- `0.75`, `1.0`: `1`;
- `1.25–5.0`: `0`.

## Dynamic transition observations

### `2→1`

Representative partial-band transition `Δvy`:

- `0.25`: `-4.764684e-5 m/s`;
- `0.5`: `-4.771699e-5 m/s`;
- `0.75`: `-5.072749e-5 m/s`;
- `1.0`: `-4.640745e-5 m/s`;
- `1.25`: `-5.177882e-5 m/s`;
- `1.5`: `-4.965820e-5 m/s`;
- `1.75`: `-4.771452e-5 m/s`;
- `2.0`: `-4.559164e-5 m/s`.

The non-recycled endpoint (`≥2.25`) is approximately `-5.58e-5` to `-5.60e-5 m/s`.

No partial case produced a grossly larger transition `Δvy` than the non-recycled endpoint. Maximum absolute vertical velocity during motion in the partial `2→1` band was of order `6.5e-5 m/s` or less.

### `1→2`

Representative partial-band transition `Δvy`:

- `0.25`: `+1.5650e-5 m/s`;
- `0.5`: `+1.5468e-5 m/s`;
- `0.75`: `+9.624e-6 m/s`;
- `1.0`: `+1.4344e-5 m/s`;
- `1.25`: `+6.480e-6 m/s`;
- `1.5`: `+8.011e-6 m/s`;
- `1.75`: `+1.0671e-5 m/s`;
- `2.0`: `+1.27165e-5 m/s`.

The non-recycled endpoint is approximately `+3.0e-6` to `+3.4e-6 m/s`.

Therefore intermittent recycling produced a **measurable relative amplification** of the `1→2` vertical transient, up to roughly five times the non-recycled endpoint in this constrained apparatus. The absolute amplitude remained about `1.6e-5 m/s` at the largest observed transition.

This is an observation, **not** an acceptability verdict.

## Impulse behavior

The transition did not lose support contact.

Typical `2→1` partial-band total-normal-impulse step deltas were approximately `-0.000315` to `-0.000391`, versus about `-0.000439` in the non-recycled endpoint.

Typical `1→2` partial-band total-normal-impulse step deltas were approximately `+0.000431` to `+0.000510`, versus about `+0.000380` in the non-recycled endpoint.

Final normal impulse changes remained small, consistent with redistribution within a persistent contact rather than contact destruction/recreation.

## Critical apparatus limitation

The observed spin bands are **not wheel-vs-static-road thresholds**.

E2a2u/E2a2v uses a kinematic ground body created from:

`b3MakeBoxHull( 5.0f, 0.10f, 5.0f )`

Pinned Box3D contact recycling uses the component-wise `maxExtent` of both **non-static** bodies when estimating angular relative-motion arc distance. Because the ground is kinematic rather than static, its approximately five-metre extent participates in the recycle criterion.

Consequently the measured transition from partial recycling (`≤2.0 rad/s`) to no recycling (`≥2.25 rad/s`) is heavily dependent on this diagnostic ground geometry. It must not be interpreted as a product wheel-spin threshold.

This source fact was identified before the low-spin refinement result was available. The refinement's strongly quantized recycle fractions are consistent with that cached-relative-pose mechanism.

## Verdict

### TRUSTED EXECUTED

Within the E2a2u/E2a2v kinematic-ground apparatus:

1. A deterministic intermittent contact-recycling regime **does exist**.
2. It does **not** create repeated topology chatter, contact dropouts or contact-ID resets in the tested flat-support crossing.
3. The surviving feature remains persistent through every observed `1↔2` topology transition.
4. Recycling cadence can delay topology refresh by a few outer steps.
5. The `1→2` transition transient is measurably amplified in the intermittent regime relative to the non-recycled endpoint, but no physical acceptability threshold has been established.
6. The location of the measured spin bands is dominated by the five-metre kinematic ground extent and is apparatus-specific.

### FALSIFIED / retired next step

Further refinement of the `~2 rad/s` boundary in this same apparatus is not a useful product question. It would mostly characterize the diagnostic ground's contribution to Box3D's recycle heuristic.

## Next bounded frontier

The next useful falsifier should vary only the kinematic support body's safe face extent while preserving the same wheel, motion, contact geometry and solver.

Question:

> Does the intermittent-recycling cadence shift systematically when the kinematic ground extent is reduced, while contact topology and transition dynamics remain qualitatively the same?

A positive result would directly demonstrate that the E2a2w spin bands are recycler-apparatus geometry rather than an intrinsic wheel-support threshold.

This should remain an explanatory/native-semantics experiment, not a policy-tuning exercise.

## Still NOT VALIDATED

- physical significance of the measured transition transients in a suspension or complete vehicle;
- behavior with tire friction / longitudinal / lateral forces;
- dynamic wheel contact against a genuinely static road under changing wheel orientation;
- any wheel-specific contact-recycling policy;
- dynamic native single-wheel-shape product integration;
- Owner hands-on acceptance;
- any change to canonical `main` or Owner Preview.
