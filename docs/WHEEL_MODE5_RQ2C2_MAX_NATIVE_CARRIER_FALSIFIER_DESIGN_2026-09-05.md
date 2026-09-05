# Wheel mode5 RQ2C2 — maximum-native generic-constraint carrier falsifier

Date: 2026-09-05

Status: **PREDECLARED RESEARCH DESIGN / NO RQ2C2 PHYSICS EXECUTED YET**

## Decision basis

RQ2C1D reproduced the failed RQ2C1 `0°` case without primary drift and localized cross-heading error across every stage of the three-joint translational carrier. Pinned Box3D generic joint constraints default to `60 Hz / damping 2.0`, and the solver clamps configured generic constraint hertz to `0.25 * inv_h`.

At the existing experiment timing:

- outer step: `1/240 s`;
- substeps: `4`;
- solver substep: `1/960 s`;
- `inv_h = 960 s^-1`;
- maximum effective generic constraint hertz: `240 Hz`.

Therefore one final native-chain falsifier is justified before abandoning the architecture.

## Single-variable change

Retain RQ2C1 unchanged except:

- heading prismatic generic constraint: `240 Hz / damping 2.0`;
- vertical prismatic generic constraint: `240 Hz / damping 2.0`;
- spherical center generic constraint: `240 Hz / damping 2.0`.

Use the pinned public `b3Joint_SetConstraintTuning` API after joint creation and verify the configured values through `b3Joint_GetConstraintTuning`.

Everything else remains frozen:

- donor outer-P75 carrier;
- flat static road;
- `mu = 0.9`;
- `1 m/s` matched rolling state;
- `1/240 s`, 4 substeps;
- same `1%` total helper mass, `0.5%` each;
- collisionless helper bodies;
- helper `gravityScale = 0`;
- helper zero rotational inertia;
- same H-prismatic -> Y-prismatic -> spherical center topology;
- same `120 Hz / damping 1.0` ParallelJoint angular mount;
- no world-axis motion locks;
- no torque pulse;
- no lateral slip-angle demand;
- same RH0.5 gates.

There is **no hertz sweep**. `240 Hz` is selected because it is the pinned solver's own maximum effective generic-constraint stiffness at this timestep, not because it was fitted to the failed RQ2C1 metric.

## Required execution order

1. compose the explicit RQ2C2 suite with the frozen RH0 suite;
2. build and test pinned Box3D.js composition;
3. replay and validate frozen RH0 in the same build;
4. execute RQ2C2 `0°` control;
5. apply unchanged RH0.5 gates;
6. only if `0°` passes, execute `+3.5° / -3.5°`;
7. stop after classification.

## Unchanged 0° / yaw gates

Exact/discrete:

- contact dropouts `= 0`;
- feature-set changes `= 0`;
- point count `1..1`.

RQ0-like rolling/vertical:

- settled Y range `0.50..0.90 mm`;
- settled max `|Vy|` `35..65 mm/s`;
- settled max rotated-frame rolling slip `<= 0.002 mm/s`.

Orientation/translation validity:

- max settled axle-axis error `<= 0.035°`;
- max settled velocity-heading error `<= 0.035°`.

Additional center/sled/carrier errors remain diagnostics only and are not new pass/fail thresholds.

## Failure routing

### 0° fails unchanged gates

Classify the **multi-joint local carrier architecture as falsified for this qualification**. Do not continue with a 60→120→180→240 sweep, helper-mass tuning, more substeps, higher angular-mount hertz, or relaxed gates.

The next architecture question should be a direct local one-axis translational constraint that does not accumulate multiple generic joint corrections.

### 0° passes

The architecture remains viable as a research instrument at maximum native generic-constraint stiffness. Execute the already-predeclared symmetric `+3.5° / -3.5°` pair without further changes.

A pass does not make `240 Hz` a product suspension setting; it only validates this bounded laboratory carrier.

## Natural stop

Stop after RQ2C2 classification. No larger steer angle, camber, torque pulse, suspension/chassis coupling, lateral-force model, or production integration follows automatically.
