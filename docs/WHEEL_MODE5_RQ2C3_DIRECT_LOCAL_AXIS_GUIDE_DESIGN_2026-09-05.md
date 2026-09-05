# Wheel mode5 RQ2C3 — direct local-axis guide design

Date: 2026-09-05

Status: **PREDECLARED / NOT YET EXECUTED**

This is bounded research apparatus only. It does not alter accepted product `main`, Owner Preview, final wheel architecture, suspension design, steering architecture, or full annular-contact semantics.

## Why RQ2C3 exists

RQ2C1 showed that the local `H-prismatic -> Y-prismatic -> spherical-center` carrier accumulates millimetre-scale solver compliance across several generic constraints. RQ2C1D localized that compliance across the chain. RQ2C2 then raised all three generic carrier constraints from the pinned default 60 Hz to the maximum effective 240 Hz available at `dt=1/240 s` with four substeps. Geometry error decreased, but heading/cross-heading dynamics remained invalid and in important metrics worsened.

Therefore the multi-joint helper-body carrier topology is closed. RQ2C3 does not retune or repair it.

## Question

Can one direct scalar local translational constraint, attached to the already-used local-axis `b3ParallelJoint`, remove only cross-heading / local-axle translation while preserving:

- longitudinal travel along rotated heading `H`;
- vertical travel along world `Y`;
- wheel spin about local axle `A`;
- the existing 120 Hz / damping 1.0 ParallelJoint angular guide;
- the frozen RH0 donor-carrier behaviour when the new feature is disabled?

## Minimal solver extension

The transient pinned Box3D composition will add one **default-off experimental linear-axis guide** to `b3ParallelJoint`.

No `b3ParallelJointDef` fields are added. The existing create path remains unchanged and zero-initializes the new state. A research-only public setter enables the guide after creation.

Constraint semantics:

- axis = joint frame A local `+Z`, transformed to world space;
- frame A is the static yaw-rotated reference;
- frame B is the wheel;
- equality constraint: `C = dot(axis, pB_anchor - pA_anchor) = 0`;
- one scalar accumulated impulse;
- Jacobian/effective-mass structure follows the pinned prismatic axial constraint, including anchor rotational terms;
- warm starting is supported;
- when disabled, accumulated linear-guide impulse is zero and the historical ParallelJoint path remains angular-only.

For the RQ2C3 apparatus both anchors are body origins. The local `+Z` axis therefore equals the commanded/test axle axis `A`.

## Tuning

The angular ParallelJoint remains unchanged:

- angular hertz: **120 Hz**;
- angular damping ratio: **1.0**;
- max torque: `FLT_MAX`.

The new scalar linear guide uses existing generic joint `constraintSoftness`. The RQ2C3 suite sets the already-public base tuning to:

- constraint hertz: **240 Hz**;
- constraint damping ratio: **2.0**.

This is not a sweep. At `dt = 1/240 s` and four substeps, pinned Box3D computes `h = dt / 4`, `inv_h = 960`, and clamps generic joint hertz to `0.25 * inv_h = 240 Hz`. RQ2C3 therefore tests the direct topology at the pinned solver's maximum effective native generic-constraint hertz.

## Frozen apparatus

Unchanged from the RH0.5 / RQ2C qualification contract except for replacement of the falsified helper-body carrier by the direct scalar guide:

- donor outer-P75 `b3Wheel` carrier;
- flat static road;
- `1 m/s` matched rolling state;
- friction `mu = 0.9`;
- gravity `9.81 m/s^2`;
- world step `1/240 s`, four substeps;
- no world-axis motion locks;
- yaw set `0 / +3.5 / -3.5 deg`;
- no torque pulse and no intentional lateral slip-angle demand.

No helper bodies and no guide-body mass exist in RQ2C3.

## Execution barrier and gates

Before RQ2C3 physics:

1. pinned Box3D.js + donor composition must build and test;
2. frozen RH0 canonical suite must replay in the same patched build;
3. frozen RH0 replay validator must PASS.

Then execute **0 deg only** first with the unchanged qualification gates:

- settled contact dropouts `= 0`;
- settled feature-set changes `= 0`;
- contact point count `1..1`;
- settled Y range `0.50..0.90 mm`;
- settled max `|Vy|` `35..65 mm/s`;
- settled max rotated slip `<= 0.002 mm/s`;
- max axle-axis error `<= 0.035 deg`;
- max heading error `<= 0.035 deg`.

Additional direct-guide measurements such as max absolute plane separation, cross-heading speed and cross-track excursion are diagnostics only; no new threshold is invented after seeing the result.

Only a 0 deg PASS unlocks the symmetric `+3.5/-3.5 deg` yaw pair.

## Predeclared interpretation

- **0 deg PASS**: the direct one-axis topology is a valid apparatus candidate; execute the symmetric yaw pair without retuning.
- **0 deg FAIL with frozen RH0 PASS**: do not tune helper masses (none exist), do not resurrect the multi-joint carrier, and do not start a hertz sweep. Diagnose whether the direct constraint equation itself is invalid for this purpose or whether the remaining failure belongs to another apparatus component.
- **frozen RH0 FAIL**: RQ2C3 physics is blocked; classify the patch/build as apparatus regression until repaired.
- **yaw pair PASS after 0 deg PASS**: bounded evidence supports rotated-heading local-axis mount equivalence for this synthetic donor-carrier apparatus only; it is not final suspension/steering validation.
