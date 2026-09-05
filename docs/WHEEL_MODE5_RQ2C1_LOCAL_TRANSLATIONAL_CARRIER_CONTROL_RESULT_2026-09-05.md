# Wheel mode5 RQ2C1 — local translational carrier 0° control result

Date: 2026-09-05

Status: **TRUSTED EXECUTED / APPARATUS INVALID / YAW PAIR NOT EXECUTED**

This is bounded research evidence only. It does not alter accepted `main`, Owner Preview, production wheel architecture, full annular contact semantics or final steering/suspension design.

## Question

After RQ2C0 showed that fully free translation develops material cross-heading drift, can a mechanically local two-translation carrier constrain only local axle/cross-heading motion while preserving:

- heading travel along rotated local `H`;
- vertical travel along `Y`;
- free wheel spin;
- the existing `120 Hz` ParallelJoint angular guide;
- and RQ0-like flat-road rolling/contact behavior?

The predeclared apparatus was:

`static root -> H-prismatic sled -> Y-prismatic carrier -> spherical wheel-center`

plus:

`vertical carrier -> 120 Hz ParallelJoint -> wheel`.

The two collisionless helper bodies had `gravityScale = 0`, zero rotational inertia and a combined translational mass equal to exactly `1%` of the measured donor-wheel mass (`0.5%` per helper). That budget was frozen before execution and was not tuned to the outcome.

## Execution

Branch:

`research/wheel-mode5-rq2c-orientation-2026-09-05`

Source / run / job / artifact:

`f7ef795bedd4a5821556fc32bf953505d681c8d5 / 33966506853 / 101307463007 / 9969617033`

Before RQ2C1 physics:

- pinned Box3D.js and recovered donor-wheel composition built successfully;
- Box3D.js tests passed;
- the frozen RH0 canonical suite replayed in the same composed build;
- frozen RH0 replay validation passed;
- only then did the new `0°` control execute.

The workflow correctly stopped at the failed `0°` gate. `+3.5° / -3.5°` were not executed.

## Frozen apparatus values actually measured

- donor wheel mass: `0.409010649 kg`;
- each helper-body mass: `0.0020450533 kg`;
- total helper mass: about `0.0040901065 kg`, i.e. `1%` of wheel mass;
- mount: `120 Hz`, damping ratio `1`;
- yaw: `0°`;
- flat static road, `mu = 0.9`;
- initial rolling speed: `1 m/s`;
- world step: `1/240 s`, 4 substeps;
- no world-axis motion locks;
- no torque pulse;
- no intentional lateral slip-angle demand.

The predeclared RH0.5 gates were unchanged from RQ2C0:

- settled contact dropouts `= 0`;
- feature-set changes `= 0`;
- point count `1..1`;
- Y range `0.50..0.90 mm`;
- max `|Vy|` `35..65 mm/s`;
- max rotated slip `<= 0.002 mm/s`;
- axle-axis error `<= 0.035°`;
- velocity-heading error `<= 0.035°`.

## Result

### Contact and vertical dynamics remain healthy

- first contact step: `0`;
- first normal-impulse step: `3`;
- settled contact dropouts: **`0`**;
- settled feature-set changes: **`0`**;
- point count: **`1..1`**;
- settled Y range: **`0.673354 mm`** — PASS;
- settled max `|Vy|`: **`52.1146 mm/s`** — PASS.

This is again inconsistent with a primary contact-topology or vertical-support failure.

### Angular mount still passes

- max axle-axis error: **`0.00914909°`**;
- final axle-axis error: `0.00297030°`;
- budget: `0.035°`.

The existing `120 Hz` ParallelJoint remains inside the challenge-derived orientation budget. This result still does not justify a `240 Hz` angular-stiffness campaign.

### Local carrier fails the heading/rolling purpose

- max heading error: **`1.31736°`** versus `0.035°` gate;
- final heading error: `0.0872109°`;
- max cross-heading speed: **`22.9966 mm/s`**;
- max cross-track excursion after settle: **`6.13814 mm`**;
- mean absolute rotated slip: `0.00586510 mm/s`;
- max absolute rotated slip: **`0.0393391 mm/s`** versus `0.002 mm/s` gate;
- final absolute slip: `0.000119209 mm/s`.

The local carrier therefore does **not** qualify as a clean rotated-heading equivalence apparatus.

### The carrier chain itself shows material constraint error

A diagnostic already present in the predeclared implementation measured the wheel-origin to vertical-carrier-origin separation:

- max settled center error: **`1.48364 mm`**.

The nominally allowed prismatic translations were:

- heading translation: `1.00415 .. 4.00000 m`;
- vertical translation: `-1.78742 .. -1.11520 mm`.

The center-error magnitude is large relative to the intended sub-millimetre qualification scales and is direct evidence that the multi-joint carrier cannot currently be treated as an ideal local rail.

## Comparison with RQ2C0 fully-free control

RQ2C1 did not merely fail to remove the RQ2C0 drift; its peak lateral metrics became worse:

| metric | RQ2C0 fully free | RQ2C1 local carrier | change |
|---|---:|---:|---:|
| max heading error | `0.858248°` | `1.31736°` | ~`1.54x` |
| max cross-heading speed | `14.9805 mm/s` | `22.9966 mm/s` | ~`1.54x` |
| max cross-track | `3.79228 mm` | `6.13814 mm` | ~`1.62x` |
| max rotated slip | `0.0268817 mm/s` | `0.0393391 mm/s` | ~`1.46x` |
| max axle-axis error | `0.00592098°` | `0.00914909°` | still PASS |

Y range stayed essentially unchanged and contact topology stayed clean.

This pattern strongly suggests that the added constraint chain introduces or amplifies mechanical/solver compliance instead of supplying the intended clean local cross-heading guidance. It does **not yet localize which joint or stage dominates that compliance**.

## Classification

**`APPARATUS_INVALID_LOCAL_CARRIER_CONTROL`**

Meaning:

- the physics execution itself is valid and informative;
- frozen RH0 remained non-drifted;
- contact and vertical dynamics remain RQ0-like;
- the `120 Hz` angular guide remains within budget;
- the proposed `H-prismatic -> Y-prismatic -> spherical` translational carrier fails its purpose at `0°`;
- the failure cannot be attributed to yaw because yaw was never executed;
- the result does not validate a tire/contact defect;
- the `1%` helper-mass budget must **not** be retuned simply to make the gate pass.

## Next bounded move

Do not change carrier mass, angular hertz, challenge angle or gates yet.

First rerun the exact same `0°` physics with diagnostic-only joint telemetry sufficient to localize constraint compliance:

- cross-heading displacement of heading sled and vertical carrier relative to the static root;
- relative `H / Y / A` separation for wheel vs vertical carrier;
- `b3Joint_GetLinearSeparation` for heading prismatic, vertical prismatic and spherical center joint;
- `b3Joint_GetAngularSeparation` for the ParallelJoint where meaningful;
- constraint-force magnitudes/components for the carrier joints as observational telemetry.

No new pass/fail threshold should be attached to those diagnostics. Their job is only to decide whether the next architecture question is primarily spherical-center compliance, accumulated prismatic-chain compliance, an instrumentation-mass interaction, or a more fundamental need for a direct one-axis local translational constraint.

Only after that localization should the carrier architecture be changed.
