# Wheel mode5 RQ2C2 — maximum-native generic-constraint carrier result

Date: 2026-09-05

Status: **TRUSTED EXECUTED / 0° CONTROL FAIL / MULTI-JOINT CARRIER TOPOLOGY FALSIFIED / YAW NOT EXECUTED**

## Question

Can the failed RQ2C1 three-joint local translational carrier qualify if its three generic translational constraints are run at the strongest effective stiffness natively available in the pinned solver, without changing topology, helper mass, angular mount, timestep or gates?

RQ2C2 retained RQ2C1 exactly except:

- heading prismatic generic constraint: `240 Hz / damping 2.0`;
- vertical prismatic generic constraint: `240 Hz / damping 2.0`;
- spherical center generic constraint: `240 Hz / damping 2.0`.

`240 Hz` was predeclared because the pinned solver clamps generic joint hertz to `0.25 * inv_h`; with `1/240 s` outer steps and 4 substeps, `inv_h = 960 s^-1`, so `240 Hz` is the maximum effective value. No hertz sweep was permitted.

The existing ParallelJoint remained `120 Hz / damping 1.0`.

## Execution

Branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Source / run / job / artifact:

`f3766ecfbaf447bbad7b13ea5014e47a40537cc5 / 33967366019 / 101309730438 / 9969876657`

Trust chain:

- pinned composition built successfully;
- Box3D.js tests passed;
- frozen RH0 suite replayed and validated in the same build;
- RQ2C2 `0°` physics executed;
- unchanged RH0.5 control gate failed;
- `+3.5° / -3.5°` were therefore skipped.

The runtime also read back all three generic joint tunings as exactly `240 Hz / 2.0`.

## Result

Contact and vertical behavior remained healthy:

- first contact step: `0`;
- first normal-impulse step: `3`;
- settled contact dropouts: `0`;
- feature changes: `0`;
- point count: `1..1`;
- settled Y range: `0.678957 mm` — PASS;
- max `|Vy|`: `51.2549 mm/s` — PASS.

Angular mount remained within its challenge-derived budget:

- max axle-axis error: `0.0113087°` — PASS versus `0.035°`.

But translational/rolling gates still failed materially:

- max heading error: **`1.894815°`** versus `0.035°`;
- max cross-heading speed: **`33.0828 mm/s`**;
- max rotated slip: **`0.0435114 mm/s`** versus `0.002 mm/s`;
- mean absolute slip: `0.00818827 mm/s`;
- max cross-track: `2.34519 mm`.

Diagnostic chain errors were reduced relative to RQ2C1:

- max heading-sled cross offset: `0.529095 mm`;
- max vertical-carrier cross offset: `1.587236 mm`;
- max wheel/carrier center error: `0.531828 mm`.

So increased generic constraint stiffness did reduce positional compliance, as expected, but it did **not** restore clean heading/rolling dynamics. Peak heading error, cross-heading speed and slip became worse than in the default-60-Hz RQ2C1 case.

## Comparison

| metric | RQ2C1 default 60 Hz generic constraints | RQ2C2 max-effective 240 Hz | direction |
|---|---:|---:|---|
| max center error | `1.48364 mm` | `0.53183 mm` | improved ~2.8x |
| max cross-track | `6.13814 mm` | `2.34519 mm` | improved ~2.6x |
| max heading error | `1.31736°` | `1.89482°` | worse |
| max cross-heading speed | `22.9966 mm/s` | `33.0828 mm/s` | worse |
| max rotated slip | `0.0393391 mm/s` | `0.0435114 mm/s` | worse |
| max axle-axis error | `0.009149°` | `0.011309°` | still PASS |

This breaks the hypothesis that the chain merely needed stronger generic constraints. Positional compliance was reduced, yet the decision-relevant heading/rolling observables did not converge toward qualification.

## Classification

**`APPARATUS_INVALID_MULTI_JOINT_CARRIER_TOPOLOGY_FALSIFIED`**

Supported conclusions:

- RQ2C2 is a valid executed falsifier;
- frozen RH0 remained non-drifted;
- contact/vertical behavior remained healthy;
- the 120 Hz angular mount remained within budget;
- the three-joint local translational carrier cannot qualify the `0°` control even at the pinned solver's maximum effective generic-constraint stiffness;
- a generic-hertz sweep is therefore closed;
- helper-mass tuning, additional substeps, relaxed gates or higher angular-mount hertz are not justified responses to this result;
- no yaw/contact conclusion exists because yaw was never executed.

## Next architecture question

Abandon the `H-prismatic -> Y-prismatic -> spherical-center` chain for this qualification.

The required mechanical abstraction is simpler than the failed carrier:

> one direct local translational constraint that removes only displacement/velocity along the target axle/cross-heading axis `A`, while leaving translation along heading `H`, vertical translation `Y`, and wheel rotation/spin free; the existing 120 Hz ParallelJoint continues to own axle-axis orientation.

First audit the pinned Box3D joint set for an existing native point-to-plane / one-axis translational constraint with those exact degrees of freedom.

If none exists, design the smallest bounded research-only direct constraint/joint rather than emulating it with another chain of helper bodies. Its first test remains the same `0°` control with the same frozen RH0 barrier and unchanged RH0.5 gates.
