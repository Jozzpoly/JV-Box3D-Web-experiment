# Wheel mode5 RQ2C1D — local-carrier constraint localization result

Date: 2026-09-05

Status: **TRUSTED DIAGNOSTIC / RQ2C1 PHYSICS NON-DRIFT CONFIRMED**

This is diagnostic evidence about the already-failed RQ2C1 `0°` apparatus. It does not change accepted `main`, product behavior, tire/contact claims, RH0 gates, the `1%` guide-mass budget, or the `120 Hz` ParallelJoint angular mount.

## Question

Where does the cross-heading error in the failed RQ2C1 chain actually accumulate?

RQ2C1 used:

`static root -> H-prismatic sled -> Y-prismatic carrier -> spherical wheel-center`

plus:

`vertical carrier -> 120 Hz ParallelJoint -> wheel`.

RQ2C1D reran exactly the same `0°` physics and added only observational body/joint telemetry after each solver step.

## Execution and trust chain

Branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Source / run / job / artifact:

`2c54b4960c58cb7ca56d5f1583227ad0ba637958 / 33966947600 / 101308634219 / 9969749303`

Before diagnostic interpretation:

- pinned composition built and Box3D.js tests passed;
- frozen RH0 replay passed in the same build;
- the diagnostic run executed successfully;
- an explicit non-drift validator reproduced the defining RQ2C1 primary metrics within tight tolerances.

Therefore the added observations can be treated as diagnostic evidence about the same failed apparatus rather than a changed physics case.

## RQ2C1 non-drift reproduction

The diagnostic rerun reproduced:

- contact dropouts: `0`;
- feature-set changes: `0`;
- point count: `1..1`;
- settled Y range: `0.673353672 mm`;
- max `|Vy|`: `52.1145724 mm/s`;
- max rotated slip: `0.0393390656 mm/s`;
- max axle-axis error: `0.00914909259°`;
- max heading error: `1.31736431°`;
- max cross-heading speed: `22.9966231 mm/s`;
- max cross-track: `6.13813894 mm`.

This preserves the RQ2C1 classification: contact/vertical dynamics remain healthy, angular guide remains inside budget, translational carrier remains invalid.

## Localization result

### Cross-heading displacement accumulates through every translational stage

Settled peak forbidden displacement:

- heading sled relative to static root, cross-heading: **`1.476232 mm`**;
- vertical carrier relative to heading sled, cross-heading: **`2.946410 mm`**;
- wheel relative to vertical carrier, cross-heading: **`1.483634 mm`**;
- spherical center-joint linear separation: **`1.483641 mm`**.

The vertical carrier therefore reaches about **`4.422437 mm`** cross-heading offset relative to the root before the wheel-center joint adds its own approximately `1.484 mm` separation. The resulting order of magnitude matches the observed wheel cross-track.

This is not a single-joint outlier. Constraint error is accumulated through the multi-joint chain.

### Allowed directions remain comparatively clean

The diagnostic also found:

- heading component of carrier-vs-sled separation: `0.000119 mm`;
- heading component of wheel-vs-carrier separation: `0.000119 mm`;
- wheel-vs-carrier vertical separation: `0.079334 mm`;
- sled vertical drift relative to root: `0`.

The dominant unwanted geometric error is therefore specifically in the chained constrained directions rather than a wholesale loss of the intended H/Y decomposition.

### Force telemetry is consistent with the chain carrying real load

Peak reported constraint-force magnitudes:

- heading prismatic: `0.431183 N`;
- vertical prismatic: `0.431183 N`;
- spherical center: `0.433464 N`;
- ParallelJoint torque: `2.868083 N·m`.

These values confirm that the constraints participate dynamically, but force components are observational only and are not used as causal proof or new acceptance gates.

## Pinned solver semantics that explain the pattern

Pinned Box3D generic joint definitions default to:

- `constraintHertz = 60 Hz`;
- `constraintDampingRatio = 2.0`.

Prismatic and spherical constraints use this generic constraint softness for their nominally constrained directions. The solver additionally clamps generic joint hertz to:

`min(configuredConstraintHertz, 0.25 * inv_h)`.

For the current experiment:

- world step = `1/240 s`;
- substeps = `4`;
- solver substep `h = 1/960 s`;
- `inv_h = 960 s^-1`;
- maximum effective generic-joint hertz = **`240 Hz`**.

RQ2C1 did not explicitly override generic constraint hertz, so its three translational-chain joints were operating at the pinned default `60 Hz` softness. The roughly additive millimetre-scale error is therefore consistent with accumulated compliant constraints rather than evidence that the donor tire/contact itself generates the observed drift.

## Classification

**`TRUSTED_DIAGNOSTIC_CHAIN_COMPLIANCE_LOCALIZED`**

What is now supported:

- RQ2C1's failure is reproducible;
- the failure is not explained by RH0 drift;
- it is not explained by insufficient `120 Hz` axle-axis guidance;
- the multi-joint carrier accumulates forbidden-direction compliance across the heading prismatic, vertical prismatic and spherical center stages;
- the pinned generic-joint default softness (`60 Hz`) is a concrete mechanism capable of producing that behavior.

What is **not** established:

- that changing generic constraint hertz will necessarily qualify the carrier;
- that `240 Hz` is a production setting;
- that helper mass should change;
- that a custom joint is already required;
- that yawed tire/contact behavior fails.

## Next bounded falsifier

Before abandoning the chain or inventing a custom constraint, test the strongest version the pinned solver natively permits without changing topology or mass:

- same exact RQ2C1 topology;
- same `1%` total helper mass (`0.5%` each);
- same `0°` control and RH0.5 gates;
- same `120 Hz` ParallelJoint angular mount;
- same `1/240 s`, 4-substep execution;
- set only the three generic carrier constraints — heading prismatic, vertical prismatic, spherical center — to `constraintHertz = 240 Hz`;
- retain generic constraint damping ratio `2.0`;
- do not sweep hertz and do not tune to the result.

`240 Hz` is chosen because it is the solver's own maximum effective generic-joint stiffness at this timestep, not because it was fitted to the failed metric.

If this maximum-native-stiffness `0°` control still fails, treat the multi-joint chain architecture as falsified for this qualification and move to a direct local one-axis constraint architecture rather than continuing a stiffness sweep.

If it passes unchanged gates, only then may the already-predeclared `+3.5° / -3.5°` yaw pair execute in the same apparatus.
