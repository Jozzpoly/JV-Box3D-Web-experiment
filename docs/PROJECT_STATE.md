# JV Web — accepted project state

Updated: 2026-08-11
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / S1 FL UPPER STATIC+LIVE OWNER ACCEPTED / CLEAN INTEGRATION ACTIVE`

This document describes the **accepted/integrated product state and durable current project boundary**. It is not an experiment log.

## 1. Authority model

```text
Private accepted/integrated product authority:
Jozzpoly/JV-Box3D-Web-experiment
main
(resolve live tip before every write)

Frozen reviewed S1 reference:
work/owner-rig-s1-attachment-authority
393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
NOT INTEGRATED INTO main

Active clean-integration transaction:
work/owner-rig-s1-clean-integration
(fresh descendant of current main; verify exact live tip)

Public artifact repo:
Jozzpoly/JV-Box3D-Web-Public
release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

Native JV:
Jozzpoly/Box3d_FunProject
read-only reference for this campaign
```

`main` remains the accepted/integrated product authority. Owner acceptance attached to a divergent work candidate does not authorize wholesale merge.

## 2. Product goal and current campaign

Goal: a browser friend-demo that increasingly feels like Jozz's own game.

Current campaign: recover owner-vehicle visual/mechanical readability one attributable interface at a time.

Deferred until visual recovery closes:

- driving feel;
- suspension stability tuning;
- steering feel/rate;
- tire/contact tuning;
- drivetrain redesign;
- unrelated camera/UI polish;
- scan/world work;
- public R1 promotion.

Durable campaign contract: `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`.

## 3. Accepted integrated baseline on `main`

The reproducible owner-rig baseline remains:

```text
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

No S1 product implementation has yet been promoted to `main`.

## 4. Owner-accepted FL upper evidence outside `main`

Exact reviewed source:

```text
candidate: 393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
```

### Static — OWNER ACCEPTED

At current visual precision:

- inboard X = midpoint of physical `upperFront` and `upperRear` X;
- inboard Y/Z = preserved S1-C semantic-main-chassis calibration components;
- final inboard point is a constraint-composed visual attachment with no literal chassis-mesh contact claim;
- outboard remains the existing physical upper ball;
- FRONT + TOP placement is accepted.

### Live articulation — OWNER ACCEPTED

The exact FL upper `PART_PAIR_ROLL_PINNED_STRETCH` binding was observed through a real neutral M6 suspension sequence containing extension, compression/bump, rebound and settling/rest.

Technical evidence on the exact frozen source showed:

- both declared live endpoints remain attached through the sampled motion;
- maximum start-endpoint residual about `9.11e-8 m`;
- maximum end-endpoint residual about `7.00e-8 m`;
- no observed flip, twist, discontinuity or frame singularity;
- worst adjacent-frame full-frame change about `1.70°` during the faster initial motion.

Execution was explicitly **supplemental** because the validator used Node 22 / TypeScript 5.8.3 rather than pinned Node 24.16.0 / npm 11.13.0. This limits the toolchain claim, not the recorded owner visual verdict.

Jozz then OWNER ACCEPTED the focused question that the FL upper preserves natural placement/orientation and the accepted mounting relationship during real suspension work.

## 5. Still unresolved / not accepted

- FR upper mirroring/placement;
- FL lower-arm acceptance as part of this S1 result;
- wheel-side upright/hub/suspension packaging remains buried in the wheel;
- damper/spring rig remains wrong and enters/intersects the wheel region;
- cardans still miss correct visible mating, particularly differential side;
- FL upper mesh proportion/stretch remains visibly imperfect and deferred unless later rigging requires change;
- final stance likely needs to be slightly higher;
- wheel placement cannot be globally accepted while surrounding corner geometry is incoherent;
- driving feel, suspension stability and steering/controllability remain strongly regressed and deliberately deferred.

## 6. Integration boundary

The owner-accepted S1 result must now be integrated cleanly onto current-main lineage.

Required method:

```text
exact frozen reviewed implementation/evidence
        ↓ read-only technical reference
minimal accepted FL-upper semantics + required mechanism/tests
        ↓ curated port/reproduction
fresh descendant of current main
        ↓ candidate validation + orchestrator review
main promotion only if proven
```

Do **not** merge frozen S1 and do **not** cherry-pick its history wholesale.

Clean integration is not a new attempt to solve S1 from memory. The frozen exact implementation is the reviewed reference; the task is to reproduce the minimum final semantics on current-main lineage and prove equivalence/scope.

## 7. Evidence model

```text
E0 identity/reproducibility
E1 local calibration consistency
E2 cross-asset mating truth
E3 runtime kinematic coherence
E4 owner visual acceptance
E5 owner handling/feel acceptance — later
```

S1 FL upper now has narrow E4 static + live acceptance outside `main`; integration is the current missing boundary.

## 8. Current operational state

- controlled orchestrator handoff is complete;
- S1-LIVE validation is complete and OWNER ACCEPTED;
- frozen `393ef460...` remains read-only reviewed reference;
- one clean curated integration task is active;
- `main` must not move during that product transaction except by orchestrator after review;
- implementation writes belong only on `work/owner-rig-s1-clean-integration`;
- FR, downstream wheel-side geometry, mesh scale and dynamics remain out of scope for this transaction.
