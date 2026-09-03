# Wheel mode5 E2a2x — kinematic ground extent causality result

Date: 2026-09-03

## Scope

E2a2x tests whether the spin bands observed in E2a2w are intrinsic to the wheel contact or are caused by the diagnostic kinematic ground body's contribution to Box3D contact-recycling motion bounds.

The exact E2a2v dynamic crossing is reused. One geometric variable changes:

- kinematic ground half-extent X = `5.0 m`, or
- kinematic ground half-extent X = `1.0 m`.

Unchanged:

- ground half-extent Y = `0.10 m`,
- ground half-extent Z = `5.0 m`,
- contact recycle distance = `0.05 m`,
- recovered flat P75 two-point wheel carrier,
- friction `0`,
- warm starting enabled,
- X/Y wheel tilt locks,
- kinematic ground angular speed `20 µrad/s`,
- E2a2q diagnostic coupled 2×2 normal solve,
- separate `2→1` and `1→2` crossings.

The E2a2 flat carrier has radial support radius `0.54551075 m`, axial endpoints `±0.12646484 m`, and corner radius `0`. A `1.0 m` ground half-extent in X therefore leaves roughly `0.45 m` lateral margin to the wheel projection; the experiment remains a broad top-face contact rather than an edge-contact test.

## Trusted executed authority

- source/workflow commit: `4381ebc32f3b50aa8dd921f363c5662cdb1e6ccc`
- workflow run: `33812112919`
- job: `100836062390`
- conclusion: **SUCCESS**

Spin grid:

`0, 1, 2, 2.25, 3, 5, 7.5, 10, 12.5, 15 rad/s`

## Pre-registered source prediction

Pinned Box3D computes recycler angular displacement using:

`2 * length( b3ModifiedCross( abs(qr.v), maxExtent ) )`

with component-wise `maxExtent` across both non-static bodies.

For wheel spin around Z, `b3ModifiedCross` couples that rotation primarily to the X/Y extents. Because the E2a2u support body is kinematic, its X half-extent participates in the criterion.

Before E2a2x executed, reducing ground half-extent X from `5 m` to `1 m` was predicted to move the no-recycling boundary several times upward. A simple source-scale estimate including relative-pose translation placed the 1m boundary around `6–8 rad/s`; the test grid deliberately sampled `5`, `7.5`, and `10 rad/s` without tuning to the outcome.

## Recycling result

Recycle cadence was identical between crossing directions at each `(groundHalfX, spin)` pair.

| spin (rad/s) | 5m ground | 1m ground |
|---:|---:|---:|
| 0 | 180/180 | 180/180 |
| 1 | 120/180 | 155/180 |
| 2 | 90/180 | 135/180 |
| 2.25 | 0/180 | 120/180 |
| 3 | 0/180 | 120/180 |
| 5 | 0/180 | 90/180 |
| 7.5 | 0/180 | 0/180 |
| 10 | 0/180 | 0/180 |
| 12.5 | 0/180 | 0/180 |
| 15 | 0/180 | 0/180 |

Thus:

- the 5m apparatus loses recycling between `2.0` and `2.25 rad/s`;
- the 1m apparatus still recycles half the controlled motion steps at `5 rad/s`;
- the 1m apparatus has no recycling at `7.5 rad/s`.

This matches the pre-registered source prediction qualitatively and in scale.

## Topology result

For every nonzero-spin case with at least one narrow-phase refresh:

- exactly one support-topology transition occurred;
- no contact dropout occurred;
- no contact-ID replacement occurred;
- exactly one old feature persisted through the transition.

At spin `0`, full recycling preserved the initial topology throughout the crossing for both ground extents, as in E2a2v/E2a2w.

### 5m ground

The E2a2w behavior was reproduced:

- `2→1`: partial cases transition at step `312`; non-recycled cases at `311`;
- `1→2`: partial spin `1` transitions at `351`, partial spin `2` at `350`, non-recycled baseline at `350`.

### 1m ground

The widened partial-recycling band produced:

- `2→1`: spin `1` step `315`; spins `2–5` step `312`; no-recycle `≥7.5` step `311`;
- `1→2`: spin `1` step `350`; spin `2` step `352`; spins `2.25–3` step `351`; spin `5` step `350`; no-recycle `≥7.5` step `350`.

No repeated `1↔2` chatter was observed.

## Dynamic transition observations

Changing ground extent changes no local infinite-plane contact geometry in the tested region, but it changes recycler cadence. Correspondingly, the transition transient changes measurably.

### 5m partial-recycling reference

Representative values reproduced from E2a2w:

- `2→1`, spin `1`: `Δvy ≈ -4.64e-5 m/s`, max `|vy| ≈ 6.44e-5 m/s`;
- `2→1`, spin `2`: `Δvy ≈ -4.56e-5 m/s`, max `|vy| ≈ 6.51e-5 m/s`;
- `1→2`, spin `1`: `Δvy ≈ +1.43e-5 m/s`;
- `1→2`, spin `2`: `Δvy ≈ +1.27e-5 m/s`.

The non-recycled `1→2` endpoint is approximately `+3.0e-6` to `+3.6e-6 m/s`.

### 1m partial-recycling cases

`2→1`:

- spin `1`: `Δvy ≈ +1.48e-5 m/s`, max `|vy| ≈ 1.64e-4 m/s`;
- spin `2`: `Δvy ≈ +1.87e-5 m/s`, max `|vy| ≈ 1.64e-4 m/s`;
- spin `2.25`: `Δvy ≈ -1.15e-5 m/s`, max `|vy| ≈ 1.14e-4 m/s`;
- spin `3`: `Δvy ≈ +2.33e-5 m/s`, max `|vy| ≈ 1.60e-4 m/s`;
- spin `5`: `Δvy ≈ +8.67e-6 m/s`, max `|vy| ≈ 1.19e-4 m/s`.

`1→2`:

- spin `1`: `Δvy ≈ +1.197e-4 m/s`;
- spin `2`: `Δvy ≈ +1.153e-4 m/s`;
- spin `2.25`: `Δvy ≈ +6.32e-5 m/s`;
- spin `3`: `Δvy ≈ +1.108e-4 m/s`;
- spin `5`: `Δvy ≈ +6.75e-5 m/s`.

The largest observed `1→2` transition is therefore about `1.20e-4 m/s` (`120 µm/s`): roughly an order of magnitude above the 5m partial cases and several tens of times the non-recycled endpoint, while still small in absolute velocity units inside this highly constrained diagnostic seam.

Total-normal-impulse transition deltas also increased in the 1m partial cases, reaching approximately `+0.00146` to `+0.00151` for representative `1→2` cases versus approximately `+0.00038` for the non-recycled endpoint.

No support loss accompanied these transients.

## Verdict

### TRUSTED EXECUTED

**The E2a2w spin bands are causally dependent on the kinematic support body's extent. They are not intrinsic wheel-spin thresholds.**

Evidence:

1. the local wheel/support face geometry remains safely broad and unchanged;
2. the only experimental geometry change is ground half-extent X `5→1 m`;
3. source semantics predict that X extent enters the recycler motion bound for Z-axis wheel spin;
4. the partial-recycling band moves from ending near `2.25 rad/s` to persisting through `5 rad/s` and ending before `7.5 rad/s`;
5. this agrees with the pre-run source-scale prediction of a boundary around `6–8 rad/s` for the 1m apparatus.

### Important new finding

Recycler cadence is not merely an observational bookkeeping detail. With the same local flat contact geometry, changing the support-body extent can materially alter the transition transient by changing when narrow-phase refreshes occur.

The larger relative transient seen with the 1m apparatus means the intermittent-recycling behavior must **not** yet be classified as benign merely because there is no topology chatter or contact loss.

### Retired direction

Further tuning or refinement of spin thresholds using a kinematic support box is no longer a useful product question. The measured threshold moves with diagnostic support-body extent by design.

## Next bounded frontier

The next question should remove the kinematic support body's extent from recycler semantics rather than choosing another arbitrary box size:

> Can the same controlled orientation crossing be exercised against a genuinely static support while preserving contact identity and obtaining a valid recycler/narrow-phase observation?

A minimal feasibility experiment should test a static ground whose transform is changed in a bounded, tiny step sequence using the native body transform API, while recording:

- contact identity and dropout behavior,
- recycled-contact count,
- observed manifold topology,
- whether the transform operation forces broad-phase/contact recreation,
- transition dynamics only if the contact remains semantically valid.

If static transform manipulation itself invalidates the contact apparatus, that route should be rejected before adding motors/joints or treating it as product evidence.

## Still NOT VALIDATED

- whether static-ground transform manipulation is a valid dynamic test seam;
- actual recycler behavior for a normal dynamic wheel against an ordinary static road while wheel orientation evolves physically;
- physical significance of the measured transient in suspension/full-vehicle dynamics;
- frictional tire forces;
- any wheel-specific contact-recycling policy;
- full native wheel-shape product integration;
- Owner hands-on acceptance;
- any change to canonical `main` or Owner Preview.
