# JV Web — owner checkpoint ledger

Updated: 2026-08-11

This ledger records owner-visible decisions future agents must preserve. It is not a test log or chronological chat summary.

## Evidence rule

For each meaningful checkpoint record exact source/artifact identity when available, owner verdict, protected meaning and what remains open.

A green automated test is not owner acceptance. A historical/session label is not reproducible authority unless its parameters were committed.

## P0 — playable owner vehicle foundation

```text
source: 81c9677e12a331953101eb2531ca8ab013a985f9
classification: OWNER ACCEPTED
```

Proved browser integration of real owner chassis/wheels, M6 drive/steer/brake/reset, chase/orbit camera, Map/Offroad and debug behavior.

Durable meaning: browser owner-vehicle integration has playable accepted history.

## R2 — first full owner rig package

```text
source: 5d508485ba5c24e6552e324cfbbcb5ec19399fec
classification: OWNER REJECTED VISUALLY / TECHNICAL EVIDENCE ONLY
```

Major calibration defects included suspension packaging, dampers and cardans. Do not resurrect R2 placement because tests are green.

## R4 — historical partial observation

```text
source lineage baseline: 9a49982cc428bf6fb18f4e1b98ea1b073eaa8a5f
product tree: e28515182d3a447374044d9ffc70943fb888328d
package: m6-owner-full-rig-r3
real bindings: 59
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: HISTORICAL OWNER PARTIAL OBSERVATION
```

Historical session feedback said wheels excellent, suspension almost excellent, stance slightly wide/low, steering rods short and front steering/upright pivot wrong.

This is **not current visual authority**. `owner_r4` and `Tire=0` were not persisted as an exact reproducible preset.

## V0 — exact current baseline revalidation

```text
date: 2026-08-10
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: OWNER OBSERVED / CURRENT BASELINE REJECTED AS FINAL GEOMETRY
```

Canonical Windows validation used Node 24.16.0 / npm 11.13.0, pinned install, typecheck, deterministic generation, 13/13 focused tests and production build.

Owner-visible baseline:

- chassis/body roughly acceptable;
- wishbones/suspension too far from frame;
- dampers/springs wrong and entering wheel region;
- cardans visibly miss correct differential mating;
- upright/hub/suspension package buried in wheels;
- wheel placement not globally judgeable while surrounding geometry is incoherent;
- final ride height likely slightly higher.

Dynamic state: `OWNER OBSERVED HIGH-SEVERITY DYNAMIC REGRESSION / DEFERRED BY OWNER`.

Do not tune handling/stability/steering feel until visual recovery closes.

Protected V0 meaning: exact reproducible comparison baseline, chassis/body as rough reference, wheel-center vs `Socket_WheelMount` semantic distinction, and deferred dynamics decision. Most visual rig placement is not accepted.

## S1-D — FL upper wishbone static split-authority checkpoint

```text
date: 2026-08-10
candidate: 393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
branch at validation: work/owner-rig-s1-attachment-authority
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: OWNER ACCEPTED — STATIC FRONT+TOP ONLY / PARTIAL INTERFACE CHECKPOINT
```

### Reviewed constraint

```text
inboard X:
  midpoint(physical upperFront, physical upperRear).x

inboard Y/Z:
  preserved S1-C semantic-main-chassis calibration components

outboard XYZ:
  existing physical upper ball

orientation:
  PART_PAIR_ROLL_PINNED_STRETCH
```

The final inboard point is a **constraint-composed visual attachment**. It does not claim literal contact with `group5` after X substitution.

Source/test evidence removed the S1-C longitudinal residual from about `-0.155671 m` to `0 m`, preserved S1-C Y/Z and protected outboard, and left GLB identity unchanged.

### OWNER OBSERVED verdict

Jozz inspected FRONT, TOP and wheel-side views:

- FRONT: FL upper placement is good enough at current precision;
- TOP: previous longitudinal yaw is removed; placement is good enough at current precision;
- wheel-side: wishbone/wheel-side geometry reaches very near the tire and intermediate upright/hub/suspension geometry remains buried in the wheel;
- visible mesh stretching/lengthening is deferred unless later correct rigging requires changing it.

### Protected meaning

Preserve unless new evidence explicitly reopens it:

- accepted static FL upper inboard X relation;
- accepted static FL upper inboard Y/Z relation at current precision;
- decision not to polish mesh proportion yet.

At this checkpoint live motion was still open. That limitation is superseded **only for the exact FL upper binding** by the later S1-LIVE checkpoint below.

Still do not promote S1-D/S1-LIVE to FR acceptance, final outboard/wheel-side packaging, upright/hub/wheel acceptance, final mesh-scale acceptance or physical suspension-topology acceptance.

### Integration state

The candidate remains frozen and **not integrated into `main`**. Acceptance attaches to the exact candidate and explicit constraints, not to automatic branch merge.

## S1-LIVE — FL upper live-articulation checkpoint

```text
date: 2026-08-11
candidate: 393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
branch at validation: work/owner-rig-s1-attachment-authority
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: OWNER ACCEPTED — FL UPPER LIVE ARTICULATION / NEUTRAL SUSPENSION RANGE
```

### Technical gate

The exact frozen source tree was validated through the normal M6 runtime path, not synthetic endpoint injection.

Focused controls:

- S1-D static control: 4/4 PASS;
- generic vehicle visual transform controls: 10/10 PASS, including roll-pinned endpoint/frame cases;
- existing real-M6 owner full-rig runtime test: 1/1 PASS.

A disposable observation harness then sampled 180 consecutive real neutral M6 frames from the standard spawn/settling sequence with steering released and zero drive.

Representative motion included natural extension, compression/bump, rebound and settling/rest over about `0.1078750491 m` of observed FL coilover length range.

Measured FL upper result:

- maximum chassis-side endpoint residual: about `9.11e-8 m`;
- maximum arm-side endpoint residual: about `7.00e-8 m`;
- no observed flip, 180-degree inversion, discontinuity or frame singularity;
- handedness remained positive;
- worst adjacent-frame full-frame change: about `1.70058°` during faster initial suspension motion.

Execution classification: **supplemental toolchain evidence** — Node 22.16.0 / TypeScript 5.8.3 with supplied `box3d.js@0.0.2`, rather than pinned Node 24.16.0 / npm 11.13.0. Do not silently upgrade this to canonical-toolchain proof.

### OWNER OBSERVED verdict

Jozz reviewed a focused FRONT + TOP owner-gate capture of the exact FL upper through the natural suspension sequence and answered that it is correct. He noted that the surrounding line clutter made the motion somewhat harder to read, but remained almost certain the FL upper behavior was correct.

Classification: **OWNER ACCEPTED** for the bounded question.

### Protected meaning

S1-LIVE extends the S1-D acceptance for this exact binding from static placement to real neutral suspension articulation:

- accepted mounting relationship remains intact through observed motion;
- accepted natural FL upper placement/orientation remains intact through observed motion;
- current roll-pinned mechanism is supported for this accepted FL upper result.

This does **not** accept:

- FR;
- FL lower arm;
- upright/hub/wheel packaging;
- dampers;
- mesh proportion/scale;
- steering geometry;
- handling/dynamics/feel;
- the frozen S1 branch as a whole.

### Integration state

Still **NOT INTEGRATED INTO `main`** at this checkpoint.

The next operation is clean curated integration of the minimal reviewed FL-upper semantics and required mechanism/tests onto current-main lineage. Frozen `393ef...` remains read-only technical reference until that integration is independently validated.

## Owner-checkpoint method

Use very small dependency-driven slices. For each accepted/rejected result record the exact constraint, not merely “asset good/bad”. Preserve accepted DOFs while reopening only unresolved ones.

Handling/feel remains a separate later campaign.
