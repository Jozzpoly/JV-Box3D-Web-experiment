# Wheel mode5 — E1c analytic normal result (2026-09-03)

> **Status:** executed experimental evidence on `work/wheel-mode5-recovery-checkpoint-2026-09-03`. This document is not product authority and does not promote the wheel experiment to `main` or Owner Preview.

## Authority boundary

At the time of this result:

- accepted source/product `main`: `5b28cc03d22264010680deb95a04abd04661bc22`
- Owner Preview source pointer: `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`
- accepted static JSPREV2 layer: `a325c279cfe63a0607dba33c3c635a1716e09f8f`
- E1c source head: `c44a6d3a76926e1861223292eb142108be155cbf`
- GitHub Actions run: `33763998895` — `success`

## Question

E1b showed two different facts at once:

1. the 128-sector generalized annular P75 boundary had very stable side-low onset/contact location;
2. the raw normal selected from the triangle-vs-hull manifold hopped by almost exactly 90 degrees as the wheel phase advanced.

E1c tested a narrow falsifier: keep the same native E1 contact/onset oracle and selected witness point, but independently derive a profile-of-revolution normal from the recovered continuous `outer P75 / inner` axial profile. This is diagnostic only; it is not a solver integration.

## Executed controls

- 128 angular sectors
- 129 axial profile stations
- 256 relative wheel phases
- zero positive-separation acceptance skin
- verified recovered Tire provenance (`396` triangles, `VERIFIED` marker contract)
- flat-ground central-strip control on outer surface
- historical small-rock side-low control on inner surface

Build and Box3D.js smoke tests passed before the measurement.

## Results

### Historical small-rock side-low

The geometric contact remained the same strong E1b result:

- all `256/256` phases selected the expected inner surface;
- onset range: `0.0183001161 mm`;
- selected point step: median `0.0302403 mm`, max `0.0303010 mm`;
- accepted candidates: exactly `2` for every phase;
- selected station did not change across the sweep.

Raw triangle-manifold normal:

- median step: about `90.000000 deg`;
- max step: `90.0000041 deg`.

Analytic profile normal:

- median step: `0.0100362 deg`;
- max step: `0.0100566 deg`;
- deviation from its mean stayed around `0.005 deg`;
- profile residual at the selected witness stayed between about `-0.0370 mm` and `-0.0172 mm`.

The raw and analytic normals disagree materially (`48.89–69.03 deg`), so this is not merely numerical smoothing of the same normal.

**Evidence-level interpretation:** for this side-low regime, the 90-degree hopping belongs to the raw selected triangle-manifold normal semantic, not to the continuity of the recovered annular boundary. A profile-derived inner-surface normal is strongly more continuous for the same contact trajectory.

### Flat ground

The control exposes a different regime:

- all `256/256` phases selected the expected outer surface;
- onset range: `0.164550543 mm`;
- raw native normal remains essentially `-Y` and extremely stable (max step `0.000265239 deg`);
- analytic profile normal differs from expected ground normal by up to `1.406271 deg` and steps by up to `1.406268 deg`.

The selected witness point still has the E1b discontinuity:

- max point step: `120.008913 mm`;
- exact transition: phase `191 -> 192`;
- the selected station changes `81 -> 46` and the witness moves between opposite `z` sides of the broad ground contact while the raw contact normal remains stable.

Most ground profile residuals are near zero, but the phase-191 witness is about `-0.1623 mm` inside the analytic profile before the ownership jump.

**Evidence-level interpretation:** a blanket rule `replace native normal with analytic wheel-profile normal` is not justified. On broad flat support the native pair normal is already the stronger normal semantic, while the selected diagnostic witness/contact-point ownership is the unstable quantity.

## Current verdict

E1c **supports**, but does not complete, a regime-aware contact model:

- `side/inner localized contact`: continuous profile normal is a strong candidate and removes the demonstrated triangle-normal hopping;
- `broad flat support`: native pair/support normal is already stable; the immediate unresolved issue is witness/manifold point ownership, not normal continuity.

It therefore falsifies the simple universal substitution policy and strengthens the hypothesis that normal semantics must be derived from the contact regime rather than directly from whichever tessellation triangle wins selection.

## Still NOT VALIDATED

- no dynamic solver has consumed the E1c analytic normal;
- no native single wheel shape/manifold implementation is validated;
- no stable broad-support contact-point / torque-arm ownership contract is validated;
- the 120 mm flat-ground witness jump has not yet been shown to be dynamically harmful rather than an equivalent-point permutation;
- no wheel-mode5 result here is accepted product behavior or Owner Preview authority.

## Best next gate

Before a dynamic solver spike, run one bounded **contact-manifold semantics diagnostic** around the flat-ground `191 -> 192` transition and the side-low control. Its purpose is to distinguish:

1. harmless equivalent witness permutation on a broad support patch,
2. a real torque-arm/manifold discontinuity that would destabilize dynamics,
3. and which invariant representation (multi-point manifold, projected/aggregated support witness, or another native contact feature) preserves physical meaning without reintroducing triangle ownership.

Only after that gate should the project decide whether the smallest dynamic single-manifold spike is justified.
