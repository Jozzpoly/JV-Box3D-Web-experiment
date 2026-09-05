# Wheel mode5 RQ2C4F — rolling-pair closure localization design

Date: 2026-09-05  
Owner: Jozz  
Role: bounded read-only diagnostic predeclaration; not yaw qualification and not causal contact-solver evidence

## 1. Grounding

RQ2C4D established that the actual geometric support witness retains essentially the full 0-degree rolling-slip blocker. RQ2C4E then reconstructed authoritative point velocity and localized the maximum witness residual primarily to the `COM translation + pure current-axle spin` rolling pair rather than non-spin/nutation.

Trusted RQ2C4E source / run / job:

`14b500c7f174c7107316fd9b31ef92b74964f501 / 33971215026 / 101319952137`

At peak witness:

- actual witness: `+0.034093857 mm/s`;
- rolling pair: `+0.034570694 mm/s`;
- non-spin: `-0.000464480 mm/s`.

The next uncertainty is inside the rolling pair itself.

## 2. Question

Relative to the initialized exact rolling state, which state evolution accounts for the settled rolling-pair residual:

1. COM tangential-velocity drift;
2. axle spin-rate drift;
3. change in the exact geometric spin lever between the current axle, current support witness and rolling tangent;
4. or a mixed combination?

RQ2C4F localizes kinematics only. It does not assign contact-solver causality merely because one state term dominates.

## 3. Frozen scope

Compose exact RQ2C4 physical behavior plus RQ2C4D, RQ2C4E and RQ2C4F read-only telemetry.

Frozen:

- yaw `0°` only;
- speed `1 m/s`;
- friction `0.9`;
- gravity `9.81 m/s²`;
- world step `1/240 s`, four substeps;
- 120 Hz / damping 1.0 angular ParallelJoint mount;
- 240 Hz / damping 2.0 direct local-axis translational guide;
- RQ2C4 engine-native hard-relax semantics;
- no geometry, stiffness, contact, solver, gate or timestep changes;
- `+3.5°/-3.5°` remain blocked.

## 4. Baseline ownership

The baseline must be sampled **after** the wheel shape and joint have been created and validated, but **before the first world step**.

This matters because body mass/COM state is final only after the wheel shape is attached. RQ2C4F must not assume body origin equals COM or infer the baseline solely from the earlier `speed/supportRadius` initialization constants.

At baseline compute with the same current-frame geometry used by RQ2C4E:

- `V0 = dot(vCOM0, targetHeading)`;
- `a0 = rotate(q0,+Z)`;
- `omega0 = dot(w0,a0)`;
- `support0 = b3ComputeWheelSupport(wheel, inverseRotate(q0,worldDown))`;
- `r0 = rotate(q0, support0 - localCOM0)`;
- `L0 = dot(cross(a0,r0), targetHeading)`;
- `S0 = omega0 * L0`;
- `R0 = V0 + S0`.

`L` has units of metres and is the exact signed geometric lever mapping pure axle spin rate to tangent point velocity.

Record `R0`; do not assume it is mathematically zero.

## 5. Exact current-state decomposition

For every current sample define:

- `V = dot(vCOM,targetHeading)`;
- `omega = dot(w,currentAxle)`;
- `L = dot(cross(currentAxle,rWorld),targetHeading)`;
- current rolling pair `R = V + omega*L`.

Let:

- `dV = V - V0`;
- `dOmega = omega - omega0`;
- `dL = L - L0`.

The product change must be split symmetrically:

- `spinRateContribution = dOmega * (L + L0) / 2`;
- `leverContribution = dL * (omega + omega0) / 2`.

This gives the exact, order-independent identity:

`R = R0 + dV + spinRateContribution + leverContribution`.

The symmetric factor split avoids an arbitrary sequential attribution and contains no leftover interaction term.

## 6. Instrument-validity barriers

Interpret RQ2C4F only if:

1. frozen RH0 replay passes;
2. existing RQ2C4E runner+validator pass unchanged in the same F-instrumented composition, thereby preserving RQ2C4 primary, RQ2C4D witness and RQ2C4E rigid-body reconstruction barriers;
3. baseline quantities are finite;
4. maximum settled absolute F closure reconstruction error `|Rreconstructed-R| <= 0.001 mm/s`;
5. peak-witness and final closure reconstruction errors are also `<= 0.001 mm/s`.

If any barrier fails, classify **INSTRUMENT_INVALID** and do not interpret contribution magnitudes.

No threshold is predeclared for which contribution must dominate.

## 7. Required telemetry

Record baseline:

- `V0`, `omega0`, `L0`, `S0`, `R0`.

For settled samples record signed mean, mean absolute and maximum absolute:

- `dV`;
- spin-rate contribution;
- lever contribution;
- reconstructed rolling-pair residual;
- F-vs-E rolling-pair reconstruction error.

Also record:

- mean/max `|dOmega|`;
- mean/max `|dL|`;
- full signed decomposition at E's peak actual-witness sample;
- full signed decomposition at maximum `|rollingPair|` sample;
- final decomposition.

## 8. Routing after trusted evidence

- spin-rate term materially dominates -> next design a specific causal falsifier for why axle spin evolves away from rolling closure; do not infer contact-solver blame from kinematics alone;
- lever term materially dominates -> inspect support/rolling geometry semantics and state dependence before changing dynamics;
- COM velocity term materially dominates -> inspect longitudinal response/control assumptions;
- mixed/cancelling terms -> localize phase/correlation before intervention.

A 240 Hz angular-mount comparison remains explicitly not next unless later evidence makes angular compliance a specific causal hypothesis again.

## 9. Stop boundary

RQ2C4F ends after trusted 0-degree localization and classification. It does not execute yaw, tune physics, change gates, alter wheel geometry, promote wheel-mode5 to product `main`, or claim Owner acceptance.
