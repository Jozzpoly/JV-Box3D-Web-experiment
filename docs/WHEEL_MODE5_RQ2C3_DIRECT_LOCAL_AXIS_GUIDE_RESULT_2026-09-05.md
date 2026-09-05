# Wheel mode5 RQ2C3 — direct local-axis guide result

Date: 2026-09-05

Status: **TRUSTED EXECUTED / APPARATUS INVALID FOR YAW CHALLENGE**

Classification: **`RQ2C3_DIRECT_GUIDE_SOFT_EQUALITY_CONTROL_FAIL`**

This is bounded donor-carrier research evidence only. It does not alter accepted product `main`, Owner Preview, final wheel/suspension/steering architecture, or full annular-contact semantics.

## Question

Can the falsified multi-joint helper-body carrier be replaced by one direct scalar local translational constraint on the existing local-axis `b3ParallelJoint`, constraining only local axle-axis / cross-heading translation while leaving heading travel, vertical travel and wheel spin free?

## Provenance

- executed source: `09712c613218f5b6bb40927673f714fd364f2bdf`
- workflow run: `33968208611`
- job: `101311971290`
- artifact: `9970119510`
- artifact digest: `sha256:f2886dd200b507b9af384f5e64e5d1c0ccdefbeff089fbb2ad9c0b998785a2c2`

The immediately preceding run `33968116684` did **not** build or execute physics; it failed only because workflow sanity-check `grep` strings incorrectly searched for literal escaped quotes. The correction changed only those workflow checks. The solver patch, suite, parameters and gates were unchanged.

## Trust barrier

In run `33968208611`:

1. transient pinned Box3D + donor + RQ2C3 patch composed successfully;
2. full Box3D.js C++/WASM build and test suite passed;
3. frozen RH0 canonical scenarios replayed in the same patched composition;
4. frozen RH0 replay validation passed;
5. RQ2C3 `0°` physics executed;
6. only then did the unchanged RQ2C3/RH0.5 control gate fail;
7. `+3.5°/-3.5°` remained unexecuted.

Therefore this is a trusted apparatus result rather than an infrastructure or provenance failure.

## Apparatus

- donor outer-P75 `b3Wheel` carrier;
- flat static road;
- `1 m/s` matched rolling state;
- friction `mu = 0.9`;
- gravity `9.81 m/s²`;
- world step `1/240 s`, four substeps;
- static yaw-rotated reference body;
- one `b3ParallelJoint` reference -> wheel;
- historical angular guide unchanged: `120 Hz`, damping `1.0`, `maxTorque = FLT_MAX`;
- experimental default-off scalar linear guide enabled only for RQ2C3;
- linear guide axis = reference frame local `+Z` = commanded axle axis `A`;
- linear guide generic constraint tuning `240 Hz`, damping `2.0`;
- **no helper bodies**;
- **no world-axis motion locks**;
- yaw `0°` only because control failed.

The scalar guide used the pinned prismatic axial Jacobian/effective-mass geometry but used `base->constraintSoftness` on every `b3ParallelJoint` solve call. At this stage `b3ParallelJoint` historically ignored the solver's `useBias` solve/relax distinction.

## 0° result

### Contact and vertical dynamics — PASS

- first contact step: `0`;
- first normal-impulse step: `3`;
- settled contact dropouts: **`0`**;
- settled feature-set changes: **`0`**;
- point count: **`1..1`**;
- settled Y range: **`0.688076 mm`** within `0.50..0.90 mm`;
- settled max `|Vy|`: **`47.738720 mm/s`** within `35..65 mm/s`.

### Angular local-axis guide — PASS

- max axle-axis error: **`0.00852835°`** versus `0.035°` budget;
- final axle-axis error: `0.00720989°`.

The existing 120 Hz angular mount remains comfortably inside its challenge-derived budget.

### Direct cross-heading positional guidance — strongly supportive diagnostic

- max absolute plane separation: **`0.00380219 mm`**;
- max cross-track excursion after settle: **`0.00686202 mm`**;
- final plane separation: **`-0.00268960 mm`**.

This is qualitatively different from RQ2C0/RQ2C1/RQ2C2. The direct scalar topology removes the millimetre-scale accumulated lateral-position compliance of the helper-body chain. The wheel remains essentially on the intended local axle-normal plane.

These are diagnostics, not newly invented acceptance gates.

### Heading velocity — FAIL, small residual

- max heading error: **`0.04951397°`** versus frozen `0.035°` gate;
- max cross-heading speed: **`0.864176 mm/s`**;
- final heading error: `0.01190939°`.

At approximately `1 m/s` longitudinal speed, the maximum cross-heading velocity corresponds closely to the measured ~`0.0495°` heading error. The failure is therefore now a small residual velocity error rather than material positional wandering.

### Rotated rolling slip — FAIL

- mean absolute rotated slip: **`0.00857040 mm/s`**;
- max absolute rotated slip: **`0.03457069 mm/s`** versus frozen `0.002 mm/s` gate;
- final slip: `0.00584126 mm/s`.

The frozen gate remains unchanged. The near-zero plane error does not justify declaring the apparatus valid while heading/slip still fail.

## Mechanistic follow-up from pinned solver semantics

Pinned Box3D `b3MakeSoft` does not become a hard equality merely because generic hertz reaches the solver's 240 Hz clamp. At finite hertz, `massScale < 1` and `impulseScale > 0`; only the infinite-stiffness limit approaches `massScale = 1`, `impulseScale = 0`, `bias = 1/h`.

More importantly, pinned hard equality constraints such as the prismatic point-to-line constraint explicitly receive the solver's `useBias` flag:

- during the biased solve they use positional bias and `constraintSoftness`;
- during relaxation (`useBias = false`) they use `bias = 0`, `massScale = 1`, `impulseScale = 0`.

Historical `b3ParallelJoint` does not receive `useBias`; therefore RQ2C3's new scalar guide remained soft during relaxation as well.

This is a concrete engine-native semantic difference and a justified next falsifier. It is not a reason to relax gates or run another hertz sweep.

## Decision

RQ2C3 establishes two scoped conclusions:

1. **Direct one-axis topology is materially better than the closed multi-joint carrier topology for positional guidance.** The helper-body chain remains closed.
2. **The RQ2C3 soft-equality implementation is not a valid qualification apparatus yet.** It fails the predeclared 0° heading and slip gates, so no yaw result exists.

## Next bounded move

Predeclare and execute **RQ2C4** with the same direct topology, same geometry, same angular mount, same 240 Hz generic tuning, same runtime, same frozen gates and no helper bodies.

The only solver-semantic change should be to pass the existing solver `useBias` flag into `b3SolveParallelJoint` and make the experimental scalar linear guide follow the pinned hard-equality pattern during relaxation:

- `useBias = true`: preserve the RQ2C3 soft positional correction;
- `useBias = false`: `bias = 0`, `massScale = 1`, `impulseScale = 0`.

The historical angular ParallelJoint solve path must remain unchanged.

Run frozen RH0 replay first, then `0°`. Only an unchanged-gate 0° PASS may unlock `+3.5°/-3.5°`.
