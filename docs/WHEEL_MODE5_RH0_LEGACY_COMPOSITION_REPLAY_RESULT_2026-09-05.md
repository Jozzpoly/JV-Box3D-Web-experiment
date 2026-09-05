# Wheel mode5 RH0 — legacy-composition bridge replay result

Date: 2026-09-05
Status: **TRUSTED DIAGNOSTIC / MIGRATION ORACLE PASS / NO NEW PHYSICS CLAIM**

Source:

`f38b82195b2032cba49815f79770ecf8e8abce2a`

Workflow / job:

`33959870475 / 101289762819`

Artifact:

`wheel-mode5-rh0-legacy-composition-replay` (`9967602295`)

Artifact digest:

`sha256:2777c3bf996056023418321edc277826e68f3e38fa4323890a1db60a901ec298`

## Purpose

This is an RH0 migration oracle, not a new wheel/contact experiment.

The historical canonical RQ0, RQ1c, RQ2a and RQ2b helpers were deliberately composed into **one pinned `bindings.cpp`, one Box3D.js build and one Node process**, then their outputs were normalized into the new RH0 replay schema and checked against:

`docs/evidence/WHEEL_MODE5_RH0_CANONICAL_REPLAY_CONTRACT_2026-09-05.json`

The question was:

> Can the existing accepted/scoped donor-carrier evidence coexist in one build and reproduce its defining behavior before we replace the brittle helper-clone/string-patch apparatus with a consolidated explicit suite?

A PASS here means only **migration non-drift oracle established**. It does not broaden RQ0/RQ1/RQ2 scope and is not Owner/product acceptance.

## Pinned composition

- `box3d.js`: `2617a0ff763a60c9f17cee57c6ea72aab75a5077`;
- vendor Box3D: `8441b4a06d6d09dcfb0b0f704df4d847d1437b92`;
- recovered donor wheel patch from the existing pinned donor diff boundary;
- E1 annular header generation;
- E1 bindings;
- E2a donor carrier bindings;
- frozen RQ0 + planar axle helper;
- frozen RQ1 + hull introspection + 30 µrad RQ1c helper;
- frozen RQ2a braking helper;
- frozen RQ2b drive helper.

No E2a2 forensic solver patch was included.

## Execution result

All stages succeeded:

1. pinned dependency/donor recovery;
2. multi-helper composition into one translation unit;
3. pinned Box3D.js build and smoke tests;
4. all frozen scenarios in one runtime;
5. RH0 replay-contract validation;
6. artifact preservation.

### RQ0 matched rolling

- dropouts: `0`;
- feature changes: `0`;
- point count: `1..1`;
- Y range: `0.674605 mm`;
- max `|Vy|`: `48.942976 mm/s`;
- mean slip: `0.00009330 mm/s`;
- max slip: `0.00041723 mm/s`;
- measurement Vx drift: `0`;
- measurement omega drift: `0`.

### RQ0 zero-spin positive control

- first contact present: yes;
- first normal impulse present: yes;
- final spin became negative as required by frictional spin-up;
- final omega Z: `-1.22209585 rad/s`;
- final Vx: `0.66666657 m/s`;
- final slip: `0.00011921 mm/s`;
- settled dropouts: `0`.

This preserves the important positive-control evidence that the tangent friction path is really exercised.

### RQ1c flat control

- top planes: `1`;
- dropouts / feature changes: `0 / 0`;
- point count: `1..1`;
- Y range: `0.916600 mm`;
- max slip: `0.00029802 mm/s`;
- pre/post normal X: `0 / 0 µrad`.

### RQ1c 30 µrad challenge

- top planes: **`2`**;
- hull top normal max: `29.999999 µrad`;
- dropouts: **`0`**;
- feature changes: **`1`**;
- near-transition feature changes: **`1`**;
- point count: **`1..1`**;
- max slip: `0.00095367 mm/s`;
- pre/post normal X: `0 / -29.997167 µrad`;
- near Y-range ratio vs flat: `1.0`;
- near max-`|Vy|` ratio vs flat: `1.0`.

The defining topology-transition signal is preserved rather than accidentally flattened by co-composition.

### RQ2a braking 20%

- pulse dropouts / feature changes: `0 / 0`;
- point count: `1..1`;
- max pulse slip: **`0.0488758 mm/s`**;
- Vx delta: `-0.588598371 m/s`;
- omega delta: `+1.078985691 rad/s`;
- absolute rolling-constraint residual: `0.00005659 mm/s`;
- final slip: `0.00008941 mm/s`.

### RQ2b drive 20%

- pulse dropouts / feature changes: `0 / 0`;
- point count: `1..1`;
- max pulse slip: **`3.67820263 mm/s`**;
- Vx delta: `+0.587629259 m/s`;
- omega delta: `-1.082569718 rad/s`;
- absolute end-pulse rolling mismatch: **`2.92418081 mm/s`**;
- final slip: `0.00023842 mm/s`.

### RQ2 longitudinal sign-asymmetry sentinel

Drive/brake max pulse slip ratio:

`3.67820263 / 0.04887581 ~= 75.26x`

The consolidated bridge therefore **did not erase or normalize away the known sign-asymmetric transient**. This is exactly what RH0 needed from a migration oracle: the awkward characteristic survives until a later deliberate apparatus/physics change explains why it should differ.

## Interpretation

### PASS — migration oracle established

The important conclusion is not that old one-off infrastructure should become permanent. The conclusion is that:

- the canonical RQ scenarios can coexist in one pinned build;
- their defining topology/contact/traction signals remain intact;
- the new replay contract can detect meaningful drift across those scenarios;
- the observed RQ2 drive/brake asymmetry survives co-composition;
- we now have a trustworthy A-side against which to build the explicit consolidated RH0 suite.

This materially reduces the risk of the next refactor: if the new suite disagrees, we can compare against one reproducible combined oracle rather than re-running four unrelated historical workflows and guessing which apparatus changed.

## What this does not establish

It does not:

- make the legacy patch chain the new canonical active architecture;
- validate new wheel physics;
- validate RQ2c0 orientation/mount behavior;
- validate full annular semantics;
- close RH0;
- authorize camber/steer/load-transfer work;
- authorize product promotion or Owner Preview.

## RH0 routing consequence

RH0.1–RH0.2 are established and the migration oracle required for RH0.3 now exists.

Next:

1. implement the explicit versioned RH0 RQ suite described in `docs/WHEEL_MODE5_RH0_CONSOLIDATED_RQ_HARNESS_DESIGN_2026-09-05.md`;
2. keep this bridge replay as the migration A-side;
3. run the new suite against the **same** replay contract;
4. investigate any difference as harness non-drift before changing physics or widening gates;
5. only after the explicit suite passes may historical scenario-patch workflows become provenance-only and RH0 proceed to challenge-derived orientation error budgeting.
