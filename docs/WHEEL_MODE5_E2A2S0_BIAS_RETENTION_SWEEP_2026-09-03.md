# Wheel mode5 E2a2s0 — biased-support native retention sweep

Date: 2026-09-03

Status: **TRUSTED EXECUTED EXPERIMENTAL EVIDENCE**

Scope: diagnostic-only investigation of whether the validated E2a2q coupled two-point solver can be exercised on a flat-support wheel carrier with a controlled unequal geometric separation between the two nominal support endpoints. This is not product geometry or a production solver change.

## Authority and run

- branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
- source head: `ea0f369765679fdfd01e617ba5c99daf816937a2`
- successful workflow run: `33806072464`
- successful job: `100816722861`
- pinned Box3D.js: `2617a0ff763a60c9f17cee57c6ea72aab75a5077`
- pinned Box3D: `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`

The preceding E2a2s 10 mm canonical run `33805738554` built successfully but was **INVALID FOR THE INTENDED TWO-POINT QUESTION**: after normal impulse began, native point count was `1`, so reversal was deliberately blocked by the runner.

## Diagnostic carrier

The E2a2 broad-support interval remains:

- Z = `-0.12646484375 m` at radius `0.5455107508534434 m`
- Z = `+0.12646484375 m`

The diagnostic bias keeps the -Z endpoint at the original P75 radius and retracts only the +Z endpoint radially by a prescribed amount. Ground remains horizontal, friction remains zero, wheel X/Y angular motion remains locked and spin remains about Z.

This was intended to create unequal point separation without adding a tilted ground normal or lateral sliding confound.

## Precommitted sweep

One binary executed both spin 0 and spin 40 for this fixed grid:

`0 / 0.5 / 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 mm`

No bias was selected or retuned after seeing intermediate results.

## Result

### Exactly 0 mm bias

Both spins reproduce the validated E2a2q broad-support pair:

- minimum point count after impulse: `2`
- maximum point count after impulse: `2`
- settled pair geometry samples: `350`
- stable feature IDs: `259`, `65795`
- settled separation delta: `0 mm`
- coupled pair-solve calls: `3840`
- no contact dropout, feature churn or contact-ID churn.

Spin 0 settled point separation:

- feature 259: `-0.06878376007080078 mm`
- feature 65795: `-0.06878376007080078 mm`

Spin 40 settled point separation:

- feature 259: `-0.06903512137276785 mm`
- feature 65795: `-0.06903512137276785 mm`

### Every tested nonzero bias: 0.5–10 mm

For **every** tested nonzero bias and for both spin 0 and spin 40:

- minimum point count after impulse: `1`
- maximum point count after impulse: `1`
- settled pair geometry samples: `0`
- only feature ID `259` remains
- coupled pair-solve calls: `0`
- no contact dropout, feature churn or contact-ID churn.

The dynamic result is effectively identical across all tested nonzero biases once the native contact generator has selected the single endpoint.

Representative 0.5 mm case, spin 0:

- point count: `1 / 1`
- unique feature: `259`
- pair-solve calls: `0`
- settled total impulse mean: `0.019325293600559235`
- final Y: `0.5454281568527222 m`
- final Vy: `-1.1147931218147278e-6 m/s`

Representative 0.5 mm case, spin 40:

- point count: `1 / 1`
- unique feature: `259`
- pair-solve calls: `0`
- settled total impulse mean: `0.019330259119825704`
- final Y: `0.5454277992248535 m`
- final Vy: `1.6444613493149518e-7 m/s`
- final angular Z: `40 rad/s`

The same values repeat through 1, 2, 3, 4, 5, 6, 8 and 10 mm biases within the reported output.

## Interpretation

The original E2a2s premise is not supported at the tested scale. The global Box3D speculative distance (`4 × 5 mm = 20 mm`) does **not** imply that this native wheel-plane contact generator will preserve both support endpoints when their radii differ.

At 0.5 mm and above the contact generator has already collapsed the perfectly symmetric two-point support feature into a single endpoint **before the coupled block solver can participate**. Therefore the failure of the 10 mm E2a2s run is a manifold-generation/feature-selection result, not evidence against the E2a2q block solver.

This also means the desired unequal-separation two-point regime has not yet been demonstrated to exist for this diagnostic carrier.

## What this does NOT establish

This sweep does **not** prove that every mathematically nonzero bias produces one point. The smallest tested nonzero bias was `0.5 mm`.

Still unresolved:

- whether a sub-0.5-mm/tolerance-scale interval exists where both points survive with measurably unequal separation;
- the precise native two-point → one-point boundary;
- canonical/reversed behavior at that active-set boundary;
- whether another physically cleaner native geometry can produce a stable unequal-separation pair.

## Next bounded gate

Run a single predeclared micro-bias sweep below `0.5 mm`, spanning micron through sub-millimeter scales, on the same binary and both spins. The purpose is boundary identification, not parameter tuning.

If every resolvable nonzero bias immediately selects one point, treat exact equal-radius broad support as a feature tie/singular two-point regime and move the campaign to explicit one↔two active-set transition semantics rather than forcing an artificial unequal-separation pair.
