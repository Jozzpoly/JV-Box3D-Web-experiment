# Wheel mode5 RQ2b — bounded drive-traction result

Date: 2026-09-05

Status: **TRUSTED EXECUTED / BOUNDED DRIVE TRACTION QUALIFIED IN THE TESTED RQ0-DERIVED ENVELOPE**

This checkpoint is research evidence only. It does not alter accepted `main`, Owner Preview, production Box3D/recycler semantics, or the status of a future native annular wheel representation.

## Question

Can the qualified RQ0/RQ2a donor outer-P75 rolling apparatus transmit the opposite tangential demand — a controlled drive torque — without a material contact-stability failure?

RQ2b is deliberately not a broader drivetrain experiment. It changes only torque direction relative to RQ2a.

## Apparatus

RQ2b deterministically clones the executed RQ2a C++ helper after composition and changes one mechanical input:

- RQ2a: `+Z` torque opposes the initial negative wheel spin (braking);
- RQ2b: `-Z` torque acts with the initial negative wheel spin (drive traction).

Everything else remains inherited:

- donor outer-P75 `b3Wheel` dynamic carrier;
- true static flat box road;
- `1 m/s` matched rolling initial condition;
- friction `mu = 0.9`;
- warm starting enabled;
- planar axle guide: linear Z and angular X/Y locked;
- standard engine contact/recycling behavior;
- no recycler manipulation;
- no E2a2 solver patches;
- no suspension, camber, steer or road-geometry change.

Demand:

- drive fraction: `0.20`;
- transparent reference scale: `mu * m * g * R`;
- applied drive torque Z: `-0.3939848244 N m`;
- pulse duration: `0.5 s`;
- the reference scale is only a transparent sub-limit convention and is not asserted to be the exact traction limit.

Executed source:

`2c582311c97deb184cad5862df468ce86a7188c2`

Workflow run / job:

`33957949201 / 101284575791`

Artifact:

`wheel-mode5-rq2b-drive-result` (`9967001133`)

## Apparatus validity

The complete pinned composition, Box3D.js build/tests and RQ2b runner succeeded.

Predeclared gates confirmed:

- donor/tire provenance remained verified;
- contact and normal solver impulse were present;
- the planar axle lock retained effectively zero lateral Z motion;
- the wheel remained inside the bounded road apparatus;
- zero-torque control retained essentially invariant Vx and spin;
- the drive case received the intended torque magnitude and sign;
- forward Vx increased;
- the magnitude of negative wheel spin increased.

## Dynamic result

### Zero-torque control over matched demand window

- contact dropouts: `0`;
- feature-set changes: `0`;
- point-count range: `1..1`;
- Y range: `0.0416040 mm`;
- max `|Vy|`: `6.52288 mm/s`;
- mean absolute rolling slip: `0.0001505 mm/s`;
- max absolute rolling slip: `0.0004172 mm/s`;
- mean normal impulse: `0.03404586`;
- max normal impulse: `0.04067835`.

### `0.20 * mu*m*g*R` drive pulse

- contact dropouts: **`0`**;
- feature-set changes: **`0`**;
- point-count range: **`1..1`**;
- Y range: `0.0708699 mm`;
- max `|Vy|`: `14.5586 mm/s`;
- mean absolute rolling slip: `0.309276 mm/s`;
- max absolute rolling slip: `3.67820 mm/s`;
- mean normal impulse: `0.03386563`;
- max normal impulse: `0.04697284`;
- pre/post Vx: `0.999999702 -> 1.587628961 m/s`;
- Vx change: `+0.587629259 m/s`;
- pre/post omega Z: `-1.833143592 -> -2.915713310 rad/s`;
- omega-Z change: `-1.082569718 rad/s`;
- end-of-pulse rolling-constraint delta residual `DeltaVx + R*DeltaOmega`: `-0.00292418 m/s`;
- post-pulse Vx relaxation: `+0.000974655 m/s`;
- post-pulse omega-Z relaxation: `+0.003573895 rad/s`;
- final rolling slip after relaxation: about `0.0002384 mm/s`.

Average forward acceleration during the `0.5 s` pulse is approximately `1.1753 m/s^2` (~`0.12 g`). The corresponding average longitudinal force `m*a` is about `0.481 N`, only about `13.3%` of the simple `mu*m*g` friction scale, so this remains deliberately sub-limit.

## Interpretation

### BOUNDED DRIVE TRACTION QUALIFIED

The wheel transmitted the requested drive demand with substantial intended acceleration and no material contact-stability failure:

- no dropout;
- no feature churn;
- no point-count transition;
- no sustained rolling mismatch after the pulse;
- no vertical excursion outside the previously qualified RQ0 background envelope.

The drive case is **not numerically symmetric with RQ2a braking**. This is retained as real evidence rather than normalized away:

- RQ2a braking max pulse slip was about `0.0489 mm/s`;
- RQ2b drive max pulse slip is about `3.678 mm/s`;
- the drive case also leaves about `2.924 mm/s` of overspin-style rolling mismatch at the instant the torque pulse ends;
- after torque removal, ordinary contact friction relaxes that mismatch and final slip returns to about `0.000238 mm/s`.

At the tested speed and demand, the drive max slip is about `0.00368 m/s`, roughly `0.37%` of the initial `1 m/s` rolling speed. Mean slip during the pulse is about `0.000309 m/s` (~`0.031%`). The increased pulse max `|Vy|` (`14.56 mm/s`) remains well below the qualified RQ0 background maximum (~`49 mm/s`), while pulse Y range (`0.0709 mm`) remains far below the RQ0 total Y range (~`0.675 mm`). Mean normal impulse remains essentially unchanged; the max increases modestly from `0.04068` to `0.04697` without contact loss or manifold churn.

Therefore the sign-asymmetric transient is a **measured characteristic / open lower-level explanation**, not a demonstrated material failure and not sufficient reason to reopen E2a2 recycler/reprojection forensics.

Do not descend into microscopic attribution unless later representative behavior makes this asymmetry decision-relevant.

## What this does NOT validate

RQ2b does not validate:

- traction saturation or a full drive-force curve;
- high-torque wheelspin;
- drivetrain compliance/differentials;
- braking/drive behavior under load transfer;
- mechanically free camber or steer;
- suspension/chassis coupling;
- irregular-road traction;
- lateral tire-force realism;
- bore/inner/side contacts;
- full native annular dynamic contact semantics;
- product integration or Owner acceptance.

## Routing consequence

RQ2 now has qualified bounded longitudinal traction in both torque directions for the laboratory RQ0-derived flat-road apparatus. Further torque sweeps are not the highest-value next move.

The next frontier should address the **mounting validity bottleneck** before free camber/steer or load-transfer experiments: design and falsify the smallest axle/mount constraint that preserves legitimate wheel spin without relying on world-axis angular locks, while avoiding a premature full suspension/vehicle rig.
