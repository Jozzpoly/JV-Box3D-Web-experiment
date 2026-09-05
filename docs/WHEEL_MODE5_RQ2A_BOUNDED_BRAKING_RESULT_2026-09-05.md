# Wheel mode5 RQ2a — bounded braking result

Date: 2026-09-05

Status: **TRUSTED EXECUTED / BOUNDED BRAKING QUALIFIED IN THE TESTED RQ0-DERIVED ENVELOPE**

This checkpoint is research evidence only. It does not alter accepted `main`, Owner Preview, production Box3D/recycler semantics, or the status of a future native annular wheel representation.

## Question

Can the qualified RQ0 donor outer-P75 rolling carrier transmit a controlled nonzero braking demand through ordinary frictional contact without a material contact-stability failure?

RQ2a is the first RQ2 representative-envelope expansion after Q1 closed as not materially relevant in its tested representative envelope.

## Apparatus

RQ2a inherits the qualified RQ0 carrier and preserves:

- donor outer-P75 `b3Wheel` dynamic carrier;
- true static flat box road;
- `1 m/s` matched rolling initial condition;
- friction `mu = 0.9`;
- warm starting enabled;
- planar axle guide: linear Z and angular X/Y locked;
- standard engine contact/recycling behavior;
- no recycler manipulation;
- no E2a2 diagnostic solver patches;
- no drive torque, suspension, camber, steering or irregular-road change.

The one intentional mechanical change is a finite braking torque pulse about world Z, opposite the initial negative wheel spin.

Demand:

- brake fraction: `0.20`;
- transparent reference scale: `mu * m * g * R`;
- applied brake torque: `0.3939848244 N m`;
- pulse duration: `0.5 s`;
- the reference scale is only a transparent sub-limit scaling convention and is **not** asserted to be the exact tire/wheel traction limit.

Executed source:

`2212efa95a8ef0b20933308ec9010031c5a3f002`

Workflow run / job:

`33956379091 / 101280360165`

Artifact:

`wheel-mode5-rq2a-braking-result` (`9966515518`)

## Apparatus validity

The run passed the predeclared validity gates:

- donor/tire provenance remained verified;
- contact and normal solver impulse were both present;
- the planar axle lock retained effectively zero lateral Z motion;
- the wheel remained within the bounded road apparatus;
- the zero-torque control retained essentially invariant Vx and spin across the demand window;
- the brake case received positive braking torque, reduced forward speed and reduced the magnitude of negative wheel spin.

The workflow completed successfully.

## Dynamic result

### Zero-torque control over the matched pulse window

- contact dropouts: `0`;
- feature-set changes: `0`;
- point-count range: `1..1`;
- Y range: `0.0416040 mm`;
- max `|Vy|`: `6.52288 mm/s`;
- mean absolute rolling slip: `0.0001505 mm/s`;
- max absolute rolling slip: `0.0004172 mm/s`;
- mean normal impulse: `0.03404586`;
- max normal impulse: `0.04067835`;
- Vx change: `+1.19e-7 m/s`;
- omega-Z change: `-2.38e-7 rad/s`.

### `0.20 * mu*m*g*R` braking pulse

- contact dropouts: **`0`**;
- feature-set changes: **`0`**;
- point-count range: **`1..1`**;
- Y range: `0.0716448 mm`;
- max `|Vy|`: `5.78928 mm/s`;
- mean absolute rolling slip: `0.00224362 mm/s`;
- max absolute rolling slip: `0.0488758 mm/s`;
- mean normal impulse: `0.03355952`;
- max normal impulse: `0.03974508`;
- pre/post Vx: `0.999999702 -> 0.411401361 m/s`;
- Vx change: `-0.588598371 m/s`;
- pre/post omega Z: `-1.833143592 -> -0.754157901 rad/s`;
- omega-Z change: `+1.078985691 rad/s`;
- rolling-constraint delta residual `DeltaVx + R*DeltaOmega`: `-5.66e-8 m/s`;
- final rolling slip after the pulse: about `0.0000894 mm/s`.

The average longitudinal deceleration over the `0.5 s` pulse is approximately `1.177 m/s^2` (~`0.12 g`).

## Interpretation

### BOUNDED BRAKING QUALIFIED

The applied torque produced a substantial intended mechanical response while translation and spin remained coordinated to float-scale rolling residual.

No material contact-stability failure was observed:

- no contact loss;
- no feature churn;
- no manifold point-count change;
- no normal-impulse spike;
- no increase in pulse max `|Vy|` relative to the zero-torque control;
- pulse Y range increased from about `0.0416` to `0.0716 mm`, but this absolute excursion remains far below the qualified RQ0 background envelope (~`0.675 mm` total Y range and ~`49 mm/s` max `|Vy|`) and is not a material instability;
- the nominal `117x` max-slip ratio versus control is denominator-sensitive: the control max slip is only `0.000417 mm/s`. The challenge absolute max is `0.048876 mm/s` (`4.89e-5 m/s`), about `0.0049%` of the initial `1 m/s` rolling speed, with mean slip only `0.002244 mm/s`.

The braking response therefore behaves as expected physical signal under applied torque rather than as contact pathology.

RQ2a provides no trigger to reopen E2a2 recycler/reprojection forensics.

## What this does NOT validate

RQ2a does not validate:

- near-limit braking or traction saturation;
- wheel lockup or ABS-like regimes;
- a complete braking-force curve;
- drive traction;
- free camber or steer;
- suspension/chassis load transfer;
- irregular-road braking;
- lateral tire-force realism;
- bore/inner/side contacts;
- full native annular dynamic contact semantics;
- product integration or Owner acceptance.

## Natural next move

Keep RQ2 active. The lowest-cost qualitatively new causal dimension is a matched bounded **drive-traction** pulse using the same RQ0-derived apparatus but reversing the applied torque direction. This tests the opposite tangential demand while preserving geometry, axle provenance and the same friction/contact system.

Do not expand braking severity merely for matrix completeness; stronger braking/lockup belongs to a later traction-limit question if product decisions require it.
