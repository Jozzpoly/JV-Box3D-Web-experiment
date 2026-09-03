# Wheel mode5 E2a2r — asymmetric two-point COM-shift result

Date: 2026-09-03

Status: **TRUSTED EXECUTED EXPERIMENTAL EVIDENCE**

Scope: diagnostic-only broad flat-ground support experiment on the recovered P75 wheel carrier using the already-validated E2a2q coupled 2×2 normal mini-LCP. This is **not** accepted product geometry, not Owner Preview authority, and not a production solver change.

## Authority and run

- branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
- source head: `393a48639e0999a23917aec89fa9ad930350ce20`
- successful workflow run: `33804977630`
- successful job: `100813168881`
- pinned Box3D.js: `2617a0ff763a60c9f17cee57c6ea72aab75a5077`
- pinned Box3D: `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`

## Question

E2a2q established point-order invariance for a perfectly symmetric two-point flat-support manifold. E2a2r asks a stricter question:

> Does the coupled solve remain physically order-invariant when the same two contact points carry strongly unequal loads and have unequal lever arms/effective masses?

The geometry, plane, friction and solver remain unchanged. Only the rigid body's center of mass is shifted along the wheel axis.

## Controlled asymmetry

Flat-support interval:

- left: `-0.12646484375 m`
- right: `+0.12646484375 m`

E2a2r keeps the native mass and inertia tensor and changes only:

- local COM Z from `0` to `+0.05000000074505806 m` (~+50 mm)

This remains well inside the two support locations. For ideal static reactions on supports at ±a, a COM shift z gives the reaction ratio:

`(a + z) / (a - z)`

With `a = 0.12646484375 m` and `z = 0.05 m`, the expected ratio is approximately `2.30779 : 1`.

## Apparatus validity

All required guards passed in both canonical and reversed builds:

- requested COM shift applied exactly to float precision,
- no contact dropout after impulse,
- minimum point count = `2`, maximum point count = `2`,
- stable settled feature pair,
- centered case load split < `1.05`,
- shifted case load split > `1.25`,
- coupled pair path executed on wheel cases,
- matched-sphere one-point control never entered the pair path.

Stable support feature IDs remained:

- `259`
- `65795`

Each load measurement used `350` settled two-point samples, accumulated by sorted stable feature ID so reversal could not merely swap accumulator labels.

## Centered control reproduced

Centered load split:

- spin 0: `1.0`
- spin 40: `1.0`

Spin-40 vs spin-0 dynamics:

- final Y delta: `-0.00035762786865234375 mm`
- settled normal-impulse ratio: `1.0003583888454626`
- axis tilt: `0 deg`
- angular X/Y: `0 / 0`
- angular Z: `40 rad/s`

Centered per-point settled normal impulse means:

- spin 0: `0.0012081591412425041` / `0.0012081591412425041`
- spin 40: `0.0012081590168444175` / `0.0012081590168444175`

This reproduces the symmetric E2a2q behavior.

## Shifted +50 mm canonical result

### Spin 0

- applied local COM Z: `0.05000000074505806 m`
- point count: always `2`
- feature-set changes: `0`
- contact-ID changes: `0`
- feature 259 settled normal impulse mean: `0.00073049311991781`
- feature 65795 settled normal impulse mean: `0.0016858251229859888`
- load-split ratio: **`2.307790555475274`**
- final Y: `0.5454419851303101 m`
- final Vy: `-1.0377334547229111e-9 m/s`
- final angular X: `-2.5253024116267397e-9 rad/s`
- final angular Y/Z: `0 / 0`
- axis tilt: `0 deg`

### Spin 40

- point count: always `2`
- feature-set changes: `0`
- contact-ID changes: `0`
- feature 259 settled normal impulse mean: `0.0007304930751810649`
- feature 65795 settled normal impulse mean: `0.0016858249437063932`
- load-split ratio: **`2.307790451385913`**
- final Y: `0.5454416275024414 m`
- final Vy: `-5.990159479551949e-10 m/s`
- final angular X: `-1.1199779237358598e-7 rad/s`
- final angular Y: `2.8180233702101987e-9 rad/s`
- final angular Z: `40 rad/s`
- axis tilt: `0 deg`

Spin-40 vs spin-0:

- final Y delta: `-0.00035762786865234375 mm`
- settled total normal-impulse ratio: `1.0003583183212874`
- load split remains effectively unchanged.

The measured `~2.30779:1` load split matches the static support-ratio prediction. Therefore the asymmetry is real mechanical loading, not merely metadata or a nominal COM edit.

## Coupled block-path proof

Pair-solve calls:

- centered spin 0: `3840`
- centered spin 40: `3840`
- shifted spin 0: `3840`
- shifted spin 40: `3840`
- sphere spin 0: `0`
- sphere spin 40: `0`

The asymmetric result is produced by the coupled block path itself. One-point sphere behavior remains outside the block path.

## Point-order reversal

The reversed build completed successfully with the same two-point topology, stable feature IDs, real asymmetric load split and identical block-path usage.

Reversed load-split ratios:

- shifted spin 0: `2.3077903524252896`
- shifted spin 40: `2.3077904521567167`

Canonical → reversed deltas:

- centered final Y, spin 0: `0`
- centered final Y, spin 40: `0`
- shifted final Y, spin 0: `0`
- shifted final Y, spin 40: `0`
- shifted final Vy, spin 0: `-2.460183168295771e-10 m/s`
- shifted final Vy, spin 40: `+1.2975078789168037e-9 m/s`
- shifted angular X, spin 0: `+3.209342569476803e-9 rad/s`
- shifted angular X, spin 40: `-1.0220517765446857e-9 rad/s`
- shifted angular Y, spin 0: `0`
- shifted angular Y, spin 40: `+3.3018869860512723e-9 rad/s`
- shifted axis tilt, spin 0: `0 deg`
- shifted axis tilt, spin 40: `0 deg`
- low-feature impulse mean, spin 0: `+5.93718141057159e-11`
- high-feature impulse mean, spin 0: `-1.1308916910562905e-11`
- low-feature impulse mean, spin 40: `-1.829383649773475e-12`
- high-feature impulse mean, spin 40: `-3.65876729954695e-12`
- load-split ratio, spin 0: `-2.0304998438192e-7`
- load-split ratio, spin 40: `+7.708038651799143e-10`
- settled total impulse mean, spin 0: `+3.831727157788123e-10`
- settled total impulse mean, spin 40: `-1.436897684170546e-10`

Unlike the perfectly symmetric E2a2q case, this is **not byte-exact numerical equality**. The residual differences are at floating-point roundoff scale. No macroscopic state, manifold topology, feature identity, load distribution, final height or tilt becomes order-selected.

## Verdict

E2a2r provides strong causal evidence that the coupled two-point normal solve is **physically order-invariant to floating-point noise** in a genuinely asymmetric two-point support regime.

The important new evidence is not merely that the final body state looks similar. The case demonstrates all of the following simultaneously:

1. the two contacts remain present throughout settled support;
2. the load split is strongly unequal (`~2.30779:1`);
3. the measured split matches the expected statics from the imposed COM offset;
4. the coupled path executes on every wheel run and not on one-point sphere controls;
5. reversing point order does not create meaningful dynamic, topological or load-distribution divergence.

This materially strengthens E2a2q beyond the symmetric plateau case.

## What E2a2r does NOT validate

Still **NOT VALIDATED**:

- unequal geometric separation of the two contact points,
- biased/speculative two-point contact where one point is closer to leaving the manifold,
- one-point ↔ two-point active-set transitions,
- non-flat outer-profile contacts,
- inner/bore/side contacts,
- friction/tangent coupling,
- general native wheel manifold production suitability,
- product/Owner acceptance,
- production integration of this diagnostic solver.

## Next bounded gate

The next discriminating test should preserve the same flat P75 support and coupled normal solver but introduce a **small controlled geometric tilt/height bias** so the two manifold points have unequal separations while both remain active.

The test should first prove that:

- both points really remain in the manifold,
- their separations are measurably unequal,
- the case is not merely another load-only asymmetry,
- one-point sphere behavior is unchanged.

Then compare canonical vs reversed ordering. Only after this gate should the campaign intentionally cross the one-point ↔ two-point transition boundary.
