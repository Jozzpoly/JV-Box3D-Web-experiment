# Wheel mode5 — E1d2 first-contact epsilon / cross-phase result (2026-09-03)

> **Status:** executed experimental evidence on `work/wheel-mode5-e1d-recovery-2026-09-03`. This document is not product authority and does not promote the wheel experiment to `main` or Owner Preview.

## Authority boundary

At the time of this result:

- accepted source/product `main`: `5b28cc03d22264010680deb95a04abd04661bc22`
- Owner Preview remains separate composition/publishing infrastructure and was not modified by E1d2
- last trusted pre-E1d2 wheel checkpoint: `9fc67adf78937989b9d1e9ccc915fe2f71c39153` (`E1c analytic normal result`)
- fresh recovery branch: `work/wheel-mode5-e1d-recovery-2026-09-03`
- interrupted post-E1c branch/history remains historical-only and was not adopted as evidence

Fresh E1d2 commits:

- `4a7266a96640eb65f58ae555edecba202ac4f068` — read-only E1d native patch-introspection seam
- `156eeb10d2dfe1bf77b648dee653968bbbdd5276` — E1d2 first-contact epsilon sweep
- `c9c9c90a474344351b2f9eecf0f4eca795aa4682` — primary E1d2 workflow
- `0e7510fea68053a1a60cf26dad084f9a7d0fffba` — focused result reporting only
- `394382c773f3d7684d5b299e05344492a8a0c3d0` — cross-phase result reporting only

Executed runs:

- primary E1d2: Actions `33767680743`, job `100689607486` — success
- focused summary rerun: Actions `33768530870`, job `100692493526` — success
- cross-phase summary rerun: Actions `33769059435`, job `100694285364` — success

The reporting reruns use the same geometry, contact oracle and E1d2 measurement; they only reduce the emitted output to connector-readable summaries.

## Why E1d2 existed

E1c left two apparently different broad-support problems:

1. the selected single E1 witness jumped about `120.008913 mm` at ground phase `191 -> 192`, even though the raw support normal stayed stable;
2. interrupted historical E1d/E1d1 evidence suggested a much more worrying `142 -> 1 -> 142` accepted-candidate collapse around phases `156 -> 157 -> 158`, accompanied by an aggregate patch/moment jump of about `50 mm`.

Because the second observation came from the interrupted stream, E1d2 independently re-created only the required read-only introspection seam and tested whether that apparent collapse survives any physically non-zero penetration.

## Apparatus

The test retained the trusted E1 contact semantics:

- generalized annular P75 profile-of-revolution geometry
- `129` axial profile stations
- `128` angular sectors
- zero positive-separation acceptance skin
- E1 native `b3CollideHullAndTriangle` candidate manifolds
- unchanged E1 winner selection
- no solver integration and no persistent contact state

The E1d seam only exposes all accepted triangle manifolds for a pose. It does not change which candidates are accepted or which E1 candidate wins.

Recovered tire provenance remained:

- `396` source triangles
- marker contract `VERIFIED`
- coordinate frame `R1_VERIFIED_WHEEL_MARKERS`
- requested radius `0.514062464`
- requested width `0.4375`
- outer profile method `TRIANGLE_PLANE_INTERSECTION_WITH_ANGULAR_OUTER_ENVELOPE`

For each tested phase, E1d2 independently found the first outside-to-contact transition and then sampled inward offsets of:

`0, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000 µm`

Ground phases:

`155, 156, 157, 158, 159, 191, 192`

Localized historical side-low controls:

`0, 1`

Diagnostics included accepted-candidate count, full manifold-point count, station/sector coverage, candidate separations, aggregate point/witness centroids, mean raw candidate normal, and a geometric moment-arm proxy `cross(pointCentroid, normalMean)`.

These aggregate values are diagnostics only. They are **not** an impulse-weighted Box3D solver manifold.

## Result A — phase 157 collapse is an exact-first-contact singularity

At phase `157`, exact first contact produced:

- accepted candidates: `1`
- manifold points: `3`
- stations: `1`
- sectors: `1`

The onset bracket width was only about `0.198682 nm`, so the result is not explained by a coarse onset search.

After moving only `0.25 µm` inward from the same phase-specific onset:

- accepted candidates: `214`
- manifold points: `648`
- stations: `36`
- sectors: `3`

The `214`-candidate broad patch persisted through at least `500 µm`; at `1000 µm` it contained `216` candidates.

Relative to the `1 mm` state, phase `157` changed from the singular onset state to an essentially recovered support patch immediately:

### Exact onset vs 1 mm

- candidate-set Jaccard: `0.0046296`
- point-centroid distance: about `50.3349 mm`
- witness-centroid distance: about `50.4489 mm`
- moment-proxy distance: about `50.0751 mm`
- mean-normal angle: about `0.000107 deg`

### `0.25 µm` inward vs 1 mm

- candidate-set Jaccard: `0.9907407`
- point-centroid distance: about `0.99968 mm` (dominated by the expected normal-depth difference to the 1 mm reference)
- witness-centroid distance: about `0.88254 mm`
- moment-proxy distance: about `0.0003987 mm`
- mean-normal angle: about `0.000043 deg`

Therefore the historical ~`50 mm` collapse does **not** survive a physically non-zero interval in this sweep. It is sharply confined to the zero-separation threshold.

## Result B — cross-phase continuity independently confirms the conclusion

The decisive follow-up compared aggregate patch quantities at the **same inward offset** across adjacent phases.

### `156 -> 157`

Exact onset:

- candidate counts: `142 -> 1`
- point-centroid step: `50.328711 mm`
- witness-centroid step: `52.988842 mm`
- moment-proxy step: `50.328334 mm`
- mean-normal step: `0.0001306 deg`

At only `0.25 µm` inward:

- candidate counts: `142 -> 214`
- point-centroid step: `0.164053 mm`
- witness-centroid step: `4.451545 mm`
- moment-proxy step: `0.0004163 mm`
- mean-normal step: `0.0000412 deg`

At `1 µm` inward:

- point-centroid step: `0.164013 mm`
- moment-proxy step: `0.0000296 mm`
- mean-normal step: `0.00000171 deg`

### `157 -> 158`

Exact onset:

- candidate counts: `1 -> 142`
- point-centroid step: `50.328702 mm`
- witness-centroid step: `52.988870 mm`
- moment-proxy step: `50.328324 mm`
- mean-normal step: `0.0001309 deg`

At `0.25 µm` inward:

- candidate counts: `214 -> 142`
- point-centroid step: `0.164125 mm`
- witness-centroid step: `4.451449 mm`
- moment-proxy step: `0.0003447 mm`
- mean-normal step: `0.0000409 deg`

At `1 µm` inward:

- point-centroid step: `0.164124 mm`
- moment-proxy step: `0.0000543 mm`
- mean-normal step: `0.00000226 deg`

The exact-threshold discontinuity therefore disappears cross-phase as well as along a single phase's penetration sweep.

The remaining several-millimetre movement of the **witness centroid** while the full point centroid, support normal and moment proxy stay almost fixed is additional evidence that averaging per-triangle chosen/deepest witnesses is itself ownership-sensitive and should not become solver contact-point semantics.

## Result C — phase `191 -> 192` confirms single-winner ownership failure

E1c had observed a `120.008913 mm` jump of the single selected winner point between these phases.

Fresh aggregate E1d2 cross-phase measurements instead show:

### Exact onset

- candidate counts: `72 -> 142`
- point-centroid step: `0.164107 mm`
- witness-centroid step: `13.222859 mm`
- moment-proxy step: `0.0011360 mm`
- mean-normal step: `0.0001215 deg`

### `0.25 µm` inward

- candidate counts: `214 -> 142`
- point-centroid step: `0.164089 mm`
- witness-centroid step: `4.451475 mm`
- moment-proxy step: `0.0000315 mm`
- mean-normal step: `0.00000490 deg`

The huge E1c single-winner movement is therefore not a corresponding jump of broad-support geometry. It is a triangle/witness ownership semantic failure.

## Result D — candidate cardinality is not a physical manifold invariant

Neighbouring ground phases add or remove large numbers of tessellation candidates with tiny penetration while aggregate support quantities remain very stable.

Examples:

- phase `155`: `142` candidates at onset, `214` by `1 µm`, `286` at `1 mm`; onset moment-proxy distance from its 1 mm state is only about `0.00109 mm`
- phase `156`: `142` candidates through at least `100 µm`, `286` at `1 mm`; onset moment-proxy distance from 1 mm is about `0.0000093 mm`
- phase `158`: analogous to `156`, with onset moment-proxy distance about `0.0000097 mm`
- phase `159`: `142 -> 214 -> 284` candidates across the sweep while the corresponding moment-proxy differences remain around micrometre or sub-micrometre scale

Therefore raw accepted-triangle count should not be promoted into a physical contact-manifold contract.

## Result E — localized side-low remains a different regime

The historical small-rock side-low control did not exhibit the broad-support explosion near onset.

Phase `0`:

- `2` candidates from exact onset through `1 mm`
- one station, two sectors near onset
- candidate set remained unchanged through the sweep

Phase `1`:

- `2` candidates through at least `100 µm`
- expands to `6` candidates by `1 mm`

This supports the E1c distinction between localized side/inner contact and broad flat support.

Do not over-interpret raw-normal aggregate values on side-low: E1c already demonstrated that the individual triangle-manifold normal is the wrong normal semantic in that regime.

## Current evidence verdict

E1d2 closes the strongest **static broad-support manifold-semantics blocker** that remained after E1c:

1. the apparent `142 -> 1 -> 142` / ~`50 mm` failure is confined to the exact first-contact threshold and broad support is restored by the smallest tested positive inward offset (`0.25 µm`);
2. the restored support patch is cross-phase continuous in point-centroid, aggregate moment proxy and mean support normal across `156 -> 157 -> 158`;
3. the `191 -> 192` `120 mm` E1 winner jump is not a support-geometry jump;
4. a single selected tessellation triangle/witness is rejected as broad-support contact-point semantics;
5. raw triangle-candidate cardinality and per-triangle witness ownership are also rejected as physical manifold invariants;
6. generalized annular boundary geometry remains viable at the static diagnostic level.

This is evidence that a stable broad-support representation should be derived from an invariant geometric support feature/manifold, not from whichever circumferential tessellation triangle happens to win selection.

## Relevant native donor lesson — not geometry authority

The recovered native `b3Wheel` donor contains a useful conceptual precedent for broad plane contact: it selects a geometric profile support feature (a vertex or support segment), gives it stable profile feature IDs, and constructs a 1–2 point plane manifold without adding neighbouring circumferential samples.

However, that donor wheel uses a convex/filled cross-section representation and therefore does **not** preserve the annular tire bore required by the current wheel research. The donor `b3Wheel` geometry must not simply be promoted as the E1 annular tire.

The reusable idea is the **stable support-feature/manifold semantic**, not the filled donor shape.

## Still NOT VALIDATED

E1d2 does **not** establish any of the following:

- dynamic solver stability
- persistent contact warm-start / feature-ID stability
- impulse-weighted contact-point or torque-arm behavior
- correct transition behavior when a timestep first creates contact exactly at or near the zero-separation singularity
- a native annular wheel shape implementation
- a final regime classifier between broad support and localized side/inner contact
- behavior across all terrain/contact orientations
- accepted product behavior or Owner Preview authority

The aggregate centroids and moment proxy used here are diagnostics, not the final solver manifold.

## Next bounded gate

The evidence now justifies a **small dynamic contact-semantics spike**, still isolated from the product.

That spike should test the smallest native/manifold representation capable of preserving the two demonstrated regimes:

- **broad ground/support:** stable support normal plus a deterministic geometric support feature/manifold; do not use the arbitrary E1 triangle winner point
- **localized side/inner:** retain the annular bore/topology and test the continuous profile-derived normal supported by E1c rather than the hopping raw triangle normal

The first dynamic gate should deliberately cross contact creation/separation under wheel spin and load, because exact first-contact threshold behavior remains the principal unresolved risk exposed by E1d2.

It should falsify dynamic semantics before any product integration or Owner Preview promotion.
