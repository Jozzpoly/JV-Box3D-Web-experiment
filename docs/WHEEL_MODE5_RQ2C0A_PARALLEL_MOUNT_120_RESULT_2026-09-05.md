# Wheel mode5 RQ2c0a — 120 Hz local-axis ParallelJoint mount result

Date: 2026-09-05

Status: **TRUSTED EXECUTED / CONTACT-EQUIVALENCE SUPPORTIVE; PREDECLARED AXLE-STIFFNESS GATE FAIL**

This is research evidence only. It does not alter accepted `main`, Owner Preview, production Box3D/recycler semantics, or product wheel architecture.

## Question

Can the RQ0 laboratory wheel replace its angular world-axis X/Y locks with a mechanically local axle-orientation constraint while preserving flat-road rolling/contact behavior?

RQ2c0a intentionally keeps the inherited linear-Z guide so that only angular mounting semantics change.

## Why `b3ParallelJoint`

Pinned Box3D contains a `b3ParallelJoint` whose solver constrains relative orientation of the bodies' local Z axes using angular impulses only. It does not add an anchor/translation constraint and therefore leaves wheel translation and spin around the shared local Z axis available.

That is a better bounded laboratory candidate than a full wheel joint for this specific equivalence question: it can replace the world-axis angular locks without simultaneously tying wheel-center translation to a chassis/carrier.

## Apparatus

Matched control:

- exact qualified RQ0 helper;
- flat static road;
- donor outer-P75 `b3Wheel` carrier;
- matched `1 m/s` rolling state;
- friction `mu = 0.9`;
- warm starting and standard contact/recycling;
- linear-Z lock;
- angular X/Y world-axis locks.

Challenge changes only angular guidance:

- retains the same linear-Z guide;
- removes wheel angular X/Y world-axis locks;
- adds a static orientation-reference body;
- adds `b3ParallelJoint` between the reference and wheel;
- reference and wheel local Z axes begin aligned;
- mount `hertz = 120 Hz`;
- damping ratio `1.0`;
- max torque `FLT_MAX`.

The 120 Hz value was chosen before execution from the existing solver scale, not tuned to a desired result. With world step `1/240 s` and 4 substeps, `h = 1/960 s`; 120 Hz corresponds to the engine's existing `0.125/h` contact-style frequency scale.

Predeclared mount-validity gate:

- max settled axle-axis tilt `< 1e-4 rad` (`100 µrad`, about `0.00573°`).

Rolling/contact metrics were deliberately not hard-coded into the PASS gate; they were evidence for equivalence classification.

## Execution history

### Initial run — tilt instrument invalid, dynamics otherwise usable

Source / run / job:

`5c187c6e164900b44a13c8c5c7985fe333672c69 / 33958428034 / 101285865131`

The run completed successfully and preserved an artifact, but the original tilt diagnostic used `acos(axis.z)` in float precision. For sufficiently small real tilts, `axis.z` rounded to exactly `1`, falsely returning `0 rad`.

That zero-tilt measurement is **instrument-invalid** and is not evidence.

The contact/rolling metrics are not invalidated by this diagnostic defect because the diagnostic did not alter dynamics.

### Corrected diagnostic run

A diagnostic-only patch replaced the small-angle computation with:

`atan2(hypot(axis.x, axis.y), axis.z)`

No body, shape, joint, solver, contact, timing or material parameter changed.

Corrected source / run / job:

`3af93f9efab3ce84a51aaaf2e49265d82062d561 / 33958566941 / 101286243228`

Pinned composition and Box3D.js build/tests succeeded. The physics runner then failed exactly at the predeclared axle-tilt assertion.

## Corrected result

### RQ0 matched control

- contact dropouts: `0`;
- feature-set changes: `0`;
- point count: `1..1`;
- settled Y range: `0.674605 mm`;
- max `|Vy|`: `48.9430 mm/s`;
- mean absolute slip: `0.0000933 mm/s`;
- max absolute slip: `0.0004172 mm/s`;
- mean normal impulse: `0.0359299`;
- measurement Vx delta: `0`;
- measurement omega-Z delta: `0`.

### 120 Hz local-axis ParallelJoint mount

- contact dropouts: **`0`**;
- feature-set changes: **`0`**;
- point count: **`1..1`**;
- settled Y range: `0.688076 mm`;
- max `|Vy|`: `47.7745 mm/s`;
- mean absolute slip: `0.0085596 mm/s`;
- max absolute slip: `0.0346899 mm/s`;
- mean normal impulse: `0.0362130`;
- measurement Vx delta: `-2.6226e-6 m/s`;
- measurement omega-Z delta: `+1.51396e-5 rad/s`;
- final slip: `0.00578165 mm/s`;
- max `|omegaX|`: `0.0210465 rad/s`;
- max `|omegaY|`: `0.000273436 rad/s`;
- **max corrected axle-axis tilt: `0.0001487853 rad` = `148.785 µrad` = `0.008525°`**.

## Classification

### Contact/rolling equivalence: SUPPORTIVE

The local-axis mount introduces no material contact discontinuity in this flat-road RQ0 comparison:

- zero dropout and zero feature churn are preserved;
- point count remains `1..1`;
- Y range rises only about `2%`;
- max vertical velocity is slightly lower than control;
- mean normal impulse differs by less than `1%`;
- longitudinal speed and spin remain essentially invariant over the measurement window.

Slip ratios versus RQ0 are numerically large because the control denominator is microscopic. In absolute units, challenge max slip is only `0.0347 mm/s`, still below the already-qualified RQ2a braking maximum of about `0.0489 mm/s`.

### Axle-orientation stiffness: FAIL at the predeclared 100 µrad gate

The corrected max tilt is `148.785 µrad`, about `1.49x` the predeclared limit.

Do **not** relax the gate after seeing this result. The 120 Hz candidate therefore does not close RQ2c0 equivalence despite otherwise supportive contact behavior.

This is an apparatus-stiffness result, not a demonstrated wheel/contact pathology and not a reason to reopen recycler forensics.

## Next bounded move

Run one predeclared dyadic stiffness follow-up at **240 Hz**, with all other apparatus and the **same `<100 µrad` gate unchanged**.

Why 240 Hz:

- it is the next simple `2x` stiffness point, not an outcome-fitted value;
- with the same `h = 1/960 s`, the Box3D soft-constraint scale moves materially toward the hard-constraint limit without jumping directly to an extreme value;
- this tests whether the observed `148.8 µrad` is merely the expected compliance of the principled 120 Hz starting point.

Do not sweep a large parameter matrix. If 240 Hz still fails the unchanged mount-validity gate, re-evaluate the mount architecture or make one further explicitly justified bounded step rather than silently tuning stiffness until PASS.
