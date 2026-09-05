# Wheel mode5 RQ2C4E — angular contribution localization design

Date: 2026-09-05  
Owner: Jozz  
Role: bounded diagnostic predeclaration; not yaw qualification and not product evidence

## 1. Grounding

Trusted RQ2C4D source:

`8a65846ff4e2a41a096221e5908f3899f694461b`

Trusted RQ2C4D workflow:

`33969662893` — SUCCESS

RQ2C4D preserved exact RQ2C4 0 degree primary behavior and falsified the hypothesis that the remaining rolling-slip blocker was mainly a fixed-radius diagnostic artifact:

- legacy max slip: about `0.0346899 mm/s`;
- actual support-witness max slip: about `0.0340939 mm/s`;
- actual witness therefore retains about `98.3%` of the legacy maximum;
- actual support-witness mean absolute slip: about `0.0080130 mm/s`.

The next uncertainty is not whether the real witness moves tangentially; it does. The next uncertainty is which rigid-body contribution produces that residual.

## 2. Question

At the exact RQ2C4 0 degree state, is the real support-witness tangential residual primarily associated with:

1. mismatch between COM translation and pure axle spin (the rolling pair), or
2. angular velocity not parallel to the current wheel axle (non-spin / nutation contribution), or
3. a mixed cancellation that requires phase/correlation analysis before any intervention?

This experiment localizes kinematics only. It does not assign ParallelJoint causality merely because a non-spin component exists.

## 3. Frozen physics and scope

RQ2C4E must reproduce the exact RQ2C4 physical composition and apply RQ2C4D plus RQ2C4E as read-only transient telemetry.

Frozen:

- yaw: `0 degrees` only;
- speed: `1 m/s`;
- friction: `0.9`;
- gravity: `9.81 m/s^2`;
- outer-P75 carrier;
- 120 Hz / damping 1.0 angular ParallelJoint mount;
- 240 Hz / damping 2.0 direct local-axis translational guide;
- engine-native RQ2C4 hard-relax behavior;
- RH0 frozen replay remains prerequisite;
- no helper body, world-axis lock, solver tuning, stiffness change, geometry change or gate relaxation.

`+/-3.5 degrees` remains blocked. RQ2C4E must not execute those cases.

## 4. Authoritative witness and decomposition

Reuse RQ2C4D support witness:

- world down `D = (0,-1,0)`;
- `supportLocal = b3ComputeWheelSupport(wheel, inverseRotate(q,D))`;
- authoritative attached-point velocity `vWitness = b3Body_GetLocalPointVelocity(wheelBody, supportLocal)`.

Use the actual body local COM, not the body origin:

- `cLocal = b3Body_GetLocalCenterOfMass(wheelBody)`;
- `rWorld = rotate(q, supportLocal - cLocal)`.

Let:

- `v = b3Body_GetLinearVelocity(wheelBody)`;
- `omega = b3Body_GetAngularVelocity(wheelBody)`;
- `a = rotate(q,+Z)` be the current unit axle axis;
- `t = targetHeading` be the existing rolling tangent.

Decompose angular velocity:

- `omegaSpin = dot(omega,a) * a`;
- `omegaNonSpin = omega - omegaSpin`.

Point-velocity components:

- `vTranslation = v`;
- `vSpin = omegaSpin x rWorld`;
- `vNonSpin = omegaNonSpin x rWorld`;
- `vReconstructed = vTranslation + vSpin + vNonSpin`.

Tangent contributions:

- `sTranslation = dot(vTranslation,t)`;
- `sSpin = dot(vSpin,t)`;
- `sRollingPair = sTranslation + sSpin`;
- `sNonSpin = dot(vNonSpin,t)`;
- `sReconstructed = sRollingPair + sNonSpin`;
- `sWitness = dot(vWitness,t)`.

The rolling-pair residual is first-class telemetry because the approximately `+1 m/s` translation and `-1 m/s` spin terms mostly cancel; comparing their standalone magnitudes would be misleading for a residual near `0.034 mm/s`.

## 5. Instrument-validity gates

Interpret attribution only if all of these pass:

1. frozen RH0 replay passes unchanged;
2. exact RQ2C4 primary metrics reproduce within the existing deterministic RQ2C4D non-drift tolerances;
3. RQ2C4D actual-witness max and mean remain consistent with the trusted RQ2C4D run within `0.00001 mm/s` of the recorded rounded references;
4. settled maximum scalar reconstruction error `|sReconstructed-sWitness| <= 0.001 mm/s`;
5. settled maximum vector reconstruction error `|vReconstructed-vWitness| <= 0.001 mm/s`.

The reconstruction limits are diagnostic-integrity checks, roughly thirty times below the signal being localized. They are not rolling-quality gates and do not relax any RH0.5 criterion.

If reconstruction fails, classify RQ2C4E as **INSTRUMENT_INVALID** and do not interpret contribution magnitudes.

## 6. Required telemetry

For settled samples record:

- signed and absolute mean plus maximum absolute `sTranslation`;
- signed and absolute mean plus maximum absolute `sSpin`;
- signed and absolute mean plus maximum absolute `sRollingPair`;
- signed and absolute mean plus maximum absolute `sNonSpin`;
- maximum non-spin angular-speed magnitude;
- mean/max scalar reconstruction error;
- max vector reconstruction error;
- complete signed decomposition at the sample of maximum `|sWitness|`;
- final-frame decomposition.

No attribution threshold is predeclared. The data are to be inspected after instrument validity is established.

## 7. Interpretation routing

After a trusted run:

- rolling-pair residual materially accounts for the witness residual while non-spin is small -> investigate rolling/contact response or rolling geometry before angular tuning;
- non-spin materially accounts for the witness residual -> a bounded angular-compliance causal falsifier becomes decision-relevant;
- both are comparable or strongly cancel -> perform phase/correlation localization before changing physics;
- reconstruction invalid -> repair the instrument only; do not classify the mechanism.

Historical note: the attempted 240 Hz follow-up never executed physics and is apparatus-invalid provenance. Do not resurrect the old `120 -> 240 Hz until PASS` campaign. A future 240 Hz comparison is permitted only if new trusted RQ2C4E evidence makes it a specific causal falsifier.

## 8. Stop boundary

RQ2C4E ends after trusted 0 degree localization and classification. It does not execute yaw, tune stiffness, alter constraints, promote wheel-mode5 to product `main`, or claim product acceptance.
