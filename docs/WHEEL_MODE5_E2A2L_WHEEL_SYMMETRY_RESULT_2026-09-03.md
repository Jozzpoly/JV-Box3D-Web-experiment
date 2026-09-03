# Wheel mode5 — E2a2l wheel symmetry separation result — 2026-09-03

## Status

**EXECUTED EXPERIMENTAL EVIDENCE — promising but incomplete.**

This is not product acceptance and does not authorize a production solver change. `main`, Owner Preview and accepted product state remain untouched.

## Question

Can the real axisymmetric `b3_wheelShape` preserve its geometric roll symmetry during convex sub-step separation prediction by replacing full body roll phase with only the minimum rotation required to carry the wheel's symmetry axis from its start-of-step direction to its current direction?

The intended geometric contract is:

- pure rotation around `wheel.axis` should not change wheel geometry;
- rotation that changes the axis direction must remain geometrically meaningful;
- ordinary convex shapes must retain the exact original solver path;
- angular velocity, Jacobians, friction, restitution, rolling resistance and impulse application remain unchanged.

The donor wheel implementation explicitly defines the shape as a surface of revolution about its spin axis and computes its manifold from the axis rather than wheel facets/roll phase.

## Provenance

- branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
- source head: `904fec086a264f435d6d051e7717204a90b42b70`
- workflow: `.github/workflows/wheel-mode5-e2a2l-wheel-symmetry-separation.yml`
- valid run: `33793886523`
- valid job: `100776791441`
- Box3D.js: `2617a0ff763a60c9f17cee57c6ea72aab75a5077`
- pinned Box3D vendor: `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`
- donor wheel patch reconstructed from `Jozzpoly/Box3d_FunProject` diff `77a67132...241fe10a`
- real wheel: existing E2a2 two-point P75 flat-support `b3Wheel`
- ordinary-shape control: existing E2a2i matched sphere matrix
- rollout: 2 s, friction=0, real-wheel axial spin 0 vs 40 rad/s.

Earlier E2a2l runs are apparatus-invalid:

- run `33793386378`: baseline runner incorrectly required a permanent two-point manifold even though prior E2a2 evidence already established spin40 can collapse to one point;
- run `33793598299`: physical rollout compiled/executed, but the cross-build sphere identity assertion compared JavaScript `undefined` keys with a JSON receipt that necessarily omitted them.

Neither failed run is evidence against the symmetry hypothesis.

## Intervention

The internal wide convex constraint receives zero symmetry metadata for ordinary shapes and a world-space symmetry axis for dynamic `b3_wheelShape` lanes.

For ordinary lanes, anchor rotation remains exactly:

```c
rotate(dq, anchor)
```

For wheel lanes, separation prediction uses a shortest-arc geometric rotation mapping the prepared wheel axis to its current axis. Pure roll around that axis therefore becomes identity for geometric separation.

Only the separation-prediction anchor rotation is changed. The rest of rigid-body dynamics remains on the original path.

## Identity controls

Both passed in valid run `33793886523`.

### Real wheel spin0

The complete compact spin0 telemetry is bit-identical between baseline and wheel-symmetry builds.

### Ordinary matched sphere

The full E2a2i matched-sphere matrix for:

- substeps 1 and 4,
- spin 0,
- spin40 about X, Y and Z,

is bit-identical between baseline and wheel-symmetry builds.

Therefore the intervention is demonstrated to be scoped to `b3_wheelShape` lanes in this apparatus.

## Baseline real wheel

spin0:

- final Y: `0.5454695224761963 m`
- final Vy: `~6.65e-7 m/s`
- settled total impulse mean: `0.01932370672`
- manifold points: `2..2`
- feature-set changes after impulse: `0`

spin40:

- final Y: `0.543586015701294 m`
- final Vy: `-0.03920561075 m/s`
- settled total impulse mean: `0.03849982245`
- manifold points: `1..2`
- feature-set changes after impulse: `231`
- contact-id changes: `0`
- final angular Z: `40.0008087 rad/s`

spin40 relative to spin0:

- final Y delta: **`-1.883506775 mm`**
- final Vy delta: **`-0.0392062753 m/s`**
- total-impulse ratio: **`1.99236218`**

## Wheel-symmetry result

spin0 remains bit-identical to baseline.

spin40 after wheel-symmetry separation:

- final Y: `0.545261561870575 m`
- final Vy: `+0.00883704238 m/s`
- settled total impulse mean: `0.02481696354`
- manifold points: `1..2`
- feature-set changes after impulse: `94`
- contact-id changes: `0`
- final angular Z: `39.9993172 rad/s`

spin40 relative to spin0:

- final Y delta: **`-0.207960606 mm`**
- final Vy delta: **`+0.00883637782 m/s`**
- total-impulse ratio: **`1.28427552`**

## Quantified effect

Relative to the pinned baseline pathology:

- absolute final-Y error reduced by about **88.96%**;
- excess impulse ratio above 1 reduced by about **71.35%**;
- feature-set churn reduced by about **59.31%** (`231 → 94`).

This is a large directional improvement, not full invariance.

## Verdict

### Supported

A wheel-specific geometric separation treatment based on the wheel's symmetry axis is **strongly supported as relevant** to the real `b3Wheel` spin pathology.

It is also demonstrated to be scopeable without changing the ordinary matched-sphere path in this experiment.

### Not established

E2a2l does **not** establish that the current shortest-axis implementation is complete or production-ready.

Residual spin-dependent behavior remains:

- `~0.208 mm` final-Y offset;
- non-zero final vertical velocity;
- impulse mean still ~28.4% above spin0;
- manifold point count still changes `1..2`;
- feature-set churn remains `94` changes.

Therefore it would be premature to advance directly to a steer/camber acceptance gate or product integration.

## Next bounded discriminator

Run the same real-wheel spin0/spin40 rollout under the broader E2a2k-r2 counterfactual that removes the rotational-anchor contribution entirely from active wide convex separation prediction.

This is diagnostic only.

Interpretation:

- if broad no-rotation separation produces approximately the same residual as E2a2l, the remaining pathology lies outside the removed roll-phase component / outside this separation term;
- if broad no-rotation produces materially better invariance, the current wheel-symmetry axis mapping or its per-lane metadata still leaves a geometric rotational contribution that should not be present for pure axial roll.

Only after this discriminator should the campaign decide whether to refine the wheel symmetry mapping or move to non-axis/camber preservation testing.
