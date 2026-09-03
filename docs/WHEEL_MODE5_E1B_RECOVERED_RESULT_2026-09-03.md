# Wheel mode5 E1b recovered result — 2026-09-03

This is an experimental recovery checkpoint on `work/wheel-mode5-recovery-checkpoint-2026-09-03`. It is evidence/history, not product authority.

## Authority protection

- Accepted `main` remains `5b28cc03d22264010680deb95a04abd04661bc22`.
- `preview/owner.json` remains on accepted executable source `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0` with accepted JSPREV2 static layer `a325c279cfe63a0607dba33c3c635a1716e09f8f`.
- No E1 experiment has been promoted to Owner Preview or product baseline.

## Recovery fact

The previous browser conversation ended while workflow `33762419144` was still executing. The workflow subsequently completed successfully. Job `100671756848` ran both the 64-sector and 128-sector native E1b continuity measurements at 256 wheel-spin phases and zero acceptance skin.

The test source at the run was commit `d2cb21b940006e9b636573d621efb8a68fcfdb47` (`diag: bracket first E1b annular contact transition`).

## E1b executed evidence

### 64-sector diagnostic surface

Mesh: 33,024 triangles.

Flat-ground central strip:

- all 256 phases selected outer surface;
- onset range: `0.6572379669 mm`;
- world-normal step: median about `0.00000283 deg`, max about `0.00012838 deg`;
- station changes: `18`;
- sector changes: `65`.

Historical small-rock side-low case:

- all 256 phases selected inner surface;
- onset range: `0.1084336638 mm`;
- onset delta relative to E0 P75-64 reference `0.1700947544 m`: min `-0.09337 mm`, median `-0.02083 mm`, max `+0.01507 mm`;
- contact-point step: median about `0.08969 mm`, p95 about `0.15451 mm`, max about `0.15455 mm`;
- world-normal step: median about `58.61 deg`, p95 `90 deg`, max about `90.000003 deg`;
- station changes: `54`;
- sector changes: `64`.

### 128-sector diagnostic surface

Mesh: 66,048 triangles.

Flat-ground central strip:

- all 256 phases selected outer surface;
- onset range: `0.1645505428 mm`, about 4x smaller than 64-sector;
- world-normal step remains effectively continuous: median about `0.0000040 deg`, max about `0.000265 deg`;
- station changes: `14`;
- sector changes: `141`;
- `pointStepMm.max` reports about `120.009 mm`, but the current `worstPointStep` phase locator is not trustworthy because of an instrumentation reducer bug described below.

Historical small-rock side-low case:

- all 256 phases selected inner surface;
- onset range: `0.0183001161 mm`, about 5.9x smaller than 64-sector;
- all onsets remain only about `0.094 .. 0.113 mm` earlier than the E0 P75-64 reference;
- contact-point step: median about `0.030240 mm`, p95 about `0.030270 mm`, max about `0.030301 mm`;
- contact-point deviation from mean: about `0.01512 mm`;
- station changes: `0`;
- sector changes: `128`;
- accepted candidate count: exactly `2` at every phase;
- world-normal step is approximately `90 deg` at every phase step (min about `89.999995 deg`, median about `90 deg`, max about `90.000004 deg`);
- normal deviation from mean is approximately `45 deg` throughout.

## Interpretation

E1b does not support a simple verdict that the annular geometry is faceted beyond use.

Increasing angular tessellation from 64 to 128 materially improves **boundary/onset continuity** on both representative cases. The historical small-rock contact point is also extremely smooth at 128 sectors. This is consistent with ordinary discretization/sag error converging away.

However, the returned native manifold normal on the historical inner-side contact remains catastrophically discontinuous and becomes an almost exact 90-degree alternation at 128 sectors despite the contact point moving only about 0.03 mm between adjacent phases.

The current native diagnostic selects one accepted triangle manifold by largest signed separation (closest to zero) and returns `b3CollideHullAndTriangle`'s `manifold.normal` directly. E1b therefore strongly separates two concerns:

1. the generalized annular boundary location is behaving smoothly and converging with tessellation;
2. raw triangle/hull manifold-normal selection is not a viable physical wheel-normal semantic for the side-low inner contact.

This is evidence against abandoning the annular topology merely because the raw selected manifold normal hops. It is also evidence against moving directly to solver integration with that raw normal.

## Instrumentation defect found during recovery

`tools/wheel-mode5-e1b-contact-continuity.mjs` computes `pointStepMm.max` correctly from the complete array, but its `worstPointStep` reducer compares against `best.value` and then returns an object containing `valueMm` without preserving `value`.

After the first replacement, subsequent comparisons use `undefined`, so the reported `worstPointStep.phaseIndex` / `nextPhaseIndex` cannot be trusted. This does not invalidate the aggregate point-step statistics or any onset/normal result. It must be fixed before forensic inspection of the 128-sector flat-ground ~120 mm point outlier.

## Current research verdict

- Filled C remains rejected as shipping geometry.
- Witness-filter and multi-shape/sectorized compound directions remain rejected/contained by earlier evidence.
- Generalized annular P75 topology continues to survive E0, E0b, E1a and the **boundary-location** part of E1b.
- 20 mm positive-separation acceptance skin remains independently demonstrated to create large early contact and should not be inherited blindly.
- Raw selected triangle manifold normal is now **rejected as the direct dynamic normal semantic** for the annular side-low case.
- Dynamic solver behavior with an analytically meaningful annular normal remains **NOT VALIDATED**.

## Next bounded gate — E1c analytic-normal falsifier

Do not integrate into the vehicle solver yet.

First:

1. repair the E1b worst-point locator and identify the real phase pair responsible for the 128-sector flat-ground point outlier;
2. derive a spin-invariant analytic profile-of-revolution normal from the same P75 outer / recovered inner axial profiles at the selected boundary location;
3. for the same 256-phase flat-ground and historical side-low sweeps, return both raw Box3D manifold normal and analytic profile normal;
4. measure analytic-normal step/deviation and verify that smoothing the normal does not change the already-good onset/bore topology;
5. inspect whether contact-point ownership needs an independent stabilization rule before it can safely supply solver torque arms.

For a surface `r = R(z)` in the E1 wheel-local frame, with axial unit along local `+z` and radial unit in the local `xy` plane, the continuous outer-profile normal candidate is proportional to `e_r - R'(z)e_z`; the inner-boundary outward-from-tire-solid normal uses the opposite orientation, proportional to `-e_r + R_inner'(z)e_z`. End-cap semantics should remain explicitly axial. Exact sign/frame handling must be verified against known ground and bore controls rather than assumed.

Only if E1c demonstrates a continuous, correctly oriented normal/contact semantic should the next stage become a dynamic single-manifold/native-shape solver spike.
