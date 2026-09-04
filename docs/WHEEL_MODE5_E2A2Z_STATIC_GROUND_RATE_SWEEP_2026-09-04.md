# Wheel mode5 E2a2z — static-ground crossing-rate / recycler-cadence sweep

Date: 2026-09-04
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Source commit: `9f701ea2e2715319e5a65eabdea29d3631223ad5`
Workflow run: `33830014998`
Job: `100890802727`

## Scope

E2a2z is a bounded causal follow-up to E2a2y. It keeps the E2a2y static-ground `SetTransform` seam, flat-P75 two-point carrier, E2a2q coupled normal solve, friction=0, X/Y tilt lock, and wheel spin fixed at `5 rad/s`.

It varies only ground crossing angular speed:

- `10`, `15`, `20`, `30`, `40`, `80 urad/s`;
- both `2 -> 1` and `1 -> 2` feature crossings;
- default contact recycle distance `0.05 m` versus recycle-off `0 m`.

Primary question: is the ~0.2–0.25 mm/s transition transient observed in E2a2y controlled by crossing rate / refresh cadence, or does it remain approximately invariant while recycling state is unchanged?

## Execution integrity

Native/WASM composition, build, tests, and E2a2z runner all completed successfully.

For every tested case:

- `contactDropoutsMotion = 0`;
- `contactIdChangesMotion = 0`;
- exactly one topology transition occurred;
- exactly one old feature persisted through the transition.

The static-ground seam therefore remained stable across the entire rate sweep.

## Results

### Default recycling (`0.05 m`), spin `5 rad/s`

A decisive invariant appeared: **every tested crossing rate produced exactly `90 / 180` recycled motion steps**.

| rate (urad/s) | 2->1 transition dVy (mm/s) | 2->1 max | 1->2 transition dVy (mm/s) | 1->2 max | recycled steps |
|---:|---:|---:|---:|---:|---:|
| 10 | +0.1994 | 0.2906 | +0.2482 | 0.2482 | 90/180 |
| 15 | +0.1996 | 0.2905 | +0.2484 | 0.2484 | 90/180 |
| 20 | +0.1984 | 0.2913 | +0.2482 | 0.2484 | 90/180 |
| 30 | +0.1958 | 0.2937 | +0.2483 | 0.2486 | 90/180 |
| 40 | +0.1928 | 0.2966 | +0.2484 | 0.2486 | 90/180 |
| 80 | +0.1859 | 0.3026 | +0.2483 | 0.2491 | 90/180 |

The `1 -> 2` transition is essentially rate-invariant over an 8x crossing-rate range. `2 -> 1` transition dVy decreases modestly (~7%) while peak |Vy| increases modestly; neither behavior resembles a transient that scales strongly with crossing rate.

### Recycling disabled (`0 m`)

Recycled steps are `0 / 180` for every case.

`2 -> 1` transition dVy stays tightly clustered around `-0.0482` to `-0.0487 mm/s` across the entire rate range.

`1 -> 2` transition dVy remains around `+0.00085` to `+0.00133 mm/s`, with max |Vy| around `0.00126` to `0.00166 mm/s`.

This recycle-off control is also substantially rate-invariant compared with the size of the recycling-on/off difference.

## Falsification result

### FALSIFIED: crossing-rate explanation as the dominant cause

Within `10–80 urad/s`, changing crossing rate by 8x does **not** materially change recycler activity (`90/180` throughout) and does not materially change the large recycling-on transition transient.

Therefore the E2a2y transient should not be interpreted primarily as a consequence of how quickly the ground crosses the `1 <-> 2` feature boundary.

The much stronger causal axis remains **contact recycling state/cadence itself**:

- recycling on/intermittent: ~`0.19–0.25 mm/s` transition class;
- recycling off: ~`0.0009–0.049 mm/s` depending direction.

This is evidence about the bounded flat-carrier apparatus, not a product-wheel acceptance result.

## Critical caveat

The sweep keeps `motionSteps = 180` fixed while changing crossing rate. Consequently total angular excursion and post-transition dwell time differ between rates. `finalY` and `finalVy` are therefore **not clean cross-rate observables** and should not be used to infer convergence.

The local transition metrics, recycler counts, contact identity, and persisted-feature telemetry are the valid evidence for this experiment.

Minor `topologyMismatchCount` values (`0–3`) vary around the analytical source-tolerance threshold and do not coincide with contact loss or identity recreation. They do not invalidate the observed runtime transition, but the analytical predictor should not be promoted to stronger authority than the actual manifold telemetry.

## Status

### TRUSTED EXECUTED / BOUNDED FALSIFIER

Supported:

1. The static-ground seam remains contact-stable from `10` through `80 urad/s`.
2. At fixed wheel spin `5 rad/s` and default recycle distance, recycler activity remains `90/180` despite an 8x crossing-rate change.
3. The large intermittent-recycling transition transient is approximately rate-invariant across this range.
4. Recycle-off behavior is much quieter and also approximately rate-invariant.
5. Crossing rate is therefore not the dominant explanatory variable for the E2a2y transient in this bounded regime.

### NOT VALIDATED

- Why spin `5 rad/s` yields exactly `90/180` recycled steps.
- Whether transient magnitude changes monotonically with controlled recycle-distance thresholds at fixed physical motion.
- Whether recycler eligibility cadence itself, versus warm-start/contact-cache contents when recycling occurs, is the causal mechanism.
- Production-equivalence of repeated static-body `SetTransform`.
- Frictional rolling, free camber/steer, full annular geometry, side/bore contact, or product integration.

## Natural boundary / next move

Do not widen into friction, full geometry, or product integration.

The next bounded causal experiment should hold the physical motion fixed (`spin=5 rad/s`, crossing rate `20 urad/s`) and vary **only contact recycle distance** between `0` and `0.05 m` (for example a small threshold sweep).

This is a stronger next test than another crossing-rate or spin sweep because it changes the recycler policy while leaving wheel spin and crossing kinematics unchanged. Measure:

- recycled steps / cadence;
- transition dVy and max |Vy|;
- persisted features/contact identity;
- local impulse deltas.

Question: does transition severity track recycler activation/cadence as recycle distance is increased? If yes, that establishes a much tighter causal link before inspecting the recycler implementation itself. If no, the present interpretation must be revised before further solver work.
