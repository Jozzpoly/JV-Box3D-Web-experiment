# Wheel mode5 RH0.5 — product-grounded orientation challenge and apparatus error budget

Date: 2026-09-05  
Research branch: `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03`  
Accepted product authority used for grounding: `main@5b28cc03d22264010680deb95a04abd04661bc22`

## Classification

**RESEARCH DESIGN / PHYSICAL GROUNDING COMPLETE / NO NEW PHYSICS EXECUTED**

This document closes the missing reasoning step that made the old `<100 µrad` mount gate arbitrary. It selects the next orientation qualification from current JV-Web geometry and derives an apparatus-error budget from the intentional challenge scale.

It does **not** validate the new orientation case, tune the ParallelJoint, change the product, or broaden wheel-mode5 evidence.

## 1. Why steering yaw is the first orientation DOF

Accepted `main` gives a direct product-relevant orientation mechanism:

- front-left source registration centers steering at the authored wheel center;
- the authored front-left steering-axis direction is source `{0,1,0}` and becomes world/local `+Y` after the established source transform;
- the wheel spin revolute is attached to the knuckle and uses knuckle local `Z` as its spin axis;
- the current controller sets a front steering target angle from rack position;
- the accepted native receipt has `maxSteeringAngleDegrees = 32`;
- the current JV-Web driving bridge deliberately normalizes the provisional rack mapping to `max(32°, 35°) = 35°` full lock.

Therefore a steering-yaw perturbation directly rotates the wheel axle away from world `Z`, which is exactly the condition under which the historical world-axis angular locks cease to be mechanically legitimate.

This is a cleaner first orientation question than camber:

- it is already an active product DOF;
- its axis and wheel-spin relationship are explicit in live accepted source;
- it directly exercises the local-axis reason for introducing the ParallelJoint;
- we can first test rotational equivalence without simultaneously asking whether the current donor carrier has a realistic lateral tire-force model.

The legacy wishbone receipt also contains degree-scale geometry (`5°` caster, `7°` kingpin inclination), reinforcing that the current mechanism's physically meaningful orientation scale is degrees rather than hundreds of microradians. Those suspension angles are context only; they are **not** being reinterpreted as wheel camber or used as the challenge amplitude.

## 2. First challenge amplitude

Current JV-Web temporary driving full lock:

`35°`

The first bounded orientation challenge is defined as exactly **10% of that current full-lock scale**:

`theta = 3.5° = 0.0610865238 rad`

Run the symmetric set:

- `0°` — same new apparatus, orientation control;
- `+3.5°` — yaw-rotated rolling case;
- `-3.5°` — mirrored yaw-rotated rolling case.

Why 10%:

- it is explicitly derived from the current product steering envelope rather than selected from solver numerics;
- it is far from full lock, so the first qualification is bounded;
- it is large enough that sub-degree mount compliance cannot dominate the intentional orientation signal;
- the `+/-` pair can reveal hidden world-axis/sign bias without introducing another mechanical DOF.

`3.5°` is an **experiment scale**, not a claim that 3.5° is a special handling angle or a final JV steering requirement.

## 3. The experiment must be rotated-heading equivalence, not a lateral tire test

At this stage the question is:

> Can the local-axis mount preserve the already-qualified outer-P75 rolling/contact behavior when the wheel axle is no longer aligned with a world cardinal axis?

It is **not yet**:

> Does the tire generate realistic lateral force at a 3.5° slip angle?

For yaw angle `theta`, construct the intended body rotation and derive all direction vectors from that same rotation:

- target rolling heading `H = rotate(q_yaw(theta), +X)`;
- target axle axis `A = rotate(q_yaw(theta), +Z)`;
- initial linear velocity `V0 = 1 m/s * H`;
- initial angular velocity `W0 = -(1/R) rad/s * A`.

The flat road is yaw-invariant, so no road change is required.

Rolling slip must be evaluated in the wheel's rotated frame:

`slip = dot(V, H) + R * dot(W, A)`

not through hard-coded world `Vx + R*Wz`.

This construction intentionally begins with zero nominal lateral slip relative to the wheel. Any large disturbance is therefore evidence about the mount/apparatus/contact invariance before it is evidence about lateral tire behavior.

## 4. Remove the remaining world-linear lock

The old RQ2c0a changed only angular guidance and deliberately retained:

`wheelBodyDef.motionLocks.linearZ = true`

That was correct for the earlier single-variable 0° comparison, but it cannot be retained in a yaw-rotated equivalence claim: after yaw, legitimate heading motion has a world-Z component.

For RH0.5's selected qualification:

- remove world `linearZ` lock;
- do not replace it pre-emptively with another world-axis lock;
- retain only the static orientation reference + local-axis `b3ParallelJoint` angular guide;
- allow wheel-center translation to be fully free.

This is a useful falsifier rather than a convenience assumption. The ParallelJoint prevents the unmounted-wheel tipping mode that invalidated the original free-3D RQ0 attempt. If the wheel still develops material cross-heading drift with its orientation held, that is evidence that a mechanically local translational carrier/guide is required before yaw qualification. Do not hide such drift by projecting or teleporting the wheel back onto a path.

### Required ordering

1. run the new fully translational-free apparatus at `0°`;
2. require it to qualify as an RQ0-like control under the gates below;
3. only if `0°` is valid, interpret `+3.5° / -3.5°`;
4. if the 0° control fails through lateral drift/apparatus behavior, stop and classify **APPARATUS_INVALID**; do not call the yaw cases wheel/contact failures.

## 5. Orientation instrument budget

The intentional orientation signal is:

`3.5° = 61.0865 mrad`

Define the laboratory mount-orientation error budget as **1% of the imposed challenge angle**:

`0.035° = 0.000610865 rad = 610.865 µrad`

Meaning:

> The angular guide must hold its requested axle direction to at least a 100:1 intentional-angle / guide-error ratio during the settled observation window.

This is a research-instrument separation criterion, **not a product suspension tolerance**.

### What the existing 120 Hz evidence says

Corrected RQ2c0a measured:

`148.785 µrad = 0.008525°`

Relative to the new challenge:

- guide error / challenge ≈ `0.2436%`;
- intentional angle / measured error ≈ `410.6 : 1`;
- measured error is about `4.11x` below the new `610.865 µrad` budget.

Therefore existing evidence gives **no decision-relevant reason to increase 120 Hz before the next run**.

The prior value does not guarantee the free-translation/yawed apparatus will retain the same error. The new experiment must measure it again. It only establishes that a 240 Hz rerun is not justified as a prerequisite.

Use the already-corrected stable angle diagnostic family (`atan2` from transverse magnitude and axial dot/component), not the invalidated `acos(axis.z)` small-angle form.

## 6. Heading/cross-track instrument budget

Because the translational world-Z lock is removed, track whether the wheel's horizontal velocity remains aligned with intended heading `H`.

Use a stable signed/unsigned heading error derived from horizontal velocity and `H` through `atan2(cross, dot)` rather than component-specific assumptions.

Use the same **1% of challenge angle** instrument scale:

`max settled heading error <= 0.035°`

At the nominal `1 m/s` rolling speed, `0.035°` corresponds to about:

`0.000610865 m/s = 0.611 mm/s`

of cross-heading velocity.

For reference, the coordinate-space world-Z component of a correctly aligned `3.5°` heading at `1 m/s` is about `61.05 mm/s`. That is intended heading motion, not lateral slip. Metrics must therefore be expressed in the rotated wheel frame rather than by treating world `Vz` as an error.

## 7. Contact/rolling gates

Reuse already-qualified RQ0/non-drift scales where they answer the same physical question. Do not invent a stricter cleanliness gate merely because the new harness is capable of measuring smaller numbers.

For each valid `0 / +3.5 / -3.5°` case:

### Exact/discrete

- settled contact dropouts: `0`;
- settled feature-set changes: `0`;
- settled point count: `1..1`.

### RQ0-like bounded background

Use the frozen RQ0 contract as the initial envelope:

- settled Y range: `0.50 .. 0.90 mm`;
- settled max `|Vy|`: `35 .. 65 mm/s`;
- settled max rotated-frame rolling slip: `<= 0.002 mm/s`.

These are migration/qualification envelopes inherited from current RQ0 evidence, not product tire specifications.

### New orientation/translation validity

- max settled axle-axis error to target `A`: `<= 0.035°`;
- max settled velocity-heading error to target `H`: `<= 0.035°`.

Do not require exact float equality between `+3.5°` and `-3.5°`. Preserve their difference as a diagnostic. A sign-specific material failure is meaningful evidence because the underlying flat-road/axisymmetric setup is intended to be yaw-mirrored.

## 8. What PASS would mean

A PASS would establish only:

> The 120 Hz local-axis ParallelJoint mount can hold a small product-grounded non-world-aligned wheel orientation while the outer-P75 carrier preserves RQ0-like zero-lateral-slip rolling/contact behavior under fully free translation.

It would support closing the **mount/orientation feasibility** blocker that forced RH0.

It would **not** validate:

- realistic lateral tire force;
- steer-under-load handling;
- camber thrust;
- suspension/chassis coupling;
- Ackermann;
- near-lock steering;
- full annular side/inner/bore contact;
- a production axle/suspension implementation.

## 9. Failure routing

### 0° control fails

Classification: **APPARATUS_INVALID / TRANSLATIONAL-MOUNT QUESTION OPEN**.

Investigate whether a mechanically local translational carrier/guide is required. Do not increase angular stiffness merely because the wheel moved laterally.

### Axis error exceeds `0.035°` while contact/heading otherwise coherent

Classification: angular-guide apparatus insufficiency for this challenge.

Only then compare a justified stiffer ParallelJoint or another local-axis constraint architecture. This is the first point at which 240 Hz could become decision-relevant again.

### Heading error exceeds `0.035°` while axis guide passes

Classification: fully free translational apparatus is insufficient for clean rotated-heading equivalence. Design a local translational mount rather than restoring a world-axis lock.

### Contact/topology/rolling gates fail while orientation and heading gates pass

This becomes genuine representative outer-carrier evidence worth investigating. First reproduce/control it before reopening recycler forensics.

### +3.5° and -3.5° differ materially

Treat this as possible world-axis/contact asymmetry and localize it before increasing challenge severity.

## 10. Natural stop

The next execution stage is deliberately small:

- one 120 Hz angular-guide implementation;
- one fully-free `0°` control;
- one symmetric `+3.5° / -3.5°` rotated-heading pair;
- no torque pulse;
- no suspension/chassis;
- no lateral slip-angle demand;
- no stiffness sweep.

Stop after classification. Do not roll directly into larger steer angles or camber.

## 11. RH0.5 decision

**RH0.5 physical grounding is complete.**

The old arbitrary `<100 µrad` threshold is superseded for future routing by the challenge-derived `<= 0.035° / 610.865 µrad` apparatus budget for this specific `3.5°` experiment.

Historical RQ2c0a remains historically truthful: it failed its predeclared 100 µrad gate. The new budget does not retroactively turn that run into a PASS; it answers a different, now physically grounded question.

The existing `120 Hz` candidate should be carried forward unchanged into the first rotated-heading qualification. There is no current justification for a pre-emptive 240 Hz run.
