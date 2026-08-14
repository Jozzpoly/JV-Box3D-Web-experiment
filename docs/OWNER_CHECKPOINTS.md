# JV Web — owner checkpoint ledger

Updated: 2026-08-13

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
outboard XYZ = existing physical upper ball at the accepted product checkpoint
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

The technical S2 role investigation incorrectly grouped the wheel-side mechanism as one steering `knuckle/upright` member.

Owner correction:

- yellow `Socket_ChassisMount_b` member = suspension-side / non-steering;
- red `Socket_WheelCenter` member = separate steerable structural member;
- steering rotation between them and wheel spin are separate DOFs;
- the previous one-knuckle interpretation is rejected.

## S2-A — authority inversion root cause

```text
date: 2026-08-11
web integrated product base: 67d66ed412342fee5445b2901d85a663a084bf4e
native reference examined: 959aefb78587ce60cf2b8eb03ff82797a4165142
classification: ROOT-CAUSE DISCOVERY / AUTHORITY RESET
```

The recovery goal was to copy the already-working core JV front-corner mechanism, but Web repeatedly reconstructed a new rig from secondary contracts, receipts, generic hardpoints and calibration helpers.

Direct evidence:

- working native M6 visual behavior puts `Socket_ChassisMount_b` on a non-steering arm/carrier frame and `Socket_WheelCenter` on the steering knuckle frame;
- the stale copied JSON contract labels both as `knuckle`;
- Web R2/R3 follows the collapsed interpretation;
- exact authored source contains `Axis_SuspensionTravel_Top` / `Axis_SuspensionTravel_Bottom`, with `Socket_WheelCenter` exactly on their line and midpoint;
- generic M6 caster/KPI/kingpin-offset geometry displaced the runtime kingpin and R3 then sheared authored geometry toward those generated hardpoints.

Historical lesson from this checkpoint: the Web repair target had inverted authority by letting secondary contracts/configuration define the mechanism. Later owner feedback further narrowed this rule: use owner evidence, authored source and reproducible behavior **per mechanism/claim**; native implementations are evidence/falsifiers after revalidation, not a whole-rig authority.

## S2-P — historical parity checkpoint; scope superseded by later owner evidence

```text
date: 2026-08-11
web product base examined: 67d66ed412342fee5445b2901d85a663a084bf4e
native reference examined at the time: 959aefb78587ce60cf2b8eb03ff82797a4165142
classification: HISTORICAL OWNER CHECKPOINT / ROLE + STEERING-CENTER PORTION PRESERVED / WHOLE-RIG-GOLDEN INTERPRETATION SUPERSEDED
```

At this historical checkpoint the owner reported that the role split and steering-center reconstruction looked correct enough to proceed. Later feedback explicitly rejected treating M5/M6, this native ref, the candidate topology, carrier or steering law as whole-rig golden architecture. Preserve only the narrower facts that later survived direct in-game validation.

Accepted mechanical contract:

```text
#6 Socket_ChassisMount_b
= suspension-side member
= follows suspension articulation
= must NOT inherit steering rotation

#8 Socket_WheelCenter
= separate steerable structural member
= steers relative to #6
= does NOT wheel-spin

wheel
= follows steerable member for steering
= retains independent spin DOF

steering axis position
= anchored at the authored source position/center
= must pass through the source-derived WheelCenter center/reference
= the old ~140 mm displaced kingpin is rejected
```

Critical owner nuance about the steering axis:

- the **position/center of steering is now considered correct and is the protected result**;
- the final axis direction does **not** have to remain perfectly vertical;
- a modest physically justified tilt/caster/KPI-like direction is allowed if useful for correct wheel behavior;
- such tilt must be introduced **about the accepted steering center/position**, not by laterally/longitudinally displacing the whole axis away from WheelCenter again;
- therefore `Axis_SuspensionTravel_Top/Bottom` are authoritative for source registration/center, while final runtime direction remains an engineering DOF subject to later owner-visible validation.

This supersedes the earlier over-strong reading that the raw vertical Top↔Bottom direction itself must be immutable in final runtime.

Durable remainder after later S2-N/S2-K evidence: #6 suspension-side/non-steering, #8 separate steerable relative role, independent wheel spin, and steering center at source-derived WheelCenter. Final mechanism/topology/direction remain engineering/research questions.


## S2-N / S2-K — source/DOF checkpoint confirmed in real game

```text
date: 2026-08-12
mechanics/source candidate: a4468042550265d10c2fa4b13b926d9227040d89
classification: OWNER ACCEPTED — NARROW SOURCE/DOF + IN-GAME KNUCKLE CHECKPOINT
```

Owner confirmed in normal Offroad inspection that:

- #6 stays with suspension and does not inherit steering;
- #8 is a separate element that steers relative to #6 around the expected WheelCenter-centered axis;
- wheel spin remains separate.

This checkpoint **does not** accept carrier/body topology, rack->angle law, tie-rod choice, mass split, final steering-axis direction, bump-steer target, self-align/back-drive or handling.

Owner also observed that FL lower placement remains wrong and wishbone<->knuckle visuals lack trustworthy mating frames through articulation. That is `DEFERRED RIG-WORKBENCH DEBT`; do not mask it with offsets.

## R1-DRIVE-BRIDGE-01 — temporary coherent driving intermediate

```text
date: 2026-08-13
classification: OWNER ACCEPTED — TEMPORARY R1 INTERMEDIATE ONLY
visual package: 59 bindings / 829936 B / SHA-256 1e2619eb841c9d46e33d5a92918fe00c72af6a03202ab29dfe4c8e8ec07a12dc
```

Owner drove the temporary symmetric kinematic front and confirmed that the car now travels straight and steers materially more coherently left/right. Residual asymmetry and imperfections remain.

Protected meaning: the previous mixed front mechanism was a real product defect and the temporary bridge is useful enough to keep R1 moving.

Explicitly **not accepted**: final steering physics, the provisional rack->angle map, lack of back-drive/self-align as desirable behavior, final FR axis/hardpoints, final topology, caster/KPI/trail, spatial tie-rod/rack geometry, or deferred rig mating.

## Owner-checkpoint method

Authority is mechanism-specific. Direct owner evidence and exact authored semantics outrank secondary documentation. Historical native implementations are evidence/falsifiers only after direct revalidation; there is no whole-rig golden.

For high-risk mechanical semantics, agent self-consistency is not owner truth. Tests must protect accepted invariants and independently meaningful behavior, not certify an experimental implementation against itself.

Handling/feel and physical steering remain separately gated.
