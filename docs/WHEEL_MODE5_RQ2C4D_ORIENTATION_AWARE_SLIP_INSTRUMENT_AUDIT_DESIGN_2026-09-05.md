# Wheel mode5 RQ2C4D — orientation-aware rolling-slip instrument audit

Date: 2026-09-05

Status: **PREDECLARED / DIAGNOSTIC ONLY / NOT YAW QUALIFICATION**

## Trigger

RQ2C4 engine-native hard relaxation removed the cross-heading velocity error essentially completely while the legacy rolling-slip signature remained unchanged at ~`0.03469 mm/s` max.

The same ~`0.03469 mm/s` signature already existed in historical RQ2C0A with the 120 Hz ParallelJoint while world linear-Z was perfectly locked. The donor outer-P75 support witness is axially offset and the measured angular mount compliance is ~`148.8 µrad`. First-order kinematics predict a tangential contribution of roughly `|axial offset| * tilt * |omega| ~= 0.036 mm/s`, close to the legacy metric.

This creates a concrete instrument-validity question. It does **not** authorize changing the frozen gate.

## Question

Does the frozen legacy approximation

`slip_legacy = dot(vCOM, H) + R0 * dot(omega, A_target)`

report apparent slip caused by using a fixed upright support radius/axis projection when the actual angularly compliant wheel's support witness is axially offset?

## Orientation-aware diagnostic

For the exact RQ2C4 0° physics, after each world step:

1. get actual wheel rotation `q`;
2. transform world-down `(0,-1,0)` into wheel local space with `b3InvRotateVector(q, down)`;
3. call `b3ComputeWheelSupport(&wheel, localDown)` to obtain the actual deepest geometric support point in wheel-local coordinates;
4. call pinned `b3Body_GetLocalPointVelocity(wheelBody, supportLocal)` so Box3D itself handles the actual body COM and angular kinematics;
5. define diagnostic witness slip as `dot(vSupportWitness, H)`;
6. retain the legacy slip in parallel;
7. record support axial/radial coordinates, angular error and the difference `legacy - witness`.

This is read-only telemetry. It must not change any body, shape, joint, contact, material, timing, solver or gate parameter.

## Trust contract

The transient diagnostic suite must be produced by patching only the copied RQ2C3 scenario source used by RQ2C4. It must run in the same RQ2C3 + RQ2C4 vendor-patch composition.

Before interpreting new telemetry:

- pinned build/tests PASS;
- frozen RH0 replay PASS;
- exact RQ2C4 primary 0° metrics reproduce the executed RQ2C4 result within tight deterministic tolerances, including legacy slip, heading, axis error, Y/Vy, cross-track and plane separation.

If primary non-drift fails, RQ2C4D is instrument-invalid and no new slip conclusion is allowed.

## Interpretation

No new acceptance gate is created here.

Evidence supports **legacy slip instrument invalidity for angularly compliant orientation apparatus** if:

- legacy slip reproduces the RQ2C4 signature;
- orientation-aware support-witness slip is materially smaller, especially if it returns to the microscopic scale associated with qualified aligned rolling;
- the difference between legacy and witness metrics quantitatively tracks the off-axis support/orientation kinematic term.

If witness slip remains comparable to legacy slip, the remaining signal is real rigid-body/contact kinematics and must not be dismissed as a measurement artifact.

Even a strong diagnostic result does not retroactively turn RQ2C4 into PASS. The measurement contract must first be explicitly repaired/re-derived before any `±3.5°` yaw execution.
