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

## R2 — first full owner rig package

```text
source: 5d508485ba5c24e6552e324cfbbcb5ec19399fec
classification: OWNER REJECTED VISUALLY / TECHNICAL EVIDENCE ONLY
```

Major calibration defects included suspension packaging, dampers and cardans.

## R4 — historical partial observation

```text
source lineage baseline: 9a49982cc428bf6fb18f4e1b98ea1b073eaa8a5f
product tree: e28515182d3a447374044d9ffc70943fb888328d
package: m6-owner-full-rig-r3
real bindings: 59
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: HISTORICAL OWNER PARTIAL OBSERVATION
```

Historical feedback said wheels excellent, suspension almost excellent, stance slightly wide/low, steering rods short and front steering/upright pivot wrong. This is not current visual authority.

## V0 — exact baseline revalidation

```text
date: 2026-08-10
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
classification: OWNER OBSERVED / CURRENT BASELINE REJECTED AS FINAL GEOMETRY
```

Owner-visible baseline: chassis roughly acceptable; suspension/wishbones displaced; dampers wrong; cardans miss mating; upright/hub package buried in wheels; wheel placement not globally judgeable; stance likely slightly low. Dynamics/steering feel strongly regressed and deliberately deferred.

## S1-D — FL upper static checkpoint

```text
date: 2026-08-10
candidate: 393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
classification: OWNER ACCEPTED — STATIC FRONT+TOP / PARTIAL INTERFACE CHECKPOINT
```

Protected constraint:

```text
inboard X = midpoint(physical upperFront, physical upperRear).x
inboard Y/Z = S1-C semantic-main-chassis calibration components
outboard XYZ = existing physical upper ball
orientation = PART_PAIR_ROLL_PINNED_STRETCH
contact claim = NONE_CONSTRAINT_COMPOSED_VISUAL_ATTACHMENT
```

Owner accepted FRONT+TOP placement at current precision. Wheel-side package and mesh proportion remained unresolved/deferred.

## S1-LIVE — FL upper real suspension articulation

```text
date: 2026-08-11
candidate: 393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
classification: OWNER ACCEPTED — FL UPPER LIVE ARTICULATION / NEUTRAL SUSPENSION RANGE
```

Real `M6TopologyWorld` evidence covered natural extension/compression/rebound/rest. Supplemental Node 22 execution showed endpoint residuals around `9.11e-8 m` / `7.00e-8 m`, no observed flip/twist/singularity, and worst adjacent full-frame change about `1.70058°`.

Jozz visually accepted the focused live FL upper gate. Surrounding line clutter was noted as a presentation weakness.

## S1-I — clean integration into `main`

```text
date: 2026-08-11
integrated commit: 67d66ed412342fee5445b2901d85a663a084bf4e
integrated tree: f2e1836800719cc9cc7007631568c41e45471450
integration parent: 220083612116ea055cc7ae39498bd59a61fbce70
classification: INTEGRATED PRODUCT STATE / NO NEW OWNER GATE
```

Clean integration used 2 commits / 8 files with no frozen-branch merge or S1-history cherry-pick. Curated blobs matched the reviewed frozen surface, FR/physics stayed unchanged, and package identity remained 59 bindings / 829944 bytes / SHA-256 `57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a`.

Durable meaning: accepted FL upper static+live semantics belong to `main`.

## S2-O — one-knuckle interpretation falsified by owner

```text
date: 2026-08-11
product base examined: 67d66ed412342fee5445b2901d85a663a084bf4e
classification: OWNER REJECTED / FUNDAMENTAL SEMANTIC TOPOLOGY CORRECTION
```

The technical S2 role investigation produced an internally consistent interpretation that grouped the wheel-side purple geometry as one `knuckle/upright-side` member. A dedicated owner-facing source/runtime map exposed that this interpretation repeats a known historical agent failure.

Jozz corrected it directly on the source-rig views:

- the knuckle mechanism has **two separate members that must be rigged separately**;
- **YELLOW owner annotation:** suspension-side member tied to the wishbones, static with respect to steering;
- **RED owner annotation:** separate steerable/rotating member connecting the first member toward the wheel;
- **BLUE owner annotation:** steering rotation axis/center between those members, shown in side/front-like and top projections;
- native/core JV currently implements this conceptual split and is required read-only reference for reconstruction.

Protected meaning:

1. do not collapse the wheel-side mechanism into one semantic/body-role called `knuckle` or `upright`;
2. distinguish suspension-side carrier from steerable carrier;
3. distinguish their steering DOF from wheel-spin DOF;
4. exact authored mesh membership, exact 3D steering axis and exact Web physics/visual repair remain UNKNOWN until reconstructed from owner evidence + authored source + native JV;
5. previous S2 technical measurements remain evidence only where they do not depend on the rejected one-knuckle assumption;
6. S1 FL upper acceptance remains protected unless new direct evidence falsifies it.

Known unresolved evidence carried forward: authored steering socket/current physical arm mismatch about `0.222 m`; stale R3 cardan endpoint path in interface audit; worst prior lower-ball shared-joint residual about `6.263 mm`; old owner-map lower-outboard `#12` was inferred rather than an authored named socket.

Next operation: `S2-R — reconstruct FL two-stage wheel-side steering mechanism`, read-only and owner-validation-first. No production repair or S3 is authorized before the reconstructed topology is visually validated by Jozz.

## Owner-checkpoint method

Use small dependency-driven slices. Record exact accepted/rejected constraints rather than whole-asset labels. Preserve accepted DOFs while reopening only unresolved ones.

For high-risk mechanical semantics, an internally consistent agent model is not sufficient evidence. Use owner-facing falsification before implementation. Handling/feel remains a separate later campaign.
