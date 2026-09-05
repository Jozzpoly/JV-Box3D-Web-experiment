# Wheel mode5 RQ2C4F — rolling-pair closure localization result

Date: 2026-09-05

Status: **TRUSTED DIAGNOSTIC / SPIN-RATE EVOLUTION DOMINATES THE 0° ROLLING-PAIR BLOCKER**

Classification: **`RQ2C4F_SPIN_RATE_DRIFT_DOMINANT`**

This is bounded donor-carrier research evidence only. It is not yaw qualification, product acceptance, or causal attribution to the contact solver, ParallelJoint, or direct translational guide.

## Question

RQ2C4E established that the maximum actual support-witness residual is dominated by incomplete cancellation of COM translation and pure current-axle spin. RQ2C4F asks which state evolution inside that rolling pair accounts for the residual relative to the initialized exact rolling state:

1. COM tangential-velocity drift;
2. axle spin-rate drift;
3. exact geometric spin-lever drift.

## Provenance

- executed source: `a7d3389edf6c51664d5615d657e879109b161420`
- workflow run: `33973506632`
- job: `101326068112`
- artifact: `9971633765`
- artifact digest: `sha256:e0e32986831498022e0f05ae1bae039d3c6e48e136b335f90a3c4a588ff48c4a`

The immediately preceding workflow commit contained the same known escaped-quote `grep` harness mistake previously seen during RQ2C4E. Commit `a7d3389...` changed only those two workflow assertions before the useful run. RQ2C4F telemetry, algebra, physics and gates were unchanged.

## Trust barrier

The useful run passed, in order:

1. exact pinned donor/vendor recovery;
2. RQ2C4 + D + E + F composition;
3. full Box3D.js build/tests;
4. frozen RH0 replay and validator;
5. unchanged RQ2C4E runner under the F-instrumented composition;
6. unchanged RQ2C4E validator, preserving RQ2C4 primary, D actual-witness and E rigid-body reconstruction evidence barriers;
7. RQ2C4F execution;
8. exact F closure-reconstruction validator.

`+3.5°/-3.5°` did not execute.

## Exact decomposition

For current rolling pair

`R = V + omega*L`

relative to the post-shape/pre-first-step baseline `V0, omega0, L0`, RQ2C4F uses the exact symmetric product split:

- translation contribution: `dV = V - V0`;
- spin-rate contribution: `dOmega * (L + L0) / 2`;
- lever contribution: `dL * (omega + omega0) / 2`.

Therefore:

`R = R0 + dV + spinRateContribution + leverContribution`

without an order-dependent interaction residual.

## Baseline — exactly closed

The actual body state sampled after wheel shape/joint creation but before the first world step was:

- COM tangent velocity: `+1000.000000 mm/s`;
- axle spin rate: `+1.834230900 rad/s`;
- exact signed spin lever: `-545.187712 mm`;
- spin tangent velocity: `-1000.000000 mm/s`;
- rolling pair: **`0.000000 mm/s`**.

Therefore the blocker is not an initialization or post-shape mass/COM closure error. It emerges after dynamics begin.

## Settled state localization

### COM tangential-velocity drift

- mean signed: **`-0.003449120 mm/s`**;
- mean absolute: `0.003646373 mm/s`;
- max absolute: `0.007688999 mm/s`.

### Axle spin-rate contribution

- mean signed: **`+0.012023413 mm/s`**;
- mean absolute: **`0.012023413 mm/s`**;
- max absolute: **`0.030174406 mm/s`**;
- mean absolute `|dOmega|`: `2.205427e-5 rad/s`;
- max absolute `|dOmega|`: `5.534291e-5 rad/s`.

The spin-rate contribution is one-signed over the settled statistics reported by this apparatus.

### Exact geometric spin-lever contribution

- mean signed: `-0.000102552 mm/s`;
- mean absolute: `0.000319267 mm/s`;
- max absolute: `0.001204466 mm/s`;
- mean absolute lever change: `0.000116067 mm`;
- max absolute lever change: `0.000357628 mm`.

The exact support/spin lever is therefore extremely stable and is not a plausible primary explanation for the `~0.0346 mm/s` rolling-pair maximum.

### Reconstructed rolling pair

- mean signed: `+0.008471740 mm/s`;
- mean absolute: `0.008494902 mm/s`;
- max absolute: `0.034570694 mm/s`.

Closure reconstruction error:

- mean absolute: `0.000030901 mm/s`;
- max absolute: `0.000119209 mm/s`;

well inside the predeclared `0.001 mm/s` instrument-integrity limit.

## Peak blocker

The maximum rolling-pair sample is also the peak actual-witness sample in this run.

At that sample:

- actual witness slip: `+0.034093857 mm/s`;
- rolling pair: **`+0.034570694 mm/s`**;
- COM translation drift: **`+0.004529953 mm/s`**;
- axle spin-rate drift: `-5.534291e-5 rad/s`;
- spin-rate contribution: **`+0.030174406 mm/s`**;
- spin-lever drift: `+0.000119209 mm`;
- lever contribution: **`-0.000109348 mm/s`**;
- reconstructed rolling pair: `+0.034595009 mm/s`;
- closure reconstruction error: `+0.000024315 mm/s`.

At the peak, the spin-rate term is about **87.3%** of the rolling-pair magnitude. COM translation adds about **13.1%**, while the geometric-lever term is tiny and slightly cancelling.

## Final sample

- rolling pair: `+0.005602837 mm/s`;
- COM translation drift: `-0.004589558 mm/s`;
- spin-rate contribution: `+0.009893745 mm/s`;
- lever contribution: `+0.000298926 mm/s`;
- reconstructed rolling pair: `+0.005603113 mm/s`.

The spin-rate term therefore remains material beyond the single peak sample; the contribution is not a one-frame artifact.

## Decision

RQ2C4F resolves the next level of the 0-degree blocker:

1. the initialized rolling state is exactly closed;
2. exact support/spin-lever evolution is too small to explain the blocker;
3. **axle spin-rate evolution is the dominant contribution to the maximum rolling-pair residual**;
4. COM tangential-velocity drift is secondary and can reinforce or cancel the spin-rate term depending on phase;
5. this is still a kinematic localization. It does **not** identify which solver subsystem changes `omega_A`.

The frozen actual-witness slip gate remains failed and yaw remains blocked.

## Next bounded move

Do not tune angular stiffness, friction, timestep, contact parameters or gates yet.

First perform **source-grounded impulse/torque ownership analysis** for the exact RQ2C4 solver path. Determine whether existing public reaction/contact telemetry can close the observed `delta omega_A` budget across:

- contact normal/friction response;
- angular ParallelJoint response;
- experimental direct scalar-guide response;
- any other solver/integration contribution.

If public post-step telemetry cannot uniquely close that budget, predeclare one transient solver-level diagnostic that accumulates per-subsystem contribution to wheel axle spin without changing the equations or solve order.

Only after ownership is established should a causal counterfactual be chosen.
