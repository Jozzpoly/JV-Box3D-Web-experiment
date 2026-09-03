# Wheel mode5 E2a2s2 — micro unequal-separation point-order result

Date: 2026-09-03
Branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`
Source head: `1c1a6bf14b61e76894951a1e7607697e58a5d4be`
Workflow run: `33808052966`
Job: `100823137230`

## Question

Does the validated E2a2q coupled two-point normal solve remain invariant to native wheel-plane manifold point order when the two support points have a real, measured unequal separation?

The bias was not tuned for this test. E2a2s1 pre-qualified requested `0.001 mm` as the largest tested bias that retained a stable native two-point manifold for both spin 0 and spin 40.

## Controls

- requested support-height bias: `0.001 mm`,
- effective `b3Wheel` profile bias: `0.0010132789611816406 mm` (~`1.013 µm`),
- horizontal ground,
- friction = 0,
- X/Y angular lock,
- spin cases: 0 and 40 rad/s,
- same validated E2a2q coupled 2x2 normal mini-LCP,
- canonical and reversed builds differ only by the diagnostic reversal of the two native wheel-plane manifold points.

## Canonical validity

Both spin cases reproduced the pre-qualified unequal two-point regime:

- point count after impulse: stable `2/2`,
- contact dropouts: 0,
- feature-set changes: 0,
- contact-id changes: 0,
- settled pair geometry samples: 350,
- stable feature IDs: `259`, `65795`,
- measured separation delta: exactly `0.0010132789611816406 mm`,
- pair solve calls: 3840,
- axis tilt: 0 degrees.

The unequal pair carried unequal settled normal impulse, so this is not merely an equal-height symmetry case.

Spin 0:

- feature 259 mean normal impulse: `0.0012523643672466278`,
- feature 65795 mean normal impulse: `0.0011639539152383804`.

Spin 40:

- feature 259 mean normal impulse: `0.0012524678661221904`,
- feature 65795 mean normal impulse: `0.001163850131311587`.

## Reversal result

The reversed build reproduced the same topology and pair-solve usage.

For both spin 0 and spin 40, canonical→reversed deltas were exactly zero for every reported comparison quantity:

- `finalY`,
- `finalVy`,
- `finalAngularX/Y/Z`,
- axis tilt,
- low/high feature separation means,
- separation delta,
- low/high feature normal impulse means,
- total impulse mean,
- settled Y range,
- settled max |Vy|.

Feature IDs, point counts, effective bias and pair-solve call count were also unchanged.

## Classification

### TRUSTED EXECUTED

Within the currently tested frictionless outer-ground two-point regime, the E2a2q coupled normal solve is invariant to native manifold point order across:

1. symmetric support,
2. asymmetric load distribution (E2a2r),
3. real unequal point separations (E2a2s2).

The prior point-order pathology of the sequential/Jacobi lines is not reproduced by the validated coupled block path in these controls.

### CURRENTLY CLOSED GATE

`two-point normal-solver point ordering` is no longer the active blocker for this R&D line.

This does **not** validate a production solver or general wheel collision system. It closes only this bounded diagnostic ordering question under the tested controls.

### NOT VALIDATED

- friction/tangential coupling,
- arbitrary wheel orientation / side and inner contact,
- higher-cardinality or general manifold solve,
- native 1↔2 topology transition behavior,
- continuous crossing of the native transition under physical motion,
- product/runtime integration.

## Next frontier

E2a2s1 bounded the native diagnostic-carrier transition:

- effective ~`1.013 µm` -> stable two-point manifold,
- effective ~`2.027 µm` -> stable one-point manifold.

The next work should investigate the native 1↔2 manifold/active-set transition itself, beginning with source-level mechanism grounding and then a bounded transition-semantics experiment. Do not continue tuning the two-point solver unless new evidence reopens it.
