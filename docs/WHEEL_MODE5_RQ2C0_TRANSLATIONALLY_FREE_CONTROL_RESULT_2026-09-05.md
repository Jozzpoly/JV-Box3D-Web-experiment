# Wheel mode5 RQ2C0 — translationally-free 0° control result

Date: 2026-09-05

Status: **TRUSTED EXECUTED / APPARATUS INVALID FOR YAW CHALLENGE**

This is bounded research evidence only. It does not alter accepted `main`, Owner Preview, production wheel architecture, full annular contact semantics or final steering/suspension design.

## Question

Can the post-RH0 local-axis mount remove the historical world `linearZ` lock entirely and still reproduce RQ0-like straight rolling at `0°` yaw before any `±3.5°` orientation challenge is attempted?

This control was deliberately required to pass first. If it failed, the yaw pair was to remain unexecuted and the failure was to route toward a mechanically local translational carrier rather than toward higher angular stiffness.

## Execution

Branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Source / run / job / artifact:

`8deae32ff31ed6229b3add1837dae7f6d4ef685f / 33965636922 / 101305157701 / 9969338989`

Before new physics:

- pinned Box3D.js / recovered wheel composition built successfully;
- Box3D.js smoke tests passed;
- the frozen RH0 canonical suite replayed in the same composed build;
- frozen replay validation passed with zero failures;
- the preserved drive/brake transient-slip sentinel remained `75.2560975609756`.

Therefore the control result is not attributable to an unnoticed RH0 harness regression.

## Apparatus

- donor outer-P75 `b3Wheel` carrier;
- flat static road;
- `1 m/s` matched rolling state;
- friction `mu = 0.9`;
- gravity `9.81 m/s²`;
- world step `1/240 s`, 4 substeps;
- static orientation reference;
- local-axis `b3ParallelJoint` angular mount;
- mount `120 Hz`, damping ratio `1.0`, `maxTorque = FLT_MAX`;
- **no world-axis linear or angular motion locks**;
- yaw `0°`;
- no torque pulse and no intentional lateral slip-angle demand.

Predeclared gates inherited from RH0.5:

- contact dropouts `= 0`;
- feature-set changes `= 0`;
- contact point count `1..1`;
- settled Y range `0.50..0.90 mm`;
- settled max `|Vy|` `35..65 mm/s`;
- settled max rotated slip `<= 0.002 mm/s`;
- max axle-axis error `<= 0.035°`;
- max heading error `<= 0.035°`.

## Result

### Contact and vertical dynamics — PASS-like / RQ0-compatible

- first contact step: `0`;
- first normal-impulse step: `3`;
- settled contact dropouts: **`0`**;
- settled feature-set changes: **`0`**;
- point count: **`1..1`**;
- settled Y range: **`0.672817 mm`**;
- settled max `|Vy|`: **`49.418684 mm/s`**.

The removal of the world lateral lock did not create a contact-topology or vertical-stability failure in this control.

### Angular mount — PASS within challenge-derived budget

- max axle-axis error: **`0.00592098°`**;
- final axle-axis error: `0.00197305°`;
- predeclared budget: `0.035°`.

The 120 Hz angular guide is therefore not the blocking apparatus component in this result. Its maximum measured axis error is about `16.9%` of the allowed budget.

**Do not route this result to a 240 Hz stiffness follow-up.**

### Translational heading freedom — FAIL

- max heading error: **`0.858248°`** versus `0.035°` gate;
- final heading error: `0.0851374°`;
- max cross-heading speed: **`14.980474 mm/s`**;
- max cross-track excursion after settle: **`3.792284 mm`**.

The wheel therefore develops a small but material lateral/axial drift when translation is completely unconstrained. That drift is approximately `24.5x` the allowed heading-error gate at its maximum.

### Rotated rolling slip — FAIL gate, small in absolute units

- mean absolute rotated slip: `0.00476258 mm/s`;
- max absolute rotated slip: **`0.0268817 mm/s`** versus `0.002 mm/s` gate;
- final absolute slip: `0.00154972 mm/s`.

This slip increase occurs together with the uncontrolled cross-heading motion. The evidence does not justify diagnosing a donor-wheel contact pathology from it; the dominant falsified assumption is that the wheel can serve as its own translational guide once the world-axis lateral lock is removed.

## Classification

**`APPARATUS_INVALID_TRANSLATIONALLY_FREE_CONTROL`**

This classification means:

- the physics run itself is valid and informative;
- the proposed fully-free translation apparatus is not valid for proceeding to the `±3.5°` yaw equivalence challenge;
- contact topology and vertical rolling remain stable;
- the existing 120 Hz angular mount satisfies its challenge-derived orientation budget;
- the blocker is missing **local translational lateral guidance**, not insufficient angular stiffness.

The workflow correctly skipped `+3.5°` and `-3.5°`; no RQ2C yaw result exists yet.

## Next bounded move

Design one mechanically local translational guide that constrains cross-heading / local-axle translation while leaving:

- longitudinal travel along the rotated heading,
- vertical wheel motion,
- wheel spin,
- and the already-qualified local angular-mount semantics

available.

The guide must rotate with the commanded/test yaw and must not reintroduce world-axis authority disguised under another name.

Before choosing an implementation, inspect the pinned Box3D joint semantics and select the smallest mechanism that imposes only the missing local translational constraint. Then rerun the **same `0°` control first with unchanged gates**. Only a valid 0° carrier control can unlock `±3.5°` execution.
